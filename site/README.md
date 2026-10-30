# Project site

Next.js (App Router, static export), published to GitHub Pages at
https://ngcodingtn-create.github.io/e-accesibility/

## Edit

- Text and numbers: `lib/content.ts` (axes, decisions, risks, sources, timeline).
- Axis-specific diagrams: `components/AxisDetail.tsx`.
- Pipeline map and loop: `components/Maps.tsx`.
- Look and feel: `app/globals.css` and `app/diagrams.css`.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3010
```

## Deploy

Every push to `main` that changes `site/` runs `.github/workflows/pages.yml`, which builds with `PAGES_BASE_PATH=/e-accesibility` and deploys `out/`. In the repository settings, Pages → Source must be set to **GitHub Actions**.
