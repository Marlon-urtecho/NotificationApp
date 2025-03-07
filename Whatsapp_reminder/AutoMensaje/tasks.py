from celery import shared_task, current_task
from datetime import datetime, timedelta
from django.utils import timezone
from .utils import enviar_whatsapp_twilio
from .models import Recordatorio
from AutoMensaje.models import Cliente
import logging
from twilio.base.exceptions import TwilioRestException
from django.db import transaction
from django.db.models import F

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def enviar_recordatorio(self):
    try:
        # Iniciar una transacción explícita
        with transaction.atomic():
            # Aquí se utiliza select_for_update dentro de la transacción
            recordatorios = Recordatorio.objects.filter(enviado=False, fecha_envio__lte=timezone.now()).select_for_update()

            recordatorios_a_actualizar = []

            logger.info(f"Total de recordatorios pendientes para enviar: {len(recordatorios)}")

            if not recordatorios:
                logger.info("No hay recordatorios pendientes para enviar.")
                return

            for recordatorio in recordatorios:
                reintentos = 0
                while reintentos < self.max_retries:
                    try:
                        # Corregir aquí: Si 'recordatorio.cliente' es un número de teléfono, debemos buscar el Cliente
                        if isinstance(recordatorio.cliente, str):  # Verificar si es un string (número de teléfono)
                            try:
                                cliente = Cliente.objects.get(telefono=recordatorio.cliente)  # Buscar cliente por número de teléfono
                                logger.info(f"Procesando recordatorio ID {recordatorio.id} para el cliente {cliente.nombre}.")
                            except Cliente.DoesNotExist:
                                logger.error(f"No se encontró el cliente con teléfono {recordatorio.cliente}.")
                                break  # Si no se encuentra el cliente, saltar al siguiente recordatorio
                        else:
                            cliente = recordatorio.cliente  # Ya es un objeto Cliente

                        telefono_cliente = cliente.telefono
                        if not telefono_cliente:
                            logger.error(f"El cliente {cliente.nombre} no tiene un número de teléfono registrado.")
                            break

                        mensaje = recordatorio.mensaje
                        if not mensaje:
                            logger.error(f"El mensaje para el recordatorio ID {recordatorio.id} está vacío.")
                            break

                        # Enviar el mensaje con Twilio
                        logger.info(f"Enviando mensaje de WhatsApp a {telefono_cliente}: {mensaje}")
                        enviar_whatsapp_twilio(telefono_cliente, mensaje)

                        recordatorio.enviado = True
                        recordatorios_a_actualizar.append(recordatorio)

                        logger.info(f"Recordatorio ID {recordatorio.id} enviado correctamente a {cliente.nombre}.")
                        break  # Salir del bucle si el envío fue exitoso

                    except TwilioRestException as e:
                        if e.code == 429:  # Error de límite de mensajes alcanzado
                            logger.warning(f"Error al enviar el mensaje de WhatsApp: HTTP 429 - Límite de mensajes alcanzado.")
                            reintentos += 1
                            if reintentos < self.max_retries:
                                logger.info(f"Reintentando en 15 minutos... (Intento {reintentos}/{self.max_retries})")
                                self.retry(countdown=15 * 60)  # Esperar 15 minutos y reintentar
                            else:
                                logger.error(f"Se alcanzó el número máximo de reintentos para el recordatorio ID {recordatorio.id}. No se enviará.")
                                break  # Si se alcanzaron los intentos, no intentamos más
                        else:
                            logger.error(f"Error al procesar el recordatorio ID {recordatorio.id}: {e}")
                            break

                    except Exception as e:
                        logger.error(f"Error al procesar el recordatorio ID {recordatorio.id}: {e}")
                        break

            if recordatorios_a_actualizar:
                try:
                    Recordatorio.objects.bulk_update(recordatorios_a_actualizar, ['enviado'])
                    logger.info(f"Se marcaron como enviados {len(recordatorios_a_actualizar)} recordatorios.")
                except Exception as e:
                    logger.error(f"Error al actualizar los recordatorios: {e}")
            else:
                logger.info("No hay recordatorios para actualizar.")
    except Exception as e:
        logger.error(f"Error al enviar los recordatorios: {e}")
        
