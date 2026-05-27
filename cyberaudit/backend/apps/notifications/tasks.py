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
