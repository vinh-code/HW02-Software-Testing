# FR-15 Quản lý sản phẩm (CRUD): Bước 5, Thực thi kiểm thử

## 5.1 Môi trường

| Mục | Giá trị |
|---|---|
| Thời điểm chạy | 2026-10-13 14:29 (GMT+7). Dữ liệu thô: [`results_fr15.json`](results_fr15.json) |
| SUT | `eshop-sut` commit `85af3ba`. Backend `:3000`, Admin `:5174`, Web `:5173` |
| Trạng thái DB | Khởi động lại backend ngay trước khi chạy (5 SP seed id 1–5, 3 danh mục) |
| Trình duyệt | Chromium 131 (headless) qua Playwright 1.49.1 |
| Script | [`scripts/fr15_products.js`](../../scripts/fr15_products.js); thăm dò bổ sung [`scripts/fr15_mass_rename_probe.js`](../../scripts/fr15_mass_rename_probe.js) |
| Nhận diện bản ghi | Mô tả = `F15-<TC>-<kênh>`. SP cần sửa/xóa được tạo riêng với tên `F15 target F15-<TC>-<kênh>` |
| Hậu kiểm | `GET /api/products` trước và sau mỗi TC. So sánh **từng** SP khác SP đích. Với UI, đọc thêm cột "Tên SP" trên màn hình sau khi lưu |

**Tiêu chí Pass/Fail**
- **O1a:** API 2xx và có đúng 1 SP mới mang mô tả của TC, đúng tên/giá/danh mục.
- **O1b:** SP đích có giá trị mới. **Không** SP nào khác thay đổi, xét cả trong CSDL lẫn trên bảng UI.
- **O1c:** SP đích không còn, các SP khác giữ nguyên.
- **O2:** API 4xx (UI: có thông báo lỗi/bị chặn), và CSDL **không** thay đổi.

## 5.2 Kiểm tra masking

Các TC hợp lệ EP-01 (Thêm), EP-02 (Sửa), EP-03 (Xóa) được chạy trước. Kết quả: Thêm và Xóa Pass trên cả hai kênh. Sửa Pass ở tầng API/CSDL, nhưng Fail ở bảng UI (xem BUG-FR15-02).

Bộ giá trị nền được chấp nhận, nên các TC không hợp lệ phía sau **không bị masking**: nếu một TC bị từ chối, nguyên nhân chỉ có thể là lớp không hợp lệ đang test. Thực tế gần như không TC không hợp lệ nào bị từ chối.

## 5.3 Kết quả: Phân hoạch tương đương (22 TC)

