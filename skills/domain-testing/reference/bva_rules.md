# Quy tắc Phân tích giá trị biên (BVA) — theo slide KCPM Bài 4

## Khi nào dùng
Chỉ cho biến có **miền giá trị có thứ tự** (số, độ dài chuỗi, ngày, số lần…). Định danh (id danh mục), tập không thứ tự, boolean → không dùng BVA (giải thích lý do trong tài liệu).

## Các điểm cho một biến có miền `[LB..UB]`

`LB−1, LB, LB+1, nominal, UB−1, UB, UB+1` — bước nhảy là **đơn vị nhỏ nhất có nghĩa** (1 ký tự, 1 ₫, 1 ngày, 1 lần…), ghi rõ trong bảng biên.

## Bốn biến thể (n = số biến)

| Biến thể | Điểm mỗi biến | Số TC | Kiểm tra phía không hợp lệ? | Giả định |
|---|---|---|---|---|
| Standard | LB, LB+1, nominal, UB−1, UB | **4n + 1** | Không | lỗi đơn |
| Robustness | + LB−1, UB+1 | **6n + 1** | Có | lỗi đơn |
| Worst-case | 5 điểm, tổ hợp mọi biến | **5ⁿ** | Không | lỗi đa |
| Robust worst-case | 7 điểm, tổ hợp | **7ⁿ** | Có | lỗi đa |

Mỗi TC chỉ cho **một biến** nhận giá trị biên, các biến khác ở nominal (trừ worst-case).

## Điều chỉnh thường gặp (đã dùng trong HW02)

- **Biến chỉ có biên dưới** `[LB..∞)` (độ dài tối thiểu, ngưỡng tối thiểu, số lượng ≥ 1): Robustness còn **LB−1, LB, LB+1** → **3n + 1** TC; Standard còn **2n + 1**.
- **Không có biên trên trong spec**: thêm **1 điểm độ bền** phía "∞" (chuỗi ≥ 256 ký tự, số vượt int32 `2³¹`, số lượng 999…) để kiểm tra cắt chuỗi/tràn số/định dạng.
- **Miền rất hẹp** (ví dụ `[0..1]`): các điểm trùng nhau → liệt kê điểm phân biệt và ghi rõ điểm nào trùng; LB−1 không tạo được thì ghi "không thể xảy ra".
- **Cùng một điều kiện trên nhiều đối tượng/endpoint** (2 coupon khác ngưỡng; POST và PUT): lặp lại bộ điểm biên vì có thể là hai đường xử lý khác nhau.
- Biến **ngày**: dùng `hôm nay` làm mốc (d = −1, 0, +1, +2); ghi rõ múi giờ và cách hiểu "trước/sau" (giả định).

## Chọn biến thể — phải giải thích
Mặc định chọn **Robustness** (lỗi hay nằm đúng ở LB−1/LB, ví dụ `>` thay vì `>=`). Loại Worst-case khi các điều kiện độc lập và số TC bùng nổ; nêu rõ phép tính (ví dụ 3⁶ = 729).

## Định dạng bảng BVA

| TC | Biến | Điểm | Giá trị | (các biến khác = nominal) | Output mong đợi |
|---|---|---|---|---|---|
