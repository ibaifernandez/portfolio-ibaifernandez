import fs from 'node:fs';
import path from 'node:path';

import { minify as cssoMinify } from 'csso';
import { minify as terserMinify } from 'terser';

import { ensureTrailingNewline } from './template-utils.mjs';

// Synchronous wrapper for csso (it IS sync).
export function minifyCss(source) {
  const result = cssoMinify(source, { restructure: true });
  return ensureTrailingNewline(result.css);
}

// terser is async; renderMinifiedAsset must await for JS entries.
export async function minifyJs(source) {
  const result = await terserMinify(source, {
    compress: {
      drop_console: false,
      passes: 2
    },
    mangle: true,
    format: {
      comments: false
    }
  });
  if (!result.code) {
    throw new Error('terser returned empty result');
  }
  return ensureTrailingNewline(result.code);
}

export async function renderMinifiedAsset(rootDir, entry) {
  const sourcePath = path.resolve(rootDir, entry.source);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Asset source not found: ${entry.source}`);
  }

  const raw = fs.readFileSync(sourcePath, 'utf8');
  if (entry.type === 'css') {
    return minifyCss(raw);
  }
  if (entry.type === 'js') {
    return await minifyJs(raw);
  }

  throw new Error(`Unsupported asset minification type: ${entry.type}`);
}
