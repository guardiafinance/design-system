"use client";

import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * FormLayout — esqueleto de formulários da Guardia.
 *
 * Compound component que padroniza cadastros, filtros, settings e wizards.
 *
 *   <FormLayout variant="split" density="comfy">
 *     <FormLayout.Header title="Editar empresa" description="..." actions={...} />
 *     <FormLayout.Section title="Dados gerais" description="...">
 *       <FormLayout.Row cols={12}>
 *         <FormLayout.Field label="CNPJ" required span={6}>
 *           <Input />
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
 *   stacked (default) — label em cima, descrição da seção acima dos campos.
 *   split             — título + descrição numa coluna, campos noutra (desktop).
 *   inline            — label à esquerda, campo à direita; bom para settings.
 *
 * Densidade:
 *   comfy   (default) — espaçamento generoso para cadastros (gap 32px)
 *   compact           — denso para filtros e settings (gap 20px)
 *
 * Field injeta automaticamente no único child que receber:
 *   - `id`    via htmlFor
 *   - `aria-describedby` → hint/error
 *   - `aria-invalid` quando há erro
 *   - `invalid` (boolean) quando há erro — compatível com Input/Combobox/etc
 */

export type FormLayoutVariant = "stacked" | "split" | "inline";
export type FormLayoutDensity = "comfy" | "compact";

interface FormLayoutCtx {
  variant: FormLayoutVariant;
  density: FormLayoutDensity;
}
const FormLayoutContext = React.createContext<FormLayoutCtx>({
  variant: "stacked",
  density: "comfy",
});

/* ============ Root ============ */

export interface FormLayoutProps
  extends React.FormHTMLAttributes<HTMLFormElement> {
  variant?: FormLayoutVariant;
  density?: FormLayoutDensity;
  /** Renderiza como <div> em vez de <form>. Útil para filtros/settings. */
  as?: "form" | "div";
}

const rootVariants = cva("flex w-full flex-col text-fg", {
  variants: {
    density: {
      comfy: "gap-8",
      compact: "gap-5",
    },
  },
  defaultVariants: { density: "comfy" },
});

function FormLayoutRoot({
  variant = "stacked",
  density = "comfy",
  as = "form",
  className,
  children,
  ...rest
}: FormLayoutProps) {
  const Tag = as as React.ElementType;
  const ctx = React.useMemo(() => ({ variant, density }), [variant, density]);
  return (
    <FormLayoutContext.Provider value={ctx}>
      <Tag
        data-form-variant={variant}
        data-form-density={density}
        className={cn(rootVariants({ density }), className)}
        {...rest}
      >
        {children}
      </Tag>
    </FormLayoutContext.Provider>
  );
}
FormLayoutRoot.displayName = "FormLayout";

/* ============ Header ============ */

export interface FormHeaderProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

function FormHeader({
  title,
  description,
  actions,
  className,
  children,
}: FormHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-start justify-between gap-6",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {title && (
          <h2 className="m-0 text-xl font-semibold leading-tight tracking-[-0.01em] text-fg">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-1.5 max-w-[680px] text-[13.5px] leading-relaxed text-fg-muted text-pretty">
            {description}
          </p>
        )}
        {children}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
FormHeader.displayName = "FormLayout.Header";

/* ============ Section ============ */

export interface FormSectionProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Slot opcional no canto superior direito da seção. */
  aside?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

