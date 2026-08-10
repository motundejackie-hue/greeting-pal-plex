import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Channel } from "@/lib/channel-types";
import { ChannelCard } from "./ChannelCard";

type Props = {
  title: string;
  subtitle?: string;
  items: Channel[];
  onOpen: (c: Channel) => void;
  onFavorite?: (c: Channel) => void;
  favorites?: string[];
};

export function ChannelRow({ title, subtitle, items, onOpen, onFavorite, favorites }: Props) {
  const scroller = useRef<HTMLDivElement | null>(null);

  const nudge = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 px-5 md:px-12">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-foreground md:text-xl">{title}</h2>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {items.length} channels
          </span>
          <div className="hidden gap-1.5 md:flex">
            <button
              type="button"
              aria-label={`Scroll ${title} left`}
              onClick={() => nudge(-1)}
              className="tap grid h-8 w-8 place-items-center rounded-full bg-secondary text-foreground transition hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={`Scroll ${title} right`}
              onClick={() => nudge(1)}
              className="tap grid h-8 w-8 place-items-center rounded-full bg-secondary text-foreground transition hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={scroller}
        className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth px-5 pb-2 md:gap-5 md:scroll-pl-12 md:px-12"
      >
        {items.slice(0, 24).map((c) => (
          <div
            key={`${c.slug}-${c.streamUrl}`}
            className="w-[210px] shrink-0 sm:w-[250px] md:w-[290px]"
          >
            <ChannelCard
              channel={c}
              onOpen={onOpen}
              onFavorite={onFavorite}
              isFavorite={favorites?.includes(c.slug)}
              size="md"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
