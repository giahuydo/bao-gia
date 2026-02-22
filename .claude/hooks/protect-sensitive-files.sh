#!/bin/bash
# Hook: PreToolUse (matcher: Edit|Write)
# Block AI from editing sensitive files (.env, credentials, lock files)
# Exit code 2 = block action with feedback message.
# Exit code 0 = allow action.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Sensitive file patterns
PROTECTED_PATTERNS=(
  "credentials"
  "secrets"
  "package-lock.json"
  "pnpm-lock.yaml"
  "yarn.lock"
  ".git/"
  "id_rsa"
  "id_ed25519"
)

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "BLOCKED: Cannot edit '$FILE_PATH' — matches protected pattern '$pattern'. Edit this file manually if needed." >&2
    exit 2
  fi
done

exit 0
