
/**
 * FileUpload — dropzone + botão, com lista de arquivos e progresso.
 * Props:
 *   accept, multiple, maxSize (bytes), onFiles(files)
 *   files: arquivos controlados (opcional) — [{ name, size, status, progress? }]
 *   hint: texto abaixo do dropzone
 */

interface UploadFile {
  name: string;
  size: number;
  status?: "uploading" | "done" | "error";
  progress?: number;
  error?: string;
}

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  hint?: string;
  files?: UploadFile[];
  onFiles?: (files: File[]) => void;
  onRemove?: (index: number) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function FileUpload({
  accept,
  multiple = false,
  maxSize,
  hint,
  files = [],
  onFiles,
  onRemove,
  disabled = false,
  compact = false,
  className = "",
}: FileUploadProps) {
  const IconCmp = (window as any).Icon;
  const [drag, setDrag] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleFiles(fl: FileList | null) {
    if (!fl) return;
    const arr = Array.from(fl);
    onFiles?.(arr);
  }

  const cls = [
    "grd-fu",
    compact && "grd-fu-compact",
    drag && "grd-fu-drag",
    disabled && "grd-fu-disabled",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={cls}>
      <label
        className="grd-fu-drop"
        onDragEnter={(e) => { e.preventDefault(); if (!disabled) setDrag(true); }}
        onDragOver={(e) => { e.preventDefault(); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault(); setDrag(false);
          if (disabled) return;
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
          style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
        />
        <div className="grd-fu-icon">
          {IconCmp && <IconCmp name="cloud-upload" size={compact ? 20 : 24} />}
        </div>
        <div className="grd-fu-text">
          <span className="grd-fu-title">
            Arraste arquivos aqui ou <span className="grd-fu-link">clique para escolher</span>
          </span>
          {hint && <span className="grd-fu-hint">{hint}</span>}
          {!hint && maxSize && <span className="grd-fu-hint">Máx. {fmtBytes(maxSize)}</span>}
        </div>
      </label>

      {files.length > 0 && (
        <ul className="grd-fu-list">
          {files.map((f, i) => (
            <li key={i} className={`grd-fu-item grd-fu-item-${f.status ?? "done"}`}>
              <span className="grd-fu-item-ic">
                {IconCmp && <IconCmp
                  name={f.status === "done" ? "circle-check" : f.status === "error" ? "circle-x" : "file"}
                  size={15} />}
              </span>
              <span className="grd-fu-item-body">
                <span className="grd-fu-item-name">{f.name}</span>
                <span className="grd-fu-item-meta">
                  {f.status === "error" && f.error
                    ? f.error
                    : `${fmtBytes(f.size)}${f.status === "uploading" && f.progress !== undefined ? ` • ${f.progress}%` : ""}`
                  }
                </span>
                {f.status === "uploading" && (
                  <span className="grd-fu-item-bar"><span style={{ width: `${f.progress ?? 0}%` }} /></span>
                )}
              </span>
              {onRemove && (
                <button type="button" className="grd-fu-item-rm" onClick={() => onRemove(i)} aria-label="Remover">
                  {IconCmp && <IconCmp name="x" size={14} />}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
FileUpload.displayName = "FileUpload";
(window as any).FileUpload = FileUpload;
