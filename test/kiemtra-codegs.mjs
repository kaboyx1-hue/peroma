/* BỘ KIỂM TRA MÁY CHỦ — Code.gs (S23, 10/09/2026)
   Chạy:  node test/kiemtra-codegs.mjs [đường-dẫn-Code.gs]
   Chạy Code.gs trong Node với Google Sheet GIẢ LẬP (có đúng giới hạn 50.000 ký tự/ô của Google,
   có lỗi công thức khi chuỗi bắt đầu bằng "=" mà ô không để định dạng văn bản). KHÔNG gọi mạng,
   KHÔNG đụng Google Sheet thật. */
import fs from 'node:fs';
import vm from 'node:vm';

const FILE = process.argv[2] || new URL('../Code.gs', import.meta.url);
const NGUON = fs.readFileSync(FILE, 'utf8');
let dat = 0, hong = 0; const loi = [];
const ok = (t, c, ghi = '') => { c ? dat++ : (hong++, loi.push(t)); console.log(`${c ? '✓' : '✗ HỎNG'}  ${t}${ghi ? '  → ' + ghi : ''}`) };

const GIOI_HAN_O = 50000;
function taoMoiTruong({ matKhau = '', hongGhiManh = 0 } = {}) {
  const trang = {};
  let conHong = hongGhiManh;
  const A1 = a => { const m = /^([A-Z]+)(\d+)$/.exec(a); let c = 0; for (const ch of m[1]) c = c * 26 + ch.charCodeAt(0) - 64; return [+m[2], c] };
  function taoTrang(ten) {
    const o = new Map(), dd = new Map();
    const sh = {
      ten, o, dd,
      getLastRow() { let n = 0; for (const [k, v] of o) if (v !== '' && v != null) n = Math.max(n, +k.split(',')[0]); return n },
      getRange(a, b, c, d) {
        let r, cc, nr = 1, nc = 1;
        if (typeof a === 'string') [r, cc] = A1(a); else { r = a; cc = b; nr = c || 1; nc = d || 1 }
        const oCua = (i, j) => (r + i) + ',' + (cc + j);
        const ghi = (i, j, v) => {
          if (typeof v === 'string' && v.length > GIOI_HAN_O) throw new Error('Your input contains more than the maximum of 50000 characters in a single cell.');
          if (typeof v === 'string' && /^[=]/.test(v) && dd.get(oCua(i, j)) !== '@') v = '#ERROR!';
          o.set(oCua(i, j), v);
        };
        return {
          getValue: () => o.has(oCua(0, 0)) ? o.get(oCua(0, 0)) : '',
          setValue: v => { ghi(0, 0, v); return this },
          getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => o.has(oCua(i, j)) ? o.get(oCua(i, j)) : '')),
          setValues: vs => { if (ten === 'CAUHINH_MANH' && conHong > 0) { conHong--; throw new Error('Mất kết nối giữa chừng (giả lập)') }
            vs.forEach((hang, i) => hang.forEach((v, j) => ghi(i, j, v))) },
          clearContent: () => { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) o.delete(oCua(i, j)) },
          setNumberFormat: f => { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) dd.set(oCua(i, j), f) },
          setFontWeight: () => {},
        };
      },
      appendRow(v) { const n = sh.getLastRow() + 1; v.forEach((x, j) => o.set(n + ',' + (j + 1), x)) },
      setFrozenRows() {},
      deleteRows(tu, so) { for (const k of [...o.keys()]) { const h = +k.split(',')[0]; if (h >= tu && h < tu + so) o.delete(k) } },
    };
    return sh;
  }
  const ss = { getSheetByName: t => trang[t] || null, insertSheet: t => (trang[t] = taoTrang(t)), toast() {} };
  const ctx = {
    trang, console,
    SpreadsheetApp: { getActiveSpreadsheet: () => ss, flush() {} },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => (k === 'MATKHAU' && matKhau) ? matKhau : null }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: s => ({ s, setMimeType() { return this } }) },
    HtmlService: {},
  };
  vm.createContext(ctx);
  vm.runInContext(NGUON, ctx, { filename: 'Code.gs' });
  const get = p => JSON.parse(ctx.doGet({ parameter: p }).s);
  const post = d => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(d) } }).s);
  return { ctx, trang, get, post };
}
const cauHinhCo = (so, dai = 0) => ({ sp: Array.from({ length: so }, (_, i) => ({ ten: 'Mặt hàng ' + i, kg: 100, ml: 50, huongs: ['Hương ' + i],
  hstem: { thanhPhan: 'Bentonite ' + 'x'.repeat(dai), congDung: 'a=b; +c; -d' }, lichSu: [] })), kho: ['Hương 1'], dr: ['1 kg'] });

