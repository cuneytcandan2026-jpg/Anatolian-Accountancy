import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GITHUB_PAGES=true is set only by the GitHub Pages preview build, since that
// deploy is served from a /Anatolian-Accountancy/ subpath instead of the real
// domain's root.
const isGithubPages = process.env.GITHUB_PAGES === 'true';
const base = isGithubPages ? '/Anatolian-Accountancy/' : '/';

// Links inside Markdown content (e.g. a blog post linking /services/#tax) are
// written root-relative for the real domain, and .astro templates' withBase()
// never sees them. Prefix them with `base` here so they don't 404 on the
// GitHub Pages preview's subpath.
function rehypeBaseLinks() {
  return (tree) => {
    const visit = (node) => {
      const href = node.type === 'element' && node.tagName === 'a' ? node.properties?.href : undefined;
      if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
        node.properties.href = base + href.slice(1);
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

export default defineConfig({
  site: isGithubPages ? 'https://cuneytcandan2026-jpg.github.io' : 'https://anatolianaccountancy.com',
  base,
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: isGithubPages ? [rehypeBaseLinks] : [],
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'tr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  compressHTML: true,
});
