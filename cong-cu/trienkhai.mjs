/* PEROMA — TRIỂN KHAI CODE.GS LÊN APPS SCRIPT BẰNG MỘT LỆNH (S23, 10/09/2026)
   Thay cho việc dán tay Code.gs rồi bấm Triển khai → Quản lý bản triển khai → Phiên bản mới.
   Dùng công cụ chính thức của Google: clasp (@google/clasp).

   CÁCH DÙNG (trong thư mục kho, xem HUONG-DAN-TRIEN-KHAI.md):
     npm run trienkhai -- dangnhap              Đăng nhập Google MỘT LẦN (mở trình duyệt; chủ tự làm)
     npm run trienkhai -- caidat <scriptId>     Nối thư mục này với dự án Apps Script của bạn (MỘT LẦN)
     npm run trienkhai                          Kiểm tra → đẩy Code.gs → cập nhật bản triển khai → xác nhận
     npm run trienkhai -- thu                   Chỉ kiểm tra + cho xem sẽ đẩy gì, KHÔNG đẩy

   AN TOÀN:
   - Không chứa mật khẩu, không chứa link Apps Script. scriptId + mã bản triển khai cất trong
     trienkhai.local.json và .clasp.json — cả hai bị .gitignore chặn, không lên GitHub.
   - Thư mục apps-script/ (bản sao dự án kéo về, có thể còn mật khẩu cũ) cũng bị .gitignore chặn.
   - Luôn chạy bộ kiểm tra máy chủ + kiểm tra trước khi gửi; hỏng là DỪNG, không đẩy.
   - Cập nhật ĐÚNG bản triển khai web app đang dùng → link /exec giữ nguyên, 2 app không phải khai lại.
   - Sau khi đẩy, gọi thử ?a=phienban (không cần mật khẩu, không đụng dữ liệu) để chắc bản mới đã chạy
     và máy chủ đã có thuộc tính MATKHAU. */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const KHO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOI = path.resolve(process.env.PEROMA_TRIENKHAI_DIR || KHO);          // nơi cất cấu hình cục bộ
const THU_MUC_GS = 'apps-script';
const F_CLASP = path.join(NOI, '.clasp.json'), F_CAI = path.join(NOI, 'trienkhai.local.json');
const GOC_EXEC = process.env.PEROMA_PING_GOC || 'https://script.google.com/macros/s/';
const _ts = process.argv.slice(2);
const lenh = (_ts[0] && !_ts[0].startsWith('--')) ? _ts.shift() : 'day';   // "--co" đứng đầu vẫn là lệnh đẩy
const thamSo = _ts;
const co = k => thamSo.includes(k);
const giaTri = k => { const i = thamSo.indexOf(k); return i >= 0 ? thamSo[i + 1] : undefined };

const DO = s => `\x1b[31m${s}\x1b[0m`, XANH = s => `\x1b[32m${s}\x1b[0m`, VANG = s => `\x1b[33m${s}\x1b[0m`;
const dung = (msg, ma = 1) => { console.error('\n' + DO('✗ ' + msg)); process.exit(ma) };