console.log('── A. MẬT KHẨU Ở SCRIPT PROPERTIES ──');
ok('Code.gs không còn viết cứng mật khẩu (không có const MATKHAU = "…")', !/const\s+MATKHAU\s*=/.test(NGUON));
ok('Code.gs đọc mật khẩu từ PropertiesService', /PropertiesService\.getScriptProperties\(\)\.getProperty\(TEN_THUOC_TINH_MK\)/.test(NGUON));
{
  const m = taoMoiTruong();
  const a = m.get({ a: 'cauhinh', mk: 'bat-ky' });
  ok('Chưa cài MATKHAU → mọi lệnh đọc bị chặn, báo rõ cần cài', /chưa cài mật khẩu/i.test(a.loi || ''), a.loi);
  ok('Chưa cài MATKHAU → mật khẩu rỗng cũng KHÔNG lọt', /chưa cài/i.test(m.get({ a: 'cauhinh', mk: '' }).loi || '') && /chưa cài/i.test(m.post({ a: 'luuCauHinh', mk: '', cauhinh: {} }).loi || ''));
  const pb = m.get({ a: 'phienban' });
  ok('a=phienban không cần mật khẩu, chỉ trả phiên bản + coMatKhau=false', pb.ok === 1 && pb.coMatKhau === false && /S\d+/.test(pb.phienBan) && !('cauhinh' in pb), JSON.stringify(pb));
}
{
  const m = taoMoiTruong({ matKhau: 'mk-thu' });
  ok('Đã cài: sai mật khẩu → "Sai mật khẩu"', m.get({ a: 'cauhinh', mk: 'sai' }).loi === 'Sai mật khẩu' && m.post({ a: 'luuCauHinh', mk: 'sai', cauhinh: {} }).loi === 'Sai mật khẩu');
  ok('Đã cài: đúng mật khẩu → đọc được', m.get({ a: 'cauhinh', mk: 'mk-thu' }).ok === 1);
  ok('Đã cài: phienban báo coMatKhau=true (không trả mật khẩu)', m.get({ a: 'phienban' }).coMatKhau === true && !JSON.stringify(m.get({ a: 'phienban' })).includes('mk-thu'));
  ok('Hành động lạ vẫn bị chặn', /không được phép/.test(m.get({ a: 'xoaHet', mk: 'mk-thu' }).loi || ''));
}

