from celery import shared_task
from datetime import datetime, time, timedelta
from django.utils import timezone
from .utils import enviar_whatsapp_twilio
from django.db import transaction
from .models import Recordatorio
from AutoMensaje.models import Cliente
import logging
logger = logging.getLogger(__name__)
from twilio.base.exceptions import TwilioRestException

@shared_task
def enviar_recordatorio():
    """
    Esta tarea busca los recordatorios pendientes cuya fecha de envío ya ha llegado 
    y les envía un mensaje de WhatsApp utilizando Twilio.
    """
    # Obtener todos los recordatorios no enviados cuya fecha de envío ya haya llegado
    recordatorios = Recordatorio.objects.filter(enviado=False, fecha_envio__lte=timezone.now())
    
    # Preparamos una lista para almacenar los recordatorios a actualizar
    recordatorios_a_actualizar = []
    
    logger.info(f"Total de recordatorios pendientes para enviar: {len(recordatorios)}")

    # Si no hay recordatorios pendientes, no es necesario continuar
    if not recordatorios:
        logger.info("No hay recordatorios pendientes para enviar.")
        return
    
    for recordatorio in recordatorios:
        # Reintentos en caso de error 429
        reintentos = 0
        max_reintentos = 3
        while reintentos < max_reintentos:
            try:
                # Log de inicio de procesamiento
                logger.info(f"Procesando recordatorio ID {recordatorio.id} para el cliente {recordatorio.cliente.nombre}.")

                # Verificamos el número de teléfono del cliente
                telefono_cliente = recordatorio.cliente.telefono
                if not telefono_cliente:
                    logger.error(f"El cliente {recordatorio.cliente.nombre} no tiene un número de teléfono registrado.")
                    break

                # Verificamos si el mensaje está correctamente formateado
                mensaje = recordatorio.mensaje
                if not mensaje:
                    logger.error(f"El mensaje para el recordatorio ID {recordatorio.id} está vacío.")
                    break

                # Enviar el mensaje utilizando la función de Twilio
                logger.info(f"Enviando mensaje de WhatsApp a {telefono_cliente}: {mensaje}")
                enviar_whatsapp_twilio(telefono_cliente, mensaje)

                # Marcar el recordatorio como enviado
                recordatorio.enviado = True
                recordatorios_a_actualizar.append(recordatorio)
                
                logger.info(f"Recordatorio ID {recordatorio.id} enviado correctamente a {recordatorio.cliente.nombre}.")
                break  # Si el envío fue exitoso, salimos del bucle de reintentos

            except TwilioRestException as e:
                if e.code == 429:  # Error de límite de mensajes alcanzado
                    logger.warning(f"Error al enviar el mensaje de WhatsApp: HTTP 429 - Límite de mensajes alcanzado.")
                    reintentos += 1
                    if reintentos < max_reintentos:
                        # Si el error es 429, esperamos 15 minutos antes de reintentar
                        logger.info(f"Esperando 15 minutos antes de reintentar el envío de mensajes (Intento {reintentos}/{max_reintentos}).")
                        time.sleep(15 * 60)  # Esperar 15 minutos
                    else:
                        logger.error(f"Se alcanzó el número máximo de reintentos para el recordatorio ID {recordatorio.id}. No se enviará.")
                        break  # Si se alcanzaron los intentos, no intentamos más
                else:
                    # Si el error no es 429, registramos el error y salimos
                    logger.error(f"Error al procesar el recordatorio ID {recordatorio.id}: {e}")
                    break

            except Exception as e:
                # En caso de otro tipo de excepción, lo registramos
                logger.error(f"Error al procesar el recordatorio ID {recordatorio.id}: {e}")
                break

    # Actualizamos todos los recordatorios a la vez en una sola consulta
    if recordatorios_a_actualizar:
        Recordatorio.objects.bulk_update(recordatorios_a_actualizar, ['enviado'])
        logger.info(f"Se marcaron como enviados {len(recordatorios_a_actualizar)} recordatorios.")
    else:
        logger.info("No hay recordatorios para actualizar.")


@shared_task
def programar_recordatorios():
    hoy = timezone.now().date()
    clientes = Cliente.objects.all()

    logger.info(f"Iniciando la programación de recordatorios para el día {hoy}.")

    recordatorios_a_crear = []

    for cliente in clientes:
        if not cliente.fecha_renovacion:
            logger.info(f"Cliente {cliente.nombre} no tiene fecha de renovación. Saltando...")
            continue

        fecha_renovacion = cliente.fecha_renovacion
        
        # Iterar por los próximos 5 años (puedes ajustar este rango según sea necesario)
        for año in range(0, 5):
            fecha_renovacion_año_actual = fecha_renovacion.replace(year=fecha_renovacion.year + año)

            if fecha_renovacion_año_actual > hoy:
                semana_antes = fecha_renovacion_año_actual - timedelta(weeks=1)
                dia_antes = fecha_renovacion_año_actual - timedelta(days=1)

                semana_antes_aware = timezone.make_aware(datetime.combine(semana_antes, datetime.min.time()))
                dia_antes_aware = timezone.make_aware(datetime.combine(dia_antes, datetime.min.time()))

                # Verificamos si ya existe un recordatorio para esa fecha de "1 semana antes"
                if not Recordatorio.objects.filter(cliente=cliente, fecha_envio=semana_antes_aware).exists():
                    mensaje_1_semana = (
                        f"Buen día 👋: Soy Orlando Vega Fonseca, Prisma S. A. Agente de Seguros.\n\n"
                        f"Permítanos recordarle que el Seguro Obligatorio de su Motocicleta Vence el {cliente.fecha_renovacion} 📝\n"
                        f"Placa: {cliente.placa}.\n"
                        f"A Nombre de: {cliente.nombre}.\n\n"
                        "A sus órdenes para renovación en nuestras oficinas. 🤝\n"
                        "📍 De la policía Jinotepe, ½ c. abajo (Fotocopias Vega)\n"
                        "📞 Números telefónicos: 8510-2186 CL. / 7708-5139 TIG.\n\n"
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

                # Verificamos si ya existe un recordatorio para esa fecha de "1 día antes"
                if not Recordatorio.objects.filter(cliente=cliente, fecha_envio=dia_antes_aware).exists():
                    mensaje_1_dia = (
                        f"Buen día 👋: Soy Orlando Vega Fonseca, Prisma S. A. Agente de Seguros.\n\n"
                        f"Permítanos recordarle que el Seguro Obligatorio de su Motocicleta Vence mañana ({fecha_renovacion_año_actual}) 📝\n"
                        f"Placa: {cliente.placa}.\n"
                        f"A Nombre de: {cliente.nombre}.\n\n"
                        "A sus órdenes para renovación en nuestras oficinas. 🤝\n"
                        "📍 De la policía Jinotepe, ½ c. abajo (Fotocopias Vega)\n"
                        "📞 Números telefónicos: 8510-2186 CL. / 7708-5139 TIG.\n\n"
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

    # Crear los recordatorios solo si hay nuevos
    if recordatorios_a_crear:
        Recordatorio.objects.bulk_create(recordatorios_a_crear)
        logger.info(f"Se crearon {len(recordatorios_a_crear)} nuevos recordatorios.")
    else:
        logger.info("No se crearon nuevos recordatorios.")



import logging

# Configuración del logger
logger = logging.getLogger(__name__)

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
    except Exception as e:
        return f"Error al enviar mensaje: {str(e)}"