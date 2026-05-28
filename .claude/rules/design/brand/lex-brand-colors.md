---
paths:
  - ["**/*.tsx", "**/*.jsx", "**/*.ts", "**/*.js", "**/*.vue", "**/*.svelte", "**/*.html", "**/*.css", "**/*.scss", "**/*.sass", "**/*.less", "**/*.styl", "**/*.pcss", "**/*.md", "**/*.mdx"]
---

# Lexis: Approved Color Palette and WCAG Combinations

> **Prefix:** `lex-` | **Type:** Unbreakable Law | **Scope:** Guardia visual identity at any touchpoint

## Law

> **Every Guardia piece (interface, material, document, post, slide, email) MUST use exclusively the official palette — Bright Yellow #FFC30A, Warm Orange #E07400, Soft Pink #DB6286, Deep Violet #4F186D, Baltic Gray #3A3A44, Mono White #FDFDFD, and Mono Black #0E1016, with the 100/200/500/700/900 scales — and MUST meet WCAG 2.1 AA (4.5:1 normal text, 3:1 large text/UI). The combination Yellow 500 over White (1.61:1) is FORBIDDEN. Combinations in the 3:1–4.5:1 range are restricted to titles, buttons, and badges. Signal colors (Green #00BF63, Yellow #FFDE59, Red #FF3131, Blue #004AAD) are reserved for data viz and critical system states.**

## CTA hierarchy by theme (Notion-canonical)

Notion Brand ([Cores](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b), [Branding](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6)) is the source of truth for the primary/secondary CTA hierarchy. The local design-system tokens (`--primary`, `--secondary`, `--accent`, `--ring`) MUST mirror Notion per theme:

| Token | Light mode | Dark mode | Notion role |
|---|---|---|---|
| `--primary` (CTA principal: Confirmar, continuar, salvar, contratar) | **Deep Violet 500 `#4F186D`** (7.85:1 AAA over white) | **Warm Orange 500 `#E07400`** (5.68:1 AA over dark surfaces) | Authoritative action |
| `--secondary` (ação secundária) | **Warm Orange 500 `#E07400`** (3.36:1 AA-large over white; permitted band for buttons/UI) | Gray 700 surface (`#28282F`) — Violet 500 fails contrast on dark, replaced by Surface 2 | Supporting action |

This hierarchy is encoded in `ui_kit/styles/index.css` § "SEMANTIC TOKENS — LIGHT THEME" and § dark override at `:root[data-theme="dark"]`. Any divergence between local tokens and the Notion canonical pages MUST be resolved in favor of Notion ([Plan #21 DoD](https://github.com/guardiatechnology/design-system/issues/21): *"em divergência com `lex-brand-*` / `codex-brand-*` locais, Notion prevalece e o espelho local é atualizado antes da aprovação"*).

## Coverage

- **Applies to:** UI (platform, site, app), commercial and institutional materials, decks, documents, emails, social media posts, icons, and illustrations.
- **Bound agents:** designers, frontend, mobile, marketing, support, AI agents that generate visual pieces or interfaces.
- **Exceptions:** partner logos and third-party brands (presented in their original color). Specific cases require an ADR or recorded exception in Notion.

## Examples

### Correct

Black text over Yellow 500 (13.06:1, AAA); White over Gray 500 (11.24:1, AAA); Violet 500 button with White label (>7:1); Orange 500 badge with Violet 500 text reserved for buttons/titles (3.96:1, AA large); financial chart using Signal Green/Signal Red only on the data axis.

### Incorrect

White text over Yellow 500 (1.61:1, illegible); a "purple-ish" color invented to complement the brand; institutional green used as brand color in a hero; `#4F186D` used outside the tokenized palette (hardcoded next to non-approved colors).

## Automated Validation

- **Tooling:** Stylelint with palette plugin, axe-core and Lighthouse a11y in CI; automated visual review (warrior-hephaestus) flagging combinations below WCAG minimum; tokens centralized in `@guardia/design-system`.
- **Timing:** pre-commit, UI CI, design review for non-UI materials.
- **Metric:** 0 color values outside the palette on `main`; 100% of text/background combinations ≥ 4.5:1 (normal) and ≥ 3:1 (UI/large); 0 occurrences of the forbidden Yellow 500 + White combination.
