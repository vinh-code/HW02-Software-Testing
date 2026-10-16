# FR-20 Mobile: Giỏ hàng & Số lượng, Bước 5: Thực thi kiểm thử

## 5.1 Môi trường

| Mục | Giá trị |
|---|---|
| Thời điểm chạy | 2026-10-13 (GMT+7). Dữ liệu thô: [`results_fr20.json`](results_fr20.json) |
| SUT | `eshop-sut/frontend-mobile` commit `85af3ba` (Expo SDK 54, React Native 0.81.5). Backend `:3000` khởi động lại để seed DB |
| Cách chạy app | **Expo Web** (`npx expo start --web --port 8081`), Playwright 1.49.1 + Chromium 131 **mô phỏng Pixel 5** (393×851, DPR 2.75, touch, UA Android) |
| Thay đổi môi trường | (1) `App.js` dòng 16: `API_URL = "http://192.168.1.11:3000/api"` (IP LAN của máy). (2) Cài thêm `react-native-web`, `react-dom`, `@expo/metro-runtime` để render web. **Không sửa logic nào của app** |
| Script | [`scripts/fr20_mobile_cart.js`](../../scripts/fr20_mobile_cart.js), thăm dò [`scripts/fr20_typing_probe.js`](../../scripts/fr20_typing_probe.js) |
| Dữ liệu | A = Bàn phím cơ Keychron Q1 (id 5, 4.000.000 ₫), B = Tai nghe AirPods Pro 2 (id 4, 6.000.000 ₫) |
| Cách ly | Mỗi TC mở **một phiên app mới** (browser context mới), nên giỏ luôn bắt đầu trống |

**Tiêu chí Pass/Fail**
- **TC hợp lệ:** số dòng, SL, Thành tiền, Tổng đúng như mong đợi. Riêng nhãn "Tổng cộng" (R7) chỉ được tính vào EP-01 (TC phủ EC19), để lỗi nhãn không che kết quả số lượng ở các TC khác.
- **TC không hợp lệ:** giỏ giữ nguyên trạng thái trước đó (trang chi tiết: giỏ vẫn trống; trong giỏ: SL vẫn bằng SL ban đầu).

**Giới hạn của Expo Web:** `Alert.alert` không hiển thị trên web. Mình không kết luận dựa trên việc có thấy Alert hay không, mà dựa trên **hiệu ứng**. Ví dụ ở EP-06, nếu có bước xác nhận bằng Alert, dòng sẽ không bị xóa; dòng bị xóa ngay chứng tỏ không có bước xác nhận.

## 5.2 Kiểm tra masking và Pass giả

- Các TC hợp lệ EP-01 → EP-04 chạy trước.
- **EP-01 Fail chỉ vì nhãn.** SL 3 và 12.000.000 ₫ đều đúng, nhưng nhãn là "Tổng tạm tính". Vì vậy mình tách tiêu chí nhãn ra khỏi các TC khác (xem §5.1).
- **EP-04 Fail vì SL sai**: nhập 5 thì ô thành **6**. Mọi TC sửa SL trong giỏ đều bị ảnh hưởng bởi lỗi "+1" này. Do đó mỗi TC sửa SL được thiết kế với SL ban đầu khác với giá trị mà lỗi có thể tạo ra.
- **EP-16 là Pass giả:** nhập `1.5` thì app tính `parseInt("1.5") + 1 = 2`, **trùng ngẫu nhiên** với SL ban đầu là 2, nên trông như "giữ nguyên". Chạy lại **EP-16R** với SL ban đầu là 3: SL thành **2**, tức là Fail. Kết quả cuối của EP-16 lấy theo EP-16R.

## 5.3 Kết quả: Phân hoạch tương đương (18 TC)

