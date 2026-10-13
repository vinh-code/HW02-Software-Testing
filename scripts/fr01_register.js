// FR-01 Đăng ký tài khoản — thực thi 19 TC EP + 21 TC BVA trên API và UI.
// Chạy: node fr01_register.js   (backend :3000 và web :5173 phải đang chạy, nên restart backend trước để reset DB)
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const API = "http://localhost:3000/api";
const WEB = "http://localhost:5173";
const OUT_DIR = path.resolve(__dirname, "../features/FR-01_Register");
const SHOT_DIR = path.join(OUT_DIR, "screenshots");

const N = "Nguyen Van A";
const P = "Abcdef1@";
const PN = "ABCdef123@!$";
const OK = "O1";
const ERR = "O2";

// [id, họ tên, email, mật khẩu, xác nhận MK, output mong đợi]
const EP = [
  ["EP-01", N, "vinh.ep01@gmail.com", P, P, OK],
  ["EP-02", N, "vinh.ep02@gmail.com", "Abcde1@#", "Abcde1@#", OK],
  ["EP-03", "", "vinh.ep03@gmail.com", P, P, ERR],
  ["EP-04", "   ", "vinh.ep04@gmail.com", P, P, ERR],
  ["EP-05", N, "vinh.gmail.com", P, P, ERR],
  ["EP-06", N, "@gmail.com", P, P, ERR],
  ["EP-07", N, "vinh@gmail", P, P, ERR],
  ["EP-08", N, "", P, P, ERR],
  ["EP-09", N, "test@eshop.com", P, P, ERR],
  ["EP-10", N, "TEST@eshop.com", P, P, ERR],
  ["EP-11", N, "vinh.ep11@gmail.com", "Abcd1@x", "Abcd1@x", ERR],
  ["EP-12", N, "vinh.ep12@gmail.com", "", "", ERR],
  ["EP-13", N, "vinh.ep13@gmail.com", "abcdef1@", "abcdef1@", ERR],
  ["EP-14", N, "vinh.ep14@gmail.com", "ABCDEF1@", "ABCDEF1@", ERR],
  ["EP-15", N, "vinh.ep15@gmail.com", "Abcdefg@", "Abcdefg@", ERR],
  ["EP-16", N, "vinh.ep16@gmail.com", "Abcdefg1", "Abcdefg1", ERR],
  ["EP-17", N, "vinh.ep17@gmail.com", "Abcdef1#", "Abcdef1#", ERR],
  ["EP-18", N, "vinh.ep18@gmail.com", P, "Abcdef1!", ERR],
  ["EP-19", N, "vinh.ep19@gmail.com", P, "", ERR],
];

const bvaRow = (id, name, pw, exp) => [id, name, `vinh.${id.toLowerCase().replace("-", "")}@gmail.com`, pw, pw, exp];
const BVA = [
  bvaRow("BVA-01", N, PN, OK),
  bvaRow("BVA-02", "", PN, ERR),
  bvaRow("BVA-03", "A", PN, OK),
  bvaRow("BVA-04", "An", PN, OK),
  bvaRow("BVA-05", N, "ABcd1@!", ERR),
  bvaRow("BVA-06", N, "ABcd12@!", OK),
  bvaRow("BVA-07", N, "ABcde12@!", OK),
  bvaRow("BVA-08", N, "abcdef123@!$", ERR),
  bvaRow("BVA-09", N, "Abcdef123@!$", OK),
  bvaRow("BVA-10", N, "ABcdef123@!$", OK),
  bvaRow("BVA-11", N, "ABCDEF123@!$", ERR),
  bvaRow("BVA-12", N, "ABCDEf123@!$", OK),
  bvaRow("BVA-13", N, "ABCDef123@!$", OK),
  bvaRow("BVA-14", N, "ABCdefghi@!$", ERR),
  bvaRow("BVA-15", N, "ABCdefgh1@!$", OK),
  bvaRow("BVA-16", N, "ABCdefg12@!$", OK),
  bvaRow("BVA-17", N, "ABCdef123ghi", ERR),
  bvaRow("BVA-18", N, "ABCdef123gh@", OK),
  bvaRow("BVA-19", N, "ABCdef123g@!", OK),
  bvaRow("BVA-20", "A".repeat(256), PN, OK),
  bvaRow("BVA-21", N, PN.repeat(21) + "ABCd", OK),
];

// Mỗi kênh dùng email riêng để API và UI không ảnh hưởng nhau qua ràng buộc "email duy nhất".
// Email đã tồn tại (EP-09/10) và email sai định dạng giữ nguyên.
const channelEmail = (email, ch) => (email.startsWith("vinh.") && email.endsWith("@gmail.com") ? email.replace("vinh.", `vinh.${ch}.`) : email);

