// ========================================================================
// StatCard.jsx - Petite carte de statistique du tableau de bord.
// Reutilisee 3 fois sur le ClientDashboard (ecran 4) : demandes ouvertes,
// demandes terminees, rapports disponibles.
// ========================================================================

// StatCard recoit 3 props :
//  - label : le texte descriptif (ex. "Open requests")
//  - value : le nombre a afficher en grand
//  - accentClass : la classe Tailwind de couleur du nombre (ex. "text-brand")
export default function StatCard({ label, value, accentClass = "text-brand" }) {
  // Rendu de la carte.
  return (
    // Carte blanche, coins arrondis, ombre legere, bordure douce.
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* Libelle de la statistique, en petit et en gris.                 */}
      <p className="text-sm text-gray-500">{label}</p>
      {/* Valeur chiffree, en grand et dans la couleur d'accent fournie.   */}
      <p className={`mt-1 text-3xl font-extrabold ${accentClass}`}>{value}</p>
    </div>
  );
}
