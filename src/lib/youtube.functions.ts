import { createServerFn } from "@tanstack/react-start";

type YouTubeSearchItem = {
  id: { videoId?: string; kind?: string };
  snippet: { title: string; channelTitle: string };
};

type YouTubeSearchResponse = {
  items?: YouTubeSearchItem[];
};

/**
 * Search YouTube for a live broadcast (or best match) for a given channel name.
 * Returns the first video ID or null.
 */
export const searchYouTubeLive = createServerFn({ method: "GET" })
  .inputValidator((data: { query: string }) => {
    const q = String(data?.query ?? "").slice(0, 120);
    if (!q) throw new Error("query required");
    return { query: q };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return { videoId: null as string | null, title: null as string | null };

    // Try a live search first, then fall back to a regular search.
    const attempts: string[] = [
      `https://www.googleapis.com/youtube/v3/search?part=snippet&eventType=live&type=video&maxResults=1&q=${encodeURIComponent(
        data.query,
      )}&key=${apiKey}`,
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(
        data.query,
      )}&key=${apiKey}`,
    ];

    for (const url of attempts) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const payload = (await res.json()) as YouTubeSearchResponse;
        const item = payload.items?.[0];
        const videoId = item?.id?.videoId;
        if (videoId) {
          return { videoId, title: item?.snippet?.title ?? null };
        }
      } catch {
        // continue to next attempt
      }
    }

    return { videoId: null as string | null, title: null as string | null };
  });
