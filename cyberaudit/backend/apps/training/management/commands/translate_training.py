"""Traduit les titres/descriptions des modules de training en anglais."""
from django.core.management.base import BaseCommand
from apps.training.models import TrainingModule


TRANSLATIONS = {
    "Anti-phishing": ("Anti-phishing", "Recognize and report suspicious emails."),
    "Mots de passe forts & MFA": ("Strong passwords & MFA", "Create strong passwords and enable multi-factor authentication."),
    "Wi-Fi public & VPN": ("Public Wi-Fi & VPN", "Stay safe on external networks."),
    "Sauvegarde des donnees": ("Data backup", "Best practices for backing up business data."),
    "Sauvegarde des données": ("Data backup", "Best practices for backing up business data."),
    "Reaction aux incidents": ("Incident response", "What to do when something goes wrong."),
    "Réaction aux incidents": ("Incident response", "What to do when something goes wrong."),
}


class Command(BaseCommand):
    help = "Translate training modules to English"

    def handle(self, *args, **options):
        updated = 0
        for module in TrainingModule.objects.all():
            if module.title in TRANSLATIONS:
                new_title, new_description = TRANSLATIONS[module.title]
                module.title = new_title
                module.description = new_description
                module.save(update_fields=["title", "description"])
                self.stdout.write(self.style.SUCCESS(f"OK {new_title}"))
                updated += 1
        self.stdout.write(self.style.SUCCESS(f"\n=> {updated} modules translated"))
