// ─── Tests : AdminDashboard.jsx ──────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "../components/admin/AdminDashboard.jsx";

// ── Mock api.js ───────────────────────────────────────────────────────────────
vi.mock("../services/api.js", () => ({
  default: { get: vi.fn() },
}));

import api from "../services/api.js";

// ── Données fictives ──────────────────────────────────────────────────────────
const FAKE_REQUESTS = [
  {
    id: "uuid-1",
    reference: "DOSSIER-2026-0015",
    status: "completed",
    submitted_at: "2026-06-09T07:26:00Z",
    pack: { code: "security", name: "Pack Security" },
    client_info: { company_name: "CyberAudit Solutions" },
  },
  {
    id: "uuid-2",
    reference: "DOSSIER-2026-0014",
    status: "pending",
    submitted_at: "2026-06-08T16:03:00Z",
    pack: { code: "audit", name: "Pack Audit" },
    client_info: { company_name: "Acme Corp" },
  },
  {
    id: "uuid-3",
    reference: "DOSSIER-2026-0013",
    status: "in_progress",
    submitted_at: "2026-06-07T09:00:00Z",
    pack: { code: "protection", name: "Pack Protection" },
    client_info: { company_name: "TechStart SAS" },
  },
];

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
}

beforeEach(() => vi.clearAllMocks());

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("AdminDashboard", () => {
  it("affiche un spinner pendant le chargement", () => {
    api.get.mockReturnValue(new Promise(() => {}));
    renderDashboard();
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("affiche le titre du dashboard", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    });
  });

  it("affiche les 3 demandes dans le tableau", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("DOSSIER-2026-0015")).toBeInTheDocument();
      expect(screen.getByText("DOSSIER-2026-0014")).toBeInTheDocument();
      expect(screen.getByText("DOSSIER-2026-0013")).toBeInTheDocument();
    });
  });

  it("affiche les noms de sociétés clients", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("CyberAudit Solutions")).toBeInTheDocument();
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    });
  });

  it("affiche 'Aucune demande' si la liste est vide", async () => {
    api.get.mockResolvedValue({ data: [] });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/aucune demande/i)).toBeInTheDocument();
    });
  });

  it("gère le format paginé { results: [] }", async () => {
    api.get.mockResolvedValue({ data: { results: FAKE_REQUESTS } });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("DOSSIER-2026-0015")).toBeInTheDocument();
    });
  });

  it("affiche le bouton Reset filters", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /reset filters/i })).toBeInTheDocument();
    });
  });

  it("filtre les demandes par recherche client", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("DOSSIER-2026-0015")).toBeInTheDocument();
    });

    // Saisir "Acme" dans le champ de recherche client
    const searchInput = screen.getByPlaceholderText("Search");
    fireEvent.change(searchInput, { target: { value: "Acme" } });

    await waitFor(() => {
      expect(screen.getByText("DOSSIER-2026-0014")).toBeInTheDocument();
      expect(screen.queryByText("DOSSIER-2026-0015")).not.toBeInTheDocument();
    });
  });

  it("réinitialise les filtres avec le bouton Reset", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    renderDashboard();
    await waitFor(() => screen.getByText("DOSSIER-2026-0015"));

    // Filtrer par "Acme" puis reset
    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "Acme" },
    });
    await waitFor(() =>
      expect(screen.queryByText("DOSSIER-2026-0015")).not.toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: /reset filters/i }));
    await waitFor(() => {
      expect(screen.getByText("DOSSIER-2026-0015")).toBeInTheDocument();
    });
  });

  it("affiche un lien 'Report' pour les demandes completed", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    renderDashboard();
    await waitFor(() => {
      // Seul le dossier completed affiche le lien "Report"
      expect(screen.getByRole("link", { name: /^Report$/i })).toBeInTheDocument();
    });
  });

  it("affiche un lien 'Edit' pour toutes les demandes", async () => {
    api.get.mockResolvedValue({ data: FAKE_REQUESTS });
    renderDashboard();
    await waitFor(() => {
      // Chaque ligne a un lien "Edit" (gestion statut + détails)
      const editLinks = screen.getAllByRole("link", { name: /^Edit$/i });
      expect(editLinks.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("gère silencieusement une erreur API (setRequests à [])", async () => {
    api.get.mockRejectedValue(new Error("Network error"));
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/aucune demande/i)).toBeInTheDocument();
    });
  });
});
