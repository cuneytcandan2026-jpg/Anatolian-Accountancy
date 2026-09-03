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

On this Windows/OneDrive-synced checkout, stray `astro dev`/`astro preview` node processes from previous sessions can keep running for a long time (observed: over 24h) without anyone noticing, and they hold file locks under `src/`. If overwriting or renaming a tracked file fails with `EBUSY`/`EPERM`, check for leftover processes bound to this project before assuming it's a generic lock: `Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Select ProcessId, CommandLine` (PowerShell), looking for `astro.js dev`/`astro.js preview` with this repo's path. Stopping them (with user confirmation — killing a process is a shared/hard-to-reverse action) usually clears it; restarting is just `npm run dev`. If the lock persists even with no matching process, write the new content under a new filename and update the importing `.astro` file(s) instead of fighting the lock further.

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

`who-we-help.astro`'s TR/EN status may drift — check both files rather than assuming parity before editing one. The same applies to `insights/index.astro` / `tr/blog/index.astro` (the blog listing pages) and each `insights/[slug].astro` / `tr/blog/[slug].astro` post pair.

### Content collections vs. inline data

`src/content.config.ts` defines five glob-loaded Markdown collections under `src/content/`: `services`, `audiences`, `faq`, `testimonials`, `blog`, each with a Zod schema (`order` field controls display sequence; `href` fields point at in-page anchors like `/services/#vat-payroll`). These back the **English** homepage's dynamic sections via `getCollection()`. The Turkish homepage and the built-out EN subpages (`services.astro`, `who-we-help.astro`, `about.astro`) instead hardcode equivalent data as inline arrays/objects in their frontmatter — they don't read from the content collections. Adding a new service/audience/FAQ/testimonial for English content-collection-driven sections means adding a Markdown file; reflecting the same change on TR pages or on the hardcoded EN subpages means editing the array literals in those specific files.

`blog` is the one bilingual exception to that EN-collection/TR-hardcoded split: both languages are collection-driven, living side by side as `src/content/blog/en/<slug>.md` and `src/content/blog/tr/<slug>.md`. The glob loader's auto-id (`en/<slug>` / `tr/<slug>`) links each EN/TR pair by matching filename — there's no `lang`/`translationKey` frontmatter field doing that job. A `status: placeholder | published` field marks posts still awaiting real copy.

### Site-wide config and design tokens

- `src/lib/site.ts` is the single source for business identity (name, address, phone, email, geo, hours, nav items, social links) — consumed by `BaseLayout.astro` for `LocalBusiness` JSON-LD, by `Header`/`Footer`, and by `contact.astro`. Update facts (address, hours, phone) here, not per-page.
- `src/styles/tokens.css` + `src/styles/global.css` define the full design-token system (colour scale, spacing, radii, shadows, motion durations) as CSS custom properties; components consume `var(--...)` rather than hardcoding values. `Insparation style.md` and `Insparation site.png` in the repo root are reference/inspiration material for a competitor site, not part of the build.
- `Icon.astro` is a single component holding every SVG icon as an inline conditional (`{name === 'phone' && <path .../>}`) keyed by a `name` string prop — there's no icon library dependency. Adding an icon means adding another `{name === '...' && ...}` branch.
- `BaseLayout.astro` centralizes `<head>` (meta, OG/Twitter tags, canonical URL, optional `LocalBusiness` schema via `includeLocalBusinessSchema`) plus the shared `Header`/`Footer`/`MobileActionBar` chrome and the scroll-reveal `IntersectionObserver` wiring that `.reveal` class elements throughout the site rely on.

### Forms

`ContactForm.astro` posts client-side to Web3Forms (`api.web3forms.com/submit`) — a backend-less form endpoint suited to static hosting, with no server code in this repo. `WEB3FORMS_ACCESS_KEY` in that file is currently a placeholder (`YOUR_WEB3FORMS_ACCESS_KEY`) and needs a real key before launch.

### Images

Photography is Pexels stock, fetched at authoring time via `npm run pexels` (see Commands above) into per-section folders under `src/assets/` (`assets/services/`, `assets/audiences/`, plus one-off files like `hero-collage-*.jpg`) and imported as ES modules for use with `astro:assets`' `<Image>` — never fetched at request/runtime and never referenced as plain `/public` paths. Each folder's `credits.md` records photographer attribution per image; keep adding to it when fetching new images into that folder.

`src/assets/trust/` is a separate case: third-party membership/software badge logos (AAT, İSMMMO, Xero, Capium) shown in the homepage's "Professional memberships & software" strip, sourced as vendor brand assets rather than via `npm run pexels`. `<Image>` renders these directly with no wrapping background box in CSS, so a logo whose source file has a baked-in white background needs de-matting into a true alpha channel before import, not just a crop. `sharp` (Astro's own image dependency, already present in `node_modules` without any extra install — there's no ImageMagick or Python in this environment) can do this: key alpha off `255 - min(r,g,b)` per pixel, then unpremultiply the RGB against white for the semi-transparent edge pixels, so edges stay anti-aliased instead of a hard cutout. Files that have been through this step carry a `-transparent` suffix (e.g. `aat-logo-transparent.webp`) — keep that convention for any new vendor logo that ships on a white background.
