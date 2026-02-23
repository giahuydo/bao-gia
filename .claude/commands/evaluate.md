Danh gia feature completeness va lap ke hoach phase ke tiep cho Bao Gia.

Input: $ARGUMENTS

## Ban la ai

Tech Lead kiem Product Owner. Ban KHONG hoi — ban TU DONG scan codebase, danh gia, va xuat ket qua. Moi lan chay tao 1 file MD hoan chinh.

## Pham vi

Dua tren $ARGUMENTS:
- **status**: Danh gia toan bo feature hien tai theo 5 phases
- **phase1** / **phase2** / **phase3** / **phase4** / **phase5**: Danh gia chi tiet 1 phase
- **next**: Xac dinh nhung gi can lam tiep theo (auto-detect phase hien tai)
- **gap**: Phan tich GAP giua code hien tai va yeu cau
- **full**: Tat ca — status + gap + next phase plan

Mac dinh: **full**

## Quy trinh TU DONG (KHONG hoi user)

### Buoc 1: Scan Codebase (chay song song)

```bash
# Backend scan
find backend/src/modules -name "*.controller.ts" -exec grep -l "@(Get\|Post\|Patch\|Put\|Delete)" {} \;
find backend/src/modules -name "*.service.ts" | while read f; do echo "$f: $(wc -l < "$f") lines"; done
find backend/src/modules -name "*.spec.ts" | while read f; do echo "$f: $(wc -l < "$f") lines"; done
find backend/src/database/entities -name "*.entity.ts" | wc -l
find backend/src/database/migrations -name "*.ts" 2>/dev/null | wc -l

# Frontend scan
find frontend/src/app -name "page.tsx" 2>/dev/null
find frontend/src/components -name "*.tsx" 2>/dev/null | wc -l
find frontend/src/hooks -name "*.ts" 2>/dev/null | wc -l
find frontend/src/lib/api -name "*.ts" 2>/dev/null | wc -l

# Test scan
cd backend && npx jest --listTests 2>/dev/null | wc -l
cd backend && npm run build 2>&1 | tail -3
cd backend && npm test -- --passWithNoTests 2>&1 | tail -10

# Git scan
git log --oneline -30
git diff --stat HEAD~30 --shortstat 2>/dev/null
```

### Buoc 2: Dinh nghia 5 Phases va Features

```
Phase 1 — Foundation (Nen tang):
├── DB setup (migrations, seed, connection)
├── Auth end-to-end (register, login, JWT, guards)
├── User management (CRUD, roles)
├── Health check endpoint
├── CORS + Swagger docs
├── Frontend: Login + Register pages
├── Frontend: Auth context + middleware
└── Frontend: API client + interceptors

Phase 2 — Core Business (Nghiep vu chinh):
├── Quotation CRUD (create, read, update, delete)
├── Quotation status flow (draft→sent→accepted/rejected/expired)
├── Quotation items (line items, sort order, calculations)
├── QuotationHistory (audit trail)
├── Customer CRUD
├── Product catalog CRUD
├── PDF export
├── Quotation duplicate
├── Frontend: Quotation list + search + filter + pagination
├── Frontend: Quotation create/edit form
├── Frontend: Customer management pages
├── Frontend: Product catalog pages
└── Frontend: PDF preview + download

Phase 3 — Advanced Features (Nang cao):
├── Multi-currency (Currency CRUD, exchange rates)
├── Templates (CRUD + apply to quotation)
├── Company settings (per org)
├── Attachments (upload, download, link to quotation)
├── Frontend: Currency selector
├── Frontend: Template management
├── Frontend: Company settings page
├── Frontend: File upload UI
└── Frontend: Dashboard/overview page

Phase 4 — AI & Integration (AI va Tich hop):
├── AI module (generate, suggest, improve, extract, translate, compare)
├── Token tracking (usage, cost calculation)
├── Prompt versioning (AiPromptVersion CRUD)
├── n8n ingestion pipeline (extract→translate→normalize)
├── Ingestion jobs (status tracking, retry)
├── Webhooks (n8n callbacks)
├── N8n execution logs
├── File checksum cache (dedup)
├── Frontend: AI assistant panel
├── Frontend: Document upload + extraction UI
├── Frontend: Token usage dashboard
└── Frontend: n8n workflow page (iframe — done)

Phase 5 — Enterprise (Doanh nghiep):
├── Organizations (multi-tenant CRUD)
├── Organization members (roles, invites)
├── Org-level API key encryption
├── Quotation versioning (snapshot, compare, diff)
├── Review/approval workflow (request, approve, reject)
├── Glossary terms (per org, import/export)
├── Rule sets (per category: lab/biotech/icu/analytical)
├── Frontend: Org management pages
├── Frontend: Member management
├── Frontend: Version history UI
├── Frontend: Review workflow UI
├── Frontend: Glossary management
└── Frontend: Rules configuration
```

