---
inclusion: always
---

# Token Efficiency

## Scope
- If user `@`-mentions a file, read only that file (+ at most 1 import dependency).
- Do not modify files outside the stated scope unless the user asks.

## Exploration (strict)
- **No Task/explore subagents** unless the user explicitly requests a codebase-wide audit.
- Search order: narrow `Grep` (pattern + glob) → targeted `Read` with `offset`/`limit` → semantic index.
- Never read all HTML pages or glob the whole repo for a single-file task.
- Do not read files >400 lines whole unless you are editing them.

## Architecture
- Read `frontend/docs/ai-context.md` once at session start instead of re-discovering layout.
- Out of scope unless asked: `backend/python_scripts/`, `backend/external_csvs/`, `frontend/finexis_auth/`.

## Output
- Minimal prose. No restating existing code. Show only necessary diffs.
- For styling: edit CSS in `styles/` or page `<style>` — do not inject runtime JS shadow helpers.

## Sessions
- Treat each distinct task as scoped work; avoid broad re-reads when prior context already covers the file.
