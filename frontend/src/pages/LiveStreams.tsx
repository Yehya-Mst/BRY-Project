import React from "react";
import { api } from "../lib/api";
import { LiveStreamCard } from "../components/cards/LiveStreamCard";

function qs() {
  const q = new URLSearchParams(window.location.hash.split("?")[1] || "");
  return q;
}

export function LiveStreams() {
  const [items, setItems] = React.useState<any[]>([]);
  const [cats, setCats] = React.useState<any[]>([]);
  const [sort, setSort] = React.useState<string>("popular");
  const [categoryId, setCategoryId] = React.useState<string | null>(qs().get("category_id"));

  React.useEffect(() => {
    api.categories().then((r) => setCats(r.items || [])).catch(() => setCats([]));
    api.liveStreams().then((r) => setItems(r.items || [])).catch(() => setItems([]));
  }, []);

  const filtered = React.useMemo(() => {
    let arr = [...items];

    if (categoryId) {
      arr = arr.filter((x) => String(x.category_id || x.categoryId || "") === String(categoryId));
    }

    if (sort === "popular") arr.sort((a, b) => (b.current_viewer_count ?? b.viewer_count ?? 0) - (a.current_viewer_count ?? a.viewer_count ?? 0));

    return arr;
  }, [items, sort, categoryId]);

  return (
    <div className="space-y-5">
      <div className="glass rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Live Streams</div>
            <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Browse live streams by category and popularity.
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="rounded-2xl px-3 py-2 text-sm"
              style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}
              value={categoryId || ""}
              onChange={(e) => setCategoryId(e.target.value || null)}
            >
              <option value="">All categories</option>
              {cats.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="rounded-2xl px-3 py-2 text-sm"
              style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="popular">Popular</option>
              <option value="language">Stream Language (next)</option>
              <option value="category">Category (next)</option>
            </select>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((x) => (
            <LiveStreamCard key={x.stream_id} item={x} />
          ))}
          {!filtered.length && <div className="text-sm" style={{ color: "var(--muted)" }}>No live streams.</div>}
        </div>
      </div>
    </div>
  );
}
