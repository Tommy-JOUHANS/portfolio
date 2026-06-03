const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "CyberAudit & Solutions — Portfolio Presentation";
pres.author = "Tommy JOUHANS";

// ── Color palette (Navy / Ice / White) ────────────────────────────────────────
const C = {
  navy:     "1E2761",
  navyDark: "0B1F4F",
  blue:     "2E5EA8",
  iceBlue:  "CADCFC",
  iceSoft:  "EEF4FF",
  white:    "FFFFFF",
  gray:     "64748B",
  grayLt:   "F1F5F9",
  accent:   "0EA5E9",
  green:    "10B981",
  amber:    "F59E0B",
  text:     "1E293B",
};

const makeShadow = () => ({
  type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.12
});

function card(slide, x, y, w, h) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: C.white },
    line: { color: "E2E8F0", width: 1 },
    shadow: makeShadow(),
  });
}

// ─── SLIDE 1 — TITLE ─────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.navyDark };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 6.2, h: 5.625, fill: { color: C.navy } });
  s.addShape(pres.shapes.RECTANGLE, { x: 6.2, y: 0, w: 3.8, h: 5.625, fill: { color: C.iceBlue } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 2.1, w: 6.2, h: 0.06, fill: { color: C.accent } });

  s.addText("CyberAudit & Solutions", { x: 0.45, y: 0.55, w: 5.5, h: 1.2, fontSize: 34, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
  s.addText("SME Audit Management Platform", { x: 0.45, y: 1.75, w: 5.5, h: 0.55, fontSize: 18, color: C.iceBlue, fontFace: "Calibri", italic: true, margin: 0 });
  s.addText("Holberton School Dijon — Portfolio Project", { x: 0.45, y: 2.35, w: 5.5, h: 0.4, fontSize: 13, color: "A0AEC0", fontFace: "Calibri", margin: 0 });
  s.addText([
    { text: "Team", options: { bold: true, breakLine: true } },
    { text: "Tommy JOUHANS", options: { breakLine: true } },
    { text: "James  |  Sophie", options: {} },
  ], { x: 0.45, y: 3.15, w: 5.5, h: 1.5, fontSize: 14, color: C.white, fontFace: "Calibri" });

  s.addText("Full-Stack", { x: 6.4, y: 0.7, w: 3.3, h: 0.6, fontSize: 22, bold: true, color: C.navy, fontFace: "Calibri", align: "center", margin: 0 });
  s.addText("Web Platform", { x: 6.4, y: 1.25, w: 3.3, h: 0.5, fontSize: 18, color: C.navy, fontFace: "Calibri", align: "center", margin: 0 });

  const tags = ["React 19", "Django 5.1", "PostgreSQL", "JWT Auth", "Railway", "CI/CD"];
  tags.forEach((t, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    s.addShape(pres.shapes.RECTANGLE, { x: 6.4 + col * 1.75, y: 2.1 + row * 0.72, w: 1.6, h: 0.52, fill: { color: C.navy }, line: { color: C.navy } });
    s.addText(t, { x: 6.4 + col * 1.75, y: 2.1 + row * 0.72, w: 1.6, h: 0.52, fontSize: 11, bold: true, color: C.white, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });
  });
  s.addText("June 2026", { x: 6.4, y: 5.0, w: 3.3, h: 0.4, fontSize: 11, color: C.gray, fontFace: "Calibri", align: "center", margin: 0 });
}

// ─── SLIDE 2 — THE PROBLEM ────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.grayLt };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
  s.addText("The Problem", { x: 0.45, y: 0, w: 9, h: 0.9, fontSize: 26, bold: true, color: C.white, fontFace: "Calibri", valign: "middle", margin: 0 });

  const problems = [
    { icon: "🔓", title: "No IT security", body: "Most SMEs have no dedicated cybersecurity team or budget to protect their infrastructure." },
    { icon: "📄", title: "Manual processes", body: "Audit requests are handled via email — no tracking, no traceability, no SLA." },
    { icon: "⏰", title: "Slow response", body: "No real-time status updates. Clients wait in the dark after submitting a request." },
    { icon: "📊", title: "No reporting", body: "Vulnerability reports are sent as email attachments — impossible to manage at scale." },
  ];

  problems.forEach((p, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.45 + col * 4.85, y = 1.15 + row * 2.05;
    card(s, x, y, 4.6, 1.82);
    s.addText(p.icon, { x: x + 0.2, y: y + 0.15, w: 0.7, h: 0.7, fontSize: 28, margin: 0 });
    s.addText(p.title, { x: x + 0.95, y: y + 0.12, w: 3.45, h: 0.42, fontSize: 15, bold: true, color: C.text, fontFace: "Calibri", margin: 0 });
    s.addText(p.body, { x: x + 0.95, y: y + 0.55, w: 3.45, h: 0.9, fontSize: 12, color: C.gray, fontFace: "Calibri", margin: 0 });
  });
}

