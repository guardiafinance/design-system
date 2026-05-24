/**
 * Helpers para testes de acessibilidade com jest-axe nos dois temas.
 *
 * Tech Task #125 exige `toHaveNoViolations()` em light + dark para todo
 * componente do design system. Esses helpers centralizam:
 *   1. Alternar `data-theme` no <html> antes de cada checagem axe (o DS
 *      reage exclusivamente via CSS, sem React re-render — basta o
 *      attribute flip).
 *   2. Executar `axe()` sobre o container produzido pelo render do
 *      Testing Library.
 *   3. Restaurar o tema previo no teardown da matriz pra nao vazar
 *      estado entre testes.
 *
 * Uso:
 *   import { axeInThemes } from "@/test-utils/a11y";
 *   it("nao tem violacoes a11y em light + dark", async () => {
 *     const { container } = render(<Input placeholder="..." />);
 *     await axeInThemes(container);
 *   });
 */
import { axe } from "jest-axe";
import { expect } from "vitest";

export type Theme = "light" | "dark";
export const THEMES: readonly Theme[] = ["light", "dark"];

/**
 * Aplica `data-theme={theme}` no documentElement e devolve o valor
 * previo (para restaurar via teardown). Usado tambem por testes que
 * querem inspecionar render em tema especifico sem rodar axe.
 */
export function setTheme(theme: Theme): string | null {
  const previous = document.documentElement.getAttribute("data-theme");
  document.documentElement.setAttribute("data-theme", theme);
  return previous;
}

export function restoreTheme(previous: string | null): void {
  if (previous === null) {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", previous);
  }
}

/**
 * Roda jest-axe em cada tema declarado e assertiva `toHaveNoViolations()`
 * para todos. Falha o teste no primeiro tema que reportar violacao.
 */
export async function axeInThemes(
  element: Element,
  themes: readonly Theme[] = THEMES,
): Promise<void> {
  const previous = document.documentElement.getAttribute("data-theme");
  try {
    for (const theme of themes) {
      document.documentElement.setAttribute("data-theme", theme);
      const results = await axe(element);
      expect(results, `a11y violations no tema "${theme}"`).toHaveNoViolations();
    }
  } finally {
    restoreTheme(previous);
  }
}
