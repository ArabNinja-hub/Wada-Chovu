#!/usr/bin/env python3
"""Fetch the monocular depth model used by process-photos.py.

Model: FastDepth (Wofk et al., ICRA 2019, MIT licence), exported to ONNX and packaged in the
npm package `com.bonjour-lab.monoculardepth` (MIT). The .onnx file is extracted from the
published tarball and checked against a pinned SHA-256, so the exact weights are reproducible.

Usage:  python3 scripts/depth/fetch-model.py
Output: scripts/depth/models/fastdepth_7.onnx (git-ignored)
"""
import hashlib
import io
import os
import sys
import tarfile
import urllib.request

TARBALL = "https://registry.npmjs.org/com.bonjour-lab.monoculardepth/-/com.bonjour-lab.monoculardepth-1.0.8-preview.tgz"
MEMBER = "package/ONNX/fastdepth_7.onnx"
SHA256 = "6275c23f467d476874d0eecea2a2c7059733ca6681de4f17bfbfe3fc3a52a71d"  # verified on first download
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "models", "fastdepth_7.onnx")


def main() -> int:
    if os.path.exists(OUT) and SHA256 != "PIN_ME" and sha256(OUT) == SHA256:
        print(f"Model already present and verified: {OUT}")
        return 0
    print(f"Downloading {TARBALL}")
    data = urllib.request.urlopen(TARBALL, timeout=120).read()
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as tar:
        blob = tar.extractfile(MEMBER).read()
    digest = hashlib.sha256(blob).hexdigest()
    print(f"sha256 {digest}")
    if SHA256 == "PIN_ME":
        print("No pinned hash yet. Pin the printed value into SHA256 after reviewing it.")
    elif digest != SHA256:
        print("Hash mismatch. Refusing to write the model.", file=sys.stderr)
        return 1
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "wb") as f:
        f.write(blob)
    print(f"Wrote {OUT} ({len(blob) // 1024} KB)")
    return 0


def sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


if __name__ == "__main__":
    raise SystemExit(main())