// ─── SLIDE 3 — THE SOLUTION ───────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.navy };
  s.addText("Our Solution", { x: 0.5, y: 0.25, w: 9, h: 0.75, fontSize: 30, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
  s.addText("A unified web platform connecting SME clients and CyberAudit operators", { x: 0.5, y: 0.95, w: 9, h: 0.45, fontSize: 14, color: C.iceBlue, fontFace: "Calibri", italic: true, margin: 0 });

  const features = [
    { num: "01", title: "Audit Request Form", body: "Clients choose a pack, fill a form, get instant email confirmation via EmailJS." },
    { num: "02", title: "Real-time Dashboard", body: "Track every request — Pending, In Progress, Completed, Archived." },
    { num: "03", title: "Admin Management", body: "Operators manage all requests, update status, assign team members." },
    { num: "04", title: "PDF Reports", body: "Auto-generated vulnerability reports via WeasyPrint + Celery async tasks." },
    { num: "05", title: "Training Modules", body: "5 cybersecurity awareness modules with progress tracking." },
    { num: "06", title: "Secure Auth", body: "JWT authentication, role-based access control (client / admin)." },
  ];

  features.forEach((f, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.45 + col * 3.15, y = 1.6 + row * 1.9;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.9, h: 1.7, fill: { color: "FFFFFF", transparency: 92 }, line: { color: C.accent, width: 1 } });
    s.addText(f.num, { x: x + 0.15, y: y + 0.1, w: 0.55, h: 0.4, fontSize: 16, bold: true, color: C.accent, fontFace: "Calibri", margin: 0 });
    s.addText(f.title, { x: x + 0.15, y: y + 0.45, w: 2.6, h: 0.38, fontSize: 12, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    s.addText(f.body, { x: x + 0.15, y: y + 0.82, w: 2.6, h: 0.7, fontSize: 10, color: C.iceBlue, fontFace: "Calibri", margin: 0 });
  });
}

// ─── SLIDE 4 — TEAM & CONTEXT ─────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.grayLt };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
  s.addText("Team & Context", { x: 0.45, y: 0, w: 9, h: 0.9, fontSize: 26, bold: true, color: C.white, fontFace: "Calibri", valign: "middle", margin: 0 });

  const members = [
    { name: "Tommy JOUHANS", focus: "Backend, Auth, EmailJS, Deploy, CI/CD" },
    { name: "James", focus: "Frontend, UI Components, Admin Dashboard" },
    { name: "Sophie", focus: "Data, Training Modules, Reports" },
  ];

  members.forEach((m, i) => {
    card(s, 0.45, 1.1 + i * 1.42, 5.5, 1.25);
    s.addShape(pres.shapes.OVAL, { x: 0.6, y: 1.15 + i * 1.42, w: 0.75, h: 0.75, fill: { color: C.navy } });
    s.addText(m.name[0], { x: 0.6, y: 1.15 + i * 1.42, w: 0.75, h: 0.75, fontSize: 18, bold: true, color: C.white, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });
    s.addText(m.name, { x: 1.5, y: 1.18 + i * 1.42, w: 4.2, h: 0.38, fontSize: 14, bold: true, color: C.text, fontFace: "Calibri", margin: 0 });
    s.addText("Holberton School Dijon — " + m.focus, { x: 1.5, y: 1.55 + i * 1.42, w: 4.2, h: 0.5, fontSize: 11, color: C.gray, fontFace: "Calibri", margin: 0 });
  });

  card(s, 6.2, 1.1, 3.5, 4.25);
  s.addText("Project Context", { x: 6.35, y: 1.2, w: 3.2, h: 0.42, fontSize: 14, bold: true, color: C.navy, fontFace: "Calibri", margin: 0 });

  const ctxItems = ["🎓  Holberton School Dijon\n    Full-Stack program", "🏢  Les Entrep' association\n    Entrepreneurial project", "📅  4-week sprint\n    Stage 3 → Stage 4", "🌐  Live: Railway + Vercel\n    Production deployed", "🔁  GitHub Actions CI/CD\n    Automated tests"];
  ctxItems.forEach((item, i) => {
    s.addText(item, { x: 6.35, y: 1.72 + i * 0.67, w: 3.2, h: 0.57, fontSize: 11, color: C.text, fontFace: "Calibri", margin: 0 });
  });
}

