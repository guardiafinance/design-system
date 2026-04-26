import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Skeleton } from "./index";

describe("Skeleton", () => {
  it("renderiza como span por default", () => {
    const { container } = render(<Skeleton data-testid="sk" />);
    const el = container.querySelector("[data-testid='sk']");
    expect(el?.tagName).toBe("SPAN");
  });

  it("aplica classe da variante text por default", () => {
    const { container } = render(<Skeleton data-testid="sk" />);
    const el = container.querySelector("[data-testid='sk']") as HTMLElement;
    expect(el.className).toMatch(/h-3\.5/);
  });

  it("aceita variant=title com altura maior", () => {
    const { container } = render(
      <Skeleton variant="title" data-testid="sk" />,
    );
    const el = container.querySelector("[data-testid='sk']") as HTMLElement;
    expect(el.className).toMatch(/h-\[22px\]/);
  });

  it("aceita variant=rect", () => {
    const { container } = render(
      <Skeleton variant="rect" data-testid="sk" />,
    );
    const el = container.querySelector("[data-testid='sk']") as HTMLElement;
    expect(el.className).toMatch(/h-20/);
  });

  it("aceita variant=circle (rounded-full)", () => {
    const { container } = render(
      <Skeleton variant="circle" data-testid="sk" />,
    );
    const el = container.querySelector("[data-testid='sk']") as HTMLElement;
    expect(el.className).toMatch(/rounded-full/);
  });

  it("aplica width/height inline via style", () => {
    const { container } = render(
      <Skeleton width={240} height={16} data-testid="sk" />,
    );
    const el = container.querySelector("[data-testid='sk']") as HTMLElement;
    expect(el.style.width).toBe("240px");
    expect(el.style.height).toBe("16px");
  });

  it("aceita width/height como string", () => {
    const { container } = render(
      <Skeleton width="80%" height="2rem" data-testid="sk" />,
    );
    const el = container.querySelector("[data-testid='sk']") as HTMLElement;
    expect(el.style.width).toBe("80%");
    expect(el.style.height).toBe("2rem");
  });

  it("aria-hidden=true por default (decorativo)", () => {
    const { container } = render(<Skeleton data-testid="sk" />);
    const el = container.querySelector("[data-testid='sk']");
    expect(el).toHaveAttribute("aria-hidden", "true");
  });

  it("permite override de aria-hidden quando consumidor precisa anunciar", () => {
    const { container } = render(
      <Skeleton aria-hidden={false} data-testid="sk" />,
    );
    const el = container.querySelector("[data-testid='sk']");
    expect(el).toHaveAttribute("aria-hidden", "false");
  });

  it("lines=3 com text gera 3 placeholders + container", () => {
    const { container } = render(
      <Skeleton variant="text" lines={3} data-testid="sk" />,
    );
    const wrapper = container.querySelector("[data-testid='sk']");
    expect(wrapper?.children.length).toBe(3);
  });

  it("lines>1: a última linha fica em 70% (param default)", () => {
    const { container } = render(
      <Skeleton variant="text" lines={3} data-testid="sk" />,
    );
    const wrapper = container.querySelector(
      "[data-testid='sk']",
    ) as HTMLElement;
    const last = wrapper.children[2] as HTMLElement;
    expect(last.style.width).toBe("70%");
  });

  it("lines>1: linhas anteriores ocupam 100%", () => {
    const { container } = render(
      <Skeleton variant="text" lines={3} data-testid="sk" />,
    );
    const wrapper = container.querySelector(
      "[data-testid='sk']",
    ) as HTMLElement;
    const first = wrapper.children[0] as HTMLElement;
    expect(first.style.width).toBe("100%");
  });

  it("respeita className customizado", () => {
    const { container } = render(
      <Skeleton className="my-extra" data-testid="sk" />,
    );
    const el = container.querySelector("[data-testid='sk']");
    expect(el).toHaveClass("my-extra");
  });

  it("aplica skeleton-shimmer-bg + animation utility", () => {
    const { container } = render(<Skeleton data-testid="sk" />);
    const el = container.querySelector("[data-testid='sk']") as HTMLElement;
    expect(el.className).toMatch(/skeleton-shimmer-bg/);
    expect(el.className).toMatch(/animate-\[skeleton-shimmer/);
  });

  it("não renderiza wrapper extra quando lines=1", () => {
    render(<Skeleton variant="text" lines={1} data-testid="sk" />);
    const el = screen.getByTestId("sk");
    expect(el.children.length).toBe(0);
  });
});
