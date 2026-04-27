# PORTFOLIO PROJECT — CyberAudit & Solutions

> **SME Audit Management Platform**
> **Stage 2 — Project Planning: Gantt Chart**
> Holberton School Dijon | 2026

| Role | Member |
|---|---|
| **Front-End Developer** | Tommy JOUHANS |
| **Back-End Developer** | James ROUSSEL |

---

## Table of Contents

1. [Purpose of the Gantt Chart](#1-purpose-of-the-gantt-chart)
2. [Overview — The 5 Main Project Stages](#2-overview--the-5-main-project-stages)
3. [Calendar View — Real Project Dates](#3-calendar-view--real-project-dates)
4. [General Project Timeline](#4-general-project-timeline)
5. [Gantt Chart — Detailed Weekly View](#5-gantt-chart--detailed-weekly-view)
6. [Task Dependencies](#6-task-dependencies)
7. [Project Critical Path](#7-project-critical-path)
8. [Key Milestones](#8-key-milestones)
9. [Conclusion — Why a Gantt Chart?](#9-conclusion--why-a-gantt-chart)

---

## 1. Purpose of the Gantt Chart

This document presents the **Gantt chart** of the CyberAudit & Solutions project over **12 weeks**, with its **5 main phases**, key deliverables and milestones.

It serves as a shared visual reference for the team and the Holberton jury to track progress, anticipate blockers and ensure delivery of a functional MVP at the final defense.

---

## 2. Overview — The 5 Main Project Stages

The project is structured into five successive stages, each producing a validated deliverable before moving on to the next.

| Stage | Description | Period | Status |
|:---:|---|:---:|:---:|
| **Stage 1** | Idea Development — Team formation, brainstorming, MVP selection, project charter | Pre-project | ✅ Completed |
| **Stage 2** | Project Planning — Stakeholders, RACI, planning, Gantt chart | Current | 🟠 In progress |
| **Stage 3** | Technical Documentation — Figma wireframes, DB schema, User Stories, README | Weeks 1-2 | ⏳ Upcoming |
| **Stage 4** | MVP Development — JWT Auth, REST API, dashboards, PDF, Celery, deployment | Weeks 3-10 | ⏳ Upcoming |
| **Stage 5** | Project Closure — UX tests, HTTPS deployment, final documentation, defense | Weeks 11-12 | ⏳ Upcoming |

---

## 3. Calendar View — Real Project Dates

The project starts on **Monday, April 27, 2026** (W1) and ends on **Sunday, July 19, 2026** (Holberton defense).
A total of 12 weeks — Weeks 7 to 10 (Tests) span 4 weeks to allow iteration cycles.

| Week | Start date | End date | Phase / Deliverable |
|:---:|:---:|:---:|---|
| **W1** | Mon. April 27, 2026 | Sun. May 03, 2026 | Stage 3 — Design & Wireframes |
| **W2** | Mon. May 04, 2026 | Sun. May 10, 2026 | Stage 3 → 4 — Environment setup |
| **W3** | Mon. May 11, 2026 | Sun. May 17, 2026 | Stage 4 — Auth & Security (JWT) |
| **W4** | Mon. May 18, 2026 | Sun. May 24, 2026 | Stage 4 — Core Features 1 (Form) |
| **W5** | Mon. May 25, 2026 | Sun. May 31, 2026 | Stage 4 — Core Features 2 (PDF + Admin) |
| **W6** | Mon. June 01, 2026 | Sun. June 07, 2026 | Stage 4 — Async (Celery + Redis) |
| **W7-10** | Mon. June 08, 2026 | Sun. July 05, 2026 | Stage 4 → 5 — Tests & iterations |
| **W11-12** | Mon. July 06, 2026 | Sun. July 19, 2026 | Stage 5 — Deployment & Defense |

---

## 4. General Project Timeline

The timeline below follows the assignment guidelines (weeks 1 to 12) and aligns with Section 2 *"Scope & Calendar"* of the project charter.

| Period | Project Stage | Key Deliverables |
|:---:|---|---|
| **Weeks 1-2** | Stage 3 — Technical Documentation | Figma Wireframes + User Stories + DB Schema + README + Project Charter |
| **Week 3** | Stage 4 — MVP: Auth & Security | Login/Register React pages + client JWT + User model + auth endpoints + hashing |
| **Weeks 4-5** | Stage 4 — MVP: Core Features | Pack form, Client & Admin dashboards, CRUD API, PDF generation, training modules |
| **Week 6** | Stage 4 — MVP: Async & Performance | UI notifications, pagination, error handling, Celery + Redis, DB optimization |
| **Weeks 7-10** | Stage 4-5 — Tests & iterations | React component tests, Django tests, UX tests (×3), Postman, XSS / SQL audit |
| **Weeks 11-12** | Stage 5 — Project Closure | Frontend (Vercel) + Backend deployment + HTTPS SSL, slides, final defense |

---

## 5. Gantt Chart — Detailed Weekly View

Each row represents a task, with its **progress percentage** updated weekly.
The **colored bars** indicate duration and status, and the **diamond markers ◆** represent milestones.

### Legend

| Symbol | Meaning |
|:---:|---|
| 🟢 ▬ | Done |
| 🟠 ▬ | In progress |
| 🔵 ▬ | Upcoming |
| 🔴 ◆ | Milestone |

### Gantt Table

| Task / Deliverable | Owner | Progress | W1 | W2 | W3 | W4 | W5 | W6 | W7-10 | W11-12 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **[Stage 3] W1-2 Design & Planning** | Tommy + James | 0 % | ◆ | ▬ | | | | | | |
| └ Figma Wireframes + User Stories | Tommy | 0 % | ▬ | | | | | | | |
| └ DB Schema + Entity Modeling | James | 0 % | ▬ | | | | | | | |
| └ README init + Project charter | Tommy + James | 0 % | ▬ | | | | | | | |
| **[Stage 4] W2 Environment setup** | Tommy + James | 0 % | | ◆ | | | | | | |
| └ Init React + Tailwind CSS + .env | Tommy | 0 % | | ▬ | | | | | | |
| └ Init Django + PostgreSQL + config | James | 0 % | | ▬ | | | | | | |
| **[Stage 4] W3 Auth & Security** | Tommy + James | 0 % | | | ◆ | | | | | |
| └ Login / Register pages + JWT client | Tommy | 0 % | | | ▬ | | | | | |
| └ User model + JWT endpoints + hashing | James | 0 % | | | ▬ | | | | | |
| **[Stage 4] W4 Core Features 1** | Tommy + James | 0 % | | | | ◆ | | | | |
| └ Request form + Client Dashboard | Tommy | 0 % | | | | ▬ | | | | |
| └ CRUD API + validation + Celery email | James | 0 % | | | | ▬ | | | | |
| **[Stage 4] W5 Core Features 2** | Tommy + James | 0 % | | | | | ◆ | | | |
| └ Admin Dashboard + reports display | Tommy | 0 % | | | | | ▬ | | | |
| └ PDF generation + training module | James | 0 % | | | | | ▬ | | | |
| **[Stage 4] W6 Async & Performance** | Tommy + James | 0 % | | | | | | ◆ | | |
| └ UI notifs + pagination + error handling | Tommy | 0 % | | | | | | ▬ | | |
| └ Celery + Redis + API pagination + DB | James | 0 % | | | | | | ▬ | | |
| **[Stage 4] W7-10 Tests** | Tommy + James | 0 % | | | | | | | ◆ | |
| └ React component tests + UX (×3) | Tommy | 0 % | | | | | | | ▬ | |
| └ Django + Postman + XSS / SQL tests | James | 0 % | | | | | | | ▬ | |
| **[Stage 5] W11-12 Deployment & Defense** | Tommy + James | 0 % | | | | | | | | ◆ |
| └ Deploy Frontend Vercel + slides | Tommy | 0 % | | | | | | | | ▬ |
| └ Deploy Backend + HTTPS SSL + docs | James | 0 % | | | | | | | | ▬ |

> *Note: the "Progress" column will be updated at each weekly stand-up (30 min minimum, see project charter — communication rules).*

---

## 6. Task Dependencies

A dependency means that a task **cannot start** until the previous one is delivered. Identifying these links helps avoid cascading blockers.

| Task | Depends on | Consequence if delayed |
|---|---|---|
| **Environment setup (W2)** | Wireframes + DB Schema (W1) | 🔴 Code start delayed, 1 week loss |
| **Auth & JWT (W3)** | Environment setup (W2) | 🔴 No protected route → Core Features blocked |
| **Pack form (W4)** | JWT Auth (W3) | 🔴 No client session = no possible request |
| **CRUD requests API (W4)** | JWT Auth (W3) + DB Schema (W1) | 🔴 Empty Client Dashboard → MVP not demoable |
| **Celery email (W4)** | CRUD requests API (W4) | 🔴 Missing acknowledgment → MVP criterion failed |
| **PDF generation (W5)** | CRUD API + Admin Dashboard (W4) | 🔴 No downloadable report → MVP criterion failed |
| **Tests (W7-10)** | All Core Features (W3-W6) | 🔴 Undetected flaws → jury / security risk |
| **Deployment (W11-12)** | Tests (W7-10) + Documentation | 🔴 Site offline on D-day → degraded defense |

---

## 7. Project Critical Path

The **critical path** is the sequence of tasks where any delay shifts the defense date. Each task on the critical path must be delivered on time, with no room for slack.

> 🔴 **DB Schema (W1) → Django Setup (W2) → JWT Auth (W3) → CRUD API (W4) → PDF Generation (W5) → Security Tests (W7-10) → HTTPS Deployment (W11-12)**

| Critical step | Why critical? | Safety margin |
|:---:|---|:---:|
| **W1 — DB Schema** | Entire backend structure depends on it | 0.5 day (must finish before W2) |
| **W2 — Django + PostgreSQL setup** | Without environment, no application code possible | 1 day |
| **W3 — JWT Auth** | All protected routes go through it | **0 day (strict milestone)** |
| **W4 — CRUD API + email** | Heart of MVP: without validated form, no demo | 1 day |
| **W5 — PDF Report** | Jury success criterion (1 PDF generated) | 1 day |
| **W7-10 — Security tests** | Project subject: cybersecurity | 2 days (4 weeks available) |
| **W11-12 — HTTPS Deployment** | Without public URL, no valid defense | **0 day (date set by Holberton)** |

---

## 8. Key Milestones

Milestones are non-negotiable checkpoints. Each weekly milestone validates a measurable deliverable, verifiable in team review.

| Milestone | Deliverable | Validation criterion |
|:---:|---|---|
| **M1 — End W1-2** | Technical documentation | Figma Wireframes validated, DB schema, README, signed project charter |
| **M2 — End W2** | Operational environment | React + Django + PostgreSQL stack configured, .env ready, Git repo initialized |
| **M3 — End W3** | Functional authentication | 2 roles (Admin / Client) operational, JWT tested, protected routes |
| **M4 — End W4** | MVP core delivered | Pack form with 4 choices + automatic acknowledgment email |
| **M5 — End W5** | Reporting & training | 1 PDF report generated from interface, training module accessible |
| **M6 — End W6** | Performance validated | Celery + Redis operational, API pagination, DB optimizations |
| **M7 — End W7-10** | Quality validated | Security tests (XSS / SQL / brute-force) OK + UX tests < 3 min validated ×3 |
| **M8 — End W11-12** | Holberton defense | HTTPS-deployed application + final documentation + slides |

---

## 9. Conclusion — Why a Gantt Chart?

- **Visualize the entire project** — A single glance reveals the phases, overlaps and weekly workload.
- **Anticipate risks** — Milestones reveal critical points (W3 = auth, W4 = core product, W11-12 = deployment) and allow planning the necessary safety margins.
- **Align team and stakeholders** — Tommy, James, the Holberton jury and Les Entrep' share the same vision of the planning.
- **Measure progress** — The "Progress" column updated weekly compares actual to planned: any delay becomes immediately visible.
- **Secure the defense** — The critical path and milestones guarantee that all required deliverables (HTTPS, demo, UX tests, PDF report) are planned and tracked.

---

*Document prepared as part of Stage 2 — Project Planning, Holberton School Dijon, class of 2026.*

**Tommy JOUHANS** | Front-End Developer — **James ROUSSEL** | Back-End Developer