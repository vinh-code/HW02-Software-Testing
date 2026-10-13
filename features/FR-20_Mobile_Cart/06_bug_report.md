# FR-20 Mobile: Giỏ hàng & Số lượng, Bước 6: Báo cáo lỗi

**Môi trường chung:** `eshop-sut/frontend-mobile` `85af3ba` (Expo SDK 54), chạy bằng Expo Web, mô phỏng Pixel 5 (Playwright/Chromium 131). Backend `localhost:3000`, DB seed. Thời điểm phát hiện: 2026-10-13. Chi tiết môi trường ở [05_test_execution.md §5.1](05_test_execution.md).

| Bug ID | Tiêu đề | Severity | Priority | TC phát hiện | Issue |
|---|---|---|---|---|---|
| BUG-FR20-01 | Sửa số lượng trong giỏ bị lưu thành **n + 1** (nhập 5 được 6, nhập 1 được 2) | **Critical** | P1 | EP-04, BVA-07, BVA-08, BVA-09, EP-16R | [#23](https://github.com/vinh-code/HW02-Software-Testing/issues/23) |
| BUG-FR20-02 | Dòng giỏ hàng không có nút **+ / −** để chỉnh số lượng | Major | P2 | EP-05, BVA-10, BVA-11, BVA-12 | [#24](https://github.com/vinh-code/HW02-Software-Testing/issues/24) |
| BUG-FR20-03 | Bấm **Xóa** sản phẩm trong giỏ xóa ngay, không có dialog xác nhận | Major | P2 | EP-06, EP-07 | [#25](https://github.com/vinh-code/HW02-Software-Testing/issues/25) |
| BUG-FR20-04 | Số lượng không hợp lệ (0, âm, thập phân, chữ, rỗng) bị âm thầm đổi thành 1, không có thông báo | Minor | P3 | EP-09…EP-15, EP-17, EP-18, BVA-02, BVA-06 | [#26](https://github.com/vinh-code/HW02-Software-Testing/issues/26) |
| BUG-FR20-05 | Nhãn tổng tiền là "Tổng tạm tính" thay vì "Tổng cộng" | Minor | P3 | EP-01 | [#27](https://github.com/vinh-code/HW02-Software-Testing/issues/27) |
| BUG-FR20-06 | Giỏ hàng trống không có hình minh họa | Minor | P4 | EP-08 | [#28](https://github.com/vinh-code/HW02-Software-Testing/issues/28) |

---

## BUG-FR20-01: Sửa số lượng trong giỏ bị lưu thành n + 1 (nhập 5 được 6, nhập 1 được 2)

- **Tính năng & kỹ thuật:** FR-20/FR-07, EP với lớp EC7 (SL hợp lệ trong giỏ); BVA trên biến V2 tại LB, LB+1 và giá trị lớn.
- **Severity:** Critical. Số lượng và **tổng tiền sai** so với ý người dùng. Người dùng **không thể** đặt SL = 1 bằng cách nhập trong giỏ. Khi gõ trên bàn phím điện thoại, muốn 5 thì nhận được **16**.

**Các bước tái hiện**
1. Mở app EShop Mobile. Ở danh sách, bấm **Thêm vào giỏ** cho "Bàn phím cơ Keychron Q1" (4.000.000 ₫).
2. Bấm **Giỏ (1)**.
3. Ở ô **Số lượng** của dòng, thay giá trị bằng `5`.
4. *(Cách nhập như trên điện thoại)* Chạm vào ô, bấm Backspace một lần, rồi gõ `5`.

**Kết quả mong đợi:** Bước 3: SL 5, Thành tiền 20.000.000 ₫. Bước 4: SL 5.

**Kết quả thực tế:**
- Bước 3: ô hiện **6**, Thành tiền **24,000,000 ₫**, Tổng **24,000,000 ₫**.
- Bước 4: Backspace làm ô **nhảy lại 1**, gõ 5 thì thành **16**.

Các điểm biên khác: nhập 1 → 2, nhập 2 → 3, nhập 999 → 1000 (4.000.000.000 ₫).

**Minh chứng:** [EP-04_mobile.png](screenshots/EP-04_mobile.png), [BVA-07_mobile.png](screenshots/BVA-07_mobile.png), [BVA-09_mobile.png](screenshots/BVA-09_mobile.png), [PROBE_typing_mobile.png](screenshots/PROBE_typing_mobile.png)

---

## BUG-FR20-02: Dòng giỏ hàng không có nút + / − để chỉnh số lượng

- **Tính năng & kỹ thuật:** FR-07 R3 ("Số lượng (có nút +/- để chỉnh)"), EP với lớp EC13; BVA biến V3.
- **Severity:** Major. Thiếu chức năng được spec yêu cầu. Kết hợp với BUG-FR20-01, người dùng **không còn cách nào** để chỉnh đúng số lượng trong giỏ.

**Các bước tái hiện:** thêm 1 sản phẩm vào giỏ → mở **Giỏ** → quan sát dòng sản phẩm.

**Kết quả mong đợi:** Mỗi dòng có nút **−** và **+** quanh ô số lượng. − không giảm xuống dưới 1.

**Kết quả thực tế:** Dòng chỉ có tên, "Giá", ô "Số lượng", "Thành tiền" và nút "Xóa". Không có nút +/−.

**Minh chứng:** [EP-05_mobile.png](screenshots/EP-05_mobile.png)

---

## BUG-FR20-03: Bấm Xóa sản phẩm trong giỏ xóa ngay, không có dialog xác nhận

- **Tính năng & kỹ thuật:** FR-07 R5, EP với các lớp EC16 (Đồng ý) và EC17 (Hủy).
- **Severity:** Major. Chạm nhầm là mất sản phẩm, và không có cách hoàn tác. Trên điện thoại, chạm nhầm rất dễ xảy ra.

**Các bước tái hiện:** thêm 1 sản phẩm → mở **Giỏ** → bấm **Xóa**.

**Kết quả mong đợi:** Hiện hộp thoại "Bạn có chắc muốn xóa?" với 2 lựa chọn Đồng ý / Hủy.

**Kết quả thực tế:** Dòng biến mất **ngay lập tức** và giỏ chuyển sang trạng thái trống.
- **Lưu ý về môi trường:** trên Expo Web, `Alert.alert` không hiển thị. Nhưng nếu app có bước xác nhận bằng Alert, callback xóa sẽ không bao giờ được gọi và dòng phải **còn nguyên**.
- Việc dòng bị xóa ngay chứng tỏ thao tác xóa **không đi qua** bất kỳ bước xác nhận nào. Nên kiểm tra lại trên thiết bị thật.

**Minh chứng:** [EP-06_mobile.png](screenshots/EP-06_mobile.png), [EP-07_mobile.png](screenshots/EP-07_mobile.png)

---

## BUG-FR20-04: Số lượng không hợp lệ bị âm thầm đổi thành 1, không có thông báo

- **Tính năng & kỹ thuật:** FR-06 R1 ("chỉ nhận số nguyên dương, tối thiểu là 1"). EP với các lớp EC2–EC6 (trang chi tiết) và EC8–EC12 (trong giỏ); BVA tại LB−1 = 0 của V1, V2. Đánh giá theo giả định A1.
- **Severity:** Minor. Giỏ vẫn ở trạng thái hợp lệ (SL ≥ 1), nhưng khác với giá trị người dùng nhập mà không báo gì.

**Các bước tái hiện**
1. Mở chi tiết "Bàn phím cơ Keychron Q1", nhập Số lượng `0` (hoặc `-2`, `1.5`, `abc`, để trống) → **Thêm vào giỏ hàng**.
2. Trong giỏ có dòng SL = 2, sửa ô Số lượng thành `0` (hoặc `-2`, `abc`, xóa trắng).

**Kết quả mong đợi:** Ô không nhận ký tự không hợp lệ, hoặc có thông báo "Số lượng phải là số nguyên ≥ 1". Giỏ giữ nguyên.

**Kết quả thực tế**
1. Ô nhận mọi ký tự (kể cả `abc`). Nút đổi thành "Đã thêm", và giỏ có sản phẩm với **SL 1**.
2. Ô lập tức đổi thành **1**, SL giảm từ 2 xuống 1, không có thông báo nào. Riêng `1.5` cho kết quả 2, do lỗi "+1" của BUG-FR20-01.

**Minh chứng:** [EP-09_mobile.png](screenshots/EP-09_mobile.png), [EP-12_mobile.png](screenshots/EP-12_mobile.png), [EP-14_mobile.png](screenshots/EP-14_mobile.png), [EP-17_mobile.png](screenshots/EP-17_mobile.png)

---

## BUG-FR20-05: Nhãn tổng tiền là "Tổng tạm tính" thay vì "Tổng cộng"

- **Tính năng & kỹ thuật:** FR-07 R7, EP với lớp đầu ra EC19.
- **Severity:** Minor

**Các bước tái hiện:** thêm sản phẩm bất kỳ → mở **Giỏ** → xem dòng tổng phía dưới.

**Kết quả mong đợi:** "Tổng cộng: 12,000,000 ₫".

**Kết quả thực tế:** "**Tổng tạm tính**: 12,000,000 ₫". Spec ghi rõ "(không phải 'Tổng tạm tính')".

**Minh chứng:** [EP-01_mobile.png](screenshots/EP-01_mobile.png)

---

## BUG-FR20-06: Giỏ hàng trống không có hình minh họa

- **Tính năng & kỹ thuật:** FR-07 R8, EP với lớp EC18 (giả định A4).
- **Severity:** Minor

**Các bước tái hiện:** mở app → bấm **Giỏ (0)**.

**Kết quả mong đợi:** Hình minh họa giỏ trống, thông báo, nút Tiếp tục mua sắm.

**Kết quả thực tế:** Có thông báo "Giỏ hàng của bạn đang trống" và link "Tiếp tục mua sắm", nhưng **không có hình ảnh** nào (0 phần tử ảnh).

**Minh chứng:** [EP-08_mobile.png](screenshots/EP-08_mobile.png)

---

## Quan sát ngoài phạm vi (không tính là bug của tính năng này)

- Nút **Tiến hành thanh toán** màu xanh lá (FR-21: nút tích cực màu xanh dương).
- Badge header "Giỏ (n)" đếm **số dòng**, không đếm tổng số lượng. Spec không quy định nên chỉ ghi nhận.
