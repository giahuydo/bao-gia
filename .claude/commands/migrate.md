Generate or run database migrations.

Input: $ARGUMENTS

Behavior:
- If $ARGUMENTS starts with "generate" or "gen":
  Extract the migration name from $ARGUMENTS (e.g. "gen AddSlugToOrg" -> "AddSlugToOrg")
  Run `cd backend && npm run migration:generate -- src/database/migrations/<Name>`
- If $ARGUMENTS is "run" or empty:
  Run `cd backend && npm run migration:run`
- If $ARGUMENTS is "revert":
  Ask for confirmation first, then run `cd backend && npm run migration:revert`

After running:
1. Show the output
2. If generating, read the generated migration file and verify it looks correct
3. Warn about any destructive operations (DROP, DELETE, ALTER column type)
