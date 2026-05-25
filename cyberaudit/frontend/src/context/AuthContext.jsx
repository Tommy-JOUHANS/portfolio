// ========================================================================
// AuthContext.jsx — État global d'authentification (Context API).
//
// Expose : user, token (access JWT), ready, isAuthenticated,
//          login, register, logout, hasRole.
//
// Les fonctions login / register / logout sont désormais async car elles
// appellent l'API Django via authService.js.
// ========================================================================

import { createContext, useState, useEffect, useCallback } from "react";
import * as authService from "../services/authService.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // user    : objet utilisateur connecté ou null.
  const [user, setUser]   = useState(null);
  // token   : access token JWT courant ou null.
  const [token, setToken] = useState(null);
  // ready   : true une fois la session initiale vérifiée (évite le flash de redirection).
  const [ready, setReady] = useState(false);

  // ── Restauration de session au montage ──────────────────────────────────────
  useEffect(() => {
    const session = authService.getSession();
    if (session) {
      setUser(session.user);
      setToken(session.access);   // access token (format nouveau)
    }
    setReady(true);
  }, []);

  // ── register ────────────────────────────────────────────────────────────────
  const register = useCallback(async (form) => {
    // Lance une Error si l'API répond avec une erreur (email déjà pris, etc.)
    const session = await authService.register(form);
    setUser(session.user);
    setToken(session.access);
    return session;
  }, []);

  // ── login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    // Lance une Error si les identifiants sont invalides.
    const session = await authService.login(email, password);
    setUser(session.user);
    setToken(session.access);
    return session;
  }, []);

  // ── logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  // ── hasRole ─────────────────────────────────────────────────────────────────
  const hasRole = useCallback(
    (role) => Boolean(user) && user.role === role,
    [user],
  );

  const value = {
    user,
    token,
    ready,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
