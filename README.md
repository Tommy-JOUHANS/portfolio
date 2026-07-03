<div align="center">

# CyberAudit & Solutions

### SME Cybersecurity Audit Management Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-portfolio--kappa--dun--65.vercel.app-00C2D7?style=for-the-badge&logo=vercel)](https://portfolio-kappa-dun-65.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Django_5.1-092E20?style=for-the-badge&logo=django)](https://www.djangoproject.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tests](https://img.shields.io/badge/Tests-74_pytest_%C2%B7_93%25_coverage-10B981?style=for-the-badge)](https://github.com/Tommy-JOUHANS/portfolio/actions)
[![CI](https://img.shields.io/badge/CI-passing-10B981?style=for-the-badge&logo=githubactions)](https://github.com/Tommy-JOUHANS/portfolio/actions)

**Holberton School Dijon · Portfolio Project · 2026**

</div>

---

## <Book /> Overview

**CyberAudit & Solutions** is a full-stack web platform that connects French **SME clients** (without in-house IT security) with **CyberAudit operators**. It replaces email-driven audit workflows with a structured, traceable, and secure platform — from request to vulnerability report delivery.

Built in a four-week sprint (Stage 3 → Stage 4) at Holberton School Dijon, in partnership with **Les Entrep'** entrepreneurial association.

> 🔗 **Live demo:** [portfolio-kappa-dun-65.vercel.app](https://portfolio-kappa-dun-65.vercel.app)

---

## ✨ Features

- <Lock /> **JWT authentication** with refresh + blacklist (SimpleJWT)
- 🎫 **Audit request workflow** — 4 service packs (€1,000 → €5,000)
- 📊 **Real-time status tracking** — Pending / In Progress / Completed / Archived
- 📧 **Transactional emails** via EmailJS — confirmation + status updates
- 📄 **Asynchronous PDF report generation** — Celery + WeasyPrint
- 🛡️ **Role-Based Access Control (RBAC)** with 404 anti-enumeration
- 🚫 **Anti-tampering** — server-side security score recalculation
- 🎓 **5 cybersecurity training modules** (anti-phishing, MFA, VPN, backup, incident response)

---

## 🏛️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                          │
│              React 19 SPA · Tailwind · DOMPurify              │
└──────────┬─────────────────────────────────────────┬─────────┘
           │ HTTPS · static assets                   │ HTTPS · REST + JWT
           ▼                                         ▼
   ┌───────────────┐                       ┌──────────────────┐
   │  Vercel CDN   │                       │  Railway Backend │
   │ (edge global) │                       │  Django + DRF    │
   └───────────────┘                       │  + Gunicorn      │
                                           └────┬──────┬──────┘
                                                │      │
                                  ┌─────────────┘      └─────────┐
                                  ▼                              ▼
                          ┌─────────────┐                ┌──────────────┐
                          │ PostgreSQL  │                │   Redis      │
                          │   (data)    │                │  (broker)    │
                          └─────────────┘                └──────┬───────┘
                                                                ▼
                                                       ┌────────────────┐
                                                       │ Celery Worker  │
                                                       │ PDF + emails   │
                                                       └────────────────┘
                                                                │
                                                                ▼
                                                       ┌────────────────┐
                                                       │  WeasyPrint    │
                                                       │  (PDF render)  │
                                                       └────────────────┘
```

📐 **Detailed architecture diagram:** [`Stages/Stage-3/architecture.png`](https://github.com/Tommy-JOUHANS/portfolio/blob/main/Stages/Stage-3/diagrammes/architecture.png)

---

## 🗄️ Database Diagram

Four core entities, all using UUID primary keys, all relations enforced by the Django ORM:

```
   ┌──────────────┐         submits         ┌────────────────┐
   │     USER     │ ──────────────────────▶ │ AUDIT_REQUEST  │
   │              │                          │                │
   │ id (UUID)    │                          │ id (UUID)      │
   │ email UNIQUE │                          │ reference      │
   │ role         │                          │ client_id FK   │
   │ company_name │                          │ pack_id FK     │
   └──────┬───────┘                          │ status         │
          │                                  │ submitted_at   │
          │ receives                         └──────┬─────────┘
          ▼                                         │ produces
   ┌──────────────┐                                 ▼
   │ NOTIFICATION │                          ┌────────────────┐
   │              │                          │  AUDIT_REPORT  │
   │ id (UUID)    │                          │                │
   │ user_id FK   │                          │ id (UUID)      │
   │ type         │                          │ request_id FK  │
   │ status       │                          │ security_score │
   └──────────────┘                          │ grade (A-F)    │
                                             │ findings JSON  │
                                             │ pdf_path       │
                                             └────────────────┘
```

🗃️ **Detailed ERD:** [`Stages/Stage-3/erd-database-HD.png`](https://github.com/Tommy-JOUHANS/portfolio/blob/main/Stages/Stage-3/diagrammes/DIAGRAMME%20ER%202.png)

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| **React 19** + **Vite** | SPA + fast HMR |
| **Tailwind CSS 4** | Utility-first styling |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client with JWT interceptors |
| **DOMPurify** | XSS sanitization |
| **EmailJS** | Transactional emails (no backend SMTP) |
| **Vitest** + **React Testing Library** | Unit tests (40 tests passing) |

### Backend
| Tech | Purpose |
|---|---|
| **Django 5.1** + **DRF 3.17** | REST API |
| **SimpleJWT** | Stateless auth with refresh + blacklist |
| **Celery 5.6** + **Redis** | Async tasks (PDF, notifications) |
| **WeasyPrint** | Server-side PDF generation |
| **django-csp** | Content Security Policy middleware |
| **PostgreSQL 15** | Production database |
| **pytest** + **coverage** | 74 tests, 93% coverage |

### Infrastructure
| Tech | Purpose |
|---|---|
| **Railway** | Backend + Postgres + Redis hosting |
| **Vercel** | Frontend CDN + edge deployment |
| **GitHub Actions** | CI/CD pipeline (lint + test + deploy) |
| **Docker** | Backend image (with WeasyPrint apt deps) |
| **WhiteNoise** | Static file serving (no nginx needed) |

---

## 🔐 Security Highlights

### Frontend
- HTTPS with **HSTS preloaded for one year**
- Strict **Content Security Policy** (whitelist: API + EmailJS + Google Fonts)
- **DOMPurify** XSS sanitization on user content
- **X-Frame-Options DENY** (anti-clickjacking)
- **X-Content-Type-Options nosniff**

### Backend
- JWT with refresh + blacklist + **5 req/min throttling**
- **RBAC** enforced at API level (404 anti-enumeration)
- **Server-side score recalculation** (anti-tampering)
- Django ORM — **SQL injection-proof by design**
- `django-csp` middleware (CSP enforced server-side)

### Manual penetration tests passed
- ✅ XSS attempt → blocked by React + DOMPurify + CSP
- ✅ SQL injection → blocked by ORM
- ✅ Brute force → 429 after 5 attempts

---

## 🚀 Quick Start

### Backend (Django + Celery)

```bash
cd cyberaudit/backend

python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env

python manage.py migrate
python manage.py setup_admin

python manage.py runserver
```

In a separate terminal, start the Celery worker:

```bash
celery -A config worker --loglevel=info
```

### Frontend (React + Vite)

```bash
cd cyberaudit/frontend

npm install

cp .env.example .env

npm run dev
```

---

## 🧪 Testing

### Backend
```bash
cd cyberaudit/backend
pytest
pytest --cov=apps --cov-report=html
```
**74 tests passing · 93% global coverage**

Covers: JWT auth flows, RBAC + 404 anti-enumeration, rate limiting, score sanitization, API endpoints.

### Frontend
```bash
cd cyberaudit/frontend
npm test
npm run test:run
npm run test:coverage
```
**40 tests passing · 100% coverage on tested modules**

Covers: validators, StatusBadge, useAuth hook, ProtectedRoute.

---

## 📦 Project Structure

```
portfolio/
├── README.md                    # This file
├── Stages/                      # Documentation per stage
│   ├── Stage-1/                 # Project conception
│   ├── Stage-2/                 # User stories + mockups
│   ├── Stage-3/                 # Technical documentation + diagrams
│   └── Stage-4/                 # MVP defense materials
├── cyberaudit/
│   ├── backend/                 # Django + DRF + Celery
│   │   ├── apps/
│   │   │   ├── accounts/        # User model, JWT auth, RBAC
│   │   │   ├── audits/          # Audit requests + packs
│   │   │   ├── reports/         # PDF generation (Celery + WeasyPrint)
│   │   │   └── training/        # Cybersecurity awareness modules
│   │   ├── config/              # Django settings
│   │   ├── Dockerfile           # Backend image (with WeasyPrint deps)
│   │   └── requirements.txt
│   └── frontend/                # React + Vite + Tailwind
│       ├── src/
│       │   ├── components/      # UI components
│       │   ├── pages/           # Page components
│       │   ├── services/        # API client + EmailJS
│       │   └── hooks/           # Custom React hooks
│       ├── vercel.json          # Vercel config + security headers
│       └── package.json
```

---

## 🚢 Deployment

| Service | Platform | Notes |
|---|---|---|
| **Frontend** | Vercel | Auto-deploy from `main` · HSTS + CSP headers configured in `vercel.json` |
| **Backend API** | Railway (Docker) | Django + Gunicorn + WhiteNoise |
| **PostgreSQL** | Railway | Production database |
| **Redis** | Railway | Celery broker |
| **Celery Worker** | Railway | Separate service for async PDF + email tasks |
| **Email Service** | EmailJS (Gmail) | Two templates: audit confirmation + status update |

All secrets managed via environment variables — **no credentials in source code**.

---

## 👥 Team

| Member | Role | Focus |
|---|---|---|
| **Tommy JOUHANS** | Frontend & UI/UX Lead | UI components, design system, admin + client dashboards, login/register flow |
| **James ROUSSEL** | Backend & DevOps Lead | API + database, authentication & security, deployment, CI/CD |

**Holberton School Dijon — Portfolio Project — 2026**
**Partner:** Les Entrep' entrepreneurial association, Dijon

---

## 📜 License

This project is developed as a school portfolio under the supervision of Holberton School Dijon. All rights reserved by the authors.

---

<div align="center">

**Holberton School in Dijon**

</div>
