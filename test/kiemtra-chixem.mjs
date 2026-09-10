/* KIỂM TRA CHẾ ĐỘ CHỈ XEM CỦA ADMIN TRÊN ĐIỆN THOẠI — thêm 10/09/2026 (lỗi D / H4 + lỗi 1A)
   Chạy: node kiemtra-chixem.mjs   (cần server.mjs chạy ở cổng 8777) */
import { chromium } from 'playwright';

const CHROME = process.env.PEROMA_CHROME||(process.env.CI?undefined:'C:/Program Files/Google/Chrome/Application/chrome.exe'); // S23
const URL = 'http://127.0.0.1:8777/huong/bang-tra-huong-lieu.html';
let dat = 0, hong = 0;
const ok = (t, c, g = '') => { c ? dat++ : hong++; console.log(`${c ? '✓' : '✗ HỎNG'}  ${t}${g ? '  → ' + g : ''}`); };
const b = await chromium.launch({ executablePath: CHROME });

// ── MÁY TÍNH (chuột): phải hoạt động y như cũ ──
console.log('\n── MÁY TÍNH ──');
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  await p.goto(URL); await p.waitForTimeout(900);
  ok('máy tính: KHÔNG ở chế độ chỉ xem', await p.evaluate(() => adminChiXem === false));
  ok('máy tính: không hiện banner chỉ xem', await p.evaluate(() => !document.getElementById('chiXemBanner')));
  const post = await p.evaluate(async () => {
    const that = window.fetch; let goi = 0;
    window.fetch = async () => { goi++; return new Response('{"ok":1}', { headers: { 'Content-Type': 'application/json' } }); };
    try { await dbGoi('http://127.0.0.1:8777/gia-lap-exec', { method: 'POST', body: '{}' }); return { goi, loi: '' }; }
    catch (e) { return { goi, loi: e.message }; } finally { window.fetch = that; }
  });
  ok('máy tính: lệnh ghi (POST) vẫn đi bình thường', post.goi === 1 && !post.loi, JSON.stringify(post));
  await ctx.close();
}

// ── ĐIỆN THOẠI (cảm ứng, 375px) ──
console.log('\n── ĐIỆN THOẠI ──');
{
  const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const loi = []; p.on('pageerror', e => loi.push(e.message));
  await p.goto(URL); await p.waitForTimeout(900);
  ok('điện thoại: nhận diện đúng (con trỏ cảm ứng + màn hình nhỏ)', await p.evaluate(() => laDienThoai()));
  ok('điện thoại: BẬT chế độ chỉ xem', await p.evaluate(() => adminChiXem === true));
  ok('điện thoại: hiện banner cảnh báo', await p.evaluate(() => !!document.getElementById('chiXemBanner')));

  const chan = await p.evaluate(async () => {
    const that = window.fetch; let goi = 0;
    window.fetch = async () => { goi++; return new Response('{"ok":1}', { headers: { 'Content-Type': 'application/json' } }); };
    let loiPost = '';
    try { await dbGoi('http://127.0.0.1:8777/gia-lap-exec', { method: 'POST', body: '{}' }); } catch (e) { loiPost = e.message; }
    const goiSauPost = goi;
    await dbGoi('http://127.0.0.1:8777/gia-lap-exec?a=cauhinh');   // GET vẫn phải đi (để xem)
    const goiSauGet = goi;
    window.fetch = that;
    return { loiPost, goiSauPost, goiSauGet };
  });
  ok('điện thoại: CHẶN mọi lệnh ghi (POST) — không hề gọi mạng', chan.goiSauPost === 0 && /chế độ chỉ xem/.test(chan.loiPost), chan.loiPost);
  ok('điện thoại: lệnh đọc (GET) vẫn đi — xem được dữ liệu', chan.goiSauGet === 1);

  const day = await p.evaluate(async () => {
    const that = window.dbGoi; let goi = 0; const urlThat = DONGBO_URL;
    DONGBO_URL = 'http://127.0.0.1:8777/gia-lap-exec';
    window.dbGoi = async () => { goi++; return { ok: 1, ts: 'x' }; };
    await dbDayCauHinh();
    window.dbGoi = that; DONGBO_URL = urlThat;
    return { goi, trangThai: (document.getElementById('dbDen') || {}).textContent || '' };
  });
  ok('điện thoại: không đẩy cấu hình lên Sheet', day.goi === 0, 'số lần gọi: ' + day.goi);
  ok('điện thoại: không báo "mất mạng" giả', !/Mất mạng/.test(day.trangThai), day.trangThai);

  // Lỗi 1A: nhận mẻ trên điện thoại → ghi giá (để xem đúng chi phí) nhưng KHÔNG trừ tồn kho
  const me = await p.evaluate(() => {
    const goc = JSON.parse(JSON.stringify(nguonHuong)), spGoc = JSON.parse(JSON.stringify(sp)), khoGoc = kho.slice();
    const H = 'Hương Test CX', p0 = sp[0];
    if (!kho.includes(H)) kho.push(H);
    nguonHuong[H] = [{ ncc: 'NCC CX', gia: 500000, soKg: 1, ngay: '10/09/2026', daDungKg: 0 }];
    p0.huongs = [H]; p0.nguonHuongChon = {};
    const r = { id: 'CXTEST', sp: p0.ten, huong: H, mlDung: 250, giaHuongTheoGLucSX: null, chiPhiHuongLucSX: null };
    ghiNhanMeLanDau(r);
    const kq = { gia: r.giaHuongTheoGLucSX, chiPhi: r.chiPhiHuongLucSX, daDung: nguonHuong[H][0].daDungKg };
    nguonHuong = goc; sp = spGoc; kho = khoGoc;
    return kq;
  });
  ok('điện thoại (lỗi 1A): vẫn ghi giá lúc SX để hiện đúng chi phí', me.gia === 500 && me.chiPhi === 125000, JSON.stringify(me));
  ok('điện thoại (lỗi 1A): KHÔNG trừ tồn kho — tránh trừ chồng lên máy chính', me.daDung === 0, 'daDungKg=' + me.daDung);

  // Gỡ: phải hỏi xác nhận; Huỷ thì giữ chỉ xem, Đồng ý thì bật
  await p.click('#chiXemGo'); await p.waitForTimeout(250);
  ok('bấm gỡ: hiện hộp thoại xác nhận (không bật ngay)', await p.evaluate(() => getComputedStyle(document.getElementById('mask')).display !== 'none' && adminChiXem === true));
  await p.click('#dlgC'); await p.waitForTimeout(250);
  ok('bấm Huỷ: vẫn giữ chế độ chỉ xem', await p.evaluate(() => adminChiXem === true && !!document.getElementById('chiXemBanner')));
  await p.click('#chiXemGo'); await p.waitForTimeout(250);
  await p.click('#dlgO'); await p.waitForTimeout(300);
  ok('bấm Đồng ý: tắt chỉ xem, gỡ banner', await p.evaluate(() => adminChiXem === false && !document.getElementById('chiXemBanner')));
  await p.reload(); await p.waitForTimeout(900);
  ok('mở lại máy đó: nhớ lựa chọn, không bật chỉ xem nữa', await p.evaluate(() => adminChiXem === false));
  await p.evaluate(() => localStorage.removeItem(ADMIN_SUA_KEY));   // dọn
  ok('không có lỗi trang', loi.length === 0, loi.slice(0, 2).join(' | '));
  await ctx.close();
}

console.log(`\nKẾT QUẢ CHẾ ĐỘ CHỈ XEM:  ${dat} đạt · ${hong} hỏng`);
await b.close();
process.exit(hong ? 1 : 0);
