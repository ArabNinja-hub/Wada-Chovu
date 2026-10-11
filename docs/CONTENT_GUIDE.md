# Content guide

How to replace placeholders with real copy and business details.

Every change below is made in a single file. Layout and component code do not need to change.

---

## 1. Update the business details

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
| `enquiry.endpoint` | HTTPS endpoint for the enquiry form (see section 3). |
| `enquiry.emailTo` | Address that receives enquiries when the email fallback is used. |
| `features.placeholderMarkers` | Shows the "Placeholder" markers. Set to `false` once content is final. |

To mark a contact value as confirmed, set its `placeholder` flag to `false` (or remove it). This also removes its orange highlight.

---

## 2. Products and categories

Entries are in `src/content/products.ts`.

```ts
{
  id: 'category-one',         // unique, used for anchors and tracking
  name: 'Rice and grains',
  summary: 'Describe this range of products in one or two sentences.',
  placeholder: false,
},
```

- To add a category or product, copy an entry and give it a unique `id`. The grids take any number of items and wrap automatically.
- Sizes are free text (`size`). Leave wording such as "to be confirmed" if you do not have a fixed pack size.
- Product names appear in the enquiry form's "Product or category" list automatically.
- No prices appear anywhere. Add prices only when they are confirmed and you are ready to publish them.

---

## 3. Enquiry form

The form is in `src/content/site.ts` under `enquiry`. It sends enquiries in one of three ways, and it never falls back to a placeholder address:

- **Endpoint:** `enquiry.endpoint` is a valid `https://` URL on a real domain. The form sends a JSON `POST` there.
- **Email:** `enquiry.endpoint` is empty and `enquiry.emailTo` is a real address (not `example.com`, `example.net`, `example.org`, `.test`, `.invalid`, `.localhost`). The visitor's email app opens with the enquiry filled in. Nothing is stored on a server.
- **Not connected (the default now):** both are empty or reserved. The form is disabled, a notice says enquiries are not connected, and nothing is sent. The build prints a warning until one of the other two is set. `npm run build` does not fail for this, so the site can still deploy while contact details are confirmed.

The rules are in `isUsableEmail`, `isUsableEndpoint` and `enquiryChannel` in `site.ts`. The deploy guard (`scripts/verify-dist.mjs`) fails the build if any `mailto:` link in the output points at a reserved domain.
- **Endpoint:** the form sends a JSON `POST` to `endpoint` with these fields: `name`, `company`, `email`, `phone`, `product`, `quantity`, `location`, `message`, `page` and `submittedAt`. Any service that accepts JSON will work, and so will a small API you run yourself. The endpoint must allow CORS from your site's origin if it is on a different domain.

Before launch, add a link to a privacy notice from the form. The form collects personal data.

---

## 4. Copy and wording

All visitor-facing text is in `src/content/copy.ts`, grouped by section. Edit it there. Do not put text inside the layout files.

Guidance for the copy:
- Use plain, factual sentences. Avoid superlatives you cannot back up.
- Do not add years of trading, customer counts, certifications, delivery times, prices or capacity unless they are confirmed.
- Do not promise a reply time, service levels, product availability, shop-floor help or stock that has not been confirmed. The copy says "ask us" rather than "we will have it".
- The wording in "Why choose us" and "In the shop" describes how the shop works, not measured results. Keep it that way unless figures are available.

---

## 5. Checklist before publishing

- [ ] Contact details, address and hours confirmed (`site.ts`).
- [ ] Legal name and production URL set.
- [ ] Enquiry endpoint set, or a real enquiry email confirmed (the form stays disabled until then).
- [ ] Footer email and phone replaced (`contact.email`, `contact.phone`).
- [ ] Privacy notice written and linked from the enquiry form.
- [ ] Product and category text confirmed (`products.ts`, `copy.ts`).
- [ ] `features.placeholderMarkers` set to `false`.
- [ ] Favicon replaced with the official icon.
- [ ] `npm run build` passes, and `npm run preview` looks right at phone and desktop widths.
