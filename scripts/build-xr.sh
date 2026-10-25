#!/bin/bash
#
# Rebuilds the mixed-reality viewers in xr/nova/ and xr/mecha/ from the Docker
# apps' web/xr sources, patched for static hosting:
#   - the model's .glb comes from ?glb= (the gallery index), not /api/glb
#   - the Draco decoder comes from viewer/vendor/gltf/draco/
#   - relative asset paths, so each build works from its own folder
#
# Usage: ./scripts/build-xr.sh [nova-docker checkout] [mecha-docker checkout]
#   defaults: ../ldraw-nova-docker (branch pre-release-02) and
#             ../ldraw-mecha-docker (branch pre-release)
# Needs Node.js and npm.

set -euo pipefail

cd "$(dirname "$0")/.."
site="$PWD"
work="$(mktemp -d)"
trap 'rm -rf -- "${work:?}"' EXIT

build() {
  local name="$1" source="$2"
  if [ ! -f "$source/web/xr/package.json" ]; then
    echo "No web/xr in $source" >&2
    exit 1
  fi
  cp -r "$source/web/xr" "$work/$name"
  rm -rf -- "${work:?}/$name/node_modules" "${work:?}/$name/dist"
  python3 -I - "$work/$name" <<'PYTHON'
import sys
root = sys.argv[1]

def patch(path, old, new):
    text = open(path).read()
    if text.count(old) != 1:
        sys.exit(f"{path}: expected one {old!r}")
    open(path, "w").write(text.replace(old, new))

patch(f"{root}/src/model.ts",
      "  const response = await fetch(`/api/glb?url=${encodeURIComponent(modelUrl)}`);",
      '''  // Static hosting: the gallery index gives the .glb next to the model (?glb=).
  const glbUrl = new URLSearchParams(location.search).get("glb") ?? (/\\.glb$/i.test(modelUrl.split("?")[0]) ? modelUrl : null);
  if (!glbUrl) throw new Error("Couldn't load the model: no .glb is available for it");
  const response = await fetch(glbUrl);''')
patch(f"{root}/src/model.ts",
      'setDecoderPath("/viewer/vendor/gltf/draco/")',
      'setDecoderPath(new URL("../../viewer/vendor/gltf/draco/", location.href).href)')
patch(f"{root}/vite.config.ts", 'base: "/xr/",', 'base: "./", // static hosting: served from /xr/<project>/')
PYTHON
  (cd "$work/$name" && npm ci --no-audit --no-fund && npx tsc --noEmit && npx vite build)
  rm -rf -- "${site:?}/xr/$name"
  mkdir -p "$site/xr/$name"
  cp -r "$work/$name/dist/." "$site/xr/$name/"
  echo "xr/$name rebuilt from $source"
}

build nova "${1:-../ldraw-nova-docker}"
build mecha "${2:-../ldraw-mecha-docker}"
