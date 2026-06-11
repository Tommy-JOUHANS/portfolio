// ─── Tests : RegisterForm.jsx ────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import RegisterForm from "../components/auth/RegisterForm.jsx";

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockNavigate = vi.hoisted(() => vi.fn());
const mockRegister = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockCtx = {
  user: null,
  token: null,
  ready: true,
  isAuthenticated: false,
  login: vi.fn(),
  register: mockRegister,
  logout: vi.fn(),
  hasRole: () => false,
};

function renderForm() {
  return render(
    <AuthContext.Provider value={mockCtx}>
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

beforeEach(() => vi.clearAllMocks());

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("RegisterForm", () => {
  it("affiche les 5 champs du formulaire", () => {
    renderForm();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Create a password")).toBeInTheDocument();
  });

  it("affiche le bouton 'Create an account'", () => {
    renderForm();
    expect(screen.getByRole("button", { name: /create an account/i })).toBeInTheDocument();
  });

  it("met à jour les champs texte à la saisie", () => {
    renderForm();
    const firstName = screen.getByLabelText(/first name/i);
    fireEvent.change(firstName, { target: { name: "firstName", value: "Tommy" } });
    expect(firstName.value).toBe("Tommy");
  });

  it("bascule la visibilité du mot de passe", () => {
    renderForm();
    const passwordInput = screen.getByPlaceholderText("Create a password");
    expect(passwordInput.type).toBe("password");

    fireEvent.click(screen.getByRole("button", { name: /show password/i }));
    expect(passwordInput.type).toBe("text");

    fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
    expect(passwordInput.type).toBe("password");
  });

  it("n'appelle pas register() si le formulaire est vide", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /create an account/i }));
    await waitFor(() => {
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  it("appelle register() avec les données correctes", async () => {
    mockRegister.mockResolvedValue({});
    renderForm();

    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { name: "companyName", value: "CyberAudit" },
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { name: "firstName", value: "Tommy" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { name: "lastName", value: "Jouhans" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: "email", value: "tommy@test.fr" },
    });
    fireEvent.change(screen.getByPlaceholderText("Create a password"), {
      target: { name: "password", value: "Azerty123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create an account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "tommy@test.fr",
          firstName: "Tommy",
          lastName: "Jouhans",
        })
      );
    });
  });

  it("affiche un message d'erreur si register() échoue", async () => {
    mockRegister.mockRejectedValue(new Error("Email already in use"));
    renderForm();

    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { name: "companyName", value: "TestCo" },
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { name: "firstName", value: "Alice" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { name: "lastName", value: "Martin" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: "email", value: "existing@test.fr" },
    });
    fireEvent.change(screen.getByPlaceholderText("Create a password"), {
      target: { name: "password", value: "Azerty123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create an account/i }));

    await waitFor(() => {
      expect(screen.getByText("Email already in use")).toBeInTheDocument();
    });
  });

  it("redirige vers /dashboard après inscription réussie", async () => {
    mockRegister.mockResolvedValue({});
    renderForm();

    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { name: "companyName", value: "CyberAudit" },
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { name: "firstName", value: "Tommy" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { name: "lastName", value: "Jouhans" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: "email", value: "tommy@test.fr" },
    });
    fireEvent.change(screen.getByPlaceholderText("Create a password"), {
      target: { name: "password", value: "Azerty123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create an account/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", expect.any(Object));
    });
  });
});
