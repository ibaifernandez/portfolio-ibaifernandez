#!/usr/bin/env node
// purge-orphan-i18n.mjs — removes orphan keys from en.json and es.json.
//
// "Orphan" = defined in either JSON file but not referenced anywhere in
// src/, root HTML, or content/*.json.
//
// Preserves 4-space indentation (matches existing format).
//
// USAGE:  node scripts/purge-orphan-i18n.mjs [--dry-run]

import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const argv = new Set(process.argv.slice(2));
const dryRun = argv.has('--dry-run');

const enPath = path.resolve(rootDir, 'en.json');
const esPath = path.resolve(rootDir, 'es.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(html?|mjs|js|json)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const filesToScan = [];
for (const dir of ['src', 'content']) {
  const full = path.resolve(rootDir, dir);
  if (fs.existsSync(full)) walk(full, filesToScan);
}
for (const file of ['index.html', 'cv-print.html', 'privacy.html', 'lfi.html', 'aglaya.html', 'elm-st.html', 'ruta-de-la-digitalizacion-y-2x2-mkt.html', 'lfi-legacy.html']) {
  const full = path.resolve(rootDir, file);
  if (fs.existsSync(full)) filesToScan.push(full);
}

const TRANSLATE_ATTR = /translate(?:-[a-z]+)?="([^"]+)"/g;
const JSON_TRANSLATE = /"(?:[a-zA-Z]+T|t)ranslate"\s*:\s*"([^"]+)"/g;

const used = new Set();
for (const file of filesToScan) {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = TRANSLATE_ATTR.exec(content))) used.add(m[1]);
  while ((m = JSON_TRANSLATE.exec(content))) used.add(m[1]);
}

const enOrphans = Object.keys(en).filter((k) => !used.has(k));
const esOrphans = Object.keys(es).filter((k) => !used.has(k));

console.log(`Orphan keys in en.json: ${enOrphans.length}`);
console.log(`Orphan keys in es.json: ${esOrphans.length}`);

if (enOrphans.length === 0 && esOrphans.length === 0) {
  console.log('No orphans. Nothing to do.');
  process.exit(0);
}

// Remove orphans from BOTH files (symmetric purge).
const toRemove = new Set([...enOrphans, ...esOrphans]);

function purge(obj, toRemove) {
  const next = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!toRemove.has(k)) next[k] = v;
  }
  return next;
}

const enClean = purge(en, toRemove);
const esClean = purge(es, toRemove);

console.log(`Removing ${toRemove.size} unique keys from both files.`);
console.log(`Sample (first 10): ${[...toRemove].slice(0, 10).join(', ')}${toRemove.size > 10 ? '...' : ''}`);

if (dryRun) {
  console.log('--dry-run: not writing.');
  process.exit(0);
}

// Preserve 4-space indentation + trailing newline to match existing files.
fs.writeFileSync(enPath, JSON.stringify(enClean, null, 4) + '\n');
fs.writeFileSync(esPath, JSON.stringify(esClean, null, 4) + '\n');

console.log(`✓ Purged ${toRemove.size} orphan keys from en.json and es.json`);
console.log(`  en.json: ${Object.keys(en).length} → ${Object.keys(enClean).length}`);
console.log(`  es.json: ${Object.keys(es).length} → ${Object.keys(esClean).length}`);
