#!/usr/bin/env bash
set -euo pipefail

# ── Config (adapted for Pagex — no build step, files at root) ──
OUT_DIR="release"
MANIFEST="manifest.json"

# ── Read version ───────────────────────────────────
if [[ ! -f "$MANIFEST" ]]; then
  echo "ERROR: $MANIFEST not found." >&2
  exit 1
fi

VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$MANIFEST" \
  | head -1 | grep -o '"[^"]*"$' | tr -d '"')
if [[ -z "$VERSION" ]]; then
  echo "ERROR: Could not parse version from $MANIFEST" >&2
  exit 1
fi

ZIP_NAME="pagex-v${VERSION}.zip"

echo "Preparing release v${VERSION}..."
echo ""

# ── Verify zip exists ──────────────────────────────
if [[ ! -f "$OUT_DIR/$ZIP_NAME" ]]; then
  echo "ERROR: $OUT_DIR/$ZIP_NAME not found. Run 'npm run package' first." >&2
  exit 1
fi

# ── Copy store icon ────────────────────────────────
if [[ -f "assets/icons/pagex-128.png" ]]; then
  cp assets/icons/pagex-128.png "$OUT_DIR/icon-128.png"
  echo "  copied icon-128.png"
fi

# ── Copy screenshots ──────────────────────────────
i=1
for f in store-assets/screenshots/*.png; do
  if [[ -f "$f" ]]; then
    cp "$f" "$OUT_DIR/screenshot-${i}.png"
    echo "  copied $(basename "$f") -> screenshot-${i}.png"
    i=$((i + 1))
  fi
done

# ── Copy promo images ─────────────────────────────
if [[ -f "store-assets/promo/pagex-small-promo-440x280.png" ]]; then
  cp store-assets/promo/pagex-small-promo-440x280.png "$OUT_DIR/small-promo.png"
  echo "  copied small-promo.png"
fi

if [[ -f "store-assets/promo/pagex-marquee-1400x560.png" ]]; then
  cp store-assets/promo/pagex-marquee-1400x560.png "$OUT_DIR/marquee-promo.png"
  echo "  copied marquee-promo.png"
fi

# ── Copy privacy policy ──────────────────────────
if [[ -f "docs/store-listing/privacy-policy-en.md" ]]; then
  cp docs/store-listing/privacy-policy-en.md "$OUT_DIR/PRIVACY_POLICY.md"
  echo "  copied PRIVACY_POLICY.md"
fi

# ── Copy chrome_release_req template ─────────────
if [[ -f "docs/store-listing/chrome_release_req.md" ]]; then
  cp docs/store-listing/chrome_release_req.md "$OUT_DIR/chrome_release_req.md"
  echo "  copied chrome_release_req.md"
fi

# ── Summary ───────────────────────────────────────
echo ""
echo "Release v${VERSION} prepared in $OUT_DIR/:"
echo ""
ls -lh "$OUT_DIR/"
echo ""

SIZE=$(wc -c < "$OUT_DIR/$ZIP_NAME" | tr -d ' ')
SIZE_KB=$((SIZE / 1024))
echo "Zip size: ${SIZE_KB} KB"

if [[ $SIZE -gt 10485760 ]]; then
  echo "WARNING: zip exceeds 10MB recommended limit"
fi

echo ""
echo "Next steps:"
echo "  1. Review $OUT_DIR/chrome_release_req.md"
echo "  2. Open https://chrome.google.com/webstore/devconsole"
echo "  3. Upload $OUT_DIR/$ZIP_NAME"
echo "  4. Fill Dashboard fields from chrome_release_req.md"
echo "  5. Upload images from $OUT_DIR/"
echo "  6. Submit for review"
