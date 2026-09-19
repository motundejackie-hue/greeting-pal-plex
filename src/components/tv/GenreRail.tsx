import { Link, useRouterState } from "@tanstack/react-router";

export const GENRES = [
  { id: undefined as string | undefined, label: "Trending" },
  { id: "movies", label: "Movies" },
  { id: "series", label: "TV" },
  { id: "animation", label: "Anime" },
  { id: "documentary", label: "Docs" },
  { id: "news", label: "News" },
  { id: "sports", label: "Sports" },
  { id: "kids", label: "Kids" },
  { id: "music", label: "Music" },
  { id: "lifestyle", label: "Lifestyle" },
];

/** Compact pill rail sitting directly under the cinematic feature. */
export function GenreRail() {
  const active = useRouterState({
    select: (s) => (s.location.search as { category?: string } | undefined)?.category,
  });

  return (
    <nav
      aria-label="Genres"
      className="no-scrollbar mb-8 flex gap-2 overflow-x-auto border-y border-border/60 bg-card/35 px-5 py-3 md:px-12"
    >
      {GENRES.map((g) => {
        const on = g.id ? active === g.id : !active;
        return (
          <Link
            key={g.label}
            to="/browse"
            search={g.id ? { category: g.id } : {}}
            className={`tap shrink-0 rounded-md px-4 py-1.5 text-[11px] font-medium transition ${
              on
                ? "bg-brand text-primary-foreground shadow-ember"
                : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {g.label}
          </Link>
        );
      })}
    </nav>
  );
}
