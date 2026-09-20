# Architecture

One file, `index.html`. No modules. Everything is global inside a single `<script>` block.

## Screens

`show(id)` toggles the `hidden` class on `#start`, `#game`, `#end`.

## Equation templates

Equations are not hard-coded. `TEMPLATES` holds reaction patterns; placeholders are replaced by concrete
elements when a game starts.

```js
{ id:'m-x2', lvl:0,                       // level index into LEVELS
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

`generateSet(seed)` (seeded PRNG `mulberry32`, deterministic):

1. For each level (`PER_LEVEL = [4,4,4]`): take the templates of that level.
2. Pick 2 templates that have at least one coefficient > 1 (so a level is never all "1 + 1 → 1 + 1"), then fill
   up to 4 with other templates of the level, all distinct.
3. Shuffle inside the level; for each template pick one random allowed substitution.

`startGame()` calls `generateSet(nextSeed())`. Seed comes from `?seed=N` in the URL (then N, N+1, … for each new
game) or `Math.random()`. The end screen prints the seed.

## Formula parsing

`parse(formula)` returns `{element: count}`. It handles element symbols (`Cl`, `Fe`), subscripts, and
parentheses with a multiplier (`Ca(OH)2` → `{Ca:1,O:2,H:2}`).
`pretty(formula)` turns digits into `<sub>` for display. `eqText(e)` builds the Unicode-subscript text of a solved
equation for the end screen.

## State

Globals: `let EQS, idx, coefs, score, mistakes, hints, solved, wrong, currentSeed, gameNo`.

| Variable | Meaning |
|---|---|
| `EQS` | The 12 concrete equations of the current game |
| `idx` | Current equation index in `EQS` |
| `coefs` | Current player coefficients (same order as `sol`), each 1..`MAXC` (10) |
| `score` | Total points from solved equations only |
| `mistakes` / `hints` | Wrong checks / hints used on the current equation |
| `solved` | Current equation solved (locks +/− buttons) |
| `wrong` | Equation strings where the player made a mistake or used a hint (end screen) |

## Flow

```
startGame → generateSet → loadEq → render (→ renderCounter, renderLegend, update3D)
   +/- click → coefs change → render
   Провери → check():
        not balanced        → mistakes++, message, shake
        balanced, not gcd 1 → warning, no penalty
        balanced + simplest → solved, score += max(0, 100 - 25*hints - 10*mistakes), show note
   Подсказка → hint(): set first wrong coefficient to the correct value, hints++
   Напред → next() → loadEq or finish()
```

`totals()` sums atoms per element on each side (`coefficient × parse(formula)`).
`isBalanced()` compares all elements. `isSimplest()` checks `gcd(coefs) === 1`.
The header pill shows `Точки: score (+potential)`. The potential drops with each mistake or hint but is only added
to `score` when the equation is solved.

## Rendering

`render()` rebuilds the equation row (buttons + formulas), then `renderCounter()` (atom-count rows, each with a
colour chip, a proportional bar per side and a ✓/✗ badge), then `renderLegend()` (colour chip + symbol + Bulgarian
name for every element in the current equation, shown under the 3D panes), then `update3D()`. It re-creates DOM on
every click; that is fine at this size.

## Theming and accessibility

CSS custom properties on `:root`, dark variants under `prefers-color-scheme: dark` and `[data-theme]`.
Element colours live in JS (`COLORS`) because three.js needs them; the counter table chips and the 3D legend reuse
them. `EL_NAME` holds the Bulgarian display name per element, used only by the legend.
Buttons have `aria-label`s, focus outlines are visible, motion respects `prefers-reduced-motion`.

## Validation

`tools/validate.js` extracts the data and shapes sections of the script, evaluates them in a Node VM (no DOM, no
THREE), and checks every template × every allowed substitution. See `docs/TESTING-AND-ROADMAP.md`.
