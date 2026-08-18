# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # astro dev — local dev server
npm run build     # astro check && astro build — type-checks content/props, then static build to dist/
npm run preview   # astro preview — serve the built dist/ output
npm run astro     # pass-through to the astro CLI (e.g. npm run astro -- add <integration>)
```

There is no test suite and no linter configured — `astro check` (part of `build`) is the only correctness gate, run via the Astro/TypeScript strict config.

### Fetching stock photography

```bash
npm run pexels -- "<search query>" <output-name> [--orientation=landscape|portrait|square] [--size=original|large2x|large|medium|small] [--count=n] [--dir=<path>]
```

`scripts/fetch-pexels.mjs` searches Pexels and downloads the result(s) into `src/assets/pexels/` (or `--dir`) as `<output-name>.jpg`, appending an attribution line to a `credits.md` in that same folder. Requires `PEXELS_API_KEY` in `.env` (gitignored). The convention elsewhere in the repo is to fetch straight into the section-specific folder (e.g. `--dir=src/assets/services`) rather than leaving everything in `pexels/` — see `src/assets/services/credits.md` and `src/assets/audiences/credits.md` for the existing pattern. Downloaded images are imported and rendered through `astro:assets`' `<Image>`, never referenced by raw path, so Astro can optimize/resize them at build time.

## Architecture

This is an **Astro 5** static site (`output: 'static'`) for a London/Enfield accountancy firm, built as bilingual English/Turkish with no client-side framework — interactivity is vanilla `<script>` in `.astro` components (mobile nav drawer, scroll-reveal via `IntersectionObserver`, the contact form's fetch handler).

### Bilingual routing — the core structural pattern

English pages live at the top of `src/pages/` (`/`, `/services/`, `/who-we-help/`, `/about/`, `/contact/`). Turkish pages are **hand-duplicated** `.astro` files under `src/pages/tr/` with Turkish filenames and translated inline copy — there is no i18n/string-catalog abstraction:

| English | Turkish |
|---|---|
| `index.astro` | `tr/index.astro` |
| `services.astro` | `tr/hizmetler.astro` |
| `who-we-help.astro` | `tr/kimlere-yardimci-oluyoruz.astro` |
| `about.astro` | `tr/hakkimizda.astro` |
| `contact.astro` | `tr/iletisim.astro` |

`astro.config.mjs` sets `i18n.routing.prefixDefaultLocale: false`, so English stays unprefixed and only `/tr/*` gets the locale prefix. The EN↔TR mapping used by the header's language switcher is hardcoded in `src/lib/site.ts` (`langAlternates` / `langAlternatesReverse`), and `Header.astro` derives the current language from whether `Astro.url.pathname` starts with `/tr/`. **When adding or renaming a page, update `langAlternates` too**, or the language switcher will silently fall back to the homepage. Because each language is a fully separate file (not shared templates + translation strings), a content or layout change usually has to be made twice — once per language file — and shared components (`Button`, `SectionHeader`, `Testimonial`, `ContactForm`, etc.) take an explicit `lang` prop rather than reading locale from context.

`insights/index.astro` and `who-we-help.astro`'s TR/EN status may drift — check both files rather than assuming parity before editing one.

### Content collections vs. inline data

`src/content.config.ts` defines four glob-loaded Markdown collections under `src/content/`: `services`, `audiences`, `faq`, `testimonials`, each with a Zod schema (`order` field controls display sequence; `href` fields point at in-page anchors like `/services/#vat-payroll`). These back the **English** homepage's dynamic sections via `getCollection()`. The Turkish homepage and the built-out EN subpages (`services.astro`, `who-we-help.astro`, `about.astro`) instead hardcode equivalent data as inline arrays/objects in their frontmatter — they don't read from the content collections. Adding a new service/audience/FAQ/testimonial for English content-collection-driven sections means adding a Markdown file; reflecting the same change on TR pages or on the hardcoded EN subpages means editing the array literals in those specific files.

### Site-wide config and design tokens

- `src/lib/site.ts` is the single source for business identity (name, address, phone, email, geo, hours, nav items, social links) — consumed by `BaseLayout.astro` for `LocalBusiness` JSON-LD, by `Header`/`Footer`, and by `contact.astro`. Update facts (address, hours, phone) here, not per-page.
- `src/styles/tokens.css` + `src/styles/global.css` define the full design-token system (colour scale, spacing, radii, shadows, motion durations) as CSS custom properties; components consume `var(--...)` rather than hardcoding values. `Insparation style.md` and `Insparation site.png` in the repo root are reference/inspiration material for a competitor site, not part of the build.
- `Icon.astro` is a single component holding every SVG icon as an inline conditional (`{name === 'phone' && <path .../>}`) keyed by a `name` string prop — there's no icon library dependency. Adding an icon means adding another `{name === '...' && ...}` branch.
- `BaseLayout.astro` centralizes `<head>` (meta, OG/Twitter tags, canonical URL, optional `LocalBusiness` schema via `includeLocalBusinessSchema`) plus the shared `Header`/`Footer`/`MobileActionBar` chrome and the scroll-reveal `IntersectionObserver` wiring that `.reveal` class elements throughout the site rely on.

### Forms

`ContactForm.astro` posts client-side to Web3Forms (`api.web3forms.com/submit`) — a backend-less form endpoint suited to static hosting, with no server code in this repo. `WEB3FORMS_ACCESS_KEY` in that file is currently a placeholder (`YOUR_WEB3FORMS_ACCESS_KEY`) and needs a real key before launch.

### Images

Photography is Pexels stock, fetched at authoring time via `npm run pexels` (see Commands above) into per-section folders under `src/assets/` (`assets/services/`, `assets/audiences/`, plus one-off files like `hero-collage-*.jpg`) and imported as ES modules for use with `astro:assets`' `<Image>` — never fetched at request/runtime and never referenced as plain `/public` paths. Each folder's `credits.md` records photographer attribution per image; keep adding to it when fetching new images into that folder.
