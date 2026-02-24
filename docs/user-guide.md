# Huong Dan Su Dung — He Thong Quan Ly Bao Gia

Tai lieu nay huong dan nguoi dung cuoi su dung he thong Bao Gia de quan ly bao gia, khach hang, san pham va cac tinh nang lien quan.

---

## 1. Gioi Thieu

**Bao Gia** la he thong quan ly bao gia thong minh danh cho cac doanh nghiep. He thong giup ban:

- Tao va quan ly bao gia mot cach nhanh chong va chuyen nghiep
- Quan ly danh sach khach hang va san pham tap trung
- Xuat bao gia dang PDF de gui cho khach hang
- Su dung tri tue nhan tao (AI) de tu dong tao bao gia tu tai lieu, goi y san pham va cai thien noi dung
- Theo doi trang thai bao gia tu luc tao den khi duoc chap nhan hoac tu choi
- Quan ly nhieu to chuc (multi-tenant) voi phan quyen theo vai tro

**Cac trang thai bao gia:**

| Trang thai | Y nghia |
|-----------|---------|
| Nhap (Draft) | Bao gia dang soan thao, co the chinh sua |
| Da gui (Sent) | Da gui cho khach hang, khong the chinh sua truc tiep |
| Chap nhan (Accepted) | Khach hang da chap nhan bao gia |
| Tu choi (Rejected) | Khach hang tu choi bao gia |
| Het han (Expired) | Bao gia da het hieu luc |

---

## 2. Dang Ky va Dang Nhap

### 2.1 Tao Tai Khoan Moi

1. Mo trinh duyet va truy cap dia chi he thong (vi du: `http://localhost:4000`)
2. Neu chua co tai khoan, nhan vao lien ket **Register** o cuoi trang dang nhap
3. Dien cac thong tin:
   - **Ho va ten** (Full Name)
   - **Email** — dung de dang nhap, phai hop le
   - **Mat khau** — dat mat khau du manh
4. Nhan nut **Register** de hoan tat dang ky
5. He thong tu dong dang nhap va chuyen den trang Dashboard

### 2.2 Dang Nhap

1. Truy cap trang he thong
2. Nhap **Email** va **Mat khau** da dang ky
3. Nhan bieu tuong mat de hien/an mat khau neu can
4. Nhan nut **Sign in**
5. Neu thong tin dung, ban se duoc chuyen den trang Dashboard

### 2.3 Dang Xuat

Nhan vao avatar (chu cai ten) o goc tren phai thanh dieu huong, chon **Sign out**.

---

## 3. Quan Ly Bao Gia

### 3.1 Xem Danh Sach Bao Gia

Nhan **Quotations** tren thanh dieu huong. Trang nay hien thi:

- Bang bao gia voi cac cot: so bao gia, tieu de, khach hang, trang thai, tong tien, ngay tao
- O tim kiem de loc theo tieu de hoac so bao gia
- Bo loc theo trang thai (Draft, Sent, Accepted, Rejected, Expired)
- Phan trang (20 bao gia moi trang)
- Cac nut tac dong tren moi hang (xem, sua, nhan ban, xoa)

### 3.2 Tao Bao Gia Moi

1. Tren trang danh sach bao gia, nhan nut **New Quotation**
2. Dien cac thong tin bao gia:
   - **Tieu de** — ten bao gia de nhan biet (bat buoc)
   - **Khach hang** — chon tu danh sach khach hang co san (bat buoc)
   - **Ngay het han** — ngay bao gia het hieu luc (tuy chon)
   - **Ghi chu** (Notes) — thong tin them cho khach hang (tuy chon)
   - **Dieu khoan** (Terms) — dieu khoan hop dong, thanh toan (tuy chon)
   - **Giam gia** (Discount %) — ty le giam gia, tu 0 den 100 (tuy chon)
   - **Thue** (Tax %) — ty le thue, tu 0 den 100 (tuy chon)
3. Them cac hang muc bao gia (Items):
   - Nhan **Add Item** de them hang muc moi
   - Moi hang muc can: ten, don vi, so luong, don gia
   - Co the chon san pham tu danh muc co san (tuy chon)
   - He thong tu dong tinh thanh tien = so luong x don gia
4. He thong tu dong tinh:
   - Tam tinh (Subtotal)
   - So tien giam gia
   - So tien thue
   - Tong cong (Total)
5. Nhan **Create Quotation** de luu

