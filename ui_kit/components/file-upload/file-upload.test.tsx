import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  FileUpload,
  formatBytes,
  isAccepted,
  type UploadFile,
  type FileRejection,
  type FileUploader,
} from "./index";

function makeFile(name: string, size = 1024, type = "text/plain") {
  const f = new File(["x".repeat(size)], name, { type });
  /* jsdom fixa o size em 1 — sobrescreve para o tamanho declarado */
  Object.defineProperty(f, "size", { value: size });
  return f;
}

describe("formatBytes", () => {
  it("formata bytes (< 1024)", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
  });
  it("formata KB (< 1MB)", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });
  it("formata MB", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
    expect(formatBytes(2.5 * 1024 * 1024)).toBe("2.5 MB");
  });
});

describe("isAccepted", () => {
  it("aceita tudo quando accept está ausente", () => {
    expect(isAccepted(makeFile("a.pdf"), undefined)).toBe(true);
  });

  it("casa por extensão", () => {
    const pdf = makeFile("doc.pdf", 100, "application/pdf");
    expect(isAccepted(pdf, ".pdf")).toBe(true);
    expect(isAccepted(pdf, ".docx")).toBe(false);
  });

  it("é case-insensitive na extensão", () => {
    const pdf = makeFile("DOC.PDF", 100, "application/pdf");
    expect(isAccepted(pdf, ".pdf")).toBe(true);
  });

  it("casa por MIME exato", () => {
    const pdf = makeFile("doc.pdf", 100, "application/pdf");
    expect(isAccepted(pdf, "application/pdf")).toBe(true);
    expect(isAccepted(pdf, "image/png")).toBe(false);
  });

  it("casa por wildcard MIME (image/*)", () => {
    const png = makeFile("a.png", 100, "image/png");
    const jpg = makeFile("b.jpg", 100, "image/jpeg");
    const pdf = makeFile("c.pdf", 100, "application/pdf");
    expect(isAccepted(png, "image/*")).toBe(true);
    expect(isAccepted(jpg, "image/*")).toBe(true);
    expect(isAccepted(pdf, "image/*")).toBe(false);
  });

  it("aceita CSV de tipos", () => {
    const png = makeFile("a.png", 100, "image/png");
    const pdf = makeFile("b.pdf", 100, "application/pdf");
    const docx = makeFile(
      "c.docx",
      100,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    expect(isAccepted(png, "image/*,.pdf")).toBe(true);
    expect(isAccepted(pdf, "image/*,.pdf")).toBe(true);
    expect(isAccepted(docx, "image/*,.pdf")).toBe(false);
  });
});

describe("FileUpload — base", () => {
  it("renderiza o dropzone com texto padrão", () => {
    render(<FileUpload />);
    expect(screen.getByText(/Arraste arquivos aqui/)).toBeInTheDocument();
    expect(screen.getByText("clique para escolher")).toBeInTheDocument();
  });

  it("title customizado sobrescreve o padrão", () => {
    render(<FileUpload title="Importe seu extrato" />);
    expect(screen.getByText("Importe seu extrato")).toBeInTheDocument();
  });

  it("renderiza hint", () => {
    render(<FileUpload hint="PDF até 10 MB" />);
    expect(screen.getByText("PDF até 10 MB")).toBeInTheDocument();
  });

  it("hint automático via maxSize", () => {
    render(<FileUpload maxSize={5 * 1024 * 1024} />);
    expect(screen.getByText("Máx. 5.0 MB")).toBeInTheDocument();
  });

  it("aria-describedby liga ao hint", () => {
    const { container } = render(<FileUpload hint="PDF" />);
    const input = container.querySelector("input[type='file']")!;
    const id = input.getAttribute("aria-describedby");
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)).toHaveTextContent("PDF");
  });

  it("input recebe accept e multiple", () => {
    const { container } = render(
      <FileUpload accept="image/*,.pdf" multiple />,
    );
    const input = container.querySelector("input[type='file']")!;
    expect(input).toHaveAttribute("accept", "image/*,.pdf");
    expect(input).toHaveAttribute("multiple");
  });

  it("disabled marca input como disabled", () => {
    const { container } = render(<FileUpload disabled />);
    expect(container.querySelector("input[type='file']")).toBeDisabled();
  });

  it("compact reduz padding do dropzone", () => {
    const { container } = render(<FileUpload compact />);
    expect(container.querySelector("label")!.className).toMatch(/p-3/);
  });

  it("dropzone aplica classe de drag durante dragEnter", () => {
    const { container } = render(<FileUpload />);
    const label = container.querySelector("label")!;
    fireEvent.dragEnter(label);
    expect(label.className).toMatch(/border-guardia-violet-500/);
  });
});

