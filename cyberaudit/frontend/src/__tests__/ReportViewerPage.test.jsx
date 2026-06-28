// ─── Tests : ReportViewerPage.jsx ────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ReportViewerPage from "../pages/ReportViewerPage.jsx";

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock("../services/dataService.js", () => ({
  getReportByReference:        vi.fn(),
  getRequestByReference:       vi.fn(),
  generateReportFromFindings:  vi.fn(),
  updateRequest:               vi.fn(),
}));

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn() },
}));

import {
  getReportByReference,
  getRequestByReference,
  generateReportFromFindings,
  updateRequest,
} from "../services/dataService.js";
import api from "../services/api.js";

// ── Données fictives ──────────────────────────────────────────────────────────
const FAKE_REPORT = {
  id: "report-1",
  reference: "DOSSIER-2026-0055",
  security_score: 72,
  grade: "B",
  verdict: "Acceptable risk level",
  summary: "Audit complet réalisé sur le périmètre défini.",
  findings: [
    { severity: "High",   asset: "VPN public", description: "CVE-2024-1111", recommendation: "Mettre à jour le firmware" },
    { severity: "Medium", asset: "WordPress", description: "Plugins obsolètes", recommendation: "Mettre à jour les plugins" },
  ],
};

const FAKE_AUDIT = {
  id: "uuid-55",
  reference: "DOSSIER-2026-0055",
  status: "completed",
  submitted_at: "2026-06-01T09:00:00Z",
  client_info: { company_name: "TechStart SAS" },
};

const FAKE_AUDIT_PENDING = {
  ...FAKE_AUDIT,
  status: "in_progress",
};

// ── Helpers sessionStorage ──────────────────────────────────────────────────────
function setAdminUser() {
  sessionStorage.setItem(
    "cyberaudit:session",
    JSON.stringify({ user: { role: "admin", first_name: "Admin" } })
  );
}
function setClientUser() {
  sessionStorage.setItem(
    "cyberaudit:session",
    JSON.stringify({ user: { role: "client", first_name: "Alice" } })
  );
}
function clearUser() {
  sessionStorage.removeItem("cyberaudit:session");
}

