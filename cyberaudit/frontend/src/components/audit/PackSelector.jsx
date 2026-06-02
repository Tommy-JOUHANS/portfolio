// ========================================================================
// PackSelector.jsx - Selection d'un pack + panneau "Included Services".
// Reprend la zone centrale de l'ecran 5 : a gauche les 4 boutons radio,
// a droite le detail du pack selectionne (services, public, perimetre,
// delai, prix). Cite dans la doc (section 4.3) sous le nom "PackSelector".
// ========================================================================

// PackSelector recoit 3 props :
//  - packages : la liste des 4 packs disponibles
//  - selectedCode : le code du pack actuellement choisi (ou "")
//  - onSelect : fonction appelee avec le code du pack quand on en choisit un
export default function PackSelector({ packages, selectedCode, onSelect }) {
  // On retrouve l'objet pack correspondant au code selectionne (ou null).
  const selectedPack =
    packages.find((pack) => pack.code === selectedCode) || null;

  // Rendu du selecteur.
  return (
    // Grille : 1 colonne sur mobile, 2 colonnes sur grand ecran.
    <div className="grid gap-5 sm:grid-cols-2">
      {/* ===== Colonne gauche : les 4 boutons radio ==================== */}
      <div>
        {/* Intitule de la zone de selection.                             */}
        <p className="mb-2 text-sm font-semibold text-gray-700">
          Select pack :
        </p>
        {/* Liste verticale des packs sous forme de boutons radio.        */}
        <div className="flex flex-col gap-2">
          {/* Un <label> cliquable par pack.                              */}
          {packages.map((pack) => (
            <label
              key={pack.code}
              // Le label entier est cliquable ; surbrillance si selectionne.
              className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                selectedCode === pack.code
                  ? "border-brand bg-brand-soft" // pack choisi
                  : "border-gray-200 hover:border-brand/50" // pack non choisi
              }`}
            >
              {/* Bouton radio natif (tous lies par le meme name).        */}
              <input
                type="radio"
                name="pack"
                value={pack.code}
                checked={selectedCode === pack.code}
                onChange={() => onSelect(pack.code)}
                className="accent-brand"
              />
              {/* Nom commercial du pack.                                 */}
              <span className="font-medium text-gray-800">{pack.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ===== Colonne droite : panneau "Included Services" ============ */}
      <div className="rounded-md border border-gray-200 bg-cream p-4 text-sm">
        {/* Titre du panneau.                                             */}
        <p className="mb-2 font-semibold text-gray-700">Included Services:</p>

        {/* Si aucun pack n'est selectionne : message d'invitation.       */}
        {!selectedPack ? (
          <p className="text-gray-400">
            Select a package to view service details.
          </p>
        ) : (
          // Sinon : liste de description (couples terme / valeur).
          <dl className="flex flex-col gap-2 text-gray-600">
            {/* Services inclus.                                          */}
            <div>
              <dt className="font-semibold text-brand">Included services</dt>
              <dd>{selectedPack.included_services}</dd>
            </div>
            {/* Public cible.                                             */}
            <div>
              <dt className="font-semibold text-brand">For whom?</dt>
              <dd>{selectedPack.for_whom}</dd>
            </div>
            {/* Perimetre d'analyse.                                      */}
            <div>
              <dt className="font-semibold text-brand">Perimeter</dt>
              <dd>{selectedPack.perimeter}</dd>
            </div>
            {/* Delai estime de traitement.                               */}
            <div>
              <dt className="font-semibold text-brand">Analysis estimate</dt>
              <dd>{selectedPack.duration_days} business days</dd>
            </div>
            {/* Prix du pack.                                             */}
            <div>
              <dt className="font-semibold text-brand">Price</dt>
              <dd className="font-bold text-gray-800">
                {selectedPack.price} EUR
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
