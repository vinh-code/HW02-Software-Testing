# FR-15 Quản lý sản phẩm (CRUD): Bước 2, Xác định lớp tương đương

> Kỹ thuật: Phân hoạch tương đương, bước 2/3 (slide Bài 4, tr.8–10).
> Đầu vào là 8 điều kiện C1–C8 và các giả định A1–A6 ở [Bước 1](01_input_output.md).

## 2.1 Cách phân hoạch

| Loại điều kiện | Lớp hợp lệ | Lớp không hợp lệ | Áp dụng cho |
|---|---|---|---|
| Boolean | điều kiện đúng | điều kiện sai | C1, C3, C6, C8 |
| Dãy giá trị `[1..255]` | `1 ≤ len ≤ 255` | `len < 1` (tách: rỗng, chỉ khoảng trắng), `len > 255` | C2 |
| Dãy giá trị `(0..∞)` | giá > 0 | giá = 0, giá < 0 | C4 |
| Tập giá trị | thuộc tập | ngoài tập (tách: thiếu, không tồn tại) | C5, C7 |

Một số lớp được **tách nhỏ hơn**:
- **Giá không hợp lệ** tách 4 lớp: *thiếu*, *bằng 0*, *âm*, *không phải số*. Đây là 4 cách vi phạm C3/C4 khác nhau. Ngoài ra, 0 là điểm đặc biệt của "dương".
- **Giá hợp lệ** tách *số nguyên* và *số thập phân* (A3).
- **Tên hợp lệ** có thêm lớp *chứa ký tự tiếng Việt, ký tự đặc biệt và thẻ HTML*. Lớp này áp dụng bài học FR-01 (G1, G2): SUT là ứng dụng tiếng Việt, và R7 (SEC-04) yêu cầu dữ liệu hiển thị phải được escape.
- **Quyền không hợp lệ** tách *không có token* và *token của user thường*, vì SEC-03 yêu cầu kiểm tra **role** chứ không chỉ kiểm tra sự tồn tại của token.

## 2.2 Bảng tổng hợp lớp tương đương

**Bộ giá trị nền:** tên `Tai nghe Sony WH-1000XM5`, giá `1500000`, danh mục `2` (Laptop), quyền admin, mô tả `F15-<TC>-<kênh>`.

| STT | Input / Output | Điều kiện | Lớp tương đương | Loại | Giá trị đại diện |
|---|---|---|---|---|---|
| EC1 | I1 Tên | C1, C2 | Tên thường, `1 ≤ len ≤ 255` | Hợp lệ | `Tai nghe Sony WH-1000XM5` (24 ký tự) |
| EC2 | | C1, C2, R7 | Tên có tiếng Việt, ký tự đặc biệt và HTML | Hợp lệ | `Loa <img src=x onerror="window.__xss15=1"> JBL "Pro" & 'Bass' – Âm trầm` |
| EC3 | | C1 | Tên rỗng | Không hợp lệ | `""` |
| EC4 | | C1 | Tên chỉ có khoảng trắng (A1) | Không hợp lệ | `"   "` |
| EC5 | | C2 | Tên dài hơn 255 ký tự | Không hợp lệ | 300 ký tự |
| EC6 | I2 Giá | C3, C4 | Số nguyên dương | Hợp lệ | `1500000` |
| EC7 | | C3, C4 | Số thập phân dương (A3) | Hợp lệ | `1500.5` |
| EC8 | | C3 | Giá rỗng/thiếu | Không hợp lệ | `""` |
| EC9 | | C4 | Giá bằng 0 | Không hợp lệ | `0` |
| EC10 | | C4 | Giá âm | Không hợp lệ | `-1000` |
| EC11 | | C3 | Giá không phải số | Không hợp lệ | `"abc"` |
| EC12 | I3 Danh mục | C5 | Thuộc danh sách có sẵn | Hợp lệ | `2` (Laptop) |
| EC13 | | C5 | Thiếu danh mục (A5) | Không hợp lệ | `null` |
| EC14 | | C5 | Danh mục không tồn tại (A5) | Không hợp lệ | `999` |
| EC15 | I4 Sản phẩm | C6 | Sản phẩm tồn tại | Hợp lệ | sản phẩm do TC tạo sẵn |
| EC16 | | C6 | Sản phẩm không tồn tại (A6) | Không hợp lệ | id `99999` |
| EC17 | I5 Quyền | C7 | Admin, JWT hợp lệ | Hợp lệ | token `admin@eshop.com` |
| EC18 | | C7 | Không có token | Không hợp lệ | – |
| EC19 | | C7 | Token của user thường | Không hợp lệ | token `test@eshop.com` |
| EC20 | O1b Sửa | C8 | Sửa 1 sản phẩm → chỉ sản phẩm đó đổi | Hợp lệ (output) | so sánh toàn bộ danh sách trước/sau |
| EC21 | O1c Xóa | C8 | Xóa 1 sản phẩm → chỉ sản phẩm đó mất | Hợp lệ (output) | so sánh toàn bộ danh sách trước/sau |

**Thống kê:** 21 lớp, gồm **9 lớp hợp lệ** (EC1, EC2, EC6, EC7, EC12, EC15, EC17, EC20, EC21) và **12 lớp không hợp lệ** (EC3, EC4, EC5, EC8, EC9, EC10, EC11, EC13, EC14, EC16, EC18, EC19).

## 2.3 Biến "thao tác" (I0)

Validation (C1–C5) và phân quyền (C7) được cài đặt riêng cho từng endpoint (POST và PUT là hai đường xử lý khác nhau). Vì thế, một lớp không hợp lệ được kiểm tra trên **Thêm** là chưa đủ. Ở Bước 3, một số lớp đại diện (tên rỗng, giá 0, không có token) được kiểm tra lại trên **Sửa** và **Xóa**.
