// FR-20 — thăm dò: người dùng sửa SL trong giỏ bằng bàn phím như trên điện thoại (xóa số cũ bằng Backspace rồi gõ số mới).
const path = require("path");
const { chromium, devices } = require("playwright");
const SHOT = path.resolve(__dirname, "../features/FR-20_Mobile_Cart/screenshots");
(async () => {
  const ids = (await (await fetch("http://localhost:3000/api/products")).json()).map((p) => p.id);
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices["Pixel 5"] });
  const page = await ctx.newPage();
  await page.goto("http://localhost:8081", { waitUntil: "networkidle" });
  await page.getByText(/Hiển thị \d+ sản phẩm/).waitFor();
  await page.getByText("Thêm vào giỏ", { exact: true }).nth(ids.indexOf(5)).click();
  await page.getByText(/^Giỏ \(\d+\)$/).click();
  const input = page.locator("input").first();
  const log = [`ban đầu: "${await input.inputValue()}"`];
  await input.click();
  await page.keyboard.press("End");
  await page.keyboard.press("Backspace");
  log.push(`sau Backspace: "${await input.inputValue()}"`);
  await page.keyboard.type("5");
  log.push(`sau khi gõ "5": "${await input.inputValue()}"`);
  await page.screenshot({ path: path.join(SHOT, "PROBE_typing_mobile.png") });
  console.log(log.join(" → "));
  await b.close();
})();
