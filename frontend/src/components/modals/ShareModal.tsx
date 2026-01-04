import React from "react";
import { ArrowUpRight, Check, Copy, Mail, MessageCircle, Share2, X } from "lucide-react";
import { cn } from "../../lib/cn";

export type SharePayload = {
  title?: string;
  url: string;
  text?: string;
};

function isProbablyMobile() {
  try {
    // "coarse pointer" is a nice signal for touch devices
    const coarse = window.matchMedia?.("(pointer: coarse)")?.matches;
    const small = window.matchMedia?.("(max-width: 640px)")?.matches;
    return Boolean(coarse || small);
  } catch {
    return false;
  }
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

// Minimal inline brand-ish icons (so no dependency on brand icon exports)
function BrandIcon({ name }: { name: "x" | "facebook" | "linkedin" | "whatsapp" }) {
  const common = "h-4 w-4";
  if (name === "x") {
    return (
      <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M18.9 2H22l-6.8 7.8L23 22h-6.8l-5.3-6.9L4.9 22H2l7.4-8.5L1 2h7l4.8 6.2L18.9 2Zm-1.2 18h1.7L7.1 3.9H5.3L17.7 20Z"
        />
      </svg>
    );
  }
  if (name === "facebook") {
    return (
      <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.6 1.6-1.6h1.7V4.5c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.6v1.9H7v3.1h2.6v8h3.9Z"
        />
      </svg>
    );
  }
  if (name === "linkedin") {
    return (
      <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M6.5 6.5A2 2 0 1 1 6.5 2.5a2 2 0 0 1 0 4Zm-1.8 15.5V8.2h3.6V22H4.7ZM9.6 8.2h3.5v1.9h.1c.5-1 1.7-2.1 3.6-2.1 3.8 0 4.5 2.5 4.5 5.7V22h-3.6v-6.6c0-1.6 0-3.6-2.2-3.6s-2.5 1.7-2.5 3.5V22H9.6V8.2Z"
        />
      </svg>
    );
  }
  // whatsapp
  return (
    <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.2 6.38 2.2 11.84c0 1.92.5 3.7 1.44 5.27L2 22l5.05-1.6a9.78 9.78 0 0 0 4.99 1.35c5.46 0 9.84-4.38 9.84-9.84C21.88 6.38 17.5 2 12.04 2Zm0 17.93c-1.58 0-3.05-.42-4.34-1.15l-.31-.18-2.99.95.97-2.91-.2-.3a7.98 7.98 0 0 1-1.27-4.39c0-4.42 3.65-8.07 8.17-8.07 4.42 0 8.07 3.65 8.07 8.07 0 4.52-3.65 8.17-8.1 8.17Zm4.7-6.02c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.59.13-.18.26-.68.85-.83 1.02-.15.17-.3.2-.56.07-.26-.13-1.1-.41-2.09-1.3-.77-.68-1.29-1.52-1.44-1.78-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.44.09-.18.04-.33-.02-.46-.07-.13-.59-1.42-.81-1.95-.21-.5-.42-.43-.59-.43h-.5c-.18 0-.46.07-.7.33-.24.26-.92.9-.92 2.2s.94 2.56 1.07 2.74c.13.18 1.86 2.83 4.5 3.97.63.27 1.12.43 1.5.55.63.2 1.2.17 1.65.1.5-.07 1.54-.63 1.76-1.23.22-.6.22-1.12.15-1.23-.06-.11-.24-.18-.5-.31Z"
      />
    </svg>
  );
}

function buildShareLinks(payload: SharePayload) {
  const title = payload.title || "DEVOLO";
  const url = payload.url;
  const text = payload.text || title;

  const encUrl = encodeURIComponent(url);
  const encText = encodeURIComponent(`${text} ${url}`);
  const encTitle = encodeURIComponent(title);
  const encBody = encodeURIComponent(`${text}\n${url}`);

  return [
    { label: "X", icon: <BrandIcon name="x" />, href: `https://x.com/intent/tweet?text=${encText}` },
    { label: "Facebook", icon: <BrandIcon name="facebook" />, href: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}` },
    { label: "LinkedIn", icon: <BrandIcon name="linkedin" />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}` },
    { label: "WhatsApp", icon: <BrandIcon name="whatsapp" />, href: `https://api.whatsapp.com/send?text=${encText}` },
    { label: "Email", icon: <Mail size={16} />, href: `mailto:?subject=${encTitle}&body=${encBody}` },
  ];
}