// ─── SLIDE 5 — TECH STACK ─────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.grayLt };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
  s.addText("Tech Stack", { x: 0.45, y: 0, w: 9, h: 0.9, fontSize: 26, bold: true, color: C.white, fontFace: "Calibri", valign: "middle", margin: 0 });

  const layers = [
    { label: "FRONTEND", color: C.accent, items: ["React 19 + Vite 8", "Tailwind CSS 4", "React Router 7", "Axios + JWT interceptors", "EmailJS (transactional emails)", "Vitest + Testing Library (40 tests)"] },
    { label: "BACKEND", color: "7C3AED", items: ["Django 5.1 + DRF 3.17", "SimpleJWT (60min access / 60d refresh)", "Celery + Redis (async tasks)", "WeasyPrint (PDF reports)", "PostgreSQL (production)", "pytest + coverage"] },
    { label: "INFRA & DEVOPS", color: C.green, items: ["Railway: backend + PostgreSQL + Redis", "Vercel: frontend CDN", "GitHub Actions CI/CD pipeline", "dj-database-url + whitenoise", "python-decouple (.env config)", "Production-ready: gunicorn"] },
  ];

  layers.forEach((layer, i) => {
    const x = 0.45 + i * 3.15;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.05, w: 2.9, h: 0.45, fill: { color: layer.color } });
    s.addText(layer.label, { x, y: 1.05, w: 2.9, h: 0.45, fontSize: 11, bold: true, color: C.white, fontFace: "Calibri", align: "center", valign: "middle", charSpacing: 3, margin: 0 });
    card(s, x, 1.5, 2.9, 3.85);
    s.addText(
      layer.items.map(t => ({ text: t, options: { bullet: true, breakLine: true } })),
      { x: x + 0.1, y: 1.6, w: 2.7, h: 3.65, fontSize: 11.5, color: C.text, fontFace: "Calibri" }
    );
  });
}

