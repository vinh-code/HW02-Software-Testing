// FR-09 Mã giảm giá — thực thi 15 TC EP + 13 TC BVA trên API và UI.
// Chạy: node fr09_coupon.js   (restart backend trước để reset DB; web :5173 phải đang chạy)
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const API = "http://localhost:3000/api";
const WEB = "http://localhost:5173";
const OUT_DIR = path.resolve(__dirname, "../features/FR-09_Coupon");
const SHOT_DIR = path.join(OUT_DIR, "screenshots");
const DB_PATH = path.resolve(__dirname, "../../eshop-sut/backend/database.sqlite");
const SQLITE = path.resolve(__dirname, "../../eshop-sut/backend/node_modules/sqlite3");
const PW = "Abcdef1@";

// Ngày theo giờ địa phương (giả định A2), dạng YYYY-MM-DD
const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const ok = (discount, final) => ({ ok: true, discount, final });
const err = (kind) => ({ ok: false, kind });

// id, mã, tổng giỏ, đăng nhập (yes/no/fake), used, kênh, output mong đợi, tuỳ chọn
const TCS = [
  { id: "EP-01", code: "SAVE10", total: 1000000, ch: ["api", "ui"], exp: ok(100000, 900000) },
  { id: "EP-02", code: "BIGBUY", total: 1000000, ch: ["api", "ui"], exp: ok(50000, 950000) },
  { id: "EP-03", code: "save10", total: 1000000, ch: ["api", "ui"], exp: ok(100000, 900000) },
  { id: "EP-04", code: " VIP100 ", total: 1000000, ch: ["api", "ui"], exp: ok(100000, 900000) },
  { id: "EP-05", code: "ABC123", total: 1000000, ch: ["api", "ui"], exp: err("notfound") },
  { id: "EP-06", code: "", total: 1000000, ch: ["api", "ui"], exp: err("empty") },
  { id: "EP-07", code: "OFF10", total: 1000000, ch: ["api", "ui"], exp: err("inactive") },
  { id: "EP-08", code: "EXPIRED", total: 1000000, ch: ["api", "ui"], exp: err("expired") },
  { id: "EP-09", code: "EXP0D", total: 1000000, ch: ["api", "ui"], exp: err("expired") },
  { id: "EP-10", code: "SAVE10", total: 200000, ch: ["api", "ui"], exp: err("min") },
  { id: "EP-11", code: "SAVE10", total: 1000000, login: "no", ch: ["api", "ui"], exp: err("auth") },
  { id: "EP-12", code: "SAVE10", total: 1000000, login: "fake", ch: ["api"], exp: err("auth") },
  { id: "EP-13", code: "SAVE10", total: 1000000, used: ["SAVE10", 1], realCheckout: true, ch: ["api", "ui"], exp: err("used") },
  { id: "EP-14", code: "SAVE10", total: 1000000, used: ["SAVE10", 1], omitUserId: true, ch: ["api"], exp: err("used") },
  { id: "EP-15", code: "SAVE10", total: 200000, editTotal: 1000000, ch: ["ui"], exp: err("min") },

  { id: "BVA-01", code: "SAVE10", total: 1000000, ch: ["api", "ui"], exp: ok(100000, 900000) },
  { id: "BVA-02", code: "SAVE10", total: 299999, ch: ["api", "ui"], exp: err("min") },
  { id: "BVA-03", code: "SAVE10", total: 300000, ch: ["api", "ui"], exp: ok(30000, 270000) },
  { id: "BVA-04", code: "SAVE10", total: 300001, ch: ["api", "ui"], exp: ok(30000, 270001) },
  { id: "BVA-05", code: "BIGBUY", total: 499999, ch: ["api", "ui"], exp: err("min") },
  { id: "BVA-06", code: "BIGBUY", total: 500000, ch: ["api", "ui"], exp: ok(50000, 450000) },
  { id: "BVA-07", code: "BIGBUY", total: 500001, ch: ["api", "ui"], exp: ok(50000, 450001) },
  { id: "BVA-08", code: "EXP0D", total: 1000000, ch: ["api", "ui"], exp: err("expired") },
  { id: "BVA-09", code: "EXP1D", total: 1000000, ch: ["api", "ui"], exp: ok(100000, 900000) },
  { id: "BVA-10", code: "EXP2D", total: 1000000, ch: ["api", "ui"], exp: ok(100000, 900000) },
  { id: "BVA-11", code: "VIP100", total: 1000000, used: ["VIP100", 0], ch: ["api", "ui"], exp: ok(100000, 900000) },
  { id: "BVA-12", code: "VIP100", total: 1000000, used: ["VIP100", 1], ch: ["api", "ui"], exp: ok(100000, 900000) },
  { id: "BVA-13", code: "VIP100", total: 1000000, used: ["VIP100", 2], ch: ["api", "ui"], exp: err("used") },
];

