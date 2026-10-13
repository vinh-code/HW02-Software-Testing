# FR-15 Quản lý sản phẩm (CRUD): Bước 6, Báo cáo lỗi

**Môi trường chung:** EShop `85af3ba`, Backend `localhost:3000`, Admin `localhost:5174`, Web `localhost:5173`, Chromium 131, DB seed mặc định. Thời điểm phát hiện: 2026-10-13.

| Bug ID | Tiêu đề | Severity | Priority | TC phát hiện | Issue |
|---|---|---|---|---|---|
| BUG-FR15-01 | API Thêm/Sửa/Xóa sản phẩm không yêu cầu đăng nhập và quyền admin | **Critical** | P1 | EP-17, EP-18, EP-19, EP-20 | [#16](https://github.com/vinh-code/HW02-Software-Testing/issues/16) |
| BUG-FR15-02 | Sửa 1 sản phẩm thì bảng Admin đổi tên **mọi** sản phẩm, lần sửa tiếp theo ghi tên sai vào CSDL | **Critical** | P1 | EP-02, EP-22, BVA-12, BVA-13 | [#17](https://github.com/vinh-code/HW02-Software-Testing/issues/17) |
| BUG-FR15-03 | Không kiểm tra giá: chấp nhận 0, số âm, rỗng, chữ (API và UI) | Major | P1 | EP-09, EP-10, EP-11, EP-12, EP-22, BVA-08 | [#18](https://github.com/vinh-code/HW02-Software-Testing/issues/18) |
| BUG-FR15-04 | Không kiểm tra tên: chấp nhận tên dài hơn 255 ký tự, tên chỉ có khoảng trắng; API chấp nhận tên rỗng | Major | P2 | EP-06, EP-07, EP-08, EP-21, BVA-02, BVA-07, BVA-13 | [#19](https://github.com/vinh-code/HW02-Software-Testing/issues/19) |
| BUG-FR15-05 | API chấp nhận danh mục rỗng hoặc không tồn tại | Major | P2 | EP-13, EP-14 | [#20](https://github.com/vinh-code/HW02-Software-Testing/issues/20) |
| BUG-FR15-06 | Sửa/Xóa sản phẩm không tồn tại vẫn trả về thành công (HTTP 200) | Minor | P3 | EP-15, EP-16 | [#21](https://github.com/vinh-code/HW02-Software-Testing/issues/21) |
| BUG-FR15-07 | Sửa sản phẩm mà thiếu trường trong request thì xóa trắng tên, mô tả, ảnh, danh mục | Major | P2 | EP-23 (TC bổ sung sau gap analysis) | [#22](https://github.com/vinh-code/HW02-Software-Testing/issues/22) |

---

## BUG-FR15-01: API Thêm/Sửa/Xóa sản phẩm không yêu cầu đăng nhập và quyền admin

- **Tính năng & kỹ thuật:** FR-15 kết hợp FR-12/SEC-02/SEC-03. EP với các lớp EC18 (không token) và EC19 (token user thường), kiểm tra trên cả 3 thao tác.
- **Severity:** Critical (bảo mật). **Bất kỳ ai** biết địa chỉ API đều có thể tạo, sửa giá, đổi tên hoặc xóa toàn bộ sản phẩm của cửa hàng mà không cần đăng nhập.

**Các bước tái hiện**
1. `POST /api/products` **không có** header `Authorization`, body `{"name":"SP tạo bởi người lạ","price":1000,"category_id":1}`.
2. `POST /api/products` với token của `test@eshop.com` (role `user`).
3. `PUT /api/products/<id>` không có token, body đổi tên.
4. `DELETE /api/products/6` không có token, rồi `GET /api/products/6`.

**Kết quả mong đợi (FR-12):** Bước 1, 3, 4 trả **401**. Bước 2 trả **403**. Dữ liệu không đổi.

**Kết quả thực tế:** Cả 4 request đều trả **HTTP 200**. Sản phẩm được tạo/đổi tên/xóa thật. `GET /api/products/6` trả `{}`.

**Minh chứng:** [BUG-FR15-01_api_create_no_token.png](screenshots/BUG-FR15-01_api_create_no_token.png), [BUG-FR15-01_api_create_user_token.png](screenshots/BUG-FR15-01_api_create_user_token.png), [BUG-FR15-01_api_delete_no_token.png](screenshots/BUG-FR15-01_api_delete_no_token.png), [BUG-FR15-01_api_after_delete.png](screenshots/BUG-FR15-01_api_after_delete.png)

---

## BUG-FR15-02: Sửa 1 sản phẩm thì bảng Admin đổi tên mọi sản phẩm, lần sửa tiếp theo ghi tên sai vào CSDL

- **Tính năng & kỹ thuật:** FR-15 ràng buộc R5 ("chỉ sản phẩm đó bị thay đổi"). EP với lớp đầu ra EC20, phát hiện nhờ hậu kiểm so sánh **toàn bộ** bảng trước/sau.
- **Severity:** Critical. Lỗi hiển thị dẫn tới **hỏng dữ liệu thật** trong thao tác bình thường của admin (xem bước 4–6).

**Các bước tái hiện**
1. Đăng nhập Admin `http://localhost:5174` (`admin@eshop.com`), mở tab **Sản phẩm**.
2. Bấm **Sửa** ở dòng "Samsung Galaxy S24 Ultra". Đổi tên thành `Samsung Galaxy S24 Ultra (giảm giá)` → **Lưu sản phẩm** → OK ở alert "Cập nhật thành công!".
3. Quan sát cột **Tên SP**.
4. Không tải lại trang, bấm **Sửa** ở dòng đầu tiên (iPhone 15 Pro Max, id 1).
5. Chỉ đổi Giá thành `29000000` → **Lưu sản phẩm**.
6. Tải lại trang (F5) và xem lại bảng.

**Kết quả mong đợi:** Bước 3: chỉ dòng Samsung đổi tên. Bước 4: form hiện tên "iPhone 15 Pro Max". Bước 6: SP id 1 vẫn tên "iPhone 15 Pro Max", giá 29.000.000.

**Kết quả thực tế**
- Bước 3: **mọi** dòng trong bảng đều mang tên `Samsung Galaxy S24 Ultra (giảm giá)`. Trong CSDL, chỉ SP được sửa thay đổi.
- Bước 4: form điền sẵn tên **sai** `Samsung Galaxy S24 Ultra (giảm giá)`.
- Bước 6: SP id 1 bị **đổi tên thật** trong CSDL thành `Samsung Galaxy S24 Ultra (giảm giá)`.

**Minh chứng:** [EP-02_ui.png](screenshots/EP-02_ui.png), [BUG-FR15-02_step1_table_after_edit.png](screenshots/BUG-FR15-02_step1_table_after_edit.png), [BUG-FR15-02_step2_edit_iphone_form.png](screenshots/BUG-FR15-02_step2_edit_iphone_form.png), [BUG-FR15-02_step3_after_reload.png](screenshots/BUG-FR15-02_step3_after_reload.png)

---

## BUG-FR15-03: Không kiểm tra giá, chấp nhận 0, số âm, rỗng, chữ (API và UI)

- **Tính năng & kỹ thuật:** FR-15 R3. EP với các lớp EC8–EC11; BVA tại LB−1 = 0 của V2. Kiểm tra trên cả Thêm và Sửa.
- **Severity:** Major. Sản phẩm giá 0 hoặc âm xuất hiện trên cửa hàng. Khách có thể "mua" với giá âm, và tổng đơn hàng bị sai.

**Các bước tái hiện**
1. Admin → **Sản phẩm** → Thêm: Tên `Tai nghe Sony WH-1000XM5`, Giá lần lượt `0`, `-1000`, để trống; Danh mục Laptop → **Lưu sản phẩm**.
2. Bấm **Sửa** một sản phẩm, đổi Giá thành `0` → **Lưu sản phẩm**.
3. API: `POST /api/products` (token admin) với `"price": -1000` và `"price": "abc"`.

**Kết quả mong đợi:** Từ chối và báo "Giá phải là số dương". Không tạo hay sửa sản phẩm.

**Kết quả thực tế:** Mọi trường hợp đều được lưu: giá `0`, `-1000`, `""`, `"abc"`. Ô Giá trên UI không có `required`/`min`. Với ô `type="number"`, gõ chữ thì ô thành rỗng, và form vẫn lưu SP với giá rỗng.

**Minh chứng:** [EP-10_ui.png](screenshots/EP-10_ui.png), [EP-11_ui.png](screenshots/EP-11_ui.png), [EP-22_ui.png](screenshots/EP-22_ui.png), [BUG-FR15-03_api_negative_price.png](screenshots/BUG-FR15-03_api_negative_price.png), [BUG-FR15-03_api_text_price.png](screenshots/BUG-FR15-03_api_text_price.png)

---

## BUG-FR15-04: Không kiểm tra tên, chấp nhận > 255 ký tự và chỉ khoảng trắng; API chấp nhận tên rỗng

- **Tính năng & kỹ thuật:** FR-15 R2. EP với các lớp EC3, EC4, EC5; BVA V1 tại LB−1 = 0 và UB+1 = 256, trên cả Thêm và Sửa.
- **Severity:** Major

**Các bước tái hiện**
1. Admin → Thêm: Tên là chuỗi **256** ký tự (`BVA15-xxx…`) → **Lưu sản phẩm**.
2. Thêm với Tên `"   "` (3 khoảng trắng).
3. API: `POST /api/products` (token admin) với `"name": ""`. Lặp lại với `PUT` trên một SP có sẵn.

**Kết quả mong đợi:** Từ chối cả 3 trường hợp, kèm thông báo "Tên bắt buộc, tối đa 255 ký tự".

**Kết quả thực tế**
- Tên 256 và 300 ký tự được lưu đầy đủ, không bị cắt hay báo lỗi. Trong khi đó 255 ký tự (UB) cũng lưu bình thường, tức là **không có biên trên**.
- Tên chỉ khoảng trắng được lưu trên cả UI lẫn API.
- Tên rỗng: UI chặn nhờ HTML5 `required`, nhưng **API chấp nhận** cả khi Thêm lẫn khi Sửa.

**Minh chứng:** [BVA-07_ui.png](screenshots/BVA-07_ui.png), [EP-07_ui.png](screenshots/EP-07_ui.png), [BUG-FR15-04_api_empty_name.png](screenshots/BUG-FR15-04_api_empty_name.png)

---

## BUG-FR15-05: API chấp nhận danh mục rỗng hoặc không tồn tại

- **Tính năng & kỹ thuật:** FR-15 R4, EP với các lớp EC13, EC14 (giả định A5)
- **Severity:** Major. Sản phẩm "mồ côi" không thuộc danh mục nào, nên không xuất hiện khi lọc theo danh mục.

**Các bước tái hiện:** `POST /api/products` (token admin) với `"category_id": 999`, rồi với `"category_id": null`.

**Kết quả mong đợi:** HTTP 400 "Danh mục không hợp lệ".

**Kết quả thực tế:** HTTP 200, sản phẩm được tạo với `category_id = 999` / `null`. Chỉ có dropdown trên UI ngăn được lỗi này.

**Minh chứng:** [BUG-FR15-05_api_category_999.png](screenshots/BUG-FR15-05_api_category_999.png)

---

## BUG-FR15-06: Sửa/Xóa sản phẩm không tồn tại vẫn trả về thành công (HTTP 200)

- **Tính năng & kỹ thuật:** FR-15, EP với lớp EC16 (giả định A6)
- **Severity:** Minor. Không làm hỏng dữ liệu, nhưng client nhận phản hồi "thành công" sai sự thật.

**Các bước tái hiện:** `PUT /api/products/99999` và `DELETE /api/products/99999` (token admin).

**Kết quả mong đợi:** HTTP 404 "Không tìm thấy sản phẩm".

**Kết quả thực tế:** HTTP 200 `{"message":"Product updated"}` / `{"message":"Product deleted"}`.

**Minh chứng:** [BUG-FR15-06_api_update_missing.png](screenshots/BUG-FR15-06_api_update_missing.png)

---

## BUG-FR15-07: Sửa sản phẩm mà thiếu trường trong request thì xóa trắng tên, mô tả, ảnh, danh mục

- **Tính năng & kỹ thuật:** FR-15 R2, R4, R5. EP với lớp bổ sung EC22 "thiếu trường khi Sửa" (xem [07_ai_gap_analysis.md](07_ai_gap_analysis.md)).
- **Severity:** Major. Một client chỉ muốn đổi giá (ví dụ một công cụ cập nhật giá hàng loạt) sẽ **mất dữ liệu** tên và danh mục của sản phẩm. Kết quả là một sản phẩm vi phạm R2/R4 tồn tại trong CSDL.

**Các bước tái hiện**
1. `GET /api/products/5`: SP "Bàn phím cơ Keychron Q1", danh mục 3.
2. `PUT /api/products/5` (token admin), body chỉ có `{"price": 4200000}`.
3. `GET /api/products/5`.

**Kết quả mong đợi:** Từ chối (HTTP 400, thiếu tên/danh mục bắt buộc), **hoặc** chỉ cập nhật giá và giữ nguyên các trường khác.

**Kết quả thực tế:** HTTP 200 `"Product updated"`. SP id 5 còn `price = 4200000`, nhưng `name`, `description`, `imageUrl`, `category_id` đều thành **`null`**.

**Minh chứng:** [BUG-FR15-07_api_before.png](screenshots/BUG-FR15-07_api_before.png), [BUG-FR15-07_api_partial_put.png](screenshots/BUG-FR15-07_api_partial_put.png), [BUG-FR15-07_api_after.png](screenshots/BUG-FR15-07_api_after.png)

---

## Quan sát ngoài phạm vi FR-15 (không tính là bug của tính năng này)

- Form không có dấu `*` cho các trường bắt buộc (FR-22). Nút **Lưu sản phẩm** màu xanh lá, **Sửa** màu vàng (FR-21: nút tích cực màu xanh dương).
- Cột Giá hiển thị `1500000 ₫`, không có phân cách hàng nghìn (FR-21).
- Nút **Xóa** xóa ngay, không có hộp thoại xác nhận. FR-15 không yêu cầu, nhưng đây là thao tác không hoàn tác được.
- Lỗi lưu được báo bằng `alert()` thay vì thông báo phía trên nút submit (FR-22).
