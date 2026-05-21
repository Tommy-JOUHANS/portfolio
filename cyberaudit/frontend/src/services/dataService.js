// ========================================================================
// dataService.js - Couche d'acces aux donnees (portail client + admin).
//
// BASE DE DONNEES TEMPORAIRE cote front (en attendant le backend Django) :
//  - donnees de reference / demo chargees depuis les fichiers src/data/*.json
//  - les modifications (nouvelle demande, changement de statut, rapport,
//    progression de formation) sont persistees dans le localStorage.
//
// Quand l'API REST de James sera prete (endpoints /api/audits/, /api/packs/,
// /api/training/, /api/audits/{id}/generate-report/ de la doc section 6.2),
// il suffira de remplacer le corps de ces fonctions par des appels HTTP.
// ========================================================================

// Donnees de reference : les 4 packs (ne changent jamais -> import direct).
import seedPackages from "../data/packages.json";
// Donnees de demonstration : les demandes d'audit.
import seedRequests from "../data/requests.json";
// Donnees de demonstration : les modules de formation.
import seedTraining from "../data/training.json";
// Donnees de demonstration : les notifications.
import seedNotifications from "../data/notifications.json";
// Donnees de demonstration : les rapports de vulnerabilite.
import seedReports from "../data/reports.json";

// Cles de stockage utilisees dans le localStorage du navigateur.
const REQUESTS_KEY = "cyberaudit:requests"; // demandes d'audit
const TRAINING_KEY = "cyberaudit:training"; // modules de formation
const NOTIFICATIONS_KEY = "cyberaudit:notifications"; // notifications
const REPORTS_KEY = "cyberaudit:reports"; // rapports de vulnerabilite
// Cle stockant la version des donnees de demonstration.
const VERSION_KEY = "cyberaudit:dataVersion";

// Version courante des donnees de demonstration.
// >> A INCREMENTER a chaque fois que les fichiers src/data/*.json changent.
const DATA_VERSION = "2";

// ------------------------------------------------------------------------
// Verification de version : si les fichiers de demo ont change depuis la
// derniere visite, on efface les collections du localStorage pour que les
// nouvelles donnees de demonstration soient rechargees. (La session de
// connexion, geree par authService, n'est PAS touchee.)
// Cette fonction s'execute une seule fois, au chargement du module.
// ------------------------------------------------------------------------
(function ensureDataVersion() {
  // Version actuellement memorisee dans le navigateur.
  const storedVersion = localStorage.getItem(VERSION_KEY);
  // Si elle differe de la version courante, on reinitialise les collections.
  if (storedVersion !== DATA_VERSION) {
    // On supprime les 4 collections de donnees de demonstration.
    localStorage.removeItem(REQUESTS_KEY);
    localStorage.removeItem(TRAINING_KEY);
    localStorage.removeItem(NOTIFICATIONS_KEY);
    localStorage.removeItem(REPORTS_KEY);
    // On enregistre la nouvelle version pour ne pas recommencer au prochain chargement.
    localStorage.setItem(VERSION_KEY, DATA_VERSION);
  }
})();

// Libelles lisibles des statuts (utilises dans l'historique).
const STATUS_LABELS = {
  pending: "Pending", // en attente
  in_progress: "In Progress", // en cours
  completed: "Completed", // termine
  archived: "Archived", // archive
};

// Modele de rapport de vulnerabilite (donnees de demonstration).
// Utilise par generateReport() pour creer un rapport quand il n'en existe
// pas encore. Le vrai contenu sera produit par le backend (WeasyPrint).
const REPORT_TEMPLATE = {
  grade: "B+", // note globale (echelle A a F)
  security_score: 72, // score de securite sur 100
  verdict: "Acceptable - 3 medium-severity vulnerabilities found",
  summary:
    "EBIOS RM analysis performed on the IS perimeter declared by the client. 3 vulnerabilities identified, none critical. Action plan attached, prioritized over 30 days.",
  findings: [
    {
      severity: "Medium",
      asset: "Email server",
      description: "No DMARC policy",
      recommendation: "Activate DMARC + SPF + DKIM",
    },
    {
      severity: "Medium",
      asset: "Wifi router",
      description: "Default WPA2 password",
      recommendation: "Rotate password and enable WPA3",
    },
    {
      severity: "Low",
      asset: "Workstation",
      description: "Outdated antivirus",
      recommendation: "Update Defender + central console",
    },
  ],
  action_plan: [
    { week: "Week 1", action: "DMARC/SPF/DKIM activation" },
    { week: "Week 2", action: "Wi-Fi rotation + WPA3 migration" },
    { week: "Week 3", action: "Endpoint update campaign" },
    { week: "Week 4", action: "Final compliance check" },
  ],
};