function FormSection({
  title,
  description,
  aside,
  className,
  children,
}: FormSectionProps) {
  const { variant, density } = React.useContext(FormLayoutContext);
  const hasHead = title || description || aside;

  if (variant === "split") {
    return (
      <section
        className={cn(
          /* split: 2 colunas no desktop, 1 coluna no mobile */
          "grid items-start gap-10",
          "grid-cols-1 md:grid-cols-[minmax(180px,280px)_minmax(0,1fr)]",
          "max-md:gap-3.5",
          className,
        )}
      >
        {hasHead && (
          <div className="flex flex-col gap-1.5 md:sticky md:top-4 md:self-start">
            {title && (
              <h3 className="m-0 text-[14.5px] font-semibold tracking-[-0.005em] text-fg">
                {title}
              </h3>
            )}
            {description && (
              <p className="m-0 max-w-[260px] text-[12.5px] leading-relaxed text-fg-muted text-pretty">
                {description}
              </p>
            )}
            {aside && (
              <div className="mt-1 text-[12.5px] text-fg-muted">{aside}</div>
            )}
          </div>
        )}
        <div
          className={cn(
            "flex min-w-0 flex-col",
            density === "comfy" ? "gap-[18px]" : "gap-3",
          )}
        >
          {children}
        </div>
      </section>
    );
  }

  /* stacked / inline */
  const sectionGap =
    variant === "inline"
      ? "gap-3"
      : density === "comfy"
        ? "gap-[18px]"
        : "gap-3";
  return (
    <section className={cn("flex flex-col", className)}>
      {hasHead && (
        <div
          className={cn(
            "flex items-start justify-between gap-4",
            density === "comfy" ? "mb-[18px]" : "mb-3",
          )}
        >
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="m-0 text-[14.5px] font-semibold tracking-[-0.005em] text-fg">
                {title}
              </h3>
            )}
            {description && (
              <p className="m-0 mt-1.5 text-[12.5px] leading-relaxed text-fg-muted text-pretty">
                {description}
              </p>
            )}
          </div>
          {aside && (
            <div className="shrink-0 text-[12.5px] text-fg-muted">{aside}</div>
          )}
        </div>
      )}
      <div className={cn("flex min-w-0 flex-col", sectionGap)}>{children}</div>
    </section>
  );
}
FormSection.displayName = "FormLayout.Section";

/* ============ Row (grid 12-col) ============ */

export interface FormRowProps {
  /** Número de colunas (default 12). 2/3/4/6/12 são valores comuns. */
  cols?: 2 | 3 | 4 | 6 | 12;
  /** Gap em px (override do default — comfy 16, compact 12). */
  gap?: number;
  className?: string;
  children?: React.ReactNode;
}

