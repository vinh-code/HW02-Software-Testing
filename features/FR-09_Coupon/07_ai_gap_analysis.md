# FR-09 Mã giảm giá (Coupon): Bước 7, AI Gap Analysis

**Công cụ AI:** Claude Code (model Claude Opus 5.5), chạy trong terminal ngày 2026-10-13. Nhật ký đầy đủ: `ai-audit/`.

**Thay đổi so với FR-01:** áp dụng 2 bài học của [FR-01 §7.3](../FR-01_Register/07_ai_gap_analysis.md):
1. Prompt yêu cầu AI liệt kê **mọi yêu cầu liên quan trong toàn SRS** (FR-08, SEC-02, FR-17, FR-21).
2. Chạy TC hợp lệ trước để kiểm tra masking.

Kết quả là 2 bug Critical (BUG-FR09-03, BUG-FR09-05) được tìm thấy **ngay trong thiết kế EP ban đầu**, nhờ đối chiếu chéo với FR-08/SEC-02. Với FR-01, các lỗi tương tự chỉ lộ ra sau khi rà soát.

## 7.1 Những gì AI bỏ sót hoặc làm sai

| # | Gap | Loại | Phát hiện ở đâu | Nguyên nhân | Xử lý |
|---|---|---|---|---|---|
| G1 | Không có lớp **"`expired_at` là hôm nay nhưng có kèm giờ"**. AI coi `expired_at` là một ngày thuần, giống bảng coupon mẫu | Thiếu TC, **bỏ sót bug** | Rà soát sau thực thi: kiểm tra kiểu dữ liệu `expired_at` (DATETIME) và form Admin FR-17 | **Thiên lệch theo dữ liệu mẫu:** AI suy ra miền giá trị từ 4 dòng ví dụ trong SRS, thay vì từ miền mà Admin thực sự nhập được | Thêm EC22, TC EP-16 → Fail, ghi thành BUG-FR09-07 |
| G2 | Không có lớp đầu ra **"mức giảm > tổng đơn"**. AI đã **nhận ra** rủi ro này ở BVA §4.5 nhưng **gạt đi** với lý do "dữ liệu seed không tạo ra được" | Thiếu TC, **bỏ sót bug Major** | Rà soát sau thực thi | **Hạn chế của AI:** gắn miền kiểm thử với dữ liệu đang có. Thực tế FR-17 cho phép `min_order_amount = 0`, nên Admin hoàn toàn tạo được coupon kiểu này | Thêm EC23, TC EP-17 → Fail, ghi thành BUG-FR09-08 (đơn hàng tổng âm) |
| G3 | **Rò rỉ kiến thức hộp trắng.** Trước khi thiết kế, AI đã đọc mã nguồn backend (khi tìm hiểu SUT ở đầu buổi). Lớp EC17 (bỏ `user_id`) và sự chú ý đặc biệt vào biên `>=` có thể đã bị ảnh hưởng bởi những gì AI thấy trong code, chứ không chỉ từ spec | Sai phương pháp (black-box không thuần) | Sinh viên tự rà soát quy trình | **Ngữ cảnh của AI:** mọi thứ AI đã đọc đều nằm trong ngữ cảnh; AI không thể "quên" có chủ đích | Mỗi lớp nghi vấn đã được kiểm tra lại để có **căn cứ từ spec**: EC17 dựa vào SEC-02 và A5; biên `>=` được chính FR-09 nhấn mạnh. Ghi nhận như một giới hạn trong AI Critique |
| G4 | Giả định A1 (không phân biệt hoa/thường, bỏ khoảng trắng) và A2 (so theo ngày) là **diễn giải của AI** | Rủi ro đánh giá sai | Bước 1 | **Spec mơ hồ** | Bug phụ thuộc giả định (BUG-FR09-06, BUG-FR09-07) chỉ được xếp Minor và ghi rõ là phụ thuộc giả định |
| G5 | Hàm tạo user mới của AI **giả định email luôn duy nhất**. Lần chạy đầu của EP-17 dùng lại một email cũ, và vì BUG-FR01-03 (cho đăng ký email trùng), đăng nhập trả về tài khoản cũ đã dùng hết lượt. Kết quả là Fail giả ở kênh UI | Lỗi công cụ kiểm thử | Khi thực thi: kết quả API (thành công) và UI (hết lượt) mâu thuẫn nhau | **Hạn chế của AI:** không tính tới việc bug của tính năng khác ảnh hưởng tới dữ liệu kiểm thử | Chạy lại với email mới (hậu tố `r`), ghi chú ở §5.4b |
| G6 | Ở EP-11 trên UI, AI mở `/checkout` bằng **điều hướng phía client** (`history.pushState`). Người dùng thật gõ URL sẽ làm tải lại trang và mất giỏ hàng (giỏ chỉ nằm trong bộ nhớ) | Minh chứng yếu hơn | Rà soát kịch bản | Giỏ hàng web không được lưu lại, nên không còn đường nào khác để vào `/checkout` mà vẫn giữ giỏ | Ghi rõ cách tái hiện trong BUG-FR09-03. Phần API của bug không phụ thuộc điểm này |

