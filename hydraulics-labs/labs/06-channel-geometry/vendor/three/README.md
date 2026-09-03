# Vendored Three.js

`channel_geometry.html` renders its 3D scene with Three.js. That dependency is vendored
here rather than loaded from a CDN so the module runs with no network connection, like
the other seven laboratories, and so an archived release stays reproducible after any CDN
changes or disappears.

| | |
|---|---|
| Version | **r160** (npm `three@0.160.0`) |
| Upstream | https://github.com/mrdoob/three.js |
| Licence | MIT — see `LICENSE` in this directory |
| Produced by | `node tools/vendor-three.mjs` |

## Classic scripts, deliberately

Both files load as **classic `<script src>` tags**, not ES modules. This is not a
stylistic preference:

> Browsers block ES-module imports from a `file://` origin under CORS. A vendored
> `import ... from './vendor/three/three.module.js'` works perfectly over
> `http://localhost` and fails silently the moment someone opens the `.html` straight
> from disk — which is the primary way these laboratories are used.

That regression shipped once and is now covered by
[`tests/software/file-protocol.spec.mjs`](../../../tests/software/file-protocol.spec.mjs),
which loads every module over `file://` on all three engines. Classic script tags carry
no such CORS restriction.

## Files

| Path here | Upstream path in the npm package | Modified? |
|---|---|---|
| `three.min.js` | `build/three.min.js` | no — shipped as UMD, attaches `window.THREE` itself |
| `OrbitControls.js` | `examples/jsm/controls/OrbitControls.js` | yes — see below |

`OrbitControls` ships only as an ES module, so `tools/vendor-three.mjs` rewrites it
mechanically. Exactly two substitutions are made, and the script fails loudly if either
pattern is missing rather than emitting a silently broken file:

```
import { ... } from 'three';   →   const { ... } = THREE;
export { OrbitControls };      →   THREE.OrbitControls = OrbitControls;
```

The result is wrapped in an IIFE so the ten destructured symbols stay off the global
scope. Nothing else in the file is touched. Do not hand-edit it — re-run the script.

## A note on the console warning

`three.min.js` prints a deprecation warning on load: the UMD builds were deprecated at
r150 and upstream intended to remove them at r160. The warning is upstream's own text and
is left unmodified, but in this context it is misleading: the build is **vendored and
pinned**, so nothing can remove it from underneath us. It is a `console.warn`, not an
error, and the test suite's clean-load assertions are unaffected.

The alternative — inlining the ES module as a `data:` URL to keep the modern build —
would add roughly a megabyte of base64 to the page and make it unreadable, for no
functional gain.

## Updating

```bash
npm install --save-dev three@<version>
node tools/vendor-three.mjs
npm test
```

The script re-derives everything, removes any stale ES-module copies, and reports how
many symbols it rebound. Update the version in the table above at the same time.
`tests/software/self-contained.spec.mjs` will fail if a module ever reaches for a
third-party host again, and `file-protocol.spec.mjs` will fail if it ever stops working
from disk.