// ------------------------------------------------------------------------
// readCollection : lit une collection depuis le localStorage.
// Au premier appel, elle initialise le stockage avec les donnees de demo.
// ------------------------------------------------------------------------
function readCollection(key, seed) {
  // On lit le contenu actuel du localStorage pour cette cle.
  const stored = localStorage.getItem(key);
  // Si rien n'est encore stocke, on initialise avec les donnees de demo.
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(seed));
    // On renvoie une copie des donnees de demo.
    return [...seed];
  }
  // Sinon on reconvertit le texte JSON en tableau JavaScript.
  return JSON.parse(stored);
}

// ------------------------------------------------------------------------
// writeCollection : enregistre une collection dans le localStorage.
// ------------------------------------------------------------------------
function writeCollection(key, collection) {
  // On serialise le tableau en texte avant de l'ecrire.
  localStorage.setItem(key, JSON.stringify(collection));
}

// ========================  PACKS  =======================================

// getPackages : retourne la liste des 4 packs (donnees de reference).
export function getPackages() {
  // Les packs ne sont jamais modifies : on renvoie une copie du fichier JSON.
  return [...seedPackages];
}

// getPackageByCode : retrouve un pack a partir de son code.
export function getPackageByCode(code) {
  // find() renvoie le premier pack dont le code correspond (ou null).
  return seedPackages.find((pack) => pack.code === code) || null;
}

// ========================  DEMANDES D'AUDIT  ============================

// getAllRequests : retourne TOUTES les demandes (vue admin).
export function getAllRequests() {
  // On lit toutes les demandes (initialisation au premier appel)...
  return readCollection(REQUESTS_KEY, seedRequests)
    // ...puis on les trie de la plus recente a la plus ancienne.
    .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
}

// getRequestsByClientId : retourne les demandes d'un client donne (vue client).
export function getRequestsByClientId(clientId) {
  // On part de toutes les demandes triees...
  return getAllRequests().filter(
    // ...et on garde seulement celles du client demande.
    (request) => request.client_id === clientId,
  );
}

// getRequestByReference : retrouve une demande grace a son numero de dossier.
export function getRequestByReference(reference) {
  // On cherche dans toutes les demandes celle qui a cette reference.
  return (
    getAllRequests().find((request) => request.reference === reference) || null
  );
}

// generateReference : fabrique le prochain numero de dossier unique.
function generateReference(allRequests) {
  // On extrait le numero (partie chiffree) de chaque reference existante.
  const numbers = allRequests.map((request) => {
    // Une reference a la forme "DOSSIER-2026-0007" -> on prend "0007".
    const lastPart = request.reference.split("-").pop();
    // On convertit cette partie en nombre entier.
    return parseInt(lastPart, 10) || 0;
  });
  // Le plus grand numero existant (0 si aucune demande).
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  // Nouveau numero = plus grand + 1, complete sur 4 chiffres.
  const nextNumber = String(maxNumber + 1).padStart(4, "0");
  // On assemble la reference complete au format de la doc.
  return `DOSSIER-2026-${nextNumber}`;
}

