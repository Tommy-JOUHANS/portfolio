// ─── Tests : NewAuditPage.jsx ─────────────────────────────────────────────────
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

// Mock AuditRequestForm to keep this test focused on NewAuditPage layout
vi.mock("../components/audit/AuditRequestForm.jsx", () => ({
  default: () => <form data-testid="audit-request-form">AuditRequestForm</form>,
}));

import NewAuditPage from "../pages/NewAuditPage.jsx";

const CLIENT_CTX = {
  user: { first_name: "Alice", company_name: "Acme Corp", email: "alice@acme.com" },
  isAuthenticated: true,
  ready: true,
  login: vi.fn(), logout: vi.fn(), register: vi.fn(), hasRole: vi.fn(),
};

function renderPage() {
  return render(
    <AuthContext.Provider value={CLIENT_CTX}>
      <MemoryRouter>
        <NewAuditPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("NewAuditPage", () => {
  it("renders the 'Audit request form' heading", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Audit request form/i })
    ).toBeInTheDocument();
  });

  it("renders the AuditRequestForm component", () => {
    renderPage();
    expect(screen.getByTestId("audit-request-form")).toBeInTheDocument();
  });
});
