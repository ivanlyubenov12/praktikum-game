# CLAUDE.md

Project: **Баланс**, a Bulgarian-language chemical equation balancing game with randomised alkali metals /
halogens. Read `README.md` first, then the relevant file in `docs/`.

## Ground rules

- **Single file app.** All code lives in `index.html`. No bundler, no npm, no framework. Keep it that way
  unless the user asks otherwise. It must run by double-clicking the file on an offline school computer.
- **UI language is Bulgarian.** All user-visible strings (including equation notes) are Bulgarian. Code,
  comments and docs are English (except `SEMINAR.md`, which is Bulgarian on purpose).
- **Icons are the Material Icons webfont**, self-hosted at `vendor/MaterialIcons.woff2` (no CDN, no fallback —
  see `docs/TESTING-AND-ROADMAP.md`). Use `<span class="material-icons" aria-hidden="true">icon_name</span>`
  next to a real Bulgarian text label, never instead of one. Check a name exists in the font before using it
  (https://fonts.google.com/icons, classic "Material Icons" family, not "Material Symbols").
- **Chemistry must be correct and 7th-grade level.** No organic chemistry, no redox balancing, no ions or
  charges. A template must be chemically valid for **every** element it allows. If it is not (e.g. fluorine with
  water, LiHCO₃), restrict `vars` or `ok`. Reasons for existing restrictions are in `docs/SCIENCE.md`.
- **Coefficients do not depend on the chosen metal or halogen.** That is what makes templates work. If a
  reaction needs different coefficients for different elements, it needs separate templates.
- The user is a student presenting this at a school seminar. Keep the code readable and explainable.
  Prefer simple and obvious over clever.
- **`TEMPLATES`/`LEVELS`/`PER_LEVEL`/`COLORS` are defaults, not what the game actually plays.** The in-app
  content editor (`docs/EDITOR.md`) layers player edits from `localStorage` on top of them into
  `ACTIVE_TEMPLATES`/`ACTIVE_LEVELS`/`ACTIVE_PER_LEVEL`/`ACTIVE_COLORS`/`ACTIVE_SCORING`. **Runtime code must
  read the `ACTIVE_*` globals, never the defaults directly** — `generateSet`, `loadEq`, `renderCounter`,
  `check`, `hint`, `updateScore`, `finish` all do this already. New runtime code should too.

## Where things are (in `index.html`)

1. `<style>`: CSS variables (light/dark), layout, icon font.
2. HTML: four sections `#start`, `#game`, `#end`, `#editor`.
3. `<script>` block, in order:
   data (`COLORS`, name tables, `LEVELS`, `TEMPLATES`) → helpers (`parse`, `pretty`, `eqText`) → the
   custom-content layer (`custom`, `rebuildActive()`, `ACTIVE_*`, see `docs/EDITOR.md`) → generator
   (`generateSet` etc.) → `/* състояние */` game state and flow → editor UI functions → event wiring.
   `tools/validate.js` relies on the `/* ---------- състояние` marker and on everything above it having no
   DOM dependencies: **do not reference `document` or `window` (beyond `matchMedia`) above that marker.**
   `loadCustom()`'s `localStorage` access is wrapped in try/catch for this reason — it throws (caught, falls
   back to empty) inside `tools/validate.js`'s Node VM, which has no `localStorage`.

## Common tasks

- **Add an equation:** add a template to `TEMPLATES` (see `docs/ARCHITECTURE.md`). New element → add it to
  `COLORS` (used by the atom-count table's chip). Players can also add/edit equations at runtime without
  touching code — see `docs/EDITOR.md`.
- **Change scoring:** the *defaults* are `SCORING_DEFAULT`; `check()`, `hint()`, `updateScore()`, `finish()`
  read `ACTIVE_SCORING`, which the editor can override.

## Before you finish any change

1. Run `node tools/validate.js`. It must exit 0.
2. If you touched anything visual, check it in a real browser using `docs/TESTING-AND-ROADMAP.md`.
3. Update the affected file in `docs/` in the same change.
4. If you could not open the page in a browser, say so plainly.

## Do not

- Do not load anything from the network at runtime.
- Do not put `<form>` tags around the controls; the app uses button handlers.
- Do not make any equation depend on a non-deterministic source other than the seeded PRNG in `generateSet`.
