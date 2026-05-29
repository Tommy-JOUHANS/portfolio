// ========================================================================
// dataService.js - Couche d'accès aux données via l'API REST Django.
//
// Toutes les fonctions sont async et utilisent l'instance axios (api.js)
// qui injecte automatiquement le JWT. Le backend filtre selon le rôle :
//   - client : ne voit que ses propres demandes
//   - admin  : voit tout
// ========================================================================
import api from "./api.js";

// ── Helpers ───────────────────────────────────────────────────────────

/** Trouve un objet dans une liste par valeur de propriété (helper local). */
function findBy(list, key, value) {
  return list.find((item) => item[key] === value) || null;
}

// ── Cache léger en mémoire pour les packs (ils ne changent jamais) ────
let _packsCache = null;

// ========================  PACKS  =======================================

export async function getPackages() {
  if (_packsCache) return _packsCache;
  const { data } = await api.get("/packs/");
  _packsCache = data;
  return data;
}

export async function getPackageByCode(code) {
  const packs = await getPackages();
  return findBy(packs, "code", code);
}

// ========================  DEMANDES D'AUDIT  ============================

/** Liste des demandes (le backend filtre client/admin automatiquement). */
export async function getAllRequests() {
  const { data } = await api.get("/audits/");
  return Array.isArray(data) ? data : (data.results ?? []);
}

/** Demandes du client connecté (alias — le backend filtre déjà). */
export async function getRequestsByClientId(_clientId) {
  return getAllRequests();
}

/** Cherche une demande par sa référence DOSSIER-YYYY-NNNN. */
export async function getRequestByReference(reference) {
  const list = await getAllRequests();
  return findBy(list, "reference", reference);
}

/** Crée une nouvelle demande d'audit. */
export async function createRequest({ packCode, message }) {
  const pack = await getPackageByCode(packCode);
  if (!pack) throw new Error(`Pack introuvable : ${packCode}`);
  const { data } = await api.post("/audits/", {
    pack: pack.id,
    scope_notes: message || "",
  });
  return data;
}

/** Met à jour une demande (admin uniquement). */
export async function updateRequest(reference, changes) {
  const audit = await getRequestByReference(reference);
  if (!audit) throw new Error(`Demande introuvable : ${reference}`);
  const payload = {};
  if (changes.status !== undefined) payload.status = changes.status;
  if (changes.internal_notes !== undefined) payload.internal_notes = changes.internal_notes;
  if (changes.assigned_to !== undefined) payload.assigned_to = changes.assigned_to;
  const { data } = await api.patch(`/audits/${audit.id}/`, payload);
  return data;
}

/** Archive une demande (soft delete, admin uniquement). */
export async function archiveRequest(reference) {
  const audit = await getRequestByReference(reference);
  if (!audit) throw new Error(`Demande introuvable : ${reference}`);
  await api.delete(`/audits/${audit.id}/`);
  return { ...audit, status: "archived" };
}

/** Le backend journalise auto les changements ; cette fn est un no-op. */
export async function addRequestHistory(reference, _author, _action) {
  return await getRequestByReference(reference);
}

// ========================  RAPPORTS  ===================================

export async function getReportByReference(reference) {
  const audit = await getRequestByReference(reference);
  if (!audit) return null;
  try {
    const { data } = await api.get(`/audits/${audit.id}/report/data/`);
    return data;
  } catch (e) {
    if (e.response?.status === 404) return null;
    throw e;
  }
}

export async function generateReport(reference, _author, findings = {}) {
  const audit = await getRequestByReference(reference);
  if (!audit) throw new Error(`Demande introuvable : ${reference}`);
  const { data } = await api.post(`/audits/${audit.id}/generate-report/`, {
    summary: findings.summary || "Audit en cours de finalisation.",
    verdict: findings.verdict || "À déterminer",
    grade: findings.grade || "C",
    security_score: findings.security_score ?? 50,
    findings: findings.findings || [],
  });
  return data;
}

/** Renvoie l'URL de téléchargement direct du PDF (avec JWT via axios baseURL). */
export function getReportDownloadUrl(auditId) {
  return `${api.defaults.baseURL}/audits/${auditId}/report/`;
}

// ========================  FORMATION  ==================================

export async function getTrainingModules() {
  const { data } = await api.get("/training/modules/");
  return data.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    status: m.user_status || "to_start",
  }));
}

export async function updateModuleStatus(moduleId, newStatus) {
  const endpoint = newStatus === "completed" ? "complete" : "start";
  await api.post(`/training/modules/${moduleId}/${endpoint}/`);
  return getTrainingModules();
}

// ========================  NOTIFICATIONS  ==============================

export async function getNotificationsByUserId(_userId) {
  const { data } = await api.get("/notifications/me/");
  return data.map((n) => ({
    id: n.id,
    user_id: _userId,
    request_reference: n.request_reference,
    type: n.type,
    message: n.message,
    created_at: n.created_at,
  }));
}
