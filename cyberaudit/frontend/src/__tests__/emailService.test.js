// ─── Tests : emailService.js ─────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock @emailjs/browser ─────────────────────────────────────────────────────
vi.mock("@emailjs/browser", () => ({
  default: { send: vi.fn() },
}));

import emailjs from "@emailjs/browser";
import {
  sendAuditConfirmation,
  sendStatusNotification,
} from "../services/emailService.js";

beforeEach(() => vi.clearAllMocks());

// ── sendAuditConfirmation ─────────────────────────────────────────────────────
describe("sendAuditConfirmation()", () => {
  it("n'appelle pas emailjs.send si les variables VITE_ sont manquantes", async () => {
    // Par défaut dans Vitest, import.meta.env.VITE_* = undefined
    await sendAuditConfirmation({
      to_email: "client@test.fr",
      to_name: "Alice",
      reference: "DOSSIER-2026-0001",
    });
    expect(emailjs.send).not.toHaveBeenCalled();
  });

  it("appelle emailjs.send avec les bons paramètres quand les variables sont présentes", async () => {
    // On injecte les vars d'env via import.meta.env (Vitest les expose)
    vi.stubEnv("VITE_EMAILJS_SERVICE_ID", "svc_test");
    vi.stubEnv("VITE_EMAILJS_TEMPLATE_CONFIRM", "tmpl_confirm");
    vi.stubEnv("VITE_EMAILJS_PUBLIC_KEY", "pub_key");

    emailjs.send.mockResolvedValue({ status: 200 });

    await sendAuditConfirmation({
      to_email: "client@test.fr",
      to_name: "Alice",
      username: "alice",
      company_name: "Acme Corp",
      pack_name: "Pack Security",
      services_included: "Pentest",
      price: "2000",
      processing_time: "10",
      message: "RAS",
      reference: "DOSSIER-2026-0001",
    });

    expect(emailjs.send).toHaveBeenCalledOnce();
    const [svcId, tmplId, params] = emailjs.send.mock.calls[0];
    expect(svcId).toBe("svc_test");
    expect(tmplId).toBe("tmpl_confirm");
    expect(params.to_email).toBe("client@test.fr");
    expect(params.reference).toBe("DOSSIER-2026-0001");

    vi.unstubAllEnvs();
  });

  it("propage l'erreur si emailjs.send rejette", async () => {
    vi.stubEnv("VITE_EMAILJS_SERVICE_ID", "svc_test");
    vi.stubEnv("VITE_EMAILJS_TEMPLATE_CONFIRM", "tmpl_confirm");
    vi.stubEnv("VITE_EMAILJS_PUBLIC_KEY", "pub_key");

    emailjs.send.mockRejectedValue(new Error("EmailJS error"));

    await expect(
      sendAuditConfirmation({ to_email: "x@x.fr", to_name: "X", reference: "REF" })
    ).rejects.toThrow("EmailJS error");

    vi.unstubAllEnvs();
  });
});

// ── sendStatusNotification ────────────────────────────────────────────────────
describe("sendStatusNotification()", () => {
  it("n'appelle pas emailjs.send si les variables VITE_ sont manquantes", async () => {
    await sendStatusNotification({
      to_email: "client@test.fr",
      to_name: "Alice",
      reference: "DOSSIER-2026-0001",
      new_status: "Completed",
    });
    expect(emailjs.send).not.toHaveBeenCalled();
  });

  it("appelle emailjs.send avec les bons paramètres", async () => {
    vi.stubEnv("VITE_EMAILJS_SERVICE_ID", "svc_test");
    vi.stubEnv("VITE_EMAILJS_TEMPLATE_UPDATE", "tmpl_update");
    vi.stubEnv("VITE_EMAILJS_PUBLIC_KEY", "pub_key");

    emailjs.send.mockResolvedValue({ status: 200 });

    await sendStatusNotification({
      to_email: "client@test.fr",
      to_name: "Alice",
      reference: "DOSSIER-2026-0001",
      new_status: "Completed",
      message: "Your audit is done.",
    });

    expect(emailjs.send).toHaveBeenCalledOnce();
    const [, , params] = emailjs.send.mock.calls[0];
    expect(params.to_email).toBe("client@test.fr");
    expect(params.new_status).toBe("Completed");
    expect(params.message).toBe("Your audit is done.");

    vi.unstubAllEnvs();
  });

  it("utilise une chaîne vide par défaut pour message", async () => {
    vi.stubEnv("VITE_EMAILJS_SERVICE_ID", "svc_test");
    vi.stubEnv("VITE_EMAILJS_TEMPLATE_UPDATE", "tmpl_update");
    vi.stubEnv("VITE_EMAILJS_PUBLIC_KEY", "pub_key");

    emailjs.send.mockResolvedValue({ status: 200 });

    await sendStatusNotification({
      to_email: "x@x.fr",
      to_name: "X",
      reference: "REF",
      new_status: "In Progress",
      // message non fourni
    });

    const [, , params] = emailjs.send.mock.calls[0];
    expect(params.message).toBe("");

    vi.unstubAllEnvs();
  });
});
