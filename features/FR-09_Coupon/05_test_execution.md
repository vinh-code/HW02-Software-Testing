# FR-09 Mã giảm giá (Coupon): Bước 5, Thực thi kiểm thử

## 5.1 Môi trường

| Mục | Giá trị |
|---|---|
| Thời điểm chạy | 2026-10-13 14:17 (GMT+7), tức "hôm nay" = 2026-10-13. Dữ liệu thô: [`results_fr09.json`](results_fr09.json) |
| SUT | `eshop-sut` commit `85af3ba`. Backend `:3000`, Web `:5173` |
| Trạng thái DB | Khởi động lại backend ngay trước khi chạy để seed lại DB (4 coupon mẫu, 0 lượt dùng, 0 đơn hàng) |
| Trình duyệt | Chromium 131 (headless) qua Playwright 1.49.1 |
| Script | [`scripts/fr09_coupon.js`](../../scripts/fr09_coupon.js). Chạy lại bằng `cd scripts && node fr09_coupon.js` |
| Cách tách dữ liệu | Mỗi TC, mỗi kênh dùng **một user mới**: `vinh.api.f09.<tc>@gmail.com`, `vinh.ui.f09.<tc>@gmail.com` |

**Dữ liệu chuẩn bị** (script tự tạo trước khi chạy, xem [Bước 2 §2.3](02_equivalence_classes.md)):

| Dữ liệu | Giá trị thực tế |
|---|---|
| 8 sản phẩm test `TEST-F09 <giá>` (danh mục Phụ kiện) | giá 200.000 / 299.999 / 300.000 / 300.001 / 499.999 / 500.000 / 500.001 / 1.000.000, id 6–13 |
| Coupon biên (percent 10%, min 300.000, 1 lần/người) | `EXP0D` hết hạn 2026-10-13, `EXP1D` 2026-10-14, `EXP2D` 2026-10-15 |
| Coupon bị vô hiệu hóa | `OFF10` (2099-12-31), sau đó `UPDATE coupons SET is_active = 0` trực tiếp trong SQLite (giả định A6) |
| Lượt dùng có sẵn (`used`) | EP-13 UI: **thanh toán thật** có áp SAVE10 một lần. EP-13/14 API, BVA-12/13: gọi `POST /api/coupon-usage`, đúng lời gọi UI thực hiện sau thanh toán |

**Tiêu chí Pass/Fail**
- TC mong đợi **O1**: Pass khi hệ thống **chấp nhận** mã **và** `discount_amount`, `final_amount` đúng công thức R7/R8. Trên UI, đọc các dòng "Tiết kiệm" và "Thành tiền".
- TC mong đợi **O2**: Pass khi hệ thống **từ chối** mã. API trả 4xx; UI hiện thông báo lỗi hoặc không cho bấm **Áp dụng**.
- Một TC Pass khi **mọi kênh** được chạy đều Pass.

## 5.2 Kiểm tra lỗi che lỗi (masking) trước khi đọc kết quả

Bài học từ FR-01: chạy TC hợp lệ trước. Kết quả của EP-01 (SAVE10) là **mã được chấp nhận nhưng số tiền sai**: giảm **−9.000.000** ₫, thành tiền **10.000.000** ₫ cho giỏ 1.000.000 ₫. EP-02 (BIGBUY) Pass hoàn toàn.

Kết luận: **không có masking** đối với quyết định chấp nhận/từ chối. Bộ giá trị nền (SAVE10, 1.000.000, đã đăng nhập, `used = 0`) vẫn được chấp nhận, nên khi một TC không hợp lệ bị từ chối, nguyên nhân chính là lớp không hợp lệ đang test. Tuy nhiên, mọi TC hợp lệ dùng mã `percent` sẽ Fail về **số tiền**. Vì vậy, các bảng dưới tách riêng hai cột **Quyết định** (chấp nhận/từ chối có đúng không) và **Số tiền**. Nhờ đó vẫn đánh giá được đúng điểm biên, ngay cả khi công thức sai.

## 5.3 Kết quả: Phân hoạch tương đương (15 TC)

Ký hiệu: "−a → b" nghĩa là giảm a, thành tiền b. ✅ đúng, ❌ sai so với mong đợi.

