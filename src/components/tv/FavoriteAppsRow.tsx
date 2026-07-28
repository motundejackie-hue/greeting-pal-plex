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
    <section className="mb-10">
      <h2 className="mb-4 px-5 text-base font-semibold text-foreground md:px-12 md:text-xl">
        {title}
      </h2>
      <div className="no-scrollbar flex gap-5 overflow-x-auto px-5 pb-2 md:gap-7 md:px-12">
        {items.slice(0, 10).map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => onOpen(c)}
            aria-label={`Play ${c.name}`}
            className="group flex w-20 shrink-0 flex-col items-center gap-2 md:w-24"
          >
            <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-card ring-1 ring-border transition group-hover:ring-2 group-hover:ring-primary md:h-24 md:w-24">
              <ChannelLogo
                channel={c}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-contain p-4"
                placeholderClassName="grid h-full w-full place-items-center text-lg font-bold text-foreground"
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
