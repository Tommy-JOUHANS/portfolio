// ─── Tests : AuthContext.jsx (AuthProvider) ───────────────────────────────────
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { useContext } from "react";
import { AuthContext, AuthProvider } from "../context/AuthContext.jsx";

// ── Mock authService ──────────────────────────────────────────────────────────
vi.mock("../services/authService.js", () => ({
  getSession: vi.fn(),
  login:      vi.fn(),
  register:   vi.fn(),
  logout:     vi.fn(),
}));

import * as authService from "../services/authService.js";

// ── Consumer component that reads all context values ─────────────────────────
function Consumer() {
  const ctx = useContext(AuthContext);
  return (
    <div>
      <span data-testid="ready">{String(ctx.ready)}</span>
      <span data-testid="authenticated">{String(ctx.isAuthenticated)}</span>
      <span data-testid="user">{ctx.user ? ctx.user.email : "none"}</span>
      <span data-testid="token">{ctx.token ?? "none"}</span>
      <span data-testid="role">{ctx.user ? ctx.user.role : "none"}</span>
      <span data-testid="hasRoleAdmin">{String(ctx.hasRole("admin"))}</span>
    </div>
  );
}

// Expose context methods for test manipulation
let ctxRef = {};
function MethodConsumer() {
  const ctx = useContext(AuthContext);
  ctxRef = ctx;
  return <span data-testid="user">{ctx.user?.email ?? "none"}</span>;
}

beforeEach(() => {
  vi.clearAllMocks();
  ctxRef = {};
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("AuthProvider", () => {
  it("sets ready=true after mount with no session", async () => {
    authService.getSession.mockReturnValue(null);

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("ready").textContent).toBe("true")
    );
    expect(screen.getByTestId("authenticated").textContent).toBe("false");
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("restores user and token from session on mount", async () => {
    authService.getSession.mockReturnValue({
      access: "my-access-token",
      refresh: "my-refresh-token",
      user: { email: "alice@test.com", role: "client" },
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("ready").textContent).toBe("true")
    );
    expect(screen.getByTestId("authenticated").textContent).toBe("true");
    expect(screen.getByTestId("user").textContent).toBe("alice@test.com");
    expect(screen.getByTestId("token").textContent).toBe("my-access-token");
  });

  it("login() calls authService.login and updates state", async () => {
    authService.getSession.mockReturnValue(null);
    authService.login.mockResolvedValue({
      access: "new-token",
      refresh: "new-refresh",
      user: { email: "bob@test.com", role: "client" },
    });

    render(
      <AuthProvider>
        <MethodConsumer />
      </AuthProvider>
    );

    await act(async () => {
      await ctxRef.login("bob@test.com", "password123");
    });

    expect(authService.login).toHaveBeenCalledWith("bob@test.com", "password123");
    expect(screen.getByTestId("user").textContent).toBe("bob@test.com");
  });

  it("register() calls authService.register and updates state", async () => {
    authService.getSession.mockReturnValue(null);
    authService.register.mockResolvedValue({
      access: "reg-token",
      refresh: "reg-refresh",
      user: { email: "carol@test.com", role: "client" },
    });

    render(
      <AuthProvider>
        <MethodConsumer />
      </AuthProvider>
    );

    await act(async () => {
      await ctxRef.register({ email: "carol@test.com", password: "Passw0rd!" });
    });

    expect(authService.register).toHaveBeenCalledOnce();
    expect(screen.getByTestId("user").textContent).toBe("carol@test.com");
  });

  it("logout() calls authService.logout and clears user/token", async () => {
    authService.getSession.mockReturnValue({
      access: "tok",
      refresh: "ref",
      user: { email: "dave@test.com", role: "admin" },
    });
    authService.logout.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <MethodConsumer />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("user").textContent).toBe("dave@test.com")
    );

    await act(async () => {
      await ctxRef.logout();
    });

    expect(authService.logout).toHaveBeenCalledOnce();
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("hasRole returns true when user has the specified role", async () => {
    authService.getSession.mockReturnValue({
      access: "tok",
      refresh: "ref",
      user: { email: "x@x.com", role: "admin" },
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("role").textContent).toBe("admin")
    );
    expect(screen.getByTestId("hasRoleAdmin").textContent).toBe("true");
  });

  it("hasRole returns false when user has a different role", async () => {
    authService.getSession.mockReturnValue({
      access: "tok",
      refresh: "ref",
      user: { email: "y@y.com", role: "client" },
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("role").textContent).toBe("client")
    );
    // Consumer checks hasRole("admin") — should be false for a client
    expect(screen.getByTestId("hasRoleAdmin").textContent).toBe("false");
  });

  it("hasRole returns false when user is null", async () => {
    authService.getSession.mockReturnValue(null);

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("ready").textContent).toBe("true")
    );
    expect(screen.getByTestId("hasRoleAdmin").textContent).toBe("false");
  });

  it("isAuthenticated is true when user is set", async () => {
    authService.getSession.mockReturnValue({
      access: "tok",
      refresh: "ref",
      user: { email: "auth@test.com", role: "client" },
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("authenticated").textContent).toBe("true")
    );
  });
});
