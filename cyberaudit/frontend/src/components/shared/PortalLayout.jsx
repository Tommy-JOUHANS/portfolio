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
      {/* Conteneur centre ; colonne sur mobile, ligne sur grand ecran.   */}
      <div className="mx-auto flex max-w-6xl flex-col sm:flex-row">
        {/* Menu lateral (a gauche sur grand ecran, en haut sur mobile).  */}
        <Sidebar />
        {/* Zone de contenu : occupe tout l'espace restant.               */}
        <div className="min-w-0 flex-1 p-6">
          {/* Outlet : la page du portail (Dashboard, Audit, Training...). */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
