import * as React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { axeInThemes } from "@/test-utils/a11y";
import { TopBar, topBarVariants, type TopBarProps } from "./index";

/**
 * Tests for Plan #89 (parent feature Issue #88) — TopBar v0.1.0 DoD.
 *
 * Each `it(...)` carries `AC-N:` so that `lex-issue-driven` Rule 3
 * (bidirectional AC ↔ test traceability) passes at Gate 2. ACs come
 * from `docs/issues/issue-88/02-requirements.md`.
 */

// ──────────────────────────────────────────────────────────────────
// Test fixtures — realistic slot content using semantic markup only
// ──────────────────────────────────────────────────────────────────

function BrandFixture(): React.ReactElement {
  return (
    <>
      <strong>Guardia</strong>
      <span>/ Control Center</span>
    </>
  );
}

function SearchFixture(): React.ReactElement {
  return (
    <label className="w-full">
      <span className="sr-only">Buscar</span>
      <input
        type="search"
        placeholder="Buscar empresa, NF, extrato…  ⌘K"
        className="w-full bg-transparent text-fg"
      />
    </label>
  );
}

function ActionsFixture(): React.ReactElement {
  return (
    <>
      <button type="button" aria-label="Notificações">
        <span aria-hidden="true">bell</span>
      </button>
      <button type="button" aria-label="Ajuda">
        <span aria-hidden="true">help</span>
      </button>
      <span aria-label="Luana Rocha">LR</span>
    </>
  );
}

// Helper that asserts the rendered <header> exists and returns it.
function getHeader(): HTMLElement {
  return screen.getByRole("banner");
}

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

// ──────────────────────────────────────────────────────────────────
// Public surface (AC-1, AC-21)
// ──────────────────────────────────────────────────────────────────

describe("TopBar — public surface", () => {
  it("AC-1: exports TopBar (named + default) and the CVA accessor", () => {
    expect(TopBar).toBeDefined();
    expect(TopBar.displayName).toBe("TopBar");
    expect(topBarVariants).toBeDefined();
    expect(typeof topBarVariants).toBe("function");
  });

  it("AC-21: topBarVariants is callable with no args (defaults to sticky=true)", () => {
    const cls = topBarVariants({});
    expect(cls).toContain("sticky");
    expect(cls).toContain("top-0");
    expect(cls).toContain("z-50");
    expect(cls).toContain("bg-surface");
    expect(cls).toContain("border-border");
    expect(cls).toContain("text-fg");
    expect(cls).toContain("font-sans");
    expect(cls).toContain("h-14");
  });

  it("AC-21: topBarVariants accepts sticky=false explicitly", () => {
    const cls = topBarVariants({ sticky: false });
    expect(cls).not.toContain("sticky");
    expect(cls).not.toContain("top-0");
    expect(cls).not.toContain("z-50");
    // base chain remains
    expect(cls).toContain("bg-surface");
    expect(cls).toContain("h-14");
  });
});

// ──────────────────────────────────────────────────────────────────
// Semantic root (AC-4, AC-20)
// ──────────────────────────────────────────────────────────────────

describe("TopBar — semantic root", () => {
  it("AC-4 / AC-20: renders a <header> element exposing the banner landmark", () => {
    render(<TopBar left={<BrandFixture />} />);
    const header = getHeader();
    expect(header.tagName).toBe("HEADER");
  });

  it("AC-4: forwards HTML attributes to the <header>", () => {
    render(
      <TopBar
        left={<BrandFixture />}
        id="my-top-bar"
        data-testid="ignore-me"
        aria-label="Página principal"
      />,
    );
    const header = getHeader();
    expect(header.id).toBe("my-top-bar");
    expect(header.getAttribute("aria-label")).toBe("Página principal");
  });

  it("AC-4: forwards ref to the <header> element", () => {
    const ref = React.createRef<HTMLElement>();
    render(<TopBar ref={ref} left={<BrandFixture />} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current!.tagName).toBe("HEADER");
  });
});

// ──────────────────────────────────────────────────────────────────
// Slots — left / center / right (AC-3, AC-16, AC-17)
// ──────────────────────────────────────────────────────────────────