console.log('\n── B. CẤU HÌNH NHIỀU MẢNH (vượt 50.000 ký tự/ô) ──');
{
  const m = taoMoiTruong({ matKhau: 'k' });
  const nho = cauHinhCo(12);
  ok('Cấu hình nhỏ: lưu được', m.post({ a: 'luuCauHinh', mk: 'k', cauhinh: nho }).ok === 1);
  const b1 = m.trang.CAUHINH.getRange('B1').getValue();
  ok('Cấu hình nhỏ: ghi y như cũ vào B1 (bản Code.gs cũ vẫn đọc được)', b1.startsWith('{') && !m.trang.CAUHINH_MANH);
  ok('Cấu hình nhỏ: đọc lại đúng', m.get({ a: 'cauhinh', mk: 'k' }).cauhinh.sp.length === 12);

  const lon = cauHinhCo(40, 3000);   // ~130.000 ký tự
  const r = m.post({ a: 'luuCauHinh', mk: 'k', cauhinh: lon });
  const dai = JSON.stringify(m.ctx.sachCauHinhServer(lon, null)).length;
  ok('Cấu hình lớn (' + Math.round(dai / 1000) + 'k ký tự, gấp ' + (dai / 50000).toFixed(1) + ' lần trần 1 ô): lưu được, không lỗi', r.ok === 1 && dai > 100000, JSON.stringify(r));
  const dau = m.trang.CAUHINH.getRange('B1').getValue();
  ok('Cấu hình lớn: B1 chỉ giữ dấu MANH, các mảnh ở trang CAUHINH_MANH', /^MANH:A:\d+:\d+$/.test(dau), dau);
  ok('Không ô nào vượt 50.000 ký tự', [...Object.values(m.trang)].every(t => [...t.o.values()].every(v => typeof v !== 'string' || v.length <= 50000)));
  const doc = m.get({ a: 'cauhinh', mk: 'k' }).cauhinh;
  ok('Cấu hình lớn: đọc lại ĐÚNG từng ký tự', JSON.stringify(doc) === JSON.stringify(m.ctx.sachCauHinhServer(lon, null)));
  ok('Mảnh có chữ "=", "+", "-" không bị Sheets hiểu thành công thức', doc.sp[5].hstem.congDung === 'a=b; +c; -d' && ![...m.trang.CAUHINH_MANH.o.values()].includes('#ERROR!'));

  const lon2 = cauHinhCo(35, 3000);
  m.post({ a: 'luuCauHinh', mk: 'k', cauhinh: lon2 });
  ok('Lần ghi lớn tiếp theo: ghi sang cột B (luân phiên), đọc đúng bản mới', /^MANH:B:/.test(m.trang.CAUHINH.getRange('B1').getValue()) && m.get({ a: 'cauhinh', mk: 'k' }).cauhinh.sp.length === 35);

  m.post({ a: 'luuCauHinh', mk: 'k', cauhinh: nho });
  ok('Nhỏ lại: quay về ghi thẳng B1, đọc đúng', m.trang.CAUHINH.getRange('B1').getValue().startsWith('{') && m.get({ a: 'cauhinh', mk: 'k' }).cauhinh.sp.length === 12);
}
{
  const m = taoMoiTruong({ matKhau: 'k' });
  m.post({ a: 'luuCauHinh', mk: 'k', cauhinh: cauHinhCo(40, 3000) });
  const truoc = JSON.stringify(m.get({ a: 'cauhinh', mk: 'k' }).cauhinh), dauTruoc = m.trang.CAUHINH.getRange('B1').getValue();
  // lần ghi sau bị đứt giữa chừng khi đang ghi mảnh
  const m2 = m; let bat = true;
  const goc = m2.trang.CAUHINH_MANH.getRange; m2.trang.CAUHINH_MANH.getRange = function (...a) { const g = goc.apply(this, a); const sv = g.setValues; g.setValues = v => { if (bat) { bat = false; v.slice(0, 1).forEach((h, i) => h.forEach((x, j) => m2.trang.CAUHINH_MANH.o.set((1 + i) + ',' + (a[1] + j), x))); throw new Error('đứt giữa chừng') } return sv(v) }; return g };
  const r = m2.post({ a: 'luuCauHinh', mk: 'k', cauhinh: cauHinhCo(38, 3100) });
  ok('Ghi nhiều mảnh bị đứt giữa chừng → báo lỗi (Admin sẽ thử lại)', !!r.loi, JSON.stringify(r).slice(0, 120));
  ok('… và B1 vẫn trỏ bộ mảnh CŨ còn nguyên → đọc ra đúng cấu hình cũ', m2.trang.CAUHINH.getRange('B1').getValue() === dauTruoc && JSON.stringify(m2.get({ a: 'cauhinh', mk: 'k' }).cauhinh) === truoc);
}
{
  const m = taoMoiTruong({ matKhau: 'k' });
  m.trang.CAUHINH = undefined; m.ctx.lay('CAUHINH').getRange('B1').setValue(JSON.stringify({ sp: [{ ten: 'Cũ' }], kho: [] }));
  ok('Đọc được dữ liệu dạng cũ (JSON thẳng trong B1) — không cần chuyển đổi', m.get({ a: 'cauhinh', mk: 'k' }).cauhinh.sp[0].ten === 'Cũ');
  m.ctx.lay('CAUHINH').getRange('B1').setValue('MANH:A:3:999999');
  ok('Dấu MANH trỏ bộ mảnh hỏng/thiếu → trả null (không trả dữ liệu dở dang)', m.get({ a: 'cauhinh', mk: 'k' }).cauhinh === null);
}

console.log('\n── C. KHÔNG ĐỔI HÀNH VI CŨ ──');
{
  const m = taoMoiTruong({ matKhau: 'k' });
  m.post({ a: 'luuCauHinh', mk: 'k', cauhinh: { sp: [{ ten: 'A', sl: 9, pb: [1], lot: 'x' }], baoBi: [{ id: 'b' }] } });
  const c = m.get({ a: 'cauhinh', mk: 'k' }).cauhinh;
  ok('H1: server vẫn cắt trường đang ghi mẻ dở (sl/pb/lot)', !('sl' in c.sp[0]) && !('pb' in c.sp[0]) && !('lot' in c.sp[0]));
  m.post({ a: 'luuCauHinh', mk: 'k', cauhinh: { sp: [{ ten: 'A' }] } });
  ok('Admin cũ không gửi bao bì → server giữ bao bì đang lưu (S21)', m.get({ a: 'cauhinh', mk: 'k' }).cauhinh.baoBi[0].id === 'b');
  const t = m.post({ a: 'themMe', mk: 'k', nk: [{ id: 'm1', lot: '0101010926', sl: 10 }, { id: 'm1' }] });
  ok('Ghi mẻ: chống trùng id như cũ', t.them === 1 && t.boQua === 1 && m.get({ a: 'nhatky', mk: 'k' }).nk.length === 1);
  m.post({ a: 'xoaDLMoPhong', mk: 'k' });
  ok('Xoá dữ liệu mô phỏng: xoá mẻ, KHÔNG đụng cấu hình', m.get({ a: 'nhatky', mk: 'k' }).nk.length === 0 && m.get({ a: 'cauhinh', mk: 'k' }).cauhinh.sp[0].ten === 'A' && !!m.get({ a: 'cauhinh', mk: 'k' }).xoaMocTs);
}