## 7.2 Những gì AI làm tốt hơn so với FR-01

- **Kiểm tra masking ngay từ đầu** (§5.2). Khi thấy EP-01 Fail về số tiền, AI tách hai tiêu chí "quyết định" và "số tiền". Nhờ đó vẫn đánh giá đúng các điểm biên ngày hết hạn (BVA-09, BVA-10), dù công thức sai.
- **Hậu kiểm ở tầng dữ liệu:** kiểm tra đơn hàng thật trong Admin, chứng minh lỗi công thức gây thiệt hại thật (đơn 10.000.000 ₫ cho giỏ 1.000.000 ₫), không chỉ hiển thị sai.
- **BVA đúng chỗ:** BUG-FR09-02 (`>` thay vì `>=`) **chỉ** BVA phát hiện được. Các TC EP (200.000 và 1.000.000) đều Pass về quyết định.

## 7.3 Các TC vẫn chưa được thiết kế (rủi ro còn lại)

| Lớp chưa phủ | Lý do chưa làm |
|---|---|
| Áp mã hết hạn hôm nay trong khung 00:00–07:00 giờ VN (ngày được hiểu là 00:00 UTC) | Cần đổi giờ hệ thống hoặc chờ đúng khung giờ |
| Thanh toán qua API với `coupon_id` nhưng không gọi `/api/coupon-usage` | Lượt dùng chỉ được ghi khi **client** chủ động gọi API này, nên có thể né C5. Thuộc FR-08 nhiều hơn FR-09 |
| Hai tab áp cùng mã và thanh toán đồng thời | Kiểm thử đồng thời, ngoài phạm vi EP/BVA |
| Mã bị Admin xóa giữa lúc người dùng đang ở trang Checkout | Kiểm thử chuyển trạng thái |
| Kết quả `percent` có phần lẻ (giả định A3) | Không đánh giá được khi công thức đang sai hoàn toàn (BUG-FR09-01) |

## 7.4 Bài học

1. **Miền giá trị lấy từ đặc tả kiểu dữ liệu, không lấy từ dữ liệu mẫu.** Cả G1 và G2 đều do AI suy ra miền từ bảng ví dụ trong SRS. Khi prompt, nên yêu cầu AI xác định miền của từng thuộc tính theo **nơi nó được nhập** (form Admin FR-17), không theo dữ liệu seed.
2. **Rủi ro AI đã nêu ra thì phải thành TC hoặc được ghi rõ lý do loại.** Ở G2, AI nhận ra rủi ro nhưng tự gạt đi bằng một lý do sai.
3. **Bug của tính năng này có thể phá dữ liệu kiểm thử của tính năng khác** (G5). Khi kết quả hai kênh mâu thuẫn, phải nghi ngờ công cụ trước khi kết luận.
4. **Tách bạch kiến thức hộp trắng** (G3): nên cho AI thiết kế EP trong một phiên mới chỉ có SRS và API spec, rồi mới đọc code để xác nhận.
