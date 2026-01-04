import React from "react";
import { Wifi, Sparkles, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { api, auth } from "../../lib/api";
import { cn } from "../../lib/cn";

function dotColor(isLive: boolean) {
  return isLive ? "var(--primary)" : "color-mix(in oklab, var(--muted) 45%, transparent)";
}

function truncateName(name: string, max = 12) {
  if (!name) return "";
  return name.length > max ? `${name.slice(0, Math.max(0, max - 3))}...` : name;
}

function Row({
  username,
  displayName,
  avatarUrl,
  live,
}: {
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  live?: boolean;
}) {
  return (
    <a
      href={`#/profile/${encodeURIComponent(username)}`}
      className="flex items-center gap-3 rounded-2xl px-3 py-2 hover:opacity-95"
    >
      <img
        src={avatarUrl || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(username)}`}
        className="h-9 w-9 rounded-xl"
        style={{
          border: "1px solid var(--border)",
          background: "color-mix(in oklab, var(--card) 92%, transparent)",
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{truncateName(displayName)}</div>
        <div className="text-[12px] truncate" style={{ color: "var(--muted)" }}>
          {live ? "Live now" : "Offline"}
        </div>
      </div>
      <div className="h-2.5 w-2.5 rounded-full" style={{ background: dotColor(Boolean(live)) }} />
    </a>
  );
}

export function Sidebar() {
  const [following, setFollowing] = React.useState<any[]>([]);
  const [followingExpanded, setFollowingExpanded] = React.useState(false);

  const [rec, setRec] = React.useState<any[]>([]);
  const [err, setErr] = React.useState<string | null>(null);

  async function loadFollowing() {
    setErr(null);
    if (!auth.tokens()) {
      setFollowing([]);
      setFollowingExpanded(false);
      return;
    }
    try {
      const r = await api.following();
      setFollowing(r.items || []);
    } catch (e: any) {
      setErr(e.message || "Failed");
      setFollowing([]);
      setFollowingExpanded(false);
    }
  }

  async function loadRecommended() {
    setErr(null);
    try {
      const r = await api.recommendedChannels(7);
      setRec(r.items || []);
    } catch (e: any) {
      setErr(e.message || "Failed");
      setRec([]);
    }
  }

  React.useEffect(() => {
    loadFollowing();
    loadRecommended();
  }, []);

  React.useEffect(() => {
    const onChange = () => loadFollowing();
    window.addEventListener("devolo:following-changed", onChange);
    return () => window.removeEventListener("devolo:following-changed", onChange);
  }, []);

  React.useEffect(() => {
    const onAuth = () => {
      loadFollowing();
      loadRecommended();
    };
    window.addEventListener("devolo:auth-changed", onAuth);
    return () => window.removeEventListener("devolo:auth-changed", onAuth);
  }, []);

  const visibleFollowing = followingExpanded ? following : following.slice(0, 5);

  return (
    <aside className="space-y-3 sticky top-24 h-[calc(100vh-7rem)]">
      <div className="glass rounded-2xl p-3">
        <div className="flex items-center justify-between px-2 pb-2">
          <a href="#/following" className="flex items-center gap-2 text-sm font-semibold hover:opacity-95">
            <Wifi size={16} />
            Following
          </a>
          <div className="text-[12px]" style={{ color: "var(--muted)" }}>
            {followingExpanded ? `All (${following.length})` : "Top 5"}
          </div>
        </div>

        {!auth.tokens() ? (
          <div className="px-2 py-2 text-[12px]" style={{ color: "var(--muted)" }}>
            Sign in to see who you follow.
          </div>
        ) : (
          <>
            <div className={cn("space-y-1", followingExpanded && "max-h-[420px] overflow-y-auto pr-1")}>
              {visibleFollowing.map((u) => (
                <Row
                  key={u.user_id}
                  username={u.username}
                  displayName={u.display_name || u.username}
                  avatarUrl={u.avatar_url}
                  live={false}
                />
              ))}
              {!visibleFollowing.length && !err && (
                <div className="px-2 py-2 text-[12px]" style={{ color: "var(--muted)" }}>
                  You aren’t following anyone yet.
                </div>
              )}
            </div>

            {following.length > 5 && (
              <button
                type="button"
                onClick={() => setFollowingExpanded((v) => !v)}
                className="w-full mt-2 rounded-2xl px-3 py-2 text-sm hover:opacity-95 inline-flex items-center justify-center gap-2"
                style={{
                  border: "1px solid var(--border)",
                  background: "color-mix(in oklab, var(--card) 92%, transparent)",
                }}
              >
                {followingExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {followingExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </>
        )}
      </div>

      <div className="glass rounded-2xl p-3">
        <div className="flex items-center justify-between px-2 pb-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles size={16} />
            Recommended DEVOLOS
          </div>
          <button
            onClick={loadRecommended}
            className="h-8 w-8 rounded-xl grid place-items-center hover:opacity-95"
            style={{ border: "1px solid var(--border)" }}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {err && (
          <div className="px-2 pb-2 text-[12px]" style={{ color: "var(--muted)" }}>
            {err}
          </div>
        )}

        <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1 overscroll-contain">
          {rec.map((c) => (
            <Row
              key={c.channel_id}
              username={c.username}
              displayName={c.display_name || c.username}
              avatarUrl={c.avatar_url}
              live={Boolean(c.is_live)}
            />
          ))}

          {!rec.length && !err && (
            <div className="px-2 py-2 text-[12px]" style={{ color: "var(--muted)" }}>
              No recommendations yet.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
