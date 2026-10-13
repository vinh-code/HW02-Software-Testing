// FR-15 Quản lý sản phẩm (CRUD) — thực thi 22 TC EP + 13 TC BVA trên API và Admin UI.
// Chạy: node fr15_products.js [regex lọc TC]   (restart backend trước để reset DB; admin :5174, web :5173 đang chạy)
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const API = "http://localhost:3000/api";
const ADMIN = "http://localhost:5174";
const WEB = "http://localhost:5173";
const OUT_DIR = path.resolve(__dirname, "../features/FR-15_ProductCRUD");
const SHOT_DIR = path.join(OUT_DIR, "screenshots");

const BASE = { name: "Tai nghe Sony WH-1000XM5", price: 1500000, category_id: 2, imageUrl: "https://placehold.co/300x300/png?text=F15" };
const XSS_NAME = `Loa <img src=x onerror="window.__xss15=1"> JBL "Pro" & 'Bass' – Âm trầm`;
const nameOfLen = (n) => ("BVA15-" + "x".repeat(300)).slice(0, n);

// op: create | update | delete; set: giá trị khác nền; auth: admin | none | user; target: "own" (SP do TC tạo sẵn) | id
const TCS = [
  { id: "EP-01", op: "create", ch: ["api", "ui"], exp: "O1a" },
  { id: "EP-02", op: "update", set: { name: "Tai nghe Sony WH-1000XM5 (đã sửa)", price: 1600000 }, ch: ["api", "ui"], exp: "O1b" },
  { id: "EP-03", op: "delete", ch: ["api", "ui"], exp: "O1c" },
  { id: "EP-04", op: "create", set: { name: XSS_NAME }, xss: true, ch: ["api", "ui"], exp: "O1a" },
  { id: "EP-05", op: "create", set: { price: 1500.5 }, ch: ["api", "ui"], exp: "O1a" },
  { id: "EP-06", op: "create", set: { name: "" }, ch: ["api", "ui"], exp: "O2" },
  { id: "EP-07", op: "create", set: { name: "   " }, ch: ["api", "ui"], exp: "O2" },
  { id: "EP-08", op: "create", set: { name: nameOfLen(300) }, ch: ["api", "ui"], exp: "O2" },
  { id: "EP-09", op: "create", set: { price: "" }, ch: ["api", "ui"], exp: "O2" },
  { id: "EP-10", op: "create", set: { price: 0 }, ch: ["api", "ui"], exp: "O2" },
  { id: "EP-11", op: "create", set: { price: -1000 }, ch: ["api", "ui"], exp: "O2" },
  { id: "EP-12", op: "create", set: { price: "abc" }, ch: ["api", "ui"], exp: "O2" },
  { id: "EP-13", op: "create", set: { category_id: null }, ch: ["api"], exp: "O2" },
  { id: "EP-14", op: "create", set: { category_id: 999 }, ch: ["api"], exp: "O2" },
  { id: "EP-15", op: "update", target: 99999, ch: ["api"], exp: "O2" },
  { id: "EP-16", op: "delete", target: 99999, ch: ["api"], exp: "O2" },
  { id: "EP-17", op: "create", auth: "none", ch: ["api"], exp: "O2" },
  { id: "EP-18", op: "create", auth: "user", ch: ["api"], exp: "O2" },
  { id: "EP-19", op: "update", auth: "none", set: { name: "Bị sửa khi không có token" }, ch: ["api"], exp: "O2" },
  { id: "EP-20", op: "delete", auth: "none", ch: ["api"], exp: "O2" },
  { id: "EP-21", op: "update", set: { name: "" }, ch: ["api", "ui"], exp: "O2" },
  { id: "EP-22", op: "update", set: { price: 0 }, ch: ["api", "ui"], exp: "O2" },

  { id: "BVA-01", op: "create", ch: ["api", "ui"], exp: "O1a" },
  { id: "BVA-02", op: "create", set: { name: nameOfLen(0) }, ch: ["api", "ui"], exp: "O2" },
  { id: "BVA-03", op: "create", set: { name: nameOfLen(1) }, ch: ["api", "ui"], exp: "O1a" },
  { id: "BVA-04", op: "create", set: { name: nameOfLen(2) }, ch: ["api", "ui"], exp: "O1a" },
  { id: "BVA-05", op: "create", set: { name: nameOfLen(254) }, ch: ["api", "ui"], exp: "O1a" },
  { id: "BVA-06", op: "create", set: { name: nameOfLen(255) }, ch: ["api", "ui"], exp: "O1a" },
  { id: "BVA-07", op: "create", set: { name: nameOfLen(256) }, ch: ["api", "ui"], exp: "O2" },
  { id: "BVA-08", op: "create", set: { price: 0 }, ch: ["api", "ui"], exp: "O2" },
  { id: "BVA-09", op: "create", set: { price: 1 }, ch: ["api", "ui"], exp: "O1a" },
  { id: "BVA-10", op: "create", set: { price: 2 }, ch: ["api", "ui"], exp: "O1a" },
  { id: "BVA-11", op: "create", set: { price: 2147483648 }, ch: ["api", "ui"], exp: "O1a" },
  { id: "BVA-12", op: "update", set: { name: nameOfLen(255) }, ch: ["api", "ui"], exp: "O1b" },
  { id: "BVA-13", op: "update", set: { name: nameOfLen(256) }, ch: ["api", "ui"], exp: "O2" },
];

