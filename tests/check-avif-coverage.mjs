#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const htmlFiles = [];
let minBytes = 50000;

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--min-bytes') {
    minBytes = Number(args[++i]);
  } else {
    htmlFiles.push(arg);
  }
}

if (!Number.isFinite(minBytes) || minBytes < 0) {
  console.error(`[FAIL] Invalid --min-bytes value: ${minBytes}`);
  process.exit(1);
}

function getDefaultHtmlFiles() {
  return fs.readdirSync(rootDir)
    .filter((file) => file.endsWith('.html'))
    .filter((file) => fs.statSync(path.resolve(rootDir, file)).isFile())
    .sort();
}

const targets = htmlFiles.length > 0 ? htmlFiles : getDefaultHtmlFiles();

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

function toAvifPath(url) {
  return url.replace(/\.(?:png|jpe?g)$/i, '.avif');
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

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
const alphaCache = new Map();

function pngHasTransparency(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.length < PNG_SIGNATURE.length || !buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    return false;
  }

  let offset = PNG_SIGNATURE.length;
  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32BE(offset);
    const chunkType = buffer.toString('ascii', offset + 4, offset + 8);
    const chunkDataStart = offset + 8;
    const chunkDataEnd = chunkDataStart + chunkLength;
    const nextOffset = chunkDataEnd + 4;

    if (nextOffset > buffer.length) {
      return false;
    }

    if (chunkType === 'IHDR' && chunkLength >= 10) {
      const colorType = buffer[chunkDataStart + 9];
      if (colorType === 4 || colorType === 6) {
        return true;
      }
    }

    if (chunkType === 'tRNS') {
      return true;
    }

    if (chunkType === 'IEND') {
      break;
    }

    offset = nextOffset;
  }

  return false;
}

function hasAlphaChannel(filePath) {
  if (alphaCache.has(filePath)) {
    return alphaCache.get(filePath);
  }

  const hasAlpha = pngHasTransparency(filePath);
  alphaCache.set(filePath, hasAlpha);
  return hasAlpha;
}

const failures = [];
let checked = 0;
let skippedSmall = 0;
let skippedAlpha = 0;

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

    if (/\.png$/i.test(src) && hasAlphaChannel(sourceFile)) {
      skippedAlpha += 1;
      continue;
    }

    checked += 1;
    const expectedAvif = toAvifPath(src);
    const avifAbsolute = path.resolve(path.dirname(absolute), expectedAvif);
    if (!fs.existsSync(avifAbsolute)) {
      failures.push(`${file}: missing AVIF fallback asset for ${src} -> ${expectedAvif}`);
      continue;
    }

    const pictureRange = isInsidePicture(html, match.index);
    if (!pictureRange) {
      failures.push(`${file}: image is not wrapped in <picture>: ${src}`);
      continue;
    }

    const pictureBlock = html.slice(pictureRange.start, pictureRange.end);
    const sourceRegex = /<source\b[^>]*type=["']image\/avif["'][^>]*srcset=["']([^"']+)["'][^>]*>/gi;
    let sourceMatch;
    let foundMatch = false;
    while ((sourceMatch = sourceRegex.exec(pictureBlock))) {
      const firstSrc = parseFirstSrcsetEntry(sourceMatch[1]);
      if (firstSrc === expectedAvif) {
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      failures.push(`${file}: <picture> for ${src} lacks matching AVIF source (${expectedAvif})`);
    }
  }
}

if (failures.length > 0) {
  for (const issue of failures) {
    console.error(`[FAIL] ${issue}`);
  }
  process.exit(1);
}

console.log(`[OK] AVIF coverage passed | checked=${checked} skipped_small=${skippedSmall} skipped_alpha_png=${skippedAlpha}`);
