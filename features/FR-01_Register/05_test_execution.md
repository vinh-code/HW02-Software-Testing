# FR-01 Đăng ký tài khoản: Bước 5, Thực thi kiểm thử

## 5.1 Môi trường

| Mục | Giá trị |
|---|---|
| Thời điểm chạy | 2026-10-13 12:19 (GMT+7). Dữ liệu thô: [`results_fr01.json`](results_fr01.json) |
| SUT | `eshop-sut` commit `85af3ba`. Backend `:3000`, Web `:5173` |
| Trạng thái DB | Khởi động lại backend ngay trước khi chạy, nên DB được seed lại với 2 tài khoản `admin@eshop.com` và `test@eshop.com` |
| Trình duyệt | Chromium 131 (headless) qua Playwright 1.49.1 |
| Script | [`scripts/fr01_register.js`](../../scripts/fr01_register.js). Chạy lại bằng `cd scripts && node fr01_register.js` |
| Cách tách dữ liệu | API dùng email `vinh.api.*`, UI dùng `vinh.ui.*`, lượt chạy lại dùng `*r@gmail.com` |
| Hậu kiểm | Đếm số tài khoản có email của TC qua `GET /api/admin/users` (so sánh không phân biệt hoa/thường), **trước và sau** khi gửi form |

**Tiêu chí Pass/Fail**
- TC mong đợi **O1**: Pass khi API trả 2xx (UI chuyển sang `/login`) **và** có thêm 1 tài khoản.
- TC mong đợi **O2**: Pass khi API trả 4xx (UI vẫn ở trang đăng ký và có thông báo lỗi) **và** không có tài khoản mới.

## 5.2 Phát hiện trong khi chạy: lỗi che lỗi (masking)

Ở lượt chạy đầu, **UI từ chối toàn bộ mật khẩu đúng spec**, kể cả `Abcdef1@` của TC hợp lệ EP-01. Vì thế, mọi TC "không hợp lệ" về họ tên/email trên UI đều bị chặn bởi **lỗi mật khẩu** chứ không phải bởi lớp không hợp lệ đang được test. Đó là một kết quả Pass giả.

Để xác định UI thực sự chấp nhận mật khẩu nào, mình chạy thêm một lượt khám phá (exploratory probe), mỗi mật khẩu dùng một email mới:

| Mật khẩu thử | Đúng spec? | UI xử lý |
|---|---|---|
| `Abcdef1@` | ✅ hợp lệ | ❌ Từ chối "Mật khẩu quá yếu" |
| `Abcdef1@ ` (có thêm khoảng trắng) | ✅ hợp lệ | ❌ Từ chối |
| `Abc def1@` | ✅ hợp lệ | ❌ Từ chối |
| `Abcdef1 ` (khoảng trắng, không có ký tự đặc biệt) | ❌ không hợp lệ | ✅ **Chấp nhận**, chuyển `/login` |
| `Abcdef 1` | ❌ không hợp lệ | ✅ **Chấp nhận** |
| `Abcdefg 1` | ❌ không hợp lệ | ✅ **Chấp nhận** |

**Kết luận:** UI hiểu "ký tự đặc biệt" là **khoảng trắng**, và **cấm** mọi ký tự thuộc tập `@$!%*?&`. Quy tắc này ngược hẳn với spec.

**Cách xử lý:** chạy lại 9 TC không hợp lệ về họ tên/email trên UI (đánh hậu tố `R`), dùng mật khẩu `Abcdef1 ` mà UI chấp nhận. Như vậy mỗi TC chỉ còn đúng **một** lớp không hợp lệ, đúng nguyên tắc ở slide tr.15. Kết quả lượt chạy lại được dùng làm **kết luận chính thức** cho kênh UI của các TC này.

## 5.3 Kết quả: Phân hoạch tương đương (19 TC)

Chú thích:
- ✅ PASS
- ❌ FAIL
- ⚠️ PASS\*: kết quả đúng (bị từ chối), nhưng **lý do từ chối sai**. UI chặn vì quy tắc mật khẩu sai (mục 5.2), nên không xác nhận được rằng UI kiểm tra đúng lớp đang test.

