#!/usr/bin/env bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Canonical Ahrena status:* labels for design-system
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Source: lex-agent-planning Table A (Axis A — dev cycle)
#
# Idempotent: uses `gh label create --force` so repeated runs
# update existing labels in place (color + description) and
# create missing ones. Safe to run on a fresh clone or after
# accidental label deletion.
#
# Required: gh CLI authenticated with `repo` scope.
#
# Usage:
#   ./scripts/labels.sh
#   ./scripts/labels.sh --repo guardiatechnology/design-system  # override target
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -euo pipefail

REPO_ARG=""
if [[ "${1:-}" == "--repo" && -n "${2:-}" ]]; then
  REPO_ARG="$2"
fi

create() {
  local name="$1"
  local color="$2"
  local description="$3"
  if [[ -n "$REPO_ARG" ]]; then
    gh label create "$name" --repo "$REPO_ARG" --color "$color" --description "$description" --force
  else
    gh label create "$name" --color "$color" --description "$description" --force
  fi
}

list_labels() {
  if [[ -n "$REPO_ARG" ]]; then
    gh label list --repo "$REPO_ARG" --limit 200
  else
    gh label list --limit 200
  fi
}

echo "Reconciling canonical status:* labels..."

create "status: todo"        "fbca04" "Ready to be picked up"
create "status: development" "0052cc" "Plan in active development"
create "status: to review"   "0e8a16" "Plan in review (PR opened, awaiting human approval)"
create "status: done"        "5319e7" "Plan complete (PR merged)"
create "status: to release"  "fbca04" "Awaiting release (Janus)"

echo "Done. Verifying..."
list_labels | grep -E "^status:" | sort
