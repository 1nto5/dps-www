#!/usr/bin/env bash
#
# Rebuilds the two web fonts the site ships: Bricolage Grotesque (headings)
# and Golos Text (body).
#
# Why a script and not four files copied out of node_modules: Polish needs both
# the `latin` and the `latin-ext` slice of both families at once, so all four
# of Fontsource's files always downloaded — 215 KB before a single word was
# read. One subset file per family, cut to the characters the site actually
# uses, is a quarter of that.
#
# Why the sources are downloaded instead of taken from
# `node_modules/@fontsource-variable/*`: those files are already cut into
# `latin` / `latin-ext` slices with no overlap (`latin` has no `ą`, `latin-ext`
# has no `a`), and the two cannot be put back together — `fonttools merge`
# refuses variable fonts outright. So the subset is cut from the upstream
# variable font, which is the same font Fontsource itself is built from. The
# downloads are cached in `.cache/fonts/` and are only needed when this script
# runs; the build never touches the network.
#
# Both axes the site uses are kept: Bricolage's `opsz`, which is what draws the
# 54px hero and the 20px card titles correctly, and `wght`, which covers every
# weight asked for. The upstream Bricolage carries one more — `wdth`
# — that no rule on this site ever sets; they are frozen at their default
# values, which is exactly the two-axis font Fontsource shipped before. Keeping
# them variable cost tens of KB for nothing.
#
# Usage: bun run fonts
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CACHE="$ROOT/.cache/fonts"
OUT="$ROOT/src/assets/fonts"

# Characters the fonts must be able to draw. A superset of what the pages hold
# today; `scripts/check-font-coverage.mjs` fails the build if content ever
# reaches past it.
#
#   U+0020-007E  basic Latin: letters, digits, punctuation
#   U+00A0       no-break space          U+00AD  soft hyphen
#   U+00A7 §     U+00A9 ©     U+00AB «   U+00BB »
#   U+00B0 °     U+00B7 ·     U+00D7 ×
#   U+00D3/F3    Óó   (Polish, but they live in Latin-1)
#   U+0104-0107  Ąą Ćć        U+0118-0119  Ęę
#   U+0141-0144  Łł Ńń        U+015A-015B  Śś
#   U+0179-017C  Źź Żż
#   U+2010,2013-2014  hyphen, en dash, em dash
#   U+2018-201A,201C-201E  the single and double quotes, Polish ones included
#   U+2026 …     U+20AC €
UNICODES='U+0020-007E,U+00A0,U+00A7,U+00A9,U+00AB,U+00AD,U+00B0,U+00B7,U+00BB,U+00D3,U+00D7,U+00F3,U+0104-0107,U+0118-0119,U+0141-0144,U+015A-015B,U+0179-017C,U+2010,U+2013-2014,U+2018-201A,U+201C-201E,U+2026,U+20AC'

if ! command -v uv >/dev/null 2>&1; then
  echo "error: uv is not installed — https://docs.astral.sh/uv/getting-started/" >&2
  exit 1
fi

# `[woff]` pulls in brotli, without which fontTools cannot write woff2.
FT=(uvx --quiet --from "fonttools[woff]")

mkdir -p "$CACHE" "$OUT"

# Upstream variable fonts, both SIL Open Font License 1.1. Their licence texts
# stay in node_modules with the Fontsource packages, and every name record
# (copyright and licence included) is carried into the subset below.
fetch() {
  local file="$1" url="$2"
  if [ ! -s "$CACHE/$file" ]; then
    echo "downloading $file"
    curl -fsSL -o "$CACHE/$file" "$url"
  fi
}
fetch BricolageGrotesque.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/bricolagegrotesque/BricolageGrotesque%5Bopsz%2Cwdth%2Cwght%5D.ttf"
fetch GolosText.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/golostext/GolosText%5Bwght%5D.ttf"

# Freeze the axes nothing on the site drives. `pyftsubset` cannot remove an
# axis, so this runs first and writes a two-axis Bricolage beside the original.
echo "freezing unused axes…"
"${FT[@]}" python - "$CACHE" <<'PY'
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

cache = sys.argv[1]
font = TTFont(f"{cache}/BricolageGrotesque.ttf")
keep = {"opsz", "wght"}
pin = {a.axisTag: a.defaultValue for a in font["fvar"].axes if a.axisTag not in keep}
instancer.instantiateVariableFont(font, pin, inplace=True)
font.save(f"{cache}/BricolageGrotesque-opsz-wght.ttf")
print("  Bricolage Grotesque: froze " + ", ".join(f"{t}={v:g}" for t, v in pin.items()))
PY

# Layout features are left at pyftsubset's own default set — ccmp, kern, liga,
# locl, the fraction and numerator features, and the `rvrn` variations that
# carry Bricolage's optical-size letterforms. Asking for every feature instead
# (`--layout-features='*'`) drags in small caps, ten stylistic sets, oldstyle
# figures and their alternate glyphs: it doubled Source Sans 3 to 40 KB for
# features no rule on this site turns on.
subset() {
  local src="$1" dst="$2"
  "${FT[@]}" pyftsubset "$CACHE/$src" \
    --output-file="$OUT/$dst" \
    --flavor=woff2 \
    --unicodes="$UNICODES" \
    --name-IDs='*' \
    --notdef-outline \
    --recalc-average-width
}

echo "subsetting…"
subset BricolageGrotesque-opsz-wght.ttf bricolage-grotesque-subset.woff2
subset GolosText.ttf golos-text-subset.woff2

# The character list the build-time coverage check reads. Writing it here keeps
# that check dependency-free: it is plain Node against a committed JSON file,
# so CI needs neither uv nor a font parser.
"${FT[@]}" python "$ROOT/scripts/subset-report.py" "$OUT" "$ROOT"

report() {
  local total=0 size
  for f in "$@"; do
    size=$(wc -c <"$f" | tr -d ' ')
    total=$((total + size))
    printf '  %9d B  %s\n' "$size" "$(basename "$f")"
  done
  printf '  %9d B  total (%d files)\n' "$total" "$#"
}

echo
echo "subset:"
report "$OUT/bricolage-grotesque-subset.woff2" "$OUT/golos-text-subset.woff2"
