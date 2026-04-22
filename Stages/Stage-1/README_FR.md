# 🛡️ CyberAudit & Solutions — Projet Portfolio

> **Stage 1 — Constitution de l'équipe et développement de l'idée**
> Holberton School Dijon | 2026

---

## 👥 L'équipe

| Membre | Rôle | Compétences clés |
|--------|------|-----------------|
| **Tommy JOUHANS** | Développeur Front-End | React, HTML/CSS, UX Design, Figma |
| **James ROUSSEL** | Développeur Back-End | Django, PostgreSQL, API REST, Celery, Sécurité |

---

## 📋 Sommaire

1. [Présentation du projet](#présentation-du-projet)
2. [Stack technique](#stack-technique)
3. [Fonctionnalités MVP](#fonctionnalités-mvp)
4. [Architecture du projet](#architecture-du-projet)
5. [Planning 8 semaines](#planning-8-semaines)
6. [Objectifs SMART](#objectifs-smart)
7. [Sécurité](#sécurité)
8. [Démarrage rapide](#démarrage-rapide)
9. [Règles d'équipe](#règles-déquipe)
10. [Sources & Références](#sources--références)

---

## 🎯 Présentation du projet

### Problème identifié

**45% des PME/TPE françaises n'ont aucune équipe informatique interne** *(Source : ANSSI « Panorama de la cybermenace » 2023)*.  
Elles sont exposées à des cyberattaques de plus en plus fréquentes — ransomware, phishing, fuite de données — mais n'ont ni les compétences ni les outils pour s'en protéger. Les solutions existantes sont conçues pour les grandes entreprises : trop complexes, trop coûteuses, inaccessibles.

> **Résultat :** les PME subissent des attaques évitables, perdent des données critiques et risquent des sanctions RGPD lourdes (jusqu'à 4% du chiffre d'affaires annuel).

### Solution apportée

Une **plateforme web full-stack** connectant les PME avec des experts en cybersécurité. Les utilisateurs peuvent :
- ✅ Soumettre une demande d'audit en quelques clics
- ✅ Suivre l'avancement de leur dossier en temps réel
- ✅ Consulter un rapport de vulnérabilités clair et vulgarisé
- ✅ Accéder à des modules de sensibilisation

Le tout dans un **environnement sécurisé** avec gestion des rôles et authentification JWT.

### Persona utilisateur

> **Marie**, 45 ans, gérante d'un cabinet comptable de 12 personnes à Dijon. Elle utilise Excel et Gmail au quotidien mais n'a aucune notion informatique. Récemment ciblée par un email de phishing, elle a besoin d'une solution simple et abordable — pas d'un rapport technique de 200 pages.

---

## 🛠️ Stack technique

### Front-End
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Back-End
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

### Infrastructure & Sécurité
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

| Technologie | Usage |
|------------|-------|
| Django REST Framework | API REST sécurisée |
| SimpleJWT | Authentification & gestion des tokens |
| Celery + Redis | Tâches asynchrones (emails, génération PDF) |
| DOMPurify | Protection XSS |
| Django ORM | Protection anti-injection SQL |
| Railway / Render | Hébergement cloud + HTTPS automatique |

---

## ✅ Fonctionnalités MVP

### Dans le périmètre (8 semaines)

**Authentification & Sécurité**
- [x] Inscription & connexion avec JWT
- [x] Gestion des rôles : `Admin CyberAudit` / `Client PME`
- [x] Protection des routes & en-têtes HTTP sécurisés
- [x] Hash des mots de passe + rate limiting

**Fonctionnalités Core**
- [x] Formulaire de demande d'audit
- [x] Tableau de bord Admin — gestion des demandes (4 statuts : En attente / En cours / Terminé / Archivé)
- [x] Tableau de bord Client — suivi des statuts en temps réel
- [x] Génération automatique de rapports PDF
- [x] Module de sensibilisation / formations
- [x] Notifications email automatiques (Celery async)

**Technique & Déploiement**
- [x] API REST sécurisée (Django REST Framework)
- [x] BDD PostgreSQL avec index de performance
- [x] Déploiement cloud avec HTTPS

### Hors périmètre — Version 2

- [ ] SOC temps réel (WebSocket)
- [ ] Score de sécurité automatique par IA
- [ ] Application mobile (iOS / Android)
- [ ] Modules de formation gamifiés
- [ ] Marketplace de consultants
- [ ] Intégration OAuth2 (Google / LinkedIn)

---

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
```

---

## 📅 Planning 8 semaines

| Sem. | Focus | Tommy (Front-End) | James (Back-End) |
|------|-------|-------------------|-----------------|
| **S1** | Conception | Wireframes Figma, User Stories, README | Schéma BDD, modélisation entités, librairies sécurité |
| **S2** | Environnement | Init React, Tailwind CSS, .env | Init Django, config PostgreSQL, structure apps |
| **S3** | Auth & Sécurité | Pages Login/Register, JWT côté client | Modèle User + rôles, endpoints JWT, rate limiting |
| **S4** | Core features 1 | Formulaire audit, dashboard Client | API CRUD demandes, validation, protection SQL |
| **S5** | Core features 2 | Dashboard Admin, module formations | Génération PDF, upload fichiers, endpoints formations |
| **S6** | Async & Perfo | Notifications UI, pagination | Celery + Redis, pagination API, optimisation BDD |
| **S7** | Tests | Tests React, end-to-end, **tests UX (x3)** | Tests unitaires, Postman, vérification XSS/SQL |
| **S8** | Déploiement | Frontend (Vercel/Render), slides soutenance | Backend + BDD, HTTPS SSL, documentation finale |

### Tâches communes (les deux membres)
- Revues de code croisées sur GitHub (obligatoires avant chaque merge)
- Tests de sécurité manuels en S7 (XSS, injection SQL, brute-force)
- Rédaction du README final et de la documentation
- Préparation et répétition de la soutenance finale

---

## 🎯 Objectifs SMART

### Objectif 1 — Authentification & Rôles
| Critère | Détail |
|---------|--------|
| **Spécifique** | Système d'authentification avec 2 rôles distincts protégeant toutes les routes sensibles |
| **Mesurable** | 100% des routes API testées — vérifiable via tests Postman en S7 |
| **Atteignable** | SimpleJWT + Django Permissions — 1 semaine allouée (S3) |
| **Pertinent** | Prérequis indispensable : sans authentification, aucune fonctionnalité ne peut être livrée |
| **Temporel** | ✅ Livré et validé à la fin de la semaine 3 |

### Objectif 2 — Gestion des demandes d'audit
| Critère | Détail |
|---------|--------|
| **Spécifique** | Client PME soumet une demande ; admin la gère avec 4 statuts |
| **Mesurable** | CRUD complet — 5 scénarios de test validés |
| **Atteignable** | DRF + React Form — 1 semaine (S4) |
| **Pertinent** | Cœur du produit — sans ça, la plateforme n'a pas de raison d'être |
| **Temporel** | ✅ Démo-able à la fin de la semaine 4 |

### Objectif 3 — Déploiement & Sécurité en production
| Critère | Détail |
|---------|--------|
| **Spécifique** | Déploiement HTTPS + protection anti-XSS + anti-injection SQL validées |
| **Mesurable** | URL publique accessible + tests de sécurité réussis |
| **Atteignable** | Railway/Render + Let's Encrypt — S8 |
| **Pertinent** | Le jury attend une application sécurisée ET déployée |
| **Temporel** | ✅ En ligne avant la soutenance finale |

### Objectif 4 — Expérience utilisateur *(NOUVEAU)*
| Critère | Détail |
|---------|--------|
| **Spécifique** | Un utilisateur non-technicien (persona : Marie) soumet une demande d'audit sans aide |
| **Mesurable** | Tâche réalisée en **< 3 minutes** — validé par **3 tests utilisateurs** en S7 |
| **Atteignable** | Maquettes Figma en S1, conception simplifiée du formulaire en S4 |
| **Pertinent** | Si l'interface est inutilisable, aucune PME n'adoptera la plateforme |
| **Temporel** | ✅ Tests documentés avant la fin de la semaine 7 |

---

## 🔐 Sécurité

La plateforme implémente plusieurs couches de sécurité :

```python
# Authentification — SimpleJWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

# Rate limiting — django-ratelimit
@ratelimit(key='ip', rate='5/m', method='POST', block=True)
def login_view(request): ...

# Protection XSS — DOMPurify (React frontend)
const clean = DOMPurify.sanitize(userInput);

# Protection SQL — Django ORM (aucune requête brute)
AuditRequest.objects.filter(client=request.user, status=status)
```

**En-têtes de sécurité (middleware Django) :**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy`
- `Strict-Transport-Security (HSTS)`

**Tests de sécurité planifiés en S7 :**
- Tentatives d'injection XSS
- Injection SQL via Postman
- Brute-force sur l'endpoint de connexion
- Falsification de token JWT

---

## 🚀 Démarrage rapide

### Prérequis
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Installation du Back-End
```bash
# Cloner le dépôt
git clone https://github.com/[username]/cyberaudit-solutions.git
cd cyberaudit-solutions/backend

# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows : venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos identifiants PostgreSQL et Redis

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur (rôle Admin)
python manage.py createsuperuser

# Lancer le worker Celery
celery -A config worker --loglevel=info

# Lancer le serveur de développement
python manage.py runserver
```

### Installation du Front-End
```bash
cd ../frontend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer REACT_APP_API_URL=http://localhost:8000

# Lancer le serveur de développement
npm start
```

### Variables d'environnement

**Backend `.env` :**
```env
DEBUG=True
SECRET_KEY=votre-clé-secrète-ici
DATABASE_URL=postgresql://user:password@localhost:5432/cyberaudit
REDIS_URL=redis://localhost:6379/0
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=votre-email@gmail.com
EMAIL_HOST_PASSWORD=votre-mot-de-passe-app
```

**Frontend `.env` :**
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_ENV=development
```

---

## 📐 Règles d'équipe

### Workflow Git
```
main          ← production uniquement (déploiement S8)
develop       ← branche d'intégration
feature/*     ← fonctionnalités individuelles (feature/auth-jwt, feature/dashboard-client)
fix/*         ← corrections de bugs
```

**Convention de commits :**
```
feat: ajout du formulaire de demande d'audit
fix: correction du bug de refresh token JWT
docs: mise à jour de la documentation API
test: ajout des tests unitaires pour le CRUD audit
```

**Règles Pull Request :**
- Chaque PR requiert la revue de l'autre membre avant merge
- Aucun push direct sur `main` ou `develop`
- La description de PR doit inclure : ce qui change, pourquoi, et comment tester

### Protocole de décision
1. Décisions techniques majeures → discussion sur Discord, accord obligatoire des 2 membres
2. Désaccord → prototyper les deux solutions sur des branches séparées, comparer sur : performance, maintenabilité, délai de livraison estimé
3. Sans consensus après 48h → le chef de projet décide des priorités produit, le référent technique décide de l'architecture

### Outils de communication
| Outil | Usage | Fréquence |
|-------|-------|-----------|
| Discord | Communication quotidienne (#frontend, #backend, #général) | Tous les jours |
| GitHub | Versioning + PR obligatoires | Chaque commit |
| Notion | Documentation + suivi des tâches | Après chaque session |
| Point hebdomadaire | Bilan + planning | Chaque lundi |

---

## 📚 Sources & Références

| Source | Contenu | Lien |
|--------|---------|------|
| ANSSI 2023 | « Panorama de la cybermenace » — 45% des PME sans équipe IT | [ssi.gouv.fr](https://www.ssi.gouv.fr) |
| CESIN 2023 | Baromètre annuel de la cybersécurité | [cesin.fr](https://www.cesin.fr) |
| ENISA 2023 | Rapport sur le paysage des menaces | [enisa.europa.eu](https://www.enisa.europa.eu) |
| APEC 2023 | Baromètre des salaires — coût d'un expert cybersécurité | [apec.fr](https://www.apec.fr) |
| RGPD | Texte officiel RGPD — sanctions jusqu'à 4% du CA annuel | [gdpr.eu](https://gdpr.eu) |
| Directive NIS2 | Directive NIS2 — obligations cybersécurité UE | [digital-strategy.ec.europa.eu](https://digital-strategy.ec.europa.eu) |

---

## 📊 Synthèse SWOT

| | Positif | Négatif |
|--|---------|---------|
| **Interne** | ✅ Solution tout-en-un / Stack maîtrisée / Disponibilité 24/7 | ⚠️ Équipe de 2 / Notoriété nulle au démarrage |
| **Externe** | 🚀 Obligation RGPD + NIS2 / Hausse cyberattaques / Manque de solutions accessibles | 🔴 Concurrence (Cybermalveillance, Vaadata) / Menaces évolutives |

---

## 👤 Carte des parties prenantes

```
INFLUENCE FORTE
      │
      │  Jury Holberton ●          ● Tommy + James
      │
      │  Admin CyberAudit ●
      │                                ● Clients PME
      │
      │  Organismes ISO/RGPD ●
      │
      │  Banques partenaires ●   Fournisseurs IT ●
      │
INFLUENCE FAIBLE
      └────────────────────────────────────────
         FAIBLE INTÉRÊT              FORT INTÉRÊT
```

---

## 📄 Licence

Ce projet est développé dans le cadre du cursus Holberton School Dijon.  
© 2026 Tommy JOUHANS & James ROUSSEL — CyberAudit & Solutions

---

*Projet Portfolio — Stage 1 : Constitution de l'équipe et développement de l'idée*  
*Holberton School Dijon | 2026*
