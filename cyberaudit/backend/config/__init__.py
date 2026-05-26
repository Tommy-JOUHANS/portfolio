"""
Permet à Django de charger Celery au démarrage.
"""
from .celery import app as celery_app

__all__ = ("celery_app",)
