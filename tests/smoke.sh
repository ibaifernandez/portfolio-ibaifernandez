#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-4173}"
HOST="127.0.0.1"
BASE_URL="http://${HOST}:${PORT}"

if ! command -v php >/dev/null 2>&1; then
  echo "[SKIP] php command not found in environment; smoke test requires PHP built-in server"
  exit 0
fi

TMP_DIR="$(mktemp -d)"
SERVER_LOG="${TMP_DIR}/php-server.log"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

php -S "${HOST}:${PORT}" -t "$ROOT_DIR" >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!

for _ in {1..40}; do
  if curl -fsS "${BASE_URL}/index.html" >/dev/null 2>&1; then
    break
  fi
  sleep 0.1
done

HOME_HTML="$(curl -fsS "${BASE_URL}/index.html")"

echo "$HOME_HTML" | grep -Eq '<title>[^<]*Portfolio</title>' || {
  echo "[FAIL] Home title not found (expected <title>...Portfolio</title>)" >&2
  exit 1
}

echo "$HOME_HTML" | grep -q 'id="translate-button-icon"' || {
  echo "[FAIL] Translate button not found" >&2
  exit 1
}

echo "$HOME_HTML" | grep -q 'name="website"' || {
  echo "[FAIL] Honeypot field not found in contact form" >&2
  exit 1
}

echo "$HOME_HTML" | grep -q 'name="form_started_at"' || {
  echo "[FAIL] form_started_at field not found in contact form" >&2
  exit 1
}

AJAX_GET="$(curl -sS "${BASE_URL}/ajax.php")"
if [[ "$AJAX_GET" != "0" ]]; then
  echo "[FAIL] Expected ajax.php GET response to be 0, got: $AJAX_GET" >&2
  exit 1
fi

AJAX_INVALID="$(curl -sS -X POST "${BASE_URL}/ajax.php" \
  -d "form_type=contact&first_name=Test&email=invalid-email&subject=Hi&message=Hello")"
if [[ "$AJAX_INVALID" != "0" ]]; then
  echo "[FAIL] Expected invalid POST response to be 0, got: $AJAX_INVALID" >&2
  exit 1
fi

FUTURE_MS="$(( ($(date +%s) + 60) * 1000 ))"
AJAX_HONEYPOT="$(curl -sS -X POST "${BASE_URL}/ajax.php" \
  -d "form_type=contact&first_name=Test&last_name=User&email=test@example.com&subject=Hi&message=Hello&form_started_at=${FUTURE_MS}&website=spam.example")"
if [[ "$AJAX_HONEYPOT" != "0" ]]; then
  echo "[FAIL] Expected honeypot POST response to be 0, got: $AJAX_HONEYPOT" >&2
  exit 1
fi

AJAX_TOO_FAST="$(curl -sS -X POST "${BASE_URL}/ajax.php" \
  -d "form_type=contact&first_name=Test&last_name=User&email=test@example.com&subject=Hi&message=Hello&form_started_at=${FUTURE_MS}")"
if [[ "$AJAX_TOO_FAST" != "0" ]]; then
  echo "[FAIL] Expected too-fast POST response to be 0, got: $AJAX_TOO_FAST" >&2
  exit 1
fi

echo "[OK] smoke tests passed"
