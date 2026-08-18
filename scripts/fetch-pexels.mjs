#!/usr/bin/env node
/**
 * Search Pexels and download a photo into src/assets/pexels/.
 *
 * Usage:
 *   node scripts/fetch-pexels.mjs "<search query>" <output-name> [options]
 *
 * Options:
 *   --orientation=landscape|portrait|square   (default: landscape)
 *   --size=original|large2x|large|medium|small (default: large2x)
 *   --count=<n>                                how many results to download (default: 1)
 *   --dir=<path>                               destination dir (default: src/assets/pexels)
 *
 * Example:
 *   npm run pexels -- "business meeting office" hero-consultation --orientation=landscape
 *
 * Requires PEXELS_API_KEY in .env (get one free at https://www.pexels.com/api/).
 */

import { writeFile, mkdir, appendFile } from 'node:fs/promises';
import path from 'node:path';

try {
  process.loadEnvFile();
} catch {
  // .env not found — fall back to whatever is already in process.env
}

const API_KEY = process.env.PEXELS_API_KEY;

function parseArgs(argv) {
  const positional = [];
  const options = {};
  for (const arg of argv) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value ?? true;
    } else {
      positional.push(arg);
    }
  }
  return { positional, options };
}

async function main() {
  const { positional, options } = parseArgs(process.argv.slice(2));
  const [query, outputName] = positional;

  if (!API_KEY) {
    console.error('Missing PEXELS_API_KEY. Add it to .env first.');
    process.exit(1);
  }

  if (!query || !outputName) {
    console.error('Usage: node scripts/fetch-pexels.mjs "<search query>" <output-name> [--orientation=] [--size=] [--count=]');
    process.exit(1);
  }

  const orientation = options.orientation ?? 'landscape';
  const size = options.size ?? 'large2x';
  const count = Number(options.count ?? 1);
  const destDir = options.dir ?? path.join('src', 'assets', 'pexels');

  const searchUrl = new URL('https://api.pexels.com/v1/search');
  searchUrl.searchParams.set('query', query);
  searchUrl.searchParams.set('per_page', String(count));
  searchUrl.searchParams.set('orientation', orientation);

  const res = await fetch(searchUrl, {
    headers: { Authorization: API_KEY },
  });

  if (!res.ok) {
    console.error(`Pexels search failed: ${res.status} ${res.statusText}`);
    console.error(await res.text());
    process.exit(1);
  }

  const data = await res.json();
  if (!data.photos?.length) {
    console.error(`No results for "${query}".`);
    process.exit(1);
  }

  await mkdir(destDir, { recursive: true });

  const creditsFile = path.join(destDir, 'credits.md');
  const photos = data.photos.slice(0, count);

  for (const [i, photo] of photos.entries()) {
    const srcUrl = photo.src[size] ?? photo.src.large2x;
    const suffix = photos.length > 1 ? `-${i + 1}` : '';
    const fileName = `${outputName}${suffix}.jpg`;
    const filePath = path.join(destDir, fileName);

    const imgRes = await fetch(srcUrl);
    if (!imgRes.ok) {
      console.error(`Download failed for photo ${photo.id}: ${imgRes.status}`);
      continue;
    }
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    await writeFile(filePath, buffer);

    const credit = `- ${fileName}: "${query}" photo by ${photo.photographer} (${photo.photographer_url}) via Pexels — ${photo.url}\n`;
    await appendFile(creditsFile, credit);

    console.log(`Saved ${filePath}`);
    console.log(`  Photographer: ${photo.photographer} — ${photo.url}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
