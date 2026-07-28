import type { Channel } from "@/lib/channel-types";
import { ChannelLogo } from "./ChannelLogo";

type Props = {
  title?: string;
  items: Channel[];
  onOpen: (c: Channel) => void;
};

export function FavoriteAppsRow({ title = "Favorite Apps", items, onOpen }: Props) {
  if (items.length === 0) return null;
  return (
    <section className="mb-7">
      <h2 className="mb-2 px-4 text-sm font-semibold text-foreground md:px-8 md:text-base">
        {title}
      </h2>
      <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 pb-1 md:gap-3 md:px-8">
        {items.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => onOpen(c)}
            aria-label={`Play ${c.name}`}
            className="group grid h-14 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-tv ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:ring-primary/60 md:h-16 md:w-32"
          >
            <ChannelLogo
              channel={c}
              alt={c.name}
              loading="lazy"
              className="h-full w-full object-contain p-2.5"
              placeholderClassName="grid h-full w-full place-items-center text-sm font-bold text-black"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
