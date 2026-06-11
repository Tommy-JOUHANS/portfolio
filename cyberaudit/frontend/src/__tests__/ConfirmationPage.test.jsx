// ─── Tests : ConfirmationPage.jsx ────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ConfirmationPage from "../pages/ConfirmationPage.jsx";

// ── Mock dataService ──────────────────────────────────────────────────────────
vi.mock("../services/dataService.js", () => ({
  getRequestByReference: vi.fn(),
}));

import { getRequestByReference } from "../services/dataService.js";

// ── Données fictives ──────────────────────────────────────────────────────────
const FAKE_REQUEST = {
  reference: "DOSSIER-2026-0015",
  status: "completed",
  submitted_at: "2026-06-09T07:26:00Z",
  scope_notes: "Test de sécurité complet",
  pack: {
    name: "Pack Security",
    price: 2000,
    duration_days: 10,
    included_services: "Pentest + Audit",
    for_whom: "PME",
    perimeter: "Infrastructure",
  },
  client_info: {
    first_name: "Tommy",
    last_name: "Jouhans",
    company_name: "CyberAudit Solutions",
    email: "tommy.jouhans@outlook.com",
  },
};

// ── Helper de rendu avec route paramétrée ─────────────────────────────────────
function renderPage(reference = "DOSSIER-2026-0015") {
  return render(
    <MemoryRouter initialEntries={[`/audit/confirmation/${reference}`]}>
      <Routes>
        <Route path="/audit/confirmation/:reference" element={<ConfirmationPage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("ConfirmationPage", () => {
  it("affiche un spinner pendant le chargement", () => {
    // getRequestByReference ne se résout jamais pendant ce test
    getRequestByReference.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("affiche le numéro de dossier après chargement", async () => {
    getRequestByReference.mockResolvedValue(FAKE_REQUEST);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("DOSSIER-2026-0015")).toBeInTheDocument();
    });
  });

  it("affiche le nom du contact", async () => {
    getRequestByReference.mockResolvedValue(FAKE_REQUEST);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Tommy/i)).toBeInTheDocument();
      expect(screen.getByText(/Jouhans/i)).toBeInTheDocument();
    });
  });

  it("affiche le nom du pack sélectionné", async () => {
    getRequestByReference.mockResolvedValue(FAKE_REQUEST);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Pack Security")).toBeInTheDocument();
    });
  });

  it("affiche le message de scope_notes", async () => {
    getRequestByReference.mockResolvedValue(FAKE_REQUEST);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Test de sécurité complet")).toBeInTheDocument();
    });
  });

  it("affiche un message d'erreur si la demande est introuvable", async () => {
    getRequestByReference.mockResolvedValue(null);
    renderPage("INEXISTANT-0000");
    await waitFor(() => {
      expect(screen.getByText(/no requests found/i)).toBeInTheDocument();
    });
  });

  it("affiche un lien vers le dashboard", async () => {
    getRequestByReference.mockResolvedValue(FAKE_REQUEST);
    renderPage();
    await waitFor(() => {
      const links = screen.getAllByText(/dashboard/i);
      expect(links.length).toBeGreaterThan(0);
    });
  });
});
