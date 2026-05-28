
/**
 * FormLayout — esqueleto de formulários da Guardia.
 *
 * Compõe cadastros, filtros, settings e wizards com consistência:
 *   <FormLayout variant="split" density="comfy">
 *     <FormLayout.Header title="…" description="…" actions={…} />
 *     <FormLayout.Section title="…" description="…">
 *       <FormLayout.Row>
 *         <FormLayout.Field label="CNPJ" required span={6}>
 *           <Input placeholder="…" />
 *         </FormLayout.Field>
 *         <FormLayout.Field label="Razão social" span={6}>
 *           <Input />
 *         </FormLayout.Field>
 *       </FormLayout.Row>
 *     </FormLayout.Section>
 *     <FormLayout.Actions align="end" sticky>
 *       <Button variant="ghost">Cancelar</Button>
 *       <Button variant="primary">Salvar</Button>
 *     </FormLayout.Actions>
 *   </FormLayout>
 *
 * Variantes:
 *   stacked (default) — label em cima, descrição de seção acima dos campos.
 *   split              — título + descrição da seção em uma coluna, campos em outra (desktop apenas).
 *   inline             — label à esquerda do campo, compacto. Bom para settings.
 *
 * Densidade:
 *   comfy  (default) — espaçamento generoso para cadastros.
 *   compact          — denso, para filtros e tabelas de configuração.
 */

type FormVariant = "stacked" | "split" | "inline";
type FormDensity = "comfy" | "compact";

interface FormLayoutCtx {
  variant: FormVariant;
  density: FormDensity;
}
const FormLayoutContext = React.createContext<FormLayoutCtx>({ variant: "stacked", density: "comfy" });

/* ─── Root ────────────────────────────────────────────────── */

interface FormLayoutProps extends React.FormHTMLAttributes<HTMLFormElement> {
  variant?: FormVariant;
  density?: FormDensity;
  /** renderiza como <div> (default <form>), útil para filtros ou settings controlados externamente */
  as?: "form" | "div";
}
function FormLayout({
  variant = "stacked",
  density = "comfy",
  as = "form",
  className = "",
  children,
  ...rest
}: FormLayoutProps) {
  const Tag: any = as;
  const cls = [
    "grd-form",
    `grd-form-${variant}`,
    `grd-form-${density}`,
    className,
  ].filter(Boolean).join(" ");
  return (
    <FormLayoutContext.Provider value={{ variant, density }}>
      <Tag className={cls} {...rest}>{children}</Tag>
    </FormLayoutContext.Provider>
  );
}
FormLayout.displayName = "FormLayout";

/* ─── Header ──────────────────────────────────────────────── */

interface HeaderProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}
function FormHeader({ title, description, actions, className = "", children }: HeaderProps) {
  return (
    <header className={["grd-form-header", className].filter(Boolean).join(" ")}>
      <div className="grd-form-header-text">
        {title && <h2 className="grd-form-header-title">{title}</h2>}
        {description && <p className="grd-form-header-desc">{description}</p>}
        {children}
      </div>
      {actions && <div className="grd-form-header-actions">{actions}</div>}
    </header>
  );
}
FormHeader.displayName = "FormLayout.Header";

/* ─── Section ─────────────────────────────────────────────── */

interface SectionProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** canto superior direito da seção (link, badge, action secundária) */
  aside?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}
function FormSection({ title, description, aside, className = "", children }: SectionProps) {
  const { variant } = React.useContext(FormLayoutContext);
  const hasHead = title || description || aside;
  return (
    <section className={["grd-form-section", `grd-form-section-${variant}`, className].filter(Boolean).join(" ")}>
      {hasHead && (
        <div className="grd-form-section-head">
          <div className="grd-form-section-head-text">
            {title && <h3 className="grd-form-section-title">{title}</h3>}
            {description && <p className="grd-form-section-desc">{description}</p>}
          </div>
          {aside && <div className="grd-form-section-aside">{aside}</div>}
        </div>
      )}
      <div className="grd-form-section-body">
        {children}
      </div>
    </section>
  );
}
FormSection.displayName = "FormLayout.Section";

/* ─── Row (grid 12-col) ───────────────────────────────────── */

