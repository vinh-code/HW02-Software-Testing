#!/usr/bin/env python3
"""Tạo GitHub Issues từ file 06_bug_report.md của một tính năng.

Cách dùng: python3 create_issues.py <thư mục tính năng> <FR-xx> [--dry-run]

- Mỗi mục "## BUG-..." trong 06_bug_report.md thành một Issue.
- Tiêu đề theo quy ước: [FR-xx] [Mã TC đầu tiên] Tóm tắt lỗi.
- Link tương đối (screenshots/*.png, *.md) được đổi thành link tuyệt đối trên GitHub;
  ảnh .png được nhúng trực tiếp để hiển thị trong Issue.
- Ghi map Bug ID -> số Issue vào issues.json trong thư mục tính năng.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

REPO = "vinh-code/HW02-Software-Testing"
BLOB = f"https://github.com/{REPO}/blob/main"


def main():
    feature_dir = Path(sys.argv[1]).resolve()
    fr = sys.argv[2]
    dry = "--dry-run" in sys.argv
    root = Path(__file__).resolve().parent.parent
    rel = feature_dir.relative_to(root).as_posix()
    text = (feature_dir / "06_bug_report.md").read_text(encoding="utf-8")

    # Bảng tổng hợp: | Bug ID | Tiêu đề | Severity | Priority | TC phát hiện |
    first_tc = {}
    for m in re.finditer(r"^\| (BUG-[\w-]+) \|[^|]*\|[^|]*\|[^|]*\| ([^|]+)\|", text, re.M):
        tc = re.search(r"(EP|BVA)-\d+R?", m.group(2))
        first_tc[m.group(1)] = tc.group(0) if tc else "EXP"

    sections = re.split(r"^## (?=BUG-)", text, flags=re.M)[1:]
    out_path = feature_dir / "issues.json"
    issues = json.loads(out_path.read_text()) if out_path.exists() else {}
    for sec in sections:
        sec = sec.split("\n---")[0]
        header, body = sec.split("\n", 1)
        bug_id, summary = re.match(r"(BUG-[\w-]+):?\s*(.*)", header).groups()
        if bug_id in issues:
            print(f"skip {bug_id} (#{issues[bug_id]})")
            continue

        def link(m):
            label, target = m.group(1), m.group(2)
            if target.startswith("http"):
                return m.group(0)
            url = f"{BLOB}/{rel}/{target}"
            if target.endswith(".png"):
                return f"\n\n**{label}**\n\n![{label}]({url}?raw=true)\n"
            return f"[{label}]({url})"

        body = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, body)
        body = f"**Bug ID:** {bug_id}\n" + body.strip() + (
            f"\n\n---\nNguồn: [{rel}/06_bug_report.md]({BLOB}/{rel}/06_bug_report.md)")
        title = f"[{fr}] [{first_tc.get(bug_id, 'EXP')}] {summary.strip()}"
        sev = re.search(r"\*\*Severity:\*\*\s*(\w+)", body).group(1).lower()
        if dry:
            print(title, "|", sev)
            continue
        url = subprocess.check_output(
            ["gh", "issue", "create", "-R", REPO, "--title", title, "--body", body,
             "--label", "bug", "--label", f"severity:{sev}", "--label", fr],
            text=True).strip()
        issues[bug_id] = int(url.rsplit("/", 1)[1])
        out_path.write_text(json.dumps(issues, indent=2) + "\n")
        print(bug_id, url)
    if not dry:
        add_issue_column(feature_dir / "06_bug_report.md", issues)


def add_issue_column(md_path, issues):
    """Thêm cột "Issue" (#số, link GitHub) vào bảng tổng hợp bug."""
    lines = md_path.read_text(encoding="utf-8").split("\n")
    for i, ln in enumerate(lines):
        if ln.startswith("| Bug ID |") and "Issue" not in ln:
            lines[i] = ln + " Issue |"
            lines[i + 1] = lines[i + 1] + "---|"
        m = re.match(r"\| (BUG-[\w-]+) \|", ln)
        if m and m.group(1) in issues and not ln.rstrip().endswith(")|") and "/issues/" not in ln:
            n = issues[m.group(1)]
            lines[i] = ln + f" [#{n}](https://github.com/{REPO}/issues/{n}) |"
    md_path.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
