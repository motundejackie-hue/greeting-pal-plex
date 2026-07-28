import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Play, Plus } from "lucide-react";
import type { Channel } from "@/lib/channel-types";
import news from "@/assets/hero/cat-news.jpg.asset.json";
import sports from "@/assets/hero/cat-sports.jpg.asset.json";
import movies from "@/assets/hero/cat-movies.jpg.asset.json";
import kids from "@/assets/hero/cat-kids.jpg.asset.json";
import entertainment from "@/assets/hero/cat-entertainment.jpg.asset.json";

/** Category-driven hero: each slide is a genre, not a single station. */
const SLIDES = [
  {
    id: "news",
    title: "Live News",
    blurb: "Breaking coverage from the world's biggest newsrooms, streaming 24/7.",
    image: news.url,
  },
  {
    id: "sports",
    title: "Live Sports",
    blurb: "Match nights, leagues and highlights from every corner of the planet.",
    image: sports.url,
  },
  {
    id: "movies",
    title: "Movies",
    blurb: "Round-the-clock movie channels — classics, action and everything between.",
    image: movies.url,
  },
  {
    id: "kids",
    title: "Kids & Cartoons",
    blurb: "Safe, colourful, always-on channels the little ones actually ask for.",
    image: kids.url,
  },
  {
    id: "entertainment",
    title: "Music & Entertainment",
    blurb: "Concerts, shows and non-stop music television.",
    image: entertainment.url,
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
    const id = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 7000);
    return () => window.clearInterval(id);
  }, []);

  const slide = SLIDES[index];
  const channel = featured[index % Math.max(featured.length, 1)] ?? null;

  return (
    <section className="relative mb-8 h-[300px] w-full overflow-hidden md:h-[520px]">
      {SLIDES.map((s, i) => (
        <img
          key={s.id}
          src={s.image}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1088}
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />

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
            <Plus className="h-4 w-4" /> Explore {slide.title}
          </Link>
        </div>

        <div className="mt-5 flex gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={s.title}
              onClick={() => setIndex(i)}
              className={`h-1 rounded-full transition-all ${
                i === index ? "w-10 bg-primary" : "w-4 bg-foreground/25"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
