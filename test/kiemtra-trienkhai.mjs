/* BỘ KIỂM TRA CÔNG CỤ TRIỂN KHAI — cong-cu/trienkhai.mjs (S23, 10/09/2026)
   Chạy:  node test/kiemtra-trienkhai.mjs
   Dùng clasp GIẢ (ghi lại lệnh, giả lập dự án Apps Script có file "Mã.gs" còn mật khẩu viết cứng) và web app GIẢ
   (máy chủ cục bộ trả ?a=phienban). KHÔNG đăng nhập Google, KHÔNG đụng Apps Script/Google Sheet thật. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawnSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const KHO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONGCU = path.join(KHO, 'cong-cu', 'trienkhai.mjs');
const PB = (fs.readFileSync(path.join(KHO, 'Code.gs'), 'utf8').match(/PHIEN_BAN_MAYCHU\s*=\s*'([^']+)'/) || [])[1];
let dat = 0, hong = 0; const loi = [];
const ok = (t, c, ghi = '') => { c ? dat++ : (hong++, loi.push(t)); console.log(`${c ? '✓' : '✗ HỎNG'}  ${t}${ghi ? '  → ' + ghi : ''}`) };

const TAM = fs.mkdtempSync(path.join(os.tmpdir(), 'peroma-trienkhai-'));
const NHATKY = path.join(TAM, 'clasp-log.txt');
const GIA = path.join(TAM, 'clasp-gia.mjs');
fs.writeFileSync(GIA, `import fs from 'node:fs'; import path from 'node:path';
const a = process.argv.slice(2); const json = a[0] === '--json'; if (json) a.shift();
fs.appendFileSync(process.env.FAKE_LOG, JSON.stringify(a) + '\\n');
const dir = path.join(process.cwd(), 'apps-script');
if (a[0] === 'show-authorized-user') { console.log(JSON.stringify({ loggedIn: process.env.FAKE_LOGIN !== '0', email: 'chu@vidu.vn' })); process.exit(0) }
if (a[0] === 'pull') { fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'Mã.gs'), "const MATKHAU = 'bi-mat-that';\\nfunction doGet(e){}\\nfunction doPost(e){}\\n");
  fs.writeFileSync(path.join(dir, 'appsscript.json'), '{"timeZone":"Asia/Ho_Chi_Minh","webapp":{"access":"ANYONE_ANONYMOUS","executeAs":"USER_DEPLOYING"}}');
  fs.writeFileSync(path.join(dir, 'Admin.html'), '<p>cũ</p>'); console.log('Pulled 3 files.'); process.exit(0) }
if (a[0] === 'list-deployments') { console.log(process.env.FAKE_DEPLOY || JSON.stringify([{ deploymentId: 'AKfyHEAD000000000000' }, { deploymentId: 'AKfyTHAT11111111111111', versionNumber: 12, description: 'Peroma' }])); process.exit(0) }
if (a[0] === 'push') { const tep = fs.readdirSync(dir).sort(); fs.appendFileSync(process.env.FAKE_LOG, 'PUSH ' + JSON.stringify(tep) + ' ' + (fs.readFileSync(path.join(dir, 'Code.gs'), 'utf8').length) + '\\n'); process.exit(0) }
if (a[0] === 'redeploy') { console.log(JSON.stringify({ deploymentId: a[1], versionNumber: 13, description: a[3] })); process.exit(0) }
process.exit(0);`);

let traLoi = { ok: 1, ten: 'Peroma', phienBan: PB, coMatKhau: true };
const may = http.createServer((q, r) => { r.writeHead(200, { 'Content-Type': 'application/json' }); r.end(JSON.stringify({ ...traLoi, _url: q.url })) });
await new Promise(z => may.listen(0, '127.0.0.1', z));
const GOC = `http://127.0.0.1:${may.address().port}/macros/s/`;

function chay(args, env = {}) {
  return new Promise(z => {
    const c = spawn(process.execPath, [CONGCU, ...args], { cwd: KHO, env: { ...process.env, PEROMA_CLASP: GIA, PEROMA_TRIENKHAI_DIR: TAM, PEROMA_PING_GOC: GOC, PEROMA_PING_CHO: '30', FAKE_LOG: NHATKY, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let ra = ''; c.stdout.on('data', d => ra += d); c.stderr.on('data', d => ra += d);
    c.on('close', ma => z({ ma, ra }));
  });
}
const nhatKy = () => fs.existsSync(NHATKY) ? fs.readFileSync(NHATKY, 'utf8') : '';
const docCai = () => JSON.parse(fs.readFileSync(path.join(TAM, 'trienkhai.local.json'), 'utf8'));

let r = await chay(['thu']);
ok('Chưa nối Apps Script → dừng, chỉ cách "caidat"', r.ma !== 0 && /caidat/.test(r.ra), 'mã ' + r.ma);
r = await chay(['caidat', 'SCRIPTID_giaLap_1234567890abc'], { FAKE_LOGIN: '0' });
ok('Chưa đăng nhập Google → dừng, chỉ cách "dangnhap" + bật Apps Script API', r.ma !== 0 && /dangnhap/.test(r.ra) && /usersettings/.test(r.ra));
r = await chay(['caidat', 'SCRIPTID_giaLap_1234567890abc']);
const dir = path.join(TAM, 'apps-script');
ok('caidat: nối xong, tự chọn đúng bản triển khai web app (bỏ bản @HEAD)', r.ma === 0 && docCai().deploymentId === 'AKfyTHAT11111111111111', r.ra.split('\n').slice(-3).join(' | '));
const cl = JSON.parse(fs.readFileSync(path.join(TAM, '.clasp.json'), 'utf8'));
ok('caidat: .clasp.json giữ đuôi .gs (không đổi thành .js)', cl.scriptId === 'SCRIPTID_giaLap_1234567890abc' && cl.rootDir === 'apps-script' && cl.scriptExtensions[0] === '.gs');
ok('caidat: file máy chủ cũ "Mã.gs" (có mật khẩu viết cứng) được thay bằng Code.gs của kho', !fs.existsSync(path.join(dir, 'Mã.gs')) && fs.readFileSync(path.join(dir, 'Code.gs'), 'utf8') === fs.readFileSync(path.join(KHO, 'Code.gs'), 'utf8'));
ok('caidat: không còn mật khẩu thật nào trong thư mục kéo về; file khác (Admin.html, appsscript.json) giữ nguyên', !fs.readdirSync(dir).some(f => fs.readFileSync(path.join(dir, f), 'utf8').includes('bi-mat-that')) && fs.existsSync(path.join(dir, 'Admin.html')) && fs.existsSync(path.join(dir, 'appsscript.json')));
const gi = fs.readFileSync(path.join(KHO, '.gitignore'), 'utf8');
ok('.gitignore chặn apps-script/, .clasp.json, trienkhai.local.json (không lên GitHub)', /^apps-script\/?$/m.test(gi) && /^\*\.json$/m.test(gi) && !/^!\.clasp\.json/m.test(gi) && !/^!trienkhai/m.test(gi));

r = await chay(['caidat', 'SCRIPTID_giaLap_1234567890abc'], { FAKE_DEPLOY: JSON.stringify([{ deploymentId: 'AKfyA', versionNumber: 3 }, { deploymentId: 'AKfyB', versionNumber: 9 }]) });
ok('caidat: có nhiều bản triển khai → liệt kê, bắt chọn rõ (không đoán bừa)', r.ma === 2 && /AKfyA/.test(r.ra) && /AKfyB/.test(r.ra) && /--trienkhai/.test(r.ra));
r = await chay(['caidat', 'SCRIPTID_giaLap_1234567890abc', '--trienkhai', 'AKfyTHAT11111111111111'], { FAKE_DEPLOY: JSON.stringify([{ deploymentId: 'AKfyTHAT11111111111111', versionNumber: 3 }, { deploymentId: 'AKfyB', versionNumber: 9 }]) });
ok('caidat --trienkhai <mã>: nhận đúng bản được chỉ định', r.ma === 0 && docCai().deploymentId === 'AKfyTHAT11111111111111');

fs.writeFileSync(NHATKY, '');
r = await chay(['thu']);
ok('thu: chạy đủ bộ kiểm tra, cho xem sẽ đẩy gì, KHÔNG đẩy', r.ma === 0 && /Máy chủ \(Code\.gs\)/.test(r.ra) && /3 file khớp nhau/.test(r.ra) && !/PUSH/.test(nhatKy()), r.ra.split('\n').slice(-2).join(' | '));
r = await chay([]);
ok('Lần đầu đẩy mà chưa xác nhận đã cài MATKHAU → KHÔNG đẩy', r.ma === 3 && !/PUSH/.test(nhatKy()));
r = await chay(['--co']);
const nk = nhatKy();
ok('Đẩy: push đúng bộ file (Code.gs của kho + Admin.html + appsscript.json)', /PUSH \["Admin\.html","Code\.gs","appsscript\.json"\]/.test(nk), nk.split('\n').filter(l => /PUSH/.test(l)).join(''));
ok('Đẩy: cập nhật ĐÚNG bản triển khai đang dùng (link /exec giữ nguyên), ghi phiên bản vào mô tả', nk.includes('["redeploy","AKfyTHAT11111111111111","-d","Peroma ' + PB));
ok('Đẩy: gọi thử ?a=phienban xác nhận bản mới + đã có mật khẩu → báo XONG', r.ma === 0 && /XONG/.test(r.ra) && docCai().daXacNhanMatKhau === true, r.ra.split('\n').slice(-2).join(' | '));
traLoi = { ok: 1, ten: 'Peroma', phienBan: PB, coMatKhau: false };
r = await chay([]);
ok('Máy chủ chưa có thuộc tính MATKHAU → báo động rõ ràng, chỉ đúng chỗ sửa', r.ma === 4 && /CHƯA CÓ THUỘC TÍNH MATKHAU/.test(r.ra));
traLoi = { ok: 1, ten: 'Peroma', phienBan: '2026-01-01-CU', coMatKhau: true };
r = await chay([]);
ok('Web app vẫn trả phiên bản cũ → báo lỗi, không báo XONG giả', r.ma !== 0 && !/XONG/.test(r.ra) && /chưa trả đúng phiên bản/.test(r.ra));

may.close(); fs.rmSync(TAM, { recursive: true, force: true });
console.log(`\nKẾT QUẢ CÔNG CỤ TRIỂN KHAI:  ${dat} đạt · ${hong} hỏng${hong ? '\nCẦN SỬA:\n  - ' + loi.join('\n  - ') : ''}`);
process.exit(hong ? 1 : 0);