### Buoc 3: Danh gia tung Feature

Voi MOI feature, tu dong kiem tra:

| Check | Method | Pass criteria |
|-------|--------|---------------|
| Entity exists? | Glob `*.entity.ts` | File ton tai + co columns |
| Controller exists? | Glob `*.controller.ts` | File ton tai + co endpoints |
| Service exists? | Glob `*.service.ts` | File ton tai + > 20 lines (khong phai stub) |
| Service co logic? | Read file, check methods | Co >= 3 real methods (khong chi return) |
| DTO exists? | Glob `*.dto.ts` | File ton tai + co decorators |
| Tests exist? | Glob `*.spec.ts` | File ton tai |
| Tests pass? | Run jest cho module | 0 failures |
| Frontend page? | Glob `app/**/page.tsx` | File ton tai cho route |
| Frontend component? | Glob `components/**/*.tsx` | File ton tai |
| Frontend hook? | Glob `hooks/*.ts` | File ton tai |
| Frontend API service? | Glob `lib/api/*.ts` | File ton tai |
| Shared types? | Grep trong `shared/types/` | Interface/type exported |
| Migration? | Glob `migrations/*.ts` | File ton tai |
| Build OK? | `npm run build` | Exit code 0 |

### Buoc 4: Scoring

Moi feature duoc cham diem:

| Score | Meaning | Criteria |
|-------|---------|----------|
| ✅ Complete (100%) | Production-ready | Entity + Controller + Service (co logic) + DTO + Tests pass + Frontend page + Shared types |
| 🟢 Functional (75%) | Hoat dong duoc | Entity + Controller + Service co logic + DTO. Thieu tests hoac frontend |
| 🟡 Partial (50%) | Co code nhung chua du | Entity + Controller/Service exists nhung stub hoac thieu logic |
| 🟠 Scaffolded (25%) | Chi co khung | File ton tai nhung hau nhu rong / boilerplate |
| ❌ Missing (0%) | Chua bat dau | File khong ton tai |

Phase score = trung binh cua tat ca features trong phase.

### Buoc 5: Gap Analysis

Voi moi feature chua Complete:

```markdown
### [Feature Name] — [Score]

**Hien tai:**
- Backend: [trang thai cu the, VD: "Controller co 3 endpoints nhung service chi return empty"]
- Frontend: [trang thai]
- Tests: [trang thai]
- Shared types: [trang thai]

**Can lam:**
- [ ] [task cu the 1] (~X SP)
- [ ] [task cu the 2] (~Y SP)
- [ ] [task cu the 3] (~Z SP)

**Estimated effort:** X SP total
**Dependencies:** [features can hoan thanh truoc]
**Priority:** P0/P1/P2/P3
```

### Buoc 6: Next Phase Plan

Dua tren gap analysis, tu dong tao plan:

