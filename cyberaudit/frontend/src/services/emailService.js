// ========================================================================
// emailService.js - Envoi d'emails via EmailJS (côté frontend).
// Deux fonctions publiques :
//   • sendAuditConfirmation : accusé de réception après soumission d'audit.
//   • sendStatusNotification : notification de suivi envoyée par l'admin.
// ========================================================================

import emailjs from "@emailjs/browser";

// ── Configuration (variables d'environnement Vite) ───────────────────────
const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_CONFIRM = import.meta.env.VITE_EMAILJS_TEMPLATE_CONFIRM;
const TEMPLATE_UPDATE  = import.meta.env.VITE_EMAILJS_TEMPLATE_UPDATE;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

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
  company_name,
  pack_name,
  reference,
}) {
  if (!SERVICE_ID || !TEMPLATE_CONFIRM || !PUBLIC_KEY) {
    console.warn(
      "[emailService] Variables VITE_EMAILJS_* manquantes — email non envoyé.",
    );
    return;
  }

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_CONFIRM,
    {
      to_email,
      to_name,
      company_name,
      pack_name,
      reference,
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
  if (!SERVICE_ID || !TEMPLATE_UPDATE || !PUBLIC_KEY) {
    console.warn(
      "[emailService] Variables VITE_EMAILJS_* manquantes — email non envoyé.",
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
