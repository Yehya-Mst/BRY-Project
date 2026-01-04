import React from "react";
import { api, auth } from "../lib/api";
import { Eye, Wifi, Send, AlertTriangle } from "lucide-react";

// Minimal HLS player. If the stream URL is an .m3u8, we use hls.js when needed.
function VideoPlayer({ url, poster }: { url?: string | null; poster?: string | null }) {
  const ref = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    let hls: any = null;
    const video = ref.current;
    if (!video || !url) return;

    const isM3u8 = url.toLowerCase().includes(".m3u8");
    if (!isM3u8) {
      video.src = url;
      return;
    }

    // Native HLS (Safari)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const mod = await import("hls.js");
        if (cancelled) return;
        const Hls = (mod as any).default;
        if (Hls && Hls.isSupported()) {
          hls = new Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      } catch {
        // If hls.js is missing or fails, fall back to best-effort.
        video.src = url;
      }
    })();

    return () => {
      cancelled = true;
      try {
        if (hls) hls.destroy();
      } catch {
        // no-op
      }
    };
  }, [url]);

  return (
    <video
      ref={ref}
      controls
      playsInline
      poster={poster || undefined}
      className="w-full h-full rounded-3xl"
      style={{ border: "1px solid var(--border)", background: "black" }}
    />
  );
}

function Avatar({ username, displayName, url }: { username: string; displayName: string; url?: string | null }) {
  const letter = (displayName || username || "?").slice(0, 1).toUpperCase();
  return url ? (
    <img src={url} alt={displayName} className="h-10 w-10 rounded-2xl object-cover" style={{ border: "1px solid var(--border)" }} />
  ) : (
    <div className="h-10 w-10 rounded-2xl grid place-items-center text-[12px] font-semibold" style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}>
      {letter}
    </div>
  );
}

