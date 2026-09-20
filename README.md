# Баланс – chemical equation balancing game (3D)

A single-page game for balancing chemical equations, with a Bulgarian UI. Topics follow **7th grade chemistry
in Bulgaria** (*Химия и опазване на околната среда*): alkali metals and their compounds, halogens, acids and
bases, carbonates, and the silver nitrate test for halides. Reactants and products are shown as 3D
ball-and-stick molecules (three.js) next to a live atom counter.

**Every game is different.** Equations come from templates, and the alkali metal (Li, Na, K, Rb, Cs) and the
halogen (F, Cl, Br, I) are chosen at random. 12 equations per game, 3 levels.

Built as a school project (NOIT 2025/2026, task 2: a computer game for revision of a chemistry topic).

## Run it

No build step, no install.

1. Open `index.html` in a browser (double-click is fine).
2. three.js is bundled in `vendor/three.min.js`, so it works offline. If that file is missing, the page tries
   the cdnjs copy of the same version (needs internet).
3. If WebGL is unavailable, the 3D card hides itself and the game still works (table + buttons).

**Repeatable game (for demos and tests):** add `?seed=123` to the address, e.g. `index.html?seed=123`.
The same seed always gives the same 12 equations. Pressing "play again" uses seed+1. Without `?seed=`, each game
gets a random seed, and the end screen shows it.

## How to play

- Press **+** / **−** above each formula to change its coefficient (1–10).
- The table shows atom counts left vs right (green = equal, red = different).
- The two 3D panels show the same atoms as molecules. The frame turns green when both sides match.
- **Провери** checks the answer. **Подсказка** fixes one wrong coefficient.
- Coefficients must be the smallest whole numbers (2, 2, 4 is rejected even though it balances).
- Score: max 100 per equation, −10 per wrong check, −25 per hint. Max 1200.

## Levels

1. Combination and decomposition: `4M + O₂`, `2M + O₂ → M₂O₂` (Rb, Cs peroxide), `2M₂O₂ → 2M₂O + O₂`,
   `2M + X₂`, `H₂ + X₂`, `M₂O + H₂O`, plus a few classics.
2. Substitution and neutralisation: `2M + 2H₂O`, `MOH + HX`, `M₂O + 2HX`, plus Al/P oxides, `Al + HCl`, `Ca(OH)₂ + HCl`.
3. Chlorine, carbonates and qualitative reactions: `X₂ + H₂O`, `X₂ + 2MOH`, `2MOH + CO₂`, `2NaHCO₃ → …`,
   `M₂CO₃ + 2HX`, `AgNO₃ + HX`, halogen displacement.

(M = alkali metal, X = halogen. Full list: `docs/CURRICULUM.md`.)

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole app: HTML, CSS, JS (templates, generator, game logic, 3D). Edit this. |
| `tools/validate.js` | `node tools/validate.js`: checks every equation the generator can produce, and every 3D shape. |
| `vendor/three.min.js` | three.js r128 (MIT). Do not edit. |
| `vendor/THREE-LICENSE.txt` | three.js license. |
| `CLAUDE.md` | Instructions and conventions for Claude Code. |
| `SEMINAR.md` | Демо сценарий и възможни въпроси (на български). |
| `docs/ARCHITECTURE.md` | Code structure, templates, generator, state, scoring. |
| `docs/3D-RENDERING.md` | three.js scene, shape format, how to add a molecule. |
| `docs/CURRICULUM.md` | Which equations, where they come from, what is unverified. |
| `docs/SCIENCE.md` | The chemistry behind each reaction, exclusions and simplifications. |
| `docs/TESTING-AND-ROADMAP.md` | Manual test checklist, known gaps, ideas. |

## Status

`node tools/validate.js` checks all 165 concrete equations the generator can produce (every template with every
allowed metal/halogen), the 3D shapes behind them (atoms, valence), and 500 seeds of the generator.
The 3D rendering has **not** been checked in a real browser yet; see `docs/TESTING-AND-ROADMAP.md`.
