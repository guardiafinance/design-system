import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { CodeEditor } from "./index";

describe("<CodeEditor />", () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
  });

  it("renders an editable textarea", () => {
    render(<CodeEditor defaultValue="hello" />);
    const ta = screen.getByLabelText(/editor de c\u00f3digo/i);
    expect(ta).toBeInTheDocument();
    expect(ta).toHaveValue("hello");
  });

  it("supports controlled value via props", () => {
    const onChange = vi.fn();
    render(<CodeEditor value="abc" onChange={onChange} />);
    const ta = screen.getByLabelText(/editor de c\u00f3digo/i) as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: "abcd" } });
    expect(onChange).toHaveBeenCalledWith("abcd");
  });

  it("emits uncontrolled onChange while typing", () => {
    const onChange = vi.fn();
    render(<CodeEditor defaultValue="" onChange={onChange} />);
    const ta = screen.getByLabelText(/editor de c\u00f3digo/i) as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: "new" } });
    expect(onChange).toHaveBeenCalledWith("new");
    expect(ta).toHaveValue("new");
  });

  it("renders filename and language in the header", () => {
    render(<CodeEditor defaultValue="" filename="App.tsx" language="tsx" />);
    expect(screen.getByText("App.tsx")).toBeInTheDocument();
    expect(screen.getByText("tsx")).toBeInTheDocument();
  });

  it("hides the copy button when copyable=false", () => {
    render(<CodeEditor defaultValue="" copyable={false} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("copies the current value (not the initial one)", async () => {
    render(<CodeEditor defaultValue="initial" />);
    const ta = screen.getByLabelText(/editor de c\u00f3digo/i) as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: "changed" } });
    fireEvent.click(screen.getByRole("button", { name: /copiar/i }));
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith("changed"));
  });

  it("renders line numbers by default", () => {
    render(<CodeEditor defaultValue={"a\nb\nc"} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("hides line numbers when showLineNumbers=false", () => {
    render(<CodeEditor defaultValue={"a\nb"} showLineNumbers={false} />);
    expect(screen.queryByText("1")).toBeNull();
  });

  it("inserts tabSize spaces on Tab", () => {
    const onChange = vi.fn();
    render(<CodeEditor defaultValue="foo" onChange={onChange} tabSize={2} />);
    const ta = screen.getByLabelText(/editor de c\u00f3digo/i) as HTMLTextAreaElement;
    ta.focus();
    ta.setSelectionRange(0, 0);
    fireEvent.keyDown(ta, { key: "Tab" });
    expect(onChange).toHaveBeenLastCalledWith("  foo");
  });

  it("preserves indentation on Enter", () => {
    const onChange = vi.fn();
    render(<CodeEditor defaultValue="  foo" onChange={onChange} />);
    const ta = screen.getByLabelText(/editor de c\u00f3digo/i) as HTMLTextAreaElement;
    ta.focus();
    ta.setSelectionRange(5, 5);
    fireEvent.keyDown(ta, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith("  foo\n  ");
  });

  it("blocks edits when readOnly", () => {
    const onChange = vi.fn();
    render(
      <CodeEditor defaultValue="x" readOnly onChange={onChange} />,
    );
    const ta = screen.getByLabelText(/editor de c\u00f3digo/i) as HTMLTextAreaElement;
    expect(ta).toHaveAttribute("readonly");
    ta.focus();
    ta.setSelectionRange(1, 1);
    fireEvent.keyDown(ta, { key: "Tab" });
    // Tab handler must no-op under readOnly
    expect(onChange).not.toHaveBeenCalled();
  });

  it("forwards the ref to the textarea", () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<CodeEditor ref={ref} defaultValue="hi" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    expect(ref.current?.value).toBe("hi");
  });

  it("exposes language via data-language and readOnly via data-readonly", () => {
    const { container } = render(
      <CodeEditor defaultValue="" language="ts" readOnly />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-language", "ts");
    expect(root).toHaveAttribute("data-readonly", "true");
  });
});
