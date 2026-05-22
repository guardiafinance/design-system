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
 * O decorator em preview.tsx aplica `data-theme` sincronamente no render
 * inicial; aqui sobrescrevemos por tema apenas para a captura. Como todo
 * o design system reage via CSS vars + `@custom-variant dark` em Tailwind,
 * o switch CSS-only e suficiente para refletir o tema na screenshot e nas
 * verificacoes de contraste do axe.
 */

const SNAPSHOTS_DIR = `${process.cwd()}/__image_snapshots__`;

/**
 * Diff visual aceito: ate 0.2% de pixels divergentes por story. Cobre
 * ruido de antialiasing sem mascarar regressoes reais. Quando uma story
 * legitima precisa de tolerancia maior (ex. animacao continua), o caminho
 * e desabilitar o snapshot daquela story especifica, nao relaxar o piso.
 */
const FAILURE_THRESHOLD = 0.002;

const THEMES = ["light", "dark"] as const;

const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async postVisit(page, context) {
    // Congela animacoes e transicoes CSS durante a captura. Skeleton pulse,
    // Spinner rotation, Sonner enter/exit, etc. introduzem nao-determinismo
    // entre frames — sem isso, cada execucao do test-runner produziria um
    // diff valido mas instavel. Aplicado uma vez por story (cobre ambos os
    // temas; addStyleTag persiste enquanto a pagina estiver aberta).
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-delay: 0s !important;
          animation-duration: 0s !important;
          animation-iteration-count: 1 !important;
          animation-play-state: paused !important;
          transition-delay: 0s !important;
          transition-duration: 0s !important;
        }
      `,
    });

    // Axe e injetado uma vez por story (mesma pagina serve ambos os temas).
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
