/* PEROMA — Service Worker: cho app mở được khi mất mạng.
   Thêm ngày 10/09/2026, được khách duyệt như MỘT NGOẠI LỆ CÓ CHỦ ĐÍCH với quy tắc
   "1 file HTML tự chứa".

   VÌ SAO LÀ NGOẠI LỆ HỢP LÝ
   - admin.html và nhanvien.html VẪN tự chứa 100%. Thiếu file này, app vẫn chạy đầy đủ
     (ví dụ khi gửi file HTML qua Zalo như trước) — chỉ không mở được lúc mất mạng.
   - Không có bước build nào. File này chỉ là lớp tăng cường tuỳ chọn.
   - Trình duyệt BẮT BUỘC Service Worker là file riêng, không nhúng được vào HTML.
   - Phương án "tải file HTML về máy" không dùng được: bản mở từ web (github.io) và bản
     mở từ file (file://) bị trình duyệt coi là hai nơi khác nhau nên dữ liệu lưu riêng —
     nhân viên đổi qua lại sẽ không thấy mẻ vừa ghi. Chỉ Service Worker giữ được CÙNG link,
     CÙNG dữ liệu.

   CHIẾN LƯỢC: MẠNG TRƯỚC, BẢN LƯU SAU
   Có mạng → luôn tải bản mới nhất từ mạng (và cập nhật bản lưu). Mất mạng → dùng bản lưu.
   KHÔNG dùng "bản lưu trước": cách đó nhanh hơn nhưng nhân viên có thể bị kẹt ở bản cũ
   mà không hề biết — nguy hiểm với phần mềm sản xuất.

   KHÔNG BAO GIỜ ĐỤNG DỮ LIỆU ĐỒNG BỘ
   Chỉ xử lý request GET cùng nguồn (file của chính app). Mọi request tới Apps Script
   (script.google.com — khác nguồn) và mọi POST đều đi thẳng ra mạng, KHÔNG qua bản lưu.
   Nếu lỡ cache câu trả lời của Apps Script, app sẽ nhận dữ liệu cũ tưởng là mới → sai
   đồng bộ. Còn việc "có mạng lại tự đẩy dữ liệu lên" do chính app lo (cờ daGui + vòng
   lặp 15 giây), không liên quan file này.

   GỠ BỎ KHẨN CẤP: đổi TU_HUY thành true rồi đẩy lên. Mọi máy sẽ tự xoá bản lưu và
   tự huỷ đăng ký ở lần mở kế tiếp có mạng, quay về hành vi như chưa từng có file này. */

const PHIEN_BAN = 'peroma-2026-09-11-s26';
const TU_HUY = false;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // Dọn các bản lưu của phiên bản cũ để không phình bộ nhớ
    const ten = await caches.keys();
    await Promise.all(ten.filter((k) => k !== PHIEN_BAN || TU_HUY).map((k) => caches.delete(k)));
    if (TU_HUY) {
      await self.registration.unregister();
      const ds = await self.clients.matchAll({ type: 'window' });
      ds.forEach((c) => c.navigate(c.url));
      return;
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  if (TU_HUY) return;
  const req = e.request;
  if (req.method !== 'GET') return;                        // POST đồng bộ: đi thẳng ra mạng
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;         // Apps Script, Google Fonts…: không cache

  e.respondWith((async () => {
    try {
      /* cache:'no-cache' — BẮT BUỘC, không phải tối ưu. fetch() trong Service Worker vẫn đi qua
         bộ nhớ đệm HTTP của trình duyệt; GitHub Pages gửi "Cache-Control: max-age=600", nên
         không có dòng này thì dù "mạng trước", sau mỗi lần đẩy bản mới nhân viên vẫn có thể
         nhận bản CŨ tới 10 phút. Phát hiện bằng kiemtra-offline.mjs (10/09/2026).
         'no-cache' = luôn hỏi lại máy chủ; Pages có gửi ETag nên file không đổi chỉ tốn một
         lượt trả lời 304 rất nhẹ, không tải lại cả file.
         Dùng req.url thay vì req: request mở trang (mode 'navigate') không cho gắn tuỳ chọn
         cache. Đây là file tĩnh cùng nguồn nên chỉ cần URL là đủ. */
      const moi = await fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' });
      // Chỉ lưu câu trả lời thành công, tránh lưu trang lỗi 404/500 thay cho app thật
      if (moi && moi.ok) {
        const banSao = moi.clone();
        caches.open(PHIEN_BAN).then((c) => c.put(req, banSao)).catch(() => {});
      }
      return moi;
    } catch (_) {
      // Mất mạng: dùng bản đã lưu. Bỏ query string để "admin.html?x=1" vẫn khớp "admin.html"
      const daLuu = await caches.match(req, { ignoreSearch: true });
      if (daLuu) return daLuu;
      return new Response(
        '<meta charset="utf-8"><body style="background:#F4F4F5;color:#1C1C1E;font-family:sans-serif;padding:24px">' +
        '<h3>Chưa mở được Peroma khi mất mạng</h3>' +
        '<p>Máy này chưa từng mở app khi có mạng nên chưa có bản lưu.<br>' +
        'Kết nối mạng, mở app một lần, sau đó mất mạng vẫn dùng được.</p></body>',
        { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }
  })());
});