export function StreamWatch({ streamId }: { streamId: string }) {
  const [stream, setStream] = React.useState<any | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  const [messages, setMessages] = React.useState<any[]>([]);
  const [chatErr, setChatErr] = React.useState<string | null>(null);
  const [input, setInput] = React.useState<string>("");
  const [since, setSince] = React.useState<string | null>(null);

  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = React.useRef(true);

  React.useEffect(() => {
    setErr(null);
    setStream(null);
    api
      .stream(streamId)
      .then((r) => setStream(r))
      .catch((e) => setErr(e.message));
  }, [streamId]);

  // Track whether the user is "at the bottom" so we don't force-scroll while they read history.
  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 64;
      stickToBottomRef.current = nearBottom;
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const mergeMessages = React.useCallback((incoming: any[]) => {
    if (!incoming.length) return;
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => String(m.message_id)));
      const next = [...prev];
      for (const m of incoming) {
        const id = String(m.message_id);
        if (!seen.has(id)) {
          seen.add(id);
          next.push(m);
        }
      }
      // Keep the UI fast.
      if (next.length > 400) return next.slice(next.length - 400);
      return next;
    });
    const last = incoming[incoming.length - 1];
    if (last?.created_at) setSince(String(last.created_at));
  }, []);

  const pollChat = React.useCallback(async () => {
    try {
      const r = await api.streamChat(streamId, { since: since || undefined, limit: 200 });
      mergeMessages(r.items || []);
      setChatErr(null);
    } catch (e: any) {
      // Avoid noisy UI on transient failures.
      setChatErr(e?.message || "Chat unavailable");
    }
  }, [streamId, since, mergeMessages]);

  React.useEffect(() => {
    // Reset chat when stream changes.
    setMessages([]);
    setSince(null);
    setChatErr(null);

    // Initial load, then poll.
    pollChat();
    const t = window.setInterval(() => {
      pollChat();
    }, 2000);

    return () => window.clearInterval(t);
  }, [streamId]);

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (!stickToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    if (!auth.tokens()) {
      window.location.hash = "#/register";
      return;
    }

    setInput("");
    try {
      const r = await api.sendStreamChat(streamId, { content: text });
      if (r?.message) mergeMessages([r.message]);
      setChatErr(null);
    } catch (e: any) {
      setChatErr(e?.message || "Failed to send");
      setInput(text); // restore
    }
  }

  const title = stream?.title || "Live stream";
  const username = stream?.channel_username || "";
  const displayName = stream?.channel_display_name || username || "Channel";
  const avatarUrl = stream?.channel_avatar_url;
  const viewerCount = stream?.current_viewer_count ?? 0;
  const categoryName = stream?.category_name;

  return (
    <div className="space-y-4">
      {err && (
        <div className="glass rounded-3xl p-5" style={{ border: "1px solid color-mix(in oklab, var(--accent) 35%, var(--border))" }}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} />
            <div className="text-sm">{err}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <div className="glass rounded-3xl p-3">
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden">
              {stream?.playback_url ? (
                <VideoPlayer url={stream.playback_url} poster={stream.thumbnail_url} />
              ) : (
                <div className="w-full h-full grid place-items-center" style={{ background: "black", border: "1px solid var(--border)", borderRadius: "1.5rem" }}>
                  {stream?.thumbnail_url ? (
                    <img src={stream.thumbnail_url} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  ) : null}
                  <div className="relative z-10 glass rounded-3xl px-5 py-4" style={{ border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.35)" }}>
                    <div className="text-sm font-semibold">Stream player not configured</div>
                    <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.78)" }}>
                      Configure an HLS server (or update HLS_BASE_URL) to play video here.
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute left-3 top-3 flex items-center gap-2">
                <span className="rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: "color-mix(in oklab, var(--primary) 20%, black)", border: "1px solid color-mix(in oklab, var(--primary) 40%, transparent)" }}>
                  LIVE
                </span>
                {!!categoryName && (
                  <span className="rounded-full px-3 py-1 text-[12px]" style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}>
                    {categoryName}
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[12px] text-white/90">
                <Eye size={14} />
                <span>{viewerCount} watching</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-5">
            <div className="text-lg font-semibold">{title}</div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  if (username) window.location.hash = "#/profile/" + encodeURIComponent(username);
                }}
                className="flex items-center gap-3 min-w-0 hover:opacity-95"
                title="Open channel"
              >
                <Avatar username={username} displayName={displayName} url={avatarUrl} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{displayName}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>@{username}</div>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <div className="rounded-2xl px-3 py-2 text-sm flex items-center gap-2" style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}>
                  <Wifi size={16} />
                  <span className="tabular-nums">{viewerCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4">
          <div className="glass rounded-3xl overflow-hidden" style={{ height: "calc(100vh - 148px)", minHeight: 520, border: "1px solid var(--border)" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <div>
                <div className="text-sm font-semibold">Chat</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Welcome to the chat room</div>
              </div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>{messages.length} msgs</div>
            </div>

            <div ref={scrollerRef} className="px-4 py-3 overflow-y-auto" style={{ height: "calc(100% - 136px)" }}>
              {chatErr && (
                <div className="mb-3 rounded-2xl px-3 py-2 text-xs" style={{ border: "1px solid color-mix(in oklab, var(--accent) 35%, var(--border))", background: "color-mix(in oklab, var(--accent) 8%, transparent)" }}>
                  {chatErr}
                </div>
              )}

              {!messages.length && !chatErr && (
                <div className="text-sm" style={{ color: "var(--muted)" }}>No messages yet. Say hello.</div>
              )}

              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.message_id} className="flex gap-3">
                    {m.avatar_url ? (
                      <img src={m.avatar_url} alt={m.display_name} className="h-8 w-8 rounded-xl object-cover" style={{ border: "1px solid var(--border)" }} />
                    ) : (
                      <div className="h-8 w-8 rounded-xl grid place-items-center text-[11px] font-semibold" style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}>
                        {(m.display_name || m.username || "?").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold truncate">
                        {m.display_name || m.username}
                        <span className="ml-2 font-normal" style={{ color: "var(--muted)" }}>
                          {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>
                      <div className="text-sm break-words" style={{ color: "var(--text)" }}>{m.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={onSend} className="px-4 py-4" style={{ borderTop: "1px solid var(--border)" }}>
              {!auth.tokens() ? (
                <a
                  href="#/register"
                  className="block text-sm rounded-2xl px-4 py-3 text-center"
                  style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)", color: "var(--muted)" }}
                >
                  Sign in to chat
                </a>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Send a message"
                    className="flex-1 rounded-2xl px-4 py-3 text-sm outline-none"
                    style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}
                  />
                  <button
                    type="submit"
                    className="h-11 w-11 rounded-2xl grid place-items-center hover:opacity-95 active:scale-[0.99] transition"
                    style={{ border: "1px solid var(--border)", background: "linear-gradient(135deg, color-mix(in oklab, var(--primary) 28%, transparent), color-mix(in oklab, var(--accent) 18%, transparent))" }}
                    title="Send"
                  >
                    <Send size={18} />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
