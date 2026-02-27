#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLEANUP_SCRIPT="${ROOT_DIR}/scripts/playwright-orphans.sh"

cleanup_playwright_orphans() {
  bash "$CLEANUP_SCRIPT" --kill --quiet || true
}

cleanup_playwright_orphans
trap cleanup_playwright_orphans EXIT

cd "$ROOT_DIR"
npx playwright test "$@"
