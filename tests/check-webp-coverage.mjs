#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const htmlFiles = [];
let minBytes = 50000;
let requireAsset = false;

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--min-bytes') {
    minBytes = Number(args[++i]);
  } else if (arg === '--require-asset') {
    requireAsset = true;
  } else {
    htmlFiles.push(arg);
  }
}

if (!Number.isFinite(minBytes) || minBytes < 0) {
  console.error(`[FAIL] Invalid --min-bytes value: ${minBytes}`);
  process.exit(1);
}

const targets = htmlFiles.length > 0 ? htmlFiles : ['index.html', 'blog.html'];

function normalizeUrl(raw) {
  if (!raw) return '';
  return raw.split('#')[0].split('?')[0].trim();
}

function isLocalAsset(url) {
  return url !== '' &&
    !url.startsWith('http://') &&
    !url.startsWith('https://') &&
    !url.startsWith('//') &&
    !url.startsWith('data:') &&
    !url.startsWith('mailto:') &&
    !url.startsWith('tel:') &&
    !url.startsWith('javascript:');
}

function isConvertibleAsset(url) {
  return /\.(?:png|jpe?g)$/i.test(url);
}

function toWebpPath(url) {
  return url.replace(/\.(?:png|jpe?g)$/i, '.webp');
}

function isInsidePicture(html, index) {
  const open = html.lastIndexOf('<picture', index);
  if (open === -1) {
    return null;
  }
  const closeBefore = html.lastIndexOf('</picture>', index);
  if (closeBefore >= open) {
    return null;
  }
  const closeAfter = html.indexOf('</picture>', index);
  if (closeAfter === -1) {
    return null;
  }
  return {
    start: open,
    end: closeAfter + '</picture>'.length
  };
}

function parseFirstSrcsetEntry(value) {
  if (!value) return '';
  const first = value.split(',')[0]?.trim();
  if (!first) return '';
  return normalizeUrl(first.split(/\s+/)[0]);
}

const failures = [];
let checked = 0;
let skippedSmall = 0;
let skippedMissingAsset = 0;

for (const file of targets) {
  const absolute = path.resolve(rootDir, file);
  if (!fs.existsSync(absolute)) {
    failures.push(`${file}: missing html file`);
    continue;
  }

  const html = fs.readFileSync(absolute, 'utf8');
  const imgRegex = /<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let match;

  while ((match = imgRegex.exec(html))) {
    const src = normalizeUrl(match[1]);
    if (!isLocalAsset(src) || !isConvertibleAsset(src)) {
      continue;
    }

    const sourceFile = path.resolve(path.dirname(absolute), src);
    if (!fs.existsSync(sourceFile)) {
      failures.push(`${file}: missing image asset ${src}`);
      continue;
    }

    const sourceSize = fs.statSync(sourceFile).size;
    if (sourceSize < minBytes) {
      skippedSmall += 1;
      continue;
    }

    const expectedWebp = toWebpPath(src);
    const webpAbsolute = path.resolve(path.dirname(absolute), expectedWebp);
    if (!fs.existsSync(webpAbsolute)) {
      if (requireAsset) {
        failures.push(`${file}: missing WebP asset for ${src} -> ${expectedWebp}`);
      } else {
        skippedMissingAsset += 1;
      }
      continue;
    }

    checked += 1;

    const pictureRange = isInsidePicture(html, match.index);
    if (!pictureRange) {
      failures.push(`${file}: image is not wrapped in <picture>: ${src}`);
      continue;
    }

    const pictureBlock = html.slice(pictureRange.start, pictureRange.end);
    const sourceRegex = /<source\b[^>]*type=["']image\/webp["'][^>]*srcset=["']([^"']+)["'][^>]*>/gi;
    let sourceMatch;
    let foundMatch = false;
    while ((sourceMatch = sourceRegex.exec(pictureBlock))) {
      const firstSrc = parseFirstSrcsetEntry(sourceMatch[1]);
      if (firstSrc === expectedWebp) {
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      failures.push(`${file}: <picture> for ${src} lacks matching WebP source (${expectedWebp})`);
    }
  }
}

if (failures.length > 0) {
  for (const issue of failures) {
    console.error(`[FAIL] ${issue}`);
  }
  process.exit(1);
}

console.log(
  `[OK] WebP coverage passed | checked=${checked} skipped_small=${skippedSmall} skipped_missing_asset=${skippedMissingAsset} require_asset=${requireAsset}`
);
