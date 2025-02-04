# apps.py
from django.apps import AppConfig

class AutomensajeConfig(AppConfig):
    name = 'AutoMensaje'

    def ready(self):
        import AutoMensaje.signals  # Asegúrate de que las señales se carguen al iniciar la aplicación
