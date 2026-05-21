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
        { name: "light", value: "#FDFDFD" },
        { name: "dark", value: "#0E1016" },
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
                background: theme === "dark" ? "#0E1016" : "#FDFDFD",
                color: theme === "dark" ? "#FDFDFD" : "#0E1016",
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
