# FR-15 Quản lý sản phẩm (CRUD): Bước 4, Phân tích giá trị biên (BVA)

> Kỹ thuật: Boundary Value Analysis (slide Bài 4, phần BVA).
> Đầu vào: điều kiện C2, C4 ở [Bước 1](01_input_output.md), các lớp EC1, EC3, EC5, EC6, EC9 ở [Bước 2](02_equivalence_classes.md).

## 4.1 Xác định các miền có thứ tự

| Điều kiện | Có thứ tự? | Dùng BVA? |
|---|---|---|
| C1 tên khác rỗng | gộp vào độ dài (len = 0) | Có, qua V1 |
| C2 `1 ≤ len(tên) ≤ 255` | **Có** | **Có, hai biên** |
| C3 giá là số | Không (boolean) | Không |
| C4 giá > 0 | **Có** | **Có** |
| C5 danh mục thuộc danh sách | **Không**. `category_id` là định danh, thứ tự 1 < 2 < 3 không mang nghĩa nghiệp vụ, và danh sách có thể thưa (khi xóa danh mục) | Không. Đã phủ bằng EP (EC12–EC14) |
| C6, C7, C8 | Không (boolean / tập) | Không |

## 4.2 Biên của từng biến

| Biến | Mô tả | Miền hợp lệ | LB | UB | Bước nhảy |
|---|---|---|---|---|---|
| V1 | Độ dài tên (ký tự, A2) | `[1..255]` | 1 | 255 | 1 ký tự |
| V2 | Giá | `(0..∞)`, theo đơn vị 1 ₫ (A3) là `[1..∞)` | 1 | – (A4) | 1 ₫ |

**Giá trị danh nghĩa:** tên 24 ký tự (`Tai nghe Sony WH-1000XM5`), giá 1.500.000, danh mục 2.

## 4.3 Chọn biến thể BVA và tính số TC

- **V1 có hai biên.** Robustness cho đủ 6 điểm: LB−1 = 0, LB = 1, LB+1 = 2, UB−1 = 254, UB = 255, UB+1 = 256.
- **V2 chỉ có biên dưới.** Dùng LB−1 = 0, LB = 1, LB+1 = 2, cộng 1 điểm độ bền phía "∞" (A4): **2.147.483.648** = 2³¹. Giá trị này vượt kiểu số nguyên 32-bit, nên phát hiện được tràn số nếu hệ thống lưu giá bằng int32.
- Standard BVA (4n+1 = 9) không kiểm tra LB−1/UB+1, mà đây lại là nơi validation hay sai, nên **chọn Robustness**. Worst-case bị loại vì tên và giá độc lập nhau.
- **Lặp lại biên trên của V1 cho thao tác Sửa** (255 và 256 ký tự), lý do giống EP §2.3: POST và PUT là hai đường xử lý riêng.

**Tổng: 1 (nominal) + 6 (V1, Thêm) + 4 (V2, Thêm) + 2 (V1, Sửa) = 13 TC.**

## 4.4 Bảng ca kiểm thử giá trị biên

Tên test có dạng `"BVA15-xxxx…"`, cắt đúng độ dài cần thiết (chỉ ký tự ASCII). Độ dài được script kiểm tra lại trước khi gửi.

| TC | Thao tác | Biến | Điểm | Tên (len) | Giá | Output mong đợi |
|---|---|---|---|---|---|---|
| BVA-01 | Thêm | – | nominal | 24 | 1500000 | O1a |
| BVA-02 | Thêm | V1 | LB−1 | **0** | 1500000 | **O2** |
| BVA-03 | Thêm | V1 | **LB** | **1** | 1500000 | **O1a** |
| BVA-04 | Thêm | V1 | LB+1 | 2 | 1500000 | O1a |
| BVA-05 | Thêm | V1 | UB−1 | 254 | 1500000 | O1a |
| BVA-06 | Thêm | V1 | **UB** | **255** | 1500000 | **O1a**, lưu đủ 255 ký tự (không bị cắt) |
| BVA-07 | Thêm | V1 | UB+1 | **256** | 1500000 | **O2** |
| BVA-08 | Thêm | V2 | LB−1 | 24 | **0** | **O2** |
| BVA-09 | Thêm | V2 | **LB** | 24 | **1** | **O1a** |
| BVA-10 | Thêm | V2 | LB+1 | 24 | 2 | O1a |
| BVA-11 | Thêm | V2 | độ bền "∞" | 24 | **2147483648** | O1a, giá lưu và hiển thị đúng, không tràn số |
| BVA-12 | Sửa | V1 | **UB** | **255** | 1500000 | **O1b**, chỉ SP đó đổi |
| BVA-13 | Sửa | V1 | UB+1 | **256** | 1500000 | **O2**, SP không đổi |

## 4.5 Ghi chú

- BVA-02 (len 0) trùng giá trị với EP-06, BVA-08 (giá 0) trùng với EP-10. Theo slide, điểm biên vừa là đại diện lớp vừa là biên. Vẫn giữ trong bảng BVA để đủ bộ điểm.
- Trên UI, ô Tên có thuộc tính `required`. BVA-02 trên UI dự kiến bị chặn bởi validation HTML5. Kết quả này vẫn được tính là Pass, vì đó là đúng hành vi từ chối.
