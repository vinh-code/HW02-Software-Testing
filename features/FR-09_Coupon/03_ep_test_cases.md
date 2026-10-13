# FR-09 Mã giảm giá (Coupon): Bước 3, Xác định ca kiểm thử (EP)

> Kỹ thuật: Phân hoạch tương đương, bước 3/3 (slide Bài 4, tr.15–18).
> Đầu vào: 21 lớp tương đương ở [Bước 2](02_equivalence_classes.md).

## 3.1 Nguyên tắc áp dụng (slide tr.15)

1. Khi xét một lớp của biến X, chọn giá trị đại diện của lớp đó cho X. Các biến khác lấy **bộ giá trị nền hợp lệ**: user mới, đã đăng nhập, `used = 0`, giỏ 1.000.000 ₫, mã `SAVE10`.
2. **Một TC phủ nhiều lớp hợp lệ** cùng lúc.
3. **Mỗi TC chỉ phủ đúng một lớp không hợp lệ.**

Ràng buộc bổ sung: **mỗi TC dùng một user mới** (`vinh.<kênh>.f09.epNN@gmail.com`). Lý do là C5 phụ thuộc lịch sử dùng mã của user. Nếu các TC dùng chung user, một TC chạy trước có thể làm "hết lượt" và làm sai kết quả của TC sau.

## 3.2 Bảng xác định ca kiểm thử cho từng lớp

| Lớp | Lớp tương đương | Mã | Tổng giỏ | Đăng nhập | `used` | Output mong đợi |
|---|---|---|---|---|---|---|
| EC1 | Mã đúng, chữ hoa | `SAVE10` | 1.000.000 | Có | 0 | O1: giảm 100.000, còn 900.000 |
| EC2 | Mã chữ thường | `save10` | 1.000.000 | Có | 0 | O1: giảm 100.000, còn 900.000 |
| EC3 | Mã có khoảng trắng 2 đầu | `" VIP100 "` | 1.000.000 | Có | 0 | O1: giảm 100.000, còn 900.000 |
| EC4 | Mã không tồn tại | `ABC123` | 1.000.000 | Có | 0 | O2: mã không tồn tại |
| EC5 | Mã rỗng | `""` | 1.000.000 | Có | 0 | O2: yêu cầu nhập mã / không cho áp dụng |
| EC6 | Mã bị vô hiệu hóa | `OFF10` | 1.000.000 | Có | 0 | O2: mã không tồn tại hoặc bị vô hiệu hóa |
| EC7 | Còn hạn | `SAVE10` | 1.000.000 | Có | 0 | O1 |
| EC8 | Đã qua hạn | `EXPIRED` | 1.000.000 | Có | 0 | O2: mã hết hạn |
| EC9 | Hết hạn đúng hôm nay | `EXP0D` | 1.000.000 | Có | 0 | O2: mã hết hạn |
| EC10 | Đủ ngưỡng | `SAVE10` | 1.000.000 | Có | 0 | O1 |
| EC11 | Dưới ngưỡng | `SAVE10` | 200.000 | Có | 0 | O2: chưa đủ giá trị tối thiểu |
| EC12 | Đã đăng nhập | `SAVE10` | 1.000.000 | Có | 0 | O1 |
| EC13 | Chưa đăng nhập | `SAVE10` | 1.000.000 | **Không** | – | O2: yêu cầu đăng nhập |
| EC14 | Token không hợp lệ | `SAVE10` | 1.000.000 | **Token giả** | – | O2: HTTP 401/403 |
| EC15 | `used` < max | `SAVE10` | 1.000.000 | Có | 0 | O1 |
| EC16 | `used` = max | `SAVE10` | 1.000.000 | Có | **1** | O2: đã dùng hết lượt |
| EC17 | `used` = max, không gửi `user_id` | `SAVE10` | 1.000.000 | Có (token) | **1** | O2: đã dùng hết lượt |
| EC18 | Output `percent` | `SAVE10` | 1.000.000 | Có | 0 | O1a: giảm 100.000, còn 900.000 |
| EC19 | Output `fixed` | `BIGBUY` | 1.000.000 | Có | 0 | O1b: giảm 50.000, còn 950.000 |
| EC20 | Tổng do hệ thống tính | `SAVE10` | 1.000.000 | Có | 0 | O1 |
| EC21 | Tổng bị sửa tay | `SAVE10` | 200.000, **sửa thành 1.000.000** | Có | 0 | O2: không sửa được tổng tiền, hoặc mã bị từ chối vì tổng thật là 200.000 |

## 3.3 Bảng rút gọn các ca kiểm thử

Gộp các lớp hợp lệ giống nhau (EC1, EC7, EC10, EC12, EC15, EC18, EC20 cùng dùng bộ giá trị nền), được **15 TC**:

