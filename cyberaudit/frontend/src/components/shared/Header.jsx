// ========================================================================
// Header.jsx - Barre de navigation superieure (violette de la charte).
// Toujours visible. Le menu de droite s'adapte a l'etat de connexion :
//  - visiteur non connecte : liens HOME + SIGN IN
//  - utilisateur connecte  : liens HOME + SIGN OUT
// Reprend la barre violette des 11 maquettes de la doc.
// ========================================================================

// Link : lien de navigation interne. useNavigate : navigation par code.
import { Link, useNavigate } from "react-router-dom";
// useAuth : hook d'acces a l'etat d'authentification global.
import { useAuth } from "../../hooks/useAuth.js";
// Logo : la pastille circulaire de marque.
import Logo from "./Logo.jsx";

// Header : composant de la barre de navigation.
export default function Header() {
  // On lit l'etat de connexion et la fonction de deconnexion.
  const { isAuthenticated, logout } = useAuth();
  // navigate permet de changer de page depuis le code JavaScript.
  const navigate = useNavigate();

  // handleSignOut : deconnecte l'utilisateur puis le ramene a l'accueil.
  function handleSignOut() {
    // Efface la session (etat global + localStorage).
    logout();
    // Redirige vers la page d'accueil publique.
    navigate("/");
  }

  // Rendu de la barre superieure.
  return (
    // <header> : fond violet de la charte, contenu en ligne, espace interieur.
    <header className="bg-brand">
      {/* Conteneur centre, largeur maximale, logo a gauche / menu a droite. */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo cliquable : renvoie vers la page d'accueil "/".            */}
        <Link to="/" className="flex items-center" aria-label="Accueil">
          {/* Pastille circulaire de marque.                               */}
          <Logo size={120} />
        </Link>

        {/* <nav> : liens de navigation alignes a droite.                   */}
        <nav className="flex items-center gap-6 text-sm font-semibold tracking-wide text-white">
          {/* Lien HOME : toujours present, renvoie a l'accueil.            */}
          <Link to="/" className="transition hover:text-white/70">
            HOME
          </Link>

          {/* Affichage conditionnel selon l'etat de connexion.             */}
          {isAuthenticated ? (
            // Utilisateur connecte : bouton de deconnexion (SIGN OUT).
            <button
              type="button"
              onClick={handleSignOut}
              className="transition hover:text-white/70"
            >
              SIGN OUT
            </button>
          ) : (
            // Visiteur non connecte : lien vers la page de connexion.
            <Link to="/login" className="transition hover:text-white/70">
              SIGN IN
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
