// ========================================================================
// Sidebar.jsx - Menu lateral des portails connectes (client et admin).
// Reprend le panneau "Client Portal" des maquettes (ecrans 4, 5, 7).
// Le menu s'adapte au role de l'utilisateur connecte.
// ========================================================================

// NavLink : comme Link, mais sait s'il pointe vers la page courante
// (utile pour mettre en surbrillance l'element de menu actif).
import { NavLink } from "react-router-dom";
// Icones lucide-react illustrant chaque entree du menu.
import { LayoutGrid, FileText, GraduationCap } from "lucide-react";
// useAuth : pour connaitre le role de l'utilisateur connecte.
import { useAuth } from "../../hooks/useAuth.js";

// Menu du portail CLIENT : 3 entrees (doc ecrans 4, 5, 7).
const CLIENT_MENU = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid }, // tableau de bord
  { to: "/audit/new", label: "Audit Request", icon: FileText }, // formulaire d'audit
  { to: "/training", label: "Training", icon: GraduationCap }, // formation
];

// Menu du portail ADMIN (le portail admin complet sera ajoute plus tard).
const ADMIN_MENU = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid }, // tableau de bord admin
];

// Sidebar : composant du menu lateral.
export default function Sidebar() {
  // On recupere l'utilisateur connecte pour connaitre son role.
  const { user } = useAuth();
  // On choisit le menu a afficher selon le role (client ou admin).
  const menu = user?.role === "admin" ? ADMIN_MENU : CLIENT_MENU;
  // Titre du panneau, different selon le role.
  const portalTitle = user?.role === "admin" ? "Admin Portal" : "Client Portal";

  // Rendu du menu lateral.
  return (
    // <aside> : panneau blanc ; largeur fixe a partir de la taille "sm".
    <aside className="w-full shrink-0 border-b border-gray-100 bg-white p-4 sm:w-56 sm:border-b-0 sm:border-r">
      {/* Titre du portail.                                               */}
      <h2 className="mb-4 px-2 text-lg font-bold text-gray-800">
        {portalTitle}
      </h2>

      {/* <nav> : liste verticale des liens du menu.                       */}
      <nav className="flex flex-col gap-1">
        {/* On genere un lien par entree du menu choisi.                   */}
        {menu.map((item) => {
          // On stocke l'icone dans une variable a majuscule (composant).
          const Icon = item.icon;
          // Rendu d'une entree de menu.
          return (
            // NavLink : la fonction className recoit { isActive }.
            <NavLink
              key={item.to}
              to={item.to}
              // "end" : actif uniquement si l'URL correspond exactement.
              end
              className={({ isActive }) =>
                // Style commun + style different selon que le lien est actif.
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand text-white" // lien actif : fond violet
                    : "text-gray-600 hover:bg-brand-soft" // lien inactif
                }`
              }
            >
              {/* Icone de l'entree de menu.                               */}
              <Icon size={18} />
              {/* Libelle de l'entree de menu.                             */}
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
