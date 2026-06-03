// ─── Tests : TrainingPage.jsx ─────────────────────────────────────────────────
//
// TrainingPage appelle getTrainingModules() et affiche les modules.
// On mocke dataService pour contrôler les données retournées.

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthContext } from "../context/AuthContext.jsx";
import { MemoryRouter } from "react-router-dom";
import TrainingPage from "../pages/TrainingPage.jsx";

// ── Mock de dataService ───────────────────────────────────────────────────────
// On contrôle exactement ce que retournent getTrainingModules et updateModuleStatus
vi.mock("../services/dataService.js", () => ({
  getTrainingModules: vi.fn(),
  updateModuleStatus: vi.fn(),
}));

import { getTrainingModules, updateModuleStatus } from "../services/dataService.js";

// Faux modules de formation
const FAKE_MODULES = [
  { id: 1, slug: "anti-phishing", title: "Anti-phishing",       description: "Recognize phishing.",    status: "to_start"    },
  { id: 2, slug: "mfa",           title: "Strong passwords",    description: "Use MFA.",               status: "in_progress" },
  { id: 3, slug: "wifi-vpn",      title: "Public Wi-Fi & VPN",  description: "Stay safe.",             status: "completed"   },
];

// Helper pour rendre le composant avec un contexte auth minimal
function renderTrainingPage() {
  const fakeUser = { id: "1", role: "client", first_name: "Test" };
  return render(
    <AuthContext.Provider value={{ user: fakeUser, isAuthenticated: true, ready: true }}>
      <MemoryRouter>
        <TrainingPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("TrainingPage", () => {
  it("affiche le titre de la page", async () => {
    getTrainingModules.mockResolvedValue(FAKE_MODULES);

    renderTrainingPage();

    // waitFor attend que le composant ait fini de charger
    await waitFor(() => {
      expect(screen.getByText("Awareness & Training")).toBeInTheDocument();
    });
  });

  it("affiche les 3 modules chargés", async () => {
    getTrainingModules.mockResolvedValue(FAKE_MODULES);

    renderTrainingPage();

    await waitFor(() => {
      expect(screen.getByText("Anti-phishing")).toBeInTheDocument();
      expect(screen.getByText("Strong passwords")).toBeInTheDocument();
      expect(screen.getByText("Public Wi-Fi & VPN")).toBeInTheDocument();
    });
  });

  it("affiche 1/3 modules complétés dans la barre de progression", async () => {
    getTrainingModules.mockResolvedValue(FAKE_MODULES);

    renderTrainingPage();

    await waitFor(() => {
      // 1 module completed sur 3
      expect(screen.getByText("1 / 3 modules completed")).toBeInTheDocument();
    });
  });

  it("le bouton Start lance le module", async () => {
    getTrainingModules.mockResolvedValue(FAKE_MODULES);
    // updateModuleStatus retourne les modules mis à jour
    updateModuleStatus.mockResolvedValue([
      { ...FAKE_MODULES[0], status: "in_progress" },
      ...FAKE_MODULES.slice(1),
    ]);

    renderTrainingPage();

    await waitFor(() => screen.getByText("Anti-phishing"));

    // userEvent simule un vrai clic utilisateur
    const startButtons = screen.getAllByText("Start");
    await userEvent.click(startButtons[0]);

    // updateModuleStatus doit avoir été appelé
    expect(updateModuleStatus).toHaveBeenCalledWith(1, "in_progress");
  });
});
