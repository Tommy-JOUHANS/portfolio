// ─── Tests : PortalLayout.jsx ────────────────────────────────────────────────
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import PortalLayout from "../components/shared/PortalLayout.jsx";

const CLIENT_CTX = {
  user: { role: "client" },
  isAuthenticated: true,
  ready: true,
  login: () => {},
  logout: () => {},
  register: () => {},
  hasRole: (r) => r === "client",
};

function renderPortalLayout(path = "/dashboard", childContent = "Dashboard Content") {
  return render(
    <AuthContext.Provider value={CLIENT_CTX}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<PortalLayout />}>
            <Route path="/dashboard" element={<div>{childContent}</div>} />
            <Route path="/audit/new" element={<div>Audit New</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("PortalLayout", () => {
  it("renders the Sidebar", () => {
    renderPortalLayout();
    expect(screen.getByText("Client Portal")).toBeInTheDocument();
  });

  it("renders the Sidebar menu items", () => {
    renderPortalLayout();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Audit Request")).toBeInTheDocument();
    expect(screen.getByText("Training")).toBeInTheDocument();
  });

  it("renders the child route content via Outlet", () => {
    renderPortalLayout();
    expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
  });

  it("renders different child route content based on path", () => {
    renderPortalLayout("/audit/new");
    expect(screen.getByText("Audit New")).toBeInTheDocument();
  });
});
