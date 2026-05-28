/**
 * Logotipo — símbolo + palavra "Guardia" em Lastica.
 *
 * Uso: cabeçalhos, rodapés, landing pages, splash screens,
 * materiais impressos e qualquer contexto onde a marca ainda
 * precisa ser apresentada por extenso.
 *
 * Variantes:
 *   purple       principal — símbolo violeta com G laranja + palavra violeta
 *   orange       secundário — para fundos no espectro violeta
 *   mono-black   P&B, documentos oficiais, gravações técnicas
 *   mono-white   fundos escuros ou saturados
 */

type LogotipoVariant = "purple" | "orange" | "mono-black" | "mono-white";

interface LogotipoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  variant?: LogotipoVariant;
  height?: number;
  alt?: string;
}

const LOGOTIPO_SRC: Record<LogotipoVariant, string> = {
  purple:       "../../../assets/logo/guardia-logotipo-purple.svg",
  orange:       "../../../assets/logo/guardia-logotipo-orange.svg",
  "mono-black": "../../../assets/logo/guardia-logotipo-mono-black.svg",
  "mono-white": "../../../assets/logo/guardia-logotipo-mono-white.svg",
};

function Logotipo({
  variant = "purple",
  height = 32,
  alt = "Guardia",
  className = "",
  style,
  ...rest
}: LogotipoProps) {
  const src = LOGOTIPO_SRC[variant] || LOGOTIPO_SRC.purple;
  return (
    <img
      src={src}
      alt={alt}
      className={["grd-logotipo", className].filter(Boolean).join(" ")}
      style={{ height, width: "auto", ...style }}
      {...rest}
    />
  );
}
Logotipo.displayName = "Logotipo";
(window as any).Logotipo = Logotipo;
(window as any).LOGOTIPO_SRC = LOGOTIPO_SRC;
