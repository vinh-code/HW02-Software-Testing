# FR-01 Đăng ký tài khoản: Bước 6, Báo cáo lỗi

**Môi trường chung:** EShop `85af3ba`, Backend `localhost:3000`, Web `localhost:5173`, Chromium 131, DB seed mặc định. Thời điểm phát hiện: 2026-10-13.

| Bug ID | Tiêu đề | Severity | Priority | TC phát hiện |
|---|---|---|---|---|
| BUG-FR01-01 | UI từ chối mọi mật khẩu hợp lệ theo spec, chỉ chấp nhận mật khẩu có khoảng trắng | **Critical** | P1 | EP-01, EP-02, BVA-01/03/04/06/07/09/10/12/13/15/16/18/19/20/21 |
| BUG-FR01-02 | API `/api/register` không kiểm tra độ mạnh mật khẩu | **Critical** | P1 | EP-11, EP-13…EP-17, BVA-05/08/11/14/17 |
| BUG-FR01-03 | Không kiểm tra email trùng, cho tạo nhiều tài khoản cùng email | **Critical** | P1 | EP-09, EP-10, EP-09R, EP-10R |
| BUG-FR01-04 | Không kiểm tra định dạng email (API và UI) | Major | P2 | EP-05…EP-07, EP-05R…EP-07R |
| BUG-FR01-05 | Thiếu trường "Xác nhận mật khẩu" (UI và API) | Major | P2 | EP-18, EP-19 |
| BUG-FR01-06 | API chấp nhận trường bắt buộc rỗng; họ tên chỉ có khoảng trắng được chấp nhận ở cả UI | Major | P2 | EP-03, EP-04, EP-04R, EP-08, EP-12, BVA-02 |
| BUG-FR01-07 | Stored XSS: Họ tên chứa HTML được thực thi trên header sau khi đăng nhập | **Critical** | P1 | EP-21 (TC bổ sung sau gap analysis) |

---

## BUG-FR01-01: UI từ chối mọi mật khẩu hợp lệ theo spec, chỉ chấp nhận mật khẩu có khoảng trắng

- **Tính năng & kỹ thuật:** FR-01, Phân hoạch tương đương (TC hợp lệ EP-01) và BVA (toàn bộ TC hợp lệ)
- **Severity:** Critical. Người dùng **không thể đăng ký** bằng bất kỳ mật khẩu đúng chuẩn nào.

**Các bước tái hiện**
1. Mở `http://localhost:5173/register`.
2. Nhập Họ Tên `Nguyen Van A`, Email `new01@gmail.com`, Mật khẩu `Abcdef1@`.
3. Bấm **Đăng Ký**.
4. Làm lại các bước 1–3 với Email `new02@gmail.com` và Mật khẩu `Abcdef1 ` (có khoảng trắng ở cuối, **không** có ký tự đặc biệt).

**Kết quả mong đợi (SRS FR-01)**
- Bước 3: đăng ký thành công và chuyển sang `/login`, vì `Abcdef1@` dài 8 ký tự và có đủ chữ hoa, chữ thường, chữ số, ký tự đặc biệt `@`.
- Bước 4: bị từ chối vì thiếu ký tự đặc biệt thuộc tập `@$!%*?&`.

**Kết quả thực tế**
- Bước 3: hiện lỗi *"Mật khẩu quá yếu! … và KÝ TỰ ĐẶC BIỆT"*, không tạo tài khoản.
- Bước 4: **đăng ký thành công**.
- Thăm dò thêm cho thấy UI coi **khoảng trắng** là "ký tự đặc biệt" và **cấm** mọi ký tự trong tập `@$!%*?&`. Ví dụ, `Abcdef1@ ` (có cả `@` và khoảng trắng) vẫn bị từ chối.

**Minh chứng:** [EP-01_ui.png](screenshots/EP-01_ui.png), [BVA-06_ui.png](screenshots/BVA-06_ui.png) (len = 8, đúng biên), bảng thăm dò trong [05_test_execution.md §5.2](05_test_execution.md).

---

## BUG-FR01-02: API `/api/register` không kiểm tra độ mạnh mật khẩu

- **Tính năng & kỹ thuật:** FR-01. EP với các lớp EC12, EC15–EC19; BVA với các biên LB−1 của V2–V6.
- **Severity:** Critical (bảo mật). Chỉ cần gọi thẳng API là bỏ qua được mọi validation ở client.

