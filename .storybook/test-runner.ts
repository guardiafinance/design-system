import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";

import type { TestRunnerConfig } from "@storybook/test-runner";
import { getStoryContext } from "@storybook/test-runner";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import { injectAxe, checkA11y } from "axe-playwright";

// Canonical kebab + snapshot-path derivation, shared with the migration
// script (`scripts/migrate-visual-baselines.mjs`) to keep both consumers
// resolving to the same path. Native ESM `.mjs` import — both Storybook's
// test-runner (Jest+Playwright pipeline) and TypeScript with
// `moduleResolution: bundler` resolve it without extra config.
import {
  snapshotDirForStory,
  toKebab,
} from "./lib/snapshot-paths.mjs";

/**
 * Substitui o gate Chromatic (free plan esgotado) por uma stack OSS:
 * - Visual regression via jest-image-snapshot, baseline commitado em
 *   `__image_snapshots__/` (Git como source of truth).
 * - A11y via axe-playwright executando WCAG2 A + AA sobre o no renderizado.
 * - Cobertura por tema: cada story e capturada e auditada em light e dark
 *   alternando `data-theme` no documentElement via page.evaluate, sem
 *   renavegar (o test-runner controla a navegacao por story; renavegar
 *   no postVisit derrubaria o `__test` global injetado pelo runner).
 *
 * Sobre a troca de tema CSS-only (sem React re-render):
 *   O design system reage ao `data-theme` exclusivamente via CSS — tokens
 *   semanticos (`--bg`, `--fg`, etc.) e Tailwind `@custom-variant dark`
 *   resolvem contra o atributo no <html>. Nenhum componente do catalogo
 *   le `theme` via React Context para condicionar render. Por isso o
 *   `setAttribute` direto e suficiente: a captura visual reflete o tema
 *   alvo e o axe avalia contraste sobre as cores efetivas pintadas.
 *   Se um futuro componente passar a depender de `useTheme()` do React
 *   para logica condicional, esse hook precisa ser revisitado para
 *   alternar via Storybook channel (`updateGlobals`).
 *
 * Layout de baselines (Plan #132):
 *   __image_snapshots__/<titleSegment-kebab>/.../<theme>/<variant-kebab>.png
 *
 *   Title "Components/MultiSelect" + variant "Default" produz:
 *     __image_snapshots__/components/multi-select/dark/default.png
 *
 *   Subdivisao por title + tema mantem o reviewer numa pasta scannable
 *   em vez de 426+ PNGs flat. O variant fica como leaf identifier.
 */

const SNAPSHOTS_DIR = `${process.cwd()}/__image_snapshots__`;

/**
 * Diretorio onde diffs de falhas visuais sao escritos. Sub-hierarquia
 * espelha a do baseline (`<diff_output>/{titleSegments}/{theme}/`) pra
 * evitar colisao quando duas stories de componentes diferentes
 * compartilham o mesmo `variant` (ex.: "default", "large"). Sem essa
 * sub-hierarquia, `default-diff.png` de Calendar sobrescreve o
 * `default-diff.png` de Avatar.
 *
 * Mantido FORA da arvore de baselines (irmao em `__image_snapshots__/`),
 * preservando a separacao baselines (commitadas) x diffs (artefato CI).
 * O workflow `upload-artifact@v4` empacota a pasta inteira recursivamente.
 *
 * O `scripts/generate-diff-report.mjs` (Plan #133) consome a estrutura
 * abaixo para produzir `index.html` navegavel com base | received | diff
 * lado a lado por story+tema:
 *
 *   __diff_output__/{titleSegments}/{theme}/<variant>-diff.png      (composite)
 *   __diff_output__/{titleSegments}/{theme}/<variant>-received.png  (atual, via storeReceivedOnFailure)
 *   __image_snapshots__/{titleSegments}/{theme}/<variant>.png       (baseline commitada)
 */
const DIFF_OUTPUT_DIR = `${SNAPSHOTS_DIR}/__diff_output__`;

/**
 * Diff visual aceito: ate 0.2% de pixels divergentes por story. Cobre
 * ruido de antialiasing sem mascarar regressoes reais. Quando uma story
 * legitima precisa de tolerancia maior (ex. animacao continua), o caminho
 * e desabilitar o snapshot daquela story especifica via
 * `parameters.test.disableSnapshot`, nao relaxar o piso global.
 */
const FAILURE_THRESHOLD = 0.002;

const THEMES = ["light", "dark"] as const;

/**
 * ID do <style> que congela animacoes/transicoes. Permite dedup via
 * page.evaluate — addStyleTag nativo nao oferece controle de id, e a
 * page do Playwright e reutilizada entre stories do mesmo arquivo de
 * test (jest-playwright pool). Sem dedup, cada postVisit adiciona um
 * novo <style> ao head, acumulando bloat.
 */
