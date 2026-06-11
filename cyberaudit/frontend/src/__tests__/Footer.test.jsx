// ─── Tests : Footer.jsx ──────────────────────────────────────────────────────
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "../components/shared/Footer.jsx";

describe("Footer", () => {
  it("renders the footer element", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("displays the current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it("displays copyright text", () => {
    render(<Footer />);
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });

  it("displays CyberAudit & Solutions", () => {
    render(<Footer />);
    expect(screen.getByText(/CyberAudit/)).toBeInTheDocument();
  });
});
