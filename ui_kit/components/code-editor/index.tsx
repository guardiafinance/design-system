import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * CodeEditor — editor de código leve, baseado em <textarea>, com o mesmo
 * visual do CodeBlock (header, borda, cores, botão copy).
 *
 * Sem syntax highlighting em tempo real (para manter o bundle enxuto).
 * Para playgrounds com highlight, componha com um overlay externo ou
 * escolha um `<CodeMirror/>` dedicado.
 *
 * Recursos:
 *  - Tab insere indentação (configurável via `tabSize`)
 *  - Enter preserva a indentação da linha anterior
 *  - Controlled (`value` + `onChange`) ou uncontrolled (`defaultValue`)
 *  - Copy do valor atual
 *  - Line numbers opcionais
 */
export interface CodeEditorProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "defaultValue" | "onChange"
  > {
  /** Conteúdo controlado. */
  value?: string;
  /** Valor inicial no modo uncontrolled. */
  defaultValue?: string;
  /** Callback chamado com o conteúdo completo após cada edição. */
  onChange?: (code: string) => void;
  /** Linguagem exibida no header (ex: "tsx"). */
  language?: string;
  /** Nome de arquivo exibido no header. */
  filename?: string;
  /** Exibe o botão "copiar". Default: true. */
  copyable?: boolean;
  /** Exibe números de linha. Default: true. */
  showLineNumbers?: boolean;
  /** Número de espaços inseridos ao pressionar Tab. Default: 2. */
  tabSize?: number;
  /** Altura mínima do textarea (ex: "160px"). */
  minHeight?: string;
  /** Altura máxima antes de scrollar (ex: "420px"). */
  maxHeight?: string;
  /** Permite ou não redimensionar verticalmente via alça. */
  resize?: "none" | "vertical" | "both";
}

const CodeEditor = React.forwardRef<HTMLTextAreaElement, CodeEditorProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      language,
      filename,
      copyable = true,
      showLineNumbers = true,
      tabSize = 2,
      minHeight = "160px",
      maxHeight,
      resize = "vertical",
      className,
      readOnly,
      placeholder,
      spellCheck = false,
      id,
      ...props
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue ?? "");
    const currentValue = isControlled ? (value as string) : internal;

    const [copied, setCopied] = React.useState(false);
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null);
    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      },
      [ref],
    );

    const update = React.useCallback(
      (next: string) => {
        if (!isControlled) setInternal(next);
        onChange?.(next);
      },
      [isControlled, onChange],
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      update(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (readOnly) return;
      const ta = e.currentTarget;
      const { selectionStart: start, selectionEnd: end, value: v } = ta;
      const indent = " ".repeat(Math.max(tabSize, 0));

      // Tab → insere indent (ou desindenta com Shift)
      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          // dedent: remove até `tabSize` espaços no início da(s) linha(s) selecionada(s)
          const lineStart = v.lastIndexOf("\n", start - 1) + 1;
          const before = v.slice(0, lineStart);
          const after = v.slice(lineStart);
          const removed = Math.min(
            tabSize,
            after.length - after.replace(/^ +/, "").length,
          );
          if (removed > 0) {
            const next = before + after.slice(removed);
            update(next);
            requestAnimationFrame(() => {
              ta.selectionStart = ta.selectionEnd = Math.max(
                lineStart,
                start - removed,
              );
            });
          }
        } else {
          const next = v.slice(0, start) + indent + v.slice(end);
          update(next);
          requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = start + indent.length;
          });
        }
        return;
      }

      // Enter → preserva indentação da linha atual
      if (e.key === "Enter") {
        const lineStart = v.lastIndexOf("\n", start - 1) + 1;
        const currentLine = v.slice(lineStart, start);
        const leading = currentLine.match(/^ +/)?.[0] ?? "";
        if (leading.length > 0) {
          e.preventDefault();
          const next = v.slice(0, start) + "\n" + leading + v.slice(end);
          update(next);
          requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = start + 1 + leading.length;
          });
        }
      }
    };

    const handleCopy = React.useCallback(async () => {
      try {
        await navigator.clipboard.writeText(currentValue);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } catch {
        /* fail-safe */
      }
    }, [currentValue]);

    const hasHeader = Boolean(filename || language);
    const lineCount = Math.max(1, currentValue.split("\n").length);
    const gutterWidth = String(lineCount).length;

    return (
      <div
        className={cn(
          "group relative overflow-hidden rounded-md border border-border bg-[#1f092b] text-sm transition-colors dark:bg-[#17171b]",
          !readOnly && "focus-within:border-ring",
          readOnly && "opacity-90",
          className,
        )}
        data-language={language}
        data-readonly={readOnly || undefined}
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

        <div className="flex">
          {showLineNumbers && (
            <div
              aria-hidden="true"
              className="select-none py-4 pl-4 pr-3 text-right font-mono text-[12.5px] leading-relaxed text-white/30 tabular-nums"
              style={{ minWidth: `${gutterWidth + 1}ch` }}
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}

          <textarea
            ref={setRefs}
            id={id}
            value={isControlled ? currentValue : undefined}
            defaultValue={isControlled ? undefined : defaultValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            spellCheck={spellCheck}
            placeholder={placeholder}
            aria-label={props["aria-label"] ?? "Editor de código"}
            className={cn(
              "block w-full flex-1 bg-transparent px-4 py-4 font-mono text-[12.5px] leading-relaxed text-[#ede4f3] outline-none placeholder:text-white/30",
              !showLineNumbers && "pl-4",
              showLineNumbers && "pl-0",
            )}
            style={{
              minHeight,
              maxHeight,
              resize,
              tabSize,
            }}
            {...props}
          />
        </div>
      </div>
    );
  },
);
CodeEditor.displayName = "CodeEditor";

export { CodeEditor };
