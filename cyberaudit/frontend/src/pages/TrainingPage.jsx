// ========================================================================
// TrainingPage.jsx - Module de sensibilisation et formation (ecran 7).
// Affiche une barre de progression et la liste des modules de formation.
// Chaque module peut etre demarre puis termine ; la progression est
// persistee (localStorage via dataService).
// ========================================================================

// useState : etat local. useEffect : chargement des modules au montage.
import { useState, useEffect } from "react";
// Service de donnees : lecture des modules et mise a jour du statut.
import {
  getTrainingModules,
  updateModuleStatus,
} from "../services/dataService.js";

// Table de correspondance : pour chaque statut, son libelle et sa couleur.
const STATUS_LABELS = {
  completed: { label: "Completed", classes: "text-green-600" }, // termine
  in_progress: { label: "In progress", classes: "text-amber-500" }, // en cours
  to_start: { label: "To start", classes: "text-gray-500" }, // a commencer
};

// TrainingPage : composant de la page de formation.
export default function TrainingPage() {
  // modules : la liste des modules de formation.
  const [modules, setModules] = useState([]);

  // useEffect : charge les modules une fois, au montage de la page.
  useEffect(() => {
    // On lit les modules depuis le service de donnees.
    setModules(getTrainingModules());
  }, []); // tableau vide -> execute une seule fois

  // completedCount : nombre de modules termines.
  const completedCount = modules.filter((m) => m.status === "completed").length;
  // total : nombre total de modules.
  const total = modules.length;
  // percent : pourcentage de progression (0 si aucun module).
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // handleAdvance : fait progresser un module au clic sur son bouton.
  function handleAdvance(module) {
    // Un module "a commencer" passe a "en cours".
    if (module.status === "to_start") {
      setModules(updateModuleStatus(module.id, "in_progress"));
    // Un module "en cours" passe a "termine".
    } else if (module.status === "in_progress") {
      setModules(updateModuleStatus(module.id, "completed"));
    }
    // Un module deja "termine" : le bouton "Review" ne change rien.
  }

  // buttonLabel : renvoie le libelle du bouton selon le statut du module.
  function buttonLabel(status) {
    // Termine -> "Review" ; en cours -> "Continue" ; sinon -> "Start".
    if (status === "completed") return "Review";
    if (status === "in_progress") return "Continue";
    return "Start";
  }

  // Rendu de la page.
  return (
    <div className="flex flex-col gap-6">
      {/* ---- En-tete : titre et sous-titre ----------------------------- */}
      <div>
        {/* Titre principal de la page.                                   */}
        <h1 className="text-2xl font-bold text-brand">Awareness &amp; Training</h1>
        {/* Sous-titre explicatif.                                        */}
        <p className="text-sm italic text-gray-500">
          Build your team's cybersecurity reflexes - simple, useful, no jargon.
        </p>
      </div>

      {/* ---- Carte de progression globale ------------------------------ */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        {/* Ligne titre + compteur de modules termines.                   */}
        <div className="flex items-center justify-between">
          {/* Libelle de la barre de progression.                         */}
          <span className="font-bold text-brand">My progress</span>
          {/* Compteur "X / total modules completed".                     */}
          <span className="text-sm text-gray-500">
            {completedCount} / {total} modules completed
          </span>
        </div>
        {/* Rail gris de la barre de progression.                         */}
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
          {/* Remplissage violet : largeur proportionnelle au pourcentage. */}
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* ---- Grille des modules de formation --------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Une carte par module.                                         */}
        {modules.map((module) => {
          // Configuration d'affichage du statut (libelle + couleur).
          const statusInfo = STATUS_LABELS[module.status] || STATUS_LABELS.to_start;
          // Rendu de la carte du module.
          return (
            // Carte blanche, cle unique = identifiant du module.
            <div
              key={module.id}
              className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              {/* Titre du module.                                        */}
              <h3 className="font-bold text-brand">{module.title}</h3>
              {/* Description courte du module.                           */}
              <p className="mt-1 flex-1 text-sm text-gray-600">
                {module.description}
              </p>
              {/* Ligne de statut, dans la couleur correspondante.        */}
              <p className="mt-3 text-sm">
                <span className="text-gray-500">Status: </span>
                <span className={`font-semibold ${statusInfo.classes}`}>
                  {statusInfo.label}
                </span>
              </p>
              {/* Bouton d'action du module.                              */}
              <button
                type="button"
                onClick={() => handleAdvance(module)}
                // Style different : gris discret si termine, violet sinon.
                className={`mt-3 rounded-md py-2 text-sm font-semibold transition ${
                  module.status === "completed"
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-brand text-white hover:bg-brand-dark"
                }`}
              >
                {buttonLabel(module.status)}
              </button>
            </div>
          );
        })}
      </div>

      {/* ---- Note de perimetre : contenu detaille a venir -------------- */}
      <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
        Le contenu detaille des modules (videos, documentation) sera ajoute
        ulterieurement, conformement a la doc (ecran 7).
      </p>
    </div>
  );
}
