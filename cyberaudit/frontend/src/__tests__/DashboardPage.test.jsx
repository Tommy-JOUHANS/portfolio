// ─── Tests : DashboardPage.jsx ───────────────────────────────────────────────
//
// DashboardPage est simple : il lit user.role et affiche
// ClientDashboard ou AdminDashboard selon la valeur.
//
// CONCEPT CLÉ : "mocker" un contexte React
// DashboardPage utilise useAuth() pour lire user.role.
// Comme on n'a pas de vrai serveur, on simule le contexte
// en fournissant une valeur fictive via AuthContext.Provider.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";

// ── Mock des composants enfants ──────────────────────────────────────────────
// On ne veut pas tester ClientDashboard ou AdminDashboard ici
// (ils ont leurs propres tests). On les remplace par de simples <div>.
vi.mock("../components/dashboard/ClientDashboard.jsx", () => ({
  default: () => <div data-testid="client-dashboard">Client Dashboard</div>,
}));

vi.mock("../components/admin/AdminDashboard.jsx", () => ({
  default: () => <div data-testid="admin-dashboard">Admin Dashboard</div>,
}));

// Helper : rend DashboardPage avec un utilisateur fictif
function renderWithRole(role) {
  const fakeUser = { id: "1", email: "test@test.fr", role };
  return render(
    // AuthContext.Provider injecte la valeur de contexte dans tous les enfants
    <AuthContext.Provider value={{ user: fakeUser, isAuthenticated: true, ready: true }}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("DashboardPage", () => {
  it("affiche ClientDashboard quand role = client", () => {
    renderWithRole("client");
    // On vérifie que le composant client est affiché
    expect(screen.getByTestId("client-dashboard")).toBeInTheDocument();
    // Et que le composant admin n'est PAS affiché
    expect(screen.queryByTestId("admin-dashboard")).toBeNull();
  });

  it("affiche AdminDashboard quand role = admin", () => {
    renderWithRole("admin");
    expect(screen.getByTestId("admin-dashboard")).toBeInTheDocument();
    expect(screen.queryByTestId("client-dashboard")).toBeNull();
  });
});
