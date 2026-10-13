# FR-09 Mã giảm giá (Coupon): Bước 1, Xác định Input & Output

> Kỹ thuật: Phân hoạch tương đương, bước 1/3 (slide Bài 4, tr.6–7).
> Cơ sở kiểm thử: SRS EShop mục FR-09. Theo bài học của FR-01 (xem [FR-01 §7.3](../FR-01_Register/07_ai_gap_analysis.md)), lần này AI được yêu cầu **liệt kê mọi yêu cầu liên quan trong toàn bộ SRS** trước khi phân hoạch.

## 1.1 Trích yêu cầu từ SRS

| Mã | Nguồn | Nội dung đặc tả |
|---|---|---|
| R1 | FR-09 C1 | Mã phải **tồn tại** trong CSDL và đang hoạt động (`is_active = 1`) |
| R2 | FR-09 C2 | **Còn hạn:** ngày hiện tại phải **trước** `expired_at` |
| R3 | FR-09 C3 | **Đủ ngưỡng:** tổng đơn hàng **>=** `min_order_amount` |
| R4 | FR-09 C4 | **Đã đăng nhập:** người dùng phải có JWT Token hợp lệ |
| R5 | FR-09 C5 | **Chưa dùng hết lượt:** số lần user đã dùng mã < `max_uses_per_user` |
| R6 | FR-09 | Mã chỉ được áp dụng khi **tất cả** 5 điều kiện thỏa |
| R7 | FR-09 | `percent`: `discount_amount = total × discount_value / 100` |
| R8 | FR-09 | `fixed`: `discount_amount = discount_value`; `final_amount = total − discount_amount` |
| R9 | FR-08 | Tổng tiền **tính tự động từ giỏ hàng**, người dùng **không được sửa trực tiếp**; backend tự tính lại, không tin `total_amount` từ client |
| R10 | SEC-02 | API có tính bảo mật phải yêu cầu JWT hợp lệ |
| R11 | FR-21 | Tiền tệ dùng ký hiệu `₫`, có phân cách hàng nghìn |

**Yêu cầu đã xem nhưng không đưa vào phạm vi:** FR-17 (Admin CRUD coupon) chỉ dùng để **chuẩn bị dữ liệu** (tạo mã biên). SEC-04 (escape dữ liệu) không áp dụng vì người dùng không nhập dữ liệu nào được hiển thị lại, ngoài mã giảm giá. Mã được tra trong CSDL và không được render nếu không tồn tại.

**Mã giảm giá mẫu (dữ liệu seed):**

| Mã | Loại | Giá trị | Ngưỡng tối thiểu | Hạn dùng | Số lần/người |
|---|---|---|---|---|---|
| `SAVE10` | percent | 10% | 300.000 ₫ | 2099-12-31 | 1 |
| `BIGBUY` | fixed | 50.000 ₫ | 500.000 ₫ | 2099-12-31 | 1 |
| `VIP100` | fixed | 100.000 ₫ | 300.000 ₫ | 2099-12-31 | 2 |
| `EXPIRED` | percent | 20% | 100.000 ₫ | 2020-01-01 | 1 |

## 1.2 Biến đầu vào (Input)

| Mã | Input | Kiểu | Ai kiểm soát | Ràng buộc |
|---|---|---|---|---|
| I1 | Mã giảm giá (`code`) | chuỗi | Người dùng nhập ở ô "Mã Giảm Giá" | R1, R2, R6 (chọn mã nào thì chọn luôn bộ thuộc tính của coupon) |
| I2 | Tổng đơn hàng (`total`) | số nguyên ≥ 0 (₫) | **Gián tiếp:** người dùng chọn sản phẩm và số lượng trong giỏ | R3, R7, R8, R9 |
| I3 | Trạng thái đăng nhập (JWT) | token | Người dùng (đăng nhập hay không) | R4, R10 |
| I4 | Số lần user đã dùng mã (`used`) | số nguyên ≥ 0 | Trạng thái hệ thống, tăng sau mỗi lần thanh toán có mã | R5 |

**Thuộc tính của coupon ảnh hưởng tới kết quả** (trạng thái hệ thống, được cố định khi chọn I1): `is_active`, `expired_at`, `min_order_amount`, `max_uses_per_user`, `type`, `discount_value`.

## 1.3 Biến đầu ra (Output)

| Mã | Output | Mô tả |
|---|---|---|
| O1 | Áp dụng thành công | Hiện thông báo thành công, số tiền giảm `discount_amount` và thành tiền `final_amount` đúng công thức R7/R8 |
| O2 | Từ chối | Hiện thông báo lỗi phù hợp với điều kiện bị vi phạm, **không** giảm giá, tổng thanh toán giữ nguyên |

