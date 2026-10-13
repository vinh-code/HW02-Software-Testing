# FR-01 Đăng ký tài khoản: Bước 4, Phân tích giá trị biên (BVA)

> Kỹ thuật: Phân tích giá trị biên (slide Bài 4, tr.20–26).
> Đầu vào: các lớp tương đương ở [Bước 2](02_equivalence_classes.md).

## 4.1 Xác định các miền có thứ tự

BVA chỉ dùng được khi lớp tương đương **có thứ tự** (slide tr.21). Ta xét lần lượt từng điều kiện:

| Điều kiện | Có thứ tự? | Áp dụng BVA? | Biến BVA |
|---|---|---|---|
| C1 Họ tên khác rỗng | Có. "Khác rỗng" nghĩa là **len(name) ≥ 1** | ✅ | V1 = len(Họ tên) |
| C2 Email đúng định dạng | Không, là mẫu cú pháp | ❌ (đã phủ bằng EP) | — |
| C3 Email duy nhất | Không, là thuộc tính tập hợp | ❌ (đã phủ bằng EP) | — |
| C4 len(MK) ≥ 8 | Có | ✅ | V2 = len(Mật khẩu) |
| C5 Có chữ hoa | Có. "Ít nhất 1" nghĩa là **số chữ hoa ≥ 1** | ✅ | V3 = #chữ hoa |
| C6 Có chữ thường | Có, **số chữ thường ≥ 1** | ✅ | V4 = #chữ thường |
| C7 Có chữ số | Có, **số chữ số ≥ 1** | ✅ | V5 = #chữ số |
| C8 Có ký tự đặc biệt thuộc tập | Có, **số ký tự thuộc `{@$!%*?&}` ≥ 1** | ✅ | V6 = #ký tự đặc biệt |
| C9 Xác nhận MK khớp | Không | ❌ (đã phủ bằng EP) | — |

> **Phân tích:** điều kiện "có ít nhất 1 X" thoạt nhìn là boolean. Thực chất nó là điều kiện trên một **biến đếm có thứ tự** (`count ≥ 1`), nên có biên dưới LB = 1. Vì vậy ta có thể áp dụng BVA cho cả 4 điều kiện thành phần của mật khẩu.

## 4.2 Biên của từng biến

| Biến | Miền hợp lệ | LB | UB | LB−1 | LB | LB+1 | Nominal |
|---|---|---|---|---|---|---|---|
| V1 len(Họ tên) | [1, ∞) | 1 | — (A1) | 0 | 1 | 2 | 12 (`Nguyen Van A`) |
| V2 len(Mật khẩu) | [8, ∞) | 8 | — (A1) | 7 | 8 | 9 | 12 |
| V3 #chữ hoa | [1, ∞) | 1 | — | 0 | 1 | 2 | 3 |
| V4 #chữ thường | [1, ∞) | 1 | — | 0 | 1 | 2 | 3 |
| V5 #chữ số | [1, ∞) | 1 | — | 0 | 1 | 2 | 3 |
| V6 #ký tự đặc biệt | [1, ∞) | 1 | — | 0 | 1 | 2 | 3 |

**Mật khẩu nominal:** `ABCdef123@!$` có độ dài 12, gồm 3 chữ hoa, 3 chữ thường, 3 chữ số và 3 ký tự đặc biệt. Mỗi đặc tính được chọn = 3 để giá trị nominal **khác** với LB+1 = 2. Như vậy điểm nominal không trùng với điểm biên.

## 4.3 Chọn biến thể BVA và tính số TC

- Slide nêu 4 biến thể: **Standard** (4n+1), **Robustness** (6n+1), **Worst-case** (5ⁿ), **Robust worst-case** (7ⁿ). Các công thức này giả định mỗi biến có **cả** min và max.
- Ở đây cả 6 biến **chỉ có biên dưới**, nên công thức được điều chỉnh như sau:
  - Standard (min, min+): 2n + 1 = 13 TC. **Không** kiểm tra phía không hợp lệ (LB−1).
  - **Robustness (min−, min, min+): 3n + 1 = 3×6 + 1 = 19 TC**. Có kiểm tra phía không hợp lệ. **→ Chọn biến thể này**, vì lỗi thường nằm ngay tại LB−1/LB (ví dụ viết nhầm `>` thành `>=`).
  - Worst-case (3⁶ = 729 TC) được **loại**. Các điều kiện độc lập nhau (giả định lỗi đơn), và số TC tăng quá nhanh so với lợi ích.
- **Bổ sung 2 TC độ bền cho phía "∞"** theo giả định A1: Họ tên và Mật khẩu dài 256 ký tự. Hệ thống phải chấp nhận vì spec không đặt giới hạn trên.

**Tổng: 19 + 2 = 21 TC.**

## 4.4 Bảng ca kiểm thử giá trị biên