Bao gia moi duoc tao voi trang thai **Nhap (Draft)** va so bao gia tu dong (dinh dang: `BG-YYYYMMDD-NNN`).

### 3.3 Chinh Sua Bao Gia

Chi co the chinh sua bao gia o trang thai **Nhap (Draft)**.

1. Tren danh sach bao gia, nhan bieu tuong ba cham (...) o hang bao gia can sua
2. Chon **Edit**
3. Thay doi cac thong tin can thiet
4. Nhan **Save Changes** de luu

Luu y: Bao gia o trang thai **Da gui (Sent)** la chi doc. De sua doi, can tao phien ban moi (xem phan Quan ly Phien Ban).

### 3.4 Xem Chi Tiet Bao Gia

1. Nhan vao ten bao gia trong danh sach hoac chon **View** tu menu hanh dong
2. Trang chi tiet hien thi:
   - Thong tin chung (so, tieu de, trang thai, khach hang, ngay het han)
   - Danh sach hang muc voi so luong, don gia, thanh tien
   - Tong hop tai chinh (tam tinh, giam gia, thue, tong cong)
   - Lich su thay doi (History)
   - File dinh kem (Attachments)

### 3.5 Thay Doi Trang Thai Bao Gia

Vong doi bao gia: **Nhap -> Da gui -> Chap nhan / Tu choi / Het han**

De thay doi trang thai:
1. Mo chi tiet bao gia
2. Tim nut chuyen trang thai phu hop (vi du: **Mark as Sent**, **Mark as Accepted**)
3. Xac nhan hanh dong

Quy tac chuyen trang thai:
- Chi co the gui bao gia o trang thai **Nhap**
- Bao gia **Da gui** co the chuyen sang: Chap nhan, Tu choi, hoac Het han
- Bao gia da Chap nhan / Tu choi / Het han khong the thay doi them

### 3.6 Nhan Ban (Duplicate) Bao Gia

Dung khi can tao bao gia moi dua tren bao gia hien co.

1. Tu danh sach, nhan menu ba cham (...) -> chon **Duplicate**
2. He thong tao ban sao voi:
   - Tieu de co them chu " (Copy)"
   - So bao gia moi
   - Trang thai: **Nhap (Draft)**
   - Tat ca hang muc va thong tin tai chinh duoc sao chep
3. Ban co the chinh sua ban sao theo nhu cau

### 3.7 Xuat PDF

1. Mo chi tiet bao gia
2. Nhan nut **Export PDF**
3. Trinh duyet tu dong tai ve file PDF
4. File PDF co ten la so bao gia (vi du: `BG-20260224-001.pdf`)

PDF bao gom: thong tin cong ty, thong tin khach hang, danh sach hang muc va tong hop tai chinh.

### 3.8 Xoa Bao Gia

1. Tu danh sach, nhan menu ba cham (...) -> chon **Delete**
2. Xac nhan viec xoa trong hop thoai xac nhan
3. Bao gia bi xoa mem (soft delete) — du lieu van con trong he thong nhung khong hien thi

---

## 4. Quan Ly Khach Hang

Nhan **Customers** tren thanh dieu huong.

### 4.1 Xem Danh Sach Khach Hang

Trang hien thi bang khach hang voi cac thong tin: ten, email, dien thoai, dia chi. Co tinh nang tim kiem va phan trang.

### 4.2 Them Khach Hang Moi

1. Nhan nut **New Customer**
2. Dien thong tin:
   - **Ten khach hang** (bat buoc)
   - **Email** (tuy chon)
   - **Dien thoai** (tuy chon)
   - **Dia chi** (tuy chon)
   - **Ma so thue** (Tax Code, tuy chon)
   - **Nguoi lien he** (Contact Person, tuy chon)
3. Nhan **Save** de luu

### 4.3 Chinh Sua Khach Hang

1. Tu danh sach, nhan vao ten khach hang de xem chi tiet
2. Nhan **Edit** de chinh sua
3. Cap nhat thong tin va nhan **Save**

### 4.4 Xoa Khach Hang

Tu danh sach, nhan menu hanh dong -> **Delete** -> xac nhan.

Luu y: Khong the xoa khach hang dang co bao gia lien ket.

---

## 5. Quan Ly San Pham

Nhan **Products** tren thanh dieu huong.

### 5.1 Xem Danh Sach San Pham

Bang san pham hien thi: ten, mo ta, don vi, gia mac dinh, danh muc, trang thai (hoat dong / khong hoat dong).

### 5.2 Them San Pham Moi

