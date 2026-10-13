# FR-01 Đăng ký tài khoản: Bước 3, Xác định ca kiểm thử (EP)

> Kỹ thuật: Phân hoạch tương đương, bước 3/3 (slide Bài 4, tr.15–18).
> Đầu vào: 25 lớp tương đương ở [Bước 2](02_equivalence_classes.md).

## 3.1 Nguyên tắc áp dụng (slide tr.15)

1. Khi xét một lớp của biến X, chọn giá trị đại diện của lớp đó cho X. Các biến còn lại lấy giá trị đại diện của **lớp hợp lệ**.
2. **Một TC được phủ nhiều lớp hợp lệ** của nhiều biến cùng lúc.
3. **Mỗi TC chỉ phủ đúng một lớp không hợp lệ.** Nếu một TC chứa hai lỗi, lỗi thứ nhất có thể che lỗi thứ hai và ta không biết hệ thống đã từ chối vì lỗi nào.

Ràng buộc bổ sung: mỗi TC dùng **email riêng** (`vinh.epNN@gmail.com`). Nhờ vậy, một TC lẽ ra bị từ chối nhưng lại được chấp nhận nhầm sẽ không làm hỏng điều kiện "email duy nhất" của các TC sau.

## 3.2 Bảng xác định ca kiểm thử cho từng lớp

| Lớp | Lớp tương đương | Họ tên | Email | Mật khẩu | Xác nhận MK | Output mong đợi |
|---|---|---|---|---|---|---|
| EC1 | Họ tên khác rỗng | `Nguyen Van A` | `vinh.ep01@gmail.com` | `Abcdef1@` | `Abcdef1@` | O1 |
| EC2 | Họ tên rỗng | `""` | `vinh.ep03@gmail.com` | `Abcdef1@` | `Abcdef1@` | O2 |
| EC3 | Họ tên chỉ khoảng trắng | `"   "` | `vinh.ep04@gmail.com` | `Abcdef1@` | `Abcdef1@` | O2 |
| EC4 | Email hợp lệ, chưa tồn tại | `Nguyen Van A` | `vinh.ep01@gmail.com` | `Abcdef1@` | `Abcdef1@` | O1 |
| EC5 | Email thiếu `@` | `Nguyen Van A` | `vinh.gmail.com` | `Abcdef1@` | `Abcdef1@` | O2 |
| EC6 | Email thiếu phần local | `Nguyen Van A` | `@gmail.com` | `Abcdef1@` | `Abcdef1@` | O2 |
| EC7 | Email domain không có `.` | `Nguyen Van A` | `vinh@gmail` | `Abcdef1@` | `Abcdef1@` | O2 |
| EC8 | Email rỗng | `Nguyen Van A` | `""` | `Abcdef1@` | `Abcdef1@` | O2 |
| EC9 | Email đã tồn tại | `Nguyen Van A` | `test@eshop.com` | `Abcdef1@` | `Abcdef1@` | O2 |
| EC10 | Email đã tồn tại, khác hoa/thường | `Nguyen Van A` | `TEST@eshop.com` | `Abcdef1@` | `Abcdef1@` | O2 |
| EC11 | MK len ≥ 8 | `Nguyen Van A` | `vinh.ep01@gmail.com` | `Abcdef1@` | `Abcdef1@` | O1 |
| EC12 | MK len < 8 | `Nguyen Van A` | `vinh.ep11@gmail.com` | `Abcd1@x` | `Abcd1@x` | O2 |
| EC13 | MK rỗng | `Nguyen Van A` | `vinh.ep12@gmail.com` | `""` | `""` | O2 |
| EC14 | MK đủ 4 loại ký tự | `Nguyen Van A` | `vinh.ep01@gmail.com` | `Abcdef1@` | `Abcdef1@` | O1 |
| EC15 | Thiếu chữ hoa | `Nguyen Van A` | `vinh.ep13@gmail.com` | `abcdef1@` | `abcdef1@` | O2 |
| EC16 | Thiếu chữ thường | `Nguyen Van A` | `vinh.ep14@gmail.com` | `ABCDEF1@` | `ABCDEF1@` | O2 |
| EC17 | Thiếu chữ số | `Nguyen Van A` | `vinh.ep15@gmail.com` | `Abcdefg@` | `Abcdefg@` | O2 |
| EC18 | Không có ký tự đặc biệt | `Nguyen Van A` | `vinh.ep16@gmail.com` | `Abcdefg1` | `Abcdefg1` | O2 |
| EC19 | Ký tự đặc biệt ngoài tập | `Nguyen Van A` | `vinh.ep17@gmail.com` | `Abcdef1#` | `Abcdef1#` | O2 |
| EC20 | Ký tự trong tập + ngoài tập | `Nguyen Van A` | `vinh.ep02@gmail.com` | `Abcde1@#` | `Abcde1@#` | O1 |
| EC21 | Xác nhận MK khớp | `Nguyen Van A` | `vinh.ep01@gmail.com` | `Abcdef1@` | `Abcdef1@` | O1 |
| EC22 | Xác nhận MK không khớp | `Nguyen Van A` | `vinh.ep18@gmail.com` | `Abcdef1@` | `Abcdef1!` | O2 |
| EC23 | Xác nhận MK rỗng | `Nguyen Van A` | `vinh.ep19@gmail.com` | `Abcdef1@` | `""` | O2 |
| EC24 | Output O1 | `Nguyen Van A` | `vinh.ep01@gmail.com` | `Abcdef1@` | `Abcdef1@` | O1 |
| EC25 | Output O2 | `""` | `vinh.ep03@gmail.com` | `Abcdef1@` | `Abcdef1@` | O2 |

