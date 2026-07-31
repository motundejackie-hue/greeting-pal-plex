import { useEffect, useState, useSyncExternalStore } from "react";
import type { Channel } from "@/lib/channel-types";
import { initials } from "@/lib/channel-types";
import { getChannelLogoCandidates } from "@/lib/channel-logos";
import {
  getLogoOverridesSnapshot,
  loadLogoOverrides,
  subscribeLogoOverrides,
} from "@/lib/logo-overrides";

type Props = {
  channel: Channel;
  alt?: string;
  className?: string;
  placeholderClassName?: string;
  loading?: "lazy" | "eager";
  /** Skeleton shown while the artwork decodes. Needs a positioned parent. */
  skeletonClassName?: string;
};

const EMPTY: Record<string, string> = {};

function useOverride(slug: string) {
  const map = useSyncExternalStore(
    subscribeLogoOverrides,
    getLogoOverridesSnapshot,
    () => EMPTY,
  );
  useEffect(() => {
    void loadLogoOverrides();
  }, []);
  return map[slug];
}

export function ChannelLogo({
  channel,
  alt,
  className,
  placeholderClassName,
  loading = "lazy",
  skeletonClassName,
}: Props) {
  const override = useOverride(channel.slug);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  const candidates = override
    ? [override, ...getChannelLogoCandidates(channel).filter((c) => c !== override)]
    : getChannelLogoCandidates(channel);

  useEffect(() => {
    setIndex(0);
    setFailed(false);
    setReady(false);
  }, [channel.slug, channel.logo, override]);

  const src = candidates[index];

  if (!src || failed) {
    return <span className={placeholderClassName ?? className}>{initials(channel.name)}</span>;
  }

  return (
    <>
      {!ready && skeletonClassName ? (
        <span aria-hidden="true" className={skeletonClassName} />
      ) : null}
      <img
        ref={(el) => {
          // Cached images can finish before React attaches onLoad.
          if (el?.complete && el.naturalWidth > 0) setReady(true);
        }}
        src={src}
        alt={alt ?? `${channel.name} logo`}
        loading={loading}
        decoding="async"
        className={`${className ?? ""} ${ready ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setReady(true)}
        onError={() => {
          const next = index + 1;
          if (next < candidates.length) {
            setIndex(next);
          } else {
            setFailed(true);
          }
        }}
      />
    </>
  );
}
