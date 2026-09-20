# 3D rendering

Library: **three.js r128**, global build, loaded from `vendor/three.min.js` (fallback: cdnjs, same version).
Initialised on `window.load` by `init3D()`. If `THREE` is undefined or WebGL fails, `#card3d` is hidden and the
game continues without 3D.

## What is shown

Two canvases: reactants (`#cvL`) and products (`#cvR`). Each shows **every molecule as many times as its
coefficient** (2 H₂ → two H₂ molecules). When the equation is balanced, both panels contain the same atoms,
grouped differently: the visual version of the law of conservation of mass. The pane border turns green when
`isBalanced()`.

## Objects

- **Atom**: `SphereGeometry` + `MeshStandardMaterial`; colour from `COLORS`, radius from `RAD`.
- **Bond**: unit-height `CylinderGeometry` (radius 0.07), scaled along Y to the bond length, rotated with
  `Quaternion.setFromUnitVectors`. Double bond = 2 parallel cylinders (offset ±0.11), triple = 3 (−0.2, 0, +0.2).
- **Molecule**: a `THREE.Group`, centred on its atom centroid.
- **Scene**: ambient + one directional light, transparent canvas so the page theme shows through.

Geometries and materials are cached (`_geo`, `_mat`, `_bondGeo`); rebuilding on every click only creates meshes.

## Shapes (`SHAPES`) and how a formula finds its shape

Because metals and halogens are random, shapes are written with placeholders:

```js
'MX':  {a:[['M',-.8,0,0],['X',.8,0,0]], b:[[0,1,1]]},        // NaCl, KBr, LiF, CsI ...
'M2CO3': carbonate('M','M',1.2,1.2),                          // built by a helper function
```

- `a`: atoms `[element, x, y, z]`. `M` = the alkali metal in the formula, `X` = the halogen.
- `b`: bonds `[atomIndexA, atomIndexB, order 1|2|3]`.

`shapeOf(formula)`:

1. Replace each alkali symbol with `M` and each halogen symbol with `X` to get a **key** (`KBr` → `MX`,
   `Cs2CO3` → `M2CO3`, `HClO` → `HXO`, `AlCl3` → `AlX3`). The original symbols are remembered in `map`.
2. Look up `SHAPES[formula]` first (exact, e.g. `H2O`, `Ca(OH)2`), else `SHAPES[key]`.
3. `prepMol` substitutes the real elements (`map`) so radius and colour are right.

A formula can contain at most one alkali metal and one halogen. If you need two different halogens in one
formula (e.g. `NaClO` is fine, `ICl` is not), extend `shapeOf`.

## Automatic bond scaling (`prepMol`)

Radii differ a lot (Li 0.45 … Cs 0.95), so fixed coordinates would overlap or float. After centring, all positions
are multiplied by a factor `k` (minimum 0.75) chosen so that **every bond is at least (r₁ + r₂ + 0.5) long**. The
centroid is re-centred, and the molecule's bounding radius `r` is computed for the grid layout.

## Layout and camera (`Viewer.rebuild`)

1. Flat list of molecules (formula repeated `count` times).
2. Cell size `sp = 2 × largest molecule radius + 0.5`.
3. Columns = `round(sqrt(n × aspect))`, rows = `ceil(n / cols)`; the last row is centred.
4. Camera distance fits the whole grid for both height and width (fov 40°), ×1.15 margin.
5. Deterministic random orientation per molecule (`rnd(i)`), so the picture is stable between clicks.
6. `ResizeObserver` on the canvas calls `resize()` → `rebuild()`.

## Interaction and animation

- One shared `requestAnimationFrame` loop drives both viewers. Hidden canvases are skipped.
- Auto-rotation about Y; each molecule spins slowly and bobs a little.
- Drag to rotate. Horizontal drag rotates about Y. Vertical drag rotates about X **for mouse only**; on touch
  screens `touch-action: pan-y` lets the page scroll.
- `prefers-reduced-motion`: no auto-rotation, spin or bobbing; dragging still works.

## How to add a molecule

1. Add a `SHAPES` entry. Use `M`/`X` if the formula is a metal or halogen compound; use the exact formula otherwise.
   Bond counts must equal school valence (H 1, O 2, N 3, C 4, halogens 1, alkali 1, Ag 1, Al 3, P 5, Hg 2, Ca 2).
2. New element: add `COLORS`, `RAD`, and the valence list in `tools/validate.js`.
3. Run `node tools/validate.js`. Then look at it in a browser: bonds should be visible but short.

## Known limits

- No shadows, no atom labels, no picking.
- Up to ~40 molecules per pane are fine. The largest realistic case is 6 HCl + 2 Al.
- Not tested on a real device yet (no browser was available when this was written).
