#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const configPath = process.argv[2] || 'tests/performance-budget.config.json';

function fail(message) {
  console.error(`[FAIL] ${message}`);
  process.exitCode = 1;
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function toSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

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

function parseSrcset(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim().split(/\s+/)[0])
    .map(normalizeUrl)
    .filter(Boolean);
}

function choosePreferredPictureAsset(candidates) {
  if (candidates.length === 0) return null;
  const avif = candidates.find((item) => /\.avif$/i.test(item));
  if (avif) return avif;
  const webp = candidates.find((item) => /\.webp$/i.test(item));
  if (webp) return webp;
  return candidates[0];
}

function collectAssetsFromHtml(html) {
  const css = new Set();
  const js = new Set();
  const images = new Set();

  const cssRe = /<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = cssRe.exec(html))) {
    const href = normalizeUrl(match[1]);
    if (isLocalAsset(href)) css.add(href);
  }

  const jsRe = /<script\b[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
  while ((match = jsRe.exec(html))) {
    const src = normalizeUrl(match[1]);
    if (isLocalAsset(src)) js.add(src);
  }

  const pictureRe = /<picture\b[^>]*>[\s\S]*?<\/picture>/gi;
  const pictureBlocks = html.match(pictureRe) ?? [];

  for (const block of pictureBlocks) {
    const candidates = [];

    const sourceRe = /<source\b[^>]*srcset=["']([^"']+)["'][^>]*>/gi;
    let sourceMatch;
    while ((sourceMatch = sourceRe.exec(block))) {
      for (const src of parseSrcset(sourceMatch[1])) {
        if (isLocalAsset(src)) candidates.push(src);
      }
    }

    const pictureImgRe = /<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let pictureImgMatch;
    while ((pictureImgMatch = pictureImgRe.exec(block))) {
      const src = normalizeUrl(pictureImgMatch[1]);
      if (isLocalAsset(src)) candidates.push(src);
    }

    const preferred = choosePreferredPictureAsset(candidates);
    if (preferred) {
      images.add(preferred);
    }
  }

  const htmlWithoutPictures = html.replace(pictureRe, '');

  const imgRe = /<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi;
  while ((match = imgRe.exec(htmlWithoutPictures))) {
    const src = normalizeUrl(match[1]);
    if (isLocalAsset(src)) images.add(src);
  }

  const srcsetRe = /<(?:img|source)\b[^>]*srcset=["']([^"']+)["'][^>]*>/gi;
  while ((match = srcsetRe.exec(htmlWithoutPictures))) {
    for (const src of parseSrcset(match[1])) {
      if (isLocalAsset(src)) images.add(src);
    }
  }

  return {
    css: [...css],
    js: [...js],
    images: [...images]
  };
}

function fileSizeFromUrl(url, pageFile) {
  const resolved = path.resolve(rootDir, path.dirname(pageFile), url);
  if (!resolved.startsWith(rootDir)) {
    return { exists: false, bytes: 0, file: resolved };
  }

  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    return { exists: false, bytes: 0, file: resolved };
  }

  return {
    exists: true,
    bytes: fs.statSync(resolved).size,
    file: resolved
  };
}

function sumAssetBytes(list, pageFile) {
  let total = 0;
  const missing = [];
  const sized = [];

  for (const entry of list) {
    const detail = fileSizeFromUrl(entry, pageFile);
    if (!detail.exists) {
      missing.push(entry);
      continue;
    }
    total += detail.bytes;
    sized.push({
      asset: entry,
      bytes: detail.bytes,
      file: detail.file
    });
  }

  return {
    total,
    missing,
    sized
  };
}

if (!fs.existsSync(configPath)) {
  console.error(`[FAIL] Budget config not found: ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const pages = Array.isArray(config.pages) ? config.pages : [];
const globalBudget = config.global || {};

if (pages.length === 0) {
  console.error('[FAIL] Budget config has no pages entries');
  process.exit(1);
}

const allCssFiles = [];
const allJsFiles = [];
const allImageFiles = [];

for (const pageBudget of pages) {
  const file = pageBudget.file;
  const filePath = path.resolve(rootDir, file);

  if (!fs.existsSync(filePath)) {
    fail(`Missing page file: ${file}`);
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const htmlBytes = fs.statSync(filePath).size;
  const assets = collectAssetsFromHtml(html);

  const css = sumAssetBytes(assets.css, file);
  const js = sumAssetBytes(assets.js, file);
  const images = sumAssetBytes(assets.images, file);

  allCssFiles.push(...css.sized);
  allJsFiles.push(...js.sized);
  allImageFiles.push(...images.sized);

  console.log(
    `[BUDGET] ${file} | HTML ${toSize(htmlBytes)} | CSS ${toSize(css.total)} (${assets.css.length}) | JS ${toSize(js.total)} (${assets.js.length}) | IMG ${toSize(images.total)} (${assets.images.length})`
  );

  if (css.missing.length > 0) {
    fail(`${file}: missing stylesheet assets: ${css.missing.join(', ')}`);
  }
  if (js.missing.length > 0) {
    fail(`${file}: missing script assets: ${js.missing.join(', ')}`);
  }
  if (images.missing.length > 0) {
    fail(`${file}: missing image assets: ${images.missing.join(', ')}`);
  }

  if (typeof pageBudget.maxHtmlBytes === 'number' && htmlBytes > pageBudget.maxHtmlBytes) {
    fail(`${file}: HTML budget exceeded (${toSize(htmlBytes)} > ${toSize(pageBudget.maxHtmlBytes)})`);
  }

  if (typeof pageBudget.maxCssBytes === 'number' && css.total > pageBudget.maxCssBytes) {
    fail(`${file}: CSS budget exceeded (${toSize(css.total)} > ${toSize(pageBudget.maxCssBytes)})`);
  }

  if (typeof pageBudget.maxJsBytes === 'number' && js.total > pageBudget.maxJsBytes) {
    fail(`${file}: JS budget exceeded (${toSize(js.total)} > ${toSize(pageBudget.maxJsBytes)})`);
  }

  if (typeof pageBudget.maxImageBytes === 'number' && images.total > pageBudget.maxImageBytes) {
    fail(`${file}: image budget exceeded (${toSize(images.total)} > ${toSize(pageBudget.maxImageBytes)})`);
  }

  if (typeof pageBudget.maxImageCount === 'number' && assets.images.length > pageBudget.maxImageCount) {
    fail(`${file}: image count budget exceeded (${assets.images.length} > ${pageBudget.maxImageCount})`);
  }
}

function assertGlobalMax(files, maxBytes, label) {
  if (typeof maxBytes !== 'number') {
    return;
  }

  const offender = files
    .sort((a, b) => b.bytes - a.bytes)
    .find((entry) => entry.bytes > maxBytes);

  if (offender) {
    fail(
      `${label} file budget exceeded (${toPosix(path.relative(rootDir, offender.file))}: ${toSize(offender.bytes)} > ${toSize(maxBytes)})`
    );
  }
}

assertGlobalMax(allCssFiles, globalBudget.maxCssFileBytes, 'CSS');
assertGlobalMax(allJsFiles, globalBudget.maxJsFileBytes, 'JS');
assertGlobalMax(allImageFiles, globalBudget.maxImageFileBytes, 'Image');

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('[OK] performance budgets passed');
