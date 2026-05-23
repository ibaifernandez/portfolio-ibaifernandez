// CSP enforcement smoke: load every served page, listen for `Content Security
// Policy` violation reports raised on the console, and fail the test on any.
//
// Catches three classes of regression at once:
//   - new inline <script> introduced without rebuilding (csp-hashes.mjs --check
//     should also catch this at quality-guards time, but the runtime gate is
//     belt-and-suspenders).
//   - inline event handler reintroduced (CSP has no 'unsafe-hashes').
//   - external script/style added without the corresponding `script-src` /
//     `style-src` allowlist entry.

const { test, expect } = require('@playwright/test');

const PAGES = [
	'/index.html',
	'/privacy.html',
	'/lfi.html',
	'/lfi-legacy.html',
	'/aglaya.html',
	'/elm-st.html',
	'/ruta-de-la-digitalizacion-y-2x2-mkt.html'
];

for (const url of PAGES) {
	test(`CSP enforcement: ${url} loads without CSP violations`, async ({ page }) => {
		const violations = [];
		page.on('console', (msg) => {
			const text = msg.text();
			if (/Content Security Policy/i.test(text) || /Refused to (execute|apply|load)/i.test(text)) {
				violations.push(text);
			}
		});
		page.on('pageerror', (err) => {
			if (/Content Security Policy/i.test(err.message)) {
				violations.push(err.message);
			}
		});

		await page.goto(url);
		await page.waitForLoadState('networkidle');

		expect(violations, violations.join('\n')).toEqual([]);
	});
}
