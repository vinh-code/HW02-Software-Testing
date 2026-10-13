#!/usr/bin/env bash
# Xuất lại toàn bộ PDF từ Markdown. Chạy từ thư mục gốc repo: bash scripts/build_docs.sh
set -e
cd "$(dirname "$0")/.."
TITLE="HW02 Domain Testing – 23120202 Phạm Quang Vinh"
APPX=""
for d in FR-01_Register FR-09_Coupon FR-15_ProductCRUD FR-20_Mobile_Cart; do
  for f in features/$d/0*.md; do APPX="$APPX $f"; done
done
node scripts/build_pdf.js --out REPORT.pdf --title "$TITLE" REPORT.md --appendix $APPX bugs/README.md --embed-images
[ -f ai-audit/AI_Critique.md ] && node scripts/build_pdf.js --out ai-audit/AI_Critique.pdf --title "$TITLE – AI Critique" ai-audit/AI_Critique.md
[ -f ai-audit/AI_Audit_Report.md ] && node scripts/build_pdf.js --out ai-audit/AI_Audit_Report.pdf --title "$TITLE – AI Audit Report" ai-audit/AI_Audit_Report.md
exit 0
