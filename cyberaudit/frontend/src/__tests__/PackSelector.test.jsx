// ─── Tests : PackSelector.jsx ─────────────────────────────────────────────────
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PackSelector from "../components/audit/PackSelector.jsx";

// ── Fake pack data ────────────────────────────────────────────────────────────
const FAKE_PACKS = [
  {
    code: "audit",
    name: "Pack Audit",
    included_services: "Audit & Risk Analysis",
    for_whom: "SMEs new to cybersecurity",
    perimeter: "Initial assessment",
    duration_days: 5,
    price: 1000,
  },
  {
    code: "security",
    name: "Pack Security",
    included_services: "Audit + Incident",
    for_whom: "SMEs with incidents",
    perimeter: "Audit + remediation",
    duration_days: 10,
    price: 2000,
  },
];

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("PackSelector", () => {
  it("shows 'Select a package to view service details' when no pack is selected", () => {
    render(
      <PackSelector packages={FAKE_PACKS} selectedCode="" onSelect={vi.fn()} />
    );
    expect(
      screen.getByText(/Select a package to view service details/i)
    ).toBeInTheDocument();
  });

  it("renders a radio button for each package", () => {
    render(
      <PackSelector packages={FAKE_PACKS} selectedCode="" onSelect={vi.fn()} />
    );
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(FAKE_PACKS.length);
  });

  it("renders each pack name as a label", () => {
    render(
      <PackSelector packages={FAKE_PACKS} selectedCode="" onSelect={vi.fn()} />
    );
    expect(screen.getByText("Pack Audit")).toBeInTheDocument();
    expect(screen.getByText("Pack Security")).toBeInTheDocument();
  });

  it("calls onSelect with the pack code when a radio is clicked", () => {
    const onSelect = vi.fn();
    render(
      <PackSelector packages={FAKE_PACKS} selectedCode="" onSelect={onSelect} />
    );
    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[0]); // click the first radio (Pack Audit)
    expect(onSelect).toHaveBeenCalledWith("audit");
  });

  it("calls onSelect with the correct code for the second pack", () => {
    const onSelect = vi.fn();
    render(
      <PackSelector packages={FAKE_PACKS} selectedCode="" onSelect={onSelect} />
    );
    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[1]);
    expect(onSelect).toHaveBeenCalledWith("security");
  });

  it("shows the details panel when a pack is selected", () => {
    render(
      <PackSelector packages={FAKE_PACKS} selectedCode="audit" onSelect={vi.fn()} />
    );
    expect(screen.getByText("Audit & Risk Analysis")).toBeInTheDocument();
    expect(screen.getByText("SMEs new to cybersecurity")).toBeInTheDocument();
    expect(screen.getByText("Initial assessment")).toBeInTheDocument();
  });

  it("shows duration and price in the details panel", () => {
    render(
      <PackSelector packages={FAKE_PACKS} selectedCode="audit" onSelect={vi.fn()} />
    );
    expect(screen.getByText(/5 business days/i)).toBeInTheDocument();
    expect(screen.getByText(/1000 EUR/i)).toBeInTheDocument();
  });

  it("does NOT show 'Select a package' prompt when a pack is selected", () => {
    render(
      <PackSelector packages={FAKE_PACKS} selectedCode="audit" onSelect={vi.fn()} />
    );
    expect(
      screen.queryByText(/Select a package to view service details/i)
    ).not.toBeInTheDocument();
  });

  it("marks the selected radio as checked", () => {
    render(
      <PackSelector packages={FAKE_PACKS} selectedCode="security" onSelect={vi.fn()} />
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).not.toBeChecked(); // audit not selected
    expect(radios[1]).toBeChecked();     // security is selected
  });

  it("renders without packs (empty array) and shows the prompt", () => {
    render(<PackSelector packages={[]} selectedCode="" onSelect={vi.fn()} />);
    expect(
      screen.getByText(/Select a package to view service details/i)
    ).toBeInTheDocument();
  });
});
