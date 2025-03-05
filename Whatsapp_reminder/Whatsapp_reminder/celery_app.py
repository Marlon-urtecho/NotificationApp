from __future__ import absolute_import, unicode_literals
from celery import Celery
import os
from celery.schedules import crontab


# Establece el módulo de configuración predeterminado de Django para el programa 'celery'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Whatsapp_reminder.settings')

app = Celery('Whatsapp_reminder')

# Usar una cadena aquí significa que el trabajador no tiene que serializar
# el objeto de configuración para el niño, lo que puede causar problemas con
# el uso de Windows.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Cambiar el pool a gevent
app.conf.worker_pool = 'gevent'

app.conf.beat_schedule = {
    'programar-recordatorios': {
        'task': 'AutoMensaje.tasks.programar_recordatorios',
        'schedule': crontab(minute='*/1'),  # Ejecutar cada 1 minuto
    },
    'enviar-recordatorios': {
        'task': 'AutoMensaje.tasks.enviar_recordatorio',
        'schedule': crontab(minute='*/1'),  # Ejecutar cada 1 minuto
    },
    'enviar-mensajes-bienvenida': {
        'task': 'AutoMensaje.tasks.enviar_mensajes_bienvenida',
        'schedule': crontab(minute='*/300'),  # Ejecutar cada 1 minuto
        'args': (88,)
    },
}
# Cargar tareas de todos los módulos de aplicaciones registradas de Django.
app.autodiscover_tasks()