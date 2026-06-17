# Stage 4 — MVP Development & Execution

> **CyberAudit & Solutions** · Cybersecurity audit management platform for SMEs
> Portfolio Holberton School · Tommy JOUHANS (Front-End) · James (Back-End)
> Period: S4–S10 (26 May → 3 July 2026) · Last updated: June 2026

---

## Table of Contents

1. [Application Architecture](#1-application-architecture)
2. [Database Schema](#2-database-schema)
3. [Sprint Planning — Task 0](#3-sprint-planning--task-0)
4. [Development Execution — Task 1](#4-development-execution--task-1)
5. [Progress Tracking — Task 2](#5-progress-tracking--task-2)
6. [Reviews & Retrospectives — Task 3](#6-reviews--retrospectives--task-3)
7. [Integration Tests & QA — Task 4](#7-integration-tests--qa--task-4)
8. [Deliverables — Task 5](#8-deliverables--task-5)
9. [Technical Review Preparation — Task 6](#9-technical-review-preparation--task-6)
10. [Quick Start Guide](#10-quick-start-guide)

---

## 1. Application Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                             │
│                                                                     │
│   React 19 + Vite + Tailwind CSS v4                                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────────────┐  ┌───────────┐  │
│   │ AuthCtx  │  │  Pages   │  │   Components     │  │ Services  │  │
│   │ (JWT)    │  │ Home     │  │ Dashboard        │  │ api.js    │  │
│   │          │  │ Login    │  │ StatusBadge      │  │ (axios)   │  │
│   │          │  │ Dashboard│  │ StatCard         │  │ dataServ. │  │
│   └──────────┘  └──────────┘  └──────────────────┘  └───────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS + JWT Bearer
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Django 5.1 + DRF 3.17)                 │
│                                                                     │
│   ┌─────────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│   │  accounts   │  │    packs /   │  │  training / reports /     │ │
│   │  /api/auth/ │  │  requests    │  │  notifications            │ │
│   │  /api/users/│  │  /api/packs/ │  │                           │ │
│   └─────────────┘  └──────────────┘  └───────────────────────────┘ │
│                                                                     │
│   SimpleJWT · CORS · RBAC Permissions · DRF Pagination             │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  Celery Worker (async tasks)                                 │  │
│   │  ├── generate_report_task  →  WeasyPrint  →  PDF            │  │
│   │  └── send_notification_email  →  SMTP                       │  │
│   └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
              ┌──────────────┴─────────────┐
              ▼                            ▼
   ┌─────────────────┐         ┌──────────────────┐
   │  PostgreSQL DB  │         │   Redis Broker   │
   │  (7 tables)     │         │   (Celery queue) │
   └─────────────────┘         └──────────────────┘
```

### Sequence Diagram — Audit Request Submission

```
sequenceDiagram
  actor User
  participant Front as AuditRequestForm
  participant API as Django /audits
  participant DB as PostgreSQL
  participant Redis
  participant Worker as Celery Worker
  participant SMTP

  User->>Front: Selects pack + scope_notes
  Front->>API: POST /api/audits/ + JWT Bearer
  API->>API: Validates JWT + data
  API->>DB: INSERT audit_request (status=pending)
  API->>Redis: enqueue send_ack_email(audit_id)
  API-->>Front: 201 Created { reference: "CYB-2026-0001" }
  Front-->>User: Redirect /audit/confirmation/CYB-2026-0001
  Worker->>Redis: dequeue task
  Worker->>SMTP: Acknowledgement email
  Worker->>DB: UPDATE notification status=sent
  SMTP-->>User: Email received
```

### Technology Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Frontend | React + Vite | 19 / 8 | Reactive SPA, fast HMR, rich ecosystem |
| Styles | Tailwind CSS | 4 | Utility-first, design consistency, no CSS spaghetti |
| Routing | React Router | 7 | SPA standard, `ProtectedRoute` with built-in RBAC |
| HTTP | Axios | 1.9 | JWT interceptors, auto-refresh, configurable timeout |
| Backend | Django + DRF | 5.1 / 3.17 | Powerful ORM, built-in Django admin, batteries included |
| Auth | SimpleJWT | 5.5 | Access 60 min + Refresh 7 days, blacklist on logout |
| Async | Celery + Redis | 5.6 / 7.4 | Non-blocking PDF generation and emails |
| PDF | WeasyPrint | 62 | HTML+CSS → faithful server-side PDF rendering |
| Dev DB | SQLite | — | Lightweight, zero config, ideal for development |
| Prod DB | PostgreSQL | — | Robust, ACID, native UUID, full-text search |
| CI/CD | GitHub Actions | — | Lint + Tests + Build automated on each PR |
| Deploy (BE) | Railway | — | Backend hosted, auto-deploy from `main` |
| Deploy (FE) | Vercel | — | Frontend hosted, auto-deploy from `main` |

---

## 2. Database Schema

```
┌──────────────────────────────────────────────────────────────────────┐
│  USER (accounts_user)                                                │
│  ─────────────────────────────────────────────────────────────────  │
│  id            UUID         PK, default uuid4()                     │
│  email         VARCHAR(254) UNIQUE — login identifier               │
│  password      VARCHAR      PBKDF2 hash (Django)                    │
│  first_name    VARCHAR(100)                                          │
│  last_name     VARCHAR(100)                                          │
│  role          ENUM         client | admin                          │
│  company_name  VARCHAR(200) nullable                                 │
│  created_at    DATETIME     auto_now_add                            │
│  is_active     BOOLEAN      GDPR soft delete                        │
│  is_staff      BOOLEAN      Django /admin/ access                   │
└───────────────┬──────────────────────┬──────────────────────────────┘
                │ 1──N                 │ 1──N
                ▼                     ▼
┌───────────────────────────┐  ┌─────────────────────────────────────┐
│  AUDIT_REQUEST            │  │  NOTIFICATION                       │
│  ─────────────────────    │  │  ──────────────────────────────     │
│  id         UUID  PK      │  │  id          UUID  PK               │
│  reference  VARCHAR UNIQUE│  │  user_id     FK → USER              │
│  client_id  FK → USER     │  │  request_id  FK → AUDIT_REQUEST     │
│  pack_id    FK → PACK     │  │  type        ENUM (3 values)        │
│  status     ENUM (4)      │  │  subject     VARCHAR(255)           │
│  scope_notes TEXT         │  │  status      ENUM queued|sent|failed│
│  assigned_to FK → USER    │  │  sent_at     DATETIME nullable      │
│  internal_notes TEXT      │  │  created_at  DATETIME auto          │
│  submitted_at  DATETIME   │  └─────────────────────────────────────┘
│  updated_at    DATETIME   │
│  completed_at  DATETIME?  │
└─────────┬─────────────────┘
          │ 1──1
          ▼
┌────────────────────────────┐
│  AUDIT_REPORT              │
│  ─────────────────────     │
│  id           UUID  PK     │
│  audit_req_id FK UNIQUE    │
│  summary      TEXT         │
│  score        SMALLINT     │
│  findings     JSON         │
│  pdf_path     VARCHAR      │
│  generated_at DATETIME     │
└────────────────────────────┘

┌──────────────────────────────────┐   ┌──────────────────────────────┐
│  AUDIT_PACK (4 fixed rows)       │   │  TRAINING_MODULE             │
│  ──────────────────────────────  │   │  ──────────────────────────  │
│  id           INT    PK          │   │  id           INT  PK        │
│  code         ENUM   UNIQUE      │   │  title        VARCHAR        │
│  name         VARCHAR            │   │  content_md   TEXT           │
│  description  TEXT               │   │  level        ENUM (3)       │
│  duration_days SMALLINT          │   │  published_at DATETIME?      │
│  price        DECIMAL(8,2)       │   └───────────┬──────────────────┘
└──────────────────────────────────┘               │ N──N via
                                                   ▼
                                       ┌─────────────────────────┐
                                       │  TRAINING_PROGRESS      │
                                       │  ────────────────────── │
                                       │  id           INT  PK   │
                                       │  user_id  FK → USER     │
                                       │  module_id FK → MODULE  │
                                       │  completed  BOOLEAN     │
                                       │  completed_at DATETIME? │
                                       │  UNIQUE(user_id,module) │
                                       └─────────────────────────┘
```

### Key Relationships

| Relationship | Type | Description |
|-------------|------|-------------|
| `USER` → `AUDIT_REQUEST` | 1→N | A client can have multiple audit requests |
| `AUDIT_REQUEST` → `AUDIT_REPORT` | 1→1 | One report per request (OneToOneField) |
| `AUDIT_REQUEST` → `NOTIFICATION` | 1→N | Multiple notifications per request |
| `USER` → `NOTIFICATION` | 1→N | Notifications linked to a user |
| `USER` ↔ `TRAINING_MODULE` | N→N | Via `TRAINING_PROGRESS` (pivot table) |

---

## 3. Sprint Planning — Task 0

### Global Calendar (12 weeks · 27 April → 19 July 2026)

| Sprint | Dates | Key Deliverable | Status |
|--------|-------|-----------------|--------|
| S1 | 27 Apr | Design & Wireframes | ✅ Done |
| S2 | 4 May | Environment Setup | ✅ Done |
| S3 | 11 May | Auth & JWT | ✅ Done |
| S4 | 18 May | Core Features 1 — Form + Client Dashboard | ✅ Done |
| S5 | 25 May | Core Features 2 — PDF + Admin + Celery | ✅ Done |
| S6 | 1 Jun | Async tasks + Notifications + CI/CD | ✅ Done |
| S7–S8 | 8–21 Jun | Deep testing + Frontend Vitest (56 tests) + bugfixes | 🔄 In Progress |
| S9–S10 | 22 Jun–5 Jul | Railway + Vercel deployment ✅ (deployed May) | ✅ Deployed |
| S11–S12 | 6–19 Jul | Stabilisation + Final Presentation | 🔜 Upcoming |

---

### Sprint 1 — Authentication & JWT (S3 · 11–17 May)

**Duration:** 1 week | **Goal:** Complete authentication system with JWT

| Priority | Task | Owner | Status |
|----------|------|-------|--------|
| 🔴 MUST | Custom User model (UUID, role, email-login) | James | ✅ |
| 🔴 MUST | POST /api/auth/register/ + /login/ + /refresh/ | James | ✅ |
| 🔴 MUST | SimpleJWT token generation (access 60min + refresh 7d) | James | ✅ |
| 🔴 MUST | ProtectedRoute + role check (RBAC) | Tommy | ✅ |
| 🔴 MUST | LoginForm + RegisterForm (local validation) | Tommy | ✅ |
| 🔴 MUST | AuthContext (global login/logout/register state) | Tommy | ✅ |
| 🟡 SHOULD | JWT blacklist on logout | James | ✅ |
| 🟡 SHOULD | CORS configuration for Vite | James | ✅ |
| 🟢 COULD | Rate limiting (5 req/min) | James | ✅ |
| ⚪ WON'T | SSO / OAuth2 | — | out of scope |

**Velocity:** 9/9 priority tasks completed

**Dependencies:** User model → all other apps ; AuthContext → all protected pages

---

### Sprint 2 — Core Features 1 (S4 · 18–24 May)

**Duration:** 1 week | **Goal:** Client dashboard + audit request submission

| Priority | Task | Owner | Status |
|----------|------|-------|--------|
| 🔴 MUST | AuditPack + AuditRequest models | James | ✅ |
| 🔴 MUST | Seed migration (4 packs with prices) | James | ✅ |
| 🔴 MUST | GET /api/packs/ (public) | James | ✅ |
| 🔴 MUST | CRUD /api/audits/ + full RBAC | James | ✅ |
| 🔴 MUST | PackSelector (4 visual cards) | Tommy | ✅ |
| 🔴 MUST | AuditRequestForm + validation | Tommy | ✅ |
| 🔴 MUST | ClientDashboard (list + status filters) | Tommy | ✅ |
| 🔴 MUST | ConfirmationPage (reference CYB-XXXX-YYYY) | Tommy | ✅ |
| 🟡 SHOULD | StatusBadge (color-coded by status) | Tommy | ✅ |
| 🟡 SHOULD | AdminDashboard (global view) | Tommy | ✅ |
| 🟡 SHOULD | AdminRequestDetailPage (edit status + notes) | Tommy | ✅ |
| 🟢 COULD | DRF server-side pagination | James | ✅ |

**Velocity:** 12/12 completed

**Dependencies:** AuditPack must exist before AuditRequest ; backend RBAC before admin dashboard

---

### Sprint 3 — Core Features 2 + Tests (S5 · 25 May–1 Jun)

**Duration:** 1 week | **Goal:** PDF, training, real API connection, tests

| Priority | Task | Owner | Status |
|----------|------|-------|--------|
| 🔴 MUST | AuditReport + TrainingModule/Progress + Notification models | James | ✅ |
| 🔴 MUST | POST .../generate-report/ → Celery task | James | ✅ |
| 🔴 MUST | WeasyPrint HTML report template | James | ✅ |
| 🔴 MUST | Replace mock localStorage → real axios services | Tommy | ✅ |
| 🔴 MUST | GET/POST /api/training/modules/ + start + complete | James | ✅ |
| 🔴 MUST | Test infrastructure (pytest.ini + vitest.config) | Tommy/James | ✅ |
| 🟡 SHOULD | Backend unit tests ≥80% coverage | James | ✅ |
| 🟡 SHOULD | Frontend unit tests (validators, components) | Tommy | ✅ |
| 🟡 SHOULD | GitHub Actions CI/CD | Tommy | ✅ |
| 🟢 COULD | ReportViewerPage (JSON report display + grade) | Tommy | ✅ |
| 🟢 COULD | TrainingPage with visual progress | Tommy | ✅ |
| ⚪ WON'T | E2E Cypress (planned S7) | — | 🔜 S7 |

**Velocity:** 11/12 completed (Cypress postponed)

**Dependencies:** AuditReport depends on AuditRequest ; Celery requires Redis ; backend tests require all models

---

### Sprint 4 — Advanced Tests + Deployment (S6-S10 · Jun 2026)

| Priority | Task | Owner | Status |
|----------|------|-------|--------|
| 🔴 MUST | Advanced Vitest tests — dataService, DashboardPage, TrainingPage, StatCard | Tommy | ✅ |
| 🔴 MUST | Railway backend deployment | James | ✅ Deployed |
| 🔴 MUST | Vercel frontend deployment | Tommy | ✅ Deployed |
| 🟡 SHOULD | Responsive design — mobile + tablet | Tommy | ✅ |
| 🟡 SHOULD | EmailJS contact form | Tommy | ✅ |
| 🟡 SHOULD | CI/CD pipeline documentation | Tommy | 🔄 In Progress |
| 🟡 SHOULD | All technical Word documents | Tommy | ✅ |

**Velocity:** 6/7 completed (CI/CD doc in progress)

---

## 4. Development Execution — Task 1

### Git Flow Branch Strategy

```
main        ──●────────────────────────────────────●── (stable releases)
              │                                    │
develop     ──●──●──●──●──●──●──●──●──●──●──●────●──── (continuous integration)
                │     │     │     │
feature/auth    ●─────┘     │     │     (S3: JWT, register, login)
feature/audit-core          ●─────┘     (S4: packs, requests, dashboard)
feature/pdf-training              ●────  (S5: PDF, training, tests)
```

**Branch naming conventions:**
- `feature/<description>` — new feature
- `fix/<description>` — bug fix
- `hotfix/<description>` — urgent fix on `main`
- `release/<version>` — release preparation

### Commit Convention (Conventional Commits)

```
feat(auth): add JWT token blacklist on logout
fix(dashboard): correct pagination for archived requests
docs(readme): add stage-4 sprint planning and DB schema
test(accounts): add login integration tests with inactive user case
chore(ci): add GitHub Actions workflow with coverage threshold
refactor(api): extract RBAC permissions to dedicated module
```

### Pull Request Process

1. Create `feature/name` from `develop`
2. Develop + atomic + conventional commits
3. Local tests green (`pytest` + `npm test`)
4. Open PR with clear title and description
5. Cross-review (Tommy reviews backend, James reviews frontend)
6. CI GitHub Actions must be green (lint + tests + build)
7. Squash merge to `develop`

### Code Standards

**Backend:**
- `ruff` — linter (replaces flake8 + isort)
- `black` — auto-formatting (120 chars/line)
- Docstrings on all classes and public functions
- Type hints on service functions

**Frontend:**
- `eslint` + react-hooks + react-refresh plugin
- PascalCase components, camelCase hooks, camelCase services
- Async functions marked `async/await` (no chained `.then()`)

---

## 5. Progress Tracking — Task 2

### Velocity Metrics

| Sprint | Planned | Completed | Velocity | Open Bugs | Resolved |
|--------|---------|-----------|----------|-----------|---------|
| S3 (Auth) | 9 | 9 | 9 pts | 2 | 2 |
| S4 (Core 1) | 12 | 12 | 12 pts | 3 | 3 |
| S5 (Core 2) | 12 | 11 | 11 pts | 1 | 1 |
| S6-S10 (Deploy+Tests) | 7 | 6 | 6 pts | 0 | 0 |
| **Total** | **40** | **38** | **95%** | **0** | **6** |

### Daily Stand-up Format

```
Each morning (async Slack/Discord message):

✅ Yesterday : [what was completed]
🚧 Today     : [what is in progress]
⚠️  Blockers  : [what is blocking, or "None"]
```

**S5 Example (Tommy):**
```
✅ Yesterday : api.js with automatic JWT refresh interceptor
🚧 Today     : Update AuthContext async + LoginForm
⚠️  Blockers  : None
```

### Quality Indicators

- **Backend test coverage:** ≥ 80% (enforced by CI)
- **Frontend test coverage:** ~75% (validators, key components, hooks, services)
- **Bug resolution rate:** 100% (0 open bugs at end of sprint)
- **CI pipeline:** green on every merge to `develop`
- **Deployments:** Railway (backend) + Vercel (frontend) live since May 2026

---

## 6. Reviews & Retrospectives — Task 3

### Sprint 1 Review — Authentication (17 May)

**Demo performed:**
- New client account registration (validation: 10 chars, uppercase, lowercase, digit, special)
- Login → JWT stored → redirect `/dashboard`
- Access attempt to `/audit/new` without login → auto redirect `/login`
- Access attempt to `/admin/request/xxx` with client account → redirect `/`

**Feedback:**
- ✅ Clear forms, precise error messages
- ✅ Post-login redirect by role works correctly
- ⚠️ Connected to mock localStorage — real backend JWT to wire up in S5

### Sprint 1 Retrospective

| ✅ What went well | ⚠️ Difficulties | 🔧 Actions S2 |
|------------------|----------------|---------------|
| Smooth tommy ↔ james communication | Front mock / API contract synchronization | Define JSON interfaces before coding |
| Well-decoupled reusable components | CORS config in development | Document each endpoint as it is created |
| Tailwind: visual consistency without friction | Async error handling on frontend | Create error wrappers in api.js |

---

### Sprint 2 Review — Dashboard & Audit (24 May)

**Demo performed:**
- Pack selection → submission → reference `CYB-2026-0001` generated
- Client dashboard: list filtered by status, colored badge
- Admin dashboard: global view of all requests, status modification
- Live RBAC test: client A cannot see client B's request (Postman)

**Feedback:**
- ✅ UX < 3 min to submit a request (persona goal achieved)
- ✅ Consistent backend + frontend RBAC
- ⚠️ PDF missing — to be implemented in S5

### Sprint 2 Retrospective

| ✅ What went well | ⚠️ Difficulties | 🔧 Actions S3 |
|------------------|----------------|---------------|
| Clear backend MVC architecture | Nested serialization (pack in request) | Tests with factory-boy for complex fixtures |
| Complete admin dashboard in one week | Auto-generated reference in multi-thread | select_for_update() for atomicity |
| Exhaustive RBAC coverage on backend | No frontend tests in S4 | Start Vitest from the beginning of S5 |

---

### Sprint 3 Review — PDF + Tests (1 Jun)

**Demo performed:**
- Admin triggers PDF generation → `202 Accepted` → report available
- Client views report: score 72/100, grade B, vulnerability table
- Training page: list of published modules + visual progress
- CI GitHub Actions: green pipeline on `develop` branch
- Test results: 21 backend accounts tests + 21 validator frontend tests

### Sprint 4 Review — Deployment + Advanced Tests (Jun 2026)

**Demo performed:**
- Railway backend live: full Django REST API accessible via HTTPS
- Vercel frontend live: React app deployed and accessible
- 56 Vitest tests passing across 8 test files
- Responsive design validated on mobile, tablet, desktop
- EmailJS contact form functional

---

## 7. Integration Tests & QA — Task 4

### Test Pyramid

```
              ╱╲
             ╱E2E╲         5%  — Cypress (planned S7)
            ╱──────╲
           ╱Integration╲   20% — DRF APIClient (pytest)
          ╱────────────╲
         ╱  Unit Tests   ╲  75% — pytest (backend) + Vitest (frontend)
        ╱────────────────╲
```

---

### Backend Tests (pytest + pytest-django)

**Configuration:** `pytest.ini` with `--cov-fail-under=80`

| App | Tests | Scenarios covered |
|-----|-------|------------------|
| `accounts` | **21** | TestUserModel (8): model fields, role, UUID · TestRegisterView (3): success, duplicate email, password mismatch · TestLoginView (3): success, wrong password, inactive account · TestMeView (3): GET/PATCH/DELETE /users/me/ · TestLogoutView (2): success, invalid token · TestChangePasswordView (2): success, wrong current password |
| `audits` | 17 | Model (auto reference, uniqueness), public packs, CRUD with client/admin RBAC, soft-delete archive |
| `reports` | 8 | Grade (A/B+/B/C/F), GET report (owner ✅, other client ❌, admin ✅), generate-report (admin ✅, client ❌) |
| `training` | 9 | Published vs unpublished modules, detail + MD content, idempotent start, complete |
| **TOTAL** | **55** | |

**Run tests:**
```bash
cd cyberaudit/backend
pytest --cov=apps --cov-report=term-missing -v
```

**Automated RBAC security tests:**
```
✅ [Client]   PATCH /api/audits/{id}/          → 403 Forbidden
✅ [Admin]    PATCH /api/audits/{id}/          → 200 OK
✅ [Client A] GET /api/audits/{id-B}/          → 404 Not Found
✅ [Admin]    GET  /api/audits/{id-B}/         → 200 OK
✅ [Client]   POST .../generate-report/        → 403 Forbidden
✅ [Anon]     GET  /api/audits/                → 401 Unauthorized
```

---

### Frontend Tests (Vitest + Testing Library)

**Configuration:** `vitest.config.js` with jsdom environment, globals:true, jest-dom setup

| File | Module tested | Tests | Scenarios |
|------|--------------|-------|-----------|
| `validators.test.js` | `validators.js` | **21** | isRequired (3), isEmailValid (4), isPasswordStrong (5), validateLoginForm (5), validateRegisterForm (4) |
| `StatusBadge.test.jsx` | `StatusBadge.jsx` | **8** | 4 statuses, unknown status, CSS color classes |
| `useAuth.test.jsx` | `useAuth.js` | **5** | Context provided, hasRole, error outside Provider, token state |
| `ProtectedRoute.test.jsx` | `ProtectedRoute.jsx` | **6** | Authorized access, redirect /login (unauth), redirect / (wrong role), loading state |
| `dataService.test.js` | `dataService.js` | **7** | getPackages, getPackageByCode (found/not found), getAllRequests (plain/paginated), createRequest (success/error) |
| `DashboardPage.test.jsx` | `DashboardPage.jsx` | **2** | Client role → ClientDashboard, Admin role → AdminDashboard |
| `TrainingPage.test.jsx` | `TrainingPage.jsx` | **4** | Async module loading, status display (to_start/in_progress/completed), userEvent click → updateModuleStatus |
| `StatCard.test.jsx` | `StatCard.jsx` | **3** | label prop, numeric value, value=0 edge case |
| **TOTAL** | | **56** | |

**Run tests:**
```bash
cd cyberaudit/frontend
npm test -- --run --coverage
```

---

### Manual Postman Tests — Key Scenarios

```
# ── Authentication ────────────────────────────────────────────────
POST /api/auth/register/         → 201 { user, access, refresh }
POST /api/auth/login/            → 200 { user, access, refresh }
POST /api/auth/login/ [bad pwd]  → 400 { non_field_errors }
POST /api/auth/logout/           → 204 No Content
POST /api/auth/refresh/          → 200 { access }

# ── Request lifecycle ─────────────────────────────────────────────
POST /api/audits/                → 201 status=pending
PATCH /api/audits/{id}/          → 200 status=in_progress [admin]
POST /api/audits/{id}/generate-report/ → 202 Accepted [admin]
GET  /api/audits/{id}/report/    → 200 { score, grade, findings }
DELETE /api/audits/{id}/         → 204 → status=archived [admin]

# ── Training ──────────────────────────────────────────────────────
GET  /api/training/modules/             → 200 [published list]
POST /api/training/modules/1/start/     → 200
POST /api/training/modules/1/complete/  → 200
GET  /api/training/modules/1/           → 200 { content_md }
```

---

### CI/CD Pipeline — GitHub Actions

File: `.github/workflows/ci.yml`

```yaml
on: push/PR → main and develop

jobs:
  backend:
    - ruff check apps/ config/      # PEP8 lint + imports
    - black --check apps/ config/   # uniform formatting
    - pytest --cov-fail-under=80    # tests + coverage ≥80%

  frontend:
    - eslint .                      # React + hooks lint
    - vitest run --coverage         # unit tests (56 passing)
    - vite build                    # production build
```

---

## 8. Deliverables — Task 5

### Summary

| Total | Done | Deployed | In Progress |
|-------|------|----------|-------------|
| **57** | **54** | **2** | **1** |

### Complete Deliverables Table

| # | Deliverable | Category | Status | Date | Resource |
|---|------------|----------|--------|------|----------|
| 01 | Team Formation | Setup | ✅ Done | Jan 2026 | [Stages/README.md](../README.md) |
| 02 | MVP Scope Definition | Setup | ✅ Done | Jan 2026 | [Stages/README.md](../README.md) |
| 03 | Project Planning | Planning | ✅ Done | Feb 2026 | [Stages/README.md](../README.md) |
| 04 | GitHub Repository Setup | Setup | ✅ Done | Feb 2026 | [github.com/Tommy-JOUHANS/portfolio](https://github.com/Tommy-JOUHANS/portfolio) |
| 05 | Technical Architecture Document | Design | ✅ Done | Mar 2026 | [cyberaudit/](../../cyberaudit/) |
| 06 | Data Model Design | Design | ✅ Done | Mar 2026 | [backend/apps/](../../cyberaudit/backend/) |
| 07 | Custom User Model | Backend | ✅ Done | Apr 2026 | [accounts/models.py](../../cyberaudit/backend/apps/accounts/models.py) |
| 08 | JWT Authentication (simplejwt) | Backend | ✅ Done | Apr 2026 | [accounts/views.py](../../cyberaudit/backend/apps/accounts/views.py) |
| 09 | Register / Login / Logout API | Backend | ✅ Done | Apr 2026 | [accounts/views.py](../../cyberaudit/backend/apps/accounts/views.py) |
| 10 | Me (Profile) Endpoint | Backend | ✅ Done | Apr 2026 | [accounts/views.py](../../cyberaudit/backend/apps/accounts/views.py) |
| 11 | Change Password Endpoint | Backend | ✅ Done | Apr 2026 | [accounts/views.py](../../cyberaudit/backend/apps/accounts/views.py) |
| 12 | Pack Model | Backend | ✅ Done | Apr 2026 | [apps/packs/](../../cyberaudit/backend/apps/packs/) |
| 13 | Pack CRUD API | Backend | ✅ Done | Apr 2026 | [apps/packs/](../../cyberaudit/backend/apps/packs/) |
| 14 | Request Model | Backend | ✅ Done | Apr 2026 | [apps/requests/](../../cyberaudit/backend/apps/requests/) |
| 15 | Request CRUD API | Backend | ✅ Done | May 2026 | [apps/requests/](../../cyberaudit/backend/apps/requests/) |
| 16 | Training Module Model | Backend | ✅ Done | May 2026 | [apps/training/](../../cyberaudit/backend/apps/training/) |
| 17 | Training Module API | Backend | ✅ Done | May 2026 | [apps/training/](../../cyberaudit/backend/apps/training/) |
| 18 | Admin User Management | Backend | ✅ Done | May 2026 | [backend/](../../cyberaudit/backend/) |
| 19 | CORS Configuration | Backend | ✅ Done | May 2026 | [backend/](../../cyberaudit/backend/) |
| 20 | Mock Data Import Script | Backend | ✅ Done | May 2026 | [backend/](../../cyberaudit/backend/) |
| 21 | React + Vite Project Setup | Frontend | ✅ Done | Apr 2026 | [frontend/package.json](../../cyberaudit/frontend/package.json) |
| 22 | Tailwind CSS v4 Configuration | Frontend | ✅ Done | Apr 2026 | [frontend/src/](../../cyberaudit/frontend/src/) |
| 23 | React Router v7 Setup | Frontend | ✅ Done | Apr 2026 | [frontend/src/](../../cyberaudit/frontend/src/) |
| 24 | AuthContext — JWT Storage | Frontend | ✅ Done | Apr 2026 | [src/contexts/](../../cyberaudit/frontend/src/contexts/) |
| 25 | Login Page | Frontend | ✅ Done | Apr 2026 | [src/pages/](../../cyberaudit/frontend/src/pages/) |
| 26 | Register Page | Frontend | ✅ Done | Apr 2026 | [src/pages/](../../cyberaudit/frontend/src/pages/) |
| 27 | ProtectedRoute Component | Frontend | ✅ Done | Apr 2026 | [src/components/](../../cyberaudit/frontend/src/components/) |
| 28 | ClientDashboard Page | Frontend | ✅ Done | May 2026 | [src/pages/](../../cyberaudit/frontend/src/pages/) |
| 29 | AdminDashboard Page | Frontend | ✅ Done | May 2026 | [src/pages/](../../cyberaudit/frontend/src/pages/) |
| 30 | TrainingPage — Async Loading & Interactions | Frontend | ✅ Done | May 2026 | [src/pages/](../../cyberaudit/frontend/src/pages/) |
| 31 | StatCard Component | Frontend | ✅ Done | May 2026 | [src/components/](../../cyberaudit/frontend/src/components/) |
| 32 | StatusBadge Component | Frontend | ✅ Done | May 2026 | [src/components/](../../cyberaudit/frontend/src/components/) |
| 33 | Axios API Layer — dataService | Frontend | ✅ Done | May 2026 | [src/services/](../../cyberaudit/frontend/src/services/) |
| 34 | conftest.py + pytest Setup | Tests | ✅ Done | May 2026 | [backend/](../../cyberaudit/backend/) |
| 35 | TestUserModel — 8 tests | Tests | ✅ Done | May 2026 | [accounts/tests.py](../../cyberaudit/backend/apps/accounts/tests.py) |
| 36 | TestRegisterView — 3 tests | Tests | ✅ Done | May 2026 | [accounts/tests.py](../../cyberaudit/backend/apps/accounts/tests.py) |
| 37 | TestLoginView — 3 tests | Tests | ✅ Done | May 2026 | [accounts/tests.py](../../cyberaudit/backend/apps/accounts/tests.py) |
| 38 | TestMeView — 3 tests | Tests | ✅ Done | May 2026 | [accounts/tests.py](../../cyberaudit/backend/apps/accounts/tests.py) |
| 39 | TestLogoutView + TestChangePasswordView — 4 tests | Tests | ✅ Done | May 2026 | [accounts/tests.py](../../cyberaudit/backend/apps/accounts/tests.py) |
| 40 | Vitest + @testing-library/react Setup | Tests | ✅ Done | May 2026 | [frontend/vite.config.js](../../cyberaudit/frontend/vite.config.js) |
| 41 | validators.test.js — 21 tests | Tests | ✅ Done | May 2026 | [\_\_tests\_\_/validators.test.js](../../cyberaudit/frontend/src/__tests__/validators.test.js) |
| 42 | StatusBadge + useAuth + ProtectedRoute — 19 tests | Tests | ✅ Done | Jun 2026 | [\_\_tests\_\_/](../../cyberaudit/frontend/src/__tests__/) |
| 43 | dataService + DashboardPage + TrainingPage + StatCard — 16 tests | Tests | ✅ Done | Jun 2026 | [\_\_tests\_\_/](../../cyberaudit/frontend/src/__tests__/) |
| 44 | GitHub Actions CI/CD Pipeline | DevOps | ✅ Done | May 2026 | [.github/workflows/](../../.github/workflows/) |
| 45 | Railway — Backend Deployment | DevOps | 🚀 Deployed | May 2026 | railway.app |
| 46 | Vercel — Frontend Deployment | DevOps | 🚀 Deployed | May 2026 | vercel.app |
| 47 | CyberAudit_Technical_Architecture.docx | Docs | ✅ Done | Jun 2026 | Local document |
| 48 | CyberAudit_Data_Model.docx | Docs | ✅ Done | Jun 2026 | Local document |
| 49 | CyberAudit_Backend_API.docx | Docs | ✅ Done | Jun 2026 | Local document |
| 50 | CyberAudit_Authentication.docx | Docs | ✅ Done | Jun 2026 | Local document |
| 51 | CyberAudit_Frontend_Components.docx | Docs | ✅ Done | Jun 2026 | Local document |
| 52 | CyberAudit_Frontend_Tests_Vitest.docx | Docs | ✅ Done | Jun 2026 | Local document (40 tests) |
| 53 | CyberAudit_Frontend_Tests_Advanced.docx | Docs | ✅ Done | Jun 2026 | Local document (16 tests) |
| 54 | CyberAudit_Project_Deliverables.docx | Docs | ✅ Done | Jun 2026 | Local document (this table) |
| 55 | CI/CD Pipeline Documentation | Docs | 🔄 In Progress | Jun 2026 | Local document |
| 56 | Weekly Progress Report | Docs | ✅ Done | Jun 2026 | Local document |
| 57 | Oral Presentation Preparation | Docs | ✅ Done | Jun 2026 | Local document |

### Repository Structure

```
portfolio/
├── .github/workflows/ci.yml           ← CI/CD Pipeline (#44)
├── cyberaudit/
│   ├── backend/
│   │   ├── apps/
│   │   │   ├── accounts/              ← User, Auth — 21 tests (#07–#11, #35–#39)
│   │   │   │   ├── models.py
│   │   │   │   ├── serializers.py
│   │   │   │   ├── views.py
│   │   │   │   ├── urls.py
│   │   │   │   └── tests.py
│   │   │   ├── packs/                 ← AuditPack, CRUD API (#12–#13)
│   │   │   ├── requests/              ← AuditRequest, CRUD API (#14–#15)
│   │   │   ├── reports/               ← AuditReport, Celery tasks (#16–#17)
│   │   │   ├── training/              ← Modules, Progress (#16–#17)
│   │   │   └── notifications/         ← Notification model
│   │   ├── config/
│   │   │   ├── settings.py            ← JWT, CORS, Celery, DRF (#19)
│   │   │   ├── urls.py
│   │   │   └── celery.py
│   │   ├── templates/reports/         ← WeasyPrint HTML template
│   │   ├── pytest.ini                 ← Test config (#34)
│   │   └── requirements.txt           ← Django 5.1, DRF 3.17, simplejwt 5.5...
│   └── frontend/
│       ├── src/
│       │   ├── __tests__/             ← 8 Vitest files — 56 tests (#41–#43)
│       │   ├── components/            ← StatusBadge, StatCard, ProtectedRoute (#27,#31,#32)
│       │   ├── contexts/AuthContext.jsx ← JWT global state (#24)
│       │   ├── hooks/useAuth.js
│       │   ├── pages/                 ← Login, Register, Dashboards, Training (#25–#30)
│       │   ├── services/              ← api.js (axios+JWT), authService, dataService (#33)
│       │   └── utils/                 ← validators.js, sanitize.js
│       ├── package.json               ← React 19, Vite 8, Tailwind 4, Vitest 3 (#21)
│       └── vite.config.js             ← Vitest config (#40)
└── Stages/
    ├── Stage-1/ ← MVP scope, personas, SWOT
    ├── Stage-2/ ← Gantt, project planning
    ├── Stage-3/ ← Full technical documentation
    └── Stage-4/ ← This file (sprints, tests, deliverables)
```

---

## 9. Technical Review Preparation — Task 6

### MVP Checklist

- [x] Functional application (frontend connected to Django backend)
- [x] Register / Login / Logout with JWT
- [x] Audit request submission with unique reference
- [x] Client dashboard (own requests + statuses)
- [x] Admin dashboard (all requests + modify + archive)
- [x] Async PDF report generation (Celery + WeasyPrint)
- [x] Training modules with progress tracking
- [x] Full RBAC (frontend + backend)
- [x] Automated tests ≥80% backend coverage
- [x] CI/CD GitHub Actions operational
- [x] Railway backend deployed and accessible
- [x] Vercel frontend deployed and accessible
- [x] 56 Vitest frontend tests passing
- [x] 55 pytest backend tests passing
- [x] Technical documentation (Word documents)

### Technical Questions — Prepared Answers

**Q: Why UUID as primary key for User and AuditRequest?**
UUID v4 prevents resource enumeration (IDOR attack). With integer IDs, an attacker can iterate `/api/audits/1`, `/api/audits/2`... UUIDs are unpredictable and non-sequential.

**Q: How does RBAC work?**
Two layers of defence: (1) Frontend — `ProtectedRoute` checks `user.role` from React context before rendering the page; (2) Backend — DRF permissions `IsAdmin` and `IsAdminOrOwner` verified on each Django view. The JWT token contains `user_id`, the permission fetches the role from the database.

**Q: Why Celery for PDF generation?**
WeasyPrint takes 2–5 seconds per document. Without Celery, the HTTP request would block the Django thread (synchronous server). With Celery, we immediately respond `202 Accepted` and the worker generates the PDF in the background. Redis serves as the broker (persistent message queue).

**Q: How is XSS and SQL injection prevented?**
XSS: DOMPurify (`sanitize.js`) cleans all dynamic content injected into the DOM. SQL injection: Django ORM generates parameterised queries — no string concatenation in queries. Free-text fields (scope_notes, internal_notes) are never rendered as raw HTML.

**Q: How does automatic JWT refresh work?**
The Axios interceptor in `api.js` intercepts `401` responses. It attempts `POST /auth/refresh/` with the refresh token. On success → updates localStorage and replays the original request with the new token. On failure (expired refresh) → `clearTokens()` + redirect `/login`. A queue (`failedQueue`) prevents concurrent refresh storms.

**Q: Explain OneToOne between AuditRequest and AuditReport.**
An audit request can only have one final report. `OneToOneField` creates a UNIQUE constraint in the database. Access is written as `audit_request.report` (raises `RelatedObjectDoesNotExist` if not yet generated, checked via `hasattr(obj, 'report')`).

**Q: How did you collaborate?**
Clear division: Tommy = complete frontend, James = complete backend. API contracts defined together in Stage 3 before coding. Git Flow with cross-reviewed PRs. Daily async stand-ups. The mock localStorage on the frontend allowed Tommy to work independently without waiting for the backend.

**Q: How do you test RBAC security?**
Automated tests: create two clients A and B, attempt to read A's request with B's token → `404`. Attempt PATCH with client token → `403`. These assertions run on every CI push. Complemented by a Postman collection for manual regression testing.

---

## 10. Quick Start Guide

### Prerequisites

- Python 3.11+
- Node.js 20+
- Redis (for Celery): `docker run -p 6379:6379 redis:alpine`

### Backend

```bash
cd cyberaudit/backend

# Virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Dependencies
pip install -r requirements.txt

# Database + initial data (4 packs)
python manage.py migrate

# Admin account
python manage.py createsuperuser

# Development server
python manage.py runserver         # → http://localhost:8000

# Celery worker (separate window, requires Redis)
celery -A config worker -l info

# Tests
pytest --cov=apps -v
```

### Frontend

```bash
cd cyberaudit/frontend

# Dependencies
npm install

# Environment variable
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Development server
npm run dev                        # → http://localhost:5173

# Tests (56 Vitest tests)
npm test -- --run --coverage

# Production build
npm run build
```

### Demo Accounts

After `python manage.py createsuperuser`, create a client account via `/register` or via the Django admin interface at `/admin/`.

| Role | How to create |
|------|--------------|
| Admin | `python manage.py createsuperuser` → admin role automatic |
| Client | `POST /api/auth/register/` or `/register` interface |

### Live Deployments

| Environment | URL | Status |
|-------------|-----|--------|
| Backend API | Railway — `https://*.railway.app/api/` | 🚀 Live |
| Frontend App | Vercel — `https://*.vercel.app` | 🚀 Live |
| GitHub Repo | https://github.com/Tommy-JOUHANS/portfolio | Public |
| Trello Board | https://trello.com/b/LaJVqg9d/ | Active |