| TC | Lớp | Mong đợi | API: thực tế | API | UI: thực tế | UI | Screenshot |
|---|---|---|---|---|---|---|---|
| EP-01 | EC1,4,11,14,21,24 | O1 | 200, tạo TK | ✅ | Báo "Mật khẩu quá yếu", không tạo TK | ❌ | [EP-01](screenshots/EP-01_ui.png) |
| EP-02 | EC20 | O1 | 200, tạo TK | ✅ | Báo "Mật khẩu quá yếu", không tạo TK | ❌ | [EP-02](screenshots/EP-02_ui.png) |
| EP-03 | EC2 Họ tên rỗng | O2 | 200, **tạo TK** | ❌ | Bị chặn bởi HTML5 `required` (lượt chạy lại cũng vậy) | ✅ | [EP-03R](screenshots/EP-03R_ui.png) |
| EP-04 | EC3 Họ tên toàn khoảng trắng | O2 | 200, **tạo TK** | ❌ | Lượt chạy lại: **chấp nhận**, chuyển `/login`, tạo TK | ❌ | [EP-04R](screenshots/EP-04R_ui.png) |
| EP-05 | EC5 Email thiếu `@` | O2 | 200, **tạo TK** | ❌ | Lượt chạy lại: **chấp nhận**, tạo TK | ❌ | [EP-05R](screenshots/EP-05R_ui.png) |
| EP-06 | EC6 Email thiếu phần local | O2 | 200, **tạo TK** | ❌ | Lượt chạy lại: **chấp nhận**, tạo TK | ❌ | [EP-06R](screenshots/EP-06R_ui.png) |
| EP-07 | EC7 Domain không có `.` | O2 | 200, **tạo TK** | ❌ | Lượt chạy lại: **chấp nhận**, tạo TK | ❌ | [EP-07R](screenshots/EP-07R_ui.png) |
| EP-08 | EC8 Email rỗng | O2 | 200, **tạo TK** | ❌ | Bị chặn bởi HTML5 `required` | ✅ | [EP-08R](screenshots/EP-08R_ui.png) |
| EP-09 | EC9 Email đã tồn tại | O2 | 200, **tạo TK trùng** `test@eshop.com` | ❌ | Lượt chạy lại: **chấp nhận**, tạo TK trùng | ❌ | [EP-09R](screenshots/EP-09R_ui.png) |
| EP-10 | EC10 Trùng, khác hoa/thường | O2 | 200, **tạo TK** `TEST@eshop.com` | ❌ | Lượt chạy lại: **chấp nhận**, tạo TK | ❌ | [EP-10R](screenshots/EP-10R_ui.png) |
| EP-11 | EC12 MK 7 ký tự | O2 | 200, **tạo TK** | ❌ | Báo "Mật khẩu quá yếu" | ⚠️ | [EP-11](screenshots/EP-11_ui.png) |
| EP-12 | EC13 MK rỗng | O2 | 200, **tạo TK** | ❌ | Bị chặn bởi HTML5 `required` | ✅ | [EP-12](screenshots/EP-12_ui.png) |
| EP-13 | EC15 Thiếu chữ hoa | O2 | 200, **tạo TK** | ❌ | Báo "Mật khẩu quá yếu" | ⚠️ | [EP-13](screenshots/EP-13_ui.png) |
| EP-14 | EC16 Thiếu chữ thường | O2 | 200, **tạo TK** | ❌ | Báo "Mật khẩu quá yếu" | ⚠️ | [EP-14](screenshots/EP-14_ui.png) |
| EP-15 | EC17 Thiếu chữ số | O2 | 200, **tạo TK** | ❌ | Báo "Mật khẩu quá yếu" | ⚠️ | [EP-15](screenshots/EP-15_ui.png) |
| EP-16 | EC18 Không có ký tự đặc biệt | O2 | 200, **tạo TK** | ❌ | Báo "Mật khẩu quá yếu" | ⚠️ | [EP-16](screenshots/EP-16_ui.png) |
| EP-17 | EC19 Ký tự đặc biệt ngoài tập | O2 | 200, **tạo TK** | ❌ | Báo "Mật khẩu quá yếu" | ⚠️ | [EP-17](screenshots/EP-17_ui.png) |
| EP-18 | EC22 Xác nhận MK không khớp | O2 | 200, **tạo TK** (bỏ qua `confirmPassword`) | ❌ | **Không có ô Xác nhận MK** | ❌ | [EP-18](screenshots/EP-18_ui.png) |
| EP-19 | EC23 Xác nhận MK rỗng | O2 | 200, **tạo TK** | ❌ | **Không có ô Xác nhận MK** | ❌ | [EP-19](screenshots/EP-19_ui.png) |

