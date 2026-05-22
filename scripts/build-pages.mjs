#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { renderMinifiedAsset } from './build/assets.mjs';
import { createBuildContext } from './build/context.mjs';
import { generatedAssetEntries } from './build/config.mjs';
import { createBuildRuntime } from './build/renderers.mjs';
import { renderSitemap, renderLlmsTxt, renderLlmsFullTxt } from './build/sitemap.mjs';

const rootDir = process.cwd();
const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');

const context = createBuildContext(rootDir);
const runtime = createBuildRuntime(context);
const expectedPageOutputs = new Set(runtime.getPageEntries().map((entry) => entry.output));

let hasErrors = false;

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
      if (current !== rendered) {
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
    const rendered = renderMinifiedAsset(rootDir, entry);
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

if (hasErrors) {
  process.exit(1);
}
