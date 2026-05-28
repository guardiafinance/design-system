
/**
 * Stepper — indicador de progresso em fluxo de múltiplas etapas.
 *
 * Uso típico na Guardia:
 *   - Onboarding (conectar banco → importar → configurar regras → revisar)
 *   - Fluxo transacional dentro do Copilot (selecionar → validar → confirmar)
 *   - Processamento longo (upload → parse → match → fechamento)
 *
 * Estados por step: pending · current · complete · error
 * Orientação: horizontal | vertical
 * Variantes: numbered (1,2,3) | iconed (ícone por step) | compact (apenas bolinhas)
 */

interface Step {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: string;            // usado quando variant="iconed"
  state?: "pending" | "current" | "loading" | "complete" | "error";
  meta?: React.ReactNode;   // conteúdo extra abaixo (ex: um input, um botão) — apenas vertical
}

interface StepperProps {
  steps: Step[];
  activeIndex?: number;              // índice do passo atual (fonte de verdade se os steps não trouxerem state próprio)
  orientation?: "horizontal" | "vertical";
  variant?: "numbered" | "iconed" | "compact";
  size?: "sm" | "md";
  onStepClick?: (index: number, step: Step) => void;
  className?: string;
}

function computeState(
  step: Step,
  index: number,
  activeIndex: number
): "pending" | "current" | "loading" | "complete" | "error" {
  if (step.state) return step.state;
  if (index < activeIndex) return "complete";
  if (index === activeIndex) return "current";
  return "pending";
}

function Stepper({
  steps,
  activeIndex = 0,
  orientation = "horizontal",
  variant = "numbered",
  size = "md",
  onStepClick,
  className = "",
}: StepperProps) {
  const IconCmp = (window as any).Icon;
  const cls = [
    "grd-st",
    `grd-st-${orientation}`,
    `grd-st-${variant}`,
    `grd-st-${size}`,
    onStepClick ? "grd-st-clickable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const iconSize = size === "sm" ? 12 : 14;

  return (
    <ol className={cls} aria-label="Progresso">
      {steps.map((step, i) => {
        const state = computeState(step, i, activeIndex);
        const last = i === steps.length - 1;
        const clickable = Boolean(onStepClick) && state !== "pending" && state !== "loading";

        const marker = (
          <span className="grd-st-marker" aria-hidden="true">
            {state === "complete" ? (
              IconCmp ? <IconCmp name="check" size={iconSize} /> : <span className="grd-st-tick">✓</span>
            ) : state === "error" ? (
              IconCmp ? <IconCmp name="x" size={iconSize} /> : <span className="grd-st-tick">✕</span>
            ) : state === "loading" ? (
              <span className="grd-st-spin" role="status" aria-label="carregando" />
            ) : variant === "iconed" && step.icon && IconCmp ? (
              <IconCmp name={step.icon} size={iconSize} />
            ) : variant === "compact" ? (
              <span className="grd-st-dot" />
            ) : (
              <span className="grd-st-num">{i + 1}</span>
            )}
          </span>
        );

        const bodyMain =
          variant === "compact" ? null : (
            <div className="grd-st-body">
              <span className="grd-st-title">{step.title}</span>
              {step.description && (
                <span className="grd-st-desc">{step.description}</span>
              )}
            </div>
          );

        const header = (
          <>
            {marker}
            {bodyMain}
          </>
        );

        const showMeta =
          orientation === "vertical" && step.meta && (state === "current" || state === "loading");

        return (
          <li
            key={step.id}
            className={`grd-st-item grd-st-s-${state} ${last ? "grd-st-last" : ""}`}
            aria-current={state === "current" ? "step" : undefined}
          >
            {clickable ? (
              <button
                type="button"
                className="grd-st-btn"
                onClick={() => onStepClick?.(i, step)}
              >
                {header}
              </button>
            ) : (
              <div className="grd-st-btn" role="presentation">
                {header}
              </div>
            )}
            {showMeta && <div className="grd-st-meta">{step.meta}</div>}
          </li>
        );
      })}
    </ol>
  );
}
Stepper.displayName = "Stepper";
(window as any).Stepper = Stepper;
