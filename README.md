# Chovu Chovu Brothers Ltd

The website for **Chovu Chovu Brothers Ltd**, a retail shop in Luanshya, Copperbelt Province, Zambia. It is a static, prerendered site: the complete page is in the HTML before any JavaScript runs. Optional Three.js scenes add motion on capable devices, and the page is fully usable without them.

Brand reference: the supplied logo, `public/brand/wada-chovu-logo.jpeg`, used unaltered. The palette in `src/styles/tokens.css` is drawn from it. **Note:** the artwork itself reads "WADA CHOVU SERVICES LTD"; see *Open questions* below.

> **Status:** structure, design system, 3D system and enquiry form are complete. Photos, 3D models, business contact details and product information are still placeholders. See [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md) for how to replace them.

---

## Quick start

Requirements: **Node.js 20.19 or newer** (22 LTS recommended) and npm.

```bash
npm install
npm run dev            # development server on http://localhost:5173/Wada-Chovu/ (bound to 0.0.0.0)
npm run build          # type-check, then production build into dist/
npm run preview        # serve dist/ on http://localhost:4173/Wada-Chovu/
python3 scripts/depth/process-photos.py --sources <folder>   # turn original photos into depth-ready assets (see docs/PHOTO_PIPELINE.md)
```

The Vite `base` is `/Wada-Chovu/`, so local dev, preview, and the GitHub Pages project site are served from that path.

Development only: append `?quality=high`, `?quality=medium` or `?quality=low` to the URL to force a 3D quality tier and turn off automatic adjustment. The flag is ignored in production builds.

---

## What is on the page

| Section | Purpose |
| --- | --- |
| Header | Logo, section links and a "Send an enquiry" call to action. A full-height menu sheet on small screens. |
| Hero | Welcome headline, calls to action, and a 3D product display on a shop counter in an arch that echoes the logo. |
| About | The shop and what to expect, with a portrait image of the shop or team in an arch frame. |
| Shop by category | Four category cards (placeholder content). Each card pre-selects its product in the enquiry form. |
| Featured products | A small 3D display group, then four product cards (placeholder content). Each pre-selects its product too. |
| In the shop | Dark section with 3D retail shelving and product displays. The camera moves with scrolling. |
| Why choose us | Four value pillars. |
| Enquiry | Enquiry form with validation, a honeypot field, and submission by email app or JSON endpoint. |
| Visit us | Luanshya location (confirmed), street address, phone, email and hours (placeholders) and a shop exterior image. |
| Footer | Logo, navigation, contact summary, legal line and back to top. |

---

## How the code is organised

```
index.html              Document shell. Two markers are replaced at build time.
vite.config.ts          Vite config, including the prerender plugin and the dev and preview hosts.
src/
  content/              ALL editable content and asset references
    assets.ts           The asset manifest: every image, texture and 3D model, by key
    site.ts             Business details, navigation, contact channels, feature switches
    copy.ts             All visitor-facing wording
    products.ts         Category and featured product data
    types.ts            Shared asset and scene types
  render/               Pure HTML generators (run at build time; no DOM access)
    page.ts             Page assembly and document head (title, meta, structured data)
    media.ts            renderImage / renderStageSlot: the only way images reach the page
    ui.ts, icons.ts     Buttons, headings, eyebrows, CSS-drawn icons
    sections/           One file per section
  client/               Progressive enhancement (runs after the page is visible)
    main.ts             Entry point. Loads the 3D stage only when it is needed.
    header.ts           Sticky header state and the mobile menu
    reveal.ts           Scroll reveal (only when motion is allowed)
    enquiry-form.ts     Validation, honeypot, submission
    quality.ts          Device capability tiers for the 3D scenes
  three/                3D system (loaded on demand)
    stage.ts            One shared WebGL canvas that draws every 3D slot
    models.ts           Model loader: .glb/.gltf when configured, placeholder geometry otherwise
    photo-depth.ts      Depth-displaced photograph: the reusable 3D photo renderer
    layout.ts           Measured placement: stack, grid, ring, fit-to-shelf, frame-content
    placeholders.ts     Fallback geometry (carton, tin, pouch, plinth, card)
    materials.ts        Shared materials and geometry
    textures.ts         Texture loader with fallbacks
    rig.ts              Animation helpers (damping, bob) and camera fitting
    scenes/             Photo scene (hero and shop floor), featured GLB product scene
  styles/               tokens.css, base.css, components.css, sections.css, motion.css
public/
  brand/                The supplied logo and a favicon cropped from it
  media/photos/         Stand-in photographs and their depth maps (generated by scripts/depth)
  models/               Generic placeholder packaging (GLB) and CREDITS.md
  robots.txt
scripts/depth/          Depth pipeline: fetch the model, turn photos into depth-ready assets
docs/CONTENT_GUIDE.md   How to replace placeholders with real content
docs/PHOTO_PIPELINE.md  How photos become 3D scenes, licences and limits
```

