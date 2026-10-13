# HW02 – Domain Testing on EShop

Môn Kiểm thử phần mềm (CS423 / CSC15003) – FIT@HCMUS, 2026.

## 1. Thành viên & Phân công tính năng (Feature Assignment)

Nhóm thực hiện kiểm thử hệ thống **EShop** (`https://github.com/ttbhanh/eshop-sut`). Mỗi thành viên phụ trách 4 tính năng độc lập (1 tính năng từ mỗi Pool), cam kết không trùng lặp:

| STT | Họ và tên | MSSV | Pool A (Auth/Catalog) | Pool B (Cart/Checkout) | Pool C (Web Admin) | Pool D (Mobile App) |
|:---:|---|:---:|---|---|---|---|
| 1 | **Phạm Quang Vinh** | 23120202 | **FR-01**: Đăng ký tài khoản | **FR-09**: Mã giảm giá | **FR-15**: CRUD Sản phẩm | **FR-20**: Mobile - Giỏ hàng & Số lượng |
| 2 | *(Thành viên 2)* | | **FR-02**: Đăng nhập & Khóa TK | **FR-07**: Giỏ hàng Web | **FR-14**: CRUD Danh mục | **Mobile FR-01**: Đăng ký Mobile |
| 3 | *(Thành viên 3)* | | **FR-04**: Quản lý hồ sơ | **FR-08**: Thanh toán Web | **FR-17**: CRUD Coupon Admin | **Mobile FR-02/04**: Đăng nhập & Hồ sơ |
| 4 | *(Thành viên 4)* | | **FR-03**: Quên/Đặt lại MK | **FR-10**: Máy trạng thái đơn | **FR-16**: Import CSV | **Mobile FR-08/09**: Checkout & Coupon |
| 5 | *(Thành viên 5)* | | **FR-06**: Chi tiết sản phẩm | **FR-11**: Lịch sử đơn hàng | **FR-19**: Quản lý user Admin | **Mobile FR-10**: Hủy đơn hàng Mobile |

*Chi tiết phạm vi và ràng buộc kiểm thử từng tính năng xem tại:* [`docs/group_feature_assignment.md`](docs/group_feature_assignment.md)

---

## 2. Quy ước báo cáo lỗi (Bug Reporting on GitHub Issues)

Toàn bộ lỗi phát hiện được báo cáo tập trung tại tab **Issues** của repository này:

* **Định dạng tiêu đề:** `[Mã_FR] [Mã_TC] Tóm tắt ngắn gọn lỗi`
  * *Ví dụ:* `[FR-09] [TC_BVA_03] Không áp dụng được coupon khi tổng tiền bằng đúng min_order_amount`
* **Nội dung Issue gồm 5 mục:**
  1. **Tính năng & Kỹ thuật áp dụng**: (Domain Testing / BVA)
  2. **Các bước tái hiện (Steps to Reproduce)**
  3. **Kết quả mong đợi (Expected Result)** (theo tài liệu SRS EShop)
  4. **Kết quả thực tế (Actual Result)** (kèm ảnh chụp màn hình minh chứng)
  5. **Mức độ nghiêm trọng (Severity)**: Critical / Major / Minor

---

## 3. Báo cáo tóm tắt kiểm thử (Test Summary Report)

* **Số lượng tính năng kiểm thử:** 4 (FR-01, FR-09, FR-15, FR-20 Mobile)
* **Số test case thiết kế:** 0 *(sẽ cập nhật sau khi hoàn thiện)*
* **Số test case thực thi:** 0
* **Số test case Pass:** 0
* **Số test case Fail:** 0
* **Tổng số Bug phát hiện:** 0
* **Video Demo Agent Skills:** *(Đính kèm link YouTube)*

---

## 4. Bảng tự đánh giá (Self-Assessment Table)

| STT | Tiêu chí đánh giá | Điểm tối đa | Điểm tự đánh giá | Minh chứng hoàn thành |
|:---:|---|:---:|:---:|---|
| 1 | Feature A - FR-01 (Domain + Boundary) | 25 | | `features/FR-01_Register/` |
| 2 | Feature B - FR-09 (Domain + Boundary) | 25 | | `features/FR-09_Coupon/` |
| 3 | Feature C - FR-15 (Domain + Boundary) | 25 | | `features/FR-15_ProductCRUD/` |
| 4 | Feature D - Mobile FR-20 (Domain + Boundary) | 15 | | `features/FR-20_Mobile_Cart/` |
| 5 | Agent Skills (kèm video demo) | 10 | | `skills/`, link YouTube |
| **Tổng cộng** | | **100** | | |
