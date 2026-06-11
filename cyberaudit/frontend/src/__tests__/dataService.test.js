// ─── Tests : dataService.js ───────────────────────────────────────────────────
//
// CONCEPT : on ne veut pas faire de vrais appels HTTP dans les tests.
// On "mocke" (simule) l'instance axios (api.js) pour contrôler
// exactement ce qu'elle retourne, sans backend.
//
// Structure d'un test :
//   1. GIVEN  : on prépare les données et les mocks
//   2. WHEN   : on appelle la fonction à tester
//   3. THEN   : on vérifie le résultat avec expect()

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock de api.js ──────────────────────────────────────────────────────────
// On remplace l'import de api.js par un objet fictif.
// Toutes les fonctions qui importent "api" recevront ce mock.
vi.mock("../services/api.js", () => ({
  default: {
    get:     vi.fn(),   // simule api.get(...)
    post:    vi.fn(),   // simule api.post(...)
    patch:   vi.fn(),   // simule api.patch(...)
    delete:  vi.fn(),   // simule api.delete(...)
    defaults: { baseURL: "http://localhost:8000/api" },
  },
}));

// On importe APRÈS le mock pour que le module utilise notre fausse version.
import api from "../services/api.js";
import {
  getPackages,
  getPackageByCode,
  getAllRequests,
  createRequest,
  getRequestsByClientId,
  getRequestByReference,
  updateRequest,
  archiveRequest,
  addRequestHistory,
  getReportByReference,
  generateReport,
  getReportDownloadUrl,
  getTrainingModules,
  updateModuleStatus,
  getNotificationsByUserId,
  generateReportFromFindings,
} from "../services/dataService.js";

// Données fictives qui représentent ce que l'API renverrait normalement.
const FAKE_PACKS = [
  { id: 1, code: "audit",    name: "Pack Audit",    price: 1000, duration_days: 5  },
  { id: 2, code: "security", name: "Pack Security", price: 2000, duration_days: 10 },
];

const FAKE_REQUESTS = [
  { id: "uuid-1", reference: "DOSSIER-2026-0001", status: "pending" },
  { id: "uuid-2", reference: "DOSSIER-2026-0002", status: "completed" },
];

// Avant chaque test : réinitialise tous les mocks et le cache interne.
beforeEach(() => {
  vi.clearAllMocks();
  // Vide le cache des packs (variable privée du module).
  // On recharge le module à chaque test pour repartir à zéro.
});

// ── getPackages ──────────────────────────────────────────────────────────────
describe("getPackages()", () => {
  it("retourne la liste des packs depuis l'API", async () => {
    // GIVEN : api.get retourne nos packs fictifs
    api.get.mockResolvedValue({ data: FAKE_PACKS });

    // WHEN : on appelle getPackages
    const result = await getPackages();

    // THEN : le résultat correspond aux données fictives
    expect(result).toEqual(FAKE_PACKS);
    // Et api.get a bien été appelé avec le bon endpoint
    expect(api.get).toHaveBeenCalledWith("/packs/");
  });
});

// ── getPackageByCode ─────────────────────────────────────────────────────────
describe("getPackageByCode()", () => {
  it("retrouve le bon pack par son code", async () => {
    api.get.mockResolvedValue({ data: FAKE_PACKS });

    const pack = await getPackageByCode("security");

    // Le pack retourné doit être celui avec le code "security"
    expect(pack.name).toBe("Pack Security");
    expect(pack.id).toBe(2);
  });

  it("retourne null pour un code inconnu", async () => {
    api.get.mockResolvedValue({ data: FAKE_PACKS });

    const pack = await getPackageByCode("inexistant");

    expect(pack).toBeNull();
  });
});

// ── getAllRequests ────────────────────────────────────────────────────────────
describe("getAllRequests()", () => {
  it("retourne un tableau de demandes", async () => {
    // L'API renvoie directement un tableau
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });

    const result = await getAllRequests();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it("gère le format paginé { results: [] }", async () => {
    // Certaines APIs renvoient { count, results: [...] }
    api.get.mockResolvedValue({ data: { results: FAKE_REQUESTS } });

    const result = await getAllRequests();

    expect(result).toHaveLength(2);
    expect(result[0].reference).toBe("DOSSIER-2026-0001");
  });
});

// ── createRequest ─────────────────────────────────────────────────────────────
describe("createRequest()", () => {
  it("envoie le bon payload et retourne la demande créée", async () => {
    // GIVEN : getPackages retourne nos packs, et post retourne une demande
    api.get.mockResolvedValue({ data: FAKE_PACKS });
    const newRequest = { id: "uuid-3", reference: "DOSSIER-2026-0003" };
    api.post.mockResolvedValue({ data: newRequest });

    // WHEN : on crée une demande avec le code "audit"
    const result = await createRequest({ packCode: "audit", message: "Test" });

    // THEN : api.post a été appelé avec pack.id = 1
    expect(api.post).toHaveBeenCalledWith("/audits/", {
      pack: 1,           // id du pack "audit"
      scope_notes: "Test",
    });
    expect(result.reference).toBe("DOSSIER-2026-0003");
  });

  it("lève une erreur si le pack est introuvable", async () => {
    api.get.mockResolvedValue({ data: FAKE_PACKS });

    // On s'attend à ce qu'une erreur soit levée
    await expect(
      createRequest({ packCode: "inexistant", message: "" })
    ).rejects.toThrow("Pack not found");
  });
});

