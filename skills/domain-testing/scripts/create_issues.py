#!/usr/bin/env python3
"""Tạo GitHub Issues (hoặc bản xem trước Markdown) từ file 06_bug_report.md của một tính năng.

Cách dùng:
  python3 create_issues.py <thư mục tính năng> <FR-xx> [--repo owner/name] [--preview] [--dry-run]

- Mỗi mục "## BUG-..." trong 06_bug_report.md thành một Issue.
- Tiêu đề theo quy ước: [FR-xx] [Mã TC đầu tiên] Tóm tắt lỗi.
- Link tương đối (screenshots/*.png, *.md) được đổi thành link tuyệt đối trên GitHub;
  ảnh .png được nhúng trực tiếp để hiển thị trong Issue (cần push trước).
- --preview : KHÔNG gọi GitHub, ghi toàn bộ Issue sẽ tạo vào <thư mục>/issues_preview.md (dùng cho demo).
- --dry-run : chỉ in tiêu đề + severity.
- Khi tạo thật: ghi map Bug ID -> số Issue vào issues.json và thêm cột "Issue" vào bảng bug.
"""
import argparse
import json
import re
import subprocess
from pathlib import Path


def default_repo():
    try:
        url = subprocess.check_output(["git", "remote", "get-url", "origin"], text=True).strip()
        m = re.search(r"github\.com[:/](.+?)(\.git)?$", url)
        return m.group(1) if m else None
    except Exception:
        return None


def parse_bugs(text):
    # Bảng tổng hợp: | Bug ID | Tiêu đề | Severity | Priority | TC phát hiện | (Issue) |
    first_tc = {}
    for m in re.finditer(r"^\| (BUG-[\w-]+) \|[^|]*\|[^|]*\|[^|]*\| ([^|]+)\|", text, re.M):
        tc = re.search(r"(EP|BVA)-\d+R?", m.group(2))
        first_tc[m.group(1)] = tc.group(0) if tc else "EXP"
    bugs = []
    for sec in re.split(r"^## (?=BUG-)", text, flags=re.M)[1:]:
        sec = sec.split("\n---")[0]
        header, body = sec.split("\n", 1)
        bug_id, summary = re.match(r"(BUG-[\w-]+):?\s*(.*)", header).groups()
        sev = re.search(r"\*\*Severity:\*\*\s*(\w+)", body)
        bugs.append({"id": bug_id, "summary": summary.strip(), "body": body, "tc": first_tc.get(bug_id, "EXP"),
                     "severity": sev.group(1).lower() if sev else "major"})
    return bugs


def render_body(bug, rel, blob):
    def link(m):
        label, target = m.group(1), m.group(2)
        if target.startswith("http"):
            return m.group(0)
        url = f"{blob}/{rel}/{target}"
        if target.endswith(".png"):
            return f"\n\n**{label}**\n\n![{label}]({url}?raw=true)\n"
        return f"[{label}]({url})"

    body = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, bug["body"])
    return f"**Bug ID:** {bug['id']}\n" + body.strip() + (
        f"\n\n---\nNguồn: [{rel}/06_bug_report.md]({blob}/{rel}/06_bug_report.md)")


def add_issue_column(md_path, issues, repo):
    """Thêm cột "Issue" (#số, link GitHub) vào bảng tổng hợp bug."""
    lines = md_path.read_text(encoding="utf-8").split("\n")
    for i, ln in enumerate(lines):
        if ln.startswith("| Bug ID |") and "Issue" not in ln:
            lines[i] = ln + " Issue |"
            lines[i + 1] = lines[i + 1] + "---|"
        m = re.match(r"\| (BUG-[\w-]+) \|", ln)
        if m and m.group(1) in issues and "/issues/" not in ln:
            n = issues[m.group(1)]
            lines[i] = ln + f" [#{n}](https://github.com/{repo}/issues/{n}) |"
    md_path.write_text("\n".join(lines), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("feature_dir")
    ap.add_argument("fr")
    ap.add_argument("--repo", default=None)
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    feature_dir = Path(a.feature_dir).resolve()
    repo = a.repo or default_repo() or "OWNER/REPO"
    blob = f"https://github.com/{repo}/blob/main"
    git_root = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], cwd=feature_dir, text=True).strip())
    rel = feature_dir.relative_to(git_root).as_posix()
    bugs = parse_bugs((feature_dir / "06_bug_report.md").read_text(encoding="utf-8"))
    labels = lambda b: ["bug", f"severity:{b['severity']}", a.fr]

    if a.dry_run:
        for b in bugs:
            print(f"[{a.fr}] [{b['tc']}] {b['summary']} | {b['severity']}")
        return

    if a.preview:
        out = [f"# Xem trước GitHub Issues: {a.fr}", "",
               f"> Chế độ `--preview`: **chưa tạo Issue thật** trên `{repo}`. Mỗi mục dưới đây là đúng tiêu đề, nhãn và nội dung sẽ được gửi.", ""]
        for b in bugs:
            out += [f"## [{a.fr}] [{b['tc']}] {b['summary']}", "",
                    f"**Labels:** {', '.join('`' + x + '`' for x in labels(b))}", "",
                    render_body(b, rel, blob), "", "---", ""]
        p = feature_dir / "issues_preview.md"
        p.write_text("\n".join(out), encoding="utf-8")
        print(f"Đã ghi {len(bugs)} issue vào {p}")
        return

    out_path = feature_dir / "issues.json"
    issues = json.loads(out_path.read_text()) if out_path.exists() else {}
    for b in bugs:
        if b["id"] in issues:
            print(f"skip {b['id']} (#{issues[b['id']]})")
            continue
        cmd = ["gh", "issue", "create", "-R", repo, "--title", f"[{a.fr}] [{b['tc']}] {b['summary']}",
               "--body", render_body(b, rel, blob)]
        for lb in labels(b):
            cmd += ["--label", lb]
        url = subprocess.check_output(cmd, text=True).strip()
        issues[b["id"]] = int(url.rsplit("/", 1)[1])
        out_path.write_text(json.dumps(issues, indent=2) + "\n")
        print(b["id"], url)
    add_issue_column(feature_dir / "06_bug_report.md", issues, repo)


if __name__ == "__main__":
    main()
