// KHUNG thực thi TC EP/BVA trên API + UI (Playwright) — chép thành scripts/<fr>_<ten>.js rồi điền các chỗ "ĐIỀN".
// Dùng: node <fr>_<ten>.js [regex lọc TC]      ví dụ: node fr02_login.js "EP-0[12]"  (chạy TC hợp lệ trước)
//
// Nguyên tắc đã cài sẵn (xem skills/domain-testing/reference/pitfalls_checklist.md):
//  - TC là DỮ LIỆU (mảng TCS), mỗi TC chỉ một lớp không hợp lệ; dữ liệu duy nhất cho mỗi TC & mỗi kênh (B5)
//  - Hậu kiểm trạng thái hệ thống TRƯỚC/SAU qua API, không chỉ tin phản hồi (B4)
//  - Mỗi tiêu chí đầu ra được ghi riêng trong `checks` để tránh masking do gộp tiêu chí (B3)
//  - Đọc trạng thái validation trước khi submit (B6); chụp ảnh mọi TC UI; ghi results_<fr>.json
const fs = require("fs");
const path = require("path");
const { chromium, devices } = require("playwright");

// ===== ĐIỀN: cấu hình =====
const FR = "fr00"; // ví dụ "fr02"
const OUT_DIR = path.resolve(__dirname, "../features/FR-00_Example"); // thư mục tính năng
const API = process.env.API_BASE || "http://localhost:3000/api";
const WEB = process.env.WEB_URL || "http://localhost:5173";
const MOBILE = false; // true: mô phỏng Pixel 5 (Expo Web), xem FR-20
const SHOT_DIR = path.join(OUT_DIR, "screenshots");

// ===== ĐIỀN: ca kiểm thử (ví dụ mẫu: đăng nhập EShop) =====
// id, kênh, dữ liệu, output mong đợi (O1 thành công / O2 từ chối) + ghi chú lớp phủ
const TCS = [
  { id: "EP-01", ch: ["api", "ui"], data: { email: "test@eshop.com", password: "Test1234!" }, exp: "O1", covers: "EC1, EC3" },
  { id: "EP-02", ch: ["api", "ui"], data: { email: "test@eshop.com", password: "sai-mat-khau" }, exp: "O2", covers: "EC4" },
];

// ===== tiện ích chung =====
async function call(method, url, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(API + url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  let data;
  try { data = await r.json(); } catch { data = null; }
  return { status: r.status, data };
}
const is2xx = (s) => s >= 200 && s < 300;
const is4xx = (s) => s >= 400 && s < 500;

// ===== ĐIỀN: hậu kiểm — đọc trạng thái liên quan qua API (danh sách bản ghi, số tài khoản, đơn hàng…) =====
async function snapshot(tc) {
  return null; // ví dụ: (await call("GET", "/products")).data
}

// ===== ĐIỀN: đánh giá — trả về các tiêu chí RIÊNG RẼ và kết luận =====
function judge(tc, { status, ok, before, after }) {
  const checks = {};
  if (tc.exp === "O1") checks.accepted = ok;
  else checks.rejected = !ok;
  if (status !== undefined) checks.httpStatus = tc.exp === "O1" ? is2xx(status) : is4xx(status);
  // checks.othersUnchanged = …  (so sánh before/after khi TC có thể ảnh hưởng bản ghi khác)
  return { checks, pass: Object.values(checks).every(Boolean) };
}

// ===== ĐIỀN: kênh API =====
async function runApi(tc) {
  const before = await snapshot(tc);
  const r = await call("POST", "/login", tc.data);
  const after = await snapshot(tc);
  const ok = is2xx(r.status) && !!(r.data && r.data.token);
  const j = judge(tc, { status: r.status, ok, before, after });
  console.log(`API ${tc.id.padEnd(7)} ${r.status} ${JSON.stringify(r.data).slice(0, 90)} ${JSON.stringify(j.checks)} -> ${j.pass ? "PASS" : "FAIL"}`);
  return { status: r.status, response: r.data, ...j };
}

// ===== ĐIỀN: kênh UI =====
async function runUi(browser, tc) {
  const ctx = await browser.newContext(MOBILE ? { ...devices["Pixel 5"] } : { viewport: { width: 1100, height: 900 } });
  const page = await ctx.newPage();
  const notes = [];
  page.on("dialog", async (d) => { notes.push(`dialog: "${d.message()}"`); await d.accept(); });
  let ok = false;
  let j;
  try {
    const before = await snapshot(tc);
    await page.goto(`${WEB}/login`);
    const inputs = page.locator("form input");
    await inputs.nth(0).fill(tc.data.email);
    await inputs.nth(1).fill(tc.data.password);
    const v = await inputs.nth(0).evaluate((e) => e.form && !e.form.checkValidity() ? "HTML5 chặn" : "");
    if (v) notes.push(v);
    await page.locator("form button[type=submit]").click();
    await page.waitForTimeout(1200);
    ok = new URL(page.url()).pathname === "/";
    const err = page.locator(".bg-red-100");
    if (await err.count()) notes.push(`lỗi: "${(await err.first().innerText()).trim()}"`);
    const after = await snapshot(tc);
    j = judge(tc, { ok, before, after });
  } catch (e) {
    notes.push(`lỗi thực thi: ${e.message.split("\n")[0]}`);
    j = { checks: { executed: false }, pass: false };
  }
  const shot = `${tc.id}_ui.png`;
  await page.screenshot({ path: path.join(SHOT_DIR, shot), fullPage: true });
  await ctx.close();
  console.log(`UI  ${tc.id.padEnd(7)} ${notes.join("; ")} ${JSON.stringify(j.checks)} -> ${j.pass ? "PASS" : "FAIL"}`);
  return { notes, shot, ...j };
}

// ===== chạy =====
(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
  const browser = await chromium.launch();
  const results = [];
  for (const tc of TCS) {
    if (only && !only.test(tc.id)) continue;
    const row = { id: tc.id, covers: tc.covers, data: tc.data, expected: tc.exp };
    if (tc.ch.includes("api")) row.api = await runApi(tc);
    if (tc.ch.includes("ui")) row.ui = await runUi(browser, tc);
    row.pass = ["api", "ui"].filter((c) => row[c]).every((c) => row[c].pass);
    results.push(row);
  }
  await browser.close();
  const sum = { total: results.length, pass: results.filter((r) => r.pass).length };
  sum.fail = sum.total - sum.pass;
  console.log("Tổng hợp:", JSON.stringify(sum));
  const file = path.join(OUT_DIR, only ? `results_${FR}_partial.json` : `results_${FR}.json`);
  fs.writeFileSync(file, JSON.stringify({ executedAt: new Date().toISOString(), summary: sum, results }, null, 2));
})();
