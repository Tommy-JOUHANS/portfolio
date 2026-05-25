// ─── Setup global pour Vitest ───────────────────────────────────────────────
// Ce fichier est exécuté avant chaque suite de tests.

import "@testing-library/jest-dom";

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
