// ========================================================================
// AuthContext.jsx - Etat global d'authentification (le "AuthStore" de la doc).
// La doc technique (section 4.3) impose : "global state via Context API".
// Ce contexte expose : user, token, isAuthenticated, login, register,
// logout et hasRole — accessibles partout dans l'application.
// ========================================================================

// createContext : cree le contexte. useState : etat local. useEffect : effet
// au montage. useCallback : memorise les fonctions pour eviter de les recreer.
import { createContext, useState, useEffect, useCallback } from "react";

// On importe toutes les fonctions du service d'authentification.
import * as authService from "../services/authService.js";

// Creation du contexte ; valeur initiale null tant qu'aucun Provider n'existe.
export const AuthContext = createContext(null);

// AuthProvider : composant qui englobe l'appli et fournit l'etat d'auth.
// "children" represente tous les composants enfants enveloppes.
export function AuthProvider({ children }) {
  // user : l'utilisateur connecte (objet) ou null si personne n'est connecte.
  const [user, setUser] = useState(null);
  // token : le jeton JWT de la session courante (ou null).
  const [token, setToken] = useState(null);
  // ready : passe a true une fois la session restauree (evite un clignotement
  // de redirection au tout premier rendu de l'application).
  const [ready, setReady] = useState(false);

  // useEffect avec [] : s'execute UNE seule fois, au montage du Provider.
  useEffect(() => {
    // On tente de relire une session existante dans le localStorage.
    const session = authService.getSession();
    // Si une session est trouvee, on restaure l'utilisateur et le jeton.
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    // Dans tous les cas, l'initialisation est terminee.
    setReady(true);
  }, []);

  // login : delegue au service, puis met a jour l'etat React si succes.
  const login = useCallback((email, password) => {
    // Appel du service ; lance une erreur si les identifiants sont mauvais.
    const session = authService.login(email, password);
    // Mise a jour de l'etat global avec l'utilisateur et le jeton recus.
    setUser(session.user);
    setToken(session.token);
    // On retourne la session pour que la page sache vers ou rediriger.
    return session;
  }, []);

  // register : delegue au service, puis met a jour l'etat React si succes.
  const register = useCallback((form) => {
    // Appel du service ; lance une erreur si l'email est deja pris.
    const session = authService.register(form);
    // Mise a jour de l'etat global avec le nouvel utilisateur connecte.
    setUser(session.user);
    setToken(session.token);
    // On retourne la session a la page appelante.
    return session;
  }, []);

  // logout : ferme la session cote service puis vide l'etat React.
  const logout = useCallback(() => {
    // On efface la session memorisee dans le localStorage.
    authService.logout();
    // On remet l'utilisateur et le jeton a null (etat deconnecte).
    setUser(null);
    setToken(null);
  }, []);

  // hasRole : indique si l'utilisateur connecte possede le role demande.
  // Utilise par ProtectedRoute pour le controle d'acces base sur les roles.
  const hasRole = useCallback(
    (role) => Boolean(user) && user.role === role,
    [user], // recalcule cette fonction seulement si "user" change
  );

  // value : l'objet reellement partage avec tous les composants consommateurs.
  const value = {
    user, // utilisateur connecte (ou null)
    token, // jeton JWT courant (ou null)
    ready, // true quand la session initiale a ete verifiee
    isAuthenticated: Boolean(user), // raccourci booleen pratique
    login, // fonction de connexion
    register, // fonction d'inscription
    logout, // fonction de deconnexion
    hasRole, // fonction de verification de role
  };

  // On rend le Provider : tous les "children" peuvent lire "value".
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
