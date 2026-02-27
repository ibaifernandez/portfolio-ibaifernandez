#!/usr/bin/env bash
set -euo pipefail

MODE="list"
QUIET=0

usage() {
  cat <<'EOF'
Usage:
  bash scripts/playwright-orphans.sh --list
  bash scripts/playwright-orphans.sh --kill

Options:
  --list   List Playwright orphan candidates (default).
  --kill   Kill Playwright orphan candidates (SIGTERM, then SIGKILL if needed).
  --quiet  Suppress non-error output.
  -h, --help
EOF
}

while (($#)); do
  case "$1" in
    --list)
      MODE="list"
      ;;
    --kill)
      MODE="kill"
      ;;
    --quiet)
      QUIET=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "[FAIL] Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

SELF_PID="$$"
PATTERN='playwright_chromiumdev_profile|ms-playwright|chrome-headless-shell|headless_shell|node_modules/\.bin/playwright|@playwright/test|playwright test|playwright-core'

if ! process_rows_output="$(
  ps -axo pid=,ppid=,etime=,command= 2>/dev/null | awk -v self_pid="$SELF_PID" -v pattern="$PATTERN" '
    BEGIN { IGNORECASE = 1 }
    {
      pid = $1
      ppid = $2
      etime = $3
      $1 = ""
      $2 = ""
      $3 = ""
      sub(/^ +/, "", $0)
      cmd = $0
      if (pid != self_pid && cmd ~ pattern) {
        printf "%s\t%s\t%s\t%s\n", pid, ppid, etime, cmd
      }
    }
  '
)"; then
  if ((QUIET == 0)); then
    echo "[WARN] Unable to inspect process table in this environment."
  fi
  exit 0
fi

PROCESS_ROWS=()
while IFS= read -r row; do
  if [[ -n "$row" ]]; then
    PROCESS_ROWS+=("$row")
  fi
done <<<"$process_rows_output"

if ((${#PROCESS_ROWS[@]} == 0)); then
  if ((QUIET == 0)); then
    echo "[OK] No Playwright orphan candidates found."
  fi
  exit 0
fi

if [[ "$MODE" == "list" ]]; then
  echo "PID PPID ELAPSED COMMAND"
  for row in "${PROCESS_ROWS[@]}"; do
    IFS=$'\t' read -r pid ppid etime cmd <<<"$row"
    printf "%s %s %s %s\n" "$pid" "$ppid" "$etime" "$cmd"
  done
  echo "[INFO] Candidates found: ${#PROCESS_ROWS[@]}"
  exit 0
fi

if ((QUIET == 0)); then
  echo "[INFO] Terminating ${#PROCESS_ROWS[@]} Playwright orphan candidate(s)..."
fi

declare -a pids=()
for row in "${PROCESS_ROWS[@]}"; do
  IFS=$'\t' read -r pid _ppid _etime _cmd <<<"$row"
  pids+=("$pid")
  kill "$pid" >/dev/null 2>&1 || true
done

sleep 0.4

declare -a stubborn_pids=()
for pid in "${pids[@]}"; do
  if kill -0 "$pid" >/dev/null 2>&1; then
    stubborn_pids+=("$pid")
  fi
done

if ((${#stubborn_pids[@]} > 0)); then
  if ((QUIET == 0)); then
    echo "[INFO] Escalating SIGKILL for ${#stubborn_pids[@]} process(es)..."
  fi
  for pid in "${stubborn_pids[@]}"; do
    kill -9 "$pid" >/dev/null 2>&1 || true
  done
fi

remaining=0
for pid in "${pids[@]}"; do
  if kill -0 "$pid" >/dev/null 2>&1; then
    remaining=$((remaining + 1))
  fi
done

if ((remaining > 0)); then
  echo "[WARN] Cleanup finished with ${remaining} process(es) still alive." >&2
  exit 1
fi

if ((QUIET == 0)); then
  echo "[OK] Playwright orphan cleanup completed."
fi
