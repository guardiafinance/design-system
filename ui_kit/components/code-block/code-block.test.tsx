import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { CodeBlock } from "./index";

const sample = `export function hello() {\n  return "ok";\n}`;

describe("<CodeBlock />", () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
  });

  it("renders the code as-is when no highlightedHtml is provided", () => {
    render(<CodeBlock code={sample} />);
    expect(screen.getByText(/export function hello/)).toBeInTheDocument();
  });

  it("renders filename and language in the header", () => {
    render(<CodeBlock code={sample} filename="hello.ts" language="ts" />);
    expect(screen.getByText("hello.ts")).toBeInTheDocument();
    expect(screen.getByText("ts")).toBeInTheDocument();
  });

  it("omits the header when neither filename nor language are given", () => {
    render(<CodeBlock code={sample} />);
    // without header, no filename text node exists
    expect(screen.queryByText(/\.ts|\.tsx|\.json/)).toBeNull();
  });

  it("copies the original code when the copy button is clicked", async () => {
    render(<CodeBlock code={sample} />);
    fireEvent.click(screen.getByRole("button", { name: /copiar/i }));
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith(sample));
  });

  it("flips the copy button to a 'Copiado' state after click", async () => {
    render(<CodeBlock code={sample} />);
    fireEvent.click(screen.getByRole("button", { name: /copiar/i }));
    expect(
      await screen.findByRole("button", { name: /copiado/i }),
    ).toBeInTheDocument();
  });

  it("hides the copy button when copyable is false", () => {
    render(<CodeBlock code={sample} copyable={false} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders highlighted HTML when provided instead of raw code", () => {
    const html = `<pre><span class="tok">ok</span></pre>`;
    const { container } = render(
      <CodeBlock code={sample} highlightedHtml={html} />,
    );
    expect(container.querySelector(".tok")?.textContent).toBe("ok");
  });

  it("copies the original source even when highlightedHtml is used", async () => {
    render(<CodeBlock code={sample} highlightedHtml="<pre>x</pre>" />);
    fireEvent.click(screen.getByRole("button", { name: /copiar/i }));
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith(sample));
  });

  it("renders line numbers when showLineNumbers is true", () => {
    render(<CodeBlock code={sample} showLineNumbers />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("applies maxHeight when provided", () => {
    const { container } = render(<CodeBlock code={sample} maxHeight="200px" />);
    const scroller = container.querySelector<HTMLElement>("pre");
    expect(scroller?.style.maxHeight).toBe("200px");
  });

  it("exposes the language via data-language", () => {
    const { container } = render(<CodeBlock code={sample} language="tsx" />);
    expect(container.firstElementChild).toHaveAttribute("data-language", "tsx");
  });

  it("forwards the ref to the root element", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<CodeBlock ref={ref} code={sample} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
