# Checklist cạm bẫy — rút ra từ AI gap analysis của FR-01, FR-09, FR-15, FR-20

Mỗi mục ghi nguồn (gap nào đã xảy ra thật). Áp dụng ở bước được ghi trong ngoặc.

## A. Lớp tương đương hay bị bỏ sót (B2)

| # | Kiểm tra | Nguồn |
|---|---|---|
| A1 | Chuỗi **tiếng Việt có dấu** cho mọi trường văn bản (SUT là app tiếng Việt; AI hay mặc định ASCII) | FR-01 G1 |
| A2 | Chuỗi chứa **HTML/script** (`<img src=x onerror=…>`) cho mọi trường được **hiển thị lại** ở đâu đó → kiểm tra escape (SEC-04) | FR-01 G2 |
| A3 | **Chỉ khoảng trắng**, khoảng trắng đầu/cuối, ký tự lạ ngoài tập cho phép | FR-01 G3 |
| A4 | Ở API: trường **vắng mặt** ≠ chuỗi rỗng ≠ `null` ≠ **sai kiểu** (chữ thay số) — đặc biệt với PUT/PATCH | FR-15 G1 |
| A5 | **Miền lấy từ nơi dữ liệu được nhập** (form admin, kiểu cột DB, API) chứ không từ bảng dữ liệu mẫu trong SRS (ví dụ `expired_at` có giờ; `min_order_amount = 0`) | FR-09 G1, G2 |
| A6 | **Lớp đầu ra**: mỗi công thức/loại kết quả một lớp; kết quả vô lý (âm, tràn) | FR-09 G2 |
| A7 | **Dữ liệu do hệ thống trả về** cũng là một miền (API trả cùng trường với kiểu khác nhau) | FR-20 G4 |
| A8 | Phân quyền: **không token / token giả / token thiếu quyền** cho từng endpoint ghi dữ liệu | FR-15, FR-09 |
| A9 | Định danh lấy từ **body** thay vì từ token (gửi `user_id` khác / bỏ `user_id`) | FR-09 EC17 |
| A10 | Thao tác trên đối tượng **không tồn tại** (id 99999) | FR-15 EC16 |
| A11 | "Lớp" chỉ sinh ra khi **đi vòng qua UI**: trường chỉ đọc nhưng sửa được, route không được bảo vệ | FR-09 EC21, EP-11 |

Mỗi giả định A1…An ở B1 phải có ≥ 1 TC chạm vào nó (FR-15 G2: đừng né giả định bằng giá trị "an toàn").

## B. Bẫy khi thực thi (B5)

| # | Kiểm tra | Nguồn |
|---|---|---|
| B1 | **Chạy TC hợp lệ trước.** Nếu bộ giá trị nền bị từ chối thì mọi TC không hợp lệ trên kênh đó là **Pass giả** (masking) → thăm dò xem hệ thống thực sự chấp nhận gì, chạy lại với giá trị nền thay thế (hậu tố `R`) | FR-01 G4 |
| B2 | **Pass giả do trùng giá trị**: khi đã biết một lỗi có quy luật (+1, làm tròn…), kiểm tra xem kết quả sai có thể trùng kết quả đúng không; chọn giá trị nền sao cho mọi kết quả sai đều phân biệt được | FR-20 G2 |
| B3 | **Masking do gộp tiêu chí đầu ra**: mỗi tiêu chí đầu ra (nhãn, định dạng, số tiền, quyết định chấp nhận/từ chối) đánh giá riêng; tách cột "Quyết định" và "Số tiền" | FR-20 G3, FR-09 §5.2 |
| B4 | **Hậu kiểm toàn bộ** trạng thái liên quan (mọi bản ghi khác, không chỉ bản ghi của TC) — cả trong DB (API) lẫn trên màn hình | FR-15 BUG-02 |
| B5 | Dữ liệu test **duy nhất cho mỗi TC & mỗi kênh** (email, mô tả làm nhãn nhận diện); nhớ rằng bug của tính năng khác (cho email trùng) có thể làm hỏng dữ liệu test → khi API và UI mâu thuẫn, nghi công cụ trước | FR-09 G5 |
| B6 | Đọc trạng thái validation **trước** khi submit (form tự reset sau khi lưu) | FR-15 script |
| B7 | **Môi trường mô phỏng** (Expo Web thay thiết bị, headless): ghi rõ giới hạn (Alert không hiện, bàn phím số không chặn chữ); kết luận dựa trên **hiệu ứng** không phụ thuộc môi trường | FR-20 G1 |
| B8 | Kiểm thử **hai tầng** (UI và API) — validation thường chỉ có ở client | FR-01, FR-15 |

## C. Bẫy khi báo cáo (B6, B7)

| # | Kiểm tra | Nguồn |
|---|---|---|
| C1 | **Severity theo chuỗi thao tác tiếp theo**: lỗi "chỉ hiển thị" có dẫn tới hỏng dữ liệu ở thao tác kế tiếp không? Viết 1 kịch bản thăm dò | FR-15 G5 |
| C2 | Hậu kiểm tác động thật (đơn hàng được lưu với số tiền sai) để chứng minh mức độ | FR-09 BUG-01 |
| C3 | Bug phụ thuộc giả định → ghi rõ và hạ mức severity | FR-09 G4 |
| C4 | **Tự đếm lại** số liệu thống kê bằng script trước khi ghi | FR-01 G5 |
| C5 | Ghi trung thực việc AI đã đọc mã nguồn (rò rỉ hộp trắng) nếu có | FR-09 G3, FR-15 G4 |
