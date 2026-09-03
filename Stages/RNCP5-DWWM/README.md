# 🛡️ CyberAudit & Solutions
 
**Plateforme web de mise en relation entre PME/TPE et experts en cybersécurité pour la gestion d'audits de vulnérabilité.**
 
Projet portfolio réalisé dans le cadre du **Titre RNCP de Niveau 5 « Développeur Web et Web Mobile »** — Holberton School Dijon, Session 2026.
 
![Statut](https://img.shields.io/badge/statut-d%C3%A9ploy%C3%A9-brightgreen)
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
 
Selon le rapport **« Panorama de la cybermenace »** de l'ANSSI (2023), **45 % des PME et TPE françaises** ne disposent d'aucune équipe informatique interne, tout en restant exposées à des cybermenaces croissantes (rançongiciels, hameçonnage, fuites de données). Les solutions de cybersécurité existantes sont majoritairement conçues pour de grands groupes, avec des coûts et une complexité d'usage inaccessibles à une petite structure.
 
**CyberAudit & Solutions** répond à ce constat en proposant une plateforme simple qui met en relation directe une PME cliente avec un prestataire d'audit de cybersécurité.
 
**Persona principale : Marie**, 45 ans, gérante d'un cabinet comptable de 12 personnes à Dijon, sans compétence informatique avancée, récemment ciblée par un hameçonnage. C'est ce persona qui a guidé l'ensemble des choix d'ergonomie du produit.
 
## 🖥️ Aperçu du projet
 
Le client soumet une demande d'audit en **moins de 3 minutes** parmi 4 formules (Audit, Security, Protection, Premium), suit son avancement à travers 4 statuts (en attente, en cours, terminée, archivée), puis reçoit un **rapport de vulnérabilités vulgarisé au format PDF**, généré automatiquement et accompagné d'un plan d'action à 30 jours. Côté administrateur, un expert en cybersécurité gère l'ensemble des demandes et déclenche la génération des rapports.
 
- 🎥 **Démo vidéo** : https://www.youtube.com/watch?v=jxrV9IZSC70
- 🌐 **Application en ligne** : voir [Ressources du projet CyberAudit & Solution](https://portfolio-kappa-dun-65.vercel.app/)
- 💻 **Code source** : https://github.com/Tommy-JOUHANS/portfolio
- 🎦 **Presentation Oral** : https://www.canva.com/design/DAHMEm5duqU/2z-ZZZnB7evxw7brvz9X0w/edit

## 👥 Équipe
 
Projet réalisé **en binôme** sur 12 semaines (27 avril – 17 juillet 2026), méthodologie agile.
 
| Rôle | Personne | Périmètre |
|---|---|---|
| Développeur Front-End | **Tommy JOUHANS** | Maquettage, interfaces, accessibilité, sécurité côté client, déploiement Vercel |
| Développeur Back-End | James ROUSSEL | Modélisation des données, API REST, sécurité côté serveur, déploiement Railway |
 
## ✨ Fonctionnalités
 
**Côté client (PME)**
- Création de compte et authentification sécurisée
- Soumission d'une demande d'audit en 3 étapes (< 3 min), 4 formules disponibles
- Suivi en temps réel du statut de la demande (4 statuts)
- Notifications par e-mail à chaque changement de statut
- Téléchargement du rapport de vulnérabilités au format PDF
- Modules de sensibilisation à la cybersécurité (hameçonnage, MFA, sauvegarde)
**Côté administrateur (expert cybersécurité)**
- Tableau de bord global des demandes, filtrable par statut/formule
- Modification du statut d'une demande, notes internes
- Génération automatique du rapport PDF (score de sécurité, vulnérabilités, plan d'action)
- Envoi de notifications au client
## 🧱 Stack technique
 
| Couche | Technologie | Justification |
|---|---|---|
| Front-end | React 19 + Vite + Tailwind CSS 4 | SPA performante, design system rapide à mettre en œuvre |
| Back-end | Django 5.1 + Django REST Framework | Sécurité native (ORM, CSRF/XSS), productivité élevée |
| Base de données | PostgreSQL 15 | SGBD relationnel ACID, index performants, types UUID/JSON |
| Tâches asynchrones | Celery + Redis | Génération PDF hors du thread HTTP, file de messages persistante |
| Authentification | SimpleJWT | Authentification stateless, scalable horizontalement |
| Génération PDF | WeasyPrint | Conversion HTML/CSS → PDF |
| Hébergement back-end | Railway | HTTPS auto, déploiement continu, BDD managée |
| Hébergement front-end | Vercel | CDN mondial, HTTPS Let's Encrypt auto, déploiement continu |
 
**Décisions techniques structurantes :**
- ORM Django (plutôt que SQL brut) → résistance native aux injections SQL
- Clés primaires **UUID** (plutôt qu'entiers auto-incrémentés) → anti-énumération (protection IDOR)
- Retour **404** (plutôt que 403) sur les routes admin non autorisées → ne révèle pas l'existence de la ressource
## 🏗️ Architecture
 
Architecture en couches découplée : client React ↔ API Django REST (JWT) ↔ PostgreSQL / Redis (Celery worker) ↔ services externes (e-mail transactionnel).
 
```
src/
├── components/
│   ├── auth/        LoginForm, RegisterForm, ProtectedRoute
│   ├── dashboard/   ClientDashboard, AdminDashboard, StatusBadge, StatCard
│   ├── audit/       AuditRequestForm, PackSelector, AuditDetailView
│   ├── training/    ModuleList, ModuleViewer
│   └── shared/      Header, Sidebar, Button, ErrorBoundary
├── pages/           HomePage, LoginPage, RegisterPage, DashboardPage, ...
├── hooks/           useAuth, useAudits, useApi
├── services/        api.js, authService.js, dataService.js
└── utils/           sanitize.js, validators.js
```
 
**Modèle de données** (7 entités) : `User`, `AuditPack`, `AuditRequest`, `AuditReport`, `TrainingModule`, `TrainingProgress`, `Notification`.
 
**Flux type — soumission d'une demande d'audit :**
1. Le client remplit le formulaire React (SPA)
2. `POST /api/audits/` avec JWT dans `Authorization: Bearer`
3. Validation par sérialiseur DRF puis persistance via l'ORM
4. Tâche Celery asynchrone (courriel d'accusé de réception) mise en file Redis
5. Réponse `201 Created` avec référence unique de la demande
6. L'administrateur voit apparaître la nouvelle demande dans son tableau de bord
## 🔒 Sécurité
 
Traitée comme une exigence transversale (« security by design »), et non comme une étape a posteriori.
 
**Front-end**
- Assainissement systématique des contenus utilisateur via **DOMPurify** (anti-XSS)
- En-têtes de sécurité HTTP : `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Content-Security-Policy`, `Strict-Transport-Security`
- Jetons JWT stockés en `sessionStorage`, jamais journalisés
- Validation des entrées côté client (21 tests unitaires)
**Back-end**
- **JWT** : access token 60 min, refresh token 7 jours avec **rotation** + blacklist après rotation
- **RBAC** : classes de permission DRF (`IsAdmin`, `IsAdminOrOwner`) sur chaque vue sensible
- **Rate limiting** : 5 requêtes/min/IP sur connexion et réinitialisation de mot de passe
- Protection injections SQL native (ORM Django, aucune requête brute)
- HTTPS de bout en bout, certificats Let's Encrypt auto-renouvelés
**Campagne de tests de sécurité manuels (6 scénarios, aucune faille détectée) :**
 
| Test | Résultat attendu |
|---|---|
| Injection XSS persistante | Contenu assaini, script non exécuté |
| Injection SQL | Requête paramétrée par l'ORM, aucune fuite |
| Force brute (connexion) | Blocage à la 6ᵉ tentative (429) |
| Falsification de jeton JWT | Signature invalide → 401 |
| Élévation de privilège (RBAC) | 403 Forbidden |
| Énumération de ressources (IDOR) | 404 Not Found |
 
## ♿ Accessibilité & performance
 
**RGAA / WCAG 2.1 niveau AA visé** — contraste ≥ 4,5:1, navigation clavier complète, étiquettes ARIA, structure sémantique, `alt` systématique. Contrôlé par axe-core (Vitest) et Lighthouse (score Accessibilité ≥ 90 en CI).
 
**Budget de performance (Core Web Vitals) :**
 
| Indicateur | Cible |
|---|---|
| LCP | < 2,5 s |
| INP | < 200 ms |
| CLS | < 0,1 |
| TTFB | < 600 ms |
| Poids JS initial | < 200 ko compressé |
| Score Lighthouse Performance | ≥ 85/100 |
 
## ✅ Tests
 
| Suite | Nombre de tests | Détail |
|---|---|---|
| Back-end (pytest) | 55 | accounts, audits, reports, training |
| Front-end (Vitest + RTL) | 56 | validators, StatusBadge, useAuth, ProtectedRoute, dataService, pages... |
| Sécurité manuelle | 6 scénarios | XSS, SQLi, force brute, JWT, RBAC, IDOR |
| Jeu d'essai (parcours critique) | 8 scénarios | 0 écart constaté |
 
Exécution locale :
```bash
# Back-end
pytest --cov=apps --cov-report=term-missing -v
 
# Front-end
npm test -- --run --coverage
```
 
## ⚙️ Installation et lancement
 
**Prérequis** : Node.js 20, Python 3.12, PostgreSQL, Redis, Docker (optionnel pour l'environnement back-end).
 
```bash
# Cloner le dépôt
git clone https://github.com/Tommy-JOUHANS/portfolio.git
 
# Front-end
cd frontend
npm install
npm run dev
 
# Back-end
cd backend
pip install -r requirements.txt -r requirements-dev.txt
python manage.py migrate
python manage.py runserver
 
# Worker asynchrone
celery -A config worker --loglevel=info
```
 
## 🚀 Déploiement
 
CI/CD via **GitHub Actions** (lint, tests, build) à chaque push sur `main`/`develop`.
 
- **Front-end** → Vercel (build automatique, CDN, HTTPS, en-têtes de sécurité)
- **Back-end** → Railway (conteneur Docker, migrations auto, Gunicorn + worker Celery)
- Sauvegarde manuelle de la base avant chaque mise en production majeure (rétention 14 jours)
## 📅 Gestion de projet
 
Méthodologie **agile** (inspirée Scrum), 12 semaines réparties en sprints S1 à S12, avec démonstration et rétrospective à chaque sprint. **95 % de vélocité** (38/40 points de complexité livrés).
 
Outils : GitHub (versionnement, PR obligatoires), GitHub Actions (CI), Discord (communication quotidienne), Notion (documentation), Trello (suivi des tâches).
 
## 🔗 Ressources du projet
 
| Ressource | Lien |
|---|---|
| Dépôt de code source | https://github.com/Tommy-JOUHANS/portfolio |
| Documentation technique complète | https://github.com/TommyJOUHANS/portfolio/blob/main/Stages/Stage3/Stage-3-Technical-Documentation-EN.pdf |
| Documentation d'exécution et de tests | https://github.com/TommyJOUHANS/portfolio/tree/main/Stages/Stage-4 |
| Vidéo de démonstration | https://www.youtube.com/watch?v=jxrV9IZSC70 |
| Collection de tests Postman | Voir dossier `Stages/Stage-4` du dépôt |
 
## 🔮 Perspectives d'évolution
 
- Tableau de bord temps réel par **WebSocket** (remplacement du polling)
- Score de sécurité assisté par IA à partir du questionnaire d'audit
- Application mobile native (iOS/Android)
- Gamification des modules de sensibilisation
- Authentification déléguée **OAuth2** (Google, LinkedIn)
- Journal d'audit applicatif complet (table `AUDIT_LOG`) pour une traçabilité renforcée RGPD
---
 
*Projet réalisé par **Tommy JOUHANS** (front-end) en binôme avec **James ROUSSEL** (back-end) — Holberton School Dijon, Titre RNCP 5 Développeur Web et Web Mobile, Session 2026.*
 