# FR-09 Mã giảm giá (Coupon): Bước 4, Phân tích giá trị biên (BVA)

> Kỹ thuật: Boundary Value Analysis (slide Bài 4, phần BVA).
> Đầu vào: các điều kiện có thứ tự C2, C3, C5 ở [Bước 1](01_input_output.md) và các lớp EC7–EC11, EC15–EC16 ở [Bước 2](02_equivalence_classes.md).

## 4.1 Xác định các miền có thứ tự

BVA chỉ áp dụng được cho biến có **miền giá trị có thứ tự**. Xét 7 điều kiện của FR-09:

| Điều kiện | Có thứ tự? | Dùng BVA? |
|---|---|---|
| C1 mã tồn tại | Không (tập chuỗi) | Không, đã phủ bằng EP |
| C2 `hôm nay < expired_at` | **Có** (ngày) | **Có** |
| C3 `total >= min_order_amount` | **Có** (số tiền) | **Có**. Đây là nơi spec nhấn mạnh **">= (lớn hơn hoặc bằng)"** |
| C4 đăng nhập | Không (boolean) | Không |
| C5 `used < max_uses_per_user` | **Có** (số nguyên) | **Có** |
| C6 loại coupon | Không (tập) | Không. Nhưng công thức đầu ra được kiểm tra lại tại mọi điểm biên hợp lệ |
| C7 tổng do hệ thống tính | Không (boolean) | Không |

## 4.2 Biên của từng biến

| Biến | Mô tả | Miền hợp lệ | LB | UB | Ghi chú |
|---|---|---|---|---|---|
| V1 | `total` với `SAVE10` (percent 10%, min 300.000) | `[300.000..∞)` | 300.000 | – | Đơn vị nhỏ nhất là 1 ₫, nên LB±1 = ±1 ₫ |
| V2 | `total` với `BIGBUY` (fixed 50.000, min 500.000) | `[500.000..∞)` | 500.000 | – | Cùng điều kiện C3 nhưng khác ngưỡng và khác công thức |
| V3 | `d = expired_at − hôm nay` (ngày) | `[1..∞)` theo A2 | 1 (ngày mai) | – | Coupon biên được tạo qua API Admin |
| V4 | `used` của `VIP100` (max 2) | `[0..1]` | 0 | 1 | Biên hai phía, nhưng LB−1 = −1 không thể xảy ra |

**Tại sao test C3 với cả hai mã V1, V2?** Nếu hệ thống so sánh sai (`>` thay vì `>=`) hoặc gắn cứng ngưỡng của một mã, chỉ test một mã có thể không phát hiện. Ngoài ra, mỗi mã cho phép kiểm tra công thức đầu ra (percent/fixed) **ngay tại biên**.

**Giá trị danh nghĩa (nominal):** `total = 1.000.000`, mã `SAVE10` (hết hạn 2099-12-31), `used = 0`, đã đăng nhập.

## 4.3 Chọn biến thể BVA và tính số TC

- Slide nêu 4 biến thể: **Standard** (4n+1), **Robustness** (6n+1), **Worst-case** (5ⁿ), **Robust worst-case** (7ⁿ).
- V1, V2, V3 **chỉ có biên dưới** (giống FR-01), nên Robustness được điều chỉnh thành **(LB−1, LB, LB+1) cho mỗi biến**.
- V4 có hai biên nhưng miền chỉ có 2 phần tử `{0, 1}`. Các điểm của Robustness trùng nhau: LB = UB−1 = 0, LB+1 = UB = 1, UB+1 = 2. LB−1 = −1 không tạo được. Còn **3 điểm phân biệt**.
- **Chọn Robustness**, vì lỗi cần tìm nằm đúng ở phía không hợp lệ ngay sát biên. Ví dụ spec nhấn mạnh `>=` cho C3.
- **Loại Worst-case**, vì các điều kiện độc lập (giả định lỗi đơn). Hơn nữa, tổ hợp ngày hết hạn × số lần dùng × tổng tiền đòi hỏi tạo rất nhiều coupon và user.

**Tổng: 1 (nominal) + 3 (V1) + 3 (V2) + 3 (V3) + 3 (V4) = 13 TC.**

## 4.4 Bảng ca kiểm thử giá trị biên

Mỗi TC dùng **một user mới**. Giỏ hàng chứa đúng 1 sản phẩm test có giá bằng `total` cần kiểm tra.

| TC | Biến | Điểm | Mã | `total` | `expired_at` | `used` | Output mong đợi |
|---|---|---|---|---|---|---|---|
| BVA-01 | – | nominal | `SAVE10` | 1.000.000 | 2099-12-31 | 0 | O1: giảm 100.000, còn 900.000 |
| BVA-02 | V1 | LB−1 | `SAVE10` | **299.999** | 2099-12-31 | 0 | **O2**: chưa đủ ngưỡng |
| BVA-03 | V1 | **LB** | `SAVE10` | **300.000** | 2099-12-31 | 0 | **O1**: giảm 30.000, còn 270.000 |
| BVA-04 | V1 | LB+1 | `SAVE10` | **300.001** | 2099-12-31 | 0 | O1: giảm 30.000 (làm tròn xuống, A3), còn 270.001 |
| BVA-05 | V2 | LB−1 | `BIGBUY` | **499.999** | 2099-12-31 | 0 | **O2**: chưa đủ ngưỡng |
| BVA-06 | V2 | **LB** | `BIGBUY` | **500.000** | 2099-12-31 | 0 | **O1**: giảm 50.000, còn 450.000 |
| BVA-07 | V2 | LB+1 | `BIGBUY` | **500.001** | 2099-12-31 | 0 | O1: giảm 50.000, còn 450.001 |
| BVA-08 | V3 | LB−1 (d = 0) | `EXP0D` | 1.000.000 | **hôm nay** | 0 | **O2**: hết hạn |
| BVA-09 | V3 | **LB** (d = 1) | `EXP1D` | 1.000.000 | **ngày mai** | 0 | **O1**: giảm 100.000, còn 900.000 |
| BVA-10 | V3 | LB+1 (d = 2) | `EXP2D` | 1.000.000 | **ngày kia** | 0 | O1: giảm 100.000, còn 900.000 |
| BVA-11 | V4 | LB (= UB−1) | `VIP100` | 1.000.000 | 2099-12-31 | **0** | O1: giảm 100.000, còn 900.000 |
| BVA-12 | V4 | **UB** (= LB+1) | `VIP100` | 1.000.000 | 2099-12-31 | **1** | **O1**: giảm 100.000, còn 900.000 |
| BVA-13 | V4 | UB+1 | `VIP100` | 1.000.000 | 2099-12-31 | **2** | **O2**: đã dùng hết lượt |

`EXP0D`, `EXP1D`, `EXP2D` có cùng thuộc tính với `SAVE10` (percent 10%, min 300.000, 1 lần/người), chỉ khác `expired_at`. Nhờ vậy, khác biệt về kết quả chỉ có thể đến từ ngày hết hạn.

## 4.5 Ghi chú

- BVA-01 trùng giá trị với EP-01 nhưng vẫn chạy lại với user mới để làm điểm đối chứng cho bảng BVA.
- BVA-08 trùng lớp với EP-09 (EC9). Đây là điểm vừa là đại diện lớp, vừa là biên LB−1.
- Ngoài phạm vi BVA nhưng ghi nhận rủi ro: spec không nói gì về trường hợp `discount_amount > total` (coupon `fixed` lớn hơn tổng đơn). Với dữ liệu seed, ngưỡng tối thiểu luôn lớn hơn mức giảm, nên trường hợp này không xảy ra.
