// Unit tests for the build core's pure functions (D-TEST-02). Run: npm run test:unit
// Uses the Node built-in test runner — no extra dependency.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  renderTemplate,
  escapeHtml,
  toAbsoluteUrl,
  buildAttr,
  buildBooleanAttr,
  assertRequired,
  getValueByPath
} from '../../scripts/build/template-utils.mjs';
import { buildScriptSrcValue } from '../../scripts/build/csp-hashes.mjs';
import { renderSitemap, renderLlmsTxt } from '../../scripts/build/sitemap.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('renderTemplate: {{x}} escapes, {{{x}}} is raw, missing -> empty', () => {
  assert.equal(renderTemplate('{{a}}', { a: '<b>' }), '&lt;b&gt;');
  assert.equal(renderTemplate('{{{a}}}', { a: '<b>' }), '<b>');
  assert.equal(renderTemplate('x{{missing}}y', {}), 'xy');
  assert.equal(renderTemplate('{{a}}', { a: 0 }), '0');
});

test('escapeHtml escapes the five HTML entities', () => {
  assert.equal(escapeHtml(`<>&"'`), '&lt;&gt;&amp;&quot;&#39;');
});

test('toAbsoluteUrl prefixes relative, leaves absolute', () => {
  assert.equal(toAbsoluteUrl('a/b.png', 'https://x.com'), 'https://x.com/a/b.png');
  assert.equal(toAbsoluteUrl('/a.png', 'https://x.com'), 'https://x.com/a.png');
  assert.equal(toAbsoluteUrl('https://y.com/z', 'https://x.com'), 'https://y.com/z');
  assert.equal(toAbsoluteUrl('', 'https://x.com'), '');
});

test('buildAttr / buildBooleanAttr', () => {
  assert.equal(buildAttr('rel', 'noopener'), ' rel="noopener"');
  assert.equal(buildAttr('rel', ''), '');
  assert.equal(buildAttr('rel', null), '');
  assert.equal(buildBooleanAttr('download', true), ' download');
  assert.equal(buildBooleanAttr('download', false), '');
});

test('assertRequired throws on empty, returns value otherwise', () => {
  assert.throws(() => assertRequired('', 'x'));
  assert.throws(() => assertRequired(undefined, 'x'));
  assert.equal(assertRequired('v', 'x'), 'v');
});

test('getValueByPath walks nested keys safely', () => {
  assert.equal(getValueByPath({ a: { b: 'c' } }, 'a.b'), 'c');
  assert.equal(getValueByPath({ a: {} }, 'a.b.c'), undefined);
});

test('buildScriptSrcValue: self + hashes + external sources, no unsafe-hashes without handlers', () => {
  const v = buildScriptSrcValue({ scriptHashes: ['sha256-abc'], handlerHashes: [] });
  assert.match(v, /^script-src 'self' 'sha256-abc'/);
  assert.match(v, /googletagmanager\.com/);
  assert.ok(!v.includes("'unsafe-hashes'"));
  assert.match(v, /;$/);
});

test('buildScriptSrcValue: adds unsafe-hashes when event-handler hashes exist', () => {
  const v = buildScriptSrcValue({ scriptHashes: [], handlerHashes: ['sha256-h'] });
  assert.match(v, /'unsafe-hashes'/);
});

test('renderSitemap lists home + all four active dossiers', () => {
  const xml = renderSitemap(ROOT);
  assert.ok(xml.includes('<loc>https://portfolio.ibaifernandez.com/</loc>'));
  for (const slug of ['scanner-21179.html', 'crm-aglaya.html', 'kanban-desk.html', 'aglaya-outreach.html']) {
    assert.ok(xml.includes(slug), `sitemap missing ${slug}`);
  }
  // privacy is noindex — must NOT be in the sitemap
  assert.ok(!xml.includes('privacy.html'), 'sitemap should exclude privacy.html');
});

test('renderLlmsTxt is coherent with the dossier set', () => {
  const txt = renderLlmsTxt(ROOT);
  assert.ok(txt.includes('crm-aglaya.html'));
  assert.ok(txt.includes('aglaya-outreach.html'));
});
