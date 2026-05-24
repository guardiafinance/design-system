#!/usr/bin/env node
/**
 * Gera `__image_snapshots__/__diff_output__/index.html` com base × received
 * × diff lado a lado por story+tema. Lido pelo reviewer quando o gate
 * visual falha, sem precisar baixar o zip de PNGs soltas.
 *
 * Entrada:
 *   __image_snapshots__/__diff_output__/{titleSegments}/{theme}/
 *     ├── <variant>-diff.png        (composite expected | diff | received)
 *     └── <variant>-received.png    (current render, via storeReceivedOnFailure)
 *
 * Baseline correspondente:
 *   __image_snapshots__/{titleSegments}/{theme}/<variant>.png
 *
 * Saida:
 *   __image_snapshots__/__diff_output__/index.html
 *     - 3 imagens lado a lado por entry (base | received | diff)
 *     - Cards agrupados por componente
 *     - Header com count de falhas + branch/commit do CI (quando GH Actions env disponivel)
 *
 * Zero deps externas — Node stdlib + template literal HTML. Trade-off
 * registrado em docs/adr/ADR-001-visual-diff-report-tooling.md.
 *
 * Usage:
 *   node scripts/generate-diff-report.mjs
 *   node scripts/generate-diff-report.mjs --output custom/path/index.html
 */
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, posix, relative } from "node:path";

const ROOT = process.cwd();
const BASELINES_DIR = join(ROOT, "__image_snapshots__");
const DIFF_OUTPUT_DIR = join(BASELINES_DIR, "__diff_output__");

const argIdx = process.argv.indexOf("--output");
const OUTPUT_HTML = argIdx > 0 && process.argv[argIdx + 1]
  ? join(ROOT, process.argv[argIdx + 1])
  : join(DIFF_OUTPUT_DIR, "index.html");

if (!existsSync(DIFF_OUTPUT_DIR)) {
  // Nenhuma falha visual nesta execucao — script noop (CI nao vai
  // chamar este script no caminho feliz, mas defensivamente nao explode
  // se for invocado vazio).
  console.log("- No __diff_output__ directory; nothing to report.");
  process.exit(0);
}

/**
 * Caminha recursivo retornando arquivos com path absoluto.
 * `withFileTypes: true` devolve o tipo no Dirent, evitando um statSync
 * por entrada (especialmente relevante quando o catalogo cresce).
 */
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(abs));
    } else if (entry.isFile()) {
      out.push(abs);
    }
  }
  return out;
}

const allFiles = walk(DIFF_OUTPUT_DIR);
const diffFiles = allFiles.filter((f) => f.endsWith("-diff.png"));

if (diffFiles.length === 0) {
  console.log("- No *-diff.png found; nothing to report.");
  // Ainda escreve um HTML vazio para evitar 404 quando o caminho e
  // referenciado no PR summary mas a falha foi consertada antes do
  // upload do artifact.
  writeFileSync(OUTPUT_HTML, renderEmpty(), "utf8");
  process.exit(0);
}

/**
 * Para cada diff, extrai metadados e localiza baseline + received.
 * Retorna o caminho POSIX relativo ao diretorio do index.html — o HTML
 * referencia imagens via `<img src="...">` e o reviewer abre o report
 * direto do filesystem ou de um artifact do GH Actions.
 */
function entryFor(diffAbs) {
  // .../__diff_output__/{titleSegments}/{theme}/<variant>-diff.png
  const relFromDiff = relative(DIFF_OUTPUT_DIR, diffAbs).split(/[\\/]/);
  if (relFromDiff.length < 3) {
    return null;
  }
  const filename = relFromDiff[relFromDiff.length - 1];
  const theme = relFromDiff[relFromDiff.length - 2];
  const titleSegments = relFromDiff.slice(0, -2);
  const variant = filename.replace(/-diff\.png$/, "");

  const baselineAbs = join(
    BASELINES_DIR,
    ...titleSegments,
    theme,
    `${variant}.png`,
  );
  const receivedAbs = join(
    DIFF_OUTPUT_DIR,
    ...titleSegments,
    theme,
    `${variant}-received.png`,
  );

  const outputDir = dirname(OUTPUT_HTML);
  const toRel = (abs) => posix.normalize(relative(outputDir, abs).split(/[\\/]/).join("/"));

  return {
    titleSegments,
    theme,
    variant,
    componentKey: titleSegments.join("/"),
    title: `${titleSegments.join("/")} · ${variant} · ${theme}`,
    baseline: existsSync(baselineAbs) ? toRel(baselineAbs) : null,
    received: existsSync(receivedAbs) ? toRel(receivedAbs) : null,
    diff: toRel(diffAbs),
  };
}

const entries = diffFiles
  .map(entryFor)
  .filter((e) => e !== null)
  .sort((a, b) =>
    a.componentKey === b.componentKey
      ? a.variant === b.variant
        ? a.theme.localeCompare(b.theme)
        : a.variant.localeCompare(b.variant)
      : a.componentKey.localeCompare(b.componentKey),
  );

