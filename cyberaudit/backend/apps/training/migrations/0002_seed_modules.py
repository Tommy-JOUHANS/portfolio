"""0002_seed_modules.py — Pré-insertion des 5 modules de base."""
from django.db import migrations
from django.utils import timezone


MODULES = [
    {
        "slug": "anti-phishing",
        "title": "Anti-phishing",
        "description": "Reconnaître et signaler les emails suspects.",
        "content_md": (
            "# Anti-phishing\n\n"
            "Apprenez à identifier les signaux d'alerte : "
            "expéditeur inconnu, urgence artificielle, liens étranges, fautes…"
        ),
        "duration_min": 10,
        "level": "beginner",
    },
    {
        "slug": "mfa",
        "title": "Mots de passe forts & MFA",
        "description": "Créer des mots de passe solides et activer la double authentification.",
        "content_md": "# MFA\n\n12 caractères mini, gestionnaire de mots de passe, MFA partout.",
        "duration_min": 8,
        "level": "beginner",
    },
    {
        "slug": "wifi-vpn",
        "title": "Wi-Fi public & VPN",
        "description": "Rester en sécurité sur les réseaux extérieurs.",
        "content_md": "# Wi-Fi & VPN\n\nÉvitez les hotspots ouverts, utilisez un VPN.",
        "duration_min": 12,
        "level": "intermediate",
    },
    {
        "slug": "data-backup",
        "title": "Sauvegarde des données",
        "description": "Bonnes pratiques pour sauvegarder les données métier.",
        "content_md": "# Backup\n\nRègle 3-2-1, sauvegardes chiffrées hors-site.",
        "duration_min": 15,
        "level": "intermediate",
    },
    {
        "slug": "incident-response",
        "title": "Réaction aux incidents",
        "description": "Que faire quand quelque chose se passe mal.",
        "content_md": "# Incident response\n\nIdentifier, contenir, éradiquer, restaurer, retour d'expérience.",
        "duration_min": 20,
        "level": "advanced",
    },
]


def seed_modules(apps, schema_editor):
    TrainingModule = apps.get_model("training", "TrainingModule")
    now = timezone.now()
    for module in MODULES:
        TrainingModule.objects.update_or_create(
            slug=module["slug"],
            defaults={**module, "published_at": now},
        )


def remove_modules(apps, schema_editor):
    TrainingModule = apps.get_model("training", "TrainingModule")
    TrainingModule.objects.filter(slug__in=[m["slug"] for m in MODULES]).delete()


class Migration(migrations.Migration):
    dependencies = [("training", "0001_initial")]
    operations = [migrations.RunPython(seed_modules, remove_modules)]
