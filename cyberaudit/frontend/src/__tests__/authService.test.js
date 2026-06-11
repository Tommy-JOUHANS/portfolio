// ─── Tests : authService.js ───────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock api.js ───────────────────────────────────────────────────────────────
vi.mock("../services/api.js", () => ({
  default: {
    get:   vi.fn(),
    post:  vi.fn(),
    patch: vi.fn(),
  },
}));

import api from "../services/api.js";
import {
  register,
  login,
  logout,
  getSession,
  getMe,
  changePassword,
} from "../services/authService.js";

const SESSION_KEY = "cyberaudit:session";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// ── getSession ────────────────────────────────────────────────────────────────
describe("getSession()", () => {
  it("returns null when localStorage has no session", () => {
    expect(getSession()).toBeNull();
  });

  it("returns the parsed session object when it exists", () => {
    const session = { access: "acc", refresh: "ref", user: { email: "a@b.com" } };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    expect(getSession()).toEqual(session);
  });

  it("migrates old { token, user } format: clears it and returns null", () => {
    const oldFormat = { token: "old-jwt", user: { email: "x@x.com" } };
    localStorage.setItem(SESSION_KEY, JSON.stringify(oldFormat));
    const result = getSession();
    expect(result).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });
});

// ── login ─────────────────────────────────────────────────────────────────────
describe("login()", () => {
  it("normalises email (trim + lowercase) before calling api.post", async () => {
    api.post.mockResolvedValue({
      data: { access: "acc", refresh: "ref", user: { email: "test@test.com" } },
    });
    await login("  TEST@TEST.COM  ", "secret");
    expect(api.post).toHaveBeenCalledWith("/auth/login/", {
      email: "test@test.com",
      password: "secret",
    });
  });

  it("saves the session to localStorage and returns it", async () => {
    api.post.mockResolvedValue({
      data: { access: "acc", refresh: "ref", user: { email: "u@u.com" } },
    });
    const result = await login("u@u.com", "pass");
    const stored = JSON.parse(localStorage.getItem(SESSION_KEY));
    expect(stored.access).toBe("acc");
    expect(result.user.email).toBe("u@u.com");
  });

  it("throws a normalized error for non_field_errors", async () => {
    api.post.mockRejectedValue({
      response: { data: { non_field_errors: ["Invalid credentials."] } },
    });
    await expect(login("bad@bad.com", "wrong")).rejects.toThrow("Invalid credentials.");
  });

  it("throws a normalized error for detail message", async () => {
    api.post.mockRejectedValue({
      response: { data: { detail: "No active account." } },
    });
    await expect(login("x@x.com", "p")).rejects.toThrow("No active account.");
  });

  it("throws a normalized error for field-level array errors", async () => {
    api.post.mockRejectedValue({
      response: { data: { email: ["This field is required."] } },
    });
    await expect(login("", "p")).rejects.toThrow("This field is required.");
  });

  it("throws a normalized error for field-level string errors", async () => {
    api.post.mockRejectedValue({
      response: { data: { email: "Bad format." } },
    });
    await expect(login("", "p")).rejects.toThrow("Bad format.");
  });

  it("throws a network error message when there is no response data", async () => {
    api.post.mockRejectedValue({ message: "Network Error" });
    await expect(login("x@x.com", "p")).rejects.toThrow("Network Error");
  });

  it("throws 'An error has occurred.' when error has no message or data", async () => {
    api.post.mockRejectedValue({ response: { data: {} } });
    await expect(login("x@x.com", "p")).rejects.toThrow("An error has occurred.");
  });
});

// ── register ──────────────────────────────────────────────────────────────────
describe("register()", () => {
  it("converts camelCase form fields to snake_case", async () => {
    api.post.mockResolvedValue({
      data: { access: "acc", refresh: "ref", user: { email: "new@user.com" } },
    });
    await register({
      email: "new@user.com",
      password: "pass",
      firstName:   "Alice",
      lastName:    "Bob",
      companyName: "Acme",
    });
    expect(api.post).toHaveBeenCalledWith("/auth/register/", {
      email:        "new@user.com",
      password:     "pass",
      first_name:   "Alice",
      last_name:    "Bob",
      company_name: "Acme",
    });
  });

  it("also accepts snake_case field names", async () => {
    api.post.mockResolvedValue({
      data: { access: "a", refresh: "r", user: { email: "z@z.com" } },
    });
    await register({
      email:        "z@z.com",
      password:     "p",
      first_name:   "Z",
      last_name:    "Y",
      company_name: "Corp",
    });
    expect(api.post).toHaveBeenCalledWith("/auth/register/",
      expect.objectContaining({ first_name: "Z", company_name: "Corp" })
    );
  });

  it("throws a normalized error on API failure", async () => {
    api.post.mockRejectedValue({
      response: { data: { email: ["Email already taken."] } },
    });
    await expect(
      register({ email: "dup@dup.com", password: "p" })
    ).rejects.toThrow("Email already taken.");
  });
});

// ── logout ────────────────────────────────────────────────────────────────────
describe("logout()", () => {
  it("calls api.post with the refresh token when a session exists", async () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ access: "a", refresh: "r", user: {} }));
    api.post.mockResolvedValue({});
    await logout();
    expect(api.post).toHaveBeenCalledWith("/auth/logout/", { refresh: "r" });
  });

  it("removes the session from localStorage after logout", async () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ access: "a", refresh: "r", user: {} }));
    api.post.mockResolvedValue({});
    await logout();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it("does not call api.post when there is no session in localStorage", async () => {
    await logout();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("still removes session when api.post throws (best-effort)", async () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ access: "a", refresh: "r", user: {} }));
    api.post.mockRejectedValue(new Error("Server error"));
    await logout();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it("does not call api.post when session has no refresh token", async () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ access: "a", user: {} }));
    await logout();
    expect(api.post).not.toHaveBeenCalled();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });
});

// ── getMe ─────────────────────────────────────────────────────────────────────
describe("getMe()", () => {
  it("calls GET /auth/me/ and returns the user data", async () => {
    api.get.mockResolvedValue({ data: { email: "me@me.com", role: "client" } });
    const user = await getMe();
    expect(api.get).toHaveBeenCalledWith("/auth/me/");
    expect(user.email).toBe("me@me.com");
  });

  it("throws a normalized error on failure", async () => {
    api.get.mockRejectedValue({ response: { data: { detail: "Unauthorized" } } });
    await expect(getMe()).rejects.toThrow("Unauthorized");
  });
});

// ── changePassword ────────────────────────────────────────────────────────────
describe("changePassword()", () => {
  it("calls api.post with old and new passwords", async () => {
    api.post.mockResolvedValue({});
    await changePassword("oldpass", "newpass");
    expect(api.post).toHaveBeenCalledWith("/auth/change-password/", {
      old_password: "oldpass",
      new_password: "newpass",
    });
  });

  it("throws a normalized error on failure", async () => {
    api.post.mockRejectedValue({
      response: { data: { old_password: ["Wrong password."] } },
    });
    await expect(changePassword("wrong", "new")).rejects.toThrow("Wrong password.");
  });
});
