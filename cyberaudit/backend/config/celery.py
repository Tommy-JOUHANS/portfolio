"""
config/celery.py — Instance Celery du projet CyberAudit.

Démarrage du worker en dev :
    celery -A config worker -l info
"""
import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("cyberaudit")

# Charge toutes les variables CELERY_* depuis settings.py
app.config_from_object("django.conf:settings", namespace="CELERY")

# Découvre automatiquement les tasks.py de chaque app
app.autodiscover_tasks()
