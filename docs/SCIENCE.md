# Science notes

## The idea the game teaches

**Law of conservation of mass (Lavoisier):** in a chemical reaction atoms are rearranged, not created or destroyed.
So each element must have the same number of atoms on both sides.

- **Coefficient** (big number in front): how many molecules or formula units. The player changes this.
- **Index** (subscript): how many atoms of that element are in one molecule. Fixed by the substance; never changed
  when balancing. Changing an index changes the substance.
- Coefficients are the **smallest whole numbers**. A coefficient of 1 is not written.

The 3D panels show it: same coloured spheres on both sides, grouped differently.

## Reactions (M = Li, Na, K, Rb, Cs; X = F, Cl, Br, I unless restricted)

Valences: H, all alkali metals, all halogens, Ag: I. O, Hg, Ca: II. N, Al: III. C: IV. P: V.

| Reaction | Type | Restriction and reason |
|---|---|---|
| 4M + O₂ → 2M₂O | combination | **M = Li, Na, K only.** School-level product, simplified for Na and K too. In reality only Li gives mostly M₂O; Na gives mostly peroxide (Na₂O₂); K gives mostly superoxide (KO₂). The note says so |
| 2M + O₂ → M₂O₂ | combination | **M = Rb, Cs only.** These are true, isolable peroxides (Rb₂O₂, Cs₂O₂), used here as the more-active-metal counterpart to the M₂O reaction above. In reality Rb and Cs actually favour superoxides (MO₂) over peroxides at this level of detail, but MO₂ would need an odd-electron/paramagnetic structure that is out of scope for 7th grade, so the game stops at the peroxide |
| 2M₂O₂ → 2M₂O + O₂ | thermal decomposition | **M = Rb, Cs only.** Pairs with the reaction above: strong heating drives a peroxide down to the oxide plus oxygen |
| 2M + X₂ → 2MX | combination | none |
| H₂ + X₂ → 2HX | combination | none at school level (F₂ reacts explosively even in the dark, I₂ reversibly; not mentioned in the game) |
| M₂O + H₂O → 2MOH | combination | none |
| 2M + 2H₂O → 2MOH + H₂ | substitution | none. Gets more violent down the group. Teacher demonstration only |
| MOH + HX → MX + H₂O | neutralisation | none (HF is a weak acid but the reaction is the same) |
| M₂O + 2HX → 2MX + H₂O | basic oxide + acid | none |
| X₂ + H₂O → HX + HXO | disproportionation (reversible) | **X = Cl, Br only.** F₂ oxidises water to O₂ instead; I₂ barely reacts |
| X₂ + 2MOH → MX + MXO + H₂O | disproportionation | **X = Cl, Br only.** F₂ gives OF₂; I₂ gives iodate. Valid for cold, dilute solution (hot gives chlorate). NaClO is the active part of bleach |
| 2MOH + CO₂ → M₂CO₃ + H₂O | base + acidic oxide | none |
| M₂O + CO₂ → M₂CO₃ | basic + acidic oxide | none |
| MOH + CO₂ → MHCO₃ | excess CO₂ | **M = Na, K only.** LiHCO₃, RbHCO₃, CsHCO₃ are not normally treated at this level (LiHCO₃ exists only in solution) |
| 2MHCO₃ → M₂CO₃ + H₂O + CO₂ | thermal decomposition | **M = Na, K only** (same reason). NaHCO₃ decomposes above about 100 °C; this is why baking soda raises dough |
| M₂CO₃ + 2HX → 2MX + H₂O + CO₂ | carbonate + acid | none. Fizzing CO₂ is the test for carbonates |
| AgNO₃ + HX → AgX + HNO₃ | precipitation | **X = Cl, Br, I only.** AgF is soluble, no precipitate. AgCl white, AgBr pale yellow, AgI yellow |
| AgNO₃ + MX → AgX + MNO₃ | precipitation | **X = Cl, Br, I only** (same) |
| X₂ + 2MY → 2MX + Y₂ | substitution (halogen displacement) | **X ∈ {Cl, Br}, Y ∈ {Br, I}, X more active than Y.** Activity F > Cl > Br > I. F excluded because F₂ reacts with the water of the solution |

Fixed reactions: H₂ + O₂ (water), N₂ + H₂ (ammonia, Haber–Bosch), HgO decomposition (Priestley 1774; mercury is toxic,
history only), Al + O₂ (protective oxide film), P + O₂, Al + HCl (substitution), Ca(OH)₂ + HCl (neutralisation, the
index 2 outside the bracket applies to the whole OH group).

## A common mistake worth mentioning

Sodium carbonate is **Na₂CO₃**, not "NaCO₃". Sodium is I valent and the CO₃ group is II valent, so two sodium atoms
are needed. Baking soda is **NaHCO₃** (sodium hydrogencarbonate). The notes for the carbonate reactions say this.

## Simplifications in the 3D models

Be ready to say these out loud if asked. They are deliberate.

1. **Shapes are stylised.** H₂O is bent and NH₃ a pyramid; other bond lengths are scaled automatically so spheres
   never overlap and bonds are visible.
2. **Ionic compounds** (MX, M₂O, MOH, M₂CO₃, MNO₃, AgX, CaCl₂, Al₂O₃ …) are not real molecules. They are crystals or
   solutions of ions. The game draws one formula unit as a small ball-and-stick cluster, which is how 7th grade
   formulas are usually shown.
3. **Bonds encode valence, not real bond type.** Every atom has as many bonds as its school valence (the validator
   checks this). For ionic units a "bond" means "this atom is attached to that one in the formula".
4. **Carbonate and hydrogencarbonate** are drawn as M–O–C(=O)–O–M (and M–O–C(=O)–O–H). The real ion has resonance
   and charges.
5. **Nitrate group** is drawn with nitrogen having five bonds (N bonded to O, =O, =O). This is a school-level
   Lewis-style drawing; the real nitrate ion has charge separation and resonance, and nitrogen never has five bonds.
   The validator allows N with 3 or 5 bonds for this reason.
6. **Metals** (M, Al, Hg) are single atoms. Real metals are lattices (Hg is a liquid).
7. **Phosphorus** is P, not P₄; **P₂O₅** is the school formula (real: P₄O₁₀).
8. **HClO, MClO** are drawn H–O–X and M–O–X (X is I valent there).
9. Reaction conditions (heating, catalysts, solvents, excess) are not shown.
10. Element colours follow CPK loosely. H is light blue for contrast. Alkali metals have their own colours
    (Li lavender, Na pink, K yellow, Rb orange, Cs teal).
