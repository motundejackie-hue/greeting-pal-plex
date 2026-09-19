import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Info, Play } from "lucide-react";
import type { Channel } from "@/lib/channel-types";
import { ChannelLogo } from "./ChannelLogo";
import { getChannelArt } from "@/lib/channel-art";

type Props = {
  featured: Channel[];
  onPlay: (c: Channel) => void;
  totalChannels: number;
};

/** Full-width cinematic feature that rotates through the night's headline channels. */
export function HeroCarousel({ featured, onPlay, totalChannels }: Props) {
  const [index, setIndex] = useState(0);
  const slides = featured
    .filter((c, i, arr) => arr.findIndex((x) => x.slug === c.slug) === i)
    .slice(0, 5);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 8000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const channel = slides[Math.min(index, slides.length - 1)];

  return (
    <section className="relative mb-6 h-[48vh] min-h-[340px] w-full overflow-hidden border-b border-border md:h-[52vh] md:max-h-[500px]">
      {slides.map((c, i) => (
        <img
          key={c.slug}
          src={getChannelArt(c)}
          alt=""
          aria-hidden="true"
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-out ${
            i === index ? "scale-100 opacity-100" : "scale-105 opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-[linear-gradient(0deg,var(--background)_2%,color-mix(in_oklab,var(--background)_55%,transparent)_45%,transparent_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,color-mix(in_oklab,var(--background)_70%,transparent)_42%,transparent_82%)]" />

      <div className="relative flex h-full max-w-3xl flex-col justify-end gap-4 px-5 pb-14 md:justify-center md:px-12 md:pb-20">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-24 shrink-0 place-items-center overflow-hidden rounded-md bg-card/70 ring-1 ring-border/60 backdrop-blur">
            <ChannelLogo
              channel={channel}
              loading="eager"
              className="h-full w-full object-contain p-2"
              placeholderClassName="font-display text-lg text-foreground"
            />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
            Opencast selection · {String(index + 1).padStart(2, "0")}
          </p>
        </div>

        <h1 className="font-display text-4xl font-semibold leading-[1.05] text-foreground md:text-6xl">
          {channel.name}
        </h1>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <span className="rounded-sm bg-secondary/80 px-2 py-0.5 text-primary">Live</span>
          <span>{(channel.categories[0] ?? "Television").replace(/^\w/, (m) => m.toUpperCase())}</span>
          {channel.country ? <span>{channel.country}</span> : null}
          <span>{channel.quality ?? "HD"}</span>
        </div>

        <p className="max-w-lg text-xs leading-6 text-secondary-foreground md:text-sm">
          Streaming now from {channel.name}, one of {totalChannels.toLocaleString()} free live
          channels with automatic source recovery.
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onPlay(channel)}
            className="tap inline-flex items-center gap-2 rounded-sm bg-brand px-7 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-ember"
          >
            <Play className="h-4 w-4 fill-current" /> Watch
          </button>
          <Link
            to="/channel/$channelSlug"
            params={{ channelSlug: channel.slug }}
            className="tap inline-flex items-center gap-2 rounded-sm bg-secondary/80 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground backdrop-blur transition hover:bg-secondary"
          >
            <Info className="h-4 w-4" /> Info
          </Link>
        </div>

        <div className="mt-4 flex gap-1.5">
          {slides.map((c, i) => (
            <button
              key={c.slug}
              type="button"
              aria-label={`Show ${c.name}`}
              onClick={() => setIndex(i)}
              className={`h-[3px] w-9 rounded-full transition ${i === index ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
