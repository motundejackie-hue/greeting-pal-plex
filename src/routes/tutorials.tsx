import { createFileRoute } from "@tanstack/react-router";
import { Keyboard, Monitor, Smartphone, Tv, Wifi } from "lucide-react";
import { AppShell } from "@/components/tv/AppShell";

export const Route = createFileRoute("/tutorials")({
  component: TutorialsPage,
  head: () => ({
    meta: [
      { title: "Tutorials & Shortcuts — Opencast" },
      {
        name: "description",
        content:
          "Learn every Opencast shortcut and gesture: desktop keyboard controls, phone gestures, offline mode, installing the app and fixing streams.",
      },
      { property: "og:title", content: "Tutorials & Shortcuts — Opencast" },
      { property: "og:description", content: "Desktop keyboard shortcuts, phone gestures and offline tips for Opencast." },
    ],
    links: [{ rel: "canonical", href: "https://opencasttv.lovable.app/tutorials" }],
  }),
});

const DESKTOP = [
  { keys: "/", what: "Focus the search box" },
  { keys: "Enter", what: "Run the search and open Browse" },
  { keys: "F", what: "Toggle fullscreen in the player" },
  { keys: "M", what: "Mute or unmute" },
  { keys: "Space", what: "Pause / resume the stream" },
  { keys: "Esc", what: "Close the player and go back" },
  { keys: "← / →", what: "Scroll a channel row (with row focused)" },
  { keys: "Shift + D", what: "Delete the channel you're watching" },
];

const PHONE = [
  { keys: "Tap card", what: "Open the compact player" },
  { keys: "Fullscreen button", what: "Goes fullscreen and rotates to landscape" },
  { keys: "Swipe down on player", what: "Close the player sheet" },
  { keys: "Menu icon", what: "Open the category drawer" },
  { keys: "Long-press card", what: "Reveal favorite and delete actions" },
];

const GUIDES = [
  {
    icon: Tv,
    title: "Watching a channel",
    steps: [
      "Pick any tile — the compact player opens over the page.",
      "Opencast tries the direct stream, then the app proxy, then a CORS proxy automatically.",
      "If a channel never loads, delete it from the player footer; it stays gone on every device.",
    ],
  },
  {
    icon: Smartphone,
    title: "Install on your phone",
    steps: [
      "Open Opencast in Chrome or Safari.",
      "Tap the browser menu, then Add to Home Screen / Install app.",
      "Launch from the icon for a fullscreen, app-like experience.",
    ],
  },
  {
    icon: Wifi,
    title: "Offline mode",
    steps: [
      "Your channel list and logos are cached after the first visit.",
      "Without a network you can still browse, search cached lists and see every logo.",
      "Live video itself always needs a connection — playback resumes when you're back online.",
    ],
  },
  {
    icon: Monitor,
    title: "Adding your own channels",
    steps: [
      "Open the Test page from the sidebar.",
      "Paste an HLS (.m3u8) link and press Test to preview it.",
      "If it plays, press Add to library — it appears for everyone.",
      "Use Add logo to attach the official artwork to any channel.",
    ],
  },
];

function TutorialsPage() {
  return (
    <AppShell>
      <div className="px-4 pb-12 md:px-8">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
            Tutorials &amp; shortcuts
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Everything you need to drive Opencast on desktop, TV and phone.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-md border border-border bg-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Keyboard className="h-4 w-4 text-primary" /> Desktop &amp; TV shortcuts
            </h2>
            <ul className="space-y-2">
              {DESKTOP.map((s) => (
                <li key={s.keys} className="flex items-center justify-between gap-3 text-xs">
                  <kbd className="shrink-0 rounded-md bg-secondary px-2 py-1 font-mono text-[10px] text-foreground">
                    {s.keys}
                  </kbd>
                  <span className="min-w-0 flex-1 text-right text-muted-foreground">{s.what}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-md border border-border bg-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Smartphone className="h-4 w-4 text-primary" /> Phone gestures
            </h2>
            <ul className="space-y-2">
              {PHONE.map((s) => (
                <li key={s.keys} className="flex items-center justify-between gap-3 text-xs">
                  <span className="shrink-0 rounded-md bg-secondary px-2 py-1 text-[10px] text-foreground">
                    {s.keys}
                  </span>
                  <span className="min-w-0 flex-1 text-right text-muted-foreground">{s.what}</span>
                </li>
              ))}
            </ul>
          </section>

          {GUIDES.map((g) => {
            const Icon = g.icon;
            return (
              <section key={g.title} className="rounded-md border border-border bg-card p-4">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Icon className="h-4 w-4 text-primary" /> {g.title}
                </h2>
                <ol className="space-y-2">
                  {g.steps.map((step, i) => (
                    <li key={step} className="flex gap-2 text-xs text-muted-foreground">
                      <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brand text-[9px] font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
