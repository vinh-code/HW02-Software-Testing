# FR-09 Mã giảm giá (Coupon): Bước 6, Báo cáo lỗi

**Môi trường chung:** EShop `85af3ba`, Backend `localhost:3000`, Web `localhost:5173`, Chromium 131, DB seed mặc định cộng dữ liệu chuẩn bị ở [Bước 5 §5.1](05_test_execution.md). Thời điểm phát hiện: 2026-10-13.

| Bug ID | Tiêu đề | Severity | Priority | TC phát hiện |
|---|---|---|---|---|
| BUG-FR09-01 | Coupon `percent` tính sai: số tiền giảm âm, khách bị tính gấp 10 lần | **Critical** | P1 | EP-01, EP-03, BVA-01, BVA-04, BVA-09, BVA-10 |
| BUG-FR09-02 | Tổng đơn **bằng đúng** `min_order_amount` bị từ chối (dùng `>` thay vì `>=`) | Major | P1 | BVA-03, BVA-06 |
| BUG-FR09-03 | Áp mã giảm giá không cần đăng nhập/JWT (API và trang `/checkout`) | **Critical** | P1 | EP-11, EP-12 |
| BUG-FR09-04 | Né giới hạn số lần dùng mã bằng cách bỏ `user_id` khỏi request | **Critical** | P1 | EP-14 |
| BUG-FR09-05 | Ô "Tổng tiền thanh toán" sửa được, nên áp được mã khi giỏ chưa đủ ngưỡng | **Critical** | P1 | EP-15 |
| BUG-FR09-06 | API phân biệt chữ hoa/thường và không bỏ khoảng trắng của mã, không nhất quán với UI | Minor | P3 | EP-03, EP-04 (kênh API) |

---

## BUG-FR09-01: Coupon `percent` tính sai, số tiền giảm âm và khách bị tính gấp 10 lần

- **Tính năng & kỹ thuật:** FR-09, EP với lớp đầu ra EC18 (O1a `percent`); BVA tại mọi điểm hợp lệ của mã percent.
- **Severity:** Critical. Khách hàng bị **tính tiền gấp 10 lần** giá trị giỏ hàng, và số tiền sai được ghi vào đơn hàng thật.

**Các bước tái hiện**
1. Đăng nhập `http://localhost:5173` bằng một tài khoản chưa dùng SAVE10.
2. Thêm 1 sản phẩm giá 1.000.000 ₫ vào giỏ → **Giỏ hàng** → **Tiến hành thanh toán**.
3. Nhập mã `SAVE10` → **Áp dụng**.
4. Bấm **Xác Nhận Thanh Toán**, rồi đăng nhập Admin và mở tab **Đơn hàng**.

**Kết quả mong đợi (SRS FR-09):** `discount_amount = 1.000.000 × 10 / 100 = 100.000`, `final_amount = 900.000`. Đơn hàng có tổng 900.000 ₫.

**Kết quả thực tế**
- UI hiện "Tiết kiệm: **-9,000,000 ₫**", "Thành tiền: **10,000,000 ₫**". API trả `{"discount_amount": -9000000, "final_amount": 10000000}`.
- Đơn hàng #1 được lưu với tổng **10,000,000 ₫**.
- Từ các điểm đo, công thức thực tế là `total × (1 − discount_value)`: 300.001 → −2.700.009 → 3.000.010. Mã `fixed` (BIGBUY, VIP100) tính đúng.

**Minh chứng:** [EP-01_ui.png](screenshots/EP-01_ui.png), [BUG-FR09-01_api_percent_formula.png](screenshots/BUG-FR09-01_api_percent_formula.png), [BUG-FR09-01_admin_order_10x.png](screenshots/BUG-FR09-01_admin_order_10x.png), [BVA-04_ui.png](screenshots/BVA-04_ui.png)

---

## BUG-FR09-02: Tổng đơn bằng đúng `min_order_amount` bị từ chối (dùng `>` thay vì `>=`)

- **Tính năng & kỹ thuật:** FR-09 C3, **BVA** tại biên LB của V1 (SAVE10, min 300.000) và V2 (BIGBUY, min 500.000).
- **Severity:** Major. Spec nhấn mạnh **">= (lớn hơn hoặc bằng)"**. Khách có đơn đúng bằng ngưỡng (trường hợp phổ biến vì ngưỡng là số tròn) không dùng được mã.

