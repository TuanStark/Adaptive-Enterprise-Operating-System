#!/bin/bash
# validate_all.sh — chạy terraform validate trên tất cả modules và stacks

set -euo pipefail

BASE="$(cd "$(dirname "$0")" && pwd)"
PASS=0
FAIL=0
ERRORS=()

validate_dir() {
  local dir="$1"
  echo ""
  echo "══════════════════════════════════════════════════"
  echo "▶  $dir"
  echo "══════════════════════════════════════════════════"

  if ! terraform -chdir="$dir" init -backend=false -input=false -upgrade > /dev/null 2>&1; then
    echo "❌  INIT FAILED: $dir"
    FAIL=$((FAIL + 1))
    ERRORS+=("INIT FAILED: $dir")
    return
  fi

  if terraform -chdir="$dir" validate 2>&1; then
    PASS=$((PASS + 1))
  else
    echo "❌  VALIDATE FAILED: $dir"
    FAIL=$((FAIL + 1))
    ERRORS+=("VALIDATE FAILED: $dir")
  fi
}

cd "$BASE"

for dir in modules/*/ stacks/*/; do
  validate_dir "$dir"
done

echo ""
echo "══════════════════════════════════════════════════"
echo "  SUMMARY: ✅ $PASS passed  ❌ $FAIL failed"
echo "══════════════════════════════════════════════════"

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo "Errors:"
  for err in "${ERRORS[@]}"; do
    echo "  - $err"
  done
  exit 1
fi
