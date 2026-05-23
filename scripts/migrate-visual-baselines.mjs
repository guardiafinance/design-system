#!/usr/bin/env node
/**
 * One-shot migration: layout flat -> subdiretorio por title + tema.
 *
 *   OLD: __image_snapshots__/components-multi-select--default--dark.png
 *   NEW: __image_snapshots__/components/multi-select/dark/default.png
 *
 * Operacao preserva bytes (rename fisico). Cada arquivo tem sha256
 * verificado antes/depois; divergencia aborta o move daquele arquivo
 * e reporta no resumo. Por design, NAO regenera baseline — bytes vem
 * da renderizacao Ubuntu (lex memory feedback_visual_regression_ubuntu_sot).
 *
 * Mapping vem de `storybook-static/index.json` (build do Storybook).
 * Sem o manifest, o script aborta — derivar title/name pelo storyId
 * direto seria ambiguo (multi-select tem hifen, igual ao separador
 * de segmentos de title).
 *
 * Usage:
 *   npm run build-storybook
 *   node scripts/migrate-visual-baselines.mjs           # dry-run
 *   node scripts/migrate-visual-baselines.mjs --apply   # executa moves
 */
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";

const ROOT = process.cwd();
const BASELINES_DIR = join(ROOT, "__image_snapshots__");
const INDEX_JSON = join(ROOT, "storybook-static", "index.json");
const APPLY = process.argv.includes("--apply");

if (!existsSync(BASELINES_DIR)) {
  console.error(`x Baselines directory not found: ${BASELINES_DIR}`);
  process.exit(1);
}

if (!existsSync(INDEX_JSON)) {
  console.error(`x Storybook manifest not found: ${INDEX_JSON}`);
  console.error("  Run `npm run build-storybook` first.");
  process.exit(1);
}

const index = JSON.parse(readFileSync(INDEX_JSON, "utf8"));
// Storybook v8 index.json shape: { v: 5, entries: { [storyId]: { id, title, name, ... } } }
// Older formats used `stories` instead of `entries` — handle both defensively.
const entries = index.entries ?? index.stories ?? {};

if (Object.keys(entries).length === 0) {
  console.error("x Storybook manifest has zero entries.");
  process.exit(1);
}

/**
 * Kebab-case compativel com o Storybook (mesma transformacao aplicada
 * pelo `@storybook/csf` toId). Mantida em paralelo com a definicao em
 * `.storybook/test-runner.ts` — qualquer ajuste num lado exige ajuste
 * no outro. Validacao acontece via teste de paridade: cada storyId
 * existente no manifest tem que produzir um path do migrate igual ao
 * path que o runner geraria.
 */
function toKebab(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function newPathFor(title, name, theme) {
  const titleSegments = title.split("/").map(toKebab).filter(Boolean);
  return join(BASELINES_DIR, ...titleSegments, theme, `${toKebab(name)}.png`);
}

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

const files = readdirSync(BASELINES_DIR).filter((f) => f.endsWith(".png"));

if (files.length === 0) {
  console.log("- No flat baselines found at root — already migrated?");
  process.exit(0);
}

const summary = {
  total: files.length,
  moved: 0,
  alreadyMigrated: 0,
  skipped: 0,
  errors: 0,
};

for (const fname of files) {
  const base = fname.replace(/\.png$/, "");
  const parts = base.split("--");

  if (parts.length !== 3) {
    console.warn(`! Unexpected filename shape, skipping: ${fname}`);
    summary.skipped += 1;
    continue;
  }

  const [titleSlug, nameSlug, theme] = parts;
  const storyId = `${titleSlug}--${nameSlug}`;
  const entry = entries[storyId];

  if (!entry) {
    console.warn(`! No manifest entry for storyId="${storyId}" (file: ${fname})`);
    summary.skipped += 1;
    continue;
  }

  const oldAbsPath = join(BASELINES_DIR, fname);
  const newAbsPath = newPathFor(entry.title, entry.name, theme);

  if (oldAbsPath === newAbsPath) {
    summary.alreadyMigrated += 1;
    continue;
  }

  const oldHash = sha256(oldAbsPath);

  if (APPLY) {
    mkdirSync(dirname(newAbsPath), { recursive: true });
    renameSync(oldAbsPath, newAbsPath);
    const newHash = sha256(newAbsPath);
    if (newHash !== oldHash) {
      console.error(`x Hash mismatch after move: ${fname} (${oldHash} != ${newHash})`);
      // Rollback to keep state consistent.
      renameSync(newAbsPath, oldAbsPath);
      summary.errors += 1;
      continue;
    }
  }

  console.log(
    `${APPLY ? "v" : "->"} ${fname}  ->  ${relative(ROOT, newAbsPath)}`,
  );
  summary.moved += 1;
}

console.log("---");
console.log(`mode:              ${APPLY ? "APPLY" : "DRY-RUN"}`);
console.log(`total files seen:  ${summary.total}`);
console.log(`moved:             ${summary.moved}`);
console.log(`already at target: ${summary.alreadyMigrated}`);
console.log(`skipped:           ${summary.skipped}`);
console.log(`errors:            ${summary.errors}`);

if (summary.errors > 0) {
  process.exit(1);
}

if (!APPLY) {
  console.log("");
  console.log("Run with --apply to execute moves.");
}
