import * as React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeInThemes } from "@/test-utils/a11y";
import {
  SidebarNav,
  SidebarNavSection,
  SidebarNavItem,
  SidebarNavGroup,
  SidebarNavGroupTrigger,
  SidebarNavGroupContent,
  sidebarNavVariants,
  sidebarNavItemVariants,
} from "./index";

/**
 * Tests for Plan #83 (parent Tech Task #82) — SidebarNav v0.1.0 DoD.
 *
 * Each `it(...)` carries `AC-N:` so that `lex-issue-driven` Rule 3
 * (bidirectional AC ↔ test traceability) passes at Gate 2. ACs come
 * from `docs/issues/issue-82/02-requirements.md`.
 */

// ──────────────────────────────────────────────────────────────────
// Helpers — small icon and harness builders
// ──────────────────────────────────────────────────────────────────

function StubIcon({ name }: { name: string }): React.ReactElement {
  return (
    <svg
      data-icon={name}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="12" height="12" rx="2" />
    </svg>
  );
}

function BasicHarness({
  collapsed = false,
  activeKey = "inicio",
}: {
  collapsed?: boolean;
  activeKey?: string;
}): React.ReactElement {
  return (
    <SidebarNav collapsed={collapsed}>
      <SidebarNavSection label="Geral">
        <SidebarNavItem
          icon={<StubIcon name="home" />}
          active={activeKey === "inicio"}
        >
          Início
        </SidebarNavItem>
        <SidebarNavItem
          icon={<StubIcon name="inbox" />}
          badge="12"
          active={activeKey === "inbox"}
        >
          Inbox
        </SidebarNavItem>
      </SidebarNavSection>
    </SidebarNav>
  );
}

function GroupHarness({
  defaultOpen = true,
  collapsed = false,
}: {
  defaultOpen?: boolean;
  collapsed?: boolean;
}): React.ReactElement {
  return (
    <SidebarNav collapsed={collapsed}>
      <SidebarNavSection label="Operação">
        <SidebarNavGroup
          label="Contábil"
          icon={<StubIcon name="ledger" />}
          defaultOpen={defaultOpen}
        >
          <SidebarNavGroupTrigger />
          <SidebarNavGroupContent>
            <SidebarNavItem>Lançamentos</SidebarNavItem>
            <SidebarNavItem>Razão</SidebarNavItem>
          </SidebarNavGroupContent>
        </SidebarNavGroup>
      </SidebarNavSection>
    </SidebarNav>
  );
}

function ControlledGroupHarness(): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  return (
    <SidebarNav>
      <SidebarNavSection>
        <SidebarNavGroup
          label="Financeiro"
          open={open}
          onOpenChange={setOpen}
        >
          <SidebarNavGroupTrigger />
          <SidebarNavGroupContent>
            <SidebarNavItem>Conciliação</SidebarNavItem>
            <SidebarNavItem>Extratos</SidebarNavItem>
          </SidebarNavGroupContent>
        </SidebarNavGroup>
        <button
          type="button"
          data-testid="external-toggle"
          onClick={() => setOpen(true)}
        >
          force-open
        </button>
      </SidebarNavSection>
    </SidebarNav>
  );
}

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

// ──────────────────────────────────────────────────────────────────
// Public surface (AC-1, AC-2)
// ──────────────────────────────────────────────────────────────────

describe("SidebarNav — public surface", () => {
  it("AC-1: exports the 6 canonical components + 2 CVA accessors", () => {
    expect(SidebarNav).toBeDefined();
    expect(SidebarNavSection).toBeDefined();
    expect(SidebarNavItem).toBeDefined();
    expect(SidebarNavGroup).toBeDefined();
    expect(SidebarNavGroupTrigger).toBeDefined();
    expect(SidebarNavGroupContent).toBeDefined();
    expect(sidebarNavVariants).toBeDefined();
    expect(sidebarNavItemVariants).toBeDefined();
    expect(typeof sidebarNavVariants).toBe("function");
    expect(typeof sidebarNavItemVariants).toBe("function");
  });

  it("AC-1: sidebarNavVariants is invocable with no args (defaults applied)", () => {
    const cls = sidebarNavVariants({});
    expect(cls).toContain("bg-sidebar");
    expect(cls).toContain("text-sidebar-foreground");
    expect(cls).toContain("border-sidebar-border");
    expect(cls).toContain("w-60");
  });

  it("AC-1: sidebarNavItemVariants is invocable with no args (active=false)", () => {
    const cls = sidebarNavItemVariants({});
    expect(cls).toContain("hover:bg-sidebar-accent");
    expect(cls).toContain("focus-visible:ring-ring");
  });
});

