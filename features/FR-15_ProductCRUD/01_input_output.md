# FR-15 Quản lý sản phẩm (CRUD): Bước 1, Xác định Input & Output

> Kỹ thuật: Phân hoạch tương đương, bước 1/3 (slide Bài 4, tr.6–7).
> Cơ sở kiểm thử: SRS EShop mục FR-15. Như ở FR-09, AI được yêu cầu **liệt kê mọi yêu cầu liên quan trong toàn SRS** trước khi phân hoạch. Thêm bài học từ [FR-09 §7.4](../FR-09_Coupon/07_ai_gap_analysis.md): miền giá trị lấy theo **nơi dữ liệu được nhập** (form Admin, API), không theo dữ liệu mẫu.

## 1.1 Trích yêu cầu từ SRS

| Mã | Nguồn | Nội dung đặc tả |
|---|---|---|
| R1 | FR-15 | Admin có thể **Thêm / Xem / Sửa / Xóa** sản phẩm |
| R2 | FR-15 | Tên sản phẩm: **bắt buộc**, **tối đa 255 ký tự** |
| R3 | FR-15 | Giá: **bắt buộc**, phải là **số dương (> 0)** |
| R4 | FR-15 | Danh mục: **bắt buộc**, phải **chọn từ danh sách có sẵn** |
| R5 | FR-15 | Khi Sửa một sản phẩm, **chỉ sản phẩm đó bị thay đổi**, các sản phẩm khác giữ nguyên |
| R6 | FR-12, SEC-02, SEC-03 | `POST/PUT/DELETE /api/products` phải yêu cầu **JWT hợp lệ** và **`role = 'admin'`** |
| R7 | SEC-04 | Dữ liệu người dùng nhập vào, khi hiển thị, phải được **escape** (không render HTML) |
| R8 | SEC-05 | Truy vấn CSDL phải dùng parameterized query |
| R9 | FR-22 | Trường bắt buộc có dấu `*`; thông báo lỗi hiển thị **trên** nút submit |
| R10 | FR-21 | Nút nguy hiểm (Xóa) màu đỏ; nút tích cực (Lưu) màu xanh dương; tiền dùng `₫` và có phân cách hàng nghìn |

**Yêu cầu đã xem nhưng không đưa vào phạm vi:** FR-16 (import CSV) là tính năng riêng, có validation riêng. FR-14 (danh mục) chỉ dùng để biết "danh sách có sẵn" gồm những gì. FR-04 (tìm kiếm) dùng API `GET /api/products?search=`, không thuộc CRUD.

## 1.2 Biến đầu vào (Input)

| Mã | Input | Kiểu | Thao tác | Ràng buộc |
|---|---|---|---|---|
| I0 | Thao tác | {Thêm, Xem, Sửa, Xóa} | – | R1 |
| I1 | Tên sản phẩm (`name`) | chuỗi | Thêm, Sửa | R2, R7, R8 |
| I2 | Giá (`price`) | số | Thêm, Sửa | R3 |
| I3 | Danh mục (`category_id`) | id danh mục | Thêm, Sửa | R4 |
| I4 | Sản phẩm được chọn (`id`) | id sản phẩm | Sửa, Xóa | R1, R5 |
| I5 | Quyền của người gọi | {admin, user thường, không đăng nhập} | Thêm, Sửa, Xóa | R6 |
| – | Mô tả, URL ảnh | chuỗi | Thêm, Sửa | Spec **không** ràng buộc. Chỉ dùng giá trị hợp lệ cố định và làm "nhãn" nhận diện bản ghi của TC |

**Trạng thái hệ thống:**
- Danh sách danh mục seed: `1 Điện thoại`, `2 Laptop`, `3 Phụ kiện`.
- 5 sản phẩm seed có id 1–5.

## 1.3 Biến đầu ra (Output)

