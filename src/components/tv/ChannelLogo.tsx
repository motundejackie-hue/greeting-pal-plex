import { useEffect, useState } from "react";
import type { Channel } from "@/lib/channel-types";
import { initials } from "@/lib/channel-types";
import { getChannelLogoCandidates } from "@/lib/channel-logos";

type Props = {
  channel: Channel;
  alt?: string;
  className?: string;
  placeholderClassName?: string;
  loading?: "lazy" | "eager";
};

export function ChannelLogo({
  channel,
  alt,
  className,
  placeholderClassName,
  loading = "lazy",
}: Props) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const candidates = getChannelLogoCandidates(channel);

  useEffect(() => {
    setIndex(0);
    setFailed(false);
  }, [channel.slug, channel.logo]);

  const src = candidates[index];

  if (!src || failed) {
    return <span className={placeholderClassName ?? className}>{initials(channel.name)}</span>;
  }

  return (
    <img
      src={src}
      alt={alt ?? `${channel.name} logo`}
      loading={loading}
      decoding="async"
      className={className}
      onError={() => {
        const next = index + 1;
        if (next < candidates.length) {
          setIndex(next);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}
