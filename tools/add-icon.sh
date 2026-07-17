#!/bin/bash
# Add Line Awesome icons to the sprite, so you can actually use them.
#
#   tools/add-icon.sh globe utensils hat-wizard
#   tools/add-icon.sh --list            # what's already in the sprite
#
# Only icons present in files/la-sprite.svg render. Using a name that isn't
# there fails SILENTLY — no error, just an invisible icon — which is why this
# script exists. Names come from https://icons8.com/line-awesome (use the
# plain name, e.g. "globe" for la-globe).

set -uo pipefail
cd "$(dirname "$0")/.."
sprite="files/la-sprite.svg"
base="https://raw.githubusercontent.com/icons8/line-awesome/master/svg"

[ -f "$sprite" ] || { echo "no $sprite here" >&2; exit 1; }

if [ "${1:-}" = "--list" ] || [ "${1:-}" = "-l" ]; then
  echo "icons in the sprite:"
  grep -o 'id="la-[a-z0-9-]*"' "$sprite" | sed 's/id="la-/  /; s/"//' | sort
  exit 0
fi

if [ $# -eq 0 ]; then
  echo "usage: tools/add-icon.sh <name> [name...]   (or --list)" >&2
  exit 1
fi

tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
added=0; skipped=0; failed=0

for name in "$@"; do
  name="${name#la-}"   # tolerate "la-globe" as well as "globe"

  if grep -q "id=\"la-$name\"" "$sprite"; then
    echo "  have   la-$name"; skipped=$((skipped + 1)); continue
  fi

  # line-awesome files are NAME-solid.svg; fall back to the bare name
  if ! curl -sfL -o "$tmp/$name.svg" "$base/$name-solid.svg" &&
     ! curl -sfL -o "$tmp/$name.svg" "$base/$name.svg"; then
    echo "  FAIL   la-$name — no such icon (check the name at icons8.com/line-awesome)" >&2
    failed=$((failed + 1)); continue
  fi

  python3 - "$tmp/$name.svg" "$name" "$sprite" <<'PY'
import re, sys, pathlib
src, name, sprite_path = sys.argv[1], sys.argv[2], pathlib.Path(sys.argv[3])
raw = pathlib.Path(src).read_text()
vb = re.search(r'viewBox="([^"]+)"', raw)
vb = vb.group(1) if vb else "0 0 32 32"
inner = re.sub(r'^.*?<svg[^>]*>', '', raw, flags=re.S)
inner = re.sub(r'</svg>\s*$', '', inner, flags=re.S).strip()
sprite = sprite_path.read_text()
sprite = sprite.replace('</svg>', f'<symbol id="la-{name}" viewBox="{vb}">{inner}</symbol>\n</svg>')
sprite_path.write_text(sprite)
PY
  echo "  added  la-$name"; added=$((added + 1))
done

echo
echo "added $added, already present $skipped, failed $failed"
echo "sprite now holds $(grep -c '<symbol' "$sprite") icons"
[ "$added" -gt 0 ] && cat <<'EOF'

Use it in vault.html like the others:
    <use href="/files/la-sprite.svg#la-NAME"/>

Then HARD-refresh the browser (Cmd+Shift+R) — the sprite caches aggressively,
and a normal reload will keep showing the old one.
EOF
exit 0