1. Nhan nut **New Product**
2. Dien thong tin:
   - **Ten san pham** (bat buoc)
   - **Mo ta** (tuy chon)
   - **Don vi** (vi du: cai, goi, thang, gio)
   - **Gia mac dinh** (Default Price)
   - **Danh muc** (Category, tuy chon)
3. Nhan **Save**

Gia mac dinh duoc tu dong dien vao khi chon san pham khi tao bao gia, nhung van co the dieu chinh tren tung bao gia.

### 5.3 Chinh Sua va Xoa San Pham

Tuong tu khach hang: nhan vao ten san pham -> Edit, hoac dung menu hanh dong de xoa.

---

## 6. Su Dung AI

Nhan **AI Tools** tren thanh dieu huong. Trang nay co 3 tab chinh.

### 6.1 Tao Bao Gia Tu Dong (Generate)

AI se phan tich mo ta nhu cau cua ban va tao danh sach bao gia tu dong.

1. Chon tab **Generate**
2. Nhap mo ta nhu cau vao o van ban (vi du: "Can thiet ke website ban hang cho cong ty phan phoi thiet bi y te, bao gom 10 trang, gio hang, cong thanh toan")
3. Nhan **Generate**
4. AI tra ve danh sach hang muc de xuat voi ten, so luong, don vi, gia
5. Ket qua co the copy truc tiep vao bao gia moi

### 6.2 Goi Y San Pham (Suggest)

De nghi AI goi y them san pham phu hop voi bao gia dang co.

1. Chon tab **Suggest**
2. Nhap thong tin ngu canh (vi du: ten du an, loai khach hang, cac san pham da co)
3. Nhan **Get Suggestions**
4. AI tra ve danh sach san pham de xuat kem mo ta va gia tham khao

### 6.3 Cai Thien Mo Ta (Improve)

AI giup viet lai mo ta san pham / bao gia chuyen nghiep hon.

1. Chon tab **Improve**
2. Dan van ban mo ta ban dau vao o nhap
3. Nhan **Improve**
4. AI tra ve phien ban cai thien, ro rang va chuyen nghiep hon
5. Sao chep ket qua va su dung trong bao gia

### 6.4 So Sanh Thong So (Compare)

So sanh thong so ky thuat giua nha cung cap va yeu cau khach hang.

1. Su dung API endpoint `POST /api/ai/compare`
2. Nhap thong so ky thuat cua nha cung cap (vendorSpec) va yeu cau khach hang (customerRequirement)
3. AI phan tich va tra ve ket qua so sanh chi tiet, giup xac dinh su phu hop

### 6.5 Xem Thong Ke Su Dung AI

Tu menu nguoi dung (goc tren phai), chon **AI Usage** de xem:
- So luong token da su dung theo thang
- Chi phi uoc tinh
- Phan bo theo loai hoat dong (generate, suggest, improve, ...)
- Han muc token cua to chuc

---

## 7. Mau Bao Gia (Templates)

Nhan **Templates** tren thanh dieu huong.

### 7.1 Xem Danh Sach Mau

Trang hien thi cac mau bao gia da tao. Mau mac dinh (default) duoc danh dau rieng.

### 7.2 Tao Mau Moi

1. Nhan **New Template**
2. Dien thong tin mau:
   - **Ten mau** (bat buoc)
   - **Dieu khoan mac dinh** (Default Terms)
   - **Ghi chu mac dinh** (Default Notes)
   - **Giam gia mac dinh** (Default Discount %)
   - **Thue mac dinh** (Default Tax %)
   - **Hang muc mac dinh** — danh sach san pham/dich vu thuong xuyen xuat hien trong bao gia
3. Nhan **Save**

### 7.3 Ap Dung Mau Vao Bao Gia

Khi tao bao gia moi, co the chon mau trong truong **Template**. He thong tu dong dien cac thong tin mac dinh tu mau.

### 7.4 Chinh Sua va Xoa Mau

Nhan vao ten mau de xem chi tiet, chon **Edit** de sua hoac dung menu hanh dong de xoa.

---

## 8. Quy Trinh Duyet (Reviews)

Nhan **Reviews** tren thanh dieu huong. Tinh nang nay quan ly luong cong viec can duyet, phe duyet hoac tu choi.

### 8.1 Xem Danh Sach Yeu Cau Duyet

Trang hien thi tat ca yeu cau duyet voi cac thong tin:
- Loai yeu cau (ingestion, thay doi trang thai, de xuat gia, ...)
- Trang thai (Cho duyet / Da duyet / Da tu choi)
- Nguoi gui yeu cau
- Nguoi duoc phan cong duyet

