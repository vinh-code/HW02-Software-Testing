---
name: domain-testing
description: Áp dụng Phân hoạch tương đương (EP) và Phân tích giá trị biên (BVA) theo đúng 7 bước của slide KCPM Bài 4 cho một tính năng của SUT (mặc định EShop) — xác định I/O, lớp tương đương, ca kiểm thử EP, BVA, thực thi tự động API+UI bằng Playwright, báo cáo lỗi (GitHub Issues hoặc bản xem trước Markdown) và AI gap analysis; mỗi bước một file Markdown và một git commit. Dùng khi người dùng yêu cầu "domain testing", "EP/BVA", "phân hoạch tương đương", "giá trị biên" cho một mã tính năng như FR-02.
argument-hint: "<FR-xx> [--channels api,ui,mobile] [--srs <đường dẫn SRS>] [--no-issues] [--repo owner/name]"
---

# Skill: Domain Testing (EP + BVA) cho một tính năng

Bạn là trợ lý kiểm thử **có kỷ luật**: đi đúng từng bước của kỹ thuật như đã dạy, không gộp bước, không "sinh test case và tìm bug" một lần. Người dùng là sinh viên chịu trách nhiệm cuối cùng — mọi điểm dừng ✋ phải chờ họ duyệt.

## 0. Tham số và thiết lập

Phân tích `$ARGUMENTS`:

| Tham số | Mặc định | Ý nghĩa |
|---|---|---|
| `FR-xx` (bắt buộc) | – | Mã tính năng cần kiểm thử |
| `--channels` | `api,ui` | Kênh thực thi: `api` (fetch), `ui` (Playwright web), `mobile` (Expo Web + mô phỏng thiết bị) |
| `--srs` | `../eshop-sut/README.md` + `../eshop-sut/api_specification.md` | Đặc tả làm cơ sở kiểm thử |
| `--no-issues` | tắt | **Không tạo GitHub Issue thật**; xuất `issues_preview.md` (dùng cho demo) |
| `--repo` | lấy từ `git remote get-url origin` | Repo nhận Issues |

Thiết lập (chỉ làm nếu thiếu, báo cho người dùng biết):
1. Thư mục làm việc: `features/<FR-xx>_<TenNgan>/screenshots/`.
2. `scripts/` của workspace có Playwright: nếu chưa có, chép các file trong `scripts/` của skill này sang và chạy `npm i playwright@1.49.1` (đặt `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` nếu `~/.cache/ms-playwright` đã có chromium).
3. Git: mỗi bước một commit, message `FR-xx [<BƯỚC>]: <tóm tắt>`. Không push/tạo Issue nếu người dùng chưa cho phép.

Đọc trước khi bắt đầu: [`reference/ep_rules.md`](reference/ep_rules.md), [`reference/bva_rules.md`](reference/bva_rules.md), [`reference/pitfalls_checklist.md`](reference/pitfalls_checklist.md). Dùng các khung trong [`templates/`](templates/) cho từng file.

## Quy tắc chung (bắt buộc)

- **Hộp đen trước, hộp trắng sau.** Ở B0–B4 chỉ đọc SRS và API spec, **không mở mã nguồn SUT**. Mã nguồn chỉ được đọc ở B6 để xác nhận nguyên nhân bug, và phải ghi rõ điều đó. (Bài học G3/G4/G5: kiến thức từ code làm "nhiễm" thiết kế EP.)
- **Tự đếm lại** mọi con số thống kê (số lớp, số TC, pass/fail) bằng lệnh/script trước khi ghi — không viết số từ trí nhớ.
- **Tiếng Việt**, bảng Markdown, mỗi giả định/điểm mơ hồ có mã `A1…An`, mỗi lớp `EC1…`, mỗi TC `EP-01…`/`BVA-01…`, TC bổ sung tiếp nối số thứ tự, chạy lại có hậu tố `R`.

## B0. Thu thập yêu cầu (không commit)

1. Đọc mục `FR-xx` trong SRS.
2. **Quét toàn bộ SRS** để tìm yêu cầu liên quan: bảo mật (`SEC-*`), giao diện (`FR-21/22/23`), phân quyền, các FR mà tính năng này dùng hoặc ảnh hưởng tới. Liệt kê cả những yêu cầu đã xem nhưng loại khỏi phạm vi, kèm lý do.
3. Xác định kênh thực thi thực tế (URL UI, endpoint API) bằng cách *quan sát* app đang chạy (mở trang, gọi API), không bằng đọc code.

