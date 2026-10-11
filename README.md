# Chovu Chovu Brothers Ltd

The website for **Chovu Chovu Brothers Ltd**, a retail shop in Luanshya, Copperbelt Province, Zambia. It is a static, prerendered site: the complete page is in the HTML before any JavaScript runs.

Brand reference: the supplied logo, `public/brand/wada-chovu-logo.jpeg`, used unaltered. The palette in `src/styles/tokens.css` is drawn from it. **Note:** the artwork itself reads "WADA CHOVU SERVICES LTD"; see *Open questions* below.

> **Status:** structure, design system and enquiry form are complete. Business contact details and product information are still placeholders. See [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md) for how to replace them.

---

## Quick start

Requirements: **Node.js 20.19 or newer** (22 LTS recommended) and npm.

```bash
npm install
npm run dev            # development server on http://localhost:5173/Wada-Chovu/ (bound to 0.0.0.0)
npm run build          # type-check, then production build into dist/
npm run preview        # serve dist/ on http://localhost:4173/Wada-Chovu/
```

The Vite `base` is `/Wada-Chovu/`, so local dev, preview, and the GitHub Pages project site are served from that path.

---

## What is on the page

| Section | Purpose |
| --- | --- |
| Header | Logo, section links and a "Send an enquiry" call to action. A full-height menu sheet on small screens. |
| Hero | Welcome headline and calls to action. |
| About | The shop and what to expect. |
| Shop by category | Four category cards (placeholder content). Each card pre-selects its product in the enquiry form. |
| Featured products | Four product cards (placeholder content). Each pre-selects its product in the enquiry form too. |
| In the shop | Dark section about walking the shop floor and asking before you buy. |
| Why choose us | Four value pillars. |
| Enquiry | Enquiry form with validation, a honeypot field, and submission by email app or JSON endpoint. |
| Visit us | Luanshya location (confirmed), street address, phone, email and hours (placeholders). |
| Footer | Logo, navigation, contact summary, legal line and back to top. |

---

## How the code is organised

```
index.html              Document shell. Two markers are replaced at build time.
vite.config.ts          Vite config, including the prerender plugin and the dev and preview hosts.
src/
  content/              ALL editable content and asset references
    assets.ts           The asset manifest: every image, by key
    site.ts             Business details, navigation, contact channels, feature switches
    copy.ts             All visitor-facing wording
    products.ts         Category and featured product data
    types.ts            Shared asset types
  render/               Pure HTML generators (run at build time; no DOM access)
    page.ts             Page assembly and document head (title, meta, structured data)
    media.ts            renderPlainImage: bare <img> tags for the logo images
    ui.ts, icons.ts     Buttons, headings, eyebrows, CSS-drawn icons
    sections/           One file per section
  client/               Progressive enhancement (runs after the page is visible)
    main.ts             Entry point. Boots the header, reveal and enquiry-form enhancements.
    header.ts           Sticky header state and the mobile menu
    reveal.ts           Scroll reveal (only when motion is allowed)
    enquiry-form.ts     Validation, honeypot, submission
  styles/               tokens.css, base.css, components.css, sections.css, motion.css
public/
  brand/                The supplied logo and a favicon cropped from it
  robots.txt
docs/CONTENT_GUIDE.md   How to replace placeholders with real content
```

The **render layer** and the **client layer** are kept apart. The page is generated as plain HTML, so the content is readable, indexable and fast before any JavaScript runs. The client code only adds behaviour.

---

## Design decisions

**Brand.** The palette comes from the logo: neon green `#06FC07` (used sparingly, for accents on dark surfaces), grass green `#22A116`, sun orange `#FE6700`, and white. Forest green carries most of the weight, which keeps the site feeling professional rather than playful. Text colours meet WCAG AA contrast on their backgrounds. The logo is used unaltered on white, and is placed on a white card on dark surfaces.

**Typography.** Archivo Variable, self-hosted (Latin subset, about 90 KB). It is declared with `font-display: optional` and preloaded. Text does not change size mid-read, so the layout does not shift when the font arrives.

**Assets.** Every image is listed once in `src/content/assets.ts`. Components refer to keys only, so replacing an image means changing one entry.

