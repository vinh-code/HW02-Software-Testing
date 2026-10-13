// Xuất PDF từ một hoặc nhiều file Markdown (nội dung PDF sinh tự động từ MD, nên hai bản luôn giống nhau).
// Dùng: node build_pdf.js --out <file.pdf> --title "<tiêu đề>" <main.md> [--appendix <a.md> <b.md> ...] [--embed-images]
//   --appendix      : các file phía sau được đưa vào phần Phụ lục, mỗi file bắt đầu ở trang mới
//   --embed-images  : link tới ảnh .png (ví dụ minh chứng trong bug report) được nhúng thẳng vào PDF dưới link
const fs = require("fs");
const os = require("os");
const path = require("path");
const { marked } = require("marked");
const { chromium } = require("playwright");

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const out = path.resolve(opt("--out"));
const title = opt("--title") || path.basename(out, ".pdf");
const embed = argv.includes("--embed-images");
const ai = argv.indexOf("--appendix");
const skip = new Set([argv.indexOf("--out") + 1, argv.indexOf("--title") + 1].filter((x) => x > 0));
const files = argv.filter((a, i) => !a.startsWith("--") && !skip.has(i));
const mainFiles = files.filter((f) => ai < 0 || argv.indexOf(f) < ai);
const appendix = files.filter((f) => ai >= 0 && argv.indexOf(f) > ai);

// id tiêu đề kiểu GitHub để link mục lục (#1-tổng-quan) hoạt động trong PDF
const slug = (t) => t.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s/g, "-");

function render(file, sectionId) {
  const abs = path.resolve(file);
  const dir = path.dirname(abs);
  const used = new Map();
  const renderer = new marked.Renderer();
  renderer.heading = (text, level, raw) => {
    let id = slug(raw);
    const n = used.get(id) || 0;
    used.set(id, n + 1);
    if (n) id += `-${n}`;
    return `<h${level} id="${sectionId ? sectionId + "--" : ""}${id}">${text}</h${level}>\n`;
  };
  renderer.link = (href, t, text) => {
    if (!href || /^(https?:|mailto:)/.test(href)) return `<a href="${href}">${text}</a>`;
    if (href.startsWith("#")) return `<a href="#${sectionId ? sectionId + "--" : ""}${href.slice(1)}">${text}</a>`;
    const target = path.resolve(dir, href.split("#")[0]);
    const link = `<a href="file://${target}">${text}</a>`;
    if (embed && /\.png$/i.test(href) && fs.existsSync(target)) {
      return `${link}<span class="fig"><img src="file://${target}" alt="${text}"><span class="cap">${text}</span></span>`;
    }
    return link;
  };
  renderer.image = (href, t, text) => `<img src="file://${path.resolve(dir, href)}" alt="${text}">`;
  return marked.parse(fs.readFileSync(abs, "utf8"), { renderer, gfm: true });
}

const css = `
  @page { size: A4; margin: 16mm 14mm 18mm 14mm; }
  body { font-family: "DejaVu Sans", "Liberation Sans", sans-serif; font-size: 9.6pt; line-height: 1.45; color: #1f2328; }
  h1 { font-size: 19pt; border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin-top: 0; }
  h2 { font-size: 14pt; border-bottom: 1px solid #d0d7de; padding-bottom: 3px; margin-top: 20px; break-after: avoid; }
  h3 { font-size: 11.5pt; margin-top: 14px; break-after: avoid; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 8pt; break-inside: auto; }
  tr { break-inside: avoid; }
  th, td { border: 1px solid #d0d7de; padding: 3px 5px; vertical-align: top; overflow-wrap: normal; }
  td code { word-break: break-all; }
  th { background: #f0f3f6; }
  code { font-family: "DejaVu Sans Mono", monospace; font-size: 8pt; background: #f3f4f6; padding: 0 3px; border-radius: 3px; word-break: break-all; }
  pre { background: #f6f8fa; padding: 8px; border-radius: 6px; white-space: pre-wrap; font-size: 8pt; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 4px solid #d0d7de; margin: 8px 0; padding: 2px 10px; color: #57606a; }
  a { color: #0969da; text-decoration: none; }
  hr { border: 0; border-top: 1px solid #d0d7de; margin: 14px 0; }
  .fig { display: block; margin: 6px 0 10px; break-inside: avoid; }
  .fig img { max-width: 100%; max-height: 120mm; border: 1px solid #d0d7de; }
  .fig .cap { display: block; font-size: 7.5pt; color: #57606a; }
  .appendix { break-before: page; }
  .appendix-title { break-before: page; font-size: 20pt; text-align: center; margin-top: 80mm; border: 0; }
  .src { font-size: 7.5pt; color: #57606a; margin-bottom: 4px; }
`;

(async () => {
  const root = path.resolve(__dirname, "..");
  let body = mainFiles.map((f) => render(f, "")).join("\n");
  if (appendix.length) {
    body += `<h1 class="appendix-title">PHỤ LỤC</h1>`;
    appendix.forEach((f, i) => {
      body += `<section class="appendix"><div class="src">Phụ lục ${i + 1} — <code>${path.relative(root, path.resolve(f))}</code></div>${render(f, `a${i + 1}`)}</section>`;
    });
  }
  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${body}</body></html>`;
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "mdpdf-")), "doc.html");
  fs.writeFileSync(tmp, html);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`file://${tmp}`, { waitUntil: "load" });
  await page.pdf({
    path: out, format: "A4", printBackground: true, displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:7pt;color:#888;width:100%;padding:0 14mm;font-family:DejaVu Sans">${title}</div>`,
    footerTemplate: `<div style="font-size:7pt;color:#888;width:100%;text-align:center;font-family:DejaVu Sans">Trang <span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
    margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" },
  });
  await browser.close();
  console.log(`saved ${out} (${(fs.statSync(out).size / 1024 / 1024).toFixed(1)} MB)`);
})();
