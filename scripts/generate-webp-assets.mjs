#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const DEFAULT_HTML_FILES = ['index.html', 'blog.html'];
const options = {
  htmlFiles: [],
  minBytes: 50000,
  quality: 82,
  method: 6,
  lossless: false,
  force: false,
  dryRun: false
};

function usageAndExit(code = 0) {
  console.log(
    'Usage: node scripts/generate-webp-assets.mjs [--min-bytes N] [--quality N] [--method N] [--lossless] [--force] [--dry-run] [html-file ...]'
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
  } else if (arg === '--quality') {
    options.quality = parseNumber(process.argv[++i], '--quality');
  } else if (arg === '--method') {
    options.method = parseNumber(process.argv[++i], '--method');
  } else if (arg === '--lossless') {
    options.lossless = true;
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

if (options.htmlFiles.length === 0) {
  options.htmlFiles = DEFAULT_HTML_FILES;
}

if (options.quality > 100 || options.method > 6) {
  console.error('[FAIL] --quality must be <= 100 and --method must be <= 6');
  process.exit(1);
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

function toWebpPath(url) {
  return url.replace(/\.(?:png|jpe?g)$/i, '.webp');
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

function commandWorks(command, args = []) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  });
  return result.status === 0;
}

function detectEncoder() {
  if (commandWorks('cwebp', ['-version'])) {
    return 'cwebp';
  }

  const encoders = spawnSync('ffmpeg', ['-hide_banner', '-encoders'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  });
  if (encoders.status === 0 && /libwebp/i.test(encoders.stdout || '')) {
    return 'ffmpeg';
  }

  return null;
}

function convertWithCwebp(inputPath, outputPath, quality, method, lossless) {
  const args = ['-quiet', '-mt', '-m', String(method)];
  if (lossless) {
    args.push('-lossless');
  } else {
    args.push('-q', String(quality));
  }
  args.push(inputPath, '-o', outputPath);
  return spawnSync('cwebp', args, { stdio: 'ignore' });
}

function convertWithFfmpeg(inputPath, outputPath, quality, method, lossless) {
  const args = ['-y', '-hide_banner', '-loglevel', 'error', '-i', inputPath, '-frames:v', '1', '-c:v', 'libwebp'];
  if (lossless) {
    args.push('-lossless', '1');
  } else {
    args.push('-quality', String(quality));
  }
  args.push('-compression_level', String(method), outputPath);
  return spawnSync('ffmpeg', args, { stdio: 'ignore' });
}

const encoder = detectEncoder();
if (!encoder) {
  console.error('[FAIL] No WebP encoder found. Install cwebp or ffmpeg with libwebp.');
  process.exit(1);
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

  const outputPath = toWebpPath(entry.absolute);
  if (fs.existsSync(outputPath) && !options.force) {
    skippedExisting += 1;
    continue;
  }

  if (options.dryRun) {
    console.log(`[DRY] ${path.relative(process.cwd(), entry.absolute)} -> ${path.relative(process.cwd(), outputPath)}`);
    continue;
  }

  const result = encoder === 'cwebp'
    ? convertWithCwebp(entry.absolute, outputPath, options.quality, options.method, options.lossless)
    : convertWithFfmpeg(entry.absolute, outputPath, options.quality, options.method, options.lossless);

  if (result.status !== 0 || !fs.existsSync(outputPath)) {
    failures += 1;
    console.error(`[FAIL] WebP conversion failed: ${entry.src}`);
    continue;
  }

  const webpBytes = fs.statSync(outputPath).size;
  if (webpBytes >= originalBytes) {
    fs.unlinkSync(outputPath);
    skippedNotSmaller += 1;
    continue;
  }

  converted += 1;
  const ratio = ((100 * (1 - webpBytes / originalBytes))).toFixed(1);
  console.log(
    `[OK] ${entry.src} -> ${toWebpPath(entry.src)} (${(originalBytes / 1024).toFixed(1)} KB -> ${(webpBytes / 1024).toFixed(1)} KB, -${ratio}%)`
  );
}

console.log(
  `[SUMMARY] encoder=${encoder} converted=${converted} skipped_small=${skippedSmall} skipped_existing=${skippedExisting} skipped_not_smaller=${skippedNotSmaller} failures=${failures}`
);

if (failures > 0) {
  process.exit(1);
}
