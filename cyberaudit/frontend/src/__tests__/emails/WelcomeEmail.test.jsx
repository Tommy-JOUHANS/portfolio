// src/__tests__/emails/WelcomeEmail.test.jsx
import { describe, it, expect } from "vitest";
import { render } from "@react-email/render";
import WelcomeEmail from "../../../emails/WelcomeEmail";

// render() de react-email convertit le composant en HTML string (email-ready)
// On vérifie que le contenu généré est correct.

describe("WelcomeEmail", () => {

  it("se rend sans erreur", async () => {
    const html = await render(<WelcomeEmail />);
    expect(html).toBeTruthy();
    expect(typeof html).toBe("string");
  });

  it("contient le prénom de l'utilisateur", async () => {
    const html = await render(<WelcomeEmail firstName="Tommy" />);
    expect(html).toContain("Tommy");
  });

  it("contient le mot Bienvenue", async () => {
    const html = await render(<WelcomeEmail firstName="Tommy" />);
    expect(html).toContain("Bienvenue");
  });

  it("contient le lien vers le dashboard", async () => {
    const url = "http://localhost:5173/dashboard";
    const html = await render(<WelcomeEmail dashboardUrl={url} />);
    expect(html).toContain(url);
  });

  it("utilise les valeurs par défaut si aucune prop", async () => {
    const html = await render(<WelcomeEmail />);
    expect(html).toContain("Utilisateur");
    expect(html).toContain("localhost:5173");
  });

  it("affiche CyberAudit dans le preview", async () => {
    const html = await render(<WelcomeEmail firstName="Alice" />);
    expect(html).toContain("CyberAudit");
  });

});