## B1. Xác định Input & Output → `01_input_output.md` (điểm dừng)

Theo [`templates/01_input_output.md`](templates/01_input_output.md): bảng yêu cầu R1…Rn (có cột Nguồn), bảng Input (gồm cả **trạng thái hệ thống** ảnh hưởng tới kết quả), bảng Output (tách lớp đầu ra khi có nhiều công thức/loại kết quả), bảng điều kiện C1…Cn kèm **loại điều kiện** (value / range / set / boolean), bảng giả định A1…An, kênh thực thi và quan sát ban đầu.

**Dừng lại**, trình bày các giả định A1…An và hỏi người dùng chấp nhận / sửa. Chỉ commit `FR-xx [EP-B1]` sau khi được duyệt.

## B2. Lớp tương đương → `02_equivalence_classes.md`

- Lập bảng nguyên tắc theo loại điều kiện (xem `ep_rules.md`), rồi bảng EC đầy đủ: STT, Input/Output, Điều kiện, Lớp, Loại (Hợp lệ/Không hợp lệ), Giá trị đại diện.
- Áp dụng **checklist lớp bắt buộc** trong `pitfalls_checklist.md` §A (tiếng Việt có dấu, HTML/script, chỉ khoảng trắng, trường vắng mặt/`null`/sai kiểu ở API, lớp đầu ra, dữ liệu do hệ thống trả về…). Lớp nào không áp dụng thì ghi lý do.
- Nêu rõ **bộ giá trị nền hợp lệ** và dữ liệu cần chuẩn bị (tiền điều kiện).
- Thống kê số lớp hợp lệ/không hợp lệ (đếm lại). Commit `FR-xx [EP-B2]`.

## B3. Ca kiểm thử EP → `03_ep_test_cases.md`

- Bảng xác định TC cho từng lớp → **bảng rút gọn**: một TC phủ nhiều lớp hợp lệ; **mỗi TC chỉ một lớp không hợp lệ**.
- Lớp không hợp lệ quan trọng được lặp lại trên **mỗi thao tác/endpoint** khác nhau (Thêm/Sửa/Xóa…).
- Ma trận độ phủ EC → TC (phải đủ 100%), cột Kênh, lý do khi một TC chỉ chạy một kênh.
- Commit `FR-xx [EP-B3]`.

## B4. Phân tích giá trị biên → `04_bva_test_cases.md` (điểm dừng)

- Bảng "điều kiện nào có miền có thứ tự" → chọn biến V1…Vn; bảng biên (miền hợp lệ, LB, UB, bước nhảy).
- **Chọn biến thể và giải thích** theo `bva_rules.md` (Standard 4n+1, Robustness 6n+1, Worst-case 5ⁿ, Robust worst-case 7ⁿ; điều chỉnh 3n+1 cho biến chỉ có biên dưới; thêm điểm độ bền phía "∞" khi spec không có biên trên).
- **Mỗi giả định ở B1 phải có ít nhất 1 TC chạm vào nó** (không né giả định bằng cách chọn giá trị "an toàn").
- Bảng TC BVA với giá trị đã được **kiểm tra bằng script** (độ dài chuỗi, số ký tự từng loại…).
- **Điểm dừng:** Trình bày tổng số TC (EP + BVA) và kênh chạy; chờ người dùng xác nhận trước khi thực thi. Commit `FR-xx [BVA]`.

## B5. Thực thi → `05_test_execution.md` + `results_<fr>.json` + `screenshots/` (điểm dừng)

1. **Điểm dừng:** Xác nhận môi trường với người dùng: SUT đang chạy ở đâu, có cần reset DB không (EShop: khởi động lại backend sẽ seed lại DB), dữ liệu chuẩn bị sẽ tạo những gì. Mọi thay đổi môi trường (sửa IP, cài dependency) phải được ghi lại.
2. Sinh `scripts/<fr>_<ten>.js` từ [`scripts/runner_template.js`](scripts/runner_template.js): mảng TC dạng dữ liệu, mỗi TC chạy trên từng kênh, **hậu kiểm trạng thái hệ thống** (đọc lại qua API) trước/sau, chụp ảnh mỗi TC UI, ghi JSON kết quả.
3. **Chạy TC hợp lệ trước** (lọc bằng regex tham số dòng lệnh). Nếu TC hợp lệ Fail → phân tích **masking** trước khi chạy tiếp (`pitfalls_checklist.md` §B).
   - Kênh `mobile` (React Native/Expo, không có thiết bị): `npx expo install react-native-web react-dom @expo/metro-runtime`, `npx expo start --web --port 8081`, Playwright với `devices["Pixel 5"]`; đổi `API_URL` sang IP LAN; ghi rõ giới hạn (Alert không hiện trên web, bàn phím số không chặn chữ) và kết luận dựa trên hiệu ứng (`pitfalls_checklist.md` B7).
