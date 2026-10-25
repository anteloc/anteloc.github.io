# Viewers

The 3D viewers of the LDraw Nova and LDraw Mecha web apps
([ldraw-nova-docker](https://github.com/anteloc/ldraw-nova-docker), branch
`pre-release-02`, and
[ldraw-mecha-docker](https://github.com/anteloc/ldraw-mecha-docker), branch
`pre-release`), adapted for GitHub Pages, where there is no backend.

| Path | What | From |
|---|---|---|
| `nova/viewer.html`, `player.html`, `instructions.*`, `glb-view.js` | Nova's 3D view, 3D player and build instructions | `web/viewer/` of ldraw-nova-docker |
| `mecha/viewer.html`, `player.html`, `glb-view.js` | Mecha's 3D view (animated GLB) and player | `web/viewer/` of ldraw-mecha-docker |
| `../xr/nova/`, `../xr/mecha/` | Mixed reality (WebXR, Meta Quest 3) | `web/xr/`, built by `scripts/build-xr.sh` |
| `static.js` | What the apps' backend provided: the parts library, the theme, downloads | this site |
| `vendor/ldbi`, `vendor/js` | buildinginstructions.js and library.ldraw.org's scene (MIT) | [ldraw-org/ldraworg-library](https://github.com/ldraw-org/ldraworg-library) at `a38efc7a` |
| `vendor/gltf` | three.js r139 GLTFLoader and DRACOLoader; Draco and meshopt decoders from super-three 0.181.0 | npm `three@0.139.2`, `super-three@0.181.0` |
| `player-vendor` | ldraw-player 0.8.1 (Rust → WebAssembly) | `vendor/ldraw-player-0.8.1.zip` of the Docker apps |

## Changes from the apps

- Parts come from the LDraw library at
  [anteloc/ldraw-lib](https://github.com/anteloc/ldraw-lib/tree/master/ldraw)
  (`raw.githubusercontent.com`), trying `parts/`, `p/` and `models/` in turn
  instead of the backend's one-request resolver. `?lib=<url>` points the
  viewers at another LDraw folder.
- The model's `.glb` (and Mecha's `.mpd` and `.blend`) are passed in the URL
  (`?glb=`, `?mpd=`, `?blend=`) from the gallery indexes, instead of being
  looked up or converted by the backend.
- Dark theme by default (`?theme=light` for the original look).

The landing page builds every viewer URL from `models-gallery-nova.json` and
`models-gallery-mecha.json` (see `scripts/refresh-indexes.sh`).
