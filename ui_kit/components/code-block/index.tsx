import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * CodeBlock — container para exibir código-fonte em documentação, tooltips
 * de dev-tools, páginas de suporte e afins.
 *
 * Não traz um highlighter embutido (manter o bundle enxuto). Dois modos:
 *  1. Texto puro  → passa só `code` e renderiza em <pre><code>.
 *  2. Pré-destacado → passa `highlightedHtml` (gerado no build via shiki,
 *     prism, etc.) e o HTML é injetado preservando cores.
 *
 * O botão "copiar" sempre copia o `code` original (nunca o HTML destacado).
 */
export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Código em texto puro. Usado para clipboard e fallback de render. */
  code: string;
  /** Identificador de linguagem — exibido no header (ex: "tsx", "bash"). */
  language?: string;
  /** Nome do arquivo exibido no header (ex: "Button.tsx"). */
  filename?: string;
  /** HTML pré-destacado; se informado, substitui o render padrão. */
  highlightedHtml?: string;
  /** Exibe o botão "copiar". Default: true. */
  copyable?: boolean;
  /** Altura máxima (com scroll). Ex: "420px". */
  maxHeight?: string;
  /** Exibe números de linha (apenas no modo texto puro). */
  showLineNumbers?: boolean;
}

const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      code,
      language,
      filename,
      highlightedHtml,
      copyable = true,
      maxHeight,
      showLineNumbers = false,
      className,
      ...props
    },
    ref,
  ) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = React.useCallback(async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } catch {
        /* fail-safe — clipboard pode estar indisponível em http:// */
      }
    }, [code]);

    const hasHeader = Boolean(filename || language);

    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-md border border-border bg-[#1f092b] text-sm dark:bg-[#17171b]",
          className,
        )}
        data-language={language}
        {...props}
      >
        {hasHeader && (
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs">
            <div className="flex items-center gap-2 text-white/70">
              {filename && (
                <span className="font-mono tabular-nums">{filename}</span>
              )}
              {filename && language && <span className="text-white/30">·</span>}
              {language && (
                <span className="rounded bg-white/5 px-2 py-0.5 font-mono uppercase tracking-wider text-white/60">
                  {language}
                </span>
              )}
            </div>
          </div>
        )}

        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Copiado" : "Copiar código"}
            className={cn(
              "absolute right-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-white/70 transition-colors",
              "hover:bg-white/10 hover:text-white",
              "focus-visible:outline-none focus-visible:bg-white/15 focus-visible:text-white",
              "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
              hasHeader ? "top-1.5" : "top-2",
            )}
            data-copied={copied || undefined}
          >
            {copied ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
          </button>
        )}

        {highlightedHtml ? (
          <div
            className="overflow-auto font-mono text-[12.5px] leading-relaxed text-[#dbd0e1] [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-4"
            style={maxHeight ? { maxHeight } : undefined}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre
            className="overflow-auto font-mono text-[12.5px] leading-relaxed text-[#dbd0e1]"
            style={maxHeight ? { maxHeight } : undefined}
          >
            <code className="block px-4 py-4">
              {showLineNumbers ? renderWithLineNumbers(code) : code}
            </code>
          </pre>
        )}
      </div>
    );
  },
);
CodeBlock.displayName = "CodeBlock";

function renderWithLineNumbers(code: string) {
  const lines = code.split("\n");
  const width = String(lines.length).length;
  return lines.map((line, i) => (
    <span key={i} className="table-row">
      <span className="table-cell select-none pr-4 text-right text-white/30 tabular-nums">
        {String(i + 1).padStart(width, " ")}
      </span>
      <span className="table-cell whitespace-pre">{line || " "}</span>
    </span>
  ));
}

export { CodeBlock };
