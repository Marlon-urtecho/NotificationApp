from __future__ import absolute_import, unicode_literals

# Importa el archivo celery_app.py correctamente
from .celery_app import app as celery_app

__all__ = ('celery_app',)
