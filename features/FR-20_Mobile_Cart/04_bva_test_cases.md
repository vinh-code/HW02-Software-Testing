# FR-20 Mobile: Giỏ hàng & Số lượng, Bước 4: Phân tích giá trị biên (BVA)

> Kỹ thuật: Boundary Value Analysis (slide Bài 4, phần BVA).
> Đầu vào: điều kiện C1, C2 ở [Bước 1](01_input_output.md).

## 4.1 Xác định các miền có thứ tự

| Điều kiện | Có thứ tự? | Dùng BVA? |
|---|---|---|
| C1 SL nguyên ≥ 1 (I1 ở trang chi tiết, I2 trong giỏ) | **Có** | **Có**, cho cả 2 ô nhập |
| C2 SL sau khi bấm +/− | **Có** | **Có**, biên tại 1 (nút − không được đưa SL xuống 0) |
| C3 gộp dòng, C4 xóa, C5 giỏ trống | Không (boolean / tập) | Không |

## 4.2 Biên của từng biến

| Biến | Mô tả | Miền hợp lệ | LB | UB |
|---|---|---|---|---|
| V1 | SL nhập ở trang chi tiết | `[1..∞)` | 1 | – (A2) |
| V2 | SL sửa trong giỏ | `[1..∞)` | 1 | – (A2) |
| V3 | SL **sau khi** bấm − / + | `[1..∞)` | 1 | – |

**Nominal:** SL 3 (giống EP-01).

## 4.3 Chọn biến thể BVA và tính số TC

- V1, V2, V3 chỉ có biên dưới, nên dùng Robustness thu gọn **(LB−1, LB, LB+1)** cho mỗi biến, giống FR-01/09/15.
- Thêm **1 điểm độ bền** phía "∞" cho V1 và V2: SL = **999**, để kiểm tra phép nhân và định dạng tiền với số lớn (999 × 4.000.000 = 3.996.000.000 ₫).
- **V3:** tạo SL kết quả bằng LB−1/LB/LB+1 như sau:
  - Bấm **−** khi SL = 1: kết quả mong muốn là 0, nên phải bị chặn (LB−1).
  - Bấm **−** khi SL = 2: kết quả 1 (LB).
  - Bấm **+** khi SL = 1: kết quả 2 (LB+1).

**Tổng: 1 (nominal) + 4 (V1) + 4 (V2) + 3 (V3) = 12 TC.**

## 4.4 Bảng ca kiểm thử giá trị biên

| TC | Biến | Điểm | Tiền điều kiện | Thao tác | Output mong đợi |
|---|---|---|---|---|---|
| BVA-01 | – | nominal | giỏ trống | Chi tiết A, SL `3` → Thêm | A×3, Thành tiền 12.000.000 ₫ |
| BVA-02 | V1 | LB−1 | giỏ trống | Chi tiết A, SL `0` → Thêm | **O2**: không thêm |
| BVA-03 | V1 | **LB** | giỏ trống | Chi tiết A, SL `1` → Thêm | A×**1**, 4.000.000 ₫ |
| BVA-04 | V1 | LB+1 | giỏ trống | Chi tiết A, SL `2` → Thêm | A×**2**, 8.000.000 ₫ |
| BVA-05 | V1 | độ bền | giỏ trống | Chi tiết A, SL `999` → Thêm | A×999, **3.996.000.000 ₫** |
| BVA-06 | V2 | LB−1 | giỏ A×2 | Sửa SL thành `0` | **O2**: SL giữ 2 |
| BVA-07 | V2 | **LB** | giỏ A×2 | Sửa SL thành `1` | SL **1**, 4.000.000 ₫ |
| BVA-08 | V2 | LB+1 | giỏ A×1 | Sửa SL thành `2` | SL **2**, 8.000.000 ₫ |
| BVA-09 | V2 | độ bền | giỏ A×1 | Sửa SL thành `999` | SL 999, 3.996.000.000 ₫ |
| BVA-10 | V3 | LB−1 | giỏ A×1 | Bấm **−** | SL **giữ 1** (nút − bị vô hiệu hoặc không giảm) |
| BVA-11 | V3 | **LB** | giỏ A×2 | Bấm **−** | SL **1** |
| BVA-12 | V3 | LB+1 | giỏ A×1 | Bấm **+** | SL **2** |

**Ghi chú:**
- BVA-02 trùng giá trị với EP-09, và BVA-06 trùng với EP-14. Vẫn giữ để đủ bộ điểm biên.
- Ở BVA-07, giỏ được chuẩn bị là A×2 (không phải A×1). Lý do: nếu giỏ đã là 1 thì khi sửa thành 1, kết quả "đúng" có thể chỉ là ngẫu nhiên.
