#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const files = process.argv.slice(2);

if (files.length === 0) {
  console.error('[FAIL] No files provided to check-target-blank.mjs');
  process.exit(1);
}

let hasFailures = false;

for (const relativeFile of files) {
  const absoluteFile = path.resolve(rootDir, relativeFile);
  if (!fs.existsSync(absoluteFile)) {
    console.error(`[FAIL] File not found: ${relativeFile}`);
    hasFailures = true;
    continue;
  }

  const html = fs.readFileSync(absoluteFile, 'utf8');
  const anchorPattern = /<a\b[\s\S]*?>/gi;
  let match;

  while ((match = anchorPattern.exec(html))) {
    const tag = match[0];
    if (!/\btarget\s*=\s*"_blank"/i.test(tag)) {
      continue;
    }

    const relMatch = tag.match(/\brel\s*=\s*"([^"]*)"/i);
    const relTokens = (relMatch?.[1] || '')
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    if (!relTokens.includes('noopener') || !relTokens.includes('noreferrer')) {
      const line = html.slice(0, match.index).split('\n').length;
      console.error(`[FAIL] ${relativeFile}:${line} target="_blank" is missing rel="noopener noreferrer"`);
      hasFailures = true;
    }
  }
}

if (hasFailures) {
  process.exit(1);
}

console.log('[OK] target=_blank links are hardened');
