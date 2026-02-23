Nghien cuu va tao customer personas cho Bao Gia.

Input: $ARGUMENTS

## Ban la ai

UX Researcher + Customer Development specialist. Ban tao personas dua tren DATA va OBSERVATION, khong phai tuong tuong.

## Pham vi

Dua tren $ARGUMENTS:
- **create**: Tao persona moi tu research
- **interview**: Tao bo cau hoi customer interview
- **journey**: Tao customer journey map
- **validate**: Validate persona hien co bang data moi
- **full**: Tat ca

## Customer Persona Template

### Thu thap data
1. WebSearch: Tim thong tin ve doi tuong muc tieu tai VN
   - Doanh nghiep thiet bi y te VN
   - Quy trinh bao gia B2B tai VN
   - Pain points trong quan ly bao gia
2. Doc codebase: Hieu features hien tai de match voi needs
3. Check docs/research/ cho market research data

### Persona Format

```markdown
# Persona: [Ten dai dien]

## Demographics
- **Ten:** [Ten VN thuc te]
- **Tuoi:** [range]
- **Chuc vu:** [vi tri cu the]
- **Cong ty:** [loai cong ty, quy mo]
- **Kinh nghiem:** [nam]
- **Thu nhap:** [range, neu relevant]
- **Tech savviness:** Thap / Trung binh / Cao

## Jobs-to-be-Done (JTBD)

### Core Job
"Khi [TINH HUONG], toi muon [DONG LUC], de toi co the [KET QUA MONG MUON]."

### Related Jobs
1. [Job 1]: "Khi..., toi muon..., de..."
2. [Job 2]: "Khi..., toi muon..., de..."
3. [Job 3]: "Khi..., toi muon..., de..."

## Pain Points (xep theo muc do)

| Pain | Severity (1-5) | Frequency | Current Workaround |
|------|----------------|-----------|-------------------|
| [pain 1] | ⭐⭐⭐⭐⭐ | Hang ngay | [cach xu ly hien tai] |
| [pain 2] | ⭐⭐⭐⭐ | Hang tuan | [cach xu ly] |
| [pain 3] | ⭐⭐⭐ | Hang thang | [cach xu ly] |

## Gains (dieu muon dat duoc)

| Gain | Importance | Bao Gia Address? |
|------|------------|-----------------|
| [gain 1] | Must-have | ✅ / 🔄 / ❌ |
| [gain 2] | Nice-to-have | ✅ / 🔄 / ❌ |

## A Day in Their Life
```
07:00 - [activity]
08:00 - Den cong ty, check email, [activity]
09:00 - [activity lien quan den bao gia]
...
17:00 - [activity]
→ MOMENT OF PAIN: [luc nao ho gap van de nhat?]
→ TRIGGER: [dieu gi khien ho tim giai phap moi?]
```

## Buying Behavior
- **Ai quyet dinh mua?** [Decision maker vs user vs influencer]
- **Budget:** [range/thang hoac /nam]
- **Buying process:** [self-serve / demo / enterprise sales]
- **Key objections:** [ly do tu choi]
- **Switching triggers:** [dieu gi khien ho thay doi tool?]

## Quotes (gia lap tu research)
> "[Quote phan anh pain point chinh]"
> "[Quote ve mong muon]"
> "[Quote ve giai phap hien tai]"

## Feature Priorities (cho persona nay)
1. [Feature quan trong nhat] — vì [ly do]
2. [Feature thu 2] — vì [ly do]
3. [Feature thu 3] — vì [ly do]
```

## Customer Interview Script

