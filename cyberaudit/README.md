# CyberAudit & Solutions — Application

This folder contains the **full-stack MVP** for the CyberAudit portfolio project.

📖 For the project overview, diagrams, team, and deployment notes, see the **[root README](../README.md)**.

---

## 📂 Folders

- **`backend/`** — Django 5.1 + DRF REST API
  - `apps/accounts` — User model, JWT auth, RBAC
  - `apps/audits` — Audit requests + service packs
  - `apps/reports` — PDF generation (Celery + WeasyPrint)
  - `apps/training` — Cybersecurity awareness modules
  - `config/` — Django settings (env-aware)

- **`frontend/`** — React 19 + Vite + Tailwind 4
  - `src/components` — Reusable UI components
  - `src/pages` — Route-level pages
  - `src/services` — API client (Axios + JWT) + EmailJS service
  - `src/hooks` — Custom React hooks

---

## 🚀 Local Development

### Prerequisites
- Python 3.12+, Node.js 20+, PostgreSQL 15+, Redis 7+

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py setup_admin
python manage.py runserver
```

In a separate terminal:
```bash
celery -A config worker --loglevel=info
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🔑 Required Environment Variables

### Backend (`backend/.env`)
```
SECRET_KEY=...
DEBUG=False
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ALLOWED_HOSTS=*
CORS_ALLOWED_ORIGINS=https://portfolio-kappa-dun-65.vercel.app
ADMIN_EMAIL=admin@cyberaudit.fr
ADMIN_PASSWORD=...
CELERY_TASK_ALWAYS_EAGER=True
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=https://backend-production-xxxx.up.railway.app/api
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_CONFIRM=...
VITE_EMAILJS_TEMPLATE_UPDATE=...
VITE_EMAILJS_PUBLIC_KEY=...
```

---

## 📐 Key Technical Decisions

| Decision | Why |
|---|---|
| **Django ORM over raw SQL** | SQL injection-proof by design, productivity, migrations |
| **JWT (stateless) over sessions** | No server-side session storage → scales horizontally |
| **Celery for PDF generation** | WeasyPrint takes 3-5 seconds → don't block HTTP requests |
| **EmailJS over backend SMTP** | Faster MVP iteration, no SMTP config, free tier sufficient |
| **WhiteNoise instead of Nginx** | Single-container deploy on Railway, no reverse proxy needed |
| **UUID primary keys** | Anti-enumeration (no `/api/users/1`, `/api/users/2`...) |
| **404 instead of 403 for RBAC** | Hides existence of admin routes from non-admins |
| **Server-side score recalculation** | Anti-tampering — clients can't fake their security grade |
