 # Stage 4 — Développement et Exécution du MVP

> **CyberAudit & Solutions** · Plateforme de gestion d'audits de cybersécurité pour PME  
> Portfolio Holberton School · Tommy JOUHANS (Front-End) · James (Back-End)  
> Période : S4–S10 (26 mai → 3 juillet 2026)

---

## Table des matières

1. [Architecture de l'application](#1-architecture-de-lapplication)
2. [Schéma de la base de données](#2-schéma-de-la-base-de-données)
3. [Planification des sprints — Tâche 0](#3-planification-des-sprints--tâche-0)
4. [Exécution du développement — Tâche 1](#4-exécution-du-développement--tâche-1)
5. [Suivi des progrès — Tâche 2](#5-suivi-des-progrès--tâche-2)
6. [Revues et rétrospectives — Tâche 3](#6-revues-et-rétrospectives--tâche-3)
7. [Tests d'intégration et QA — Tâche 4](#7-tests-dintégration-et-qa--tâche-4)
8. [Livrables — Tâche 5](#8-livrables--tâche-5)
9. [Préparation à la revue technique — Tâche 6](#9-préparation-à-la-revue-technique--tâche-6)
10. [Guide de démarrage rapide](#10-guide-de-démarrage-rapide)

---

## 1. Architecture de l'application

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Navigateur)                          │
│                                                                     │
│   React 19 + Vite + Tailwind CSS                                    │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│   │ AuthCtx  │  │  Pages   │  │Components│  │   Services       │  │
│   │ (JWT)    │  │ Home     │  │ Dashboard│  │   api.js (axios) │  │
│   │          │  │ Login    │  │ AuditForm│  │   authService.js │  │
│   │          │  │ Dashboard│  │ Training │  │   dataService.js │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS + JWT Bearer
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Django 5.1 + DRF)                      │
│                                                                     │
│   ┌─────────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│   │  accounts   │  │   audits     │  │  training / reports /     │ │
│   │  /api/auth/ │  │  /api/audits/│  │  notifications            │ │
│   │  /api/users/│  │  /api/packs/ │  │                           │ │
│   └─────────────┘  └──────────────┘  └───────────────────────────┘ │
│                                                                     │
│   SimpleJWT · CORS · Permissions RBAC · DRF Pagination             │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  Celery Worker (tâches asynchrones)                          │  │
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

### Diagramme de séquence — Soumission d'une demande d'audit

```
sequenceDiagram
  actor Marie
  participant Front as AuditRequestForm
  participant API as Django /audits
  participant DB as PostgreSQL
  participant Redis
  participant Worker as Celery Worker
  participant SMTP

  Marie->>Front: Choisit pack + scope_notes
  Front->>API: POST /api/audits/ + JWT Bearer
  API->>API: Vérifie JWT + valide données
  API->>DB: INSERT audit_request (status=pending)
  API->>Redis: enqueue send_ack_email(audit_id)
  API-->>Front: 201 Created { reference: "CYB-2026-0001" }
  Front-->>Marie: Redirect /audit/confirmation/CYB-2026-0001
  Worker->>Redis: dequeue tâche
  Worker->>SMTP: Email accusé de réception
  Worker->>DB: UPDATE notification status=sent
  SMTP-->>Marie: Email reçu
```

### Stack technologique

| Couche | Technologie | Version | Justification |
|--------|------------|---------|---------------|
| Frontend | React + Vite | 19 / 8 | SPA réactive, HMR rapide, écosystème riche |
| Styles | Tailwind CSS | 4 | Utility-first, cohérence design, pas de CSS spaghetti |
| Routage | React Router | 7 | Standard SPA, `ProtectedRoute` avec RBAC intégré |
| HTTP | Axios | 1.9 | Intercepteurs JWT, refresh automatique, timeout configurable |
| Backend | Django + DRF | 5.1 / 3.17 | ORM puissant, admin Django intégré, batteries incluses |
| Auth | SimpleJWT | 5.5 | Access 60 min + Refresh 7 j, blacklist sur logout |
| Async | Celery + Redis | 5.6 / 7.4 | Génération PDF et emails non-bloquants |
| PDF | WeasyPrint | 62 | Rendu HTML+CSS → PDF fidèle côté serveur |
| BDD dev | SQLite | — | Léger, zéro configuration, idéal en développement |
| BDD prod | PostgreSQL | — | Robuste, ACID, UUID natif, recherche full-text |
| CI/CD | GitHub Actions | — | Lint + Tests + Build automatiques sur chaque PR |

---

## 2. Schéma de la base de données

```
┌──────────────────────────────────────────────────────────────────────┐
│  USER (accounts_user)                                                │
│  ─────────────────────────────────────────────────────────────────  │
│  id            UUID         PK, default uuid4()                     │
│  email         VARCHAR(254) UNIQUE — identifiant de connexion       │
│  password      VARCHAR      hash PBKDF2 (Django)                   │
│  first_name    VARCHAR(100)                                          │
│  last_name     VARCHAR(100)                                          │
│  role          ENUM         client | admin                          │
│  company_name  VARCHAR(200) nullable (facultatif)                   │
│  created_at    DATETIME     auto_now_add                            │
│  is_active     BOOLEAN      désactivation RGPD (soft delete)       │
│  is_staff      BOOLEAN      accès /admin/ Django                    │
└───────────────┬──────────────────────┬──────────────────────────────┘
                │ 1──N                 │ 1──N
                ▼                     ▼
┌───────────────────────────┐  ┌─────────────────────────────────────┐
│  AUDIT_REQUEST            │  │  NOTIFICATION                       │
│  ─────────────────────    │  │  ──────────────────────────────     │
│  id         UUID  PK      │  │  id          UUID  PK               │
│  reference  VARCHAR UNIQUE│  │  user_id     FK → USER              │
│  client_id  FK → USER     │  │  request_id  FK → AUDIT_REQUEST     │
│  pack_id    FK → PACK     │  │  type        ENUM (3 valeurs)       │
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
│  AUDIT_PACK (4 lignes fixes)     │   │  TRAINING_MODULE             │
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

### Relations clés

| Relation | Type | Description |
|----------|------|-------------|
| `USER` → `AUDIT_REQUEST` | 1→N | Un client peut avoir plusieurs demandes |
| `AUDIT_REQUEST` → `AUDIT_REPORT` | 1→1 | Un seul rapport par demande (OneToOneField) |
| `AUDIT_REQUEST` → `NOTIFICATION` | 1→N | Plusieurs notifications par demande |
| `USER` → `NOTIFICATION` | 1→N | Notifications liées à un utilisateur |
| `USER` ↔ `TRAINING_MODULE` | N→N | Via `TRAINING_PROGRESS` (table pivot) |

---

## 3. Planification des sprints — Tâche 0

### Calendrier global (12 semaines · 27 avril → 19 juillet 2026)

| Sprint | Dates | Livrable principal |
|--------|-------|--------------------|
| S1 | 27 avr | Design & Wireframes |
| S2 | 4 mai | Mise en place des environnements |
| S3 | 11 mai | Auth & JWT ✅ |
| S4 | 18 mai | Core Features 1 — Formulaire + Dashboard Client ✅ |
| **S5** | **25 mai** | **Core Features 2 — PDF + Admin** ← *Sprint courant* |
| S6 | 1 juin | Async Celery + Redis |
| S7–S8 | 8–21 juin | Tests approfondis + corrections |
| S9–S10 | 22 juin–5 juil | Déploiement Vercel + Railway |
| S11–S12 | 6–19 juil | Stabilisation + Présentation finale |

---

### Sprint 1 — Authentification & JWT (S3 · 11–17 mai)

**Durée :** 1 semaine | **Objectif :** Système d'authentification complet avec JWT

| Priorité | Tâche | Responsable | Statut |
|----------|-------|-------------|--------|
| 🔴 MUST | Modèle User custom (UUID, rôle, email-login) | James | ✅ |
| 🔴 MUST | POST /api/auth/register/ + /login/ + /refresh/ | James | ✅ |
| 🔴 MUST | Génération tokens SimpleJWT (access 60min + refresh 7j) | James | ✅ |
| 🔴 MUST | ProtectedRoute + vérification rôle (RBAC) | Tommy | ✅ |
| 🔴 MUST | LoginForm + RegisterForm (validation locale) | Tommy | ✅ |
| 🔴 MUST | AuthContext (état global login/logout/register) | Tommy | ✅ |
| 🟡 SHOULD | Blacklist JWT sur logout | James | ✅ |
| 🟡 SHOULD | Configuration CORS pour Vite | James | ✅ |
| 🟢 COULD | Rate limiting (5 req/min) | James | ✅ |
| ⚪ WON'T | SSO / OAuth2 | — | hors scope |

**Vélocité :** 9/9 tâches prioritaires terminées

**Dépendances :** User model → toutes les autres apps ; AuthContext → toutes les pages protégées

---

### Sprint 2 — Core Features 1 (S4 · 18–24 mai)

**Durée :** 1 semaine | **Objectif :** Dashboard client + soumission de demande

| Priorité | Tâche | Responsable | Statut |
|----------|-------|-------------|--------|
| 🔴 MUST | Modèles AuditPack + AuditRequest | James | ✅ |
| 🔴 MUST | Migration seed (4 packs avec prix) | James | ✅ |
| 🔴 MUST | GET /api/packs/ (public) | James | ✅ |
| 🔴 MUST | CRUD /api/audits/ + RBAC complet | James | ✅ |
| 🔴 MUST | PackSelector (4 cartes visuelles) | Tommy | ✅ |
| 🔴 MUST | AuditRequestForm + validation | Tommy | ✅ |
| 🔴 MUST | ClientDashboard (liste + filtres statuts) | Tommy | ✅ |
| 🔴 MUST | ConfirmationPage (référence CYB-XXXX-YYYY) | Tommy | ✅ |
| 🟡 SHOULD | StatusBadge (code couleur par statut) | Tommy | ✅ |
| 🟡 SHOULD | AdminDashboard (vue globale) | Tommy | ✅ |
| 🟡 SHOULD | AdminRequestDetailPage (modifier statut + notes) | Tommy | ✅ |
| 🟢 COULD | Pagination DRF côté serveur | James | ✅ |

**Vélocité :** 12/12 terminées

**Dépendances :** AuditPack doit exister avant AuditRequest ; RBAC backend avant dashboard admin

---

### Sprint 3 — Core Features 2 + Tests (S5 · 25 mai–1 juin)

**Durée :** 1 semaine | **Objectif :** PDF, formation, connexion API réelle, tests

| Priorité | Tâche | Responsable | Statut |
|----------|-------|-------------|--------|
| 🔴 MUST | Modèles AuditReport + TrainingModule/Progress + Notification | James | ✅ |
| 🔴 MUST | POST .../generate-report/ → Celery task | James | ✅ |
| 🔴 MUST | Template HTML rapport WeasyPrint | James | ✅ |
| 🔴 MUST | Remplacer mock localStorage → services axios réels | Tommy | ✅ |
| 🔴 MUST | GET/POST /api/training/modules/ + start + complete | James | ✅ |
| 🔴 MUST | Infrastructure tests (pytest.ini + vitest.config) | Tommy/James | ✅ |
| 🟡 SHOULD | Tests unitaires backend ≥80% couverture | James | ✅ |
| 🟡 SHOULD | Tests unitaires frontend (validators, components) | Tommy | ✅ |
| 🟡 SHOULD | GitHub Actions CI/CD | Tommy | ✅ |
| 🟢 COULD | ReportViewerPage (affichage rapport JSON + grade) | Tommy | ✅ |
| 🟢 COULD | TrainingPage avec progression visuelle | Tommy | ✅ |
| ⚪ WON'T | E2E Cypress (prévu S7) | — | 🔜 S7 |

**Vélocité :** 11/12 terminées (Cypress reporté)

**Dépendances :** AuditReport dépend d'AuditRequest ; Celery requiert Redis ; tests backend requièrent tous les modèles

---

### Sprints à venir

| Sprint | Dates | Objectifs |
|--------|-------|-----------|
| S6 | 1–7 juin | Finalisation async, notifications email SMTP, tests Celery |
| S7–S8 | 8–21 juin | E2E Cypress, tests sécurité Postman, bugfixes, coverage 80%+ |
| S9–S10 | 22 juin–5 juil | Déploiement Railway + Vercel, variables d'env, HSTS, CSP |

---

## 4. Exécution du développement — Tâche 1

### Stratégie de branches Git Flow

```
main        ──●────────────────────────────────────●── (releases stables)
              │                                    │
develop     ──●──●──●──●──●──●──●──●──●──●──●────●──── (intégration continue)
                │     │     │     │
feature/auth    ●─────┘     │     │     (S3 : JWT, register, login)
feature/audit-core          ●─────┘     (S4 : packs, requests, dashboard)
feature/pdf-training              ●────  (S5 : PDF, formation, tests)
```

**Conventions de nommage :**
- `feature/<description>` — nouvelle fonctionnalité
- `fix/<description>` — correction de bug
- `hotfix/<description>` — correctif urgent sur `main`
- `release/<version>` — préparation d'une release

### Convention de commits (Conventional Commits)

```
feat(auth): add JWT token blacklist on logout
fix(dashboard): correct pagination for archived requests
docs(readme): add stage-4 sprint planning and DB schema
test(accounts): add login integration tests with inactive user case
chore(ci): add GitHub Actions workflow with coverage threshold
refactor(api): extract RBAC permissions to dedicated module
```

### Processus Pull Request

1. Créer `feature/nom` depuis `develop`
2. Développer + commits atomiques + conventionnels
3. Tests locaux verts (`pytest` + `npm test`)
4. Ouvrir une PR avec titre et description clairs
5. Revue croisée (Tommy revoit le backend, James revoit le frontend)
6. CI GitHub Actions doit être vert (lint + tests + build)
7. Merge squash vers `develop`

### Normes de code

**Backend :**
- `ruff` — linter (remplace flake8 + isort)
- `black` — formatage automatique (120 chars/ligne)
- Docstrings en français sur toutes les classes et fonctions publiques
- Type hints sur les fonctions de service

**Frontend :**
- `eslint` + plugin react-hooks + react-refresh
- Commentaires en français (convention du projet)
- Composants PascalCase, hooks camelCase, services camelCase
- Fonctions asynchrones marquées `async/await` (pas de `.then()` chaînés)

---

## 5. Suivi des progrès — Tâche 2

### Métriques de vélocité

| Sprint | Planifiées | Terminées | Vélocité | Bugs ouverts | Bugs résolus |
|--------|-----------|-----------|----------|--------------|--------------|
| S3 (Auth) | 9 | 9 | 9 pts | 2 | 2 |
| S4 (Core 1) | 12 | 12 | 12 pts | 3 | 3 |
| S5 (Core 2) | 12 | 11 | 11 pts | 1 | 1 |
| **Total** | **33** | **32** | **97%** | **6** | **6** |

### Format des stand-ups quotidiens

```
Chaque matin (message async Slack/Discord) :

✅ Hier  : [ce qui a été terminé]
🚧 Aujourd'hui : [ce qui est en cours]
⚠️  Blockers : [ce qui bloque, ou "Aucun"]
```

**Exemple S5 (Tommy) :**
```
✅ Hier : api.js avec intercepteur JWT refresh automatique
🚧 Aujourd'hui : Mise à jour AuthContext async + LoginForm
⚠️ Blockers : Aucun
```

### Indicateurs de qualité

- **Taux de couverture tests backend :** ≥ 80% (enforced par CI)
- **Taux de couverture tests frontend :** ~75% (validators, composants clés)
- **Taux de résolution des bugs :** 100% (0 bug ouvert en fin de sprint)
- **Pipeline CI :** vert sur chaque merge vers `develop`

---

## 6. Revues et rétrospectives — Tâche 3

### Revue Sprint 1 — Authentification (17 mai)

**Démo réalisée :**
- Inscription d'un nouveau compte client (validation 10 chars, maj, min, chiffre, spécial)
- Connexion → JWT stocké → redirect `/dashboard`
- Tentative d'accès `/audit/new` sans connexion → redirect `/login` automatique
- Tentative d'accès `/admin/request/xxx` avec compte client → redirect `/`

**Retours :**
- ✅ Formulaires clairs, messages d'erreur précis
- ✅ Redirect post-login selon le rôle fonctionne
- ⚠️ Connecté au mock localStorage — backend JWT réel à brancher en S5

### Rétrospective Sprint 1

| ✅ Ce qui a bien marché | ⚠️ Difficultés | 🔧 Actions S2 |
|------------------------|----------------|---------------|
| Communication fluide tommy ↔ james | Synchronisation mock front / contrat API | Définir les interfaces JSON avant de coder |
| Composants réutilisables bien découplés | Config CORS en développement | Documenter chaque endpoint dès sa création |
| Tailwind : cohérence visuelle sans friction | Gestion d'erreurs async côté front | Créer des wrappers d'erreur dans api.js |

---

### Revue Sprint 2 — Dashboard & Audit (24 mai)

**Démo réalisée :**
- Sélection d'un pack → soumission → référence `CYB-2026-0001` générée
- Dashboard client : liste filtrée par statut, badge coloré
- Dashboard admin : vue globale toutes demandes, modification statut
- Test RBAC en direct : client A ne voit pas la demande du client B (Postman)

**Retours :**
- ✅ UX < 3 min pour soumettre une demande (objectif persona Marie atteint)
- ✅ RBAC backend + frontend cohérent
- ⚠️ PDF manquant — à implémenter en S5

### Rétrospective Sprint 2

| ✅ Ce qui a bien marché | ⚠️ Difficultés | 🔧 Actions S3 |
|------------------------|----------------|---------------|
| Architecture MVC backend claire | Sérialisation imbriquée (pack dans request) | Tests avec factory-boy pour les fixtures complexes |
| Admin dashboard complet en une semaine | Référence auto-générée en multi-thread | select_for_update() pour atomicité |
| Coverage RBAC exhaustif côté backend | Pas de tests frontend en S4 | Commencer Vitest dès le début de S5 |

---

### Revue Sprint 3 — PDF + Tests (1 juin, en cours)

**Démo prévue :**
- Admin déclenche génération PDF → `202 Accepted` → rapport disponible
- Client consulte le rapport : score 72/100, grade B, tableau des vulnérabilités
- Page de formation : liste des modules publiés + progression visuelle
- CI GitHub Actions : pipeline vert sur la branche `develop`
- Résultats tests : 48 tests backend + 28 tests frontend

---

## 7. Tests d'intégration et QA — Tâche 4

### Pyramide de tests

```
              ╱╲
             ╱E2E╲         5%  — Cypress (prévu S7)
            ╱──────╲
           ╱Intégrat.╲      20% — DRF APIClient (pytest)
          ╱────────────╲
         ╱  Unitaires   ╲    75% — pytest (backend) + Vitest (frontend)
        ╱────────────────╲
```

---

### Tests backend (pytest + pytest-django)

**Configuration :** `pytest.ini` avec `--cov-fail-under=80`

| App | Nb tests | Scénarios couverts |
|-----|----------|--------------------|
| `accounts` | 14 | Register (succès, email dupliqué, passwords différents), Login (succès, mauvais mdp, compte désactivé), GET/PATCH/DELETE /users/me/, changement mdp |
| `audits` | 17 | Modèle (référence auto, unicité), Packs publics, CRUD avec RBAC client/admin, archive soft-delete |
| `reports` | 8 | Grade (A/B+/B/C/F), GET rapport (propriétaire ✅, autre client ❌, admin ✅), generate-report (admin ✅, client ❌) |
| `training` | 9 | Liste modules publiés vs non publiés, détail + contenu MD, start idempotent, complete |
| **TOTAL** | **48** | |

**Lancer les tests :**
```bash
cd cyberaudit/backend
pytest --cov=apps --cov-report=term-missing -v
```

**Tests de sécurité RBAC automatisés :**
```
✅ [Client]  PATCH /api/audits/{id}/  → 403 Forbidden
✅ [Admin]   PATCH /api/audits/{id}/  → 200 OK
✅ [Client A] GET /api/audits/{id-B}/ → 404 Not Found
✅ [Admin]   GET  /api/audits/{id-B}/ → 200 OK
✅ [Client]  POST .../generate-report/ → 403 Forbidden
✅ [Anon]    GET  /api/audits/         → 401 Unauthorized
```

---

### Tests frontend (Vitest + Testing Library)

| Fichier | Module testé | Cas |
|---------|-------------|-----|
| `validators.test.js` | `validators.js` | isRequired, isEmailValid, isPasswordStrong, validateLoginForm, validateRegisterForm | 10 |
| `StatusBadge.test.jsx` | `StatusBadge.jsx` | 4 statuts, statut inconnu, classes CSS de couleur | 8 |
| `ProtectedRoute.test.jsx` | `ProtectedRoute.jsx` | Accès autorisé, redirect /login (non-auth), redirect / (mauvais rôle), état chargement | 6 |
| `useAuth.test.jsx` | `useAuth.js` | Contexte fourni, hasRole, erreur hors Provider | 4 |

**Lancer les tests :**
```bash
cd cyberaudit/frontend
npm test -- --run --coverage
```

---

### Tests manuels Postman — scénarios clés

```
# ── Authentification ──────────────────────────────────────────────
POST /api/auth/register/         → 201 { user, access, refresh }
POST /api/auth/login/            → 200 { user, access, refresh }
POST /api/auth/login/ [bad pwd]  → 400 { non_field_errors }
POST /api/auth/logout/           → 204 No Content
POST /api/auth/refresh/          → 200 { access }

# ── Cycle de vie d'une demande ────────────────────────────────────
POST /api/audits/                → 201 status=pending
PATCH /api/audits/{id}/          → 200 status=in_progress [admin]
POST /api/audits/{id}/generate-report/ → 202 Accepted [admin]
GET  /api/audits/{id}/report/    → 200 { score, grade, findings }
DELETE /api/audits/{id}/         → 204 → status=archived [admin]

# ── Formation ──────────────────────────────────────────────────────
GET  /api/training/modules/      → 200 [liste publiée]
POST /api/training/modules/1/start/    → 200
POST /api/training/modules/1/complete/ → 200
GET  /api/training/modules/1/    → 200 { content_md }
```

---

### Pipeline CI/CD GitHub Actions

Fichier : `.github/workflows/ci.yml`

```yaml
on: push/PR → main et develop

jobs:
  backend:
    - ruff check apps/ config/      # lint PEP8 + imports
    - black --check apps/ config/   # format uniforme
    - pytest --cov-fail-under=80    # tests + coverage ≥80%

  frontend:
    - eslint .                      # lint React + hooks
    - vitest run --coverage         # tests unitaires
    - vite build                    # build de production
```

---

## 8. Livrables — Tâche 5

| Livrable | Lien / Localisation |
|----------|---------------------|
| 🔗 Dépôt GitHub | https://github.com/Tommy-JOUHANS/portfolio |
| 🌿 Branche principale | `main` |
| 🌿 Branche développement | `develop` |
| 📋 Tableau Trello | https://trello.com/b/LaJVqg9d/portfolio-cyberaudit-solutions-sme-audit-management-platform |
| 🧪 CI GitHub Actions | `.github/workflows/ci.yml` |
| 📊 Couverture backend | `cyberaudit/backend/coverage.xml` (généré par CI) |
| 📊 Couverture frontend | `cyberaudit/frontend/coverage/lcov.info` (généré par CI) |
| 📄 Documentation technique | `portfolio/Stages/Stage-3/` |
| 📄 Cette documentation | `portfolio/Stages/Stage-4/README.md` |

### Structure du dépôt

```
portfolio/
├── .github/workflows/ci.yml           ← Pipeline CI/CD
├── cyberaudit/
│   ├── backend/
│   │   ├── apps/
│   │   │   ├── accounts/              ← User, Auth, tests (14)
│   │   │   │   ├── models.py
│   │   │   │   ├── serializers.py
│   │   │   │   ├── views.py
│   │   │   │   ├── urls.py
│   │   │   │   └── tests.py
│   │   │   ├── audits/                ← AuditPack, AuditRequest, tests (17)
│   │   │   ├── reports/               ← AuditReport, Celery tasks, tests (8)
│   │   │   ├── training/              ← Modules, Progress, tests (9)
│   │   │   └── notifications/         ← Notification model
│   │   ├── config/
│   │   │   ├── settings.py            ← JWT, CORS, Celery, DRF
│   │   │   ├── urls.py
│   │   │   └── celery.py
│   │   ├── templates/reports/         ← Template HTML pour WeasyPrint
│   │   ├── pytest.ini
│   │   └── requirements.txt
│   └── frontend/
│       ├── src/
│       │   ├── __tests__/             ← 4 fichiers Vitest (28 tests)
│       │   ├── components/            ← auth, dashboard, audit, shared
│       │   ├── context/AuthContext.jsx
│       │   ├── hooks/useAuth.js
│       │   ├── pages/                 ← 10 pages
│       │   ├── services/              ← api.js (axios+JWT), authService, dataService
│       │   └── utils/                 ← validators.js, sanitize.js
│       ├── package.json               ← axios, dompurify, vitest
│       └── vite.config.js             ← config Vitest intégrée
└── Stages/
    ├── Stage-1/ ← MVP, personas, SWOT
    ├── Stage-2/ ← Gantt
    ├── Stage-3/ ← Documentation technique complète
    └── Stage-4/ ← Ce fichier (sprints, tests, livrables)
```

---

## 9. Préparation à la revue technique — Tâche 6

### Checklist MVP

- [x] Application fonctionnelle (frontend connecté au backend Django)
- [x] Inscription / Connexion / Logout avec JWT
- [x] Soumission de demandes d'audit avec référence unique
- [x] Dashboard client (ses demandes + statuts)
- [x] Dashboard admin (toutes demandes + modification + archivage)
- [x] Génération asynchrone de rapport PDF (Celery + WeasyPrint)
- [x] Modules de formation avec suivi de progression
- [x] RBAC complet (frontend + backend)
- [x] Tests automatisés ≥80% couverture backend
- [x] CI/CD GitHub Actions opérationnel
- [x] README avec architecture et schéma BDD

### Questions techniques — réponses préparées

**Q : Pourquoi UUID comme clé primaire pour User et AuditRequest ?**  
UUID v4 évite l'énumération de ressources (attaque IDOR). Avec des IDs entiers, un attaquant peut itérer `/api/audits/1`, `/api/audits/2`... Les UUID sont non-prévisibles et non-séquentiels.

**Q : Comment fonctionne le RBAC ?**  
Deux niveaux de défense : (1) Frontend — `ProtectedRoute` vérifie `user.role` depuis le contexte React avant de rendre la page ; (2) Backend — permissions DRF `IsAdmin` et `IsAdminOrOwner` vérifiées sur chaque vue Django. Le token JWT contient `user_id`, la permission récupère le rôle depuis la base.

**Q : Pourquoi Celery pour la génération PDF ?**  
WeasyPrint prend 2–5 secondes par document. Sans Celery, la requête HTTP bloquerait le thread Django (serveur synchrone). Avec Celery, on répond immédiatement `202 Accepted` et le worker génère le PDF en arrière-plan. Redis sert de broker (file de messages persistante).

**Q : Comment est sécurisé contre XSS et injection SQL ?**  
XSS : DOMPurify (`sanitize.js`) nettoie tout contenu dynamique injecté dans le DOM. Injection SQL : L'ORM Django génère des requêtes paramétrées — aucune concaténation de chaînes dans les requêtes. Les champs libres (scope_notes, internal_notes) ne sont jamais rendus comme HTML brut.

**Q : Comment fonctionne le refresh automatique du token JWT ?**  
L'intercepteur Axios dans `api.js` intercepte les réponses `401`. Il tente `POST /auth/refresh/` avec le refresh token. Si succès → met à jour le localStorage et relance la requête originale avec le nouveau token. Si échec (refresh expiré) → `clearTokens()` + redirect `/login`. Une file (`failedQueue`) évite les rafraîchissements concurrents.

**Q : Expliquez OneToOne entre AuditRequest et AuditReport.**  
Une demande d'audit ne peut avoir qu'un seul rapport final. `OneToOneField` crée une contrainte UNIQUE en base de données. L'accès s'écrit `audit_request.report` (lève `RelatedObjectDoesNotExist` si pas encore généré, testé par `hasattr(obj, 'report')`).

**Q : Comment avez-vous collaboré ?**  
Division claire : Tommy = frontend complet, James = backend complet. Contrats API définis ensemble en Stage 3 avant de coder. Git Flow avec PR croisées. Stand-ups async quotidiens. Le mock localStorage côté frontend a permis à Tommy de travailler sans attendre le backend.

**Q : Comment testez-vous la sécurité RBAC ?**  
Tests automatisés : création de deux clients A et B, tentative de lecture de la demande de A avec le token de B → `404`. Tentative de PATCH avec token client → `403`. Ces assertions tournent à chaque push CI. En complément, collection Postman pour les tests manuels de régression.

---

## 10. Guide de démarrage rapide

### Prérequis

- Python 3.11+
- Node.js 20+
- Redis (pour Celery) : `docker run -p 6379:6379 redis:alpine`

### Backend

```bash
cd cyberaudit/backend

# Environnement virtuel
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Dépendances
pip install -r requirements.txt

# Base de données + données initiales (4 packs)
python manage.py migrate

# Compte administrateur
python manage.py createsuperuser

# Serveur de développement
python manage.py runserver         # → http://localhost:8000

# Worker Celery (fenêtre séparée, nécessite Redis)
celery -A config worker -l info

# Tests
pytest --cov=apps -v
```

### Frontend

```bash
cd cyberaudit/frontend

# Dépendances
npm install

# Variable d'environnement
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Serveur de développement
npm run dev                        # → http://localhost:5173

# Tests
npm test -- --run --coverage

# Build production
npm run build
```

### Comptes de démonstration

Après `python manage.py createsuperuser`, créer un compte client via `/register` ou via l'interface admin Django `/admin/`.

| Rôle | Comment créer |
|------|---------------|
| Admin | `python manage.py createsuperuser` → rôle admin automatique |
| Client | `POST /api/auth/register/` ou interface `/register` |
