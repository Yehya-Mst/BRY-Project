import React from "react";
import { api } from "../lib/api";
import { ClipCard } from "../components/cards/ClipCard";
import { Film } from "lucide-react";

export function Clips() {
  const [items, setItems] = React.useState<any[]>([]);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setErr(null);
    api
      .clips()
      .then((r) => {
        if (!alive) return;
        setItems(Array.isArray(r) ? r : (r as any)?.items || []);
      })
      .catch((e: any) => {
        if (!alive) return;
        setErr(e?.message || "Failed to load clips");
        setItems([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="glass rounded-3xl p-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Film size={18} />
            <div className="text-lg font-semibold">Clips</div>
          </div>
          <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Trending clips from the community.
          </div>
          {err && (
            <div
              className="mt-3 rounded-2xl px-4 py-3 text-sm"
              style={{
                border: "1px solid color-mix(in oklab, var(--accent) 35%, var(--border))",
                background: "color-mix(in oklab, var(--accent) 8%, transparent)",
              }}
            >
              {err}
            </div>
          )}
        </div>

        <a
          href="#/"
          className="rounded-2xl px-4 py-2 text-sm font-semibold whitespace-nowrap"
          style={{
            border: "1px solid var(--border)",
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--primary) 28%, transparent), color-mix(in oklab, var(--accent) 18%, transparent))",
          }}
        >
          Back Home
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {items.map((x) => (
          <ClipCard key={x.clip_id} item={x} />
        ))}
        {!items.length && !err &&
          Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-[320px] rounded-3xl glass animate-pulse" />)}
      </div>
    </div>
  );
}
