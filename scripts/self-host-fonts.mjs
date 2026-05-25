#!/usr/bin/env node
// Self-host Google Fonts: parse CSS2 output, keep latin + latin-ext subsets,
// download woff2 files, rewrite @font-face URLs to local paths.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { request } from 'node:https';

const ROOT = '/Users/AGLAYA/Local Sites/26-04-portfolio-if';
const FONTS_OUT = join(ROOT, 'assets/fonts');
const CSS_OUT = join(ROOT, 'assets/css/font.css');

// Latin: U+0000-00FF base ASCII + Latin-1
// Latin-Ext: U+0100-02BA base extended Latin (covers Spanish ñ, Portuguese ã, etc.)
// Keep blocks whose unicode-range contains EITHER of these markers.
const KEEP_RANGES = ['U+0000-00FF', 'U+0100-02BA'];

const families = [
	{ slug: 'roboto', cssPath: '/tmp/roboto.css', subdir: 'roboto', familyName: 'Roboto' },
	{ slug: 'inter', cssPath: '/tmp/inter.css', subdir: 'inter', familyName: 'Inter' },
	{ slug: 'josefin', cssPath: '/tmp/josefin.css', subdir: 'josefin-sans', familyName: 'Josefin Sans' },
	{ slug: 'roboto-mono', cssPath: '/tmp/roboto-mono.css', subdir: 'roboto-mono', familyName: 'Roboto Mono' }
];

function parseFaceBlocks(css) {
	// Match @font-face { ... } blocks
	const blocks = [];
	const re = /@font-face\s*\{[^}]*\}/g;
	let m;
	while ((m = re.exec(css)) !== null) blocks.push(m[0]);
	return blocks;
}

function blockKeepers(block) {
	return KEEP_RANGES.some((r) => block.includes(r));
}

function urlOf(block) {
	const m = block.match(/url\((https:[^)]+\.woff2)\)/);
	return m ? m[1] : null;
}

function weightOf(block) {
	const m = block.match(/font-weight:\s*(\d+)/);
	return m ? m[1] : '400';
}

function styleOf(block) {
	return /font-style:\s*italic/.test(block) ? 'italic' : 'normal';
}

function subsetLabel(block) {
	if (block.includes('U+0000-00FF')) return 'latin';
	if (block.includes('U+0100-02BA')) return 'latin-ext';
	return 'unknown';
}

function download(url, outPath) {
	return new Promise((resolve, reject) => {
		const req = request(url, (res) => {
			if (res.statusCode !== 200) {
				reject(new Error(`${url} → HTTP ${res.statusCode}`));
				return;
			}
			const chunks = [];
			res.on('data', (c) => chunks.push(c));
			res.on('end', () => {
				writeFileSync(outPath, Buffer.concat(chunks));
				resolve(outPath);
			});
		});
		req.on('error', reject);
		req.end();
	});
}

async function processFamily(fam) {
	const css = readFileSync(fam.cssPath, 'utf8');
	const blocks = parseFaceBlocks(css);
	const kept = blocks.filter(blockKeepers);
	console.log(`${fam.familyName}: ${blocks.length} blocks total → ${kept.length} latin/latin-ext kept`);

	const subdir = join(FONTS_OUT, fam.subdir);
	mkdirSync(subdir, { recursive: true });

	const outBlocks = [];
	for (const block of kept) {
		const url = urlOf(block);
		if (!url) continue;
		const weight = weightOf(block);
		const style = styleOf(block);
		const subset = subsetLabel(block);
		const filename = `${fam.slug}-${weight}${style === 'italic' ? '-italic' : ''}-${subset}.woff2`;
		const outPath = join(subdir, filename);
		await download(url, outPath);
		const localUrl = `../fonts/${fam.subdir}/${filename}`;
		const rewritten = block.replace(/url\(https:[^)]+\.woff2\)/, `url(${localUrl})`);
		// Add font-display: swap if not present
		const withDisplay = /font-display:/.test(rewritten)
			? rewritten
			: rewritten.replace(/font-style:\s*\w+;/, (m) => `${m}\n  font-display: swap;`);
		outBlocks.push(withDisplay);
		console.log(`  ↓ ${filename}`);
	}
	return { fam, blocks: outBlocks };
}

async function main() {
	const results = [];
	for (const fam of families) results.push(await processFamily(fam));

	const header = `/* Self-hosted webfonts — GDPR-compliant, no third-party requests.
   Subsets: latin + latin-ext only (covers EN/ES/PT-BR/FR/IT/DE).
   Original Google Fonts CSS2 endpoints fetched ${new Date().toISOString().split('T')[0]}.
   To regenerate: scripts/self-host-fonts.mjs (see commit history).
*/\n\n`;
	const body = results.map((r) => `/* ===== ${r.fam.familyName} ===== */\n${r.blocks.join('\n')}`).join('\n\n');
	writeFileSync(CSS_OUT, header + body + '\n');
	console.log(`\nWrote ${CSS_OUT}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
