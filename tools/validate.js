#!/usr/bin/env node
// Validates the data inside index.html without a browser:
//  - script syntax
//  - EVERY equation the generator can produce (all templates x all allowed element substitutions):
//      balances with its stored coefficients, coefficients are the smallest whole numbers, note text is clean
//  - every element used in a formula has a colour (for the atom-count table's chip)
//  - generateSet(): correct size, no duplicate equations, for many seeds
// Usage: node tools/validate.js      (exit code 0 = all good)
const fs = require('fs'), vm = require('vm'), path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
new vm.Script(js);                                   // throws on syntax error
console.log('syntax: ok');

const DATA_END = '/* ---------- състояние';
const code = js.split(DATA_END)[0] +
  '\n;globalThis.__r={TEMPLATES,COLORS,parse,enumerate,instantiate,generateSet,PER_LEVEL,LEVELS};';
const ctx = { window: { matchMedia: () => ({ matches: false }) }, matchMedia: () => ({ matches: false }) };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const { TEMPLATES, COLORS, parse, enumerate, instantiate, generateSet, PER_LEVEL } = ctx.__r;

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
let problems = 0, instances = 0;
const bad = (m) => { console.log('PROBLEM:', m); problems++; };

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
    const els = new Set([...Object.keys(L), ...Object.keys(R)]);
    els.forEach((k) => { if ((L[k] || 0) !== (R[k] || 0)) bad(`${label}: ${k} ${L[k]} vs ${R[k]}`); });
    els.forEach((k) => { if (!COLORS[k]) bad(`${label}: no colour for ${k}`); });
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

console.log(`${TEMPLATES.length} templates, ${instances} concrete equations, ${SEEDS} seeds; problems: ${problems}`);
process.exit(problems ? 1 : 0);
