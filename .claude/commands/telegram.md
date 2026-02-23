Post message to Bao Gia Telegram group.

Input: $ARGUMENTS

## Behavior

### Mode 1: Custom message (`/telegram <message>`)
If $ARGUMENTS is a plain message:
1. Format the message for Telegram (clean, readable)
2. Send via `.claude/scripts/telegram-send.sh`
3. Report success/failure

### Mode 2: Dev update (`/telegram dev`)
Auto-generate a dev update from recent git activity:
1. Run `git log --oneline -10` in root, backend/, frontend/
2. Summarize changes in Vietnamese
3. Format as Telegram message:
   ```
   🔨 Bao Gia — Dev Update
   ━━━━━━━━━━━━━━━━━━━━━━

   Backend:
   • [summary of changes]

   Frontend:
   • [summary of changes]

   📅 [date]
   ```
4. Show draft to user, ask confirmation before sending
5. Send via `.claude/scripts/telegram-send.sh` with HTML parse_mode

### Mode 3: Research summary (`/telegram research`)
Post market research summary:
1. Find latest research report in `docs/research/` or from recent /market-research output
2. Create a condensed Telegram-friendly summary (max 4096 chars):
   ```
   📊 Bao Gia — Market Research
   ━━━━━━━━━━━━━━━━━━━━━━

   🎯 Key Findings:
   • [finding 1]
   • [finding 2]
   • [finding 3]

   💡 Recommendations:
   • [rec 1]
   • [rec 2]

   ⚠️ Risks:
   • [risk 1]

   📅 [date]
   ```
3. Show draft to user, ask confirmation before sending
4. Send via `.claude/scripts/telegram-send.sh` with HTML parse_mode

### Mode 4: Status report (`/telegram status`)
Generate project status overview:
1. Check build status: `cd backend && npm run build 2>&1 | tail -5`
2. Check test status: `cd backend && npm test 2>&1 | tail -10`
3. Count entities, modules, endpoints from codebase
4. Format:
   ```
   📋 Bao Gia — Project Status
   ━━━━━━━━━━━━━━━━━━━━━━

   🏗️ Phase: [current phase from CLAUDE.md]

   Backend:
   • Build: ✅/❌
   • Tests: X passed, Y failed
   • Modules: N active
   • Endpoints: N total

   Frontend:
   • Pages: [list]
   • Components: N

   📅 [date]
   ```
5. Show draft, confirm, send

## Important Rules
- ALWAYS show draft to user before sending (except Mode 1 with explicit message)
- Use HTML parse_mode for formatted messages (bold, code, etc.)
- Max 4096 characters per Telegram message — split if longer
- Vietnamese as primary language, English for technical terms
- If TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set, show error and guide user to update `.claude/.env`
