# Issue #64 — Requirements

## Definition of Done (DoD)

All acceptance criteria below MUST be covered by at least one automated test (per `lex-issue-driven` Rule 3 — bidirectional AC ↔ test traceability). Each test references the AC via `AC-{N}` in its `it(...)` description.

## Acceptance Criteria

### API surface

- **AC-1.** `EmptyState` is exported from `@guardiatechnology/design-system` as the canonical root, with five compound subcomponents accessible via `EmptyState.Icon`, `EmptyState.Illustration`, `EmptyState.Title`, `EmptyState.Description`, `EmptyState.Actions`, mirroring the Card precedent.
- **AC-2.** Each subcomponent is additionally exported as a flat named symbol (`EmptyStateIcon`, `EmptyStateIllustration`, `EmptyStateTitle`, `EmptyStateDescription`, `EmptyStateActions`) so consumers may import either via the compound namespace or via the flat surface. Identity is preserved (`EmptyState.Icon === EmptyStateIcon`).
- **AC-3.** `EmptyState` accepts a `size` prop with values `"sm" | "md" | "lg"`, default `"md"`. The variant drives container padding and icon container dimensions per the legacy reference (`sm` 24/16 px padding · `md` 40/24 px · `lg` 64/32 px; icon container 42 · 56 · 72 px square).
- **AC-4.** `EmptyState` forwards `ref` to the root `HTMLDivElement` and spreads remaining HTML attributes (`className`, `data-*`, `aria-*`, etc.). Each subcomponent forwards its own `ref` to its semantic element.

### Semantic markup and accessibility

- **AC-5.** The root renders `<div role="status" aria-live="polite">` by default, so screen readers announce when an empty state replaces previous content (per ARIA Authoring Practices for live regions). Consumers may override via `as` (`"div" | "section"`) or by passing an explicit `role`; the `aria-live="polite"` default is preserved unless the consumer overrides it.
- **AC-6.** `EmptyState.Title` renders an `<h3>` by default with `data-slot="empty-state-title"`. The semantic level is configurable via `as="h2" | "h3" | "h4" | "h5" | "h6"` (matching the Card.Title polymorphism) so the title can fit the surrounding heading hierarchy.
- **AC-7.** `EmptyState.Description` renders a `<p>` with `data-slot="empty-state-description"` and `text-muted-foreground` color. The root injects a stable id pair (`{rootId}-title` and `{rootId}-description`) so consumers can wire additional ARIA associations when needed; the root itself uses `aria-live="polite"` + `aria-atomic="true"` so screen readers announce title + description together when the empty state mounts.
- **AC-8.** Icons inside `EmptyState.Icon` that are purely decorative MUST be marked `aria-hidden="true"` by the consumer. The slot itself adds `data-slot="empty-state-icon"` and applies the size-aware container styling; it does not auto-hide the icon (the slot is a layout container, not the icon itself).

### Token contract (semantic only)

- **AC-9.** Zero hardcoded colors, sizes, fonts, radii, or shadows in the component implementation. All styling uses Tailwind utilities backed by semantic tokens (`bg-muted`, `text-fg`, `text-fg-muted`, `rounded-{md,lg,xl,2xl}`, `gap-*`, `p-*`). Verified by reading the `cva()` block — no inline hex, no `oklch(`, no `rgb(`, no `var(--violet-*)`.
- **AC-10.** The icon container background uses `bg-muted` and the icon color inherits `text-fg`. This is the documented token remap from the legacy reference (`--violet-50` → `bg-muted`; `--violet-500` → `text-fg`); both themes (`light` + `dark`) MUST meet WCAG AA 4.5:1 for normal text and 3:1 for the icon container border-on-background.

### Visual variants

- **AC-11.** `size="sm"` container has padding `py-6 px-4` (24/16 px), icon container `h-[42px] w-[42px] rounded-xl`, title `text-sm`, description `text-xs`.
- **AC-12.** `size="md"` (default) container has padding `py-10 px-6` (40/24 px), icon container `h-14 w-14 rounded-2xl` (56 px), title `text-[15px] font-semibold`, description `text-[13.5px]`.
- **AC-13.** `size="lg"` container has padding `py-16 px-8` (64/32 px), icon container `h-[72px] w-[72px] rounded-2xl`, title `text-lg font-semibold`, description `text-sm`.
- **AC-14.** Actions slot stacks horizontally (`flex flex-row gap-2`) on `md`/`lg`; on `sm`, the stack flips to `flex-col gap-2` for a denser footprint. Verified by snapshot of the rendered className composition.

### Behavior

- **AC-15.** When only `EmptyState.Title` is provided (no description, no icon, no actions), the root still renders as a centered vertical stack with `gap-1.5` between optional slots — i.e., omitting slots does not break the layout.
- **AC-16.** Either `EmptyState.Icon` OR `EmptyState.Illustration` may be rendered, never both. The component does not enforce this at runtime; the convention is documented in JSDoc and exercised by stories.
- **AC-17.** `EmptyState.Actions` accepts arbitrary `ReactNode` children (typically `<Button>` instances from the design-system). The slot does not impose button styling — it only handles spacing and alignment.

### Documentation and discoverability

- **AC-18.** A new Astro page exists at `docs/src/pages/componentes/empty-state.astro` covering Anatomy, Sizes, Slots (Icon vs. Illustration vs. Actions), and a live preview via `react-live` (rendered from `docs/src/previews/empty-state-live.tsx`). The static previews live at `docs/src/previews/empty-state.tsx`.
- **AC-19.** `"EmptyState"` is added to the `MIGRATED` Set in `docs/src/pages/index.astro` (alphabetical insertion between `DatePicker` and `FileUpload`).
- **AC-20.** Storybook exposes ≥ 7 stories: `Default`, `WithIcon`, `WithIllustration`, `WithActions` (single CTA), `WithActions` (primary + secondary CTAs), `Sizes` (sm/md/lg matrix), `LongDescription`, `DarkTheme` (forced `data-theme="dark"`). Each story renders correctly in `light` AND `dark`.

### Quality gates

- **AC-21.** `EmptyState.test.tsx` contains ≥ 20 behavioral tests with AC traceability in each `it(...)` description, covering the 20 ACs above plus jest-axe coverage. Tests use accessible queries (`getByRole`, `getByText`) per `lex-frontend-testing`; no `getByTestId` outside slot-marker assertions.
- **AC-22.** `axeInThemes(container)` passes (zero violations) in `light` AND `dark` for at least three rendered shapes: (a) Default with title only, (b) WithIcon + Description + Actions, (c) WithIllustration + Description + Actions. `color-contrast` rule kept enabled — the token contract guarantees AA.
- **AC-23.** Branch `feat/64-empty-state` runs green on `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` before the PR is opened.
- **AC-24.** A single atomic signed commit `feat(empty-state): migrate to v0.1.0 DoD — ...` carries all the migration changes per `lex-small-commits`. Plan #65 (created in Phase 1) and parent #64 are both closed via the PR body (`Closes #65` + `Closes #64`).

## Out of scope (explicit)

- New design tokens beyond what is already in `ui_kit/styles/index.css`.
- Refactorings of `Button`, `Card`, or any sibling component.
- Animation / transition primitives on mount.
- Internationalization of any built-in copy (the component renders zero static copy — title, description, and actions are all consumer-provided).
- Visual baseline regeneration is **warn-not-fail** in `main`; CI produces a pending-baselines comment + artifact; Athena does NOT auto-apply the `regenerate-baselines` label.
