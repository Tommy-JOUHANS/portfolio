"""
0002_seed_packs.py — Insère les 4 packs commerciaux (data migration).
"""
from django.db import migrations


PACKS = [
    {
        "code": "audit",
        "name": "Pack Audit",
        "description": "Audit & analyse de risques cyber pour PME.",
        "included_services": "Audit & Risk Analysis (EBIOS RM)",
        "for_whom": "SMEs new to cybersecurity",
        "perimeter": "Initial assessment, vulnerability report",
        "duration_days": 5,
        "price": 1000,
    },
    {
        "code": "security",
        "name": "Pack Security",
        "description": "Audit + remédiation des vulnérabilités détectées.",
        "included_services": "Audit + Incident Management & Vulnerability Remediation",
        "for_whom": "SMEs that have experienced an incident",
        "perimeter": "Audit + remediation of detected vulnerabilities",
        "duration_days": 10,
        "price": 2000,
    },
    {
        "code": "protection",
        "name": "Pack Protection",
        "description": "Audit + SOC 24/7 + monitoring temps réel.",
        "included_services": "Audit + System Security & 24/7 SOC Monitoring",
        "for_whom": "SMEs with sensitive data",
        "perimeter": "Audit + Continuous Monitoring & Real-Time Alerts",
        "duration_days": 15,
        "price": 3500,
    },
    {
        "code": "premium",
        "name": "Pack Premium",
        "description": "Couverture complète : audit, incidents, SOC, sensibilisation.",
        "included_services": "Audit + Incidents + SOC + Team Awareness",
        "for_whom": "SMEs seeking comprehensive coverage",
        "perimeter": "The most comprehensive all-in-one solution",
        "duration_days": 20,
        "price": 5000,
    },
]


def seed_packs(apps, schema_editor):
    AuditPack = apps.get_model("audits", "AuditPack")
    for pack in PACKS:
        AuditPack.objects.update_or_create(code=pack["code"], defaults=pack)


def remove_packs(apps, schema_editor):
    AuditPack = apps.get_model("audits", "AuditPack")
    AuditPack.objects.filter(code__in=[p["code"] for p in PACKS]).delete()


class Migration(migrations.Migration):
    dependencies = [("audits", "0001_initial")]
    operations = [migrations.RunPython(seed_packs, remove_packs)]
