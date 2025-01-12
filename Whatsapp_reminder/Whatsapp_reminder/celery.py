# Whatsapp_reminder/celery.py
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

# Establecer el módulo de configuración predeterminado para el proyecto Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Whatsapp_reminder.settings')

app = Celery('Whatsapp_reminder')

# Usar la configuración de Celery desde los settings de Django
app.config_from_object('django.conf:settings', namespace='CELERY')

# Cargar tareas de todos los módulos de la aplicación
app.autodiscover_tasks()