async function call(method, url, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(API + url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  let data;
  try { data = await r.json(); } catch { data = null; }
  return { status: r.status, data };
}
const tokenOf = async (email, password) => (await call("POST", "/login", { email, password })).data.token;
const list = async () => (await call("GET", "/products")).data;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// So sánh danh sách SP trước/sau: trả về các SP khác (ngoài targetId) bị đổi hoặc biến mất
function othersChanged(before, after, targetId) {
  const changed = [];
  for (const p of before) {
    if (p.id === targetId) continue;
    const q = after.find((x) => x.id === p.id);
    if (!q) changed.push({ id: p.id, change: "bị xóa" });
    else if (!same(p, q)) changed.push({ id: p.id, before: p.name, after: q.name });
  }
  return changed;
}

function matches(p, d) {
  return p && p.name === d.name && Number(p.price) === Number(d.price) && String(p.category_id) === String(d.category_id);
}

function expectedData(tc, marker) {
  return { ...BASE, ...(tc.set || {}), description: marker };
}

async function makeTarget(admin, marker) {
  const r = await call("POST", "/products", { ...BASE, name: `F15 target ${marker}`, description: `${marker}-target` }, admin);
  return r.data.id;
}

// Đánh giá dựa trên trạng thái server (GET /api/products) — áp dụng cho cả hai kênh
function judgeServer(tc, d, before, after, targetId, marker) {
  const res = {};
  if (tc.op === "create") {
    const created = after.filter((p) => p.description === marker);
    res.created = created.map((p) => ({ id: p.id, name: p.name.length > 60 ? `${p.name.slice(0, 40)}… (len ${p.name.length})` : p.name, nameLen: p.name.length, price: p.price, category_id: p.category_id }));
    res.ok = tc.exp === "O1a" ? created.length === 1 && matches(created[0], d) : created.length === 0;
  } else {
    const t = after.find((p) => p.id === targetId);
    res.target = t ? { id: t.id, nameLen: (t.name || "").length, name: (t.name || "").slice(0, 60), price: t.price } : null;
    res.othersChanged = othersChanged(before, after, targetId);
    const tBefore = before.find((p) => p.id === targetId);
    if (tc.exp === "O1b") res.ok = matches(t, d) && res.othersChanged.length === 0;
    else if (tc.exp === "O1c") res.ok = !t && res.othersChanged.length === 0;
    else res.ok = same(t || null, tBefore || null) && res.othersChanged.length === 0;
  }
  return res;
}

async function runApi(tc, tokens) {
  const marker = `F15-${tc.id}-api`;
  const d = expectedData(tc, marker);
  const targetId = tc.op === "create" ? null : tc.target || (await makeTarget(tokens.admin, marker));
  const before = await list();
  const token = tokens[tc.auth || "admin"];
  let r;
  if (tc.op === "create") r = await call("POST", "/products", d, token);
  if (tc.op === "update") r = await call("PUT", `/products/${targetId}`, d, token);
  if (tc.op === "delete") r = await call("DELETE", `/products/${targetId}`, undefined, token);
  const after = await list();
  const s = judgeServer(tc, d, before, after, targetId, marker);
  const statusOk = tc.exp === "O2" ? r.status >= 400 && r.status < 500 : r.status >= 200 && r.status < 300;
  const res = { status: r.status, response: r.data, targetId, ...s, pass: statusOk && s.ok };
  console.log(`API ${tc.id.padEnd(7)} ${r.status} ${JSON.stringify(r.data).slice(0, 60)} ${JSON.stringify(s).slice(0, 140)} -> ${res.pass ? "PASS" : "FAIL"}`);
  return res;
}

async function adminLogin(page) {
  await page.goto(ADMIN);
  await page.fill('input[placeholder="Email"]', "admin@eshop.com");
  await page.fill('input[placeholder="Password"]', "Admin123!");
  await page.click("button:has-text('Login')");
  await page.waitForSelector("text=EShop Admin");
  await page.click("li:has-text('Sản phẩm')");
  await page.waitForSelector("text=Lưu sản phẩm");
  await page.waitForTimeout(400);
}

const uiNames = (page) => page.locator("table tbody tr td:nth-child(2)").allInnerTexts();

async function fillForm(page, d, notes) {
  await page.fill('input[placeholder="Tên sản phẩm"]', d.name);
  const price = page.locator('input[placeholder="Giá tiền"]');
  if (typeof d.price === "string" && d.price !== "" && isNaN(Number(d.price))) {
    await price.fill("");
    await price.click();
    await page.keyboard.type(d.price);
    notes.push(`gõ "${d.price}" vào ô Giá → giá trị ô = "${await price.inputValue()}"`);
  } else {
    await price.fill(String(d.price));
  }
  if (d.description !== undefined) await page.fill('textarea[placeholder="Mô tả"]', d.description);
  if (d.category_id != null) await page.selectOption("form select", String(d.category_id));
}

async function submit(page, notes) {
  const dialogs = [];
  const h = async (dlg) => { dialogs.push(dlg.message()); await dlg.accept(); };
  page.on("dialog", h);
  // Đọc trạng thái validation HTML5 trước khi bấm (form tự reset sau khi lưu thành công)
  const v = await page.locator('input[placeholder="Tên sản phẩm"]').evaluate((e) => e.validationMessage);
  if (v) notes.push(`HTML5 chặn: "${v}"`);
  await page.click("button:has-text('Lưu sản phẩm')");
  await page.waitForTimeout(1200);
  page.off("dialog", h);
  if (dialogs.length) notes.push(`alert: "${dialogs.join(" | ")}"`);
}

async function runUi(browser, tc, tokens) {
  const marker = `F15-${tc.id}-ui`;
  const d = expectedData(tc, marker);
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const notes = [];
  let s, uiOthers = null, extra = {};
  try {
    const targetId = tc.op === "create" ? null : await makeTarget(tokens.admin, marker);
    await adminLogin(page);
    const before = await list();
    const namesBefore = await uiNames(page);
    if (tc.op === "create") {
      await fillForm(page, d, notes);
      await submit(page, notes);
    } else {
      const row = page.locator("table tbody tr", { hasText: `F15 target ${marker}` });
      if (tc.op === "update") {
        await row.getByRole("button", { name: "Sửa" }).click();
        await fillForm(page, { ...d, description: undefined, category_id: null }, notes);
        await submit(page, notes);
      } else {
        page.once("dialog", async (dlg) => { notes.push(`dialog: "${dlg.message()}"`); await dlg.accept(); });
        await row.getByRole("button", { name: "Xóa" }).click();
        await page.waitForTimeout(1200);
        if (!notes.some((n) => n.startsWith("dialog"))) notes.push("không có hộp thoại xác nhận xóa");
      }
      // C8 nhìn từ phía người dùng: bảng trên màn hình sau khi lưu
      const namesAfter = await uiNames(page);
      const idxT = before.findIndex((p) => p.id === targetId);
      uiOthers = namesBefore.map((n, i) => ({ i, before: n, after: namesAfter[i] })).filter((x, i) => i !== idxT && x.before !== x.after && tc.op === "update");
      if (uiOthers.length) notes.push(`bảng UI: ${uiOthers.length} SP khác bị đổi tên, ví dụ "${uiOthers[0].before}" → "${(uiOthers[0].after || "").slice(0, 50)}"`);
    }
    const after = await list();
    // Sửa: dữ liệu mong đợi giữ mô tả cũ của target
    const dd = tc.op === "update" ? { ...d, description: `${marker}-target` } : d;
    s = judgeServer(tc, dd, before, after, targetId, marker);
    if (tc.xss) {
      extra.adminXss = await page.evaluate(() => window.__xss15 === 1);
      const id = s.created && s.created[0] && s.created[0].id;
      const web = await ctx.newPage();
      await web.goto(WEB);
      await web.waitForTimeout(800);
      const card = web.locator("h2", { hasText: "Loa <img" });
      extra.webHomeText = (await card.count()) ? await card.first().innerText() : null;
      extra.webHomeXss = await web.evaluate(() => window.__xss15 === 1);
      await card.first().scrollIntoViewIfNeeded().catch(() => {});
      await web.screenshot({ path: path.join(SHOT_DIR, `${tc.id}_web_home.png`) });
      await web.goto(`${WEB}/product/${id}`);
      await web.waitForSelector("h1");
      extra.webDetailText = await web.locator("h1").innerText();
      extra.webDetailXss = await web.evaluate(() => window.__xss15 === 1);
      await web.screenshot({ path: path.join(SHOT_DIR, `${tc.id}_web_detail.png`) });
      notes.push(`script chạy? admin=${extra.adminXss}, web home=${extra.webHomeXss}, web detail=${extra.webDetailXss}`);
      s.ok = s.ok && !extra.adminXss && !extra.webHomeXss && !extra.webDetailXss && extra.webDetailText === XSS_NAME;
    }
  } catch (e) {
    s = { ok: false };
    notes.push(`lỗi thực thi: ${e.message.split("\n")[0]}`);
  }
  await page.screenshot({ path: path.join(SHOT_DIR, `${tc.id}_ui.png`), fullPage: true });
  await ctx.close();
  const uiOk = !(uiOthers && uiOthers.length);
  const res = { ...s, notes, ...extra, uiOthersChanged: uiOthers ? uiOthers.length : null, shot: `${tc.id}_ui.png`, pass: s.ok && uiOk };
  console.log(`UI  ${tc.id.padEnd(7)} ${JSON.stringify({ ...s, notes }).slice(0, 260)} -> ${res.pass ? "PASS" : "FAIL"}`);
  return res;
}

(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const tokens = { admin: await tokenOf("admin@eshop.com", "Admin123!"), user: await tokenOf("test@eshop.com", "Test1234!"), none: null };
  const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
  const browser = await chromium.launch();
  const results = [];
  for (const tc of TCS) {
    if (only && !only.test(tc.id)) continue;
    const row = { id: tc.id, op: tc.op, set: tc.set ? Object.fromEntries(Object.entries(tc.set).map(([k, v]) => [k, typeof v === "string" && v.length > 60 ? `(chuỗi ${v.length} ký tự)` : v])) : {}, auth: tc.auth || "admin", target: tc.target || "own", expected: tc.exp };
    if (tc.ch.includes("api")) row.api = await runApi(tc, tokens);
    if (tc.ch.includes("ui")) row.ui = await runUi(browser, tc, tokens);
    results.push(row);
  }
  await browser.close();
  const file = path.join(OUT_DIR, only ? "results_fr15_partial.json" : "results_fr15.json");
  fs.writeFileSync(file, JSON.stringify({ executedAt: new Date().toISOString(), results }, null, 2));
})();
