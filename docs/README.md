# Guardia Design System — Docs (Astro)

Static documentation site for `@guardiatechnology/design-system`. Published to
GitHub Pages at `https://guardiatechnology.github.io/design-system/`.

## Structure

```
docs/
├── astro.config.mjs
├── package.json
├── public/
│   ├── favicon.svg
│   ├── logo.svg
│   ├── fonts/        ← self-hosted Poppins + Lastica
│   └── logo/         ← brand lockups
└── src/
    ├── components/   ← Astro layout components (Sidebar, Header, Footer)
    ├── data/         ← single source of truth for component list
    ├── layouts/      ← BaseLayout + DocsLayout
    ├── pages/
    │   ├── index.astro              (home)
    │   ├── getting-started.astro
    │   ├── changelog.astro
    │   ├── branding/index.astro
    │   ├── fundamentos/
    │   │   ├── cor.astro
    │   │   ├── tipografia.astro
    │   │   ├── espacamento.astro
    │   │   └── iconografia.astro
    │   └── componentes/
    │       ├── index.astro          (catalog)
    │       └── [slug].astro         (one page per component)
    └── styles/global.css
```

## Dev

```bash
cd docs
npm install
npm run dev       # http://localhost:4321
npm run build     # → dist/
npm run preview   # serve ./dist locally
```

## Component pages

The 45 component pages are **generated statically** from
`src/data/components.ts`. Adding a new component:

1. Add an entry in `components.ts`.
2. (Optional) Write rich MDX content later.
3. Run `npm run build` — a new `/componentes/<slug>` page appears.

## Deployment

The `.github/workflows/deploy-docs.yml` workflow builds both the Storybook and
this Astro site, combines them under `dist/`, and publishes to GitHub Pages.

Storybook lives at `/design-system/storybook/`, Astro at `/design-system/`.
