import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import type { Channel } from "@/lib/channel-types";
import newsImg from "@/assets/hero/cat2-news.png.asset.json";
import sportsImg from "@/assets/hero/cat2-sports.png.asset.json";
import moviesImg from "@/assets/hero/cat2-movies.png.asset.json";
import natureImg from "@/assets/hero/cat2-nature.png.asset.json";
import familyImg from "@/assets/hero/cat2-family.png.asset.json";
import lifestyleImg from "@/assets/hero/cat2-lifestyle.png.asset.json";
import animeImg from "@/assets/hero/cat2-anime.jpg";
import musicImg from "@/assets/hero/cat2-music.jpg";

/** Eight category tiles — the app's featured lineup. */
const CATEGORIES = [
  {
    id: "news",
    title: "Live News",
    blurb: "Breaking coverage from the world's biggest newsrooms, streaming 24/7.",
    image: newsImg.url,
  },
  {
    id: "sports",
    title: "Live Sports",
    blurb: "Match nights, leagues and highlights from every corner of the planet.",
    image: sportsImg.url,
  },
  {
    id: "movies",
    title: "Movies",
    blurb: "Round-the-clock movie channels — classics, action and everything between.",
    image: moviesImg.url,
  },
  {
    id: "documentary",
    title: "Nature & Docs",
    blurb: "Award-winning documentaries and wildlife channels, always on.",
    image: natureImg.url,
  },
  {
    id: "animation",
    title: "Anime",
    blurb: "Series and movies from Japan's biggest studios, around the clock.",
    image: animeImg,
  },
  {
    id: "kids",
    title: "Kids & Family",
    blurb: "Safe, colourful, always-on channels the whole family can share.",
    image: familyImg.url,
  },
  {
    id: "lifestyle",
    title: "Lifestyle & Cooking",
    blurb: "Food, travel and home shows for easy everyday viewing.",
    image: lifestyleImg.url,
  },
  {
    id: "music",
    title: "Music",
    blurb: "Concerts, charts and non-stop music television.",
    image: musicImg,
  },
];

type Props = {
  featured: Channel[];
  onPlay: (c: Channel) => void;
  totalChannels: number;
};

export function HeroCarousel({ featured, onPlay, totalChannels }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % CATEGORIES.length), 7000);
    return () => window.clearInterval(id);
  }, []);

  const slide = CATEGORIES[index];
  const channel = featured[index % Math.max(featured.length, 1)] ?? null;

  return (
    <section className="mb-10">
      <div className="relative h-[300px] w-full overflow-hidden md:h-[500px]">
        {CATEGORIES.map((s, i) => (
          <img
            key={s.id}
            src={s.image}
            alt=""
            aria-hidden="true"
            width={1600}
            height={900}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out ${
              i === index ? "scale-100 opacity-100" : "scale-105 opacity-0"
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/70 to-transparent md:h-1/3" />
        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-background/75 via-background/10 to-transparent md:w-2/3" />


        <div className="absolute inset-0 flex flex-col justify-end gap-3 px-5 pb-10 md:max-w-2xl md:justify-center md:px-12 md:pb-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">
            {totalChannels.toLocaleString()} free channels
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-6xl">
            {slide.title}
          </h1>
          <p className="max-w-md text-xs text-muted-foreground md:text-base">{slide.blurb}</p>
          <div className="mt-2 flex items-center gap-2.5">
            {channel ? (
              <button
                type="button"
                onClick={() => onPlay(channel)}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-xs font-semibold text-background transition hover:opacity-90 md:text-sm"
              >
                <Play className="h-4 w-4 fill-current" /> Watch now
              </button>
            ) : null}
            <Link
              to="/browse"
              search={{ category: slide.id }}
              className="inline-flex items-center gap-2 rounded-full bg-secondary/80 px-5 py-2.5 text-xs font-semibold text-foreground backdrop-blur transition hover:bg-secondary md:text-sm"
            >
              Explore {slide.title}
            </Link>
          </div>
        </div>
      </div>

      <div className="no-scrollbar -mt-6 flex gap-3 overflow-x-auto px-5 pb-1 md:gap-4 md:px-12">
        {CATEGORIES.map((c, i) => (
          <Link
            key={c.id}
            to="/browse"
            search={{ category: c.id }}
            onMouseEnter={() => setIndex(i)}
            onFocus={() => setIndex(i)}
            className={`group relative h-[86px] w-[150px] shrink-0 overflow-hidden rounded-2xl ring-1 transition-all duration-300 md:h-[112px] md:w-[210px] ${
              i === index
                ? "scale-[1.03] ring-2 ring-primary shadow-[0_10px_30px_-12px] shadow-primary/60"
                : "ring-border/60 hover:ring-primary/70"
            }`}
          >
            <img
              src={c.image}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 truncate px-3 pb-2 text-[11px] font-semibold text-foreground md:text-sm">
              {c.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
