from __future__ import absolute_import, unicode_literals

# Esto asegura que el código de Celery se ejecute cuando Django inicie
from .celery_app import app as celery_app

__all__ = ('celery_app',)