| TC | Lớp | Bước chính | Mong đợi | Thực tế | KQ |
|---|---|---|---|---|---|
| EP-01 | EC1, EC19 | Chi tiết A, SL `3` → Thêm → Giỏ | A×3, 12.000.000 ₫, nhãn "Tổng cộng" | A×3, Thành tiền 12,000,000 ₫. Nút đổi thành "Đã thêm". Nhãn tổng là **"Tổng tạm tính"** | Fail [ảnh](screenshots/EP-01_mobile.png) |
| EP-02 | EC14 | Thêm A từ danh sách + A (SL 2) từ chi tiết | 1 dòng, SL 3 | 1 dòng, SL 3 | Pass [ảnh](screenshots/EP-02_mobile.png) |
| EP-03 | EC15 | Thêm A, B | 2 dòng, tổng 10.000.000 | 2 dòng, tổng 10,000,000 ₫ | Pass [ảnh](screenshots/EP-03_mobile.png) |
| EP-04 | EC7 | Giỏ A×1, sửa SL thành `5` | SL 5, 20.000.000 | ô hiện **6**, Thành tiền **24,000,000 ₫** | Fail [ảnh](screenshots/EP-04_mobile.png) |
| EP-05 | EC13 | Bấm **+** | SL 2 | **Không có nút +/−** trên dòng giỏ | Fail [ảnh](screenshots/EP-05_mobile.png) |
| EP-06 | EC16 | Bấm **Xóa** → Đồng ý | Có dialog, sau đó xóa | Dòng bị xóa **ngay lập tức**, không có bước xác nhận | Fail [ảnh](screenshots/EP-06_mobile.png) |
| EP-07 | EC17 | Bấm **Xóa** → Hủy | Có dialog, Hủy thì giữ dòng | Không có cơ hội Hủy, dòng đã bị xóa | Fail [ảnh](screenshots/EP-07_mobile.png) |
| EP-08 | EC18 | Mở giỏ trống | Hình minh họa + thông báo + Tiếp tục mua sắm | Có thông báo và link "Tiếp tục mua sắm", **không có hình minh họa** (0 ảnh) | Fail [ảnh](screenshots/EP-08_mobile.png) |
| EP-09 | EC2 | Chi tiết A, SL `0` → Thêm | Không thêm, có thông báo | Ô nhận `0`, nút báo "Đã thêm", giỏ có **A×1** | Fail [ảnh](screenshots/EP-09_mobile.png) |
| EP-10 | EC3 | SL `-2` | như trên | Ô nhận `-2`, giỏ có **A×1** | Fail [ảnh](screenshots/EP-10_mobile.png) |
| EP-11 | EC4 | SL `1.5` | như trên | Ô nhận `1.5`, giỏ có **A×1** | Fail [ảnh](screenshots/EP-11_mobile.png) |
| EP-12 | EC5 | SL `abc` | như trên | Ô nhận `abc`, giỏ có **A×1** | Fail [ảnh](screenshots/EP-12_mobile.png) |
| EP-13 | EC6 | SL rỗng | như trên | giỏ có **A×1** | Fail [ảnh](screenshots/EP-13_mobile.png) |
| EP-14 | EC8 | Giỏ A×2, sửa SL `0` | SL giữ 2 | ô thành **1**, SL = 1, không có thông báo | Fail [ảnh](screenshots/EP-14_mobile.png) |
| EP-15 | EC9 | Giỏ A×2, sửa `-2` | SL giữ 2 | SL = **1** | Fail [ảnh](screenshots/EP-15_mobile.png) |
| EP-16 | EC10 | Giỏ A×2, sửa `1.5` | SL giữ 2 | SL = 2 (**Pass giả**, xem §5.2) | – [ảnh](screenshots/EP-16_mobile.png) |
| EP-16R | EC10 | Giỏ **A×3**, sửa `1.5` | SL giữ 3 | SL = **2** | Fail [ảnh](screenshots/EP-16R_mobile.png) |
| EP-17 | EC11 | Giỏ A×2, sửa `abc` | SL giữ 2 | SL = **1** | Fail [ảnh](screenshots/EP-17_mobile.png) |
| EP-18 | EC12 | Giỏ A×2, xóa trắng ô | SL giữ 2 | ô **ngay lập tức** thành 1, SL = **1** | Fail [ảnh](screenshots/EP-18_mobile.png) |

## 5.4 Kết quả: Phân tích giá trị biên (12 TC)

