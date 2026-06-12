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
    // <aside> : panneau blanc.
    // Mobile  (< 768px)  : barre horizontale en haut, largeur pleine
    //   — nav en flex-row avec defilement horizontal (overflow-x-auto)
    //   — pas de titre visible (gain de place), juste les liens
    // Tablette (≥ 768px) : colonne laterale gauche, largeur fixe 224px
    //   — bordure droite, titre du portail visible, liens verticaux
    <aside className="w-full shrink-0 border-b border-gray-100 bg-white md:w-56 md:border-b-0 md:border-r">
      {/* Titre du portail : masque sur mobile (gain de place),
          affiche a partir de la tablette (md:block).                     */}
      <h2 className="hidden px-4 pt-5 pb-3 text-lg font-bold text-gray-800 md:block md:px-6">
        {portalTitle}
      </h2>

      {/* <nav> :
          Mobile  : flex-row, defilement horizontal, padding compact
          Tablette+: flex-col, liens verticaux                            */}
      <nav className="flex flex-row gap-1 overflow-x-auto px-3 py-2 md:flex-col md:px-3 md:py-2">
        {/* On genere un lien par entree du menu choisi.                   */}
        {menu.map((item) => {
          // On stocke l'icone dans une variable a majuscule (composant).
          const Icon = item.icon;
          // Rendu d'une entree de menu.
          return (
            // NavLink : la fonction className recoit { isActive }.
            // Mobile  : liens cote a cote (flex-shrink-0 pour ne pas ecraser)
            // Tablette+: liens empiles (comportement normal)
            <NavLink
              key={item.to}
              to={item.to}
              // "end" : actif uniquement si l'URL correspond exactement.
              end
              className={({ isActive }) =>
                // Style commun + style different selon que le lien est actif.
                // shrink-0 evite que les liens se compriment sur mobile
                `flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
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