// ─── SLIDE 6 — ARCHITECTURE ───────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.navyDark };
  s.addText("Architecture Overview", { x: 0.45, y: 0.2, w: 9, h: 0.7, fontSize: 26, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });

  const boxes = [
    { x: 0.4,  y: 1.1,  w: 2.0, h: 1.1,  color: C.accent,  label: "React\nFrontend",   sub: "Vercel" },
    { x: 3.0,  y: 1.1,  w: 2.0, h: 1.1,  color: "7C3AED",  label: "Django\nAPI",        sub: "Railway" },
    { x: 5.6,  y: 0.85, w: 1.8, h: 0.88, color: "0F766E",  label: "PostgreSQL",          sub: "Railway DB" },
    { x: 5.6,  y: 1.85, w: 1.8, h: 0.88, color: C.amber,   label: "Redis",               sub: "Railway Cache" },
    { x: 7.65, y: 1.1,  w: 2.0, h: 1.1,  color: "DC2626",  label: "Celery\nWorker",      sub: "Async Tasks" },
    { x: 0.4,  y: 3.1,  w: 2.0, h: 0.88, color: "0EA5E9",  label: "EmailJS",             sub: "Email Service" },
    { x: 3.0,  y: 3.1,  w: 2.0, h: 0.88, color: "10B981",  label: "WeasyPrint",          sub: "PDF Reports" },
    { x: 5.6,  y: 3.1,  w: 2.0, h: 0.88, color: "6366F1",  label: "GitHub\nActions",     sub: "CI/CD" },
  ];

  boxes.forEach(b => {
    s.addShape(pres.shapes.RECTANGLE, { x: b.x, y: b.y, w: b.w, h: b.h, fill: { color: b.color }, line: { color: "FFFFFF", width: 1 } });
    s.addText(b.label, { x: b.x, y: b.y + 0.05, w: b.w, h: b.h * 0.58, fontSize: 12, bold: true, color: C.white, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });
    s.addText(b.sub, { x: b.x, y: b.y + b.h * 0.6, w: b.w, h: b.h * 0.38, fontSize: 9, color: "FFFFFF", fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });
  });

  [[2.4, 1.65, 0.6, 0], [5.0, 1.3, 0.6, 0], [5.0, 1.9, 0.6, 0], [7.4, 1.65, 0.25, 0]].forEach(([x, y, w, h]) => {
    s.addShape(pres.shapes.LINE, { x, y, w, h, line: { color: "94A3B8", width: 1.5, dashType: "dash" } });
  });
  s.addText("HTTP/JWT", { x: 2.35, y: 1.42, w: 0.7, h: 0.22, fontSize: 8, color: "94A3B8", fontFace: "Calibri", align: "center", margin: 0 });
}

// ─── SLIDE 7 — CLIENT PORTAL ──────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.grayLt };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
  s.addText("Client Portal — Key Flows", { x: 0.45, y: 0, w: 9, h: 0.9, fontSize: 26, bold: true, color: C.white, fontFace: "Calibri", valign: "middle", margin: 0 });

  const steps = [
    { n: "1", title: "Register / Login", body: "Email + password\nJWT token stored\nRole: client", color: C.accent },
    { n: "2", title: "Choose a Pack", body: "4 packs: Audit, Security,\nProtection, Premium\n€1,000 → €5,000", color: "7C3AED" },
    { n: "3", title: "Submit Request", body: "Structured form\nCompany info + message\nDOSSIER-YYYY-NNNN", color: C.green },
    { n: "4", title: "Email Confirmation", body: "Instant via EmailJS\nReference, pack, price\nSubmission date", color: C.amber },
    { n: "5", title: "Track Progress", body: "Real-time dashboard\nPending → In Progress\n→ Completed", color: "DC2626" },
  ];

  steps.forEach((st, i) => {
    const x = 0.4 + i * 1.88;
    s.addShape(pres.shapes.OVAL, { x: x + 0.45, y: 1.05, w: 0.9, h: 0.9, fill: { color: st.color } });
    s.addText(st.n, { x: x + 0.45, y: 1.05, w: 0.9, h: 0.9, fontSize: 18, bold: true, color: C.white, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });
    if (i < 4) s.addShape(pres.shapes.LINE, { x: x + 1.38, y: 1.5, w: 0.5, h: 0, line: { color: "CBD5E1", width: 2 } });
    card(s, x, 2.15, 1.8, 2.8);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.15, w: 1.8, h: 0.4, fill: { color: st.color } });
    s.addText(st.title, { x, y: 2.15, w: 1.8, h: 0.4, fontSize: 10, bold: true, color: C.white, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });
    s.addText(st.body, { x: x + 0.1, y: 2.65, w: 1.6, h: 2.2, fontSize: 10, color: C.text, fontFace: "Calibri", margin: 0 });
  });
}

