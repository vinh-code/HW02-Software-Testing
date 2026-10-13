// Chụp một tab của trang Admin (đăng nhập bằng tài khoản admin seed).
// Dùng: node admin_screenshot.js <tên tab hiển thị> <file.png> [chiều cao viewport]
const { chromium } = require("playwright");

(async () => {
  const [tab, out, height] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: Number(height) || 900 } });
  await page.goto("http://localhost:5174");
  await page.fill('input[placeholder="Email"]', "admin@eshop.com");
  await page.fill('input[placeholder="Password"]', "Admin123!");
  await page.click("button:has-text('Login')");
  await page.waitForSelector("text=EShop Admin");
  await page.click(`li:has-text('${tab}')`);
  await page.waitForTimeout(800);
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  console.log("saved", out);
})();
