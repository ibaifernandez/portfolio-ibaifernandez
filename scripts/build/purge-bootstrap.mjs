// purge-bootstrap.mjs — strip unused Bootstrap rules (P-PERF-04).
//
// Bootstrap ships ~155 KB but this site uses only a subset (grid, buttons, cards,
// modals, a few utilities). PurgeCSS scans the BUILT HTML + the JS (so classes
// toggled at runtime via string literals are kept) and drops the rest, then csso
// minifies. A safelist covers classes Bootstrap adds dynamically that don't appear
// verbatim in the HTML/JS (modal backdrop, collapse transition states, etc.).
//
// Source of truth: assets/css/bootstrap.full.css (committed, never served).
// Output: assets/css/bootstrap.min.css (served, fingerprinted by fingerprint.mjs).
//
// Runs in build-pages.mjs after the HTML is on disk; --check mode compares the
// freshly-purged output against the committed file and fails if stale.

import fs from 'node:fs';
import path from 'node:path';
import { PurgeCSS } from 'purgecss';
import { minify as cssoMinify } from 'csso';

const SAFELIST = {
  standard: [
    // Bootstrap classes added/removed at runtime by its JS (or the site's jQuery),
    // so they may not appear verbatim in the static HTML scanned by PurgeCSS.
    'show', 'fade', 'collapse', 'collapsing', 'active', 'disabled', 'hidden',
    'modal', 'modal-open', 'modal-backdrop', 'modal-dialog', 'modal-content',
    'modal-header', 'modal-body', 'modal-footer', 'modal-title', 'modal-static',
    'modal-dialog-centered', 'modal-dialog-scrollable',
  ],
  // Keep the full responsive grid + ordering/offset utilities even if a given
  // breakpoint isn't present in the current HTML — cheap insurance against layout
  // breakage when a col-*/offset-* is added later.
  greedy: [/^col-/, /^row/, /^container/, /^offset-/, /^order-/, /^g-/, /^gx-/, /^gy-/],
};

export async function purgeBootstrap(rootDir, { checkOnly = false } = {}) {
  const sourcePath = path.resolve(rootDir, 'assets/css/bootstrap.full.css');
  const outputPath = path.resolve(rootDir, 'assets/css/bootstrap.min.css');

  if (!fs.existsSync(sourcePath)) {
    throw new Error('assets/css/bootstrap.full.css (purge source) not found.');
  }

  const css = fs.readFileSync(sourcePath, 'utf8');
  const result = await new PurgeCSS().purge({
    content: [
      path.resolve(rootDir, '*.html'),
      path.resolve(rootDir, 'assets/js/*.js'),
    ],
    css: [{ raw: css }],
    safelist: SAFELIST,
  });

  const purged = result[0]?.css ?? '';
  const minified = cssoMinify(purged).css;

  if (checkOnly) {
    const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';
    if (current !== minified) {
      const err = new Error('assets/css/bootstrap.min.css is stale (run: npm run build:pages)');
      err.stale = true;
      throw err;
    }
    return { updated: false, bytes: minified.length };
  }

  fs.writeFileSync(outputPath, minified);
  return { updated: true, bytes: minified.length };
}
