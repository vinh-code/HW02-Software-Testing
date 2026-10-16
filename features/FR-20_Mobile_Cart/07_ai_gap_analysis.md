# FR-20 Mobile: Giỏ hàng & Số lượng, Bước 7: AI Gap Analysis

**Công cụ AI:** Claude Code (model Claude Opus 5.5), chạy trong terminal ngày 2026-10-13. Nhật ký đầy đủ: `ai-audit/`.

**Bối cảnh đặc biệt của Pool D:**
- FR-20 chỉ ghi "đầy đủ chức năng … Giỏ hàng". AI phải **tự xác định nguồn đặc tả**, ở đây là FR-06 và FR-07.
- Máy kiểm thử không có thiết bị hay emulator, nên AI chọn chạy app bằng **Expo Web**. Lựa chọn này giúp tự động hóa được hoàn toàn, nhưng có giới hạn (G1).

## 7.1 Những gì AI bỏ sót hoặc làm sai

| # | Gap | Loại | Phát hiện ở đâu | Nguyên nhân | Xử lý |
|---|---|---|---|---|---|
| G1 | **Độ trung thực của môi trường.** Expo Web ≠ thiết bị thật: `Alert` không hiển thị; `keyboardType="numeric"` trên web không chặn chữ. Trên điện thoại, bàn phím số thường không có chữ, nên EP-12 và EP-17 có thể **không tái hiện được bằng bàn phím** (nhưng vẫn tái hiện được bằng cách dán) | Rủi ro kết luận sai | Bước 1 (đã lường trước một phần), rà soát sau thực thi | **Ràng buộc môi trường** cộng **AI ưu tiên khả năng tự động hóa** | Ghi rõ giới hạn ở §1.6 và §5.1. Với R5, kết luận dựa trên hiệu ứng (dòng bị xóa ngay) chứ không dựa trên việc thấy Alert. Đề xuất sinh viên kiểm tra lại EP-04, EP-06, EP-08 trên Expo Go |
| G2 | **Pass giả do trùng giá trị (EP-16).** AI chọn SL ban đầu = 2 cho mọi TC sửa SL không hợp lệ. Lỗi "+1" biến `1.5` thành `parseInt(1.5)+1 = 2`, trùng đúng giá trị "giữ nguyên" | Thiết kế dữ liệu test | Khi đọc kết quả: EP-16 Pass trong khi EP-14, 15, 17, 18 đều Fail | **Hạn chế của AI:** chọn giá trị nền mà không kiểm tra xem **các kết quả sai có thể xảy ra** có trùng kết quả đúng hay không | Chạy lại EP-16R với SL ban đầu = 3 → Fail. Ghi là Pass giả trong §5.3 |
| G3 | Ở lần chạy đầu, tiêu chí nhãn "Tổng cộng" được gộp vào **mọi** TC hợp lệ. Vì thế BVA-03/04/05 Fail vì nhãn, **che mất** kết quả đúng về số lượng | Masking do tiêu chí Pass | Lượt chạy thử EP-01…05 | **Hạn chế của AI:** gộp nhiều điều kiện đầu ra vào một tiêu chí | Chỉ kiểm tra nhãn ở EP-01 (TC phủ EC19). Các TC khác đánh giá riêng số lượng/tiền |
| G4 | Không có lớp cho **kiểu dữ liệu của giá**. `GET /api/products/:id` trả `price` dạng **chuỗi** với id chẵn, còn danh sách trả số. Một giỏ trộn hai nguồn có thể cộng chuỗi thay vì cộng số | Thiếu TC | Rà soát dữ liệu API khi viết bug report | **EP chỉ xét input người dùng nhập**, không xét dạng dữ liệu hệ thống trả về | Thêm EC20, TC EP-19 → **Pass** (app nhân với SL nên ép kiểu đúng) |
| G5 | **Rò rỉ kiến thức hộp trắng.** Trước khi thiết kế, AI đã đọc `App.js` khi tìm hiểu SUT, nên đã biết các lỗi "+1", thiếu nút +/−, nhãn "Tổng tạm tính". Việc chọn SL ban đầu khác 1 cho các TC sửa SL có thể bị ảnh hưởng | Sai phương pháp | Sinh viên tự rà soát | **Ngữ cảnh của AI** chứa mã nguồn | Mọi lớp đều có căn cứ từ FR-06/FR-07. Lỗi "+1" cũng lộ ra ngay ở TC hợp lệ EP-04 với dữ liệu tự nhiên nhất |

## 7.2 Các TC vẫn chưa được thiết kế (rủi ro còn lại)

| Lớp chưa phủ | Lý do chưa làm |
|---|---|
| Giỏ được gửi đúng và đủ khi **thanh toán** từ mobile | Thuộc FR-08. Server không lưu chi tiết sản phẩm của đơn, nên không quan sát được hộp đen qua UI/API |
| Giỏ còn hay mất khi **đóng/mở lại app** | Spec không nói. Hiện giỏ chỉ nằm trong bộ nhớ |
| Nhập SL bằng **dán** (paste) và **bàn phím số thật** trên Android/iOS | Cần thiết bị thật |
| Xoay ngang màn hình, cỡ chữ lớn (accessibility) | Ngoài phạm vi EP/BVA |
| SL cực lớn (≥ 10¹⁶, vượt độ chính xác của số thực) | Spec không có biên trên; đã kiểm tra 999 |

## 7.3 Bài học

1. **Chọn giá trị nền sao cho mọi kết quả sai đều phân biệt được với kết quả đúng** (G2). Khi đã biết một lỗi có quy luật (ví dụ +1), phải kiểm tra lại các TC có thể "đúng do trùng hợp".
2. **Mỗi tiêu chí đầu ra nên có TC riêng** (G3). Gộp tiêu chí khiến một lỗi nhỏ (nhãn) che các lỗi lớn hơn, cũng giống masking ở đầu vào.
3. **Môi trường mô phỏng phải được ghi rõ giới hạn**, và kết luận nên dựa trên những hiệu ứng không phụ thuộc môi trường (G1).
4. **Dữ liệu do hệ thống trả về cũng là một miền cần phân hoạch** (G4), nhất là khi API không nhất quán về kiểu dữ liệu.
