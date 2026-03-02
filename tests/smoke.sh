#!/usr/bin/env bash
# smoke.sh — tests de humo sobre el HTML servido estáticamente.
#
# Qué se eliminó respecto a la versión PHP:
#   Los checks de ajax.php (GET → 0, POST inválido → 0, honeypot → 0, too-fast → 0)
#   han sido retirados porque ajax.php fue reemplazado por la Netlify Function
#   netlify/functions/contact.js, que no es testeable con un servidor PHP local.
#   La cobertura equivalente vive en los tests E2E de Playwright (contact.spec.js).
#
# Qué se mantiene:
#   Verificación de estructura HTML de index.html servido desde el servidor Node local.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-4173}"
HOST="127.0.0.1"
BASE_URL="http://${HOST}:${PORT}"

if ! command -v node >/dev/null 2>&1; then
  echo "[SKIP] node command not found; smoke test requires Node.js static server"
  exit 0
fi

TMP_DIR="$(mktemp -d)"
SERVER_LOG="${TMP_DIR}/server.log"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

node "$ROOT_DIR/scripts/static-server.mjs" --port "$PORT" >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!

for _ in {1..40}; do
  if curl -fsS "${BASE_URL}/index.html" >/dev/null 2>&1; then
    break
  fi
  sleep 0.1
done

HOME_HTML="$(curl -fsS "${BASE_URL}/index.html")"
HOME_HTML_FILE="${TMP_DIR}/home.html"
printf '%s' "$HOME_HTML" > "$HOME_HTML_FILE"

HOME_TITLE="$(tr -d '\r' < "$HOME_HTML_FILE" | grep -Eio '<title[^>]*>[^<]+</title>' | head -n 1 || true)"
[[ -n "$HOME_TITLE" ]] || {
  echo "[FAIL] Home title not found (expected non-empty <title>)" >&2
  exit 1
}

grep -Eqi 'id=[\"\x27]translate-button-icon[\"\x27]' "$HOME_HTML_FILE" || {
  echo "[FAIL] Translate button not found" >&2
  exit 1
}

grep -Eqi "name=[\"']website[\"']" "$HOME_HTML_FILE" || {
  echo "[FAIL] Honeypot field not found in contact form" >&2
  exit 1
}

grep -Eqi "name=[\"']form_started_at[\"']" "$HOME_HTML_FILE" || {
  echo "[FAIL] form_started_at field not found in contact form" >&2
  exit 1
}

grep -Eqi "name=[\"']captcha_provider[\"']" "$HOME_HTML_FILE" || {
  echo "[FAIL] captcha_provider field not found in contact form" >&2
  exit 1
}

grep -Eqi "name=[\"']captcha_token[\"']" "$HOME_HTML_FILE" || {
  echo "[FAIL] captcha_token field not found in contact form" >&2
  exit 1
}

echo "[OK] smoke tests passed"
