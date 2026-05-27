// ─── Setup global pour Vitest ───────────────────────────────────────────────
// Ce fichier est exécuté avant chaque suite de tests.

import "@testing-library/jest-dom";

// ── Mock localStorage complet ────────────────────────────────────────────────
// Vitest v3 + jsdom récent ne fournit pas localStorage.clear() nativement.
// On remplace l'objet entier par un mock en mémoire.
const localStorageMock = (() => {
  let store = {};
  return {
    getItem:    (key)        => store[key] ?? null,
    setItem:    (key, value) => { store[key] = String(value); },
    removeItem: (key)        => { delete store[key]; },
    clear:      ()           => { store = {}; },
    get length()             { return Object.keys(store).length; },
    key:        (i)          => Object.keys(store)[i] ?? null,
  };
})();

Object.defineProperty(window, "localStorage", {
  value:    localStorageMock,
  writable: true,
});

// Réinitialise le localStorage entre chaque test pour éviter les fuites d'état.
beforeEach(() => {
  localStorage.clear();
});

// Filtre les erreurs React connues (PropTypes, act(), etc.) pour garder
// la sortie de test lisible.
const IGNORE_ERRORS = [
  "Warning: ReactDOM.render",
  "Warning: An update to",
  "Error: useAuth doit etre utilise",
];

const originalError = console.error.bind(console.error);
console.error = (...args) => {
  const msg = typeof args[0] === "string" ? args[0] : "";
  if (IGNORE_ERRORS.some((e) => msg.includes(e))) return;
  originalError(...args);
};
