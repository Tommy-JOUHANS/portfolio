const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, ExternalHyperlink
} = require('docx');
const fs = require('fs');

const border  = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

const headerBorder = { style: BorderStyle.SINGLE, size: 1, color: "1E2761" };
const headerBorders = { top: headerBorder, bottom: headerBorder, left: headerBorder, right: headerBorder };

function hCell(text, width) {
  return new TableCell({
    borders: headerBorders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "1E2761", type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, bold: true, color: "FFFFFF", font: "Arial" })]
    })]
  });
}

function dCell(text, width, bold = false, color = "1E293B") {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: [new TextRun({ text, size: 19, bold, color, font: "Arial" })]
    })]
  });
}

function linkCell(text, url, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: [new ExternalHyperlink({
        link: url,
        children: [new TextRun({ text, size: 18, color: "0EA5E9", font: "Arial", style: "Hyperlink" })]
      })]
    })]
  });
}

function statusCell(status, width) {
  const colors = {
    "✅ Done":        { fill: "D1FAE5", text: "0F766E" },
    "⚠️ Partial":    { fill: "FEF3C7", text: "92400E" },
    "🚧 In Progress":{ fill: "DBEAFE", text: "1E40AF" },
    "❌ Pending":    { fill: "FEE2E2", text: "991B1B" },
  };
  const c = colors[status] || { fill: "F3F4F6", text: "374151" };
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: c.fill, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: status, size: 18, bold: true, color: c.text, font: "Arial" })]
    })]
  });
}

function altRow(index) {
  return index % 2 === 1;
}

function sectionRow(label) {
  return new TableRow({
    children: [
      new TableCell({
        borders: headerBorders,
        width: { size: 9026, type: WidthType.DXA },
        columnSpan: 5,
        shading: { fill: "EEF4FF", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({ text: label, size: 20, bold: true, color: "1E2761", font: "Arial" })]
        })]
      })
    ]
  });
}

// Column widths (total = 9026 DXA for A4 with 1" margins)
// #  | Deliverable         | Description            | Link     | Status   | Date
// 500 | 2200               | 3126                   | 1600     | 1000     | 600
const W = [500, 2200, 3126, 1600, 1000, 600]; // sum = 9026

