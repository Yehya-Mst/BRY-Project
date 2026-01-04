import React from "react";
import { api, auth } from "./api";

/**
 * Tiny global follow-state cache so FOLLOW / FOLLOWED updates
 * instantly across the whole UI (streams + clips + anywhere else).
 */

type Listener = () => void;

const listeners = new Set<Listener>();
const state = new Map<string, boolean>();
const inflight = new Map<string, Promise<boolean>>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeFollow(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFollow(username: string): boolean | undefined {
  return state.get(username);
}

export function setFollow(username: string, following: boolean) {
  state.set(username, following);
  emit();
}

export function resetFollowCache() {
  state.clear();
  inflight.clear();
  emit();
}

export async function ensureFollow(username: string): Promise<boolean> {
  if (!username) return false;

  // If not logged in, always show "not following"
  if (!auth.tokens()) {
    setFollow(username, false);
    return false;
  }

  const cached = state.get(username);
  if (cached !== undefined) return cached;

  const pending = inflight.get(username);
  if (pending) return pending;

  const p = (async () => {
    try {
      const r = await api.followStatus(username);
      const v = Boolean(r.following);
      setFollow(username, v);
      return v;
    } catch {
      setFollow(username, false);
      return false;
    } finally {
      inflight.delete(username);
    }
  })();

  inflight.set(username, p);
  return p;
}

export async function toggleFollow(username: string): Promise<boolean> {
  if (!username) return false;

  if (!auth.tokens()) {
    throw new Error("AUTH_REQUIRED");
  }

  const cur = state.get(username) ?? false;
  const r = cur ? await api.unfollow(username) : await api.follow(username);
  const next = Boolean(r.following);
  setFollow(username, next);

  // Let sidebar / other places re-fetch lists when follow set changes
  window.dispatchEvent(new Event("devolo:following-changed"));
  return next;
}

export function useFollow(username?: string | null): boolean {
  const u = username || "";
  const [val, setVal] = React.useState<boolean>(() => (u ? state.get(u) ?? false : false));

  React.useEffect(() => {
    if (!u) return;

    let alive = true;

    ensureFollow(u).then((v) => {
      if (alive) setVal(v);
    });

    const unsub = subscribeFollow(() => {
      if (!alive) return;
      const next = state.get(u);
      if (next !== undefined) setVal(next);
    });

    return () => {
      alive = false;
      unsub();
    };
  }, [u]);

  return val;
}
