## 🏗️ Architecture du projet

```
cyberaudit/
├── frontend/                    # SPA React
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/            # Login, Register
│   │   │   ├── dashboard/       # Tableaux de bord Client & Admin
│   │   │   ├── audit/           # Formulaire de demande d'audit
│   │   │   └── training/        # Modules de formation
│   │   ├── pages/
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # Appels API
│   │   └── utils/
│   └── public/
│
├── backend/                     # API REST Django
│   ├── apps/
│   │   ├── accounts/            # Modèle User + rôles
│   │   ├── audits/              # CRUD demandes d'audit
│   │   ├── reports/             # Génération PDF
│   │   ├── training/            # Contenu des formations
│   │   └── notifications/       # Tâches email Celery
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── celery.py
│   └── requirements.txt
│
└── README.md