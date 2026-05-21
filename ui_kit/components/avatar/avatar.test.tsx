import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarStatus,
  initials,
} from "./index";

describe("initials()", () => {
  it("returns '?' for empty or nullish input", () => {
    expect(initials("")).toBe("?");
    expect(initials(undefined)).toBe("?");
    expect(initials(null)).toBe("?");
    expect(initials("   ")).toBe("?");
  });

  it("returns the first two letters of a single name", () => {
    expect(initials("Fernando")).toBe("FE");
  });

  it("returns first+last initials for multi-part names", () => {
    expect(initials("Fernando Seguim")).toBe("FS");
    expect(initials("Ada King Lovelace")).toBe("AL");
  });

  it("is resilient to extra whitespace", () => {
    expect(initials("  Fernando   Seguim  ")).toBe("FS");
  });

  it("strips diacritics via NFD normalization", () => {
    expect(initials("Zoë")).toBe("ZO");
    expect(initials("João Gonçalves")).toBe("JG");
    expect(initials("Ñuñez")).toBe("NU");
    expect(initials("Ängström")).toBe("AN");
  });
});

describe("<Avatar />", () => {
  it("renders the default size (md) and shape (circle)", () => {
    const { container } = render(<Avatar data-testid="av" />);
    const root = container.querySelector("[data-testid='av']") as HTMLElement;
    expect(root).toHaveClass("size-9");
    expect(root).toHaveClass("rounded-full");
  });

  it("applies size variants", () => {
    const { container } = render(<Avatar size="xl" data-testid="av" />);
    expect(
      container.querySelector("[data-testid='av']"),
    ).toHaveClass("size-16");
  });

  it("applies the square shape", () => {
    const { container } = render(
      <Avatar shape="square" data-testid="av" />,
    );
    const el = container.querySelector("[data-testid='av']") as HTMLElement;
    expect(el).toHaveClass("rounded-md");
    expect(el).toHaveAttribute("data-shape", "square");
  });

  it("renders children (compound composition)", () => {
    render(
      <Avatar>
        <AvatarFallback>FS</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("FS")).toBeInTheDocument();
  });

  it("forwards the ref to the root element", () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<Avatar ref={ref} data-testid="av" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});

describe("<AvatarImage />", () => {
  it("renders an <img> with the given src and alt", () => {
    render(<AvatarImage src="/u.jpg" alt="User" />);
    const img = screen.getByAltText("User") as HTMLImageElement;
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toBe("/u.jpg");
  });

  it("defaults alt to empty string (decorative)", () => {
    const { container } = render(<AvatarImage src="/u.jpg" />);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("removes itself from the DOM when the image fails to load", () => {
    const { container } = render(
      <AvatarImage src="/broken.jpg" alt="User" />,
    );
    const img = container.querySelector("img")!;
    expect(img).toBeInTheDocument();
    fireEvent.error(img);
    // After error, AvatarImage returns null → fallback irmão aparece naturalmente.
    expect(container.querySelector("img")).toBeNull();
  });

  it("uncovers the fallback when the image breaks (integration)", () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/broken.jpg" alt="User" />
        <AvatarFallback>FS</AvatarFallback>
      </Avatar>,
    );
    // Inicialmente img + fallback co-existem
    expect(container.querySelector("img")).toBeInTheDocument();
    expect(screen.getByText("FS")).toBeInTheDocument();
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
    // Fallback continua visível
    expect(screen.getByText("FS")).toBeInTheDocument();
  });

  it("exposes the load status via data-status", () => {
    const { container } = render(<AvatarImage src="/u.jpg" />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("data-status", "idle");
    fireEvent.load(img);
    expect(img).toHaveAttribute("data-status", "loaded");
  });

  it("invokes user-supplied onError and onLoad handlers", () => {
    const onError = vi.fn();
    const onLoad = vi.fn();
    const { container, rerender } = render(
      <AvatarImage src="/u.jpg" onError={onError} onLoad={onLoad} />,
    );
    fireEvent.load(container.querySelector("img")!);
    expect(onLoad).toHaveBeenCalled();

    rerender(<AvatarImage src="/u.jpg" onError={onError} onLoad={onLoad} />);
    // Second render should start fresh; simulate an error on a new broken image
    const { container: c2 } = render(
      <AvatarImage src="/broken.jpg" onError={onError} onLoad={onLoad} />,
    );
    fireEvent.error(c2.querySelector("img")!);
    expect(onError).toHaveBeenCalled();
  });
});

describe("<AvatarFallback />", () => {
  it("applies the default (violet) color", () => {
    render(<AvatarFallback>FS</AvatarFallback>);
    expect(screen.getByText("FS")).toHaveClass("bg-guardia-violet-500");
  });

  it("applies each brand color token", () => {
    const colors = [
      "violet",
      "orange",
      "pink",
      "yellow",
      "green",
      "blue",
      "gray",
    ] as const;
    colors.forEach((c) => {
      const { unmount } = render(
        <AvatarFallback color={c} data-testid={`f-${c}`}>
          X
        </AvatarFallback>,
      );
      const el = screen.getByTestId(`f-${c}`);
      expect(el.className).toMatch(
        c === "green" || c === "blue"
          ? new RegExp(`bg-signal-${c}`)
          : new RegExp(`bg-guardia-${c}-500`),
      );
      unmount();
    });
  });
});

describe("<AvatarStatus />", () => {
  it("defaults to online with Portuguese aria-label", () => {
    render(<AvatarStatus />);
    const dot = screen.getByRole("status");
    expect(dot).toHaveAttribute("aria-label", "Online");
    expect(dot).toHaveClass("bg-signal-green");
  });

  it("maps each status to its color + default label", () => {
    const cases = [
      { status: "online", cls: "bg-signal-green", label: "Online" },
      { status: "offline", cls: "bg-guardia-gray-200", label: "Offline" },
      { status: "busy", cls: "bg-signal-red", label: "Ocupado" },
      { status: "away", cls: "bg-signal-yellow", label: "Ausente" },
    ] as const;
    cases.forEach(({ status, cls, label }) => {
      const { unmount } = render(
        <AvatarStatus status={status} data-testid={`st-${status}`} />,
      );
      const el = screen.getByTestId(`st-${status}`);
      expect(el).toHaveClass(cls);
      expect(el).toHaveAttribute("aria-label", label);
      unmount();
    });
  });

  it("allows a custom label", () => {
    render(<AvatarStatus status="busy" label="Em reunião" />);
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Em reunião",
    );
  });
});
