// FR-15 — thăm dò hậu quả của việc bảng Admin hiển thị sai sau khi Sửa (BUG-FR15-02):
// Sửa SP A → bảng đổi tên mọi SP → bấm "Sửa" SP B (iPhone, id 1), chỉ đổi giá → Lưu. Kiểm tra tên SP B trong CSDL.
const path = require("path");
const { chromium } = require("playwright");
const API = "http://localhost:3000/api";
const SHOT = path.resolve(__dirname, "../features/FR-15_ProductCRUD/screenshots");
const get = async (id) => (await (await fetch(`${API}/products/${id}`)).json());

(async () => {
  const before = await get(1);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("dialog", (d) => d.accept());
  await page.goto("http://localhost:5174");
  await page.fill('input[placeholder="Email"]', "admin@eshop.com");
  await page.fill('input[placeholder="Password"]', "Admin123!");
  await page.click("button:has-text('Login')");
  await page.waitForSelector("text=EShop Admin");
  await page.click("li:has-text('Sản phẩm')");
  await page.waitForSelector("text=Lưu sản phẩm");
  // Bước 1: sửa SP id 2 (Samsung): đổi tên
  await page.locator("table tbody tr").nth(1).getByRole("button", { name: "Sửa" }).click();
  await page.fill('input[placeholder="Tên sản phẩm"]', "Samsung Galaxy S24 Ultra (giảm giá)");
  await page.click("button:has-text('Lưu sản phẩm')");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SHOT, "BUG-FR15-02_step1_table_after_edit.png"), fullPage: true });
  // Bước 2: bấm Sửa trên dòng đầu tiên (iPhone, id 1), chỉ đổi giá
  await page.locator("table tbody tr").nth(0).getByRole("button", { name: "Sửa" }).click();
  const formName = await page.inputValue('input[placeholder="Tên sản phẩm"]');
  await page.fill('input[placeholder="Giá tiền"]', "29000000");
  await page.screenshot({ path: path.join(SHOT, "BUG-FR15-02_step2_edit_iphone_form.png"), fullPage: true });
  await page.click("button:has-text('Lưu sản phẩm')");
  await page.waitForTimeout(1000);
  const after = await get(1);
  console.log(JSON.stringify({ before: { name: before.name, price: before.price }, formNameShown: formName, after: { name: after.name, price: after.price } }));
  await page.reload();
  await page.click("li:has-text('Sản phẩm')");
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SHOT, "BUG-FR15-02_step3_after_reload.png"), fullPage: true });
  await browser.close();
})();
