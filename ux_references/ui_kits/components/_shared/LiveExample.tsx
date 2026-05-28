/**
 * <LiveExample> — preview + código fonte lado a lado.
 * O código é uma função que recebe o estado atual e retorna uma string,
 * então muda em tempo real conforme o preview é interagido.
 *
 * Uso típico:
 *
 *   function Example() {
 *     const [open, setOpen] = React.useState(false);
 *     return (
 *       <LiveExample
 *         title="Exemplo de uso"
 *         file="index.tsx"
 *         code={`
 *           import Dialog from "ui_kits/components/Dialog";
 *
 *           function App() {
 *             const [open, setOpen] = useState(${open});
 *             return <Dialog open={open} onClose={() => setOpen(false)}>…</Dialog>;
 *           }
 *         `}
 *       >
 *         <button onClick={() => setOpen(true)}>Abrir</button>
 *         <Dialog open={open} onClose={() => setOpen(false)}>…</Dialog>
 *       </LiveExample>
 *     );
 *   }
 *
 * Depende do _shared/shared.css (classes .pg-example-*) e de window.__pgHighlight
 * (_shared/highlight.js) — ambos já carregados pelos playgrounds.
 */

interface LiveExampleProps {
  title?: string;
  file?: string;
  code: string;
  children: React.ReactNode;
  /** Flip no código para forçar re-highlight quando quiser. */
  codeKey?: string | number;
}

function LiveExample({ title = "Exemplo de uso", file = "index.tsx", code, children, codeKey }: LiveExampleProps) {
  const preRef = React.useRef<HTMLPreElement>(null);
  const trimmed = React.useMemo(() => {
    // Remove blank lines at top/bottom, outdent common leading whitespace.
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

  React.useEffect(() => {
    const el = preRef.current;
    if (!el) return;
    el.textContent = trimmed;
    delete el.dataset.highlighted;
    // @ts-ignore — highlight helper registrado em window por highlight.js
    if (typeof window.__pgHighlight === "function") window.__pgHighlight();
  }, [trimmed, codeKey]);

  return (
    <div className="pg-example">
      <div className="pg-example-hdr">
        <span className="t">{title}</span>
        <span className="h">{file}</span>
      </div>
      <div className="pg-example-body">
        <div className="pg-example-preview">{children}</div>
        <pre ref={preRef} className="pg-example-code" data-lang="tsx" />
      </div>
    </div>
  );
}

// @ts-ignore
window.LiveExample = LiveExample;
