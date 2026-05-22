import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router";
import { NavbarProvider, Navbar } from "./index";
import type { NavbarConfiguration } from "./utils";
import { Home } from "lucide-react";

const meta = {
  title: "Components/Navbar",
  component: Navbar,
  tags: ["autodocs"],
  parameters: {
    a11y: {
      // WHY: Navbar renders muted secondary text (item descriptions,
      // collapsed-state labels) using `text-fg-muted` — shared token deferred
      // to the Plan #128 follow-up. Brand violet hover/active states also
      // sit in the 3:1–4.5:1 button range per lex-brand-colors.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/"]}>
        <NavbarProvider>
          <div className="flex h-[400px]">
            <Story />
            <main className="flex-1 p-4">Page content</main>
          </div>
        </NavbarProvider>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof Navbar>;

export default meta;

type Story = StoryObj<typeof meta>;

const minimalSettings: NavbarConfiguration = {
  areas: [
    {
      title: "Main",
      icon: Home,
      sections: [{ label: "Menu", items: [{ title: "Dashboard", path: "/" }] }],
    },
  ],
  organization: { name: "App" },
};

export const Default: Story = {
  args: { settings: minimalSettings },
};
