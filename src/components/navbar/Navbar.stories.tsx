import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router";
import { NavbarProvider, Navbar } from "./index";
import type { NavbarConfiguration } from "./utils";
import { Home } from "lucide-react";

const meta = {
  title: "Components/Navbar",
  component: Navbar,
  tags: ["autodocs"],
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
