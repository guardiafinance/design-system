import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Avatar — identidade visual de uma pessoa ou entidade.
 *
 * Compound pattern (Radix-style):
 *   <Avatar size="md" shape="circle">
 *     <AvatarImage src="/u.jpg" alt="Fernando" />
 *     <AvatarFallback color="violet">FS</AvatarFallback>
 *     <AvatarStatus status="online" />
 *   </Avatar>
 *
 * O helper `initials("Fernando Seguim")` produz "FS" para o fallback quando
 * não há imagem.
 */

const avatarVariants = cva(
  "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden bg-muted font-semibold tracking-tight text-white",
  {
    variants: {
      size: {
        xs: "size-5 text-[9px]",
        sm: "size-7 text-[11px]",
        md: "size-9 text-[13px]",
        lg: "size-12 text-[17px]",
        xl: "size-16 text-[22px]",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-md",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "circle",
    },
  },
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size, shape, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="avatar"
      data-shape={shape ?? "circle"}
      className={cn(avatarVariants({ size, shape }), className)}
      {...props}
    />
  ),
);
Avatar.displayName = "Avatar";

/* ───────── Image ───────── */

export interface AvatarImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {}

/**
 * AvatarImage — imagem do avatar com error state.
 *
 * Se o `src` falha (404, rede, CORS), a imagem se auto-remove do DOM e o
 * `AvatarFallback` irmão passa a aparecer naturalmente no lugar — padrão
 * Radix-like, sem necessidade de `AvatarContext` externo.
 */
const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, alt = "", onError, onLoad, ...props }, ref) => {
    const [status, setStatus] = React.useState<"idle" | "loaded" | "error">(
      "idle",
    );

    if (status === "error") return null;

    return (
      <img
        ref={ref}
        data-slot="avatar-image"
        data-status={status}
        alt={alt}
        onLoad={(e) => {
          setStatus("loaded");
          onLoad?.(e);
        }}
        onError={(e) => {
          setStatus("error");
          onError?.(e);
        }}
        className={cn(
          "absolute inset-0 z-10 aspect-square size-full object-cover",
          className,
        )}
        {...props}
      />
    );
  },
);
AvatarImage.displayName = "AvatarImage";

/* ───────── Fallback ───────── */

const avatarFallbackVariants = cva(
  "flex size-full items-center justify-center font-semibold",
  {
    variants: {
      color: {
        violet: "bg-guardia-violet-500 text-white",
        orange: "bg-guardia-orange-500 text-white",
        pink: "bg-guardia-pink-500 text-white",
        yellow: "bg-guardia-yellow-500 text-guardia-violet-900",
        green: "bg-signal-green text-white",
        blue: "bg-signal-blue text-white",
        gray: "bg-guardia-gray-500 text-white",
      },
    },
    defaultVariants: {
      color: "violet",
    },
  },
);

export type AvatarFallbackColor = NonNullable<
  VariantProps<typeof avatarFallbackVariants>["color"]
>;

export interface AvatarFallbackProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof avatarFallbackVariants> {}

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, color, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="avatar-fallback"
      className={cn(avatarFallbackVariants({ color }), className)}
      {...props}
    />
  ),
);
AvatarFallback.displayName = "AvatarFallback";

/* ───────── Status dot ───────── */

const avatarStatusVariants = cva(
  "absolute bottom-0 right-0 block size-[30%] min-h-2 min-w-2 rounded-full border-2 border-white",
  {
    variants: {
      status: {
        online: "bg-signal-green",
        offline: "bg-guardia-gray-200",
        busy: "bg-signal-red",
        away: "bg-signal-yellow",
      },
    },
    defaultVariants: {
      status: "online",
    },
  },
);

export type AvatarStatusType = NonNullable<
  VariantProps<typeof avatarStatusVariants>["status"]
>;

export interface AvatarStatusProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarStatusVariants> {
  /** Rótulo acessível descrevendo o estado. Default: traduzido do `status`. */
  label?: string;
}

const STATUS_LABELS: Record<AvatarStatusType, string> = {
  online: "Online",
  offline: "Offline",
  busy: "Ocupado",
  away: "Ausente",
};

const AvatarStatus = React.forwardRef<HTMLSpanElement, AvatarStatusProps>(
  ({ className, status = "online", label, ...props }, ref) => (
    <span
      ref={ref}
      role="status"
      data-slot="avatar-status"
      aria-label={label ?? STATUS_LABELS[status ?? "online"]}
      className={cn(avatarStatusVariants({ status }), className)}
      {...props}
    />
  ),
);
AvatarStatus.displayName = "AvatarStatus";

/* ───────── Helpers ───────── */

/**
 * Extrai iniciais de um nome. Regras:
 *  - Nome único       → 2 primeiras letras (ex: "Fernando" → "FE")
 *  - Múltiplos nomes  → primeira letra do primeiro + primeira do último
 *  - Vazio            → "?"
 *
 * Normalização NFD remove diacríticos (acentos, til, cedilha) para evitar
 * glifos faltantes em fontes que não cobrem todo o Unicode:
 *   initials("Zoë") → "ZO" (não "ZÖ")
 *   initials("João Gonçalves") → "JG"
 */
export function initials(name: string | undefined | null): string {
  if (!name) return "?";
  const stripped = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  const parts = stripped.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarStatus,
  avatarVariants,
  avatarFallbackVariants,
  avatarStatusVariants,
};
