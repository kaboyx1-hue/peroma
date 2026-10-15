/* KIỂM TRA ĐỒNG BỘ THẬT GIỮA NHIỀU MÁY — 14/10/2026 (S60)
   Khách: "đã đồng bộ dữ liệu chuẩn cho chúng chưa" (ra đường nhiều, làm việc trên điện thoại là chính).
   Chạy Code.gs THẬT trong Node trên Google Sheet giả lập (giống kiemtra-codegs.mjs), mở làm máy chủ HTTP ở cổng 8779,
   rồi mở CÙNG LÚC 3 máy: Admin máy tính · Admin điện thoại · Nhân viên (điện thoại) — mỗi máy bộ nhớ riêng — và thao tác
   qua lại. KHÔNG đụng Google Sheet thật. Cần server.mjs chạy ở cổng 8777.  Chạy: node kiemtra-2may.mjs [Code.gs] */
import fs from 'node:fs';
import vm from 'node:vm';
import http from 'node:http';
import { chromium } from 'playwright';

const CHROME = process.env.PEROMA_CHROME || (process.env.CI ? undefined : 'C:/Program Files/Google/Chrome/Application/chrome.exe');
const NGUON = fs.readFileSync(process.argv[2] || new URL('../giao-apps-script/Code.gs', import.meta.url), 'utf8');
let dat = 0, hong = 0; const loi = [];
const ok = (t, c, g = '') => { c ? dat++ : (hong++, loi.push(t)); console.log(`${c ? '✓' : '✗ HỎNG'}  ${t}${g ? '  → ' + g : ''}`) };

// ── Google Sheet giả lập tối giản (đủ cho Code.gs) ──
function taoMayChu(matKhau) {
  const trang = {};
  const A1 = a => { const m = /^([A-Z]+)(\d+)$/.exec(a); let c = 0; for (const ch of m[1]) c = c * 26 + ch.charCodeAt(0) - 64; return [+m[2], c] };
  const taoTrang = () => { const o = new Map(); const sh = {
    getLastRow() { let n = 0; for (const [k, v] of o) if (v !== '' && v != null) n = Math.max(n, +k.split(',')[0]); return n },
    getRange(a, b, c, d) { let r, cc, nr = 1, nc = 1; if (typeof a === 'string') [r, cc] = A1(a); else { r = a; cc = b; nr = c || 1; nc = d || 1 }
      const k = (i, j) => (r + i) + ',' + (cc + j);
      return { getValue: () => o.has(k(0, 0)) ? o.get(k(0, 0)) : '', setValue: v => o.set(k(0, 0), v),
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => o.has(k(i, j)) ? o.get(k(i, j)) : '')),
        setValues: vs => vs.forEach((h, i) => h.forEach((v, j) => o.set(k(i, j), v))),
        clearContent: () => { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) o.delete(k(i, j)) }, setNumberFormat() {}, setFontWeight() {} } },
    appendRow(v) { const n = sh.getLastRow() + 1; v.forEach((x, j) => o.set(n + ',' + (j + 1), x)) }, setFrozenRows() {},
    deleteRows(tu, so) { for (const kk of [...o.keys()]) { const h = +kk.split(',')[0]; if (h >= tu && h < tu + so) o.delete(kk) } } }; return sh };
  const ss = { getSheetByName: t => trang[t] || null, insertSheet: t => (trang[t] = taoTrang()), toast() {} };
  const ctx = { console, SpreadsheetApp: { getActiveSpreadsheet: () => ss, flush() {} },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => k === 'MATKHAU' ? matKhau : null }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: s => ({ s, setMimeType() { return this } }) }, HtmlService: {} };
  vm.createContext(ctx); vm.runInContext(NGUON, ctx);
  return { get: p => JSON.parse(ctx.doGet({ parameter: p }).s), post: d => JSON.parse(ctx.doPost({ postData: { contents: d } }).s) };
}
const MK = 'mk-2may', may = taoMayChu(MK);
const sv = http.createServer((req, res) => {
  const tra = o => { res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }); res.end(JSON.stringify(o)) };
  if (req.method === 'POST') { let b = ''; req.on('data', c => b += c); req.on('end', () => tra(may.post(b))); return }
  tra(may.get(Object.fromEntries(new URL(req.url, 'http://x').searchParams)));
}).listen(8779, '127.0.0.1');
const URL_MC = 'http://127.0.0.1:8779/exec';

