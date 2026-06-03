// ─── Tests : useAuth.js ──────────────────────────────────────────────────────
import { describe, it, expect } from "vitest";
import { render, screen, renderHook } from "@testing-library/react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useAuth } from "../hooks/useAuth.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Composant consommateur minimal pour tester useAuth dans le DOM. */
function ConsumerComponent() {
  const { user, isAuthenticated } = useAuth();
  return (
    <div>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="role">{user?.role ?? "none"}</span>
    </div>
  );
}

const mockCtx = {
  user: { role: "client", email: "marie@example.com" },
  token: "fake.token",
  ready: true,
  isAuthenticated: true,
  login: () => {},
  register: () => {},
  logout: () => {},
  hasRole: (role) => role === "client",
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useAuth", () => {
  it("expose isAuthenticated=true dans un Provider connecté", () => {
    render(
      <AuthContext.Provider value={mockCtx}>
        <ConsumerComponent />
      </AuthContext.Provider>
    );
    expect(screen.getByTestId("auth").textContent).toBe("true");
  });

  it("expose le rôle de l'utilisateur", () => {
    render(
      <AuthContext.Provider value={mockCtx}>
        <ConsumerComponent />
      </AuthContext.Provider>
    );
    expect(screen.getByTestId("role").textContent).toBe("client");
  });

  it("hasRole retourne true pour le bon rôle", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthContext.Provider value={mockCtx}>{children}</AuthContext.Provider>
      ),
    });
    expect(result.current.hasRole("client")).toBe(true);
  });

  it("hasRole retourne false pour un rôle incorrect", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthContext.Provider value={mockCtx}>{children}</AuthContext.Provider>
      ),
    });
    expect(result.current.hasRole("admin")).toBe(false);
  });

  it("lève une erreur si utilisé hors d'un AuthProvider", () => {
    // On s'attend à ce que le rendu lance une erreur
    expect(() =>
      renderHook(() => useAuth())
    ).toThrow("useAuth must be used");
  });
});
