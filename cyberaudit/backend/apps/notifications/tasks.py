<<<<<<< HEAD
# apps/notifications/tasks.py
from celery import shared_task
from .emails import send_welcome_email, send_audit_status_email


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def task_send_welcome_email(self, user_id):
    from apps.accounts.models import User
    try:
        user = User.objects.get(pk=user_id)
        send_welcome_email(user)
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def task_send_audit_status_email(self, user_id, audit_id):
    from apps.accounts.models import User
    from apps.audits.models import Audit
    try:
        user  = User.objects.get(pk=user_id)
        audit = Audit.objects.get(pk=audit_id)
        send_audit_status_email(user, audit)
    except Exception as exc:
        raise self.retry(exc=exc)
=======
"""
notifications/tasks.py — Tâches Celery pour l'envoi d'emails.

  send_notification_email(notification_id)
      → envoie le mail via SMTP (en dev EMAIL_BACKEND=console)
      → met à jour le statut (sent / failed) et sent_at
      → retry automatique 3 fois avec backoff exponentiel (10s / 30s / 90s)
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
    # Import local : évite un éventuel circular import au boot Django.
    from .models import Notification

    try:
        notif = Notification.objects.select_related("user").get(pk=notification_id)
    except Notification.DoesNotExist:
        return f"Notification {notification_id} introuvable"

    try:
        send_mail(
            subject=notif.subject,
            message=notif.message,
            from_email=None,  # utilise DEFAULT_FROM_EMAIL
            recipient_list=[notif.user.email],
            fail_silently=False,
        )
    except Exception as exc:
        notif.status = Notification.Status.FAILED
        notif.error_message = str(exc)
        notif.save(update_fields=["status", "error_message"])
        raise  # déclenche autoretry_for

    notif.status = Notification.Status.SENT
    notif.sent_at = timezone.now()
    notif.save(update_fields=["status", "sent_at"])
    return f"sent to {notif.user.email}"
>>>>>>> 08f73c6dc1b9a9b1d4b758745c98861cb41d347c