const b = await chromium.launch({ executablePath: CHROME });
const moMay = async (ten, trang, opt) => {
  const ctx = await b.newContext(opt);
  await ctx.addInitScript(([u, m]) => { if (!localStorage.getItem('peroma:ketnoi')) localStorage.setItem('peroma:ketnoi', JSON.stringify({ url: u, mk: m })) }, [URL_MC, MK]);
  const p = await ctx.newPage(); const loiTrang = []; p.on('pageerror', e => loiTrang.push(e.message));
  await p.goto('http://127.0.0.1:8777/' + trang); await p.waitForTimeout(1500);
  return { p, loiTrang, ten };
};
const cho = ms => new Promise(z => setTimeout(z, ms));
const DT = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };

console.log('── 1. MỞ MÁY · LẦN ĐẦU ──');
const pc = await moMay('PC', 'huong/bang-tra-huong-lieu.html', { viewport: { width: 1280, height: 800 } });
await pc.p.evaluate(() => dbDayCauHinh()); await cho(300);
ok('PC đẩy cấu hình đầu tiên lên máy chủ', !!may.get({ a: 'cauhinh', mk: MK }).cauhinh);
const dt = await moMay('Điện thoại', 'huong/bang-tra-huong-lieu.html', DT);
await dt.p.evaluate(() => dbKeoCauHinhNeuMoiHon(true)); await cho(300);
const tenPC = await pc.p.evaluate(() => sp.map(x => x.ten).join('|')), tenDT = await dt.p.evaluate(() => sp.map(x => x.ten).join('|'));
ok('Điện thoại mở lần đầu: tải đúng danh sách mặt hàng của PC', tenPC === tenDT);
ok('Điện thoại mở lần đầu: KHÔNG hiện báo "máy khác vừa lưu" vô cớ', await dt.p.evaluate(() => !document.getElementById('xungDot')));

console.log('\n── 2. SỬA TRÊN PC → ĐIỆN THOẠI THẤY ──');
await pc.p.evaluate(() => { sp[0].ml = 77; luuNgay() }); await cho(2600);
await dt.p.evaluate(() => dbKeoCauHinhNeuMoiHon()); await cho(300);
ok('PC đổi định lượng hương → điện thoại thấy (77 g)', await dt.p.evaluate(() => +sp[0].ml === 77));

console.log('\n── 3. SỬA TRÊN ĐIỆN THOẠI → PC + NHÂN VIÊN THẤY ──');
const H = await dt.p.evaluate(() => kho.find(h => !isUnscented(h)));
await dt.p.evaluate(H => { nguonHuong[H] = [{ ncc: 'NCC ĐT', gia: 500000, soKg: 2, soHD: 'HD-DT-1', ngay: '14/10/2026', daDungKg: 0 }]; sp[0].huongs = [H]; sp[0].tam = [H]; sp[0].nguonHuongChon = {}; luuNgay() }, H); await cho(2600);
await pc.p.evaluate(() => dbKeoCauHinhNeuMoiHon()); await cho(300);
ok('Điện thoại khai nhà cung cấp + số HĐ → PC thấy', await pc.p.evaluate(H => (nguonHuong[H] || [])[0]?.soHD === 'HD-DT-1', H));
const nv = await moMay('Nhân viên', 'nv/peroma-nhanvien.html', DT);
await nv.p.evaluate(() => dbKeoCauHinh()); await cho(300);
ok('Nhân viên thấy hương điện thoại Admin vừa gán cho mặt hàng', await nv.p.evaluate(H => (sp[0].huongs || []).includes(H), H));

