#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const files = process.argv.slice(2);
if (files.length === 0) {
  files.push('index.html', 'blog.html');
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

function toWebpPath(url) {
  return url.replace(/\.(?:png|jpe?g)$/i, '.webp');
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

function removeAttr(attrs, name) {
  const index = attrs.findIndex((attr) => attr.name.toLowerCase() === name.toLowerCase());
  if (index !== -1) {
    attrs.splice(index, 1);
  }
}

function isInsidePicture(html, index) {
  const open = html.lastIndexOf('<picture', index);
  if (open === -1) {
    return false;
  }
  const close = html.lastIndexOf('</picture>', index);
  return close < open;
}

function availableModernSources(htmlAbsolutePath, src) {
  const sources = [];
  const avif = toAvifPath(src);
  const webp = toWebpPath(src);
  const avifAbsolute = path.resolve(path.dirname(htmlAbsolutePath), avif);
  const webpAbsolute = path.resolve(path.dirname(htmlAbsolutePath), webp);

  if (fs.existsSync(avifAbsolute)) {
    sources.push({ type: 'image/avif', srcset: avif });
  }
  if (fs.existsSync(webpAbsolute)) {
    sources.push({ type: 'image/webp', srcset: webp });
  }

  return sources;
}

function enrichPictureBlock(block, htmlAbsolutePath) {
  const imgMatch = /<img\b[^>]*>/i.exec(block);
  if (!imgMatch) {
    return block;
  }

  const originalImgTag = imgMatch[0];
  const attrs = parseAttrs(originalImgTag);
  const srcAttr = getAttr(attrs, 'src');
  if (!srcAttr || !srcAttr.value) {
    return block;
  }

  const src = normalizeUrl(srcAttr.value);
  if (!isLocalAsset(src) || !isConvertibleAsset(src)) {
    return block;
  }

  const sources = availableModernSources(htmlAbsolutePath, src);
  if (sources.length === 0) {
    return block;
  }

  if (sources.some((entry) => entry.type === 'image/avif')) {
    setAttr(attrs, 'data-avif-fallback', 'true');
  } else {
    removeAttr(attrs, 'data-avif-fallback');
  }

  const isSelfClosing = /\/>$/.test(originalImgTag);
  const updatedImgTag = serializeAttrs(attrs, isSelfClosing);
  let updated = block.replace(originalImgTag, updatedImgTag);

  updated = updated.replace(/[ \t]*<source\b[^>]*type=["']image\/(?:avif|webp)["'][^>]*>\s*\n?/gi, '');

  const cleanImgMatch = /<img\b[^>]*>/i.exec(updated);
  if (!cleanImgMatch) {
    return updated;
  }

  const lineStart = updated.lastIndexOf('\n', cleanImgMatch.index - 1) + 1;
  const indent = updated.slice(lineStart, cleanImgMatch.index);
  if (!/^[ \t]*$/.test(indent)) {
    return updated;
  }

  const sourceBlock = sources
    .map((entry) => `${indent}<source type="${entry.type}" srcset="${entry.srcset}">\n`)
    .join('');

  return `${updated.slice(0, cleanImgMatch.index)}${sourceBlock}${updated.slice(cleanImgMatch.index)}`;
}

for (const file of files) {
  const absolute = path.resolve(file);
  if (!fs.existsSync(absolute)) {
    console.error(`[WARN] Missing HTML file: ${file}`);
    continue;
  }

  const html = fs.readFileSync(absolute, 'utf8');
  let wrappedCount = 0;

  const updated = html.replace(/<img\b[^>]*>/gi, (tag, offset) => {
    if (isInsidePicture(html, offset)) {
      return tag;
    }

    const lineStart = html.lastIndexOf('\n', offset - 1) + 1;
    const prefix = html.slice(lineStart, offset);
    if (!/^[ \t]*$/.test(prefix)) {
      return tag;
    }

    const attrs = parseAttrs(tag);
    const srcAttr = getAttr(attrs, 'src');
    if (!srcAttr || !srcAttr.value) {
      return tag;
    }
    if (getAttr(attrs, 'data-avif-fallback')) {
      return tag;
    }

    const src = normalizeUrl(srcAttr.value);
    if (!isLocalAsset(src) || !isConvertibleAsset(src)) {
      return tag;
    }

    const sources = availableModernSources(absolute, src);
    if (sources.length === 0) {
      return tag;
    }

    if (sources.some((entry) => entry.type === 'image/avif')) {
      setAttr(attrs, 'data-avif-fallback', 'true');
    } else {
      removeAttr(attrs, 'data-avif-fallback');
    }

    const isSelfClosing = /\/>$/.test(tag);
    const imgTag = serializeAttrs(attrs, isSelfClosing);
    const indent = prefix;
    const sourceLines = sources
      .map((entry) => `${indent}  <source type="${entry.type}" srcset="${entry.srcset}">`)
      .join('\n');

    wrappedCount += 1;
    return `${indent}<picture>\n${sourceLines}\n${indent}  ${imgTag}\n${indent}</picture>`;
  });

  const normalized = updated.replace(/<picture\b[^>]*>[\s\S]*?<\/picture>/gi, (block) => enrichPictureBlock(block, absolute));

  if (normalized !== html) {
    fs.writeFileSync(absolute, normalized);
    console.log(`Updated ${file}: wrapped ${wrappedCount} <img> tags`);
  } else {
    console.log(`No changes ${file}`);
  }
}
