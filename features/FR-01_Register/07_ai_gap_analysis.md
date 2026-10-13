# FR-01 Đăng ký tài khoản: Bước 7, AI Gap Analysis

**Công cụ AI:** Claude Code (model Claude Opus 5.5), chạy trong terminal ngày 2026-10-13. Nhật ký đầy đủ: `ai-audit/`.

**Cách làm việc:** sinh viên ra lệnh theo từng bước của kỹ thuật (Input/Output → EC → TC EP → BVA → thực thi → bug → gap). AI tạo bản nháp, sinh viên duyệt các giả định A1–A5. Phần thực thi được tự động hóa bằng Playwright và gọi API.

## 7.1 Những gì AI bỏ sót hoặc làm sai

| # | Gap | Loại | Phát hiện ở đâu | Nguyên nhân | Xử lý |
|---|---|---|---|---|---|
| G1 | Không có lớp hợp lệ **"Họ tên tiếng Việt có dấu"**. Mọi giá trị đại diện đều là ASCII (`Nguyen Van A`) | Thiếu TC | Rà soát sau khi thực thi | **Thiên lệch của AI:** mặc định chọn dữ liệu mẫu tiếng Anh/ASCII, dù SUT là ứng dụng tiếng Việt | Thêm EC26 và TC EP-20 → Pass |
| G2 | Không có lớp **"Họ tên chứa ký tự/thẻ HTML"**, nên bỏ lỡ một lỗi **Critical** (stored XSS, BUG-FR01-07) | Thiếu TC, **bỏ sót bug** | Rà soát sau khi thực thi, đối chiếu chéo với SEC-04 | **Chất lượng prompt:** yêu cầu chỉ nói "phân tích FR-01", nên AI chỉ đọc mục FR-01. Ràng buộc escape dữ liệu lại nằm ở mục khác (SEC-04, FR-18). Ngoài ra, EP thuần theo spec chức năng vốn không sinh ra lớp "dữ liệu nguy hiểm" | Thêm EC27 và TC EP-21 → Fail, ghi thành BUG-FR01-07 |
| G3 | Không dự đoán được lớp **"Mật khẩu chứa khoảng trắng"** | Thiếu TC | Khi thực thi (thăm dò sau masking) | **Độ phức tạp của SUT:** spec không nhắc tới khoảng trắng. Không ai ngờ UI lại coi khoảng trắng là ký tự đặc biệt. EP dựa trên spec không thể sinh ra lớp mà spec không nói tới | Ghi nhận trong bảng thăm dò §5.2, gộp vào BUG-FR01-01 |
| G4 | Kế hoạch thực thi giả định **TC hợp lệ sẽ được chấp nhận**, nên không lường trước hiện tượng lỗi che lỗi trên UI | Thiết kế thực thi sai | Lượt chạy đầu tiên | **Hạn chế của AI:** áp dụng máy móc nguyên tắc "1 lớp không hợp lệ/TC" mà không kiểm tra tiền đề "bộ giá trị nền hợp lệ thật sự được chấp nhận" | Thêm lượt chạy lại 9 TC (hậu tố `R`) với mật khẩu UI chấp nhận được |
| G5 | Ở Bước 2, AI viết dòng thống kê **tự mâu thuẫn**: lúc đầu ghi "8 lớp hợp lệ… 17 không hợp lệ", sau đó sửa thành 7 và 18 | Sai số liệu | AI tự phát hiện trước khi commit, thấy được trong audit log | **Hạn chế của AI:** sinh văn bản trước rồi mới đếm lại | Sửa trước commit `167624b` |
| G6 | Giả định A3 (ký tự ngoài tập vẫn hợp lệ) và A5 (email không phân biệt hoa/thường) là **diễn giải của AI**, spec không xác nhận | Rủi ro đánh giá sai | Bước 1 | **Spec mơ hồ:** cần người viết spec xác nhận | Sinh viên chấp nhận và ghi rõ là giả định. Kết quả của EP-02 và EP-10 phụ thuộc vào các giả định này |

## 7.2 Các TC vẫn chưa được thiết kế (rủi ro còn lại)

| Lớp chưa phủ | Lý do chưa làm |
|---|---|
| Email có khoảng trắng ở đầu hoặc cuối (`" a@b.com "`) | Spec không quy định việc trim. Cần làm rõ |
| Độ dài tối đa của email (RFC 5321: 254 ký tự) | Spec không quy định. Đã có TC chuỗi dài cho họ tên và mật khẩu |
| Gửi form 2 lần liên tiếp (double submit) | Thuộc kiểm thử đồng thời, ngoài phạm vi EP/BVA |
| Họ tên chứa emoji hoặc ký tự Unicode 4 byte | Chưa ưu tiên |

## 7.3 Bài học

1. **EP/BVA theo spec chỉ tìm được những gì spec nói tới.** Các lỗi lớn nhất của FR-01 (khoảng trắng bị coi là ký tự đặc biệt, XSS) nằm **ngoài** câu chữ của FR-01. Cần đối chiếu chéo với các yêu cầu chung (SEC, GUI) và bổ sung kiểm thử khám phá.
2. **Chạy TC hợp lệ trước.** Nếu TC hợp lệ thất bại, mọi TC không hợp lệ chạy sau trên cùng kênh đều phải bị nghi ngờ là Pass giả.
3. **Kiểm thử ở hai tầng (UI và API)** cho bức tranh khác hẳn so với chỉ test UI. Toàn bộ validation phía server đều thiếu, điều này chỉ lộ ra khi gọi API trực tiếp.
4. **Prompt quyết định phạm vi.** Câu lệnh "phân tích FR-01" khiến AI bỏ qua SEC-04. Với các tính năng sau, prompt nên yêu cầu AI **liệt kê mọi yêu cầu liên quan trong toàn bộ SRS** trước khi phân hoạch.
