"""0002_seed_modules.py — Pré-insertion des 5 modules de base."""
from django.db import migrations
from django.utils import timezone


MODULES = [
    {
        "slug": "anti-phishing",
        "title": "Anti-phishing",
        "description": "Recognize and report suspicious emails.",
        "content_md": (
            "# Anti-phishing\n\n"
            "Learn to spot warning signs: unknown sender, fake urgency, strange links, typos…"
        ),
        "duration_min": 10,
        "level": "beginner",
    },
    {
        "slug": "mfa",
        "title": "Strong passwords & MFA",
        "description": "Create solid passwords and enable two-factor authentication.",
        "content_md": "# MFA\n\n12 characters minimum, use a password manager, enable MFA everywhere.",
        "duration_min": 8,
        "level": "beginner",
    },
    {
        "slug": "wifi-vpn",
        "title": "Public Wi-Fi & VPN",
        "description": "Stay safe on outside networks.",
        "content_md": "# Wi-Fi & VPN\n\nAvoid open hotspots, always use a VPN on public networks.",
        "duration_min": 12,
        "level": "intermediate",
    },
    {
        "slug": "data-backup",
        "title": "Data backup",
        "description": "Best practices to back up business data.",
        "content_md": "# Backup\n\n3-2-1 rule, encrypted off-site backups.",
        "duration_min": 15,
        "level": "intermediate",
    },
    {
        "slug": "incident-response",
        "title": "Incident response",
        "description": "What to do when something goes wrong.",
        "content_md": "# Incident response\n\nIdentify, contain, eradicate, restore, lessons learned.",
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