O1 có hai lớp đầu ra cần kiểm tra riêng theo slide tr.8 ("phân hoạch cả miền output"): **O1a** coupon loại `percent` và **O1b** coupon loại `fixed`.

## 1.4 Các điều kiện cần phân hoạch (đầu vào cho Bước 2)

| Điều kiện | Biến | Loại điều kiện (slide tr.10) |
|---|---|---|
| C1. Mã tồn tại và đang hoạt động | I1 | Tập giá trị: {mã đang hoạt động} |
| C2. `hôm nay < expired_at` | I1 (`expired_at`) | Dãy giá trị ngày `[ngày mai..∞)`, **có thứ tự nên áp dụng được BVA** |
| C3. `total >= min_order_amount` | I2 | Dãy giá trị `[min..∞)`, **có thứ tự nên áp dụng được BVA** |
| C4. Có JWT hợp lệ | I3 | Boolean |
| C5. `used < max_uses_per_user` | I4 | Dãy giá trị `[0..max−1]`, **có thứ tự nên áp dụng được BVA** |
| C6. Loại coupon | I1 (`type`) | Tập giá trị {`percent`, `fixed`}, quyết định công thức đầu ra |
| C7. Tổng tiền do hệ thống tính, không do client gửi | I2 | Boolean (R9) |

## 1.5 Điểm mơ hồ trong đặc tả và giả định áp dụng

| # | Điểm mơ hồ | Giả định áp dụng |
|---|---|---|
| A1 | Spec không nói mã có phân biệt chữ hoa/thường hay có bỏ khoảng trắng 2 đầu | Người dùng nhập tay nên **không phân biệt hoa/thường** và **bỏ khoảng trắng 2 đầu**: `save10`, `" SAVE10 "` tương đương `SAVE10`. *(Diễn giải của AI, sinh viên chấp nhận)* |
| A2 | "Ngày hiện tại phải trước `expired_at`" so sánh theo ngày hay theo thời điểm? | So sánh theo **ngày, giờ Việt Nam**. Mã hợp lệ khi `expired_at` ≥ ngày mai. `expired_at` = **hôm nay** thì đã hết hạn, vì hôm nay không "trước" hôm nay |
| A3 | Kết quả `percent` có phần lẻ | Làm tròn xuống đồng (₫). Các giá trị test được chọn để chia hết, tránh phụ thuộc giả định này |
| A4 | "Số lần đã dùng" tính khi nào | Tăng 1 sau mỗi lần **thanh toán thành công** có áp mã. Chỉ bấm "Áp dụng" thì không tính |
| A5 | C4 không nói user được xác định bằng gì | Theo SEC-02, user phải lấy từ **JWT**. Không có token thì phải từ chối, kể cả khi client gửi `user_id` |
| A6 | Không có cách nào trên UI để vô hiệu hóa coupon (FR-17 chỉ có Thêm/Xem/Xóa) | Lớp `is_active = 0` được chuẩn bị bằng cách cập nhật trực tiếp CSDL (bước chuẩn bị dữ liệu, ghi rõ ở Bước 5) |

## 1.6 Kênh thực thi & quan sát ban đầu (hộp đen)

- **UI:** `http://localhost:5173`. Đăng nhập → thêm sản phẩm vào giỏ → **Tiến hành thanh toán** → trang `/checkout` → nhập mã ở ô "Mã Giảm Giá" → **Áp dụng**. Kết quả hiện ngay dưới ô nhập.
- **API:** `POST /api/apply-coupon` với body `{code, total_amount, user_id}` theo API spec §5.1.
- **Quan sát ban đầu:**
  - Trang `/checkout` có ô **"Tổng tiền thanh toán (VND)" cho phép sửa trực tiếp** (`input type="number"`). Điều này mâu thuẫn với R9 và cho phép người dùng tự đặt tổng tiền để vượt ngưỡng C3. Được đưa vào phân hoạch dưới dạng điều kiện C7.
  - API spec yêu cầu client gửi `total_amount` và `user_id` trong body. Thiết kế này đã trái với R9 và A5 ngay từ API spec.
- **Chuẩn bị dữ liệu để chạm đúng biên tổng tiền:** sản phẩm seed có giá ≥ 4.000.000 ₫, không thể tạo giỏ hàng có tổng đúng bằng 299.999 / 300.000 / 300.001 ₫. Vì vậy sẽ tạo thêm **sản phẩm test có giá chính xác** qua API Admin. Đây chỉ là dữ liệu, không phải đối tượng kiểm thử.