The **render layer** and the **client layer** are kept apart. The page is generated as plain HTML, so the content is readable, indexable and fast before any JavaScript runs. The client code only adds behaviour.

---

## Design decisions

**Brand.** The palette comes from the logo: neon green `#06FC07` (used sparingly, for accents on dark surfaces), grass green `#22A116`, sun orange `#FE6700`, and white. Forest green carries most of the weight, which keeps the site feeling professional rather than playful. Text colours meet WCAG AA contrast on their backgrounds. The logo is used unaltered on white, and is placed on a white card on dark surfaces.

**Typography.** Archivo Variable, self-hosted (Latin subset, about 90 KB). It is declared with `font-display: optional` and preloaded. Text does not change size mid-read, so the layout does not shift when the font arrives.

**Assets.** Every photo, texture and model is listed once in `src/content/assets.ts`. Components refer to keys only, so replacing an image or model means changing one entry. Each image slot has a fixed aspect ratio, so a swapped photo does not move the page.

**3D photographs are depth-displaced.** A real photograph is mapped onto a subdivided plane, and its depth map (estimated by FastDepth, MIT) moves the vertices, so the displacement changes the rendered geometry. See `docs/PHOTO_PIPELINE.md`.

**3D objects are asset-agnostic.** Each 3D object is a model key (`model.box`, `model.plinth`, …). Scenes ask the model library for an instance; if a `.glb` or `.gltf` file is configured it is loaded, otherwise fallback geometry is built in code. The point of the system is that **scenes never hard-code the size, proportions or position of an asset**:

- Every model is normalised to a contract: largest dimension = the manifest's `fit`, centred on X/Z, base on Y = 0 (`normaliseModel` in `models.ts`).
- `src/three/layout.ts` places objects by their measured bounding boxes. Stacks rest on each other, shelf bays fit their contents, display items sit on a ring inside the plinth, and contact shadows are sized from footprints.
- `frameContent` derives the camera framing from the measured content, so a bigger or smaller replacement model is framed automatically.
- Lighting, shadows, scroll and pointer motion, reduced-motion handling and responsive behaviour do not change.

Dropping in a real product `.glb` therefore re-composes and re-frames the scene with no scene, lighting, camera or animation code changed.

For flat product imagery, the `card` builder shows a photograph on a panel. It is a flat photograph, not a 3D object. Models are treated as static meshes; skinned or animated models need clones made with `SkeletonUtils`, which is not yet wired in.

**One canvas, many scenes.** A single fixed WebGL canvas draws each visible 3D slot into its own viewport, so the page keeps normal scrolling and layout. Scenes load only when their slot approaches the viewport, and the render loop runs only while a slot is on screen.

**Quality and fallbacks.**

| Tier | Used when | What changes |
| --- | --- | --- |
| high | Fine pointer, more than 4 cores and more than 4 GB memory | Pixel ratio up to 2, soft shadow maps, environment lighting |
| medium | Coarse pointer (phones and tablets), or 4 or fewer cores, or 4 GB or less memory | Pixel ratio up to 1.5, shadows, environment lighting |
| low | 2 cores or fewer, or 2 GB or less memory | Pixel ratio up to 1.25, contact shadows only |
| none | No WebGL, Save-Data on, or reduced data requested | No 3D. The static fallback images are shown. |

The stage also watches real frame times. If the median frame rate drops below about 30 fps, it steps down one tier. If even the low tier drops below about 20 fps, 3D is switched off. A lost WebGL context does the same. In every case the static fallback image stays in place and the page still works.

**Motion.** Subtle floating, rotation, lighting, shadows, pointer tilt and scroll-linked movement, all damped so they feel calm. With `prefers-reduced-motion: reduce`:
- scroll reveals are not used, so content is visible at once,
- scenes hold still: no pointer tilt, idle motion or scroll-linked movement,
- the 3D is redrawn only when the page scrolls, resizes or loads, never on a timer.

