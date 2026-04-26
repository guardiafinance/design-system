"use client";

import * as React from "react";
import {
  CheckCircle2,
  CloudUpload,
  File as FileIcon,
  Paperclip,
  XCircle,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * FileUpload — dropzone com click-to-select e drag-and-drop, lista de
 * arquivos com status (uploading / done / error) e barra de progresso.
 *
 * MODOS DE OPERAÇÃO
 *
 *   1. Auto-upload (NOVO)
 *      Passe `uploadUrl` OU `uploader`. O componente:
 *        - mantém o estado dos arquivos internamente
 *        - faz a validação client-side (accept + maxSize)
 *        - dispara o upload e atualiza `progress` sozinho conforme o
 *          XHR/fetch progride
 *        - marca status="done"/"error" automaticamente
 *        - cancela uploads em andamento quando o usuário remove
 *
 *   2. Controlled (mantido)
 *      Passe `files` + `onFiles`. O consumer gerencia estado e XHR.
 *      A validação ainda acontece — `onFiles` recebe só os aceitos,
 *      e `onReject` recebe os rejeitados.
 *
 * VALIDAÇÃO (em ambos os modos)
 *   - `accept`     parseado como CSV: extensões (".pdf"), MIME exatos
 *                  ("image/png") ou wildcards ("image/*"). Aplicado
 *                  inclusive em drag-and-drop, que o navegador ignora
 *                  nativamente.
 *   - `maxSize`    bytes. Arquivos maiores são rejeitados com motivo
 *                  "size".
 *   - `validate`   função custom (file) => string | null. Retorne a
 *                  mensagem de erro ou null se válido.
 *
 * Acessibilidade:
 *   - input file real focável (sr-only, NÃO pointer-events:none) —
 *     Enter/Space abrem o file picker nativo
 *   - aria-describedby liga o hint ao input
 *   - progressbar tem role + aria-valuenow/min/max + aria-label
 *   - botão de remover tem aria-label específico ao arquivo
 */

export type UploadFileStatus = "uploading" | "done" | "error";

export interface UploadFile {
  name: string;
  size: number;
  status?: UploadFileStatus;
  /** 0..100 quando status="uploading" */
  progress?: number;
  /** Mensagem de erro quando status="error" */
  error?: string;
}

export type FileRejectionReason = "size" | "type" | "custom";

export interface FileRejection {
  file: File;
  reason: FileRejectionReason;
  message: string;
}

export interface FileUploaderArgs {
  file: File;
  onProgress: (percent: number) => void;
  signal: AbortSignal;
}

export type FileUploader = (args: FileUploaderArgs) => Promise<void>;

export interface FileUploadProps {
  /** Filtro de tipos. Aceita extensões (".pdf"), MIME exatos ("application/pdf") ou wildcards ("image/*"), separados por vírgula. Validado também em drag-and-drop. */
  accept?: string;
  multiple?: boolean;
  /** Limite máximo em bytes. Arquivos maiores são rejeitados. */
  maxSize?: number;
  /** Validação custom. Retorne string com a msg de erro ou null se válido. */
  validate?: (file: File) => string | null;

  hint?: string;
  /** Sobrescreve o título do dropzone. */
  title?: React.ReactNode;
  /** Sobrescreve o link do título ("clique para escolher"). */
  linkLabel?: React.ReactNode;

  /** [Auto-upload] URL para POST com FormData (campo "file"). */
  uploadUrl?: string;
  /** [Auto-upload] Função custom que retorna Promise. Recebe `onProgress` (0..100) e `signal` (AbortController). */
  uploader?: FileUploader;
  /** Disparado quando um upload (auto-mode) termina com sucesso. */
  onUploadSuccess?: (file: File) => void;
  /** Disparado quando um upload (auto-mode) falha. Receba também a mensagem que será mostrada inline. */
  onUploadError?: (file: File, error: Error) => void;

  /** [Controlled] Lista controlada de arquivos. Quando passada, ignora estado interno. */
  files?: UploadFile[];
  /** Disparado com os arquivos APROVADOS na validação. */
  onFiles?: (files: File[]) => void;
  /** Disparado com os arquivos REPROVADOS. Quando ausente, rejeitados aparecem na lista interna como erro. */
  onReject?: (rejections: FileRejection[]) => void;
  /** Renderiza X em cada item; recebe o índice do arquivo. */
  onRemove?: (index: number) => void;

  disabled?: boolean;
  compact?: boolean;
  className?: string;
  id?: string;
  name?: string;

  /** Forma do trigger.
   * - "dropzone" (default): área grande com drag-and-drop
   * - "button": botão minimalista (sem drop). Útil em forms inline,
   *   células de tabela e qualquer lugar onde a dropzone é demais.
   */
  variant?: "dropzone" | "button";
  /** Texto do botão (apenas em variant="button"). Default gerado a partir de `multiple`. */
  buttonLabel?: React.ReactNode;
  /** Ícone à esquerda do botão (apenas em variant="button"). Default: Paperclip. */
  buttonIcon?: React.ReactNode;
  /** Tamanho do botão (apenas em variant="button"). Default "md". */
  buttonSize?: "sm" | "md" | "lg";
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Casa o arquivo contra o atributo `accept`. Ex.:
 *   accept="image/*,.pdf"  →  PNG ✓ · JPG ✓ · PDF ✓ · DOCX ✗
 */
export function isAccepted(file: File, accept?: string): boolean {
  if (!accept) return true;
  const tokens = accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;

  const fileExt = "." + (file.name.split(".").pop() ?? "").toLowerCase();
  const fileMime = (file.type || "").toLowerCase();

  return tokens.some((token) => {
    if (token.startsWith(".")) return token === fileExt;
    if (token.endsWith("/*")) {
      const prefix = token.slice(0, -1); // "image/"
      return fileMime.startsWith(prefix);
    }
    return token === fileMime;
  });
}

interface ValidateOptions {
  accept?: string;
  maxSize?: number;
  validate?: (file: File) => string | null;
}

function validateFile(
  file: File,
  opts: ValidateOptions,
): { ok: true } | { ok: false; reason: FileRejectionReason; message: string } {
  if (opts.accept && !isAccepted(file, opts.accept)) {
    return {
      ok: false,
      reason: "type",
      message: "Tipo de arquivo não permitido",
    };
  }
  if (opts.maxSize !== undefined && file.size > opts.maxSize) {
    return {
      ok: false,
      reason: "size",
      message: `Tamanho máximo: ${formatBytes(opts.maxSize)}`,
    };
  }
  if (opts.validate) {
    const customMsg = opts.validate(file);
    if (customMsg) {
      return { ok: false, reason: "custom", message: customMsg };
    }
  }
  return { ok: true };
}

/* Default uploader baseado em XHR (suporta progress events). */
function makeXhrUploader(url: string): FileUploader {
  return ({ file, onProgress, signal }) =>
    new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload falhou (HTTP ${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error("Erro de rede ao enviar o arquivo"));
      xhr.onabort = () => reject(new Error("Upload cancelado"));

      const onAbort = () => xhr.abort();
      signal.addEventListener("abort", onAbort);

      const formData = new FormData();
      formData.append("file", file);
      xhr.send(formData);
    });
}

/* Estado interno usado em modo auto-upload. */
interface InternalFile extends UploadFile {
  id: string;
  abort?: AbortController;
  /** Referência ao File original — necessária para retry/futuro uso. */
  rawFile?: File;
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      accept,
      multiple = false,
      maxSize,
      validate,
      hint,
      title,
      linkLabel = "clique para escolher",

      uploadUrl,
      uploader,
      onUploadSuccess,
      onUploadError,

      files: filesProp,
      onFiles,
      onReject,
      onRemove,

      disabled = false,
      compact = false,
      className,
      id,
      name,

      variant = "dropzone",
      buttonLabel,
      buttonIcon,
      buttonSize = "md",
    },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const hintId = `${inputId}-hint`;

    /* Ref interno para o input file. O ref forwarded também aponta pra ele
     * via mergeRefs — assim consumidores conseguem chamar .click() ou .focus()
     * de fora, e o botão consegue acionar o picker programaticamente. */
    const internalInputRef = React.useRef<HTMLInputElement>(null);
    const setInputRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        internalInputRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLInputElement | null>).current =
            node;
      },
      [ref],
    );

    const [drag, setDrag] = React.useState(false);

    /* Modo auto-upload ativa quando uploadUrl OU uploader é passado E não há files controlled. */
    const isAutoMode =
      filesProp === undefined && (Boolean(uploadUrl) || Boolean(uploader));

    /* Estado interno (apenas quando auto-mode OU quando o consumer não passa files
     * mas usamos a lista interna para mostrar rejeições). */
    const [internalFiles, setInternalFiles] = React.useState<InternalFile[]>([]);
    const idCounter = React.useRef(0);
    const nextId = () => `f-${++idCounter.current}`;

    const showInternalList =
      filesProp === undefined && (isAutoMode || internalFiles.length > 0);

    const visibleFiles: UploadFile[] = filesProp ?? internalFiles;

    /* Resolve qual uploader usar */
    const effectiveUploader = React.useMemo<FileUploader | undefined>(() => {
      if (uploader) return uploader;
      if (uploadUrl) return makeXhrUploader(uploadUrl);
      return undefined;
    }, [uploader, uploadUrl]);

    function startUpload(internal: InternalFile, file: File) {
      if (!effectiveUploader) return;
      const ac = new AbortController();
      internal.abort = ac;

      effectiveUploader({
        file,
        signal: ac.signal,
        onProgress: (pct) => {
          /* Não atualiza progress se já abortou — evita race com onProgress
           * que dispara depois da chamada de abort */
          if (ac.signal.aborted) return;
          setInternalFiles((prev) =>
            prev.map((it) =>
              it.id === internal.id ? { ...it, progress: pct } : it,
            ),
          );
        },
      })
        .then(() => {
          /* Se o usuário cancelou, o cancelUpload já setou status=error.
           * Não sobrescreva com "done". */
          if (ac.signal.aborted) return;
          setInternalFiles((prev) =>
            prev.map((it) =>
              it.id === internal.id
                ? { ...it, status: "done", progress: 100 }
                : it,
            ),
          );
          onUploadSuccess?.(file);
        })
        .catch((err: Error) => {
          /* Cancelamento já foi tratado em cancelUpload — não sobrescreva. */
          if (ac.signal.aborted) return;
          setInternalFiles((prev) =>
            prev.map((it) =>
              it.id === internal.id
                ? { ...it, status: "error", error: err.message }
                : it,
            ),
          );
          onUploadError?.(file, err);
        });
    }

    /** Cancela um upload em andamento: aborta + marca como erro com mensagem
     *  "Envio cancelado". Mantém o item visível na lista (usuário decide se
     *  remove ou tenta de novo). */
    function cancelUpload(internalIndex: number) {
      const target = internalFiles[internalIndex];
      if (!target || target.status !== "uploading") return;
      target.abort?.abort();
      setInternalFiles((prev) =>
        prev.map((it, i) =>
          i === internalIndex
            ? { ...it, status: "error", error: "Envio cancelado" }
            : it,
        ),
      );
    }

    function handleFiles(fl: FileList | null) {
      if (!fl || fl.length === 0) return;
      const arr = Array.from(fl);

      const accepted: File[] = [];
      const rejections: FileRejection[] = [];

      for (const f of arr) {
        const result = validateFile(f, { accept, maxSize, validate });
        if (result.ok) accepted.push(f);
        else
          rejections.push({
            file: f,
            reason: result.reason,
            message: result.message,
          });
      }

      /* Notifica callbacks */
      if (accepted.length > 0) onFiles?.(accepted);
      if (rejections.length > 0) onReject?.(rejections);

      /* Auto-mode: adiciona aceitos como uploading, rejeitados como error */
      if (filesProp === undefined) {
        const newAccepted: InternalFile[] = accepted.map((file) => ({
          id: nextId(),
          name: file.name,
          size: file.size,
          status: isAutoMode ? "uploading" : "done",
          progress: isAutoMode ? 0 : undefined,
          rawFile: file,
        }));

        /* Rejeições só vão pra lista interna se o consumer NÃO definiu onReject
         * (caso contrário ele já recebeu o callback e mostra do jeito dele) */
        const newRejected: InternalFile[] = onReject
          ? []
          : rejections.map((r) => ({
              id: nextId(),
              name: r.file.name,
              size: r.file.size,
              status: "error",
              error: r.message,
            }));

        setInternalFiles((prev) => [...prev, ...newAccepted, ...newRejected]);

        if (isAutoMode) {
          /* Inicia upload de cada um */
          newAccepted.forEach((it, i) => startUpload(it, accepted[i]!));
        }
      }
    }

    function removeAt(index: number) {
      /* Modo controlled: callback. Consumer decide o que fazer (inclusive
       * se aborta seu próprio XHR — a gente não tem ref aqui). */
      if (filesProp !== undefined) {
        onRemove?.(index);
        return;
      }
      /* Modo internal: aborta upload se ainda em andamento (race-safe via
       * cancelUpload abaixo) e remove da lista. */
      const target = internalFiles[index];
      if (target?.status === "uploading") {
        target.abort?.abort();
      }
      setInternalFiles((prev) => prev.filter((_, i) => i !== index));
      onRemove?.(index);
    }

    /* Cleanup: aborta uploads em andamento se o componente desmonta */
    React.useEffect(() => {
      return () => {
        internalFiles.forEach((f) => {
          if (f.abort && f.status === "uploading") f.abort.abort();
        });
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* Input file usado por ambos os variants. */
    const fileInput = (
      <input
        ref={setInputRef}
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-describedby={hint || maxSize ? hintId : undefined}
        onChange={(e) => {
          handleFiles(e.target.files);
          /* Reset value pra permitir selecionar o mesmo arquivo de novo */
          e.target.value = "";
        }}
        className="sr-only"
      />
    );

    /* Hint compartilhado (button variant também aceita maxSize/hint mas
     * renderiza fora do botão, embaixo). */
    const hintNode = (hint || maxSize) && (
      <span id={hintId} className="text-xs text-fg-muted">
        {hint ?? `Máx. ${formatBytes(maxSize!)}`}
      </span>
    );

    /* Tamanhos do botão (variant="button") seguem o padrão Combobox/DatePicker. */
    const buttonClasses: Record<"sm" | "md" | "lg", string> = {
      sm: "h-8 px-2.5 gap-1.5 text-[13px]",
      md: "h-[38px] px-3 gap-2 text-sm",
      lg: "h-[46px] px-3.5 gap-2 text-[15px]",
    };
    const buttonIconPx = buttonSize === "sm" ? 14 : buttonSize === "lg" ? 18 : 16;
    const defaultButtonLabel =
      buttonLabel ?? (multiple ? "Selecionar arquivos" : "Selecionar arquivo");

    return (
      <div className={cn("flex flex-col gap-2.5", className)}>
        {variant === "button" ? (
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => internalInputRef.current?.click()}
              disabled={disabled}
              aria-describedby={hint || maxSize ? hintId : undefined}
              className={cn(
                "inline-flex w-fit items-center",
                "rounded-md border border-border-strong bg-background text-fg",
                "transition-[background-color,border-color,box-shadow] duration-150",
                "hover:bg-guardia-violet-100/30 hover:border-guardia-violet-500",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-background disabled:hover:border-border-strong",
                buttonClasses[buttonSize],
              )}
            >
              {fileInput}
              <span
                aria-hidden="true"
                className="inline-flex shrink-0 text-guardia-violet-500"
              >
                {buttonIcon ?? (
                  <Paperclip width={buttonIconPx} height={buttonIconPx} />
                )}
              </span>
              <span>{defaultButtonLabel}</span>
            </button>
            {hintNode}
          </div>
        ) : (
          <label
            htmlFor={inputId}
            onDragEnter={(e) => {
              e.preventDefault();
              if (!disabled) setDrag(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              if (disabled) return;
              handleFiles(e.dataTransfer.files);
            }}
            className={cn(
              "relative flex cursor-pointer items-center gap-3.5",
              "rounded-xl border-[1.5px] border-dashed border-border-strong",
              "bg-muted",
              "transition-[background-color,border-color] duration-150",
              "hover:bg-guardia-violet-100/40 hover:border-guardia-violet-200",
              compact ? "p-3" : "p-5",
              drag && "bg-guardia-violet-100/60 border-guardia-violet-500",
              disabled &&
                "cursor-not-allowed pointer-events-none opacity-55",
            )}
          >
            {fileInput}

            <span
              className={cn(
                "inline-flex shrink-0 items-center justify-center",
                "rounded-lg border border-border bg-background",
                "text-guardia-violet-500",
                compact ? "h-8 w-8" : "h-10 w-10",
              )}
              aria-hidden="true"
            >
              <CloudUpload
                width={compact ? 18 : 22}
                height={compact ? 18 : 22}
              />
            </span>

            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[13.5px] leading-[1.45] text-fg">
                {title ?? (
                  <>
                    Arraste arquivos aqui ou{" "}
                    <span className="font-semibold text-guardia-violet-700 underline underline-offset-2">
                      {linkLabel}
                    </span>
                  </>
                )}
              </span>
              {hintNode}
            </span>
          </label>
        )}

        {visibleFiles.length > 0 && (
          <ul className="flex list-none flex-col gap-1.5 p-0">
            {visibleFiles.map((f, i) => {
              const status = f.status ?? "done";
              return (
                <li
                  key={
                    "id" in f && (f as InternalFile).id
                      ? (f as InternalFile).id
                      : `${f.name}-${i}`
                  }
                  data-status={status}
                  className={cn(
                    "flex items-center gap-2.5",
                    "rounded-lg border border-border bg-background",
                    "px-3 py-2.5",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                      status === "done" &&
                        "bg-signal-green/15 text-signal-green",
                      status === "error" &&
                        "bg-signal-red/15 text-signal-red",
                      status === "uploading" &&
                        "bg-guardia-violet-100/60 text-guardia-violet-500",
                    )}
                  >
                    {status === "done" && (
                      <CheckCircle2 width={15} height={15} />
                    )}
                    {status === "error" && (
                      <XCircle width={15} height={15} />
                    )}
                    {status === "uploading" && (
                      <FileIcon width={15} height={15} />
                    )}
                  </span>

                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-medium text-fg">
                      {f.name}
                    </span>
                    <span
                      className={cn(
                        "text-xs text-fg-muted",
                        status === "error" && "text-signal-red",
                      )}
                    >
                      {status === "error" && f.error
                        ? f.error
                        : `${formatBytes(f.size)}${
                            status === "uploading" && f.progress !== undefined
                              ? ` • ${f.progress}%`
                              : ""
                          }`}
                    </span>
                    {status === "uploading" && (
                      <span
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={f.progress ?? 0}
                        aria-label={`Enviando ${f.name}`}
                        className="mt-1 block h-[3px] w-full overflow-hidden rounded-full bg-muted"
                      >
                        <span
                          style={{ width: `${f.progress ?? 0}%` }}
                          className="block h-full bg-guardia-violet-500 transition-[width] duration-200 ease-out"
                        />
                      </span>
                    )}
                  </span>

                  {(onRemove || filesProp === undefined) && (() => {
                    /* Em auto-mode, durante upload, o botão CANCELA (mantém
                     * item visível como "Envio cancelado"). Após done/error
                     * ou em modo controlled, REMOVE. */
                    const isUploading = status === "uploading";
                    const isCancelable =
                      isUploading && filesProp === undefined;
                    const label = isUploading
                      ? `Cancelar envio de ${f.name}`
                      : `Remover ${f.name}`;
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          isCancelable ? cancelUpload(i) : removeAt(i)
                        }
                        aria-label={label}
                        title={label}
                        className={cn(
                          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                          "border-0 bg-transparent text-fg-muted",
                          "hover:bg-muted hover:text-fg",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        )}
                      >
                        <X width={14} height={14} aria-hidden="true" />
                      </button>
                    );
                  })()}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  },
);
FileUpload.displayName = "FileUpload";

export { FileUpload };
