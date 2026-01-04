import React from "react";
import { Heart, Share2, Timer, TrendingUp } from "lucide-react";
import { auth } from "../../lib/api";
import { shareUrl } from "../../lib/share";
import { toggleFollow, useFollow } from "../../lib/followStore";

function pick<T>(...v: Array<T | null | undefined>) {
  for (const x of v) if (x !== null && x !== undefined) return x;
  return undefined;
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
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
      style={{ border: "1px solid rgba(255,255,255,0.18)", background: "rgba(0,0,0,0.28)" }}
    >
      {children}
    </button>
  );
}

export function ClipCard({ item }: { item: any }) {
  const username = pick(item?.channel_username, item?.channel?.username) as string | undefined;
  const displayName = pick(item?.channel_display_name, item?.channel?.display_name, username) as string | undefined;
  const categoryName = pick(item?.category_name, item?.category?.name) as string | undefined;

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

  const heartRed = "rgb(239 68 68)";
  const iconBase = following ? heartRed : "white";

  return (
    <a href="#/clips" className="block rounded-3xl glass overflow-hidden hover:opacity-95">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img src={item.thumbnail_url} alt={item.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute top-3 right-3 flex items-end gap-2">
          <IconButton onClick={onToggleFollow} title={following ? "Followed" : "Follow"}>
            <Heart size={18} color={iconBase} fill={following ? heartRed : "transparent"} />
          </IconButton>
          <IconButton onClick={onShare} title="Share">
            <Share2 size={18} />
          </IconButton>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[12px] text-white/90">
          <span className="inline-flex items-center gap-1">
            <Timer size={14} /> {fmt(item.duration_seconds)}
          </span>
          <span className="inline-flex items-center gap-1">
            <TrendingUp size={14} /> {item.view_count}
          </span>
        </div>
      </div>

      <div className="p-3">
        <div className="text-sm font-semibold line-clamp-2">{item.title}</div>
        <div className="text-[12px] mt-1 line-clamp-1" style={{ color: "var(--muted)" }}>
          {displayName || "Channel"}
          {categoryName ? ` • ${categoryName}` : ""}
        </div>
      </div>
    </a>
  );
}
