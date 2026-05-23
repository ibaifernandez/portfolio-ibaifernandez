// Content-hash fingerprinting for built assets.
// Generates short SHA-256 prefix per minified asset, then rewrites the
// references inside generated HTML files to bust browser caches on change.
//
// Why not embed in URL path? Netlify cache-control on /assets/* assumes
// stable filenames. Query string ?v=<hash> keeps URLs cached aggressively
// but invalidated automatically on content change. No more manual ?v=20260522.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const FINGERPRINT_ASSETS = [
  'assets/css/style.min.css',
  'assets/css/font.min.css',
  'assets/css/animate.min.css',
  'assets/css/print.min.css',
  'assets/js/custom.min.js',
  'assets/js/translate.min.js',
  'assets/js/cookie-consent.min.js',
  'assets/svg/icons.svg'
];

function computeHash(absolutePath) {
  const content = fs.readFileSync(absolutePath);
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 10);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function fingerprintGeneratedHtml(rootDir, htmlOutputs) {
  const hashes = {};
  for (const asset of FINGERPRINT_ASSETS) {
    const absolute = path.resolve(rootDir, asset);
    if (!fs.existsSync(absolute)) continue;
    hashes[asset] = computeHash(absolute);
  }

  for (const output of htmlOutputs) {
    const filePath = path.resolve(rootDir, output);
    if (!fs.existsSync(filePath)) continue;
    let html = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    for (const [asset, hash] of Object.entries(hashes)) {
      // Match `href="asset"` / `href="asset?v=…"` / `href="asset?v=…#frag"` /
      // `href="asset#frag"` — and the same for `src="…"`. The `?v=` portion
      // stops at `#` so that the fragment is preserved (otherwise re-running
      // fingerprint over already-processed HTML drops the fragment).
      const pattern = new RegExp(
        `(href|src)=("|')(${escapeRegex(asset)})(\\?v=[^"'#]*)?(#[^"']+)?\\2`,
        'g'
      );
      const afterReplace = html.replace(pattern, (_full, attr, q, p, _v, frag = '') => `${attr}=${q}${p}?v=${hash}${frag}${q}`);
      if (afterReplace !== html) {
        html = afterReplace;
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, html);
    }
  }

  return hashes;
}
