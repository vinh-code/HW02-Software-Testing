// FR-09 — TC bổ sung sau AI gap analysis (EP-16, EP-17). Chạy sau fr09_coupon.js, không cần restart backend.
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const h = require("./fr09_coupon");

const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
// expired_at = hôm nay, 23:59 (giờ địa phương): theo A2 vẫn là "hết hạn hôm nay"
const todayLate = `${h.day(0)} 23:59:00`;

const SUP = [
  { id: "EP-16", coupon: { code: "EXPLATE", type: "percent", discount_value: 10, min_order_amount: 300000, expired_at: todayLate, max_uses_per_user: 1 }, price: 1000000, exp: "O2: hết hạn (expired_at là hôm nay, A2)" },
  { id: "EP-17", coupon: { code: "BIG200K", type: "fixed", discount_value: 200000, min_order_amount: 0, expired_at: "2099-12-31", max_uses_per_user: 1 }, price: 100000, exp: "O1 với final_amount ≥ 0 (không thể thanh toán số âm)" },
];

(async () => {
  const admin = (await h.login("admin@eshop.com", "Admin123!")).token;
  const browser = await chromium.launch();
  const out = [];
  const only = process.argv[2];
  const suffix = process.argv[3] || ""; // hậu tố email khi chạy lại (FR-01 cho phép email trùng, login sẽ lấy bản ghi cũ)
  const prev = (() => { try { return JSON.parse(fs.readFileSync(path.join(h.OUT_DIR, "results_fr09_supplementary.json"))).results; } catch { return []; } })();
  for (const tc of SUP) {
    if (only && tc.id !== only) { const p = prev.find((r) => r.id === tc.id); if (p) out.push(p); continue; }
    await h.call("POST", "/admin/coupons", tc.coupon, admin);
    const prod = await h.call("POST", "/products", { name: `TEST-F09 ${tc.price}`, price: tc.price, description: "Dữ liệu chuẩn bị", imageUrl: "https://placehold.co/300x300/png?text=F09", category_id: 3 }, admin);
    const u = await h.freshUser("api", tc.id + suffix);
    const api = await h.call("POST", "/apply-coupon", { code: tc.coupon.code, total_amount: tc.price, user_id: u.id }, u.token);
    console.log(`API ${tc.id} ${api.status} ${JSON.stringify(api.data)}`);
    const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
    const page = await ctx.newPage();
    const uu = await h.freshUser("ui", tc.id + suffix);
    await h.uiLogin(page, uu.email);
    await h.uiAddToCart(page, prod.data.id);
    await h.uiGoCheckout(page, []);
    const ui = await h.uiApply(page, tc.coupon.code);
    let order = null;
    await page.screenshot({ path: path.join(h.SHOT_DIR, `${tc.id}_ui.png`), fullPage: true });
    if (ui.success && tc.id === "EP-17") {
      await page.getByRole("button", { name: "Xác Nhận Thanh Toán" }).click();
      await page.getByText("Thanh toán thành công!").waitFor({ timeout: 4000 }).catch(() => {});
      const orders = (await h.call("GET", "/orders/my-orders", undefined, uu.token)).data;
      order = orders[0] || null;
    }
    await ctx.close();
    console.log(`UI  ${tc.id} ${JSON.stringify(ui)} order=${JSON.stringify(order)}`);
    out.push({ id: tc.id, coupon: tc.coupon, cart: tc.price, expected: tc.exp, api: { status: api.status, response: api.data }, ui, order });
  }
  await browser.close();
  fs.writeFileSync(path.join(h.OUT_DIR, "results_fr09_supplementary.json"), JSON.stringify({ executedAt: now.toISOString(), localTime: `${h.day(0)} ${pad(now.getHours())}:${pad(now.getMinutes())}`, results: out }, null, 2));
})();
