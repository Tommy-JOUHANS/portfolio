"""
One-time idempotent command — crée un compte admin depuis les env vars.
Usage : python manage.py setup_admin
Env requis :
    ADMIN_PASSWORD (obligatoire)
    ADMIN_EMAIL (optionnel, défaut admin@cyberaudit.fr)
"""

import os

from django.core.management.base import BaseCommand

from apps.accounts.models import User


class Command(BaseCommand):
    help = "Crée un compte admin depuis ADMIN_EMAIL + ADMIN_PASSWORD env vars (idempotent)"

    def handle(self, *args, **options):
        email = os.environ.get("ADMIN_EMAIL", "admin@cyberaudit.fr")
        password = os.environ.get("ADMIN_PASSWORD")

        if not password:
            self.stdout.write(
                self.style.WARNING("⚠️  ADMIN_PASSWORD non défini → skip création admin")
            )
            return

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.SUCCESS(f"ℹ️  Admin {email} existe déjà → skip"))
            return

        User.objects.create_user(
            email=email,
            password=password,
            first_name="Admin",
            last_name="CyberAudit",
            company_name="CyberAudit & Solutions",
            role="admin",
            is_staff=True,
            is_superuser=True,
        )
        self.stdout.write(self.style.SUCCESS(f"✅ Compte admin créé : {email} (role=admin)"))
