// Chụp trang GitHub Issues (repo public) làm minh chứng: danh sách tất cả + lọc theo nhãn từng tính năng.
// Dùng: node shot_issues.js <owner/repo> <thư mục ra>
const path = require("path");
const { chromium } = require("playwright");

const [repo, outDir] = process.argv.slice(2);
const base = `https://github.com/${repo}/issues`;
const pages = [
  ["github_issues_all_p1.png", `${base}?q=is%3Aissue`],
  ["github_issues_all_p2.png", `${base}?q=is%3Aissue&page=2`],
  ...["FR-01", "FR-09", "FR-15", "FR-20"].map((fr) => [`github_issues_${fr}.png`, `${base}?q=is%3Aissue%20label%3A${fr}`]),
];

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "en-US" })).newPage();
  for (const [file, url] of pages) {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, file), fullPage: true });
    console.log("saved", file);
  }
  await browser.close();
})();
