import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('./peroma');
const PORT = 8777;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.gs': 'text/plain', '.json': 'application/json', '.md': 'text/plain; charset=utf-8' };

http.createServer((req, res) => {
  // Chrome tự xin /favicon.ico cho mọi trang. Trả 204 thay vì 404 để không sinh lỗi console
  // giả, làm hỏng test "không có lỗi console". App không hề tham chiếu file này.
  if (/\/favicon\.ico$/.test(req.url)) { res.writeHead(204); res.end(); return; }

  /* Điểm giả lập Apps Script cho bộ test (10/09/2026).
     Các test đồng bộ giả lập window.dbGoi, nhưng vòng lặp poll 9s chạy nền vẫn có thể gọi thật
     đúng lúc DONGBO_URL đang mang giá trị tạm. Trước đây giá trị tạm là một tên miền bịa
     (…khong-ton-tai.test) → Chrome vẫn phát request ra ngoài và sinh lỗi console, làm hỏng
     test "không có lỗi console". Trỏ về đây thì mọi lượt gọi lạc đều nhận JSON hợp lệ,
     không ra Internet, không đụng Google Sheet thật. */
  if (/^\/gia-lap-exec/.test(req.url)) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ schemaVersion: 1, ok: 1, cauhinh: null, ts: '', xoaMocTs: '', nk: [], bc: [] }));
    return;
  }
  /* Route tạm (10/09/2026) phục vụ BẢN GỐC chưa sửa, để so sánh xem 2 test đang hỏng ở bộ
     Nhân viên là lỗi có sẵn từ trước hay do thay đổi hôm nay gây ra. Xoá được sau khi kết luận. */
  if (/^\/kiemchung-nv\//.test(req.url)) {
    const p2 = path.resolve('./kiemchung/nv', decodeURIComponent(req.url.split('?')[0]).replace(/^\/kiemchung-nv\//, ''));
    if (fs.existsSync(p2)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(p2).pipe(res);
      return;
    }
  }
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
  const full = path.resolve(ROOT, rel);
  if (!full.startsWith(ROOT) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
    console.log('404 ←', req.url, '| referer:', req.headers.referer || '(không có)');
    res.writeHead(404); res.end('not found'); return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(full)] || 'application/octet-stream' });
  fs.createReadStream(full).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log('server on http://127.0.0.1:' + PORT));