function FormRow({ cols = 12, gap, className, children }: FormRowProps) {
  const { density } = React.useContext(FormLayoutContext);
  const style: React.CSSProperties = {
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
  };
  if (gap !== undefined) style.gap = gap;
  return (
    <div
      data-form-row-cols={cols}
      className={cn(
        "grid",
        /* gap default: comfy 16 (gap-4), compact 12 (gap-3) */
        density === "comfy" ? "gap-4" : "gap-3",
        /* responsive: 1 coluna em telas pequenas */
        "max-sm:!grid-cols-1",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
FormRow.displayName = "FormLayout.Row";

/* ============ Field ============ */

export interface FormFieldProps {
  label?: React.ReactNode;
  required?: boolean;
  /** Sufixo "(opcional)" no label (ignorado se required=true). */
  optional?: boolean;
  /** Texto auxiliar abaixo do controle. */
  hint?: React.ReactNode;
  /** Mensagem de erro (substitui hint quando presente). */
  error?: React.ReactNode;
  /** Texto à direita do label (ex: "Máx. 80 caracteres"). */
  labelAside?: React.ReactNode;
  /** Colspan dentro de um Row (1..cols). Default = 1 coluna. */
  span?: number;
  /** Id do controle quando o consumer não passa um id no child. */
  htmlFor?: string;
  className?: string;
  children?: React.ReactNode;
}

function FormField({
  label,
  required,
  optional,
  hint,
  error,
  labelAside,
  span,
  htmlFor,
  className,
  children,
}: FormFieldProps) {
  const { variant } = React.useContext(FormLayoutContext);
  const errId = React.useId();
  const hintId = React.useId();

  const style: React.CSSProperties | undefined = span
    ? { gridColumn: `span ${span} / span ${span}` }
    : undefined;

  /* Se houver UM único child, injetamos id/aria-describedby/aria-invalid/invalid */
  let enhancedChildren: React.ReactNode = children;
  const onlyChild =
    React.Children.count(children) === 1
      ? React.Children.only(children)
      : null;
  if (onlyChild && React.isValidElement(onlyChild)) {
    const childProps = onlyChild.props as Record<string, unknown>;
    const describedBy = [
      error ? errId : null,
      hint && !error ? hintId : null,
      childProps["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ") || undefined;
    const newProps: Record<string, unknown> = {
      "aria-describedby": describedBy,
    };
    if (htmlFor && childProps.id == null) newProps.id = htmlFor;
    if (error) {
      newProps["aria-invalid"] = true;
      /* Só injeta `invalid` em componentes custom — DOM elements como
       * <input>/<select> não conhecem o prop e o React avisa em dev.
       * Nossos primitivos (Input/Combobox/...) aceitam `invalid` boolean. */
      if (typeof onlyChild.type !== "string") {
        newProps.invalid = true;
      }
    }
    enhancedChildren = React.cloneElement(onlyChild, newProps);
  }

  const isInline = variant === "inline";
  const labelTargetId = htmlFor ?? (
    onlyChild && React.isValidElement(onlyChild)
      ? ((onlyChild.props as Record<string, unknown>).id as string | undefined)
      : undefined
  );

  return (
    <div
      data-form-field-error={error ? true : undefined}
      className={cn(
        "min-w-0",
        isInline
          ? cn(
              /* inline: 2 colunas no desktop, 1 no mobile */
              "grid items-center gap-4",
              "grid-cols-1 sm:grid-cols-[minmax(140px,200px)_minmax(0,1fr)]",
              "max-sm:gap-1.5",
            )
          : "flex flex-col",
        className,
      )}
      style={style}
    >
      {(label || labelAside) && (
        <div
          className={cn(
            "flex items-baseline gap-2",
            isInline
              ? "flex-col items-start gap-0.5"
              : "mb-1.5 justify-between",
          )}
        >
          {label && (
            <label
              htmlFor={labelTargetId}
              className="inline-flex items-center gap-1 text-[12.5px] font-semibold leading-tight tracking-[-0.005em] text-fg"
            >
              {label}
              {required && (
                <span aria-hidden="true" className="ml-px font-semibold text-signal-red">
                  *
                </span>
              )}
              {optional && !required && (
                <span className="ml-1 text-[11.5px] font-normal text-fg-muted">
                  (opcional)
                </span>
              )}
            </label>
          )}
          {labelAside && (
            <span className="text-[11.5px] font-normal text-fg-muted">
              {labelAside}
            </span>
          )}
        </div>
      )}

      <div className="flex min-w-0 [&>*]:min-w-0 [&>*]:flex-1">
        {enhancedChildren}
      </div>

      {error ? (
        <p
          id={errId}
          role="alert"
          className={cn(
            "m-0 mt-1.5 flex items-start gap-1 text-[11.5px] font-medium leading-snug text-signal-red",
            "before:mt-[7px] before:block before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-signal-red before:content-['']",
            isInline && "sm:col-start-2",
          )}
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={hintId}
          className={cn(
            "m-0 mt-1.5 text-[11.5px] leading-snug text-fg-muted",
            isInline && "sm:col-start-2",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
FormField.displayName = "FormLayout.Field";

/* ============ Actions ============ */

export interface FormActionsProps {
  align?: "start" | "center" | "end" | "between";
  sticky?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const actionsAlignMap: Record<NonNullable<FormActionsProps["align"]>, string> =
  {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  };

function FormActions({
  align = "end",
  sticky = false,
  className,
  children,
}: FormActionsProps) {
  const { density } = React.useContext(FormLayoutContext);
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 border-t border-border",
        density === "compact" ? "pt-3.5" : "pt-5",
        actionsAlignMap[align],
        sticky &&
          "sticky bottom-0 z-[2] -mx-4 -mb-4 px-4 py-3.5 bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-md backdrop-saturate-150",
        className,
      )}
    >
      {children}
    </div>
  );
}
FormActions.displayName = "FormLayout.Actions";

/* ============ Divider ============ */

function FormDivider({ className }: { className?: string }) {
  return (
    <hr
      aria-hidden="true"
      className={cn("m-0 border-0 border-t border-border", className)}
    />
  );
}
FormDivider.displayName = "FormLayout.Divider";

/* ============ Compound API ============ */

type FormLayoutComponent = typeof FormLayoutRoot & {
  Header: typeof FormHeader;
  Section: typeof FormSection;
  Row: typeof FormRow;
  Field: typeof FormField;
  Actions: typeof FormActions;
  Divider: typeof FormDivider;
};

const FormLayout = FormLayoutRoot as FormLayoutComponent;
FormLayout.Header = FormHeader;
FormLayout.Section = FormSection;
FormLayout.Row = FormRow;
FormLayout.Field = FormField;
FormLayout.Actions = FormActions;
FormLayout.Divider = FormDivider;

export {
  FormLayout,
  FormHeader,
  FormSection,
  FormRow,
  FormField,
  FormActions,
  FormDivider,
};
