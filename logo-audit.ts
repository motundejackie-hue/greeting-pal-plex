import { getCatalog } from './src/lib/iptv.server.ts';
import { getChannelLogoCandidates, getPreferredChannelLogo } from './src/lib/channel-logos.ts';

async function probe(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store', redirect: 'follow' });
    return res.ok && res.headers.get('content-type')?.startsWith('image');
  } catch {
    return false;
  }
}

async function run() {
  const catalog = await getCatalog();
  console.log(`Catalog channels: ${catalog.channels.length}`);
  const missing: Array<{slug:string;name:string;candidates:string[]}> = [];
  const stats: Record<string, number> = {};
  for (const c of catalog.channels) {
    const candidates = getChannelLogoCandidates(c);
    const working: string[] = [];
    for (const u of candidates) {
      if (!u) continue;
      const ok = await probe(u);
      if (ok) working.push(u);
    }
    const preferred = getPreferredChannelLogo(c);
    if (!working.length) {
      missing.push({ slug: c.slug, name: c.name, candidates });
      continue;
    }
    const first = working[0];
    let source = 'other';
    if (first.includes('upload.wikimedia.org')) source = 'wikimedia';
    else if (first.includes('picons')) source = 'picons';
    else if (first.includes('tv-logos')) source = 'tv-logo';
    else if (first.includes('fanmingming')) source = 'fanmingming';
    else if (first.includes('iptv-org')) source = 'iptv-org';
    stats[source] = (stats[source] ?? 0) + 1;
  }
  console.log('stats', stats);
  console.log('missing', missing.length);
  missing.slice(0, 50).forEach((item) => {
    console.log(`${item.slug}|${item.name}|${item.candidates.join('|')}`);
  });
}

run().catch((err) => { console.error(err); process.exit(1); });
