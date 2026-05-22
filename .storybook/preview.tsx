import type { Preview } from "@storybook/react";
import React from "react";
import "../ui_kit/styles/index.css";

/**
 * Aplica o tema sincronamente no <html> antes de o React renderizar.
 *
 * Por que sem ThemeProvider:
 *   ThemeProvider usa useState() lendo localStorage no init, e o
 *   StorybookThemeBridge anterior reagia ao toolbar via useEffect
 *   APÓS o mount. Isso gerava duas pinturas (frame 1 com tema do
 *   storage, frame 2 com tema do toolbar) que o Chromatic detectava
 *   como "unstable tests" — as duas screenshots de comparação
 *   caíam em frames diferentes da sequência.
 *
 * Aqui o setAttribute roda na fase de render do decorator (antes
 * do paint), garantindo que a primeira pintura já carregue o
 * data-theme correto. Determinístico por construção.
 */
function applyThemeSync(theme: "light" | "dark"): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: {
      default: "light",
      values: [
        // Valores literais: o addon de backgrounds aplica via inline style
        // no body do iframe, fora do escopo das variaveis CSS. Espelham
        // --bg em cada tema: Mono Branco light, Cinza 900 dark (Surface
        // Base per Notion > Branding > Cores > Dark Mode).
        { name: "light", value: "#FDFDFD" },
        { name: "dark", value: "#17171B" },
      ],
    },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Tema global do design system",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme ?? "light") as "light" | "dark";
      applyThemeSync(theme);
      return (
        <div
          data-storybook-bg={theme}
          style={{
            background: "var(--bg)",
            color: "var(--fg)",
            minHeight: "100vh",
            padding: "1.5rem",
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
