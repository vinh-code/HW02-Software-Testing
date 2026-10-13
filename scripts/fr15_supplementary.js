// FR-15 — TC bổ sung sau AI gap analysis: EP-23 (Sửa thiếu trường), BVA-14 (255 ký tự tiếng Việt có dấu).
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const API = "http://localhost:3000/api";
const OUT = path.resolve(__dirname, "../features/FR-15_ProductCRUD");

async function call(method, url, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(API + url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: r.status, data: await r.json().catch(() => null) };
}
const all = async () => (await call("GET", "/products")).data;

(async () => {
  const admin = (await call("POST", "/login", { email: "admin@eshop.com", password: "Admin123!" })).data.token;
  const out = [];

  // EP-23: PUT chỉ gửi trường cần đổi (giá) — lớp mới EC22 "thiếu trường khi Sửa"
  const t = await call("POST", "/products", { name: "F15 target EP-23", price: 1500000, description: "F15-EP-23-api-target", imageUrl: "https://placehold.co/300x300/png?text=F15", category_id: 2 }, admin);
  const before = (await all()).find((p) => p.id === t.data.id);
  const r = await call("PUT", `/products/${t.data.id}`, { price: 1700000 }, admin);
  const after = (await all()).find((p) => p.id === t.data.id);
  console.log("EP-23", r.status, JSON.stringify({ before, after }));
  out.push({ id: "EP-23", request: { method: "PUT", body: { price: 1700000 } }, status: r.status, response: r.data, before, after, expected: "O2 (thiếu tên/danh mục bắt buộc) hoặc chỉ đổi giá, giữ nguyên các trường khác", pass: r.status >= 400 ? JSON.stringify(after) === JSON.stringify(before) : after.name === before.name && after.category_id === before.category_id && after.price === 1700000 });

  // BVA-14: tên đúng 255 ký tự tiếng Việt có dấu (329 byte UTF-8) — kiểm tra giả định A2 (đếm theo ký tự)
  const vn = "Tai nghe chống ồn – ".repeat(20).slice(0, 255);
  const enc = Buffer.byteLength(vn, "utf8");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("http://localhost:5174");
  await page.fill('input[placeholder="Email"]', "admin@eshop.com");
  await page.fill('input[placeholder="Password"]', "Admin123!");
  await page.click("button:has-text('Login')");
  await page.waitForSelector("text=EShop Admin");
  await page.click("li:has-text('Sản phẩm')");
  await page.fill('input[placeholder="Tên sản phẩm"]', vn);
  await page.fill('input[placeholder="Giá tiền"]', "1500000");
  await page.fill('textarea[placeholder="Mô tả"]', "F15-BVA-14-ui");
  await page.click("button:has-text('Lưu sản phẩm')");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, "screenshots", "BVA-14_ui.png"), fullPage: true });
  await browser.close();
  const created = (await all()).filter((p) => p.description === "F15-BVA-14-ui");
  const api = await call("POST", "/products", { name: vn, price: 1500000, description: "F15-BVA-14-api", imageUrl: "", category_id: 2 }, admin);
  const createdApi = (await all()).filter((p) => p.description === "F15-BVA-14-api");
  const ok = (c) => c.length === 1 && c[0].name === vn && [...c[0].name].length === 255;
  console.log("BVA-14", vn.length, enc, "ui:", created.length, created[0] && [...created[0].name].length, "api:", api.status, createdApi[0] && [...createdApi[0].name].length);
  out.push({ id: "BVA-14", nameChars: [...vn].length, nameBytes: enc, ui: { created: created.length, storedChars: created[0] && [...created[0].name].length, intact: ok(created) }, api: { status: api.status, storedChars: createdApi[0] && [...createdApi[0].name].length, intact: ok(createdApi) }, expected: "O1a, lưu đủ 255 ký tự", pass: ok(created) && ok(createdApi) });

  fs.writeFileSync(path.join(OUT, "results_fr15_supplementary.json"), JSON.stringify({ executedAt: new Date().toISOString(), results: out }, null, 2));
})();
