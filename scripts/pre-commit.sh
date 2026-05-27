#!/usr/bin/env bash
# Pre-commit gate: build is in sync + quality guards green.
# Install:
#   ln -sf ../../scripts/pre-commit.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

echo "[pre-commit] build:pages --check..."
if ! node scripts/build-pages.mjs --check >/dev/null 2>&1; then
  echo "[pre-commit] FAIL: generated artifacts out of sync. Run: npm run build:pages" >&2
  exit 1
fi

echo "[pre-commit] i18n parity..."
if ! node tests/check-i18n.mjs >/dev/null 2>&1; then
  echo "[pre-commit] FAIL: i18n drift. Run: npm run test:i18n" >&2
  exit 1
fi

echo "[pre-commit] dossier claim allowlist..."
if ! python3 scripts/dossier-claim-check.py; then
  echo "[pre-commit] FAIL: dossier claim(s) not in allowlist. See above." >&2
  echo "[pre-commit]   Bypass (emergency only): DOSSIER_CHECK_SKIP=1 git commit ..." >&2
  exit 1
fi

echo "[pre-commit] OK"
