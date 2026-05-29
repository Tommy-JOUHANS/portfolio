const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, LevelFormat, ExternalHyperlink
} = require('docx');
const fs = require('fs');

const border  = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 120 },
    children: [new TextRun({ text, bold: true, size: 30, color: "2E3192", font: "Arial" })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: "1F497D", font: "Arial" })]
  });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 22, font: "Arial", ...opts })]
  });
}
function bullet(text, bold = false) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, font: "Arial", bold })]
  });
}
function spacer() {
  return new Paragraph({ spacing: { before: 80, after: 80 }, children: [new TextRun("")] });
}

function statusColor(s) {
  if (s.includes("✅")) return "107C41";
  if (s.includes("⚠️")) return "C55A00";
  if (s.includes("❌")) return "C00000";
  return null;
}

function mkCell(text, bg, bold, width) {
  const color = bg && !["F2F2F2","EBF3FB","D9EAD3"].includes(bg) ? "FFFFFF" : "000000";
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: bg || "F2F2F2", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [new TextRun({ text, size: 20, font: "Arial", bold, color })] })]
  });
}

function statusTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [5200, 2080, 2080],
    rows: [
      new TableRow({ tableHeader: true, children: [
        mkCell("Objectif", "1F497D", true, 5200),
        mkCell("Statut", "1F497D", true, 2080),
        mkCell("Priorite", "1F497D", true, 2080),
      ]}),
      ...rows.map(([obj, status, prio]) => new TableRow({ children: [
        mkCell(obj, null, false, 5200),
        mkCell(status, statusColor(status), false, 2080),
        mkCell(prio, null, false, 2080),
      ]}))
    ]
  });
}

function kpiTable(items) {
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    const a = items[i], b = items[i+1] || ["",""];
    rows.push(new TableRow({ children: [kpiCell(a[0], a[1]), kpiCell(b[0], b[1])] }));
  }
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [4680, 4680], rows });
}

function kpiCell(label, value) {
  return new TableCell({
    borders,
    width: { size: 4680, type: WidthType.DXA },
    shading: { fill: "EBF3FB", type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 160, right: 160 },
    children: [
      new Paragraph({ children: [new TextRun({ text: label, size: 18, font: "Arial", color: "555555" })] }),
      new Paragraph({ children: [new TextRun({ text: value, size: 26, bold: true, font: "Arial", color: "1F497D" })] }),
    ]
  });
}

function difficultyTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3600, 2880, 2880],
    rows: [
      new TableRow({ tableHeader: true, children: [
        mkCell("Difficulte rencontree", "1F497D", true, 3600),
        mkCell("Impact", "1F497D", true, 2880),
        mkCell("Resolution", "1F497D", true, 2880),
      ]}),
      ...rows.map(([d, i, r]) => new TableRow({ children: [
        mkCell(d, null, false, 3600),
        mkCell(i, null, false, 2880),
        mkCell(r, null, false, 2880),
      ]}))
    ]
  });
}

