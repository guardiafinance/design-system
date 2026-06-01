"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Accordion — grupos de painéis colapsáveis para conteúdo hierárquico
 * em FAQs, configurações por seção, formulários longos divididos por
 * etapa, e dossiês de auditoria onde o usuário precisa expandir uma
 * trilha por vez sem perder o contexto da lista.
 *
 * Para conteúdo modal bloqueante prefira `<Dialog>`; para painéis
 * laterais persistentes prefira `<Drawer>`; para uma única seção
 * dispensável prefira `<Collapsible>` puro.
 *
 * Base: `@radix-ui/react-accordion` (state machine `single` /
 * `multiple`, ARIA `region` + `heading` + `button` wiring, keyboard
 * navigation `ArrowUp` / `ArrowDown` / `Home` / `End`, `disabled`
 * support, controlled / uncontrolled parity, RTL-aware). Esta wrapper
 * adiciona:
 *
 *   - **CVA `variant` ladder** (`bordered` | `plain`) replicando a
 *     paridade visual da referência legada em
 *     `ux_references/ui_kits/components/Accordion/`. `bordered`
 *     contém o grupo com 1 borda externa arredondada + separadores
 *     internos; `plain` empilha itens com borda inferior, sem
 *     contorno externo (uso embedded em cards / sidebars).
 *   - **Token contract canônico** consumindo apenas tokens
 *     semânticos (`border-border`, `bg-card`, `text-fg`,
 *     `hover:bg-muted/40`, `text-muted-foreground` → `text-primary`
 *     no estado aberto). Zero cor hardcoded, zero `--violet-*`,
 *     zero `bg-popover` legado.
 *   - **ChevronDown** (lucide) rotaciona 180° via seletor
 *     `[&[data-state=open]>svg]` quando o item abre, com transição
 *     de 200ms — paridade com Radix `data-state`.
 *   - **Tipografia** via tokens (`font-sans`, `text-sm` no trigger,
 *     `text-sm` no content) consumindo Poppins do `lex-brand-typography`
 *     (encadeada em `--font-sans` no `ui_kit/styles/index.css`).
 *   - **Animações** `accordion-down` / `accordion-up` 200ms (já
 *     definidas em `@theme` no `styles/index.css`).
 *
 * Public surface (4 componentes + 1 CVA accessor + 1 type):
 *   Accordion, AccordionItem, AccordionTrigger, AccordionContent
 *   accordionItemVariants
 *   AccordionVariant
 *
 * Decisões registradas em
 * `docs/adr/ADR-015-accordion-v0.1.0-dod-migration.md`.
 */

// ──────────────────────────────────────────────────────────────────
// Root — passthrough do Radix Accordion.Root
// ──────────────────────────────────────────────────────────────────

/**
 * `Accordion` é um passthrough direto do `AccordionPrimitive.Root` —
 * todas as props Radix (`type`, `value`, `defaultValue`, `onValueChange`,
 * `collapsible`, `disabled`, `dir`, `orientation`) ficam disponíveis sem
 * camada adicional. A wrapper só adiciona a layer de tokens e variantes
 * nos children (`AccordionItem`, `AccordionTrigger`, `AccordionContent`)
 * — manter `Root` enxuto preserva a discriminated union de Radix
 * (`type="single"` vs `type="multiple"`) com seus tipos corretos sem
 * re-declarar o overload aqui.
 */
const Accordion = AccordionPrimitive.Root;

// ──────────────────────────────────────────────────────────────────
// CVA variants — visual ladder (paridade legacy: bordered | plain)
// ──────────────────────────────────────────────────────────────────

/**
 * `accordionItemVariants` controla a borda e o background do
 * `AccordionItem`. As duas variantes herdam o mesmo trigger / content
 * — a diferença é o contorno do grupo. `bordered` é o default da
 * referência legada (`grd-acc-bordered`) — caixa única com borda
 * arredondada e separadores internos finos. `plain` (`grd-acc-plain`)
 * remove o contorno e empilha itens só com borda inferior, ideal
 * embedded dentro de um `<Card>` ou sidebar onde o container já
 * provê o frame visual.
 *
 * O CVA é aplicado no `AccordionItem` (não no Root) porque o Radix
 * espera flat children no Root e o frame só faz sentido na sequência
 * dos items (CSS `:first-child` / `:last-child` resolvem o
 * arredondamento e a remoção de borda dupla).
 */
