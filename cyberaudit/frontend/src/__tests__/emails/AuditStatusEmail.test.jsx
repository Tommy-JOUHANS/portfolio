// src/__tests__/emails/AuditStatusEmail.test.jsx
import { describe, it, expect } from "vitest";
import { render } from "@react-email/render";
import AuditStatusEmail from "../../../emails/AuditStatusEmail";

describe("AuditStatusEmail", () => {

  it("se rend sans erreur avec les props par défaut", async () => {
    const html = await render(<AuditStatusEmail />);
    expect(html).toBeTruthy();
  });

  it("contient le prénom de l'utilisateur", async () => {
    const html = await render(<AuditStatusEmail firstName="Marie" />);
    expect(html).toContain("Marie");
  });

  it("affiche l'ID de l'audit", async () => {
    const html = await render(<AuditStatusEmail auditId="123" />);
    expect(html).toContain("123");
  });

  it("affiche 'En attente' pour le statut pending", async () => {
    const html = await render(<AuditStatusEmail status="pending" />);
    expect(html).toContain("En attente");
  });

  it("affiche 'En cours' pour le statut in_progress", async () => {
    const html = await render(<AuditStatusEmail status="in_progress" />);
    expect(html).toContain("En cours");
  });

  it("affiche 'Terminé' pour le statut completed", async () => {
    const html = await render(<AuditStatusEmail status="completed" />);
    expect(html).toContain("Terminé");
  });

  it("affiche 'Annulé' pour le statut cancelled", async () => {
    const html = await render(<AuditStatusEmail status="cancelled" />);
    expect(html).toContain("Annulé");
  });

  it("contient le lien vers le dashboard", async () => {
    const url = "http://localhost:5173/dashboard";
    const html = await render(<AuditStatusEmail dashboardUrl={url} />);
    expect(html).toContain(url);
  });

  it("affiche la couleur verte pour un audit terminé", async () => {
    const html = await render(<AuditStatusEmail status="completed" />);
    expect(html).toContain("#10b981"); // vert
  });

  it("affiche la couleur rouge pour un audit annulé", async () => {
    const html = await render(<AuditStatusEmail status="cancelled" />);
    expect(html).toContain("#ef4444"); // rouge
  });

});
