// ─── Tests : App.jsx ─────────────────────────────────────────────────────────
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

// ── Mock all pages (avoid loading their own heavy dependencies) ───────────────
vi.mock("../pages/HomePage.jsx",                () => ({ default: () => <div>HomePage</div> }));
vi.mock("../pages/LoginPage.jsx",               () => ({ default: () => <div>LoginPage</div> }));
vi.mock("../pages/RegisterPage.jsx",            () => ({ default: () => <div>RegisterPage</div> }));
vi.mock("../pages/DashboardPage.jsx",           () => ({ default: () => <div>DashboardPage</div> }));
vi.mock("../pages/NewAuditPage.jsx",            () => ({ default: () => <div>NewAuditPage</div> }));
vi.mock("../pages/ConfirmationPage.jsx",        () => ({ default: () => <div>ConfirmationPage</div> }));
vi.mock("../pages/TrainingPage.jsx",            () => ({ default: () => <div>TrainingPage</div> }));
vi.mock("../pages/AdminRequestDetailPage.jsx",  () => ({ default: () => <div>AdminRequestDetailPage</div> }));
vi.mock("../pages/ReportViewerPage.jsx",        () => ({ default: () => <div>ReportViewerPage</div> }));

// ── Mock Header and Footer (avoid their dependencies) ────────────────────────
vi.mock("../components/shared/Header.jsx", () => ({ default: () => <header>Header</header> }));
vi.mock("../components/shared/Footer.jsx", () => ({ default: () => <footer>Footer</footer> }));

import App from "../App.jsx";

// ── Auth context fixtures ─────────────────────────────────────────────────────
const ANON = {
  ready: true, isAuthenticated: false, user: null,
  login: vi.fn(), logout: vi.fn(), register: vi.fn(), hasRole: () => false,
};
const CLIENT = {
  ready: true, isAuthenticated: true, user: { role: "client" },
  login: vi.fn(), logout: vi.fn(), register: vi.fn(), hasRole: (r) => r === "client",
};
const ADMIN = {
  ready: true, isAuthenticated: true, user: { role: "admin" },
  login: vi.fn(), logout: vi.fn(), register: vi.fn(), hasRole: (r) => r === "admin",
};

function renderApp(path, ctx = ANON) {
  return render(
    <AuthContext.Provider value={ctx}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("App routing", () => {
  it("renders HomePage at '/'", () => {
    renderApp("/");
    expect(screen.getByText("HomePage")).toBeInTheDocument();
  });

  it("renders LoginPage at '/login'", () => {
    renderApp("/login");
    expect(screen.getByText("LoginPage")).toBeInTheDocument();
  });

  it("renders RegisterPage at '/register'", () => {
    renderApp("/register");
    expect(screen.getByText("RegisterPage")).toBeInTheDocument();
  });

  it("renders the 404 NotFound page for unknown routes", () => {
    renderApp("/this-does-not-exist");
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText(/Cette page n'existe pas/i)).toBeInTheDocument();
  });

  it("renders NotFound with a 'Return to the home page' link", () => {
    renderApp("/unknown");
    expect(screen.getByRole("link", { name: /Return to the home page/i })).toBeInTheDocument();
  });

  it("redirects /home to '/' (renders HomePage)", () => {
    renderApp("/home");
    expect(screen.getByText("HomePage")).toBeInTheDocument();
  });

  it("redirects unauthenticated user from /dashboard to /login", () => {
    renderApp("/dashboard", ANON);
    expect(screen.getByText("LoginPage")).toBeInTheDocument();
  });

  it("renders DashboardPage for authenticated client at /dashboard", () => {
    renderApp("/dashboard", CLIENT);
    expect(screen.getByText("DashboardPage")).toBeInTheDocument();
  });

  it("renders DashboardPage for authenticated admin at /dashboard", () => {
    renderApp("/dashboard", ADMIN);
    expect(screen.getByText("DashboardPage")).toBeInTheDocument();
  });

  it("renders NewAuditPage for client at /audit/new", () => {
    renderApp("/audit/new", CLIENT);
    expect(screen.getByText("NewAuditPage")).toBeInTheDocument();
  });

  it("redirects admin to '/' when accessing /audit/new (wrong role)", () => {
    renderApp("/audit/new", ADMIN);
    expect(screen.getByText("HomePage")).toBeInTheDocument();
  });

  it("renders ConfirmationPage for client at /audit/confirmation/:ref", () => {
    renderApp("/audit/confirmation/DOSSIER-001", CLIENT);
    expect(screen.getByText("ConfirmationPage")).toBeInTheDocument();
  });

  it("renders TrainingPage for client at /training", () => {
    renderApp("/training", CLIENT);
    expect(screen.getByText("TrainingPage")).toBeInTheDocument();
  });

  it("renders AdminRequestDetailPage for admin at /admin/request/:ref", () => {
    renderApp("/admin/request/REF-001", ADMIN);
    expect(screen.getByText("AdminRequestDetailPage")).toBeInTheDocument();
  });

  it("renders ReportViewerPage for admin at /admin/report/:ref", () => {
    renderApp("/admin/report/REF-001", ADMIN);
    expect(screen.getByText("ReportViewerPage")).toBeInTheDocument();
  });

  it("renders Header on all pages", () => {
    renderApp("/");
    expect(screen.getByText("Header")).toBeInTheDocument();
  });

  it("renders Footer on all pages", () => {
    renderApp("/");
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});
