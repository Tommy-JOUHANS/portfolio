# CyberAudit & Solutions — Oral Script (English)
## Portfolio Presentation — ~10 minutes

---

### SLIDE 1 — Title (45 sec)

> **Tommy:** "Good morning / afternoon everyone. My name is Tommy JOUHANS, and together with James and Sophie, we've built CyberAudit & Solutions — a full-stack SME Audit Management Platform, developed as part of our Holberton School portfolio project, in collaboration with Les Entrep', an entrepreneurial association here in Dijon.
>
> Over the next 10 minutes, we'll walk you through the problem we solved, what we built, how we built it, and what's coming next. Let's get started."

---

### SLIDE 2 — The Problem (60 sec)

> **Tommy (or James):** "Let me start with the problem.
>
> Small and medium-sized businesses are the primary targets of cyberattacks — and yet, most of them have no dedicated IT security team, no budget, and no process to manage their cybersecurity risk.
>
> When a company reaches out to a cybersecurity firm like CyberAudit & Solutions, what typically happens? They send an email. That email gets lost. Nobody knows what's happening, when to expect a response, or what was agreed. There's no tracking, no real-time visibility, and no structured reporting.
>
> That's the gap we set out to fill."

---

### SLIDE 3 — The Solution (60 sec)

> **James:** "Our answer is a unified web platform that connects SME clients with CyberAudit operators — in one secure, structured environment.
>
> Clients can choose from four service packs, submit an audit request through a structured form, and immediately receive an email confirmation. They then track the progress of their case in real time — from Pending, to In Progress, to Completed.
>
> On the admin side, operators have a full dashboard to manage all incoming requests, assign team members, update statuses, send notifications, and generate PDF vulnerability reports.
>
> The platform also includes five cybersecurity awareness training modules — because security starts with the people, not just the tools."

---

### SLIDE 4 — Team & Context (30 sec)

> **Tommy:** "We're three full-stack developers from Holberton School Dijon, working within the Les Entrep' entrepreneurial framework.
>
> I focused on the backend, authentication, email integration, deployment, and CI/CD pipeline. James built the frontend UI, admin dashboard, and component architecture. Sophie handled the data layer, training modules, and report generation.
>
> The project ran over four weeks — two sprints — from Stage 3 through Stage 4."

---

### SLIDE 5 — Tech Stack (45 sec)

> **James:** "On the frontend: React 19 with Vite, Tailwind CSS for styling, React Router for navigation, Axios with JWT interceptors for API calls, and EmailJS for transactional emails — all without a backend email server.
>
> On the backend: Django 5.1 with Django REST Framework, SimpleJWT for token-based authentication with automatic refresh, Celery and Redis for asynchronous task processing, WeasyPrint for PDF generation, and PostgreSQL as our production database.
>
> For infrastructure: the backend runs on Railway, the frontend is deployed on Vercel, and our CI/CD pipeline is fully automated via GitHub Actions."

---

### SLIDE 6 — Architecture (30 sec)

> **Tommy:** "Here's the architecture at a glance.
>
> The React frontend communicates with the Django API over HTTP using JWT tokens. Django connects to PostgreSQL for persistent storage, and Redis as the message broker for Celery. Celery workers handle all asynchronous tasks — PDF generation, notifications. EmailJS runs entirely client-side. And GitHub Actions triggers automated tests and deployment on every push."

---

### SLIDE 7 — Client Portal (60 sec)

> **James:** "Let me walk you through the client experience.
>
> A new user registers with their email and password. After authentication, they receive a JWT access token and are directed to their portal.
>
> They choose one of four packs — from Pack Audit at €1,000 for a basic risk assessment, up to Pack Premium at €5,000 for full 24/7 SOC coverage.
>
> They fill out a structured form with their company details and a custom message. On submission, their case receives a unique reference number — DOSSIER-YEAR-NNNN — and they immediately receive a confirmation email with all the details: pack, price, services included, and submission date.
>
> From their dashboard, they can then track the real-time progress of their request."

