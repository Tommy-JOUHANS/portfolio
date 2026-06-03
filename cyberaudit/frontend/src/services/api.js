// ========================================================================
// api.js — Instance axios centrale avec gestion automatique des tokens JWT.
//
// Toutes les requêtes authentifiées passent par cette instance :
//   - Intercepteur requête  : injecte le Bearer token dans chaque appel.
//   - Intercepteur réponse  : tente un refresh automatique sur erreur 401,
//     puis redirige vers /login si le refresh échoue.
// ========================================================================

import axios from "axios";

// URL de base lue depuis .env (VITE_API_URL=http://localhost:8000/api)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Clé de session partagée avec authService.js
const SESSION_KEY = "cyberaudit:session";

// ── Instance axios ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Intercepteur requête : ajoute Authorization: Bearer <access> ─────────────
api.interceptors.request.use((config) => {
  // Ne pas injecter le token sur les routes d'authentification elles-mêmes
  const isAuthRoute =
    config.url?.includes("token/refresh") ||
    config.url?.includes("login") ||
    config.url?.includes("register");

  if (!isAuthRoute) {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      if (session?.access) {
        config.headers.Authorization = `Bearer ${session.access}`;
      }
    }
  }
  return config;
});

// ── Intercepteur réponse : refresh automatique si 401 ────────────────────────
api.interceptors.response.use(
  (response) => {
    // Auto-unwrap DRF pagination : {count, next, previous, results: [...]} -> [...]
    if (
      response.data
      && typeof response.data === "object"
      && Array.isArray(response.data.results)
      && "count" in response.data
    ) {
      response.data = response.data.results;
    }
    return response;
  },
  async (error) => {
    const original = error.config;

    const is401 = error.response?.status === 401;
    const alreadyRetried = original._retry;
    const isAuthRoute =
      original.url?.includes("token/refresh") ||
      original.url?.includes("login") ||
      original.url?.includes("register");

    if (is401 && !alreadyRetried && !isAuthRoute) {
      original._retry = true;

      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) throw new Error("Pas de session");

        const session = JSON.parse(raw);
        if (!session?.refresh) throw new Error("Pas de refresh token");

        // Appel direct axios (pas l'instance api) pour éviter une boucle
        const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh: session.refresh,
        });

        // Mise à jour du token en localStorage
        const updated = {
          ...session,
          access: data.access,
          refresh: data.refresh ?? session.refresh,
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));

        // Rejoue la requête originale avec le nouveau token
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (_refreshError) {
        // Refresh échoué → déconnexion forcée
        localStorage.removeItem(SESSION_KEY);
        window.location.href = "/login";
        return Promise.reject(_refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
