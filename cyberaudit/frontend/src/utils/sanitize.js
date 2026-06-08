// ========================================================================
// utils/sanitize.js — Assainissement XSS avec DOMPurify.
// Utiliser sur tout contenu utilisateur affiché dans le DOM.
// ========================================================================
import DOMPurify from "dompurify";

/**
 * Retourne une chaîne nettoyée de tout HTML/JS malveillant.
 * Texte pur uniquement (aucune balise conservée).
 * @param {string} value
 * @returns {string}
 */
export function sanitize(value) {
  if (!value) return "";
  return DOMPurify.sanitize(String(value), {
    ALLOWED_TAGS: [],   // aucune balise HTML conservée
    ALLOWED_ATTR: [],   // aucun attribut conservé
  });
}
