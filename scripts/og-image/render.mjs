// Renders og.html to public/og-image.jpg (EN) and public/og-image-tr.jpg (TR)
// with headless Chrome, then re-encodes to JPEG with sharp.
//
//   node scripts/og-image/render.mjs [path-to-chrome]
//
// Defaults to the standard Windows Chrome install path; pass another
// Chrome/Chromium/Edge binary as the first argument elsewhere.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const chrome = process.argv[2] ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';

for (const [lang, out] of [['en', 'og-image.jpg'], ['tr', 'og-image-tr.jpg']]) {
  const png = path.join(os.tmpdir(), `og-${lang}.png`);
  const url = `${pathToFileURL(path.join(here, 'og.html')).href}?lang=${lang}`;
  execFileSync(chrome, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--allow-file-access-from-files', '--window-size=1200,630', '--virtual-time-budget=3000',
    `--screenshot=${png}`, url,
  ], { stdio: 'ignore' });
  await sharp(png).resize(1200, 630).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(root, 'public', out));
  fs.rmSync(png);
  console.log(`public/${out}`);
}
