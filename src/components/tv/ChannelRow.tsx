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
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="mb-7">
      <div className="mb-2 flex items-center justify-between gap-3 px-4 md:px-8">
        <h2 className="truncate text-sm font-semibold text-foreground md:text-base">{title}</h2>
        <div className="hidden gap-1 md:flex">
          <button
            type="button"
            aria-label={`Scroll ${title} left`}
            onClick={() => nudge(-1)}
            className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-foreground hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`Scroll ${title} right`}
            onClick={() => nudge(1)}
            className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-foreground hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={scroller}
        className="no-scrollbar flex snap-x gap-2.5 overflow-x-auto scroll-smooth px-4 pb-1 md:gap-3 md:px-8"
      >
        {items.map((c) => (
          <div
            key={`${c.slug}-${c.streamUrl}`}
            className="w-[104px] shrink-0 snap-start sm:w-[140px] md:w-[190px]"
          >
            <ChannelCard
              channel={c}
              onOpen={onOpen}
              onDelete={onDelete}
              onFavorite={onFavorite}
              isFavorite={favorites?.includes(c.slug)}
              size="sm"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
