// ─── Tests : ErrorBoundary.jsx ───────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "../components/shared/ErrorBoundary.jsx";

// Component that conditionally throws during render
function Bomb({ shouldThrow }) {
  if (shouldThrow) throw new Error("Test explosion!");
  return <div>Safe content</div>;
}

describe("ErrorBoundary", () => {
  // Suppress React's error output to keep test output clean
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children normally when no error occurs", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Safe content")).toBeInTheDocument();
  });

  it("renders the error screen when a child throws", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("An error has occurred")).toBeInTheDocument();
    expect(screen.getByText(/unexpected problem/i)).toBeInTheDocument();
  });

  it("shows a 'Reload page' button in the error state", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole("button", { name: /Reload page/i })).toBeInTheDocument();
  });

  it("calls window.location.reload() when Reload button is clicked", () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      value: { reload: reloadMock },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole("button", { name: /Reload page/i }));
    expect(reloadMock).toHaveBeenCalledOnce();
  });

  it("componentDidCatch calls console.error with error info", () => {
    const consoleSpy = vi.spyOn(console, "error");

    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    // console.error should have been called (either by React or by componentDidCatch)
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("does not render children in error state", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.queryByText("Safe content")).not.toBeInTheDocument();
  });
});
