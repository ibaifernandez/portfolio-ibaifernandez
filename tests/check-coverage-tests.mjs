#!/usr/bin/env node
// Tests for tests/check-avif-coverage.mjs + tests/check-webp-coverage.mjs.
//
// The coverage checks need to keep accepting multi-resolution srcset (e.g.
// `srcset="foo-160.avif 160w, foo.avif 1024w"`), not just the first entry.
// Regression here would break sidebar profile srcset and any future
// responsive-image work, so we exercise both happy + sad paths against a
// temp HTML fixture.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'coverage-test-'));

function writeFixture(name, html) {
	const target = path.join(tmpRoot, name);
	fs.writeFileSync(target, html);
	return target;
}

function ensureDummyImage(relPath, bytes = 70 * 1024) {
	const absolute = path.join(tmpRoot, relPath);
	fs.mkdirSync(path.dirname(absolute), { recursive: true });
	fs.writeFileSync(absolute, Buffer.alloc(bytes, 0x42));
	return absolute;
}

function runCheck(script, fixture) {
	return spawnSync(
		process.execPath,
		[path.join(repoRoot, script), fixture],
		{ cwd: tmpRoot, encoding: 'utf8' }
	);
}

function pass(name) {
	console.log(`[OK] ${name}`);
}

function fail(name, details) {
	console.error(`[FAIL] ${name}`);
	if (details) console.error(details);
	process.exitCode = 1;
}

// Common fixture pieces.
const imgRefs = `<picture>
  <source type="image/avif" srcset="assets/images/sample-160.avif 160w, assets/images/sample.avif 1024w" sizes="80px">
  <source type="image/webp" srcset="assets/images/sample-160.webp 160w, assets/images/sample.webp 1024w" sizes="80px">
  <img src="assets/images/sample.jpeg" srcset="assets/images/sample-160.jpeg 160w, assets/images/sample.jpeg 1024w" sizes="80px" alt="" width="1024" height="1024">
</picture>`;

const multiSrcsetHtml = `<!doctype html><html><body>${imgRefs}</body></html>`;
const fixturePass = writeFixture('pass.html', multiSrcsetHtml);

// Required sibling assets — only the jpeg is required (the source format).
ensureDummyImage('assets/images/sample.jpeg');
ensureDummyImage('assets/images/sample.avif');
ensureDummyImage('assets/images/sample.webp');

let result = runCheck('tests/check-avif-coverage.mjs', fixturePass);
if (result.status === 0) pass('check-avif-coverage accepts multi-resolution srcset');
else fail('check-avif-coverage rejected valid multi-srcset', result.stdout + result.stderr);

result = runCheck('tests/check-webp-coverage.mjs', fixturePass);
if (result.status === 0) pass('check-webp-coverage accepts multi-resolution srcset');
else fail('check-webp-coverage rejected valid multi-srcset', result.stdout + result.stderr);

// Negative case — sad path: no AVIF source at all.
const missingAvifHtml = `<!doctype html><html><body><picture>
  <source type="image/webp" srcset="assets/images/sample.webp">
  <img src="assets/images/sample.jpeg" alt="" width="1024" height="1024">
</picture></body></html>`;
const fixtureFail = writeFixture('missing-avif.html', missingAvifHtml);

result = runCheck('tests/check-avif-coverage.mjs', fixtureFail);
if (result.status !== 0) pass('check-avif-coverage detects missing AVIF source (sad path)');
else fail('check-avif-coverage incorrectly passed when AVIF source is missing');

// Cleanup.
fs.rmSync(tmpRoot, { recursive: true, force: true });

if (!process.exitCode) {
	console.log('[OK] coverage-test passed');
}
