# clientes/tasks.py
from celery import shared_task
from datetime import timedelta, datetime
from django.utils import timezone
from .models import Cliente, Recordatorio
from twilio.rest import Client

def validar_formato_telefono(telefono):
    # Eliminar cualquier caracter no numérico (por ejemplo, espacios o guiones)
    telefono = ''.join(c for c in telefono if c.isdigit())

    # Validar si el número ya tiene el prefijo +505
    if not telefono.startswith("505"):
        # Si no tiene el prefijo +505, lo agregamos
        telefono = "505" + telefono

    # Asegurarse de que el número tenga el formato correcto (+505 seguido de 8 dígitos)
    if len(telefono) == 11 and telefono.isdigit():  # 11 dígitos (505 + 8 dígitos)
        return f"+{telefono}"
    else:
        # Si el número no es válido, retornamos None
        return None
    
    
def enviar_whatsapp_twilio(to, message):
    # Validamos y formateamos el número de teléfono
    telefono_cliente = validar_formato_telefono(to)

    # Verificamos si el número del cliente es válido
    if telefono_cliente:
        account_sid = 'sid'  # Tu SID de Twilio
        auth_token = 'token'  # Tu Token de autenticación de Twilio
        client = Client(account_sid, auth_token)

        # Número de WhatsApp de Twilio (remitente)
        from_whatsapp_number = 'whatsapp:+14155238886'  # Número habilitado de Twilio para WhatsApp

        # Verificamos que el número de "From" y "To" no sean iguales
        if from_whatsapp_number != f'whatsapp:{telefono_cliente}':
            try:
                # Enviar mensaje de WhatsApp
                message = client.messages.create(
                    body=message,
                    from_=from_whatsapp_number,  # Número de WhatsApp de Twilio
                    to=f'whatsapp:{telefono_cliente}'  # Número del cliente
                )
                print(f"Mensaje enviado a {telefono_cliente}")
                return True  # Indica que el mensaje se envió correctamente
            except Exception as e:
                print(f"Error al enviar el mensaje de WhatsApp: {e}")
                return False  # Indica que hubo un error
        else:
            print(f"Error: El número 'From' ({from_whatsapp_number}) y 'To' ({telefono_cliente}) no pueden ser iguales.")
            return False  # Indica que hubo un error
    else:
        print(f"Error: El número {to} no es válido.")
        return False  # Indica que hubo un error