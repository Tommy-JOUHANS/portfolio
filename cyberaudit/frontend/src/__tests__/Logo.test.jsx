// ─── Tests : Logo.jsx ────────────────────────────────────────────────────────
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Logo from "../components/shared/Logo.jsx";

describe("Logo", () => {
  it("renders the image wrapper with role='img' by default", () => {
    render(<Logo />);
    // Use getByLabelText: only matches aria-label (not alt), so it uniquely finds the outer div
    const wrapper = screen.getByLabelText(/Logo CyberAudit/i);
    expect(wrapper).toHaveAttribute("role", "img");
  });

  it("renders an img element inside the wrapper", () => {
    render(<Logo />);
    const img = screen.getByAltText(/Logo CyberAudit/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/logo.png");
  });

  it("applies the size prop to the wrapper", () => {
    render(<Logo size={80} />);
    const wrapper = screen.getByLabelText(/Logo CyberAudit/i);
    expect(wrapper).toHaveStyle({ width: "80px", height: "80px" });
  });

  it("uses default size of 52 when no size prop given", () => {
    render(<Logo />);
    const wrapper = screen.getByLabelText(/Logo CyberAudit/i);
    expect(wrapper).toHaveStyle({ width: "52px", height: "52px" });
  });

  it("shows fallback div when image fails to load (onError)", () => {
    render(<Logo />);
    const img = screen.getByAltText(/Logo CyberAudit/i);
    // Trigger the onError handler
    fireEvent.error(img);
    // The img should be gone
    expect(screen.queryByAltText(/Logo CyberAudit/i)).not.toBeInTheDocument();
    // The fallback div should appear with aria-label
    expect(screen.getByLabelText(/Logo CyberAudit/i)).toBeInTheDocument();
  });

  it("fallback div uses the size prop", () => {
    render(<Logo size={100} />);
    const img = screen.getByAltText(/Logo CyberAudit/i);
    fireEvent.error(img);
    const fallback = screen.getByLabelText(/Logo CyberAudit/i);
    expect(fallback).toHaveStyle({ width: "100px", height: "100px" });
  });
});
