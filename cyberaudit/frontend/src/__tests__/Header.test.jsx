// ─── Tests : Header.jsx ──────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

// Mock useNavigate so we can track navigation calls
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

import Header from "../components/shared/Header.jsx";

// ── Context fixtures ──────────────────────────────────────────────────────────
const makeCtx = (isAuthenticated, logoutFn = vi.fn()) => ({
  isAuthenticated,
  logout: logoutFn,
  user: isAuthenticated ? { role: "client" } : null,
  ready: true,
  login: vi.fn(),
  register: vi.fn(),
  hasRole: vi.fn(),
});

function renderHeader(ctx) {
  return render(
    <AuthContext.Provider value={ctx}>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("always shows the HOME navigation link", () => {
    renderHeader(makeCtx(false));
    expect(screen.getByText("HOME")).toBeInTheDocument();
  });

  it("shows the Logo (image or fallback)", () => {
    renderHeader(makeCtx(false));
    // Logo renders either an img or a div with aria-label
    const logo = screen.getByLabelText(/Logo CyberAudit/i);
    expect(logo).toBeInTheDocument();
  });

  it("shows SIGN IN link when user is not authenticated", () => {
    renderHeader(makeCtx(false));
    expect(screen.getByText("SIGN IN")).toBeInTheDocument();
    expect(screen.queryByText("SIGN OUT")).not.toBeInTheDocument();
  });

  it("shows SIGN OUT button when user is authenticated", () => {
    renderHeader(makeCtx(true));
    expect(screen.getByText("SIGN OUT")).toBeInTheDocument();
    expect(screen.queryByText("SIGN IN")).not.toBeInTheDocument();
  });

  it("calls logout() and navigates to '/' when SIGN OUT is clicked", () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    renderHeader(makeCtx(true, logout));
    fireEvent.click(screen.getByText("SIGN OUT"));
    expect(logout).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("HOME link points to '/'", () => {
    renderHeader(makeCtx(false));
    const homeLink = screen.getByText("HOME").closest("a");
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("SIGN IN link points to '/login'", () => {
    renderHeader(makeCtx(false));
    const signInLink = screen.getByText("SIGN IN").closest("a");
    expect(signInLink).toHaveAttribute("href", "/login");
  });
});
