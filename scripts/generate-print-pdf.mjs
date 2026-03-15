#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const rootDir = process.cwd();
const port = 4175;
const baseUrl = `http://127.0.0.1:${port}`;
const outputDir = path.resolve(rootDir, 'artifacts/print-pdf');
const targets = [
  { route: 'index.html', file: 'index.pdf' },
  { route: 'debtracker.html', file: 'debtracker.pdf' },
  { route: 'gymtracker.html', file: 'gymtracker.pdf' },
  { route: 'lfi.html', file: 'lfi.pdf' },
  { route: 'ruta-de-la-digitalizacion-y-2x2-mkt.html', file: 'ruta-de-la-digitalizacion-y-2x2-mkt.pdf' },
  { route: 'portfolio-ibaifernandez.html', file: 'portfolio-ibaifernandez.pdf' },
  { route: 'my-board.html', file: 'my-board.pdf' },
  { route: 'the-research-engine.html', file: 'the-research-engine.pdf' },
  { route: 'elm-st.html', file: 'elm-st.pdf' },
  { route: 'aglaya.html', file: 'aglaya.pdf' }
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until timeout.
    }
    await sleep(200);
  }

  throw new Error(`Static server did not become ready at ${url} within ${timeoutMs}ms`);
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const server = spawn(process.execPath, ['scripts/static-server.mjs', '--port', String(port)], {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  server.stdout.on('data', (chunk) => {
    process.stdout.write(String(chunk));
  });

  server.stderr.on('data', (chunk) => {
    process.stderr.write(String(chunk));
  });

  try {
    await waitForServer(`${baseUrl}/index.html`);

    const browser = await chromium.launch({ headless: true });
    try {
      for (const target of targets) {
        const page = await browser.newPage({
          viewport: { width: 1440, height: 2200 }
        });

        await page.goto(`${baseUrl}/${target.route}`, {
          waitUntil: 'networkidle',
          timeout: 60000
        });
        await page.emulateMedia({ media: 'print' });
        await page.pdf({
          path: path.resolve(outputDir, target.file),
          format: 'A4',
          printBackground: true,
          preferCSSPageSize: true,
          margin: {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm'
          }
        });
        await page.close();
        console.log(`[OK] Generated ${target.file}`);
      }
    } finally {
      await browser.close();
    }
  } finally {
    if (!server.killed) {
      server.kill('SIGTERM');
    }
  }
}

main().catch((error) => {
  console.error(`[FAIL] ${error.message}`);
  process.exit(1);
});