| TC | Mã | Giỏ | Mong đợi | API: thực tế | API | UI: thực tế | UI | KQ |
|---|---|---|---|---|---|---|---|---|
| EP-01 | `SAVE10` | 1.000.000 | O1: −100.000 → 900.000 | 200, **−(−9.000.000) → 10.000.000** | ❌ | Thành công, −(−9.000.000) → 10.000.000 | ❌ | ❌ [ảnh](screenshots/EP-01_ui.png) |
| EP-02 | `BIGBUY` | 1.000.000 | O1: −50.000 → 950.000 | 200, −50.000 → 950.000 | ✅ | Thành công, −50.000 → 950.000 | ✅ | ✅ [ảnh](screenshots/EP-02_ui.png) |
| EP-03 | `save10` | 1.000.000 | O1: −100.000 → 900.000 | **404** "Mã giảm giá không tồn tại…" | ❌ | Thành công (UI tự chuyển chữ hoa), nhưng −(−9.000.000) → 10.000.000 | ❌ | ❌ [ảnh](screenshots/EP-03_ui.png) |
| EP-04 | `" VIP100 "` | 1.000.000 | O1: −100.000 → 900.000 | **404** "Mã giảm giá không tồn tại…" | ❌ | Thành công (UI tự `trim`), −100.000 → 900.000 | ✅ | ❌ [ảnh](screenshots/EP-04_ui.png) |
| EP-05 | `ABC123` | 1.000.000 | O2 | 404 "Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa" | ✅ | Thông báo như API | ✅ | ✅ [ảnh](screenshots/EP-05_ui.png) |
| EP-06 | `""` | 1.000.000 | O2 | 400 "Vui lòng nhập mã giảm giá" | ✅ | Nút **Áp dụng** bị vô hiệu hóa | ✅ | ✅ [ảnh](screenshots/EP-06_ui.png) |
| EP-07 | `OFF10` | 1.000.000 | O2 | 404 "…hoặc đã bị vô hiệu hóa" | ✅ | Thông báo như API | ✅ | ✅ [ảnh](screenshots/EP-07_ui.png) |
| EP-08 | `EXPIRED` | 1.000.000 | O2 | 400 "Mã giảm giá đã hết hạn" | ✅ | Thông báo như API | ✅ | ✅ [ảnh](screenshots/EP-08_ui.png) |
| EP-09 | `EXP0D` | 1.000.000 | O2 | 400 "Mã giảm giá đã hết hạn" | ✅ | Thông báo như API | ✅ | ✅ [ảnh](screenshots/EP-09_ui.png) |
| EP-10 | `SAVE10` | 200.000 | O2 | 400 "Đơn hàng chưa đủ giá trị tối thiểu 300,000 ₫…" | ✅ | Thông báo như API | ✅ | ✅ [ảnh](screenshots/EP-10_ui.png) |
| EP-11 | `SAVE10` | 1.000.000 | O2: yêu cầu đăng nhập | **200**, áp dụng thành công khi **không có token, `user_id = null`** | ❌ | Trang Giỏ hàng chặn (alert "Bạn cần đăng nhập để thanh toán!"), **nhưng** mở thẳng `/checkout` vẫn hiển thị và **áp mã thành công** | ❌ | ❌ [ảnh](screenshots/EP-11_ui.png) |
| EP-12 | `SAVE10` | 1.000.000 | O2: 401/403 | **200**, áp dụng thành công với `Authorization: Bearer abc.def.ghi` | ❌ | không áp dụng | – | ❌ |
| EP-13 | `SAVE10` | 1.000.000 | O2: hết lượt | 400 "Bạn đã sử dụng mã này 1 lần (đã đạt giới hạn)" | ✅ | Lần 1 thanh toán thành công ([ảnh lần 1](screenshots/EP-13_ui_lan1.png)); lần 2 bị từ chối, cùng thông báo | ✅ | ✅ [ảnh](screenshots/EP-13_ui.png) |
| EP-14 | `SAVE10` | 1.000.000 | O2: hết lượt | **200**, áp dụng thành công khi body **không có `user_id`** (token hợp lệ của user đã dùng hết lượt) | ❌ | không áp dụng | – | ❌ |
| EP-15 | `SAVE10` | 200.000 → **sửa 1.000.000** | O2 | không áp dụng | – | Ô tổng tiền **sửa được**; mã được **chấp nhận** dù giỏ thật chỉ 200.000 | ❌ | ❌ [ảnh](screenshots/EP-15_ui.png) |

