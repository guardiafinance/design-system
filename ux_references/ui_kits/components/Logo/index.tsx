/**
 * Logo — símbolo G isolado (sem a palavra "Guardia").
 *
 * Uso: favicons, app icons, avatares, tiles compactos, loading
 * spinners, assinaturas curtas e qualquer contexto onde a marca
 * já esteja estabelecida pelo entorno.
 *
 * Variantes TRANSPARENTES (herdam o fundo da tela):
 *   purple · orange · mono-black · mono-white
 *
 * Variantes ROUNDED (container com fundo sólido, para app icons):
 *   rounded-purple · rounded-orange ·
 *   rounded-bicolor-purple · rounded-bicolor-orange
 */

type LogoVariant =
  | "purple" | "orange" | "mono-black" | "mono-white"
  | "rounded-purple" | "rounded-orange"
  | "rounded-bicolor-purple" | "rounded-bicolor-orange";

interface LogoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  variant?: LogoVariant;
  size?: number;
  alt?: string;
}

const LOGO_SRC: Record<LogoVariant, string> = {
  // transparentes
  purple:       "../../../assets/logo/guardia-logo-purple-transparent.svg",
  orange:       "../../../assets/logo/guardia-logo-orange-transparent.svg",
  "mono-black": "../../../assets/logo/guardia-logo-mono-black.svg",
  "mono-white": "../../../assets/logo/guardia-logo-mono-white.svg",
  // rounded sólidos
  "rounded-purple": "../../../assets/logo/guardia-logo-purple-rounded.svg",
  "rounded-orange": "../../../assets/logo/guardia-logo-orange-rounded.svg",
  // rounded bicolor
  "rounded-bicolor-purple": "../../../assets/logo/guardia-logo-orange-and-purple.svg",
  "rounded-bicolor-orange": "../../../assets/logo/guardia-logo-purple-and-orange.svg",
};

function Logo({
  variant = "purple",
  size = 32,
  alt = "Guardia",
  className = "",
  style,
  ...rest
}: LogoProps) {
  const src = LOGO_SRC[variant] || LOGO_SRC.purple;
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={["grd-logo", className].filter(Boolean).join(" ")}
      style={{ width: size, height: size, ...style }}
      {...rest}
    />
  );
}
Logo.displayName = "Logo";
(window as any).Logo = Logo;
(window as any).LOGO_SRC = LOGO_SRC;
