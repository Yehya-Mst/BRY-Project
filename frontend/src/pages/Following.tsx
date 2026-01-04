import React from "react";
import { api, auth } from "../lib/api";

type SortKey = "A-Z" | "Z-A" | "Oldest" | "Newest";

export function Following() {
  const [items, setItems] = React.useState<any[]>([]);
  const [err, setErr] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState<SortKey>("Oldest");

  React.useEffect(() => {
    if (!auth.tokens()) {
      setErr("You are not signed in.");
      return;
    }
    api.following().then((r) => setItems(r.items || [])).catch((e) => setErr(e.message));
  }, []);

  const sorted = React.useMemo(() => {
    const arr = [...items];
    if (sort === "A-Z") arr.sort((a, b) => String(a.display_name).localeCompare(String(b.display_name)));
    if (sort === "Z-A") arr.sort((a, b) => String(b.display_name).localeCompare(String(a.display_name)));
    if (sort === "Oldest") arr.sort((a, b) => String(a.followed_at || "").localeCompare(String(b.followed_at || "")));
    if (sort === "Newest") arr.sort((a, b) => String(b.followed_at || "").localeCompare(String(a.followed_at || "")));
    return arr;
  }, [items, sort]);

  return (
    <div className="max-w-3xl space-y-4">
      <div className="glass rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Following</div>
            <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Channels you follow.
            </div>
          </div>
          <select
            className="rounded-2xl px-3 py-2 text-sm"
            style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="A-Z">A-Z</option>
            <option value="Z-A">Z-A</option>
            <option value="Oldest">Follow (oldest)</option>
            <option value="Newest">Follow (newest)</option>
          </select>
        </div>

        {err && (
          <div className="mt-4 rounded-2xl px-4 py-3 text-sm" style={{ border: "1px solid color-mix(in oklab, var(--accent) 35%, var(--border))" }}>
            {err}
          </div>
        )}

        <div className="mt-4 space-y-2">
          {sorted.map((u) => (
            <a
              key={u.user_id}
              href={`#/profile/${encodeURIComponent(u.username)}`}
              className="rounded-3xl p-3 flex items-center gap-3 hover:opacity-95"
              style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}
            >
              <img
                src={u.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(u.username)}`}
                className="h-10 w-10 rounded-2xl"
                style={{ border: "1px solid var(--border)" }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{u.display_name}</div>
                <div className="text-[12px] truncate" style={{ color: "var(--muted)" }}>
                  {u.username}
                </div>
              </div>
            </a>
          ))}
          {!sorted.length && !err && <div className="text-sm" style={{ color: "var(--muted)" }}>No following yet.</div>}
        </div>
      </div>
    </div>
  );
}
