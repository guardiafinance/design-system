#!/usr/bin/env node
/**
 * Pushes visual baseline changes in __image_snapshots__/ as a single
 * commit, signed by GitHub via the Git Database API.
 *
 * Why API instead of `git push`:
 *   Per lex-signed-commits, every commit reaching the trunk MUST be
 *   verified. Commits created via the REST API are server-signed with
 *   GitHub's GPG key (committer = github-actions[bot]); direct `git push`
 *   from the runner using GITHUB_TOKEN is not. The Git Database API
 *   (blobs + tree + commit + ref) handles the multi-file payload in
 *   a single signed commit.
 *
 * Wired by .github/workflows/regenerate-baselines.yml.
 *
 * Env required:
 *   GH_TOKEN: GITHUB_TOKEN exposed by the workflow
 *   BRANCH:   target branch (defaults to current ref_name in workflow)
 *   GITHUB_REPOSITORY: owner/repo (set automatically in Actions)
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const { GH_TOKEN, BRANCH, GITHUB_REPOSITORY } = process.env;
if (!GH_TOKEN || !BRANCH || !GITHUB_REPOSITORY) {
  console.error("Missing GH_TOKEN, BRANCH, or GITHUB_REPOSITORY env var");
  process.exit(1);
}

const [owner, repo] = GITHUB_REPOSITORY.split("/");

async function gh(method, endpoint, body) {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `GitHub API ${method} ${endpoint} failed: ${res.status} ${text}`,
    );
  }
  return res.json();
}

// 1. List PNG changes (added, modified, deleted) under __image_snapshots__/
const diff = execSync("git status --porcelain __image_snapshots__/", {
  encoding: "utf-8",
});
const changed = diff
  .split("\n")
  .filter((line) => line.trim())
  .map((line) => ({
    status: line.slice(0, 2).trim(),
    path: line.slice(3).trim(),
  }))
  .filter(({ path }) => path.endsWith(".png"));

if (changed.length === 0) {
  console.log("No baseline changes to push");
  process.exit(0);
}
console.log(
  `Pushing ${changed.length} baseline change(s) via GitHub API to ${BRANCH}`,
);

// 2. Snapshot the current branch HEAD
const ref = await gh(
  "GET",
  `/repos/${owner}/${repo}/git/refs/heads/${BRANCH}`,
);
const headSha = ref.object.sha;
const headCommit = await gh(
  "GET",
  `/repos/${owner}/${repo}/git/commits/${headSha}`,
);
const baseTreeSha = headCommit.tree.sha;

// 3. Upload each PNG as a blob; collect tree entries (chunked parallel to
//    stay within GitHub API secondary-rate limits — sequential would be
//    ~1 req/200ms × 400+ files = >1min wall time).
const CHUNK_SIZE = 10;
const treeEntries = [];
for (let i = 0; i < changed.length; i += CHUNK_SIZE) {
  const chunk = changed.slice(i, i + CHUNK_SIZE);
  const results = await Promise.all(
    chunk.map(async ({ status, path }) => {
      if (status === "D") {
        return { path, mode: "100644", type: "blob", sha: null };
      }
      const content = readFileSync(path).toString("base64");
      const blob = await gh("POST", `/repos/${owner}/${repo}/git/blobs`, {
        content,
        encoding: "base64",
      });
      return { path, mode: "100644", type: "blob", sha: blob.sha };
    }),
  );
  treeEntries.push(...results);
  console.log(`Uploaded ${treeEntries.length}/${changed.length} blobs`);
}

// 4. Create a tree on top of the current one
const tree = await gh("POST", `/repos/${owner}/${repo}/git/trees`, {
  base_tree: baseTreeSha,
  tree: treeEntries,
});

// 5. Create the signed commit
const commit = await gh("POST", `/repos/${owner}/${repo}/git/commits`, {
  message:
    "chore(visual): regenerate baselines on ubuntu (regenerate-baselines workflow)",
  tree: tree.sha,
  parents: [headSha],
});

// 6. Move the branch ref forward
await gh("PATCH", `/repos/${owner}/${repo}/git/refs/heads/${BRANCH}`, {
  sha: commit.sha,
});

console.log(
  `Pushed signed commit ${commit.sha.slice(0, 7)} with ${changed.length} baseline change(s) to ${BRANCH}`,
);
