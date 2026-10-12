/* KIỂM TRA ADMIN TRÊN ĐIỆN THOẠI — viết lại 12/10/2026 (S53).
   Trước S53 file này kiểm "chế độ chỉ xem" (10/09/2026). Khách yêu cầu "mobile cũng làm việc được như pc" → chỉ xem
   bị bỏ; an toàn nhiều máy chuyển sang máy chủ (tsCu chống ghi đè) + sổ meDaTru (trừ tồn kho 1 lần) — kiểm ở
   huong/kiemtra.mjs mục BK. File này kiểm phần riêng điện thoại: sửa được, gửi được, soi gương Sheet, không tràn ngang.
   Giữ tên file cũ để CI không phải đổi. Chạy: node kiemtra-chixem.mjs   (cần server.mjs chạy ở cổng 8777) */
import { chromium } from 'playwright';

const CHROME = process.env.PEROMA_CHROME||(process.env.CI?undefined:'C:/Program Files/Google/Chrome/Application/chrome.exe'); // S23
const URL = 'http://127.0.0.1:8777/huong/bang-tra-huong-lieu.html';
let dat = 0, hong = 0;
const ok = (t, c, g = '') => { c ? dat++ : hong++; console.log(`${c ? '✓' : '✗ HỎNG'}  ${t}${g ? '  → ' + g : ''}`); };
const b = await chromium.launch({ executablePath: CHROME });

for (const [ten, opt] of [['MÁY TÍNH', { viewport: { width: 1280, height: 800 } }], ['ĐIỆN THOẠI', { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }]]) {
  console.log('\n── ' + ten + ' ──');
  const ctx = await b.newContext(opt);
  const p = await ctx.newPage();
  const loi = []; p.on('pageerror', e => loi.push(e.message));
  await p.goto(URL); await p.waitForTimeout(900);
  const dt = ten === 'ĐIỆN THOẠI';
  ok(ten + ': nhận diện ' + (dt ? 'là' : 'không phải') + ' điện thoại', await p.evaluate(() => laDienThoai()) === dt);
  ok(ten + ': không còn banner/khoá chỉ xem', await p.evaluate(() => !document.getElementById('chiXemBanner') && typeof adminChiXem === 'undefined'));
  const day = await p.evaluate(async () => {
    const that = window.dbGoi, url = DONGBO_URL; let body = null;
    DONGBO_URL = 'https://script.google.com/macros/s/TEST/exec';
    window.dbGoi = async (u, o) => { if (o && o.method === 'POST') body = JSON.parse(o.body); return { ok: 1, ts: 'T9' }; };
    await dbDayCauHinh();
    window.dbGoi = that; DONGBO_URL = url;
    return { gui: !!body && body.a === 'luuCauHinh' && 'tsCu' in body, ts: dongBoCauHinhTs };
  });
  ok(ten + ': sửa xong được gửi lên Sheet (kèm mốc chống ghi đè)', day.gui && day.ts === 'T9', JSON.stringify(day));
  const sua = await p.evaluate(async () => {
    const goc = JSON.stringify(sp); chuyenTab('ct'); mo.clear(); mo.add(0); ve(); await new Promise(z => setTimeout(z, 60));
    const o = document.querySelector('.r.open input, .r.open textarea'); const coO = !!o && !o.disabled && !o.readOnly;
    sp = napSP(JSON.parse(goc)); mo.clear(); chuyenTab('tq'); return coO;
  });
  ok(ten + ': mở mặt hàng ở tab Công thức → ô nhập sửa được', sua);
  if (dt) {
    const tran = [];
    for (const t of ['tq', 'ct', 'ma', 'bc', 'gv', 'sl', 'ho']) {
      await p.evaluate(t => chuyenTab(t), t); await p.waitForTimeout(150);
      const w = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (w > 2) tran.push(t + ':+' + w + 'px');
    }
    ok('điện thoại: 7 tab không tràn ngang màn hình', tran.length === 0, tran.join(' '));
  }
  ok(ten + ': không có lỗi trang', loi.length === 0, loi.slice(0, 2).join(' | '));
  await ctx.close();
}

console.log(`\nKẾT QUẢ ADMIN TRÊN ĐIỆN THOẠI:  ${dat} đạt · ${hong} hỏng`);
await b.close();
process.exit(hong ? 1 : 0);
