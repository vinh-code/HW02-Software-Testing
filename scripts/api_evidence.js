// Tạo ảnh minh chứng cho bug ở tầng API: gửi request thật tới backend rồi render request/response thành ảnh PNG.
// Dùng: node api_evidence.js <spec.json>
//   spec.json: { "outDir": "...", "cards": [ { "file": "x.png", "title": "...", "method": "POST", "path": "/api/...", "body": {...}, "auth": "admin"|"user"|null } ] }
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const API = "http://localhost:3000";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function login(email, password) {
  const r = await fetch(`${API}/api/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  return (await r.json()).token;
}

(async () => {
  const spec = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const tokens = { admin: await login("admin@eshop.com", "Admin123!"), user: await login("test@eshop.com", "Test1234!") };
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 400 } });
  for (const c of spec.cards) {
    const headers = { "Content-Type": "application/json" };
    if (c.auth) headers.Authorization = `Bearer ${tokens[c.auth]}`;
    const r = await fetch(`${API}${c.path}`, { method: c.method, headers, body: c.body ? JSON.stringify(c.body) : undefined });
    let text = await r.text();
    try { text = JSON.stringify(JSON.parse(text), null, 2); } catch (_) {}
    if (text.length > 1800) text = text.slice(0, 1800) + "\n…";
    const html = `<html><body style="margin:0;font-family:ui-monospace,Menlo,monospace;background:#0f172a;color:#e2e8f0">
      <div style="padding:16px 20px">
        <div style="font:600 15px system-ui;color:#fbbf24;margin-bottom:10px">${esc(c.title)}</div>
        <div style="color:#93c5fd">${esc(c.method)} ${esc(API + c.path)}${c.auth ? ` <span style="color:#94a3b8">(Bearer token: ${c.auth})</span>` : ""}</div>
        ${c.body ? `<pre style="background:#1e293b;padding:10px;border-radius:6px;white-space:pre-wrap">${esc(JSON.stringify(c.body, null, 2))}</pre>` : ""}
        <div style="color:${r.ok ? "#4ade80" : "#f87171"};margin-top:8px">HTTP ${r.status}</div>
        <pre style="background:#1e293b;padding:10px;border-radius:6px;white-space:pre-wrap">${esc(text)}</pre>
        <div style="color:#64748b;font-size:11px">Captured ${new Date().toISOString()}</div>
      </div></body></html>`;
    await page.setContent(html);
    const h = await page.evaluate(() => document.body.scrollHeight);
    await page.setViewportSize({ width: 900, height: Math.min(h, 1400) });
    await page.screenshot({ path: path.resolve(path.dirname(process.argv[2]), spec.outDir, c.file) });
    console.log(`${c.file}: HTTP ${r.status}`);
  }
  await browser.close();
})();
