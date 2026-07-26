# Finexis AI Context (read once per session)

Compact map for agents. Do not re-glob the repo — use this + `@file` references.

## Run
1. Start backend: `cd backend && npm start` (Express on port 3000).
2. Open `http://localhost:3000/` — serves `frontend/` HTML + `/api` routes.

## Page → interaction map

| Page | Interaction module |
|------|-------------------|
| `case-manager.html` | `src/interactions/case-manager.js` |
| `case-dashboard.html` | `src/interactions/case-dashboard.js` |
| `transactions.html` | `src/interactions/transactions-list.js` |
| `transactions_new.html` | (inline / legacy; shares transactions patterns) |
| `archives.html` | `src/interactions/archives.js` |
| `notice-generator.html` | `src/interactions/notice-generator.js` (optional) |
| `spend-analysis.html` | inline scripts |
| `crypto.html` | inline scripts |
| `mule.html` | inline scripts |
| `fund-flow.html` | `src/interactions/fund-flow.js` |
| All workspace pages | `src/interactions/sidebar.js` (`initSidebar()`) |

## Shared shell contract
- Sidebar: `<aside id="app-sidebar" class="app-sidebar"></aside>`
- CSS: `styles/finexis-core.css`, `styles/tokens.css`
- Theme: `src/config/tailwind-theme.js`
- Layout: `.app-shell`, `.app-header`, `.app-content`
- API layer: `src/services/api.js`, `src/services/caseService.js`

## Backend
- `backend/server.js` — Express app, serves `frontend/` static + API
- `backend/db.js` — SQLite persistence
- `backend/python_scripts/` — PDF/CSV parsing (invoked by server)

## Out of scope (unless user asks)
- `backend/python_scripts/` — PDF/CSV parsing tooling
- `backend/external_csvs/` — entity classification data
- `backend/metadata/`, `backend/csv/` — bank profile snapshots
- `frontend/finexis_auth/` — separate auth marketing site
- `frontend/mule and fund flow rules/` — rule CSVs and reference images

## Styling rule
Edit CSS (`styles/finexis-core.css` or page `<style>`). Do **not** inject runtime JS helpers for shadows/depth — use `.card-elevated` and related classes.

## Tests
- Rule engine: `npm run test:rule-engine` (from repo root or `frontend/`)
