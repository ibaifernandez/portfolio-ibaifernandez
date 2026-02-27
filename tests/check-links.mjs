#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const args = process.argv.slice(2);

const checkExternal = args.includes('--check-external');
const concurrencyArg = args.find((arg) => arg.startsWith('--concurrency='));
const maxExternalArg = args.find((arg) => arg.startsWith('--max-external='));
const timeoutArg = args.find((arg) => arg.startsWith('--timeout='));
const timeoutMs = timeoutArg ? Number(timeoutArg.split('=')[1]) : 8000;
const concurrency = concurrencyArg ? Number(concurrencyArg.split('=')[1]) : 6;
const maxExternal = maxExternalArg ? Number(maxExternalArg.split('=')[1]) : Infinity;
const pageArgs = args.filter((arg) => !arg.startsWith('--'));
const pages = pageArgs.length > 0 ? pageArgs : ['index.html', 'blog.html'];

let hasFailures = false;

function fail(message) {
  console.error(`[FAIL] ${message}`);
  hasFailures = true;
}

function warn(message) {
  console.warn(`[WARN] ${message}`);
}

function info(message) {
  console.log(`[LINKS] ${message}`);
}

function toPositiveInteger(value, fallback) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  const normalized = Math.floor(value);
  return normalized > 0 ? normalized : fallback;
}

function normalizeHref(href) {
  return href.trim();
}

function isExternalHref(href) {
  return /^(https?:)?\/\//i.test(href);
}

function isSkippableHref(href) {
  return href === '' ||
    href === '#' ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('javascript:') ||
    href.startsWith('data:');
}

function toRelative(filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join('/');
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

const idCache = new Map();

function collectIdsForFile(filePath) {
  if (idCache.has(filePath)) {
    return idCache.get(filePath);
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    idCache.set(filePath, new Set());
    return idCache.get(filePath);
  }

  const html = readFile(filePath);
  const ids = new Set();
  const idRegex = /\bid=(['"])(.*?)\1/gi;
  let match;
  while ((match = idRegex.exec(html))) {
    const id = (match[2] || '').trim();
    if (id !== '') {
      ids.add(id);
    }
  }

  idCache.set(filePath, ids);
  return ids;
}

function splitHref(href) {
  const hashIndex = href.indexOf('#');
  if (hashIndex < 0) {
    return { target: href, hash: '' };
  }
  return {
    target: href.slice(0, hashIndex),
    hash: href.slice(hashIndex + 1)
  };
}

function resolveLocalTarget(pagePath, target) {
  let normalizedTarget = target;

  if (normalizedTarget === '') {
    return path.resolve(rootDir, pagePath);
  }

  if (normalizedTarget.startsWith('/')) {
    normalizedTarget = `.${normalizedTarget}`;
    return path.resolve(rootDir, normalizedTarget);
  }

  return path.resolve(rootDir, path.dirname(pagePath), normalizedTarget);
}

function normalizeResolvedPath(resolvedPath) {
  let normalized = resolvedPath;
  if (normalized.endsWith(path.sep)) {
    normalized = path.join(normalized, 'index.html');
  }
  return normalized;
}

function collectLinks(pagePath, html) {
  const anchors = [];
  const hrefRegex = /<a\b[^>]*\bhref=(['"])(.*?)\1[^>]*>/gi;
  let match;

  while ((match = hrefRegex.exec(html))) {
    const href = normalizeHref(match[2] || '');
    const line = html.slice(0, match.index).split('\n').length;
    anchors.push({ href, line });
  }

  return anchors;
}

async function checkExternalLink(url, timeout) {
  const signal = AbortSignal.timeout(timeout);

  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal
    });

    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal
      });
    }

    if (response.status === 404 || response.status === 410 || response.status >= 500) {
      return {
        ok: false,
        status: response.status
      };
    }

    return {
      ok: true,
      status: response.status
    };
  } catch (error) {
    return {
      ok: false,
      status: 'network-error',
      error: String(error)
    };
  }
}

async function main() {
  const externalLinks = new Map();
  let checkedLocalLinks = 0;
  let placeholderLinks = 0;

  for (const page of pages) {
    const pagePath = path.resolve(rootDir, page);

    if (!fs.existsSync(pagePath)) {
      fail(`Page file not found: ${page}`);
      continue;
    }

    const html = readFile(pagePath);
    const links = collectLinks(page, html);

    for (const { href, line } of links) {
      if (isSkippableHref(href)) {
        if (href === '#') {
          placeholderLinks += 1;
        }
        continue;
      }

      if (href.includes('https://https://')) {
        fail(`${page}:${line} malformed href ${href}`);
        continue;
      }

      if (isExternalHref(href)) {
        const normalized = href.startsWith('//') ? `https:${href}` : href;
        if (!externalLinks.has(normalized)) {
          externalLinks.set(normalized, []);
        }
        externalLinks.get(normalized).push(`${page}:${line}`);
        continue;
      }

      checkedLocalLinks += 1;
      const { target, hash } = splitHref(href);
      const resolvedTarget = normalizeResolvedPath(resolveLocalTarget(page, target));

      if (!resolvedTarget.startsWith(rootDir)) {
        fail(`${page}:${line} path traversal not allowed in href ${href}`);
        continue;
      }

      if (!fs.existsSync(resolvedTarget) || !fs.statSync(resolvedTarget).isFile()) {
        fail(`${page}:${line} broken local target ${href}`);
        continue;
      }

      if (hash) {
        const hashTarget = decodeURIComponent(hash);
        const ext = path.extname(resolvedTarget).toLowerCase();
        if (ext === '.html' || ext === '.htm' || ext === '') {
          const ids = collectIdsForFile(resolvedTarget);
          if (!ids.has(hashTarget)) {
            fail(`${page}:${line} missing anchor #${hashTarget} in ${toRelative(resolvedTarget)}`);
          }
        }
      }
    }
  }

  info(`checked ${checkedLocalLinks} internal links`);
  info(`found ${externalLinks.size} unique external links`);
  if (placeholderLinks > 0) {
    warn(`ignored ${placeholderLinks} placeholder links with href="#"`);
  }

  if (checkExternal && externalLinks.size > 0) {
    const safeTimeoutMs = toPositiveInteger(timeoutMs, 8000);
    const safeConcurrency = toPositiveInteger(concurrency, 6);
    const limitedEntries = Array.from(externalLinks.entries()).slice(
      0,
      Number.isFinite(maxExternal) ? toPositiveInteger(maxExternal, 1) : externalLinks.size
    );

    if (limitedEntries.length < externalLinks.size) {
      warn(`checking only ${limitedEntries.length}/${externalLinks.size} external links due to --max-external`);
    }

    info(`checking ${limitedEntries.length} external links (timeout ${safeTimeoutMs}ms, concurrency ${safeConcurrency})`);

    let index = 0;
    const workers = Array.from({ length: Math.min(safeConcurrency, limitedEntries.length) }, async () => {
      while (index < limitedEntries.length) {
        const currentIndex = index;
        index += 1;
        const [url, refs] = limitedEntries[currentIndex];
        const result = await checkExternalLink(url, safeTimeoutMs);
        if (!result.ok) {
          fail(`external link failed (${result.status}) ${url} referenced at ${refs.join(', ')}`);
        }
      }
    });

    await Promise.all(workers);
  }

  if (hasFailures) {
    process.exit(1);
  }

  console.log('[OK] link checks passed');
}

main();
