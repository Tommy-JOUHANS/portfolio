import { describe, it, expect } from "vitest";
import { sanitize } from "../utils/sanitize.js";

describe("sanitize()", () => {
  it("laisse passer un texte normal", () => {
    expect(sanitize("Tommy Jouhans")).toBe("Tommy Jouhans");
  });

  it("supprime les balises script", () => {
    expect(sanitize("<script>alert(\"XSS\")</script>")).toBe("");
  });

  it("supprime les balises HTML", () => {
    expect(sanitize("<b>gras</b>")).toBe("gras");
  });

  it("supprime les attributs onclick", () => {
    expect(sanitize("<img src=x onerror=alert(1)>")).toBe("");
  });

  it("retourne une chaîne vide si null", () => {
    expect(sanitize(null)).toBe("");
  });

  it("retourne une chaîne vide si undefined", () => {
    expect(sanitize(undefined)).toBe("");
  });
});
