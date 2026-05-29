import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreditCard, Settings, Eye } from "lucide-react";

import { axeInThemes } from "@/test-utils/a11y";
import {
  Stepper,
  stepperMarkerVariants,
  type Step,
} from "./index";

/**
 * Tests for Plan #85 (parent Tech Task #84) — Stepper v0.1.0 DoD.
 *
 * Each `it(...)` carries `AC-N:` so that `lex-issue-driven` Rule 3
 * (bidirectional AC ↔ test traceability) passes at Gate 2. ACs come
 * from `docs/issues/issue-84/02-requirements.md`.
 */

// ──────────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────────

const fourSteps: Step[] = [
  { id: "1", title: "Conectar banco", description: "Itaú · Bradesco" },
  { id: "2", title: "Importar lançamentos" },
  { id: "3", title: "Configurar regras" },
  { id: "4", title: "Revisar" },
];

const iconedSteps: Step[] = [
  { id: "a", title: "Cartão", icon: CreditCard },
  { id: "b", title: "Regras", icon: Settings },
  { id: "c", title: "Auditar", icon: Eye },
];

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

// ──────────────────────────────────────────────────────────────────
// Public surface (AC-1, AC-2, AC-3)
// ──────────────────────────────────────────────────────────────────

describe("Stepper — public surface", () => {
  it("AC-2: exports Stepper component + stepperMarkerVariants CVA accessor", () => {
    expect(Stepper).toBeDefined();
    expect(stepperMarkerVariants).toBeDefined();
    expect(typeof stepperMarkerVariants).toBe("function");
  });

  it("AC-2: stepperMarkerVariants is callable with no args (defaults to pending/md)", () => {
    const cls = stepperMarkerVariants({});
    expect(cls).toContain("bg-card");
    expect(cls).toContain("border-border");
    expect(cls).toContain("text-fg-muted");
    expect(cls).toContain("size-6");
  });

  it("AC-3: Stepper.displayName === 'Stepper'", () => {
    expect(Stepper.displayName).toBe("Stepper");
  });
});

// ──────────────────────────────────────────────────────────────────
// Orientation (AC-4, AC-5)
// ──────────────────────────────────────────────────────────────────

describe("Stepper — orientation", () => {
  it("AC-4: orientation='horizontal' (default) lays out steps in a row", () => {
    const { container } = render(<Stepper steps={fourSteps} activeIndex={0} />);
    const ol = container.querySelector("ol");
    expect(ol).not.toBeNull();
    expect(ol!.className).toContain("flex");
    expect(ol!.className).toContain("items-start");
    // Horizontal: items get flex-1 so connectors space evenly
    const firstLi = ol!.querySelector("li");
    expect(firstLi!.className).toContain("flex-1");
  });

  it("AC-5: orientation='vertical' lays out steps in a column", () => {
    const { container } = render(
      <Stepper steps={fourSteps} activeIndex={0} orientation="vertical" />,
    );
    const ol = container.querySelector("ol");
    expect(ol!.className).toContain("flex-col");
    // Vertical: each non-last li has pb-4 spacing
    const firstLi = ol!.querySelector("li");
    expect(firstLi!.className).toContain("pb-4");
  });
});

// ──────────────────────────────────────────────────────────────────
// Variants (AC-6, AC-7, AC-8)
// ──────────────────────────────────────────────────────────────────