**Hậu kiểm EP-13:** sau lần thanh toán thứ nhất, `GET /api/admin/orders` cho thấy đơn #1 của user `F09 ui EP-13` có `total_amount = 10.000.000` cho giỏ 1.000.000 ₫. **Lỗi công thức không chỉ hiển thị sai mà còn ghi vào đơn hàng thật**, nên khách bị tính gấp 10 lần.

## 5.4 Kết quả: Phân tích giá trị biên (13 TC)

| TC | Biến, điểm | Giá trị | Mong đợi | Quyết định (API / UI) | Số tiền (API = UI) | KQ |
|---|---|---|---|---|---|---|
| BVA-01 | nominal | SAVE10, 1.000.000 | O1: −100.000 → 900.000 | chấp nhận ✅ / ✅ | −(−9.000.000) → 10.000.000 ❌ | ❌ [ảnh](screenshots/BVA-01_ui.png) |
| BVA-02 | V1 LB−1 | SAVE10, **299.999** | O2 | từ chối ✅ / ✅ | – | ✅ [ảnh](screenshots/BVA-02_ui.png) |
| BVA-03 | V1 **LB** | SAVE10, **300.000** | O1: −30.000 → 270.000 | **từ chối** ❌ / ❌ "chưa đủ giá trị tối thiểu 300,000 ₫" | – | ❌ [ảnh](screenshots/BVA-03_ui.png) |
| BVA-04 | V1 LB+1 | SAVE10, **300.001** | O1: −30.000 → 270.001 | chấp nhận ✅ / ✅ | −(−2.700.009) → 3.000.010 ❌ | ❌ [ảnh](screenshots/BVA-04_ui.png) |
| BVA-05 | V2 LB−1 | BIGBUY, **499.999** | O2 | từ chối ✅ / ✅ | – | ✅ [ảnh](screenshots/BVA-05_ui.png) |
| BVA-06 | V2 **LB** | BIGBUY, **500.000** | O1: −50.000 → 450.000 | **từ chối** ❌ / ❌ "chưa đủ giá trị tối thiểu 500,000 ₫" | – | ❌ [ảnh](screenshots/BVA-06_ui.png) |
| BVA-07 | V2 LB+1 | BIGBUY, **500.001** | O1: −50.000 → 450.001 | chấp nhận ✅ / ✅ | −50.000 → 450.001 ✅ | ✅ [ảnh](screenshots/BVA-07_ui.png) |
| BVA-08 | V3 LB−1 | `EXP0D` (hôm nay) | O2 | từ chối ✅ / ✅ "đã hết hạn" | – | ✅ [ảnh](screenshots/BVA-08_ui.png) |
| BVA-09 | V3 **LB** | `EXP1D` (ngày mai) | O1: −100.000 → 900.000 | chấp nhận ✅ / ✅ | −(−9.000.000) → 10.000.000 ❌ | ❌ [ảnh](screenshots/BVA-09_ui.png) |
| BVA-10 | V3 LB+1 | `EXP2D` (ngày kia) | O1: −100.000 → 900.000 | chấp nhận ✅ / ✅ | −(−9.000.000) → 10.000.000 ❌ | ❌ [ảnh](screenshots/BVA-10_ui.png) |
| BVA-11 | V4 LB | VIP100, `used = 0` | O1: −100.000 → 900.000 | chấp nhận ✅ / ✅ | −100.000 → 900.000 ✅ | ✅ [ảnh](screenshots/BVA-11_ui.png) |
| BVA-12 | V4 **UB** | VIP100, `used = 1` | O1: −100.000 → 900.000 | chấp nhận ✅ / ✅ | −100.000 → 900.000 ✅ | ✅ [ảnh](screenshots/BVA-12_ui.png) |
| BVA-13 | V4 UB+1 | VIP100, `used = 2` | O2 | từ chối ✅ / ✅ "đã sử dụng mã này 2 lần" | – | ✅ [ảnh](screenshots/BVA-13_ui.png) |

