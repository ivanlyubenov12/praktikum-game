# Testing and roadmap

## Automated (no browser)

```
node tools/validate.js
```

Checks:
- script syntax;
- every template × every allowed metal/halogen combination (165 concrete equations): balances with the stored
  coefficients, smallest whole numbers, note text contains no `undefined` or leftover `{}`;
- every formula has a 3D shape; atoms in the shape match the formula; bond counts satisfy valence; every element
  has a colour and radius;
- `generateSet()` for 500 seeds: 12 equations, 4 per level, no duplicate equations, same seed gives same result.

Exit code 0 = OK. Run it after every change to `TEMPLATES`, `SHAPES`, `COLORS`, `RAD` or the generator.
If a template becomes invalid for some element, the output names the template and the element combination.

## Manual checklist (needs a real browser)

**This has not been done yet. The 3D part was written without being able to open a browser.** Do it first.

Load
- [ ] Open `index.html` by double-click (`file://`). Start screen appears, no red errors in the console.
- [ ] Press *Започни*: two 3D panels show coloured molecules that slowly rotate.
- [ ] Rename `vendor/` temporarily: page still loads three.js from the CDN (needs internet). Rename it back.
- [ ] Block WebGL (or delete `vendor/` and go offline): the 3D card disappears, the game still works.

Gameplay
- [ ] Open `index.html?seed=42`. First equation is `4Na + O₂ → 2Na₂O`. Press + on Na twice → the left panel shows 3 Na atoms.
- [ ] Reach 4, 1, 2: both panel frames go green, table all green.
- [ ] Open `index.html?seed=42` again: same 12 equations. Play again from the end screen: different equations, seed shown.
- [ ] Open the page twice without a seed: different sets.
- [ ] *Провери* with wrong coefficients: red message, shake, potential points drop by 10.
- [ ] Set 4, 2, 4 for H₂ + O₂ → H₂O: message says balanced but not smallest numbers, no penalty.
- [ ] *Подсказка*: fixes one coefficient, potential drops by 25.
- [ ] Correct answer: green message, science note, +points, buttons locked, *Напред* appears.
- [ ] Play all 12 equations of a few different seeds. Check especially: 2HgO, Al₂O₃, P₂O₅, Ca(OH)₂, carbonates (M₂CO₃, MHCO₃), AgNO₃, HClO / MClO.
- [ ] End screen: score, list of equations with mistakes or hints, *Играй отново* resets everything.

3D
- [ ] Drag with the mouse rotates both axes; on a phone, horizontal drag rotates and vertical drag scrolls the page.
- [ ] Set large coefficients (e.g. 6 HCl + 2 Al): everything stays inside the canvas, nothing clipped.
- [ ] Resize the window and rotate the phone: layout reflows, molecules stay in view.
- [ ] No molecule looks broken (bonds attached, no overlapping spheres). Pay attention to the largest atoms: CsI, Cs₂CO₃, RbBr, and to Al₂O₃, P₂O₅, AgNO₃.
- [ ] Atom colours in one equation are distinguishable (e.g. Cs teal vs C grey in Cs₂CO₃, Br brown vs Cs teal in CsBr).
- [ ] Console has no WebGL context-loss warnings after playing for a few minutes.

Appearance and access
- [ ] Dark mode (system setting): text readable, panes visible, atom colours distinguishable.
- [ ] Keyboard: Tab reaches every button, focus ring visible, Enter/Space works.
- [ ] `prefers-reduced-motion` on: no auto-rotation or bobbing, no shake.
- [ ] Phone width around 360 px: equation with 4 terms wraps cleanly; no horizontal page scroll.

## Known gaps

- The full manual checklist above has still not been run end-to-end by a person. The atom-count table and 3D
  legend were checked with a headless Chromium screenshot (start screen, unbalanced/balanced states, a
  multi-element equation, light and dark mode) after the UI redesign, but dragging, the CDN fallback, WebGL-blocked
  fallback, keyboard navigation and phone-width layout still need a real device/browser pass.
- Coefficients are capped at 10 and cannot go below 1.
- Colour is the only element label inside the 3D spheres themselves; teal (Cs) and green (Cl) or lavender (Li) and
  violet (I) may still look close on some screens even with the text legend below the scene.
- Halogen displacement, MOH + CO₂ and M₂O + HX are not confirmed for 7th grade (see `docs/CURRICULUM.md`).
- After the last equation there is no way to review individual answers, only the list of equations that caused
  trouble.
- No persistence: reloading the page restarts the game.
- Coordinates in `SHAPES` are hand-written (bond lengths are then scaled automatically). If a model looks off, fix it by eye.

## Ideas, roughly in order of value for the seminar

1. **Reaction animation on success:** when solved, animate atoms from the reactant arrangement to the product
   arrangement (tween positions). Strong visual proof of conservation of mass.
2. **Reaction type tag** (съединяване / разлагане / заместване / неутрализация) shown after solving, or asked as a
   bonus question. Part of the curriculum topic "Вещества и химични реакции".
3. **Substance names** (наименования) after solving: "вода", "натриев хлорид"... Curriculum topic.
4. **Mass fraction / molecular mass bonus** using the atomic masses (Масова част is a 7th grade lesson).
5. ~~Atom legend and optional labels in 3D (accessibility).~~ Done: a text legend (colour chip + symbol + Bulgarian
   name) below the 3D panes lists every element in the current equation.
6. Timer mode or streak bonus.
7. Save best score in `localStorage` with a try/catch fallback.
8. More templates: `2M + S → M₂S`, `2M + H₂ → 2MH`, `Fe + X₂` (X = F, Cl, Br), Mg reactions.
9. Teacher mode: choose which equations to include; export results.
10. Split `index.html` into `index.html`, `style.css`, `game.js`, `molecules.js` once it grows beyond what one
    person can explain in a seminar. Not needed now.