const FROZEN_ANIM_STYLE_ID = "storybook-test-runner-frozen-animations";

/**
 * Tech Task #238 — warn-not-fail for first-time stories.
 *
 * Two modes, selected by `process.env.VISUAL_REGRESSION_MODE`:
 *
 *   regenerate  — set by the regenerate-baselines branch of the CI
 *                 workflow. Delegates entirely to `toMatchImageSnapshot`,
 *                 which writes a fresh baseline whenever one is missing
 *                 (the regenerate step has already wiped __image_snapshots__).
 *
 *   validate    — default. For each (story, theme) pair, check whether the
 *                 canonical baseline at
 *                 <SNAPSHOTS_DIR>/<titleSegments>/<theme>/<variant>.png
 *                 exists. If it does NOT, capture the candidate PNG to
 *                 a sibling __pending__/ quarantine (gitignored), append
 *                 an entry to __pending__/manifest.json, and SKIP
 *                 `toMatchImageSnapshot` for that pair. Existing
 *                 baselines still go through the strict diff path —
 *                 real regressions still fail the job.
 *
 * The CI workflow (`.github/workflows/pull-request.yml`) consumes
 * `__pending__/manifest.json` to upload the pending artifact and post a
 * single PR comment with the apply-`regenerate-baselines`-label
 * instruction. The `__pending__/` directory itself is gitignored.
 */
const PENDING_DIR = `${SNAPSHOTS_DIR}/__pending__`;
const PENDING_MANIFEST = `${PENDING_DIR}/manifest.json`;

type Mode = "regenerate" | "validate";

function resolveMode(): Mode {
  return process.env.VISUAL_REGRESSION_MODE === "regenerate"
    ? "regenerate"
    : "validate";
}

interface PendingEntry {
  readonly storyId: string;
  readonly title: string;
  readonly variant: string;
  readonly theme: string;
  readonly snapshotPath: string;
  readonly capturedAt: string;
}

interface PendingManifest {
  schema: 1;
  capturedAt: string;
  stories: PendingEntry[];
}

function appendPending(entry: PendingEntry): void {
  mkdirSync(PENDING_DIR, { recursive: true });
  let manifest: PendingManifest;
  try {
    const parsed = JSON.parse(
      readFileSync(PENDING_MANIFEST, "utf-8"),
    ) as PendingManifest;
    if (parsed.schema !== 1 || !Array.isArray(parsed.stories)) {
      throw new Error("manifest schema mismatch");
    }
    manifest = parsed;
  } catch {
    manifest = {
      schema: 1,
      capturedAt: new Date().toISOString(),
      stories: [],
    };
  }
  // Idempotency: if the same (storyId, theme) is already recorded in this
  // run, skip. Each story + theme pair captures at most once per CI run.
  if (
    manifest.stories.some(
      (s) => s.storyId === entry.storyId && s.theme === entry.theme,
    )
  ) {
    return;
  }
  manifest.stories.push(entry);
  const tmp = `${PENDING_MANIFEST}.tmp.${process.pid}.${Date.now()}`;
  writeFileSync(tmp, JSON.stringify(manifest, null, 2));
  renameSync(tmp, PENDING_MANIFEST);
}

