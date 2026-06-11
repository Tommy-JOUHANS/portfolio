// ─── Tests : LoginPage.jsx ────────────────────────────────────────────────────
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock LoginForm to keep the test focused on LoginPage itself
vi.mock("../components/auth/LoginForm.jsx", () => ({
  default: () => <form data-testid="login-form">LoginForm</form>,
}));

import LoginPage from "../pages/LoginPage.jsx";

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  it("renders the 'Log In' heading", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /Log In/i })).toBeInTheDocument();
  });

  it("renders the subtitle text", () => {
    renderPage();
    expect(screen.getByText(/Enter your credentials/i)).toBeInTheDocument();
  });

  it("renders the LoginForm component", () => {
    renderPage();
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("shows 'Don't have an account?' text", () => {
    renderPage();
    expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
  });

  it("shows a 'Create an account' link pointing to /register", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /Create an account/i });
    expect(link).toHaveAttribute("href", "/register");
  });
});