// ─── SLIDE 8 — ADMIN PORTAL ───────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.grayLt };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: "4C1D95" } });
  s.addText("Admin Portal — Operator View", { x: 0.45, y: 0, w: 9, h: 0.9, fontSize: 26, bold: true, color: C.white, fontFace: "Calibri", valign: "middle", margin: 0 });

  const adminFeats = [
    { icon: "📊", title: "Dashboard KPIs", body: "Pending / In Progress / Completed / Archived counters. Filter by status, pack, client." },
    { icon: "✏️", title: "Request Management", body: "View client details, update status, assign operator, add internal notes." },
    { icon: "📧", title: "Client Notifications", body: "Send status update emails with readable status and internal notes via EmailJS." },
    { icon: "📄", title: "PDF Report Generation", body: "WeasyPrint + Celery generates vulnerability reports asynchronously." },
    { icon: "🗄️", title: "Data Persistence", body: "PostgreSQL on Railway — 35 requests, 9 clients. Persistent across restarts." },
    { icon: "🔒", title: "Role-Based Access", body: "Admins see all requests. Clients see only their own. Enforced at API level." },
  ];

  adminFeats.forEach((f, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.45 + col * 3.15, y = 1.1 + row * 2.1;
    card(s, x, y, 2.9, 1.85);
    s.addText(f.icon, { x: x + 0.15, y: y + 0.12, w: 0.6, h: 0.55, fontSize: 22, margin: 0 });
    s.addText(f.title, { x: x + 0.8, y: y + 0.12, w: 2.0, h: 0.45, fontSize: 12, bold: true, color: C.text, fontFace: "Calibri", margin: 0 });
    s.addText(f.body, { x: x + 0.15, y: y + 0.65, w: 2.65, h: 0.98, fontSize: 10, color: C.gray, fontFace: "Calibri", margin: 0 });
  });
}

// ─── SLIDE 9 — LIVE DEMO ──────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.navyDark };
  s.addText("Live Demo", { x: 0.5, y: 0.6, w: 9, h: 1.0, fontSize: 42, bold: true, color: C.white, fontFace: "Calibri", align: "center", margin: 0 });
  s.addText("🚀", { x: 4.3, y: 1.65, w: 1.4, h: 1.0, fontSize: 48, align: "center", margin: 0 });

  s.addText([
    { text: "1.  Register as a new client → Submit an audit request", options: { breakLine: true, color: C.accent } },
    { text: "2.  Receive email confirmation with reference & details", options: { breakLine: true, color: C.iceBlue } },
    { text: "3.  Login as admin → View full request dashboard", options: { breakLine: true, color: C.iceBlue } },
    { text: "4.  Update request status → Send notification to client", options: { breakLine: true, color: C.iceBlue } },
    { text: "5.  Generate PDF vulnerability report via Celery", options: { color: C.iceBlue } },
  ], { x: 1.5, y: 2.8, w: 7, h: 2.5, fontSize: 14, fontFace: "Calibri" });

  s.addText("🔗  backend-production-46c13.up.railway.app", { x: 0.5, y: 5.1, w: 9, h: 0.35, fontSize: 11, color: "64748B", fontFace: "Calibri", align: "center", italic: true, margin: 0 });
}

