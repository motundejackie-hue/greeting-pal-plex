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

        const origin = new URL(target).origin;
        const attempt = (extra: Record<string, string>) =>
          fetch(target, {
            redirect: "follow",
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
              Accept: "application/vnd.apple.mpegurl, application/x-mpegURL, */*",
              ...extra,
            },
            signal: AbortSignal.timeout(15000),
          });

        try {
          let upstream: Response | null = null;
          try {
            upstream = await attempt({});
          } catch {
            upstream = null;
          }
          // Some hosts only answer when a same-origin Referer is present.
          if (!upstream || !upstream.ok) {
            try {
              upstream = await attempt({ Referer: `${origin}/`, Origin: origin });
            } catch {
              /* keep the first result */
            }
          }

          if (!upstream || !upstream.ok || !upstream.body) {
            // 4xx (not 5xx) so the player just moves to the next candidate
            // instead of this surfacing as an app-level server error.
            return new Response("Upstream stream unavailable", {
              status: 404,
              headers: { "access-control-allow-origin": "*" },
            });
          }


          const type =
            upstream.headers.get("content-type") ?? "application/vnd.apple.mpegurl";

          // Playlists get rewritten so every segment/variant also flows through the proxy.
          if (/mpegurl|m3u/i.test(type) || target.includes(".m3u8")) {
            const text = await upstream.text();
            const base = new URL(upstream.url || target);
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
