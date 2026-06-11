// ─── Tests : AdminRequestDetailPage.jsx ──────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import AdminRequestDetailPage from "../pages/AdminRequestDetailPage.jsx";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../services/dataService.js", () => ({
  getRequestByReference: vi.fn(),
  updateRequest:         vi.fn(),
  archiveRequest:        vi.fn(),
  addRequestHistory:     vi.fn().mockResolvedValue(null),
  generateReport:        vi.fn(),
}));

vi.mock("../services/emailService.js", () => ({
  sendStatusNotification: vi.fn(),
}));

import {
  getRequestByReference,
  updateRequest,
  archiveRequest,
  addRequestHistory,
  generateReport,
} from "../services/dataService.js";
import { sendStatusNotification } from "../services/emailService.js";

// ── Données fictives ──────────────────────────────────────────────────────────
const FAKE_REQUEST = {
  id: "uuid-99",
  reference: "DOSSIER-2026-0099",
  status: "in_progress",
  submitted_at: "2026-06-01T09:00:00Z",
  updated_at: "2026-06-05T11:00:00Z",
  assigned_to: "Karim",
  internal_notes: "Note interne de test",
  scope_notes: "Périmètre de test",
  pack: { code: "security", name: "Pack Security" },
  client_info: {
    company_name: "Acme Corp",
    first_name: "Alice",
    last_name: "Martin",
    email: "alice@acme.fr",
  },
};

const mockCtx = {
  user: { first_name: "Admin", role: "admin" },
  token: "fake-token",
  ready: true,
  isAuthenticated: true,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  hasRole: () => true,
};

function renderPage(reference = "DOSSIER-2026-0099") {
  return render(
    <AuthContext.Provider value={mockCtx}>
      <MemoryRouter initialEntries={[`/admin/request/${reference}`]}>
        <Routes>
          <Route path="/admin/request/:reference" element={<AdminRequestDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  updateRequest.mockResolvedValue({});
  archiveRequest.mockResolvedValue({});
  generateReport.mockResolvedValue({});
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("AdminRequestDetailPage", () => {
  it("affiche un spinner pendant le chargement", () => {
    getRequestByReference.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("affiche 'No requests found' si la demande n'existe pas", async () => {
    getRequestByReference.mockResolvedValue(null);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/no requests found/i)).toBeInTheDocument();
    });
  });

  it("affiche les informations du client", async () => {
    getRequestByReference.mockResolvedValue(FAKE_REQUEST);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      expect(screen.getByText("Alice Martin")).toBeInTheDocument();
      expect(screen.getByText("alice@acme.fr")).toBeInTheDocument();
    });
  });

  it("affiche le nom du pack", async () => {
    getRequestByReference.mockResolvedValue(FAKE_REQUEST);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Pack Security")).toBeInTheDocument();
    });
  });

  it("affiche le sélecteur de statut avec la valeur initiale", async () => {
    getRequestByReference.mockResolvedValue(FAKE_REQUEST);
    renderPage();
    await waitFor(() => {
      const select = screen.getByDisplayValue("In Progress");
      expect(select).toBeInTheDocument();
    });
  });

  it("affiche le sélecteur 'Assigned to' avec la valeur initiale", async () => {
    getRequestByReference.mockResolvedValue(FAKE_REQUEST);
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue("Karim")).toBeInTheDocument();
    });
  });

  it("affiche les notes internes dans le textarea", async () => {
    getRequestByReference.mockResolvedValue(FAKE_REQUEST);
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue("Note interne de test")).toBeInTheDocument();
    });
  });

  it("appelle updateRequest quand on clique sur 'Save changes'", async () => {
    // Second call après reload
    getRequestByReference
      .mockResolvedValueOnce(FAKE_REQUEST)
      .mockResolvedValueOnce(FAKE_REQUEST);
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: /save changes/i }));

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateRequest).toHaveBeenCalledWith(
        "DOSSIER-2026-0099",
        expect.objectContaining({ status: "in_progress" })
      );
    });
  });

  it("affiche 'Changes saved.' après une sauvegarde réussie", async () => {
    getRequestByReference
      .mockResolvedValueOnce(FAKE_REQUEST)
      .mockResolvedValueOnce(FAKE_REQUEST);
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: /save changes/i }));

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText("Changes saved.")).toBeInTheDocument();
    });
  });

  it("appelle archiveRequest quand on clique sur 'Archive request'", async () => {
    getRequestByReference
      .mockResolvedValueOnce(FAKE_REQUEST)
      .mockResolvedValueOnce({ ...FAKE_REQUEST, status: "archived" });
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: /archive request/i }));

    fireEvent.click(screen.getByRole("button", { name: /archive request/i }));

    await waitFor(() => {
      expect(archiveRequest).toHaveBeenCalledWith("DOSSIER-2026-0099");
    });
  });

  it("affiche le bouton 'Generate PDF report'", async () => {
    getRequestByReference.mockResolvedValue(FAKE_REQUEST);
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /generate pdf report/i })).toBeInTheDocument();
    });
  });

  it("affiche le bouton 'Send notification'", async () => {
    getRequestByReference.mockResolvedValue(FAKE_REQUEST);
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /send notification/i })).toBeInTheDocument();
    });
  });

  it("navigue vers /admin/report/… après génération PDF réussie", async () => {
    getRequestByReference.mockResolvedValue(FAKE_REQUEST);
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: /generate pdf report/i }));

    fireEvent.click(screen.getByRole("button", { name: /generate pdf report/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/report/DOSSIER-2026-0099");
    });
  });

  it("affiche un notice d'erreur si generateReport échoue", async () => {
    getRequestByReference.mockResolvedValue(FAKE_REQUEST);
    generateReport.mockRejectedValue(new Error("Backend error"));
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: /generate pdf report/i }));

    fireEvent.click(screen.getByRole("button", { name: /generate pdf report/i }));

    await waitFor(() =>
      expect(screen.getByText(/error occurred while generating/i)).toBeInTheDocument()
    );
  });

  it("appelle sendStatusNotification et addRequestHistory via 'Send notification'", async () => {
    getRequestByReference.mockResolvedValue(FAKE_REQUEST);
    sendStatusNotification.mockResolvedValue(undefined);
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: /send notification/i }));

    fireEvent.click(screen.getByRole("button", { name: /send notification/i }));

    await waitFor(() =>
      expect(screen.getByText(/notification sent to client/i)).toBeInTheDocument()
    );
    expect(sendStatusNotification).toHaveBeenCalledWith(
      expect.objectContaining({ to_email: "alice@acme.fr" })
    );
    expect(addRequestHistory).toHaveBeenCalled();
  });
});