function ActionButton({
  children,
  onClick,
  className,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "rounded-2xl px-3 py-2 text-sm inline-flex items-center justify-center gap-2",
        "hover:opacity-95 active:scale-[0.99] transition",
        className
      )}
      style={{
        border: "1px solid var(--border)",
        background: "color-mix(in oklab, var(--card) 92%, transparent)",
      }}
    >
      {children}
    </button>
  );
}

export function ShareModalHost() {
  const [open, setOpen] = React.useState(false);
  const [payload, setPayload] = React.useState<SharePayload>({ url: window.location.href });
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<SharePayload>;
      if (!ce.detail?.url) return;
      setPayload(ce.detail);
      setCopied(false);
      setOpen(true);
    };

    window.addEventListener("devolo:share", handler as EventListener);
    return () => window.removeEventListener("devolo:share", handler as EventListener);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock background scroll when modal is open (feels nicer)
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const title = payload.title || "Share";
  const url = payload.url || window.location.href;
  const links = buildShareLinks(payload);

  async function onCopy() {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  function onOpenLink() {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="devolo-share-title"
        className="relative w-full max-w-[560px] rounded-3xl glass p-5 overflow-hidden"
        style={{
          boxShadow:
            "0 0 0 1px color-mix(in oklab, var(--primary) 22%, var(--border)), 0 18px 70px rgba(0,0,0,0.55)",
        }}
      >
        {/* Decorative glow */}
        <div
          className="pointer-events-none absolute -top-28 -right-28 h-72 w-72 rounded-full blur-2xl opacity-60"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--primary) 35%, transparent), transparent 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full blur-2xl opacity-50"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--accent) 30%, transparent), transparent 60%)",
          }}
        />

        {/* Header */}
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-2xl grid place-items-center"
              style={{
                border: "1px solid var(--border)",
                background:
                  "radial-gradient(10px 10px at 30% 30%, color-mix(in oklab, var(--primary) 65%, transparent), transparent), linear-gradient(135deg, color-mix(in oklab, var(--primary) 22%, transparent), color-mix(in oklab, var(--accent) 18%, transparent))",
              }}
            >
              <Share2 size={18} />
            </div>
            <div>
              <div id="devolo-share-title" className="text-base font-semibold">
                {title}
              </div>
              <div className="text-[12px]" style={{ color: "var(--muted)" }}>
                Copy the link or share via your favorite app
                {isProbablyMobile() ? " (native share is used on mobile)" : ""}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-10 w-10 rounded-2xl grid place-items-center hover:opacity-90"
            style={{ border: "1px solid var(--border)", background: "color-mix(in oklab, var(--card) 92%, transparent)" }}
            aria-label="Close"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* URL row */}
        <div className="relative mt-5">
          <div className="text-[12px] mb-2" style={{ color: "var(--muted)" }}>
            Link
          </div>

          <div
            className="flex items-center gap-2 rounded-2xl px-3 py-2"
            style={{
              border: "1px solid var(--border)",
              background: "color-mix(in oklab, var(--card) 90%, transparent)",
            }}
          >
            <MessageCircle size={16} style={{ color: "var(--muted)" }} />
            <input
              readOnly
              value={url}
              className="w-full bg-transparent text-sm outline-none"
              onFocus={(e) => e.currentTarget.select()}
            />

            <ActionButton
              onClick={onCopy}
              title="Copy link"
              className={cn(copied && "opacity-95")}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </ActionButton>

            <ActionButton onClick={onOpenLink} title="Open link in new tab">
              <ArrowUpRight size={16} />
              <span className="hidden sm:inline">Open</span>
            </ActionButton>
          </div>
        </div>

        {/* Share actions */}
        <div className="relative mt-5">
          <div className="text-[12px] mb-2" style={{ color: "var(--muted)" }}>
            Share to
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {links.map((x) => (
              <a
                key={x.label}
                href={x.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl px-3 py-2 text-sm inline-flex items-center justify-center gap-2 hover:opacity-95 transition"
                style={{
                  border: "1px solid var(--border)",
                  background: "color-mix(in oklab, var(--card) 92%, transparent)",
                }}
                title={`Share via ${x.label}`}
              >
                <span className="opacity-90">{x.icon}</span>
                <span className="font-medium">{x.label}</span>
              </a>
            ))}
          </div>

          {/* <div className="mt-3 text-[12px]" style={{ color: "var(--muted)" }}>
            Tip: “Copy” is the cleanest option for your app’s vibe ✨
          </div> */}
        </div>
      </div>
    </div>
  );
}
