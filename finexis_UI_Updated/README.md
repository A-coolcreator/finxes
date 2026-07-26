# FinExis — Marketing Site

Investigation operating system for financial crime. Single-page marketing site built with
React, TypeScript, Vite, and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

## Deploy to Netlify

This is a static Vite build, so it deploys the same way as the SkipTracer site:

1. Push this folder to a GitHub repo (or drag-and-drop the `dist/` folder into Netlify).
2. In Netlify: **Build command** `npm run build`, **Publish directory** `dist`.
3. Add a `_redirects` file in `public/` with `/* /index.html 200` if you add client-side routing later (not needed yet — this is a single page).

## Structure

- `src/components/` — one file per section, in the order they appear on the page (`Hero`, `TrustBar`, `ProblemSection`, `ModulesGrid`, `WorkflowPipeline`, `ModuleDetail`, `UseCases`, `IntelligenceGraph`, `SecuritySection`, `MetricsSection`, `CaseStudy`, `Deployment`, `DemoForm`, `Footer`).
- `FlowChain.tsx` — the reusable fund-flow visual used in the hero (signature element). Pass it a different `nodes` array to reuse it elsewhere.
- `IntelligenceGraph.tsx` — the network graph in the "Intelligence Graph" section. Node positions and edges are hardcoded for a deliberate layout; adjust the `nodes` / `ambientEdges` / `highlightPath` arrays to change it.

## Design tokens

Colors, fonts, and spacing live in `tailwind.config.js`:

- **Forensic green** (`forensic-500` `#0E6E5E`) — primary brand color, CTAs, traced paths.
- **Amber** (`amber-500` `#D97706`) — watch/flagged risk state.
- **Flag red** (`flag-500` `#C0392B`) — high-risk / terminal nodes.
- **Display font**: Fraunces (headlines only). **Body**: Inter. **Mono**: JetBrains Mono (used for transaction IDs, feature tags, evidence-style data).

## Not yet wired up

- **Demo request form** (`DemoForm.tsx`) currently only shows a local "submitted" state — it does not send data anywhere. Wire it to your CRM, a serverless function, or an SMTP relay (same pattern as the SkipTracer contact form) before launch.
- No analytics, sitemap, or SEO meta beyond the basic `<title>` / description tags in `index.html`. Add these the same way they were set up for skiptracer.in if you want this indexed.
