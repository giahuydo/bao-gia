Run tests for a specific backend module or all tests.

Input: $ARGUMENTS

Behavior:
- If $ARGUMENTS is a module name (e.g. "ai", "quotations", "webhooks"):
  Run `cd backend && npx jest --testPathPattern="$ARGUMENTS" --verbose`
- If $ARGUMENTS is a file path:
  Run `cd backend && npx jest "$ARGUMENTS" --verbose`
- If $ARGUMENTS is empty or "all":
  Run `cd backend && npm test`
- If $ARGUMENTS is "e2e":
  Run `cd frontend && npm run test:e2e`

After running:
1. Report pass/fail counts
2. If failures exist, read the failing test files and source files to diagnose
3. Suggest fixes for any failures
