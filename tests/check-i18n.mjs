#!/usr/bin/env node
// check-i18n.mjs — i18n parity, missing, orphan guard.
//   FAIL on: missing keys (template references → no JSON entry on either side)
//   FAIL on: parity break (keys in EN not in ES, or vice versa)
//   WARN on: orphan keys (in JSON, not used anywhere)
//
// Sources of truth:
//   - en.json + es.json (key dictionaries)
//   - All HTML/template files (translate / translate-html / translate-<attr>)
//
// Quality guard wires this into the standard test:quality chain.

import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const argv = new Set(process.argv.slice(2));
const failOnOrphans = argv.has('--strict');

function fail(msg) {
  console.error(`[FAIL] ${msg}`);
}

function warn(msg) {
  console.warn(`[WARN] ${msg}`);
}

const enPath = path.resolve(rootDir, 'en.json');
const esPath = path.resolve(rootDir, 'es.json');

if (!fs.existsSync(enPath) || !fs.existsSync(esPath)) {
  fail('en.json or es.json missing at repo root');
  process.exit(1);
}

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const enKeys = new Set(Object.keys(en));
const esKeys = new Set(Object.keys(es));

// JSON values must not contain executable HTML to limit XSS surface
// of translate-html injection (`assets/js/translate.js` uses innerHTML).
const dangerousValuePattern = /<script\b|<iframe\b|on[a-z]+\s*=\s*["']/i;
const dangerousValues = [];
for (const [k, v] of [...Object.entries(en), ...Object.entries(es)]) {
  if (typeof v === 'string' && dangerousValuePattern.test(v)) {
    dangerousValues.push(k);
  }
}

// Walk HTML/template files and collect every `translate(-<attr>)="<key>"` usage.
const used = new Set();
const TEMPLATE_DIRS = ['src'];
const HTML_AT_ROOT = ['index.html', 'privacy.html', 'lfi.html', 'aglaya.html', 'elm-st.html', 'ruta-de-la-digitalizacion-y-2x2-mkt.html', 'lfi-legacy.html'];

function walk(dir, files) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.')) continue;
      walk(full, files);
    } else if (entry.isFile() && /\.(html?|mjs|js)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const filesToScan = [];
for (const dir of TEMPLATE_DIRS) {
  const full = path.resolve(rootDir, dir);
  if (fs.existsSync(full)) {
    walk(full, filesToScan);
  }
}
for (const file of HTML_AT_ROOT) {
  const full = path.resolve(rootDir, file);
  if (fs.existsSync(full)) filesToScan.push(full);
}

// Also scan content/*.json for `translate` properties (CTAs config, etc.).
const contentDir = path.resolve(rootDir, 'content');
if (fs.existsSync(contentDir)) {
  for (const file of fs.readdirSync(contentDir)) {
    if (file.endsWith('.json')) {
      filesToScan.push(path.join(contentDir, file));
    }
  }
}

const TRANSLATE_ATTR = /translate(?:-[a-z]+)?="([^"]+)"/g;
const JSON_TRANSLATE = /"(?:[a-zA-Z]+T|t)ranslate"\s*:\s*"([^"]+)"/g;

for (const file of filesToScan) {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = TRANSLATE_ATTR.exec(content))) {
    used.add(m[1]);
  }
  while ((m = JSON_TRANSLATE.exec(content))) {
    used.add(m[1]);
  }
}

// Compute deltas.
const enMinusEs = [...enKeys].filter((k) => !esKeys.has(k));
const esMinusEn = [...esKeys].filter((k) => !enKeys.has(k));
const missing = [...used].filter((k) => !enKeys.has(k) && !esKeys.has(k));
const orphansEn = [...enKeys].filter((k) => !used.has(k));
const orphansEs = [...esKeys].filter((k) => !used.has(k));

let hasErrors = false;

console.log(`[I18N] en.json keys: ${enKeys.size}`);
console.log(`[I18N] es.json keys: ${esKeys.size}`);
console.log(`[I18N] translate attrs referenced: ${used.size}`);

if (dangerousValues.length > 0) {
  for (const k of dangerousValues) fail(`Dangerous HTML in translation value: ${k}`);
  hasErrors = true;
}

if (enMinusEs.length > 0) {
  hasErrors = true;
  fail(`Keys in en.json but missing in es.json: ${enMinusEs.join(', ')}`);
}

if (esMinusEn.length > 0) {
  hasErrors = true;
  fail(`Keys in es.json but missing in en.json: ${esMinusEn.join(', ')}`);
}

if (missing.length > 0) {
  hasErrors = true;
  fail(`Templates reference keys not defined in en.json OR es.json: ${missing.join(', ')}`);
}

if (orphansEn.length > 0) {
  if (failOnOrphans) {
    hasErrors = true;
    fail(`Orphan keys in en.json (${orphansEn.length}): ${orphansEn.slice(0, 20).join(', ')}${orphansEn.length > 20 ? '...' : ''}`);
  } else {
    warn(`Orphan keys in en.json: ${orphansEn.length} (run with --strict to fail)`);
  }
}
if (orphansEs.length > 0 && !orphansEn.length) {
  warn(`Orphan keys in es.json: ${orphansEs.length} (run with --strict to fail)`);
}

if (hasErrors) {
  process.exit(1);
}

console.log('[OK] i18n checks passed');
