# Globalmediicare — Next.js

Next.js 15 (App Router) port of the original single-file marketing site
(`../globalmedicare.html`), an international medical-tourism concierge.

## How the port works

The original site is one 4.5 MB HTML file: a `<style>` block, a data-driven DOM,
and vanilla-JS that renders content from data arrays and wires up all the
interactivity (mega-menus, drawer, hero, marquee, hospital tabs, testimonial
slider, scroll/counter/tilt engines, custom country-code phone picker, legal
modals). Rather than hand-convert ~1,400 lines of markup to JSX, the port keeps
that engine intact and serves it through Next.js:

- **`scripts/build-from-html.mjs`** — regenerates all generated content from the
  original HTML. Run `npm run build:content`. It:
  - copies the `<style>` block to `app/globals.css`
  - writes the `<body>` DOM (scripts stripped) to `content/body.html`
  - extracts **every base64 image** to `public/assets/*` and the favicon to
    `public/favicon.png`, rewriting references to URLs (fixes the original's
    ~3 MB inline-image payload)
  - writes the vanilla-JS engine to `public/engine.js`, with the base64 asset
    map replaced by `/assets` URLs and the consultation form wired to the real
    API route below
- **`app/layout.jsx`** — `<html>`/`<head>` shell, Google Fonts, and full
  metadata (adds the previously-missing OpenGraph/Twitter image + canonical).
- **`app/page.jsx`** — server component that inlines `content/body.html` and
  loads `/engine.js`.
- **`app/api/consult/route.js`** — real endpoint for the consultation form
  (validates name/country/phone, captures the dial code, returns `{ ok: true }`).
  In the original the form faked success and discarded the lead; hook this up to
  email / Supabase / WhatsApp where marked `TODO`.

Generated files (`app/globals.css`, `content/body.html`, `public/engine.js`,
`public/assets/*`, `public/favicon.png`) are reproducible — re-run
`npm run build:content` whenever the source HTML changes.

## Develop

```bash
npm install
npm run build:content   # regenerate from ../globalmedicare.html (already run)
npm run dev             # http://localhost:3000
```

## Build

```bash
npm run build && npm start
```