// ── Rendu ─────────────────────────────────────────────────────────────────────
function renderPage(reference = "DOSSIER-2026-0055") {
  return render(
    <MemoryRouter initialEntries={[`/admin/report/${reference}`]}>
      <Routes>
        <Route path="/admin/report/:reference" element={<ReportViewerPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  clearUser();
  updateRequest.mockResolvedValue({});
  generateReportFromFindings.mockResolvedValue({ security_score: 85, grade: "A" });
});

afterEach(() => clearUser());

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("ReportViewerPage", () => {
  // ── Spinner ──────────────────────────────────────────────────────────────
  it("affiche un spinner pendant le chargement", () => {
    getReportByReference.mockReturnValue(new Promise(() => {}));
    getRequestByReference.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  // ── Aucun rapport ─────────────────────────────────────────────────────────
  it("affiche 'No report available' si le rapport est null (client)", async () => {
    setClientUser();
    getReportByReference.mockResolvedValue(null);
    getRequestByReference.mockResolvedValue({ ...FAKE_AUDIT, status: "completed" });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/no report available/i)).toBeInTheDocument();
    });
  });

  // ── Mode lecture (rapport existant) ──────────────────────────────────────
  it("affiche le score de sécurité en mode lecture", async () => {
    setClientUser();
    getReportByReference.mockResolvedValue(FAKE_REPORT);
    getRequestByReference.mockResolvedValue(FAKE_AUDIT);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("72 / 100")).toBeInTheDocument();
    });
  });

  it("affiche la grade en mode lecture", async () => {
    setClientUser();
    getReportByReference.mockResolvedValue(FAKE_REPORT);
    getRequestByReference.mockResolvedValue(FAKE_AUDIT);
    renderPage();
    await waitFor(() => {
      // La grade "B" apparaît dans la grille de score
      expect(screen.getByText("B")).toBeInTheDocument();
    });
  });

  it("affiche les findings dans le tableau", async () => {
    setClientUser();
    getReportByReference.mockResolvedValue(FAKE_REPORT);
    getRequestByReference.mockResolvedValue(FAKE_AUDIT);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("VPN public")).toBeInTheDocument();
      expect(screen.getByText("WordPress")).toBeInTheDocument();
    });
  });

  it("affiche le verdict dans le résumé", async () => {
    setClientUser();
    getReportByReference.mockResolvedValue(FAKE_REPORT);
    getRequestByReference.mockResolvedValue(FAKE_AUDIT);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Acceptable risk level")).toBeInTheDocument();
    });
  });

  it("affiche le bouton 'Download PDF' en mode lecture", async () => {
    setClientUser();
    getReportByReference.mockResolvedValue(FAKE_REPORT);
    getRequestByReference.mockResolvedValue(FAKE_AUDIT);
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
    });
  });

  it("affiche 'No PDF available' si l'API retourne >= 400", async () => {
    setClientUser();
    getReportByReference.mockResolvedValue(FAKE_REPORT);
    getRequestByReference.mockResolvedValue(FAKE_AUDIT);
    api.get.mockResolvedValue({ status: 404, data: null });
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: /download pdf/i }));

    fireEvent.click(screen.getByRole("button", { name: /download pdf/i }));

    await waitFor(() => {
      expect(screen.getByText(/no pdf available/i)).toBeInTheDocument();
    });
  });

  // ── Mode édition (admin + audit non-complété) ─────────────────────────────
  it("affiche le mode édition quand l'utilisateur est admin et l'audit n'est pas completed", async () => {
    setAdminUser();
    getReportByReference.mockResolvedValue(null); // pas encore de rapport
    getRequestByReference.mockResolvedValue(FAKE_AUDIT_PENDING);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/edit mode/i)).toBeInTheDocument();
    });
  });

  it("affiche le bouton 'Generate report' en mode édition", async () => {
    setAdminUser();
    getReportByReference.mockResolvedValue(null);
    getRequestByReference.mockResolvedValue(FAKE_AUDIT_PENDING);
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /generate report/i })).toBeInTheDocument();
    });
  });

  it("affiche 'No vulnerability added yet.' si la liste de findings est vide", async () => {
    setAdminUser();
    getReportByReference.mockResolvedValue(null);
    getRequestByReference.mockResolvedValue(FAKE_AUDIT_PENDING);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/no vulnerability added yet/i)).toBeInTheDocument();
    });
  });

  it("ajoute un finding dans la liste après avoir rempli le champ Asset", async () => {
    setAdminUser();
    getReportByReference.mockResolvedValue(null);
    getRequestByReference.mockResolvedValue(FAKE_AUDIT_PENDING);
    renderPage();
    await waitFor(() => screen.getByPlaceholderText(/e\.g\. public vpn/i));

    // Remplir le champ Asset
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. public vpn/i), {
      target: { value: "Serveur AD" },
    });

    // Cliquer sur "+ Add to report"
    fireEvent.click(screen.getByRole("button", { name: /add to report/i }));

    await waitFor(() => {
      expect(screen.getByText("Serveur AD")).toBeInTheDocument();
    });
  });

  it("n'ajoute pas un finding si Asset est vide et affiche un message d'erreur", async () => {
    setAdminUser();
    getReportByReference.mockResolvedValue(null);
    getRequestByReference.mockResolvedValue(FAKE_AUDIT_PENDING);
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: /add to report/i }));

    // Ne pas remplir Asset, cliquer directement
    fireEvent.click(screen.getByRole("button", { name: /add to report/i }));

    await waitFor(() => {
      expect(screen.getByText(/'Asset' field is required/i)).toBeInTheDocument();
    });
  });

  // ── Admin avec rapport existant ───────────────────────────────────────────
  it("affiche le bouton 'Edit report' pour admin quand le rapport est en lecture", async () => {
    setAdminUser();
    getReportByReference.mockResolvedValue(FAKE_REPORT);
    getRequestByReference.mockResolvedValue(FAKE_AUDIT); // status: completed → pas editMode
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /edit report/i })).toBeInTheDocument();
    });
  });

  // ── handleDownloadPdf — cas supplémentaires ───────────────────────────────

  it("affiche 'Audit ID not found.' si l'audit est null quand Download PDF est cliqué", async () => {
    setClientUser();
    // rapport présent (bouton Download PDF visible) mais audit null
    getReportByReference.mockResolvedValue(FAKE_REPORT);
    getRequestByReference.mockResolvedValue(null);
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: /download pdf/i }));

    fireEvent.click(screen.getByRole("button", { name: /download pdf/i }));

    await waitFor(() =>
      expect(screen.getByText(/audit id not found/i)).toBeInTheDocument()
    );
  });

  it("affiche 'PDF being generated' si l'API retourne 202", async () => {
    setClientUser();
    getReportByReference.mockResolvedValue(FAKE_REPORT);
    getRequestByReference.mockResolvedValue(FAKE_AUDIT);
    api.get.mockResolvedValue({ status: 202, data: null });
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: /download pdf/i }));

    fireEvent.click(screen.getByRole("button", { name: /download pdf/i }));

    await waitFor(() =>
      expect(screen.getByText(/pdf being generated/i)).toBeInTheDocument()
    );
  });

  it("télécharge le PDF et crée un URL blob si status 200", async () => {
    globalThis.URL.createObjectURL = vi.fn(() => "blob:pdf-test");
    globalThis.URL.revokeObjectURL = vi.fn();

    setClientUser();
    getReportByReference.mockResolvedValue(FAKE_REPORT);
    getRequestByReference.mockResolvedValue(FAKE_AUDIT);
    api.get.mockResolvedValue({ status: 200, data: new Uint8Array([37, 80, 68, 70]) });
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: /download pdf/i }));

    fireEvent.click(screen.getByRole("button", { name: /download pdf/i }));

    await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled());
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:pdf-test");
  });

  it("affiche la modal de génération (submitting) pendant generateReportFromFindings", async () => {
    setAdminUser();
    let resolveGenerate;
    generateReportFromFindings.mockReturnValue(
      new Promise((res) => { resolveGenerate = res; })
    );
    getReportByReference.mockResolvedValue(null);
    getRequestByReference.mockResolvedValue(FAKE_AUDIT_PENDING);
    renderPage();

    await waitFor(() => screen.getByRole("button", { name: /generate report/i }));
    fireEvent.click(screen.getByRole("button", { name: /generate report/i }));

    await waitFor(() =>
      expect(screen.getByText(/report generation in progress/i)).toBeInTheDocument()
    );

    // Résoudre pour terminer proprement le test
    resolveGenerate({ security_score: 85, grade: "A" });
  });

  it("affiche 'No vulnerability recorded.' si les findings sont vides en mode lecture", async () => {
    setClientUser();
    getReportByReference.mockResolvedValue({ ...FAKE_REPORT, findings: [] });
    getRequestByReference.mockResolvedValue(FAKE_AUDIT);
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/no vulnerability recorded/i)).toBeInTheDocument()
    );
  });
});