describe("Stepper — variants", () => {
  it("AC-6: variant='numbered' (default) renders i+1 inside marker", () => {
    render(<Stepper steps={fourSteps} activeIndex={0} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("AC-7: variant='iconed' renders step.icon inside marker", () => {
    const { container } = render(
      <Stepper steps={iconedSteps} activeIndex={0} variant="iconed" />,
    );
    // lucide-react renders <svg>. We expect 3 SVGs inside markers
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(3);
  });

  it("AC-7: variant='iconed' falls back to number when step.icon is missing", () => {
    const partial: Step[] = [
      { id: "x", title: "With icon", icon: CreditCard },
      { id: "y", title: "Without icon" }, // no icon → falls back
    ];
    render(<Stepper steps={partial} activeIndex={1} variant="iconed" />);
    // Step 1 is "complete" → shows Check (svg). Step 2 is "current" → falls
    // back to "2" because variant=iconed but no step.icon defined.
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("AC-8: variant='compact' omits body (no title/description rendered)", () => {
    render(
      <Stepper steps={fourSteps} activeIndex={0} variant="compact" />,
    );
    expect(screen.queryByText("Conectar banco")).not.toBeInTheDocument();
    expect(screen.queryByText("Itaú · Bradesco")).not.toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// Size (AC-9)
// ──────────────────────────────────────────────────────────────────

describe("Stepper — size", () => {
  it("AC-9: size='md' (default) yields size-6 markers", () => {
    const { container } = render(<Stepper steps={fourSteps} activeIndex={0} />);
    const marker = container.querySelector("li span");
    expect(marker!.className).toContain("size-6");
  });

  it("AC-9: size='sm' yields size-5 markers", () => {
    const { container } = render(
      <Stepper steps={fourSteps} activeIndex={0} size="sm" />,
    );
    const marker = container.querySelector("li span");
    expect(marker!.className).toContain("size-5");
  });
});

// ──────────────────────────────────────────────────────────────────
// States (AC-10..AC-15)
// ──────────────────────────────────────────────────────────────────

describe("Stepper — state derivation + visual contract", () => {
  it("AC-10: pending state — marker uses bg-card/border-border/text-fg-muted", () => {
    const { container } = render(
      <Stepper steps={fourSteps} activeIndex={0} />,
    );
    // 4 steps with activeIndex=0 → step 0 is current, 1..3 are pending
    const markers = container.querySelectorAll("li > div > span:first-child, li > button > span:first-child");
    // step at index 1 (pending)
    const pendingMarker = markers[1] as HTMLElement;
    expect(pendingMarker.className).toContain("bg-card");
    expect(pendingMarker.className).toContain("border-border");
    expect(pendingMarker.className).toContain("text-fg-muted");
  });

  it("AC-11: current state — marker uses bg-primary + ring; <li> has aria-current='step'", () => {
    const { container } = render(
      <Stepper steps={fourSteps} activeIndex={0} />,
    );
    const li = container.querySelector("li");
    expect(li!.getAttribute("aria-current")).toBe("step");
    const currentMarker = li!.querySelector("span");
    expect(currentMarker!.className).toContain("bg-primary");
    expect(currentMarker!.className).toContain("text-primary-foreground");
    expect(currentMarker!.className).toContain("ring-4");
    expect(currentMarker!.className).toContain("ring-primary/15");
  });

  it("AC-12: complete state — marker uses bg-primary with Check icon", () => {
    const { container } = render(
      <Stepper steps={fourSteps} activeIndex={2} />,
    );
    // Steps 0 and 1 are complete (index < activeIndex=2)
    const completeLi = container.querySelectorAll("li")[0]!;
    const completeMarker = completeLi.querySelector("span");
    expect(completeMarker!.className).toContain("bg-primary");
    expect(completeMarker!.className).toContain("text-primary-foreground");
    // Check icon (svg) rendered inside marker
    expect(completeMarker!.querySelector("svg")).not.toBeNull();
    // aria-current is NOT applied
    expect(completeLi.getAttribute("aria-current")).toBeNull();
  });

  it("AC-13: error state — marker uses bg-danger-soft/border-danger/text-danger + X icon; title in text-danger", () => {
    const errSteps: Step[] = [
      { id: "1", title: "Falhou aqui", state: "error" },
      { id: "2", title: "Próximo" },
    ];
    const { container } = render(<Stepper steps={errSteps} activeIndex={0} />);
    const errorLi = container.querySelector("li");
    const errorMarker = errorLi!.querySelector("span");
    expect(errorMarker!.className).toContain("bg-danger-soft");
    expect(errorMarker!.className).toContain("border-danger");
    expect(errorMarker!.className).toContain("text-danger");
    expect(errorMarker!.querySelector("svg")).not.toBeNull(); // X icon
    // Title gets text-danger
    const title = screen.getByText("Falhou aqui");
    expect(title.className).toContain("text-danger");
  });

  it("AC-14: loading state — marker shows role=status spinner; connector colored", () => {
    const loadingSteps: Step[] = [
      { id: "1", title: "Importando", state: "loading" },
      { id: "2", title: "Próximo" },
    ];
    render(<Stepper steps={loadingSteps} activeIndex={0} />);
    const status = screen.getByRole("status", { name: /carregando/i });
    expect(status).toBeInTheDocument();
    expect(status.className).toContain("animate-spin");
  });

  it("AC-15: activeIndex derives complete/current/pending when step.state is absent", () => {
    const { container } = render(
      <Stepper steps={fourSteps} activeIndex={2} />,
    );
    const lis = container.querySelectorAll("li");
    // Index 0, 1 → complete
    expect(lis[0]!.querySelector("span")!.className).toContain("bg-primary");
    expect(lis[1]!.querySelector("span")!.className).toContain("bg-primary");
    // Index 2 → current with aria-current
    expect(lis[2]!.getAttribute("aria-current")).toBe("step");
    // Index 3 → pending
    expect(lis[3]!.querySelector("span")!.className).toContain("bg-card");
  });

  it("AC-15: explicit step.state overrides activeIndex derivation", () => {
    const mixed: Step[] = [
      { id: "1", title: "Done" },
      { id: "2", title: "Override pending → error", state: "error" },
      { id: "3", title: "Still derived" },
    ];
    const { container } = render(<Stepper steps={mixed} activeIndex={1} />);
    // Index 1 would be current per activeIndex, but state="error" wins
    const li = container.querySelectorAll("li")[1]!;
    const marker = li.querySelector("span");
    expect(marker!.className).toContain("bg-danger-soft");
    expect(li.getAttribute("aria-current")).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────
// Interactivity (AC-16, AC-17, AC-18)
// ──────────────────────────────────────────────────────────────────

describe("Stepper — clickable behavior", () => {
  it("AC-16: onStepClick + state='current'|'complete'|'error' → renders <button> and fires callback", async () => {
    const handler = vi.fn();
    const user = userEvent.setup();
    const mix: Step[] = [
      { id: "a", title: "Done a" },
      { id: "b", title: "Done b" },
      { id: "c", title: "Current c" },
      { id: "d", title: "Pending d" },
    ];
    render(<Stepper steps={mix} activeIndex={2} onStepClick={handler} />);
    // 3 clickable buttons (2 complete + 1 current). Pending step is NOT.
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    await user.click(buttons[0]!);
    expect(handler).toHaveBeenCalledWith(0, mix[0]);
  });

  it("AC-17: onStepClick + state='pending' → NOT clickable (no <button>)", () => {
    const handler = vi.fn();
    render(
      <Stepper steps={fourSteps} activeIndex={0} onStepClick={handler} />,
    );
    // Only the first step is clickable (current). Pending steps stay non-button.
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(1);
  });

  it("AC-17: onStepClick + state='loading' → NOT clickable", () => {
    const handler = vi.fn();
    const loadingSteps: Step[] = [
      { id: "1", title: "Done" },
      { id: "2", title: "Loading", state: "loading" },
    ];
    render(<Stepper steps={loadingSteps} activeIndex={1} onStepClick={handler} />);
    // Step 1 (complete) is clickable; step 2 (loading) is not.
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(1);
  });

  it("AC-18: no onStepClick → no buttons rendered regardless of state", () => {
    render(<Stepper steps={fourSteps} activeIndex={2} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("AC-16: clicking error step also fires callback (error is clickable)", async () => {
    const handler = vi.fn();
    const user = userEvent.setup();
    const errSteps: Step[] = [
      { id: "1", title: "Falhou", state: "error" },
      { id: "2", title: "Ok", state: "current" },
    ];
    render(<Stepper steps={errSteps} activeIndex={0} onStepClick={handler} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    await user.click(buttons[0]!);
    expect(handler).toHaveBeenCalledWith(0, errSteps[0]);
  });
});

// ──────────────────────────────────────────────────────────────────
// Semantic tokens (AC-19)
// ──────────────────────────────────────────────────────────────────

describe("Stepper — token contract", () => {
  it("AC-19: marker variants contain no hex literals, oklch() values, or raw Tailwind palette names", () => {
    const states: Array<"pending" | "current" | "loading" | "complete" | "error"> = [
      "pending",
      "current",
      "loading",
      "complete",
      "error",
    ];
    for (const state of states) {
      const cls = stepperMarkerVariants({ state });
      expect(cls).not.toMatch(/#[0-9a-fA-F]{3,8}/);
      expect(cls).not.toMatch(/oklch\(/);
      // No raw Tailwind palette colors — only semantic tokens
      expect(cls).not.toMatch(/text-red-\d+/);
      expect(cls).not.toMatch(/bg-yellow-\d+/);
      expect(cls).not.toMatch(/bg-blue-\d+/);
      expect(cls).not.toMatch(/border-green-\d+/);
    }
  });
});

// ──────────────────────────────────────────────────────────────────
// jest-axe in light + dark themes (AC-20..AC-23)
// ──────────────────────────────────────────────────────────────────

describe("Stepper — a11y in light + dark", () => {
  const AXE_TIMEOUT_MS = 20_000;

  it(
    "AC-20: Horizontal Numbered (3 steps, activeIndex=1) has no axe violations in light + dark",
    async () => {
      const { container } = render(
        <Stepper
          steps={[
            { id: "1", title: "Conectar" },
            { id: "2", title: "Importar" },
            { id: "3", title: "Revisar" },
          ]}
          activeIndex={1}
        />,
      );
      await axeInThemes(container);
    },
    AXE_TIMEOUT_MS,
  );

  it(
    "AC-21: Vertical Iconed with loading step has no axe violations in light + dark",
    async () => {
      const { container } = render(
        <Stepper
          steps={[
            { id: "1", title: "Done", icon: CreditCard },
            { id: "2", title: "Working", icon: Settings, state: "loading" },
            { id: "3", title: "Next", icon: Eye },
          ]}
          orientation="vertical"
          variant="iconed"
        />,
      );
      await axeInThemes(container);
    },
    AXE_TIMEOUT_MS,
  );

  it(
    "AC-22: Horizontal with error step has no axe violations in light + dark",
    async () => {
      const { container } = render(
        <Stepper
          steps={[
            { id: "1", title: "Ok" },
            { id: "2", title: "Falhou", state: "error", description: "Tente novamente" },
            { id: "3", title: "Próximo" },
          ]}
          activeIndex={1}
        />,
      );
      await axeInThemes(container);
    },
    AXE_TIMEOUT_MS,
  );

  it(
    "AC-23: Horizontal Compact has no axe violations in light + dark",
    async () => {
      const { container } = render(
        <Stepper
          steps={fourSteps}
          activeIndex={1}
          variant="compact"
        />,
      );
      await axeInThemes(container);
    },
    AXE_TIMEOUT_MS,
  );
});