## 5.4 Kết quả: Phân tích giá trị biên (21 TC)

| TC | Biến, điểm biên | Mong đợi | API | UI | Ghi chú |
|---|---|---|---|---|---|
| BVA-01 | Nominal | O1 | ✅ 200 | ❌ báo MK yếu | UI từ chối MK hợp lệ |
| BVA-02 | len(Họ tên) = 0 | O2 | ❌ 200, tạo TK | ✅ HTML5 `required` | Lượt chạy lại BVA-02R cũng ✅ |
| BVA-03 | len(Họ tên) = 1 | O1 | ✅ | ❌ | UI: lỗi mật khẩu |
| BVA-04 | len(Họ tên) = 2 | O1 | ✅ | ❌ | UI: lỗi mật khẩu |
| BVA-05 | len(MK) = 7 | O2 | ❌ 200, tạo TK | ⚠️ | **API không có biên dưới 8** |
| BVA-06 | len(MK) = 8 | O1 | ✅ | ❌ | UI: lỗi mật khẩu |
| BVA-07 | len(MK) = 9 | O1 | ✅ | ❌ | UI: lỗi mật khẩu |
| BVA-08 | #chữ hoa = 0 | O2 | ❌ tạo TK | ⚠️ | |
| BVA-09 | #chữ hoa = 1 | O1 | ✅ | ❌ | |
| BVA-10 | #chữ hoa = 2 | O1 | ✅ | ❌ | |
| BVA-11 | #chữ thường = 0 | O2 | ❌ tạo TK | ⚠️ | |
| BVA-12 | #chữ thường = 1 | O1 | ✅ | ❌ | |
| BVA-13 | #chữ thường = 2 | O1 | ✅ | ❌ | |
| BVA-14 | #chữ số = 0 | O2 | ❌ tạo TK | ⚠️ | |
| BVA-15 | #chữ số = 1 | O1 | ✅ | ❌ | |
| BVA-16 | #chữ số = 2 | O1 | ✅ | ❌ | |
| BVA-17 | #ký tự đặc biệt = 0 | O2 | ❌ tạo TK | ⚠️ | |
| BVA-18 | #ký tự đặc biệt = 1 | O1 | ✅ | ❌ | |
| BVA-19 | #ký tự đặc biệt = 2 | O1 | ✅ | ❌ | |
| BVA-20 | len(Họ tên) = 256 | O1 | ✅ | ❌ | UI: lỗi mật khẩu |
| BVA-21 | len(MK) = 256 | O1 | ✅ | ❌ | UI: lỗi mật khẩu |

Screenshot UI của từng TC: `screenshots/<TC>_ui.png`.

## 5.5 Tổng hợp

| Kênh | Số TC | ✅ PASS | ⚠️ PASS\* | ❌ FAIL |
|---|---|---|---|---|
| API | 40 | 17 (toàn bộ TC hợp lệ) | 0 | **23 (toàn bộ TC không hợp lệ)** |
| UI | 40 | 4 (EP-03, EP-08, EP-12, BVA-02) | 11 | **25** |

**Kết luận theo TC** (một TC chỉ Pass khi Pass trên **cả hai** kênh): **0/40 Pass**. Tính năng FR-01 không đáp ứng spec ở cả hai tầng:
- **Tầng API không có validation nào.** Mọi input đều được chấp nhận, kể cả họ tên/email/mật khẩu rỗng.
- **Tầng UI** chỉ kiểm tra "bắt buộc" (HTML5 `required`) và một quy tắc mật khẩu **sai**. UI không kiểm tra định dạng email, email trùng, họ tên toàn khoảng trắng, và không có trường Xác nhận MK.

**Nhận xét về kỹ thuật:**
- Các TC hợp lệ (EP-01, BVA-01) phát hiện ngay lỗi nghiêm trọng nhất: người dùng **không thể đăng ký** bằng mật khẩu đúng chuẩn.
- Các TC không hợp lệ chạy qua API phát hiện việc thiếu validation phía server.
- Nguyên tắc "mỗi TC chỉ một lớp không hợp lệ" đã giúp nhận ra hiện tượng lỗi che lỗi ở mục 5.2. Nếu bỏ qua, ta sẽ kết luận sai rằng UI có kiểm tra định dạng và tính duy nhất của email.
