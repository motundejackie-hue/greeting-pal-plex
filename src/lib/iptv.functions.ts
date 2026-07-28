import { createServerFn } from "@tanstack/react-start";

export const getHome = createServerFn({ method: "GET" })
  .inputValidator((data: { country?: string } | undefined) => ({
    country: data?.country ? String(data.country).slice(0, 4) : undefined,
  }))
  .handler(async ({ data }) => {
    const { getCatalog, buildHome } = await import("./iptv.server");
    const catalog = await getCatalog();
    const home = buildHome(catalog, data.country ?? null);
    return {
      hero: home.hero,
      rows: home.rows,
      countries: catalog.countries.slice(0, 250),
      categories: catalog.categories,
      total: catalog.channels.length,
      builtAt: catalog.builtAt,
    };
  });

export const searchChannels = createServerFn({ method: "GET" })
  .inputValidator(
    (data: { q?: string; country?: string; category?: string; page?: number } | undefined) => ({
      q: data?.q ? String(data.q).slice(0, 80) : undefined,
      country: data?.country ? String(data.country).slice(0, 4) : undefined,
      category: data?.category ? String(data.category).slice(0, 40) : undefined,
      page: Math.max(1, Math.min(500, Number(data?.page ?? 1) || 1)),
    }),
  )
  .handler(async ({ data }) => {
    const { getCatalog, selectChannels } = await import("./iptv.server");
    const catalog = await getCatalog();
    return selectChannels(catalog, { ...data, pageSize: 60 });
  });

export const listAllNames = createServerFn({ method: "GET" })
  .inputValidator((data: { q?: string } | undefined) => ({
    q: data?.q ? String(data.q).slice(0, 80).toLowerCase() : "",
  }))
  .handler(async ({ data }) => {
    const { getCatalog } = await import("./iptv.server");
    const catalog = await getCatalog();
    const list = data.q
      ? catalog.channels.filter((c) => c.name.toLowerCase().includes(data.q))
      : catalog.channels;
    return list.slice(0, 60).map((c) => ({ slug: c.slug, name: c.name, logo: c.logo }));
  });

export const getChannelsBySlugs = createServerFn({ method: "GET" })
  .inputValidator((data: { slugs?: string[] } | undefined) => ({
    slugs: (data?.slugs ?? []).slice(0, 200).map((s) => String(s).slice(0, 120)),
  }))
  .handler(async ({ data }) => {
    const { getCatalog } = await import("./iptv.server");
    const catalog = await getCatalog();
    const wanted = new Set(data.slugs);
    const found = catalog.channels.filter((c) => wanted.has(c.slug));
    return { items: found };
  });
