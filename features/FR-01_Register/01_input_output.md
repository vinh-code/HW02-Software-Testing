# FR-01 Đăng ký tài khoản: Bước 1, Xác định Input & Output

> Kỹ thuật: Phân hoạch tương đương, bước 1/3 (slide Bài 4, tr.6–7).
> Cơ sở kiểm thử: SRS EShop, mục FR-01, và FR-22 cho phần ràng buộc form.

## 1.1 Trích yêu cầu từ SRS

| Mã | Nội dung đặc tả (FR-01) |
|---|---|
| R1 | Người dùng phải cung cấp **Họ Tên**, **Email**, **Mật khẩu** |
| R2 | Email phải có **định dạng hợp lệ** (`user@domain.com`) |
| R3 | Email phải **duy nhất** trong hệ thống |
| R4 | Mật khẩu dài **tối thiểu 8 ký tự** |
| R5 | Mật khẩu có **≥ 1 chữ hoa**, **≥ 1 chữ thường**, **≥ 1 chữ số** |
| R6 | Mật khẩu có **≥ 1 ký tự đặc biệt** thuộc tập `{@, $, !, %, *, ?, &}` |
| R7 | Có trường **Xác nhận mật khẩu**; hệ thống từ chối khi hai trường không khớp |
| R8 | Đăng ký thành công thì **chuyển tới trang Đăng nhập** |

## 1.2 Biến đầu vào (Input)

| Mã | Input | Kiểu | Bắt buộc | Ràng buộc liên quan |
|---|---|---|---|---|
| I1 | Họ Tên (`name`) | chuỗi | Có | R1 |
| I2 | Email (`email`) | chuỗi | Có | R1, R2, R3 |
| I3 | Mật khẩu (`password`) | chuỗi | Có | R1, R4, R5, R6 |
| I4 | Xác nhận mật khẩu (`confirmPassword`) | chuỗi | Có | R7 |

**Trạng thái hệ thống (tiền điều kiện) ảnh hưởng tới kết quả:** tập email đã tồn tại trong CSDL. Dữ liệu seed có sẵn `admin@eshop.com` và `test@eshop.com`. Biến I2 phụ thuộc vào trạng thái này vì ràng buộc R3.

## 1.3 Biến đầu ra (Output)

| Mã | Output | Mô tả |
|---|---|---|
| O1 | Đăng ký thành công | Tài khoản được tạo trong CSDL và giao diện chuyển sang trang `/login` |
| O2 | Thông báo lỗi | Hiển thị lỗi phù hợp, **không** tạo tài khoản, người dùng vẫn ở trang đăng ký |

## 1.4 Các điều kiện cần phân hoạch (đầu vào cho Bước 2)

Mỗi ràng buộc trong spec được tách thành một điều kiện độc lập để lập lớp tương đương ở Bước 2:

| Điều kiện | Biến | Loại điều kiện (theo slide tr.10) |
|---|---|---|
| C1. Họ tên khác rỗng | I1 | Boolean |
| C2. Email đúng định dạng | I2 | Boolean |
| C3. Email chưa tồn tại | I2 | Boolean |
| C4. Độ dài mật khẩu ≥ 8 | I3 | Dãy giá trị `[8..∞)`, **có thứ tự nên áp dụng được BVA** |
| C5. Có chữ hoa | I3 | Boolean |
| C6. Có chữ thường | I3 | Boolean |
| C7. Có chữ số | I3 | Boolean |
| C8. Có ký tự đặc biệt thuộc tập `{@$!%*?&}` | I3 | Tập giá trị |
| C9. Xác nhận mật khẩu khớp | I4 | Boolean |

## 1.5 Điểm mơ hồ trong đặc tả và giả định áp dụng

| # | Điểm mơ hồ | Giả định áp dụng |
|---|---|---|
| A1 | Spec không quy định độ dài tối đa của Họ tên, Email, Mật khẩu | Không có biên trên. Thêm 1 TC chuỗi rất dài (≥ 256 ký tự) để kiểm tra độ bền |
| A2 | "Định dạng hợp lệ `user@domain.com`" không nêu chi tiết | Hợp lệ khi có dạng `local@domain.tld`: có đúng 1 ký tự `@`, phần local và domain khác rỗng, domain có dấu `.` |
| A3 | Mật khẩu chứa ký tự đặc biệt **ngoài** tập (ví dụ `#`), nhưng vẫn có 1 ký tự trong tập | Spec chỉ yêu cầu "có ít nhất 1" ký tự trong tập, không cấm ký tự khác, nên coi là **hợp lệ** |
| A4 | Họ tên chỉ chứa khoảng trắng | Coi như **rỗng**, tức là không hợp lệ |
| A5 | Email khác chữ hoa/thường (`TEST@eshop.com`) so với email đã tồn tại | Email không phân biệt hoa/thường nên coi là **trùng** |

## 1.6 Kênh thực thi & quan sát ban đầu (hộp đen)

- **UI:** `http://localhost:5173/register`. Form hiện có 3 trường: Họ Tên, Email, Mật khẩu. **Không có trường Xác nhận mật khẩu (I4).** Vì vậy các TC liên quan C9 sẽ Fail ngay từ thiết kế giao diện.
- **API:** `POST /api/register` với body `{name, email, password}`. API spec cũng **không có** trường xác nhận mật khẩu. Dùng API để kiểm tra validation phía server, vì validation phía client có thể bị bỏ qua.
- Mỗi TC sẽ được thực thi trên **cả UI và API** khi có thể, vì một hệ thống đúng phải chặn dữ liệu sai ở cả hai tầng.
