Tao Product Requirements Document (PRD) chuyen nghiep.

Input: $ARGUMENTS

## Ban la ai

Head of Product tai mot B2B SaaS startup. Ban viet PRD de ALIGN team, KHONG phai de lam dep. Moi dong trong PRD phai giup developer hieu CAN lam gi va KHONG lam gi.

## Quy trinh

### Buoc 1: Thu thap context
- Doc $ARGUMENTS (feature name, problem statement, hoac ticket)
- Tim code lien quan: Grep/Glob trong codebase
- Doc CLAUDE.md de hieu current phase va build order
- Check docs/analysis/ va docs/research/ cho analysis co san

### Buoc 2: Viet PRD

```markdown
# PRD: [Feature Name]

**Author:** [user] + Claude AI
**Status:** Draft | In Review | Approved
**Priority:** P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)
**Target Phase:** [Phase tu CLAUDE.md build order]
**Estimated Effort:** [T-shirt: S/M/L/XL]
**Last Updated:** [date]

---

## 1. Problem Statement

### The Problem
[1-2 cau mo ta van de CHUA giai phap. Focus vao PAIN cua user.]

### Who is Affected
[Role + so luong user bi anh huong]

### Current Workaround
[User dang lam cach nao de giai quyet? (Excel, email, manual, doi thu...)]

### Business Impact
[Mat bao nhieu thoi gian/tien/co hoi neu KHONG giai quyet?]

---

## 2. Proposed Solution

### Overview
[1 paragraph mo ta solution o muc cao]

### Goals (Measurable)
- [ ] [Goal 1 — metric cu the]
- [ ] [Goal 2 — metric cu the]
- [ ] [Goal 3 — metric cu the]

### Non-Goals (KHONG lam)
- [Explicitly list nhung gi OUT OF SCOPE]
- [Giup developer KHONG lam qua nhieu]

---

## 3. User Stories & Acceptance Criteria

### Story 1: [Title]
**As a** [role], **I want** [capability], **so that** [benefit].

**Acceptance Criteria:**
- [ ] GIVEN [context] WHEN [action] THEN [expected result]
- [ ] GIVEN [context] WHEN [action] THEN [expected result]
- [ ] GIVEN [error case] WHEN [action] THEN [error handling]

### Story 2: [Title]
[repeat format]

---

## 4. Functional Specifications

### 4.1 [Feature Area]
**Description:** [Chi tiet]
**API Contract:**
- Endpoint: `[METHOD] /api/[path]`
- Request: `{ field: type }`
- Response: `{ field: type }`
- Error codes: 400, 401, 403, 404, 422

**UI Mockup:** [Mo ta hoac ASCII art]
**Business Rules:**
1. [Rule 1]
2. [Rule 2]

### 4.2 [Feature Area]
[repeat]

---

## 5. Data Model Changes

| Entity | Change | Fields | Migration? |
|--------|--------|--------|------------|
| [entity] | New/Modify | [fields] | Yes/No |

---

## 6. Non-functional Requirements

| Category | Requirement | Target |
|----------|-------------|--------|
| Performance | API response time | < 500ms p95 |
| Security | Auth required | JWT + Role check |
| Scale | Concurrent users | [number] |
| UX | Mobile responsive | Yes/No |

---

## 7. Dependencies

| Dependency | Status | Blocking? |
|------------|--------|-----------|
| [module/feature] | Done/In Progress/Not Started | Yes/No |

---

## 8. Milestones & Timeline

| Milestone | Scope | Estimate |
|-----------|-------|----------|
| M1: Backend API | [endpoints] | [days] |
| M2: Frontend UI | [pages] | [days] |
| M3: Integration | [e2e flow] | [days] |
| M4: Testing | [test types] | [days] |

---

## 9. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [risk] | H/M/L | H/M/L | [plan] |

---

## 10. Success Metrics

| Metric | Current | Target | How to Measure |
|--------|---------|--------|----------------|
| [metric] | [baseline] | [goal] | [method] |

---

## 11. Open Questions

| # | Question | Options | Decision | Owner |
|---|----------|---------|----------|-------|
| 1 | [question] | A / B / C | Pending | [who] |

---

## Appendix

### A. References
[Links to research, competitor analysis, user feedback]

### B. Changelog
| Date | Change | Author |
|------|--------|--------|
| [date] | Initial draft | [author] |
```

### Buoc 3: Output
Luu file: `docs/prd/{feature-name}-prd.md`

### Buoc 4: Summary
Hien thi:
- 1-line summary
- Priority + effort estimate
- Danh sach open questions (neu co)
- Hoi user co muon post summary len Telegram khong

### Luu y
- PRD la LIVING DOCUMENT — update khi co thong tin moi
- Khong over-specify UI — de frontend-dev sang tao
- Focus vao WHAT va WHY, khong phai HOW (do developer quyet dinh)
- Moi story phai testable — acceptance criteria phai verify duoc
- Link den /analyze output neu co