**Motion.** Content fades and rises once as it enters the viewport (scroll reveal). With `prefers-reduced-motion: reduce`, reveal animations are not used, so content is visible at once.

**Performance.** The prerendered HTML, CSS and client JavaScript total about 17 KB gzipped. The Latin font (90 KB, preloaded) is the largest first-load asset. The logo image loads eagerly. A body-level safety net clips accidental horizontal overflow.

**Enquiry form.** Validation runs in the browser, and each field has an accessible error message. A honeypot field catches most bots. Submission has two modes, chosen in `src/content/site.ts`:
- `enquiry.endpoint` set to an HTTPS URL: the enquiry is sent there as JSON.
- `enquiry.endpoint` empty and `enquiry.emailTo` set to a real address: the visitor's email app opens with the enquiry filled in. No server is needed.
- Neither set (the default now): the form is disabled and shows a notice. Nothing is sent. Placeholder domains such as `example.com` are rejected, both for the email address and for the endpoint host, and the deploy guard fails the build if any built `mailto:` link points at one.

**Accessibility.** Semantic landmarks, a single `h1`, a skip link, visible focus styles, labelled form fields, and status messages in live regions. Without JavaScript, the navigation links are shown in the page, and the enquiry form uses the browser's own validation and opens the visitor's email app (a `mailto:` submission). That path has been checked for markup, not in a particular mail client.

---

## Placeholders

Anything the business has not confirmed is a clearly marked placeholder. A "Placeholder" badge appears on placeholder content, and an orange highlight marks text. Both are controlled by `features.placeholderMarkers` in `src/content/site.ts`. Set it to `false` once the content is final.

Placeholders include: the street address, phone, email and hours; product category and product names, pack sizes and descriptions; and the favicon, a simplified mark drawn from the logo. Nothing on the page states a year of trading, customer numbers, certifications, prices, delivery times or capacity. Add those only once they are confirmed.

---

## Quality checks

Run against the production build in headless Chromium, at 360, 390, 768, 1024 and 1440 px, with the following results:

- Build and type-check pass with no warnings.
- No horizontal overflow at any width.
- Cumulative layout shift of 0 on load at every width.
- No console errors, page errors or failed requests on load.
- Reduced motion: reveal animations are not used, so content is visible at once.
- No JavaScript: all content and the navigation are present, and the enquiry form submits to the visitor's email app.
- Enquiry form: required-field, email and length validation; focus moves to the first invalid field; a valid submission hands off to the email app and keeps the chosen product.
- Mobile menu opens and closes, and anchor links land below the sticky header.

Contrast was checked for the main text and background pairs. The required-field asterisk uses a deeper orange than the brand orange, because the brand orange on white does not reach the AA threshold for text.

---

## Deployment

GitHub Pages is set to build from the workflow (`.github/workflows/static.yml`). The workflow runs only on pushes to `main`, so this branch is **not deployed** until it is merged. The workflow runs `npm run build`, then `scripts/verify-dist.mjs`, and uploads `dist/`. The site is served at `https://arabninja-hub.github.io/Wada-Chovu/`, so every asset URL carries the `/Wada-Chovu/` base. The guard checks `href`, `src` and `srcset`.

## Before launch

Items that need an owner's decision or real information:

1. **Logo artwork.** The supplied logo file (`public/brand/wada-chovu-logo.jpeg`) reads "WADA CHOVU SERVICES LTD". The site name, alt text and structured data use "Chovu Chovu Brothers Ltd", but the logo image still shows the old name in the header, footer and social preview. Supply the Chovu Chovu Brothers Ltd logo and replace the file (the path can stay the same).
2. **Contact details, address and opening hours** (`src/content/site.ts`).
3. **Production URL** (`site.url`), used for canonical links, social previews and structured data.
4. **Enquiry handling.** Choose an endpoint, or confirm the email address that receives enquiries.
5. **Privacy notice.** The enquiry form collects personal data. Add a privacy notice and link it from the form before launch.
6. **Copy.** Confirm or rewrite the wording in `src/content/copy.ts`. Product availability, shop-floor help, reply times and the privacy statement "We only use your details to respond to your enquiry" need the owner's confirmation.
7. **Favicon.** Replace the placeholder mark with the official icon when it is available.