// createRequest : enregistre une nouvelle demande d'audit (cote client).
// Equivalent futur : POST /api/audits/ (voir doc section 6.2.2).
export function createRequest({
  clientId, // identifiant du client connecte
  username, // nom d'utilisateur saisi
  companyName, // raison sociale saisie
  contactName, // nom complet du contact (prenom + nom)
  clientEmail, // email du client connecte
  packCode, // code du pack choisi
  message, // message libre, facultatif
}) {
  // On lit la liste actuelle des demandes.
  const all = readCollection(REQUESTS_KEY, seedRequests);
  // On retrouve le pack choisi (pour son nom dans l'historique).
  const pack = getPackageByCode(packCode);
  // Date de soumission, calculee une fois pour etre coherente partout.
  const now = new Date().toISOString();

  // On construit la nouvelle demande selon le schema AUDIT_REQUEST (doc 4.2).
  const newRequest = {
    id: `req-${Date.now()}`, // identifiant unique
    reference: generateReference(all), // numero de dossier genere
    client_id: clientId, // client qui soumet
    username: username.trim(), // nom d'utilisateur saisi
    company_name: companyName.trim(), // raison sociale saisie
    contact_name: contactName, // nom complet du contact
    client_email: clientEmail, // email du client
    pack_code: packCode, // pack choisi
    status: "pending", // toute nouvelle demande demarre "en attente"
    assigned_to: "", // aucun operateur assigne au depart
    message: message.trim(), // message libre (peut etre vide)
    internal_notes: "", // notes internes vides au depart
    submitted_at: now, // date de soumission
    history: [
      // Premiere entree d'historique : la soumission de la demande.
      {
        date: now,
        author: contactName,
        action: `Request submitted (${pack ? pack.name : packCode})`,
      },
    ],
  };

  // On ajoute la nouvelle demande puis on enregistre la liste.
  all.push(newRequest);
  writeCollection(REQUESTS_KEY, all);

  // On cree une notification "accuse de reception" pour le client.
  addNotification({
    userId: clientId,
    requestReference: newRequest.reference,
    type: "request_received",
    message: `${newRequest.reference} - Request submitted (acknowledgment sent)`,
  });

  // On retourne la demande creee (pour rediriger vers la confirmation).
  return newRequest;
}

// updateRequest : met a jour une demande (statut, assignation, notes).
// Equivalent futur : PATCH /api/audits/{id}/ (doc section 6.2.2).
export function updateRequest(reference, changes, author) {
  // On lit toutes les demandes.
  const all = readCollection(REQUESTS_KEY, seedRequests);
  // On localise l'index de la demande visee.
  const index = all.findIndex((request) => request.reference === reference);
  // Si la demande n'existe pas, on s'arrete (rien a mettre a jour).
  if (index === -1) return null;

  // L'ancienne version de la demande.
  const old = all[index];
  // Copie de l'historique existant (auquel on ajoutera les changements).
  const history = [...old.history];
  // Horodatage commun a toutes les entrees d'historique de cette mise a jour.
  const now = new Date().toISOString();

  // Changement de statut detecte ?
  if (changes.status && changes.status !== old.status) {
    // On journalise le changement de statut dans l'historique.
    history.push({
      date: now,
      author,
      action: `Status changed: ${STATUS_LABELS[old.status]} -> ${STATUS_LABELS[changes.status]}`,
    });
    // On notifie aussi le client du changement de statut.
    addNotification({
      userId: old.client_id,
      requestReference: reference,
      type: "status_changed",
      message: `${reference} - Status changed: ${STATUS_LABELS[old.status]} -> ${STATUS_LABELS[changes.status]}`,
    });
  }

  // Changement d'operateur assigne detecte ?
  if (changes.assigned_to !== undefined && changes.assigned_to !== old.assigned_to) {
    // On journalise la (re)assignation.
    history.push({
      date: now,
      author,
      action: `Assigned to: ${changes.assigned_to || "Unassigned"}`,
    });
  }

  // Changement des notes internes detecte ?
  if (
    changes.internal_notes !== undefined &&
    changes.internal_notes !== old.internal_notes
  ) {
    // On journalise la modification des notes internes.
    history.push({ date: now, author, action: "Internal note updated" });
  }

  // On fabrique la version mise a jour (ancienne + changements + historique).
  const updated = { ...old, ...changes, history };
  // On replace la demande mise a jour dans la liste.
  all[index] = updated;
  // On enregistre la liste.
  writeCollection(REQUESTS_KEY, all);
  // On retourne la demande mise a jour.
  return updated;
}

// archiveRequest : archive une demande (suppression "douce").
// Equivalent futur : DELETE /api/audits/{id}/ (archive, doc section 6.2.2).
export function archiveRequest(reference, author) {
  // Archiver = passer le statut a "archived" via updateRequest...
  const updated = updateRequest(reference, { status: "archived" }, author);
  // ...puis ajouter une entree d'historique explicite "Request archived".
  return addRequestHistory(reference, author, "Request archived") || updated;
}

