// ─── Tests : ProtectedRoute.jsx ──────────────────────────────────────────────
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Enrobe ProtectedRoute dans un routeur de test avec contexte d'auth. */
function renderWithAuth(contextValue, allowedRoles = []) {
  return render(
    <AuthContext.Provider value={contextValue}>
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/login"     element={<div>Page Login</div>} />
          <Route path="/"          element={<div>Page Accueil</div>} />
          <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
            <Route path="/protected" element={<div>Contenu Protégé</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

const NOT_READY = { ready: false, isAuthenticated: false, user: null };
const ANON      = { ready: true,  isAuthenticated: false, user: null };
const CLIENT    = { ready: true,  isAuthenticated: true,  user: { role: "client" } };
const ADMIN     = { ready: true,  isAuthenticated: true,  user: { role: "admin" } };

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ProtectedRoute", () => {
  it("affiche un loader quand ready=false", () => {
    renderWithAuth(NOT_READY);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirige vers /login si non authentifié", () => {
    renderWithAuth(ANON);
    expect(screen.getByText("Page Login")).toBeInTheDocument();
  });

  it("affiche le contenu si authentifié sans restriction de rôle", () => {
    renderWithAuth(CLIENT);
    expect(screen.getByText("Contenu Protégé")).toBeInTheDocument();
  });

  it("affiche le contenu si le rôle correspond à allowedRoles", () => {
    renderWithAuth(ADMIN, ["admin"]);
    expect(screen.getByText("Contenu Protégé")).toBeInTheDocument();
  });

  it("redirige vers / si le rôle ne correspond pas à allowedRoles", () => {
    renderWithAuth(CLIENT, ["admin"]);
    expect(screen.getByText("Page Accueil")).toBeInTheDocument();
  });

  it("affiche le contenu si allowedRoles contient plusieurs rôles valides", () => {
    renderWithAuth(CLIENT, ["client", "admin"]);
    expect(screen.getByText("Contenu Protégé")).toBeInTheDocument();
  });
});