const DELIVERABLES = [
  // ── SECTION 1: Documentation & Planning
  { section: "1 — Documentation & Planning" },
  { n: "1.1", name: "Project Portfolio Document", desc: "Full technical documentation: architecture, UX/UI mockups, data model (7 tables), API specs, security design, CI/CD pipeline, sprint planning", url: "https://github.com/Tommy-JOUHANS/portfolio", urlLabel: "GitHub Repo", status: "✅ Done", date: "Apr 2026" },
  { n: "1.2", name: "Project Planning (Stage 2)", desc: "Sprint planning, Trello board, task breakdown, team roles and responsibilities, timeline estimation", url: "https://trello.com/b/LaJVqg9d/portfolio-cyberaudit-solutions-sme-audit-management-platform", urlLabel: "Trello Board", status: "✅ Done", date: "Apr 2026" },
  { n: "1.3", name: "Weekly Report (26–29 May 2026)", desc: "Weekly progress report: objectives achieved, obstacles encountered, test results, and next sprint goals", url: "https://github.com/Tommy-JOUHANS/portfolio", urlLabel: "GitHub", status: "✅ Done", date: "29 May 2026" },
  { n: "1.4", name: "Unit Test Report (Backend + Frontend)", desc: "Test documentation covering pytest backend tests and Vitest frontend tests, with coverage analysis", url: "https://github.com/Tommy-JOUHANS/portfolio/actions", urlLabel: "GitHub Actions", status: "✅ Done", date: "May 2026" },

  // ── SECTION 2: Backend
  { section: "2 — Backend (Django REST API)" },
  { n: "2.1", name: "Custom User Model", desc: "UUID primary key, email as USERNAME_FIELD, role-based access (client / admin), AbstractBaseUser + PermissionsMixin", url: "https://github.com/Tommy-JOUHANS/portfolio/tree/main/cyberaudit/backend/apps/accounts", urlLabel: "accounts/", status: "✅ Done", date: "Apr 2026" },
  { n: "2.2", name: "JWT Authentication API", desc: "Register, Login, Logout (token blacklist), Token Refresh, /me endpoint — SimpleJWT, 60min access / 60d refresh", url: "https://github.com/Tommy-JOUHANS/portfolio/tree/main/cyberaudit/backend/apps/accounts", urlLabel: "accounts/views.py", status: "✅ Done", date: "Apr 2026" },
  { n: "2.3", name: "Audit Pack & Request API", desc: "4 commercial packs (Audit, Security, Protection, Premium), CRUD for audit requests, RBAC filtering (clients see own requests, admins see all)", url: "https://github.com/Tommy-JOUHANS/portfolio/tree/main/cyberaudit/backend/apps/audits", urlLabel: "audits/", status: "✅ Done", date: "May 2026" },
  { n: "2.4", name: "Training Modules API", desc: "5 cybersecurity awareness modules with progress tracking per user (to_start / in_progress / completed)", url: "https://github.com/Tommy-JOUHANS/portfolio/tree/main/cyberaudit/backend/apps/training", urlLabel: "training/", status: "✅ Done", date: "May 2026" },
  { n: "2.5", name: "Notifications System", desc: "Notification model with status cycle (queued / sent / failed), linked to audit requests and users", url: "https://github.com/Tommy-JOUHANS/portfolio/tree/main/cyberaudit/backend/apps/notifications", urlLabel: "notifications/", status: "✅ Done", date: "May 2026" },
  { n: "2.6", name: "PDF Report Generation", desc: "WeasyPrint + Celery async task to generate vulnerability PDF reports, stored in /media/", url: "https://github.com/Tommy-JOUHANS/portfolio/tree/main/cyberaudit/backend/apps/reports", urlLabel: "reports/", status: "✅ Done", date: "May 2026" },
  { n: "2.7", name: "Database Migrations", desc: "All 7 apps migrated: accounts, audits, reports, training, notifications, plus data seed migrations (4 packs, 5 modules)", url: "https://github.com/Tommy-JOUHANS/portfolio/tree/main/cyberaudit/backend", urlLabel: "Backend repo", status: "✅ Done", date: "May 2026" },
  { n: "2.8", name: "Mock Data Import (35 requests)", desc: "Python script to import 35 historical audit requests and 9 client accounts from localStorage mock data into PostgreSQL", url: "https://github.com/Tommy-JOUHANS/portfolio/blob/main/cyberaudit/backend/import_mock_data.py", urlLabel: "import_mock_data.py", status: "✅ Done", date: "Jun 2026" },

  // ── SECTION 3: Frontend
  { section: "3 — Frontend (React 19 + Vite)" },
  { n: "3.1", name: "Authentication Flow", desc: "Register, Login, Logout — connected to Django JWT API, session persisted in localStorage, auto-refresh on 401", url: "https://github.com/Tommy-JOUHANS/portfolio/tree/main/cyberaudit/frontend/src/services", urlLabel: "services/", status: "✅ Done", date: "May 2026" },
  { n: "3.2", name: "Client Portal", desc: "Dashboard with audit request list, status tracking, audit request form (PackSelector, validation), confirmation page", url: "https://github.com/Tommy-JOUHANS/portfolio/tree/main/cyberaudit/frontend/src/pages", urlLabel: "pages/", status: "✅ Done", date: "May 2026" },
  { n: "3.3", name: "Admin Portal", desc: "Admin dashboard with KPI counters, filters (status/pack/client), request detail page, status update, notifications", url: "https://github.com/Tommy-JOUHANS/portfolio/tree/main/cyberaudit/frontend/src/components/admin", urlLabel: "components/admin/", status: "✅ Done", date: "May 2026" },
  { n: "3.4", name: "EmailJS Integration", desc: "emailService.js: sendAuditConfirmation() and sendStatusNotification() — instant transactional emails without backend dependency", url: "https://github.com/Tommy-JOUHANS/portfolio/blob/main/cyberaudit/frontend/src/services/emailService.js", urlLabel: "emailService.js", status: "✅ Done", date: "May 2026" },
  { n: "3.5", name: "Training Modules Page", desc: "5 cybersecurity awareness modules with progress bar, Start / Continue / Review buttons, status badges", url: "https://github.com/Tommy-JOUHANS/portfolio/blob/main/cyberaudit/frontend/src/pages/TrainingPage.jsx", urlLabel: "TrainingPage.jsx", status: "✅ Done", date: "May 2026" },
  { n: "3.6", name: "Responsive Design", desc: "Mobile-first layout: header logo adapts (40px mobile / 80px desktop), sidebar becomes bottom tab bar on mobile", url: "https://github.com/Tommy-JOUHANS/portfolio/tree/main/cyberaudit/frontend/src/components/shared", urlLabel: "shared/", status: "⚠️ Partial", date: "Jun 2026" },
  { n: "3.7", name: "PDF Report Viewer", desc: "ReportViewerPage: displays generated PDF vulnerability report for a given audit reference", url: "https://github.com/Tommy-JOUHANS/portfolio/blob/main/cyberaudit/frontend/src/pages/ReportViewerPage.jsx", urlLabel: "ReportViewerPage.jsx", status: "✅ Done", date: "May 2026" },

  // ── SECTION 4: Testing
  { section: "4 — Testing" },
  { n: "4.1", name: "Backend Tests (pytest)", desc: "14+ pytest-django tests: JWT register/login/logout/refresh, RBAC endpoint protection, rate limiting (5 req/min), user model", url: "https://github.com/Tommy-JOUHANS/portfolio/tree/main/cyberaudit/backend/apps/accounts/tests.py", urlLabel: "accounts/tests.py", status: "✅ Done", date: "May 2026" },
  { n: "4.2", name: "Frontend Tests (Vitest)", desc: "40 tests passing: validators (21), StatusBadge (8), useAuth (5), ProtectedRoute (6) — 11.6% statement coverage", url: "https://github.com/Tommy-JOUHANS/portfolio/tree/main/cyberaudit/frontend/src/__tests__", urlLabel: "__tests__/", status: "✅ Done", date: "May 2026" },
  { n: "4.3", name: "New Frontend Tests", desc: "dataService (mock API), DashboardPage (role routing), TrainingPage (async loading, user interactions), StatCard", url: "https://github.com/Tommy-JOUHANS/portfolio/tree/main/cyberaudit/frontend/src/__tests__", urlLabel: "__tests__/", status: "✅ Done", date: "Jun 2026" },

  // ── SECTION 5: DevOps & Deployment
  { section: "5 — DevOps & Deployment" },
  { n: "5.1", name: "GitHub Actions CI/CD", desc: "Automated pipeline: Python 3.12 setup, pip install, ruff lint, black format, pytest with coverage threshold, Railway deploy on push", url: "https://github.com/Tommy-JOUHANS/portfolio/blob/main/.github/workflows/backend-ci.yml", urlLabel: "backend-ci.yml", status: "✅ Done", date: "May 2026" },
  { n: "5.2", name: "Railway Deployment (Backend)", desc: "Django + Gunicorn + WhiteNoise on Railway, PostgreSQL database, Redis broker — all services connected via env variables", url: "https://backend-production-46c13.up.railway.app", urlLabel: "backend-production-46c13.up.railway.app", status: "✅ Done", date: "May 2026" },
  { n: "5.3", name: "Vercel Deployment (Frontend)", desc: "React frontend deployed on Vercel CDN — global edge distribution, automatic rebuild on push to main", url: "https://github.com/Tommy-JOUHANS/portfolio/deployments", urlLabel: "Deployments", status: "✅ Done", date: "May 2026" },
  { n: "5.4", name: "PostgreSQL Configuration", desc: "dj-database-url for Railway DATABASE_URL parsing, SQLite fallback for local dev, psycopg2-binary driver", url: "https://github.com/Tommy-JOUHANS/portfolio/blob/main/cyberaudit/backend/config/settings.py", urlLabel: "settings.py", status: "✅ Done", date: "Jun 2026" },

  // ── SECTION 6: Presentation
  { section: "6 — Presentation Materials" },
  { n: "6.1", name: "Presentation Slides (12 slides)", desc: "PptxGenJS slide deck: problem, solution, team, tech stack, architecture, client/admin portals, tests, deployment, roadmap", url: "https://github.com/Tommy-JOUHANS/portfolio", urlLabel: "portfolio/", status: "✅ Done", date: "Jun 2026" },
  { n: "6.2", name: "Oral Script (English)", desc: "10-minute structured script with role distribution (Tommy / James / Sophie), per-slide cues, demo steps and tips", url: "https://github.com/Tommy-JOUHANS/portfolio/blob/main/oral_script_EN.md", urlLabel: "oral_script_EN.md", status: "✅ Done", date: "Jun 2026" },
  { n: "6.3", name: "Project Deliverables Table", desc: "This document — complete list of all deliverables with links, statuses, and delivery dates", url: "https://github.com/Tommy-JOUHANS/portfolio", urlLabel: "portfolio/", status: "✅ Done", date: "Jun 2026" },
];