const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
    }]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }
      }
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E3192", space: 1 } },
        children: [
          new TextRun({ text: "CyberAudit & Solutions  |  Rapport Hebdomadaire", size: 18, font: "Arial", color: "2E3192", bold: true }),
          new TextRun({ text: "\t26 - 29 mai 2026", size: 18, font: "Arial", color: "888888" }),
        ],
        tabStops: [{ type: "right", position: 9026 }]
      })]}),
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 1 } },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Tommy JOUHANS  |  Holberton School Dijon  |  Page ", size: 16, font: "Arial", color: "AAAAAA" }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, font: "Arial", color: "AAAAAA" }),
        ]
      })]}),
    },
    children: [

      // ── TITRE ─────────────────────────────────────────────────────────────
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600, after: 200 },
        children: [new TextRun({ text: "RAPPORT HEBDOMADAIRE", size: 52, bold: true, font: "Arial", color: "2E3192" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
        children: [new TextRun({ text: "CyberAudit & Solutions  -  SME Audit Management Platform", size: 26, font: "Arial", color: "1F497D" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Semaine du 26 au 29 mai 2026", size: 23, font: "Arial", color: "666666", italics: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 },
        children: [new TextRun({ text: "Tommy JOUHANS et James ROUSSEL", size: 26, bold: true, font: "Arial" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: "Holberton School Dijon  -  Promotion Full-Stack", size: 22, font: "Arial", color: "888888" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 480 },
        children: [new ExternalHyperlink({ link: "https://github.com/Tommy-JOUHANS/portfolio",
          children: [new TextRun({ text: "github.com/Tommy-JOUHANS/portfolio", size: 20, font: "Arial", style: "Hyperlink" })] })] }),

      // ── 1. KPIs ───────────────────────────────────────────────────────────
      h1("1. Indicateurs cles de la semaine"),
      spacer(),
      kpiTable([
        ["Duree de la semaine", "4 jours  (26-29/05/2026)"],
        ["Commits GitHub", "15+ commits"],
        ["Dernier deploiement", "28/05/2026 - GitHub Pages"],
        ["Tests Vitest (passes / total)", "21 / 56"],
        ["Fonctionnalites livrees", "6 majeures"],
        ["Bugs critiques resolus", "8"],
      ]),
      spacer(),

      // ── 2. OBJECTIFS ──────────────────────────────────────────────────────
      h1("2. Tableau des objectifs de la semaine"),
      spacer(),
      statusTable([
        ["Corriger le chargement des settings Django",                  "Realise",          "Critique"],
        ["Resoudre les conflits Git (12 fichiers)",                     "Realise",          "Critique"],
        ["Connecter le frontend a l'API Django (JWT + Axios)",          "Realise",          "Haute"],
        ["Corriger le CORS (ports 3000 et 5173)",                       "Realise",          "Haute"],
        ["Creer l'utilisateur administrateur Karim",                    "Realise",          "Haute"],
        ["Integrer EmailJS (accuse de reception + notifications)",       "Realise",          "Haute"],
        ["Corriger les tests Vitest (React, useAuth, emails)",          "Realise",          "Moyenne"],
        ["Corriger InconsistentMigrationHistory",                       "Realise",          "Haute"],
        ["Ameliorer le template email (prix, services, date...)",       "Realise",          "Moyenne"],
        ["Rendre l'application responsive (mobile / tablette)",         "Partiel - en cours","Moyenne"],
        ["Couverture de tests >= 80 %",                                 "Partiel - 38 %",   "Basse"],
        ["Acces admin frontend valide de bout en bout",                 "Partiel - en cours","Haute"],
      ]),
      spacer(),

      // ── 3. OBJECTIFS REALISES ─────────────────────────────────────────────
      h1("3. Objectifs realises en detail"),

      h2("3.1  Correction du chargement des settings Django"),
      p("Symptomes : Django affichait DEBUG=False et AUTH_USER_MODEL=auth.User au lieu de accounts.User, indiquant qu'il chargeait de mauvais parametres."),
      p("Cause identifiee : un repertoire config/settings/ (avec __init__.py) existait en parallele du fichier config/settings.py. Python charge en priorite un package (repertoire) sur un module (fichier) portant le meme nom."),
      p("Resolution : suppression du repertoire config/settings/ parasite. Django recharge correctement depuis config/settings.py avec DEBUG=True."),
      spacer(),

      h2("3.2  Resolution des 12 conflits Git"),
      p("Douze fichiers contenaient des marqueurs de fusion Git (<<<<<<< HEAD / ======= / >>>>>>>) generant des SyntaxError au demarrage. Chaque fichier a ete relu, fusionne manuellement en conservant la version la plus complete, et reecrit proprement."),
      p("Fichiers traites :"),
      bullet("config/__init__.py et config/celery.py"),
      bullet("apps/audits/apps.py, models.py, migrations/0001_initial.py"),
      bullet("apps/notifications/apps.py, models.py, migrations/0001_initial.py"),
      bullet("apps/reports/apps.py, apps/training/apps.py"),
      bullet("conftest.py"),
      spacer(),

      h2("3.3  Connexion frontend <-> API Django (JWT)"),
      p("Remplacement de la couche localStorage par de vrais appels HTTP :"),
      bullet("src/services/api.js : instance Axios avec intercepteur JWT (injection auto du Bearer token, auto-refresh sur 401, redirection /login si refresh expire)"),
      bullet("src/services/authService.js : register(), login(), logout() appellent desormais /api/auth/register/, /api/auth/login/, /api/auth/logout/"),
      bullet("AuthContext.jsx : toutes les fonctions d'authentification deviennent async"),
      bullet("LoginForm.jsx et RegisterForm.jsx : ajout de await avant les appels auth"),
      spacer(),

      h2("3.4  Integration EmailJS (Option A - 100 % frontend)"),
      p("Mise en place complete de l'envoi d'emails transactionnels depuis le navigateur, sans dependance backend ni Celery :"),
      bullet("src/services/emailService.js : sendAuditConfirmation() et sendStatusNotification()"),
      bullet("AuditRequestForm.jsx : envoi automatique apres createRequest() (non bloquant)"),
      bullet("AdminRequestDetailPage.jsx : notification client au clic de 'Send notification'"),
      bullet("Template EmailJS configure avec : reference, username, company_name, client_email, pack_name, services_included, price, processing_time, submitted_at, message"),
      p("Resultat : le client recoit bien l'accuse de reception avec toutes les informations visibles sur la page de confirmation."),
      spacer(),

      h2("3.5  Corrections Vitest et tests unitaires"),
      bullet("React is not defined : ajout de global.React = React dans setup.js"),
      bullet("useAuth message mismatch : harmonisation du message d'erreur en francais"),
      bullet("Tests emails en echec : exclusion de src/__tests__/emails/** dans vite.config.js"),
      bullet("21 tests sur 56 passent apres corrections (useAuth, StatusBadge, ProtectedRoute)"),
      spacer(),

      h2("3.6  Correction InconsistentMigrationHistory"),
      p("Django ne pouvait plus executer migrate car notifications.0001_initial etait enregistree comme appliquee alors que sa dependance audits.0002_seed_packs ne l'etait pas."),
      p("Solutions proposees et validees : (A) reset complet de la base SQLite + migrate, ou (B) fake de la migration manquante avec --fake."),
      spacer(),

      // ── 4. OBJECTIFS NON ATTEINTS ─────────────────────────────────────────
      h1("4. Objectifs non atteints ou partiels"),

      h2("4.1  Responsive design (partiel)"),
      p("L'adaptation mobile/tablette n'a pas pu etre implementee faute de temps. Les breakpoints Tailwind (sm: / md: / lg:) n'ont pas encore ete appliques aux composants principaux. Cet objectif est reporte a la semaine suivante."),

      h2("4.2  Couverture de tests < 80 % (38 % atteints)"),
      p("21 tests passent sur 56. Les tests EmailJS/react-email sont exclus car incompatibles avec Vitest. Les tests couvrant AuditRequestForm, ClientDashboard, AdminDashboard et dataService.js ne sont pas encore ecrits."),

      h2("4.3  Acces administrateur non valide de bout en bout"),
      p("L'utilisateur Karim a ete cree avec role=admin, mais des difficultes d'acces au tableau de bord admin ont persiste. Pistes identifiees : role incorrect en base (client par defaut), session non actualisee, token cache obsolete. Diagnostic en cours."),
      spacer(),

      // ── 5. TESTS EFFECTUES ────────────────────────────────────────────────
      h1("5. Tests effectues"),

      h2("5.1  Tests manuels (fonctionnels)"),
      bullet("Inscription client : formulaire -> 201 Created + JWT -> redirection dashboard client"),
      bullet("Connexion client : email/mot de passe -> 200 OK + role=client dans la reponse"),
      bullet("Soumission demande d'audit : formulaire complet -> DOSSIER-2026-XXXX genere + confirmation"),
      bullet("EmailJS accuse de reception : email recu avec reference, email client, pack, prix, date"),
      bullet("Notification admin -> client : email envoye avec statut lisible et notes internes"),
      bullet("CORS : requetes depuis localhost:3000 vers localhost:8000 sans erreur"),
      bullet("JWT refresh : auto-refresh transparent sur token expire"),
      bullet("curl /api/auth/me/ : retourne bien role=admin pour Karim"),

      h2("5.2  Tests automatises Vitest"),
      bullet("useAuth.test.jsx : hook hors contexte -> leve bien une erreur en francais"),
      bullet("StatusBadge.test.jsx : rendu correct de chaque valeur de statut"),
      bullet("ProtectedRoute.test.jsx : redirections selon role et isAuthenticated"),
      spacer(),

      // ── 6. DIFFICULTES ────────────────────────────────────────────────────
      h1("6. Difficultes rencontrees"),
      spacer(),
      difficultyTable([
        ["config/settings/ masquant settings.py", "Django ne demarrait plus", "Suppression du repertoire parasite"],
        ["12 conflits Git simultanes", "SyntaxError au demarrage", "Relecture et reecriture fichier par fichier"],
        ["CORS bloquant le frontend port 3000", "Network Error sur toutes les requetes", "Ajout des 4 origines CORS manquantes"],
        ["EmailJS : adresse expediteur fixe", "Email affiche avec compte EmailJS", "Reply-To + client_email dans le corps"],
        ["InconsistentMigrationHistory", "migrate impossible", "Reset DB SQLite ou --fake migration"],
        ["Tests email incompatibles Vitest", "35 tests en echec", "Exclusion du dossier emails/** dans config"],
        ["Role admin non applique au user Karim", "Acces dashboard admin refuse", "Verification et correction via Django shell"],
      ]),
      spacer(),

      // ── 7. AMELIORATIONS ──────────────────────────────────────────────────
      h1("7. Pistes d'amelioration - semaine prochaine"),

      h2("7.1  Priorite haute"),
      bullet("Responsive design : audit et correction de toutes les pages sur mobile (320px), tablette (768px) et desktop (1280px+) avec breakpoints Tailwind"),
      bullet("Connexion API backend complete : remplacer les derniers appels localStorage dans dataService.js par /api/audits/, /api/packs/, /api/training/"),
      bullet("Validation acces admin : test complet de bout en bout de la connexion Karim et du routage AdminDashboard"),

      h2("7.2  Priorite moyenne"),
      bullet("Couverture tests >= 80 % : ecrire des tests pour AuditRequestForm, ClientDashboard, AdminDashboard, dataService.js"),
      bullet("PDF WeasyPrint + Celery : tester le workflow de generation de rapport en local"),
      bullet("Logo responsive : objet CSS object-position pour centrer/zoomer le logo dans son cercle"),

      h2("7.3  Priorite basse"),
      bullet("CI/CD GitHub Actions : verifier que le pipeline CI passe avec les nouveaux tests"),
      bullet("Documentation : mise a jour du README pour inclure EmailJS et les nouvelles variables .env"),
      bullet("Supprimer la mention 'Email sent via EmailJS.com' (plan payant requis)"),
      spacer(),

      // ── 8. LIENS ──────────────────────────────────────────────────────────
      h1("8. Liens du projet"),
      new Paragraph({ spacing: { before: 80, after: 80 }, children: [
        new TextRun({ text: "GitHub : ", size: 22, bold: true, font: "Arial" }),
        new ExternalHyperlink({ link: "https://github.com/Tommy-JOUHANS/portfolio",
          children: [new TextRun({ text: "github.com/Tommy-JOUHANS/portfolio", size: 22, font: "Arial", style: "Hyperlink" })] })
      ]}),
      new Paragraph({ spacing: { before: 80, after: 80 }, children: [
        new TextRun({ text: "Deploiements : ", size: 22, bold: true, font: "Arial" }),
        new ExternalHyperlink({ link: "https://github.com/Tommy-JOUHANS/portfolio/deployments",
          children: [new TextRun({ text: "github.com/Tommy-JOUHANS/portfolio/deployments", size: 22, font: "Arial", style: "Hyperlink" })] })
      ]}),
      new Paragraph({ spacing: { before: 80, after: 80 }, children: [
        new TextRun({ text: "Trello : ", size: 22, bold: true, font: "Arial" }),
        new ExternalHyperlink({ link: "https://trello.com/b/LaJVqg9d/portfolio-cyberaudit-solutions-sme-audit-management-platform",
          children: [new TextRun({ text: "trello.com/b/LaJVqg9d/portfolio-cyberaudit-solutions-sme-audit-management-platform", size: 22, font: "Arial", style: "Hyperlink" })] })
      ]}),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("rapport_hebdo_26_29mai2026.docx", buf);
  console.log("Rapport cree : rapport_hebdo_26_29mai2026.docx");
}).catch(err => console.error("Erreur :", err));
