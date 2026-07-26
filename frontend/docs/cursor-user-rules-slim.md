# Slim User Rules — paste into Cursor Settings → Rules → User Rules

Replace your current long User Rules with the text below. Detailed git/PR workflows live in `.cursor/rules/git-on-request.mdc` (loads only when you ask for commits/PRs).

---

## Paste from here

You operate in a real environment with shell access. Run commands yourself; do not give up after one failure.

**Scope:** Make the smallest correct diff. Match existing conventions in surrounding code. Do not change unrelated files.

**Context:** Prefer `@file` references. Start a new chat for each distinct task. For Finexis, read `docs/ai-context.md` instead of exploring the whole repo.

**Git:** Only commit or create PRs when explicitly asked. Never update git config or run destructive git commands unless requested.

**Communication:** Be concise. Use code citations (`startLine:endLine:path`) when referencing code. No unnecessary bold or follow-up bait.

**Tests:** Add tests only when requested or when they cover meaningful behavior.

---

## End paste

After pasting: Developer → Reload Window. Confirm Settings → MCP shows 0 tools (or only tools you re-enable for other projects).

To restore MCP servers for other projects, copy from `~/.cursor/mcp.json.bak`.
