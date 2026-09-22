# Testing and roadmap

## Automated (no browser)

```
node tools/validate.js
```

Checks:
- script syntax;
- every template × every allowed metal/halogen combination (168 concrete equations): balances with the stored
  coefficients, smallest whole numbers, note text contains no `undefined` or leftover `{}`;
- every element used in a formula has a colour (for the atom-count table's chip);
- `generateSet()` for 500 seeds: 12 equations, no duplicate equations, same seed gives same result.

Exit code 0 = OK. Run it after every change to `TEMPLATES`, `COLORS` or the generator.
If a template becomes invalid for some element, the output names the template and the element combination.
This only checks the built-in defaults — equations added or edited at runtime through the content editor are
validated in the browser instead (same balance/smallest-coefficient logic); see `docs/EDITOR.md`.

## Manual checklist (needs a real browser)

Load
- [ ] Open `index.html` by double-click (`file://`). Start screen appears, no red errors in the console.
- [ ] Rename `vendor/MaterialIcons.woff2` temporarily: buttons and headings still work but show the raw icon
  name (e.g. "play_arrow Започни") instead of a glyph — ugly, not broken. Rename it back.

Gameplay
- [ ] Open `index.html?seed=42`. First equation is `4Na + O₂ → 2Na₂O`, all three coefficients start at 0 and
  every row in the table is grey. Press *Провери* immediately: red message ("не е изравнено"), no green rows yet.
- [ ] Press + on Na twice → coefficient shows 2, the Na row switches from grey to red (2 vs 2Na₂O's 4, still
  unequal) since the other terms are still 0.
- [ ] Reach 4, 1, 2: table all green.
- [ ] Press − on a coefficient already at 0: stays at 0 (no negative numbers).
- [ ] Open `index.html?seed=42` again: same 12 equations. Play again from the end screen: different equations.
- [ ] Open the page twice without a seed: different sets.
- [ ] *Провери* with wrong coefficients: red message, shake, potential points drop by 10.
- [ ] Set 4, 2, 4 for H₂ + O₂ → H₂O: message says balanced but not smallest numbers, no penalty.
- [ ] *Подсказка*: fixes one coefficient (from 0 or from a wrong value), potential drops by 25.
- [ ] Correct answer: green message, science note, +points, buttons locked, *Напред* appears.
- [ ] An equation whose solution is all 1s (e.g. `M₂O + CO₂ → M₂CO₃`, `MOH + HX → MX + H₂O`): still starts at
  0/0/0 (grey table, not a free win) — you must press + once per term to reach 1/1/1. If you do that by hand and
  then press *Подсказка* anyway, it shows an "already correct" message instead of doing nothing.
- [ ] Scroll down before pressing *Напред* (or after the last equation): the next equation, or the end screen,
  loads scrolled to the top.
- [ ] Play all 12 equations of a few different seeds. Check especially: 2HgO, Al₂O₃, P₂O₅, Ca(OH)₂, carbonates (M₂CO₃, MHCO₃), AgNO₃, HClO / MClO.
- [ ] End screen: score, grade icon and progress bar, list of equations with mistakes or hints, *Играй отново* resets everything.

Content editor (see `docs/EDITOR.md`)
- [ ] Open the editor from the start screen. Change "Точки за уравнение" to e.g. 50, tab away: the start
  screen's rule text and the *Подсказка* button label update to match immediately.
- [ ] Add a new equation (e.g. `2Mg + O₂ → 2MgO`, no `{M}`/`{X}`): Save is disabled until it balances with
  smallest coefficients; the validation box explains why. Once saved, it appears in the equation list and can
  be played (jump to it, or just keep playing seeds until it turns up).
- [ ] Add an equation using `{M}` in a formula: a checkbox picker for allowed alkali metals appears
  automatically; Save stays disabled until at least one is checked and every combination balances.
- [ ] Edit a built-in equation's note. Play it: the new note shows instead of the original. Re-open the
  editor: it's listed with the same id, not duplicated.
- [ ] Try to edit `Cl₂ + LiBr → LiCl + Br₂` (halogen displacement, 3 variables): the Edit button is disabled
  with a tooltip; Delete still works.
- [ ] Delete a built-in equation, reload the page (fresh tab, same browser): it's still gone — confirms
  `localStorage` persistence, not just in-memory state.
- [ ] Изтегли (export), then Първоначални (reset) — confirm the editor goes back to only built-in content —
  then Качи файл (import) the exported file: your changes come back exactly (including deletions).
- [ ] Recolour an element (or add a brand-new one): the atom-count table's chip updates to match.

Appearance and access
- [ ] Dark mode (system setting): text readable, cards visible, atom colours distinguishable.
- [ ] Keyboard: Tab reaches every button, focus ring visible, Enter/Space works.
- [ ] On a touch device, tap a +/− button: it does not visibly shift or grow, and stays that way (the
  hover lift is scoped to `(hover:hover) and (pointer:fine)`, since touch browsers can "stick" `:hover`
  after a tap). On a real mouse, hovering a button still lifts it slightly.
- [ ] `prefers-reduced-motion` on: no shake animation.
- [ ] Phone width around 360 px: a wide equation (4-5 terms) never wraps to a second line. Instead the row
  itself scrolls horizontally within its card (swipe on a touch device) and every term, including the last
  one, is reachable. The page itself never gains a horizontal scrollbar — only the row inside the card does.
- [ ] The equation row is centered in its card when it fits, sized to its own content (not stretched to fill
  the card). Different equations will naturally center at different horizontal positions since they have
  different numbers/lengths of terms — that's expected. When it doesn't fit, `justify-content: safe center`
  falls back to left-aligned so the first term is never scrolled out of reach on the left.
- [ ] When the equation row overflows, the edge(s) with more content fade into the card background (a soft
  gradient, `#eqScroll`'s `scroll-left`/`scroll-right` classes, toggled by `updateEqFade()`), so the row not
  being fully visible is obvious even before you touch it. Only the right edge fades at the start (more
  content to the right), only the left edge fades once fully scrolled, both fade in the middle, and a row
  that fits entirely shows neither.
- [ ] Compare a term with no subscript (e.g. `Na`, `Al`) next to one with a subscript (e.g. `O₂`) in the same
  equation: their letters sit on the same line, and the `+` / `→` between terms lines up with those letters
  too — not higher or lower.
- [ ] Material Icons glyphs render (not raw names like "check_circle") on every button, `h2`, message and badge,
  in both light and dark mode.

## Known gaps

- The full manual checklist above has still not been run end-to-end by a person. Checked so far with headless
  Chromium screenshots: the atom-count table (grey/pending, unbalanced, balanced states, a multi-element
  equation, light and dark mode); the Material Icons font and score redesign (start screen, a wrong check, an
  already-solved-by-hand equation including the *Подсказка* no-op message, the solved state, both end-screen
  grade tiers, dark mode); the scroll-to-top fix on *Напред*. The content editor: adding a fixed equation
  (Save disabled while unbalanced, enabled once correct), adding one with `{M}` (checkbox picker appears,
  validates per-combination), editing a built-in equation's note and playing the override, the
  disabled-Edit guard on the 3-variable template, live scoring-text propagation to the start screen and hint
  button, delete + reload persistence, and a full export → reset → import round-trip. Still need a real
  device/browser pass: keyboard navigation and phone-width layout (including the editor's forms).
- Coefficients are capped at 10 and cannot go below 0.
- Colour is the only element label in the atom-count table's chip; teal (Cs) and green (Cl) or lavender (Li)
  and violet (I) may look close on some screens — the element symbol text next to each chip is the fallback.
- Halogen displacement, MOH + CO₂ and M₂O + HX are not confirmed for 7th grade (see `docs/CURRICULUM.md`).
- After the last equation there is no way to review individual answers, only the list of equations that caused
  trouble.
- No game-progress persistence: reloading mid-game restarts the current game from scratch. Content edits
  (equations, scoring, colours) do persist across reloads via `localStorage` — that's the editor, a separate
  thing from game progress.
- The content editor's note-template tokens (`docs/EDITOR.md`) are simpler than what a hand-written JS `note`
  function can do; equations with more than two variables or an `ok` filter can't be added or edited through
  the UI at all, only deleted.
- No minimum-equation guard: deleting templates through the editor down to fewer than `GAME_LENGTH` makes
  every game generate fewer equations than usual, silently.

## Ideas, roughly in order of value for the seminar

1. **Reaction type tag** (съединяване / разлагане / заместване / неутрализация) shown after solving, or asked as a
   bonus question. Part of the curriculum topic "Вещества и химични реакции".
2. **Substance names** (наименования) after solving: "вода", "натриев хлорид"... Curriculum topic.
3. **Mass fraction / molecular mass bonus** using the atomic masses (Масова част is a 7th grade lesson).
4. Timer mode or streak bonus.
5. Save best score in `localStorage` with a try/catch fallback.
6. More templates: `2M + S → M₂S`, `2M + H₂ → 2MH`, `Fe + X₂` (X = F, Cl, Br), Mg reactions.
7. ~~Teacher mode: choose which equations to include.~~ Done via the content editor (delete/add equations).
   Still missing: exporting play *results* (scores, not content) for a teacher to review.
8. Split `index.html` into `index.html`, `style.css`, `game.js` once it grows beyond what one person can
   explain in a seminar. Getting more relevant now that the editor has roughly doubled the file's size.
