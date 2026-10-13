// FR-01: TC bổ sung sau AI gap analysis.
// EP-20: Họ tên tiếng Việt có dấu (lớp hợp lệ bị bỏ sót).
// EP-21: Họ tên chứa thẻ HTML; sau khi đăng ký, đăng nhập và kiểm tra header có render HTML hay không (SEC-04).
const path = require("path");
const { chromium } = require("playwright");

const API = "http://localhost:3000/api";
const WEB = "http://localhost:5173";
const SHOT_DIR = path.resolve(__dirname, "../features/FR-01_Register/screenshots");
const PW = "Abcdef1@";

async function register(name, email) {
  const r = await fetch(`${API}/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password: PW, confirmPassword: PW }) });
  return r.status;
}

async function loginAndInspect(browser, email, shot) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 400 } });
  await page.goto(`${WEB}/login`);
  const inputs = page.locator("form input");
  await inputs.nth(0).fill(email);
  await inputs.nth(1).fill(PW);
  await page.locator("form button[type=submit]").click();
  await page.waitForTimeout(1500);
  const header = await page.locator("header").innerHTML();
  const xss = await page.evaluate(() => window.__xss === 1);
  await page.screenshot({ path: path.join(SHOT_DIR, shot) });
  await page.close();
  return { header, xss };
}

(async () => {
  const browser = await chromium.launch();
  const stamp = Date.now();

  const vnEmail = `vinh.ep20.${stamp}@gmail.com`;
  const vnName = "Phạm Quang Vinh";
  const s20 = await register(vnName, vnEmail);
  const r20 = await loginAndInspect(browser, vnEmail, "EP-20_ui_header.png");
  const ok20 = s20 === 200 && r20.header.includes(vnName);
  console.log(`EP-20 register=${s20} headerShowsName=${r20.header.includes(vnName)} => ${ok20 ? "PASS" : "FAIL"}`);

  const xssEmail = `vinh.ep21.${stamp}@gmail.com`;
  const xssName = `<img src=x onerror="window.__xss=1;this.style.border='3px solid red'">Hacker`;
  const s21 = await register(xssName, xssEmail);
  const r21 = await loginAndInspect(browser, xssEmail, "EP-21_ui_header_xss.png");
  console.log(`EP-21 register=${s21} scriptExecuted=${r21.xss} => ${r21.xss ? "FAIL (XSS)" : "PASS"}`);
  console.log("header HTML:", r21.header.match(/Chào,[^<]*<img[^>]*>/)?.[0] || r21.header.slice(0, 300));

  await browser.close();
})();
