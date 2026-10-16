# Agent Skill `domain-testing` (EP + BVA)

Skill cho **Claude Code** giúp áp dụng Phân hoạch tương đương và Phân tích giá trị biên cho **một tính năng bất kỳ** theo đúng 7 bước của slide KCPM Bài 4, có điểm dừng để người duyệt và một git commit cho mỗi bước. Skill được xây dựng từ quá trình làm HW02 (FR-01, FR-09, FR-15, FR-20): mọi lỗi mà AI đã mắc trong 4 bản gap analysis được đưa vào [`reference/pitfalls_checklist.md`](reference/pitfalls_checklist.md) để lần sau AI không lặp lại.

## Cấu trúc

```
domain-testing/
├── SKILL.md                    # quy trình B0–B7, điểm dừng, tham số
├── reference/
│   ├── ep_rules.md             # quy tắc EP (bảng tạo lớp, 1 lớp không hợp lệ/TC, bảng rút gọn)
│   ├── bva_rules.md            # 4n+1 / 6n+1 / 5^n / 7^n, điều chỉnh 3n+1, điểm độ bền
│   └── pitfalls_checklist.md   # 24 cạm bẫy rút ra từ gap analysis (A: thiết kế, B: thực thi, C: báo cáo)
├── templates/01…07_*.md        # khung cho 7 file của mỗi tính năng
└── scripts/
    ├── runner_template.js      # khung chạy TC trên API + UI (Playwright), hậu kiểm, results JSON
    ├── api_evidence.js         # gửi request thật và render request/response thành ảnh PNG
    ├── ui_screenshot.js        # chụp trang web/admin/mobile (có đăng nhập) làm minh chứng
    ├── create_issues.py        # 06_bug_report.md → GitHub Issues, hoặc --preview → issues_preview.md
    └── package.json            # playwright 1.49.1
```

## Cài đặt

1. Đặt thư mục skill vào nơi Claude Code tìm skill:
   - Theo dự án: `<workspace>/.claude/skills/domain-testing` (repo này đã có symlink `.claude/skills/domain-testing → skills/domain-testing`).
   - Hoặc cho mọi dự án: `cp -r skills/domain-testing ~/.claude/skills/`.
2. Workspace cần có thư mục `scripts/` chứa các script trên và Playwright:
   ```bash
   mkdir -p scripts && cp skills/domain-testing/scripts/* scripts/
   cd scripts && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i   # bỏ biến môi trường nếu máy chưa có chromium của Playwright
   ```
3. (Tùy chọn) `gh auth login` nếu muốn tạo GitHub Issues thật.
4. SUT đang chạy (EShop: backend `:3000`, web `:5173`, admin `:5174`).

## Cách dùng

Trong Claude Code, tại thư mục workspace:

```
/domain-testing FR-02 --channels api,ui --no-issues
```

| Tham số | Ý nghĩa |
|---|---|
| `FR-xx` | mã tính năng |
| `--channels api,ui,mobile` | kênh thực thi |
| `--srs <path>` | đặc tả (mặc định `../eshop-sut/README.md`, `../eshop-sut/api_specification.md`) |
| `--no-issues` | không tạo Issue thật, chỉ xuất `issues_preview.md` |
| `--repo owner/name` | repo nhận Issues |

Skill sẽ lần lượt tạo `features/FR-xx_*/01…07_*.md`, `results_*.json`, `screenshots/`, script `scripts/frxx_*.js`, và commit `FR-xx [EP-B1]`, `[EP-B2]`, `[EP-B3]`, `[BVA]`, `[EXEC]`, `[BUG]`, `[GAP]`. Skill dừng lại để bạn duyệt ở: giả định (B1), bộ TC (B4), môi trường (B5) và trước khi tạo Issues (B6).

## Kịch bản video demo (YouTube, khoảng 10 phút)

| Phút | Nội dung |
|---|---|
| 0:00 | Giới thiệu: mục tiêu skill, cấu trúc thư mục, mở `SKILL.md` và `pitfalls_checklist.md` |
| 1:00 | Khởi động SUT; mở **phiên Claude Code mới**; gõ `/domain-testing FR-02 --no-issues` |
| 2:00 | B0–B1: AI liệt kê yêu cầu liên quan (SEC/GUI), giả định A1…An → **bạn duyệt/sửa một giả định** trước camera |
| 3:30 | B2–B3: bảng EC (chỉ ra lớp tiếng Việt/HTML/trường vắng mặt do checklist sinh ra), bảng rút gọn, ma trận độ phủ |
| 5:00 | B4: BVA, giải thích biến thể đã chọn → duyệt bộ TC |
| 6:00 | B5: Playwright chạy TC hợp lệ trước, rồi toàn bộ; mở vài ảnh chụp; mục masking/pass giả |
| 8:00 | B6: bug report + `issues_preview.md` (không tạo Issue thật) |
| 9:00 | B7: gap analysis; `git log --oneline` cho thấy mỗi bước một commit |
| 9:45 | Kết luận |

Gợi ý tính năng cho demo: **FR-02 Đăng nhập & khóa tài khoản** (biên số lần nhập sai). Lưu ý: test sai mật khẩu nhiều lần sẽ khóa tài khoản test, nên dùng tài khoản đăng ký riêng cho mỗi TC. Khởi động lại backend để reset DB trước khi quay.
