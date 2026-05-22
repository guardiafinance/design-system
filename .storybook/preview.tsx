import type { Preview } from "@storybook/react";
import React, { useEffect } from "react";
import { ThemeProvider, useTheme } from "../ui_kit/theme/theme-provider";
import "../ui_kit/styles/index.css";

/**
 * Ponte entre o global `theme` do Storybook toolbar e o `ThemeProvider`.
 * Reaplica `setTheme` sempre que o usuário troca via toolbar para que a
 * preview reflita a escolha sem reload.
 */
function StorybookThemeBridge({
  themeGlobal,
  children,
}: {
  themeGlobal: "light" | "dark";
  children: React.ReactNode;
}) {
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme(themeGlobal);
  }, [themeGlobal, setTheme]);
  return <>{children}</>;
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
      return (
        <ThemeProvider defaultTheme={theme} storageKey="sb-theme">
          <StorybookThemeBridge themeGlobal={theme}>
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
          </StorybookThemeBridge>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
