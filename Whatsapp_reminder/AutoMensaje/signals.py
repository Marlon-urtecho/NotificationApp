from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Cliente
from .tasks import enviar_mensajes_bienvenida

#@receiver(post_save, sender=Cliente)
#def enviar_bienvenida_cliente(sender, instance, created, **kwargs):
    #if created:  # Solo se ejecuta si el cliente fue creado (no actualizado)
        # Llamamos a la tarea de Celery para enviar el mensaje de bienvenida, pasando el ID del cliente
       # enviar_mensajes_bienvenida.delay(instance.id)