// ── getRequestsByClientId ────────────────────────────────────────────────────
describe("getRequestsByClientId()", () => {
  it("délègue à getAllRequests et retourne les demandes", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    const result = await getRequestsByClientId("some-user-id");
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(api.get).toHaveBeenCalledWith("/audits/");
  });
});

// ── getRequestByReference ────────────────────────────────────────────────────
describe("getRequestByReference()", () => {
  it("retourne la demande correspondant à la référence", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    const result = await getRequestByReference("DOSSIER-2026-0001");
    expect(result.id).toBe("uuid-1");
  });

  it("retourne null si la référence n'existe pas", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    const result = await getRequestByReference("INEXISTANT-9999");
    expect(result).toBeNull();
  });
});

// ── updateRequest ────────────────────────────────────────────────────────────
describe("updateRequest()", () => {
  it("envoie un PATCH avec le bon payload", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    const updated = { ...FAKE_REQUESTS[0], status: "completed" };
    api.patch.mockResolvedValue({ data: updated });

    const result = await updateRequest("DOSSIER-2026-0001", {
      status: "completed",
      internal_notes: "OK",
    });

    expect(api.patch).toHaveBeenCalledWith("/audits/uuid-1/", {
      status: "completed",
      internal_notes: "OK",
    });
    expect(result.status).toBe("completed");
  });

  it("lève une erreur si la référence n'existe pas", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    await expect(
      updateRequest("INEXISTANT-9999", { status: "completed" })
    ).rejects.toThrow("Request not found");
  });
});

// ── archiveRequest ───────────────────────────────────────────────────────────
describe("archiveRequest()", () => {
  it("supprime la demande via api.delete et retourne un objet archivé", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    api.delete.mockResolvedValue({});

    const result = await archiveRequest("DOSSIER-2026-0001");

    expect(api.delete).toHaveBeenCalledWith("/audits/uuid-1/");
    expect(result.status).toBe("archived");
    expect(result.id).toBe("uuid-1");
  });

  it("lève une erreur si la référence n'existe pas", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    await expect(archiveRequest("INEXISTANT-9999")).rejects.toThrow("Request not found");
  });
});

// ── addRequestHistory ────────────────────────────────────────────────────────
describe("addRequestHistory()", () => {
  it("délègue à getRequestByReference et retourne la demande", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    const result = await addRequestHistory("DOSSIER-2026-0001");
    expect(result.reference).toBe("DOSSIER-2026-0001");
  });
});

// ── getReportByReference ─────────────────────────────────────────────────────
describe("getReportByReference()", () => {
  const FAKE_REPORT = { id: "report-1", grade: "B", security_score: 72 };

  it("retourne les données du rapport quand l'API répond", async () => {
    api.get
      .mockResolvedValueOnce({ data: FAKE_REQUESTS })   // getAllRequests → /audits/
      .mockResolvedValueOnce({ data: FAKE_REPORT });    // /audits/uuid-1/report/data/

    const result = await getReportByReference("DOSSIER-2026-0001");
    expect(result.grade).toBe("B");
  });

  it("retourne null si la demande n'existe pas (reference inconnue)", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    const result = await getReportByReference("INEXISTANT-9999");
    expect(result).toBeNull();
  });

  it("retourne null si le rapport répond 404", async () => {
    api.get
      .mockResolvedValueOnce({ data: FAKE_REQUESTS })
      .mockRejectedValueOnce({ response: { status: 404 } });

    const result = await getReportByReference("DOSSIER-2026-0001");
    expect(result).toBeNull();
  });

  it("relance l'erreur pour les statuts non-404", async () => {
    api.get
      .mockResolvedValueOnce({ data: FAKE_REQUESTS })
      .mockRejectedValueOnce({ response: { status: 500 } });

    await expect(getReportByReference("DOSSIER-2026-0001")).rejects.toMatchObject({
      response: { status: 500 },
    });
  });
});

