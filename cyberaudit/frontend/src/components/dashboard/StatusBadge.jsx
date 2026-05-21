// ========================================================================
// StatusBadge.jsx - Pastille coloree affichant le statut d'une demande.
// Composant reutilisable cite dans la doc (section 4.3, "Reusable UI
// components") : StatusBadge avec un code couleur gris/bleu/vert/violet.
// Les 4 statuts proviennent du cycle de vie AUDIT_REQUEST (doc 4.2).
// ========================================================================

// Table de correspondance : pour chaque statut, son libelle et ses couleurs.
const STATUS_CONFIG = {
  // "pending" (en attente) -> gris.
  pending: { label: "Pending", classes: "bg-gray-100 text-gray-700" },
  // "in_progress" (en cours) -> bleu.
  in_progress: { label: "In Progress", classes: "bg-blue-100 text-blue-700" },
  // "completed" (termine) -> vert.
  completed: { label: "Completed", classes: "bg-green-100 text-green-700" },
  // "archived" (archive) -> violet.
  archived: { label: "Archived", classes: "bg-purple-100 text-purple-700" },
};

// StatusBadge recoit la prop "status" : le statut brut de la demande.
export default function StatusBadge({ status }) {
  // On recupere la configuration correspondant au statut recu.
  // Si le statut est inconnu, on retombe sur une configuration neutre.
  const config = STATUS_CONFIG[status] || {
    label: status, // on affiche le statut tel quel
    classes: "bg-gray-100 text-gray-700", // couleurs neutres par defaut
  };

  // Rendu de la pastille.
  return (
    // <span> arrondi, petit texte en gras, couleurs issues de la config.
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.classes}`}
    >
      {/* Libelle lisible du statut.                                      */}
      {config.label}
    </span>
  );
}
