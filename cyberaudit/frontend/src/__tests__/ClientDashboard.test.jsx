// ─── Tests : ClientDashboard.jsx ─────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import ClientDashboard from "../components/dashboard/ClientDashboard.jsx";

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock("../services/dataService.js", () => ({
  getAllRequests:          vi.fn(),
  getNotificationsByUserId: vi.fn(),
}));

vi.mock("../services/api.js", () => {
  // api doit être appelable (HEAD pour pdfMap) ET avoir .get (download)
  const mockApi = vi.fn();
  mockApi.get = vi.fn();
  return { default: mockApi };
});

import { getAllRequests, getNotificationsByUserId } from "../services/dataService.js";
import api from "../services/api.js";

// ── Données fictives ──────────────────────────────────────────────────────────
const FAKE_USER = {
  id: "uuid-admin",
  first_name: "Tommy",
  last_name: "Jouhans",
  role: "client",
  email: "tommy.jouhans@outlook.com",
};

const FAKE_REQUESTS = [
  {
    id: "uuid-1",
    reference: "DOSSIER-2026-0015",
    status: "completed",
    submitted_at: "2026-06-09T07:26:00Z",
    pack: { code: "security", name: "Pack Security" },
  },
  {
    id: "uuid-2",
    reference: "DOSSIER-2026-0014",
    status: "pending",
    submitted_at: "2026-06-08T16:03:00Z",
    pack: { code: "security", name: "Pack Security" },
  },
];

const FAKE_NOTIFICATIONS = [
  {
    id: "notif-1",
    message: "Your request has been updated.",
    created_at: "2026-06-09T08:00:00Z",
  },
];

// ── Helper de rendu ───────────────────────────────────────────────────────────
const mockCtx = {
  user: FAKE_USER,
  token: "fake.token",
  ready: true,
  isAuthenticated: true,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  hasRole: (r) => r === "client",
};

function renderDashboard() {
  return render(
    <AuthContext.Provider value={mockCtx}>
      <MemoryRouter>
        <ClientDashboard />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  // HEAD requests pour pdfMap → status 200 = PDF dispo → affiche "Download report"
  api.mockResolvedValue({ status: 200 });
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("ClientDashboard", () => {
  it("affiche un spinner pendant le chargement", () => {
    getAllRequests.mockReturnValue(new Promise(() => {}));
    getNotificationsByUserId.mockReturnValue(new Promise(() => {}));
    renderDashboard();
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("affiche le prénom de l'utilisateur connecté", async () => {
    getAllRequests.mockResolvedValue(FAKE_REQUESTS);
    getNotificationsByUserId.mockResolvedValue(FAKE_NOTIFICATIONS);
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Tommy/i)).toBeInTheDocument();
    });
  });

  it("affiche les demandes dans le tableau", async () => {
    getAllRequests.mockResolvedValue(FAKE_REQUESTS);
    getNotificationsByUserId.mockResolvedValue([]);
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("DOSSIER-2026-0015")).toBeInTheDocument();
      expect(screen.getByText("DOSSIER-2026-0014")).toBeInTheDocument();
    });
  });

  it("affiche le nombre de demandes en cours dans les StatCards", async () => {
    getAllRequests.mockResolvedValue(FAKE_REQUESTS);
    getNotificationsByUserId.mockResolvedValue([]);
    renderDashboard();
    await waitFor(() => {
      // "Open requests" est unique dans la page → getByText ne trouve qu'un seul élément
      const openLabel = screen.getByText("Open requests");
      const openCard  = openLabel.closest("div.rounded-xl");
      expect(openCard).toHaveTextContent("1");

      // "Reports available" est aussi unique → même approche
      const reportsLabel = screen.getByText("Reports available");
      const reportsCard  = reportsLabel.closest("div.rounded-xl");
      expect(reportsCard).toHaveTextContent("1");
    });
  });

  it("affiche le message 'No requests' si la liste est vide", async () => {
    getAllRequests.mockResolvedValue([]);
    getNotificationsByUserId.mockResolvedValue([]);
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/no requests to display/i)).toBeInTheDocument();
    });
  });

  it("affiche les notifications récentes", async () => {
    getAllRequests.mockResolvedValue([]);
    getNotificationsByUserId.mockResolvedValue(FAKE_NOTIFICATIONS);
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/your request has been updated/i)).toBeInTheDocument();
    });
  });

  it("affiche 'No notifications' si aucune notification", async () => {
    getAllRequests.mockResolvedValue([]);
    getNotificationsByUserId.mockResolvedValue([]);
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
    });
  });

  it("affiche un message d'erreur si l'API échoue", async () => {
    getAllRequests.mockRejectedValue(new Error("Network error"));
    getNotificationsByUserId.mockResolvedValue([]);
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/unable to load/i)).toBeInTheDocument();
    });
  });

  // ── handleDownload ────────────────────────────────────────────────────────

  it("handleDownload: affiche notice 202 (rapport en cours de génération)", async () => {
    getAllRequests.mockResolvedValue(FAKE_REQUESTS);
    getNotificationsByUserId.mockResolvedValue([]);
    api.get.mockResolvedValue({ status: 202, data: null });

    renderDashboard();
    await waitFor(() => expect(screen.getByText("Download report")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Download report"));

    await waitFor(() =>
      expect(screen.getByText(/report is being generated/i)).toBeInTheDocument()
    );
  });

  it("handleDownload: affiche notice 404 (rapport non disponible)", async () => {
    getAllRequests.mockResolvedValue(FAKE_REQUESTS);
    getNotificationsByUserId.mockResolvedValue([]);
    api.get.mockResolvedValue({ status: 404, data: null });

    renderDashboard();
    await waitFor(() => expect(screen.getByText("Download report")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Download report"));

    await waitFor(() =>
      expect(screen.getByText(/report not available yet/i)).toBeInTheDocument()
    );
  });

  it("handleDownload: affiche notice pour un statut inattendu (ex: 400)", async () => {
    getAllRequests.mockResolvedValue(FAKE_REQUESTS);
    getNotificationsByUserId.mockResolvedValue([]);
    api.get.mockResolvedValue({ status: 400, data: null });

    renderDashboard();
    await waitFor(() => expect(screen.getByText("Download report")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Download report"));

    await waitFor(() =>
      expect(screen.getByText(/unable to download the report/i)).toBeInTheDocument()
    );
  });

  it("handleDownload: déclenche le téléchargement si status 200", async () => {
    globalThis.URL.createObjectURL = vi.fn(() => "blob:test-url");
    globalThis.URL.revokeObjectURL = vi.fn();

    getAllRequests.mockResolvedValue(FAKE_REQUESTS);
    getNotificationsByUserId.mockResolvedValue([]);
    api.get.mockResolvedValue({ status: 200, data: new Uint8Array([37, 80, 68, 70]) });

    renderDashboard();
    await waitFor(() => expect(screen.getByText("Download report")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Download report"));

    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test-url");
    });
  });

  it("handleDownload: affiche notice d'erreur si api.get lance une exception", async () => {
    getAllRequests.mockResolvedValue(FAKE_REQUESTS);
    getNotificationsByUserId.mockResolvedValue([]);
    api.get.mockRejectedValue(new Error("Network failure"));

    renderDashboard();
    await waitFor(() => expect(screen.getByText("Download report")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Download report"));

    await waitFor(() =>
      expect(screen.getByText(/error occurred while downloading/i)).toBeInTheDocument()
    );
  });
});
