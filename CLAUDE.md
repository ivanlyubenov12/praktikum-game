# CLAUDE.md

Project: **Баланс**, a Bulgarian-language chemical equation balancing game with randomised alkali metals /
halogens. Read `README.md` first, then the relevant file in `docs/`.

## Ground rules

- **Single file app for UI code.** All UI code lives in `index.html`. No bundler, no npm, no framework. Keep
  it that way unless the user asks otherwise. Two small supporting files sit next to it: `custom-content.json`
  (data, see below) and `sw.js` (a service worker, see below) — both are plain static files, not a build step.
- **The game needs to be hosted and online**, not opened via `file://`. It's served from GitHub Pages and
  fetches `custom-content.json` (repo root, next to `index.html`) at load — that's how content edits reach
  every computer instead of staying stuck in one browser's `localStorage`. If that fetch fails (no
  connectivity) the game shows `#offline` instead of playing. This was a deliberate tradeoff the user chose
  over a purely offline app — see `docs/EDITOR.md`.
- **`sw.js` is a service worker that precaches `index.html` and `vendor/MaterialIcons.woff2` only**, so that
  even a fully cold page load with no connectivity at all still reaches `index.html`'s own JS (and thus
  `#offline`) instead of the browser's native error page. Registered near the bottom of `index.html`
  (`navigator.serviceWorker.register('sw.js')`), swallowing any failure — it's a progressive enhancement, the
  app must work identically if it's unsupported or fails to register. **`sw.js` must never intercept or cache
  `custom-content.json`** (or anything else) — that fetch has to hit the network live every time, or published
  content stops propagating. If `sw.js` ever needs new shell assets, add them to its `SHELL` array, not by
  broadening what it intercepts.
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
- **`TEMPLATES`/`COLORS` are defaults, not what the game actually plays.** Three layers stack into
  `ACTIVE_TEMPLATES`/`ACTIVE_COLORS`/`ACTIVE_SCORING` via `rebuildActive()`: the hardcoded defaults below, then
  `published` (fetched from `custom-content.json`, shared with everyone), then `custom` (this browser's
  `localStorage`, local-only until exported and published). **Runtime code must read the `ACTIVE_*` globals,
  never the defaults directly** — `generateSet`, `loadEq`, `renderCounter`, `check`, `hint`, `updateScore`,
  `finish` all do this already. New runtime code should too. Full design: `docs/EDITOR.md`.
- **There are no levels.** Every game draws `GAME_LENGTH` (12) equations at random from the whole active
  template pool — there is no grouping, ordering, or per-group minimum. Don't reintroduce a `lvl` field on
  templates.
- **Every string that can originate from `custom`/`published` (a formula, a note, an element symbol, a
  colour, an id) must go through `escHtml()` before it lands in `innerHTML` or an HTML attribute**, and every
  colour value through `safeColor()` before a `style="background:...":` — `published` is fetched from the
  network, so it's untrusted the same way any external input is, not just "whatever the local editor's own
  validation already allowed." A crafted `custom-content.json` is a realistic attacker who never touches the
  editor UI at all. New rendering code that displays a formula/note/element/colour/id must follow the pattern
  already used in `render()`, `renderCounter()`, `renderEqList()`, `renderColorsForm()`, `renderScoringForm()`,
  `renderEqForm()`, `check()`, `hint()`, `validateForm()`. **`toRuntimeTemplate()` also coerces `sol` through
  `Number(n)||0`** — the same reason: an untrusted `sol` array can otherwise carry a non-numeric string all
  the way into `coefs[]` via `hint()`'s `coefs[i]=e.sol[i]` (which, unlike the +/− buttons, does no arithmetic
  that would force numeric coercion on its own), and from there into `render()`'s `.coef` display.
- **The editor's "Публикувай в GitHub" button (`doGhPublish()`) stores a GitHub PAT in `localStorage`
  (`GH_TOKEN_KEY`) and calls the GitHub Contents API directly from the browser.** Never log, display more than
  the last 4 characters of, or send that token anywhere except `api.github.com`. Never bake a token into
  `index.html`, a commit, or `custom-content.json` itself.

## Where things are (in `index.html`)

1. `<style>`: CSS variables (light/dark), layout, icon font.
2. HTML: six sections `#loading`, `#offline`, `#start`, `#game`, `#end`, `#editor`. `#loading` is visible by
   default; `init()` (bottom of the script) picks the real one once `custom-content.json` has been fetched
   (or shows `#offline` if that fetch throws).
3. `<script>` block, in order:
   data (`COLORS`, name tables, `TEMPLATES`) → helpers (`parse`, `escHtml`, `safeColor`, `pretty`, `eqText`) →
   the custom-content layer (`custom`, `published`, `mergeLayer()`, `rebuildActive()`, `ACTIVE_*`, see
   `docs/EDITOR.md`) → generator (`generateSet` etc.) → `/* състояние */` game state and flow → editor UI
   functions (including the GitHub-publish block: `GH_TOKEN_KEY`/`doGhPublish()`/`renderGhPublish()`, right
   after `resetCustom()`) → event wiring → `loadPublished()`/`init()` (the `fetch()` call and the `#offline`
   fallback).
   `tools/validate.js` relies on the `/* ---------- състояние` marker and on everything above it having no
   DOM dependencies and no network calls: **do not reference `document`/`window` (beyond `matchMedia`), and
   do not call `fetch`, above that marker.** `loadCustom()`'s `localStorage` access is wrapped in try/catch
   for the same reason — it throws (caught, falls back to empty) inside `tools/validate.js`'s Node VM, which
   has neither `localStorage` nor `fetch`. `published` starts as `emptyCustom()` above the marker (so
   `tools/validate.js` still validates the exact hardcoded defaults, unaffected by the network layer) and is
   only ever replaced by `loadPublished()`, below the marker. The service worker registration is the very
   last line of the script, after `init()`.

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

- Do not add any network calls in `index.html` beyond `fetch(PUBLISHED_URL)` in `loadPublished()` (automatic,
  on every load) and the `api.github.com` calls in `doGhPublish()` (user-initiated, only on clicking
  **Публикувай в GitHub**). Do not call `fetch` (or anything else DOM/network-dependent) above the
  `/* ---------- състояние` marker.
- Do not make `sw.js` intercept or cache `custom-content.json`, or add any other caching to it beyond the
  `SHELL` files — see the `sw.js` ground rule above.
- Do not render a formula/note/element/colour from `custom` or `published` into the page without
  `escHtml()`/`safeColor()` — see the ground rule above.
- Do not put `<form>` tags around the controls; the app uses button handlers.
- Do not make any equation depend on a non-deterministic source other than the seeded PRNG in `generateSet`.
