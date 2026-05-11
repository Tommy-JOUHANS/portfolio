# 🛡️ CyberAudit & Solutions — Portfolio Project

> **Stage 1 — Team Formation and Idea Development**
> Holberton School Dijon | 2026

---

## 👥 Team

| Member | Role | Key Skills |
|--------|------|-----------|
| **Tommy JOUHANS** | Front-End Developer | React, HTML/CSS, UX Design, Figma |
| **James ROUSSEL** | Back-End Developer | Django, PostgreSQL, REST API, Celery, Security |

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [MVP Features](#mvp-features)
4. [Project Architecture](#project-architecture)
5. [8-Week Timeline](#8-week-timeline)
6. [SMART Objectives](#smart-objectives)
7. [Security](#security)
8. [Getting Started](#getting-started)
9. [Team Rules](#team-rules)
10. [Sources & References](#sources--references)

---

## 🎯 Project Overview

### Problem

**45% of French SMEs have no internal IT team** *(Source: ANSSI "Panorama de la cybermenace" 2023)*.
They face increasingly frequent cyberattacks — ransomware, phishing, data breaches — but lack the skills and tools to protect themselves. Existing solutions are designed for large enterprises: too complex, too costly, inaccessible.

> **Result:** SMEs suffer preventable attacks, lose critical data, and risk heavy GDPR penalties (up to 4% of annual turnover).

### Solution

A **full-stack web platform** connecting SMEs with cybersecurity experts. Users can:
- ✅ Submit a cybersecurity audit request in a few clicks
- ✅ Track the progress of their case in real time
- ✅ View a clear, plain-language vulnerability report
- ✅ Access awareness training modules

All in a **secure environment** with role management and JWT authentication.

### User Persona

> **Marie**, 45, manager of a 12-person accounting firm in Dijon. She uses Excel and Gmail daily but has no IT background. She was recently targeted by a phishing email and needs a simple, affordable solution — not a 200-page technical report.

---

## 🛠️ Tech Stack

### Front-End
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Back-End
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

### Infrastructure & Security
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

| Technology | Usage |
|------------|-------|
| Django REST Framework | Secure REST API |
| SimpleJWT | Authentication & token management |
| Celery + Redis | Async tasks (emails, PDF generation) |
| DOMPurify | XSS protection |
| Django ORM | SQL injection protection |
| Railway / Render | Cloud hosting + automatic HTTPS |

---

## ✅ MVP Features

### In Scope (8 weeks)

**Authentication & Security**
- [x] Registration & login with JWT
- [x] Role management: `Admin CyberAudit` / `SME Client`
- [x] Route protection & HTTP security headers
- [x] Password hashing + rate limiting

**Core Features**
- [x] Audit request form
- [x] Admin dashboard — request management (4 statuses: Pending / In Progress / Completed / Archived)
- [x] Client dashboard — real-time status tracking
- [x] Automatic PDF report generation
- [x] Awareness training module
- [x] Automatic email notifications (Celery async)

**Technical & Deployment**
- [x] Secure REST API (Django REST Framework)
- [x] PostgreSQL DB with performance indexes
- [x] Cloud HTTPS deployment

### Out of Scope — Version 2

- [ ] Real-time SOC (WebSocket)
- [ ] Automatic AI security score
- [ ] Mobile application (iOS / Android)
- [ ] Gamified training modules
- [ ] Consultant marketplace
- [ ] OAuth2 integration (Google / LinkedIn)

---

## 🏗️ Project Architecture

```
cyberaudit/
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/            # Login, Register
│   │   │   ├── dashboard/       # Client & Admin dashboards
│   │   │   ├── audit/           # Audit request form
│   │   │   └── training/        # Training modules
│   │   ├── pages/
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API calls
│   │   └── utils/
│   └── public/
│
├── backend/                     # Django REST API
│   ├── apps/
│   │   ├── accounts/            # User model + roles
│   │   ├── audits/              # Audit requests CRUD
│   │   ├── reports/             # PDF generation
│   │   ├── training/            # Training content
│   │   └── notifications/       # Celery email tasks
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── celery.py
│   └── requirements.txt
│
└── README.md
```

---

## 📅 8-Week Timeline

| Week | Focus | Tommy (Front-End) | James (Back-End) |
|------|-------|-------------------|-----------------|
| **W1** | Design | Figma wireframes, User Stories, README | DB schema, entity modelling, security libraries |
| **W2** | Environment | React init, Tailwind CSS, .env | Django init, PostgreSQL config, app structure |
| **W3** | Auth & Security | Login/Register pages, JWT client-side | User model + roles, JWT endpoints, rate limiting |
| **W4** | Core Features 1 | Audit form, Client dashboard | Audit CRUD API, input validation, SQL protection |
| **W5** | Core Features 2 | Admin dashboard, training module | PDF generation, file upload, training endpoints |
| **W6** | Async & Performance | Notification UI, pagination | Celery + Redis, API pagination, DB optimisation |
| **W7-10** | Testing | React tests, end-to-end, **UX user tests (x3)** | Unit tests, Postman API tests, XSS/SQL checks |
| **W11-12** | Deployment | Frontend (Vercel/Render), presentation slides | Backend + DB deployment, HTTPS SSL, documentation |

### Shared Tasks (both members)
- Cross code reviews on GitHub (mandatory before every merge)
- Manual security tests in W7 (XSS, SQL injection, brute-force)
- Final README and documentation
- Presentation preparation and rehearsal

---

## 🎯 SMART Objectives

### Objective 1 — Authentication & Roles
| Criterion | Detail |
|-----------|--------|
| **Specific** | Authentication system with 2 distinct roles, protecting all sensitive routes |
| **Measurable** | 100% of API routes tested — verified via Postman tests in W7 |
| **Achievable** | SimpleJWT + Django Permissions — 1 week allocated (W3) |
| **Relevant** | Essential prerequisite: without auth, no other feature can be delivered |
| **Time-bound** | ✅ Delivered and validated by end of Week 3 |

### Objective 2 — Audit Request Management
| Criterion | Detail |
|-----------|--------|
| **Specific** | SME client submits request; admin manages with 4 statuses |
| **Measurable** | Full CRUD — 5 test scenarios validated |
| **Achievable** | DRF + React Form — 1 week (W4) |
| **Relevant** | Core of the product — without it, the platform has no purpose |
| **Time-bound** | ✅ Demo-ready by end of Week 4 |

### Objective 3 — Deployment & Security
| Criterion | Detail |
|-----------|--------|
| **Specific** | HTTPS deployment + anti-XSS + anti-SQL injection validated |
| **Measurable** | Public URL accessible + security tests passed |
| **Achievable** | Railway/Render + Let's Encrypt — W8 |
| **Relevant** | Jury expects a secured AND deployed application |
| **Time-bound** | ✅ Live before final presentation |

### Objective 4 — User Experience *(NEW)*
| Criterion | Detail |
|-----------|--------|
| **Specific** | Non-technical user (persona: Marie) submits audit request without help |
| **Measurable** | Task completed in **< 3 minutes** — validated by **3 user tests** in W7 |
| **Achievable** | Figma wireframes in W1, simplified form in W4 |
| **Relevant** | If the interface is unusable, no SME will adopt the platform |
| **Time-bound** | ✅ User tests documented before end of Week 7 |

---

## 🔐 Security

The platform implements multiple layers of security:

```python
# Authentication — SimpleJWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

# Rate limiting — django-ratelimit
@ratelimit(key='ip', rate='5/m', method='POST', block=True)
def login_view(request): ...

# XSS protection — DOMPurify (React frontend)
const clean = DOMPurify.sanitize(userInput);

# SQL injection — Django ORM (no raw queries)
AuditRequest.objects.filter(client=request.user, status=status)
```

**Security Headers (Django middleware):**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy`
- `Strict-Transport-Security (HSTS)`

**Security tests planned for W7:**
- XSS injection attempts
- SQL injection via Postman
- Brute-force on login endpoint
- JWT token tampering

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/[username]/cyberaudit-solutions.git
cd cyberaudit-solutions/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL and Redis credentials

# Run migrations
python manage.py migrate

# Create superuser (Admin role)
python manage.py createsuperuser

# Start Celery worker
celery -A config worker --loglevel=info

# Start development server
python manage.py runserver
```

### Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit REACT_APP_API_URL=http://localhost:8000

# Start development server
npm start
```

### Environment Variables

**Backend `.env`:**
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/cyberaudit
REDIS_URL=redis://localhost:6379/0
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_ENV=development
```

---

## 📐 Team Rules

### Git Workflow
```
main          ← production only (W8 deployment)
develop       ← integration branch
feature/*     ← individual features (feature/auth-jwt, feature/dashboard-client)
fix/*         ← bug fixes
```

**Commit Convention:**
```
feat: add audit request form
fix: resolve JWT refresh token bug
docs: update API documentation
test: add unit tests for audit CRUD
```

**Pull Request Rules:**
- Every PR requires review from the other member before merge
- No direct push to `main` or `develop`
- PR description must include: what changed, why, and how to test

### Decision Protocol
1. Major technical decisions → discussed on Discord, both members must agree
2. Disagreement → prototype both solutions on separate branches, compare on: performance, maintainability, estimated delivery time
3. No consensus after 48h → project manager decides on product priorities, technical lead decides on architecture

### Communication Tools
| Tool | Usage | Frequency |
|------|-------|-----------|
| Discord | Daily communication (#frontend, #backend, #general) | Every day |
| GitHub | Code versioning + mandatory PRs | Each commit |
| Notion | Documentation + task tracking | After each session |
| Weekly check-in | Review + planning | Every Monday |

---

## 📚 Sources & References

| Source | Content | Link |
|--------|---------|------|
| ANSSI 2023 | "Panorama de la cybermenace" — 45% of SMEs without IT team | [anssi.fr](https://www.ssi.gouv.fr) |
| CESIN 2023 | Annual Cybersecurity Barometer | [cesin.fr](https://www.cesin.fr) |
| ENISA 2023 | Threat Landscape Report | [enisa.europa.eu](https://www.enisa.europa.eu) |
| APEC 2023 | Salary Barometer — Cybersecurity Expert cost | [apec.fr](https://www.apec.fr) |
| GDPR | Official GDPR text — penalties up to 4% of annual turnover | [gdpr.eu](https://gdpr.eu) |
| NIS2 Directive | EU NIS2 Directive — cybersecurity obligations | [digital-strategy.ec.europa.eu](https://digital-strategy.ec.europa.eu) |

---

## 📊 SWOT Summary

| | Positive | Negative |
|--|----------|---------|
| **Internal** | ✅ All-in-one solution / Stack mastered / 24/7 availability | ⚠️ Team of 2 / Zero brand awareness |
| **External** | 🚀 GDPR + NIS2 obligation / Rising cyberattacks / Market gap | 🔴 Competition (Cybermalveillance, Vaadata) / Evolving threats |

---

## 👤 Stakeholder Map

```
HIGH INFLUENCE
      │
      │  Holberton Jury ●          ● Tommy + James
      │
      │  CyberAudit Admin ●
      │                                ● SME Clients
      │
      │  ISO/GDPR Bodies ●
      │
      │  Partner Banks ●   IT Providers ●
      │
LOW INFLUENCE
      └────────────────────────────────────────
         LOW INTEREST              HIGH INTEREST
```

---

## 📄 Licence

This project is developed as part of the Holberton School Dijon curriculum.
© 2026 Tommy JOUHANS & James ROUSSEL — CyberAudit & Solutions

---

*Portfolio Project — Stage 1: Team Formation and Idea Development*
*Holberton School Dijon | 2026*