### 8.2 Xem Chi Tiet va Xu Ly Yeu Cau

1. Nhan vao yeu cau de xem chi tiet
2. Xem thong tin payload (du lieu lien quan)
3. Chon hanh dong:
   - **Approve** — phe duyet yeu cau
   - **Reject** — tu choi yeu cau
   - **Request Revision** — yeu cau chinh sua them

### 8.3 Loai Yeu Cau

| Loai | Y nghia |
|------|---------|
| Ingestion | Ket qua trich xuat tai lieu can kiem tra truoc khi ap dung |
| Status Change | Thay doi trang thai bao gia can duyet |
| Price Override | Ghi de gia vuot qua nguong can duyet |
| Comparison | Ket qua so sanh thong so ky thuat can danh gia |

---

## 9. Theo Doi Cong Viec (Jobs)

Nhan **Jobs** tren thanh dieu huong.

Trang nay hien thi trang thai xu ly cac cong viec boc tach tai lieu (ingestion jobs) — tuc la cac tac vu xu ly file PDF/hinh anh bang AI de trich xuat thong tin bao gia.

### 9.1 Trang Thai Cong Viec

| Trang thai | Y nghia |
|-----------|---------|
| Pending | Cho xu ly |
| Extracting | Dang trich xuat van ban tu file |
| Translating | Dang dich sang tieng Viet |
| Normalizing | Dang chuan hoa du lieu |
| Review Pending | Cho nguoi dung kiem tra |
| Completed | Hoan thanh thanh cong |
| Failed | That bai, co the thu lai |
| Dead Letter | Da thu lai nhieu lan, can xu ly thu cong |

### 9.2 Thu Lai Cong Viec That Bai

Doi voi cong viec o trang thai **Failed**, co the nhan **Retry** de yeu cau he thong xu ly lai.

---

## 10. Cai Dat Cong Ty

Tu menu nguoi dung (goc tren phai), chon **Company Settings**.

### 10.1 Thong Tin Chung

Cap nhat thong tin hien thi tren bao gia PDF:
- **Ten cong ty**
- **Ma so thue**
- **Dia chi**
- **Dien thoai**
- **Email**
- **Logo cong ty** (upload hinh anh)

### 10.2 Thong Tin Ngan Hang

Dien thong tin tai khoan ngan hang de hien thi trong bao gia:
- Ten ngan hang
- So tai khoan
- Chu tai khoan
- Chi nhanh

### 10.3 Cai Dat Khac

- **Tien to so bao gia** (Quotation Prefix) — mac dinh la "BG", co the doi thanh ky hieu cong ty

Sau khi chinh sua, nhan **Save** de luu.

---

## 11. Quan Ly Tien Te

Tu menu nguoi dung, chon **Currencies**.

He thong ho tro nhieu loai tien te. Mac dinh la VND.

### 11.1 Xem Danh Sach Tien Te

Trang hien thi cac loai tien te da cai dat: ma tien te, ten, ky hieu, ty gia, so chu so thap phan, tien te mac dinh.

### 11.2 Them Tien Te Moi (Admin)

Nguoi dung voi quyen Admin co the them tien te moi:
1. Nhan **Add Currency**
2. Dien: ma tien te (3 ky tu, vi du USD), ten, ky hieu, ty gia so voi VND
3. Nhan **Save**

### 11.3 Dat Tien Te Mac Dinh

Nhan nut **Set as Default** tren dong tien te muon dat lam mac dinh. Tien te mac dinh se duoc chon tu dong khi tao bao gia moi.

---

## 12. Quan Ly To Chuc

Tu menu nguoi dung, chon **Organizations**.

He thong ho tro nhieu to chuc (multi-tenant). Moi to chuc co du lieu rieng biet.

### 12.1 Xem Danh Sach To Chuc

Trang hien thi cac to chuc ma ban la thanh vien, bao gom: ten, goi cuoc (free/starter/pro/enterprise), so thang token da su dung.

### 12.2 Tao To Chuc Moi

1. Nhan **New Organization**
2. Dien:
   - **Ten to chuc**
   - **Slug** — dinh danh duong dan (khong dau, khong khoang trang)
   - **Goi cuoc** — anh huong den han muc su dung AI
3. Nhan **Create**

### 12.3 Quan Ly Thanh Vien

