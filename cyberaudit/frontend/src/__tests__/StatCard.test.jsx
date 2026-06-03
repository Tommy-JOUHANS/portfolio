// ─── Tests : StatCard.jsx ────────────────────────────────────────────────────
//
// StatCard est un petit composant pur (pas d'état, pas d'API).
// On vérifie juste que le rendu affiche les bonnes props.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard from "../components/dashboard/StatCard.jsx";

describe("StatCard", () => {
  it("affiche le label passé en prop", () => {
    render(<StatCard label="Pending" value={3} accentClass="text-amber-500" />);
    // screen.getByText cherche un élément contenant ce texte exact
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("affiche la valeur numérique", () => {
    render(<StatCard label="Completed" value={7} accentClass="text-green-600" />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("affiche 0 quand la valeur est zéro", () => {
    render(<StatCard label="Archived" value={0} accentClass="text-gray-600" />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