const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async postVisit(page, context) {
    // Stories podem optar por sair do snapshot via parameter
    // (e.g. componentes intrinsecamente nao-deterministicos). A escolha
    // e documentada no CONTRIBUTING.md e exige WHY adjacente no story.
    type StoryContextWithSnapshotFlag = {
      parameters?: { test?: { disableSnapshot?: boolean } };
    };
    if (
      (context as unknown as StoryContextWithSnapshotFlag).parameters?.test
        ?.disableSnapshot
    ) {
      return;
    }

    // Congela animacoes e transicoes CSS para captura deterministica.
    // Skeleton pulse, Spinner rotation, Sonner enter/exit, etc. cairiam
    // em frames distintos entre runs. Injetado com id e dedup pra evitar
    // acumulo no head quando a page e reutilizada entre stories.
    await page.evaluate((id) => {
      if (document.getElementById(id)) return;
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        *, *::before, *::after {
          animation-delay: 0s !important;
          animation-duration: 0s !important;
          animation-iteration-count: 1 !important;
          animation-play-state: paused !important;
          transition-delay: 0s !important;
          transition-duration: 0s !important;
        }
      `;
      document.head.appendChild(style);
    }, FROZEN_ANIM_STYLE_ID);

    // Axe e injetado uma vez por story (cobre ambos os temas).
    await injectAxe(page);

    // Per-story opt-out: stories may declare `parameters.a11y.config.rules`
    // to disable specific axe rules with WHY documentation. Used when the
    // story intentionally showcases tokens that fall in the 3:1–4.5:1 brand
    // range (see `lex-brand-colors`) and consumers MUST apply them only to
    // titles/buttons/badges in product surfaces.
    //
    // The test-runner's postVisit `context` strips user-defined parameters;
    // `getStoryContext(page, context)` round-trips through the iframe channel
    // and returns the full Storybook story context with all parameters intact.
    type AxeRuleOverride = { id: string; enabled: boolean };
    type StoryA11yParameters = {
      a11y?: {
        disable?: boolean;
        config?: { rules?: AxeRuleOverride[] };
      };
    };
    const storyContext = await getStoryContext(page, context);
    const a11yParams = (storyContext.parameters ?? {}) as StoryA11yParameters;
    const a11yDisabled = a11yParams.a11y?.disable === true;
    const ruleOverrides = a11yParams.a11y?.config?.rules ?? [];
    // axe-core's RunOptions.rules accepts a `{ [ruleId]: { enabled } }` map.
    const axeRulesMap: Record<string, { enabled: boolean }> = {};
    for (const rule of ruleOverrides) {
      axeRulesMap[rule.id] = { enabled: rule.enabled };
    }

    const variantSlug = toKebab(storyContext.name);
    const mode = resolveMode();

    for (const theme of THEMES) {
      await page.evaluate((t) => {
        document.documentElement.setAttribute("data-theme", t);
      }, theme);

      await page.evaluate(() => document.fonts.ready);
      // Pequeno buffer pra hidratacao de portals, focus rings e transicoes.
      await page.waitForTimeout(150);

      const image = await page.locator("#storybook-root").screenshot();

      // Tech Task #238 — warn-not-fail for first-time stories.
      // In validate mode, if the canonical baseline at
      // <SNAPSHOTS_DIR>/<titleSegments>/<theme>/<variantSlug>.png does
      // not exist, capture the candidate to the __pending__/ quarantine
      // (gitignored) and skip the strict diff. The validate-mode job in
      // CI uploads __pending__/ as an artifact and posts a single PR
      // comment with the apply-`regenerate-baselines` instruction.
      // The has-baseline path is unchanged: strict diff via
      // toMatchImageSnapshot continues to fail on real regressions.
      const baselineDir = snapshotDirForStory(
        SNAPSHOTS_DIR,
        storyContext.title,
        theme,
      );
      const baselinePath = `${baselineDir}/${variantSlug}.png`;
      if (mode === "validate" && !existsSync(baselinePath)) {
        const pendingThemeDir = snapshotDirForStory(
          PENDING_DIR,
          storyContext.title,
          theme,
        );
        const pendingPath = `${pendingThemeDir}/${variantSlug}.png`;
        mkdirSync(pendingThemeDir, { recursive: true });
        writeFileSync(pendingPath, image);
        const repoRelative = pendingPath.startsWith(`${process.cwd()}/`)
          ? pendingPath.slice(process.cwd().length + 1)
          : pendingPath;
        appendPending({
          storyId: storyContext.id,
          title: storyContext.title,
          variant: storyContext.name,
          theme,
          snapshotPath: repoRelative,
          capturedAt: new Date().toISOString(),
        });
        // eslint-disable-next-line no-console
        console.warn(
          `[visual-regression] pending baseline captured for "${storyContext.id}" (${theme}) -> ${repoRelative} (apply the regenerate-baselines label to promote)`,
        );
        // Still run a11y on the rendered surface even without a baseline.
        if (!a11yDisabled) {
          await checkA11y(page, "#storybook-root", {
            detailedReport: true,
            detailedReportOptions: { html: false },
            axeOptions: {
              runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
              rules: axeRulesMap,
            },
          });
        }
        continue;
      }

      (
        expect(image) as unknown as {
          toMatchImageSnapshot: (opts: object) => void;
        }
      ).toMatchImageSnapshot({
        customSnapshotsDir: baselineDir,
        customDiffDir: snapshotDirForStory(
          DIFF_OUTPUT_DIR,
          storyContext.title,
          theme,
        ),
        // Quando ha diff, escreve tambem o `*-received.png` (current render)
        // junto do diff composite. Permite que o report HTML mostre as 3
        // imagens (base | received | diff) lado a lado em vez de so o
        // composite gerado pelo jest-image-snapshot. customReceivedDir
        // espelha a hierarquia do diff (sub-pasta `__received_output__`
        // dentro do mesmo titleSegments/theme).
        storeReceivedOnFailure: true,
        customReceivedDir: snapshotDirForStory(
          DIFF_OUTPUT_DIR,
          storyContext.title,
          theme,
        ),
        customSnapshotIdentifier: variantSlug,
        failureThreshold: FAILURE_THRESHOLD,
        failureThresholdType: "percent",
      });

      if (!a11yDisabled) {
        await checkA11y(page, "#storybook-root", {
          detailedReport: true,
          detailedReportOptions: { html: false },
          axeOptions: {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
            rules: axeRulesMap,
          },
        });
      }
    }
  },
};

export default config;
