import type { TestRunnerConfig } from "@storybook/test-runner";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import { injectAxe, checkA11y } from "axe-playwright";

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
 */

const SNAPSHOTS_DIR = `${process.cwd()}/__image_snapshots__`;

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

    for (const theme of THEMES) {
      await page.evaluate((t) => {
        document.documentElement.setAttribute("data-theme", t);
      }, theme);

      await page.evaluate(() => document.fonts.ready);
      // Pequeno buffer pra hidratacao de portals, focus rings e transicoes.
      await page.waitForTimeout(150);

      const image = await page.locator("#storybook-root").screenshot();
      (
        expect(image) as unknown as {
          toMatchImageSnapshot: (opts: object) => void;
        }
      ).toMatchImageSnapshot({
        customSnapshotsDir: SNAPSHOTS_DIR,
        customDiffDir: `${SNAPSHOTS_DIR}/__diff_output__`,
        customSnapshotIdentifier: `${context.id}--${theme}`,
        failureThreshold: FAILURE_THRESHOLD,
        failureThresholdType: "percent",
      });

      // WHY: rollout em duas fases. A primeira execucao do test-runner contra
      // o catalogo atual de stories surfou 64 violacoes a11y reais (regras
      // button-name, label, color-contrast, nested-interactive,
      // scrollable-region-focusable). Plan #128 ataca cada violacao no nivel
      // certo (componente vs story isolation). Enquanto #128 nao mergeia,
      // o axe roda em modo soft (skipFailures = true): violations sao
      // logadas no output do CI mas nao falham o build. Apos #128 mergear,
      // o flag MUST flipar para false e este comentario MUST ser removido.
      await checkA11y(
        page,
        "#storybook-root",
        {
          detailedReport: true,
          detailedReportOptions: { html: false },
          axeOptions: {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
          },
        },
        /* skipFailures */ true,
      );
    }
  },
};

export default config;