---

### SLIDE 8 — Admin Portal (60 sec)

> **Tommy:** "On the admin side, the operator dashboard shows all incoming requests with live KPI counters — how many are pending, in progress, completed, or archived.
>
> Admins can filter by status, pack, or client name. They can click on any request to view the full client details, update the status, assign it to a team member, and add internal notes that are never visible to the client.
>
> When a status changes, the admin can send a notification email to the client — with the new status and relevant notes — with a single click, powered by EmailJS.
>
> And when the audit is complete, they generate a PDF vulnerability report asynchronously via Celery and WeasyPrint."

---

### SLIDE 9 — Live Demo (60 sec — actual demo)

> **James (driving the demo):** "Let's see it in action.
>
> I'll start by registering a new client account... [register]
> ...submit an audit request for Pack Security... [submit form]
> ...and here's the confirmation email arriving in real time. [show email]
>
> Now I'll switch to the admin account... [login as admin]
> ...and you can see the new request appearing in the dashboard with status 'Pending'. [show dashboard]
>
> I'll update it to 'In Progress', assign it to our team, and send a notification to the client... [send notification]
> ...and finally, generate the PDF report. [generate PDF]"

---

### SLIDE 10 — Tests & CI/CD (45 sec)

> **Tommy:** "On quality and reliability.
>
> On the frontend, we have 40 Vitest tests passing across components, hooks, and services — covering authentication guards, status badges, validators, and data fetching. We're actively growing our coverage.
>
> On the backend, our pytest suite covers 14+ test cases for the accounts app — including JWT authentication flows, role-based access control, and rate limiting. The entire pipeline runs automatically on every push via GitHub Actions: linting with Ruff, formatting with Black, tests with coverage threshold, and deployment to Railway."

---

### SLIDE 11 — Deployment (30 sec)

> **James:** "The platform is fully deployed and production-ready.
>
> The frontend is on Vercel — fast CDN edge delivery globally. The backend, PostgreSQL database, and Redis broker all run on Railway. Celery workers run as a separate Railway service.
>
> All credentials and configuration are managed via environment variables — nothing is hardcoded in the source code. WhiteNoise serves static files directly from Django in production."

---

### SLIDE 12 — What's Next + Q&A (30 sec)

> **Tommy:** "Looking ahead, our priorities are: completing the responsive design for mobile and tablet, connecting all remaining API endpoints to replace the last mock data, growing our test coverage toward 80%, and adding a custom email domain.
>
> Longer term, we're looking at security hardening with Content Security Policy headers, and potentially multi-language support.
>
> That's CyberAudit & Solutions. We're happy to take any questions. Thank you."

---

## Role Distribution Summary

| Slide | Speaker | Action |
|-------|---------|--------|
| 1 — Title | Tommy | Introduction |
| 2 — Problem | Tommy or James | Context |
| 3 — Solution | James | Features overview |
| 4 — Team | Tommy | Quick intro |
| 5 — Tech Stack | James | Technical detail |
| 6 — Architecture | Tommy | Diagram walk-through |
| 7 — Client Portal | James | UX flow |
| 8 — Admin Portal | Tommy | Operator features |
| 9 — Live Demo | James (driving) | Live demo |
| 10 — Tests | Tommy | Quality |
| 11 — Deployment | James | Infrastructure |
| 12 — What's Next | Tommy | Closing |

**Total estimated time: ~9-11 minutes**

---

## Tips for the Demo

- Open two browser tabs: one as **client** (marie@cabinet-dijon.fr / Client1234!), one as **admin** (admin@cyberaudit.fr / Admin1234!)
- Have the inbox open to show the EmailJS email in real time
- If Railway is slow, show a pre-recorded screenshot as backup
- Keep the demo to 60 seconds max — show 3 actions, not all features