| TC | Thao tác | Dữ liệu (khác nền) | Mong đợi | API: thực tế | API | UI: thực tế | UI | KQ |
|---|---|---|---|---|---|---|---|---|
| EP-01 | Thêm | – | O1a | 200, tạo SP đúng dữ liệu | Pass | tạo SP đúng dữ liệu | Pass | Pass [ảnh](screenshots/EP-01_ui.png) |
| EP-02 | Sửa | tên `…(đã sửa)`, giá 1.600.000 | O1b | 200, SP đích đổi đúng, 0 SP khác đổi | Pass | CSDL đúng, nhưng **bảng UI hiển thị cả 7 SP khác mang tên mới** | Fail | Fail [ảnh](screenshots/EP-02_ui.png) |
| EP-03 | Xóa | – | O1c | 200, SP bị xóa, 0 SP khác đổi | Pass | như API (không có hộp thoại xác nhận) | Pass | Pass [ảnh](screenshots/EP-03_ui.png) |
| EP-04 | Thêm | tên chứa HTML/tiếng Việt | O1a + O1d | 200, tên lưu nguyên văn (71 ký tự) | Pass | Tên hiển thị dạng chữ ở Admin, trang chủ, trang chi tiết; `window.__xss15` không được gán | Pass | Pass [admin](screenshots/EP-04_ui.png), [web](screenshots/EP-04_web_detail.png) |
| EP-05 | Thêm | giá 1500.5 | O1a | 200, giá 1500.5 | Pass | như API | Pass | Pass [ảnh](screenshots/EP-05_ui.png) |
| EP-06 | Thêm | tên `""` | O2 | **200, tạo SP tên rỗng** | Fail | HTML5 chặn "Please fill out this field." | Pass | Fail [ảnh](screenshots/EP-06_ui.png) |
| EP-07 | Thêm | tên `"   "` | O2 | **200, tạo SP** | Fail | **tạo SP** | Fail | Fail [ảnh](screenshots/EP-07_ui.png) |
| EP-08 | Thêm | tên 300 ký tự | O2 | **200, tạo SP tên 300 ký tự** | Fail | **tạo SP** | Fail | Fail [ảnh](screenshots/EP-08_ui.png) |
| EP-09 | Thêm | giá `""` | O2 | **200, tạo SP, giá `""`** | Fail | **tạo SP, giá `""`** | Fail | Fail [ảnh](screenshots/EP-09_ui.png) |
| EP-10 | Thêm | giá 0 | O2 | **200, tạo SP giá 0** | Fail | **tạo SP giá 0** | Fail | Fail [ảnh](screenshots/EP-10_ui.png) |
| EP-11 | Thêm | giá -1000 | O2 | **200, tạo SP giá -1.000** | Fail | **tạo SP giá -1.000** | Fail | Fail [ảnh](screenshots/EP-11_ui.png) |
| EP-12 | Thêm | giá `"abc"` | O2 | **200, tạo SP, giá `"abc"`** | Fail | Ô Giá không nhận chữ (giá trị = `""`), nhưng form vẫn lưu SP với giá rỗng | Fail | Fail [ảnh](screenshots/EP-12_ui.png) |
| EP-13 | Thêm | DM `null` | O2 | **200, tạo SP không có danh mục** | Fail | không áp dụng | – | Fail |
| EP-14 | Thêm | DM 999 | O2 | **200, tạo SP thuộc DM 999 (không tồn tại)** | Fail | không áp dụng | – | Fail |
| EP-15 | Sửa | id 99999 | O2: 404 | **200 `"Product updated"`** dù SP không tồn tại | Fail | không áp dụng | – | Fail |
| EP-16 | Xóa | id 99999 | O2: 404 | **200 `"Product deleted"`** dù SP không tồn tại | Fail | không áp dụng | – | Fail |
| EP-17 | Thêm | **không token** | O2: 401 | **200, tạo SP** | Fail | không áp dụng | – | Fail |
| EP-18 | Thêm | **token user thường** | O2: 403 | **200, tạo SP** | Fail | không áp dụng | – | Fail |
| EP-19 | Sửa | **không token** | O2: 401 | **200, SP bị đổi tên** thành "Bị sửa khi không có token" | Fail | không áp dụng | – | Fail |
| EP-20 | Xóa | **không token** | O2: 401 | **200, SP bị xóa** | Fail | không áp dụng | – | Fail |
| EP-21 | Sửa | tên `""` | O2 | **200, SP đổi thành tên rỗng** | Fail | HTML5 chặn, SP giữ nguyên | Pass | Fail [ảnh](screenshots/EP-21_ui.png) |
| EP-22 | Sửa | giá 0 | O2 | **200, SP đổi giá thành 0** | Fail | **SP đổi giá thành 0**, bảng UI còn đổi tên 17 SP khác | Fail | Fail [ảnh](screenshots/EP-22_ui.png) |

## 5.4 Kết quả: Phân tích giá trị biên (13 TC)

| TC | Thao tác | Biến, điểm | Giá trị | Mong đợi | API | UI | Ghi chú | KQ |
|---|---|---|---|---|---|---|---|---|
| BVA-01 | Thêm | nominal | len 24, giá 1.500.000 | O1a | Pass | Pass | | Pass [ảnh](screenshots/BVA-01_ui.png) |
| BVA-02 | Thêm | V1 LB−1 | **len 0** | O2 | Fail: 200, tạo SP | Pass: HTML5 chặn | Validation chỉ có ở client | Fail [ảnh](screenshots/BVA-02_ui.png) |
| BVA-03 | Thêm | V1 **LB** | **len 1** | O1a | Pass | Pass | | Pass [ảnh](screenshots/BVA-03_ui.png) |
| BVA-04 | Thêm | V1 LB+1 | len 2 | O1a | Pass | Pass | | Pass [ảnh](screenshots/BVA-04_ui.png) |
| BVA-05 | Thêm | V1 UB−1 | len 254 | O1a | Pass | Pass | | Pass [ảnh](screenshots/BVA-05_ui.png) |
| BVA-06 | Thêm | V1 **UB** | **len 255** | O1a, đủ 255 ký tự | Pass | Pass | Lưu đủ 255 ký tự | Pass [ảnh](screenshots/BVA-06_ui.png) |
| BVA-07 | Thêm | V1 UB+1 | **len 256** | O2 | Fail: 200, tạo SP 256 ký tự | Fail: tạo SP | Không có giới hạn trên | Fail [ảnh](screenshots/BVA-07_ui.png) |
| BVA-08 | Thêm | V2 LB−1 | **giá 0** | O2 | Fail: 200, tạo SP | Fail: tạo SP | | Fail [ảnh](screenshots/BVA-08_ui.png) |
| BVA-09 | Thêm | V2 **LB** | **giá 1** | O1a | Pass | Pass | | Pass [ảnh](screenshots/BVA-09_ui.png) |
| BVA-10 | Thêm | V2 LB+1 | giá 2 | O1a | Pass | Pass | | Pass [ảnh](screenshots/BVA-10_ui.png) |
| BVA-11 | Thêm | V2 độ bền | **giá 2.147.483.648** | O1a, không tràn số | Pass | Pass | Lưu đúng 2147483648. Bảng Admin hiển thị `2147483648 ₫`, không có phân cách hàng nghìn (FR-21, ngoài phạm vi) | Pass [ảnh](screenshots/BVA-11_ui.png) |
| BVA-12 | Sửa | V1 **UB** | **len 255** | O1b | Pass | Fail: bảng UI đổi tên 54 SP khác | CSDL đúng, hiển thị sai | Fail [ảnh](screenshots/BVA-12_ui.png) |
| BVA-13 | Sửa | V1 UB+1 | **len 256** | O2 | Fail: 200, SP đổi tên 256 ký tự | Fail | | Fail [ảnh](screenshots/BVA-13_ui.png) |