console.log('\n── D. LỆNH SẢN XUẤT THEO LÔ (19/09/2026) — lenhSX qua cauhinh, lenhTienDo qua kênh riêng ──');
{
  const m = taoMoiTruong({ matKhau: 'k' });
  m.post({ a: 'luuCauHinh', mk: 'k', cauhinh: { sp: [{ ten: 'A' }], lenhSX: [{ id: 'LSX1', sp: 'A', keHoach: 2000, ghiChu: '', ngayTao: '2026-09-19', huy: false }] } });
  const c1 = m.get({ a: 'cauhinh', mk: 'k' }).cauhinh;
  ok('lenhSX đi qua đúng kênh cauhinh (giống tuHoSo/baoBi), lưu đúng nội dung', Array.isArray(c1.lenhSX) && c1.lenhSX.length === 1 && c1.lenhSX[0].sp === 'A' && c1.lenhSX[0].keHoach === 2000, JSON.stringify(c1.lenhSX));
  m.post({ a: 'luuCauHinh', mk: 'k', cauhinh: { sp: [{ ten: 'A' }] } });
  ok('Admin cũ không gửi lenhSX → server GIỮ bản đang lưu (không ghi đè thành rỗng, giống baoBi/tuHoSo)', m.get({ a: 'cauhinh', mk: 'k' }).cauhinh.lenhSX.length === 1);

  ok('a=lenhtiendo chưa có dòng nào → trả mảng rỗng', Array.isArray(m.get({ a: 'lenhtiendo', mk: 'k' }).lt) && m.get({ a: 'lenhtiendo', mk: 'k' }).lt.length === 0);
  const r1 = m.post({ a: 'themLenhTienDo', mk: 'k', lt: [{ id: 'LT1', lenhId: 'LSX1', sp: 'A', kg: 500, nv: 'Toàn', ts: '2026-09-19T08:00:00.000Z' }] });
  ok('Ghi tiến độ lần 1: thêm đúng 1 dòng', r1.them === 1 && r1.boQua === 0, JSON.stringify(r1));
  const r2 = m.post({ a: 'themLenhTienDo', mk: 'k', lt: [{ id: 'LT1', lenhId: 'LSX1', sp: 'A', kg: 999, nv: 'Ai đó khác', ts: '2026-09-19T09:00:00.000Z' }, { id: 'LT2', lenhId: 'LSX1', sp: 'A', kg: 300, nv: 'Bình', ts: '2026-09-19T09:05:00.000Z' }] });
  ok('Ghi trùng id (LT1) bị bỏ qua — append-only, không ai ghi đè dòng người khác (khác nhau nhân viên cùng ghi vào 1 lệnh)', r2.them === 1 && r2.boQua === 1, JSON.stringify(r2));
  const dsLt = m.get({ a: 'lenhtiendo', mk: 'k' }).lt;
  ok('Đọc lại đủ 2 dòng, giữ đúng nội dung dòng đầu (không bị dòng trùng id ghi đè)', dsLt.length === 2 && dsLt.find(x => x.id === 'LT1').kg === 500 && dsLt.find(x => x.id === 'LT1').nv === 'Toàn', JSON.stringify(dsLt));
  ok('Nhiều nhân viên khác nhau cùng ghi vào 1 lệnh (LSX1) đều được giữ lại riêng biệt', dsLt.every(x => x.lenhId === 'LSX1') && new Set(dsLt.map(x => x.nv)).size === 2);
}
console.log(`\nKẾT QUẢ MÁY CHỦ:  ${dat} đạt · ${hong} hỏng${hong ? '\nCẦN SỬA:\n  - ' + loi.join('\n  - ') : ''}`);
process.exit(hong ? 1 : 0);
