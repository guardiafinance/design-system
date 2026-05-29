/**
 * Label — rótulo de campo de formulário.
 * Props: required (estrela), optional (sufixo).
 * Renderiza <label>; precisa `htmlFor` apontando pro input.
 */

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

function Label({ required, optional, className = "", children, ...rest }: LabelProps) {
  const cls = ["grd-label", className].filter(Boolean).join(" ");
  return (
    <label className={cls} {...rest}>
      {children}
      {required && <span className="grd-label-required" aria-hidden>*</span>}
      {optional && <span className="grd-label-optional">(opcional)</span>}
    </label>
  );
}
Label.displayName = "Label";
(window as any).Label = Label;
