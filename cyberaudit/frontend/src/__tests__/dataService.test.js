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
    get:   vi.fn(),   // simule api.get(...)
    post:  vi.fn(),   // simule api.post(...)
    patch: vi.fn(),   // simule api.patch(...)
  },
}));

// On importe APRÈS le mock pour que le module utilise notre fausse version.
import api from "../services/api.js";
import {
  getPackages,
  getPackageByCode,
  getAllRequests,
  createRequest,
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