4. Chạy toàn bộ; đọc kết quả và kiểm tra **pass giả do trùng giá trị** và **masking do gộp tiêu chí đầu ra**; nếu có, thiết kế lượt chạy lại (`…R`) và giải thích.
5. Xem lại vài ảnh chụp bằng công cụ đọc ảnh để chắc ảnh thể hiện đúng kết quả.
6. Viết `05_test_execution.md`: môi trường, tiêu chí Pass/Fail, mục masking/pass giả, bảng kết quả EP và BVA (thực tế từng kênh + link ảnh), phân tích theo từng biến BVA, bảng tổng hợp (đếm lại từ JSON). Commit `FR-xx [EXEC]`.

## B6. Báo cáo lỗi → `06_bug_report.md` (+ GitHub Issues hoặc `issues_preview.md`) (điểm dừng)

- Gom các TC Fail theo **nguyên nhân gốc** thành bug `BUG-<FRxx>-NN`; bảng tổng hợp (ID, Tiêu đề, Severity, Priority, TC phát hiện).
- Mỗi bug: Tính năng & kỹ thuật, Severity + lý do, Các bước tái hiện, Kết quả mong đợi (trích SRS), Kết quả thực tế, Minh chứng (ảnh UI; ảnh request/response tạo bằng `scripts/api_evidence.js` cho lỗi tầng API).
- **Đánh giá severity theo chuỗi thao tác tiếp theo** của người dùng thật: thử thêm 1 kịch bản thăm dò xem lỗi hiển thị có dẫn tới hỏng dữ liệu thật không.
- Mục "Quan sát ngoài phạm vi" cho vấn đề thuộc FR khác.
- Commit `FR-xx [BUG]`.
- **Điểm dừng, Issues:** tạo Issue là thao tác ra bên ngoài.
  - Nếu có `--no-issues`: chạy `python3 scripts/create_issues.py <thư mục FR> <FR-xx> --preview` → sinh `issues_preview.md` (tiêu đề `[FR-xx] [TC] …`, nội dung, nhãn) — **không gọi GitHub**.
  - Ngược lại: hỏi người dùng xác nhận, `git push` để ảnh có URL, rồi `python3 scripts/create_issues.py <thư mục FR> <FR-xx> --repo <owner/name>`; script tự thêm cột Issue vào bảng bug. Commit `FR-xx [BUG]: đồng bộ Issues`.

## B7. AI gap analysis → `07_ai_gap_analysis.md`

- Rà soát lại thiết kế với `pitfalls_checklist.md` và kết quả thực thi; trung thực về những gì **chính AI** đã bỏ sót hoặc làm sai trong phiên này (kể cả lỗi thống kê, lỗi script, lựa chọn môi trường).
- Bảng gap: #, Gap, Loại, Phát hiện ở đâu, **Nguyên nhân** (chất lượng prompt / hạn chế của AI / độ phức tạp SUT / spec mơ hồ), Xử lý.
- Với mỗi lớp mới phát hiện: thêm EC mới, **chạy TC bổ sung** (`scripts/<fr>_supplementary.js`), cập nhật §5.xb của `05_test_execution.md` và bug report nếu Fail.
- Bảng rủi ro còn lại (lớp chưa phủ + lý do) và 3–4 bài học.
- Cập nhật dòng của tính năng trong bảng Test Summary của `README.md`. Commit `FR-xx [GAP]`.

## Kết thúc

Báo cáo ngắn cho người dùng: số TC (EP/BVA/bổ sung), pass/fail, số bug theo severity, link Issues (hoặc `issues_preview.md`), các điểm họ nên kiểm tra lại thủ công, và các commit đã tạo.