**Phân tích theo biến:**
- **V1, V2 (ngưỡng tổng tiền):** cả hai mã đều từ chối **đúng tại LB**, nhưng chấp nhận tại LB+1. Như vậy hệ thống đang dùng phép so sánh `total > min` thay vì `total >= min`. Đây là lỗi off-by-one điển hình mà chỉ BVA phát hiện được. EP-10 (200.000) và EP-01 (1.000.000) đều Pass về quyết định, không lộ lỗi này.
- **V3 (ngày hết hạn):** quyết định đúng tại cả 3 điểm biên. BVA-09 và BVA-10 Fail **chỉ vì công thức percent**, không phải vì biên ngày.
- **V4 (số lần dùng):** đúng tại cả 3 điểm khi client gửi đúng `user_id` (nhưng xem EP-14).
- **Công thức `percent`:** sai ở mọi điểm. Từ các cặp (total, discount) đo được (1.000.000 → −9.000.000; 300.001 → −2.700.009), suy ra hệ thống tính `discount = total × (1 − 10)` thay vì `total × 10 / 100`.

## 5.4b TC bổ sung sau AI gap analysis (chạy 2026-10-13 14:22, script [`scripts/fr09_supplementary.js`](../../scripts/fr09_supplementary.js))

Hai lớp mới được thêm ở [Bước 7](07_ai_gap_analysis.md). Dữ liệu thô: [`results_fr09_supplementary.json`](results_fr09_supplementary.json).

| TC | Lớp mới | Dữ liệu | Mong đợi | Thực tế (API = UI) | KQ |
|---|---|---|---|---|---|
| EP-16 | EC22: `expired_at` là hôm nay **kèm giờ** muộn hơn hiện tại | Coupon `EXPLATE` (như SAVE10), `expired_at = 2026-10-13 23:59:00`, giỏ 1.000.000 | O2: hết hạn (A2: so sánh theo ngày) | HTTP 200, **áp dụng thành công**. Trong khi `EXP0D` (`2026-10-13`, không có giờ) bị từ chối ở EP-09 | ❌ [ảnh](screenshots/EP-16_ui.png) |
| EP-17 | EC23: mức giảm `fixed` **lớn hơn** tổng đơn | Coupon `BIG200K` (fixed 200.000, min 0), giỏ 100.000 | O1 với thành tiền ≥ 0 | Thành tiền **−100.000 ₫**; bấm thanh toán thì tạo **đơn #3 có `total_amount = −100000`** | ❌ [ảnh](screenshots/EP-17_ui.png), [đơn hàng](screenshots/BUG-FR09-08_admin_negative_order.png) |

Ghi chú: EP-17 được chạy lại với user mới (hậu tố `r`). Ở lần chạy đầu, email của TC trùng với lần thử trước. Vì FR-01 cho phép email trùng (BUG-FR01-03), lệnh đăng nhập lấy về tài khoản cũ đã dùng hết lượt mã.

## 5.5 Tổng hợp

| Nhóm | Số TC | Pass | Fail | Không thực thi |
|---|---|---|---|---|
| EP | 15 | 8 (EP-02, 05, 06, 07, 08, 09, 10, 13) | 7 (EP-01, 03, 04, 11, 12, 14, 15) | 0 |
| BVA | 13 | 7 (BVA-02, 05, 07, 08, 11, 12, 13) | 6 (BVA-01, 03, 04, 06, 09, 10) | 0 |
| Bổ sung (gap) | 2 | 0 | 2 (EP-16, EP-17) | 0 |
| **Tổng** | **30** | **15** | **15** | **0** |

Theo kênh: API 27 lượt chạy (15 Pass, 12 Fail), UI 26 lượt chạy (16 Pass, 10 Fail) + 1 ảnh phụ (EP-13 lần 1). Tổng cộng 27 screenshot.

**Các lỗi phát hiện (chi tiết ở [Bước 6](06_bug_report.md)):**
1. Công thức `percent` sai, khách bị tính gấp 10 lần: EP-01, EP-03, BVA-01, BVA-04, BVA-09, BVA-10.
2. Tổng tiền đúng bằng ngưỡng bị từ chối (`>` thay vì `>=`): BVA-03, BVA-06.
3. Không yêu cầu đăng nhập/JWT khi áp mã: EP-11, EP-12.
4. Né giới hạn số lần dùng bằng cách bỏ `user_id`: EP-14.
5. Tổng tiền trên Checkout sửa được, nên né được ngưỡng tối thiểu: EP-15.
6. API phân biệt hoa/thường và không bỏ khoảng trắng, không nhất quán với UI: EP-03, EP-04 (API).
7. Hết hạn được so theo thời điểm, không theo ngày: EP-16 (bổ sung).
8. Thành tiền âm khi mức giảm lớn hơn tổng đơn: EP-17 (bổ sung).
