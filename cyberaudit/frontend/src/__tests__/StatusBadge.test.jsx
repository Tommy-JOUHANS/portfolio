// ─── Tests : StatusBadge.jsx ─────────────────────────────────────────────────
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "../components/dashboard/StatusBadge.jsx";

describe("StatusBadge", () => {
  it("affiche \"Pending\" pour le statut pending", () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("affiche \"In Progress\" pour le statut in_progress", () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("affiche \"Completed\" pour le statut completed", () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("affiche \"Archived\" pour le statut archived", () => {
    render(<StatusBadge status="archived" />);
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });

  it("affiche le statut brut pour une valeur inconnue", () => {
    render(<StatusBadge status="unknown_status" />);
    expect(screen.getByText("unknown_status")).toBeInTheDocument();
  });

  it("applique les classes couleur bleues pour in_progress", () => {
    render(<StatusBadge status="in_progress" />);
    const badge = screen.getByText("In Progress");
    expect(badge.className).toContain("blue");
  });

  it("applique les classes couleur vertes pour completed", () => {
    render(<StatusBadge status="completed" />);
    const badge = screen.getByText("Completed");
    expect(badge.className).toContain("green");
  });

  it("applique les classes couleur violettes pour archived", () => {
    render(<StatusBadge status="archived" />);
    const badge = screen.getByText("Archived");
    expect(badge.className).toContain("purple");
  });
});
