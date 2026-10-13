# {{FR}} {{Tên tính năng}}: Bước 3, Xác định ca kiểm thử (EP)

> Kỹ thuật: Phân hoạch tương đương, bước 3/3 (slide Bài 4, tr.15–18). Đầu vào: lớp tương đương ở [Bước 2](02_equivalence_classes.md).

## 3.1 Nguyên tắc áp dụng
1. Biến đang xét lấy giá trị của lớp; các biến khác lấy bộ giá trị nền hợp lệ.
2. Một TC phủ nhiều lớp hợp lệ.
3. **Mỗi TC chỉ một lớp không hợp lệ.**

Ràng buộc bổ sung (dữ liệu duy nhất cho mỗi TC/kênh…): …

## 3.2 Bảng xác định ca kiểm thử cho từng lớp

| Lớp | Lớp tương đương | … (các input) | Output mong đợi |
|---|---|---|---|

## 3.3 Bảng rút gọn các ca kiểm thử

| TC | Lớp phủ | Dữ liệu (khác nền) | Kênh | Output mong đợi |
|---|---|---|---|---|
| EP-01 | EC1, EC… | – | UI + API | O1 |

**Lý do một số TC chỉ chạy một kênh:** …

## 3.4 Kiểm tra độ phủ

| Lớp | TC | Lớp | TC |
|---|---|---|---|

Cả N/N lớp được phủ; mỗi lớp không hợp lệ có TC riêng.

## 3.5 Cách thực thi và hậu kiểm
- **API:** … · **UI:** … · **Hậu kiểm:** … · **Thứ tự:** TC hợp lệ chạy trước (kiểm tra masking).
