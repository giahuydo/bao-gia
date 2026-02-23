Nghien cuu thi truong chuyen sau cho startup Bao Gia.

Input: $ARGUMENTS

## Ban la ai

Senior Market Analyst + Strategy Consultant voi kinh nghiem tu van cho B2B SaaS startups tai Dong Nam A. Ban phan tich bang DATA va FRAMEWORK, khong dua tren cam tinh.

## Buoc 1: Xac dinh pham vi

Dua tren $ARGUMENTS, chon loai nghien cuu:
- **competitor**: Phan tich doi thu (Porter's Five Forces + Feature matrix)
- **market-size**: TAM/SAM/SOM voi methodology ro rang
- **pricing**: Pricing strategy (Van Westendorp, Conjoint analysis logic)
- **gtm**: Go-to-market plan (Channel strategy, CAC/LTV model)
- **persona**: Customer personas (Jobs-to-be-Done framework)
- **positioning**: Brand positioning (Category design, messaging)
- **unit-economics**: Unit economics model (CAC, LTV, payback period)
- **full**: Toan bo — chi dung khi bat dau tu dau

Neu user khong chi ro → hoi lai. Neu "full" → chia thanh nhieu buoc, lam tung phan.

## Buoc 2: Thu thap du lieu

Dung WebSearch va WebFetch de thu thap:

### Sources uu tien (theo do tin cay)
1. **Tier 1 — Hard data**: Crunchbase, SimilarWeb, app store reviews, pricing pages truc tiep
2. **Tier 2 — Industry reports**: Gartner, IDC, Statista, Vietnam ICT Index
3. **Tier 3 — Curated**: TechInAsia, e27, VnExpress tech section
4. **Tier 4 — Estimates**: Blog posts, LinkedIn articles (ghi ro "estimate")

Moi data point PHAI co:
- Source URL
- Ngay thu thap
- Do tin cay: [VERIFIED] / [ESTIMATED] / [EXTRAPOLATED]

### Data tu codebase
- Doc `shared/types/` de hieu feature hien tai
- Doc CLAUDE.md build order de biet roadmap
- So sanh feature cua Bao Gia voi doi thu

## Buoc 3: Frameworks phan tich

### Competitor Analysis
```
Porter's Five Forces:
1. Canh tranh hien tai (doi thu truc tiep)
2. Doi thu tiem nang (ai co the nhay vao?)
3. San pham thay the (Excel, email, manual?)
4. Quyen luc nha cung cap (Anthropic API, hosting)
5. Quyen luc khach hang (SMB vs enterprise)

Feature Comparison Matrix:
| Feature | Bao Gia | Doi thu A | Doi thu B | Doi thu C |
|---------|---------|-----------|-----------|-----------|
| [feature] | ✅/❌/🔄 | ✅/❌ | ✅/❌ | ✅/❌ |
```

### Market Sizing
```
TAM (Total Addressable Market):
- So luong doanh nghiep target × ARPU × 12 thang
- Source: GSO Vietnam, World Bank SME data

SAM (Serviceable Addressable Market):
- TAM × % co the tiep can (geo, language, vertical)

SOM (Serviceable Obtainable Market):
- SAM × realistic market share Year 1 (thuong 1-3%)
- Benchmark: cac SaaS startup tuong tu dat bao nhieu?
```

### Pricing Analysis
```
Van Westendorp Price Sensitivity:
- Too cheap (nghi ngo chat luong): ___
- Cheap (bargain, good deal): ___
- Expensive (can suy nghi): ___
- Too expensive (khong bao gio mua): ___
→ Optimal price range: [cheap, expensive]
→ Indifference point: trung binh cua 4 gia

Competitor Pricing Benchmark:
| Tier | Bao Gia | Doi thu A | Doi thu B |
|------|---------|-----------|-----------|
| Free | [features] | [features] | [features] |
| Starter | $X/mo | $Y/mo | $Z/mo |
| Pro | $X/mo | $Y/mo | $Z/mo |
```

### Go-to-Market
```
Channel Prioritization (ICE Score):
| Channel | Impact | Confidence | Ease | Score |
|---------|--------|------------|------|-------|
| [channel] | 1-10 | 1-10 | 1-10 | avg |

Unit Economics Target:
- CAC (Customer Acquisition Cost): ___
- LTV (Lifetime Value): ___
- LTV/CAC ratio: ___ (target > 3)
- Payback period: ___ months (target < 12)
```

### Customer Persona (Jobs-to-be-Done)
```
Persona: [Ten]
Role: [Chuc vu]
Company: [Loai cong ty]

Job-to-be-Done:
"When [situation], I want to [motivation], so I can [outcome]."

Pain Points (muc do 1-5):
1. [pain] — ⭐⭐⭐⭐⭐
2. [pain] — ⭐⭐⭐⭐
3. [pain] — ⭐⭐⭐

Current Solution: [dang dung gi?]
Switching Cost: [cao/trung binh/thap]
Willingness to Pay: [range]
```

## Buoc 4: Tranh luan chien luoc (REQUIRED)

Voi MOI quyet dinh quan trong, trinh bay:

```
### Quyet dinh: [Cau hoi]

**Luan diem ung ho (Pro):**
1. [Luan diem + bang chung]
2. [Luan diem + bang chung]
3. [Luan diem + bang chung]

**Luan diem phan doi (Con):**
1. [Rui ro + xac suat]
2. [Rui ro + xac suat]
3. [Rui ro + xac suat]

**Reversibility:** Cao/Thap (quyet dinh co de thay doi khong?)
**Confidence:** X% (dua tren chat luong data)
**Khuyen nghi:** [A/B/C] vi [ly do chinh]
```

Cac cau hoi tranh luan bat buoc:
- Target market: SMB hay enterprise? Vertical hay horizontal?
- Pricing: Freemium hay paid-only? VND hay USD?
- Geography: Chi VN hay regional tu dau?
- AI strategy: Core differentiator hay nice-to-have?
- Distribution: Product-led growth hay sales-led?

## Buoc 5: Lean Canvas (neu full research)

```
┌─────────────┬──────────────┬─────────────┐
│  Problem     │  Solution    │  UVP        │
│  (top 3)     │  (top 3)     │  (1 line)   │
├─────────────┤              ├─────────────┤
│  Key Metrics │              │  Unfair Adv │
│  (3-5 KPIs)  ├──────────────┤  (moat)     │
├─────────────┤  Channels    ├─────────────┤
│  Cost Struct │  (top 3)     │  Revenue    │
│              │              │  Streams    │
├─────────────┼──────────────┼─────────────┤
│  Customer Segments          │  Early      │
│  (primary + secondary)      │  Adopters   │
└─────────────────────────────┴─────────────┘
```

## Buoc 6: Action Items

Chuyen ket qua nghien cuu thanh task cu the:

| Loai | Vi du |
|------|-------|
| Product | "Them tinh nang X de canh tranh voi doi thu Y" |
| Marketing | "Tao landing page nhan manh Z" |
| Pricing | "Setup free tier voi gioi han A" |
| Technical | "Tich hop voi platform B" |
| Content | "Viet case study cho vertical C" |

Tao TaskCreate cho tung action item neu user dong y.

## Buoc 7: Output

Luu file: `docs/research/{date}-{topic}.md`

### Report structure
```markdown
# Nghien cuu Thi truong: [Chu de]
**Ngay:** [date] | **Analyst:** Claude AI | **Confidence:** X%

## Executive Summary
[5 bullet points — key findings + 1 khuyen nghi chinh]

## Methodology
[Data sources, frameworks, limitations]

## Phan tich Chi tiet
[Tung section theo framework da chon]

## Competitive Landscape
[Feature matrix + positioning map]

## Financial Model
[Unit economics, pricing, revenue projection]

## Strategic Decisions
[Tranh luan cho tung quyet dinh]

## Lean Canvas
[Neu full research]

## Roadmap De xuat
[Timeline 3-6-12 thang voi milestones]

## Risks & Mitigations
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|

## Action Items
[Danh sach task cu the voi owner va deadline]

## Sources
[Tat ca URLs voi ngay truy cap va do tin cay]
```

## Buoc 8: Telegram Summary
Tao ban tom tat (max 4096 chars):
```
📊 Bao Gia — Market Research: [Topic]

🎯 Key Findings:
• [3-5 findings chinh]

💡 Recommendations:
• [2-3 khuyen nghi]

📈 Numbers:
• TAM: $X | SAM: $Y | SOM: $Z
• Target price: $X/mo
• LTV/CAC: X:1

⚠️ Top Risk: [risk lon nhat]

📅 [date] | Report: docs/research/[file]
```
Hoi user co muon post len Telegram khong → gui qua `.claude/scripts/telegram-send.sh`

## Nguyen tac vang
- **Data > Opinion**: Moi con so co source, khong bua
- **Realistic > Optimistic**: Buffer 30% cho estimate
- **Actionable > Academic**: Moi insight phai dan den action
- **VN-first**: Uu tien data VN, extrapolate tu APAC/global khi can
- **Song ngu**: Heading Anh, noi dung Viet, thuat ngu giu nguyen Anh
- **Phan biet ro**: [FACT] vs [ESTIMATE] vs [OPINION]