const PREP_PRICES = [200000, 299999, 300000, 300001, 499999, 500000, 500001, 1000000];
const PREP_COUPONS = [
  { code: "OFF10", expired_at: "2099-12-31" },
  { code: "EXP0D", expired_at: day(0) },
  { code: "EXP1D", expired_at: day(1) },
  { code: "EXP2D", expired_at: day(2) },
].map((c) => ({ type: "percent", discount_value: 10, min_order_amount: 300000, max_uses_per_user: 1, ...c }));

async function call(method, url, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(API + url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  let data;
  try { data = await r.json(); } catch { data = null; }
  return { status: r.status, data };
}

async function login(email, password) {
  const r = await call("POST", "/login", { email, password });
  return { token: r.data.token, id: r.data.user.id };
}

// User mới cho mỗi TC (C5 phụ thuộc lịch sử dùng mã của user)
async function freshUser(ch, id) {
  const email = `vinh.${ch}.f09.${id.toLowerCase().replace("-", "")}@gmail.com`;
  await call("POST", "/register", { name: `F09 ${ch} ${id}`, email, password: PW });
  return { email, ...(await login(email, PW)) };
}

async function prepare(admin) {
  const products = {};
  for (const price of PREP_PRICES) {
    const r = await call("POST", "/products", { name: `TEST-F09 ${price}`, price, description: "Sản phẩm test FR-09 (dữ liệu chuẩn bị)", imageUrl: "https://placehold.co/300x300/png?text=F09", category_id: 3 }, admin);
    products[price] = r.data.id;
  }
  for (const c of PREP_COUPONS) await call("POST", "/admin/coupons", c, admin);
  // A6: FR-17 không có chức năng vô hiệu hóa, nên đặt is_active = 0 trực tiếp trong CSDL
  const sqlite3 = require(SQLITE);
  const db = new sqlite3.Database(DB_PATH);
  await new Promise((res, rej) => db.run("UPDATE coupons SET is_active = 0 WHERE code = 'OFF10'", (e) => (e ? rej(e) : res())));
  db.close();
  const coupons = {};
  for (const c of (await call("GET", "/coupons", undefined, admin)).data) coupons[c.code] = c;
  return { products, coupons };
}

// Tạo lịch sử dùng mã: đúng lời gọi UI thực hiện sau khi thanh toán có mã (Checkout.jsx)
async function addUsage(user, coupon, n) {
  for (let i = 0; i < n; i++) await call("POST", "/coupon-usage", { coupon_id: coupon.id }, user.token);
}

function judge(exp, success, discount, final) {
  if (exp.ok) return success && discount === exp.discount && final === exp.final;
  return !success;
}

async function runApi(tc, prep) {
  const user = await freshUser("api", tc.id);
  if (tc.used) await addUsage(user, prep.coupons[tc.used[0]], tc.used[1]);
  const login = tc.login || "yes";
  const token = login === "yes" ? user.token : login === "fake" ? "abc.def.ghi" : null;
  const body = { code: tc.code, total_amount: tc.total };
  if (!tc.omitUserId) body.user_id = login === "yes" ? user.id : null;
  const r = await call("POST", "/apply-coupon", body, token);
  const success = r.status === 200 && !!(r.data && r.data.success);
  const res = { request: body, auth: login, status: r.status, response: r.data, pass: judge(tc.exp, success, r.data?.discount_amount, r.data?.final_amount) };
  console.log(`API ${tc.id.padEnd(7)} ${String(r.status)} ${JSON.stringify(r.data).slice(0, 110)} -> ${res.pass ? "PASS" : "FAIL"}`);
  return res;
}

const num = (s) => (s == null ? null : Number(s.replace(/[^\d-]/g, "")));

async function uiLogin(page, email) {
  await page.goto(`${WEB}/login`);
  const inputs = page.locator("form input");
  await inputs.nth(0).fill(email);
  await inputs.nth(1).fill(PW);
  await page.locator("form button[type=submit]").click();
  await page.waitForURL(WEB + "/", { timeout: 5000 });
}

async function uiAddToCart(page, productId) {
  await page.goto(`${WEB}/product/${productId}`);
  await page.waitForSelector("h1");
  await page.waitForTimeout(600); // chờ AuthContext tải lại user từ token
  const btn = page.getByRole("button", { name: /Thêm vào giỏ hàng/ });
  await btn.click();
  if (await btn.isVisible().catch(() => false)) await btn.click(); // lỗi đã biết: lần bấm đầu không có tác dụng
  await page.getByText("Đã thêm").waitFor({ timeout: 3000 });
}

async function uiGoCheckout(page, notes) {
  await page.getByRole("link", { name: "Giỏ hàng" }).click();
  page.once("dialog", async (d) => { notes.push(`dialog: "${d.message()}"`); await d.accept(); });
  await page.getByRole("button", { name: "Tiến hành thanh toán" }).click();
  await page.waitForTimeout(500);
}

async function uiApply(page, code) {
  const input = page.getByPlaceholder("Nhập mã giảm giá...");
  await input.fill(code);
  const btn = page.getByRole("button", { name: "Áp dụng" });
  if (await btn.isDisabled()) return { disabled: true, success: false, msg: "(nút Áp dụng bị vô hiệu hóa)" };
  await btn.click();
  const red = page.locator("p.text-red-600.text-sm");
  const green = page.locator("div.text-green-700");
  await Promise.race([red.waitFor({ timeout: 4000 }), green.waitFor({ timeout: 4000 })]).catch(() => {});
  if (await green.isVisible()) {
    const t = await green.innerText();
    return { success: true, msg: t.split("\n")[0], discount: num((t.match(/Tiết kiệm:\s*([-\d.,]+)/) || [])[1]), final: num((t.match(/Thành tiền:\s*([-\d.,]+)/) || [])[1]) };
  }
  if (await red.isVisible()) return { success: false, msg: await red.innerText() };
  return { success: false, msg: "(không có phản hồi)" };
}

async function runUi(browser, tc, prep) {
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await ctx.newPage();
  const notes = [];
  const shot = `${tc.id}_ui.png`;
  let r;
  try {
    const login = tc.login || "yes";
    const user = await freshUser("ui", tc.id);
    if (tc.used && !tc.realCheckout) {
      await addUsage(user, prep.coupons[tc.used[0]], tc.used[1]);
      notes.push(`chuẩn bị used=${tc.used[1]} qua POST /api/coupon-usage`);
    }
    if (login === "yes") await uiLogin(page, user.email);
    if (tc.realCheckout) {
      // EP-13: tạo used = 1 bằng một lần thanh toán thật có áp mã trên UI (giả định A4)
      await uiAddToCart(page, prep.products[tc.total]);
      await uiGoCheckout(page, notes);
      const first = await uiApply(page, tc.code);
      await page.getByRole("button", { name: "Xác Nhận Thanh Toán" }).click();
      await page.getByText("Thanh toán thành công!").waitFor({ timeout: 4000 });
      notes.push(`lần 1: áp ${tc.code} → "${first.msg}", thanh toán thành công`);
      await page.screenshot({ path: path.join(SHOT_DIR, `${tc.id}_ui_lan1.png`), fullPage: true });
      await page.getByRole("button", { name: "Quay lại trang chủ" }).click();
    }
    await uiAddToCart(page, prep.products[tc.total]);
    await uiGoCheckout(page, notes);
    if (login === "no") {
      notes.push(`sau khi bấm thanh toán: URL = ${new URL(page.url()).pathname}`);
      // Mở thẳng /checkout bằng điều hướng phía client (giữ nguyên giỏ hàng trong bộ nhớ)
      await page.evaluate(() => { history.pushState({}, "", "/checkout"); dispatchEvent(new PopStateEvent("popstate")); });
      await page.waitForTimeout(500);
      notes.push(`mở /checkout khi chưa đăng nhập: ${await page.getByPlaceholder("Nhập mã giảm giá...").isVisible() ? "trang Checkout hiển thị" : "bị chặn"}`);
    }
    if (tc.editTotal) {
      await page.locator("input[type=number]").fill(String(tc.editTotal));
      notes.push(`sửa ô "Tổng tiền thanh toán" từ ${tc.total} thành ${tc.editTotal}: thành công`);
    }
    const shown = await page.locator("input[type=number]").inputValue();
    notes.push(`ô tổng tiền = ${shown}`);
    r = await uiApply(page, tc.code);
  } catch (e) {
    r = { success: false, msg: `(lỗi thực thi: ${e.message.split("\n")[0]})`, error: true };
  }
  await page.screenshot({ path: path.join(SHOT_DIR, shot), fullPage: true });
  await ctx.close();
  const res = { ...r, notes, shot, pass: !r.error && judge(tc.exp, r.success, r.discount, r.final) };
  console.log(`UI  ${tc.id.padEnd(7)} ${r.success ? "OK " : "ERR"} ${r.msg} ${r.discount ?? ""}/${r.final ?? ""} | ${notes.join("; ")} -> ${res.pass ? "PASS" : "FAIL"}`);
  return res;
}

module.exports = { call, login, freshUser, uiLogin, uiAddToCart, uiGoCheckout, uiApply, day, API, WEB, SHOT_DIR, OUT_DIR };

if (require.main === module) (async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const admin = (await login("admin@eshop.com", "Admin123!")).token;
  const prep = await prepare(admin);
  console.log("Dữ liệu chuẩn bị:", JSON.stringify(prep.products), Object.keys(prep.coupons).join(","));
  const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
  const browser = await chromium.launch();
  const results = [];
  for (const tc of TCS) {
    if (only && !only.test(tc.id)) continue;
    const row = { id: tc.id, code: tc.code, total: tc.total, login: tc.login || "yes", used: tc.used || null, expected: tc.exp };
    if (tc.ch.includes("api")) row.api = await runApi(tc, prep);
    if (tc.ch.includes("ui")) row.ui = await runUi(browser, tc, prep);
    results.push(row);
  }
  await browser.close();
  const out = { executedAt: new Date().toISOString(), today: day(0), prep: { products: prep.products, coupons: Object.values(prep.coupons) }, results };
  fs.writeFileSync(path.join(OUT_DIR, "results_fr09.json"), JSON.stringify(out, null, 2));
})();
