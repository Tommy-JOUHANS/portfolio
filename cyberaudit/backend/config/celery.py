<<<<<<< HEAD
# config/celery.py
import os
=======
"""
config/celery.py — Instance Celery du projet CyberAudit.

Démarrage du worker en dev :
    celery -A config worker -l info
"""
import os

>>>>>>> 08f73c6dc1b9a9b1d4b758745c98861cb41d347c
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("cyberaudit")
<<<<<<< HEAD
app.config_from_object("django.conf:settings", namespace="CELERY")
=======

# Charge toutes les variables CELERY_* depuis settings.py
app.config_from_object("django.conf:settings", namespace="CELERY")

# Découvre automatiquement les tasks.py de chaque app
>>>>>>> 08f73c6dc1b9a9b1d4b758745c98861cb41d347c
app.autodiscover_tasks()