**Các bước tái hiện**
```bash
curl -X POST http://localhost:3000/api/register -H "Content-Type: application/json" \
  -d '{"name":"Nguyen Van A","email":"weak7@gmail.com","password":"Abcd1@x"}'
```

**Kết quả mong đợi:** HTTP 4xx kèm thông báo mật khẩu không đạt yêu cầu, và không tạo tài khoản.

**Kết quả thực tế:** HTTP 200 `{"message":"User registered successfully"}`. Tài khoản được tạo và đăng nhập được. Tất cả 11 mật khẩu yếu đều được chấp nhận:

| TC | Mật khẩu | Vi phạm |
|---|---|---|
| EP-11 / BVA-05 | `Abcd1@x` / `ABcd1@!` | 7 ký tự |
| EP-13 / BVA-08 | `abcdef1@` / `abcdef123@!$` | 0 chữ hoa |
| EP-14 / BVA-11 | `ABCDEF1@` / `ABCDEF123@!$` | 0 chữ thường |
| EP-15 / BVA-14 | `Abcdefg@` / `ABCdefghi@!$` | 0 chữ số |
| EP-16 / BVA-17 | `Abcdefg1` / `ABCdef123ghi` | 0 ký tự đặc biệt |
| EP-17 | `Abcdef1#` | Ký tự đặc biệt ngoài tập |

**Minh chứng:** [BUG-FR01-02_api_weak_password.png](screenshots/BUG-FR01-02_api_weak_password.png), [BUG-FR01-02_api_no_special.png](screenshots/BUG-FR01-02_api_no_special.png)

---

## BUG-FR01-03: Không kiểm tra email trùng, cho tạo nhiều tài khoản cùng email

- **Tính năng & kỹ thuật:** FR-01, EP với các lớp EC9 và EC10
- **Severity:** Critical. Vi phạm ràng buộc "email duy nhất". Khi đăng nhập, hệ thống chỉ lấy một trong các bản ghi trùng, nên chủ tài khoản thật có thể bị nhầm lẫn danh tính hoặc bị chiếm tài khoản.

**Các bước tái hiện**
1. Mở `/register`. Nhập Họ Tên `Nguyen Van A`, Email `test@eshop.com` (tài khoản seed đã tồn tại), Mật khẩu `Abcdef1 ` (dùng mật khẩu UI chấp nhận, xem BUG-FR01-01). Bấm **Đăng Ký**.
2. Hoặc gọi thẳng API: `POST /api/register` với `{"name":"Nguyen Van A","email":"test@eshop.com","password":"Abcdef1@"}`.
3. Đăng nhập Admin, mở tab **Người dùng**.

**Kết quả mong đợi:** Hệ thống báo "Email đã được sử dụng" và không tạo tài khoản. `TEST@eshop.com` cũng phải bị coi là trùng (giả định A5).

**Kết quả thực tế:** UI chuyển sang `/login`, API trả HTTP 200. Tab Người dùng có **nhiều dòng `test@eshop.com`** (id 2, 11, …) và một dòng `TEST@eshop.com`.

**Minh chứng:** [BUG-FR01-03_api_duplicate_email.png](screenshots/BUG-FR01-03_api_duplicate_email.png), [BUG-FR01-03_admin_users_duplicates.png](screenshots/BUG-FR01-03_admin_users_duplicates.png)

---

## BUG-FR01-04: Không kiểm tra định dạng email (API và UI)

- **Tính năng & kỹ thuật:** FR-01, EP với các lớp EC5, EC6, EC7
- **Severity:** Major

**Các bước tái hiện**
1. Mở `/register`. Nhập Họ Tên `Nguyen Van A`, Mật khẩu `Abcdef1 `.
2. Lần lượt nhập Email: `vinh.gmail.com`, `@gmail.com`, `vinh@gmail`. Bấm **Đăng Ký**.

**Kết quả mong đợi:** Hiện lỗi "Email không đúng định dạng" và không tạo tài khoản.

**Kết quả thực tế:** Cả 3 email đều được chấp nhận ở UI (sau khi chạy lại tách lỗi) và ở API. Ô Email trên UI dùng `type="text"`, nên không có validation HTML5. Điều này cũng vi phạm FR-22 ("Trường Email phải dùng `type="email"`").

**Minh chứng:** [BUG-FR01-04_api_invalid_email.png](screenshots/BUG-FR01-04_api_invalid_email.png), [BUG-FR01-03_admin_users_duplicates.png](screenshots/BUG-FR01-03_admin_users_duplicates.png) (id 7, 8, 9)

---

## BUG-FR01-05: Thiếu trường "Xác nhận mật khẩu" (UI và API)

