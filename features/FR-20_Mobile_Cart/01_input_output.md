# FR-20 Mobile: Giỏ hàng & Số lượng, Bước 1: Xác định Input & Output

> Kỹ thuật: Phân hoạch tương đương, bước 1/3 (slide Bài 4, tr.6–7).
> Cơ sở kiểm thử: SRS EShop mục **FR-20**: ứng dụng mobile phải có "đầy đủ các chức năng: … Giỏ hàng …". Vì FR-20 không mô tả lại giỏ hàng, các quy tắc nghiệp vụ được lấy từ **FR-07** (Giỏ hàng) và **FR-06** (ô Số lượng), đúng như phạm vi "Quản lý giỏ hàng & Số lượng" của Pool D.

## 1.1 Trích yêu cầu từ SRS

| Mã | Nguồn | Nội dung đặc tả |
|---|---|---|
| R1 | FR-06 | Ô **Số lượng** chỉ nhận **số nguyên dương, tối thiểu là 1** |
| R2 | FR-06 | Sau khi bấm **Thêm vào giỏ hàng** phải có phản hồi trực quan (toast hoặc badge cập nhật) |
| R3 | FR-07 | Giỏ hiển thị các cột **Sản phẩm, Đơn giá, Số lượng (có nút +/- để chỉnh), Thành tiền, Thao tác** |
| R4 | FR-07 | Thêm **cùng một sản phẩm** thì **tăng số lượng**, không tạo dòng mới |
| R5 | FR-07 | Nút **Xóa sản phẩm** phải có **dialog xác nhận** trước khi xóa |
| R6 | FR-07 | Có nút **Tiếp tục mua sắm** để quay về trang chủ |
| R7 | FR-07 | Tổng tiền dùng nhãn chính xác **"Tổng cộng"** (không phải "Tổng tạm tính") |
| R8 | FR-07 | Giỏ trống có **hình minh họa** và **thông báo rõ ràng** |
| R9 | FR-07 (ngầm định) | Thành tiền = Đơn giá × Số lượng; Tổng cộng = Σ Thành tiền |
| R10 | FR-21 | Tiền dùng `₫` và có phân cách hàng nghìn |

**Yêu cầu đã xem nhưng không đưa vào phạm vi:** FR-08 (thanh toán) và FR-20 phần Hủy đơn thuộc tính năng khác. Riêng việc giỏ hàng được gửi đúng khi thanh toán liên quan trực tiếp đến dữ liệu giỏ, nên được ghi vào phần rủi ro ở Bước 7.

## 1.2 Biến đầu vào (Input)

| Mã | Input | Kiểu | Nơi nhập | Ràng buộc |
|---|---|---|---|---|
| I1 | Số lượng khi thêm từ **trang chi tiết** | ô nhập (bàn phím số) | Chi tiết sản phẩm | R1 |
| I2 | Số lượng khi **sửa trong giỏ** | ô nhập trên từng dòng | Giỏ hàng | R1, R9 |
| I3 | Nút **+ / −** | thao tác | Giỏ hàng | R3, R1 (không xuống dưới 1) |
| I4 | Số lần thêm **cùng một** sản phẩm | số nguyên ≥ 1 | Danh sách / Chi tiết | R4 |
| I5 | Thao tác **Xóa** và lựa chọn trong dialog (Đồng ý / Hủy) | thao tác | Giỏ hàng | R5 |
| I6 | Trạng thái giỏ (trống / có hàng) | trạng thái | – | R8 |

## 1.3 Biến đầu ra (Output)

| Mã | Output | Mô tả |
|---|---|---|
| O1 | Giỏ cập nhật đúng | Số dòng, số lượng, Thành tiền và Tổng cộng đúng theo R4, R9; nhãn và định dạng đúng R7, R10 |
| O2 | Từ chối giá trị không hợp lệ | Số lượng sai **không** được đưa vào giỏ; có thông báo (hoặc ô nhập không nhận ký tự đó); giỏ giữ nguyên giá trị hợp lệ trước đó |
| O3 | Xác nhận xóa | Hiện dialog. Đồng ý thì xóa dòng; Hủy thì giữ nguyên |
| O4 | Giỏ trống | Hình minh họa, thông báo, nút Tiếp tục mua sắm |

## 1.4 Các điều kiện cần phân hoạch

| Điều kiện | Biến | Loại điều kiện (slide tr.10) |
|---|---|---|
| C1. Số lượng là số nguyên ≥ 1 | I1, I2 | Dãy giá trị `[1..∞)`, **có thứ tự nên áp dụng được BVA** |
| C2. Nút +/− tồn tại và chỉnh đúng ±1, không xuống dưới 1 | I3 | Dãy giá trị (qty sau khi bấm), **có biên tại 1** |
| C3. Cùng sản phẩm thì gộp dòng | I4 | Boolean (cùng / khác sản phẩm) |
| C4. Xóa phải qua xác nhận | I5 | Tập giá trị {Đồng ý, Hủy} |
| C5. Giỏ trống / có hàng | I6 | Boolean |
| C6. Thành tiền, Tổng cộng, nhãn, định dạng đúng | O1 | Điều kiện trên **đầu ra** |

## 1.5 Điểm mơ hồ và giả định

| # | Điểm mơ hồ | Giả định áp dụng |
|---|---|---|
| A1 | Gặp số lượng không hợp lệ thì làm gì? Báo lỗi hay tự sửa? | Hệ thống phải **từ chối có thông báo** hoặc **không cho nhập** ký tự đó. **Âm thầm** đổi `0`, `-2`, `abc` thành 1 rồi vẫn thêm vào giỏ là **không đạt**, vì người dùng không biết giá trị đã bị đổi |
| A2 | Không có số lượng tối đa | Không có biên trên. Dùng 1 TC giá trị lớn (999) để kiểm tra độ bền và định dạng tiền |
| A3 | "Cột" trên màn hình điện thoại | Mỗi dòng giỏ có đủ 5 thông tin của R3 (có thể xếp dọc), kể cả nút +/− |
| A4 | Hình minh họa giỏ trống | Phải có ít nhất một hình ảnh/biểu tượng, không chỉ có chữ |

## 1.6 Kênh thực thi & môi trường (hộp đen)

- **Ứng dụng:** `frontend-mobile` (Expo SDK 54, React Native 0.81). Máy kiểm thử không có Android SDK/emulator. Vì vậy app được chạy bằng **Expo Web** (`npx expo start --web`, react-native-web), **mô phỏng thiết bị Pixel 5** (393×851, touch, user-agent mobile) qua Playwright.
- **Thay đổi môi trường (không sửa logic app):**
  1. `App.js` dòng 16: `API_URL` đổi thành IP LAN của máy chạy backend (`192.168.1.11`). Đây là thao tác cấu hình mà `setup_guide.md` yêu cầu.
  2. Cài thêm `react-native-web`, `react-dom`, `@expo/metro-runtime` bằng `npx expo install` để render được bản web.
- **Giới hạn của Expo Web:** `Alert.alert` của React Native **không hiển thị** trên web. Các TC chỉ quan sát **hiệu ứng** (giỏ thay đổi hay không), không dựa vào việc có thấy hộp thoại Alert hay không. Với R5: nếu app có xác nhận bằng Alert, trên web bấm **Xóa** sẽ *không xóa gì*, vì callback không bao giờ được gọi. Ngược lại, nếu dòng bị xóa ngay lập tức, điều đó chứng minh **không có bước xác nhận**.
- Người dùng có thể kiểm tra lại các kết quả chính trên thiết bị thật bằng Expo Go (xem README).
