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
    // @xs: = container query : s'adapte a la largeur du CONTENEUR PARENT
    // (la grille de stats) plutot qu'a la largeur du viewport.
    // Quand la grille fait >= 480px, les cartes ont plus de padding / texte plus grand.
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm @xs:p-5">
      {/* Libelle de la statistique, en petit et en gris.                 */}
      <p className="text-sm text-gray-500">{label}</p>
      {/* Valeur chiffree : text-2xl par defaut, text-3xl quand le
          conteneur parent (grille) est >= 480px.                         */}
      <p className={`mt-1 text-2xl font-extrabold @xs:text-3xl ${accentClass}`}>{value}</p>
    </div>
  );
}
