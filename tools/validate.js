#!/usr/bin/env node
// Validates the data inside index.html without a browser:
//  - script syntax
//  - EVERY equation the generator can produce (all templates x all allowed element substitutions):
//      balances with its stored coefficients, coefficients are the smallest whole numbers, note text is clean
//  - every formula has a 3D shape whose atoms match the formula and whose bonds satisfy valence
//  - every element has a colour and a radius
//  - generateSet(): correct size, no duplicate equations, for many seeds
// Usage: node tools/validate.js      (exit code 0 = all good)
const fs = require('fs'), vm = require('vm'), path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
new vm.Script(js);                                   // throws on syntax error
console.log('syntax: ok');

const DATA_END = '/* ---------- състояние';
const SHAPES_START = '/* ---------- 3D (three.js) ---------- */';
const SHAPES_END = 'const _prep';
const code = js.split(DATA_END)[0] + '\n' + js.split(SHAPES_START)[1].split(SHAPES_END)[0] +
  '\n;globalThis.__r={TEMPLATES,SHAPES,RAD,COLORS,parse,enumerate,instantiate,generateSet,shapeOf,PER_LEVEL,LEVELS};';
const ctx = { window: { matchMedia: () => ({ matches: false }) }, matchMedia: () => ({ matches: false }) };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const { TEMPLATES, RAD, COLORS, parse, enumerate, instantiate, generateSet, shapeOf, PER_LEVEL } = ctx.__r;

// allowed numbers of bonds per element (school valence). N: 3, or 5 for the nitrate drawing (see docs/SCIENCE.md)
const VALENCE = { H: [1], O: [2], N: [3, 5], C: [4], F: [1], Cl: [1], Br: [1], I: [1], Li: [1], Na: [1], K: [1], Rb: [1], Cs: [1],
                  Ag: [1], Al: [3], P: [5], Hg: [2], Ca: [2], Fe: [3], Mg: [2] };
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
let problems = 0, instances = 0;
const seenShapes = new Set();
const bad = (m) => { console.log('PROBLEM:', m); problems++; };

function checkShape(f, label) {
  const { def, map, key } = shapeOf(f);
  if (!def) return bad(`${label}: no 3D shape for ${f} (key ${key})`);
  const els = def.a.map((a) => map[a[0]] || a[0]);
  const cnt = {}; els.forEach((e) => { cnt[e] = (cnt[e] || 0) + 1; });
  const p = parse(f);
  if (JSON.stringify(Object.entries(cnt).sort()) !== JSON.stringify(Object.entries(p).sort())) bad(`${label}: ${f} atoms ${JSON.stringify(cnt)} != formula ${JSON.stringify(p)}`);
  els.forEach((e) => { if (!COLORS[e]) bad(`${f}: no colour for ${e}`); if (!RAD[e]) bad(`${f}: no radius for ${e}`); });
  if (def.b.length) {
    const v = els.map(() => 0);
    def.b.forEach(([i, j, o]) => { if (!def.a[i] || !def.a[j]) return bad(`${f}: bond index`); v[i] += o; v[j] += o; });
    els.forEach((e, i) => { if (!VALENCE[e] || !VALENCE[e].includes(v[i])) bad(`${f}: ${e}#${i} has ${v[i]} bonds, allowed ${VALENCE[e]}`); });
  }
  seenShapes.add(key);
}

TEMPLATES.forEach((t) => {
  const combos = enumerate(t);
  if (!combos.length) bad(`${t.id}: no valid substitutions`);
  if (![0, 1, 2].includes(t.lvl)) bad(`${t.id}: bad level`);
  if (t.sol.length !== t.left.length + t.right.length) bad(`${t.id}: sol length`);
  if (t.sol.reduce(gcd) !== 1) bad(`${t.id}: coefficients not smallest`);
  combos.forEach((v) => {
    instances++;
    const e = instantiate(t, v), label = `${t.id} ${JSON.stringify(v)}`;
    if (![...e.left, ...e.right].every((f) => !/[{}]/.test(f))) bad(`${label}: unresolved placeholder`);
    if (!e.note || /undefined|NaN|[{}]/.test(e.note)) bad(`${label}: bad note: ${e.note}`);
    const L = {}, R = {};
    e.left.forEach((f, i) => { const p = parse(f); for (const k in p) L[k] = (L[k] || 0) + p[k] * e.sol[i]; });
    e.right.forEach((f, i) => { const p = parse(f); for (const k in p) R[k] = (R[k] || 0) + p[k] * e.sol[e.left.length + i]; });
    new Set([...Object.keys(L), ...Object.keys(R)]).forEach((k) => { if ((L[k] || 0) !== (R[k] || 0)) bad(`${label}: ${k} ${L[k]} vs ${R[k]}`); });
    [...e.left, ...e.right].forEach((f) => checkShape(f, label));
  });
});

// generator behaviour
const SEEDS = 500;
for (let seed = 0; seed < SEEDS; seed++) {
  const set = generateSet(seed);
  const want = PER_LEVEL.reduce((a, b) => a + b, 0);
  if (set.length !== want) bad(`seed ${seed}: ${set.length} equations, expected ${want}`);
  const texts = set.map((e) => e.left.join('+') + '>' + e.right.join('+'));
  if (new Set(texts).size !== texts.length) bad(`seed ${seed}: duplicate equations`);
  PER_LEVEL.forEach((n, lvl) => { if (set.filter((e) => e.lvl === lvl).length !== n) bad(`seed ${seed}: level ${lvl} size`); });
  if (JSON.stringify(set) !== JSON.stringify(generateSet(seed))) bad(`seed ${seed}: not deterministic`);
}

console.log(`${TEMPLATES.length} templates, ${instances} concrete equations, ${seenShapes.size} shapes used, ${SEEDS} seeds; problems: ${problems}`);
process.exit(problems ? 1 : 0);