- **Tính năng & kỹ thuật:** FR-01, EP với các lớp EC21, EC22, EC23
- **Severity:** Major. Thiếu chức năng được spec yêu cầu (R7). Người dùng có thể đăng ký với mật khẩu gõ nhầm mà không hề biết.

**Các bước tái hiện**
1. Mở `/register` và quan sát form.
2. Gọi `POST /api/register` với `password = "Abcdef1@"` và `confirmPassword = "Abcdef1!"`.

**Kết quả mong đợi:** Form có ô "Xác nhận mật khẩu". Hệ thống từ chối khi hai giá trị không khớp.

**Kết quả thực tế:** Form chỉ có 3 ô: Họ Tên, Email, Mật khẩu. API bỏ qua `confirmPassword`, trả HTTP 200 và tạo tài khoản.

**Minh chứng:** [EP-18_ui.png](screenshots/EP-18_ui.png), [BUG-FR01-05_api_confirm_mismatch.png](screenshots/BUG-FR01-05_api_confirm_mismatch.png)

---

## BUG-FR01-06: API chấp nhận trường bắt buộc rỗng; họ tên chỉ có khoảng trắng được chấp nhận ở cả UI

- **Tính năng & kỹ thuật:** FR-01. EP với các lớp EC2, EC3, EC8, EC13; BVA với V1 = 0.
- **Severity:** Major

**Các bước tái hiện**
1. Gọi `POST /api/register` với body `{"name":"","email":"","password":""}`.
2. Trên UI `/register`: nhập Họ Tên `"   "` (3 khoảng trắng), Email `ws@gmail.com`, Mật khẩu `Abcdef1 `. Bấm **Đăng Ký**.

**Kết quả mong đợi:** Từ chối, kèm thông báo "Vui lòng nhập Họ tên / Email / Mật khẩu".

**Kết quả thực tế**
1. API trả HTTP 200 và tạo một tài khoản hoàn toàn rỗng (id 10 trong tab Người dùng).
2. UI chấp nhận họ tên chỉ có khoảng trắng và chuyển sang `/login`. UI chỉ chặn được trường **rỗng hoàn toàn** nhờ thuộc tính HTML5 `required`.

**Minh chứng:** [BUG-FR01-06_api_all_empty.png](screenshots/BUG-FR01-06_api_all_empty.png), [EP-04R_ui.png](screenshots/EP-04R_ui.png), [BUG-FR01-03_admin_users_duplicates.png](screenshots/BUG-FR01-03_admin_users_duplicates.png) (id 10)

---

## BUG-FR01-07: Stored XSS, Họ tên chứa HTML được thực thi trên header sau khi đăng nhập

- **Tính năng & kỹ thuật:** FR-01, EP với lớp bổ sung EC27 "Họ tên chứa ký tự/thẻ HTML" (xem [07_ai_gap_analysis.md](07_ai_gap_analysis.md))
- **Severity:** Critical (bảo mật, vi phạm SEC-04). Kẻ tấn công đăng ký với họ tên chứa mã độc. Mã chạy trên trình duyệt của **bất kỳ ai** đăng nhập bằng tài khoản đó, và có thể đánh cắp token trong `localStorage`.

**Các bước tái hiện**
1. Gọi `POST /api/register` với `{"name":"<img src=x onerror=\"window.__xss=1;this.style.border='3px solid red'\">Hacker","email":"xss@gmail.com","password":"Abcdef1@"}`.
2. Mở `http://localhost:5173/login`, đăng nhập bằng `xss@gmail.com` / `Abcdef1@`.
3. Quan sát header (góc phải, phần "Chào, …"). Mở Console và gõ `window.__xss`.

**Kết quả mong đợi:** Header hiển thị nguyên văn chuỗi `Chào, <img src=x …>Hacker` dưới dạng văn bản (đã escape). Không có script nào được thực thi.

**Kết quả thực tế:** Thẻ `<img>` được render thật, `onerror` chạy (`window.__xss === 1`), ảnh hỏng có viền đỏ. DOM của header chứa `Chào, <img src="x" onerror="…">`.

**Minh chứng:** [EP-21_ui_header_xss.png](screenshots/EP-21_ui_header_xss.png)

---

## Quan sát ngoài phạm vi FR-01 (không tính là bug của tính năng này)

- Nút **Đăng Ký** màu đỏ. FR-21 yêu cầu nút hành động tích cực dùng màu xanh dương.
- Các trường bắt buộc không có dấu `*` (FR-22).
