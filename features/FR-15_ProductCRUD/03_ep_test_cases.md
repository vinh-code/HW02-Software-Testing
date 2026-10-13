# FR-15 Quản lý sản phẩm (CRUD): Bước 3, Xác định ca kiểm thử (EP)

> Kỹ thuật: Phân hoạch tương đương, bước 3/3 (slide Bài 4, tr.15–18).
> Đầu vào: 21 lớp tương đương ở [Bước 2](02_equivalence_classes.md).

## 3.1 Nguyên tắc áp dụng (slide tr.15)

1. Khi xét lớp của biến X, các biến khác lấy **bộ giá trị nền hợp lệ**: tên `Tai nghe Sony WH-1000XM5`, giá `1500000`, danh mục `2`, quyền admin.
2. **Một TC phủ nhiều lớp hợp lệ.**
3. **Mỗi TC chỉ phủ đúng một lớp không hợp lệ.**

Với TC Sửa/Xóa, script **tạo sẵn một sản phẩm riêng** cho TC đó (tiền điều kiện) rồi mới sửa/xóa. Sản phẩm seed (id 1–5) được giữ nguyên để làm "các sản phẩm khác" khi kiểm tra C8.

## 3.2 Bảng xác định ca kiểm thử cho từng lớp

| Lớp | Lớp tương đương | Thao tác | Tên | Giá | DM | Quyền | Output mong đợi |
|---|---|---|---|---|---|---|---|
| EC1 | Tên thường | Thêm | `Tai nghe Sony WH-1000XM5` | 1500000 | 2 | admin | O1a |
| EC2 | Tên tiếng Việt + HTML | Thêm | `Loa <img …> JBL "Pro" & 'Bass' – Âm trầm` | 1500000 | 2 | admin | O1a + O1d |
| EC3 | Tên rỗng | Thêm | `""` | 1500000 | 2 | admin | O2 |
| EC4 | Tên chỉ khoảng trắng | Thêm | `"   "` | 1500000 | 2 | admin | O2 |
| EC5 | Tên > 255 | Thêm | 300 ký tự | 1500000 | 2 | admin | O2 |
| EC6 | Giá nguyên dương | Thêm | nền | 1500000 | 2 | admin | O1a |
| EC7 | Giá thập phân dương | Thêm | nền | 1500.5 | 2 | admin | O1a |
| EC8 | Giá rỗng | Thêm | nền | `""` | 2 | admin | O2 |
| EC9 | Giá = 0 | Thêm | nền | 0 | 2 | admin | O2 |
| EC10 | Giá âm | Thêm | nền | -1000 | 2 | admin | O2 |
| EC11 | Giá không phải số | Thêm | nền | `"abc"` | 2 | admin | O2 |
| EC12 | DM có sẵn | Thêm | nền | 1500000 | 2 | admin | O1a |
| EC13 | Thiếu DM | Thêm | nền | 1500000 | `null` | admin | O2 |
| EC14 | DM không tồn tại | Thêm | nền | 1500000 | 999 | admin | O2 |
| EC15 | SP tồn tại | Sửa / Xóa | – | – | – | admin | O1b / O1c |
| EC16 | SP không tồn tại | Sửa / Xóa id 99999 | nền | 1500000 | 2 | admin | O2: 404 |
| EC17 | Admin | Thêm | nền | 1500000 | 2 | admin | O1a |
| EC18 | Không token | Thêm / Sửa / Xóa | nền | 1500000 | 2 | – | O2: 401 |
| EC19 | Token user thường | Thêm | nền | 1500000 | 2 | user | O2: 403 |
| EC20 | Sửa chỉ 1 SP | Sửa | `… (đã sửa)` | 1600000 | 2 | admin | O1b |
| EC21 | Xóa chỉ 1 SP | Xóa | – | – | – | admin | O1c |

## 3.3 Bảng rút gọn các ca kiểm thử (22 TC)