interface RowProps {
  /** número de colunas (default 12). Use 2/3/4 para grids simétricos */
  cols?: 2 | 3 | 4 | 6 | 12;
  /** gap em px (default 16px no comfy, 12px no compact) */
  gap?: number;
  className?: string;
  children?: React.ReactNode;
}
function FormRow({ cols = 12, gap, className = "", children }: RowProps) {
  const style: React.CSSProperties = { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` };
  if (gap !== undefined) style.gap = gap;
  return (
    <div
      className={["grd-form-row", `grd-form-row-${cols}`, className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}
FormRow.displayName = "FormLayout.Row";

/* ─── Field ───────────────────────────────────────────────── */

interface FieldProps {
  label?: React.ReactNode;
  /** sufixo opcional no label (ex: "(opcional)") */
  optional?: boolean;
  required?: boolean;
  /** dica abaixo do campo */
  hint?: React.ReactNode;
  /** mensagem de erro — sobrescreve o hint quando presente */
  error?: React.ReactNode;
  /** texto à direita do label (ex: "Máx. 80 caracteres") */
  labelAside?: React.ReactNode;
  /** colspan dentro de <Row>. default auto (1 coluna) */
  span?: number;
  /** id do input para wire automático do htmlFor */
  htmlFor?: string;
  className?: string;
  children?: React.ReactNode;
}
function FormField({
  label,
  optional,
  required,
  hint,
  error,
  labelAside,
  span,
  htmlFor,
  className = "",
  children,
}: FieldProps) {
  const { variant } = React.useContext(FormLayoutContext);
  const style: React.CSSProperties | undefined = span ? { gridColumn: `span ${span}` } : undefined;
  const errId = React.useId();
  const hintId = React.useId();

  /* Se houver um único child que seja input-like, injetamos aria-describedby/invalid */
  const child = React.Children.count(children) === 1 ? React.Children.only(children) : null;
  let enhancedChildren: React.ReactNode = children;
  if (child && React.isValidElement(child)) {
    const describedBy = [
      error ? errId : null,
      hint && !error ? hintId : null,
      (child.props as any)["aria-describedby"],
    ].filter(Boolean).join(" ") || undefined;
    enhancedChildren = React.cloneElement(child as any, {
      id: (child.props as any).id ?? htmlFor,
      "aria-describedby": describedBy,
      "aria-invalid": error ? true : (child.props as any)["aria-invalid"],
      invalid: error ? true : (child.props as any).invalid,
    });
  }

  return (
    <div
      className={["grd-form-field", `grd-form-field-${variant}`, error && "grd-form-field-error", className].filter(Boolean).join(" ")}
      style={style}
    >
      {(label || labelAside) && (
        <div className="grd-form-field-labelrow">
          {label && (
            <label className="grd-form-field-label" htmlFor={htmlFor}>
              {label}
              {required && <span className="grd-form-field-required" aria-hidden>*</span>}
              {optional && !required && <span className="grd-form-field-optional">(opcional)</span>}
            </label>
          )}
          {labelAside && <span className="grd-form-field-aside">{labelAside}</span>}
        </div>
      )}
      <div className="grd-form-field-control">{enhancedChildren}</div>
      {error ? (
        <p id={errId} className="grd-form-field-error-msg" role="alert">{error}</p>
      ) : hint ? (
        <p id={hintId} className="grd-form-field-hint">{hint}</p>
      ) : null}
    </div>
  );
}
FormField.displayName = "FormLayout.Field";

/* ─── Actions ────────────────────────────────────────────── */

interface ActionsProps {
  align?: "start" | "center" | "end" | "between";
  sticky?: boolean;
  className?: string;
  children?: React.ReactNode;
}
function FormActions({ align = "end", sticky = false, className = "", children }: ActionsProps) {
  const cls = [
    "grd-form-actions",
    `grd-form-actions-${align}`,
    sticky && "grd-form-actions-sticky",
    className,
  ].filter(Boolean).join(" ");
  return <div className={cls}>{children}</div>;
}
FormActions.displayName = "FormLayout.Actions";

/* ─── Divider ────────────────────────────────────────────── */

function FormDivider({ className = "" }: { className?: string }) {
  return <hr className={["grd-form-divider", className].filter(Boolean).join(" ")} aria-hidden />;
}
FormDivider.displayName = "FormLayout.Divider";

/* ─── Compound ───────────────────────────────────────────── */

FormLayout.Header  = FormHeader;
FormLayout.Section = FormSection;
FormLayout.Row     = FormRow;
FormLayout.Field   = FormField;
FormLayout.Actions = FormActions;
FormLayout.Divider = FormDivider;

(window as any).FormLayout = FormLayout;