> O1 = đăng ký thành công, chuyển sang `/login`. O2 = hiển thị thông báo lỗi, **không** tạo tài khoản.

## 3.3 Bảng rút gọn các ca kiểm thử

Gộp các dòng có cùng bộ dữ liệu. EC1, EC4, EC11, EC14, EC21 và EC24 đều dùng chung một bộ dữ liệu hợp lệ nên gộp thành **EP-01**. EC25 phủ chung với EP-03.

| TC | Lớp tương đương phủ | Họ tên | Email | Mật khẩu | Xác nhận MK | Output mong đợi |
|---|---|---|---|---|---|---|
| **EP-01** | EC1, EC4, EC11, EC14, EC21, EC24 | `Nguyen Van A` | `vinh.ep01@gmail.com` | `Abcdef1@` | `Abcdef1@` | Thành công, chuyển `/login` |
| **EP-02** | EC20 (+ EC1, EC4, EC11, EC21, EC24) | `Nguyen Van A` | `vinh.ep02@gmail.com` | `Abcde1@#` | `Abcde1@#` | Thành công, chuyển `/login` |
| **EP-03** | EC2, EC25 | `""` | `vinh.ep03@gmail.com` | `Abcdef1@` | `Abcdef1@` | Lỗi "Họ tên bắt buộc" |
| **EP-04** | EC3 | `"   "` | `vinh.ep04@gmail.com` | `Abcdef1@` | `Abcdef1@` | Lỗi "Họ tên bắt buộc" |
| **EP-05** | EC5 | `Nguyen Van A` | `vinh.gmail.com` | `Abcdef1@` | `Abcdef1@` | Lỗi định dạng email |
| **EP-06** | EC6 | `Nguyen Van A` | `@gmail.com` | `Abcdef1@` | `Abcdef1@` | Lỗi định dạng email |
| **EP-07** | EC7 | `Nguyen Van A` | `vinh@gmail` | `Abcdef1@` | `Abcdef1@` | Lỗi định dạng email |
| **EP-08** | EC8 | `Nguyen Van A` | `""` | `Abcdef1@` | `Abcdef1@` | Lỗi "Email bắt buộc" |
| **EP-09** | EC9 | `Nguyen Van A` | `test@eshop.com` | `Abcdef1@` | `Abcdef1@` | Lỗi "Email đã tồn tại" |
| **EP-10** | EC10 | `Nguyen Van A` | `TEST@eshop.com` | `Abcdef1@` | `Abcdef1@` | Lỗi "Email đã tồn tại" |
| **EP-11** | EC12 | `Nguyen Van A` | `vinh.ep11@gmail.com` | `Abcd1@x` | `Abcd1@x` | Lỗi mật khẩu yếu (< 8 ký tự) |
| **EP-12** | EC13 | `Nguyen Van A` | `vinh.ep12@gmail.com` | `""` | `""` | Lỗi "Mật khẩu bắt buộc" |
| **EP-13** | EC15 | `Nguyen Van A` | `vinh.ep13@gmail.com` | `abcdef1@` | `abcdef1@` | Lỗi mật khẩu yếu (thiếu chữ hoa) |
| **EP-14** | EC16 | `Nguyen Van A` | `vinh.ep14@gmail.com` | `ABCDEF1@` | `ABCDEF1@` | Lỗi mật khẩu yếu (thiếu chữ thường) |
| **EP-15** | EC17 | `Nguyen Van A` | `vinh.ep15@gmail.com` | `Abcdefg@` | `Abcdefg@` | Lỗi mật khẩu yếu (thiếu chữ số) |
| **EP-16** | EC18 | `Nguyen Van A` | `vinh.ep16@gmail.com` | `Abcdefg1` | `Abcdefg1` | Lỗi mật khẩu yếu (thiếu ký tự đặc biệt) |
| **EP-17** | EC19 | `Nguyen Van A` | `vinh.ep17@gmail.com` | `Abcdef1#` | `Abcdef1#` | Lỗi mật khẩu yếu (ký tự đặc biệt không thuộc tập) |
| **EP-18** | EC22 | `Nguyen Van A` | `vinh.ep18@gmail.com` | `Abcdef1@` | `Abcdef1!` | Lỗi "Mật khẩu xác nhận không khớp" |
| **EP-19** | EC23 | `Nguyen Van A` | `vinh.ep19@gmail.com` | `Abcdef1@` | `""` | Lỗi "Vui lòng xác nhận mật khẩu" |

