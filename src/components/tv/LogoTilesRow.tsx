import type { Channel } from "@/lib/channel-types";
import { ChannelLogo } from "./ChannelLogo";

type Props = {
  title: string;
  items: Channel[];
  onOpen: (c: Channel) => void;
};

/** Gold-ringed rounded-square logo tiles, wrapped in a dense grid. */
export function LogoTilesRow({ title, items, onOpen }: Props) {
  if (items.length === 0) return null;
  return (
    <section className="mb-9 px-5 md:px-12">
      <h2 className="mb-3.5 text-base font-semibold text-foreground md:text-lg">{title}</h2>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 md:gap-4">
        {items.slice(0, 20).map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => onOpen(c)}
            aria-label={`Play ${c.name}`}
            className="group flex min-w-0 flex-col items-center gap-1.5"
          >
            <span className="tile-surface relative grid aspect-square w-full place-items-center overflow-hidden rounded-2xl ring-1 ring-gold/35 transition group-hover:ring-2 group-hover:ring-gold/80">
              <ChannelLogo
                channel={c}
                alt={`${c.name} logo`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-contain p-4"
                skeletonClassName="absolute inset-0 logo-skeleton"
                placeholderClassName="absolute inset-0 grid place-items-center font-display text-base font-bold text-muted-foreground"
              />
            </span>
            <span className="w-full truncate text-center text-[11px] text-muted-foreground">
              {c.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
