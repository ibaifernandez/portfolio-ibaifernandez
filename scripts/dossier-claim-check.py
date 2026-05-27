#!/usr/bin/env python3
"""Dossier claim allowlist check.

Scans modified dossier files (HTML / Markdown) for factual claims that match
high-signal patterns (percentages, counts, named code symbols, named
postmortems) and verifies each match against an allowlist of approved claims.

Allowlist file: `.dossier-approved-claims.yml` (or `.json`) in repo root.
Format:
    approved:
      - pattern: "12 controles versionados"        # literal substring OR regex (auto-detected)
        source: "legal-reg-tech: backend/app/rules/matrix_v1.json"
        notes: "12 items list, verified 2026-05-27"
      - pattern: "~760 tests"
        source: "legal-reg-tech: pyproject.toml [tool.pytest.ini_options]"
      - pattern: "TTL de 90 días"
        source: "legal-reg-tech: backend/app/services/consensus_jobs.py:138"
      ...

Patterns starting with `re:` are treated as regex (without the prefix). Otherwise
they are case-sensitive literal substring matches.

Exit codes:
    0 — all flagged claims appear in the allowlist (OR no dossier files changed)
    1 — at least one flagged claim is not in the allowlist (BLOCK COMMIT)
    2 — invalid allowlist file format / config error

Bypass:
    DOSSIER_CHECK_SKIP=1 to skip entirely (e.g. during emergency hotfix)
    DOSSIER_CHECK_WARN_ONLY=1 to print warnings without blocking
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parent.parent
ALLOWLIST_PATHS = [
    ROOT / ".dossier-approved-claims.yml",
    ROOT / ".dossier-approved-claims.yaml",
    ROOT / ".dossier-approved-claims.json",
]

# Glob/path patterns considered "dossiers" for this repo.
DOSSIER_PATH_PATTERNS = [
    re.compile(r"^[^/]+-\d+\.html$"),  # root dossier HTMLs like scanner-21179.html
    re.compile(r"^content/.*\.md$"),
    re.compile(r"^src/pages/dossier-.*\.template\.html$"),
]

# Patterns considered factual claims worth verifying.
CLAIM_PATTERNS = [
    # Percentages and percent ranges (numeric)
    re.compile(r"\b\d{1,3}\s*%"),
    re.compile(r"\b\d{1,3}\s*%\s*→\s*\d{1,3}\s*%"),
    re.compile(r"\b\d{1,3}\s*%\s*/\s*\d{1,3}\s*%"),
    # Counts with units (tests, dominios, hallazgos, audits, etc.)
    re.compile(r"\b(?:~|cerca de\s+|alrededor de\s+)?\d{2,5}\s+(?:tests?|dominios|audits?|hallazgos?|controles?|workers?|escaneos?|p[aá]ginas?|postmortems?)", re.IGNORECASE),
    # Time-to-X claims
    re.compile(r"<\s*\d+\s*min(?:utos?)?\b", re.IGNORECASE),
    re.compile(r"\b\d+\s*min(?:utos?)?\s*(?:o\s*menos|m[aá]ximo|de\s+entrega)", re.IGNORECASE),
    # Named code references (function/file/symbol-like)
    re.compile(r"\b[a-z_][a-z0-9_]+\.(?:py|json|toml|yml|yaml|mjs|js|ts|sh)\b"),
    re.compile(r"\b[a-z_][a-z0-9_]+\(\)"),
    re.compile(r"\bclaim_webhook_event\b|\bsave_initial_record\b|\bvalidate_and_use\b|\b_warn_if_sqlite_with_multi_worker\b|\bRedisRateLimiter\b|\bInMemoryRateLimiter\b"),
    # Named postmortems / cases
    re.compile(r"\b(?:2hermanos|latinbugs|bakdesign|magliona|bigbuda|muller-perez)(?:\.[a-z]{2,4})?\b", re.IGNORECASE),
    # Schema versions
    re.compile(r"\bv\d+\.\d+(?:\.\d+)?\b"),
    re.compile(r"\bscan_v1\b|\breport_v1\b|\bmatrix_v1\b"),
    # Positioning scores
    re.compile(r"\b\d+[.,]\d+\s*/\s*10\b"),
]


def load_allowlist() -> dict | None:
    for p in ALLOWLIST_PATHS:
        if p.exists():
            return load_allowlist_file(p)
    return None


def load_allowlist_file(path: Path) -> dict:
    raw = path.read_text(encoding="utf-8")
    if path.suffix == ".json":
        return json.loads(raw)
    # naive YAML loader (avoid PyYAML dep): supports the simple `approved:` list-of-mappings format
    return parse_simple_yaml(raw)


def parse_simple_yaml(text: str) -> dict:
    """Tiny YAML subset parser for the allowlist file.

    Expected shape:
        approved:
          - pattern: "..."
            source: "..."
            notes: "..."          # optional
    """
    approved: list[dict] = []
    current: dict | None = None
    in_approved = False
    for raw_line in text.splitlines():
        line = raw_line.rstrip()
        stripped = line.lstrip()
        if not stripped or stripped.startswith("#"):
            continue
        if line.startswith("approved:"):
            in_approved = True
            continue
        if not in_approved:
            continue
        if stripped.startswith("- "):
            if current is not None:
                approved.append(current)
            current = {}
            rest = stripped[2:].strip()
            if rest and ":" in rest:
                k, _, v = rest.partition(":")
                current[k.strip()] = _strip_quotes(v.strip())
            continue
        if current is None:
            continue
        if ":" in stripped:
            k, _, v = stripped.partition(":")
            current[k.strip()] = _strip_quotes(v.strip())
    if current is not None:
        approved.append(current)
    return {"approved": approved}


def _strip_quotes(s: str) -> str:
    if len(s) >= 2 and s[0] == s[-1] and s[0] in {'"', "'"}:
        return s[1:-1]
    return s


def staged_dossier_files() -> list[Path]:
    """List staged files (against HEAD) that match dossier patterns."""
    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only", "--diff-filter=ACMR"],
            check=True,
            capture_output=True,
            text=True,
            cwd=ROOT,
        )
    except subprocess.CalledProcessError as e:
        print(f"[dossier-check] git diff failed: {e}", file=sys.stderr)
        return []
    files = [Path(p) for p in result.stdout.splitlines() if p.strip()]
    return [p for p in files if any(pat.match(p.as_posix()) for pat in DOSSIER_PATH_PATTERNS)]


def extract_claims(text: str) -> list[tuple[str, str]]:
    """Return a list of (pattern_label, matched_substring) for each claim found.

    Deduplicated by matched_substring (case-sensitive).
    """
    seen: set[str] = set()
    out: list[tuple[str, str]] = []
    for pat in CLAIM_PATTERNS:
        for m in pat.finditer(text):
            match = m.group(0)
            if match in seen:
                continue
            seen.add(match)
            out.append((pat.pattern[:60], match))
    return out


def claim_is_allowed(match: str, allowlist: list[dict]) -> dict | None:
    """Return the matching allowlist entry if the claim is approved, else None."""
    for entry in allowlist:
        pat = entry.get("pattern", "")
        if not pat:
            continue
        if pat.startswith("re:"):
            try:
                if re.search(pat[3:], match):
                    return entry
            except re.error:
                continue
        else:
            if pat in match or match in pat:
                return entry
    return None


def main() -> int:
    if os.environ.get("DOSSIER_CHECK_SKIP") == "1":
        print("[dossier-check] skipped (DOSSIER_CHECK_SKIP=1)", file=sys.stderr)
        return 0

    warn_only = os.environ.get("DOSSIER_CHECK_WARN_ONLY") == "1"

    dossiers = staged_dossier_files()
    if not dossiers:
        return 0  # nothing dossier-shaped in this commit

    allowlist_data = load_allowlist()
    if allowlist_data is None:
        print(
            "[dossier-check] WARNING: no allowlist found at any of:\n"
            + "\n".join(f"  {p}" for p in ALLOWLIST_PATHS)
            + "\n"
            "Create one with at least one `approved:` entry, or set DOSSIER_CHECK_SKIP=1 to bypass.",
            file=sys.stderr,
        )
        return 0 if warn_only else 2

    allowlist = allowlist_data.get("approved", [])
    if not isinstance(allowlist, list):
        print("[dossier-check] ERROR: allowlist 'approved' key must be a list", file=sys.stderr)
        return 2

    total_unknown = 0
    for dossier in dossiers:
        abs_path = ROOT / dossier
        if not abs_path.exists():
            continue
        text = abs_path.read_text(encoding="utf-8", errors="replace")
        claims = extract_claims(text)
        unknown: list[str] = []
        for _label, match in claims:
            if claim_is_allowed(match, allowlist) is None:
                unknown.append(match)
        if unknown:
            total_unknown += len(unknown)
            print(f"\n[dossier-check] {dossier}: {len(unknown)} unrecognized factual claim(s):", file=sys.stderr)
            for u in unknown:
                print(f"  ✗ {u!r}", file=sys.stderr)

    if total_unknown == 0:
        print(f"[dossier-check] OK — {len(dossiers)} dossier file(s) checked, all claims allowlisted.")
        return 0

    print(
        f"\n[dossier-check] FAIL: {total_unknown} unrecognized claim(s) across {len(dossiers)} dossier file(s).\n"
        "Each unrecognized claim must either:\n"
        "  1. Be added to .dossier-approved-claims.yml with a source citation, OR\n"
        "  2. Be removed from the dossier.\n"
        "\n"
        "Recommended workflow:\n"
        "  • Run `/dossier-fact-check <dossier> --against legal-reg-tech` in a Claude session\n"
        "    to get the table of EVIDENCIA / PARCIAL / FALSO with citations.\n"
        "  • Apply fixes, then add the now-defensible claims to .dossier-approved-claims.yml.\n"
        "\n"
        "Bypass for emergency hotfix only:\n"
        "  • DOSSIER_CHECK_SKIP=1 git commit ...\n"
        "  • DOSSIER_CHECK_WARN_ONLY=1 git commit ... (warn, don't block)\n",
        file=sys.stderr,
    )
    return 0 if warn_only else 1


if __name__ == "__main__":
    sys.exit(main())
