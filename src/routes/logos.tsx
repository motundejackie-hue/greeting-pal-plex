import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus, Loader2, Search } from "lucide-react";
import { AppShell } from "@/components/tv/AppShell";
import { listAllNames } from "@/lib/iptv.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/logos")({
  component: LogoManagerPage,
  head: () => ({
    meta: [
      { title: "Logo Manager — Opencast" },
      {
        name: "description",
        content:
          "Search any Opencast channel and drag and drop a new logo image or paste a logo URL to update its artwork.",
      },
      { property: "og:title", content: "Logo Manager — Opencast" },
      {
        property: "og:description",
        content: "Drag and drop new channel artwork to keep every Opencast station looking sharp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Target = { slug: string; name: string; logo: string | null };

/** Pull an image URL out of a browser drag payload (e.g. Google Images). */
function urlFromDrop(dt: DataTransfer): string | null {
  const uri = dt.getData("text/uri-list") || dt.getData("text/plain");
  if (uri && /^https?:\/\//i.test(uri.trim())) return uri.trim();
  const html = dt.getData("text/html");
  const m = html?.match(/<img[^>]+src="([^"]+)"/i);
  return m?.[1] ?? null;
}

function LogoManagerPage() {
  const { user } = useAuth();
  const [term, setTerm] = useState("");
  const [target, setTarget] = useState<Target | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  const results = useQuery({
    queryKey: ["logo-search", term],
    queryFn: () => listAllNames({ data: { q: term } }),
    staleTime: 5 * 60 * 1000,
  });

  const list = useMemo(() => results.data ?? [], [results.data]);

  const saveLogo = async (logoUrl: string) => {
    if (!target) return;
    if (!user) {
      setNote("Sign in first to update logos.");
      return;
    }
    setBusy(true);
    try {
      const { data: existing } = await supabase
        .from("tv_logos")
        .select("id")
        .eq("channel_slug", target.slug)
        .limit(1);
      if (existing && existing.length > 0) {
        await supabase
          .from("tv_logos")
          .update({ logo_url: logoUrl, name: target.name, source: "manual" })
          .eq("id", existing[0].id);
      } else {
        await supabase.from("tv_logos").insert({
          channel_slug: target.slug,
          name: target.name,
          logo_url: logoUrl,
          source: "manual",
        });
      }
      setPreview(logoUrl);
      setNote(`Logo updated for ${target.name}.`);
    } catch {
      setNote("Couldn't save that logo. Try another image.");
    } finally {
      setBusy(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (!target) return;
    if (!user) {
      setNote("Sign in first to update logos.");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${target.slug}-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("channel-logos").upload(path, file, { upsert: true });
      if (up.error) throw up.error;
      const signed = await supabase.storage
        .from("channel-logos")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (!signed.data?.signedUrl) throw new Error("no url");
      await saveLogo(signed.data.signedUrl);
    } catch {
      setNote("Upload failed. Try dragging the image from search instead.");
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 md:px-8">
        <header className="mb-5">
          <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            Logo manager
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Search a channel, then drag an image straight from Google Images (or upload a file) to
            replace its logo everywhere in the app.
          </p>
        </header>

        {note ? <p className="mb-4 rounded-xl bg-brand-soft px-3 py-2 text-xs">{note}</p> : null}

        <div className="mb-4 flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search channels…"
            aria-label="Search channels"
            className="w-full bg-transparent text-xs text-foreground outline-none"
          />
          {results.isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        </div>

        <div className="mb-6 grid gap-2 sm:grid-cols-2">
          {list.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => {
                setTarget(c);
                setPreview(c.logo);
                setNote(null);
              }}
              className={`flex items-center gap-3 rounded-xl bg-card p-2.5 text-left ring-1 transition ${
                target?.slug === c.slug ? "ring-2 ring-primary" : "ring-border/60 hover:ring-primary/60"
              }`}
            >
              <span className="grid h-10 w-14 shrink-0 place-items-center overflow-hidden rounded-md bg-secondary">
                {c.logo ? (
                  <img src={c.logo} alt="" className="h-full w-full object-contain p-1" />
                ) : (
                  <span className="text-[10px] font-bold">{c.name.slice(0, 2)}</span>
                )}
              </span>
              <span className="truncate text-xs font-medium text-foreground">{c.name}</span>
            </button>
          ))}
        </div>

        {target ? (
          <section
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith("image/")) {
                void uploadFile(file);
                return;
              }
              const url = urlFromDrop(e.dataTransfer);
              if (url) void saveLogo(url);
              else setNote("That drop didn't contain an image.");
            }}
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
              over ? "border-primary bg-brand-soft" : "border-border bg-card"
            }`}
          >
            <p className="mb-3 text-sm font-semibold text-foreground">
              New logo for {target.name}
            </p>
            {preview ? (
              <img
                src={preview}
                alt={`${target.name} logo preview`}
                className="mx-auto mb-4 h-24 object-contain"
              />
            ) : null}
            <ImagePlus className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="text-xs text-muted-foreground">
              Drag an image here from Google Images, or drop a file from your device.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <label className="cursor-pointer rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-foreground">
                Choose file
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadFile(f);
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  const url = window.prompt("Paste an image URL");
                  if (url) void saveLogo(url);
                }}
                className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                Paste URL
              </button>
              {busy ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
            </div>
          </section>
        ) : (
          <p className="text-xs text-muted-foreground">Pick a channel above to update its logo.</p>
        )}
      </div>
    </AppShell>
  );
}
