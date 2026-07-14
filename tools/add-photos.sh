#!/bin/bash
# Turn scans into web-ready photos for the vault.
#
#   tools/add-photos.sh ~/Pictures/scans              # a whole folder
#   tools/add-photos.sh ~/Pictures/scans/*.tif        # some files
#   tools/add-photos.sh ~/scans/roll01.tif ~/other    # any mix of the two
#
# Writes two JPEGs per photo, and never touches your originals:
#   files/photos/NAME.jpg         2000px long edge  — opens when clicked
#   files/photos/thumbs/NAME.jpg   400px long edge  — sits on the vault floor
#
# Takes any format (TIFF, PNG, RAW, JPEG, HEIC...). Folders are searched
# recursively. Anything that isn't an image is skipped with a note, so a
# stray .txt or .DS_Store won't derail the run.
#
# Keep the originals somewhere outside this folder: whatever lands in the
# repo is in git history forever.

set -uo pipefail   # deliberately NOT -e: one bad file must not kill the run

cd "$(dirname "$0")/.."
out="files/photos"
mkdir -p "$out/thumbs"

if [ $# -eq 0 ]; then
  echo "usage: tools/add-photos.sh <image-or-folder> [more...]" >&2
  exit 1
fi

command -v magick >/dev/null || { echo "needs imagemagick: brew install imagemagick" >&2; exit 1; }

converted=0; skipped=0; failed=0
seen=" "   # names used in THIS run (plain string: macOS ships bash 3.2)

slug() {
  printf '%s' "$1" | tr '[:upper:]' '[:lower:]' \
    | tr -cs 'a-z0-9_-' '-' | sed 's/^-*//; s/-*$//'
}

convert_one() {
  local src="$1" name parent n

  # ignore Finder droppings and anything already in files/photos
  case "$(basename "$src")" in .*) return;; esac
  case "$(cd "$(dirname "$src")" && pwd)" in *"/$out"*) return;; esac

  # is it actually an image? ([0] = first page/layer, so a layered PSD or
  # multi-frame TIFF gives one photo instead of name-0.jpg, name-1.jpg, ...)
  if ! magick identify "${src}[0]" >/dev/null 2>&1; then
    printf '  skip  %s (not an image)\n' "$(basename "$src")"
    skipped=$((skipped + 1)); return
  fi

  # "Roll01 Frame 02.TIF" -> "roll01-frame-02"
  name=$(basename "$src"); name=$(slug "${name%.*}")
  [ -n "$name" ] || name="photo"

  # Scans are often named 01.tif, 02.tif inside per-roll folders, so two
  # photos can want the same name. Fold in the folder (roll01/01.tif ->
  # roll01-01), then a counter, rather than overwriting a photo we just
  # wrote. Only collisions *within this run* count — so re-running the
  # script on the same folder updates the files instead of piling up copies.
  if [ "$seen" != "${seen/ $name /}" ]; then
    parent=$(slug "$(basename "$(dirname "$src")")")
    [ -n "$parent" ] && name="$parent-$name"
    n=2
    while [ "$seen" != "${seen/ $name /}" ]; do
      name="${name%-[0-9]*}-$n"; n=$((n + 1))
    done
    printf '  note  duplicate name -> %s\n' "$name.jpg"
  fi
  seen="$seen$name "

  # -auto-orient bakes in rotation, -strip drops EXIF (including GPS)
  if magick "${src}[0]" -auto-orient -resize '2000x2000>' -strip -quality 82 \
       -interlace Plane "$out/$name.jpg" 2>/dev/null &&
     magick "${src}[0]" -auto-orient -resize '400x400>' -strip -quality 80 \
       -interlace Plane "$out/thumbs/$name.jpg" 2>/dev/null; then
    printf '  ok    %-26s full %4sKB   thumb %3sKB\n' "$name.jpg" \
      "$(du -k "$out/$name.jpg" | cut -f1)" \
      "$(du -k "$out/thumbs/$name.jpg" | cut -f1)"
    converted=$((converted + 1))
  else
    printf '  FAIL  %s (could not convert)\n' "$(basename "$src")" >&2
    rm -f "$out/$name.jpg" "$out/thumbs/$name.jpg"
    failed=$((failed + 1))
  fi
}

for arg in "$@"; do
  if [ -d "$arg" ]; then
    # -print0/read -d handles spaces in names; sorted for predictable order
    while IFS= read -r -d '' f; do convert_one "$f"; done \
      < <(find "$arg" -type f -print0 2>/dev/null | sort -z)
  elif [ -f "$arg" ]; then
    convert_one "$arg"
  else
    printf '  skip  %s (no such file or folder)\n' "$arg" >&2
    skipped=$((skipped + 1))
  fi
done

echo
echo "converted $converted, skipped $skipped, failed $failed"
[ "$converted" -eq 0 ] && { echo "nothing to do."; exit 1; }

echo "files/photos is now $(du -sh "$out" | cut -f1)"
cat <<'EOF'

Next: copy the commented vault-photo template in vault.html once per photo
(change NAME and the caption). Then commit.
EOF
