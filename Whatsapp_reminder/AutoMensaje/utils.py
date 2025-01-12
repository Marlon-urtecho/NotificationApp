# clientes/tasks.py
from celery import shared_task
from datetime import timedelta, datetime
from django.utils import timezone
from .models import Cliente, Recordatorio
from twilio.rest import Client
from .utils import enviar_whatsapp  # Función para enviar WhatsApp

@shared_task
def enviar_recordatorio():
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
            def enviar_whatsapp_twilio(to, message):
                account_sid = 'your_account_sid'
                auth_token = 'your_auth_token'
                client = Client(account_sid, auth_token)

                from_whatsapp_number = 'whatsapp:+14155238886'
                to_whatsapp_number = f'whatsapp:{to}'

                client.messages.create(body=message,
                                       from_=from_whatsapp_number,
                                       to=to_whatsapp_number)

            @shared_task
            def enviar_recordatorio_twilio():
                recordatorios = Recordatorio.objects.filter(enviado=False)

                for recordatorio in recordatorios:
                    try:
                        # Enviar solo si la fecha de envío ya ha pasado
                        if recordatorio.fecha_envio <= timezone.now():
                            enviar_whatsapp_twilio(recordatorio.cliente.telefono, recordatorio.mensaje)
                            recordatorio.enviado = True
                            recordatorio.save()
                    except Exception as e:
                        print(f"Error al procesar recordatorio ID {recordatorio.id}: {e}")