// Build table rows
const rows = [
  new TableRow({
    tableHeader: true,
    children: [
      hCell("#", W[0]),
      hCell("Deliverable", W[1]),
      hCell("Description", W[2]),
      hCell("Link", W[3]),
      hCell("Status", W[4]),
      hCell("Date", W[5]),
    ]
  })
];

let dataRowIndex = 0;
DELIVERABLES.forEach(item => {
  if (item.section) {
    rows.push(sectionRow(item.section));
    return;
  }

  const isAlt = altRow(dataRowIndex++);
  const rowFill = isAlt ? "F8FAFF" : "FFFFFF";

  function dCellAlt(text, width, bold = false, color = "1E293B") {
    return new TableCell({
      borders,
      width: { size: width, type: WidthType.DXA },
      shading: { fill: rowFill, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        children: [new TextRun({ text, size: 19, bold, color, font: "Arial" })]
      })]
    });
  }

  function linkCellAlt(text, url, width) {
    return new TableCell({
      borders,
      width: { size: width, type: WidthType.DXA },
      shading: { fill: rowFill, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        children: [new ExternalHyperlink({
          link: url,
          children: [new TextRun({ text, size: 17, color: "0EA5E9", font: "Arial", style: "Hyperlink" })]
        })]
      })]
    });
  }

  function statusCellAlt(status, width) {
    const colors = {
      "✅ Done":        { fill: "D1FAE5", text: "0F766E" },
      "⚠️ Partial":    { fill: "FEF3C7", text: "92400E" },
      "🚧 In Progress":{ fill: "DBEAFE", text: "1E40AF" },
      "❌ Pending":    { fill: "FEE2E2", text: "991B1B" },
    };
    const c = colors[status] || { fill: "F3F4F6", text: "374151" };
    return new TableCell({
      borders,
      width: { size: width, type: WidthType.DXA },
      shading: { fill: c.fill, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: status, size: 17, bold: true, color: c.text, font: "Arial" })]
      })]
    });
  }

  rows.push(new TableRow({
    children: [
      dCellAlt(item.n, W[0], true, "1E2761"),
      dCellAlt(item.name, W[1], true),
      dCellAlt(item.desc, W[2]),
      linkCellAlt(item.urlLabel, item.url, W[3]),
      statusCellAlt(item.status, W[4]),
      dCellAlt(item.date, W[5], false, "6B7280"),
    ]
  }));
});

