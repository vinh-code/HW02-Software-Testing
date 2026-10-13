// Chụp một trang (tùy chọn đăng nhập trước) để làm minh chứng bug.
// Dùng: node ui_screenshot.js <url> <file.png> [--login web|admin] [--click "<text>"] [--mobile] [--height N]
//   --login admin : đăng nhập trang Admin EShop (:5174, placeholder Email/Password, nút Login)
//   --login web   : đăng nhập web EShop (/login, user test) rồi mới mở <url>
//   --click       : bấm vào phần tử có chữ này (ví dụ tên tab "Đơn hàng") trước khi chụp
//   --mobile      : mô phỏng Pixel 5
const { chromium, devices } = require("playwright");

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };

(async () => {
  const [url, out] = process.argv.slice(2);
  const browser = await chromium.launch();
  const opts = process.argv.includes("--mobile") ? { ...devices["Pixel 5"] } : { viewport: { width: 1280, height: Number(arg("--height", 900)) } };
  const page = await (await browser.newContext(opts)).newPage();
  const login = arg("--login");
  if (login === "admin") {
    await page.goto(process.env.ADMIN_URL || "http://localhost:5174");
    await page.fill('input[placeholder="Email"]', process.env.ADMIN_EMAIL || "admin@eshop.com");
    await page.fill('input[placeholder="Password"]', process.env.ADMIN_PASSWORD || "Admin123!");
    await page.click("button:has-text('Login')");
    await page.waitForSelector("text=EShop Admin");
  } else if (login === "web") {
    await page.goto((process.env.WEB_URL || "http://localhost:5173") + "/login");
    const inputs = page.locator("form input");
    await inputs.nth(0).fill(process.env.USER_EMAIL || "test@eshop.com");
    await inputs.nth(1).fill(process.env.USER_PASSWORD || "Test1234!");
    await page.locator("form button[type=submit]").click();
    await page.waitForTimeout(1000);
  }
  if (url && url !== "-") await page.goto(url);
  const click = arg("--click");
  if (click) await page.getByText(click, { exact: true }).first().click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  console.log("saved", out);
})();
