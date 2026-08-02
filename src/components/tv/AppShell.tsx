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
import { ServerPicker } from "@/components/tv/ServerPicker";
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

/** Google-TV style pill tabs. */
const TABS = [
  { label: "For you", to: "/", search: undefined as Record<string, string> | undefined },
  { label: "Movies", to: "/browse", search: { category: "movies" } },
  { label: "Shows", to: "/browse", search: { category: "series" } },
  { label: "Apps", to: "/browse", search: { category: "general" } },
  { label: "Library", to: "/favorites", search: undefined },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useRouterState({ select: (s) => s.location });
  const path = location.pathname;
  const activeCategory = (location.search as { category?: string } | undefined)?.category;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    void navigate({ to: "/browse", search: { q: query } });
    setSearchOpen(false);
    setOpen(false);
  };

  const tabActive = (tab: (typeof TABS)[number]) =>
    tab.search?.category ? activeCategory === tab.search.category : path === tab.to && !activeCategory;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 bg-background/90 px-3 py-2.5 backdrop-blur md:px-6">
        {/* Left: hamburger + logo */}
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground transition hover:bg-muted"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img src={appIcon} alt="Opencast" className="h-8 w-8 shrink-0 rounded-full" />
            <span className="hidden font-display text-base font-bold text-foreground sm:inline">
              Opencast
            </span>
          </Link>
          <ServerPicker />
        </div>


        {/* Center: pill tabs */}
        <nav aria-label="Sections" className="no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <Link
              key={tab.label}
              to={tab.to}
              search={tab.search as never}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition md:text-sm ${
                tabActive(tab)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* Right: search, settings, compact sign-in */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            aria-label="Search channels"
            onClick={() => setSearchOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </button>
          <Link
            to="/settings"
            aria-label="Settings"
            className="hidden h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground sm:grid"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <Link
            to="/auth"
            aria-label={user ? "Account" : "Sign in"}
            title={user ? "Account" : "Sign in"}
            className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-ember transition hover:brightness-110"
          >
            {user ? <User className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
          </Link>
        </div>
      </header>

      {searchOpen ? (
        <form onSubmit={submit} className="px-3 pb-2 md:px-6">
          <label className="flex min-w-0 items-center gap-2 rounded-full bg-secondary px-4 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search channels…"
              aria-label="Search channels"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
        </form>
      ) : null}

      {/* Slide-in menu */}
      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col gap-1 overflow-y-auto bg-card p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={appIcon} alt="" className="h-8 w-8 rounded-full" />
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
              const active = item.search?.category
                ? activeCategory === item.search.category
                : path === item.to && !activeCategory;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  search={item.search as never}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-brand text-primary-foreground shadow-ember"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" /> {item.label}
                </Link>
              );
            })}
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {user ? <User className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {user ? "Account" : "Sign in"}
            </Link>
          </div>
        </div>
      ) : null}

      <main>{children}</main>
    </div>
  );
}
