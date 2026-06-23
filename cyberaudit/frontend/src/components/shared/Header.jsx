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
    <header className="static w-full bg-brand">
      {/* Conteneur centre, largeur maximale, logo a gauche / menu a droite. */}
       <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-2 sm:py-3">
        <Link to="/" aria-label="Accueil" className="flex-shrink-0">
          {/* Pastille circulaire de marque.                               */}
          <Logo size={80}/>
        </Link>

        <nav className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold tracking-wide text-white">
      <Link to="/" className="transition hover:text-white/70">HOME</Link>
      {isAuthenticated ? (
        <button type="button" onClick={handleSignOut} className="transition hover:text-white/70 cursor-pointer">
          SIGN OUT
        </button>
      ) : (
        <Link to="/login" className="transition hover:text-white/70 ">SIGN IN</Link>
      )}
    </nav>
  </div>
</header>
  );
}
