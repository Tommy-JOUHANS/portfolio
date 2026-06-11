// ========================================================================
// emailService.js - Envoi d'emails via EmailJS (côté frontend).
// Deux fonctions publiques :
//   • sendAuditConfirmation : accusé de réception après soumission d'audit.
//   • sendStatusNotification : notification de suivi envoyée par l'admin.
// ========================================================================

import emailjs from "@emailjs/browser";

// ── sendAuditConfirmation ─────────────────────────────────────────────────
// Envoie un accusé de réception au client après soumission de sa demande.
//
// @param {object} params
//   - to_email      : adresse email du client
//   - to_name       : prénom du client (ex. "Alice")
//   - company_name  : raison sociale (ex. "Acme Corp")
//   - pack_name     : nom du pack choisi (ex. "Pack Essentiel")
//   - reference     : numéro de dossier (ex. "DOSSIER-2024-0001")
//
// @returns {Promise<void>} Résout si l'email est envoyé, rejette sinon.
// ─────────────────────────────────────────────────────────────────────────
export async function sendAuditConfirmation({
  to_email,
  to_name,
  username,
  company_name,
  pack_name,
  services_included,
  price,
  processing_time,
  message,
  reference,
}) {
  // Lu à chaque appel pour que vi.stubEnv() fonctionne en tests unitaires.
  const SERVICE_ID     = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const TEMPLATE_CONFIRM = import.meta.env.VITE_EMAILJS_TEMPLATE_CONFIRM;
  const PUBLIC_KEY     = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!SERVICE_ID || !TEMPLATE_CONFIRM || !PUBLIC_KEY) {
    console.warn(
      "[emailService] Variables VITE_EMAILJS_* missing, email not sent.",
    );
    return;
  }

  // submitted_at : date/heure lisible au format français.
  const submitted_at = new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_CONFIRM,
    {
      to_email,
      client_email: to_email,
      to_name,
      username,
      company_name,
      pack_name,
      services_included,
      price,
      processing_time,
      message: message || "-",
      reference,
      submitted_at,
    },
    PUBLIC_KEY,
  );
}

// ── sendStatusNotification ────────────────────────────────────────────────
// Notifie le client d'un changement de statut de sa demande.
//
// @param {object} params
//   - to_email      : adresse email du client
//   - to_name       : prénom du client
//   - reference     : numéro de dossier
//   - new_status    : nouveau statut en clair (ex. "En cours", "Terminé")
//   - message       : message personnalisé de l'opérateur (optionnel)
//
// @returns {Promise<void>}
// ─────────────────────────────────────────────────────────────────────────
export async function sendStatusNotification({
  to_email,
  to_name,
  reference,
  new_status,
  message = "",
}) {
  // Lu à chaque appel pour que vi.stubEnv() fonctionne en tests unitaires.
  const SERVICE_ID    = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const TEMPLATE_UPDATE = import.meta.env.VITE_EMAILJS_TEMPLATE_UPDATE;
  const PUBLIC_KEY    = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!SERVICE_ID || !TEMPLATE_UPDATE || !PUBLIC_KEY) {
    console.warn(
      "[emailService] Variables VITE_EMAILJS_* missing, email not sent.",
    );
    return;
  }

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_UPDATE,
    {
      to_email,
      to_name,
      reference,
      new_status,
      message,
    },
    PUBLIC_KEY,
  );
}