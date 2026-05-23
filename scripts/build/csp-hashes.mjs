#!/usr/bin/env node
// Compute SHA256 hashes of inline scripts + event handlers across generated
// HTML pages, then rewrite netlify.toml's script-src directive to use those
// hashes instead of 'unsafe-inline'.
//
// CLI:
//   node scripts/build/csp-hashes.mjs           # update netlify.toml in place
//   node scripts/build/csp-hashes.mjs --check   # exit 1 if CSP is stale
//
// Module:
//   import { syncCspHashes } from './build/csp-hashes.mjs';
//   syncCspHashes(rootDir);                     // returns { updated, scriptCount, handlerCount }
//   syncCspHashes(rootDir, { checkOnly: true }); // throws on stale

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const inlineScriptRe = /<script\b((?!\bsrc=)[^>])*?>([\s\S]*?)<\/script>/gi;
const handlerRe = /\s(?:onload|onclick|onerror|onkeyup|onsubmit|onchange|onfocus|onblur|onmouseover|onmouseout|oninput)="([^"]+)"/gi;

const externalSources = [
	'https://www.googletagmanager.com',
	'https://www.google-analytics.com',
	'https://challenges.cloudflare.com'
];

function sha256b64(content) {
	return 'sha256-' + crypto.createHash('sha256').update(content, 'utf8').digest('base64');
}

export function computeCspHashes(rootDir) {
	const pages = fs.readdirSync(rootDir)
		.filter((f) => f.endsWith('.html'))
		.filter((f) => fs.statSync(path.resolve(rootDir, f)).isFile());

	const scripts = new Set();
	const handlers = new Set();

	for (const page of pages) {
		const html = fs.readFileSync(path.resolve(rootDir, page), 'utf8');
		let m;
		inlineScriptRe.lastIndex = 0;
		while ((m = inlineScriptRe.exec(html))) {
			const body = m[2];
			if (body.trim()) scripts.add(body);
		}
		handlerRe.lastIndex = 0;
		while ((m = handlerRe.exec(html))) {
			handlers.add(m[1]);
		}
	}

	return {
		scriptHashes: [...scripts].map(sha256b64).sort(),
		handlerHashes: [...handlers].map(sha256b64).sort()
	};
}

export function buildScriptSrcValue({ scriptHashes, handlerHashes }) {
	const parts = ["'self'"];
	if (handlerHashes.length > 0) parts.push("'unsafe-hashes'");
	for (const h of scriptHashes) parts.push(`'${h}'`);
	for (const h of handlerHashes) parts.push(`'${h}'`);
	for (const src of externalSources) parts.push(src);
	return `script-src ${parts.join(' ')};`;
}

export function syncCspHashes(rootDir, { checkOnly = false } = {}) {
	const netlifyTomlPath = path.resolve(rootDir, 'netlify.toml');
	const toml = fs.readFileSync(netlifyTomlPath, 'utf8');
	const cspLineRe = /(Content-Security-Policy\s*=\s*")([^"]+)(")/;
	const cspMatch = toml.match(cspLineRe);
	if (!cspMatch) {
		throw new Error('Content-Security-Policy line not found in netlify.toml');
	}

	const hashes = computeCspHashes(rootDir);
	const currentCsp = cspMatch[2];
	const scriptSrcValue = buildScriptSrcValue(hashes);
	const updatedCsp = currentCsp.replace(/script-src[^;]+;/, scriptSrcValue);

	if (currentCsp === updatedCsp) {
		return { updated: false, ...hashes };
	}

	if (checkOnly) {
		const err = new Error('netlify.toml CSP script-src is stale. Run `node scripts/build/csp-hashes.mjs` to update.');
		err.expected = scriptSrcValue;
		err.found = currentCsp.match(/script-src[^;]+;/)?.[0] || '(no script-src)';
		throw err;
	}

	const updatedToml = toml.replace(cspLineRe, (_full, pre, _csp, post) => `${pre}${updatedCsp}${post}`);
	fs.writeFileSync(netlifyTomlPath, updatedToml);
	return { updated: true, ...hashes };
}

// CLI entry point
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
	const checkOnly = process.argv.slice(2).includes('--check');
	try {
		const result = syncCspHashes(process.cwd(), { checkOnly });
		const summary = `${result.scriptHashes.length} script hash(es), ${result.handlerHashes.length} handler hash(es)`;
		if (result.updated) {
			console.log(`[OK] netlify.toml CSP script-src updated: ${summary}`);
		} else {
			console.log(`[OK] CSP script-src already in sync (${summary})`);
		}
	} catch (err) {
		console.error(`[FAIL] ${err.message}`);
		if (err.expected) {
			console.error('       Expected:', err.expected);
			console.error('       Found:   ', err.found);
		}
		process.exit(1);
	}
}
