import { Play } from "lucide-react";
import type { Channel } from "@/lib/channel-types";
import { ChannelLogo } from "./ChannelLogo";

type Props = {
  featured: Channel | null;
  spotlight: Channel[];
  onPlay: (c: Channel) => void;
  total: number;
};

/** Editorial hero: copy block on the left, two spotlight tiles on the right. */
export function FeaturedHero({ featured, spotlight, onPlay, total }: Props) {
  return (
    <section className="bg-stage px-5 pb-8 pt-6 md:px-12 md:pb-10 md:pt-8">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:items-center">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-primary">
            Exclusive
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-[1.05] text-foreground md:text-5xl">
            {featured ? featured.name : "Your channel lineup starts here"}
          </h1>
          <p className="mt-3 max-w-md text-xs leading-relaxed text-muted-foreground md:text-sm">
            {featured
              ? `A curated live feed, hand-picked for Opencast. ${total.toLocaleString()} curated ${
                  total === 1 ? "channel" : "channels"
                } available right now.`
              : "No channels have been published yet. An admin adds them from the console and they appear here instantly."}
          </p>
          {featured ? (
            <button
              type="button"
              onClick={() => onPlay(featured)}
              className="tap mt-5 inline-flex items-center gap-2 rounded-full border border-gold/60 bg-gold/12 px-6 py-2.5 text-xs font-semibold text-gold transition hover:bg-gold/20 md:text-sm"
            >
              <Play className="h-4 w-4 fill-current" /> Watch Featured Now
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {spotlight.slice(0, 2).map((c, i) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => onPlay(c)}
              aria-label={`Play ${c.name}`}
              className={`tap group relative overflow-hidden rounded-2xl ring-1 ring-gold/30 transition hover:ring-2 hover:ring-gold/70 ${
                i === 0 ? "aspect-[3/4]" : "aspect-[3/4] md:aspect-[16/11] md:self-stretch"
              } tile-surface`}
            >
              <ChannelLogo
                channel={c}
                loading="eager"
                className="absolute inset-0 h-full w-full object-contain p-8 transition-transform duration-500 group-hover:scale-[1.04]"
                skeletonClassName="absolute inset-0 logo-skeleton"
                placeholderClassName="absolute inset-0 grid place-items-center font-display text-3xl font-bold text-muted-foreground"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent px-3 pb-2.5 pt-8 text-right">
                <span className="block text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
                  Now playing
                </span>
                <span className="block truncate text-xs font-semibold text-foreground md:text-sm">
                  {c.name}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
