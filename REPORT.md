# HW02 – Domain Testing on EShop: Báo cáo chính

| | |
|---|---|
| **Môn** | Kiểm thử phần mềm, FIT@HCMUS, 2026 |
| **Sinh viên** | Phạm Quang Vinh, MSSV **23120202** |
| **SUT** | EShop (`https://github.com/ttbhanh/eshop-sut`, commit `85af3ba`) |
| **Kỹ thuật** | Phân hoạch tương đương (Equivalence Partitioning, EP) và Phân tích giá trị biên (Boundary Value Analysis, BVA) |
| **Công cụ AI** | Claude Code, model Claude Opus 5.5 (xem [AI Audit Report](ai-audit/) và [AI Critique](ai-audit/AI_Critique.md)) |
| **Repo và GitHub Issues** | `https://github.com/vinh-code/HW02-Software-Testing`, Issues #1–#28 |

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Phương pháp](#2-phương-pháp)
3. [FR-01 Đăng ký tài khoản (Pool A)](#3-fr-01-đăng-ký-tài-khoản-pool-a)
4. [FR-09 Mã giảm giá (Pool B)](#4-fr-09-mã-giảm-giá-pool-b)
5. [FR-15 Quản lý sản phẩm CRUD (Pool C)](#5-fr-15-quản-lý-sản-phẩm-crud-pool-c)
6. [FR-20 Mobile: Giỏ hàng & Số lượng (Pool D)](#6-fr-20-mobile-giỏ-hàng--số-lượng-pool-d)
7. [Tổng hợp kết quả](#7-tổng-hợp-kết-quả)
8. [Phân tích chung về AI và bài học](#8-phân-tích-chung-về-ai-và-bài-học)
9. [Giới hạn của bài làm](#9-giới-hạn-của-bài-làm)
10. [Danh mục tài liệu](#10-danh-mục-tài-liệu)

---

## 1. Tổng quan

| Pool | Mã | Tính năng | Kênh kiểm thử | TC | Pass | Fail | Bug |
|---|---|---|---|---|---|---|---|
| A | FR-01 | Đăng ký tài khoản | Web `/register` + `POST /api/register` | 42 | 1 | 41 | 7 |
| B | FR-09 | Mã giảm giá (Coupon) | Web `/checkout` + `POST /api/apply-coupon` | 30 | 15 | 15 | 8 |
| C | FR-15 | Quản lý sản phẩm (CRUD) | Admin `:5174` + `/api/products` | 37 | 13 | 24 | 7 |
| D | FR-20 | Mobile: Giỏ hàng & Số lượng | App Expo (Expo Web, mô phỏng Pixel 5) | 31 | 7 | 24 | 6 |
| | | **Tổng** | | **140** | **36** | **104** | **28** |

**Phân bố bug theo mức độ:** 11 Critical, 11 Major, 6 Minor. Cả 28 bug đều được báo cáo trong Markdown và trên GitHub Issues, có ảnh minh chứng.

**Kết luận nhanh:**
- Cả 4 tính năng đều **không đạt** đặc tả.
- Điểm chung lớn nhất là **server gần như không có validation**: mọi kiểm tra (nếu có) chỉ nằm ở client, và có thể bỏ qua bằng cách gọi API trực tiếp.
- Các lỗi nghiêm trọng nhất:
  - Đăng ký không được bằng mật khẩu đúng chuẩn.
  - Coupon `percent` khiến khách bị tính **gấp 10 lần**.
  - API sản phẩm cho **người lạ** xóa/sửa toàn bộ sản phẩm.
  - Bảng Admin ghi tên sai vào CSDL.
  - Sửa số lượng trong giỏ mobile bị lưu thành **n + 1**.

---

## 2. Phương pháp

### 2.1 Quy trình 7 bước cho mỗi tính năng

Mỗi bước là **một file Markdown** trong thư mục tính năng và **một git commit** (xem [`git_commit_log.txt`](git_commit_log.txt)):

| Bước | File | Nội dung | Commit |
|---|---|---|---|
| EP-B1 | `01_input_output.md` | Trích yêu cầu (đối chiếu chéo toàn SRS), Input/Output, điều kiện C1…Cn kèm loại điều kiện, giả định A1…An | `FR-xx [EP-B1]` |
| EP-B2 | `02_equivalence_classes.md` | Bảng nguyên tắc tạo lớp, bảng lớp tương đương EC (hợp lệ/không hợp lệ, cả lớp đầu ra), dữ liệu chuẩn bị | `[EP-B2]` |
| EP-B3 | `03_ep_test_cases.md` | TC cho từng lớp → bảng rút gọn (nhiều lớp hợp lệ/TC, **1 lớp không hợp lệ/TC**) → ma trận độ phủ | `[EP-B3]` |
| BVA | `04_bva_test_cases.md` | Miền có thứ tự, biên LB/UB, chọn biến thể (Standard/Robustness/Worst-case) và lý do, bảng TC | `[BVA]` |
| EXEC | `05_test_execution.md` | Môi trường, tiêu chí Pass/Fail, kiểm tra masking, kết quả từng TC trên từng kênh, ảnh chụp | `[EXEC]` |
| BUG | `06_bug_report.md` | Bug gom theo nguyên nhân gốc, bước tái hiện, mong đợi/thực tế, severity, minh chứng, link Issue | `[BUG]` |
| GAP | `07_ai_gap_analysis.md` | Những gì AI bỏ sót/làm sai, nguyên nhân, TC bổ sung, rủi ro còn lại, bài học | `[GAP]` |

### 2.2 Cách dùng AI

AI **không** được giao "sinh test case và tìm bug" trong một lần, mà được dẫn qua từng bước của kỹ thuật như trên. Sinh viên duyệt kết quả ở các điểm then chốt:
- Chấp nhận hoặc sửa giả định ở B1.
- Rà bảng lớp và độ phủ.
- Kiểm tra lại ảnh chụp và số liệu.
- Rà soát gap analysis.

Toàn bộ prompt và output được ghi trong AI Audit Report.

### 2.3 Thực thi tự động trên hai tầng

- **UI:** Playwright 1.49.1 (Chromium 131 headless). Mỗi TC chụp một ảnh.
- **API:** gọi trực tiếp endpoint bằng `fetch`. Validation phía client có thể bị bỏ qua, nên hệ thống đúng phải chặn dữ liệu sai **ở cả hai tầng**.
- **Hậu kiểm:** đọc lại trạng thái hệ thống qua API trước và sau mỗi TC (đếm tài khoản, so sánh toàn bộ danh sách sản phẩm, xem đơn hàng), thay vì chỉ tin vào thông báo trên màn hình.
- **Thứ tự chạy:** TC hợp lệ chạy trước để phát hiện **masking** (lỗi che lỗi). Nếu bộ giá trị nền bị từ chối thì mọi TC không hợp lệ chạy sau đều có thể Pass giả.
- **Reset dữ liệu:** khởi động lại backend trước mỗi tính năng (DB được seed lại). Mỗi TC và mỗi kênh dùng dữ liệu riêng (email, mô tả làm nhãn nhận diện).
- **Minh chứng tầng API:** script [`api_evidence.js`](scripts/api_evidence.js) gửi request thật, rồi render request/response thành ảnh PNG.
- **Đồng bộ GitHub Issues:** [`create_issues.py`](scripts/create_issues.py) đọc `06_bug_report.md`, tạo Issue với tiêu đề `[FR-xx] [Mã TC] …`, nhãn severity, ảnh nhúng.

### 2.4 Quy ước

- Lớp `EC1…`, TC `EP-01…` / `BVA-01…`. TC bổ sung sau gap analysis được đánh số tiếp. Lượt chạy lại có hậu tố `R`.
- Ký hiệu ✅ Pass, ❌ Fail, ⚠️ Pass giả (đúng kết quả nhưng sai lý do).
- Một TC chỉ Pass khi Pass trên **mọi kênh** đã chạy.

---

## 3. FR-01 Đăng ký tài khoản (Pool A)

Chi tiết: [`features/FR-01_Register/`](features/FR-01_Register/)

### 3.1 EP: Input/Output và lớp tương đương

- **Input:**
  - I1 Họ tên, I2 Email, I3 Mật khẩu, I4 Xác nhận mật khẩu.
  - Trạng thái hệ thống: tập email đã tồn tại.
- **Output:**
  - O1: tạo tài khoản và chuyển sang `/login`.
  - O2: báo lỗi, không tạo tài khoản.
- **9 điều kiện:**
  - C1 họ tên khác rỗng.
  - C2 email đúng định dạng.
  - C3 email chưa tồn tại.
  - C4 độ dài mật khẩu ≥ 8.
  - C5–C7 mật khẩu có chữ hoa, chữ thường, chữ số.
  - C8 mật khẩu có ký tự đặc biệt thuộc `{@$!%*?&}`.
  - C9 xác nhận mật khẩu khớp.
- **Giả định:**
  - A1: không có độ dài tối đa.
  - A2: email có dạng `local@domain.tld`.
  - A3: ký tự ngoài tập vẫn hợp lệ nếu đã có ký tự trong tập.
  - A4: họ tên chỉ có khoảng trắng thì coi là rỗng.
  - A5: email không phân biệt hoa/thường.
- **25 lớp** (7 hợp lệ, 18 không hợp lệ). Một số lớp không hợp lệ được tách nhỏ:
  - Email sai định dạng: thiếu `@`, thiếu phần local, domain thiếu `.`.
  - Mật khẩu: thiếu từng loại ký tự.
  - Email trùng khác hoa/thường.
- **19 TC EP** (2 hợp lệ, 17 không hợp lệ), phủ 25/25 lớp.

### 3.2 BVA

Mấu chốt là nhận ra điều kiện "có ít nhất 1 chữ hoa/thường/số/ký tự đặc biệt" thực chất là điều kiện trên **biến đếm có thứ tự** (`count ≥ 1`). Vì vậy có thể áp dụng BVA cho 6 biến:

| Biến | Miền hợp lệ | Điểm kiểm tra |
|---|---|---|
| V1 len(Họ tên) | [1..∞) | 0, 1, 2 |
| V2 len(Mật khẩu) | [8..∞) | 7, 8, 9 |
| V3–V6 số chữ hoa / chữ thường / chữ số / ký tự đặc biệt | [1..∞) | 0, 1, 2 |

- Cả 6 biến **chỉ có biên dưới**, nên Robustness 6n+1 được điều chỉnh thành **3n+1 = 19 TC**.
- Mật khẩu nominal `ABCdef123@!$` có 3 ký tự mỗi loại, để điểm nominal không trùng LB+1.
- Thêm 2 TC độ bền (chuỗi 256 ký tự). Tổng **21 TC BVA**.
- Worst-case (3⁶ = 729) bị loại.

### 3.3 Thực thi và phát hiện chính

- **Masking trên UI:** UI từ chối **mọi** mật khẩu đúng spec, kể cả TC hợp lệ EP-01. Vì vậy các TC không hợp lệ về họ tên/email trên UI ban đầu là ⚠️ Pass giả.
  - Lượt thăm dò cho thấy UI coi **khoảng trắng** là "ký tự đặc biệt" và **cấm** `@$!%*?&`.
  - Chạy lại 9 TC (hậu tố `R`) với mật khẩu `Abcdef1 ` mà UI chấp nhận, để mỗi TC chỉ còn một lớp không hợp lệ.
- **API:** không có validation nào. Họ tên, email, mật khẩu rỗng đều đăng ký được.
- **Kết quả:** 42 TC (19 EP + 21 BVA + 2 bổ sung). **1 Pass, 41 Fail.**

### 3.4 Bug

| Bug | Tóm tắt | Severity | Issue |
|---|---|---|---|
| BUG-FR01-01 | UI từ chối mọi mật khẩu hợp lệ, chỉ chấp nhận mật khẩu có khoảng trắng | Critical | #1 |
| BUG-FR01-02 | API không kiểm tra độ mạnh mật khẩu | Critical | #2 |
| BUG-FR01-03 | Cho đăng ký email trùng (kể cả khác hoa/thường) | Critical | #3 |
| BUG-FR01-04 | Không kiểm tra định dạng email (UI dùng `type="text"`) | Major | #4 |
| BUG-FR01-05 | Thiếu trường Xác nhận mật khẩu | Major | #5 |
| BUG-FR01-06 | API chấp nhận trường bắt buộc rỗng; họ tên toàn khoảng trắng được chấp nhận | Major | #6 |
| BUG-FR01-07 | **Stored XSS** qua Họ tên, thực thi trên header sau khi đăng nhập | Critical | #7 |

### 3.5 Gap analysis (tóm tắt)

AI bỏ sót 2 lớp:
- **Họ tên tiếng Việt:** AI có thiên lệch ASCII.
- **Họ tên chứa HTML:** prompt chỉ yêu cầu phân tích FR-01, nên AI bỏ qua SEC-04. Lớp này dẫn tới bug Critical BUG-FR01-07.

AI cũng không lường trước masking, và có ghi sai số liệu thống kê ở B2. Bài học áp dụng cho 3 tính năng sau:
- **Đối chiếu chéo toàn SRS** trước khi phân hoạch.
- **Chạy TC hợp lệ trước.**

---

## 4. FR-09 Mã giảm giá (Pool B)

Chi tiết: [`features/FR-09_Coupon/`](features/FR-09_Coupon/)

### 4.1 EP

- **Yêu cầu được đối chiếu:**
  - 5 điều kiện C1–C5 của FR-09 và hai công thức `percent` / `fixed`.
  - FR-08: tổng tiền do hệ thống tính, không cho sửa.
  - SEC-02: API phải yêu cầu JWT.
- **Input:**
  - I1 mã giảm giá.
  - I2 tổng đơn (gián tiếp qua giỏ hàng).
  - I3 trạng thái đăng nhập.
  - I4 số lần đã dùng mã.
- **Output:**
  - O1a giảm theo `percent`, O1b giảm theo `fixed`.
  - O2 từ chối.
- **21 lớp** (10 hợp lệ, 11 không hợp lệ). Một số lớp đáng chú ý:
  - Mã bị vô hiệu hóa, mã hết hạn **đúng hôm nay**.
  - Không có token, token giả.
  - Đã dùng hết lượt nhưng **không gửi `user_id`**.
  - Tổng tiền bị người dùng sửa tay.
- **15 TC EP**, phủ 21/21 lớp.
- **Chuẩn bị dữ liệu:**
  - 8 sản phẩm test có giá chính xác (200.000, 299.999 … 1.000.000 ₫) để chạm đúng biên.
  - Coupon `EXP0D/EXP1D/EXP2D` (hết hạn hôm nay / ngày mai / ngày kia).
  - Coupon `OFF10` bị vô hiệu hóa.

### 4.2 BVA

| Biến | Miền hợp lệ | Điểm |
|---|---|---|
| V1 tổng đơn với SAVE10 (min 300.000) | [300.000..∞) | 299.999 / **300.000** / 300.001 |
| V2 tổng đơn với BIGBUY (min 500.000) | [500.000..∞) | 499.999 / **500.000** / 500.001 |
| V3 số ngày còn hạn `d` | [1..∞) (giả định A2) | 0 (hôm nay) / **1** / 2 |
| V4 số lần đã dùng VIP100 (max 2) | [0..1] | 0 / **1** / 2 |

- Dùng Robustness thu gọn: 1 nominal + 4 × 3 = **13 TC**.
- C3 được kiểm tra trên hai mã khác ngưỡng và khác công thức, để phát hiện ngưỡng gắn cứng và kiểm tra công thức ngay tại biên.

### 4.3 Thực thi và phát hiện chính

- **Không có masking về quyết định chấp nhận/từ chối.** Tuy vậy, mọi TC dùng mã `percent` đều sai **số tiền**. Vì vậy bảng kết quả tách hai cột **Quyết định** và **Số tiền**. Nhờ đó vẫn kết luận được biên ngày hết hạn đúng, dù công thức sai.
- **BVA bắt được lỗi off-by-one** mà EP không thấy: tổng đơn **bằng đúng** ngưỡng bị từ chối, trong khi ngưỡng + 1 ₫ thì được chấp nhận. Điều này cho thấy hệ thống dùng `>` thay vì `>=`.
- **Hậu kiểm đơn hàng:** lỗi công thức được ghi vào **đơn hàng thật**. Đơn 10.000.000 ₫ được tạo cho một giỏ 1.000.000 ₫.
- **Kết quả:** 30 TC (15 EP + 13 BVA + 2 bổ sung). **15 Pass, 15 Fail.**

### 4.4 Bug

| Bug | Tóm tắt | Severity | Issue |
|---|---|---|---|
| BUG-FR09-01 | Công thức `percent` sai (`total × (1 − v)`): giảm âm, khách trả gấp 10 lần | Critical | #8 |
| BUG-FR09-02 | Tổng đơn **= min_order_amount** bị từ chối (`>` thay vì `>=`) | Major | #9 |
| BUG-FR09-03 | Áp mã không cần đăng nhập/JWT (API, và route `/checkout` không được bảo vệ) | Critical | #10 |
| BUG-FR09-04 | Né giới hạn số lần dùng bằng cách bỏ `user_id` | Critical | #11 |
| BUG-FR09-05 | Ô tổng tiền ở Checkout sửa được, nên vượt được ngưỡng tối thiểu | Critical | #12 |
| BUG-FR09-06 | API phân biệt hoa/thường và không bỏ khoảng trắng của mã (UI thì có) | Minor | #13 |
| BUG-FR09-07 | Mã hết hạn "hôm nay" vẫn dùng được nếu `expired_at` có kèm giờ | Minor | #14 |
| BUG-FR09-08 | Thành tiền âm và đơn hàng tổng âm khi mức giảm > tổng đơn | Major | #15 |

### 4.5 Gap analysis (tóm tắt)

AI suy ra miền giá trị từ **bảng dữ liệu mẫu** trong SRS thay vì từ nơi dữ liệu thực sự được nhập. Hậu quả là bỏ sót 2 lớp:
- `expired_at` có kèm giờ.
- Mức giảm lớn hơn tổng đơn. AI đã **tự nêu ra rủi ro này rồi gạt đi**.

Hai lớp này dẫn tới 2 bug mới. Ngoài ra:
- Ghi nhận việc **rò rỉ kiến thức hộp trắng** (AI đã đọc mã nguồn trước khi thiết kế).
- Ghi nhận một lần Fail giả do công cụ: email trùng làm đăng nhập vào tài khoản cũ.

---

## 5. FR-15 Quản lý sản phẩm CRUD (Pool C)

Chi tiết: [`features/FR-15_ProductCRUD/`](features/FR-15_ProductCRUD/)

### 5.1 EP

- **Yêu cầu:**
  - Tên bắt buộc, ≤ 255 ký tự.
  - Giá bắt buộc, > 0.
  - Danh mục chọn từ danh sách có sẵn.
  - Sửa một sản phẩm thì chỉ sản phẩm đó thay đổi.
  - Đối chiếu chéo: FR-12/SEC-02/SEC-03 (phân quyền admin), SEC-04 (escape khi hiển thị).
- **Input:**
  - I0 thao tác (Thêm/Sửa/Xóa).
  - I1 tên, I2 giá, I3 danh mục.
  - I4 sản phẩm được chọn.
  - I5 quyền người gọi.
- **21 lớp** (9 hợp lệ, 12 không hợp lệ). Đáng chú ý:
  - Tên tiếng Việt + HTML (áp dụng bài học FR-01).
  - Giá rỗng / 0 / âm / chữ.
  - Danh mục thiếu / không tồn tại.
  - Không token / token user thường.
  - Hai lớp **đầu ra**: Sửa và Xóa chỉ ảnh hưởng đúng 1 sản phẩm.
- **22 TC EP.** Lớp không hợp lệ quan trọng được lặp lại trên **mỗi thao tác**, vì POST/PUT/DELETE là các đường xử lý riêng.

### 5.2 BVA

| Biến | Miền hợp lệ | Điểm |
|---|---|---|
| V1 độ dài tên | [1..255] (hai biên) | 0 / **1** / 2 / 254 / **255** / 256 |
| V2 giá (bước 1 ₫) | [1..∞) | 0 / **1** / 2, và độ bền 2³¹ = 2.147.483.648 |
| V1 trên thao tác Sửa | | **255** / 256 |

- Danh mục **không** dùng BVA, vì `category_id` là định danh, không có thứ tự nghiệp vụ.
- Tổng **13 TC**.

### 5.3 Thực thi và phát hiện chính

- **Mọi TC Pass đều là TC hợp lệ.** Không một lớp không hợp lệ nào bị server từ chối.
- Khả năng từ chối duy nhất của tính năng là thuộc tính HTML5 `required` của ô Tên trên UI.
- **Hậu kiểm toàn bộ danh sách** phát hiện: sau khi Sửa 1 sản phẩm, **bảng Admin đổi tên mọi sản phẩm**.
  - Thăm dò thêm "thao tác tiếp theo của admin" cho thấy lỗi này **ghi tên sai vào CSDL**: iPhone bị đổi tên thật thành Samsung.
  - Bug được nâng từ lỗi hiển thị lên **Critical**.
- **Kết quả:** 37 TC (22 EP + 13 BVA + 2 bổ sung). **13 Pass, 24 Fail.**

### 5.4 Bug

| Bug | Tóm tắt | Severity | Issue |
|---|---|---|---|
| BUG-FR15-01 | POST/PUT/DELETE `/api/products` không cần đăng nhập/quyền admin | Critical | #16 |
| BUG-FR15-02 | Sửa 1 SP thì bảng Admin đổi tên mọi SP; lần sửa tiếp ghi tên sai vào CSDL | Critical | #17 |
| BUG-FR15-03 | Không kiểm tra giá (0, âm, rỗng, chữ) | Major | #18 |
| BUG-FR15-04 | Không kiểm tra tên (> 255 ký tự, chỉ khoảng trắng; API nhận tên rỗng) | Major | #19 |
| BUG-FR15-05 | API chấp nhận danh mục rỗng / không tồn tại | Major | #20 |
| BUG-FR15-06 | Sửa/Xóa SP không tồn tại vẫn trả 200 | Minor | #21 |
| BUG-FR15-07 | PUT thiếu trường thì xóa trắng tên, mô tả, ảnh, danh mục | Major | #22 |

### 5.5 Gap analysis (tóm tắt)

AI chưa phân biệt **trường vắng mặt** với **trường rỗng** ở API. Đây là chiều phân hoạch theo cấu trúc request, và khi bổ sung thì phát hiện BUG-FR15-07. Ngoài ra:
- AI né giả định "đếm theo ký tự" bằng cách chỉ dùng chuỗi ASCII. TC bổ sung với 255 ký tự tiếng Việt thì Pass.
- AI đánh giá severity thấp vì chỉ xét trạng thái ngay sau TC.
- Ghi nhận rò rỉ kiến thức hộp trắng.

---

## 6. FR-20 Mobile: Giỏ hàng & Số lượng (Pool D)

Chi tiết: [`features/FR-20_Mobile_Cart/`](features/FR-20_Mobile_Cart/)

### 6.1 Cơ sở đặc tả và môi trường

FR-20 chỉ ghi app mobile phải có "đầy đủ chức năng … Giỏ hàng". Vì vậy quy tắc nghiệp vụ được lấy từ:
- **FR-06:** số lượng là số nguyên ≥ 1.
- **FR-07:** nút +/−, gộp dòng khi thêm cùng sản phẩm, dialog xác nhận xóa, nhãn "Tổng cộng", giỏ trống có hình minh họa.

Máy kiểm thử không có thiết bị hay emulator. App được chạy bằng **Expo Web** (react-native-web), mô phỏng **Pixel 5** qua Playwright.
- Thay đổi môi trường:
  - `API_URL` đổi sang IP LAN của máy.
  - Cài thêm `react-native-web`, `react-dom`, `@expo/metro-runtime`.
  - Không sửa logic app.
- Giới hạn: `Alert` không hiển thị trên web. Mọi kết luận dựa trên **hiệu ứng** lên giỏ hàng.

### 6.2 EP

- **Input:**
  - I1 số lượng ở trang chi tiết.
  - I2 số lượng sửa trong giỏ.
  - I3 nút +/−.
  - I4 số lần thêm cùng sản phẩm.
  - I5 thao tác Xóa (Đồng ý/Hủy).
  - I6 giỏ trống hay có hàng.
- **19 lớp** (9 hợp lệ, 10 không hợp lệ). Mỗi ô số lượng có 5 cách vi phạm: 0, âm, thập phân, chữ, rỗng.
- **18 TC EP.**
- Các TC sửa số lượng trong giỏ bắt đầu từ SL = 2 (không phải 1). Nhờ vậy phân biệt được "giữ nguyên" với "âm thầm đổi về 1".

### 6.3 BVA

| Biến | Miền hợp lệ | Điểm |
|---|---|---|
| V1 SL ở trang chi tiết | [1..∞) | 0 / **1** / 2, độ bền 999 |
| V2 SL sửa trong giỏ | [1..∞) | 0 / **1** / 2, độ bền 999 |
| V3 SL sau khi bấm +/− | [1..∞) | − tại 1 / − tại 2 / + tại 1 |

Tổng **12 TC**.

### 6.4 Thực thi và phát hiện chính

- **Lỗi "+1":** sửa SL trong giỏ thì giá trị được lưu thành **n + 1**. Nhập 5 được 6, nhập 1 được 2, nhập 999 được 1000.
  - Thăm dò thao tác bàn phím như trên điện thoại: xóa số cũ thì ô nhảy về 1, gõ 5 thì thành **16**.
- **Pass giả EP-16:** nhập `1.5` thì app tính `parseInt(1.5) + 1 = 2`, trùng ngẫu nhiên với SL ban đầu là 2. Chạy lại EP-16R với SL ban đầu 3 → Fail.
- **Masking do gộp tiêu chí:** ở lượt chạy thử, lỗi nhãn "Tổng tạm tính" làm Fail mọi TC hợp lệ. Sau đó tiêu chí nhãn được tách riêng, chỉ tính ở EP-01.
- **Kết quả:** 31 TC (18 EP + 12 BVA + 1 bổ sung). **7 Pass, 24 Fail.**

### 6.5 Bug

| Bug | Tóm tắt | Severity | Issue |
|---|---|---|---|
| BUG-FR20-01 | Sửa SL trong giỏ bị lưu thành n + 1 | Critical | #23 |
| BUG-FR20-02 | Không có nút +/− | Major | #24 |
| BUG-FR20-03 | Xóa ngay, không có dialog xác nhận | Major | #25 |
| BUG-FR20-04 | SL không hợp lệ bị âm thầm đổi thành 1, không thông báo | Minor | #26 |
| BUG-FR20-05 | Nhãn "Tổng tạm tính" thay vì "Tổng cộng" | Minor | #27 |
| BUG-FR20-06 | Giỏ trống không có hình minh họa | Minor | #28 |

### 6.6 Gap analysis (tóm tắt)

- **Độ trung thực của môi trường Expo Web:** bàn phím số trên web không chặn chữ.
- **Pass giả do trùng giá trị.**
- **Masking do gộp tiêu chí đầu ra.**
- **Chưa phân hoạch kiểu dữ liệu do API trả về:** giá trả về dạng chuỗi với id chẵn. TC bổ sung EP-19 Pass.

---

## 7. Tổng hợp kết quả

### 7.1 Test Summary

| Tính năng | TC thiết kế | Đã thực thi | Pass | Fail | Chưa thực thi | Bug (C/M/m) |
|---|---|---|---|---|---|---|
| FR-01 | 42 (19 EP + 21 BVA + 2 bổ sung) | 42 | 1 | 41 | 0 | 7 (4/3/0) |
| FR-09 | 30 (15 EP + 13 BVA + 2 bổ sung) | 30 | 15 | 15 | 0 | 8 (4/2/2) |
| FR-15 | 37 (22 EP + 13 BVA + 2 bổ sung) | 37 | 13 | 24 | 0 | 7 (2/4/1) |
| FR-20 Mobile | 31 (18 EP + 12 BVA + 1 bổ sung) | 31 | 7 | 24 | 0 | 6 (1/2/3) |
| **Tổng** | **140** (74 EP + 59 BVA + 7 bổ sung) | **140** | **36** | **104** | **0** | **28 (11/11/6)** |

*C = Critical, M = Major, m = Minor. Ngoài 140 TC còn có 11 lượt chạy lại (FR-01: 9 TC hậu tố `R`; FR-09: EP-17r; FR-20: EP-16R) và 3 kịch bản thăm dò (mật khẩu UI ở FR-01, hỏng dữ liệu ở FR-15, gõ phím ở FR-20).*

### 7.2 Hiệu quả của từng kỹ thuật

| Kỹ thuật / hoạt động | Bug tìm được nhờ nó (ví dụ) |
|---|---|
| **EP: lớp không hợp lệ, chạy qua API** | Thiếu validation server ở cả 3 tính năng web (FR01-02/06, FR15-01/03/04/05, FR09-03/04) |
| **EP: lớp hợp lệ** (chạy trước) | Lỗi chặn hoàn toàn chức năng chính: FR01-01 (không đăng ký được), FR09-01 (công thức sai), FR20-01 (+1) |
| **EP: lớp đầu ra** | FR15-02 (sửa 1 SP ảnh hưởng mọi SP), FR09-01 |
| **BVA** | FR09-02 (`>` thay vì `>=`, **chỉ BVA phát hiện được**), FR15-04 (không có biên trên 255), FR20-01 tại LB |
| **Đối chiếu chéo SRS** (SEC/GUI/FR khác) | FR01-07 (XSS), FR09-05 (sửa tổng tiền), FR15-01 (phân quyền) |
| **AI gap analysis + TC bổ sung** | FR01-07, FR09-07, FR09-08, FR15-07 |
| **Hậu kiểm + thăm dò** | FR09-01 ghi vào đơn hàng thật; FR15-02 hỏng dữ liệu thật; FR20-01 khi gõ phím |

---

## 8. Phân tích chung về AI và bài học

Tổng hợp từ 4 file `07_ai_gap_analysis.md`. Ý kiến cá nhân về AI nằm ở [AI Critique](ai-audit/AI_Critique.md).

| Loại sai sót của AI | Xuất hiện ở | Biện pháp đã áp dụng |
|---|---|---|
| Phạm vi phân tích theo đúng câu chữ của prompt, bỏ qua yêu cầu ở mục khác (SEC-04) | FR-01 G2 | Từ FR-09: yêu cầu AI liệt kê **mọi yêu cầu liên quan trong toàn SRS** |
| Thiên lệch dữ liệu: ASCII, bảng dữ liệu mẫu | FR-01 G1, FR-09 G1/G2 | Lớp bắt buộc: tiếng Việt, HTML; lấy miền theo nơi dữ liệu được nhập |
| Áp dụng nguyên tắc máy móc, không kiểm tra tiền đề (masking) | FR-01 G4 | Chạy TC hợp lệ trước; thăm dò khi TC hợp lệ Fail |
| Pass giả do trùng giá trị; masking do gộp tiêu chí | FR-20 G2/G3 | Chọn giá trị nền phân biệt được; mỗi tiêu chí đầu ra một TC |
| Chưa phân hoạch trên cấu trúc request (vắng mặt / `null` / sai kiểu) | FR-15 G1 | Thêm chiều phân hoạch cho API |
| Tự nêu rủi ro rồi tự gạt đi; né giả định | FR-09 G2, FR-15 G2 | Mỗi rủi ro phải thành TC hoặc có lý do loại; mỗi giả định ≥ 1 TC |
| Đánh giá severity thấp | FR-15 G5 | Xét chuỗi thao tác tiếp theo của người dùng |
| Rò rỉ kiến thức hộp trắng (đã đọc code trước khi thiết kế) | FR-09/15/20 | Mỗi lớp phải có căn cứ từ spec; trong skill, B0–B4 cấm đọc code |
| Sai số liệu khi viết trước rồi mới đếm | FR-01 G5 | Đếm lại bằng script trước khi ghi |

Tất cả bài học trên được đóng gói thành **checklist 24 mục** trong Agent Skill [`skills/domain-testing/`](skills/domain-testing/), để áp dụng lại cho tính năng khác.

---

## 9. Giới hạn của bài làm

- **FR-20 chạy trên Expo Web**, không trên thiết bị thật. Kết luận dựa trên hiệu ứng nên không phụ thuộc môi trường, nhưng EP-12 và EP-17 (nhập chữ) có thể không tái hiện được bằng bàn phím số của điện thoại.
- **Rò rỉ kiến thức hộp trắng:** AI đã đọc mã nguồn SUT khi tìm hiểu hệ thống, trước khi thiết kế FR-09, FR-15, FR-20. Mọi lớp tương đương đều đã được kiểm tra lại để có căn cứ từ đặc tả.
- **Một số giả định là diễn giải của AI**, đã được sinh viên chấp nhận (ví dụ FR-01 A3, A5; FR-09 A1, A2). Các bug phụ thuộc giả định được ghi rõ và xếp mức thấp hơn.
- **Ngoài phạm vi EP/BVA:** kiểm thử đồng thời, hiệu năng, khả năng truy cập. Các rủi ro còn lại được liệt kê ở mục 7.2 của từng tính năng.

---

## 10. Danh mục tài liệu

| Tài liệu | Đường dẫn |
|---|---|
| Báo cáo chính (bản này, có PDF) | `REPORT.md`, `REPORT.pdf` |
| 7 bước × 4 tính năng | `features/FR-01_Register/`, `features/FR-09_Coupon/`, `features/FR-15_ProductCRUD/`, `features/FR-20_Mobile_Cart/` |
| Bug report (Markdown) + GitHub Issues #1–#28 | `features/*/06_bug_report.md`, `bugs/` |
| Ảnh minh chứng | `features/*/screenshots/` |
| Kết quả thô | `features/*/results_*.json` |
| Script thực thi (Playwright, API) | `scripts/` |
| Agent Skill | `skills/domain-testing/` |
| AI Audit Report, AI Critique (MD + PDF) | `ai-audit/` |
| Git commit log | `git_commit_log.txt` |
| README (tự đánh giá + test summary) | `README.md` |