// ──────────────────────────────────────────────────────────────────
// Tokenization (AC-3, AC-4)
// ──────────────────────────────────────────────────────────────────

describe("SidebarNav — tokenization", () => {
  it("AC-3: root + item classes never include hex literals, oklch values, or chromatic Tailwind utilities", () => {
    const rootCls = sidebarNavVariants({ collapsed: false });
    const collapsedCls = sidebarNavVariants({ collapsed: true });
    const itemCls = sidebarNavItemVariants({ active: false });
    const activeCls = sidebarNavItemVariants({ active: true });
    for (const cls of [rootCls, collapsedCls, itemCls, activeCls]) {
      expect(cls).not.toMatch(/#[0-9a-fA-F]{3,8}/);
      expect(cls).not.toMatch(/oklch\(/);
      expect(cls).not.toMatch(/(text|bg|border|ring)-(red|orange|yellow|green|blue|violet|purple|pink|gray)-\d+/);
    }
  });

  it("AC-4: root container applies bg-sidebar + text-sidebar-foreground + border-sidebar-border", () => {
    render(<BasicHarness />);
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("bg-sidebar");
    expect(nav.className).toContain("text-sidebar-foreground");
    expect(nav.className).toContain("border-sidebar-border");
  });
});

// ──────────────────────────────────────────────────────────────────
// Root variants (AC-5, AC-6)
// ──────────────────────────────────────────────────────────────────

describe("SidebarNav — root variants", () => {
  it("AC-5: collapsed=false renders the expanded width (w-60)", () => {
    render(<BasicHarness collapsed={false} />);
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("w-60");
    expect(nav.getAttribute("data-collapsed")).toBe("false");
  });

  it("AC-5: collapsed=true renders the compact width (w-14)", () => {
    render(<BasicHarness collapsed={true} />);
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("w-14");
    expect(nav.getAttribute("data-collapsed")).toBe("true");
  });

  it("AC-5: collapsed hides text labels via sr-only", () => {
    render(<BasicHarness collapsed={true} />);
    const label = screen.getByText("Início");
    expect(label.className).toContain("sr-only");
  });

  it("AC-6: transition uses motion-reduce:transition-none", () => {
    render(<BasicHarness />);
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("transition-[width]");
    expect(nav.className).toContain("motion-reduce:transition-none");
  });
});

// ──────────────────────────────────────────────────────────────────
// Item — icon, badge, active, disabled, href (AC-7, AC-8, AC-9)
// ──────────────────────────────────────────────────────────────────

describe("SidebarNav — Item", () => {
  it("AC-7: renders icon when prop is provided", () => {
    const { container } = render(<BasicHarness />);
    const icon = container.querySelector("[data-icon='home']");
    expect(icon).not.toBeNull();
  });

  it("AC-7: renders badge when not collapsed", () => {
    render(<BasicHarness />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("AC-7: hides badge when collapsed", () => {
    render(<BasicHarness collapsed={true} />);
    expect(screen.queryByText("12")).not.toBeInTheDocument();
  });

  it("AC-8: active=true applies the active class chain and aria-current=page", () => {
    render(<BasicHarness activeKey="inbox" />);
    // active item is the Inbox row
    const inboxItem = screen.getByRole("button", { name: /inbox/i });
    expect(inboxItem.getAttribute("aria-current")).toBe("page");
    expect(inboxItem.className).toContain("bg-sidebar-accent");
    expect(inboxItem.className).toContain("font-semibold");
  });

  it("AC-9: renders <button> when no href provided", () => {
    render(
      <SidebarNav>
        <SidebarNavSection>
          <SidebarNavItem>Plain</SidebarNavItem>
        </SidebarNavSection>
      </SidebarNav>,
    );
    const item = screen.getByRole("button", { name: /plain/i });
    expect(item.tagName).toBe("BUTTON");
    expect(item.getAttribute("type")).toBe("button");
  });

  it("AC-9: renders <a href> when href is provided", () => {
    render(
      <SidebarNav>
        <SidebarNavSection>
          <SidebarNavItem href="/dashboard">Dashboard</SidebarNavItem>
        </SidebarNavSection>
      </SidebarNav>,
    );
    const link = screen.getByRole("link", { name: /dashboard/i });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/dashboard");
  });

  it("AC-9: onClick is forwarded to button items", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <SidebarNav>
        <SidebarNavSection>
          <SidebarNavItem onClick={onClick}>Clickable</SidebarNavItem>
        </SidebarNavSection>
      </SidebarNav>,
    );
    await user.click(screen.getByRole("button", { name: /clickable/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("AC-9: disabled=true on button disables native interaction", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <SidebarNav>
        <SidebarNavSection>
          <SidebarNavItem disabled onClick={onClick}>
            Off
          </SidebarNavItem>
        </SidebarNavSection>
      </SidebarNav>,
    );
    const btn = screen.getByRole("button", { name: /off/i });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("AC-9: disabled=true on link sets aria-disabled and tabIndex=-1", () => {
    render(
      <SidebarNav>
        <SidebarNavSection>
          <SidebarNavItem href="/x" disabled>
            Off-link
          </SidebarNavItem>
        </SidebarNavSection>
      </SidebarNav>,
    );
    const link = screen.getByRole("link", { name: /off-link/i });
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.getAttribute("tabindex")).toBe("-1");
    expect(link.className).toContain("pointer-events-none");
  });
});

// ──────────────────────────────────────────────────────────────────
// Section (AC-10)
// ──────────────────────────────────────────────────────────────────

describe("SidebarNav — Section", () => {
  it("AC-10: renders uppercase section label when not collapsed", () => {
    render(<BasicHarness />);
    expect(screen.getByText("Geral")).toBeInTheDocument();
  });

  it("AC-10: replaces label with a divider when collapsed", () => {
    const { container } = render(<BasicHarness collapsed={true} />);
    // Label text removed
    expect(screen.queryByText("Geral")).not.toBeInTheDocument();
    // Divider rendered
    const hr = container.querySelector("hr");
    expect(hr).not.toBeNull();
    expect(hr!.className).toContain("bg-sidebar-border");
  });
});

// ──────────────────────────────────────────────────────────────────
// Group (AC-11)
// ──────────────────────────────────────────────────────────────────

describe("SidebarNav — Group (uncontrolled + controlled)", () => {
  it("AC-11: uncontrolled defaultOpen=true shows the content immediately", () => {
    render(<GroupHarness defaultOpen={true} />);
    expect(screen.getByText("Lançamentos")).toBeInTheDocument();
    expect(screen.getByText("Razão")).toBeInTheDocument();
  });

  it("AC-11: uncontrolled defaultOpen=false hides the content initially", () => {
    render(<GroupHarness defaultOpen={false} />);
    expect(screen.queryByText("Lançamentos")).not.toBeInTheDocument();
  });

  it("AC-11: trigger toggles uncontrolled group open state", async () => {
    const user = userEvent.setup();
    render(<GroupHarness defaultOpen={false} />);
    const trigger = screen.getByRole("button", { name: /contábil/i });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Lançamentos")).toBeInTheDocument();
  });

  it("AC-11: trigger has aria-controls pointing to the content id", () => {
    render(<GroupHarness defaultOpen={true} />);
    const trigger = screen.getByRole("button", { name: /contábil/i });
    const contentId = trigger.getAttribute("aria-controls");
    expect(contentId).toBeTruthy();
    const content = document.getElementById(contentId!);
    expect(content).not.toBeNull();
    expect(content!.getAttribute("role")).toBe("group");
  });

  it("AC-11: controlled mode uses external state and surfaces toggle", async () => {
    const user = userEvent.setup();
    render(<ControlledGroupHarness />);
    // Initially closed
    expect(screen.queryByText("Conciliação")).not.toBeInTheDocument();
    const trigger = screen.getByRole("button", { name: /financeiro/i });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    // Open via internal trigger
    await user.click(trigger);
    expect(screen.getByText("Conciliação")).toBeInTheDocument();
    // Close via trigger again
    await user.click(trigger);
    expect(screen.queryByText("Conciliação")).not.toBeInTheDocument();
    // Open via external (controlled) trigger
    await user.click(screen.getByTestId("external-toggle"));
    expect(screen.getByText("Conciliação")).toBeInTheDocument();
  });

  it("AC-11: in collapsed mode the group renders children inline (no trigger, no chevron)", () => {
    render(<GroupHarness collapsed={true} />);
    // Trigger button should NOT exist when collapsed (the group dissolves)
    expect(
      screen.queryByRole("button", { name: /contábil/i }),
    ).not.toBeInTheDocument();
    // But the child items still render (inline)
    expect(screen.getByRole("button", { name: /lançamentos/i })).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// ARIA contract (AC-12, AC-13, AC-14)
// ──────────────────────────────────────────────────────────────────

describe("SidebarNav — ARIA", () => {
  it("AC-12: root is a <nav> with default aria-label 'Navegação principal'", () => {
    render(<BasicHarness />);
    const nav = screen.getByRole("navigation");
    expect(nav.tagName).toBe("NAV");
    expect(nav.getAttribute("aria-label")).toBe("Navegação principal");
  });

  it("AC-12: aria-label is overridable via prop", () => {
    render(
      <SidebarNav aria-label="Menu da contabilidade">
        <SidebarNavSection>
          <SidebarNavItem>Item</SidebarNavItem>
        </SidebarNavSection>
      </SidebarNav>,
    );
    expect(
      screen.getByRole("navigation", { name: /menu da contabilidade/i }),
    ).toBeInTheDocument();
  });

  it("AC-13: keyboard activation via Enter triggers onClick on button items", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <SidebarNav>
        <SidebarNavSection>
          <SidebarNavItem onClick={onClick}>Press me</SidebarNavItem>
        </SidebarNavSection>
      </SidebarNav>,
    );
    const item = screen.getByRole("button", { name: /press me/i });
    item.focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("AC-14: in collapsed mode, item exposes the label via aria-label on the button", () => {
    render(<BasicHarness collapsed={true} />);
    // Both items should be findable by their label name via accessible role queries.
    expect(
      screen.getByRole("button", { name: /início/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /inbox/i }),
    ).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// jest-axe — light + dark across 5 declared states (AC-18..AC-22)
// ──────────────────────────────────────────────────────────────────

describe("SidebarNav — a11y in light + dark", () => {
  const AXE_TIMEOUT_MS = 30_000;

  it(
    "AC-18: Default expanded view has no axe violations in light + dark",
    async () => {
      const { container } = render(<BasicHarness />);
      await axeInThemes(container);
    },
    AXE_TIMEOUT_MS,
  );

  it(
    "AC-19: Active item state has no axe violations in light + dark",
    async () => {
      const { container } = render(<BasicHarness activeKey="inbox" />);
      await axeInThemes(container);
    },
    AXE_TIMEOUT_MS,
  );

  it(
    "AC-20: Collapsed view (with tooltips) has no axe violations in light + dark",
    async () => {
      const { container } = render(<BasicHarness collapsed={true} />);
      await axeInThemes(container);
    },
    AXE_TIMEOUT_MS,
  );

  it(
    "AC-21: Group open view has no axe violations in light + dark",
    async () => {
      const { container } = render(<GroupHarness defaultOpen={true} />);
      await axeInThemes(container);
    },
    AXE_TIMEOUT_MS,
  );

  it(
    "AC-22: Disabled item view has no axe violations in light + dark",
    async () => {
      const { container } = render(
        <SidebarNav>
          <SidebarNavSection label="Sistema">
            <SidebarNavItem disabled>Indisponível</SidebarNavItem>
            <SidebarNavItem href="/link" disabled>
              Link off
            </SidebarNavItem>
          </SidebarNavSection>
        </SidebarNav>,
      );
      await axeInThemes(container);
    },
    AXE_TIMEOUT_MS,
  );
});

// ──────────────────────────────────────────────────────────────────
// Storybook contract sanity (AC-23)
// ──────────────────────────────────────────────────────────────────

describe("SidebarNav — Storybook contract", () => {
  it("AC-23: every documented story shape renders without error", () => {
    // Default
    const { unmount: u1 } = render(<BasicHarness />);
    u1();
    // Collapsed
    const { unmount: u2 } = render(<BasicHarness collapsed={true} />);
    u2();
    // WithActiveItem
    const { unmount: u3 } = render(<BasicHarness activeKey="inbox" />);
    u3();
    // WithBadges — already covered by BasicHarness "Inbox"
    // WithGroups
    const { unmount: u4 } = render(<GroupHarness defaultOpen={true} />);
    u4();
    // DenseRealistic — multiple sections + groups
    render(
      <SidebarNav>
        <SidebarNavSection label="Geral">
          <SidebarNavItem icon={<StubIcon name="home" />} active>
            Início
          </SidebarNavItem>
        </SidebarNavSection>
        <SidebarNavSection label="Operação">
          <SidebarNavGroup label="Contábil" icon={<StubIcon name="ledger" />}>
            <SidebarNavGroupTrigger />
            <SidebarNavGroupContent>
              <SidebarNavItem>Lançamentos</SidebarNavItem>
            </SidebarNavGroupContent>
          </SidebarNavGroup>
        </SidebarNavSection>
        <SidebarNavSection label="Sistema">
          <SidebarNavItem icon={<StubIcon name="cog" />}>Configurações</SidebarNavItem>
        </SidebarNavSection>
      </SidebarNav>,
    );
    expect(
      screen.getByRole("navigation", { name: /navegação principal/i }),
    ).toBeInTheDocument();
  });
});

