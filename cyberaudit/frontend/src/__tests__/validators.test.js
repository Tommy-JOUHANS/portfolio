// ─── Tests : validators.js ───────────────────────────────────────────────────
import { describe, it, expect } from "vitest";
import {
  isRequired,
  isEmailValid,
  isPasswordStrong,
  validateLoginForm,
  validateRegisterForm,
  MISSING_FIELD_MESSAGE,
} from "../utils/validators.js";

// ── isRequired ────────────────────────────────────────────────────────────────
describe("isRequired", () => {
  it("retourne true pour une chaîne non vide", () => {
    expect(isRequired("hello")).toBe(true);
  });

  it("retourne false pour une chaîne vide", () => {
    expect(isRequired("")).toBe(false);
  });

  it("retourne false pour une chaîne d'espaces", () => {
    expect(isRequired("   ")).toBe(false);
  });

  it("retourne false pour null", () => {
    expect(isRequired(null)).toBe(false);
  });
});

// ── isEmailValid ──────────────────────────────────────────────────────────────
describe("isEmailValid", () => {
  it("accepte un email valide", () => {
    expect(isEmailValid("marie@example.com")).toBe(true);
  });

  it("refuse un email sans @", () => {
    expect(isEmailValid("marieexample.com")).toBe(false);
  });

  it("refuse un email sans domaine", () => {
    expect(isEmailValid("marie@")).toBe(false);
  });

  it("refuse une chaîne vide", () => {
    expect(isEmailValid("")).toBe(false);
  });
});

// ── isPasswordStrong ──────────────────────────────────────────────────────────
describe("isPasswordStrong", () => {
  it("accepte un mot de passe fort (10 chars, maj, min, chiffre, spécial)", () => {
    expect(isPasswordStrong("Secur1ty!X")).toBe(true);
  });

  it("refuse un mot de passe trop court (< 10 chars)", () => {
    expect(isPasswordStrong("Sec1!")).toBe(false);
  });

  it("refuse un mot de passe sans majuscule", () => {
    expect(isPasswordStrong("secur1ty!x")).toBe(false);
  });

  it("refuse un mot de passe sans chiffre", () => {
    expect(isPasswordStrong("Security!X")).toBe(false);
  });

  it("refuse un mot de passe sans caractère spécial", () => {
    expect(isPasswordStrong("Security1X")).toBe(false);
  });
});

// ── validateLoginForm ─────────────────────────────────────────────────────────
describe("validateLoginForm", () => {
  it("retourne {} (aucune erreur) pour des identifiants valides", () => {
    const errors = validateLoginForm({
      email: "marie@example.com",
      password: "anypassword",
    });
    expect(errors).toEqual({});
  });

  it("signale email manquant", () => {
    const errors = validateLoginForm({ email: "", password: "pass" });
    expect(errors.email).toBe(MISSING_FIELD_MESSAGE);
  });

  it("signale email mal formaté", () => {
    const errors = validateLoginForm({ email: "notanemail", password: "pass" });
    expect(errors.email).toBeTruthy();
  });

  it("signale mot de passe manquant", () => {
    const errors = validateLoginForm({ email: "marie@example.com", password: "" });
    expect(errors.password).toBe(MISSING_FIELD_MESSAGE);
  });
});

// ── validateRegisterForm ──────────────────────────────────────────────────────
describe("validateRegisterForm", () => {
  const valid = {
    companyName: "Compta Plus",
    firstName: "Marie",
    lastName: "Dupont",
    email: "marie@example.com",
    password: "Secur1ty!X",
  };

  it("retourne {} pour un formulaire complet et valide", () => {
    expect(validateRegisterForm(valid)).toEqual({});
  });

  it("signale les champs vides (companyName, firstName, lastName)", () => {
    const errors = validateRegisterForm({
      ...valid,
      companyName: "",
      firstName: "",
      lastName: "",
    });
    expect(errors.companyName).toBe(MISSING_FIELD_MESSAGE);
    expect(errors.firstName).toBe(MISSING_FIELD_MESSAGE);
    expect(errors.lastName).toBe(MISSING_FIELD_MESSAGE);
  });

  it("signale un email invalide", () => {
    const errors = validateRegisterForm({ ...valid, email: "bad-email" });
    expect(errors.email).toBeTruthy();
  });

  it("signale un mot de passe trop faible", () => {
    const errors = validateRegisterForm({ ...valid, password: "weak" });
    expect(errors.password).toBeTruthy();
  });

  it("signale companyName trop long (> 50 caractères)", () => {
    const errors = validateRegisterForm({
      ...valid,
      companyName: "A".repeat(51),
    });
    expect(errors.companyName).toContain("Maximum");
  });

  it("signale email trop long (> 50 caractères)", () => {
    const errors = validateRegisterForm({
      ...valid,
      email: "a".repeat(45) + "@b.com", // 52 chars total
    });
    expect(errors.email).toContain("Maximum");
  });
});
