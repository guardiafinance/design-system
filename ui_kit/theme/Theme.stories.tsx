import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";
import { ThemeProvider } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";
import { Card, CardContent, CardHeader } from "../components/card";

/** Props do ThemeProvider controláveis via args (children vêm do render). */
type ThemeArgs = Omit<
  ComponentProps<typeof ThemeProvider>,
  "children"
>;

const meta = {
  title: "Theme/Theme",
  component: ThemeProvider,
  tags: ["autodocs"],
  parameters: {
    a11y: {
      // WHY: theme demo renders Card with `text-muted-foreground` caption
      // (shared `--fg-muted` token deferred to Plan #128 follow-up) and
      // ThemeToggle using brand violet hover (3:1 button threshold per
      // lex-brand-colors).
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
  },
} satisfies Meta<typeof ThemeProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ThemeProviderDemo: Story = {
  args: ({
    defaultTheme: "light",
  } satisfies ThemeArgs) as unknown as Story["args"],
  render: (args) => (
    <ThemeProvider {...args}>
      <Card className="w-[300px]">
        <CardHeader className="flex flex-row items-center justify-between">
          <span>Theme</span>
          <ThemeToggle />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use the toggle to switch between light and dark mode.
          </p>
        </CardContent>
      </Card>
    </ThemeProvider>
  ),
};

export const ThemeToggleOnly: Story = {
  args: ({
    defaultTheme: "light",
  } satisfies ThemeArgs) as unknown as Story["args"],
  render: (args) => (
    <ThemeProvider {...args}>
      <ThemeToggle />
    </ThemeProvider>
  ),
};
