// ─── Tests : RegisterPage.jsx ────────────────────────────────────────────────
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock RegisterForm to keep the test focused on RegisterPage itself
vi.mock("../components/auth/RegisterForm.jsx", () => ({
  default: () => <form data-testid="register-form">RegisterForm</form>,
}));

import RegisterPage from "../pages/RegisterPage.jsx";

function renderPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );
}

describe("RegisterPage", () => {
  it("renders the 'Create an account' heading", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /Create an account/i })).toBeInTheDocument();
  });

  it("renders the subtitle text", () => {
    renderPage();
    expect(screen.getByText(/Fill in the information/i)).toBeInTheDocument();
  });

  it("renders the RegisterForm component", () => {
    renderPage();
    expect(screen.getByTestId("register-form")).toBeInTheDocument();
  });

  it("shows 'Already have an account?' text", () => {
    renderPage();
    expect(screen.getByText(/Already have an account/i)).toBeInTheDocument();
  });

  it("shows a 'Sign In' link pointing to /login", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /Sign In/i });
    expect(link).toHaveAttribute("href", "/login");
  });
});
