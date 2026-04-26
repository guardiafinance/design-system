import { Badge } from "@ds/components/badge";
import { Check, CircleAlert, CircleDot, Sparkles } from "lucide-react";

const VARIANTS = [
  "neutral",
  "brand",
  "accent",
  "success",
  "warning",
  "danger",
  "info",
] as const;

export function SoftRow() {
  return (
    <>
      {VARIANTS.map((v) => (
        <Badge key={v} variant={v}>
          {v}
        </Badge>
      ))}
    </>
  );
}

export function SolidRow() {
  return (
    <>
      {VARIANTS.map((v) => (
        <Badge key={v} variant={v} appearance="solid">
          {v}
        </Badge>
      ))}
    </>
  );
}

export function OutlineRow() {
  return (
    <>
      {VARIANTS.map((v) => (
        <Badge key={v} variant={v} appearance="outline">
          {v}
        </Badge>
      ))}
    </>
  );
}

export function DotRow() {
  return (
    <>
      <Badge variant="success" dot>
        Em dia
      </Badge>
      <Badge variant="warning" dot>
        Pendente
      </Badge>
      <Badge variant="danger" dot>
        Atrasado
      </Badge>
      <Badge variant="info" dot>
        Em análise
      </Badge>
    </>
  );
}

export function IconsRow() {
  return (
    <>
      <Badge variant="success" leadingIcon={<Check />}>
        Conciliado
      </Badge>
      <Badge variant="warning" leadingIcon={<CircleAlert />}>
        Revisar
      </Badge>
      <Badge variant="brand" leadingIcon={<Sparkles />}>
        Novo
      </Badge>
      <Badge variant="info" trailingIcon={<CircleDot />}>
        Ao vivo
      </Badge>
    </>
  );
}

export function ShapeRow() {
  return (
    <>
      <Badge variant="brand" shape="pill">
        pill
      </Badge>
      <Badge variant="brand" shape="square">
        square
      </Badge>
    </>
  );
}

export function CountsRow() {
  return (
    <>
      <Badge variant="neutral" appearance="solid">
        12
      </Badge>
      <Badge variant="accent" appearance="solid">
        3 novos
      </Badge>
      <Badge variant="danger" appearance="solid">
        99+
      </Badge>
    </>
  );
}
