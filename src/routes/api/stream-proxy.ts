import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stream-proxy")({
  component: () => null,
});

export async function serverLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const target = url.searchParams.get("url");

  if (!target) {
    return new Response("Missing stream URL", { status: 400 });
  }

  try {
    const response = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/vnd.apple.mpegurl, application/x-mpegURL, */*",
      },
    });

    if (!response.ok) {
      return new Response("Unable to fetch stream", { status: response.status });
    }

    const body = await response.text();
    return new Response(body, {
      status: 200,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/vnd.apple.mpegurl",
        "cache-control": "no-store",
      },
    });
  } catch {
    return new Response("Stream proxy failed", { status: 502 });
  }
}
