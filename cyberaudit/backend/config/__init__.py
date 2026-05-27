<<<<<<< HEAD
# config/__init__.py
# Expose l'app Celery au démarrage de Django
=======
"""
Permet à Django de charger Celery au démarrage.
"""
>>>>>>> 08f73c6dc1b9a9b1d4b758745c98861cb41d347c
from .celery import app as celery_app

__all__ = ("celery_app",)
