# FR-20 Mobile: Giỏ hàng & Số lượng, Bước 2: Xác định lớp tương đương

> Kỹ thuật: Phân hoạch tương đương, bước 2/3 (slide Bài 4, tr.8–10).
> Đầu vào: điều kiện C1–C6 và giả định A1–A4 ở [Bước 1](01_input_output.md).

## 2.1 Cách phân hoạch

| Loại điều kiện | Lớp hợp lệ | Lớp không hợp lệ | Áp dụng cho |
|---|---|---|---|
| Dãy giá trị `[1..∞)` (số nguyên) | số nguyên ≥ 1 | = 0, < 0, thập phân, chữ, rỗng | C1 (I1 và I2) |
| Dãy giá trị sau khi bấm +/− | kết quả ≥ 1 | kết quả < 1 | C2 |
| Boolean | cùng SP thì gộp, khác SP thì tách dòng | – | C3 |
| Tập giá trị {Đồng ý, Hủy} | mỗi lựa chọn là một lớp | – | C4 |
| Boolean | giỏ trống / có hàng | – | C5 |

**Tách C1 thành 5 lớp không hợp lệ.** "Số nguyên dương" có thể bị vi phạm theo 5 cách: bằng 0 (biên của "dương"), âm, không nguyên, không phải số, rỗng. Ô nhập trên điện thoại dùng bàn phím số, nhưng một số bàn phím vẫn có `-` và `.`, và người dùng có thể dán chữ vào. Hệ thống có thể xử lý mỗi cách một khác.

**Phân hoạch C1 trên hai biến I1 và I2.** Ô Số lượng ở trang chi tiết và ô Số lượng trong giỏ là **hai nơi nhập khác nhau**, nên mỗi nơi phải được kiểm tra riêng.

## 2.2 Bảng tổng hợp lớp tương đương

**Dữ liệu nền:** sản phẩm A = "Bàn phím cơ Keychron Q1" (4.000.000 ₫), sản phẩm B = "Tai nghe AirPods Pro 2" (6.000.000 ₫).

| STT | Input / Output | Điều kiện | Lớp tương đương | Loại | Giá trị đại diện |
|---|---|---|---|---|---|
| EC1 | I1 SL ở trang chi tiết | C1 | Số nguyên ≥ 1 | Hợp lệ | `3` |
| EC2 | | C1 | Bằng 0 | Không hợp lệ | `0` |
| EC3 | | C1 | Số âm | Không hợp lệ | `-2` |
| EC4 | | C1 | Số thập phân | Không hợp lệ | `1.5` |
| EC5 | | C1 | Không phải số | Không hợp lệ | `abc` |
| EC6 | | C1 | Rỗng | Không hợp lệ | `""` |
| EC7 | I2 SL sửa trong giỏ | C1 | Số nguyên ≥ 1 | Hợp lệ | `5` |
| EC8 | | C1 | Bằng 0 | Không hợp lệ | `0` |
| EC9 | | C1 | Số âm | Không hợp lệ | `-2` |
| EC10 | | C1 | Số thập phân | Không hợp lệ | `1.5` |
| EC11 | | C1 | Không phải số | Không hợp lệ | `abc` |
| EC12 | | C1 | Rỗng | Không hợp lệ | `""` |
| EC13 | I3 Nút +/− | C2 | Có nút, bấm thì đổi ±1 | Hợp lệ | `+` khi SL = 1 |
| EC14 | I4 Thêm SP | C3 | Thêm **cùng** SP lần 2 → gộp dòng, cộng SL | Hợp lệ | A (từ danh sách) + A (SL 2 từ chi tiết) |
| EC15 | | C3 | Thêm **khác** SP → dòng mới | Hợp lệ | A + B |
| EC16 | I5 Xóa | C4 | Bấm Xóa → dialog → **Đồng ý** → dòng bị xóa | Hợp lệ | – |
| EC17 | | C4 | Bấm Xóa → dialog → **Hủy** → dòng giữ nguyên | Hợp lệ | – |
| EC18 | I6 Giỏ | C5 | Giỏ trống → hình + thông báo + Tiếp tục mua sắm | Hợp lệ | – |
| EC19 | O1 | C6 | Thành tiền = giá × SL; Tổng cộng = Σ; nhãn "Tổng cộng"; định dạng `₫` | Hợp lệ (output) | – |

**Thống kê:** 19 lớp, gồm **9 lớp hợp lệ** (EC1, EC7, EC13–EC19) và **10 lớp không hợp lệ** (EC2–EC6, EC8–EC12).
