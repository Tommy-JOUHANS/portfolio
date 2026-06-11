// ─── Tests : Sidebar.jsx ─────────────────────────────────────────────────────
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import Sidebar from "../components/shared/Sidebar.jsx";

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeCtx = (role) => ({
  user: role ? { role } : null,
  isAuthenticated: Boolean(role),
  ready: true,
  login: () => {},
  logout: () => {},
  register: () => {},
  hasRole: (r) => r === role,
});

function renderSidebar(role) {
  return render(
    <AuthContext.Provider value={makeCtx(role)}>
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("Sidebar", () => {
  it("shows 'Client Portal' title for client role", () => {
    renderSidebar("client");
    expect(screen.getByText("Client Portal")).toBeInTheDocument();
  });

  it("shows 'Admin Portal' title for admin role", () => {
    renderSidebar("admin");
    expect(screen.getByText("Admin Portal")).toBeInTheDocument();
  });

  it("shows all 3 client menu items for client role", () => {
    renderSidebar("client");
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Audit Request")).toBeInTheDocument();
    expect(screen.getByText("Training")).toBeInTheDocument();
  });

  it("shows only Dashboard for admin role (no Audit Request or Training)", () => {
    renderSidebar("admin");
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Audit Request")).not.toBeInTheDocument();
    expect(screen.queryByText("Training")).not.toBeInTheDocument();
  });

  it("defaults to 'Client Portal' when user role is null", () => {
    renderSidebar(null);
    expect(screen.getByText("Client Portal")).toBeInTheDocument();
  });

  it("Dashboard NavLink href points to /dashboard", () => {
    renderSidebar("client");
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
  });

  it("Audit Request NavLink href points to /audit/new", () => {
    renderSidebar("client");
    const auditLink = screen.getByText("Audit Request").closest("a");
    expect(auditLink).toHaveAttribute("href", "/audit/new");
  });

  it("Training NavLink href points to /training", () => {
    renderSidebar("client");
    const trainingLink = screen.getByText("Training").closest("a");
    expect(trainingLink).toHaveAttribute("href", "/training");
  });
});
