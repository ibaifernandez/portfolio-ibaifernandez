# docs/

Navigation map for what lives here. Last cleanup: 2026-05-22.

This folder is lean by design. Anything not in active service got deleted.
Git log is the historical record.

---

## Read this first

| File | What it is | Who reads it |
|---|---|---|
| `ROADMAP.md` | Current state, what's done, what's next. The owner's window into the project. | Ibai + AI agents |
| `brand-audit-narrative-b.md` | Active brand reference (Narrative B: "AI Product Engineer · Founder-Operator"). Any narrative change updates this first. | AI agents writing copy |

## Reference (for AI agents doing work)

| File | What it is |
|---|---|
| `ARCHITECTURE.md` | System architecture: build pipeline, deploy flow, template/content directives. |
| `SECURITY.md` | Security posture: CSP, headers, contact form defense, secret management. |
| `AI_RULES.md` | Rules for AI agents working in this repo. Extends root `AGENTS.md`. |

## Audit archive

| Path | What it is |
|---|---|
| `audits/marianas/` | Deep audit from 2026-05-22 across 8 dimensions + execution log. 16 files. Source of the current improvement work. |

---

## Rules

1. If a doc here is no longer accurate after a code change, fix it in the same commit.
2. Anything older than the active narrative without ongoing relevance: delete. Don't archive. Git remembers.
3. The root-level `README.md` and `AGENTS.md` are kept at the repo root for tooling discovery. Treat them as authoritative.
