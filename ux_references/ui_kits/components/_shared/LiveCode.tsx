/**
 * <LiveCode> — editor de TSX com preview ao vivo.
 *
 * O usuário edita o TSX à direita e o preview à esquerda re-renderiza.
 * Props:
 *   - code: string com código TSX inicial. Deve terminar em uma expressão JSX
 *           OU conter `render(<Algo />)`. Qualquer componente referenciado precisa
 *           estar disponível no window global (Button, Switch, Icon, etc.).
 *   - scope: objeto extra injetado no escopo do código ({ myFoo: 42 })
 *
 * Uso:
 *   <LiveCode
 *     code={`
 *       function Demo() {
 *         const [n, setN] = React.useState(3);
 *         return <Button onClick={() => setN(n+1)}>Clicou {n}</Button>;
 *       }
 *       render(<Demo />);
 *     `}
 *   />
 */

interface LiveCodeProps {
  code: string;
  title?: string;
  file?: string;
  /** extra globals disponíveis no código */
  scope?: Record<string, unknown>;
  /** padding extra no preview */
  previewStyle?: React.CSSProperties;
}

function LiveCode({ code, title = "Exemplo editável", file = "index.tsx", scope = {}, previewStyle }: LiveCodeProps) {
  const initial = React.useMemo(() => {
    const lines = code.replace(/^\n+|\s+$/g, "").split("\n");
    let min = Infinity;
    for (const l of lines) {
      if (!l.trim()) continue;
      const m = l.match(/^[ \t]*/);
      if (m && m[0].length < min) min = m[0].length;
    }
    if (!isFinite(min) || min === 0) return lines.join("\n");
    return lines.map((l) => l.slice(min)).join("\n");
  }, [code]);

  const [source, setSource] = React.useState(initial);
  const [error, setError] = React.useState<string | null>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const rootRef = React.useRef<any>(null);
  const editorRef = React.useRef<HTMLPreElement>(null);
  const highlightRef = React.useRef<HTMLPreElement>(null);

  // Run the code
  React.useEffect(() => {
    if (!previewRef.current) return;
    try {
      // @ts-ignore
      const Babel = (window as any).Babel;
      if (!Babel) throw new Error("Babel não carregado");

      // Transpile TSX → JS
      const transformed = Babel.transform(source, {
        presets: [["typescript", { isTSX: true, allExtensions: true }], "react"],
        filename: "live.tsx",
      }).code;

      // Build scope: React, ReactDOM, all window globals the playgrounds export,
      // plus any custom scope + a `render` function that hydrates previewRef.
      const customRender = (el: React.ReactElement) => {
        if (!rootRef.current) {
          rootRef.current = ReactDOM.createRoot(previewRef.current!);
        }
        rootRef.current.render(el);
      };

      const globalKeys = Object.keys(window).filter(
        (k) => /^([A-Z][A-Za-z]+|use[A-Z][A-Za-z]+)$/.test(k) && typeof (window as any)[k] === "function",
      );
      const keys = ["React", "ReactDOM", "render", ...globalKeys, ...Object.keys(scope)];
      const vals = [
        React,
        ReactDOM,
        customRender,
        ...globalKeys.map((k) => (window as any)[k]),
        ...Object.values(scope),
      ];

      // Wrap so the last statement auto-renders if it is a JSX expression and
      // nobody called render() explicitly.
      const wrapped = `
        "use strict";
        let __didRender = false;
        const __origRender = render;
        render = (el) => { __didRender = true; __origRender(el); };
        try {
          ${transformed}
        } catch (e) { throw e; }
        if (!__didRender) {
          // Try to find a top-level function component named App or Demo or Example.
          if (typeof App !== "undefined") __origRender(React.createElement(App));
          else if (typeof Demo !== "undefined") __origRender(React.createElement(Demo));
          else if (typeof Example !== "undefined") __origRender(React.createElement(Example));
        }
      `;

      // eslint-disable-next-line no-new-func
      const fn = new Function(...keys, wrapped);
      fn(...vals);
      setError(null);
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }, [source]);

  // Sync syntax-highlighted <pre> with the editable <pre>
  React.useEffect(() => {
    if (!highlightRef.current) return;
    highlightRef.current.textContent = source;
    delete highlightRef.current.dataset.highlighted;
    // @ts-ignore
    if (typeof window.__pgHighlight === "function") window.__pgHighlight();
  }, [source]);

  const onInput = (e: React.FormEvent<HTMLPreElement>) => {
    const text = e.currentTarget.textContent || "";
    // Debounce
    setSource(text);
  };

  // Tab key → 2 spaces
  const onKeyDown = (e: React.KeyboardEvent<HTMLPreElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode("  "));
      range.collapse(false);
      sel.removeAllRanges(); sel.addRange(range);
      // force onInput
      const el = editorRef.current!;
      setSource(el.textContent || "");
    }
  };

  return (
    <div className={"pg-example" + (error ? " pg-example-err" : "")}>
      <div className="pg-example-hdr">
        <span className="t">{title}</span>
        <span className="h">
          {error ? <span style={{ color: "#FF7A7A" }}>● erro de sintaxe</span> : <>{file} · <em style={{ fontStyle: "normal", opacity: 0.7 }}>editável</em></>}
        </span>
      </div>
      <div className="pg-example-body">
        <div className="pg-example-preview" ref={previewRef} style={previewStyle} />
        <div className="pg-live-editor">
          <pre ref={highlightRef} className="pg-example-code pg-live-hl" data-lang="tsx" aria-hidden="true" />
          <pre
            ref={editorRef}
            className="pg-example-code pg-live-ed"
            contentEditable
            spellCheck={false}
            suppressContentEditableWarning
            onInput={onInput}
            onKeyDown={onKeyDown}
          >{initial}</pre>
        </div>
      </div>
      {error && <div className="pg-live-err">{error}</div>}
    </div>
  );
}

// @ts-ignore
window.LiveCode = LiveCode;
