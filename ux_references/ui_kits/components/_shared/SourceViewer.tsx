/**
 * <SourceViewer> — mostra o código-fonte (index.tsx + index.css) do próprio
 * componente. Busca os arquivos relativos à pasta do playground (./index.tsx e
 * ./index.css) via fetch. Tabs simples entre os dois; bloco de código usa o
 * mesmo highlighter dos exemplos (window.__pgHighlight).
 *
 * Uso:
 *   <SourceViewer files={["index.tsx","index.css"]} />
 *
 * Depende de _shared/highlight.js já estar carregado.
 */

interface SourceViewerProps {
  files?: string[];
  /** Diretório base; default "./" (relativo ao playground HTML) */
  base?: string;
}

function SourceViewer({ files = ["index.tsx", "index.css"], base = "./" }: SourceViewerProps) {
  const [active, setActive] = React.useState(files[0]);
  const [sources, setSources] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const preRef = React.useRef<HTMLPreElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const f of files) {
        try {
          const res = await fetch(base + f);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const text = await res.text();
          if (!cancelled) setSources((s) => ({ ...s, [f]: text }));
        } catch (e: any) {
          if (!cancelled) setErrors((er) => ({ ...er, [f]: e?.message || "erro" }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [files.join("|"), base]);

  React.useEffect(() => {
    const el = preRef.current;
    if (!el) return;
    el.textContent = sources[active] || (errors[active] ? `// ${errors[active]}` : "// carregando...");
    el.dataset.lang = active.endsWith(".css") ? "css" : "tsx";
    delete el.dataset.highlighted;
    // @ts-ignore
    if (typeof window.__pgHighlight === "function") window.__pgHighlight();
  }, [active, sources, errors]);

  const lines = (sources[active] || "").split("\n").length;

  return (
    <div className="pg-example">
      <div className="pg-example-hdr">
        <span className="t">Código fonte</span>
        <span className="sv-tabs">
          <span className="sv-tabs-seg">
            {files.map((f) => (
              <button
                key={f}
                type="button"
                className={"sv-tab" + (f === active ? " is-active" : "")}
                onClick={() => setActive(f)}
              >
                {f}
              </button>
            ))}
          </span>
          {lines > 0 && <span className="sv-meta">{lines} linhas</span>}
        </span>
      </div>
      <div className="pg-example-body">
        <pre ref={preRef} className="pg-example-code" data-lang="tsx" />
      </div>
    </div>
  );
}

// @ts-ignore
window.SourceViewer = SourceViewer;
