import type { Channel } from "@/lib/channel-types";
import { ChannelLogo } from "./ChannelLogo";

type Props = {
  title?: string;
  items: Channel[];
  onOpen: (c: Channel) => void;
};

/** Google-TV style circular app shelf. */
export function FavoriteAppsRow({ title = "Your apps", items, onOpen }: Props) {
  if (items.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 px-4 text-sm font-semibold text-foreground md:px-8 md:text-base">
        {title}
      </h2>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2 md:gap-4 md:px-8">
        {items.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => onOpen(c)}
            aria-label={`Play ${c.name}`}
            className="group flex w-16 shrink-0 flex-col items-center gap-1.5 md:w-20"
          >
            <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-white shadow-tv ring-1 ring-white/10 transition group-hover:-translate-y-0.5 group-hover:ring-2 group-hover:ring-primary md:h-16 md:w-16">
              <ChannelLogo
                channel={c}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-contain p-2.5"
                placeholderClassName="grid h-full w-full place-items-center text-sm font-bold text-black"
              />
            </span>
            <span className="w-full truncate text-center text-[10px] text-muted-foreground">
              {c.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