| TC | Biến, điểm | Thao tác | Mong đợi | Thực tế | KQ |
|---|---|---|---|---|---|
| BVA-01 | nominal | Chi tiết, SL 3 | A×3, 12.000.000 | A×3, 12,000,000 ₫ | Pass [ảnh](screenshots/BVA-01_mobile.png) |
| BVA-02 | V1 LB−1 | Chi tiết, SL **0** | không thêm | thêm **A×1** | Fail [ảnh](screenshots/BVA-02_mobile.png) |
| BVA-03 | V1 **LB** | Chi tiết, SL **1** | A×1 | A×1, 4,000,000 ₫ | Pass [ảnh](screenshots/BVA-03_mobile.png) |
| BVA-04 | V1 LB+1 | Chi tiết, SL 2 | A×2 | A×2, 8,000,000 ₫ | Pass [ảnh](screenshots/BVA-04_mobile.png) |
| BVA-05 | V1 độ bền | Chi tiết, SL 999 | A×999, 3.996.000.000 | A×999, 3,996,000,000 ₫ | Pass [ảnh](screenshots/BVA-05_mobile.png) |
| BVA-06 | V2 LB−1 | Giỏ A×2, sửa **0** | giữ 2 | SL **1** | Fail [ảnh](screenshots/BVA-06_mobile.png) |
| BVA-07 | V2 **LB** | Giỏ A×2, sửa **1** | SL 1 | SL **2** | Fail [ảnh](screenshots/BVA-07_mobile.png) |
| BVA-08 | V2 LB+1 | Giỏ A×1, sửa 2 | SL 2 | SL **3** | Fail [ảnh](screenshots/BVA-08_mobile.png) |
| BVA-09 | V2 độ bền | Giỏ A×1, sửa 999 | SL 999 | SL **1000**, 4,000,000,000 ₫ | Fail [ảnh](screenshots/BVA-09_mobile.png) |
| BVA-10 | V3 LB−1 | A×1, bấm **−** | giữ 1 | không có nút | Fail [ảnh](screenshots/BVA-10_mobile.png) |
| BVA-11 | V3 **LB** | A×2, bấm **−** | SL 1 | không có nút | Fail [ảnh](screenshots/BVA-11_mobile.png) |
| BVA-12 | V3 LB+1 | A×1, bấm **+** | SL 2 | không có nút | Fail [ảnh](screenshots/BVA-12_mobile.png) |

**Phân tích theo biến:**
- **V1 (ô SL ở trang chi tiết):** đúng tại LB, LB+1 và giá trị lớn. Tại LB−1 (0), ô không chặn mà **âm thầm đổi thành 1**. Ô nhận mọi ký tự, kể cả chữ.
- **V2 (ô SL trong giỏ):** **sai tại mọi điểm**. Giá trị hợp lệ n bị lưu thành **n+1**. Giá trị không hợp lệ (≤ 0, chữ, rỗng) bị đổi thành 1. Do đó **không thể** đặt SL = 1 bằng cách nhập trong giỏ, vì nhập 1 sẽ thành 2.
- **V3 (nút +/−):** không có nút nên không có biên nào để kiểm tra. Fail theo R3.

## 5.5 Thăm dò: sửa SL bằng bàn phím như trên điện thoại

Script [`fr20_typing_probe.js`](../../scripts/fr20_typing_probe.js) mô phỏng thao tác thật: chạm vào ô SL (đang là 1), bấm **Backspace**, gõ **5**.

| Bước | Giá trị trong ô |
|---|---|
| Ban đầu | `1` |
| Sau Backspace | `1` (ô rỗng lập tức bị đổi lại thành 1) |
| Sau khi gõ `5` | **`16`** |

→ Trên điện thoại, người dùng **không thể** nhập số lượng mong muốn bằng bàn phím: muốn 5 thì nhận 16. [Ảnh](screenshots/PROBE_typing_mobile.png)

## 5.5b TC bổ sung sau AI gap analysis

Lớp mới được thêm ở [Bước 7](07_ai_gap_analysis.md). Dữ liệu thô: [`results_fr20_supplementary.json`](results_fr20_supplementary.json).

| TC | Lớp mới | Bước chính | Mong đợi | Thực tế | KQ |
|---|---|---|---|---|---|
| EP-19 | EC20: SP mà API chi tiết trả `price` **kiểu chuỗi** (`GET /api/products/4` → `"6000000"`, còn API danh sách trả số) | Chi tiết B (AirPods, id 4), SL 1 → Thêm; danh sách → Thêm B | 1 dòng, SL 2, Thành tiền 12.000.000 | 1 dòng, SL 2, 12,000,000 ₫ | Pass [ảnh](screenshots/EP-19_mobile.png) |

## 5.6 Tổng hợp

| Nhóm | Số TC | Pass | Fail | Không thực thi |
|---|---|---|---|---|
| EP | 18 | 2 (EP-02, EP-03) | 16 (EP-16 tính theo EP-16R) | 0 |
| BVA | 12 | 4 (BVA-01, 03, 04, 05) | 8 | 0 |
| Bổ sung (gap) | 1 | 1 (EP-19) | 0 | 0 |
| **Tổng** | **31** | **7** | **24** | **0** |

Có 31 lượt chạy (30 TC và EP-16R), 31 ảnh TC và 1 ảnh thăm dò. EP-05 và BVA-10 → BVA-12 được tính là **Fail** (không phải "chưa thực thi"), vì việc thiếu nút +/− chính là lỗi so với R3.

**Đề xuất cho sinh viên:** kiểm tra lại nhanh EP-04, EP-06, EP-08 trên điện thoại thật bằng Expo Go, rồi chụp ảnh bổ sung. Cần đổi `API_URL` trong `App.js` sang IP LAN hiện tại.
