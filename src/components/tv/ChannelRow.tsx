import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Channel } from "@/lib/channel-types";
import { ChannelCard } from "./ChannelCard";

type Props = {
  title: string;
  items: Channel[];
  onOpen: (c: Channel) => void;
  onDelete?: (c: Channel) => void;
  onFavorite?: (c: Channel) => void;
  favorites?: string[];
};

export function ChannelRow({ title, items, onOpen, onDelete, onFavorite, favorites }: Props) {
  const scroller = useRef<HTMLDivElement | null>(null);

  const nudge = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-3 flex items-center justify-between gap-3 px-5 md:px-12">
        <h2 className="truncate text-base font-semibold text-foreground md:text-xl">{title}</h2>
        <div className="hidden gap-1.5 md:flex">
          <button
            type="button"
            aria-label={`Scroll ${title} left`}
            onClick={() => nudge(-1)}
            className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-foreground transition hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`Scroll ${title} right`}
            onClick={() => nudge(1)}
            className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-foreground transition hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={scroller}
        className="no-scrollbar flex snap-x gap-4 overflow-x-auto scroll-smooth px-5 pb-2 md:gap-5 md:px-12"
      >
        {items.slice(0, 12).map((c) => (
          <div
            key={`${c.slug}-${c.streamUrl}`}
            className="w-[220px] shrink-0 snap-start sm:w-[280px] md:w-[340px]"
          >
            <ChannelCard
              channel={c}
              onOpen={onOpen}
              onDelete={onDelete}
              onFavorite={onFavorite}
              isFavorite={favorites?.includes(c.slug)}
              size="lg"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
