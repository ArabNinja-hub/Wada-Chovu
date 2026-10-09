#!/usr/bin/env python3
"""Turn source photographs into depth-ready assets for the site.

For every entry in scripts/depth/photos.json this script:
  1. runs a monocular depth network (FastDepth, ONNX, see fetch-model.py) on the photo,
  2. upsamples and smooths the raw depth to the photo's resolution,
  3. writes two files under public/media/photos/:
       <id>.jpg        display photograph (long edge <= MAX_EDGE, EXIF removed)
       <id>-depth.png  8-bit greyscale depth map, same size. WHITE = NEAR, BLACK = FAR.
  4. prints the dimensions to copy into the asset manifest (src/content/assets.ts).

The site's Three.js renderer (src/three/photo-depth.ts) reads the depth map and displaces a
subdivided plane along its normal. The depth map therefore changes the rendered geometry.

Usage:
  pip install -r scripts/depth/requirements.txt
  python3 scripts/depth/fetch-model.py
  python3 scripts/depth/process-photos.py --sources /path/to/original/photos [--only id]

Originals are not stored in the repository. Keep them outside Git and point --sources at them.
"""
import argparse
import json
import os
import sys

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
MODEL = os.path.join(HERE, "models", "fastdepth_7.onnx")
MANIFEST = os.path.join(HERE, "photos.json")
OUT_DIR = os.path.join(REPO, "public", "media", "photos")
MODEL_SIZE = 224          # FastDepth input is 224 x 224 RGB, values scaled to 0..1
MAX_EDGE = 1280           # long edge of the published photo and depth map
BLUR_RADIUS = 3.0         # smooths the coarse 224 px depth before it is used for displacement
LOW_PCT, HIGH_PCT = 1.0, 99.0  # robust normalisation so outliers do not flatten the depth range


def predict_depth(session: ort.InferenceSession, image: Image.Image) -> np.ndarray:
    """Returns raw depth (larger = farther) at MODEL_SIZE x MODEL_SIZE, shape (H, W)."""
    small = image.convert("RGB").resize((MODEL_SIZE, MODEL_SIZE), Image.BILINEAR)
    x = np.asarray(small, dtype=np.float32) / 255.0
    x = np.transpose(x, (2, 0, 1))[None, ...]
    input_name = session.get_inputs()[0].name
    out = session.run(None, {input_name: x})[0]
    return out.reshape(MODEL_SIZE, MODEL_SIZE).astype(np.float32)


def to_near_map(raw: np.ndarray, size: tuple[int, int]) -> Image.Image:
    """Resize raw depth to `size`, normalise, invert so near = white, return 8-bit greyscale."""
    lo, hi = np.percentile(raw, [LOW_PCT, HIGH_PCT])
    norm = np.clip((raw - lo) / max(hi - lo, 1e-6), 0.0, 1.0)
    near = (1.0 - norm) * 255.0  # raw depth grows with distance, so invert
    img = Image.fromarray(near.astype(np.uint8), mode="L").resize(size, Image.BILINEAR)
    return img.filter(ImageFilter.GaussianBlur(BLUR_RADIUS))


def fit_long_edge(width: int, height: int) -> tuple[int, int]:
    scale = min(1.0, MAX_EDGE / max(width, height))
    return max(1, round(width * scale)), max(1, round(height * scale))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--sources", required=True, help="Folder containing the original photos.")
    parser.add_argument("--only", help="Process a single photo id from photos.json.")
    args = parser.parse_args()

    if not os.path.exists(MODEL):
        print("Model missing. Run scripts/depth/fetch-model.py first.", file=sys.stderr)
        return 1
    with open(MANIFEST, encoding="utf-8") as f:
        entries = json.load(f)["photos"]
    session = ort.InferenceSession(MODEL, providers=["CPUExecutionProvider"])
    os.makedirs(OUT_DIR, exist_ok=True)

    for entry in entries:
        if args.only and entry["id"] != args.only:
            continue
        source = os.path.join(args.sources, entry["file"])
        image = Image.open(source)
        image = image.convert("RGB")
        width, height = fit_long_edge(*image.size)

        raw = predict_depth(session, image)
        depth = to_near_map(raw, (width, height))
        display = image.resize((width, height), Image.LANCZOS)

        photo_path = os.path.join(OUT_DIR, f"{entry['id']}.jpg")
        depth_path = os.path.join(OUT_DIR, f"{entry['id']}-depth.png")
        display.save(photo_path, "JPEG", quality=84, optimize=True, progressive=True)
        depth.save(depth_path, "PNG", optimize=True)
        print(f"{entry['id']}: {width}x{height}  raw depth {raw.min():.2f}..{raw.max():.2f}  -> {os.path.relpath(photo_path, REPO)}, {os.path.relpath(depth_path, REPO)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
