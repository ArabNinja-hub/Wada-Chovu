# Content guide

How to replace placeholders with real photos, 3D models, copy and business details.

Every change below is made in a single file. Layout, animation and component code do not need to change.

---

## 1. Swap a photo

Photographs live in `src/content/assets.ts`. Each entry names a file under `public/` and its size.

1. Put the new file in `public/media/` (for example `public/media/shop/front.jpg`).
2. Change `src` on the matching key and set `width` and `height` to the file's pixel size.
3. Set `alt` to a real description. Remove `placeholder: true` once the photo is real.

For a photo that should be a 3D depth scene, follow `docs/PHOTO_PIPELINE.md`. It gives a depth map from
the photo, so the 3D scene uses the real image.

## 2. Replace a 3D object with a .glb or .gltf model

The 3D objects are model keys: `model.box` (generic placeholder packaging, a GLB file from the Khronos sample set, see `public/models/CREDITS.md`) and `model.plinth` (procedural). To use your own model:

1. Copy the file into `public/models/` (for example `public/models/rice-bag.glb`).
2. Set `url` on the matching `model.*` entry, such as `url: '/models/rice-bag.glb'`.
3. Set `fit` (the largest dimension in scene units) if the new object needs a different size.

If a file fails to load, the builder named on the entry is shown instead and a warning is logged.

## 2b. Flat product photos

The `card` builder is a flat panel that shows a product photograph. It is not a 3D object. Point
`texture.productCard` at the photo and set a model key's `builder` to `'card'`.

## 3. Change the box label artwork

The box fallback geometry prints `texture.cartonLabel` on its front. Point `src` at label artwork
under `public/`. The `model.box` GLB has its own texture and does not use this label.

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
  summary: 'Describe this range of products in one or two sentences.',
  image: 'category.one',      // an image key from assets.ts
  placeholder: false,
},
```

- To add a category or product, copy an entry, give it a unique `id`, and add an image entry in `assets.ts`. The grids take any number of items and wrap automatically.
- Sizes are free text (`size`). Leave wording such as "to be confirmed" if you do not have a fixed pack size.
- Product names appear in the enquiry form's "Product or category" list automatically.
- No prices appear anywhere. Add prices only when they are confirmed and you are ready to publish them.

---

## 6. Enquiry form

The form is in `src/content/site.ts` under `enquiry`. It sends enquiries in one of three ways, and it never falls back to a placeholder address:

- **Endpoint:** `enquiry.endpoint` is a valid `https://` URL on a real domain. The form sends a JSON `POST` there.
- **Email:** `enquiry.endpoint` is empty and `enquiry.emailTo` is a real address (not `example.com`, `example.net`, `example.org`, `.test`, `.invalid`, `.localhost`). The visitor's email app opens with the enquiry filled in. Nothing is stored on a server.
- **Not connected (the default now):** both are empty or reserved. The form is disabled, a notice says enquiries are not connected, and nothing is sent. The build prints a warning until one of the other two is set. `npm run build` does not fail for this, so the site can still deploy while contact details are confirmed.

The rules are in `isUsableEmail`, `isUsableEndpoint` and `enquiryChannel` in `site.ts`. The deploy guard (`scripts/verify-dist.mjs`) fails the build if any `mailto:` link in the output points at a reserved domain.
- **Endpoint:** the form sends a JSON `POST` to `endpoint` with these fields: `name`, `company`, `email`, `phone`, `product`, `quantity`, `location`, `message`, `page` and `submittedAt`. Any service that accepts JSON will work, and so will a small API you run yourself. The endpoint must allow CORS from your site's origin if it is on a different domain.

Before launch, add a link to a privacy notice from the form. The form collects personal data.

---

## 7. Copy and wording

All visitor-facing text is in `src/content/copy.ts`, grouped by section. Edit it there. Do not put text inside the layout files.

Guidance for the copy:
- Use plain, factual sentences. Avoid superlatives you cannot back up.
- Do not add years of trading, customer counts, certifications, delivery times, prices or capacity unless they are confirmed.
- Do not promise a reply time, service levels, product availability, shop-floor help or stock that has not been confirmed. The copy says "ask us" rather than "we will have it".
- The wording in "Why choose us" and "In the shop" describes how the shop works, not measured results. Keep it that way unless figures are available.

---

## 8. Stand-in artwork and credits

Every photograph currently in the repository is a stand-in with a licence recorded in
`src/content/assets.ts` (`source`, `license`) and in `docs/PHOTO_PIPELINE.md`. Replace each
one with the shop's own photographs. The alt text of each stand-in says it is not a photograph
of the shop. The placeholder badge stays visible until `placeholder: true` is removed. The
deploy guard fails the build if a photo entry is missing `placeholder: true`, `source` or `license`.
No stand-in may show another business's name or signage.

## 9. Checklist before publishing

- [ ] Real photos replace all placeholder images (`placeholder` flags removed).
- [ ] Contact details, address and hours confirmed (`site.ts`).
- [ ] Legal name and production URL set.
- [ ] Enquiry endpoint set, or a real enquiry email confirmed (the form stays disabled until then).
- [ ] Footer email and phone replaced (`contact.email`, `contact.phone`).
- [ ] Privacy notice written and linked from the enquiry form.
- [ ] Product and category text confirmed (`products.ts`, `copy.ts`).
- [ ] `features.placeholderMarkers` set to `false`.
- [ ] Favicon replaced with the official icon.
- [ ] `npm run build` passes, and `npm run preview` looks right at phone and desktop widths.
