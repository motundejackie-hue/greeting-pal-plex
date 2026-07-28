import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Baby,
  Clapperboard,
  Film,
  FlaskConical,
  Gamepad2,
  GraduationCap,
  Heart,
  Home,
  LogIn,
  Menu,
  Newspaper,
  Search,
  Settings,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import appIcon from "/app-icon.png?url";

const NAV = [
  { icon: Home, label: "Home", to: "/", search: undefined as Record<string, string> | undefined },
  { icon: Heart, label: "Favorites", to: "/favorites", search: undefined },
  { icon: Newspaper, label: "News", to: "/browse", search: { category: "news" } },
  { icon: Trophy, label: "Sports", to: "/browse", search: { category: "sports" } },
  { icon: Gamepad2, label: "Games", to: "/browse", search: { category: "games" } },
  { icon: Baby, label: "Kids", to: "/browse", search: { category: "kids" } },
  { icon: Clapperboard, label: "Shows", to: "/browse", search: { category: "series" } },
  { icon: Users, label: "Family", to: "/browse", search: { category: "family" } },
  { icon: Film, label: "Movies", to: "/browse", search: { category: "movies" } },
  { icon: Search, label: "Documentary", to: "/browse", search: { category: "documentary" } },
  { icon: GraduationCap, label: "Tutorials", to: "/tutorials", search: undefined },
  { icon: FlaskConical, label: "Test", to: "/test", search: undefined },
  { icon: Settings, label: "Settings", to: "/settings", search: undefined },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    void navigate({ to: "/browse", search: { q: query } });
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar — wider, with visible labels */}
      <nav
        aria-label="Main"
        className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col gap-0.5 border-r border-border/40 bg-card/70 px-3 py-4 backdrop-blur md:flex"
      >
        <Link to="/" className="mb-4 flex items-center gap-2.5 px-2">
          <img src={appIcon} alt="Opencast" className="h-9 w-9 rounded-xl shadow-ember" />
          <span className="font-display text-lg font-bold text-foreground">Opencast</span>
        </Link>
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = path === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              search={item.search as never}
              title={item.label}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-brand text-primary-foreground shadow-ember"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
        <Link
          to="/auth"
          className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          {user ? <User className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
          <span className="truncate">{user ? "Account" : "Sign in"}</span>
        </Link>
      </nav>

      {/* Top bar */}
      <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 bg-background/85 px-3 py-2 backdrop-blur md:pl-[15rem] md:pr-6">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-foreground md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <form onSubmit={submit} className="min-w-0">
          <label className="flex min-w-0 items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search channels…"
              aria-label="Search channels"
              className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
        </form>
        <Link
          to="/auth"
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-ember hover:brightness-110"
        >
          {user ? <User className="h-3 w-3" /> : <LogIn className="h-3 w-3" />}
          <span className="hidden sm:inline">{user ? "Account" : "Sign in"}</span>
        </Link>
      </header>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col gap-1 bg-card p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={appIcon} alt="" className="h-8 w-8 rounded-lg" />
                <span className="font-display text-lg font-bold text-foreground">Opencast</span>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  search={item.search as never}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-secondary"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" /> {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <main className="md:pl-56">{children}</main>
    </div>
  );
}
