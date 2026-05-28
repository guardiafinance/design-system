
/**
 * Textarea — campo de texto multi-linha.
 * Props: size, state, invalid, rows, resize, maxLength (com contador).
 */

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  size?: "sm" | "md" | "lg";
  state?: "default" | "error" | "success";
  invalid?: boolean;
  showCount?: boolean;
  resize?: "none" | "vertical" | "both";
}

function Textarea({
  size = "md",
  state = "default",
  invalid,
  showCount = false,
  resize = "vertical",
  className = "",
  value,
  maxLength,
  ...rest
}: TextareaProps) {
  const effectiveState = invalid ? "error" : state;
  const cls = [
    "grd-textarea",
    `grd-textarea-${size}`,
    `grd-textarea-${effectiveState}`,
    className,
  ].filter(Boolean).join(" ");
  const currentLen = typeof value === "string" ? value.length : 0;
  return (
    <div className="grd-textarea-wrap">
      <textarea
        className={cls}
        style={{ resize }}
        value={value}
        maxLength={maxLength}
        {...rest}
      />
      {showCount && (
        <span className="grd-textarea-count">
          {currentLen}{maxLength ? ` / ${maxLength}` : ""}
        </span>
      )}
    </div>
  );
}
Textarea.displayName = "Textarea";
(window as any).Textarea = Textarea;
