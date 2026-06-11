// ─── Tests : LoginForm.jsx ───────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import LoginForm from "../components/auth/LoginForm.jsx";

// vi.hoisted garantit que mockNavigate est créé AVANT que vi.mock soit hoistée
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── Contexte d'auth fictif ────────────────────────────────────────────────────
const mockLogin = vi.hoisted(() => vi.fn());

const mockCtx = {
  user: null,
  token: null,
  ready: true,
  isAuthenticated: false,
  login: mockLogin,
  register: vi.fn(),
  logout: vi.fn(),
  hasRole: () => false,
};

function renderForm() {
  return render(
    <AuthContext.Provider value={mockCtx}>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("LoginForm", () => {
  it("affiche les champs email et password", () => {
    renderForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });

  it("affiche le bouton de connexion", () => {
    renderForm();
    expect(screen.getByRole("button", { name: /connection/i })).toBeInTheDocument();
  });

  it("met à jour le champ email à la saisie", () => {
    renderForm();
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { name: "email", value: "test@test.fr" } });
    expect(emailInput.value).toBe("test@test.fr");
  });

  it("bascule la visibilité du mot de passe avec le bouton oeil", () => {
    renderForm();
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    expect(passwordInput.type).toBe("password");

    const toggleBtn = screen.getByRole("button", { name: /show password/i });
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("text");

    fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
    expect(passwordInput.type).toBe("password");
  });

  it("affiche une erreur si le formulaire est soumis vide", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /connection/i }));
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it("appelle login() avec email et password corrects", async () => {
    mockLogin.mockResolvedValue({ user: { role: "client" } });
    renderForm();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: "email", value: "client@test.fr" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { name: "password", value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /connection/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("client@test.fr", "Password123!");
    });
  });

  it("affiche un message d'erreur global si login() échoue", async () => {
    mockLogin.mockRejectedValue(new Error("Invalid credentials"));
    renderForm();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: "email", value: "bad@test.fr" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { name: "password", value: "WrongPass1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /connection/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("redirige vers /dashboard après connexion réussie", async () => {
    mockLogin.mockResolvedValue({ user: { role: "client" } });
    renderForm();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: "email", value: "client@test.fr" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { name: "password", value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /connection/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", expect.any(Object));
    });
  });
});
