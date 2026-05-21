import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "./index";

describe("<Button />", () => {
    it("renders its children", () => {
        render(<Button>Enviar</Button>);
        expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
    });

    it("applies the default variant classes", () => {
        render(<Button>ok</Button>);
        const btn = screen.getByRole("button");
        expect(btn.className).toMatch(/bg-primary/);
        expect(btn.className).toMatch(/h-10/);
    });

    it("applies the secondary (purple) variant", () => {
        render(<Button variant="secondary">Segundo</Button>);
        expect(screen.getByRole("button").className).toMatch(/bg-secondary/);
    });

    it("applies the destructive variant", () => {
        render(<Button variant="destructive">Deletar</Button>);
        expect(screen.getByRole("button").className).toMatch(/bg-destructive/);
    });

    it("respects the size prop", () => {
        render(<Button size="lg">Grande</Button>);
        expect(screen.getByRole("button").className).toMatch(/h-11/);
    });

    it("makes the button full width when `full` is true", () => {
        render(<Button full>Cheio</Button>);
        expect(screen.getByRole("button").className).toMatch(/w-full/);
    });

    it("fires onClick when enabled", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(<Button onClick={onClick}>click</Button>);
        await user.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it("does not fire onClick when disabled", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(
            <Button onClick={onClick} disabled>
                click
            </Button>,
        );
        await user.click(screen.getByRole("button"));
        expect(onClick).not.toHaveBeenCalled();
    });

    it("shows a spinner and disables the button when loading", () => {
        render(<Button loading>Enviando…</Button>);
        const btn = screen.getByRole("button");
        expect(btn).toBeDisabled();
        expect(btn).toHaveAttribute("data-loading", "true");
        // Spinner SVG is rendered
        expect(btn.querySelector("svg")).toBeInTheDocument();
    });

    it("spinner animates only when motion is not reduced", () => {
        render(<Button loading>Enviando…</Button>);
        const svg = screen.getByRole("button").querySelector("svg");
        // motion-safe:animate-spin → spinner pára em prefers-reduced-motion
        expect(svg?.className.baseVal).toMatch(/motion-safe:animate-spin/);
    });

    it("warns in dev when size='icon' lacks aria-label or aria-labelledby", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        render(
            <Button size="icon">
                <span>x</span>
            </Button>,
        );
        expect(warn).toHaveBeenCalledWith(
            expect.stringContaining("aria-label"),
        );
        warn.mockRestore();
    });

    it("does NOT warn when size='icon' has an aria-label", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        render(
            <Button size="icon" aria-label="Salvar">
                <span>x</span>
            </Button>,
        );
        expect(warn).not.toHaveBeenCalled();
        warn.mockRestore();
    });

    it("does not fire onClick while loading", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(
            <Button loading onClick={onClick}>
                go
            </Button>,
        );
        await user.click(screen.getByRole("button"));
        expect(onClick).not.toHaveBeenCalled();
    });

    it("renders leadingIcon and trailingIcon when not loading", () => {
        render(
            <Button
                leadingIcon={<span data-testid="lead">◂</span>}
                trailingIcon={<span data-testid="trail">▸</span>}
            >
                x
            </Button>,
        );
        expect(screen.getByTestId("lead")).toBeInTheDocument();
        expect(screen.getByTestId("trail")).toBeInTheDocument();
    });

    it("hides trailingIcon and swaps leadingIcon for spinner when loading", () => {
        render(
            <Button
                loading
                leadingIcon={<span data-testid="lead">◂</span>}
                trailingIcon={<span data-testid="trail">▸</span>}
            >
                x
            </Button>,
        );
        expect(screen.queryByTestId("lead")).not.toBeInTheDocument();
        expect(screen.queryByTestId("trail")).not.toBeInTheDocument();
    });

    it("renders as a child element via asChild", () => {
        render(
            <Button asChild>
                <a href="/home">home</a>
            </Button>,
        );
        const link = screen.getByRole("link", { name: "home" });
        expect(link).toBeInTheDocument();
        expect(link.className).toMatch(/bg-primary/);
    });
});
