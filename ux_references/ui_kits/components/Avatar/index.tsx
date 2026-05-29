/**
 * Avatar — identidade visual de uma pessoa ou entidade.
 * Props:
 *   src        URL da imagem
 *   name       nome (gera iniciais como fallback)
 *   size       xs (20) · sm (28) · md (36) · lg (48) · xl (64)
 *   shape      circle (default) · square
 *   status     online · offline · busy · away (adiciona ponto)
 *   color      violet · orange · pink · yellow · green · blue · gray (cor do fallback)
 *              Aliases PT aceitos: violeta, laranja, rosa, amarelo, verde, azul
 */

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
type AvatarShape = "circle" | "square";
type AvatarStatus = "online" | "offline" | "busy" | "away";
type AvatarColor =
  | "violet" | "orange" | "pink" | "yellow" | "green" | "blue" | "gray"
  | "violeta" | "laranja" | "rosa" | "amarelo" | "verde" | "azul";

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarStatus;
  color?: AvatarColor;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({
  src, name, size = "md", shape = "circle", status, color = "violet",
  className = "", ...rest
}: AvatarProps) {
  const cls = [
    "grd-avatar", `grd-avatar-${size}`, `grd-avatar-${shape}`,
    !src && `grd-avatar-fallback-${color}`,
    className,
  ].filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {src ? (
        <img src={src} alt={name || ""} />
      ) : (
        <span className="grd-avatar-initials">{initials(name || "?")}</span>
      )}
      {status && <span className={`grd-avatar-status grd-avatar-status-${status}`} aria-label={status} />}
    </span>
  );
}
Avatar.displayName = "Avatar";
(window as any).Avatar = Avatar;
