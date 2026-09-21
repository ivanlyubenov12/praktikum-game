# Баланс – chemical equation balancing game

A single-page game for balancing chemical equations, with a Bulgarian UI. Topics follow **7th grade chemistry
in Bulgaria** (*Химия и опазване на околната среда*): alkali metals and their compounds, halogens, acids and
bases, carbonates, and the silver nitrate test for halides. A live atom counter (colour-coded per element)
shows atom counts left vs right as you adjust coefficients.

**Every game is different.** Equations come from templates, and the alkali metal (Li, Na, K, Rb, Cs) and the
halogen (F, Cl, Br, I) are chosen at random. 12 equations per game, 3 levels.

**All of it is editable in the app itself.** Open **Редактор на съдържание** from the start screen to add,
edit or delete equations (built-in ones included), rename levels, change scoring, or recolour elements — no
code editing needed. See `docs/EDITOR.md`.

Built as a school project (NOIT 2025/2026, task 2: a computer game for revision of a chemistry topic).

## Run it

No build step, no install.

1. Open `index.html` in a browser (double-click is fine).
2. The Material Icons webfont is bundled in `vendor/MaterialIcons.woff2`, for offline use, no CDN fallback.
   Icons are implemented as ligatures (the DOM text is literally `play_arrow`, `check`, …), so if that file is
   ever missing, those labels would show as raw English icon names instead of a glyph — keep it next to
   `index.html`.

**Repeatable game (for demos and tests):** add `?seed=123` to the address, e.g. `index.html?seed=123`.
The same seed always gives the same 12 equations. Pressing "play again" uses seed+1. Without `?seed=`, each game
gets a random seed, and the end screen shows it.

## How to play

- Every equation starts with every coefficient at 0 — press **+** / **−** above each formula to set it (0–10).
- The table shows atom counts left vs right: grey rows are elements you haven't set a coefficient for yet,
  green = equal, red = different, each with a proportional bar per side.
- **Провери** checks the answer. **Подсказка** fixes one wrong coefficient.
- Coefficients must be the smallest whole numbers (2, 2, 4 is rejected even though it balances).
- Score: max 100 per equation, −10 per wrong check, −25 per hint. Max 1200. (All editable — see below.)

## Levels

1. Combination and decomposition: `4M + O₂` (Li, Na oxide), `2M + O₂ → M₂O₂` (K, Rb, Cs peroxide),
   `2M₂O₂ → 2M₂O + O₂`, `2M + X₂`, `H₂ + X₂`, `M₂O + H₂O`, plus a few classics.
2. Substitution and neutralisation: `2M + 2H₂O`, `MOH + HX`, `M₂O + 2HX`, plus Al/P oxides, `Al + HCl`, `Ca(OH)₂ + HCl`.
3. Chlorine, carbonates and qualitative reactions: `X₂ + H₂O`, `X₂ + 2MOH`, `2MOH + CO₂`, `2NaHCO₃ → …`,
   `M₂CO₃ + 2HX`, `AgNO₃ + HX`, halogen displacement.

(M = alkali metal, X = halogen. Full list: `docs/CURRICULUM.md`.)

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole app: HTML, CSS, JS (templates, generator, game logic). Edit this. |
| `tools/validate.js` | `node tools/validate.js`: checks every equation the generator can produce. |
| `vendor/MaterialIcons.woff2` | Material Icons webfont, ligature-based (Apache 2.0). Do not edit. |
| `vendor/MATERIAL-ICONS-LICENSE.txt` | Material Icons license. |
| `CLAUDE.md` | Instructions and conventions for Claude Code. |
| `SEMINAR.md` | Демо сценарий и възможни въпроси (на български). |
| `docs/ARCHITECTURE.md` | Code structure, templates, generator, state, scoring. |
| `docs/EDITOR.md` | The in-app content editor: data model, note-template tokens, limits. |
| `docs/CURRICULUM.md` | Which equations, where they come from, what is unverified. |
| `docs/SCIENCE.md` | The chemistry behind each reaction, exclusions and simplifications. |
| `docs/TESTING-AND-ROADMAP.md` | Manual test checklist, known gaps, ideas. |

## Status

`node tools/validate.js` checks all 168 concrete equations the generator can produce (every template with every
allowed metal/halogen) and 500 seeds of the generator.
