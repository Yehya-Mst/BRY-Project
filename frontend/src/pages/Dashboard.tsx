import React from "react";
import { api, auth } from "../lib/api";
import { Radio, Square, KeyRound } from "lucide-react";

export function Dashboard() {
  const [title, setTitle] = React.useState("Neon Session");
  const [channel, setChannel] = React.useState<any | null>(null);
  const [live, setLive] = React.useState<any[]>([]);
  const [err, setErr] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!auth.tokens()) {
      setErr("You are not signed in. Go to Register / Login.");
      return;
    }
    api.becomeDevolo()
      .then(setChannel)
      .catch((e) => setErr(e.message));

    api.liveStreams().then((r) => setLive(r.items || [])).catch(() => {});
  }, []);

  async function start() {
    setErr(null);
    setMsg(null);
    try {
      const s = await api.startStream({ title, category_id: null });
      setMsg(`Stream started: ${s.stream_id}`);
      const r = await api.liveStreams();
      setLive(r.items || []);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  async function stop(stream_id: string) {
    setErr(null);
    setMsg(null);
    try {
      await api.stopStream(stream_id);
      setMsg("Stream stopped.");
      const r = await api.liveStreams();
      setLive(r.items || []);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="glass rounded-3xl p-6">
        <div className="text-lg font-semibold">Channel Dashboard</div>
        <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Connect to OBS/Streamlabs using the stream key (placeholder). Baseline enforces one active stream per channel.
        </div>

        {channel && (
          <div className="mt-4 rounded-3xl p-4"
               style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <KeyRound size={16} />
              Stream Key
            </div>
            <div className="mt-2 font-mono text-[12px] break-all" style={{ color: "var(--muted)" }}>
              {channel.stream_key}
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="text-sm font-semibold">Title</div>
          <input
            className="mt-2 w-full rounded-2xl px-3 py-2 text-sm ring-focus outline-none"
            style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={start}
            className="rounded-2xl px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
            style={{
              border: "1px solid var(--border)",
              background: "linear-gradient(135deg, color-mix(in oklab, var(--primary) 28%, transparent), color-mix(in oklab, var(--accent) 16%, transparent))"
            }}
          >
            <Radio size={16} />
            Start stream
          </button>
        </div>

        {err && (
          <div className="mt-4 rounded-2xl px-4 py-3 text-sm"
               style={{ border: "1px solid color-mix(in oklab, var(--accent) 35%, var(--border))", background: "color-mix(in oklab, var(--accent) 10%, transparent)" }}>
            {err}
          </div>
        )}
        {msg && (
          <div className="mt-4 rounded-2xl px-4 py-3 text-sm"
               style={{ border: "1px solid color-mix(in oklab, var(--primary) 35%, var(--border))", background: "color-mix(in oklab, var(--primary) 10%, transparent)" }}>
            {msg}
          </div>
        )}
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="text-lg font-semibold">Live Streams (Global)</div>
        <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Stop only affects your channel; list is for verification.
        </div>
        <div className="mt-4 space-y-2">
          {live.map((s) => (
            <div key={s.stream_id} className="rounded-3xl p-4 flex items-center gap-3"
                 style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}>
              <img src={s.thumbnail_url} className="h-14 w-24 rounded-2xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{s.title}</div>
                <div className="text-[12px] truncate" style={{ color: "var(--muted)" }}>
                  {s.channel_title} • {s.current_viewer_count ?? 0} watching
                </div>
              </div>
              <button
                onClick={() => stop(s.stream_id)}
                className="rounded-2xl px-3 py-2 text-sm inline-flex items-center gap-2"
                style={{ border: "1px solid var(--border)" }}
                title="Stop (will only succeed for your channel)"
              >
                <Square size={16} />
                Stop
              </button>
            </div>
          ))}
          {!live.length && <div className="text-sm" style={{ color: "var(--muted)" }}>No live streams.</div>}
        </div>
      </div>
    </div>
  );
}