const grouped = entries.reduce((acc, e) => {
  (acc[e.componentKey] ??= []).push(e);
  return acc;
}, {});

writeFileSync(OUTPUT_HTML, renderHtml(grouped, entries.length), "utf8");
console.log(
  `v Wrote ${OUTPUT_HTML} (${entries.length} failing snapshot${entries.length === 1 ? "" : "s"} across ${Object.keys(grouped).length} component${Object.keys(grouped).length === 1 ? "" : "s"})`,
);

// ----------------------------- rendering -----------------------------

function escape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderImageCell(label, src) {
  if (!src) {
    return `<figure class="cell cell-missing"><figcaption>${escape(label)}</figcaption><div class="missing">missing</div></figure>`;
  }
  return `<figure class="cell"><figcaption>${escape(label)}</figcaption><a href="${escape(src)}" target="_blank" rel="noopener"><img src="${escape(src)}" alt="${escape(label)}" loading="lazy"></a></figure>`;
}

function renderEntry(e) {
  return `
    <article class="entry" data-component="${escape(e.componentKey)}" data-theme="${escape(e.theme)}">
      <header><h3>${escape(e.title)}</h3></header>
      <div class="cells">
        ${renderImageCell("baseline", e.baseline)}
        ${renderImageCell("received", e.received)}
        ${renderImageCell("diff", e.diff)}
      </div>
    </article>
  `;
}

function renderGroup(componentKey, items) {
  return `
    <section class="group">
      <h2>${escape(componentKey)} <span class="count">${items.length}</span></h2>
      ${items.map(renderEntry).join("\n")}
    </section>
  `;
}

function renderHeader(total) {
  const ref = process.env.GITHUB_REF_NAME || process.env.GITHUB_HEAD_REF || "";
  const sha = (process.env.GITHUB_SHA || "").slice(0, 7);
  const runUrl =
    process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : "";

  const ciMeta = [
    ref ? `branch <code>${escape(ref)}</code>` : "",
    sha ? `commit <code>${escape(sha)}</code>` : "",
    runUrl ? `<a href="${escape(runUrl)}" target="_blank" rel="noopener">workflow run</a>` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return `
    <header class="page-header">
      <h1>Visual regression diff report</h1>
      <p class="summary">
        <strong>${total}</strong> failing snapshot${total === 1 ? "" : "s"}
        ${ciMeta ? ` · ${ciMeta}` : ""}
      </p>
    </header>
  `;
}

function renderHtml(grouped, total) {
  const groupHtml = Object.keys(grouped)
    .sort()
    .map((k) => renderGroup(k, grouped[k]))
    .join("\n");
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Visual regression diff report (${total})</title>
<style>
  :root {
    /* Gray 900 (#17171b) para fundo da pagina e Mono Black (#0e1016)
     * reservado a texto/icone seguem a hierarquia de superficie do
     * design system em dark mode. */
    --bg: #17171b;
    --bg-elev: #1a1d29;
    --fg: #fdfdfd;
    --fg-muted: #9ca3af;
    --border: #2d3142;
    --accent: #e07400;
    --danger: #ff3131;
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
    background: var(--bg);
    color: var(--fg);
    margin: 0;
    padding: 1.5rem;
    line-height: 1.5;
  }
  code { font-family: ui-monospace, "JetBrains Mono", monospace; font-size: 0.85em; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  .page-header { margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
  .page-header h1 { margin: 0 0 0.25rem; font-size: 1.5rem; }
  .summary { color: var(--fg-muted); margin: 0; }
  .summary strong { color: var(--danger); }
  .group { margin-bottom: 2.5rem; }
  .group > h2 { font-size: 1.15rem; margin: 0 0 1rem; display: flex; align-items: center; gap: 0.5rem; }
  .count { background: var(--bg-elev); color: var(--fg-muted); padding: 0.1rem 0.5rem; border-radius: 99px; font-size: 0.8rem; font-weight: normal; }
  .entry { background: var(--bg-elev); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
  .entry > header > h3 { margin: 0 0 0.75rem; font-size: 0.95rem; font-weight: 600; color: var(--fg-muted); font-family: ui-monospace, monospace; }
  .cells { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .cell { margin: 0; }
  .cell figcaption { font-size: 0.75rem; color: var(--fg-muted); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .cell img { width: 100%; height: auto; border: 1px solid var(--border); border-radius: 4px; background: #fff; display: block; }
  .cell-missing .missing { display: flex; align-items: center; justify-content: center; height: 8rem; border: 1px dashed var(--border); border-radius: 4px; color: var(--fg-muted); font-style: italic; }
  @media (max-width: 800px) {
    .cells { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
${renderHeader(total)}
${groupHtml}
</body>
</html>
`;
}

function renderEmpty() {
  return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Visual regression diff report (0)</title></head>
<body style="font-family:-apple-system,Roboto,sans-serif;padding:2rem;background:#17171b;color:#fdfdfd;">
<h1>Visual regression diff report</h1>
<p>0 failing snapshots — gate visual passou.</p>
</body>
</html>
`;
}