| TC | Lớp phủ | Mã | Tổng giỏ | Đăng nhập | `used` | Kênh | Output mong đợi |
|---|---|---|---|---|---|---|---|
| EP-01 | EC1, EC7, EC10, EC12, EC15, EC18, EC20 | `SAVE10` | 1.000.000 | Có | 0 | UI + API | O1a: giảm **100.000**, còn **900.000** |
| EP-02 | EC1, EC7, EC10, EC12, EC15, **EC19**, EC20 | `BIGBUY` | 1.000.000 | Có | 0 | UI + API | O1b: giảm **50.000**, còn **950.000** |
| EP-03 | **EC2** + nền | `save10` | 1.000.000 | Có | 0 | UI + API | O1a: giảm 100.000, còn 900.000 |
| EP-04 | **EC3** + nền (fixed) | `" VIP100 "` | 1.000.000 | Có | 0 | UI + API | O1b: giảm 100.000, còn 900.000 |
| EP-05 | **EC4** | `ABC123` | 1.000.000 | Có | 0 | UI + API | O2 |
| EP-06 | **EC5** | `""` | 1.000.000 | Có | 0 | UI + API | O2 (UI: nút Áp dụng bị vô hiệu hóa cũng chấp nhận) |
| EP-07 | **EC6** | `OFF10` | 1.000.000 | Có | 0 | UI + API | O2 |
| EP-08 | **EC8** | `EXPIRED` | 1.000.000 | Có | 0 | UI + API | O2: hết hạn |
| EP-09 | **EC9** | `EXP0D` | 1.000.000 | Có | 0 | UI + API | O2: hết hạn |
| EP-10 | **EC11** | `SAVE10` | 200.000 | Có | 0 | UI + API | O2: chưa đủ ngưỡng |
| EP-11 | **EC13** | `SAVE10` | 1.000.000 | **Không** | – | UI + API | O2: yêu cầu đăng nhập |
| EP-12 | **EC14** | `SAVE10` | 1.000.000 | **Token giả** | – | API | O2: HTTP 401/403 |
| EP-13 | **EC16** | `SAVE10` | 1.000.000 | Có | **1** | UI + API | O2: đã dùng hết lượt |
| EP-14 | **EC17** | `SAVE10` | 1.000.000 | Có | **1**, không gửi `user_id` | API | O2: đã dùng hết lượt |
| EP-15 | **EC21** | `SAVE10` | 200.000 → sửa 1.000.000 | Có | 0 | UI | O2 |

**Lý do một số TC chỉ chạy trên một kênh:**
- **EP-12, EP-14 chỉ chạy API.** Trên UI, token giả bị `AuthContext` phát hiện và tự đăng xuất. UI cũng luôn gửi `user_id` của user đang đăng nhập. Hai lớp này chỉ có thể xảy ra khi gọi API trực tiếp, nhưng đó chính là đường tấn công thật.
- **EP-15 chỉ chạy UI.** API `apply-coupon` không có giỏ hàng phía server, nên không có "tổng thật" để so sánh. Lớp này kiểm tra ô tổng tiền trên trang Checkout.
- **EP-11 trên UI:** người chưa đăng nhập bấm **Tiến hành thanh toán** sẽ bị chặn ở trang Giỏ hàng. TC kiểm tra thêm việc mở thẳng `/checkout` bằng điều hướng phía client (giữ nguyên giỏ) rồi áp mã.

## 3.4 Kiểm tra độ phủ

| Lớp | TC phủ | Lớp | TC phủ | Lớp | TC phủ |
|---|---|---|---|---|---|
| EC1 | EP-01, EP-02 | EC8 | EP-08 | EC15 | EP-01 |
| EC2 | EP-03 | EC9 | EP-09 | EC16 | EP-13 |
| EC3 | EP-04 | EC10 | EP-01 | EC17 | EP-14 |
| EC4 | EP-05 | EC11 | EP-10 | EC18 | EP-01, EP-03 |
| EC5 | EP-06 | EC12 | EP-01 | EC19 | EP-02, EP-04 |
| EC6 | EP-07 | EC13 | EP-11 | EC20 | EP-01 |
| EC7 | EP-01 | EC14 | EP-12 | EC21 | EP-15 |

Cả 21/21 lớp được phủ. Mỗi lớp không hợp lệ có **đúng 1 TC riêng**.

## 3.5 Cách thực thi

- **API:** `POST /api/apply-coupon` với `{code, total_amount, user_id}` đúng như API spec và đúng như UI gửi. Đối với C4, có gửi thêm header `Authorization` khi "đã đăng nhập". Với EP-11, không có token và không có `user_id`.
- **UI:** đăng nhập → mở trang sản phẩm test → **Thêm vào giỏ hàng** → **Giỏ hàng** → **Tiến hành thanh toán** → nhập mã → **Áp dụng**. Đọc thông báo, "Tiết kiệm" và "Thành tiền", rồi chụp màn hình.
- **Thứ tự chạy:** chạy EP-01 và EP-02 (TC hợp lệ) **trước**. Nếu TC hợp lệ đã Fail thì phải xem lại kết quả Pass của các TC không hợp lệ, đề phòng lỗi che lỗi (bài học FR-01 §5.2).
