# Architecture

One file, `index.html`. No modules. Everything is global inside a single `<script>` block.

## Screens

`show(id)` toggles the `hidden` class on `#start`, `#game`, `#end`, `#editor`. `#start` is visible by default;
the only way to `show('editor')` on load is the `?editor=1` URL param (checked at the bottom of the script) —
there is no link to it from `#start`, see `docs/EDITOR.md`.

## Custom content layer

`TEMPLATES`/`COLORS` (below) are the built-in defaults and stay exactly as authored — `tools/validate.js`
checks them and only them. What the game actually plays is `ACTIVE_TEMPLATES` / `ACTIVE_COLORS` /
`ACTIVE_SCORING`, computed by `rebuildActive()` as the defaults with the player's `custom` overrides (from
`localStorage`, editable via the **Редактор на съдържание** screen) layered on top. Every runtime function
reads the `ACTIVE_*` globals. Full design, including the note-template token language custom equations use
instead of a JS function: `docs/EDITOR.md`.

## Equation templates

Equations are not hard-coded. `TEMPLATES` holds reaction patterns; placeholders are replaced by concrete
elements when a game starts.

```js
{ id:'m-x2',
  left:['{M}','{X}2'], right:['{M}{X}'],  // {M}=alkali metal, {X}/{Y}=halogen
  sol:[2,1,2],                            // coefficients, left then right, smallest whole numbers
  vars:{M:ALK, X:HAL},                    // allowed values per placeholder
  ok: v => ACT[v.X] > ACT[v.Y],           // optional extra constraint on a combination
  note: v => `Bulgarian explanation using ${N_MET[v.M]} ...` }   // shown after a correct answer
```

Rules:

- `sol` is the same for every substitution. The validator proves this for all combinations.
- `vars` lists **allowed** values. Restrict it when the chemistry is not valid for an element
  (`X:['Cl','Br']` for reactions fluorine and iodine do not do at school level).
- Fixed reactions (no placeholders, e.g. `H2 + O2 → H2O`) are templates with no `vars`.
- `note` is a function so it can name the actual metal and halogen. Name tables: `N_MET`, `N_ADJ`, `N_BASE`,
  `N_HAL`, `N_HALIDE`, `N_HACID`, `AG_COLOR`. `U('Na2O')` gives Unicode subscripts for text.

Related helpers: `enumerate(t)` lists every allowed substitution; `instantiate(t, v)` returns a concrete
equation `{id, lvl, left, right, sol, note, vars}`.

## Generator

`generateSet(seed)` (seeded PRNG `mulberry32`, deterministic), reading `ACTIVE_TEMPLATES`, flat — no grouping:

1. Pick `GAME_LENGTH/2` templates (6 of 12 by default) that have at least one coefficient > 1, so a game is
   never mostly "1 + 1 → 1 + 1", then fill up to `GAME_LENGTH` with other templates from the whole pool, all
   distinct.
2. Shuffle the picked templates; for each one pick one random allowed substitution.

If the player has deleted templates through the editor so the pool is smaller than `GAME_LENGTH`, the game
simply generates fewer equations — this doesn't crash, but isn't checked or prevented either.

`startGame()` calls `generateSet(nextSeed())`. Seed comes from `?seed=N` in the URL (then N, N+1, … for each new
game) or `Math.random()`. The seed isn't shown anywhere in the UI; it only exists to make `?seed=N` reproducible.

## Formula parsing

`parse(formula)` returns `{element: count}`. It handles element symbols (`Cl`, `Fe`), subscripts, and
parentheses with a multiplier (`Ca(OH)2` → `{Ca:1,O:2,H:2}`).
`pretty(formula)` turns digits into `<sub>` for display. `eqText(e)` builds the Unicode-subscript text of a solved
equation for the end screen.

## State

Globals: `let EQS, idx, coefs, score, mistakes, hints, solved, wrong, gameNo`.

| Variable | Meaning |
|---|---|
| `EQS` | The 12 concrete equations of the current game |
| `idx` | Current equation index in `EQS` |
| `coefs` | Current player coefficients (same order as `sol`), each 0..`ACTIVE_SCORING.maxCoef` (10 by default); every equation starts all-0 |
| `score` | Total points from solved equations only |
| `mistakes` / `hints` | Wrong checks / hints used on the current equation |
| `solved` | Current equation solved (locks +/− buttons) |
| `wrong` | Equation strings where the player made a mistake or used a hint (end screen) |

## Flow

```
startGame → generateSet → loadEq (scrolls to top) → render (→ renderCounter)
   +/- click → coefs change → render
   Провери → check():
        not balanced        → mistakes++, message, shake
        balanced, not gcd 1 → warning, no penalty
        balanced + simplest → solved, score += max(0, ACTIVE_SCORING.base - hints*hintPenalty - mistakes*mistakePenalty), show note
   Подсказка → hint(): set first wrong coefficient to the correct value, hints++;
                        if every coefficient already matches sol (only possible by setting them all by
                        hand — coefs start at 0, sol is never 0), show an "already correct" message
                        instead of doing nothing
   Напред → next() → loadEq or finish()
```

`totals()` sums atoms per element on each side (`coefficient × parse(formula)`).
`isBalanced()` requires every coefficient to be ≥ 1 (a 0 means "not answered yet", never "balanced") and all
elements to match. `isSimplest()` checks `gcd(coefs) === 1`.
The header pill (`#scoreVal` + `#potBadge`) shows the running score plus the current equation's potential as a
separate badge; the badge hides once the equation is `solved`. The potential drops with each mistake or hint but
is only added to `score` when the equation is solved.

## Rendering

`render()` rebuilds the equation row (buttons + formulas), then `renderCounter()` (atom-count rows, each with a
colour chip, a proportional bar per side and a badge). A row is grey/"—" (`row-pending`) while both sides sum
to 0 for that element (nothing entered yet on either side), green/✓ once both sides match, red/✗ otherwise.
It re-creates DOM on every click; that is fine at this size.

`render()` also calls `updateEqFade()`, which toggles `scroll-left`/`scroll-right` classes on `#eqScroll`
(the wrapper around `#eq`) based on `#eq`'s `scrollLeft`/`scrollWidth`/`clientWidth`. Those classes drive a
CSS gradient that fades the overflowing edge(s) into the card background, so a scrollable equation row is
visibly cut off instead of just ending. `#eq`'s own `scroll` listener and a `window` `resize` listener (wired
once, at the bottom of the script) keep it in sync as the player scrolls or rotates the device.

## Theming and accessibility

CSS custom properties on `:root`, dark variants under `prefers-color-scheme: dark` and `[data-theme]`.
Element colours live in JS (`COLORS`, overridable via `ACTIVE_COLORS`); the counter table's chip reuses them.
Icons are the self-hosted Material Icons webfont (`.material-icons` ligature spans), always paired with a
Bulgarian text label.
Buttons have `aria-label`s, focus outlines are visible, motion respects `prefers-reduced-motion`.

## Validation

`tools/validate.js` extracts the data section of the script (everything above the `/* ---------- състояние`
marker), evaluates it in a Node VM (no DOM), and checks every built-in template × every allowed substitution.
See `docs/TESTING-AND-ROADMAP.md`. Player-added/edited equations from the content editor have no Node-side
check (they don't exist until runtime) — the editor runs the same balance/smallest-coefficient logic in the
browser instead; see `docs/EDITOR.md`.