```markdown
## Next Phase Plan: Phase [N] — [Ten]

### Prerequisites (tu phase truoc)
- [ ] [feature can xong truoc] — [trang thai hien tai]

### Sprint Breakdown

#### Sprint 1: [Goal] (~X SP)
| # | Task | SP | Depends on | Files |
|---|------|----|-----------|-------|
| 1 | [task] | 3 | - | `path/to/file.ts` |
| 2 | [task] | 5 | #1 | `path/to/file.ts` |

#### Sprint 2: [Goal] (~Y SP)
| # | Task | SP | Depends on | Files |
|---|------|----|-----------|-------|

### Definition of Done (Phase level)
- [ ] Tat ca features cua phase dat score >= 🟢 (75%)
- [ ] Build thanh cong ca backend + frontend
- [ ] Tests pass (coverage >= 60% cho module moi)
- [ ] Shared types updated
- [ ] Migration generated + tested
- [ ] Swagger docs updated
- [ ] README/changelog updated
```

### Buoc 7: Output

#### File MD (BAT BUOC tao)
Luu: `docs/roadmap/{date}-phase-evaluation.md`

Format:
```markdown
# Bao Gia — Phase Evaluation Report
**Ngay:** [date] | **Evaluator:** Claude AI

## Overall Progress
Phase 1 — Foundation:      [████████░░]  80%  (X/Y features complete)
Phase 2 — Core Business:   [██░░░░░░░░]  20%  (X/Y features complete)
Phase 3 — Advanced:        [░░░░░░░░░░]   0%  (X/Y features complete)
Phase 4 — AI/Integration:  [█░░░░░░░░░]  10%  (X/Y features complete)
Phase 5 — Enterprise:      [░░░░░░░░░░]   0%  (X/Y features complete)

Overall: [██░░░░░░░░] XX%

## Phase [N] Detail
[Feature-by-feature evaluation table]

| Feature | Entity | Controller | Service | DTO | Tests | Frontend | Types | Score |
|---------|--------|-----------|---------|-----|-------|----------|-------|-------|
| [name]  | ✅/❌  | ✅/❌     | ✅/❌   | ✅/❌| ✅/❌ | ✅/❌    | ✅/❌ | ✅/🟢/🟡/🟠/❌ |

## Gap Analysis
[Per-feature gap details with tasks]

## Next Phase Plan
[Sprint breakdown with SP estimates]

## Recommendations
[Top 3 actions sorted by impact]

## Risk Assessment
[Blockers, dependencies, technical debt]
```

#### Telegram Summary
```
📋 Bao Gia — Phase Evaluation
━━━━━━━━━━━━━━━━━━━━━━

Phase 1: [██████████] XXX%
Phase 2: [████░░░░░░] XXX%
Phase 3: [░░░░░░░░░░] XXX%
Phase 4: [░░░░░░░░░░] XXX%
Phase 5: [░░░░░░░░░░] XXX%

Overall: XX%

🎯 Next: Phase [N] — [ten]
📊 [X] tasks, ~[Y] SP
⚡ Top priority: [feature]

📅 [date]
```

Gui Telegram KHONG can hoi — tu dong gui. Neu Telegram fail thi bao loi nhung KHONG dung lai.

## Luu y QUAN TRONG

1. **TU DONG 100%** — khong hoi user bat ky cau gi. Scan, danh gia, xuat ket qua.
2. **MOI LAN CHAY tao file MD** — luon luu vao `docs/roadmap/`
3. **Dua tren CODE THUC TE** — doc file, dem lines, check logic. KHONG dua tren git status hay assumptions.
4. **Scoring NGHIEM NGAT** — service chi co constructor + inject = 🟠 (scaffolded), KHONG phai 🟢
5. **Tasks PHAI CU THE** — "Implement createQuotation() in service" KHONG phai "finish quotation module"
6. **SP estimates thuc te** — 1 nguoi + AI, velocity 15-20 SP/sprint
7. **Dependencies ro rang** — feature A can B xong truoc thi ghi ro
8. **So sanh voi lan chay truoc** — neu co file evaluation cu trong `docs/roadmap/`, so sanh progress
9. **Telegram tu dong gui** — dung `.claude/scripts/telegram-send.sh` voi HTML parse_mode
10. **Neu build fail** — ghi nhan loi va van tiep tuc danh gia (khong dung lai)
