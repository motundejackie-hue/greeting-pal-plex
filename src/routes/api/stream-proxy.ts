import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stream-proxy")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const target = url.searchParams.get("url");
        if (!target || !/^https?:\/\//.test(target)) {
          return new Response("Missing stream URL", { status: 400 });
        }

        try {
          const upstream = await fetch(target, {
            headers: {
              "User-Agent": "Mozilla/5.0",
              Accept: "application/vnd.apple.mpegurl, application/x-mpegURL, */*",
            },
            signal: AbortSignal.timeout(15000),
          });

          if (!upstream.ok || !upstream.body) {
            return new Response("Unable to fetch stream", { status: upstream.status || 502 });
          }

          const type =
            upstream.headers.get("content-type") ?? "application/vnd.apple.mpegurl";

          // Playlists get rewritten so every segment/variant also flows through the proxy.
          if (/mpegurl|m3u/i.test(type) || target.includes(".m3u8")) {
            const text = await upstream.text();
            const base = new URL(target);
            const rewritten = text
              .split(/\r?\n/)
              .map((line) => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith("#")) return line;
                const abs = new URL(trimmed, base).toString();
                return `/api/stream-proxy?url=${encodeURIComponent(abs)}`;
              })
              .join("\n");
            return new Response(rewritten, {
              headers: {
                "content-type": type,
                "cache-control": "no-store",
                "access-control-allow-origin": "*",
              },
            });
          }

          return new Response(upstream.body, {
            headers: {
              "content-type": type,
              "cache-control": "no-store",
              "access-control-allow-origin": "*",
            },
          });
        } catch {
          return new Response("Stream proxy failed", { status: 502 });
        }
      },
    },
  },
});
