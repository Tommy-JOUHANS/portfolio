// ─── Tests : AuditRequestForm.jsx ────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { MISSING_FIELD_MESSAGE } from "../utils/validators.js";

// ── Mock dependencies ─────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../services/dataService.js", () => ({
  getPackages:      vi.fn(),
  createRequest:    vi.fn(),
  getPackageByCode: vi.fn(),
}));

vi.mock("../services/emailService.js", () => ({
  sendAuditConfirmation: vi.fn(),
}));

// Simple PackSelector mock: exposes buttons to simulate pack selection
vi.mock("../components/audit/PackSelector.jsx", () => ({
  default: ({ packages, selectedCode, onSelect }) => (
    <div data-testid="pack-selector">
      {packages.map((p) => (
        <button key={p.code} type="button" onClick={() => onSelect(p.code)}>
          Select {p.name}
        </button>
      ))}
      {selectedCode && (
        <span data-testid="selected-code">{selectedCode}</span>
      )}
    </div>
  ),
}));

import AuditRequestForm from "../components/audit/AuditRequestForm.jsx";
import { getPackages, createRequest, getPackageByCode } from "../services/dataService.js";
import { sendAuditConfirmation } from "../services/emailService.js";

// ── Auth context ──────────────────────────────────────────────────────────────
const USER = {
  first_name: "Alice",
  company_name: "Acme Corp",
  email: "alice@acme.com",
};
const AUTH_CTX = {
  user: USER,
  isAuthenticated: true,
  ready: true,
  login: vi.fn(), logout: vi.fn(), register: vi.fn(), hasRole: vi.fn(),
};

