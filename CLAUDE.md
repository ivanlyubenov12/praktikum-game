# CLAUDE.md

Project: **Баланс**, a Bulgarian-language chemical equation balancing game with 3D molecules and randomised
alkali metals / halogens. Read `README.md` first, then the relevant file in `docs/`.

## Ground rules

- **Single file app.** All code lives in `index.html`. No bundler, no npm, no framework. Keep it that way
  unless the user asks otherwise. It must run by double-clicking the file on an offline school computer.
- **UI language is Bulgarian.** All user-visible strings (including equation notes) are Bulgarian. Code,
  comments and docs are English (except `SEMINAR.md`, which is Bulgarian on purpose).
- **three.js r128, global build** (`vendor/three.min.js`, `THREE` global). Do not switch to ES modules or a
  newer version without checking that `file://` loading still works. `OrbitControls` is not bundled;
  rotation is implemented by hand in `Viewer`.
- **Chemistry must be correct and 7th-grade level.** No organic chemistry, no redox balancing, no ions or
  charges. A template must be chemically valid for **every** element it allows. If it is not (e.g. fluorine with
  water, LiHCO₃), restrict `vars` or `ok`. Reasons for existing restrictions are in `docs/SCIENCE.md`.
- **Coefficients do not depend on the chosen metal or halogen.** That is what makes templates work. If a
  reaction needs different coefficients for different elements, it needs separate templates.
- The user is a student presenting this at a school seminar. Keep the code readable and explainable.
  Prefer simple and obvious over clever.

## Where things are (in `index.html`)

1. `<style>`: CSS variables (light/dark), layout, 3D panes.
2. HTML: three sections `#start`, `#game`, `#end`.
3. `<script>` block, in order:
   data (`COLORS`, name tables, `LEVELS`, `TEMPLATES`) → helpers (`parse`, `pretty`, `eqText`) →
   generator (`generateSet` etc.) → `/* състояние */` game state and flow → `/* 3D */` (`RAD`, `SHAPES`,
   `shapeOf`, `prepMol`, `Viewer`, `update3D`, `init3D`) → event wiring.
   `tools/validate.js` relies on these markers and on the data + shapes sections having no DOM/THREE dependencies:
   **do not reference `document`, `window` (beyond `matchMedia`) or `THREE` above the `const _prep` line.**

## Common tasks

- **Add an equation:** add a template to `TEMPLATES` (see `docs/ARCHITECTURE.md`). If it uses a new molecule
  shape, add it to `SHAPES`; new element → `COLORS`, `RAD`, and the valence table in `tools/validate.js`.
- **Change scoring:** `check()`, `hint()`, `updateScore()`.
- **Change 3D look:** `RAD`, `S`, `atomMat`, `buildMol`, lights in the `Viewer` constructor.

## Before you finish any change

1. Run `node tools/validate.js`. It must exit 0.
2. If you touched anything visual, check it in a real browser using `docs/TESTING-AND-ROADMAP.md`.
3. Update the affected file in `docs/` in the same change.
4. If you could not open the page in a browser, say so plainly.

## Do not

- Do not load anything from the network at runtime except the three.js CDN fallback.
- Do not put `<form>` tags around the controls; the app uses button handlers.
- Do not make any equation depend on a non-deterministic source other than the seeded PRNG in `generateSet`.
