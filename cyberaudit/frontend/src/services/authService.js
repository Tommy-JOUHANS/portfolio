// ========================================================================
// authService.js — Couche d'accès à l'API d'authentification Django.
//
// Chaque fonction correspond à un endpoint réel :
//   register()        → POST /api/auth/register/
//   login()           → POST /api/auth/login/
//   logout()          → POST /api/auth/logout/   (blacklist refresh token)
//   getSession()      → lecture localStorage (restauration au démarrage)
//   getMe()           → GET  /api/auth/me/
//   changePassword()  → POST /api/auth/change-password/
//
// Les tokens (access + refresh) sont persistés dans le localStorage sous
// la clé "cyberaudit:session". L'instance axios (api.js) les injecte
// automatiquement dans chaque requête.
// ========================================================================

import api from "./api.js";

// Clé de stockage partagée avec api.js
const SESSION_KEY = "cyberaudit:session";

// ── Helpers internes ──────────────────────────────────────────────────────────

/** Sauvegarde la session en localStorage et la retourne. */
function saveSession(access, refresh, user) {
  const session = { access, refresh, user };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/**
 * Normalise les erreurs Axios en message lisible.
 * Django renvoie les erreurs sous forme { field: ["msg"] } ou
 * { non_field_errors: ["msg"] } ou { detail: "msg" }.
 */
function extractErrorMessage(error) {
  const data = error.response?.data;
  if (!data) return error.message || "Erreur réseau.";

  if (data.non_field_errors) return data.non_field_errors[0];
  if (data.detail) return data.detail;

  // Prend le premier message de validation de champ
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const msg = data[firstKey];
    return Array.isArray(msg) ? msg[0] : msg;
  }

  return "Une erreur est survenue.";
}

// ── register ─────────────────────────────────────────────────────────────────
/**
 * Crée un compte client et ouvre une session.
 * Accepte les champs camelCase (firstName) ou snake_case (first_name).
 */
export async function register(form) {
  try {
    const { data } = await api.post("/auth/register/", {
      email:        form.email?.trim(),
      password:     form.password,
      first_name:   (form.firstName ?? form.first_name ?? "").trim(),
      last_name:    (form.lastName  ?? form.last_name  ?? "").trim(),
      company_name: (form.companyName ?? form.company_name ?? "").trim(),
    });

    return saveSession(data.access, data.refresh, data.user);
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
}

// ── login ─────────────────────────────────────────────────────────────────────
/** Vérifie les identifiants et ouvre une session. */
export async function login(email, password) {
  try {
    const { data } = await api.post("/auth/login/", {
      email:    email.trim().toLowerCase(),
      password,
    });

    return saveSession(data.access, data.refresh, data.user);
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
}

// ── logout ────────────────────────────────────────────────────────────────────
/** Blackliste le refresh token côté serveur puis vide la session locale. */
export async function logout() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      if (session?.refresh) {
        // Appel serveur pour invalider le token (best-effort : on continue même si ça échoue)
        await api.post("/auth/logout/", { refresh: session.refresh });
      }
    }
  } catch {
    // On vide quand même la session locale
  } finally {
    localStorage.removeItem(SESSION_KEY);
  }
}

// ── getSession ────────────────────────────────────────────────────────────────
/**
 * Relit la session sauvegardée au démarrage de l'application.
 * Retourne { access, refresh, user } ou null.
 * Rétro-compatible : si l'ancien format { token, user } est trouvé, le migre.
 */
export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  const session = JSON.parse(raw);

  // Migration depuis l'ancien format mock ({ token, user })
  if (session?.token && !session?.access) {
    localStorage.removeItem(SESSION_KEY); // session mock invalide, on l'efface
    return null;
  }

  return session;
}

// ── getMe ─────────────────────────────────────────────────────────────────────
/** Recharge le profil courant depuis l'API (utile après un PATCH /me/). */
export async function getMe() {
  try {
    const { data } = await api.get("/auth/me/");
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
}

// ── changePassword ────────────────────────────────────────────────────────────
/** Change le mot de passe après vérification de l'ancien. */
export async function changePassword(oldPassword, newPassword) {
  try {
    await api.post("/auth/change-password/", {
      old_password: oldPassword,
      new_password: newPassword,
    });
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
}
