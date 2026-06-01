"""
notifications/services.py — Helpers pour créer + envoyer une notification.

Évite la duplication "create() puis .delay()" dans chaque endpoint.
"""

from .models import Notification
from .tasks import send_notification_email


def create_and_send(*, user, type_, subject, message, request=None):
    """Crée une Notification (status=queued) puis lance l'envoi async."""
    notification = Notification.objects.create(
        user=user,
        request=request,
        type=type_,
        subject=subject,
        message=message,
    )
    send_notification_email.delay(str(notification.id))
    return notification