function clasp(args, { json = false, inherit = false } = {}) {
  const bin = process.env.PEROMA_CLASP || path.join(KHO, 'node_modules', '@google', 'clasp', 'build', 'src', 'index.js');
  if (!fs.existsSync(bin)) dung('Chưa cài clasp. Chạy:  npm install   (trong thư mục kho) rồi thử lại.');
  const a = json ? ['--json', ...args] : args;
  const r = spawnSync(process.execPath, [bin, ...a], { cwd: NOI, encoding: 'utf8', stdio: inherit ? 'inherit' : 'pipe', env: process.env });
  if (inherit) return { ok: r.status === 0 };
  const ra = (r.stdout || '').trim(), loi = (r.stderr || '').trim();
  let du = null; if (json) { try { du = JSON.parse(ra.slice(ra.search(/[[{]/))) } catch (e) { } }
  return { ok: r.status === 0, ra, loi, du };
}
function chayKiem() {
  console.log('\n── Kiểm tra trước khi đẩy ──');
  const buoc = [
    ['Máy chủ (Code.gs) trên Google Sheet giả lập', [path.join(KHO, 'test', 'kiemtra-codegs.mjs'), path.join(KHO, 'Code.gs')]],
    ['3 file khớp nhau (kiểm tra trước khi gửi)', [path.join(KHO, 'test', 'kiemtra-truockhi-gui.mjs'), path.join(KHO, 'admin.html'), path.join(KHO, 'nhanvien.html'), path.join(KHO, 'Code.gs')]],
  ];
  for (const [ten, args] of buoc) {
    const r = spawnSync(process.execPath, args, { cwd: KHO, encoding: 'utf8' });
    const dong = ((r.stdout || '') + (r.stderr || '')).trim().split('\n');
    if (r.status !== 0) { console.log(dong.filter(l => /HỎNG|✗|Error|lỗi/i.test(l)).slice(0, 12).join('\n')); dung(ten + ': CÓ LỖI — không đẩy. Sửa xong chạy lại.') }
    console.log(XANH('✓ ') + ten + ' — ' + (dong.filter(l => /KẾT QUẢ/.test(l)).pop() || 'đạt').replace(/^\s*/, ''));
  }
}
const docJson = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch (e) { return null } };
const phienBanGs = () => (fs.readFileSync(path.join(KHO, 'Code.gs'), 'utf8').match(/PHIEN_BAN_MAYCHU\s*=\s*'([^']+)'/) || [])[1] || '?';
function dongBoCodeGs() {
  /* Thay mọi file máy chủ cũ (file .gs có doGet/doPost — thường tên "Mã.gs" hoặc "Code.gs", có thể còn mật khẩu
     viết cứng) bằng đúng Code.gs của kho. File khác trong dự án (Admin.html, appsscript.json…) giữ nguyên. */
  const dir = path.join(NOI, THU_MUC_GS); fs.mkdirSync(dir, { recursive: true });
  const bo = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (!/\.(gs|js)$/i.test(f) || f === 'Code.gs') continue;
    const nd = fs.readFileSync(p, 'utf8');
    if (/function\s+doGet\s*\(|function\s+doPost\s*\(/.test(nd)) { fs.unlinkSync(p); bo.push(f) }
  }
  fs.copyFileSync(path.join(KHO, 'Code.gs'), path.join(dir, 'Code.gs'));
  return bo;
}
async function hoi(cau) {
  if (co('--co')) return true;
  if (!process.stdin.isTTY) return false;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const t = (await rl.question(cau + ' (c/k): ')).trim().toLowerCase(); rl.close();
  return t === 'c' || t === 'co' || t === 'có' || t === 'y';
}
async function xacNhanChay(deploymentId, can) {
  const url = GOC_EXEC + deploymentId + '/exec?a=phienban';
  for (let lan = 1; lan <= 4; lan++) {
    try {
      const r = await fetch(url, { redirect: 'follow' });
      const j = JSON.parse(await r.text());
      if (j.phienBan === can) return j;
      if (lan === 4) return j;
    } catch (e) { if (lan === 4) return { loi: String(e.message || e) } }
    await new Promise(z => setTimeout(z, +(process.env.PEROMA_PING_CHO || 3000)));
  }
}
function canDangNhap() {
  const u = clasp(['show-authorized-user'], { json: true });
  if (!u.du || !u.du.loggedIn) dung('Máy này chưa đăng nhập Google cho clasp. Chạy:\n    npm run trienkhai -- dangnhap\n  (mở trình duyệt, đăng nhập ĐÚNG tài khoản Google sở hữu bảng tính Peroma, bấm Cho phép).\n  Lần đầu còn phải bật "Google Apps Script API" tại https://script.google.com/home/usersettings');
  return u.du.email || '(tài khoản đã đăng nhập)';
}

if (lenh === 'dangnhap') {
  console.log('Mở trình duyệt để đăng nhập Google cho clasp — chọn ĐÚNG tài khoản sở hữu bảng tính Peroma.');
  process.exit(clasp(['login'], { inherit: true }).ok ? 0 : 1);
}

if (lenh === 'caidat') {
  const scriptId = thamSo.find(x => !x.startsWith('--') && x !== giaTri('--trienkhai'));
  if (!scriptId || !/^[A-Za-z0-9_-]{20,}$/.test(scriptId)) dung('Thiếu mã dự án (scriptId). Lấy ở Apps Script → Cài đặt dự án (bánh răng) → "Mã tập lệnh".\n  Chạy:  npm run trienkhai -- caidat <mã tập lệnh>');
  const email = canDangNhap();
  console.log('Tài khoản: ' + email);
  fs.writeFileSync(F_CLASP, JSON.stringify({ scriptId, rootDir: THU_MUC_GS, scriptExtensions: ['.gs'], htmlExtensions: ['.html'] }, null, 2));
  console.log('Kéo dự án Apps Script về thư mục ' + THU_MUC_GS + '/ …');
  const p = clasp(['pull']);
  if (!p.ok) dung('Không kéo được dự án: ' + (p.loi || p.ra) + '\n  Kiểm tra lại mã tập lệnh và đã bật Google Apps Script API (https://script.google.com/home/usersettings).');
  const bo = dongBoCodeGs();
  console.log(XANH('✓ ') + 'Đã kéo về: ' + fs.readdirSync(path.join(NOI, THU_MUC_GS)).join(', '));
  if (bo.length) console.log(VANG('ℹ ') + 'File máy chủ cũ sẽ được thay bằng Code.gs của kho khi đẩy: ' + bo.join(', '));
  const d = clasp(['list-deployments'], { json: true });
  const ds = (Array.isArray(d.du) ? d.du : []).filter(x => x.deploymentId && x.versionNumber);
  let chon = giaTri('--trienkhai');
  if (!chon) {
    if (ds.length === 1) chon = ds[0].deploymentId;
    else if (!ds.length) dung('Dự án chưa có bản triển khai web app nào. Mở Apps Script → Triển khai → Tùy chọn triển khai mới → Ứng dụng web, rồi chạy lại.');
    else {
      console.log('\nDự án có ' + ds.length + ' bản triển khai. Chọn đúng bản mà 2 app đang dùng (link /exec trong ô kết nối có chứa mã này):');
      ds.forEach(x => console.log('  ' + x.deploymentId + '  @' + x.versionNumber + (x.description ? '  — ' + x.description : '')));
      dung('Chạy lại:  npm run trienkhai -- caidat ' + scriptId + ' --trienkhai <mã bản triển khai>', 2);
    }
  }
  fs.writeFileSync(F_CAI, JSON.stringify({ scriptId, deploymentId: chon, caiLuc: new Date().toISOString(), daXacNhanMatKhau: false }, null, 2));
  console.log(XANH('\n✓ Đã nối xong.') + ' Bản triển khai sẽ cập nhật: …' + chon.slice(-8) + ' (link /exec giữ nguyên).');
  console.log('\nViệc tiếp theo:\n  1. Apps Script → Cài đặt dự án → Thuộc tính tập lệnh → thêm  MATKHAU = <mật khẩu đang nhập trong 2 app>\n  2. npm run trienkhai');
  process.exit(0);
}

if (lenh === 'day' || lenh === 'thu') {
  const cfg = docJson(F_CAI), cl = docJson(F_CLASP);
  if (!cfg || !cfg.deploymentId || !cl) dung('Thư mục này chưa nối với Apps Script. Chạy trước:  npm run trienkhai -- caidat <mã tập lệnh>');
  const can = phienBanGs();
  console.log('Peroma — triển khai Code.gs · phiên bản máy chủ ' + can);
  chayKiem();
  const bo = dongBoCodeGs();
  const tep = fs.readdirSync(path.join(NOI, THU_MUC_GS));
  console.log('\nSẽ đẩy lên Apps Script: ' + tep.join(', ') + (bo.length ? VANG('  (thay file cũ: ' + bo.join(', ') + ')') : ''));
  if (lenh === 'thu') { console.log(XANH('\n✓ Chế độ thử: không đẩy gì.')); process.exit(0) }
  canDangNhap();
  if (!cfg.daXacNhanMatKhau) {
    console.log(VANG('\nTừ bản S23, mật khẩu KHÔNG còn nằm trong Code.gs mà ở Thuộc tính tập lệnh của Apps Script.'));
    const ok = await hoi('Bạn đã thêm thuộc tính MATKHAU (đúng mật khẩu đang nhập trong 2 app) chưa?');
    if (!ok) dung('Chưa đẩy. Thêm thuộc tính trước: Apps Script → Cài đặt dự án → Thuộc tính tập lệnh → MATKHAU. Rồi chạy lại.', 3);
  }
  console.log('\nĐẩy mã lên…');
  const p = clasp(['push', '--force']);
  if (!p.ok) dung('Đẩy mã thất bại: ' + (p.loi || p.ra));
  console.log(XANH('✓ ') + 'Đã đẩy mã.');
  const ngay = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const d = clasp(['redeploy', cfg.deploymentId, '-d', 'Peroma ' + can + ' · ' + ngay], { json: true });
  if (!d.ok) dung('Cập nhật bản triển khai thất bại: ' + (d.loi || d.ra) + '\n  Mã đã đẩy nhưng web app vẫn chạy bản cũ — thử lại lệnh này, hoặc vào Apps Script → Triển khai → Quản lý bản triển khai → sửa → Phiên bản mới.');
  console.log(XANH('✓ ') + 'Web app đã chuyển sang phiên bản mới' + (d.du && d.du.versionNumber ? ' (@' + d.du.versionNumber + ')' : '') + '.');
  console.log('Gọi thử máy chủ…');
  const j = await xacNhanChay(cfg.deploymentId, can);
  if (!j || j.loi || j.phienBan !== can) dung('Máy chủ chưa trả đúng phiên bản ' + can + ' (nhận: ' + JSON.stringify(j).slice(0, 160) + '). Đợi 1 phút rồi chạy lại "npm run trienkhai -- thu" để xem, hoặc mở Apps Script kiểm tra.');
  if (!j.coMatKhau) {
    dung('BẢN MỚI ĐANG CHẠY NHƯNG MÁY CHỦ CHƯA CÓ THUỘC TÍNH MATKHAU → mọi máy đang báo "Máy chủ chưa cài mật khẩu".\n  Làm ngay: Apps Script → Cài đặt dự án → Thuộc tính tập lệnh → thêm MATKHAU = <mật khẩu đang nhập trong 2 app>.\n  Có hiệu lực NGAY, không cần triển khai lại.', 4);
  }
  cfg.daXacNhanMatKhau = true; cfg.lanCuoi = new Date().toISOString(); cfg.phienBan = can;
  fs.writeFileSync(F_CAI, JSON.stringify(cfg, null, 2));
  console.log(XANH('\n✓ XONG. Máy chủ đang chạy ' + can + ', mật khẩu đã cài. Hai app không cần làm gì thêm.'));
  process.exit(0);
}
dung('Không rõ lệnh "' + lenh + '". Dùng: dangnhap · caidat <scriptId> · thu · (để trống = đẩy)');
