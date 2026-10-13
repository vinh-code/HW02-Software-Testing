# FR-20 Mobile: Giỏ hàng & Số lượng, Bước 3: Xác định ca kiểm thử (EP)

> Kỹ thuật: Phân hoạch tương đương, bước 3/3 (slide Bài 4, tr.15–18).
> Đầu vào: 19 lớp tương đương ở [Bước 2](02_equivalence_classes.md).

## 3.1 Nguyên tắc áp dụng

- Mỗi TC bắt đầu từ **một phiên app mới**, nên giỏ luôn trống lúc đầu (giỏ chỉ nằm trong bộ nhớ của app).
- Mỗi TC chỉ chứa **đúng 1 lớp không hợp lệ**.
- Với các TC sửa số lượng trong giỏ (EP-14 → EP-18), giỏ được chuẩn bị với **SL = 2** chứ không phải 1. Nhờ vậy phân biệt được 3 khả năng: "giữ nguyên" (2), "âm thầm đổi về 1" (1), và "nhận giá trị sai".

## 3.2 Bảng rút gọn các ca kiểm thử (18 TC)

A = Keychron Q1 (4.000.000 ₫), B = AirPods Pro 2 (6.000.000 ₫).

| TC | Lớp phủ | Tiền điều kiện | Bước thực hiện | Output mong đợi |
|---|---|---|---|---|
| EP-01 | EC1, EC19 | giỏ trống | Chi tiết A → SL `3` → **Thêm vào giỏ hàng** → mở Giỏ | 1 dòng A, SL 3, Thành tiền **12.000.000 ₫**, nhãn **"Tổng cộng"** 12.000.000 ₫; có phản hồi sau khi thêm (R2) |
| EP-02 | **EC14**, EC19 | giỏ trống | Danh sách: **Thêm vào giỏ** A → Chi tiết A, SL `2` → Thêm → Giỏ | **1 dòng** A, SL **3** |
| EP-03 | **EC15**, EC19 | giỏ trống | Danh sách: thêm A, thêm B → Giỏ | **2 dòng**, Tổng cộng **10.000.000 ₫** |
| EP-04 | **EC7**, EC19 | giỏ: A×1 | Sửa SL trong giỏ thành `5` | SL **5**, Thành tiền **20.000.000 ₫** |
| EP-05 | **EC13** | giỏ: A×1 | Bấm **+** | SL **2** (có nút +/− ở mỗi dòng, R3) |
| EP-06 | **EC16** | giỏ: A×1 | Bấm **Xóa** → chọn **Đồng ý** | Có dialog xác nhận; sau Đồng ý thì giỏ trống |
| EP-07 | **EC17** | giỏ: A×1 | Bấm **Xóa** → chọn **Hủy** | Có dialog; sau Hủy thì A **vẫn còn** |
| EP-08 | **EC18** | giỏ trống | Mở Giỏ | Hình minh họa, thông báo giỏ trống, nút **Tiếp tục mua sắm** |
| EP-09 | **EC2** | giỏ trống | Chi tiết A → SL `0` → Thêm | O2: không thêm, có thông báo; giỏ trống |
| EP-10 | **EC3** | giỏ trống | Chi tiết A → SL `-2` → Thêm | O2 |
| EP-11 | **EC4** | giỏ trống | Chi tiết A → SL `1.5` → Thêm | O2 |
| EP-12 | **EC5** | giỏ trống | Chi tiết A → SL `abc` → Thêm | O2 (hoặc ô không nhận chữ) |
| EP-13 | **EC6** | giỏ trống | Chi tiết A → SL rỗng → Thêm | O2 |
| EP-14 | **EC8** | giỏ: A×2 | Sửa SL trong giỏ thành `0` | O2: SL giữ **2** (hoặc có thông báo), Thành tiền 8.000.000 |
| EP-15 | **EC9** | giỏ: A×2 | Sửa SL thành `-2` | O2 |
| EP-16 | **EC10** | giỏ: A×2 | Sửa SL thành `1.5` | O2 |
| EP-17 | **EC11** | giỏ: A×2 | Sửa SL thành `abc` | O2 |
| EP-18 | **EC12** | giỏ: A×2 | Xóa trắng ô SL | O2 (cho phép ô tạm rỗng khi đang gõ, nhưng SL trong giỏ không được thành giá trị khác 2 nếu người dùng không nhập số hợp lệ) |

## 3.3 Kiểm tra độ phủ

| Lớp | TC | Lớp | TC | Lớp | TC | Lớp | TC |
|---|---|---|---|---|---|---|---|
| EC1 | EP-01 | EC6 | EP-13 | EC11 | EP-17 | EC16 | EP-06 |
| EC2 | EP-09 | EC7 | EP-04 | EC12 | EP-18 | EC17 | EP-07 |
| EC3 | EP-10 | EC8 | EP-14 | EC13 | EP-05 | EC18 | EP-08 |
| EC4 | EP-11 | EC9 | EP-15 | EC14 | EP-02 | EC19 | EP-01…EP-04 |
| EC5 | EP-12 | EC10 | EP-16 | EC15 | EP-03 | | |

Cả 19/19 lớp được phủ.

## 3.4 Cách thực thi và quan sát

- **Kênh:** chỉ có ứng dụng mobile (không có API giỏ hàng: giỏ chỉ nằm trong bộ nhớ của app). App chạy trên Expo Web, mô phỏng Pixel 5 (xem [Bước 1 §1.6](01_input_output.md)).
- **Quan sát:**
  - Đọc từng dòng giỏ: tên, "Giá", giá trị trong ô Số lượng, "Thành tiền".
  - Đọc dòng tổng và nhãn của nó.
  - Đọc số trên nút "Giỏ (n)" ở header.
  - Chụp màn hình điện thoại sau mỗi TC.
- **Thứ tự chạy:** EP-01 → EP-04 (hợp lệ) chạy trước để kiểm tra masking.
