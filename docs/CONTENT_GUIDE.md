# Content guide

How to replace placeholders with real photos, 3D models, copy and business details.

Every change below is made in a single file. Layout, animation and component code do not need to change.

---

## 1. Swap a photo

Each image is an entry in `src/content/assets.ts`. Keys look like `category.one`, `product.two` or `about.image`.

1. Copy the file into `public/`. For example, `public/media/products/rice-25kg.jpg`.
2. Edit the entry in `src/content/assets.ts`:

```ts
'category.one': {
  kind: 'image',
  src: '/media/products/rice-25kg.jpg',   // was the placeholder path
  width: 1200,                             // pixel size of the real file
  height: 900,
  alt: 'Sacks of rice stacked on a pallet', // describe the photo, not the placeholder
  // remove `placeholder: true` once the photo is real
},
```

3. Optional: add responsive versions with `srcset` and `sizes`:

```ts
srcset: '/media/products/rice-25kg-800.webp 800w, /media/products/rice-25kg-1600.webp 1600w',
sizes: '(min-width: 1000px) 25vw, 50vw',
```

4. Rebuild. The image keeps its frame ratio, so nothing moves on the page.

Tips:
- Product and category photos are shown at **4:3**. Warehouse and team photos are shown at **4:5** in an arch frame. Location photos are shown at **16:10**.
- Use `position` (for example `'50% 30%'`) to choose the visible part of a photo when it is cropped.
- Use `alt: ''` only for purely decorative images.

---

## 2. Replace a 3D placeholder with a .glb or .gltf model

The 3D objects are model keys: `model.carton`, `model.pallet`, `model.tin`, `model.sack`, `model.rack`, `model.plinth`. Each uses built-in placeholder geometry until a file is set.

1. Export the model as **.glb** (preferred) or .gltf. Keep it to a single static mesh if possible, and keep the file small (ideally under 1 MB).
2. Copy it to `public/models/`, for example `public/models/carton.glb`.
3. Set `url` on the matching entry in `src/content/assets.ts`:

```ts
'model.carton': {
  kind: 'model',
  builder: 'carton',          // still the fallback if the file cannot load
  url: '/models/carton.glb',
  fit: 1,                     // largest dimension, in scene units
},
```

What happens:
- The file is loaded on demand, only when a 3D scene needs it. The GLTF loader is a separate chunk.
- The model is scaled so its largest dimension equals `fit`, and its base is centred on the origin. Scenes place models by their base, so the composition is unchanged.
- If the file is missing or fails to load, the placeholder is used and a warning is logged. The page keeps working.

Notes:
- Animated or skinned models are not supported by the current clone step. Export them static, or ask for an update that uses `SkeletonUtils`.
- Materials and textures inside the .glb are used as exported. Scenes add lights and shadows around them.
- Keep the model's real proportions. `fit` sets the size, not the shape.

---

## 3. Change the carton label artwork

The label printed on placeholder cartons comes from `texture.cartonLabel`:

```ts
'texture.cartonLabel': {
  kind: 'texture',
  src: '/brand/wada-chovu-logo.jpeg',   // change to label artwork or a product photo
},
```

Use a file with a plain background and a 3:2-ish ratio. The label is printed on the front face of each carton.

---

## 4. Update the business details

Everything is in `src/content/site.ts`.

| Field | What it controls |
| --- | --- |
| `name`, `legalName` | Header, titles, footer legal line. `legalName` must match the registered name. |
| `url` | Production address, used for canonical links, social previews and structured data. Leave empty until the domain is known. |
| `description` | Search and social description. |
| `contact.address` | Address lines (one entry per line). |
| `contact.phone`, `contact.email`, `contact.whatsapp` | Contact channels. `href` makes the value a link (`tel:`, `mailto:`, `https://`). |
| `contact.hours` | Opening hours. |
| `social` | Social profile links. Each entry is shown only when it has an `href`. |
| `enquiry.endpoint` | HTTPS endpoint for the enquiry form (see section 6). |
| `enquiry.emailTo` | Address that receives enquiries when the email fallback is used. |
| `features.placeholderMarkers` | Shows the "Placeholder" markers. Set to `false` once content is final. |
| `features.threeD` | Turns the 3D scenes on or off. When off, the fallback images are used everywhere. |

To mark a contact value as confirmed, set its `placeholder` flag to `false` (or remove it). This also removes its orange highlight.

---

## 5. Products and categories

Entries are in `src/content/products.ts`.

```ts
{
  id: 'category-one',         // unique, used for anchors and tracking
  name: 'Rice and grains',
  summary: 'Bulk rice in sizes for trade and food-service customers.',
  image: 'category.one',      // an image key from assets.ts
  placeholder: false,
},
```

- To add a category or product, copy an entry, give it a unique `id`, and add an image entry in `assets.ts`. The grids take any number of items and wrap automatically.
- Pack sizes are free text (`packSize`). Leave wording such as "to be confirmed" if you do not have a fixed pack size.
- Product names appear in the enquiry form's "Product or category" list automatically.
- No prices appear anywhere. Add prices only when they are confirmed and you are ready to publish them.

---

## 6. Enquiry form

The form is in `src/content/site.ts` under `enquiry`.

- **No endpoint (default):** when a visitor submits, their email app opens with the enquiry filled in, addressed to `emailTo`. Nothing is stored on a server.
- **With an endpoint:** the form sends a JSON `POST` to `endpoint` with these fields: `name`, `company`, `email`, `phone`, `product`, `quantity`, `location`, `message`, `page` and `submittedAt`. Any service that accepts JSON will work, and so will a small API you run yourself. The endpoint must allow CORS from your site's origin if it is on a different domain.

Before launch, add a link to a privacy notice from the form. The form collects personal data.

---

## 7. Copy and wording

All visitor-facing text is in `src/content/copy.ts`, grouped by section. Edit it there. Do not put text inside the layout files.

Guidance for the copy:
- Use plain, factual sentences. Avoid superlatives you cannot back up.
- Do not add years of trading, customer counts, certifications, delivery times, prices or capacity unless they are confirmed.
- The wording in "Why choose us" and "Scale & distribution" describes how the business works, not measured results. Keep it that way unless figures are available.

---

## 8. Placeholder artwork

The placeholder illustrations are generated by `scripts/generate-placeholders.mjs` into `public/media/placeholders/`. They are for development and as a no-3D fallback until real photos are supplied. After you replace an image in `assets.ts`, the old placeholder file can be deleted.

To regenerate them:

```bash
npm run placeholders
```

---

## 9. Checklist before publishing

- [ ] Real photos replace all placeholder images (`placeholder` flags removed).
- [ ] Contact details, address and hours confirmed (`site.ts`).
- [ ] Legal name and production URL set.
- [ ] Enquiry endpoint set, or the email address confirmed.
- [ ] Privacy notice written and linked from the enquiry form.
- [ ] Product and category text confirmed (`products.ts`, `copy.ts`).
- [ ] `features.placeholderMarkers` set to `false`.
- [ ] Favicon replaced with the official icon.
- [ ] `npm run build` passes, and `npm run preview` looks right at phone and desktop widths.
