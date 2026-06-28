// ─── Tests : HomePage.jsx ────────────────────────────────────────────────────
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "../pages/HomePage.jsx";

function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

describe("HomePage", () => {
  it("renders the main H1 title 'CyberAudit & Solutions'", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { level: 1, name: /CyberAudit/i })
    ).toBeInTheDocument();
  });

  it("renders 'Presentation of the company' section", () => {
    renderPage();
    expect(screen.getByText("Presentation of the company")).toBeInTheDocument();
  });

  it("renders 'Our services' section", () => {
    renderPage();
    expect(screen.getByText("Our services")).toBeInTheDocument();
  });

  it("renders all 4 service blocks", () => {
    renderPage();
    // Use heading queries to avoid matching identical text in the packages table
    expect(screen.getByRole("heading", { level: 3, name: /Risk audit/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /Incident management/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /System Protection/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /^Awareness$/i })).toBeInTheDocument();
  });

  it("renders service items inside each block", () => {
    renderPage();
    expect(screen.getByText(/Identification of vulnerabilities/i)).toBeInTheDocument();
    expect(screen.getByText(/Anti-phishing/i)).toBeInTheDocument();
  });

  it("renders 'Our packages' section heading", () => {
    renderPage();
    expect(screen.getByText("Our packages")).toBeInTheDocument();
  });

  it("renders all 4 pack names in the table", () => {
    renderPage();
    expect(screen.getByText("Pack Audit")).toBeInTheDocument();
    expect(screen.getByText("Pack Security")).toBeInTheDocument();
    expect(screen.getByText("Pack Protection")).toBeInTheDocument();
    expect(screen.getByText("Pack Premium")).toBeInTheDocument();
  });

  it("renders 'Ready to get started?' CTA block", () => {
    renderPage();
    expect(screen.getByText("Ready to get started?")).toBeInTheDocument();
  });

  it("renders 'Create an account' link pointing to /register", () => {
    renderPage();
    // There may be multiple "Create an account" elements; check the first one
    const links = screen.getAllByText("Create an account");
    const linkEl = links.find((el) => el.tagName === "A" || el.closest("a"));
    expect(linkEl.closest("a") ?? linkEl).toHaveAttribute("href", "/register");
  });

  it("renders 'Sign In' link pointing to /login", () => {
    renderPage();
    // Plusieurs "Sign In" existent (hero + CTA section) → on vérifie que tous pointent vers /login
    const signIns = screen.getAllByText("Sign In");
    expect(signIns.length).toBeGreaterThanOrEqual(1);
    signIns.forEach((el) => {
      expect(el.closest("a")).toHaveAttribute("href", "/login");
    });
  });

  it("renders table column headers", () => {
    renderPage();
    expect(screen.getByText("Included services")).toBeInTheDocument();
    expect(screen.getByText("For whom?")).toBeInTheDocument();
    expect(screen.getByText("Perimeter")).toBeInTheDocument();
  });
});
