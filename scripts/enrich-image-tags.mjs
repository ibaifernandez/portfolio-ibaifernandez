#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node scripts/enrich-image-tags.mjs <html-file> [<html-file>...]');
  process.exit(1);
}

const projectRoot = process.cwd();
const dimCache = new Map();

function normalizeSrc(src) {
  return src.split('?')[0].split('#')[0].replace(/^\.\//, '');
}

function getDummyDimensions(src) {
  const match = src.match(/dummyimage\.com\/(\d+)x(\d+)/i);
  if (!match) {
    return null;
  }
  return { width: Number(match[1]), height: Number(match[2]) };
}

function parseDimValue(value) {
  if (!value) {
    return null;
  }
  const match = String(value).match(/^(\d+)/);
  if (!match) {
    return null;
  }
  return Number(match[1]);
}

function getLocalDimensions(src) {
  const clean = normalizeSrc(src);
  if (!/\.(png|jpe?g|gif|webp)$/i.test(clean)) {
    return null;
  }
  const absolute = path.resolve(projectRoot, clean);
  if (!fs.existsSync(absolute)) {
    return null;
  }

  if (dimCache.has(absolute)) {
    return dimCache.get(absolute);
  }

  try {
    const out = execSync(`sips -g pixelWidth -g pixelHeight "${absolute.replace(/"/g, '\\"')}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
    const wMatch = out.match(/pixelWidth:\s*(\d+)/);
    const hMatch = out.match(/pixelHeight:\s*(\d+)/);
    if (!wMatch || !hMatch) {
      dimCache.set(absolute, null);
      return null;
    }
    const dims = { width: Number(wMatch[1]), height: Number(hMatch[1]) };
    dimCache.set(absolute, dims);
    return dims;
  } catch {
    dimCache.set(absolute, null);
    return null;
  }
}

function parseAttrs(tag) {
  const attrs = [];
  const attrRegex = /([:\w-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+))?/g;
  const content = tag.slice(4, -1).trim();
  let match;
  while ((match = attrRegex.exec(content))) {
    const name = match[1];
    const raw = match[2] ?? null;
    let value = null;
    let quote = '"';
    if (raw !== null) {
      if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
        quote = raw[0];
        value = raw.slice(1, -1);
      } else {
        value = raw;
        quote = '"';
      }
    }
    attrs.push({ name, value, quote });
  }
  return attrs;
}

function serializeAttrs(attrs, isSelfClosing) {
  const rendered = attrs.map((attr) => {
    if (attr.value === null) {
      return attr.name;
    }
    const safe = attr.value.replaceAll(attr.quote, attr.quote === '"' ? '&quot;' : '&#39;');
    return `${attr.name}=${attr.quote}${safe}${attr.quote}`;
  }).join(' ');
  return `<img ${rendered}${isSelfClosing ? ' /' : ''}>`;
}

function getAttr(attrs, name) {
  return attrs.find((attr) => attr.name.toLowerCase() === name.toLowerCase()) ?? null;
}

function setAttr(attrs, name, value) {
  const existing = getAttr(attrs, name);
  if (existing) {
    existing.value = value;
    return;
  }
  attrs.push({ name, value, quote: '"' });
}

function isCriticalImage(src, id) {
  const clean = normalizeSrc(src);
  if (id === 'preloader_image' || id === 'translate-button-icon') {
    return true;
  }
  return clean === 'assets/images/ibai-fernandez-1.jpg';
}

for (const file of files) {
  const absolute = path.resolve(projectRoot, file);
  const original = fs.readFileSync(absolute, 'utf8');

  const replaced = original.replace(/<img\b[^>]*>/gi, (tag) => {
    const isSelfClosing = /\/>$/.test(tag);
    const attrs = parseAttrs(tag);
    const srcAttr = getAttr(attrs, 'src');
    if (!srcAttr || !srcAttr.value) {
      return tag;
    }

    const idAttr = getAttr(attrs, 'id');
    const idValue = idAttr?.value ?? '';
    const srcValue = srcAttr.value;
    const critical = isCriticalImage(srcValue, idValue);

    if (!getAttr(attrs, 'loading')) {
      setAttr(attrs, 'loading', critical ? 'eager' : 'lazy');
    }

    if (!getAttr(attrs, 'decoding')) {
      setAttr(attrs, 'decoding', critical ? 'sync' : 'async');
    }

    if (critical && !getAttr(attrs, 'fetchpriority')) {
      setAttr(attrs, 'fetchpriority', 'high');
    }

    const widthAttr = getAttr(attrs, 'width');
    const heightAttr = getAttr(attrs, 'height');

    const dims = getLocalDimensions(srcValue) ?? getDummyDimensions(srcValue);
    if (!dims) {
      return serializeAttrs(attrs, isSelfClosing);
    }

    const widthVal = parseDimValue(widthAttr?.value ?? null);
    const heightVal = parseDimValue(heightAttr?.value ?? null);

    if (!widthAttr && !heightAttr) {
      setAttr(attrs, 'width', String(dims.width));
      setAttr(attrs, 'height', String(dims.height));
      return serializeAttrs(attrs, isSelfClosing);
    }

    if (widthVal && !heightVal) {
      const computed = Math.max(1, Math.round((widthVal * dims.height) / dims.width));
      setAttr(attrs, 'height', String(computed));
      return serializeAttrs(attrs, isSelfClosing);
    }

    if (!widthVal && heightVal) {
      const computed = Math.max(1, Math.round((heightVal * dims.width) / dims.height));
      setAttr(attrs, 'width', String(computed));
      return serializeAttrs(attrs, isSelfClosing);
    }

    return serializeAttrs(attrs, isSelfClosing);
  });

  if (replaced !== original) {
    fs.writeFileSync(absolute, replaced);
    console.log(`Updated ${file}`);
  } else {
    console.log(`No changes ${file}`);
  }
}
