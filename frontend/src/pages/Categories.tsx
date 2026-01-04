import React from "react";
import { api } from "../lib/api";

export function Categories() {
  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    api.categories().then((r) => setItems(r.items || [])).catch(() => setItems([]));
  }, []);

  return (
    <div className="space-y-5">
      <div className="glass rounded-3xl p-5">
        <div className="text-lg font-semibold">Browse Categories</div>
        <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Click a category to see live streams filtered.
        </div>

        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {items.map((c) => (
            <a
              key={c.category_id}
              href={`#/live?category_id=${encodeURIComponent(c.category_id)}`}
              className="glass rounded-3xl overflow-hidden hover:opacity-95"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img src={c.box_art} className="h-full w-full object-cover" />
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold line-clamp-1">{c.name}</div>
                <div className="text-[12px]" style={{ color: "var(--muted)" }}>
                  {c.viewer_count} viewers
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
