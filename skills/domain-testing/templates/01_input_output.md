# {{FR}} {{Tên tính năng}}: Bước 1, Xác định Input & Output

> Kỹ thuật: Phân hoạch tương đương, bước 1/3 (slide Bài 4, tr.6–7).
> Cơ sở kiểm thử: SRS mục {{FR}} + các yêu cầu liên quan trong toàn SRS (B0).

## 1.1 Trích yêu cầu từ SRS

| Mã | Nguồn | Nội dung đặc tả |
|---|---|---|
| R1 | {{FR}} | … |
| R… | SEC-xx / FR-2x | … |

**Yêu cầu đã xem nhưng không đưa vào phạm vi:** … (lý do)

## 1.2 Biến đầu vào (Input)

| Mã | Input | Kiểu | Ai kiểm soát / nơi nhập | Ràng buộc |
|---|---|---|---|---|
| I1 | … | … | … | R… |

**Trạng thái hệ thống ảnh hưởng tới kết quả:** …

## 1.3 Biến đầu ra (Output)

| Mã | Output | Mô tả |
|---|---|---|
| O1 | Thành công | … |
| O2 | Từ chối | Thông báo lỗi / HTTP 4xx; dữ liệu không đổi |

## 1.4 Các điều kiện cần phân hoạch

| Điều kiện | Biến | Loại điều kiện (slide tr.10) |
|---|---|---|
| C1. … | I1 | Boolean / Dãy giá trị `[a..b]` (**có thứ tự → BVA**) / Tập giá trị / Giá trị |

## 1.5 Điểm mơ hồ và giả định

| # | Điểm mơ hồ | Giả định áp dụng |
|---|---|---|
| A1 | … | … *(diễn giải của AI, sinh viên chấp nhận)* |

## 1.6 Kênh thực thi & quan sát ban đầu (hộp đen)

- **UI:** …
- **API:** …
- **Quan sát ban đầu:** …
