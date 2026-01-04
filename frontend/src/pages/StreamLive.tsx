import React from "react";
import { api, auth } from "../lib/api";
import { LiveStreamCard } from "../components/cards/LiveStreamCard";

function useFollowingSet() {
  const [set, setSet] = React.useState<Set<string>>(new Set());
  const refresh = React.useCallback(() => {
    if (!auth.tokens()) {
      setSet(new Set());
      return;
    }
    api.myFollowing().then((r) => setSet(new Set((r.items || []).map(String)))).catch(() => setSet(new Set()));
  }, []);
  return { set, refresh };
}

export function StreamLive() {
  const [items, setItems] = React.useState<any[]>([]);
  const [sort, setSort] = React.useState<"popular" | "recommended">("recommended");
  const [language, setLanguage] = React.useState<string>("");
  const [categoryId, setCategoryId] = React.useState<string>("");
  const [categories, setCategories] = React.useState<any[]>([]);
  const [err, setErr] = React.useState<string | null>(null);

  const { set: following, refresh: refreshFollowing } = useFollowingSet();

  React.useEffect(() => {
    refreshFollowing();
    api.categories("recommended").then((r) => setCategories(r.items || [])).catch(() => {});
  }, [refreshFollowing]);

  React.useEffect(() => {
    setErr(null);
    api.liveStreamsAll({
      sort: sort === "popular" ? "popular" : "",
      language: language || "",
      category_id: categoryId || "",
    })
      .then((r) => setItems(r.items || []))
      .catch((e) => setErr(e.message));
  }, [sort, language, categoryId]);

  function onToggleFollow() {
    refreshFollowing();
  }

  return (
    <div className="space-y-5">
      <div className="glass rounded-3xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">Live Directory</div>
            <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Sort by popularity, filter by language and category.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="rounded-2xl px-3 py-2 text-sm"
              style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}
              title="Sort"
            >
              <option value="recommended">Recommended</option>
              <option value="popular">Popular</option>
            </select>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-2xl px-3 py-2 text-sm"
              style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}
              title="Language"
            >
              <option value="">Any language</option>
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="tr">Turkish</option>
            </select>

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded-2xl px-3 py-2 text-sm"
              style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}
              title="Category"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {err && (
          <div className="mt-4 rounded-2xl px-4 py-3 text-sm" style={{ border: "1px solid color-mix(in oklab, var(--accent) 35%, var(--border))" }}>
            {err}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((x) => (
          <LiveStreamCard
            key={x.stream_id}
            item={x}
            followed={following.has(String(x?.channel?.username || ""))}
            onToggleFollow={onToggleFollow}
          />
        ))}
        {!items.length && !err && <div className="text-sm" style={{ color: "var(--muted)" }}>No live streams.</div>}
      </div>
    </div>
  );
}
