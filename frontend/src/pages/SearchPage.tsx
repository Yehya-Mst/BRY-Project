import React from "react";
import { api } from "../lib/api";

export function SearchPage({ q }: { q: string }) {
  const [items, setItems] = React.useState<any[]>([]);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    const query = (q || "").trim();
    if (!query) return;
    setErr(null);
    api.searchAll(query)
      .then(setItems)
      .catch((e) => setErr(e.message));
  }, [q]);

  const users = items.filter((x) => x.type === "user");
  const cats = items.filter((x) => x.type === "category");

  return (
    <div className="space-y-5">
      <div className="glass rounded-3xl p-5">
        <div className="text-lg font-semibold">Search</div>
        <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Results for: <span className="font-semibold">{q}</span>
        </div>
        {err && <div className="mt-3 text-sm" style={{ color: "var(--muted)" }}>{err}</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-3xl p-5">
          <div className="text-sm font-semibold">Channels</div>
          <div className="mt-3 space-y-2">
            {users.map((u: any) => (
              <a
                key={u.id}
                href={`#/profile/${encodeURIComponent(u.title)}`}
                className="flex items-center gap-3 rounded-2xl px-3 py-2 hover:opacity-95"
                style={{ border: "1px solid var(--border)" }}
              >
                <img src={u.image || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(u.title)}`} className="h-10 w-10 rounded-2xl" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{u.title}</div>
                  <div className="text-[12px] truncate" style={{ color: "var(--muted)" }}>{u.subtitle || "Channel"}</div>
                </div>
              </a>
            ))}
            {!users.length && <div className="text-sm" style={{ color: "var(--muted)" }}>No channels.</div>}
          </div>
        </div>

        <div className="glass rounded-3xl p-5">
          <div className="text-sm font-semibold">Categories</div>
          <div className="mt-3 space-y-2">
            {cats.map((c: any) => (
              <a
                key={c.id}
                href="#/categories"
                className="flex items-center gap-3 rounded-2xl px-3 py-2 hover:opacity-95"
                style={{ border: "1px solid var(--border)" }}
              >
                <img src={c.image || ""} className="h-10 w-10 rounded-2xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{c.title}</div>
                  <div className="text-[12px] truncate" style={{ color: "var(--muted)" }}>{c.subtitle || ""}</div>
                </div>
              </a>
            ))}
            {!cats.length && <div className="text-sm" style={{ color: "var(--muted)" }}>No categories.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
