# FinExis

Monorepo with separate **UI** and **backend** folders.

## Project layout

```text
finexis_frontend/
├─ finexis_ui_updated/   # React + Vite investigator UI (served by backend)
│  ├─ src/
│  └─ dist/              # production build (created by npm run build)
├─ frontend/             # legacy HTML app (not served by backend anymore)
└─ backend/
   ├─ server.js          # Express API + serves finexis_ui_updated/dist
   ├─ db.js
   ├─ python_scripts/
   └─ ...
```

## Run (production-style, one server)

```bash
cd finexis_ui_updated && npm install && npm run build
cd ../backend && npm start
```

Open `http://localhost:3000/` — React UI + `/api` on the same origin.

## Run (UI dev with hot reload)

Terminal 1 — backend API:

```bash
cd backend && npm start
```

Terminal 2 — Vite dev server (proxies `/api` → `:3000`):

```bash
cd finexis_ui_updated && npm run dev
```

Open `http://localhost:5173/`.

## Tests

```bash
npm run test:rule-engine   # legacy rule engine tests in frontend/
```

## AI context

See `frontend/docs/ai-context.md` (legacy HTML map). New UI lives in `finexis_ui_updated/src/`.
