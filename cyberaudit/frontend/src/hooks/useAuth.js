// ========================================================================
// useAuth.js - Hook personnalise pour consommer le contexte d'authentification.
// Permet d'ecrire simplement "const { user, login } = useAuth();" dans
// n'importe quel composant, au lieu de manipuler useContext a chaque fois.
// ========================================================================

// useContext : hook React qui lit la valeur d'un contexte.
import { useContext } from "react";
// AuthContext : le contexte cree dans AuthContext.jsx.
import { AuthContext } from "../context/AuthContext.jsx";

// useAuth : retourne l'objet d'authentification global.
export function useAuth() {
  // On recupere la valeur fournie par le <AuthProvider> le plus proche.
  const context = useContext(AuthContext);

  // Securite : si le hook est utilise hors d'un <AuthProvider>, on previent
  // le developpeur avec une erreur claire plutot qu'un bug silencieux.
  if (context === null) {
    throw new Error("useAuth doit etre utilise dans un <AuthProvider>.");
  }

  // On renvoie le contexte (user, token, login, register, logout, hasRole...).
  return context;
}
