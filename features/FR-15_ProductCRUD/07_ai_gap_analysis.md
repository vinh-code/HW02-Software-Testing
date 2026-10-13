# FR-15 Quản lý sản phẩm (CRUD): Bước 7, AI Gap Analysis

**Công cụ AI:** Claude Code (model Claude Opus 5.5), chạy trong terminal ngày 2026-10-13. Nhật ký đầy đủ: `ai-audit/`.

**Các bài học đã áp dụng từ FR-01, FR-09:**
- Đối chiếu chéo toàn SRS (FR-12, SEC-02/03/04). Nhờ đó BUG-FR15-01 (Critical) được thiết kế sẵn trong EP.
- Có lớp tên tiếng Việt và HTML (EC2) ngay từ Bước 2.
- Chạy TC hợp lệ trước để kiểm tra masking.
- Hậu kiểm **toàn bộ** danh sách sản phẩm, không chỉ bản ghi của TC. Nhờ đó tìm ra BUG-FR15-02.

## 7.1 Những gì AI bỏ sót hoặc làm sai

| # | Gap | Loại | Phát hiện ở đâu | Nguyên nhân | Xử lý |
|---|---|---|---|---|---|
| G1 | Không phân biệt **"trường vắng mặt"** với **"trường rỗng"**. EC3 chỉ dùng `name: ""`, chưa bao giờ gửi request **thiếu hẳn** trường `name` khi Sửa | Thiếu TC, **bỏ sót bug Major** | Rà soát sau thực thi: đọc lại API spec (PUT dùng chung body với POST) | **Hạn chế của AI:** phân hoạch trên giá trị của trường, mà không phân hoạch trên **cấu trúc** của request. Ở API, "có mặt hay không" là một chiều độc lập | Thêm EC22, TC EP-23 → Fail, ghi thành BUG-FR15-07 (xóa trắng tên/danh mục) |
| G2 | Giả định A2 (đếm theo ký tự) đã nêu ra, nhưng mọi giá trị BVA đều **cố ý dùng ASCII để né** giả định này. Vì vậy biên 255 chưa từng được thử với ký tự nhiều byte | Thiếu điểm biên | Rà soát sau thực thi | **AI chọn cách an toàn** là tránh sự mơ hồ, thay vì kiểm thử nó | Thêm BVA-14 (255 ký tự tiếng Việt, 329 byte) → Pass |
| G3 | Ở EP-12 trên UI, AI dự kiến "ô số không nhận chữ" là đủ để Pass. Thực tế ô thành rỗng và form vẫn lưu, tức lớp EC11 trên UI **sụp thành** EC8 (giá rỗng). Một TC rơi vào 2 lớp | Thiết kế TC chưa chặt | Khi thực thi | **Thiếu hiểu biết về hành vi trình duyệt:** `type="number"` biến chữ thành chuỗi rỗng | Ghi rõ ở §5.3. Kết quả UI của EP-12 được giải thích là trùng EP-09 |
| G4 | **Rò rỉ kiến thức hộp trắng.** Lỗi đổi tên hàng loạt trên bảng Admin (BUG-FR15-02) đã lộ ra khi AI đọc mã nguồn frontend lúc tìm hiểu SUT. Yêu cầu so sánh **cả bảng UI** sau khi sửa có thể đã bị ảnh hưởng bởi điều này | Sai phương pháp | Sinh viên tự rà soát | **Ngữ cảnh của AI** chứa mã nguồn | Lớp EC20 có căn cứ trực tiếp từ R5 của spec ("các sản phẩm khác giữ nguyên"). Phần thăm dò §5.5 (hỏng dữ liệu thật) là phát hiện mới, không có sẵn trong code |
| G5 | Ban đầu AI xếp BUG-FR15-02 là **lỗi hiển thị** (Major). Chỉ khi thử thêm "thao tác tiếp theo của admin" mới thấy lỗi gây **hỏng dữ liệu thật**, và nâng lên Critical | Đánh giá severity thấp | Thăm dò §5.5 | **Hạn chế của AI:** đánh giá mức độ dựa trên trạng thái ngay sau TC, không xét chuỗi thao tác tiếp theo | Bổ sung kịch bản thăm dò và nâng severity |

## 7.2 Các TC vẫn chưa được thiết kế (rủi ro còn lại)

| Lớp chưa phủ | Lý do chưa làm |
|---|---|
| HTML/script trong **Mô tả** và **URL Ảnh** (SEC-04) | FR-15 không ràng buộc hai trường này. Chỉ kiểm tra tên |
| Ảnh hưởng dây chuyền của dữ liệu sai: SP giá âm/rỗng xuất hiện ở trang chủ, giỏ hàng, thanh toán | Thuộc FR-05/FR-07/FR-08. Nên test hồi quy sau khi sửa BUG-FR15-03 |
| Hai admin sửa cùng một SP đồng thời | Kiểm thử đồng thời |
| Xóa danh mục đang có sản phẩm (FR-14 ↔ FR-15) | Thuộc FR-14 |
| Tên trùng nhau giữa các SP | Spec không yêu cầu tên duy nhất |

## 7.3 Bài học

1. **API có thêm một chiều phân hoạch là cấu trúc request.** Ngoài giá trị của trường, cần xét: trường có mặt / vắng mặt / `null` / sai kiểu (G1).
2. **Đừng né giả định, hãy kiểm thử nó** (G2). Mỗi giả định ở Bước 1 nên có ít nhất 1 TC chạm vào nó.
3. **Severity phải xét cả chuỗi thao tác của người dùng thật**, không chỉ trạng thái ngay sau TC (G5).
4. **EP thuần trên tính năng toàn lỗi validation cho kết quả "hiển nhiên"**: mọi lớp không hợp lệ đều Fail. Giá trị thật nằm ở các lớp **đầu ra** (EC20, EC21) và ở hậu kiểm, vì đây mới là nơi tìm ra lỗi Critical không hiển nhiên.
