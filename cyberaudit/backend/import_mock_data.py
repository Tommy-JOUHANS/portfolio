"""
import_mock_data.py — Importe les 35 demandes du localStorage vers Django.

Lancer avec :
    cd ~/portfolio/cyberaudit/backend
    python manage.py shell < import_mock_data.py
"""

import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.utils.timezone import datetime
from django.utils import timezone
from apps.accounts.models import User
from apps.audits.models import AuditPack, AuditRequest

# ── 1. Packs ──────────────────────────────────────────────────────────────────
packs = {p.code: p for p in AuditPack.objects.all()}
print(f"Packs trouvés : {list(packs.keys())}")

# ── 2. Clients à créer (email → infos) ────────────────────────────────────────
CLIENTS = {
    "marie@cabinet-dijon.fr":        ("Marie",  "Dupont",   "Cabinet Dijon"),
    "p.mercier@dijon.fr":            ("Paul",   "Mercier",  "City Hall Dijon"),
    "contact@atelier-pro.fr":        ("Lucie",  "Robert",   "Atelier Pro"),
    "sami@techcorp.io":              ("Sami",   "Benali",   "Tech Corp"),
    "emma@blueroof.fr":              ("Emma",   "Leroy",    "BlueRoof SARL"),
    "hugo@boulangerie-martin.fr":    ("Hugo",   "Martin",   "Boulangerie Martin"),
    "tomjouan99@gmail.com":          ("Tommy",  "Jouhans",  "Holberton School Dijon"),
    "tommy.jouhans@outlook.com":     ("Tommy",  "Jouhans",  "Holberton School Dijon"),
    "jean@test.com":                 ("Jean",   "Dupont",   "Holberton School Dijon"),
}

client_map = {}  # email → User
for email, (first, last, company) in CLIENTS.items():
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "first_name":   first,
            "last_name":    last,
            "company_name": company,
            "role":         "client",
        }
    )
    if created:
        user.set_password("Client1234!")
        user.save()
        print(f"  ✅ Créé : {email}")
    else:
        print(f"  ⏩ Existant : {email}")
    client_map[email] = user

