from __future__ import absolute_import, unicode_literals
from celery import Celery
import os

# Establece el módulo de configuración predeterminado de Django para el programa 'celery'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Whatsapp_reminder.settings')

app = Celery('Whatsapp_reminder')

# Usar una cadena aquí significa que el trabajador no tiene que serializar
# el objeto de configuración para el niño, lo que puede causar problemas con
# el uso de Windows.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Cargar tareas de todos los módulos de aplicaciones registradas de Django.
app.autodiscover_tasks()