// addRequestHistory : ajoute une entree libre dans l'historique d'une demande.
// Utilise par exemple pour le bouton "Send notification".
export function addRequestHistory(reference, author, action) {
  // On lit toutes les demandes.
  const all = readCollection(REQUESTS_KEY, seedRequests);
  // On localise la demande visee.
  const index = all.findIndex((request) => request.reference === reference);
  // Demande introuvable -> on s'arrete.
  if (index === -1) return null;
  // On ajoute la nouvelle entree d'historique.
  all[index].history.push({
    date: new Date().toISOString(),
    author,
    action,
  });
  // On enregistre la liste.
  writeCollection(REQUESTS_KEY, all);
  // On retourne la demande mise a jour.
  return all[index];
}

// ========================  RAPPORTS DE VULNERABILITE  ===================

// getReportByReference : retrouve le rapport lie a un numero de dossier.
export function getReportByReference(reference) {
  // On lit tous les rapports (initialisation au premier appel).
  const all = readCollection(REPORTS_KEY, seedReports);
  // On renvoie le rapport de cette demande (ou null si aucun).
  return all.find((report) => report.request_reference === reference) || null;
}

// generateReport : cree le rapport d'une demande s'il n'existe pas encore.
// Equivalent futur : POST /api/audits/{id}/generate-report/ (doc 5.3).
export function generateReport(reference, author) {
  // On lit tous les rapports existants.
  const all = readCollection(REPORTS_KEY, seedReports);
  // Si un rapport existe deja pour cette demande, on le renvoie tel quel.
  const existing = all.find((r) => r.request_reference === reference);
  if (existing) return existing;

  // Sinon on cree un nouveau rapport a partir du modele de demonstration.
  const newReport = {
    id: `rpt-${Date.now()}`, // identifiant unique
    request_reference: reference, // dossier concerne
    ...REPORT_TEMPLATE, // contenu (score, resume, vulnerabilites, plan)
    generated_at: new Date().toISOString(), // date de generation
  };
  // On ajoute le rapport puis on enregistre.
  all.push(newReport);
  writeCollection(REPORTS_KEY, all);
  // On journalise la generation dans l'historique de la demande.
  addRequestHistory(reference, author, "PDF report generated");
  // On retourne le rapport cree.
  return newReport;
}

// ========================  FORMATION  ==================================

// getTrainingModules : retourne la liste des modules de sensibilisation.
export function getTrainingModules() {
  // Lecture (avec initialisation au premier appel).
  return readCollection(TRAINING_KEY, seedTraining);
}

// updateModuleStatus : change le statut d'un module de formation.
export function updateModuleStatus(moduleId, newStatus) {
  // On lit tous les modules.
  const all = readCollection(TRAINING_KEY, seedTraining);
  // On reconstruit la liste en remplacant le statut du module vise.
  const updated = all.map((module) =>
    module.id === moduleId ? { ...module, status: newStatus } : module,
  );
  // On enregistre la liste mise a jour.
  writeCollection(TRAINING_KEY, updated);
  // On renvoie la nouvelle liste (pour rafraichir l'affichage).
  return updated;
}

// ========================  NOTIFICATIONS  ==============================

// getNotificationsByUserId : retourne les notifications d'un utilisateur.
export function getNotificationsByUserId(userId) {
  // On lit toutes les notifications.
  const all = readCollection(NOTIFICATIONS_KEY, seedNotifications);
  // On garde celles de l'utilisateur, de la plus recente a la plus ancienne.
  return all
    .filter((notification) => notification.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// addNotification : ajoute une nouvelle notification (fonction interne).
function addNotification({ userId, requestReference, type, message }) {
  // On lit les notifications existantes.
  const all = readCollection(NOTIFICATIONS_KEY, seedNotifications);
  // On construit la nouvelle notification selon le schema NOTIFICATION.
  const notification = {
    id: `ntf-${Date.now()}`, // identifiant unique
    user_id: userId, // destinataire
    request_reference: requestReference, // dossier concerne
    type, // request_received / status_changed / report_ready
    message, // texte affiche
    created_at: new Date().toISOString(), // date de creation
  };
  // On ajoute la notification puis on enregistre.
  all.push(notification);
  writeCollection(NOTIFICATIONS_KEY, all);
}
