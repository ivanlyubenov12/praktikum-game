# Content editor

A screen inside `index.html` that lets a player or teacher change every piece of game content without touching
code: scoring, element colours, and the equations themselves (add, edit, delete — built-in ones included).
There is no link to it from the start screen (so players don't stumble into it) — open it directly with
`index.html?editor=1`. `show('editor')` is triggered by that URL param at page load, and **Назад** returns to
the normal start screen.

## Why this design

The app has no database or backend, so edits are layered on top of the code's built-in content rather than
written into it. There are **three layers**, each optional and each overriding the one before it:

1. **`TEMPLATES`/`COLORS`/`SCORING_DEFAULT`** — the hardcoded defaults in `index.html`, unchanged and still
   fully checked by `tools/validate.js`. Nothing the editor does can corrupt this — it's read, never written.
2. **`published`** — fetched from `custom-content.json` at the repo root, at page load. This is how edits reach
   *every* computer that opens the game, not just the browser they were made in — see **Publishing** below.
3. **`custom`** — this browser's own `localStorage`, layered on top of `published`. Lets you draft or
   personally tweak content without publishing it for everyone yet.

`rebuildActive()` applies layer 2 on top of layer 1, then layer 3 on top of that result (via `mergeLayer()`,
called twice), into the globals the rest of the game actually reads: `ACTIVE_TEMPLATES`, `ACTIVE_COLORS`,
`ACTIVE_SCORING`. Every runtime function (`generateSet`, `loadEq`, `renderCounter`, `check`, `hint`, ...) reads
the `ACTIVE_*` versions, never the raw defaults directly — see `docs/ARCHITECTURE.md`. There are no levels:
`generateSet` samples `GAME_LENGTH` equations at random from the whole `ACTIVE_TEMPLATES` pool, so the editor
has nothing level-related to expose.

## Data model

`published` and `custom` are both the same shape (`normalizeCustom()` enforces it everywhere one is read —
from `localStorage`, an uploaded file, or the network):

```js
{
  templates: [ {id, left, right, sol, vars, noteTpl}, ... ],  // additions AND overrides (matched by id)
  deletedIds: ['some-builtin-id', ...],                       // built-in templates to hide
  colors: {El: '#hex', ...},  // merged on top of the previous layer's colours
  scoring: {base, mistake, hint, maxCoef}  // merged on top of the previous layer's scoring
}
```

`custom` is loaded from `localStorage` (key `balans_custom_v1`) on page load and saved back after every edit.
`published` starts as `emptyCustom()` and is replaced by `loadPublished()` (an async `fetch`, below the
`/* ---------- състояние` marker) once `custom-content.json` has loaded — see `docs/ARCHITECTURE.md`.

Editing a template whose `id` matches one from the previous layer **overrides** it (the original stays where it
was, just hidden behind the override); a new `id` (auto-generated as `custom-<timestamp36>`) **adds** one.
Deleting a template from a previous layer records its id in `deletedIds` rather than trying to remove it;
deleting one added in the current layer just drops it from `templates`.

## Publishing

Editing in the browser only ever touches the local `custom` layer (`localStorage`) — nobody else sees it until
you publish:

1. Make your changes in the editor as usual.
2. Click **Изтегли** to download the JSON.
3. Replace `custom-content.json` at the repo root with that file, and commit + push it.
4. GitHub Pages redeploys automatically; anyone who (re)loads the game now gets your content as the
   `published` layer, merged under their own local `custom` overrides if they have any.

This is the one deliberate exception to "no code editing needed" — publishing for everyone requires a git
commit, not just clicking around the editor. A single browser's own local edits never need this step.

## The note-template mini-language

Built-in templates use a JS function for `note` (`v => `...``), which can do anything — that's how e.g. the
NaClO/pool-chlorine aside in `x2-moh`'s note works. The editor can't safely let a player write arbitrary JS, so
templates added or overridden through the editor use a **plain-text template with tokens** instead
(`renderNoteTemplate`), stored as `noteTpl`:

| Token | Meaning |
|---|---|
| `{M}` / `{X}` | The symbol actually chosen for that placeholder (e.g. `Na`, `Cl`) |
| `{Mname}` / `{Xname}` | Bulgarian element name (`натрий`, `хлор`) |
| `{Madj}` | Bulgarian adjective form, alkali metals only (`натриев`) |
| `{Xhalide}` | Bulgarian halide-salt name, halogens only (`хлорид`) |

When editing a built-in template through the UI, the form is pre-filled with the *output* of its real note
function for one example combination, as a starting point — the original function itself is not editable, and
saving always replaces it with the token-template text.

## What the editor does not support

- **More than two variables, or an `ok` filter.** Only `{M}` (alkali metal) and `{X}` (halogen) are supported;
  a template like `x2-my` (halogen displacement — three variables plus an activity filter) shows in the list
  with its Edit button disabled and a tooltip explaining why. It can still be deleted.
- **Arbitrary chemistry-note logic.** See the token language above — good enough for "X reacts with Y to give Z",
  not for prose that branches on which specific element was picked beyond simple substitution.
- **Live multi-device sync.** Publishing (see above) is a manual git commit, not automatic — a change isn't
  visible elsewhere until it's pushed and the page is reloaded. **Качи файл** (import) loads a JSON into the
  current browser's local `custom` layer only, and replaces its customisations wholesale — it does not merge,
  and it does not publish anything.

## Validation

Every add/edit runs `checkTemplateBalance()` on every keystroke, which:

1. Confirms every `{M}`/`{X}` used in a formula has at least one element checked for it.
2. Enumerates *every* allowed element combination (reusing `enumerate()`, the same function `generateSet` and
   `tools/validate.js` use) and checks the atom counts balance for **all** of them, not just the one you're
   looking at — this is what "coefficients don't depend on the chosen element" (`CLAUDE.md`) means in practice.
3. Checks the coefficients are the smallest whole numbers (`gcd`).

The Save button is disabled until all of this passes. This is a browser-side equivalent of
`tools/validate.js`, necessarily — Node scripts don't run in the page.

## Manual testing

See the "Content editor" section of `docs/TESTING-AND-ROADMAP.md`.