**Các bước tái hiện**
1. Đăng nhập, thêm 1 sản phẩm giá **300.000 ₫** vào giỏ, rồi vào trang thanh toán.
2. Nhập `SAVE10` → **Áp dụng**.
3. Làm lại với sản phẩm giá **500.000 ₫** và mã `BIGBUY`.

**Kết quả mong đợi:** Áp dụng thành công. SAVE10 giảm 30.000, còn 270.000. BIGBUY giảm 50.000, còn 450.000.

**Kết quả thực tế:** *"Đơn hàng chưa đủ giá trị tối thiểu 300,000 ₫ để áp dụng mã này"* (tương tự với 500,000 ₫). Thông báo tự mâu thuẫn, vì đơn đúng bằng 300.000 ₫. Tại LB+1 (300.001 / 500.001), mã được chấp nhận. Tại LB−1 (299.999 / 499.999), mã bị từ chối đúng.

**Minh chứng:** [BVA-03_ui.png](screenshots/BVA-03_ui.png), [BVA-06_ui.png](screenshots/BVA-06_ui.png), [BUG-FR09-02_api_save10_equal_min.png](screenshots/BUG-FR09-02_api_save10_equal_min.png), [BUG-FR09-02_api_bigbuy_equal_min.png](screenshots/BUG-FR09-02_api_bigbuy_equal_min.png)

---

## BUG-FR09-03: Áp mã giảm giá không cần đăng nhập/JWT (API và trang `/checkout`)

- **Tính năng & kỹ thuật:** FR-09 C4, EP với các lớp EC13 (chưa đăng nhập) và EC14 (token không hợp lệ). Đối chiếu SEC-02.
- **Severity:** Critical (bảo mật). Điều kiện C4 hoàn toàn không được kiểm tra ở server.

**Các bước tái hiện**
1. API: gửi `POST /api/apply-coupon` với body `{"code":"VIP100","total_amount":1000000,"user_id":null}` và **không có** header `Authorization`.
2. API: gửi lại request trên với header `Authorization: Bearer abc.def.ghi` (token giả).
3. UI: khi **chưa đăng nhập**, thêm sản phẩm vào giỏ, mở **Giỏ hàng**, bấm **Tiến hành thanh toán**. Thấy alert "Bạn cần đăng nhập để thanh toán!" và bị chuyển tới `/login`. Sau đó mở `/checkout` bằng điều hướng phía client (giỏ hàng vẫn còn), nhập `SAVE10` → **Áp dụng**.

**Kết quả mong đợi:** API trả 401/403. Trang `/checkout` chuyển hướng về đăng nhập, không cho áp mã.

**Kết quả thực tế**
- Bước 1 và 2: HTTP **200**, `success: true`, giảm 100.000 ₫.
- Bước 3: trang Giỏ hàng có chặn, nhưng **route `/checkout` không được bảo vệ**. Header vẫn hiện "Đăng nhập / Đăng ký", và mã được áp thành công.

**Minh chứng:** [BUG-FR09-03_api_no_token.png](screenshots/BUG-FR09-03_api_no_token.png), [BUG-FR09-03_api_fake_token.png](screenshots/BUG-FR09-03_api_fake_token.png), [EP-11_ui.png](screenshots/EP-11_ui.png)

---

## BUG-FR09-04: Né giới hạn số lần dùng mã bằng cách bỏ `user_id` khỏi request

- **Tính năng & kỹ thuật:** FR-09 C5, EP với lớp EC17 (giả định A5: user phải lấy từ JWT).
- **Severity:** Critical. Một user có thể dùng mã "1 lần/người" **không giới hạn**, gây thất thoát doanh thu.

**Các bước tái hiện**
1. Đăng nhập `test@eshop.com` và thanh toán một đơn có áp `SAVE10` (lượt dùng = 1/1). Có thể thay bằng `POST /api/coupon-usage {"coupon_id":1}` với token của user này, đây chính là lời gọi UI thực hiện sau khi thanh toán.
2. Gửi `POST /api/apply-coupon` với token của `test@eshop.com`, body `{"code":"SAVE10","total_amount":1000000,"user_id":2}`.
3. Gửi lại với **cùng token**, nhưng body **bỏ** `user_id`: `{"code":"SAVE10","total_amount":1000000}`.

