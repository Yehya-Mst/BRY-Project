import React from "react";
import { api, auth } from "../lib/api";
import { UserPlus, Sparkles } from "lucide-react";

export function Profile({ username }: { username: string }) {
  const [data, setData] = React.useState<any | null>(null);
  const [clips, setClips] = React.useState<any[]>([]);
  const [err, setErr] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    setErr(null);
    api.profile(username).then(setData).catch((e) => setErr(e.message));
    api.userClips(username).then(setClips).catch(() => {});
  }, [username]);

  async function become() {
    setMsg(null);
    try {
      await api.becomeDevolo();
      setMsg("Channel created. Go to Dashboard to start streaming.");
      window.location.hash = "#/dashboard";
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl overflow-hidden">
        <div className="relative h-44">
          <img
            src={data?.banner_url || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1400&q=80"}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        </div>
        <div className="p-5 flex items-start gap-4">
          <img
            src={data?.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(username)}`}
            className="h-20 w-20 rounded-3xl"
            style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">@{data?.username || username}</div>
                <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                  {data?.bio || "No bio yet."}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={become}
                  className="rounded-2xl px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
                  style={{
                    border: "1px solid var(--border)",
                    background: "linear-gradient(135deg, color-mix(in oklab, var(--primary) 26%, transparent), color-mix(in oklab, var(--accent) 14%, transparent))"
                  }}
                  disabled={!auth.tokens()}
                  title={!auth.tokens() ? "Sign in to become a DEVOLO" : "Create channel"}
                >
                  <UserPlus size={16} />
                  Become a DEVOLO
                </button>
                <a
                  href="#/register"
                  className="rounded-2xl px-4 py-2 text-sm inline-flex items-center gap-2"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <Sparkles size={16} />
                  Account
                </a>
              </div>
            </div>
            <div className="mt-3 text-[12px]" style={{ color: "var(--muted)" }}>
              Followers: {data?.follower_count ?? 0}
            </div>
          </div>
        </div>
      </div>

      {err && (
        <div className="glass rounded-2xl px-4 py-3 text-sm"
             style={{ border: "1px solid color-mix(in oklab, var(--accent) 35%, var(--border))" }}>
          {err}
        </div>
      )}
      {msg && (
        <div className="glass rounded-2xl px-4 py-3 text-sm"
             style={{ border: "1px solid color-mix(in oklab, var(--primary) 35%, var(--border))" }}>
          {msg}
        </div>
      )}

      <div className="glass rounded-3xl p-5">
        <div className="text-lg font-semibold">Clips</div>
        <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Viewer can browse streamer clips (dummy feed).
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {clips.slice(0, 12).map((c) => (
            <div key={c.clip_id} className="rounded-3xl overflow-hidden glass">
              <div className="aspect-[3/4] overflow-hidden">
                <img src={c.thumbnail_url} className="h-full w-full object-cover" />
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold line-clamp-2">{c.title}</div>
                <div className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>
                  {c.view_count} views
                </div>
              </div>
            </div>
          ))}
          {!clips.length && <div className="text-sm" style={{ color: "var(--muted)" }}>No clips found.</div>}
        </div>
      </div>
    </div>
  );
}
