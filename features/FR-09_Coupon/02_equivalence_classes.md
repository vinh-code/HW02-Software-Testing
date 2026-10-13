# FR-09 Mã giảm giá (Coupon): Bước 2, Xác định lớp tương đương

> Kỹ thuật: Phân hoạch tương đương, bước 2/3 (slide Bài 4, tr.8–10).
> Đầu vào là 7 điều kiện C1–C7 và các giả định A1–A6 ở [Bước 1](01_input_output.md).

## 2.1 Cách phân hoạch

| Loại điều kiện | Lớp hợp lệ | Lớp không hợp lệ | Áp dụng cho |
|---|---|---|---|
| Tập giá trị | mã thuộc tập "đang hoạt động" | mã ngoài tập (không tồn tại / rỗng / bị vô hiệu hóa) | C1 |
| Dãy giá trị ngày `[ngày mai..∞)` | `expired_at` ≥ ngày mai | `expired_at` < ngày mai | C2 |
| Dãy giá trị `[min..∞)` | `total` ≥ `min_order_amount` | `total` < `min_order_amount` | C3 |
| Boolean | có JWT hợp lệ | không có / sai token | C4 |
| Dãy giá trị `[0..max−1]` | `used` < `max_uses_per_user` | `used` ≥ `max_uses_per_user` | C5 |
| Tập giá trị (output) | `percent`, `fixed` | – | C6 |
| Boolean | `total` khớp giỏ hàng | `total` bị client sửa | C7 |

Một số lớp được **tách nhỏ hơn** vì hệ thống có thể xử lý mỗi cách khác nhau:
- **C1 không hợp lệ** tách thành 3 lớp: *không tồn tại*, *rỗng*, *tồn tại nhưng `is_active = 0`*. Lớp cuối khác lớp đầu vì mã vẫn có trong CSDL.
- **C1 hợp lệ** tách thêm 2 lớp *chữ thường* và *có khoảng trắng 2 đầu* theo giả định A1.
- **C2 không hợp lệ** tách *đã qua hạn* và *hết hạn đúng hôm nay*. Lớp sau là điểm mơ hồ A2 nên cần TC riêng.
- **C4 không hợp lệ** tách *không có token* và *token giả*.
- **C5 không hợp lệ** có thêm lớp *dùng hết lượt nhưng client không gửi `user_id`* (giả định A5). Nếu hệ thống đếm lượt theo `user_id` trong body thay vì theo token, người dùng có thể né C5.

## 2.2 Bảng tổng hợp lớp tương đương

**Bộ giá trị nền** dùng cho mọi lớp, trừ biến đang xét: user mới đăng ký và đã đăng nhập, chưa dùng mã nào (`used = 0`). Giỏ có 1 sản phẩm test giá **1.000.000 ₫**, nên `total = 1.000.000`. Mã là `SAVE10`.

| STT | Input / Output | Điều kiện | Lớp tương đương | Loại | Giá trị đại diện |
|---|---|---|---|---|---|
| EC1 | I1 Mã | C1 | Mã tồn tại, đang hoạt động, nhập đúng chữ hoa | Hợp lệ | `SAVE10` |
| EC2 | | C1 | Mã hợp lệ nhập chữ thường (A1) | Hợp lệ | `save10` |
| EC3 | | C1 | Mã hợp lệ có khoảng trắng 2 đầu (A1) | Hợp lệ | `" VIP100 "` |
| EC4 | | C1 | Mã không tồn tại | Không hợp lệ | `ABC123` |
| EC5 | | C1 | Mã rỗng | Không hợp lệ | `""` |
| EC6 | | C1 | Mã tồn tại nhưng `is_active = 0` (A6) | Không hợp lệ | `OFF10` *(chuẩn bị)* |
| EC7 | I1 `expired_at` | C2 | Còn hạn: `expired_at` ≥ ngày mai | Hợp lệ | `SAVE10` (2099-12-31) |
| EC8 | | C2 | Đã qua hạn: `expired_at` < hôm nay | Không hợp lệ | `EXPIRED` (2020-01-01) |
| EC9 | | C2 | Hết hạn đúng hôm nay (A2) | Không hợp lệ | `EXP0D` *(chuẩn bị, `expired_at` = hôm nay)* |
| EC10 | I2 Tổng tiền | C3 | `total` ≥ `min_order_amount` | Hợp lệ | 1.000.000 (SAVE10, min 300.000) |
| EC11 | | C3 | `total` < `min_order_amount` | Không hợp lệ | 200.000 (SAVE10) |
| EC12 | I3 Đăng nhập | C4 | Đã đăng nhập, JWT hợp lệ | Hợp lệ | token của user test |
| EC13 | | C4 | Chưa đăng nhập (không có token) | Không hợp lệ | – |
| EC14 | | C4 | Token không hợp lệ | Không hợp lệ | `Bearer abc.def.ghi` |
| EC15 | I4 Số lần đã dùng | C5 | `used` < `max` | Hợp lệ | `used = 0` (SAVE10, max 1) |
| EC16 | | C5 | `used` = `max` | Không hợp lệ | `used = 1` (SAVE10) |
| EC17 | | C5 | `used` = `max`, client không gửi `user_id` (A5) | Không hợp lệ | `used = 1`, body không có `user_id` |
| EC18 | O1 Kết quả | C6 | Coupon `percent`: giảm `total × v / 100` | Hợp lệ (output) | SAVE10, 1.000.000 → giảm 100.000, còn 900.000 |
| EC19 | | C6 | Coupon `fixed`: giảm `v` | Hợp lệ (output) | BIGBUY, 1.000.000 → giảm 50.000, còn 950.000 |
| EC20 | I2 Tổng tiền | C7 | `total` do hệ thống tính từ giỏ | Hợp lệ | giữ nguyên tổng của giỏ |
| EC21 | | C7 | `total` bị người dùng sửa tay (FR-08) | Không hợp lệ | giỏ 200.000, sửa thành 1.000.000 |

**Thống kê:** 21 lớp, gồm **10 lớp hợp lệ** (EC1, EC2, EC3, EC7, EC10, EC12, EC15, EC18, EC19, EC20) và **11 lớp không hợp lệ** (EC4, EC5, EC6, EC8, EC9, EC11, EC13, EC14, EC16, EC17, EC21).

## 2.3 Dữ liệu cần chuẩn bị

Dữ liệu seed không đủ để đại diện cho mọi lớp. Phần chuẩn bị sau thuộc **tiền điều kiện của TC**, không phải đối tượng kiểm thử:

| Dữ liệu | Cách tạo | Dùng cho |
|---|---|---|
| Sản phẩm test giá 200.000 / 1.000.000 ₫ | `POST /api/products` (quyền admin) | EC10, EC11, EC21 và bộ giá trị nền |
| Coupon `OFF10` (giống SAVE10) rồi đặt `is_active = 0` | `POST /api/admin/coupons`, sau đó `UPDATE` trực tiếp CSDL (A6) | EC6 |
| Coupon `EXP0D` (giống SAVE10, `expired_at` = hôm nay) | `POST /api/admin/coupons` | EC9 |
| User có `used = 1` với SAVE10 | Thanh toán thật có áp SAVE10 trên UI, hoặc `POST /api/coupon-usage` (đúng lời gọi mà UI thực hiện sau khi thanh toán) | EC16, EC17 |
