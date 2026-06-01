# apps/notifications/emails.py
import resend
from django.conf import settings

resend.api_key = settings.RESEND_API_KEY


def send_email(to: str, subject: str, html: str) -> dict:
    return resend.Emails.send(
        {
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html,
        }
    )


def send_welcome_email(user) -> dict:
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h1 style="color:#7c3aed">Bienvenue sur CyberAudit, {user.first_name} !</h1>
      <p>Votre compte a été créé avec succès.</p>
      <p>Accédez dès maintenant à votre tableau de bord.</p>
      <a href="{settings.FRONTEND_URL}/dashboard"
         style="background:#7c3aed;color:#fff;padding:12px 24px;
                border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">
        Accéder au tableau de bord
      </a>
      <p style="color:#6b7280;margin-top:32px;font-size:14px">L'équipe CyberAudit</p>
    </div>
    """
    return send_email(user.email, "Bienvenue sur CyberAudit 🛡️", html)


def send_audit_status_email(user, audit) -> dict:
    labels = {
        "pending": "En attente",
        "in_progress": "En cours",
        "completed": "Terminé",
        "cancelled": "Annulé",
    }
    label = labels.get(audit.status, audit.status)
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h1 style="color:#7c3aed">Mise à jour de votre audit</h1>
      <p>Bonjour {user.first_name},</p>
      <p>Le statut de votre audit <strong>#{audit.id}</strong> a été mis à jour :</p>
      <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0">
        <strong>Nouveau statut :</strong> {label}
      </div>
      <a href="{settings.FRONTEND_URL}/dashboard"
         style="background:#7c3aed;color:#fff;padding:12px 24px;
                border-radius:6px;text-decoration:none;display:inline-block">
        Voir mon audit
      </a>
      <p style="color:#6b7280;margin-top:32px;font-size:14px">L'équipe CyberAudit</p>
    </div>
    """
    return send_email(user.email, f"Votre audit #{audit.id} : {label}", html)
