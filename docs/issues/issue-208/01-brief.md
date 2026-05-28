# Brief: Plan #208 — Invert `--primary` / `--secondary` in Light Mode per Notion Brand

- **Issue:** [#208](https://github.com/guardiatechnology/design-system/issues/208) — Plan sub-issue
- **Parent:** [#207](https://github.com/guardiatechnology/design-system/issues/207) — Tech Task
- **Author:** @fernandoseguim
- **Assignee:** @fernandoseguim
- **Type:** Tech Task → Plan (atomic single-PR execution)
- **Labels:** `evolvability ♻️`, `status: development`
- **Origin:** Brand × implementation divergence confirmed during Plan #21 (Button v0.1.0 review), Notion MCP fetch on canonical Brand pages.

## Summary

Notion designates **Violeta 500 (`#4F186D`)** as the canonical **primary CTA in light mode** ("Confirmar, continuar, salvar, contratar"), with contrast 7.85:1 AAA over white. Laranja 500 (`#E07400`) is the **secondary** action. Current implementation has the hierarchy **inverted in light mode** at `ui_kit/styles/index.css:115-121`: `--primary` resolves to Laranja, `--secondary` resolves to Violeta. Dark mode at line 297 already matches Notion (orange preferred). This Plan inverts the token mapping in light mode only, syncs the local Brand mirror, and regenerates Storybook visual baselines.

## Notion Brand sources (canonical, do not re-fetch)

- [Cores](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b)
- [Tipografia](https://www.notion.so/34536f91ebd281b9b76ccc6159bfae69)
- [Branding](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6)

## Scope (single PR)

Token-level inversion + Brand mirror sync + visual baseline regeneration.

**Out of scope (Tech Task #207 explicit):** Plan #21 (Button DoD review), Plan #23 (ButtonGroup), Plan #27 (IconButton), any new component.

## Unknowns

None — all dependencies and references resolved during Plan #21 Brand audit.
