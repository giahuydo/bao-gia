Generate and optionally post daily standup summary.

Input: $ARGUMENTS

## Steps

1. Collect today's activity:
   - `git log --since="yesterday" --oneline` in root, backend/, frontend/
   - Check TaskList for completed/in-progress tasks
   - Check recent file changes: `git diff --stat HEAD~5`

2. Generate standup in format:
   ```
   🌅 Bao Gia — Daily Standup
   ━━━━━━━━━━━━━━━━━━━━━━

   ✅ Done:
   • [what was completed]

   🔄 In Progress:
   • [what's being worked on]

   🚧 Blockers:
   • [any blockers, or "None"]

   📋 Next:
   • [what's planned next based on build order in CLAUDE.md]

   📅 [date]
   ```

3. Show the standup to user

4. If $ARGUMENTS contains "post" or "send":
   - Send to Telegram via `.claude/scripts/telegram-send.sh` with HTML parse_mode
   - Report success

5. If $ARGUMENTS is empty:
   - Just display the standup, don't send
   - Ask if user wants to post to Telegram

## Notes
- Vietnamese language
- Keep it concise — max 10 bullet points total
- Reference CLAUDE.md build order for "Next" section
- If no commits today, mention it honestly