**Phân tích theo biến:**
- **V1 (độ dài tên):** chỉ có **biên dưới** được kiểm soát, và chỉ ở **client** (HTML5 `required`). Biên trên 255 không được kiểm soát ở đâu cả: 256 và 300 ký tự đều được lưu.
- **V2 (giá):** không có biên nào được kiểm soát. 0, số âm, rỗng, chữ đều được lưu. Tại LB/LB+1, kết quả Pass chỉ vì đó là giá trị hợp lệ.

## 5.5 Thăm dò bổ sung: hậu quả của lỗi bảng UI (BUG-FR15-02)

EP-02 cho thấy CSDL đúng, chỉ bảng hiển thị sai. Để đánh giá mức độ nghiêm trọng, mình chạy thêm một kịch bản admin làm việc bình thường ([`fr15_mass_rename_probe.js`](../../scripts/fr15_mass_rename_probe.js)):

1. Sửa SP id 2: đổi tên thành "Samsung Galaxy S24 Ultra (giảm giá)" → Lưu. Bảng đổi tên **mọi** SP ([ảnh](screenshots/BUG-FR15-02_step1_table_after_edit.png)).
2. Bấm **Sửa** ở dòng đầu tiên (SP id 1, iPhone). Form điền sẵn tên **sai** "Samsung Galaxy S24 Ultra (giảm giá)". Admin chỉ đổi giá thành 29.000.000 → Lưu ([ảnh](screenshots/BUG-FR15-02_step2_edit_iphone_form.png)).
3. Kết quả trong CSDL: SP id 1 đổi từ `iPhone 15 Pro Max` thành **`Samsung Galaxy S24 Ultra (giảm giá)`**. Sau khi tải lại trang, hai dòng đầu đều mang tên Samsung ([ảnh](screenshots/BUG-FR15-02_step3_after_reload.png)).

→ Lỗi hiển thị dẫn tới **hỏng dữ liệu thật** trong một thao tác rất bình thường của admin.

## 5.5b TC bổ sung sau AI gap analysis (chạy 2026-10-13, script [`scripts/fr15_supplementary.js`](../../scripts/fr15_supplementary.js))

Hai lớp/điểm mới được thêm ở [Bước 7](07_ai_gap_analysis.md). Dữ liệu thô: [`results_fr15_supplementary.json`](results_fr15_supplementary.json).

| TC | Lớp / điểm mới | Dữ liệu | Mong đợi | Thực tế | KQ |
|---|---|---|---|---|---|
| EP-23 | EC22: Sửa **thiếu trường** (trường vắng mặt, khác với chuỗi rỗng) | `PUT /api/products/<id>` body `{"price":1700000}` | O2 (thiếu tên/danh mục bắt buộc), hoặc chỉ đổi giá và giữ nguyên các trường khác | HTTP 200. Giá đổi, nhưng **tên, mô tả, ảnh, danh mục đều thành `null`** | Fail [ảnh](screenshots/BUG-FR15-07_api_after.png) |
| BVA-14 | V1 UB với **ký tự tiếng Việt có dấu** (kiểm tra giả định A2) | Tên 255 ký tự `Tai nghe chống ồn – …` (329 byte UTF-8), UI + API | O1a, lưu đủ 255 ký tự | Lưu đủ 255 ký tự trên cả hai kênh | Pass [ảnh](screenshots/BVA-14_ui.png) |

## 5.6 Tổng hợp

| Nhóm | Số TC | Pass | Fail | Không thực thi |
|---|---|---|---|---|
| EP | 22 | 4 (EP-01, 03, 04, 05) | 18 | 0 |
| BVA | 13 | 8 (BVA-01, 03, 04, 05, 06, 09, 10, 11) | 5 (BVA-02, 07, 08, 12, 13) | 0 |
| Bổ sung (gap) | 2 | 1 (BVA-14) | 1 (EP-23) | 0 |
| **Tổng** | **37** | **13** | **24** | **0** |

Theo kênh: API 35 lượt (14 Pass, 21 Fail), UI 27 lượt (15 Pass, 12 Fail). Có 27 ảnh UI, 2 ảnh trang web (EP-04) và 3 ảnh thăm dò.

**Nhận xét:** **Mọi TC Pass đều là TC hợp lệ.** Không một lớp không hợp lệ nào bị server từ chối. Toàn bộ khả năng từ chối của tính năng chỉ đến từ thuộc tính `required` của ô Tên trên UI.
