#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { renderMinifiedAsset } from './build/assets.mjs';
import { createBuildContext } from './build/context.mjs';
import { generatedAssetEntries } from './build/config.mjs';
import { createBuildRuntime } from './build/renderers.mjs';
import { renderSitemap, renderLlmsTxt, renderLlmsFullTxt } from './build/sitemap.mjs';
import { fingerprintGeneratedHtml } from './build/fingerprint.mjs';
import { syncCspHashes } from './build/csp-hashes.mjs';

const rootDir = process.cwd();
const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');

const context = createBuildContext(rootDir);
const runtime = createBuildRuntime(context);
const expectedPageOutputs = new Set(runtime.getPageEntries().map((entry) => entry.output));

let hasErrors = false;

// In --check mode, the on-disk HTML has content-hash fingerprints (?v=abc123)
// applied by fingerprint.mjs at the end of every build. The freshly rendered
// template does NOT have them. Strip ?v=... from both sides before comparing.
function stripFingerprints(html) {
  return html.replace(/(\.(?:css|js))\?v=[a-f0-9]+/g, '$1');
}

for (const entry of runtime.getPageEntries()) {
  const templatePath = path.resolve(rootDir, entry.template);
  if (!fs.existsSync(templatePath)) {
    continue;
  }

  try {
    const rendered = context.renderWithIncludes(entry.template, {
      data: entry.data || {},
      renderDirective: runtime.renderDirective
    });
    const outputPath = path.resolve(rootDir, entry.output);

    if (checkOnly) {
      const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';
      if (stripFingerprints(current) !== stripFingerprints(rendered)) {
        hasErrors = true;
        console.error(`[FAIL] Outdated generated page: ${entry.output} (run: npm run build:pages)`);
      } else {
        console.log(`[OK] ${entry.output} is in sync with templates`);
      }
      continue;
    }

    fs.writeFileSync(outputPath, rendered);
    console.log(`[OK] Built ${entry.output} from ${entry.template}`);
  } catch (error) {
    hasErrors = true;
    console.error(`[FAIL] ${entry.output}: ${error.message}`);
  }
}

for (const output of runtime.getManagedProjectOutputs()) {
  if (expectedPageOutputs.has(output)) {
    continue;
  }

  const outputPath = path.resolve(rootDir, output);
  if (!fs.existsSync(outputPath)) {
    continue;
  }

  if (checkOnly) {
    hasErrors = true;
    console.error(`[FAIL] Retired generated page still present at repo root: ${output} (run: npm run build:pages)`);
    continue;
  }

  fs.unlinkSync(outputPath);
  console.log(`[OK] Removed retired generated page ${output}`);
}

for (const entry of generatedAssetEntries) {
  try {
    const rendered = await renderMinifiedAsset(rootDir, entry);
    const outputPath = path.resolve(rootDir, entry.output);

    if (checkOnly) {
      const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';
      if (current !== rendered) {
        hasErrors = true;
        console.error(`[FAIL] Outdated generated asset: ${entry.output} (run: npm run build:pages)`);
      } else {
        console.log(`[OK] ${entry.output} is in sync with source`);
      }
      continue;
    }

    fs.writeFileSync(outputPath, rendered);
    console.log(`[OK] Built ${entry.output} from ${entry.source}`);
  } catch (error) {
    hasErrors = true;
    console.error(`[FAIL] ${entry.output}: ${error.message}`);
  }
}

// Discovery surface: sitemap.xml, llms.txt, llms-full.txt
// Single source of truth = content/projects.json (active dossiers) + scripts/build/sitemap.mjs
const discoveryEntries = [
  { output: 'sitemap.xml',   render: () => renderSitemap(rootDir) },
  { output: 'llms.txt',      render: () => renderLlmsTxt(rootDir) },
  { output: 'llms-full.txt', render: () => renderLlmsFullTxt(rootDir) }
];

for (const entry of discoveryEntries) {
  try {
    const rendered = entry.render();
    const outputPath = path.resolve(rootDir, entry.output);

    if (checkOnly) {
      const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';
      if (current !== rendered) {
        hasErrors = true;
        console.error(`[FAIL] Outdated discovery file: ${entry.output} (run: npm run build:pages)`);
      } else {
        console.log(`[OK] ${entry.output} is in sync with content/projects.json`);
      }
      continue;
    }

    fs.writeFileSync(outputPath, rendered);
    console.log(`[OK] Built ${entry.output} from content/projects.json`);
  } catch (error) {
    hasErrors = true;
    console.error(`[FAIL] ${entry.output}: ${error.message}`);
  }
}

// Fingerprint asset references inside generated HTML files. Replaces the manual
// ?v=20260522 cache-bust with content-hash. Auto-invalidates on any CSS/JS change.
if (!checkOnly && !hasErrors) {
  const htmlOutputs = [...runtime.getPageEntries(), ...runtime.getManagedProjectOutputs().map((o) => ({ output: o }))]
    .map((entry) => entry.output);
  const hashes = fingerprintGeneratedHtml(rootDir, htmlOutputs);
  console.log(`[OK] Fingerprinted ${Object.keys(hashes).length} asset references in ${htmlOutputs.length} HTML files`);

  // CSP hashes: keep netlify.toml script-src in sync with inline scripts.
  try {
    const csp = syncCspHashes(rootDir);
    const summary = `${csp.scriptHashes.length} script hash(es), ${csp.handlerHashes.length} handler hash(es)`;
    console.log(csp.updated
      ? `[OK] netlify.toml CSP script-src updated: ${summary}`
      : `[OK] CSP script-src in sync (${summary})`);
  } catch (err) {
    hasErrors = true;
    console.error(`[FAIL] CSP hash sync: ${err.message}`);
  }
}

if (hasErrors) {
  process.exit(1);
}
