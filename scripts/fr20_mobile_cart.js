// FR-20 Mobile: Giỏ hàng & Số lượng — thực thi 18 TC EP + 12 TC BVA trên app Expo (chạy bằng Expo Web, mô phỏng Pixel 5).
// Chạy: node fr20_mobile_cart.js [regex lọc TC]
//   Yêu cầu: backend :3000 (restart để reset DB), Expo web :8081 (cd eshop-sut/frontend-mobile && npx expo start --web --port 8081)
const fs = require("fs");
const path = require("path");
const { chromium, devices } = require("playwright");

const APP = "http://localhost:8081";
const API = "http://localhost:3000/api";
const OUT_DIR = path.resolve(__dirname, "../features/FR-20_Mobile_Cart");
const SHOT_DIR = path.join(OUT_DIR, "screenshots");
const A_ID = 5; // Bàn phím cơ Keychron Q1 — 4.000.000 ₫
const B_ID = 4; // Tai nghe AirPods Pro 2 — 6.000.000 ₫

const money = (s) => (s == null ? null : Number(String(s).replace(/[^\d-]/g, "")));

async function openApp(browser) {
  const ctx = await browser.newContext({ ...devices["Pixel 5"] });
  const page = await ctx.newPage();
  const dialogs = [];
  page.on("dialog", async (d) => { dialogs.push(d.message()); await d.accept(); });
  await page.goto(APP, { waitUntil: "networkidle", timeout: 120000 });
  await page.getByText(/Hiển thị \d+ sản phẩm/).waitFor({ timeout: 30000 });
  return { ctx, page, dialogs };
}

let ORDER = []; // thứ tự sản phẩm trên màn hình danh sách (= thứ tự GET /api/products)
const idx = (id) => ORDER.indexOf(id);

async function addFromList(page, id) {
  await page.getByText("Thêm vào giỏ", { exact: true }).nth(idx(id)).click();
  await page.waitForTimeout(300);
}

async function addFromDetail(page, id, qty, notes) {
  await page.getByText("Xem chi tiết", { exact: true }).nth(idx(id)).click();
  await page.getByText("Số lượng:").waitFor();
  await page.waitForTimeout(300);
  const input = page.locator("input").first();
  await input.fill(qty);
  notes.push(`ô SL chi tiết sau khi nhập "${qty}" = "${await input.inputValue()}"`);
  const btn = page.getByText("Thêm vào giỏ hàng", { exact: true });
  await btn.click();
  await page.waitForTimeout(400);
  const fb = await page.getByText("Đã thêm", { exact: true }).isVisible().catch(() => false);
  notes.push(`phản hồi sau khi thêm: ${fb ? 'nút đổi thành "Đã thêm"' : "không thấy"}`);
}

async function goHome(page) {
  await page.getByText("EShop Mobile", { exact: true }).click();
  await page.getByText(/Hiển thị \d+ sản phẩm/).waitFor();
}

async function openCart(page) {
  await page.getByText(/^Giỏ \(\d+\)$/).click();
  await page.getByText("Giỏ Hàng", { exact: true }).waitFor();
  await page.waitForTimeout(300);
}

async function readCart(page) {
  const text = await page.locator("body").innerText();
  const rows = text.split("\n").map((s) => s.trim()).filter(Boolean);
  const inputs = await page.locator("input").evaluateAll((els) => els.map((e) => e.value));
  const lines = [];
  rows.forEach((r, i) => {
    if (r.startsWith("Giá:")) {
      const tt = rows.slice(i).find((x) => x.startsWith("Thành tiền:"));
      lines.push({ name: rows[i - 1], price: money(r), lineTotal: money(tt), qty: inputs[lines.length] });
    }
  });
  const totalRow = rows.find((r) => /^Tổng[^:]*:/.test(r));
  const header = rows.find((r) => /^Giỏ \(\d+\)$/.test(r));
  return {
    lines,
    totalLabel: totalRow ? totalRow.split(":")[0] : null,
    total: totalRow ? money(totalRow.split(":")[1]) : null,
    headerCount: header ? Number(header.match(/\d+/)[0]) : null,
    empty: text.includes("Giỏ hàng của bạn đang trống"),
    hasContinue: text.includes("Tiếp tục mua sắm"),
    hasPlusMinus: (await page.getByText(/^[+−-]$/).count()) > 0,
    images: await page.locator("img").count(),
  };
}

