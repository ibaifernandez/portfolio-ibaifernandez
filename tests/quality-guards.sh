#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

fail() {
  echo "[FAIL] $1" >&2
  exit 1
}

if rg -n "eval\\(" assets/js/custom.js >/dev/null; then
  fail "Found eval() usage in assets/js/custom.js"
fi

if rg -n 'href="javascript:;"|href=""' index.html blog.html >/dev/null; then
  fail "Found invalid placeholder href values"
fi

if rg -n 'https://https://' index.html >/dev/null; then
  fail "Found malformed URL with duplicated protocol"
fi

if [[ -f assets/images/banner-bg.gif ]]; then
  fail "Found deprecated unused asset assets/images/banner-bg.gif (31MB legacy background)"
fi

if [[ -f assets/js/bootstrap.min.js ]]; then
  fail "Found deprecated unused script assets/js/bootstrap.min.js (legacy dependency removed from runtime)"
fi

for header in \
  "X-Content-Type-Options" \
  "Referrer-Policy" \
  "X-Frame-Options" \
  "Content-Security-Policy-Report-Only"; do
  if ! rg -n "$header" .htaccess >/dev/null; then
    fail "Missing expected security header directive in .htaccess: $header"
  fi
done

if ! rg -n 'name="website"' index.html >/dev/null; then
  fail "Missing honeypot website field in contact form"
fi
if ! rg -n 'name="form_started_at"' index.html >/dev/null; then
  fail "Missing form_started_at field in contact form"
fi
if ! rg -n 'name="captcha_token"|name="captcha_provider"' index.html >/dev/null; then
  fail "Missing captcha hidden fields in contact form"
fi
if ! rg -n 'form_started_at|website|captcha_token|enforce_ip_rate_limit|verify_captcha_token' ajax.php >/dev/null; then
  fail "Missing anti-spam handling in ajax.php"
fi

if ! rg -n 'contact_submit_attempt|contact_submit_success|contact_submit_failure' assets/js/custom.js >/dev/null; then
  fail "Missing key GA4 contact form events in assets/js/custom.js"
fi

if rg -n '<a href="#" class="siderbar_menuicon">' index.html >/dev/null; then
  fail "Found placeholder sidebar navigation links in index.html"
fi

for anchor in about_sec training_sec project_sec contact_sec; do
  if ! rg -n "href=\"#${anchor}\" class=\"siderbar_menuicon\"" index.html >/dev/null; then
    fail "Missing expected sidebar anchor link in index.html: #${anchor}"
  fi
done

if ! rg -n '<a class="skip-link" href="#about_sec">' index.html >/dev/null; then
  fail "Missing keyboard skip-link for main content in index.html"
fi

if ! rg -n '<a class="skip-link" href="#blog_main">' blog.html >/dev/null; then
  fail "Missing keyboard skip-link for main content in blog.html"
fi

if rg -n '<a href="#" class="siderbar_icon"' blog.html >/dev/null; then
  fail "Found placeholder social links in blog.html"
fi

if ! rg -n 'id="contact-response"' index.html >/dev/null; then
  fail "Missing contact response status container id=contact-response"
fi

if ! rg -n 'id="contact-response"[^>]*aria-live="polite"' index.html >/dev/null; then
  fail "Contact response container is missing aria-live=polite"
fi

for script in \
  "assets/js/scrollbar.js" \
  "assets/js/isotope.pkgd.min.js" \
  "assets/js/jquery.magnific-popup.min.js" \
  "assets/js/swiper.min.js" \
  "assets/js/circle-progress.js" \
  "assets/js/jquery.zoom.js" \
  "assets/js/bootstrap.min.js" \
  "assets/js/cvtext1.js" \
  "assets/js/cvtext2.js"; do
  if rg -n "<script[^>]*src=[\"']${script}[\"']" index.html blog.html >/dev/null; then
    fail "Found static script include that should be lazy-loaded by custom.js: ${script}"
  fi
done

if ! rg -n 'prefers-reduced-motion' assets/css/style.css >/dev/null; then
  fail "Missing prefers-reduced-motion accessibility baseline in assets/css/style.css"
fi

if ! rg -n 'focus-visible' assets/css/style.css >/dev/null; then
  fail "Missing focus-visible accessibility baseline in assets/css/style.css"
fi

target_blank_total="$(rg -n 'target="_blank"' index.html blog.html | wc -l | tr -d ' ')"
target_blank_secure="$(rg -n 'target="_blank"[^>]*rel="noopener noreferrer"' index.html blog.html | wc -l | tr -d ' ')"
if [[ "$target_blank_total" != "$target_blank_secure" ]]; then
  fail "Some target=_blank links are missing rel=noopener noreferrer"
fi

if [[ ! -s README.md ]]; then
  fail "README.md is empty"
fi

if ! command -v node >/dev/null 2>&1; then
  fail "node command is required for performance budget checks"
fi

node scripts/build-pages.mjs --check
node tests/check-performance-budget.mjs
node tests/check-avif-coverage.mjs
node tests/check-webp-coverage.mjs
node tests/check-links.mjs

for file in index.html blog.html; do
  total_imgs="$(rg -n "<img " "$file" | wc -l | tr -d ' ')"
  with_loading="$(rg -n '<img [^>]*loading="' "$file" | wc -l | tr -d ' ')"
  with_width="$(rg -n '<img [^>]*width="' "$file" | wc -l | tr -d ' ')"
  with_height="$(rg -n '<img [^>]*height="' "$file" | wc -l | tr -d ' ')"

  if [[ "$total_imgs" != "$with_loading" ]]; then
    fail "$file has img tags without loading attribute"
  fi
  if [[ "$total_imgs" != "$with_width" ]]; then
    fail "$file has img tags without width attribute"
  fi
  if [[ "$total_imgs" != "$with_height" ]]; then
    fail "$file has img tags without height attribute"
  fi
done

echo "[OK] quality guards passed"
