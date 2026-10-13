# HW02 – Domain Testing on EShop

Môn Kiểm thử phần mềm – FIT@HCMUS, 2026.

- **Sinh viên:** Phạm Quang Vinh – **MSSV:** 23120202
- **SUT:** EShop (`https://github.com/ttbhanh/eshop-sut`)
- **Kỹ thuật:** Phân hoạch tương đương (Equivalence Partitioning – EP) & Phân tích giá trị biên (Boundary Value Analysis – BVA)
- **Công cụ AI:** Claude Code (Claude Opus 5.5) – xem `ai-audit/`

## 1. Tính năng được chọn

| Pool | Mã | Tính năng | Kênh kiểm thử | Thư mục |
|---|---|---|---|---|
| A – Auth/Catalog | **FR-01** | Đăng ký tài khoản | Web `/register` + API `POST /api/register` | [`features/FR-01_Register/`](features/FR-01_Register/) |
| B – Cart/Checkout | **FR-09** | Mã giảm giá (Coupon) | Web `/checkout` + API `POST /api/apply-coupon` | [`features/FR-09_Coupon/`](features/FR-09_Coupon/) |
| C – Web Admin | **FR-15** | Quản lý sản phẩm (CRUD) | Admin `:5174` + API `/api/products` | [`features/FR-15_ProductCRUD/`](features/FR-15_ProductCRUD/) |
| D – Mobile | **FR-20** | Mobile – Giỏ hàng & Số lượng | App Expo (`frontend-mobile`) | [`features/FR-20_Mobile_Cart/`](features/FR-20_Mobile_Cart/) |

## 2. Quy trình áp dụng cho mỗi tính năng

Mỗi bước tương ứng 1 file trong thư mục tính năng và 1 git commit (xem `git_commit_log.txt`):

1. `01_input_output.md` – Xác định Input & Output (EP – Bước 1)
2. `02_equivalence_classes.md` – Xác định lớp tương đương (EP – Bước 2)
3. `03_ep_test_cases.md` – Xác định ca kiểm thử + bảng rút gọn (EP – Bước 3)
4. `04_bva_test_cases.md` – Phân tích giá trị biên
5. `05_test_execution.md` – Thực thi, kết quả thực tế, screenshots
6. `06_bug_report.md` – Báo cáo lỗi (đồng bộ lên GitHub Issues)
7. `07_ai_gap_analysis.md` – Phân tích những gì AI bỏ sót

## 3. Quy ước báo cáo lỗi (GitHub Issues)

- **Tiêu đề:** `[Mã_FR] [Mã_TC] Tóm tắt ngắn gọn lỗi`
  - Ví dụ: `[FR-09] [BVA-03] Không áp dụng được coupon khi tổng tiền bằng đúng min_order_amount`
- **Nội dung:** Tính năng & kỹ thuật · Bước tái hiện · Kết quả mong đợi (theo SRS) · Kết quả thực tế (kèm screenshot) · Mức độ nghiêm trọng (Critical / Major / Minor)

## 4. Báo cáo tóm tắt kiểm thử (Test Summary Report)

| Tính năng | TC thiết kế | Đã thực thi | Pass | Fail | Chưa thực thi | Bug |
|---|---|---|---|---|---|---|
| FR-01 | 42 (19 EP + 21 BVA + 2 bổ sung) | 42 | 1 | 41 | 0 | 7 |
| FR-09 | – | – | – | – | – | – |
| FR-15 | – | – | – | – | – | – |
| FR-20 Mobile | – | – | – | – | – | – |
| **Tổng** | – | – | – | – | – | – |

- **Video demo Agent Skills:** *(link YouTube)*

## 5. Bảng tự đánh giá (Self-Assessment)

| STT | Tiêu chí | Điểm tối đa | Tự đánh giá | Minh chứng |
|:---:|---|:---:|:---:|---|
| 1 | Feature A – FR-01 (Domain + Boundary) | 25 | | `features/FR-01_Register/` |
| 2 | Feature B – FR-09 (Domain + Boundary) | 25 | | `features/FR-09_Coupon/` |
| 3 | Feature C – FR-15 (Domain + Boundary) | 25 | | `features/FR-15_ProductCRUD/` |
| 4 | Feature D – FR-20 Mobile (Domain + Boundary) | 15 | | `features/FR-20_Mobile_Cart/` |
| 5 | Agent Skills (kèm video demo) | 10 | | `skills/` |
| | **Tổng cộng** | **100** | | |
