import { useEffect, useState } from "react";
import { Tv } from "lucide-react";

export function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem("opencast-splash-seen");
  });
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setLeaving(true), 2000);
    const t2 = setTimeout(() => {
      setVisible(false);
      try { sessionStorage.setItem("opencast-splash-seen", "1"); } catch { /* noop */ }
    }, 2600);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [visible]);

  if (!visible) return null;
  return (
    <div
      onClick={() => setLeaving(true)}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background transition-opacity duration-500 ${leaving ? "pointer-events-none opacity-0" : "opacity-100"}`}
      style={{ backgroundImage: "radial-gradient(ellipse at center, oklch(0.22 0.06 30) 0%, oklch(0.12 0.02 25) 70%)" }}
    >
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-3xl bg-brand opacity-40" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-brand shadow-ember">
          <Tv className="h-12 w-12 text-white" strokeWidth={2.5} />
        </div>
      </div>
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
          Open<span className="text-brand">cast</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Free TV. Worldwide.</p>
      </div>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-secondary">
        <div className="h-full w-full origin-left animate-[splashbar_2s_ease-out_forwards] bg-brand" />
      </div>
      <style>{`@keyframes splashbar { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
    </div>
  );
}