describe("FileUpload — controlled", () => {
  it("renderiza files controlled", () => {
    render(
      <FileUpload
        files={[{ name: "extrato.pdf", size: 2048, status: "done" }]}
      />,
    );
    expect(screen.getByText("extrato.pdf")).toBeInTheDocument();
    expect(screen.getByText("2.0 KB")).toBeInTheDocument();
  });

  it("status uploading mostra progressbar com aria", () => {
    render(
      <FileUpload
        files={[
          {
            name: "big.zip",
            size: 1024 * 1024 * 5,
            status: "uploading",
            progress: 42,
          },
        ]}
      />,
    );
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-label", "Enviando big.zip");
  });

  it("status error mostra mensagem", () => {
    render(
      <FileUpload
        files={[
          {
            name: "bad.pdf",
            size: 100,
            status: "error",
            error: "Tipo não permitido",
          },
        ]}
      />,
    );
    expect(screen.getByText("Tipo não permitido")).toBeInTheDocument();
  });

  it("onRemove + files renderiza X", async () => {
    const onRemove = vi.fn();
    render(
      <FileUpload
        files={[{ name: "a.pdf", size: 100, status: "done" }]}
        onRemove={onRemove}
      />,
    );
    await userEvent.click(screen.getByLabelText("Remover a.pdf"));
    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it("sem onRemove (controlled) não renderiza X", () => {
    render(
      <FileUpload files={[{ name: "a.pdf", size: 100, status: "done" }]} />,
    );
    expect(screen.queryByLabelText(/Remover/)).not.toBeInTheDocument();
  });

  it("onFiles é chamado com files aceitos via input", async () => {
    const onFiles = vi.fn();
    const { container } = render(<FileUpload files={[]} onFiles={onFiles} />);
    const input = container.querySelector("input[type='file']") as HTMLInputElement;
    await userEvent.upload(input, makeFile("ok.pdf", 1024));
    expect(onFiles).toHaveBeenCalledTimes(1);
    expect(onFiles.mock.calls[0]![0][0].name).toBe("ok.pdf");
  });

  it("disabled bloqueia drop", () => {
    const onFiles = vi.fn();
    const { container } = render(
      <FileUpload disabled files={[]} onFiles={onFiles} />,
    );
    fireEvent.drop(container.querySelector("label")!, {
      dataTransfer: { files: [makeFile("a.pdf")], types: ["Files"] },
    });
    expect(onFiles).not.toHaveBeenCalled();
  });

  it("name é repassado", () => {
    const { container } = render(<FileUpload name="anexo" />);
    expect(container.querySelector("input[type='file']")).toHaveAttribute(
      "name",
      "anexo",
    );
  });
});

describe("FileUpload — validação", () => {
  it("rejeita por accept (extensão errada via drop, que ignora accept nativamente)", () => {
    const onFiles = vi.fn();
    const onReject = vi.fn<(r: FileRejection[]) => void>();
    const { container } = render(
      <FileUpload
        accept=".pdf"
        files={[]}
        onFiles={onFiles}
        onReject={onReject}
      />,
    );
    fireEvent.drop(container.querySelector("label")!, {
      dataTransfer: { files: [makeFile("doc.docx", 100)], types: ["Files"] },
    });
    expect(onFiles).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledTimes(1);
    const rej = onReject.mock.calls[0]![0]!;
    expect(rej[0]!.reason).toBe("type");
  });

  it("rejeita por maxSize", async () => {
    const onFiles = vi.fn();
    const onReject = vi.fn<(r: FileRejection[]) => void>();
    const { container } = render(
      <FileUpload
        maxSize={500}
        files={[]}
        onFiles={onFiles}
        onReject={onReject}
      />,
    );
    await userEvent.upload(
      container.querySelector("input[type='file']") as HTMLInputElement,
      makeFile("big.pdf", 1024),
    );
    expect(onFiles).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledTimes(1);
    expect(onReject.mock.calls[0]![0]![0]!.reason).toBe("size");
    expect(onReject.mock.calls[0]![0]![0]!.message).toMatch(/500/);
  });

  it("validate custom retorna mensagem que vira reason=custom", async () => {
    const onFiles = vi.fn();
    const onReject = vi.fn<(r: FileRejection[]) => void>();
    const validate = (f: File) =>
      f.name.includes("forbidden") ? "Nome contém palavra proibida" : null;
    const { container } = render(
      <FileUpload
        validate={validate}
        files={[]}
        onFiles={onFiles}
        onReject={onReject}
      />,
    );
    await userEvent.upload(
      container.querySelector("input[type='file']") as HTMLInputElement,
      makeFile("forbidden.pdf", 100),
    );
    expect(onFiles).not.toHaveBeenCalled();
    expect(onReject.mock.calls[0]![0]![0]!.reason).toBe("custom");
    expect(onReject.mock.calls[0]![0]![0]!.message).toBe(
      "Nome contém palavra proibida",
    );
  });

  it("aceita arquivos que casam com accept (wildcard)", async () => {
    const onFiles = vi.fn();
    const onReject = vi.fn();
    const { container } = render(
      <FileUpload
        accept="image/*"
        files={[]}
        onFiles={onFiles}
        onReject={onReject}
      />,
    );
    await userEvent.upload(
      container.querySelector("input[type='file']") as HTMLInputElement,
      makeFile("a.png", 100, "image/png"),
    );
    expect(onFiles).toHaveBeenCalledTimes(1);
    expect(onReject).not.toHaveBeenCalled();
  });

  it("drop aplica validação (rejeita por extensão)", () => {
    const onFiles = vi.fn();
    const onReject = vi.fn<(r: FileRejection[]) => void>();
    const { container } = render(
      <FileUpload
        accept=".pdf"
        files={[]}
        onFiles={onFiles}
        onReject={onReject}
      />,
    );
    fireEvent.drop(container.querySelector("label")!, {
      dataTransfer: {
        files: [makeFile("blocked.exe", 100)],
        types: ["Files"],
      },
    });
    expect(onFiles).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it("sem onReject, rejeitado aparece na lista interna como error", () => {
    const { container } = render(<FileUpload accept=".pdf" />);
    /* drop em vez de input.upload, que respeita accept e filtra antes */
    fireEvent.drop(container.querySelector("label")!, {
      dataTransfer: { files: [makeFile("bad.exe", 100)], types: ["Files"] },
    });
    expect(screen.getByText("bad.exe")).toBeInTheDocument();
    expect(
      screen.getByText("Tipo de arquivo não permitido"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("li[data-status='error']"),
    ).toBeInTheDocument();
  });
});

describe("FileUpload — variant=button", () => {
  it("renderiza botão minimalista com label default (singular)", () => {
    render(<FileUpload variant="button" />);
    expect(
      screen.getByRole("button", { name: /Selecionar arquivo/ }),
    ).toBeInTheDocument();
  });

  it("label default vira plural quando multiple=true", () => {
    render(<FileUpload variant="button" multiple />);
    expect(
      screen.getByRole("button", { name: "Selecionar arquivos" }),
    ).toBeInTheDocument();
  });

  it("buttonLabel customizado sobrescreve o default", () => {
    render(<FileUpload variant="button" buttonLabel="Anexar comprovante" />);
    expect(
      screen.getByRole("button", { name: "Anexar comprovante" }),
    ).toBeInTheDocument();
  });

  it("não renderiza dropzone (label) em variant=button", () => {
    const { container } = render(<FileUpload variant="button" />);
    /* O input file fica DENTRO do <button>, não num <label> */
    expect(container.querySelector("label")).toBeNull();
  });

  it("clique no botão abre o file picker (chama .click() no input)", async () => {
    const { container } = render(<FileUpload variant="button" />);
    const input = container.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click");
    await userEvent.click(screen.getByRole("button"));
    expect(clickSpy).toHaveBeenCalled();
  });

  it("disabled marca o botão como disabled e bloqueia o input", async () => {
    const { container } = render(<FileUpload variant="button" disabled />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(container.querySelector("input[type='file']")).toBeDisabled();
  });

  it("hint aparece abaixo do botão (mesmo aria-describedby)", () => {
    const { container } = render(
      <FileUpload variant="button" hint="PDF até 5 MB" />,
    );
    const button = screen.getByRole("button");
    const id = button.getAttribute("aria-describedby");
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)).toHaveTextContent("PDF até 5 MB");
  });

  it("buttonSize=sm aplica h-8", () => {
    render(<FileUpload variant="button" buttonSize="sm" />);
    expect(screen.getByRole("button")).toHaveClass("h-8");
  });

  it("buttonSize=lg aplica h-[46px]", () => {
    render(<FileUpload variant="button" buttonSize="lg" />);
    expect(screen.getByRole("button")).toHaveClass("h-[46px]");
  });

  it("validação e auto-upload continuam funcionando em variant=button", async () => {
    const uploader = vi.fn<FileUploader>(() => Promise.resolve());
    const { container } = render(
      <FileUpload variant="button" uploader={uploader} accept=".pdf" />,
    );
    /* Drop não é suportado no botão, mas seleção via input change funciona.
     * Usamos fireEvent.change para simular seleção. */
    const input = container.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;
    Object.defineProperty(input, "files", {
      value: [makeFile("ok.pdf", 100)],
      configurable: true,
    });
    fireEvent.change(input);
    expect(uploader).toHaveBeenCalledTimes(1);
  });
});

describe("FileUpload — auto-upload", () => {
  it("uploader é chamado para cada arquivo aceito", async () => {
    const uploader = vi.fn<FileUploader>(() => new Promise(() => {}));
    const { container } = render(<FileUpload uploader={uploader} multiple />);
    await userEvent.upload(
      container.querySelector("input[type='file']") as HTMLInputElement,
      [makeFile("a.pdf", 100), makeFile("b.pdf", 100)],
    );
    expect(uploader).toHaveBeenCalledTimes(2);
    /* progress 0% inicial */
    expect(screen.getAllByRole("progressbar")).toHaveLength(2);
  });

  it("onProgress do uploader atualiza a barra", async () => {
    let captured: ((p: number) => void) | undefined;
    const uploader = vi.fn<FileUploader>(({ onProgress }) => {
      captured = onProgress;
      return new Promise(() => {});
    });
    const { container } = render(<FileUpload uploader={uploader} />);
    await userEvent.upload(
      container.querySelector("input[type='file']") as HTMLInputElement,
      makeFile("a.pdf", 1024),
    );
    expect(captured).toBeDefined();
    act(() => captured!(45));
    await waitFor(() => {
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "45",
      );
    });
  });

  it("uploader resolvendo marca status=done", async () => {
    const onUploadSuccess = vi.fn();
    const uploader = vi.fn<FileUploader>(() => Promise.resolve());
    const { container } = render(
      <FileUpload uploader={uploader} onUploadSuccess={onUploadSuccess} />,
    );
    await userEvent.upload(
      container.querySelector("input[type='file']") as HTMLInputElement,
      makeFile("a.pdf", 100),
    );
    await waitFor(() => {
      expect(
        container.querySelector("li[data-status='done']"),
      ).toBeInTheDocument();
    });
    expect(onUploadSuccess).toHaveBeenCalledTimes(1);
  });

  it("uploader rejeitando marca status=error com mensagem", async () => {
    const onUploadError = vi.fn();
    const uploader = vi.fn<FileUploader>(() =>
      Promise.reject(new Error("Servidor indisponível")),
    );
    const { container } = render(
      <FileUpload uploader={uploader} onUploadError={onUploadError} />,
    );
    await userEvent.upload(
      container.querySelector("input[type='file']") as HTMLInputElement,
      makeFile("a.pdf", 100),
    );
    await waitFor(() => {
      expect(screen.getByText("Servidor indisponível")).toBeInTheDocument();
    });
    expect(
      container.querySelector("li[data-status='error']"),
    ).toBeInTheDocument();
    expect(onUploadError).toHaveBeenCalledTimes(1);
  });

  it("cancelar durante upload: aborta + mantém visível como 'Envio cancelado'", async () => {
    let captured: AbortSignal | undefined;
    const uploader = vi.fn<FileUploader>(({ signal }) => {
      captured = signal;
      return new Promise(() => {});
    });
    const { container } = render(<FileUpload uploader={uploader} />);
    await userEvent.upload(
      container.querySelector("input[type='file']") as HTMLInputElement,
      makeFile("a.pdf", 100),
    );
    expect(captured).toBeDefined();
    expect(captured!.aborted).toBe(false);

    /* Durante upload, o aria-label é "Cancelar envio" (não "Remover") */
    const cancelBtn = screen.getByLabelText("Cancelar envio de a.pdf");
    await userEvent.click(cancelBtn);

    /* Aborta o XHR */
    expect(captured!.aborted).toBe(true);
    /* Item permanece visível com status=error e mensagem "Envio cancelado" */
    expect(screen.getByText("a.pdf")).toBeInTheDocument();
    expect(screen.getByText("Envio cancelado")).toBeInTheDocument();
    expect(
      container.querySelector("li[data-status='error']"),
    ).toBeInTheDocument();
  });

  it("após cancelar, o botão vira 'Remover' e remove do estado", async () => {
    const uploader = vi.fn<FileUploader>(() => new Promise(() => {}));
    const { container } = render(<FileUpload uploader={uploader} />);
    await userEvent.upload(
      container.querySelector("input[type='file']") as HTMLInputElement,
      makeFile("a.pdf", 100),
    );
    /* Cancela */
    await userEvent.click(screen.getByLabelText("Cancelar envio de a.pdf"));
    /* Agora aria-label virou "Remover" */
    const removeBtn = await screen.findByLabelText("Remover a.pdf");
    expect(removeBtn).toBeInTheDocument();
    /* Click remove fora da lista */
    await userEvent.click(removeBtn);
    expect(screen.queryByText("a.pdf")).not.toBeInTheDocument();
  });

  it("uploader que resolve depois de cancelado NÃO vira 'done' (race-safe)", async () => {
    let resolveLater: (() => void) | undefined;
    const uploader = vi.fn<FileUploader>(() =>
      new Promise<void>((resolve) => {
        resolveLater = resolve;
      }),
    );
    const onUploadSuccess = vi.fn();
    const { container } = render(
      <FileUpload uploader={uploader} onUploadSuccess={onUploadSuccess} />,
    );
    await userEvent.upload(
      container.querySelector("input[type='file']") as HTMLInputElement,
      makeFile("a.pdf", 100),
    );
    /* Cancela */
    await userEvent.click(screen.getByLabelText("Cancelar envio de a.pdf"));
    expect(screen.getByText("Envio cancelado")).toBeInTheDocument();
    /* Uploader resolve "tarde" — não deve sobrescrever a mensagem nem disparar success */
    act(() => resolveLater!());
    await waitFor(() => {
      expect(screen.getByText("Envio cancelado")).toBeInTheDocument();
    });
    expect(onUploadSuccess).not.toHaveBeenCalled();
  });

  it("remover após upload bem-sucedido: aria-label é 'Remover'", async () => {
    const uploader = vi.fn<FileUploader>(() => Promise.resolve());
    const { container } = render(<FileUpload uploader={uploader} />);
    await userEvent.upload(
      container.querySelector("input[type='file']") as HTMLInputElement,
      makeFile("a.pdf", 100),
    );
    /* Espera virar done */
    await waitFor(() => {
      expect(
        container.querySelector("li[data-status='done']"),
      ).toBeInTheDocument();
    });
    /* Após done, label do botão é "Remover" */
    expect(screen.getByLabelText("Remover a.pdf")).toBeInTheDocument();
  });

  it("uploader não é chamado para arquivos rejeitados", async () => {
    const uploader = vi.fn<FileUploader>(() => Promise.resolve());
    const { container } = render(
      <FileUpload uploader={uploader} accept=".pdf" multiple />,
    );
    /* drop ignora accept; nosso componente valida explicitamente */
    fireEvent.drop(container.querySelector("label")!, {
      dataTransfer: {
        files: [makeFile("ok.pdf", 100), makeFile("blocked.exe", 100)],
        types: ["Files"],
      },
    });
    expect(uploader).toHaveBeenCalledTimes(1);
    /* 1 done + 1 error */
    await waitFor(() => {
      expect(
        container.querySelector("li[data-status='done']"),
      ).toBeInTheDocument();
    });
    expect(
      container.querySelector("li[data-status='error']"),
    ).toBeInTheDocument();
  });
});
