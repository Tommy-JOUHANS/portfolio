// ========================================================================
// PortalLayout.jsx - Mise en page commune aux portails connectes.
// Place le menu lateral (Sidebar) a gauche et la page courante a droite.
// Utilise comme route "parente" dans App.jsx : la page enfant s'affiche
// a l'emplacement du <Outlet />.
// ========================================================================

// Outlet : emplacement ou React Router rend la route enfant active.
import { Outlet } from "react-router-dom";
// Sidebar : le menu lateral du portail.
import Sidebar from "./Sidebar.jsx";

// PortalLayout : composant de mise en page du portail.
export default function PortalLayout() {
  // Rendu de la mise en page.
  return (
    // Fond creme sur toute la zone du portail.
    <div className="bg-cream">
      {/* Conteneur centre.
          Mobile  (< 768px)  : flex-col — Sidebar en haut, contenu dessous
          Tablette (≥ 768px) : flex-row — Sidebar a gauche, contenu a droite
          Avant : sm:flex-row (640px) — trop etroit pour avoir sidebar + contenu */}
      <div className="mx-auto flex max-w-[74.125rem] flex-col md:flex-row">
        {/* Menu lateral (a gauche sur tablette+, en haut sur mobile).    */}
        <Sidebar />
        {/* Zone de contenu : occupe tout l'espace restant.
            Mobile  : p-4 — marge reduite sur petit ecran
            sm+     : p-6 — standard
            @container : declare ce div comme contexte de container query
            pour que les composants portail (grilles, cartes) s'adaptent
            a la largeur reelle disponible (sans la sidebar sur desktop).  */}
        <div className="@container min-w-0 flex-1 p-4 sm:p-6">
          {/* Outlet : la page du portail (Dashboard, Audit, Training...). */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
