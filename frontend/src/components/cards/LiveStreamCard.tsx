import React from "react";
import { Eye, Heart, Share2 } from "lucide-react";
import { auth } from "../../lib/api";
import { shareUrl } from "../../lib/share";
import { toggleFollow, useFollow } from "../../lib/followStore";

function pick<T>(...v: Array<T | null | undefined>) {
  for (const x of v) if (x !== null && x !== undefined) return x;
  return undefined;
}

function Avatar({ username, displayName, url }: { username: string; displayName: string; url?: string | null }) {
  const letter = (displayName || username || "?").slice(0, 1).toUpperCase();
  return url ? (
    <img
      src={url}
      alt={displayName}
      className="h-8 w-8 rounded-xl object-cover"
      style={{ border: "1px solid var(--border)" }}
    />
  ) : (
    <div
      className="h-8 w-8 rounded-xl grid place-items-center text-[12px] font-semibold"
      style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}
    >
      {letter}
    </div>
  );
}

function IconButton({
  onClick,
  title,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="h-11 w-11 rounded-2xl grid place-items-center hover:opacity-95 active:scale-[0.99] transition"
      style={{
        border: "1px solid var(--border)",
        background: "color-mix(in oklab, var(--card) 92%, transparent)",
      }}
    >
      {children}
    </button>
  );
}

export function LiveStreamCard({ item }: { item: any }) {
  const [hover, setHover] = React.useState(false);

  const username = pick(item?.channel_username, item?.channel?.username) as string | undefined;
  const displayName = pick(item?.channel_display_name, item?.channel?.display_name, username) as string | undefined;
  const avatarUrl = pick(item?.channel_avatar_url, item?.channel?.avatar_url) as string | undefined;
  const categoryName = pick(item?.category_name, item?.category?.name) as string | undefined;
  const viewerCount = pick(item?.viewer_count, item?.current_viewer_count, item?.channel?.viewer_count, item?.channel?.current_viewer_count) as
    | number
    | undefined;

  const following = useFollow(username || null);

  async function onToggleFollow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!username) return;

    if (!auth.tokens()) {
      window.location.hash = "#/register";
      return;
    }

    try {
      await toggleFollow(username);
    } catch {}
  }

  async function onShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = window.location.origin + "/#/profile/" + encodeURIComponent(username || "");
    await shareUrl("DEVOLO", url);
  }

  function goProfile(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!username) return;
    window.location.hash = "#/profile/" + encodeURIComponent(username);
  }

  function goLive() {
    const sid = String(item?.stream_id || "").trim();
    if (sid) {
      window.location.hash = "#/stream/" + encodeURIComponent(sid);
      return;
    }
    // Fallback to directory
    window.location.hash = "#/live";
  }

  const heartRed = "rgb(239 68 68)";
  const iconBase = following ? heartRed : "var(--text)";

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={goLive}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") goLive();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group block overflow-hidden rounded-3xl glass cursor-pointer"
      style={{
        boxShadow: hover
          ? "0 0 0 1px color-mix(in oklab, var(--primary) 35%, var(--border)), 0 0 35px color-mix(in oklab, var(--primary) 14%, transparent)"
          : undefined,
      }}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={item.thumbnail_url}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-[12px] font-semibold"
            style={{
              background: "color-mix(in oklab, var(--primary) 20%, black)",
              border: "1px solid color-mix(in oklab, var(--primary) 40%, transparent)",
            }}
          >
            LIVE
          </span>

          {!!categoryName && (
            <span
              className="rounded-full px-3 py-1 text-[12px]"
              style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              {categoryName}
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[12px] text-white/90">
          <Eye size={14} />
          <span>{viewerCount ?? 0} watching</span>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold line-clamp-1">{item.title}</div>

          <button
            type="button"
            onClick={goProfile}
            className="mt-2 flex items-center gap-2 min-w-0 hover:opacity-95"
            title="Open profile"
          >
            {username && displayName ? <Avatar username={username} displayName={displayName} url={avatarUrl} /> : null}
            <div className="min-w-0">
              <div className="text-[12px] truncate" style={{ color: "var(--muted)" }}>
                {displayName || "Channel"}
              </div>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <IconButton onClick={onToggleFollow} title={following ? "Followed" : "Follow"}>
            <Heart size={18} color={iconBase} fill={following ? heartRed : "transparent"} />
          </IconButton>

          <IconButton onClick={onShare} title="Share">
            <Share2 size={18} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
