// Tells IndexNow search engines (Bing, Yandex, Seznam, Naver, Yep) which pages
// changed in a deploy, so they recrawl them within hours instead of waiting
// for their next pass over the sitemap. Google does not use IndexNow.
//
// Usage (after `npm run build`, so dist/ exists):
//   node scripts/indexnow.mjs <name-status-file>   submit the pages a deploy changed
//   node scripts/indexnow.mjs --all                submit every URL in the sitemap
// Set INDEXNOW_DRY_RUN=1 to print the URLs without waiting or submitting.
//
// <name-status-file> is the output of `git diff --name-status --no-renames`
// for the built files (lines of "A|M|D<TAB>path"), as written by the
// "Publish to the hostinger branch" workflow step.
//
// The key is the 32-character hex file in public/ (served at
// /<key>.txt, containing the key itself). Search engines fetch it to check that
// the submitter controls the site, so it must stay published.
//
// Problems are reported as GitHub Actions warnings and the script still exits
// 0: by the time it runs the deploy has already happened, and the sitemap gets
// the pages recrawled anyway.

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const DIST = 'dist';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const DEPLOY_WAIT_MS = 10 * 60 * 1000;
const POLL_MS = 15 * 1000;

const warn = (msg) => console.log(`::warning::IndexNow: ${msg}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findKey() {
  for (const name of await readdir(DIST)) {
    const m = name.match(/^([0-9a-f]{32})\.txt$/);
    if (m && (await readFile(path.join(DIST, name), 'utf8')).trim() === m[1]) return m[1];
  }
  throw new Error('no IndexNow key file (<32 hex chars>.txt containing its own name) in dist/');
}

async function sitemapUrls() {
  const files = (await readdir(DIST)).filter((f) => /^sitemap-.*\.xml$/.test(f) && f !== 'sitemap-index.xml');
  const urls = [];
  for (const f of files) {
    const xml = await readFile(path.join(DIST, f), 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.push(m[1]);
  }
  if (!urls.length) throw new Error('no URLs found in dist/sitemap-*.xml');
  return urls;
}

// "about/index.html" -> "/about/", "index.html" -> "/"; anything else isn't a page.
function pagePath(file) {
  if (file === 'index.html') return '/';
  if (file.endsWith('/index.html')) return '/' + file.slice(0, -'index.html'.length);
  return null;
}

// Returns { live, removed }: live URLs that were added or changed (and are in
// the sitemap, which leaves out noindex pages), plus page URLs that were
// deleted, which engines should be told about too so they drop them.
async function changedUrls(nameStatusFile, origin, inSitemap) {
  const live = [];
  const removed = [];
  const text = await readFile(nameStatusFile, 'utf8');
  for (const line of text.split('\n').filter(Boolean)) {
    const [status, file] = line.split('\t');
    const p = pagePath(file);
    if (!p) continue;
    const url = origin + p;
    if (status === 'D') removed.push(url);
    else if (inSitemap.has(url)) live.push({ url, file });
  }
  return { live, removed };
}

// Hostinger copies the hostinger branch into public_html on its own schedule
// after the push, so wait until the key file is served and one of the changed
// pages matches the build, rather than pointing crawlers at stale pages.
async function waitForDeploy(origin, key, sample) {
  const expected = sample ? await readFile(path.join(DIST, sample.file), 'utf8') : null;
  const deadline = Date.now() + DEPLOY_WAIT_MS;
  while (Date.now() < deadline) {
    try {
      const bust = `?indexnow=${Date.now()}`;
      const keyRes = await fetch(`${origin}/${key}.txt${bust}`, { cache: 'no-store' });
      const keyOk = keyRes.ok && (await keyRes.text()).trim() === key;
      let pageOk = true;
      if (keyOk && sample) {
        const pageRes = await fetch(sample.url + bust, { cache: 'no-store' });
        pageOk = pageRes.ok && (await pageRes.text()) === expected;
      }
      if (keyOk && pageOk) return true;
    } catch {
      // Network blip; try again on the next poll.
    }
    await sleep(POLL_MS);
  }
  return false;
}

async function main() {
  const arg = process.argv[2];
  if (!arg) throw new Error('pass a git name-status file, or --all');

  const key = await findKey();
  const all = await sitemapUrls();
  const origin = new URL(all[0]).origin;

  let urls;
  let sample = null;
  if (arg === '--all') {
    urls = all;
  } else {
    const { live, removed } = await changedUrls(arg, origin, new Set(all));
    urls = [...live.map((p) => p.url), ...removed];
    sample = live[0] ?? null;
  }

  if (!urls.length) {
    console.log('IndexNow: no indexable pages changed, nothing to submit.');
    return;
  }

  if (process.env.INDEXNOW_DRY_RUN) {
    console.log(`IndexNow dry run: would submit ${urls.length} URL(s) with key ${key}:`);
    for (const u of urls) console.log(`  ${u}`);
    return;
  }

  if (!(await waitForDeploy(origin, key, sample))) {
    warn(`${origin} still wasn't serving this build after ${DEPLOY_WAIT_MS / 60000} minutes; submitting anyway.`);
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(origin).host,
      key,
      keyLocation: `${origin}/${key}.txt`,
      urlList: urls,
    }),
  });

  // 200 = accepted, 202 = accepted but the key is still being verified.
  if (res.status === 200 || res.status === 202) {
    console.log(`IndexNow: submitted ${urls.length} URL(s) (HTTP ${res.status}):`);
    for (const u of urls) console.log(`  ${u}`);
  } else {
    warn(`submission rejected with HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

main().catch((err) => warn(err.message));