async function editCartQty(page, i, v, notes) {
  const input = page.locator("input").nth(i);
  await input.fill(v);
  await page.waitForTimeout(300);
  notes.push(`ô SL trong giỏ sau khi nhập "${v}" = "${await input.inputValue()}"`);
}

// Chuẩn bị giỏ có A × k (k = 1: thêm từ danh sách; k > 1: từ trang chi tiết)
async function prepCart(page, k, notes) {
  if (k === 1) await addFromList(page, A_ID);
  else { await addFromDetail(page, A_ID, String(k), notes); await goHome(page); }
}

const line = (c) => c.lines[0] || {};
const okLine = (c, qty) => c.lines.length === 1 && Number(line(c).qty) === qty && line(c).lineTotal === 4000000 * qty && c.total === 4000000 * qty;

const detailInvalid = (v) => async ({ page, notes }) => {
  await addFromDetail(page, A_ID, v, notes);
  await goHome(page);
  await openCart(page);
  const c = await readCart(page);
  return { c, pass: c.empty && c.lines.length === 0, why: c.empty ? "không thêm" : `đã thêm A×${line(c).qty}` };
};
// Nhãn "Tổng cộng" (R7) chỉ được tính vào kết quả của EP-01 (TC phủ EC19), để lỗi nhãn không che kết quả số lượng ở các TC khác
const detailValid = (v, q, checkLabel = false) => async ({ page, notes }) => {
  await addFromDetail(page, A_ID, v, notes);
  await goHome(page);
  await openCart(page);
  const c = await readCart(page);
  return { c, pass: okLine(c, q) && (!checkLabel || c.totalLabel === "Tổng cộng"), why: `A×${line(c).qty}, thành tiền ${line(c).lineTotal}, ${c.totalLabel} ${c.total}` };
};
const cartEdit = (start, v, expectQty, valid) => async ({ page, notes }) => {
  await prepCart(page, start, notes);
  await openCart(page);
  await editCartQty(page, 0, v, notes);
  const c = await readCart(page);
  const pass = valid ? okLine(c, expectQty) : okLine(c, start);
  return { c, pass, why: `SL trong giỏ = ${line(c).qty}, thành tiền ${line(c).lineTotal}, tổng ${c.total}` };
};
const plusMinus = (start, sign, expectQty) => async ({ page, notes }) => {
  await prepCart(page, start, notes);
  await openCart(page);
  const c0 = await readCart(page);
  if (!c0.hasPlusMinus) return { c: c0, pass: false, why: "không có nút +/− trên dòng giỏ hàng", notExecutable: true };
  await page.getByText(sign === "+" ? "+" : /^[−-]$/).first().click();
  const c = await readCart(page);
  return { c, pass: okLine(c, expectQty), why: `SL = ${line(c).qty}` };
};

