import React from "react";
import { Search, User, LogIn, LayoutDashboard, Sun, Moon, Compass } from "lucide-react";
import { cn } from "../../lib/cn";
import { api, auth } from "../../lib/api";
import { initTheme, getTheme, setTheme } from "../../lib/theme";
import { resetFollowCache } from "../../lib/followStore";

function useDebounce<T>(value: T, ms: number) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function Navbar() {
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [theme, setThemeState] = React.useState<"dark" | "light">("dark");
  const [me, setMe] = React.useState<any | null>(null);

  const [suggest, setSuggest] = React.useState<any[]>([]);
  const [sOpen, setSOpen] = React.useState(false);
  const debounced = useDebounce(q, 220);

  async function refreshMe() {
    if (!auth.tokens()) {
      setMe(null);
      return;
    }
    try {
      const u = await api.me();
      setMe(u || null);
    } catch {
      setMe(null);
    }
  }

  React.useEffect(() => {
    initTheme();
    setThemeState(getTheme());
    refreshMe();
  }, []);

  React.useEffect(() => {
    const onAuth = () => {
      refreshMe();
      setOpen(false);
    };
    window.addEventListener("devolo:auth-changed", onAuth);
    return () => window.removeEventListener("devolo:auth-changed", onAuth);
  }, []);

  React.useEffect(() => {
    const t = debounced.trim();
    if (!t) {
      setSuggest([]);
      setSOpen(false);
      return;
    }
    api
      .search(t)
      .then((r) => {
        setSuggest(r || []);
        setSOpen(true);
      })
      .catch(() => {
        setSuggest([]);
        setSOpen(false);
      });
  }, [debounced]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  }

  function logout() {
    auth.setTokens(null);
    resetFollowCache();
    setMe(null);
    window.location.hash = "#/";
  }

  function gotoResult(x: any) {
    setSOpen(false);
    setQ("");
    if (x.type === "user") {
      window.location.hash = `#/profile/${encodeURIComponent(x.title)}`;
      return;
    }
    if (x.type === "category") {
      window.location.hash = `#/live?category_id=${encodeURIComponent(x.id)}`;
      return;
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    // default: search -> live page with query (for future). For now: just keep dropdown.
    setSOpen(true);
  }

  const meLabel = me ? String(me.display_name || me.username || "Account") : "Guest";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-[1400px] px-4">
        <div className="glass mt-4 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-sm">
          <a href="#/" className="flex items-center gap-2 min-w-[160px]">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "radial-gradient(10px 10px at 30% 30%, color-mix(in oklab, var(--primary) 65%, transparent), transparent), linear-gradient(135deg, color-mix(in oklab, var(--primary) 30%, transparent), color-mix(in oklab, var(--accent) 22%, transparent))",
                border: "1px solid var(--border)",
              }}
            >
              <span className="text-sm font-semibold">D</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">DEVOLO</div>
              <div className="text-[11px]" style={{ color: "var(--muted)" }}>
                streams • clips • creators
              </div>
            </div>
          </a>

          <div className="flex-1 relative">
            <form onSubmit={submit}>
              <div
                className="flex items-center gap-2 rounded-2xl px-3 py-2"
                style={{
                  border: "1px solid var(--border)",
                  background: "color-mix(in oklab, var(--card) 92%, transparent)",
                }}
              >
                <Search size={16} style={{ color: "var(--muted)" }} />
                <input
                  className="w-full bg-transparent text-sm ring-focus outline-none"
                  placeholder="Search DEVOLOS, categories…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onFocus={() => q.trim() && setSOpen(true)}
                />
                <a
                  href="#/categories"
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm"
                  style={{ border: "1px solid var(--border)" }}
                  title="Browse categories"
                  onClick={() => setSOpen(false)}
                >
                  <Compass size={16} />
                  Browse
                </a>
              </div>
            </form>

            {sOpen && suggest.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 glass rounded-2xl p-2">
                <div className="text-[12px] px-2 py-1" style={{ color: "var(--muted)" }}>
                  Results & suggestions
                </div>
                <div className="space-y-1">
                  {suggest.slice(0, 12).map((x, idx) => (
                    <button
                      key={idx}
                      onClick={() => gotoResult(x)}
                      className="w-full text-left rounded-xl px-3 py-2 hover:opacity-95 flex items-center gap-3"
                      style={{ border: "1px solid transparent" }}
                    >
                      <img
                        src={
                          x.image ||
                          "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=80&q=60"
                        }
                        className="h-8 w-8 rounded-xl object-cover"
                        style={{ border: "1px solid var(--border)" }}
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{x.title}</div>
                        <div className="text-[12px] truncate" style={{ color: "var(--muted)" }}>
                          {x.type === "user" ? "Channel" : "Category"}
                          {x.subtitle ? ` • ${x.subtitle}` : ""}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="h-10 w-10 rounded-2xl grid place-items-center"
            style={{
              border: "1px solid var(--border)",
              background: "color-mix(in oklab, var(--card) 92%, transparent)",
            }}
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className={cn("h-10 px-3 rounded-2xl flex items-center gap-2", open && "shadow-glow")}
              style={{
                border: "1px solid var(--border)",
                background: "color-mix(in oklab, var(--card) 92%, transparent)",
              }}
            >
              <User size={16} />
              <span className="text-sm">{meLabel}</span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl glass p-2">
                {!me ? (
                  <>
                    <a
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:opacity-90"
                      href="#/register"
                      onClick={() => setOpen(false)}
                    >
                      <LogIn size={16} />
                      Register / Sign In
                    </a>
                    <div className="px-3 py-2 text-[12px]" style={{ color: "var(--muted)" }}>
                      Demo users exist in backend seed.
                    </div>
                  </>
                ) : (
                  <>
                    <a
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:opacity-90"
                      href={`#/profile/${encodeURIComponent(me.username)}`}
                      onClick={() => setOpen(false)}
                    >
                      <User size={16} />
                      My profile
                    </a>
                    <a
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:opacity-90"
                      href="#/dashboard"
                      onClick={() => setOpen(false)}
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </a>
                    <button
                      className="w-full text-left flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:opacity-90"
                      onClick={logout}
                    >
                      <LogIn size={16} />
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
