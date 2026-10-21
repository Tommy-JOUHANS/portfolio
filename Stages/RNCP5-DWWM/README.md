# 🛡️ CyberAudit & Solutions
 
**Plateforme web de mise en relation entre PME/TPE et experts en cybersécurité pour la gestion d'audits de vulnérabilité.**
 
Projet portfolio réalisé dans le cadre du **Titre RNCP de Niveau 5 « Développeur Web et Web Mobile »** — Holberton School Dijon, Session 2026.
 
![Statut](https://img.shields.io/badge/statut-d%C3%A9ploy%C3%A9-brightgreen)
![Tests back-end](https://img.shields.io/badge/pytest-74%20tests%20%C2%B7%2091%25%20couverture-10B981)
![Tests front-end](https://img.shields.io/badge/vitest-62%20tests-10B981)
![Licence](https://img.shields.io/badge/licence-portfolio-lightgrey)
 
---
 
## 📋 Sommaire
 
- [Contexte et problématique](#-contexte-et-problématique)
- [Aperçu du projet](#-aperçu-du-projet)
- [Équipe](#-équipe)
- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Architecture](#-architecture)
- [Sécurité](#-sécurité)
- [Accessibilité & performance](#-accessibilité--performance)
- [Tests](#-tests)
- [Installation et lancement](#-installation-et-lancement)
- [Déploiement](#-déploiement)
- [Gestion de projet](#-gestion-de-projet)
- [Ressources du projet](#-ressources-du-projet)
- [Perspectives d'évolution](#-perspectives-dévolution)
---
 
## 🎯 Contexte et problématique
 
Selon le **Panorama de la cybermenace 2023** de l'ANSSI, les **TPE, PME et ETI représentent 34 % des victimes de rançongiciels** portées à la connaissance de l'agence, juste derrière les collectivités territoriales (24 %). Ces structures disposent rarement d'une équipe informatique dédiée, et les solutions de cybersécurité existantes sont conçues pour de grands groupes, avec des coûts et une complexité d'usage inaccessibles à une petite entreprise.
 
**CyberAudit & Solutions** répond à ce constat avec une plateforme simple qui met en relation directe une PME cliente et un prestataire d'audit de cybersécurité. Le projet fait suite à un projet d'entrepreneuriat réalisé avec des étudiants de différentes écoles de Dijon pour l'association **Les Entrep' Bourgogne**.
 
**Persona principale : Marie**, 45 ans, gérante d'un cabinet comptable de 12 personnes à Dijon, sans compétence informatique avancée, récemment ciblée par un hameçonnage. Ce persona a guidé l'ensemble des choix d'ergonomie : parcours de demande en moins de 3 minutes, vocabulaire non technique, rapport vulgarisé.
**Persona secondaire : Karim**, 32 ans, expert en cybersécurité, qui traite les demandes côté administrateur.
 
## 🖥️ Aperçu du projet
 
Le client soumet une demande d'audit en **moins de 3 minutes** parmi 4 formules (Audit, Security, Protection, Premium), suit son avancement à travers 4 statuts (en attente, en cours, terminée, archivée), puis télécharge un **rapport de vulnérabilités vulgarisé au format PDF**, généré automatiquement avec un plan d'action à 30 jours. Côté administrateur, l'expert gère l'ensemble des demandes, rédige les résultats et déclenche la génération du rapport.
 
- 🎥 **Démo vidéo** : https://www.youtube.com/watch?v=jxrV9IZSC70
- 🌐 **Application en ligne** : https://portfolio-kappa-dun-65.vercel.app
- 💻 **Code source** : https://github.com/Tommy-JOUHANS/portfolio
- 🎦 **Présentation orale** : https://www.canva.com/design/DAHMEm5duqU/2z-ZZZnB7evxw7brvz9X0w/edit
## 👥 Équipe
 
Projet réalisé **en binôme** sur **12 semaines (27 avril – 17 juillet 2026)**, méthodologie agile.
 
| Rôle | Personne | Périmètre |
|---|---|---|
| Développeur Front-End | **Tommy JOUHANS** | Maquettage Figma, interfaces, accessibilité, sécurité côté client, déploiement Vercel |
| Développeur Back-End | James ROUSSEL | Modélisation des données, API REST, sécurité côté serveur, déploiement Railway |
 
Les contrats d'interface entre front et back ont été définis conjointement, et chaque pull request est relue par l'autre membre du binôme.
 
## ✨ Fonctionnalités
 
**Côté client (PME)**
- Création de compte avec consentement RGPD/CGU et authentification sécurisée
- Soumission d'une demande d'audit en moins de 3 minutes, 4 formules disponibles
- Suivi du statut de la demande (4 statuts) depuis un tableau de bord avec fil de notifications
- Notifications par e-mail (tâche Celery + EmailJS) à chaque changement de statut
- Téléchargement du rapport de vulnérabilités au format PDF
- Modules de sensibilisation à la cybersécurité (5 modules, suivi de progression) — le contenu détaillé (vidéos, documentation) sera ajouté dans une version ultérieure
**Côté administrateur (expert cybersécurité)**
- Tableau de bord global des demandes, avec compteurs par statut et filtres (statut, formule, date, client)
- Modification du statut, attribution, notes internes
- Édition du rapport (gravité, actif concerné, description, recommandation) et génération du PDF avec score de sécurité
- Envoi de notifications au client
## 🧱 Stack technique
 
| Couche | Technologie | Justification |
|---|---|---|
| Front-end | React 19 + Vite + Tailwind CSS 4 | SPA performante, système de conception rapide à mettre en œuvre |
| Back-end | Django 5.1 + Django REST Framework | Sécurité native (ORM, CSRF/XSS), productivité élevée |
| Base de données | PostgreSQL 15 | SGBD relationnel ACID, index performants, types UUID/JSON |
| Tâches asynchrones | Celery + Redis | Génération PDF et e-mails hors du thread HTTP, file de messages persistante |
| Authentification | SimpleJWT | Authentification stateless, scalable horizontalement |
| Génération PDF | WeasyPrint | Conversion HTML/CSS → PDF |
| E-mails transactionnels | EmailJS | Notifications sans serveur SMTP dédié |
| Hébergement back-end | Railway (Docker) | HTTPS auto, déploiement continu, BDD managée |
| Hébergement front-end | Vercel | CDN mondial, HTTPS auto, déploiement continu |
 
**Décisions techniques structurantes :**
- **ORM Django** plutôt que SQL brut → résistance native aux injections SQL.
- **Clés primaires UUID** plutôt qu'entiers auto-incrémentés → anti-énumération (protection IDOR).
- **Deux réponses HTTP distinctes** : `404` quand un client accède à la ressource d'un autre client (on ne révèle pas son existence), `403` quand un utilisateur légitime tente une action réservée à un rôle supérieur (RBAC).
## 🏗️ Architecture
 
Architecture en couches découplée : client React ↔ API Django REST (JWT) ↔ PostgreSQL / Redis (worker Celery) ↔ EmailJS. Le découplage permet deux déploiements indépendants, un contrôle fin des origines autorisées (CORS) et la mise en cache du front sur un CDN.
 
```
cyberaudit/frontend/src/
├── components/
│   ├── admin/       AdminDashboard
│   ├── audit/       AuditRequestForm, PackSelector
│   ├── auth/        LoginForm, RegisterForm, ProtectedRoute
│   ├── dashboard/   ClientDashboard, StatCard, StatusBadge
│   └── shared/      Header, Sidebar, Footer, ErrorBoundary, Logo
├── context/         AuthContext
├── hooks/           useAuth, useAudits
├── pages/           HomePage, LoginPage, RegisterPage, DashboardPage, ...
├── services/        api.js, authService.js, dataService.js, emailService.js
└── utils/           sanitize.js, validators.js
```
 
**Modèle de données** (7 entités, clés primaires UUID pour les entités métier) : `User`, `AuditPack`, `AuditRequest`, `AuditReport`, `TrainingModule`, `TrainingProgress`, `Notification`. Quatre index : e-mail unique, statut de demande, couple client/date de soumission, unicité demande ↔ rapport.
 
**Flux type — soumission d'une demande d'audit :**
1. Le client remplit le formulaire React (SPA).
2. `POST /api/audits/` avec le JWT dans `Authorization: Bearer`.
3. Validation par sérialiseur DRF, puis persistance via l'ORM.
4. Une tâche Celery (accusé de réception via EmailJS) est mise en file Redis.
5. Réponse `201 Created` avec la référence unique du dossier (`DOSSIER-AAAA-NNNN`, générée de façon atomique avec `select_for_update`).
6. L'administrateur voit la demande apparaître dans son tableau de bord.
## 🔒 Sécurité
 
Traitée comme une exigence transversale (« security by design »).
 
**Front-end**
- Assainissement des contenus utilisateur avec **DOMPurify** (anti-XSS)
- En-têtes HTTP via `vercel.json` : `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`
- Jetons JWT stockés en `sessionStorage`, jamais journalisés ; rafraîchissement automatique sur `401` via un intercepteur Axios
- Routes protégées par rôle (`ProtectedRoute`)
- Validation des entrées côté client (`validators.js`), la validation faisant foi restant côté serveur
**Back-end**
- **JWT** : access token 60 min, refresh token 7 jours avec **rotation** et blacklist du jeton précédent
- Mots de passe hachés en **PBKDF2** (paramétrage par défaut de Django)
- **RBAC** : classes de permission DRF (`IsAdmin`, `IsAdminOrOwner`) sur chaque vue sensible
- **Rate limiting** : 5 requêtes/min/IP sur les points d'entrée sensibles (`django-ratelimit`)
- Aucune requête SQL brute ; chaque requête entrante validée par un sérialiseur DRF
- Secrets uniquement dans les variables d'environnement (`.env.example` fourni, `.env` ignoré par Git)
**Campagne de tests de sécurité manuels (6 scénarios, aucune faille exploitable détectée) :**
 
| Test | Résultat |
|---|---|
| Injection XSS persistante | Contenu assaini, script non exécuté |
| Injection SQL | Requête paramétrée par l'ORM, aucune fuite |
| Force brute (connexion) | Blocage à la 6ᵉ tentative (`429`) |
| Falsification de jeton JWT | Signature invalide → `401` |
| Élévation de privilège (RBAC) | `403 Forbidden` |
| Énumération de ressources (IDOR) | `404 Not Found` |
 
Le **Top 10 OWASP** sert de grille de contrôle avant chaque mise en production.
 
## ♿ Accessibilité & performance
 
**RGAA / WCAG 2.1 niveau AA visé** : contraste ≥ 4,5:1, navigation clavier complète, étiquettes ARIA, structure sémantique, `alt` systématique, champs associés à un `<label>`. Contrôlé par **axe-core** (intégré aux tests Vitest) et par **Lighthouse** (score Accessibilité ≥ 90 exigé en CI).
 
**Budget de performance (Core Web Vitals) :**
 
| Indicateur | Cible |
|---|---|
| LCP | < 2,5 s |
| INP | < 200 ms |
| CLS | < 0,1 |
| TTFB | < 600 ms |
| Poids JS initial | < 200 ko compressé |
| Score Lighthouse Performance | ≥ 85/100 |
 
**Éco-conception** : découpage du code par route (`React.lazy` / `Suspense`), tree-shaking Vite, chargement différé des images, cache HTTP sur le CDN, pagination des listes côté API (20 éléments par défaut), `select_related` / `prefetch_related` pour éviter les requêtes N+1.
 
## ✅ Tests
 
| Suite | Résultat | Détail |
|---|---|---|
| Back-end (pytest) | **74 tests, 91 % de couverture** | accounts, audits, reports, training, notifications |
| Front-end (Vitest + React Testing Library) | **62 tests** (9 fichiers) | validators, sanitize, StatCard, StatusBadge, useAuth, ProtectedRoute, dataService, DashboardPage, TrainingPage |
| Sécurité manuelle | 6 scénarios | XSS, SQLi, force brute, JWT, RBAC, IDOR |
| Jeu d'essai (soumission d'une demande d'audit) | 9 scénarios, 0 écart | nominal, erreurs de validation, JWT absent/expiré, XSS, IDOR, RBAC, force brute |
 
La couverture front-end est volontairement inégale : proche de 100 % sur les modules critiques (validation, anti-XSS, authentification, garde de routes), mais les pages métier les plus complexes (formulaire de demande, tableau de bord administrateur) n'ont pas encore de tests dédiés. Les tests de bout en bout (Cypress) ont été reportés.
 
Exécution locale :
```bash
# Back-end
cd cyberaudit/backend
pytest --cov=apps --cov-report=term-missing -v
 
# Front-end
cd cyberaudit/frontend
npm run test:run
npm run test:coverage
```
 
## ⚙️ Installation et lancement
 
**Prérequis** : Node.js 20, Python 3.12, PostgreSQL, Redis, Docker (optionnel pour l'environnement back-end).
 
```bash
# Cloner le dépôt
git clone https://github.com/Tommy-JOUHANS/portfolio.git
cd portfolio
 
# Back-end
cd cyberaudit/backend
python -m venv .venv
source .venv/bin/activate        # Windows : .venv\Scripts\activate
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env
python manage.py migrate
python manage.py setup_admin
python manage.py runserver
 
# Worker asynchrone (dans un second terminal)
celery -A config worker --loglevel=info
 
# Front-end (dans un troisième terminal)
cd cyberaudit/frontend
npm install
cp .env.example .env
npm run dev
```
 
## 🚀 Déploiement
 
CI/CD via **GitHub Actions** à chaque push sur `main` / `develop`. Le pipeline exécute successivement :
- l'analyse statique (`ruff` et `black` côté back-end, `ESLint` côté front-end) ;
- la suite de tests avec couverture (seuil plancher de non-régression à 40 %, couverture réelle de 91 % côté back-end) ;
- le build et le déploiement automatique en cas de succès.
| Service | Plateforme | Notes |
|---|---|---|
| Front-end | Vercel | Build automatique depuis `main`, en-têtes de sécurité dans `vercel.json` |
| API back-end | Railway (Docker) | `Procfile` : processus `web` (migrations puis Gunicorn) et processus `worker` (Celery) |
| PostgreSQL | Railway | Base de production managée |
| Redis | Railway | Broker Celery |
| E-mails | EmailJS | Notifications transactionnelles |
 
Un point de contrôle `GET /api/health/` vérifie la disponibilité de la base, de Redis et d'EmailJS. Une sauvegarde manuelle de la base (`railway db snapshot create`, rétention de 14 jours) est déclenchée avant chaque mise en production majeure.
 
## 📅 Gestion de projet
 
Méthodologie **agile** inspirée de Scrum : 12 semaines en sprints S1 à S12, avec démonstration et rétrospective à chaque sprint. Priorisation **MoSCoW** des user stories. **95 % de vélocité** (38 points de complexité livrés sur 40 ; les 2 points restants correspondent aux tests Cypress de bout en bout).
 
Outils : GitHub (pull requests obligatoires, revues croisées, commits conventionnels), GitHub Actions (CI), Discord (communication quotidienne), Notion (documentation), Trello (suivi des tâches).
 
## 🔗 Ressources du projet
 
| Ressource | Lien |
|---|---|
| Dépôt de code source | https://github.com/Tommy-JOUHANS/portfolio |
| Application en ligne | https://portfolio-kappa-dun-65.vercel.app |
| Documentation par étape (conception, maquettes, documentation technique, soutenance) | https://github.com/Tommy-JOUHANS/portfolio/tree/main/Stages |
| Vidéo de démonstration | https://www.youtube.com/watch?v=jxrV9IZSC70 |
| Présentation orale (Canva) | https://www.canva.com/design/DAHMEm5duqU/2z-ZZZnB7evxw7brvz9X0w/edit |
 
## 🔮 Perspectives d'évolution
 
- Tableau de bord temps réel par **WebSocket** (remplacement du polling toutes les 30 secondes)
- Score de sécurité assisté par IA à partir du questionnaire d'audit
- Application mobile native (iOS/Android)
- Contenu complet et gamification des modules de sensibilisation
- Authentification déléguée **OAuth2** (Google, LinkedIn)
- Journal d'audit applicatif complet (table `AUDIT_LOG`) pour une traçabilité RGPD renforcée
- Tests de bout en bout et tests front-end sur les pages métier complexes
---
 
*Projet réalisé par **Tommy JOUHANS** (front-end) en binôme avec **James ROUSSEL** (back-end) — Holberton School Dijon, Titre RNCP 5 Développeur Web et Web Mobile, Session 2026.*