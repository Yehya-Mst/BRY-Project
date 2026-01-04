import React from "react";
import { api, auth } from "../lib/api";
import { Mail, Lock, User, CheckCircle2 } from "lucide-react";

export function Register() {
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);

  const [mode, setMode] = React.useState<"register" | "login">("register");
  const [err, setErr] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    try {
      if (mode === "register") {
        await api.register({ username, email, password, display_name: username });
        setOk("Account created. You are signed in.");
        window.location.hash = `#/profile/${username}`;
        return;
      }
      await api.login({ email, password, remember_me: remember });
      setOk("Signed in.");
      window.location.hash = "#/dashboard";
    } catch (e: any) {
      setErr(e.message || "Failed");
    }
  }

  React.useEffect(() => {
    if (auth.tokens()) setOk("You are already signed in.");
  }, []);

  return (
    <div className="max-w-xl">
      <div className="glass rounded-3xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">{mode === "register" ? "Create Account" : "Sign In"}</div>
            <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Email/password now. Google/Facebook are stub endpoints in this baseline.
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-2xl px-3 py-2 text-sm"
              style={{ border: "1px solid var(--border)", background: mode === "register" ? "color-mix(in oklab, var(--primary) 12%, transparent)" : "transparent" }}
              onClick={() => setMode("register")}
            >
              Register
            </button>
            <button
              className="rounded-2xl px-3 py-2 text-sm"
              style={{ border: "1px solid var(--border)", background: mode === "login" ? "color-mix(in oklab, var(--primary) 12%, transparent)" : "transparent" }}
              onClick={() => setMode("login")}
            >
              Login
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          {mode === "register" && (
            <div className="rounded-2xl px-3 py-2 flex items-center gap-2"
                 style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}>
              <User size={16} style={{ color: "var(--muted)" }} />
              <input className="w-full bg-transparent text-sm ring-focus outline-none"
                     placeholder="Username"
                     value={username}
                     onChange={(e) => setUsername(e.target.value)} />
            </div>
          )}

          <div className="rounded-2xl px-3 py-2 flex items-center gap-2"
               style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}>
            <Mail size={16} style={{ color: "var(--muted)" }} />
            <input className="w-full bg-transparent text-sm ring-focus outline-none"
                   placeholder="Email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="rounded-2xl px-3 py-2 flex items-center gap-2"
               style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}>
            <Lock size={16} style={{ color: "var(--muted)" }} />
            <input className="w-full bg-transparent text-sm ring-focus outline-none"
                   placeholder="Password"
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)} />
          </div>

          <label className="flex items-center gap-2 text-sm select-none">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
            <span style={{ color: "var(--muted)" }}>(refresh token TTL)</span>
          </label>

          {err && (
            <div className="rounded-2xl px-4 py-3 text-sm"
                 style={{ border: "1px solid color-mix(in oklab, var(--accent) 35%, var(--border))", background: "color-mix(in oklab, var(--accent) 10%, transparent)" }}>
              {err}
            </div>
          )}

          {ok && (
            <div className="rounded-2xl px-4 py-3 text-sm flex items-center gap-2"
                 style={{ border: "1px solid color-mix(in oklab, var(--primary) 35%, var(--border))", background: "color-mix(in oklab, var(--primary) 10%, transparent)" }}>
              <CheckCircle2 size={16} />
              {ok}
            </div>
          )}

          <button
            className="w-full rounded-2xl px-4 py-3 text-sm font-semibold"
            style={{
              border: "1px solid var(--border)",
              background: "linear-gradient(135deg, color-mix(in oklab, var(--primary) 30%, transparent), color-mix(in oklab, var(--accent) 18%, transparent))"
            }}
          >
            {mode === "register" ? "Create account" : "Sign in"}
          </button>

          <div className="text-[12px]" style={{ color: "var(--muted)" }}>
            Demo seeded accounts (password: password123): neonwolf@example.com, charcoalqueen@example.com, pinkpulse@example.com, emeraldbyte@example.com
          </div>
        </form>
      </div>
    </div>
  );
}
