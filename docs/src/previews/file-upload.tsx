import { useState } from "react";
import {
  FileUpload,
  type FileRejection,
  type FileUploader,
  type UploadFile,
} from "@ds/components/file-upload";

export function BasicRow() {
  return (
    <div className="w-full max-w-md">
      <FileUpload />
    </div>
  );
}

export function ValidationAcceptRow() {
  return (
    <div className="w-full max-w-md">
      <FileUpload accept=".pdf,.png" hint="Apenas PDF e PNG" />
    </div>
  );
}

export function ValidationMaxSizeRow() {
  return (
    <div className="w-full max-w-md">
      <FileUpload
        maxSize={1024 * 1024}
        hint="Máximo 1 MB · arquivos maiores rejeitados automaticamente"
      />
    </div>
  );
}

export function CompactRow() {
  return (
    <div className="w-full max-w-md">
      <FileUpload compact hint="Variante densa para sidebars / cards" />
    </div>
  );
}

export function MultipleRow() {
  return (
    <div className="w-full max-w-md">
      <FileUpload multiple hint="Selecione vários arquivos de uma vez" />
    </div>
  );
}

export function StatusListRow() {
  const files: UploadFile[] = [
    { name: "extrato-marco-2025.pdf", size: 425_000, status: "done" },
    {
      name: "comprovante.png",
      size: 120_000,
      status: "uploading",
      progress: 64,
    },
    {
      name: "boleto-vencido.zip",
      size: 8_400_000,
      status: "error",
      error: "Tamanho excede 5 MB",
    },
  ];
  return (
    <div className="w-full max-w-md">
      <FileUpload files={files} onRemove={() => {}} />
    </div>
  );
}

/**
 * Auto-upload com `uploader`: o componente atualiza a barra de progresso
 * sozinho conforme o XHR sobe. Esta versão simula via setInterval com
 * progresso aleatório, mas em produção é só ligar o uploader ao XHR
 * real.
 */
export function AutoUploadRow() {
  const fakeUploader: FileUploader = ({ onProgress, signal }) =>
    new Promise((resolve, reject) => {
      let p = 0;
      const tick = setInterval(() => {
        if (signal.aborted) {
          clearInterval(tick);
          return;
        }
        p = Math.min(100, p + Math.floor(Math.random() * 12) + 4);
        onProgress(p);
        if (p >= 100) {
          clearInterval(tick);
          resolve();
        }
      }, 220);
      signal.addEventListener("abort", () => {
        clearInterval(tick);
        reject(new Error("Cancelado"));
      });
    });

  return (
    <div className="w-full max-w-md">
      <FileUpload
        multiple
        accept=".pdf,.png,.jpg"
        maxSize={5 * 1024 * 1024}
        hint="PDF · PNG · JPG até 5 MB · upload simulado com progresso"
        uploader={fakeUploader}
      />
    </div>
  );
}

/**
 * onReject custom: rejeições não aparecem na lista; o consumer mostra
 * fora (ex.: toast / banner).
 */
export function RejectCallbackRow() {
  const [rejections, setRejections] = useState<FileRejection[]>([]);
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <FileUpload
        accept=".pdf"
        maxSize={1024 * 100}
        hint="PDF até 100 KB · rejeições aparecem como banner abaixo"
        onReject={(rs) => setRejections((prev) => [...prev, ...rs])}
      />
      {rejections.length > 0 && (
        <div className="rounded-md border border-signal-red/30 bg-signal-red/10 p-3 text-sm text-signal-red">
          <strong>{rejections.length} arquivo(s) rejeitado(s):</strong>
          <ul className="ml-4 list-disc">
            {rejections.map((r, i) => (
              <li key={i}>
                {r.file.name} — {r.message}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-2 text-xs underline underline-offset-2"
            onClick={() => setRejections([])}
          >
            limpar
          </button>
        </div>
      )}
    </div>
  );
}

export function DisabledRow() {
  return (
    <div className="w-full max-w-md">
      <FileUpload disabled hint="Aguarde o processamento anterior…" />
    </div>
  );
}

/**
 * Variant minimalista — botão simples para uso inline. Toda a validação,
 * lista de arquivos e auto-upload continuam funcionando.
 */
export function ButtonVariantRow() {
  return (
    <div className="flex flex-col gap-2">
      <FileUpload
        variant="button"
        buttonLabel="Anexar comprovante"
        accept=".pdf,.png,.jpg"
        maxSize={5 * 1024 * 1024}
      />
    </div>
  );
}

export function ButtonSizesRow() {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <FileUpload variant="button" buttonSize="sm" buttonLabel="Small" />
      <FileUpload variant="button" buttonSize="md" buttonLabel="Medium" />
      <FileUpload variant="button" buttonSize="lg" buttonLabel="Large" />
    </div>
  );
}

export function ButtonWithUploaderRow() {
  const fakeUploader: FileUploader = ({ onProgress, signal }) =>
    new Promise((resolve, reject) => {
      let p = 0;
      const tick = setInterval(() => {
        if (signal.aborted) return clearInterval(tick);
        p = Math.min(100, p + Math.floor(Math.random() * 14) + 6);
        onProgress(p);
        if (p >= 100) {
          clearInterval(tick);
          resolve();
        }
      }, 220);
      signal.addEventListener("abort", () => {
        clearInterval(tick);
        reject(new Error("Cancelado"));
      });
    });
  return (
    <div className="w-full max-w-md">
      <FileUpload
        variant="button"
        multiple
        accept=".pdf,.png,.jpg"
        maxSize={5 * 1024 * 1024}
        hint="PDF · PNG · JPG até 5 MB"
        uploader={fakeUploader}
      />
    </div>
  );
}

export function ButtonInTableRow() {
  return (
    <table className="w-full max-w-2xl border-collapse text-sm">
      <thead>
        <tr className="border-b border-border text-left text-fg-muted">
          <th className="py-2 font-medium">Documento</th>
          <th className="py-2 font-medium">Anexo</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-border">
          <td className="py-3">Contrato social</td>
          <td className="py-3">
            <FileUpload
              variant="button"
              buttonSize="sm"
              accept=".pdf"
              buttonLabel="Anexar PDF"
            />
          </td>
        </tr>
        <tr className="border-b border-border">
          <td className="py-3">Cartão CNPJ</td>
          <td className="py-3">
            <FileUpload
              variant="button"
              buttonSize="sm"
              accept=".pdf,.png"
              buttonLabel="Anexar"
            />
          </td>
        </tr>
        <tr>
          <td className="py-3">Comprovante de endereço</td>
          <td className="py-3">
            <FileUpload
              variant="button"
              buttonSize="sm"
              buttonLabel="Anexar"
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