// Stats summary
const total   = DELIVERABLES.filter(d => d.n).length;
const done    = DELIVERABLES.filter(d => d.status === "✅ Done").length;
const partial = DELIVERABLES.filter(d => d.status === "⚠️ Partial").length;

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1134, right: 851, bottom: 1134, left: 851 }
      }
    },
    headers: {
      default: new Header({ children: [
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "1E2761", space: 1 } },
          children: [
            new TextRun({ text: "CyberAudit & Solutions  |  Project Deliverables", size: 18, bold: true, color: "1E2761", font: "Arial" }),
            new TextRun({ text: "\tTommy JOUHANS  —  Holberton School Dijon  —  June 2026", size: 16, color: "888888", font: "Arial" }),
          ],
          tabStops: [{ type: "right", position: 9026 }]
        })
      ]})
    },
    footers: {
      default: new Footer({ children: [
        new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 1 } },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", size: 16, color: "AAAAAA", font: "Arial" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "AAAAAA", font: "Arial" }),
            new TextRun({ text: "  |  github.com/Tommy-JOUHANS/portfolio", size: 16, color: "AAAAAA", font: "Arial" }),
          ]
        })
      ]})
    },
    children: [
      // Title
      new Paragraph({
        spacing: { before: 0, after: 120 },
        children: [new TextRun({ text: "Project Deliverables — CyberAudit & Solutions", size: 36, bold: true, color: "1E2761", font: "Arial" })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: "SME Audit Management Platform  |  Holberton School Dijon  |  Full-Stack Portfolio Project", size: 22, color: "64748B", font: "Arial", italic: true })]
      }),

      // Summary stats
      new Paragraph({
        spacing: { before: 60, after: 200 },
        children: [
          new TextRun({ text: `Total deliverables: ${total}   `, size: 20, font: "Arial", color: "374151" }),
          new TextRun({ text: `✅ Done: ${done}   `, size: 20, bold: true, font: "Arial", color: "0F766E" }),
          new TextRun({ text: `⚠️ Partial: ${partial}`, size: 20, bold: true, font: "Arial", color: "92400E" }),
        ]
      }),

      // Main table
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: W,
        rows,
      }),

      // Notes
      new Paragraph({ spacing: { before: 240, after: 60 }, children: [new TextRun({ text: "Notes", size: 24, bold: true, color: "1E2761", font: "Arial" })] }),
      new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "Team: Tommy JOUHANS (backend, auth, deploy) | James (frontend, UI) | Sophie (data, training, reports)", size: 19, font: "Arial", color: "374151" })] }),
      new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "Repository: https://github.com/Tommy-JOUHANS/portfolio", size: 19, font: "Arial", color: "374151" })] }),
      new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "Production (backend): https://backend-production-46c13.up.railway.app", size: 19, font: "Arial", color: "374151" })] }),
      new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "Trello: https://trello.com/b/LaJVqg9d/portfolio-cyberaudit-solutions-sme-audit-management-platform", size: 19, font: "Arial", color: "374151" })] }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("CyberAudit_Deliverables_EN.docx", buf);
  console.log("✅ CyberAudit_Deliverables_EN.docx created — " + total + " deliverables");
}).catch(err => console.error("❌", err));
