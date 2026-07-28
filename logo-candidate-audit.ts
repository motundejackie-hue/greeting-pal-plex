import { getCatalog } from './src/lib/iptv.server.ts';
import { getChannelLogoCandidates } from './src/lib/channel-logos.ts';

async function run() {
  const catalog = await getCatalog();
  let zeroCandidates = 0;
  const report: Array<{slug:string;name:string;count:number;first:string|null}> = [];
  for (const c of catalog.channels) {
    const candidates = getChannelLogoCandidates(c);
    if (candidates.length === 0) {
      zeroCandidates += 1;
      report.push({ slug: c.slug, name: c.name, count: 0, first: null });
    } else if (candidates.length <= 2) {
      report.push({ slug: c.slug, name: c.name, count: candidates.length, first: candidates[0] ?? null });
    }
  }
  console.log(`totalChannels=${catalog.channels.length}`);
  console.log(`zeroCandidates=${zeroCandidates}`);
  console.log(`smallCandidateCount=${report.length}`);
  report.slice(0, 100).forEach((r) => console.log(`${r.slug}|${r.name}|${r.count}|${r.first}`));
}
run().catch((err) => { console.error(err); process.exit(1); });