// ── Fake pack data ────────────────────────────────────────────────────────────
const FAKE_PACK = {
  code: "audit",
  name: "Pack Audit",
  included_services: "Audit service",
  for_whom: "SMEs",
  perimeter: "Initial assessment",
  duration_days: 5,
  price: 1000,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function renderForm() {
  return render(
    <AuthContext.Provider value={AUTH_CTX}>
      <MemoryRouter>
        <AuditRequestForm />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default: getPackages returns one pack so the selector mock has a button
  getPackages.mockResolvedValue([FAKE_PACK]);
  sendAuditConfirmation.mockResolvedValue(undefined);
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("AuditRequestForm", () => {
  it("renders the Username input field", async () => {
    renderForm();
    await waitFor(() =>
      expect(screen.getByLabelText(/Username/i)).toBeInTheDocument()
    );
  });

  it("renders the Company Name input field", async () => {
    renderForm();
    await waitFor(() =>
      expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument()
    );
  });

  it("renders the Message textarea", async () => {
    renderForm();
    await waitFor(() =>
      expect(screen.getByLabelText(/Message/i)).toBeInTheDocument()
    );
  });

  it("renders the submit button", async () => {
    renderForm();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /Sent the audit request/i })
      ).toBeInTheDocument()
    );
  });

  it("pre-fills username from user context", async () => {
    renderForm();
    await waitFor(() =>
      expect(screen.getByLabelText(/Username/i)).toHaveValue("Alice")
    );
  });

  it("pre-fills company name from user context", async () => {
    renderForm();
    await waitFor(() =>
      expect(screen.getByLabelText(/Company Name/i)).toHaveValue("Acme Corp")
    );
  });

  it("loads packages on mount via getPackages", async () => {
    renderForm();
    await waitFor(() => expect(getPackages).toHaveBeenCalledOnce());
  });

  it("shows PackSelector with the loaded packages", async () => {
    renderForm();
    await waitFor(() =>
      expect(screen.getByTestId("pack-selector")).toBeInTheDocument()
    );
  });

  it("updates username field on change", async () => {
    renderForm();
    await waitFor(() => expect(screen.getByLabelText(/Username/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "Bob" },
    });
    expect(screen.getByLabelText(/Username/i)).toHaveValue("Bob");
  });

  it("updates message textarea on change", async () => {
    renderForm();
    await waitFor(() => expect(screen.getByLabelText(/Message/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: "My audit request details" },
    });
    expect(screen.getByLabelText(/Message/i)).toHaveValue("My audit request details");
  });

  it("shows MISSING_FIELD_MESSAGE error when username is cleared and form submitted", async () => {
    renderForm();
    await waitFor(() => expect(screen.getByLabelText(/Username/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sent the audit request/i }));

    await waitFor(() =>
      expect(screen.getAllByText(MISSING_FIELD_MESSAGE).length).toBeGreaterThan(0)
    );
  });

  it("shows packCode error when no pack is selected", async () => {
    renderForm();
    await waitFor(() => expect(screen.getByLabelText(/Username/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /Sent the audit request/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/Veuillez selectionner un pack/i)
      ).toBeInTheDocument()
    );
  });

  it("submits successfully: calls createRequest and navigates to confirmation", async () => {
    createRequest.mockResolvedValue({ reference: "DOSSIER-2026-0001" });
    getPackageByCode.mockResolvedValue(FAKE_PACK);

    renderForm();
    await waitFor(() =>
      expect(screen.getByText(/Select Pack Audit/i)).toBeInTheDocument()
    );

    // Select the pack via the mock PackSelector button
    fireEvent.click(screen.getByText(/Select Pack Audit/i));

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Sent the audit request/i }));

    await waitFor(() => {
      expect(createRequest).toHaveBeenCalledOnce();
      expect(mockNavigate).toHaveBeenCalledWith(
        "/audit/confirmation/DOSSIER-2026-0001"
      );
    });
  });

  it("calls getPackageByCode with the selected pack code on submit", async () => {
    createRequest.mockResolvedValue({ reference: "REF-001" });
    getPackageByCode.mockResolvedValue(FAKE_PACK);

    renderForm();
    await waitFor(() =>
      expect(screen.getByText(/Select Pack Audit/i)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText(/Select Pack Audit/i));
    fireEvent.click(screen.getByRole("button", { name: /Sent the audit request/i }));

    await waitFor(() =>
      expect(getPackageByCode).toHaveBeenCalledWith("audit")
    );
  });

  it("calls sendAuditConfirmation after successful submit", async () => {
    createRequest.mockResolvedValue({ reference: "REF-002" });
    getPackageByCode.mockResolvedValue(FAKE_PACK);

    renderForm();
    await waitFor(() =>
      expect(screen.getByText(/Select Pack Audit/i)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText(/Select Pack Audit/i));
    fireEvent.click(screen.getByRole("button", { name: /Sent the audit request/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    expect(sendAuditConfirmation).toHaveBeenCalled();
  });

  it("shows error message when createRequest throws", async () => {
    createRequest.mockRejectedValue(new Error("Server error"));

    renderForm();
    await waitFor(() =>
      expect(screen.getByText(/Select Pack Audit/i)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText(/Select Pack Audit/i));
    fireEvent.click(screen.getByRole("button", { name: /Sent the audit request/i }));

    await waitFor(() =>
      expect(screen.getByText(/Error sending/i)).toBeInTheDocument()
    );
  });

  it("shows submit button as 'Shipment in progress…' while submitting", async () => {
    let resolve;
    createRequest.mockReturnValue(new Promise((res) => { resolve = res; }));
    getPackageByCode.mockResolvedValue(FAKE_PACK);

    renderForm();
    await waitFor(() =>
      expect(screen.getByText(/Select Pack Audit/i)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText(/Select Pack Audit/i));
    fireEvent.click(screen.getByRole("button", { name: /Sent the audit request/i }));

    await waitFor(() =>
      expect(screen.getByText(/Shipment in progress/i)).toBeInTheDocument()
    );

    // Resolve so the test can finish cleanly
    resolve({ reference: "DONE-001" });
  });

  it("handles getPackages returning a paginated response { results: [...] }", async () => {
    getPackages.mockResolvedValue({ results: [FAKE_PACK] });

    renderForm();
    await waitFor(() => expect(getPackages).toHaveBeenCalledOnce());
    // Pack selector should still render even if getPackages returns {results:[]}
    // (the component handles this: Array.isArray(packs) ? packs : packs.results ?? [])
    expect(screen.getByTestId("pack-selector")).toBeInTheDocument();
  });

  it("uses fallback values in sendAuditConfirmation when getPackageByCode returns null", async () => {
    createRequest.mockResolvedValue({ reference: "REF-NOPACK" });
    getPackageByCode.mockResolvedValue(null); // pack not found

    renderForm();
    await waitFor(() =>
      expect(screen.getByText(/Select Pack Audit/i)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText(/Select Pack Audit/i));
    fireEvent.click(screen.getByRole("button", { name: /Sent the audit request/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    expect(sendAuditConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ price: "-", processing_time: "-" })
    );
  });
});