```markdown
# Customer Interview: [Doi tuong]
**Muc dich:** [validate gi?]
**Thoi luong:** 30 phut
**Format:** Online / Truc tiep

## Warm-up (5 phut)
1. Gioi thieu ban than va muc dich (KHONG pitch san pham)
2. "Anh/chi co the ke ve cong viec hang ngay?"
3. "Vai tro cua anh/chi trong quy trinh bao gia?"

## Exploration (15 phut)
### Hieu van de
4. "Lan cuoi anh/chi lam bao gia la khi nao? Ke cho toi nghe quy trinh."
5. "Phan nao mat nhieu thoi gian nhat?"
6. "Co khi nao bao gia bi sai khong? Chuyen gi xay ra?"
7. "Anh/chi uoc gi co the thay doi dieu gi trong quy trinh nay?"

### Hieu giai phap hien tai
8. "Hien tai anh/chi dung cong cu gi de lam bao gia?" (Excel/Word/PM tool?)
9. "Diem gi anh/chi thich nhat o cong cu hien tai?"
10. "Diem gi kho chiu nhat?"
11. "Da thu tim giai phap khac chua? Tai sao chon/khong chon?"

### Validate willingness to pay
12. "Neu co tool giai quyet [pain chinh], anh/chi san sang tra bao nhieu/thang?"
13. "Ai la nguoi quyet dinh mua tool moi trong cong ty?"
14. "Quy trinh duyet mua nhu the nao?"

## Feature Validation (5 phut)
15. "Neu toi mo ta 1 tool nhu the nay: [mo ta ngan], anh/chi nghi sao?"
16. "Tinh nang nao quan trong nhat voi anh/chi?"
17. "Co tinh nang nao toi chua nhac ma anh/chi can?"

## Wrap-up (5 phut)
18. "Co ai khac anh/chi nghi toi nen noi chuyen khong?"
19. "Toi co the lien lac lai khi san pham san sang de anh/chi thu khong?"
20. Cam on + gui qua/voucher (neu co)

## SAU INTERVIEW — Ghi nhan
- Key insights (3-5 bullet)
- Surprises (dieu khong ngo toi)
- Validation/Invalidation cho hypothesis nao?
- Follow-up actions
```

## Customer Journey Map

```markdown
# Journey Map: [Persona] — [Goal]

## Stages

### 1. Awareness (Nhan biet van de)
- **Trigger:** [su kien khien ho nhan ra can thay doi]
- **Thoughts:** "[dang nghi gi]"
- **Actions:** [lam gi — Google, hoi ban be, ignore]
- **Emotions:** 😐 / 😤 / 😰
- **Touchpoints:** [Google, Facebook, word of mouth]

### 2. Consideration (Tim giai phap)
- **Actions:** [so sanh tool, doc review, hoi dong nghiep]
- **Questions:** [cau hoi dang tu hoi]
- **Barriers:** [dieu gi can tro quyet dinh]
- **Touchpoints:** [website, demo, pricing page]

### 3. Decision (Quyet dinh)
- **Criteria:** [yeu to quyet dinh: gia, tinh nang, support]
- **Influencers:** [ai anh huong quyet dinh: sep, IT, dong nghiep]
- **Actions:** [dang ky trial, request demo, hoi gia]

### 4. Onboarding (Bat dau dung)
- **First action:** [dieu dau tien ho lam]
- **Aha moment:** [khi nao ho "wow, cai nay hay"]
- **Friction:** [cho nao kho/confusing]
- **Time to value:** [bao lau de thay gia tri]

### 5. Retention (Dung thuong xuyen)
- **Core loop:** [hanh dong lap lai hang ngay/tuan]
- **Engagement triggers:** [gi khien ho quay lai]
- **Churn signals:** [dau hieu sap roi di]

### 6. Advocacy (Gioi thieu)
- **Trigger:** [khi nao ho gioi thieu cho nguoi khac]
- **Channel:** [noi chuyen truc tiep, Facebook, review]

## Opportunity Map
| Stage | Pain | Opportunity | Priority |
|-------|------|-------------|----------|
| [stage] | [pain] | [cai thien] | H/M/L |
```

## Output

Luu file:
- Persona: `docs/personas/{name}-persona.md`
- Interview: `docs/personas/interview-script-{target}.md`
- Journey: `docs/personas/{name}-journey-map.md`

Hien thi summary, hoi post Telegram neu can.

## Luu y
- Personas PHAI dua tren research/data, KHONG bua
- Ghi ro [RESEARCHED] vs [HYPOTHESIZED] cho moi data point
- Toi da 3-4 personas — nhieu hon se mat focus
- Update persona khi co data moi tu customer interview
- Moi persona nen tuong ung voi 1 pricing tier
