
/**
 * TopBar — barra superior. Composição: Logo/título à esquerda, busca central, ações à direita.
 * Conteúdo via props left, center, right (nós composáveis).
 */

interface TopBarProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

function TopBar({ left, center, right, sticky = true, className = "" }: TopBarProps) {
  const cls = ["grd-tb", sticky && "grd-tb-sticky", className].filter(Boolean).join(" ");
  return (
    <header className={cls}>
      <div className="grd-tb-left">{left}</div>
      {center && <div className="grd-tb-center">{center}</div>}
      <div className="grd-tb-right">{right}</div>
    </header>
  );
}
TopBar.displayName = "TopBar";
(window as any).TopBar = TopBar;
