#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const DEFAULT_HTML_FILES = ['index.html', 'blog.html'];
const options = {
  htmlFiles: [],
  minBytes: 50000,
  crf: 36,
  preset: 10,
  force: false,
  dryRun: false
};

function usageAndExit(code = 0) {
  console.log(
    'Usage: node scripts/generate-avif-assets.mjs [--min-bytes N] [--crf N] [--preset N] [--force] [--dry-run] [html-file ...]'
  );
  process.exit(code);
}

function parseNumber(raw, name) {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    console.error(`[FAIL] Invalid ${name}: ${raw}`);
    process.exit(1);
  }
  return value;
}

for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];

  if (arg === '--help' || arg === '-h') {
    usageAndExit(0);
  } else if (arg === '--min-bytes') {
    options.minBytes = parseNumber(process.argv[++i], '--min-bytes');
  } else if (arg === '--crf') {
    options.crf = parseNumber(process.argv[++i], '--crf');
  } else if (arg === '--preset') {
    options.preset = parseNumber(process.argv[++i], '--preset');
  } else if (arg === '--force') {
    options.force = true;
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg.startsWith('--')) {
    console.error(`[FAIL] Unknown option: ${arg}`);
    usageAndExit(1);
  } else {
    options.htmlFiles.push(arg);
  }
}

if (!Number.isFinite(options.minBytes) || !Number.isFinite(options.crf) || !Number.isFinite(options.preset)) {
  usageAndExit(1);
}

if (options.htmlFiles.length === 0) {
  options.htmlFiles = DEFAULT_HTML_FILES;
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

function isConvertibleAsset(url) {
  return /\.(?:png|jpe?g)$/i.test(url);
}

function toAvifPath(url) {
  return url.replace(/\.(?:png|jpe?g)$/i, '.avif');
}

function hasAlphaChannel(filePath) {
  const result = spawnSync('sips', ['-g', 'hasAlpha', filePath], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  });

  if (result.status !== 0) {
    return false;
  }
  return /hasAlpha:\s*yes/i.test(result.stdout || '');
}

function collectCandidatesFromHtml(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`[WARN] Skipping missing HTML file: ${filePath}`);
    return [];
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const results = [];
  const seen = new Set();
  const imgRe = /<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi;

  let match;
  while ((match = imgRe.exec(html))) {
    const src = normalizeUrl(match[1]);
    if (!isLocalAsset(src) || !isConvertibleAsset(src)) {
      continue;
    }

    const absolute = path.resolve(path.dirname(filePath), src);
    if (seen.has(absolute)) {
      continue;
    }
    seen.add(absolute);

    results.push({
      src,
      absolute,
      fromHtml: filePath
    });
  }

  return results;
}

function convertToAvif(inputPath, outputPath, crf, preset) {
  return spawnSync(
    'ffmpeg',
    [
      '-y',
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      inputPath,
      '-frames:v',
      '1',
      '-c:v',
      'libsvtav1',
      '-pix_fmt',
      'yuv420p',
      '-crf',
      String(crf),
      '-preset',
      String(preset),
      outputPath
    ],
    { stdio: 'ignore' }
  );
}

const allCandidates = [];
for (const htmlFile of options.htmlFiles) {
  allCandidates.push(...collectCandidatesFromHtml(path.resolve(htmlFile)));
}

const uniqueByPath = new Map();
for (const entry of allCandidates) {
  if (!uniqueByPath.has(entry.absolute)) {
    uniqueByPath.set(entry.absolute, entry);
  }
}

let converted = 0;
let skippedSmall = 0;
let skippedExisting = 0;
let skippedAlpha = 0;
let skippedNotSmaller = 0;
let failures = 0;

for (const entry of uniqueByPath.values()) {
  if (!fs.existsSync(entry.absolute) || !fs.statSync(entry.absolute).isFile()) {
    console.error(`[WARN] Missing referenced image: ${entry.src} (${entry.fromHtml})`);
    continue;
  }

  const originalBytes = fs.statSync(entry.absolute).size;
  if (originalBytes < options.minBytes) {
    skippedSmall += 1;
    continue;
  }

  if (/\.png$/i.test(entry.absolute) && hasAlphaChannel(entry.absolute)) {
    skippedAlpha += 1;
    continue;
  }

  const outputPath = toAvifPath(entry.absolute);
  if (fs.existsSync(outputPath) && !options.force) {
    skippedExisting += 1;
    continue;
  }

  if (options.dryRun) {
    console.log(`[DRY] ${path.relative(process.cwd(), entry.absolute)} -> ${path.relative(process.cwd(), outputPath)}`);
    continue;
  }

  const result = convertToAvif(entry.absolute, outputPath, options.crf, options.preset);
  if (result.status !== 0 || !fs.existsSync(outputPath)) {
    failures += 1;
    console.error(`[FAIL] AVIF conversion failed: ${entry.src}`);
    continue;
  }

  const avifBytes = fs.statSync(outputPath).size;
  if (avifBytes >= originalBytes) {
    fs.unlinkSync(outputPath);
    skippedNotSmaller += 1;
    continue;
  }

  converted += 1;
  const ratio = ((100 * (1 - avifBytes / originalBytes))).toFixed(1);
  console.log(
    `[OK] ${entry.src} -> ${toAvifPath(entry.src)} (${(originalBytes / 1024).toFixed(1)} KB -> ${(avifBytes / 1024).toFixed(1)} KB, -${ratio}%)`
  );
}

console.log(
  `[SUMMARY] converted=${converted} skipped_small=${skippedSmall} skipped_existing=${skippedExisting} skipped_alpha_png=${skippedAlpha} skipped_not_smaller=${skippedNotSmaller} failures=${failures}`
);

if (failures > 0) {
  process.exit(1);
}
