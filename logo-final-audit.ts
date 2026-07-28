import { getCatalog } from './src/lib/iptv.server.ts';

async function run() {
  const catalog = await getCatalog();
  let missingLogo = 0;
  const report: Array<{slug:string;name:string;logo:string|null}> = [];
  for (const c of catalog.channels) {
    if (!c.logo) {
      missingLogo += 1;
      report.push({ slug: c.slug, name: c.name, logo: c.logo });
    }
  }
  console.log(`totalChannels=${catalog.channels.length}`);
  console.log(`missingLogo=${missingLogo}`);
  report.slice(0, 100).forEach((r) => console.log(`${r.slug}|${r.name}|${r.logo}`));
}

run().catch((err) => { console.error(err); process.exit(1); });
