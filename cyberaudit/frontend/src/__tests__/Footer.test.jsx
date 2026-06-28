// ─── Tests : Footer.jsx ──────────────────────────────────────────────────────
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../components/shared/Footer.jsx";

// Footer contient des <Link> react-router → MemoryRouter requis
function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe("Footer", () => {
  it("renders the footer element", () => {
    renderFooter();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("displays the current year", () => {
    renderFooter();
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it("displays copyright text", () => {
    renderFooter();
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });

  it("displays CyberAudit & Solutions", () => {
    renderFooter();
    // "CyberAudit" apparaît dans le <h3> ET dans le copyright → getAllByText
    const matches = screen.getAllByText(/CyberAudit/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});
