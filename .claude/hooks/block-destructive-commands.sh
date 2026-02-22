#!/bin/bash
# Hook: PreToolUse (matcher: Bash)
# Block destructive shell commands that could cause data loss.
# Exit code 2 = block action with feedback message.
# Exit code 0 = allow action.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)

if [ -z "$COMMAND" ]; then
  exit 0
fi

# Destructive patterns to block
DESTRUCTIVE_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf \."
  "DROP TABLE"
  "DROP DATABASE"
  "TRUNCATE TABLE"
  "git push --force"
  "git push -f"
  "git reset --hard"
  "git clean -fd"
  "git checkout -- ."
  "> /dev/sda"
  "mkfs"
  "dd if="
)

COMMAND_UPPER=$(echo "$COMMAND" | tr '[:lower:]' '[:upper:]')

for pattern in "${DESTRUCTIVE_PATTERNS[@]}"; do
  PATTERN_UPPER=$(echo "$pattern" | tr '[:lower:]' '[:upper:]')
  if [[ "$COMMAND_UPPER" == *"$PATTERN_UPPER"* ]]; then
    echo "BLOCKED: Destructive command detected — matches pattern '$pattern'. Run this command manually if intended." >&2
    exit 2
  fi
done

exit 0