| Mã | Output | Mô tả |
|---|---|---|
| O1a | Thêm thành công | Sản phẩm mới xuất hiện trong danh sách Admin và trong `GET /api/products` với đúng dữ liệu đã nhập |
| O1b | Sửa thành công | **Chỉ** sản phẩm được chọn thay đổi, mọi sản phẩm khác giữ nguyên (R5) |
| O1c | Xóa thành công | Sản phẩm biến mất khỏi danh sách, các sản phẩm khác giữ nguyên |
| O1d | Hiển thị an toàn | Tên chứa ký tự đặc biệt/HTML được lưu và hiển thị **nguyên văn dưới dạng chữ** |
| O2 | Từ chối | Thông báo lỗi phù hợp (UI) hoặc HTTP 4xx (API); **dữ liệu không thay đổi** |

## 1.4 Các điều kiện cần phân hoạch (đầu vào cho Bước 2)

| Điều kiện | Biến | Loại điều kiện (slide tr.10) |
|---|---|---|
| C1. Tên khác rỗng | I1 | Boolean |
| C2. `1 ≤ len(tên) ≤ 255` | I1 | Dãy giá trị `[1..255]`, **có thứ tự nên áp dụng được BVA (hai biên)** |
| C3. Giá có mặt và là số | I2 | Boolean |
| C4. Giá > 0 | I2 | Dãy giá trị `(0..∞)`, **có thứ tự nên áp dụng được BVA** |
| C5. Danh mục có mặt và thuộc danh sách có sẵn | I3 | Tập giá trị {1, 2, 3} |
| C6. Sản phẩm được chọn tồn tại | I4 | Boolean |
| C7. Người gọi là admin | I5 | Tập giá trị {admin} |
| C8. Sửa chỉ ảnh hưởng 1 sản phẩm | O1b | Boolean (điều kiện trên **đầu ra**) |

## 1.5 Điểm mơ hồ trong đặc tả và giả định áp dụng

| # | Điểm mơ hồ | Giả định áp dụng |
|---|---|---|
| A1 | Tên chỉ có khoảng trắng | Coi như **rỗng**, tức là không hợp lệ (nhất quán với FR-01 A4) |
| A2 | "Tối đa 255 ký tự" đếm theo ký tự hay byte | Đếm theo **ký tự**. Giá trị test dùng ký tự ASCII nên hai cách đếm trùng nhau |
| A3 | Giá có được là số thập phân không | Spec chỉ yêu cầu "số dương", nên số thập phân dương (`1500.5`) là **hợp lệ**. Đơn vị nhỏ nhất dùng cho BVA là **1 ₫** |
| A4 | Spec không nêu giá tối đa | Không có biên trên. Thêm 1 TC giá trị rất lớn (vượt int32) để kiểm tra độ bền |
| A5 | "Chọn từ danh sách có sẵn" chỉ được UI đảm bảo (dropdown) | API cũng phải từ chối `category_id` không tồn tại hoặc bị thiếu |
| A6 | Sửa/Xóa sản phẩm không tồn tại | Trả lỗi 404, không thay đổi dữ liệu |

## 1.6 Kênh thực thi & quan sát ban đầu (hộp đen)

- **UI:** `http://localhost:5174`, đăng nhập `admin@eshop.com`, tab **Sản phẩm**. Form "Thêm sản phẩm mới" có: Tên sản phẩm, Giá tiền (`type="number"`), URL Ảnh, Mô tả, Danh mục (dropdown). Nút **Lưu sản phẩm**. Mỗi dòng của bảng có nút **Sửa** (vàng) và **Xóa** (đỏ).
- **API:** `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`, `GET /api/products` (API spec §3).
- **Quan sát ban đầu:**
  - Không trường nào có dấu `*` (R9).
  - Dropdown Danh mục luôn có sẵn một giá trị, nên trên UI **không tạo được** lớp "thiếu danh mục" hay "danh mục không tồn tại". Các lớp này chỉ kiểm thử được qua API.
  - Ô Giá là `type="number"`, nên trên UI không gõ được chữ.
  - Nút **Xóa** không có hộp thoại xác nhận. Spec FR-15 không yêu cầu, nên chỉ ghi nhận.
- **Nhận diện bản ghi của TC:** mỗi TC đặt **Mô tả** = `F15-<TC>-<kênh>`. Nhờ vậy, có thể tìm đúng bản ghi kể cả khi tên rỗng hoặc bị cắt.