**Tổng:** 19 TC, gồm 2 TC hợp lệ và 17 TC không hợp lệ. Cả 25 lớp tương đương đều được phủ.

## 3.4 Kiểm tra độ phủ

| Lớp | EC1 | EC2 | EC3 | EC4 | EC5 | EC6 | EC7 | EC8 | EC9 | EC10 | EC11 | EC12 | EC13 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC | 01,02 | 03 | 04 | 01,02 | 05 | 06 | 07 | 08 | 09 | 10 | 01,02 | 11 | 12 |

| Lớp | EC14 | EC15 | EC16 | EC17 | EC18 | EC19 | EC20 | EC21 | EC22 | EC23 | EC24 | EC25 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC | 01 | 13 | 14 | 15 | 16 | 17 | 02 | 01,02 | 18 | 19 | 01,02 | 03–19 |

## 3.5 Cách thực thi

- **UI:** nhập dữ liệu vào form `/register`. Vì form **không có** ô Xác nhận MK, các TC EP-18 và EP-19 không nhập được giá trị này. Với các TC còn lại, cột "Xác nhận MK" được bỏ qua trên UI.
- **API:** gửi `POST /api/register` với `{name, email, password, confirmPassword}`. Kết quả mong đợi khi dữ liệu không hợp lệ: HTTP 4xx và tài khoản **không** được tạo. Sau đó kiểm tra lại bằng cách đăng nhập với email vừa dùng.
- **Hậu kiểm O2:** với các TC lỗi, thử đăng nhập bằng email và mật khẩu của TC. Kết quả đúng là đăng nhập thất bại (tài khoản không tồn tại).
