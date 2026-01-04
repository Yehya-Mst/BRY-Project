import type { SharePayload } from "../components/modals/ShareModal";

function shouldUseNativeShare() {
  try {
    const hasShare = typeof (navigator as any).share === "function";
    const coarse = window.matchMedia?.("(pointer: coarse)")?.matches;
    const small = window.matchMedia?.("(max-width: 640px)")?.matches;
    return Boolean(hasShare && (coarse || small));
  } catch {
    return false;
  }
}

export function openShare(payload: SharePayload) {
  window.dispatchEvent(new CustomEvent<SharePayload>("devolo:share", { detail: payload }));
}

export async function shareUrl(title: string, url: string) {
  if (shouldUseNativeShare()) {
    try {
      // @ts-ignore
      await navigator.share({ title, url });
      return true;
    } catch {
      // fall back
    }
  }
  openShare({ title, url });
  return true;
}

export function truncName(s: string, max = 12) {
  const t = (s || "").trim();
  if (t.length <= max) return t;
  return t.slice(0, Math.max(2, max - 3)) + "...";
}
