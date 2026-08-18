import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GITHUB_PAGES=true is set only by the GitHub Pages preview build, since that
// deploy is served from a /Anatolian-Accountancy/ subpath instead of the real
// domain's root.
const isGithubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  site: isGithubPages ? 'https://cuneytcandan2026-jpg.github.io' : 'https://anatolianaccountancy.com',
  base: isGithubPages ? '/Anatolian-Accountancy/' : '/',
  output: 'static',
  integrations: [sitemap()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'tr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  compressHTML: true,
});