// ─── SLIDE 10 — TESTS & CI/CD ─────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.grayLt };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
  s.addText("Tests & CI/CD", { x: 0.45, y: 0, w: 9, h: 0.9, fontSize: 26, bold: true, color: C.white, fontFace: "Calibri", valign: "middle", margin: 0 });

  card(s, 0.45, 1.05, 4.5, 4.25);
  s.addShape(pres.shapes.RECTANGLE, { x: 0.45, y: 1.05, w: 4.5, h: 0.48, fill: { color: C.accent } });
  s.addText("Frontend — Vitest", { x: 0.45, y: 1.05, w: 4.5, h: 0.48, fontSize: 13, bold: true, color: C.white, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });

  s.addChart(pres.charts.BAR, [{ name: "Tests", labels: ["Passing", "Excluded"], values: [40, 16] }], {
    x: 0.55, y: 1.6, w: 4.3, h: 1.75, barDir: "col",
    chartColors: [C.green, "CBD5E1"],
    chartArea: { fill: { color: C.white } },
    showValue: true, dataLabelColor: C.text,
    catGridLine: { style: "none" }, valGridLine: { color: "E2E8F0", size: 0.5 },
    showLegend: true, legendPos: "b",
  });

  s.addText([
    { text: "✅ 40 tests passing across 4 files", options: { breakLine: true } },
    { text: "   validators, StatusBadge, useAuth, ProtectedRoute", options: { breakLine: true } },
    { text: "📊 11.6% statement coverage (growing)", options: { breakLine: true } },
    { text: "   New tests: dataService, DashboardPage, TrainingPage", options: {} },
  ], { x: 0.6, y: 3.45, w: 4.2, h: 1.7, fontSize: 11, color: C.text, fontFace: "Calibri" });

  card(s, 5.2, 1.05, 4.5, 4.25);
  s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.05, w: 4.5, h: 0.48, fill: { color: "7C3AED" } });
  s.addText("Backend — pytest + GitHub Actions", { x: 5.2, y: 1.05, w: 4.5, h: 0.48, fontSize: 13, bold: true, color: C.white, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });

  s.addText([
    { text: "✅ pytest-django: 14+ tests (accounts app)", options: { breakLine: true } },
    { text: "✅ JWT auth: register, login, logout, refresh", options: { breakLine: true } },
    { text: "✅ RBAC: role-based endpoint protection", options: { breakLine: true } },
    { text: "✅ Rate limiting: 5 req/min throttle tested", options: { breakLine: true } },
    { text: " ", options: { breakLine: true } },
    { text: "GitHub Actions pipeline:", options: { bold: true, color: "7C3AED", breakLine: true } },
    { text: "  → Install Python 3.12 + pip deps", options: { breakLine: true } },
    { text: "  → Run ruff lint + black format check", options: { breakLine: true } },
    { text: "  → Run pytest with coverage threshold", options: { breakLine: true } },
    { text: "  → Deploy to Railway on push to main", options: {} },
  ], { x: 5.35, y: 1.65, w: 4.2, h: 3.55, fontSize: 11, color: C.text, fontFace: "Calibri" });
}