Nguyên tắc: tại mỗi TC chỉ **một biến** nhận giá trị biên, các biến còn lại giữ giá trị nominal (slide tr.22). Mỗi TC dùng một email riêng `vinh.bvaNN@gmail.com`, và Xác nhận MK luôn bằng Mật khẩu.

| TC | Biến | Điểm | Họ tên | Mật khẩu | Đặc tính MK (len/U/L/D/S) | Output mong đợi |
|---|---|---|---|---|---|---|
| **BVA-01** | Nominal | — | `Nguyen Van A` | `ABCdef123@!$` | 12/3/3/3/3 | Thành công |
| **BVA-02** | V1 len(Họ tên) | LB−1 = 0 | `""` | `ABCdef123@!$` | 12/3/3/3/3 | Lỗi họ tên bắt buộc |
| **BVA-03** | V1 | LB = 1 | `A` | `ABCdef123@!$` | 12/3/3/3/3 | Thành công |
| **BVA-04** | V1 | LB+1 = 2 | `An` | `ABCdef123@!$` | 12/3/3/3/3 | Thành công |
| **BVA-05** | V2 len(MK) | LB−1 = 7 | `Nguyen Van A` | `ABcd1@!` | 7/2/2/1/2 | Lỗi MK yếu |
| **BVA-06** | V2 | LB = 8 | `Nguyen Van A` | `ABcd12@!` | 8/2/2/2/2 | Thành công |
| **BVA-07** | V2 | LB+1 = 9 | `Nguyen Van A` | `ABcde12@!` | 9/2/3/2/2 | Thành công |
| **BVA-08** | V3 #chữ hoa | LB−1 = 0 | `Nguyen Van A` | `abcdef123@!$` | 12/0/6/3/3 | Lỗi MK yếu |
| **BVA-09** | V3 | LB = 1 | `Nguyen Van A` | `Abcdef123@!$` | 12/1/5/3/3 | Thành công |
| **BVA-10** | V3 | LB+1 = 2 | `Nguyen Van A` | `ABcdef123@!$` | 12/2/4/3/3 | Thành công |
| **BVA-11** | V4 #chữ thường | LB−1 = 0 | `Nguyen Van A` | `ABCDEF123@!$` | 12/6/0/3/3 | Lỗi MK yếu |
| **BVA-12** | V4 | LB = 1 | `Nguyen Van A` | `ABCDEf123@!$` | 12/5/1/3/3 | Thành công |
| **BVA-13** | V4 | LB+1 = 2 | `Nguyen Van A` | `ABCDef123@!$` | 12/4/2/3/3 | Thành công |
| **BVA-14** | V5 #chữ số | LB−1 = 0 | `Nguyen Van A` | `ABCdefghi@!$` | 12/3/6/0/3 | Lỗi MK yếu |
| **BVA-15** | V5 | LB = 1 | `Nguyen Van A` | `ABCdefgh1@!$` | 12/3/5/1/3 | Thành công |
| **BVA-16** | V5 | LB+1 = 2 | `Nguyen Van A` | `ABCdefg12@!$` | 12/3/4/2/3 | Thành công |
| **BVA-17** | V6 #ký tự đặc biệt | LB−1 = 0 | `Nguyen Van A` | `ABCdef123ghi` | 12/3/6/3/0 | Lỗi MK yếu |
| **BVA-18** | V6 | LB = 1 | `Nguyen Van A` | `ABCdef123gh@` | 12/3/5/3/1 | Thành công |
| **BVA-19** | V6 | LB+1 = 2 | `Nguyen Van A` | `ABCdef123g@!` | 12/3/4/3/2 | Thành công |
| **BVA-20** | V1 (phía ∞) | 256 | `A` × 256 | `ABCdef123@!$` | 12/3/3/3/3 | Thành công |
| **BVA-21** | V2 (phía ∞) | 256 | `Nguyen Van A` | `ABCdef123@!$` × 21 + `ABCd` | 256/… | Thành công |

## 4.5 Ghi chú

- **Ràng buộc giữa các biến:** khi thay đổi V2 (độ dài), số ký tự mỗi loại cũng buộc phải thay đổi. Đó là lý do BVA-05/06/07 dùng 2 ký tự mỗi loại thay cho 3. Dù vậy, tất cả các đặc tính khác vẫn nằm trong miền hợp lệ (≥ 1). Như thế mỗi TC vẫn chỉ có **một** biến nằm ở biên.
- **Trùng lặp với EP:** BVA-05 (len 7) cùng lớp với EP-11, và BVA-02 cùng lớp với EP-03. Hai bên vẫn được giữ lại vì giá trị chọn khác nhau: EP chọn một giá trị đại diện bất kỳ, còn BVA chọn giá trị **sát biên**.
- **Biên của đầu ra:** đầu ra O1/O2 không có thứ tự, nên không có biên đầu ra cần xét.
