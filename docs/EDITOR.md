# Content editor

A screen inside `index.html` (open **Редактор на съдържание** from the start screen) that lets a player or
teacher change every piece of game content without touching code: level names, scoring, element colours, and
the equations themselves (add, edit, delete — built-in ones included).

## Why this design

The app is a single offline HTML file with no server (`CLAUDE.md`). That rules out a database or a backend for
storing edits, so the editor works as a **layer of overrides on top of the code's built-in content**, persisted
in the browser via `localStorage` and portable via export/import of a JSON file.

## Data model

Built-in content stays exactly as it always was: `TEMPLATES`, `LEVELS`, `PER_LEVEL`, `COLORS` in `index.html`,
unchanged and still fully checked by `tools/validate.js`. Nothing the editor does can corrupt this — it's read,
never written.

A second object, `custom`, holds everything the player has changed:

```js
{
  templates: [ {id, lvl, left, right, sol, vars, noteTpl}, ... ],  // additions AND overrides (matched by id)
  deletedIds: ['some-builtin-id', ...],                            // built-in templates to hide
  levels: [...] | null,       // replaces LEVELS wholesale, or null = use default
  perLevel: [...] | null,     // replaces PER_LEVEL wholesale, or null = use default
  colors: {El: '#hex', ...},  // merged on top of COLORS
  scoring: {base, mistake, hint, maxCoef}  // merged on top of SCORING_DEFAULT
}
```

`custom` is loaded from `localStorage` (key `balans_custom_v1`) on page load and saved back after every edit.
`rebuildActive()` merges it with the built-in defaults into the four globals the rest of the game actually
reads: `ACTIVE_TEMPLATES`, `ACTIVE_LEVELS`, `ACTIVE_PER_LEVEL`, `ACTIVE_COLORS`, `ACTIVE_SCORING`. Every runtime
function (`generateSet`, `loadEq`, `renderCounter`, `check`, `hint`, ...) reads the `ACTIVE_*` versions, never
the raw defaults directly — see `docs/ARCHITECTURE.md`.

Editing a template whose `id` matches a built-in one **overrides** it (the built-in stays in the code, just
hidden behind the override); a new `id` (auto-generated as `custom-<timestamp36>`) **adds** one. Deleting a
built-in template records its id in `deletedIds` rather than trying to remove code; deleting a custom one just
drops it from `templates`.

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
- **Multi-device sync.** Edits live in one browser's `localStorage`. Use **Изтегли** (export) to get a JSON
  file and **Качи файл** (import) to load it into another browser/computer — import replaces the current
  customisations wholesale, it does not merge.

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