async function adminToken() {
  const r = await fetch(`${API}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "admin@eshop.com", password: "Admin123!" }) });
  return (await r.json()).token;
}

// Hậu kiểm: đếm số tài khoản có email này (không phân biệt hoa/thường) qua API admin.
async function countAccounts(token, email) {
  const r = await fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
  const users = await r.json();
  return users.filter((u) => (u.email || "").toLowerCase() === email.toLowerCase()).length;
}

async function runApi(tc, token) {
  const [id, name, email0, pw, confirm, exp] = tc;
  const email = channelEmail(email0, "api");
  const before = await countAccounts(token, email);
  const r = await fetch(`${API}/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password: pw, confirmPassword: confirm }) });
  const body = await r.text();
  const after = await countAccounts(token, email);
  const created = after > before;
  const pass = exp === OK ? r.ok && created : !r.ok && !created;
  return { id, channel: "API", email, expected: exp, status: r.status, body: body.slice(0, 200), created, pass };
}

async function runUi(tc, token, browser) {
  const [id, name, email0, pw, confirm, exp] = tc;
  const email = channelEmail(email0, "ui");
  const before = await countAccounts(token, email);
  const page = await browser.newPage({ viewport: { width: 1000, height: 720 } });
  const dialogs = [];
  page.on("dialog", (d) => { dialogs.push(d.message()); d.dismiss(); });
  await page.goto(`${WEB}/register`);
  const inputs = page.locator("form input");
  const inputCount = await inputs.count();
  await inputs.nth(0).fill(name);
  await inputs.nth(1).fill(email);
  await inputs.nth(2).fill(pw);
  const hasConfirm = inputCount >= 4;
  if (hasConfirm) await inputs.nth(3).fill(confirm);
  await page.locator("form button[type=submit]").click();
  await page.waitForTimeout(1200);
  const url = page.url();
  const redirected = url.endsWith("/login");
  const html5Invalid = await page.evaluate(() => [...document.querySelectorAll("form input")].filter((i) => !i.checkValidity()).map((i) => i.validationMessage));
  const errText = (await page.locator(".bg-red-100").allInnerTexts()).join(" | ");
  await page.screenshot({ path: path.join(SHOT_DIR, `${id}_ui.png`) });
  await page.close();
  const after = await countAccounts(token, email);
  const created = after > before;
  const rejected = !redirected && !created;
  let pass = exp === OK ? redirected && created : rejected;
  let note = "";
  if (!hasConfirm && confirm !== pw) {
    pass = false;
    note = "UI không có trường Xác nhận MK nên không nhập được giá trị của TC";
  }
  return { id, channel: "UI", email, expected: exp, url, redirected, created, errText, html5Invalid, dialogs, hasConfirm, note, pass };
}

// Lượt chạy lại trên UI: form UI từ chối mọi mật khẩu đúng spec, nên các TC lỗi họ tên/email
// bị "che" bởi lỗi mật khẩu. Chạy lại với mật khẩu UI chấp nhận được ("Abcdef1 ") để cô lập đúng một lớp không hợp lệ.
const UI_WORKAROUND_PW = "Abcdef1 ";
const RERUN_IDS = ["EP-03", "EP-04", "EP-05", "EP-06", "EP-07", "EP-08", "EP-09", "EP-10", "BVA-02"];
const RERUN = [...EP, ...BVA]
  .filter((tc) => RERUN_IDS.includes(tc[0]))
  .map(([id, name, email, , , exp]) => [`${id}R`, name, email.replace("@gmail.com", "r@gmail.com"), UI_WORKAROUND_PW, UI_WORKAROUND_PW, exp]);

(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const token = await adminToken();
  const browser = await chromium.launch();
  const results = [];
  for (const tc of [...EP, ...BVA]) {
    results.push(await runApi(tc, token));
    results.push(await runUi(tc, token, browser));
  }
  for (const tc of RERUN) results.push(await runUi(tc, token, browser));
  await browser.close();
  const file = path.join(OUT_DIR, "results_fr01.json");
  fs.writeFileSync(file, JSON.stringify({ executedAt: new Date().toISOString(), results }, null, 2));
  for (const r of results) console.log(`${r.id.padEnd(7)} ${r.channel.padEnd(3)} exp=${r.expected} ${r.pass ? "PASS" : "FAIL"} created=${r.created} ${r.channel === "API" ? `status=${r.status}` : `redirect=${r.redirected} err="${r.errText}" html5=${JSON.stringify(r.html5Invalid)}`}`);
  const pass = results.filter((r) => r.pass).length;
  console.log(`\nTổng: ${results.length} lượt chạy, PASS ${pass}, FAIL ${results.length - pass}`);
})();
