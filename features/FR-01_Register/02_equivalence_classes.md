# FR-01 Đăng ký tài khoản: Bước 2, Xác định lớp tương đương

> Kỹ thuật: Phân hoạch tương đương, bước 2/3 (slide Bài 4, tr.8–10).
> Đầu vào là 9 điều kiện C1–C9 và các giả định A1–A5 ở [Bước 1](01_input_output.md).

## 2.1 Cách phân hoạch

Lớp tương đương được xác định theo bảng nguyên tắc ở slide tr.10:

| Loại điều kiện | Lớp hợp lệ | Lớp không hợp lệ | Áp dụng cho |
|---|---|---|---|
| Boolean | điều kiện đúng | điều kiện sai | C1, C2, C3, C5, C6, C7, C9 |
| Dãy giá trị `[8..∞)` | 8 ≤ len | len < 8 | C4 |
| Tập giá trị `{@$!%*?&}` | có ký tự thuộc tập | không có ký tự nào thuộc tập | C8 |

Một số lớp không hợp lệ được **tách nhỏ hơn**. Lý do là các cách vi phạm khác nhau có thể được hệ thống xử lý khác nhau, nên cần test riêng từng cách:
- **Email sai định dạng** được tách thành: thiếu `@`, thiếu phần local, domain thiếu `.`. Mỗi cách vi phạm một phần khác nhau của mẫu `local@domain.tld` (giả định A2).
- **Rỗng** được tách riêng cho từng trường bắt buộc, vì "bắt buộc" là một ràng buộc độc lập với định dạng.
- **Email trùng** có thêm lớp *trùng nhưng khác hoa/thường* (giả định A5).

## 2.2 Bảng tổng hợp lớp tương đương

| STT | Input / Output | Điều kiện | Lớp tương đương | Loại | Giá trị đại diện |
|---|---|---|---|---|---|
| EC1 | I1 Họ tên | C1 | Họ tên khác rỗng | Hợp lệ | `Nguyen Van A` |
| EC2 | | C1 | Họ tên rỗng | Không hợp lệ | `""` |
| EC3 | | C1 | Họ tên chỉ chứa khoảng trắng (A4) | Không hợp lệ | `"   "` |
| EC4 | I2 Email | C2, C3 | Đúng định dạng **và** chưa tồn tại | Hợp lệ | `vinh.tc01@gmail.com` |
| EC5 | | C2 | Sai định dạng, thiếu `@` | Không hợp lệ | `vinh.gmail.com` |
| EC6 | | C2 | Sai định dạng, thiếu phần local | Không hợp lệ | `@gmail.com` |
| EC7 | | C2 | Sai định dạng, domain không có `.` | Không hợp lệ | `vinh@gmail` |
| EC8 | | C2 | Email rỗng | Không hợp lệ | `""` |
| EC9 | | C3 | Email đã tồn tại | Không hợp lệ | `test@eshop.com` |
| EC10 | | C3 | Email đã tồn tại, khác hoa/thường (A5) | Không hợp lệ | `TEST@eshop.com` |
| EC11 | I3 Mật khẩu: độ dài | C4 | len ≥ 8 | Hợp lệ | `Abcdef1@` (8) |
| EC12 | | C4 | len < 8 (vẫn đủ 4 loại ký tự) | Không hợp lệ | `Abcd1@x` (7) |
| EC13 | | C4 | Mật khẩu rỗng (len = 0) | Không hợp lệ | `""` |
| EC14 | I3 Mật khẩu: thành phần | C5–C8 | Đủ chữ hoa, chữ thường, số, ký tự đặc biệt trong tập | Hợp lệ | `Abcdef1@` |
| EC15 | | C5 | Thiếu chữ hoa | Không hợp lệ | `abcdef1@` |
| EC16 | | C6 | Thiếu chữ thường | Không hợp lệ | `ABCDEF1@` |
| EC17 | | C7 | Thiếu chữ số | Không hợp lệ | `Abcdefg@` |
| EC18 | | C8 | Không có ký tự đặc biệt nào | Không hợp lệ | `Abcdefg1` |
| EC19 | | C8 | Chỉ có ký tự đặc biệt **ngoài** tập | Không hợp lệ | `Abcdef1#` |
| EC20 | | C8 | Có ký tự trong tập **và** ký tự ngoài tập (A3) | Hợp lệ | `Abcde1@#` |
| EC21 | I4 Xác nhận MK | C9 | Khớp với Mật khẩu | Hợp lệ | = Mật khẩu |
| EC22 | | C9 | Không khớp | Không hợp lệ | `Abcdef1!` (khi MK = `Abcdef1@`) |
| EC23 | | C9 | Rỗng | Không hợp lệ | `""` |
| EC24 | Output | — | O1: Đăng ký thành công, chuyển sang `/login` | Hợp lệ | — |
| EC25 | Output | — | O2: Thông báo lỗi, không tạo tài khoản | Không hợp lệ | — |

**Thống kê:** 25 lớp, gồm:
- **7 lớp hợp lệ:** EC1, EC4, EC11, EC14, EC20, EC21, EC24.
- **18 lớp không hợp lệ:** 17 lớp đầu vào và lớp đầu ra EC25.

## 2.3 Ghi chú khi chọn giá trị đại diện

- Mỗi giá trị đại diện **chỉ vi phạm đúng một điều kiện**. Ví dụ, EC12 `Abcd1@x` vẫn có đủ 4 loại ký tự, chỉ thiếu độ dài. Nhờ vậy, khi TC thất bại, ta biết chắc nguyên nhân là độ dài.
- EC15–EC19 đều dài ≥ 8 ký tự, để tách biệt với điều kiện độ dài C4.
- Đại diện của EC4 sẽ được **đổi thành email riêng cho mỗi TC** ở Bước 3 (`vinh.tcNN@gmail.com`). Mục đích là để các TC không ảnh hưởng nhau qua điều kiện "email duy nhất" (C3).
