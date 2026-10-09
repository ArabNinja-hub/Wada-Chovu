# Photo depth pipeline and 3D photo scenes

The site shows real photographs. Each photograph used in a 3D scene has a depth map, and the
renderer uses that map to displace the photograph's geometry. A photo shown on a flat plane is not
described as 3D anywhere on the site.

## How it works

1. **Depth estimation** (`scripts/depth/process-photos.py`). A monocular depth network
   estimates the distance of every pixel from a single photograph. The model is **FastDepth**
   (Wofk et al., ICRA 2019; MIT licence), exported to ONNX and packaged in the npm package
   `com.bonjour-lab.monoculardepth` (MIT). Input is 224×224 RGB scaled to 0–1; output is depth,
   where a larger value is farther away. The output is resized to the photo, normalised with 1st
   and 99th percentiles, inverted so that **white = near and black = far**, and lightly blurred.
2. **Published files.** Each photo becomes `public/media/photos/<id>.jpg` (display image) and
   `public/media/photos/<id>-depth.png` (8-bit greyscale depth map). Both are at most 1280 px on
   the long edge.
3. **Rendering** (`src/three/photo-depth.ts`, `src/three/scenes/photo.ts`). A subdivided plane is
   textured with the photograph. Its vertices move along the normal by `(depth − 0.5) × depthScale`
   in the vertex shader, so the geometry the camera sees is the displaced surface. Relief shading
   uses the slope of the same depth map. The view moves with an idle sway and with the pointer,
   which shows real parallax. Reduced motion holds the plane still; the relief stays.
4. **Fallback.** Without WebGL, or if the depth scene fails, the same real photograph is shown
   as a static image. No illustrations are used.

## Limits (be honest about these)

- FastDepth works at 224 px. Depth edges are soft, and the floor and object edges can stretch a
  little under displacement. Better results need a stronger model (for example Depth Anything V2)
  with its weights supplied; see "Using another depth model" below.
- Monocular depth is a relative estimate learned from indoor and outdoor photographs. It is not a
  measured scan, so distances are approximate.
- Photographs of other businesses (stand-ins) are used until the shop's own photographs are
  supplied. Their alt text says so.

## Adding a photograph (no animation code)

1. Keep the original file outside the repository. Add an entry to `scripts/depth/photos.json`
   with `id`, `file`, `sourceUrl`, `license` and `subject`. Only add photos whose licence allows
   publishing on a public website.
2. Set up once:
   ```sh
   python3 -m venv .venv-depth && . .venv-depth/bin/activate
   pip install -r scripts/depth/requirements.txt
   python3 scripts/depth/fetch-model.py        # downloads and verifies the model (SHA-256 pinned)
   ```
3. Run:
   ```sh
   python3 scripts/depth/process-photos.py --sources /path/to/originals [--only <id>]
   ```
   It prints the width and height of each output.
4. Add a `photo.<name>` entry to `src/content/assets.ts` (`kind: 'photo'`, `src`, `depth`, `width`,
   `height`, `alt`, `source`, `license`, optional `depthScale`).
5. Use it:
   - a 3D depth scene: `renderStageSlot({ scene: 'hero', fallback: 'photo.<name>' })` (any stage
     slot can show any photo; the `data-photo` attribute carries the key);
   - a plain photograph: `renderImage('photo.<name>')`.

Rebuild with `npm run build`. `.venv-depth/`, `scripts/depth/models/` and the originals are
git-ignored and not deployed.

## Using another depth model

Any ONNX monocular depth model with a single-channel output can replace FastDepth. Change `MODEL`,
`MODEL_SIZE` and the input normalisation in `process-photos.py`, and pin its SHA-256 in
`fetch-model.py`. Depth Anything V2 Small is a candidate, but its weights were not reachable from
the build environment, so it was **not** used.

## Current photographs

| Asset key | File | Source | Licence | Status |
| --- | --- | --- | --- | --- |
| `photo.hero` | `counter.jpg` / `counter-depth.png` | https://unsplash.com/photos/a-minimalist-shop-with-shelves-and-products-nzisN6dYiV8 | Unsplash License | Stand-in (not the Chovu Chovu shop) |
| `photo.shopFloor` | `interior.jpg` / `interior-depth.png` | https://unsplash.com/photos/interior-of-a-well-stocked-grocery-store-with-aisles-of-goods-yKn3cfE_XXU | Unsplash License | Stand-in (another business's shop) |
| `featured.fallback`, `texture.productCard`, category and product images | `tins.jpg` | https://www.pexels.com/search/canned%20food/ | Pexels License | Stand-in product photograph |

Still needed from the shop: a photo of the **exterior**, a photo of the **pouches** and a
product photo set. None of these has a licensed replacement in the repository yet.

## 3D models

| Asset key | File | Source | Licence |
| --- | --- | --- | --- |
| `model.bottle` | `public/models/water-bottle.glb` | Khronos glTF Sample Models, WaterBottle | CC0 1.0 |
| `model.produce` | `public/models/avocado.glb` | Khronos glTF Sample Models, Avocado | CC0 1.0 |
| `model.box` | `public/models/box-textured.glb` | Khronos glTF Sample Models, BoxTextured | CC BY 4.0 (attribution in `public/models/CREDITS.md`) |

These are placeholders. They are not Chovu Chovu products. Textures were reduced to 512 px with
`@gltf-transform/cli`.

## Verification

- `npm run build` runs the type check, the production build, and `scripts/verify-dist.mjs`. The
  deploy guard fails if any `.svg` file or SVG markup is in `dist/`.
- Browser checks at 360–1440 px, normal and reduced motion: no horizontal overflow, zero layout
  shift, and no console errors. The no-WebGL path shows the real photographs.
