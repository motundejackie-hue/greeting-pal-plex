import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import type { Channel } from "@/lib/channel-types";
import { countryFlag, initials } from "@/lib/channel-types";
import hero2 from "@/assets/hero/hero-2.png.asset.json";
import hero3 from "@/assets/hero/hero-3.png.asset.json";
import hero4 from "@/assets/hero/hero-4.png.asset.json";
import hero5 from "@/assets/hero/hero-5.png.asset.json";
import hero6 from "@/assets/hero/hero-6.png.asset.json";

const SLIDES = [
  { image: hero2.url, tagline: "All TVs, free" },
  { image: hero3.url, tagline: "Watch anywhere" },
  { image: hero4.url, tagline: "Live sports" },
  { image: hero5.url, tagline: "Family and shows" },
  { image: hero6.url, tagline: "For the kids" },
];

type Props = {
  featured: Channel[];
  onPlay: (c: Channel) => void;
  totalChannels: number;
};

export function HeroCarousel({ featured, onPlay, totalChannels }: Props) {
  const [index, setIndex] = useState(0);
  const pool = featured.length ? featured.slice(0, 5) : [];

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  const slide = SLIDES[index % SLIDES.length];
  const channel = pool[index % Math.max(pool.length, 1)] ?? null;

  return (
    <section className="relative mx-3 mb-6 overflow-hidden rounded-2xl border border-border/60 md:mx-8">
      <div className="relative h-[260px] w-full md:h-[420px]">
        {SLIDES.map((s, i) => (
          <img
            key={s.image}
            src={s.image}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] ease-in-out ${
              i === index ? "opacity-100 scale-105" : "opacity-0 scale-100"
            }`}
          />
        ))}
        {/* Corporate black overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

        <div className="absolute inset-0 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 p-5 md:items-center md:p-10">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
              Featured now
            </p>
            <h1 className="mt-2 truncate font-display text-2xl font-bold text-white md:text-5xl">
              {channel?.name ?? "Opencast"}
            </h1>
            <p className="mt-2 text-xs text-white/70 md:text-sm">
              {channel ? `${countryFlag(channel.country)} ${channel.categories.slice(0, 3).join(" · ") || "live"} · ` : ""}
              {slide.tagline} · {totalChannels.toLocaleString()} channels
            </p>
            {channel ? (
              <button
                type="button"
                onClick={() => onPlay(channel)}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-ember transition hover:brightness-110 md:text-sm"
              >
                <Play className="h-3.5 w-3.5 fill-current" /> Watch now
              </button>
            ) : null}
          </div>
          {channel ? (
            <div className="hidden h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-black/70 ring-1 ring-primary/40 md:grid md:h-32 md:w-32">
              {channel.logo ? (
                <img
                  src={channel.logo}
                  alt={`${channel.name} logo`}
                  className="h-full w-full object-contain p-3"
                />
              ) : (
                <span className="font-display text-2xl font-bold text-white">{initials(channel.name)}</span>
              )}
            </div>
          ) : null}
        </div>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-primary" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
