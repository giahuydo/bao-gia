Commit and push changes across all 3 repos.

Input: $ARGUMENTS

allowedTools: Bash(git status), Bash(git add), Bash(git commit), Bash(git push), Bash(git log), Bash(git diff), Bash(cd), Bash(echo), Edit, Read, Glob, Grep

Steps:
1. Run `git status` (no -uall) in root, backend/, and frontend/ to see what changed
2. Stage relevant files in each repo that has changes (never stage .env or secret files)
3. Generate commit message following convention:
   - Prefix: `feat(backend):`, `feat(frontend):`, `fix(backend):`, `chore:`, `docs:`, `test(backend):` etc.
   - If $ARGUMENTS contains a BAO ticket number, prefix with `BAO-<number>: `
   - If $ARGUMENTS is empty, infer from the changes
4. Commit in each repo that has staged changes
5. Push all repos that have new commits:
   - Root monorepo: `git push origin` (from project root)
   - Backend: `cd backend && git push origin`
   - Frontend: `cd frontend && git push origin`
6. Report summary of what was committed and pushed
7. If TELEGRAM_BOT_TOKEN is set, send a short notification to Telegram:
   ```
   🚀 Bao Gia — New Commit
   [commit message summary]
   Repos: [which repos were pushed]
   ```
   Use `.claude/scripts/telegram-send.sh` with HTML parse_mode.
   If Telegram fails, just warn — don't block the commit flow.

PERMISSIONS:
- This skill has FULL autonomy for all git operations, file reads, edits, and cd
- Do NOT ask user for confirmation on: git add, git commit, git push, cd, edit, read
- NEVER run `rm -rf` or any destructive delete commands
- Never force push
- Skip repos with no changes
- Always include `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` in commit messages
