import { Button } from "@ds/components/button";
import { ButtonGroup } from "@ds/components/button-group";
import {
  ChevronLeft,
  ChevronRight,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

export function AttachedRow() {
  return (
    <ButtonGroup aria-label="Navegação">
      <Button variant="outline" leadingIcon={<ChevronLeft />}>
        Anterior
      </Button>
      <Button variant="outline">Atual</Button>
      <Button variant="outline" trailingIcon={<ChevronRight />}>
        Próximo
      </Button>
    </ButtonGroup>
  );
}

export function SpacedRow() {
  return (
    <ButtonGroup attached={false}>
      <Button variant="outline">Salvar</Button>
      <Button variant="outline">Salvar e continuar</Button>
      <Button variant="outline">Cancelar</Button>
    </ButtonGroup>
  );
}

export function VerticalRow() {
  return (
    <ButtonGroup orientation="vertical" aria-label="Ações do documento">
      <Button variant="outline">Exportar</Button>
      <Button variant="outline">Imprimir</Button>
      <Button variant="outline">Compartilhar</Button>
    </ButtonGroup>
  );
}

export function ToolbarRow() {
  return (
    <>
      <ButtonGroup role="toolbar" aria-label="Formatação de texto">
        <Button variant="outline" size="icon" aria-label="Negrito">
          <Bold />
        </Button>
        <Button variant="outline" size="icon" aria-label="Itálico">
          <Italic />
        </Button>
        <Button variant="outline" size="icon" aria-label="Sublinhado">
          <Underline />
        </Button>
      </ButtonGroup>
      <ButtonGroup role="toolbar" aria-label="Alinhamento">
        <Button variant="outline" size="icon" aria-label="Alinhar à esquerda">
          <AlignLeft />
        </Button>
        <Button variant="outline" size="icon" aria-label="Centralizar">
          <AlignCenter />
        </Button>
        <Button variant="outline" size="icon" aria-label="Alinhar à direita">
          <AlignRight />
        </Button>
      </ButtonGroup>
    </>
  );
}

export function MixedVariantsRow() {
  return (
    <ButtonGroup>
      <Button variant="default">Aprovar</Button>
      <Button variant="destructive">Rejeitar</Button>
    </ButtonGroup>
  );
}
