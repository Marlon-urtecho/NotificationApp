from celery import shared_task
from datetime import timedelta, datetime
from django.utils import timezone
from .models import Cliente, Recordatorio

@shared_task
def enviar_recordatorio():
    from .utils import enviar_whatsapp  # Mueve la importación dentro de la función
    recordatorios = Recordatorio.objects.filter(enviado=False)

    for recordatorio in recordatorios:
        try:
            # Enviar solo si la fecha de envío ya ha pasado
            if recordatorio.fecha_envio <= timezone.now():
                enviar_whatsapp(recordatorio.cliente.telefono, recordatorio.mensaje)
                recordatorio.enviado = True
                recordatorio.save()
        except Exception as e:
            print(f"Error al procesar recordatorio ID {recordatorio.id}: {e}")

@shared_task
def programar_recordatorios():
    hoy = timezone.now().date()
    clientes = Cliente.objects.all()

    for cliente in clientes:
        semana_antes = cliente.fecha_renovacion - timedelta(weeks=1)
        dia_antes = cliente.fecha_renovacion - timedelta(days=1)

        # Verificar si ya existen recordatorios para evitar duplicados
        if not Recordatorio.objects.filter(cliente=cliente, fecha_envio=semana_antes).exists():
            Recordatorio.objects.create(
                cliente=cliente,
                mensaje=f"Recordatorio: Su seguro vence en 1 semana ({cliente.fecha_renovacion}).",
                fecha_envio=timezone.make_aware(datetime.combine(semana_antes, datetime.min.time())),
                enviado=False
            )

        if not Recordatorio.objects.filter(cliente=cliente, fecha_envio=dia_antes).exists():
            Recordatorio.objects.create(
                cliente=cliente,
                mensaje=f"Último recordatorio: Su seguro vence mañana ({cliente.fecha_renovacion}).",
                fecha_envio=timezone.make_aware(datetime.combine(dia_antes, datetime.min.time())),
                enviado=False
            )   