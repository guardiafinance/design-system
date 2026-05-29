/**
 * Tiny JSX/TSX syntax highlighter for playgrounds.
 * Não é um tokenizer completo — é o suficiente para destacar
 * keywords, JSX tags/atributos, strings, comentários e números.
 *
 * Uso:
 *   <pre class="pg-example-code" data-lang="tsx">...código aqui...</pre>
 *   <script src="../_shared/highlight.js"></script>
 *
 * O script encontra todos os <pre data-lang> e substitui o conteúdo
 * por HTML com spans .tok-*.
 */
(function () {
  "use strict";

  const KEYWORDS = new Set([
    "const", "let", "var", "function", "return", "if", "else", "import", "from",
    "export", "default", "new", "class", "extends", "type", "interface",
    "as", "true", "false", "null", "undefined", "async", "await", "for", "while",
  ]);

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function highlight(code) {
    // Tokenize in a single pass with a regex that matches:
    //  - line/block comments
    //  - strings (single, double, template backticks)
    //  - JSX open/close tag names and attribute names
    //  - identifiers/keywords
    //  - numbers
    //  - everything else
    const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("[^"]*"|'[^']*'|`[^`]*`)|(<\/?[A-Za-z][\w.]*)|(\b[A-Za-z_$][\w$]*)(?=\s*=)|(\b[A-Za-z_$][\w$]*\b)|(\b\d+(?:\.\d+)?\b)|([{}()\[\],;:=<>/.!?&|+\-*])/g;

    let out = "";
    let last = 0;
    let m;
    while ((m = re.exec(code)) !== null) {
      out += escapeHtml(code.slice(last, m.index));
      const [full, com, str, tag, attr, ident, num, punct] = m;
      if (com) out += `<span class="tok-com">${escapeHtml(full)}</span>`;
      else if (str) out += `<span class="tok-str">${escapeHtml(full)}</span>`;
      else if (tag) out += `<span class="tok-tag">${escapeHtml(full)}</span>`;
      else if (attr) out += `<span class="tok-attr">${escapeHtml(full)}</span>`;
      else if (ident) {
        if (KEYWORDS.has(full)) out += `<span class="tok-kw">${full}</span>`;
        else out += escapeHtml(full);
      }
      else if (num) out += `<span class="tok-num">${full}</span>`;
      else if (punct) out += `<span class="tok-punct">${escapeHtml(full)}</span>`;
      else out += escapeHtml(full);
      last = m.index + full.length;
    }
    out += escapeHtml(code.slice(last));
    return out;
  }

  function trimIndent(raw) {
    // Remove leading/trailing blank lines and outdent by the common
    // minimum leading-whitespace across non-blank lines.
    const lines = raw.replace(/^\n+|\s+$/g, "").split("\n");
    let min = Infinity;
    for (const l of lines) {
      if (!l.trim()) continue;
      const m = l.match(/^[ \t]*/);
      if (m && m[0].length < min) min = m[0].length;
    }
    if (!isFinite(min) || min === 0) return lines.join("\n");
    return lines.map((l) => l.slice(min)).join("\n");
  }

  function run() {
    const blocks = document.querySelectorAll("pre.pg-example-code[data-lang]");
    blocks.forEach((el) => {
      if (el.dataset.highlighted === "1") return;
      const src = trimIndent(el.textContent || "");
      el.innerHTML = highlight(src);
      el.dataset.highlighted = "1";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
  // Expose for manual re-runs
  window.__pgHighlight = run;
})();