**Performance.** The prerendered HTML, CSS and client JavaScript total about 17 KB gzipped. The Latin font (90 KB, preloaded) is the largest first-load asset. The three.js runtime (about 165 KB gzipped in total) loads only on devices that can run it. The core stage loads at start-up on capable devices, and each scene's code loads when its slot nears the screen. Images below the fold are lazy-loaded. The logo and the 3D fallback images load eagerly. Every image and 3D slot reserves its space before it loads, so the layout does not shift. A body-level safety net clips accidental horizontal overflow.

**Enquiry form.** Validation runs in the browser, and each field has an accessible error message. A honeypot field catches most bots. Submission has two modes, chosen in `src/content/site.ts`:
- `enquiry.endpoint` set to an HTTPS URL: the enquiry is sent there as JSON.
- `enquiry.endpoint` empty (the default): the visitor's email app opens with the enquiry filled in, addressed to `enquiry.emailTo`. No server is needed.

**Accessibility.** Semantic landmarks, a single `h1`, a skip link, visible focus styles, labelled form fields, and status messages in live regions. The 3D canvas is hidden from assistive technology, and each 3D slot is labelled with a short description. Without JavaScript, the navigation links are shown in the page, and the enquiry form uses the browser's own validation and opens the visitor's email app (a `mailto:` submission). That path has been checked for markup, not in a particular mail client.

---

## Placeholders

Anything the business has not confirmed is a clearly marked placeholder. A "Placeholder" badge appears on images, and an orange highlight marks text. Both are controlled by `features.placeholderMarkers` in `src/content/site.ts`. Set it to `false` once the content is final.

Placeholders include: the street address, phone, email and hours; product category and product names, pack sizes and descriptions; all photography; and the favicon, a simplified mark drawn from the logo. Nothing on the page states a year of trading, customer numbers, certifications, prices, delivery times or capacity. Add those only once they are confirmed.

---

## Quality checks

Run against the production build in headless Chromium, at 360, 390, 768, 1024 and 1440 px, with the following results:

- Build and type-check pass with no warnings.
- No horizontal overflow at any width.
- Cumulative layout shift of 0 on load at every width.
- No console errors, page errors or failed requests on load.
- The hero 3D scene starts on load. The featured and shop-floor scenes start when they are scrolled into view.
- Reduced motion: no animation frames are requested while the page is idle, and reveal animations are not used.
- No JavaScript: all content and the navigation are present, and the enquiry form submits to the visitor's email app.
- 3D blocked at the network level: the page stays complete with the fallback art, and one warning is logged.
- Enquiry form: required-field, email and length validation; focus moves to the first invalid field; a valid submission hands off to the email app and keeps the chosen product.
- Mobile menu opens and closes, and anchor links land below the sticky header.

Contrast was checked for the main text and background pairs. The required-field asterisk uses a deeper orange than the brand orange, because the brand orange on white does not reach the AA threshold for text.

Asset-agnosticism was verified in the browser against the dev server with a temporary check module (run, then removed). It confirmed: every model key normalises to base-on-Y=0, largest-dimension = `fit`, centred on X/Z; a differently-proportioned custom model stacks and arranges with no gaps or overlaps; and a real `.glb` (exported with GLTFExporter, re-loaded with GLTFLoader) normalises correctly through the same path. All checks passed with no console errors.

---

## Before launch

Items that need an owner's decision or real information:

1. **Logo artwork.** The supplied logo file (`public/brand/wada-chovu-logo.jpeg`) reads "WADA CHOVU SERVICES LTD". The site name, alt text and structured data use "Chovu Chovu Brothers Ltd", but the logo image still shows the old name in the header, footer and social preview. Supply the Chovu Chovu Brothers Ltd logo and replace the file (the path can stay the same).
2. **Contact details, address and opening hours** (`src/content/site.ts`).
3. **Production URL** (`site.url`), used for canonical links, social previews and structured data.
4. **Enquiry handling.** Choose an endpoint, or confirm the email address that receives enquiries.
5. **Privacy notice.** The enquiry form collects personal data. Add a privacy notice and link it from the form before launch.
6. **Copy.** Confirm or rewrite the wording in `src/content/copy.ts`, for example the statements about browsing the shop floor, friendly service and clear enquiries.
7. **Photography and models.** See the content guide.
8. **Favicon.** Replace the placeholder mark with the official icon when it is available.
