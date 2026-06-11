// ─── Tests : api.js ───────────────────────────────────────────────────────────
//
// Strategy: mock standalone axios.post (used for token refresh) while keeping
// axios.create() working so the api instance is a real Axios instance with
// its interceptors properly set up. Then access the interceptor handler
// functions directly to test all branches.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock is hoisted: runs before any import statement
vi.mock("axios", async () => {
  const actual = await vi.importActual("axios");
  const realAxios = actual.default;

  // Object.create keeps realAxios.create (etc.) on the prototype
  // while letting us override .post as an own property
  const mockAxios = Object.create(realAxios);
  mockAxios.post = vi.fn();

  return { ...actual, default: mockAxios };
});

import axios from "axios";
import api from "../services/api.js";

const SESSION_KEY = "cyberaudit:session";

// ── Helpers to access interceptor handlers ────────────────────────────────────
const getReqFulfilled  = () => api.interceptors.request.handlers.filter(Boolean)[0]?.fulfilled;
const getResFulfilled  = () => api.interceptors.response.handlers.filter(Boolean)[0]?.fulfilled;
const getResRejected   = () => api.interceptors.response.handlers.filter(Boolean)[0]?.rejected;

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

// ── Request interceptor ───────────────────────────────────────────────────────
describe("api – request interceptor", () => {
  it("adds Authorization header when a valid session exists", () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ access: "token-abc" }));
    const config = { url: "/api/me/", headers: {} };
    const result = getReqFulfilled()(config);
    expect(result.headers.Authorization).toBe("Bearer token-abc");
  });

  it("does NOT add Authorization when localStorage has no session", () => {
    const config = { url: "/api/users/", headers: {} };
    const result = getReqFulfilled()(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it("does NOT add Authorization when session has no access field", () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ refresh: "only-refresh" }));
    const config = { url: "/api/audits/", headers: {} };
    const result = getReqFulfilled()(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it("skips Authorization for /token/refresh routes", () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ access: "tok" }));
    const config = { url: "/auth/token/refresh/", headers: {} };
    const result = getReqFulfilled()(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it("skips Authorization for /login routes", () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ access: "tok" }));
    const config = { url: "/auth/login/", headers: {} };
    const result = getReqFulfilled()(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it("skips Authorization for /register routes", () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ access: "tok" }));
    const config = { url: "/auth/register/", headers: {} };
    const result = getReqFulfilled()(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it("returns the config object", () => {
    const config = { url: "/api/test/", headers: {} };
    const result = getReqFulfilled()(config);
    expect(result).toBe(config);
  });
});

// ── Response interceptor – success ────────────────────────────────────────────
describe("api – response interceptor (success)", () => {
  it("passes through a regular (non-paginated) response unchanged", () => {
    const response = { data: { id: 1, name: "foo" } };
    const result = getResFulfilled()(response);
    expect(result.data).toEqual({ id: 1, name: "foo" });
  });

  it("unwraps DRF paginated response → results array", () => {
    const response = {
      data: { count: 2, next: null, previous: null, results: [{ id: 1 }, { id: 2 }] },
    };
    const result = getResFulfilled()(response);
    expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("does not unwrap when 'results' is not an array", () => {
    const response = { data: { count: 1, results: "not-an-array" } };
    const result = getResFulfilled()(response);
    // results is not an array → no unwrap
    expect(result.data).toEqual({ count: 1, results: "not-an-array" });
  });

  it("does not unwrap when 'count' key is absent", () => {
    const response = { data: { results: [1, 2, 3] } };
    const result = getResFulfilled()(response);
    expect(result.data).toEqual({ results: [1, 2, 3] });
  });

  it("returns the response object itself", () => {
    const response = { data: [1, 2, 3] };
    const result = getResFulfilled()(response);
    expect(result).toBe(response);
  });
});

// ── Response interceptor – error / 401 handling ───────────────────────────────
describe("api – response interceptor (errors)", () => {
  it("rejects non-401 errors without retrying", async () => {
    const error = { response: { status: 500 }, config: { url: "/api/data/" } };
    await expect(getResRejected()(error)).rejects.toEqual(error);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("rejects 401 if the request has already been retried (_retry=true)", async () => {
    const error = {
      response: { status: 401 },
      config: { url: "/api/data/", _retry: true },
    };
    await expect(getResRejected()(error)).rejects.toEqual(error);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("rejects 401 on /login without retrying", async () => {
    const error = {
      response: { status: 401 },
      config: { url: "/auth/login/", _retry: false },
    };
    await expect(getResRejected()(error)).rejects.toEqual(error);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("rejects 401 on /logout without retrying", async () => {
    const error = {
      response: { status: 401 },
      config: { url: "/auth/logout/", _retry: false },
    };
    await expect(getResRejected()(error)).rejects.toEqual(error);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("redirects to /login and removes session when no session on 401", async () => {
    // No session in localStorage → throws "Pas de session" → goes to catch
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    const error = {
      response: { status: 401 },
      config: { url: "/api/data/", _retry: false, headers: {} },
    };

    await expect(getResRejected()(error)).rejects.toThrow();
    expect(window.location.href).toBe("/login");
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it("redirects to /login when session has no refresh token", async () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ access: "a" })); // no refresh
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    const error = {
      response: { status: 401 },
      config: { url: "/api/data/", _retry: false, headers: {} },
    };

    await expect(getResRejected()(error)).rejects.toThrow();
    expect(window.location.href).toBe("/login");
  });

  it("calls axios.post for token refresh on 401 with valid session", async () => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ access: "old-token", refresh: "refresh-tok" })
    );
    axios.post.mockResolvedValue({ data: { access: "new-token" } });
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    const error = {
      response: { status: 401 },
      config: { url: "/api/data/", _retry: false, headers: {} },
    };

    // api(original) will fail in test env; we only care about what happened before
    try { await getResRejected()(error); } catch { /* expected */ }

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("token/refresh"),
      { refresh: "refresh-tok" }
    );

    // localStorage should be updated with the new access token
    const stored = JSON.parse(localStorage.getItem(SESSION_KEY));
    expect(stored?.access).toBe("new-token");
  });

  it("redirects to /login and removes session when token refresh fails", async () => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ access: "old", refresh: "ref" })
    );
    axios.post.mockRejectedValue(new Error("Refresh failed"));
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    const error = {
      response: { status: 401 },
      config: { url: "/api/data/", _retry: false, headers: {} },
    };

    await expect(getResRejected()(error)).rejects.toThrow("Refresh failed");
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(window.location.href).toBe("/login");
  });
});