@shared_task
def programar_recordatorios():
    hoy = timezone.now().date()
    clientes = Cliente.objects.all()

    logger.info(f"Iniciando la programación de recordatorios para el día {hoy}.")

    # Obtener todos los recordatorios existentes para verificar duplicados
    recordatorios_existentes = Recordatorio.objects.filter(cliente__in=clientes, enviado=False)
    recordatorios_existentes_dict = {
        (recordatorio.cliente.id, recordatorio.fecha_envio.year, recordatorio.fecha_envio.month, recordatorio.fecha_envio.day): recordatorio
        for recordatorio in recordatorios_existentes
    }

    recordatorios_a_crear = []

    for cliente in clientes:
        if not cliente.fecha_renovacion:
            logger.info(f"Cliente {cliente.nombre} no tiene fecha de renovación. Saltando...")
            continue

        fecha_renovacion = cliente.fecha_renovacion

        # Verificar si la fecha de renovación ya pasó este año
        if fecha_renovacion.month < hoy.month or (fecha_renovacion.month == hoy.month and fecha_renovacion.day < hoy.day):
            # Si ya pasó la fecha de renovación, moverla al próximo año
            fecha_renovacion = fecha_renovacion.replace(year=hoy.year + 1)
            # Solo generar recordatorios para el siguiente año
            años_a_generar = [hoy.year + 1]
        else:
            # Si la fecha de renovación no ha pasado, generar recordatorios para este año
            años_a_generar = [hoy.year]

        for año in años_a_generar:
            fecha_renovacion_año_actual = fecha_renovacion.replace(year=año)

            if fecha_renovacion_año_actual > hoy:
                semana_antes = fecha_renovacion_año_actual - timedelta(weeks=1)
                dia_antes = fecha_renovacion_año_actual - timedelta(days=1)

                semana_antes_aware = timezone.make_aware(datetime.combine(semana_antes, datetime.min.time()))
                dia_antes_aware = timezone.make_aware(datetime.combine(dia_antes, datetime.min.time()))

                # Verificar si ya existe el recordatorio para 1 semana antes
                if (cliente.id, semana_antes_aware.year, semana_antes_aware.month, semana_antes_aware.day) not in recordatorios_existentes_dict:
                    mensaje_1_semana = (
                        f"Buen día 👋: Soy Orlando Vega Fonseca, Prisma S. A. Agente de Seguros.\n\n"
                        f"Permítanos recordarle que el Seguro Obligatorio de su Motocicleta vence el {cliente.fecha_renovacion} 📝\n"
                        f"Placa: {cliente.placa}.\n"
                        f"A nombre de: {cliente.nombre}.\n\n"
                        "Estamos a sus órdenes para realizar la renovación en nuestras oficinas. 🤝\n"
                        "📍 Dirección: De la Policía Jinotepe, ½ c. abajo (Fotocopias Vega)\n"
                        "📞 Teléfonos: 8510-2186 CL. / 7708-5139 TIG.\n\n"
                        "Si necesita más información, escriba *menu* para ver nuestras opciones de atención. 😊"
                    )
                    recordatorios_a_crear.append(
                        Recordatorio(
                            cliente=cliente,
                            mensaje=mensaje_1_semana,
                            fecha_envio=semana_antes_aware,
                            enviado=False
                        )   
                    )
                    logger.info(f"Recordatorio para 1 semana antes generado para {cliente.nombre} con fecha {semana_antes_aware}.")

                # Verificar si ya existe el recordatorio para 1 día antes
                if (cliente.id, dia_antes_aware.year, dia_antes_aware.month, dia_antes_aware.day) not in recordatorios_existentes_dict:
                    mensaje_1_dia = (
                        f"Buen día 👋: Soy Orlando Vega Fonseca, Prisma S. A. Agente de Seguros.\n\n"
                        f"Le recordamos que el Seguro Obligatorio de su Motocicleta vence mañana ({fecha_renovacion_año_actual}) 📝\n"
                        f"Placa: {cliente.placa}.\n"
                        f"A nombre de: {cliente.nombre}.\n\n"
                        "Estamos listos para atenderle y renovar su seguro en nuestras oficinas. 🤝\n"
                        "📍 Dirección: De la Policía Jinotepe, ½ c. abajo (Fotocopias Vega)\n"
                        "📞 Teléfonos: 8510-2186 CL. / 7708-5139 TIG.\n\n"
                        "Si necesita más información, escriba *menu* para ver nuestras opciones de atención. 😊"
                    )
                    recordatorios_a_crear.append(
                        Recordatorio(
                            cliente=cliente,
                            mensaje=mensaje_1_dia,
                            fecha_envio=dia_antes_aware,
                            enviado=False
                        )       
                    )
                    logger.info(f"Recordatorio para 1 día antes generado para {cliente.nombre} con fecha {dia_antes_aware}.")

    if recordatorios_a_crear:
        Recordatorio.objects.bulk_create(recordatorios_a_crear)
        logger.info(f"Se crearon {len(recordatorios_a_crear)} nuevos recordatorios.")
    else:
        logger.info("No se crearon nuevos recordatorios.")


@shared_task
def enviar_mensajes_bienvenida(cliente_id):
    try:
        # Obtén el cliente de la base de datos
        cliente = Cliente.objects.get(id=cliente_id)
        
        # Componer el mensaje
        mensaje = f"¡Hola {cliente.nombre}!\n\n"
        if cliente.placa:
            mensaje += f"Número de placa: {cliente.placa}\n"
        if cliente.poliza:
            mensaje += f"Número de póliza: {cliente.poliza}\n"
        if cliente.fecha_renovacion:
            mensaje += f"Fecha de renovación: {cliente.fecha_renovacion.strftime('%d/%m/%Y')}\n"
        mensaje += "\n¡Gracias por confiar en nosotros!"
        
        # Llamar a la función de Twilio para enviar el mensaje
        resultado = enviar_whatsapp_twilio(cliente.telefono, mensaje)
        
        if resultado:
            return f"Mensaje de bienvenida enviado a {cliente.nombre}"
        else:
            return f"Error al enviar mensaje a {cliente.nombre}"
    except Cliente.DoesNotExist:
        return f"Cliente con ID {cliente_id} no encontrado"
    except TwilioRestException as e:
        logger.error(f"Twilio error al enviar mensaje: {str(e)}")
        return f"Error con Twilio: {str(e)}"
    except Exception as e:
        logger.error(f"Error inesperado al enviar mensaje de bienvenida: {str(e)}")
        return f"Error inesperado: {str(e)}"