# ── 3. Données mock ───────────────────────────────────────────────────────────
REQUESTS = [
    ("DOSSIER-2026-0001","marie@cabinet-dijon.fr",     "premium",    "in_progress", "Help us raise awareness about cybersecurity",  "2026-04-29T14:32:00Z"),
    ("DOSSIER-2026-0002","marie@cabinet-dijon.fr",     "audit",      "pending",     "",                                             "2026-04-22T10:15:00Z"),
    ("DOSSIER-2026-0003","marie@cabinet-dijon.fr",     "security",   "completed",   "",                                             "2026-04-10T09:00:00Z"),
    ("DOSSIER-2026-0004","p.mercier@dijon.fr",         "protection", "in_progress", "Sensitive citizen data, need continuous monitoring.", "2026-04-03T08:45:00Z"),
    ("DOSSIER-2026-0005","contact@atelier-pro.fr",     "audit",      "archived",    "",                                             "2026-03-25T13:10:00Z"),
    ("DOSSIER-2026-0006","sami@techcorp.io",           "audit",      "pending",     "First cybersecurity audit for our startup.",   "2026-04-18T16:00:00Z"),
    ("DOSSIER-2026-0007","emma@blueroof.fr",           "security",   "completed",   "We suffered a phishing incident last month.",  "2026-04-12T11:30:00Z"),
    ("DOSSIER-2026-0008","hugo@boulangerie-martin.fr", "premium",    "pending",     "Comprehensive coverage for our 3 shops.",      "2026-05-05T09:25:00Z"),
    ("DOSSIER-2026-0009","tomjouan99@gmail.com",       "audit",      "in_progress", "Je souhaiterai faire une demande d'audit",     "2026-05-21T19:17:21Z"),
    ("DOSSIER-2026-0010","tommy.jouhans@outlook.com",  "protection", "archived",    "protection à assurer",                         "2026-05-21T19:34:47Z"),
    ("DOSSIER-2026-0011","tommy.jouhans@outlook.com",  "audit",      "pending",     "protestation a assurer",                       "2026-05-25T17:11:12Z"),
    ("DOSSIER-2026-0012","jean@test.com",              "security",   "pending",     "",                                             "2026-05-25T19:50:13Z"),
    ("DOSSIER-2026-0013","jean@test.com",              "security",   "completed",   "protection sur",                               "2026-05-26T08:31:12Z"),
    ("DOSSIER-2026-0014","jean@test.com",              "protection", "pending",     "protection a assurer",                         "2026-05-26T09:24:39Z"),
    ("DOSSIER-2026-0015","jean@test.com",              "audit",      "pending",     "test",                                         "2026-05-26T14:27:09Z"),
    ("DOSSIER-2026-0016","tommy.jouhans@outlook.com",  "audit",      "pending",     "OK",                                           "2026-05-27T09:58:11Z"),
    ("DOSSIER-2026-0017","tommy.jouhans@outlook.com",  "audit",      "pending",     "ALLO",                                         "2026-05-27T10:02:16Z"),
    ("DOSSIER-2026-0018","tommy.jouhans@outlook.com",  "audit",      "pending",     "ALLO",                                         "2026-05-27T10:05:57Z"),
    ("DOSSIER-2026-0019","tommy.jouhans@outlook.com",  "protection", "pending",     "OK",                                           "2026-05-27T11:21:43Z"),
    ("DOSSIER-2026-0020","tommy.jouhans@outlook.com",  "audit",      "pending",     "OK POUR AUDIT",                                "2026-05-27T11:27:20Z"),
    ("DOSSIER-2026-0021","tommy.jouhans@outlook.com",  "protection", "completed",   "JE SOUHAITE UNE PROTECTION MAXIMAL",           "2026-05-27T11:36:30Z"),
    ("DOSSIER-2026-0022","tommy.jouhans@outlook.com",  "audit",      "pending",     "protection à assurer",                         "2026-05-27T11:43:33Z"),
    ("DOSSIER-2026-0023","tommy.jouhans@outlook.com",  "security",   "pending",     "helo",                                         "2026-05-27T12:35:49Z"),
    ("DOSSIER-2026-0024","marie@cabinet-dijon.fr",     "audit",      "pending",     "Help us raise awareness about cybersecurity",  "2026-05-27T12:50:05Z"),
    ("DOSSIER-2026-0025","tomjouan99@gmail.com",       "audit",      "pending",     "tester moi ma sensibilisation",                "2026-05-27T13:03:00Z"),
    ("DOSSIER-2026-0026","tommy.jouhans@outlook.com",  "protection", "pending",     "protection renforcer",                         "2026-05-27T14:30:24Z"),
    ("DOSSIER-2026-0027","tommy.jouhans@outlook.com",  "audit",      "pending",     "essaie",                                       "2026-05-27T14:33:00Z"),
    ("DOSSIER-2026-0028","tommy.jouhans@outlook.com",  "security",   "pending",     "security",                                     "2026-05-27T14:34:08Z"),
    ("DOSSIER-2026-0029","tommy.jouhans@outlook.com",  "audit",      "in_progress", "test pour envoie de mail",                     "2026-05-27T14:47:55Z"),
    ("DOSSIER-2026-0030","tomjouan99@gmail.com",       "audit",      "pending",     "test email impossible",                        "2026-05-27T15:13:21Z"),
    ("DOSSIER-2026-0031","tomjouan99@gmail.com",       "security",   "pending",     "sécurité à prévoir",                           "2026-05-27T15:20:12Z"),
    ("DOSSIER-2026-0032","tomjouan99@gmail.com",       "audit",      "pending",     "tester le pack audit",                         "2026-05-27T15:36:49Z"),
    ("DOSSIER-2026-0033","tomjouan99@gmail.com",       "security",   "pending",     "please for security",                          "2026-05-27T15:38:55Z"),
    ("DOSSIER-2026-0034","tommy.jouhans@outlook.com",  "audit",      "pending",     "test audit s'il vous plais",                   "2026-05-27T15:45:51Z"),
    ("DOSSIER-2026-0035","tommy.jouhans@outlook.com",  "audit",      "pending",     "62",                                           "2026-05-28T11:25:06Z"),
]

# ── 4. Import ─────────────────────────────────────────────────────────────────
created_count = 0
skipped_count = 0

for reference, email, pack_code, status, notes, submitted_iso in REQUESTS:
    if AuditRequest.objects.filter(reference=reference).exists():
        print(f"  ⏩ Déjà en base : {reference}")
        skipped_count += 1
        continue

    client = client_map.get(email)
    pack   = packs.get(pack_code)
    if not client or not pack:
        print(f"  ❌ Ignoré {reference} — client ou pack manquant")
        continue

    # Créer sans auto-référence (on la fixe manuellement)
    r = AuditRequest(
        reference=reference,
        client=client,
        pack=pack,
        status=status,
        scope_notes=notes,
    )
    r.save()

    # Corriger submitted_at (auto_now_add contourne l'assignation normale)
    from datetime import datetime as dt
    submitted_dt = dt.fromisoformat(submitted_iso.replace("Z", "+00:00"))
    AuditRequest.objects.filter(pk=r.pk).update(submitted_at=submitted_dt)

    print(f"  ✅ {reference} | {status:12} | {pack_code:10} | {email}")
    created_count += 1

print(f"\n{'='*50}")
print(f"Import terminé : {created_count} créés, {skipped_count} ignorés")
print(f"Total en base  : {AuditRequest.objects.count()} demandes")
