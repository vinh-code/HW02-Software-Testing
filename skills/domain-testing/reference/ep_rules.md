# Quy tắc Phân hoạch tương đương (EP) — theo slide KCPM Bài 4

## Ba bước của kỹ thuật

1. **Xác định Input & Output** (slide tr.6–7): liệt kê mọi biến đầu vào (kể cả trạng thái hệ thống) và các lớp đầu ra; tách mỗi ràng buộc của spec thành một điều kiện độc lập.
2. **Xác định lớp tương đương** (slide tr.8–10): với mỗi điều kiện, chia miền giá trị thành lớp hợp lệ và không hợp lệ; phân hoạch **cả miền output**.
3. **Xác định ca kiểm thử** (slide tr.15–18): chọn giá trị đại diện, ghép thành TC, lập bảng rút gọn.

## Bảng nguyên tắc tạo lớp theo loại điều kiện (slide tr.10)

| Loại điều kiện | Lớp hợp lệ | Lớp không hợp lệ |
|---|---|---|
| **Giá trị cụ thể** (value) | 1 lớp: đúng giá trị | 2 lớp: nhỏ hơn, lớn hơn (hoặc khác giá trị) |
| **Dãy giá trị** (range `[a..b]`) | 1 lớp: `a ≤ x ≤ b` | 2 lớp: `x < a`, `x > b` |
| **Tập giá trị** (set) | 1 lớp: thuộc tập (tách từng phần tử nếu xử lý khác nhau) | 1 lớp: ngoài tập |
| **Boolean** | 1 lớp: đúng | 1 lớp: sai |

Tách lớp nhỏ hơn khi **các cách vi phạm khác nhau có thể được hệ thống xử lý khác nhau** (ví dụ "rỗng" ≠ "chỉ khoảng trắng" ≠ "sai định dạng"; "thiếu token" ≠ "token không đủ quyền").

## Quy tắc ghép ca kiểm thử (slide tr.15)

1. Khi xét lớp của biến X, chọn giá trị đại diện của lớp đó cho X; các biến còn lại lấy **giá trị đại diện của lớp hợp lệ** (bộ giá trị nền).
2. **Một TC có thể phủ nhiều lớp hợp lệ** của nhiều biến.
3. **Mỗi TC chỉ phủ đúng một lớp không hợp lệ** — nếu có hai lỗi trong một TC, lỗi này có thể che lỗi kia.
4. Lập **bảng rút gọn** (gộp các TC hợp lệ trùng nhau) và **ma trận độ phủ** EC → TC; mọi lớp phải được phủ.

## Định dạng bảng EC

| STT | Input / Output | Điều kiện | Lớp tương đương | Loại | Giá trị đại diện |
|---|---|---|---|---|---|

## Định dạng bảng rút gọn

| TC | Lớp phủ (in đậm lớp không hợp lệ) | Dữ liệu khác nền | Kênh | Output mong đợi |
|---|---|---|---|---|
