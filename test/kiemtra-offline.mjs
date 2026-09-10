/* KIỂM TRA CHẾ ĐỘ MẤT MẠNG (sw.js) — thêm 10/09/2026
   Kiểm đúng 3 "cách có thể hỏng" đã nêu ở cổng kiểm soát peroma-safety-guard:
     ① kẹt bản cũ         → có mạng phải lấy BẢN MỚI, không trả bản lưu
     ② cache nhầm Sheet    → request tới Apps Script (khác nguồn) KHÔNG được lưu
     ③ lỗi ở nơi không hỗ trợ → file:// không đăng ký, không báo lỗi console
   Chạy: node kiemtra-offline.mjs   (cần server.mjs đang chạy ở cổng 8777) */
import { chromium } from 'playwright';
import fs from 'fs';

const CHROME = process.env.PEROMA_CHROME||(process.env.CI?undefined:'C:/Program Files/Google/Chrome/Application/chrome.exe'); // S23
const GOC_FILE = (process.env.PEROMA_GOC || 'C:/Users/ADMIN/Downloads/peroma-work/peroma').replace(/\\/g, '/'); // S23: thư mục chứa huong/ và nv/
import { pathToFileURL } from 'url';
const GOC = 'http://127.0.0.1:8777';
let dat = 0, hong = 0;
const ok = (t, c, g = '') => { c ? dat++ : hong++; console.log(`${c ? '✓' : '✗ HỎNG'}  ${t}${g ? '  → ' + g : ''}`); };

const b = await chromium.launch({ executablePath: CHROME });

for (const [ten, duong] of [['NHÂN VIÊN', '/nv/peroma-nhanvien.html'], ['ADMIN', '/huong/bang-tra-huong-lieu.html']]) {
  console.log(`\n── ${ten} ──`);
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  const loi = [];
  p.on('pageerror', e => loi.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error') loi.push(m.text()); });

  // Lần đầu có mạng: app đăng ký sw.js
  await p.goto(GOC + duong);
  await p.waitForFunction(() => navigator.serviceWorker.controller !== null || navigator.serviceWorker.ready, null, { timeout: 8000 }).catch(() => {});
  const daDangKy = await p.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration();
    return !!(r && (r.active || r.installing || r.waiting));
  });
  ok('có mạng: đăng ký được sw.js', daDangKy);

  // Tải lại để sw.js thực sự điều khiển trang và lưu bản app
  await p.reload(); await p.waitForTimeout(1200);
  const dieuKhien = await p.evaluate(() => !!navigator.serviceWorker.controller);
  ok('sw.js đang điều khiển trang sau lần tải lại', dieuKhien);

  // ② Không được lưu dữ liệu đồng bộ (Apps Script khác nguồn)
  const khoaLuu = await p.evaluate(async () => {
    const ds = [];
    for (const ten of await caches.keys()) {
      const c = await caches.open(ten);
      for (const r of await c.keys()) ds.push(r.url);
    }
    return ds;
  });
  ok('bản lưu CÓ file app', khoaLuu.some(u => u.includes(duong.split('/').pop())), khoaLuu.length + ' mục');
  ok('bản lưu KHÔNG chứa request Apps Script / khác nguồn',
    khoaLuu.every(u => u.startsWith(GOC)), khoaLuu.filter(u => !u.startsWith(GOC)).join(', ') || 'sạch');

  // Dữ liệu người dùng phải còn nguyên khi chuyển qua lại có mạng / mất mạng
  await p.evaluate(() => localStorage.setItem('__kiemtra_offline', 'mẻ-đang-ghi'));

  // MẤT MẠNG: vẫn mở được app
  await ctx.setOffline(true);
  let moDuoc = false, tieuDe = '';
  try {
    await p.reload({ timeout: 10000 }); await p.waitForTimeout(1200);
    tieuDe = await p.title();
    moDuoc = /Peroma|Pha hương liệu/.test(tieuDe);
  } catch (e) { tieuDe = 'lỗi: ' + e.message.slice(0, 80); }
  ok('MẤT MẠNG: vẫn mở được app', moDuoc, tieuDe);

  const conDuLieu = await p.evaluate(() => localStorage.getItem('__kiemtra_offline')).catch(() => null);
  ok('MẤT MẠNG: dữ liệu trong máy còn nguyên (cùng nguồn, cùng localStorage)', conDuLieu === 'mẻ-đang-ghi', String(conDuLieu));

  const coGiaoDien = await p.evaluate(() => !!document.querySelector('.tabs')).catch(() => false);
  ok('MẤT MẠNG: giao diện dựng đầy đủ (có thanh tab)', coGiaoDien);

  // ① Có mạng lại: phải lấy BẢN MỚI, không kẹt bản lưu cũ
  await ctx.setOffline(false);
  const fileThat = fs.readFileSync(`${GOC_FILE}${duong}`, 'utf8');
  /* Dấu vết PHẢI nằm trong <body>. Bản đầu của test nối comment vào CUỐI file (sau </html>):
     theo chuẩn HTML, comment ở đó thuộc Document chứ không thuộc <html>, nên đọc DOM không thấy
     → test báo "kẹt bản cũ" dù sw.js trả đúng bản mới (đã tách bước kiểm chứng 10/09/2026). */
  fs.writeFileSync(`${GOC_FILE}${duong}`,
    fileThat.replace('</body>', '<i id="kiemtra-offline-ban-moi"></i></body>'));
  try {
    await p.waitForTimeout(1500);   // chờ mạng thật sự bật lại sau setOffline(false)
    await p.reload(); await p.waitForTimeout(1200);
    const coBanMoi = await p.evaluate(() => !!document.getElementById('kiemtra-offline-ban-moi'));
    ok('CÓ MẠNG LẠI: nhận ngay bản mới, không kẹt bản cũ', coBanMoi);
  } finally {
    fs.writeFileSync(`${GOC_FILE}${duong}`, fileThat); // trả file về nguyên trạng
  }

  await p.evaluate(() => localStorage.removeItem('__kiemtra_offline')).catch(() => {});
  const loiThat = loi.filter(x => !/ERR_INTERNET_DISCONNECTED|net::ERR_/.test(x)); // lỗi mạng khi cố tình tắt mạng là đúng
  ok('không có lỗi console (ngoài lỗi mạng do cố tình tắt)', loiThat.length === 0, loiThat.slice(0, 2).join(' | '));
  await ctx.close();
}

// ③ Mở từ file:// (gửi qua Zalo): không đăng ký, không lỗi, app vẫn chạy
console.log('\n── MỞ TỪ FILE (gửi qua Zalo) ──');
{
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  const loi = [];
  p.on('pageerror', e => loi.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error') loi.push(m.text()); });
  await p.goto(pathToFileURL(GOC_FILE + '/nv/peroma-nhanvien.html').href);
  await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => ({
    dangKy: !!(await navigator.serviceWorker?.getRegistration?.().catch(() => null)),
    coTab: !!document.querySelector('.tabs'),
  }));
  ok('file://: KHÔNG cố đăng ký sw.js', !r.dangKy);
  ok('file://: app vẫn chạy đầy đủ (có thanh tab)', r.coTab);
  ok('file://: không có lỗi console', loi.length === 0, loi.slice(0, 2).join(' | '));
  await ctx.close();
}

console.log(`\nKẾT QUẢ CHẾ ĐỘ MẤT MẠNG:  ${dat} đạt · ${hong} hỏng`);
await b.close();
process.exit(hong ? 1 : 0);