console.log('\n── 4. NHÂN VIÊN GHI MẺ → CẢ 2 MÁY ADMIN NHẬN, TỒN KHO TRỪ ĐÚNG 1 LẦN ──');
const ten0 = await pc.p.evaluate(() => sp[0].ten);
may.post(JSON.stringify({ mk: MK, a: 'themMe', nk: [{ id: 'E2E-1', sp: ten0, huong: H, quyCach: '1 kg', sl: 100, mlDung: 500, lot: '0101010101', ngaysx: '2026-10-14', nv: 'NV', ts: new Date(Date.now() + 60000).toISOString() }] }));
await pc.p.evaluate(() => dbKeoNhatKy()); await dt.p.evaluate(() => dbKeoNhatKy()); await cho(3000);
// mỗi máy kéo cấu hình lại vài lượt (đúng như vòng 9 giây)
for (let i = 0; i < 3; i++) { await pc.p.evaluate(() => dbKeoCauHinhNeuMoiHon()); await dt.p.evaluate(() => dbKeoCauHinhNeuMoiHon()); await cho(2600) }
const daDung = may.get({ a: 'cauhinh', mk: MK }).cauhinh.nguonHuong[H][0].daDungKg;
ok('Cả PC lẫn điện thoại đều có mẻ mới', await pc.p.evaluate(() => nk.some(r => r.id === 'E2E-1')) && await dt.p.evaluate(() => nk.some(r => r.id === 'E2E-1')));
ok('Tồn kho hương trên máy chủ trừ đúng 1 lần (0,5 kg, không phải 1 kg)', daDung === 0.5, 'daDungKg=' + daDung);
ok('Hai máy Admin hiển thị cùng một số tồn', await pc.p.evaluate(H => nguonHuong[H][0].daDungKg, H) === await dt.p.evaluate(H => nguonHuong[H][0].daDungKg, H));

console.log('\n── 5. HUỶ LÔ TRÊN ĐIỆN THOẠI → PC THẤY ──');
await dt.p.evaluate(async () => { const h = window.hoi; window.hoi = async () => true; await huyLo('E2E-1'); window.hoi = h }); await cho(2600);
await pc.p.evaluate(() => dbKeoCauHinhNeuMoiHon()); await cho(300);
ok('PC thấy lô đã bị huỷ trên điện thoại', await pc.p.evaluate(() => nk.find(r => r.id === 'E2E-1').huy === true));

console.log('\n── 6. HAI MÁY CÙNG SỬA MỘT LÚC ──');
await pc.p.evaluate(() => { sp[0].ml = 11; luuNgay() }); await dt.p.evaluate(() => { sp[0].kg = 222; luuNgay() }); await cho(3500);
const c6 = may.get({ a: 'cauhinh', mk: MK }).cauhinh.sp[0];
const coBao = await pc.p.evaluate(() => !!document.getElementById('xungDot')) || await dt.p.evaluate(() => !!document.getElementById('xungDot'));
ok('Máy lưu sau KHÔNG đè mất máy lưu trước — máy chủ giữ trọn 1 bản, máy kia được báo làm lại', (+c6.ml === 11) !== (+c6.kg === 222) && coBao, JSON.stringify({ ml: c6.ml, kg: c6.kg, coBao }));
for (const m of [pc, dt]) await m.p.evaluate(() => dbKeoCauHinhNeuMoiHon(true));
ok('Sau đó 2 máy về cùng một dữ liệu', await pc.p.evaluate(() => JSON.stringify([sp[0].ml, sp[0].kg])) === await dt.p.evaluate(() => JSON.stringify([sp[0].ml, sp[0].kg])));

for (const m of [pc, dt, nv]) ok(m.ten + ': không có lỗi trang', m.loiTrang.length === 0, m.loiTrang.slice(0, 2).join(' | '));
console.log(`\nKẾT QUẢ ĐỒNG BỘ NHIỀU MÁY:  ${dat} đạt · ${hong} hỏng${hong ? '\nCẦN SỬA:\n  - ' + loi.join('\n  - ') : ''}`);
await b.close(); sv.close(); process.exit(hong ? 1 : 0);