const accordionItemVariants = cva(
  // Reset base de cada item
  "border-border",
  {
    variants: {
      variant: {
        bordered: [
          // 1ª linha não tem top (assumida pelo container); demais ganham borda top
          "border-t first:border-t-0",
          // Borda lateral + arredondamento herdado do container; aqui só preenchimento de surface
          "bg-card",
        ].join(" "),
        plain: [
          // Borda inferior — exceto último item
          "border-b last:border-b-0",
        ].join(" "),
      },
    },
    defaultVariants: { variant: "bordered" },
  },
);

export type AccordionVariant = NonNullable<
  VariantProps<typeof accordionItemVariants>["variant"]
>;

// ──────────────────────────────────────────────────────────────────
// AccordionItem — wrapper de cada painel
// ──────────────────────────────────────────────────────────────────

export interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>,
    VariantProps<typeof accordionItemVariants> {}

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, variant, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(accordionItemVariants({ variant }), className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

// ──────────────────────────────────────────────────────────────────
// AccordionTrigger — botão de header (acionável)
// ──────────────────────────────────────────────────────────────────

export type AccordionTriggerProps =
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>;

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        // `group` enables descendant chevron to react to `data-state`
        "group flex flex-1 items-center justify-between gap-3",
        // Spacing — 16px vertical / 14px horizontal. Diverge ligeiramente do
        // legacy (12px vertical) para dar respiro ao primeiro item dentro de
        // um container `bordered`, onde `border-t-0` colaria o trigger no topo.
        "px-3.5 py-4 text-left",
        // Typography — sm/medium, herdando `--font-sans` (Poppins → Roboto)
        "font-sans text-sm font-medium",
        // Color — text-fg base; hover preserva legibilidade via muted bg
        "text-fg transition-colors",
        "hover:bg-muted/40",
        // Focus ring — semantic ring token + inset para não vazar do container bordered
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        // Disabled — Radix expõe `data-disabled`; reduz opacidade + impede cursor
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown
        aria-hidden="true"
        className={cn(
          "h-4 w-4 shrink-0",
          "text-muted-foreground transition-all duration-200",
          // Rotaciona 180° no estado open + alterna para primary (Notion Violet light / Orange dark)
          "group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary",
        )}
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

// ──────────────────────────────────────────────────────────────────
// AccordionContent — painel revelado quando aberto
// ──────────────────────────────────────────────────────────────────

export type AccordionContentProps =
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      // Overflow + animação (Radix expõe --radix-accordion-content-height via CSS var)
      "overflow-hidden",
      "data-[state=open]:animate-accordion-down",
      "data-[state=closed]:animate-accordion-up",
      // Typography — sm matching trigger; leading-relaxed pra prosa
      "font-sans text-sm leading-relaxed text-fg",
    )}
    {...props}
  >
    <div className={cn("px-3.5 pb-3 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

// ──────────────────────────────────────────────────────────────────
// Container shape para `bordered` — wrapper de borda externa do grupo
// ──────────────────────────────────────────────────────────────────

/**
 * Quando `bordered`, o container Root recebe um frame único (borda
 * arredondada + overflow-hidden). Como `Accordion` é passthrough do
 * Radix Root, esse frame é responsabilidade do consumidor — porém,
 * para reduzir boilerplate e garantir o visual padrão da referência
 * legada, expomos um helper de className via `cn` direto na story /
 * preview. Documentação registra como aplicar:
 *
 *   <Accordion type="single" collapsible
 *     className="rounded-lg border border-border bg-card overflow-hidden">
 *     <AccordionItem variant="bordered" value="a">...</AccordionItem>
 *   </Accordion>
 *
 * Manter o frame opt-in mantém o componente composable — consumidores
 * que renderizam o Accordion dentro de outro container (Card,
 * Sidebar) podem usar `variant="plain"` sem frame, evitando borda
 * dupla.
 */

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  accordionItemVariants,
};
