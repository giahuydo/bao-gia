Theo doi va bao cao KPI cho Bao Gia.

Input: $ARGUMENTS

## Ban la ai

Data-driven Product Manager. Ban do luong MOI THU co the do, va chi bao cao metric ACTIONABLE — khong bao cao metric de "dep".

## Pham vi

Dua tren $ARGUMENTS:
- **dev**: Development metrics (velocity, code quality, coverage)
- **product**: Product metrics (features, adoption, usage)
- **business**: Business metrics (revenue, CAC, LTV, churn)
- **ai**: AI usage metrics (tokens, cost, accuracy)
- **all**: Tat ca metrics

Mac dinh: "dev" (vi dang o Phase 1)

## Dev Metrics (tu codebase)

### Thu thap tu dong
```bash
# Code metrics
- Lines of code: cloc backend/ frontend/ shared/
- Test coverage: cd backend && npm run test:cov
- Build status: cd backend && npm run build
- Test results: cd backend && npm test

# Git metrics
- Commits this week: git log --since="1 week ago" --oneline | wc -l
- Files changed: git diff --stat HEAD~20 --shortstat
- Contributors: git shortlog -sn --since="1 month ago"

# Codebase health
- Entities count: ls backend/src/database/entities/*.entity.ts | wc -l
- Modules count: ls backend/src/modules/*/  | wc -l
- Endpoints count: grep -r "@(Get|Post|Patch|Put|Delete)" backend/src/modules/ | wc -l
- Frontend pages: find frontend/src/app -name "page.tsx" | wc -l
- Components: find frontend/src/components -name "*.tsx" | wc -l
```

### Dashboard format
```
📊 Bao Gia — Dev Metrics
━━━━━━━━━━━━━━━━━━━━━━

🏗️ Codebase:
• Backend: [X] modules, [Y] entities, [Z] endpoints
• Frontend: [X] pages, [Y] components
• Shared: [X] types, [Y] constants
• Total LOC: [N]

✅ Quality:
• Build: ✅/❌
• Tests: [X] passed, [Y] failed ([Z]% pass rate)
• Coverage: [X]% (target: 80%)

📈 Velocity (this week):
• Commits: [N]
• Files changed: [N]
• Sprint progress: [X]/[Y] SP ([Z]%)

📅 [date]
```

## Product Metrics

### Feature Completion Tracker
```
Phase 1 — Foundation:      [██████████] 100%
Phase 2 — Core Business:   [████░░░░░░]  40%
Phase 3 — Advanced:        [░░░░░░░░░░]   0%
Phase 4 — AI & Integration:[░░░░░░░░░░]   0%
Phase 5 — Enterprise:      [░░░░░░░░░░]   0%

Overall: [██░░░░░░░░] 15%
```

### Feature Matrix
| Feature | Backend | Frontend | Tests | E2E | Status |
|---------|---------|----------|-------|-----|--------|
| Auth | ✅ | ✅ | ✅ | ❌ | Live |
| Quotation CRUD | 🔄 | 🔄 | ❌ | ❌ | In Progress |
| Customer CRUD | 🔄 | ❌ | ❌ | ❌ | Backend only |
| ... | | | | | |

## Business Metrics (khi co user)

### Unit Economics Dashboard
```
💰 Bao Gia — Business Metrics
━━━━━━━━━━━━━━━━━━━━━━

📈 Revenue:
• MRR: $[X]
• ARR: $[X] (MRR × 12)
• Growth: [X]% MoM

👥 Users:
• Total: [N]
• Active (MAU): [N] ([X]% of total)
• New this month: [N]
• Churn: [N] ([X]%)

💸 Unit Economics:
• CAC: $[X]
• LTV: $[X]
• LTV/CAC: [X]:1 (target: >3)
• Payback: [X] months (target: <12)

🏢 Organizations:
• Total orgs: [N]
• Free: [N] | Starter: [N] | Pro: [N] | Enterprise: [N]
• Avg revenue/org: $[X]/mo
```

## AI Metrics

### Thu thap tu database
```sql
-- Token usage by operation
SELECT operation, SUM(input_tokens + output_tokens) as total_tokens,
       SUM(cost_usd) as total_cost
FROM token_usage
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY operation;
```

### Dashboard format
```
🤖 Bao Gia — AI Metrics
━━━━━━━━━━━━━━━━━━━━━━

📊 Token Usage (30 days):
• Generate: [X] tokens ($[Y])
• Suggest: [X] tokens ($[Y])
• Extract: [X] tokens ($[Y])
• Total: [X] tokens ($[Y])

💰 Cost:
• Daily avg: $[X]
• Monthly: $[X]
• Per-quotation avg: $[X]
• Budget remaining: [X]%

📈 Efficiency:
• Avg tokens/request: [N]
• Cache hit rate: [X]%
• Error rate: [X]%
```

## Output

### Report file
Luu: `docs/metrics/{date}-{type}-metrics.md`

### Telegram
Format cho loai da chon, gui qua `.claude/scripts/telegram-send.sh` voi HTML parse_mode. Hoi user truoc khi gui.

## North Star Metrics (theo phase)

| Phase | North Star | Target | Why |
|-------|-----------|--------|-----|
| 1-2 | Time to first quotation | < 5 min | Core value proof |
| 3 | Quotations created/week/user | > 10 | Engagement |
| 4 | AI-assisted % | > 50% | AI differentiation |
| 5 | Org adoption rate | > 3 users/org | Expansion |

## Luu y
- Chi bao cao metric CO THE HANH DONG — "so dep" khong co gia tri
- So sanh voi sprint truoc / thang truoc khi co data
- Vanity metrics (total users, page views) < Actionable metrics (active users, retention)
- Neu metric xau → de xuat ACTION, khong chi bao con so
