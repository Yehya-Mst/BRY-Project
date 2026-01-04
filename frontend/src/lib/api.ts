const API = "http://localhost:8000";

export type Tokens = { access_token: string; refresh_token: string; token_type: string };

function getTokens(): Tokens | null {
  const raw = localStorage.getItem("devolo_tokens");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Tokens;
  } catch {
    return null;
  }
}

function setTokens(t: Tokens | null) {
  if (!t) localStorage.removeItem("devolo_tokens");
  else localStorage.setItem("devolo_tokens", JSON.stringify(t));
  // Notify UI to re-render when auth state changes (login/register/logout/refresh).
  window.dispatchEvent(new Event("devolo:auth-changed"));
}

export const auth = {
  tokens: getTokens,
  setTokens,
  bearer(): string | null {
    const t = getTokens();
    return t?.access_token ? `Bearer ${t.access_token}` : null;
  },
};

export class ApiError extends Error {
  status: number;
  detail: any;

  constructor(status: number, message: string, detail?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

let refreshInFlight: Promise<Tokens | null> | null = null;

async function refreshTokens(): Promise<Tokens | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const t = getTokens();
    if (!t?.refresh_token) return null;

    try {
      const fresh = await request<Tokens>(
        "/auth/refresh",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: t.refresh_token }),
        },
        false
      );

      const merged: Tokens = {
        access_token: fresh.access_token,
        refresh_token: fresh.refresh_token || t.refresh_token,
        token_type: fresh.token_type || "bearer",
      };

      setTokens(merged);
      return merged;
    } catch {
      setTokens(null);
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function request<T>(path: string, init: RequestInit = {}, allowRefresh = true): Promise<T> {
  const res = await fetch(`${API}${path}`, init);

  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");

  let payload: any = null;
  try {
    payload = isJson ? await res.json() : await res.text();
  } catch {
    payload = null;
  }

  if (res.ok) return payload as T;

  const noRefresh = path === "/auth/login" || path === "/auth/refresh" || path === "/register";
  if (res.status === 401 && allowRefresh && !noRefresh) {
    const refreshed = await refreshTokens();
    const bearer = auth.bearer();
    if (refreshed && bearer) {
      const headers = new Headers(init.headers || {});
      headers.set("Authorization", bearer);
      return request<T>(path, { ...init, headers }, false);
    }
  }

  let msg = `HTTP ${res.status}`;
  if (payload && typeof payload === "object") {
    msg = (payload as any)?.detail ? String((payload as any).detail) : JSON.stringify(payload);
  } else if (typeof payload === "string" && payload.trim()) {
    msg = payload;
  }

  throw new ApiError(res.status, msg, payload);
}

export const api = {
  async home() {
    const bearer = auth.bearer();
    return request<{ live: any[]; clips: any[] }>("/home", {
      headers: { ...(bearer ? { Authorization: bearer } : {}) },
    });
  },
  async categories() {
    return request<{ items: any[] }>("/categories");
  },
  async categorySamples(per = 3) {
    return request<{ items: any[] }>(`/categories/samples?per=${per}`);
  },
  async recommendedChannels(limit = 10) {
    const bearer = auth.bearer();
    return request<{ items: any[] }>(`/channels/recommended?limit=${limit}`, {
      headers: { ...(bearer ? { Authorization: bearer } : {}) },
    });
  },

  async register(payload: { username: string; email: string; password: string; display_name?: string | null }) {
    const tokens = await request<Tokens>(
      "/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      false
    );
    setTokens(tokens);
    return tokens;
  },
  async login(payload: { email: string; password: string; remember_me: boolean }) {
    const tokens = await request<Tokens>(
      "/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      false
    );
    setTokens(tokens);
    return tokens;
  },

  async me() {
    const bearer = auth.bearer();
    return request<any>("/me", {
      headers: { ...(bearer ? { Authorization: bearer } : {}) },
    });
  },


  async profile(username: string) {
    return request<any>(`/profile/${encodeURIComponent(username)}`);
  },
  async updateProfile(username: string, payload: any) {
    const bearer = auth.bearer();
    return request<any>(`/profile/${encodeURIComponent(username)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(bearer ? { Authorization: bearer } : {}) },
      body: JSON.stringify(payload),
    });
  },

  async becomeDevolo() {
    const bearer = auth.bearer();
    return request<any>("/channels/become-devolo", {
      method: "POST",
      headers: { ...(bearer ? { Authorization: bearer } : {}) },
    });
  },

  async startStream(payload: { title: string; category_id?: string | null }) {
    const bearer = auth.bearer();
    return request<any>("/streams/start", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(bearer ? { Authorization: bearer } : {}) },
      body: JSON.stringify(payload),
    });
  },
  async stopStream(stream_id: string) {
    const bearer = auth.bearer();
    return request<any>(`/streams/stop/${encodeURIComponent(stream_id)}`, {
      method: "POST",
      headers: { ...(bearer ? { Authorization: bearer } : {}) },
    });
  },

  async liveStreams() {
    return request<{ items: any[] }>("/streams/live");
  },

  async stream(stream_id: string) {
    return request<any>(`/streams/${encodeURIComponent(stream_id)}`);
  },

  async streamChat(stream_id: string, params?: { since?: string; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.since) q.set("since", params.since);
    if (params?.limit) q.set("limit", String(params.limit));
    const suffix = q.toString() ? `?${q.toString()}` : "";
    return request<{ items: any[] }>(`/streams/${encodeURIComponent(stream_id)}/chat${suffix}`);
  },

  async sendStreamChat(stream_id: string, payload: { content: string }) {
    const bearer = auth.bearer();
    return request<any>(`/streams/${encodeURIComponent(stream_id)}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(bearer ? { Authorization: bearer } : {}) },
      body: JSON.stringify(payload),
    });
  },

  async clips() {
    return request<any[]>("/clips");
  },
  async userClips(username: string) {
    return request<any[]>(`/profile/${encodeURIComponent(username)}/clips`);
  },

  async search(query: string) {
    return request<any[]>(`/search?query=${encodeURIComponent(query)}`);
  },

  async followStatus(username: string) {
    const bearer = auth.bearer();
    return request<{ following: boolean }>(`/follows/status?username=${encodeURIComponent(username)}`, {
      headers: { ...(bearer ? { Authorization: bearer } : {}) },
    });
  },
  async follow(username: string) {
    const bearer = auth.bearer();
    return request<{ ok: boolean; following: boolean }>(`/follows/${encodeURIComponent(username)}`, {
      method: "POST",
      headers: { ...(bearer ? { Authorization: bearer } : {}) },
    });
  },
  async unfollow(username: string) {
    const bearer = auth.bearer();
    return request<{ ok: boolean; following: boolean }>(`/follows/${encodeURIComponent(username)}`, {
      method: "DELETE",
      headers: { ...(bearer ? { Authorization: bearer } : {}) },
    });
  },
  async following() {
    const bearer = auth.bearer();
    return request<{ items: any[] }>("/follows/following", {
      headers: { ...(bearer ? { Authorization: bearer } : {}) },
    });
  },
};
