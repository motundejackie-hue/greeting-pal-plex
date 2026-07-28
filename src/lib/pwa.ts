/**
 * Guarded service-worker registration. Never registers in dev, in an iframe,
 * or inside any Lovable preview host — only in the published app.
 */
const SW_URL = "/sw.js";

function blocked(): boolean {
  if (typeof window === "undefined") return true;
  if (!import.meta.env.PROD) return true;
  if (window.top !== window.self) return true;
  if (new URL(window.location.href).searchParams.get("sw") === "off") return true;
  const h = window.location.hostname;
  return (
    h.startsWith("id-preview--") ||
    h.startsWith("preview--") ||
    h === "lovableproject.com" ||
    h.endsWith(".lovableproject.com") ||
    h === "lovableproject-dev.com" ||
    h.endsWith(".lovableproject-dev.com") ||
    h === "beta.lovable.dev" ||
    h.endsWith(".beta.lovable.dev")
  );
}

export async function registerServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (blocked()) {
    const regs = await navigator.serviceWorker.getRegistrations().catch(() => []);
    for (const reg of regs) {
      if (reg.active?.scriptURL.endsWith(SW_URL)) void reg.unregister();
    }
    return;
  }
  try {
    await navigator.serviceWorker.register(SW_URL, { scope: "/" });
  } catch {
    /* offline support is best-effort */
  }
}