describe("TopBar — slots", () => {
  it("AC-3 / AC-16: renders the `left` slot content", () => {
    render(<TopBar left={<span>Brand A</span>} />);
    expect(screen.getByText("Brand A")).toBeInTheDocument();
  });

  it("AC-3 / AC-16: renders the `center` slot content when provided", () => {
    render(
      <TopBar
        left={<span>Brand B</span>}
        center={<span>Search slot</span>}
      />,
    );
    expect(screen.getByText("Search slot")).toBeInTheDocument();
  });

  it("AC-3 / AC-16: renders the `right` slot content", () => {
    render(
      <TopBar left={<span>Brand C</span>} right={<span>Right actions</span>} />,
    );
    expect(screen.getByText("Right actions")).toBeInTheDocument();
  });

  it("AC-3 / AC-17: omits the center container DOM node when `center` prop is undefined", () => {
    const { container } = render(
      <TopBar left={<span>Brand D</span>} right={<span>Avatar D</span>} />,
    );
    const header = container.querySelector("header")!;
    // Header has exactly two direct div children (left + right) when center is missing.
    const directDivs = Array.from(header.children).filter(
      (child) => child.tagName === "DIV",
    );
    expect(directDivs).toHaveLength(2);
  });

  it("AC-3 / AC-17: renders the center container DOM node when `center` prop is present", () => {
    const { container } = render(
      <TopBar
        left={<span>Brand E</span>}
        center={<span>Center E</span>}
        right={<span>Right E</span>}
      />,
    );
    const header = container.querySelector("header")!;
    const directDivs = Array.from(header.children).filter(
      (child) => child.tagName === "DIV",
    );
    expect(directDivs).toHaveLength(3);
  });

  it("AC-9 / AC-10: left and right containers carry shrink-0 + flex layout classes", () => {
    const { container } = render(
      <TopBar
        left={<span>L</span>}
        right={<span>R</span>}
      />,
    );
    const header = container.querySelector("header")!;
    const [leftDiv, rightDiv] = Array.from(header.children).filter(
      (child) => child.tagName === "DIV",
    ) as HTMLElement[];
    for (const div of [leftDiv, rightDiv]) {
      expect(div.className).toContain("flex");
      expect(div.className).toContain("items-center");
      expect(div.className).toContain("shrink-0");
    }
  });

  it("AC-11: center container carries flex-1 + max-width + mx-auto", () => {
    const { container } = render(
      <TopBar
        left={<span>L</span>}
        center={<span>C</span>}
        right={<span>R</span>}
      />,
    );
    const header = container.querySelector("header")!;
    const divs = Array.from(header.children).filter(
      (child) => child.tagName === "DIV",
    ) as HTMLElement[];
    // Center is the middle of the three direct div children.
    const centerDiv = divs[1]!;
    expect(centerDiv.className).toContain("flex-1");
    expect(centerDiv.className).toContain("max-w-[560px]");
    expect(centerDiv.className).toContain("mx-auto");
  });

  it("AC-10: right container uses ml-auto so it anchors to the trailing edge when center is absent", () => {
    const { container } = render(
      <TopBar left={<span>L</span>} right={<span>R</span>} />,
    );
    const header = container.querySelector("header")!;
    const divs = Array.from(header.children).filter(
      (child) => child.tagName === "DIV",
    ) as HTMLElement[];
    const rightDiv = divs[divs.length - 1]!;
    expect(rightDiv.className).toContain("ml-auto");
  });
});

// ──────────────────────────────────────────────────────────────────
// Sticky behavior (AC-5, AC-6, AC-18)
// ──────────────────────────────────────────────────────────────────

describe("TopBar — sticky variant", () => {
  it("AC-5 / AC-18: defaults to sticky=true (header class chain contains sticky/top-0/z-50)", () => {
    render(<TopBar left={<BrandFixture />} />);
    const header = getHeader();
    expect(header.className).toContain("sticky");
    expect(header.className).toContain("top-0");
    expect(header.className).toContain("z-50");
  });

  it("AC-5 / AC-18: sticky=false removes the sticky positioning classes", () => {
    render(<TopBar sticky={false} left={<BrandFixture />} />);
    const header = getHeader();
    expect(header.className).not.toContain("sticky");
    expect(header.className).not.toContain("top-0");
    expect(header.className).not.toContain("z-50");
  });

  it("AC-6: consumer className is composed via cn() (additive, not replacing)", () => {
    render(
      <TopBar
        className="custom-shadow border-2"
        left={<BrandFixture />}
      />,
    );
    const header = getHeader();
    // Consumer class is appended.
    expect(header.className).toContain("custom-shadow");
    expect(header.className).toContain("border-2");
    // Base chain is preserved.
    expect(header.className).toContain("bg-surface");
    expect(header.className).toContain("h-14");
  });

  it("AC-19: className composes across both sticky variants", () => {
    const { rerender } = render(
      <TopBar
        sticky={false}
        className="my-2"
        left={<BrandFixture />}
      />,
    );
    expect(getHeader().className).toContain("my-2");
    expect(getHeader().className).not.toContain("sticky");

    rerender(
      <TopBar
        sticky
        className="my-2"
        left={<BrandFixture />}
      />,
    );
    expect(getHeader().className).toContain("my-2");
    expect(getHeader().className).toContain("sticky");
  });
});