1. Mo chi tiet to chuc (nhan vao ten to chuc)
2. Trang thanh vien hien thi danh sach nguoi dung va vai tro cua ho
3. De them thanh vien: nhan **Add Member**, nhap email va chon vai tro
4. De thay doi vai tro: sua thong tin thanh vien
5. De xoa thanh vien: nhan **Remove**

### 12.4 Vai Tro Thanh Vien

| Vai tro | Quyen han |
|---------|----------|
| Owner | Toan quyen — xoa to chuc, quan ly tat ca |
| Admin | Quan ly thanh vien, cai dat to chuc |
| Manager | Tao va quan ly bao gia, khach hang, san pham |
| Member | Xem va tao bao gia |

---

## 13. Tu Dien Thuat Ngu (Glossary)

Nhan **Glossary** tren thanh dieu huong.

Tu dien thuat ngu luu cac cap thuat ngu dich, phuc vu cho tinh nang dich thuat AI de dam bao nhat quan trong he thong.

### 13.1 Xem va Tim Kiem Tu Dien

Trang hien thi danh sach thuat ngu: tu nguon, tu dich, ngon ngu nguon, ngon ngu dich, danh muc.

### 13.2 Them Thuat Ngu Moi

1. Nhan **Add Term**
2. Dien: tu nguon, tu dich, ngon ngu nguon, ngon ngu dich, danh muc
3. Nhan **Save**

---

## 14. Bo Quy Tac (Rule Sets)

Tu menu nguoi dung, chon **Rule Sets**.

Bo quy tac dinh nghia cac rang buoc nghiep vu cho tung linh vuc (phong thi nghiem, y te, phan tich, ...) de AI ap dung khi xu ly bao gia.

### 14.1 Xem Danh Sach Bo Quy Tac

Trang hien thi cac bo quy tac theo danh muc: lab, biotech, icu, analytical, general.

### 14.2 Tao Bo Quy Tac Moi

1. Nhan **New Rule Set**
2. Chon danh muc
3. Them cac quy tac: moi quy tac co ten, dieu kien, va hanh dong
4. Nhan **Save**

### 14.3 Chinh Sua Bo Quy Tac

Nhan vao ten bo quy tac de xem chi tiet, chon **Edit** de thay doi.

---

## 15. Theo Doi Gia (Price Monitoring)

Nhan **Price Monitoring** tren thanh dieu huong (neu duoc hien thi).

Tinh nang nay theo doi bien dong gia thi truong va canh bao khi co su thay doi dang ke.

### 15.1 Dashboard Gia

Trang tong quan hien thi:
- Cac cong viec theo doi gia dang chay
- Canh bao gia gan day
- Bieu do bien dong gia

### 15.2 Canh Bao Gia

- **Critical**: Bien dong qua 10%
- **High**: Bien dong tu 5 den 10%
- **Medium**: Bien dong tu 2 den 5%
- **Low**: Bien dong duoi 2%

---

## 16. Workflows (n8n)

Nhan **Workflows** tren thanh dieu huong.

Trang nay mo giao dien quan ly workflow n8n (cong cu tu dong hoa) trong iframe. Day la cong cu ky thuat cho viec cai dat luong xu ly tai lieu tu dong.

Chuc nang nay chu yeu danh cho quan tri vien he thong. Nguoi dung thong thuong khong can tuong tac truc tiep voi workflows.

---

## Cau Hoi Thuong Gap

**Tai sao toi khong the sua bao gia?**
Bao gia chi co the chinh sua khi o trang thai **Nhap (Draft)**. Neu bao gia da o trang thai **Da gui**, ban can tao phien ban moi hoac nhan ban bao gia de tao ban sao moi.

**So bao gia duoc tao nhu the nao?**
He thong tu dong tao so bao gia theo dinh dang `BG-YYYYMMDD-NNN` (vi du: `BG-20260224-001`). So nay tang dan trong ngay.

**Toi co the phuc hoi bao gia da xoa khong?**
Hien tai he thong su dung xoa mem (soft delete). Lien he quan tri vien neu can phuc hoi.

**Token AI la gi?**
Token la don vi do luong su dung cua mo hinh AI. Moi to chuc co han muc token hang thang tuy theo goi cuoc. Xem thong ke tai **AI Usage** trong menu nguoi dung.

**Lam sao de xuat bao gia theo tien te ngoai te?**
Khi tao bao gia, chon dong tien trong truong **Currency**. He thong su dung ty gia da cai dat trong **Currencies** de tinh toan. Mac dinh la VND.
