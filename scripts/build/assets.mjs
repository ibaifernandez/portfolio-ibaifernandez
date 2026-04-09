import fs from 'node:fs';
import path from 'node:path';

import { ensureTrailingNewline } from './template-utils.mjs';

export function minifyCss(source) {
  const normalized = source
    .replace(/\r\n/g, '\n')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;])\s*/g, '$1')
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)\s*/g, ')')
    .replace(/\s*,\s*/g, ',')
    .replace(/;}/g, '}')
    .trim();

  return ensureTrailingNewline(normalized);
}

function stripStandaloneBlockComments(source) {
  return source.replace(/^[\t ]*\/\*[\s\S]*?\*\/[\t ]*(?:\r?\n)?/gm, '');
}

export function minifyJs(source) {
  const compact = stripStandaloneBlockComments(source)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('//'))
    .join('\n')
    .trim();

  return ensureTrailingNewline(compact);
}

export function renderMinifiedAsset(rootDir, entry) {
  const sourcePath = path.resolve(rootDir, entry.source);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Asset source not found: ${entry.source}`);
  }

  const raw = fs.readFileSync(sourcePath, 'utf8');
  if (entry.type === 'css') {
    return minifyCss(raw);
  }
  if (entry.type === 'js') {
    return minifyJs(raw);
  }

  throw new Error(`Unsupported asset minification type: ${entry.type}`);
}