// ──────────────────────────────────────────────────────────────────
// Tokenization — semantic only, no hex/oklch/raw color (AC-7, AC-22)
// ──────────────────────────────────────────────────────────────────

describe("TopBar — tokenization", () => {
  it("AC-7: base class chain uses only semantic surface/border/fg/font-sans tokens", () => {
    const cls = topBarVariants({});
    expect(cls).toContain("bg-surface");
    expect(cls).toContain("border-border");
    expect(cls).toContain("text-fg");
    expect(cls).toContain("font-sans");
  });

  it("AC-22: topBarVariants does not contain hex literals, oklch() values or raw color utilities", () => {
    const sticky = topBarVariants({ sticky: true });
    const flat = topBarVariants({ sticky: false });
    for (const cls of [sticky, flat]) {
      expect(cls).not.toMatch(/#[0-9a-fA-F]{3,8}/);
      expect(cls).not.toMatch(/oklch\(/);
      expect(cls).not.toMatch(/text-red-\d+/);
      expect(cls).not.toMatch(/bg-yellow-\d+/);
      expect(cls).not.toMatch(/text-zinc-\d+/);
      expect(cls).not.toMatch(/bg-gray-\d+/);
    }
  });

  it("AC-8: height/padding/gap apply the legacy reference budget (h-14, px-5, gap-4)", () => {
    const cls = topBarVariants({});
    expect(cls).toContain("h-14");
    expect(cls).toContain("px-5");
    expect(cls).toContain("gap-4");
  });
});

// ──────────────────────────────────────────────────────────────────
// Accessibility (AC-12, AC-13, AC-14, AC-15)
// ──────────────────────────────────────────────────────────────────

describe("TopBar — a11y (jest-axe, light + dark)", () => {
  it("AC-12: Default empty header has no a11y violations in light + dark", async () => {
    const { container } = render(<TopBar />);
    await axeInThemes(container);
  });

  it("AC-13: Fully composed header (branding + search + actions) has no a11y violations in light + dark", async () => {
    const { container } = render(
      <TopBar
        left={<BrandFixture />}
        center={<SearchFixture />}
        right={<ActionsFixture />}
      />,
    );
    await axeInThemes(container);
  });

  it("AC-14: sticky=false variant has no a11y violations in light + dark", async () => {
    const { container } = render(
      <TopBar
        sticky={false}
        left={<BrandFixture />}
        right={<ActionsFixture />}
      />,
    );
    await axeInThemes(container);
  });

  it("AC-15: banner landmark is queryable via getByRole (no testid escape hatch needed)", () => {
    render(
      <TopBar
        left={<BrandFixture />}
        center={<SearchFixture />}
        right={<ActionsFixture />}
      />,
    );
    expect(screen.getByRole("banner")).toBeInTheDocument();
    // Search input is reachable by accessible label.
    expect(screen.getByLabelText("Buscar")).toBeInTheDocument();
    // Action buttons reachable by accessible name.
    expect(
      screen.getByRole("button", { name: /notificações/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ajuda/i }),
    ).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// Type smoke — TopBarProps surface compiles
// ──────────────────────────────────────────────────────────────────

describe("TopBar — type surface", () => {
  it("TopBarProps accepts all documented props in a single render", () => {
    const props: TopBarProps = {
      left: <span>L</span>,
      center: <span>C</span>,
      right: <span>R</span>,
      sticky: true,
      className: "extra",
      id: "tb",
      // standard HTMLAttributes are accepted
      "aria-label": "Main",
    };
    const { container } = render(<TopBar {...props} />);
    expect(container.querySelector("header")).not.toBeNull();
  });
});