// ─── SLIDE 11 — DEPLOYMENT ────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.navyDark };
  s.addText("Deployment & Infrastructure", { x: 0.45, y: 0.2, w: 9, h: 0.7, fontSize: 26, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });

  const services = [
    { label: "GitHub",   sub: "Source code\n+ CI/CD triggers",    color: "1F2937", x: 0.4, y: 1.1 },
    { label: "Vercel",   sub: "React frontend\nCDN edge deploy",   color: "000000", x: 2.6, y: 1.1 },
    { label: "Railway\nBackend", sub: "Django + Gunicorn\nWhiteNoise static", color: "0F172A", x: 4.8, y: 1.1 },
    { label: "Railway\nPostgreSQL", sub: "Production DB\n35 requests stored", color: "1E3A5F", x: 7.2, y: 1.1 },
    { label: "Railway\nRedis",   sub: "Celery broker\n+ result backend", color: "7F1D1D", x: 4.8, y: 3.0 },
    { label: "Celery\nWorker",   sub: "PDF generation\nAsync notifications", color: "14532D", x: 7.2, y: 3.0 },
    { label: "EmailJS",  sub: "Transactional\nemail service",       color: "1E40AF", x: 0.4, y: 3.0 },
    { label: "WeasyPrint", sub: "PDF report\nrendering",            color: "4C1D95", x: 2.6, y: 3.0 },
  ];

  services.forEach(sv => {
    s.addShape(pres.shapes.RECTANGLE, { x: sv.x, y: sv.y, w: 2.0, h: 1.6, fill: { color: sv.color }, line: { color: "334155", width: 1 }, shadow: makeShadow() });
    s.addText(sv.label, { x: sv.x, y: sv.y + 0.12, w: 2.0, h: 0.6, fontSize: 12, bold: true, color: C.white, fontFace: "Calibri", align: "center", margin: 0 });
    s.addText(sv.sub, { x: sv.x, y: sv.y + 0.72, w: 2.0, h: 0.75, fontSize: 9.5, color: "94A3B8", fontFace: "Calibri", align: "center", margin: 0 });
  });

  s.addText("All services communicate via environment variables — no credentials in source code.", { x: 0.5, y: 4.85, w: 9, h: 0.5, fontSize: 11, color: "64748B", fontFace: "Calibri", italic: true, align: "center", margin: 0 });
}

// ─── SLIDE 12 — WHAT'S NEXT + Q&A ────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.navy };
  s.addText("What's Next", { x: 0.45, y: 0.3, w: 5.2, h: 0.65, fontSize: 26, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });

  const nextItems = [
    { icon: "📱", text: "Responsive design — mobile & tablet breakpoints" },
    { icon: "🔗", text: "Connect all remaining API endpoints" },
    { icon: "🧪", text: "Test coverage ≥ 80% (frontend + backend)" },
    { icon: "📧", text: "Custom email domain (paid EmailJS plan)" },
    { icon: "🛡️", text: "Security hardening — CSP headers, OWASP" },
    { icon: "🌍", text: "Multi-language support (FR / EN)" },
  ];

  nextItems.forEach((item, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.45, y: 1.1 + i * 0.7, w: 5.0, h: 0.58, fill: { color: "FFFFFF", transparency: 90 }, line: { color: C.accent, width: 1 } });
    s.addText(item.icon, { x: 0.55, y: 1.1 + i * 0.7, w: 0.5, h: 0.58, fontSize: 16, align: "center", valign: "middle", margin: 0 });
    s.addText(item.text, { x: 1.1, y: 1.1 + i * 0.7, w: 4.25, h: 0.58, fontSize: 12, color: C.iceBlue, fontFace: "Calibri", valign: "middle", margin: 0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 5.9, y: 0.25, w: 3.7, h: 5.1, fill: { color: C.accent } });
  s.addText("Q & A", { x: 5.9, y: 1.2, w: 3.7, h: 1.0, fontSize: 44, bold: true, color: C.white, fontFace: "Calibri", align: "center", valign: "middle", margin: 0 });
  s.addText("Thank you!", { x: 5.9, y: 2.3, w: 3.7, h: 0.55, fontSize: 20, color: C.white, fontFace: "Calibri", align: "center", italic: true, margin: 0 });
  s.addText([
    { text: "github.com/Tommy-JOUHANS/portfolio", options: { breakLine: true } },
    { text: "backend-production-46c13.up.railway.app", options: { breakLine: true } },
    { text: "tommy.jouhans@outlook.com", options: {} },
  ], { x: 5.9, y: 3.3, w: 3.7, h: 1.5, fontSize: 10, color: C.white, fontFace: "Calibri", align: "center" });
}

// ─── GENERATE ─────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: "CyberAudit_Presentation.pptx" })
  .then(() => console.log("✅  CyberAudit_Presentation.pptx created"))
  .catch(e => console.error("❌ Error:", e));