| TC | Lớp phủ | Thao tác | Dữ liệu (khác nền) | Kênh | Output mong đợi |
|---|---|---|---|---|---|
| EP-01 | EC1, EC6, EC12, EC17 | Thêm | – | UI + API | O1a: có SP mới, đúng tên/giá/DM |
| EP-02 | EC1, EC6, EC12, EC15, EC17, **EC20** | Sửa | tên `… (đã sửa)`, giá 1600000 | UI + API | O1b: SP được sửa đổi, **mọi SP khác giữ nguyên** |
| EP-03 | EC15, EC17, **EC21** | Xóa | – | UI + API | O1c: SP bị xóa, SP khác giữ nguyên |
| EP-04 | **EC2** + nền | Thêm | tên có HTML | UI + API | O1a + O1d: tên hiển thị nguyên văn ở Admin, trang chủ và trang chi tiết; không có script nào chạy |
| EP-05 | **EC7** + nền | Thêm | giá 1500.5 | UI + API | O1a |
| EP-06 | **EC3** | Thêm | tên `""` | UI + API | O2 |
| EP-07 | **EC4** | Thêm | tên `"   "` | UI + API | O2 |
| EP-08 | **EC5** | Thêm | tên 300 ký tự | UI + API | O2 |
| EP-09 | **EC8** | Thêm | giá `""` | UI + API | O2 |
| EP-10 | **EC9** | Thêm | giá 0 | UI + API | O2 |
| EP-11 | **EC10** | Thêm | giá -1000 | UI + API | O2 |
| EP-12 | **EC11** | Thêm | giá `"abc"` | UI + API | O2 (UI: ô số không nhận chữ cũng tính là chặn) |
| EP-13 | **EC13** | Thêm | DM `null` | API | O2 |
| EP-14 | **EC14** | Thêm | DM 999 | API | O2 |
| EP-15 | **EC16** | Sửa | id 99999 | API | O2: 404 |
| EP-16 | **EC16** | Xóa | id 99999 | API | O2: 404 |
| EP-17 | **EC18** | Thêm | không token | API | O2: 401 |
| EP-18 | **EC19** | Thêm | token user | API | O2: 403 |
| EP-19 | **EC18** | Sửa | không token | API | O2: 401, SP không đổi |
| EP-20 | **EC18** | Xóa | không token | API | O2: 401, SP vẫn còn |
| EP-21 | **EC3** | Sửa | tên `""` | UI + API | O2, SP không đổi |
| EP-22 | **EC9** | Sửa | giá 0 | UI + API | O2, SP không đổi |

**Lý do một số TC chỉ chạy API:**
- EP-13, EP-14: dropdown luôn có giá trị thuộc danh sách.
- EP-15, EP-16: UI chỉ cho sửa/xóa SP đang hiển thị.
- EP-17 đến EP-20: kiểm tra phân quyền ở server. Trên UI, admin luôn có token.

## 3.4 Kiểm tra độ phủ

| Lớp | TC | Lớp | TC | Lớp | TC |
|---|---|---|---|---|---|
| EC1 | EP-01, EP-02 | EC8 | EP-09 | EC15 | EP-02, EP-03 |
| EC2 | EP-04 | EC9 | EP-10, EP-22 | EC16 | EP-15, EP-16 |
| EC3 | EP-06, EP-21 | EC10 | EP-11 | EC17 | EP-01…EP-05 |
| EC4 | EP-07 | EC11 | EP-12 | EC18 | EP-17, EP-19, EP-20 |
| EC5 | EP-08 | EC12 | EP-01 | EC19 | EP-18 |
| EC6 | EP-01 | EC13 | EP-13 | EC20 | EP-02 |
| EC7 | EP-05 | EC14 | EP-14 | EC21 | EP-03 |

Cả 21/21 lớp được phủ. Mỗi TC không hợp lệ chỉ chứa **đúng 1** lớp không hợp lệ.

## 3.5 Cách thực thi và hậu kiểm

- **API:** gọi endpoint tương ứng với header `Authorization` theo cột Quyền.
- **UI:** đăng nhập Admin `:5174` → tab **Sản phẩm** → điền form và bấm **Lưu sản phẩm**, hoặc bấm **Sửa** / **Xóa** trên dòng của SP.
- **Hậu kiểm (cả hai kênh):**
  - Chụp `GET /api/products` trước và sau mỗi TC.
  - Thêm: tìm SP theo mô tả `F15-<TC>-<kênh>`.
  - Sửa/Xóa: so sánh **từng** SP còn lại với ảnh chụp trước.
  - Với UI: đọc thêm bảng sản phẩm **ngay trên màn hình** sau khi lưu, vì người dùng nhìn thấy bảng này (C8).
- **Thứ tự chạy:** EP-01 đến EP-03 (hợp lệ) chạy trước để kiểm tra masking.
