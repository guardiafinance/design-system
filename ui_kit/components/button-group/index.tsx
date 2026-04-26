import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * ButtonGroup — agrupa Buttons/IconButtons visualmente conectados.
 *
 *   <ButtonGroup>
 *     <Button variant="outline">Anterior</Button>
 *     <Button variant="outline">Atual</Button>
 *     <Button variant="outline">Próximo</Button>
 *   </ButtonGroup>
 *
 * Eixos:
 *   orientation  "horizontal" (default) · "vertical"
 *   attached     true (default — botões colados) · false (com gap)
 *
 * Quando `attached`, os botões internos têm radii adjacentes colapsados e
 * margem negativa de 1px para sobrepor as bordas. O foco sobe via `z-10`
 * para que o anel fique visível sobre os vizinhos.
 *
 * A11y: `role="group"` + `aria-label` ou `aria-labelledby` quando o grupo
 * tem significado semântico próprio (ex: paginação, toolbar segmentado).
 */
const buttonGroupVariants = cva("inline-flex", {
  variants: {
    orientation: {
      horizontal: "flex-row",
      vertical: "flex-col",
    },
    attached: {
      true: [
        // Foco sobe sobre o irmão colado
        "[&>*]:relative",
        "[&>*:focus-visible]:z-10",
      ].join(" "),
      false: "gap-2",
    },
  },
  compoundVariants: [
    // Horizontal attached — colapsa bordas direita/esquerda
    {
      orientation: "horizontal",
      attached: true,
      className: [
        "[&>*:not(:first-child)]:rounded-l-none",
        "[&>*:not(:last-child)]:rounded-r-none",
        "[&>*:not(:first-child)]:-ml-px",
      ].join(" "),
    },
    // Vertical attached — colapsa bordas top/bottom
    {
      orientation: "vertical",
      attached: true,
      className: [
        "[&>*:not(:first-child)]:rounded-t-none",
        "[&>*:not(:last-child)]:rounded-b-none",
        "[&>*:not(:first-child)]:-mt-px",
      ].join(" "),
    },
  ],
  defaultVariants: {
    orientation: "horizontal",
    attached: true,
  },
});

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation, attached, role = "group", ...props }, ref) => (
    <div
      ref={ref}
      role={role}
      data-slot="button-group"
      data-orientation={orientation ?? "horizontal"}
      data-attached={attached ?? true}
      className={cn(
        buttonGroupVariants({ orientation, attached }),
        className,
      )}
      {...props}
    />
  ),
);
ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup, buttonGroupVariants };