// ── generateReport ───────────────────────────────────────────────────────────
describe("generateReport()", () => {
  it("génère un rapport via l'API et retourne les données", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    const reportData = { id: "report-1", status: "generating" };
    api.post.mockResolvedValue({ data: reportData });

    const result = await generateReport("DOSSIER-2026-0001", "admin", {
      summary: "Résumé", verdict: "Bon", grade: "A", security_score: 90, findings: [],
    });

    expect(api.post).toHaveBeenCalledWith(
      "/audits/uuid-1/generate-report/",
      expect.objectContaining({ summary: "Résumé", grade: "A" })
    );
    expect(result.id).toBe("report-1");
  });

  it("utilise les valeurs par défaut quand findings est absent", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    api.post.mockResolvedValue({ data: { id: "report-2" } });

    await generateReport("DOSSIER-2026-0001", "admin");

    expect(api.post).toHaveBeenCalledWith(
      "/audits/uuid-1/generate-report/",
      expect.objectContaining({
        verdict: "To be determined",
        grade: "C",
        security_score: 50,
        findings: [],
      })
    );
  });

  it("lève une erreur si la demande n'existe pas", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    await expect(generateReport("INEXISTANT-9999", "admin", {})).rejects.toThrow("Request not found");
  });
});

// ── getReportDownloadUrl ─────────────────────────────────────────────────────
describe("getReportDownloadUrl()", () => {
  it("retourne l'URL correcte avec le baseURL de l'instance axios", () => {
    const url = getReportDownloadUrl("uuid-1");
    expect(url).toContain("/audits/uuid-1/report/");
    expect(url).toContain("http://localhost:8000/api");
  });
});

// ── getTrainingModules ───────────────────────────────────────────────────────
describe("getTrainingModules()", () => {
  it("retourne les modules formatés avec statut user_status", async () => {
    const raw = [
      { id: 1, title: "Module 1", description: "Desc 1", user_status: "completed" },
      { id: 2, title: "Module 2", description: "Desc 2" },  // pas de user_status → "to_start"
    ];
    api.get.mockResolvedValue({ data: raw });

    const result = await getTrainingModules();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 1, title: "Module 1", description: "Desc 1", status: "completed" });
    expect(result[1].status).toBe("to_start");
    expect(api.get).toHaveBeenCalledWith("/training/modules/");
  });
});

// ── updateModuleStatus ───────────────────────────────────────────────────────
describe("updateModuleStatus()", () => {
  const RAW_MODULES = [{ id: 1, title: "Module 1", description: "Desc" }];

  it("envoie POST à 'complete' si newStatus = 'completed'", async () => {
    api.post.mockResolvedValue({});
    api.get.mockResolvedValue({ data: RAW_MODULES });

    await updateModuleStatus(1, "completed");

    expect(api.post).toHaveBeenCalledWith("/training/modules/1/complete/");
  });

  it("envoie POST à 'start' si newStatus ≠ 'completed'", async () => {
    api.post.mockResolvedValue({});
    api.get.mockResolvedValue({ data: RAW_MODULES });

    await updateModuleStatus(1, "in_progress");

    expect(api.post).toHaveBeenCalledWith("/training/modules/1/start/");
  });
});

// ── getNotificationsByUserId ─────────────────────────────────────────────────
describe("getNotificationsByUserId()", () => {
  it("retourne les notifications formatées avec user_id injecté", async () => {
    const raw = [
      {
        id: "n1",
        request_reference: "DOSSIER-2026-0001",
        type: "status_update",
        message: "Statut mis à jour",
        created_at: "2026-06-01T08:00:00Z",
      },
    ];
    api.get.mockResolvedValue({ data: raw });

    const result = await getNotificationsByUserId("user-abc");

    expect(result).toHaveLength(1);
    expect(result[0].user_id).toBe("user-abc");
    expect(result[0].message).toBe("Statut mis à jour");
    expect(result[0].request_reference).toBe("DOSSIER-2026-0001");
    expect(api.get).toHaveBeenCalledWith("/notifications/me/");
  });
});

// ── generateReportFromFindings ───────────────────────────────────────────────
describe("generateReportFromFindings()", () => {
  it("génère un rapport à partir des findings", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    const reportResult = { security_score: 85, grade: "A" };
    api.post.mockResolvedValue({ data: reportResult });

    const result = await generateReportFromFindings("DOSSIER-2026-0001", {
      summary: "Résumé exécutif",
      verdict: "Risque acceptable",
      findings: [{ severity: "Low", asset: "Server", description: "Minor", recommendation: "Fix" }],
    });

    expect(api.post).toHaveBeenCalledWith(
      "/audits/uuid-1/generate-report/",
      expect.objectContaining({
        summary: "Résumé exécutif",
        verdict: "Risque acceptable",
        findings: expect.arrayContaining([expect.objectContaining({ severity: "Low" })]),
      })
    );
    expect(result.grade).toBe("A");
  });

  it("normalise un findings non-tableau en tableau vide", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    api.post.mockResolvedValue({ data: { security_score: 70, grade: "B" } });

    await generateReportFromFindings("DOSSIER-2026-0001", {
      summary: "", verdict: "", findings: "not-an-array",
    });

    expect(api.post).toHaveBeenCalledWith(
      "/audits/uuid-1/generate-report/",
      expect.objectContaining({ findings: [] })
    );
  });

  it("lève une erreur si la demande n'existe pas", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    await expect(
      generateReportFromFindings("INEXISTANT-9999", { summary: "", verdict: "", findings: [] })
    ).rejects.toThrow("Request not found");
  });
});
