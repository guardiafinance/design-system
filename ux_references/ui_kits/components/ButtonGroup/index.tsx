/**
 * ButtonGroup — agrupa Buttons/IconButtons visualmente conectados.
 * Props: orientation (horizontal | vertical), attached (default true).
 * Filhos se encaixam: primeiro ganha radius-esquerdo, último ganha
 * radius-direito, bordas internas colapsam.
 */

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  attached?: boolean;
}

function ButtonGroup({
  orientation = "horizontal",
  attached = true,
  className = "",
  children,
  ...rest
}: ButtonGroupProps) {
  const cls = [
    "grd-btngroup",
    `grd-btngroup-${orientation}`,
    attached ? "grd-btngroup-attached" : "grd-btngroup-spaced",
    className,
  ].filter(Boolean).join(" ");
  return <div role="group" className={cls} {...rest}>{children}</div>;
}
ButtonGroup.displayName = "ButtonGroup";
(window as any).ButtonGroup = ButtonGroup;