**Kết quả mong đợi:** Cả bước 2 và 3 đều bị từ chối "đã sử dụng hết lượt", vì user được xác định từ token.

**Kết quả thực tế:** Bước 2 bị từ chối đúng (HTTP 400). Bước 3 trả **HTTP 200, áp dụng thành công**. Hệ thống đếm lượt dùng theo `user_id` do client gửi lên và **bỏ qua hẳn** việc kiểm tra C5 khi trường này vắng mặt.

**Minh chứng:** [BUG-FR09-04_api_with_user_id.png](screenshots/BUG-FR09-04_api_with_user_id.png), [BUG-FR09-04_api_without_user_id.png](screenshots/BUG-FR09-04_api_without_user_id.png)

---

## BUG-FR09-05: Ô "Tổng tiền thanh toán" sửa được, nên áp được mã khi giỏ chưa đủ ngưỡng

- **Tính năng & kỹ thuật:** FR-09 C3 kết hợp FR-08, EP với lớp EC21 (tổng tiền bị client sửa).
- **Severity:** Critical. Người dùng tự quyết định tổng tiền dùng để xét ngưỡng (và cả số tiền thanh toán), nên điều kiện C3 vô nghĩa.

**Các bước tái hiện**
1. Đăng nhập, thêm 1 sản phẩm giá **200.000 ₫** (dưới ngưỡng 300.000 của SAVE10) vào giỏ, rồi vào trang thanh toán.
2. Ở ô **"Tổng tiền thanh toán (VND)"**, xóa `200000` và gõ `1000000`.
3. Nhập `SAVE10` → **Áp dụng**.

**Kết quả mong đợi:** Ô tổng tiền chỉ hiển thị, không cho sửa (FR-08). Nếu tổng bị sửa, mã vẫn phải bị từ chối vì giỏ thật chỉ có 200.000 ₫.

**Kết quả thực tế:** Ô cho sửa tự do. Mã được chấp nhận, "Thành tiền" hiển thị theo tổng đã sửa. Danh sách sản phẩm ngay phía trên vẫn ghi "TEST-F09 200000 x 1 — 200,000 ₫".

**Minh chứng:** [EP-15_ui.png](screenshots/EP-15_ui.png)

---

## BUG-FR09-06: API phân biệt chữ hoa/thường và không bỏ khoảng trắng của mã, không nhất quán với UI

- **Tính năng & kỹ thuật:** FR-09 C1, EP với các lớp EC2, EC3 (giả định A1).
- **Severity:** Minor. Người dùng web không bị ảnh hưởng vì UI tự `trim()` và `toUpperCase()`. Nhưng các client khác (ví dụ ứng dụng mobile) gọi cùng API sẽ báo "không tồn tại" cho mã hợp lệ.

**Các bước tái hiện:** gửi `POST /api/apply-coupon` (có token) với `code` lần lượt là `"save10"` và `" VIP100 "`, `total_amount = 1000000`.

**Kết quả mong đợi:** Như với `SAVE10` / `VIP100`: áp dụng thành công.

**Kết quả thực tế:** HTTP **404** *"Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa"*. Cùng dữ liệu nhập qua UI thì thành công ([EP-04_ui.png](screenshots/EP-04_ui.png)). Việc chuẩn hóa mã chỉ nằm ở phía client.

**Minh chứng:** [BUG-FR09-06_api_lowercase.png](screenshots/BUG-FR09-06_api_lowercase.png), [BUG-FR09-06_api_whitespace.png](screenshots/BUG-FR09-06_api_whitespace.png)

---

## Quan sát ngoài phạm vi FR-09 (không tính là bug của tính năng này)

- Nút **Áp dụng** màu cam và nút **Xác Nhận Thanh Toán** màu xanh lá. FR-21 yêu cầu nút hành động tích cực dùng màu xanh dương.
- Trang chi tiết sản phẩm phải bấm **"Thêm vào giỏ hàng" 2 lần** mới thêm được (lần đầu không có tác dụng). Lỗi này thuộc FR-06, đã được script xử lý khi chuẩn bị giỏ hàng.
- Trang Giỏ hàng ghi **"Tổng tạm tính"** thay vì "Tổng cộng" (FR-07).