const TCS = {
  "EP-01": detailValid("3", 3, true),
  "EP-02": async ({ page, notes }) => {
    await addFromList(page, A_ID);
    await addFromDetail(page, A_ID, "2", notes);
    await goHome(page);
    await openCart(page);
    const c = await readCart(page);
    return { c, pass: okLine(c, 3), why: `${c.lines.length} dòng, SL ${c.lines.map((l) => l.qty).join("+")}` };
  },
  "EP-03": async ({ page }) => {
    await addFromList(page, A_ID);
    await addFromList(page, B_ID);
    await openCart(page);
    const c = await readCart(page);
    return { c, pass: c.lines.length === 2 && c.total === 10000000, why: `${c.lines.length} dòng, tổng ${c.total}` };
  },
  "EP-04": cartEdit(1, "5", 5, true),
  "EP-05": plusMinus(1, "+", 2),
  "EP-06": async ({ page, dialogs }) => {
    await addFromList(page, A_ID);
    await openCart(page);
    await page.getByText("Xóa", { exact: true }).first().click();
    await page.waitForTimeout(500);
    const c = await readCart(page);
    // Trên Expo Web, Alert.alert không hiển thị: nếu có bước xác nhận thì dòng sẽ KHÔNG bị xóa. Dòng biến mất ngay ⇒ không có xác nhận.
    return { c, pass: false, why: c.empty ? `dòng bị xóa NGAY khi bấm Xóa, không qua xác nhận (dialog web: ${dialogs.length})` : "dòng chưa bị xóa (có thể có bước xác nhận)", inferred: true };
  },
  "EP-07": async ({ page, dialogs }) => {
    await addFromList(page, A_ID);
    await openCart(page);
    await page.getByText("Xóa", { exact: true }).first().click();
    await page.waitForTimeout(500);
    const c = await readCart(page);
    return { c, pass: !c.empty, why: c.empty ? "không có cơ hội Hủy: dòng đã bị xóa ngay" : "dòng còn nguyên" };
  },
  "EP-08": async ({ page }) => {
    await openCart(page);
    const c = await readCart(page);
    return { c, pass: c.empty && c.hasContinue && c.images > 0, why: `thông báo: ${c.empty}, nút Tiếp tục mua sắm: ${c.hasContinue}, số hình: ${c.images}` };
  },
  "EP-09": detailInvalid("0"),
  "EP-10": detailInvalid("-2"),
  "EP-11": detailInvalid("1.5"),
  "EP-12": detailInvalid("abc"),
  "EP-13": detailInvalid(""),
  "EP-14": cartEdit(2, "0", null, false),
  "EP-15": cartEdit(2, "-2", null, false),
  "EP-16": cartEdit(2, "1.5", null, false),
  // EP-16R: chạy lại EP-16 với giỏ A×3 — ở EP-16, lỗi "+1" biến 1.5 → 2, trùng ngẫu nhiên với SL ban đầu (Pass giả)
  "EP-16R": cartEdit(3, "1.5", null, false),
  "EP-17": cartEdit(2, "abc", null, false),
  "EP-18": cartEdit(2, "", null, false),

  // EP-19 (bổ sung sau gap analysis): SP có giá trả về KIỂU CHUỖI ở API chi tiết (id chẵn) — thêm từ chi tiết rồi từ danh sách
  "EP-19": async ({ page, notes }) => {
    await addFromDetail(page, B_ID, "1", notes);
    await goHome(page);
    await addFromList(page, B_ID);
    await openCart(page);
    const c = await readCart(page);
    const l = c.lines[0] || {};
    return { c, pass: c.lines.length === 1 && Number(l.qty) === 2 && l.lineTotal === 12000000 && c.total === 12000000, why: `${c.lines.length} dòng, SL ${c.lines.map((x) => x.qty).join("+")}, thành tiền ${l.lineTotal}, tổng ${c.total}` };
  },

  "BVA-01": detailValid("3", 3),
  "BVA-02": detailInvalid("0"),
  "BVA-03": detailValid("1", 1),
  "BVA-04": detailValid("2", 2),
  "BVA-05": detailValid("999", 999),
  "BVA-06": cartEdit(2, "0", null, false),
  "BVA-07": cartEdit(2, "1", 1, true),
  "BVA-08": cartEdit(1, "2", 2, true),
  "BVA-09": cartEdit(1, "999", 999, true),
  "BVA-10": plusMinus(1, "-", 1),
  "BVA-11": plusMinus(2, "-", 1),
  "BVA-12": plusMinus(1, "+", 2),
};

(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  ORDER = (await (await fetch(`${API}/products`)).json()).map((p) => p.id);
  const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
  const browser = await chromium.launch();
  const results = [];
  for (const [id, fn] of Object.entries(TCS)) {
    if (only && !only.test(id)) continue;
    const app = await openApp(browser);
    const notes = [];
    let r;
    try {
      r = await fn({ ...app, notes });
    } catch (e) {
      r = { pass: false, why: `lỗi thực thi: ${e.message.split("\n")[0]}`, error: true };
    }
    await app.page.screenshot({ path: path.join(SHOT_DIR, `${id}_mobile.png`) });
    await app.ctx.close();
    results.push({ id, pass: r.pass, observed: r.why, notes, cart: r.c, notExecutable: !!r.notExecutable, inferred: !!r.inferred, shot: `${id}_mobile.png` });
    console.log(`${id.padEnd(7)} ${r.pass ? "PASS" : "FAIL"} | ${r.why} | ${notes.join("; ")} | nhãn tổng: ${r.c && r.c.totalLabel}`);
  }
  await browser.close();
  const file = path.join(OUT_DIR, only ? "results_fr20_partial.json" : "results_fr20.json");
  fs.writeFileSync(file, JSON.stringify({ executedAt: new Date().toISOString(), device: "Pixel 5 (Playwright emulation), Expo Web", results }, null, 2));
})();
