// ========================================================================
// ProtectedRoute.jsx - Garde de route (controle d'acces base sur les roles).
// Conforme a la doc technique (section 4.3) : "Guard component, props
// (allowedRoles). Redirects to /login if not authenticated."
//
// Principe : on enveloppe les routes privees avec ce composant. Si
// l'utilisateur n'est pas connecte -> redirection vers /login. S'il est
// connecte mais n'a pas le bon role -> redirection vers l'accueil.
// ========================================================================

// Navigate : effectue une redirection. Outlet : emplacement ou la route
// enfant sera rendue. useLocation : donne l'URL courante.
import { Navigate, Outlet, useLocation } from "react-router-dom";
// useAuth : hook qui donne acces a l'etat d'authentification global.
import { useAuth } from "../../hooks/useAuth.js";

// ProtectedRoute recoit la prop "allowedRoles" : la liste des roles autorises.
// Valeur par defaut [] = aucun role specifique exige (juste etre connecte).
export default function ProtectedRoute({ allowedRoles = [] }) {
  // On lit l'etat d'authentification : connecte ? pret ? quel utilisateur ?
  const { isAuthenticated, ready, user } = useAuth();
  // On recupere l'URL demandee, pour pouvoir y revenir apres connexion.
  const location = useLocation();

  // Tant que la session initiale n'est pas verifiee, on affiche un message
  // d'attente : cela evite une redirection erronee au premier rendu.
  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-brand">
        Loading...
      </div>
    );
  }

  // Cas 1 : utilisateur NON connecte -> redirection vers la page de connexion.
  // "state" memorise la page demandee ; "replace" evite d'empiler l'historique.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Cas 2 : utilisateur connecte mais dont le role n'est pas autorise ici.
  // (allowedRoles non vide ET ne contient pas le role de l'utilisateur).
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Acces interdit pour ce role -> on renvoie vers la page d'accueil.
    return <Navigate to="/" replace />;
  }

  // Cas 3 : utilisateur connecte ET autorise -> on affiche la route enfant.
  return <Outlet />;
}
