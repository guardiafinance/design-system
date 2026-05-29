import type { Meta, StoryObj } from "@storybook/react";
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuGroup,
  MenuLabel,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
} from "./index";
import { Button } from "../button";

const meta = {
  title: "Components/Menu",
  component: Menu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Canonical Overlays menu primitive consolidating dropdown-menu and context-menu under a single API via `<Menu mode>`. ADR-006 records the decision.",
      },
    },
  },
} satisfies Meta<typeof Menu>;

export default meta;

type Story = StoryObj<typeof meta>;

// ──────────────────────────────────────────────────────────────────
// Default — dropdown mode with a simple action set
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem>Edit</MenuItem>
        <MenuItem>Duplicate</MenuItem>
        <MenuSeparator />
        <MenuItem destructive>Delete</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Sides — top / right / bottom / left
// ──────────────────────────────────────────────────────────────────

export const Sides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-16">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Menu key={side}>
          <MenuTrigger asChild>
            <Button variant="outline">side={side}</Button>
          </MenuTrigger>
          <MenuContent side={side}>
            <MenuItem>{`Opens to ${side}`}</MenuItem>
          </MenuContent>
        </Menu>
      ))}
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Alignments — start / center / end
// ──────────────────────────────────────────────────────────────────

export const Alignments: Story = {
  render: () => (
    <div className="flex gap-4">
      {(["start", "center", "end"] as const).map((align) => (
        <Menu key={align}>
          <MenuTrigger asChild>
            <Button variant="outline">align={align}</Button>
          </MenuTrigger>
          <MenuContent align={align}>
            <MenuItem>{`Aligns ${align}`}</MenuItem>
          </MenuContent>
        </Menu>
      ))}
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Sizes — sm / md / lg CVA ladder
// ──────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Menu key={size}>
          <MenuTrigger asChild>
            <Button variant="outline">size={size}</Button>
          </MenuTrigger>
          <MenuContent size={size}>
            <MenuItem>Edit</MenuItem>
            <MenuItem>Duplicate</MenuItem>
            <MenuSeparator />
            <MenuItem destructive>Delete</MenuItem>
          </MenuContent>
        </Menu>
      ))}
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// With Checkbox items
// ──────────────────────────────────────────────────────────────────

export const WithCheckbox: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline">View options</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuLabel>Layers</MenuLabel>
        <MenuCheckboxItem checked>Show grid</MenuCheckboxItem>
        <MenuCheckboxItem checked>Show guides</MenuCheckboxItem>
        <MenuCheckboxItem>Show rulers</MenuCheckboxItem>
      </MenuContent>
    </Menu>
  ),
};

// ──────────────────────────────────────────────────────────────────
// With Radio items
// ──────────────────────────────────────────────────────────────────

export const WithRadio: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline">Assignee</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuLabel>Assigned to</MenuLabel>
        <MenuRadioGroup value="ana">
          <MenuRadioItem value="pedro">Pedro</MenuRadioItem>
          <MenuRadioItem value="ana">Ana</MenuRadioItem>
          <MenuRadioItem value="maria">Maria</MenuRadioItem>
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  ),
};

// ──────────────────────────────────────────────────────────────────
// With Group + Label + Shortcut + Separator
// ──────────────────────────────────────────────────────────────────

export const WithGroupsAndShortcuts: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline">File</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuGroup>
          <MenuLabel>File</MenuLabel>
          <MenuItem>
            New <MenuShortcut>⌘N</MenuShortcut>
          </MenuItem>
          <MenuItem>
            Open <MenuShortcut>⌘O</MenuShortcut>
          </MenuItem>
          <MenuItem>
            Save <MenuShortcut>⌘S</MenuShortcut>
          </MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuLabel>Edit</MenuLabel>
          <MenuItem>
            Undo <MenuShortcut>⌘Z</MenuShortcut>
          </MenuItem>
          <MenuItem disabled>
            Redo <MenuShortcut>⌘⇧Z</MenuShortcut>
          </MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Submenu
// ──────────────────────────────────────────────────────────────────

export const WithSubmenu: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline">Share</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem>Open</MenuItem>
        <MenuSub>
          <MenuSubTrigger>Share to</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Slack</MenuItem>
            <MenuItem>Email</MenuItem>
            <MenuItem>Copy link</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSeparator />
        <MenuItem destructive>Delete</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Context mode — right-click trigger
// ──────────────────────────────────────────────────────────────────

export const ContextMode: Story = {
  render: () => (
    <Menu mode="context">
      <MenuTrigger asChild>
        <div className="flex h-40 w-72 items-center justify-center rounded-md border border-dashed border-border-strong text-sm text-fg-muted">
          Right-click anywhere in this region
        </div>
      </MenuTrigger>
      <MenuContent>
        <MenuItem>Cut</MenuItem>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
        <MenuSeparator />
        <MenuItem destructive>Remove</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Dark theme — same Default in `data-theme="dark"`
// ──────────────────────────────────────────────────────────────────

export const DarkTheme: Story = {
  parameters: { backgrounds: { default: "dark" } },
  decorators: [
    (Story) => (
      <div data-theme="dark" className="rounded-md bg-background p-6 text-fg">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline">Open menu (dark)</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem>Edit</MenuItem>
        <MenuItem>Duplicate</MenuItem>
        <MenuSeparator />
        <MenuItem destructive>Delete</MenuItem>
      </MenuContent>
    </Menu>
  ),
};
