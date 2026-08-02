import { useEffect, useState } from "react";
import appIcon from "/app-icon.png?url";

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("opencast-splash-seen")) return;
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setLeaving(true), 1600);
    const t2 = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem("opencast-splash-seen", "1");
      } catch {
        /* noop */
      }
    }, 2200);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [visible]);

  if (!visible) return null;
  return (
    <div
      onClick={() => setLeaving(true)}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background transition-opacity duration-500 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ backgroundImage: "var(--gradient-stage)" }}
    >
      <div className="relative">
        <span className="broadcast-ring absolute inset-0 rounded-3xl border border-primary/60" />
        <span
          className="broadcast-ring absolute inset-0 rounded-3xl border border-primary/60"
          style={{ animationDelay: "0.7s" }}
        />
        <img
          src={appIcon}
          alt="Opencast"
          width={96}
          height={96}
          className="relative h-24 w-24 rounded-3xl shadow-ember"
        />
      </div>
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
          Open<span className="text-brand">cast</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Free TV. Worldwide.</p>
      </div>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-secondary">
        <div className="h-full w-full origin-left animate-[splashbar_1.6s_ease-out_forwards] bg-brand" />
      </div>
      <style>{`@keyframes splashbar { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
    </div>
  );
}
