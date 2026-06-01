"""
notifications/tasks.py — Tâches Celery pour l'envoi d'emails.

  send_notification_email(notification_id)
      → envoie le mail via SMTP (en dev EMAIL_BACKEND=console)
      → met à jour le statut (sent / failed) et sent_at
      → retry automatique 3 fois avec backoff exponentiel
"""

from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    max_retries=3,
    default_retry_delay=10,
    retry_backoff=True,
    retry_backoff_max=600,
)
def send_notification_email(self, notification_id):
    """Envoie l'email d'une Notification et met à jour son statut."""
    from .models import Notification

    try:
        notif = Notification.objects.select_related("user").get(pk=notification_id)
    except Notification.DoesNotExist:
        return f"Notification {notification_id} introuvable"

    try:
        send_mail(
            subject=notif.subject,
            message=notif.message,
            from_email=None,
            recipient_list=[notif.user.email],
            fail_silently=False,
        )
    except Exception as exc:
        notif.status = Notification.Status.FAILED
        notif.error_message = str(exc)
        notif.save(update_fields=["status", "error_message"])
        raise

    notif.status = Notification.Status.SENT
    notif.sent_at = timezone.now()
    notif.save(update_fields=["status", "sent_at"])
    return f"sent to {notif.user.email}"
