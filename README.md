# PEROMA — Phần mềm sản xuất Khánh Hoàng

Pha hương liệu, ghi mẻ, cấp số lô, in tem, tra lô, báo cáo sản lượng.

## Mở app

- [Máy quản lý (Admin)](https://kaboyx1-hue.github.io/peroma/admin.html) — **chỉ dùng trên máy tính**
- [Máy nhân viên](https://kaboyx1-hue.github.io/peroma/nhanvien.html)

> ⚠️ **Chỉ dùng MỘT máy Admin để chỉnh sửa.** Mở Admin trên điện thoại sẽ tự vào **chế độ chỉ xem**: xem được mọi thứ nhưng không gửi thay đổi lên hệ thống và không trừ tồn kho. Lý do: các máy Admin đồng bộ nguyên khối cấu hình, nên hai máy cùng sửa sẽ ghi đè mất thay đổi của nhau và **trừ tồn kho hương liệu hai lần**. Chế độ này tạm thời, sẽ gỡ khi dựng lại bản Admin cho điện thoại.
>
> **Không dùng link `…/exec?trang=admin` của Apps Script nữa**, và không dán file `Admin.html` cũ vào Apps Script — bản đó chưa có các bản sửa, chạy song song sẽ xử lý dữ liệu khác nhau.

## Lần đầu mở trên một máy mới

App **không** chứa sẵn địa chỉ Google Sheet và mật khẩu — phải nhập một lần cho mỗi máy:

- **Admin**: tab `Sao lưu` → khối **Kết nối Google Sheet** → dán địa chỉ Apps Script (kết thúc bằng `/exec`) và mật khẩu → *Lưu & kiểm tra kết nối*.
- **Nhân viên**: tab `Dữ liệu` → khối **Kết nối Google Sheet** → nhập tương tự.

Nhập xong, máy đó nhớ luôn. Bỏ trống thì app vẫn chạy bình thường nhưng chỉ lưu trên máy, không đồng bộ.

## Vì sao không nhúng sẵn địa chỉ và mật khẩu vào mã nguồn

Kho này công khai. Nhúng sẵn đồng nghĩa ai đọc được mã cũng đọc/ghi/xoá được toàn bộ dữ liệu sản xuất trên Google Sheet.

Ngoài ra, ngày 10/09/2026 đã xảy ra sự cố: bộ test tự động (vốn viết cho môi trường không có mạng) được chạy trên máy có mạng, và vì mã nguồn khi đó nhúng sẵn địa chỉ + mật khẩu nên test đã ghi đè dữ liệu test lên Sheet thật. Tách hai giá trị này ra khiến bản mã mà test mở không còn đường ra Internet — chặn tận gốc loại tai nạn đó.

## Cấu trúc

| File | Vai trò |
|---|---|
| `admin.html` | App quản lý — công thức, danh mục, báo cáo, sao lưu |
| `nhanvien.html` | App nhân viên — pha mẻ, in tem, tra lô, chốt thực tế |
| `sw.js` | Cho app mở được khi mất mạng (xem mục dưới) |
| `Code.gs` | Apps Script đặt trong Google Sheet, làm máy chủ đồng bộ |
| `test/` | Bộ kiểm thử tự động (Playwright) |

## Dùng khi mất mạng

Mở app **một lần khi có mạng** trên mỗi máy, sau đó mất mạng vẫn mở được bằng đúng link cũ, dữ liệu vẫn nguyên. Mẻ ghi lúc mất mạng được giữ trong máy và **tự gửi lên Sheet khi có mạng lại** (chấm đồng bộ hiện 🔴 "đang giữ lại" trong lúc chờ).

Có mạng thì app luôn lấy bản mới nhất — không bị kẹt ở bản cũ sau mỗi lần cập nhật.

`sw.js` là **ngoại lệ có chủ đích** với nguyên tắc "mỗi app là 1 file HTML tự chứa" (khách duyệt 10/09/2026). Hai file app vẫn tự chứa hoàn toàn: gửi riêng `admin.html` hay `nhanvien.html` qua Zalo vẫn chạy đủ, chỉ không có chế độ mất mạng. Trình duyệt bắt buộc cơ chế này phải là file riêng.

Gỡ khẩn cấp: trong `sw.js` đổi `TU_HUY = true` rồi đẩy lên — mọi máy tự gỡ ở lần mở kế tiếp có mạng.

## Máy chủ đồng bộ

`Code.gs` dán vào Apps Script của Google Sheet, rồi **Triển khai → Ứng dụng web → Bất kỳ ai**.
Mật khẩu nằm ở biến `MATKHAU` trong `Code.gs` và phải khớp với mật khẩu nhập trong app.

Đổi mật khẩu: sửa `MATKHAU` → **Triển khai → Quản lý bản triển khai → sửa → Phiên bản mới** → nhập lại mật khẩu mới trong app trên từng máy.

## Kiểm thử

Bộ test gồm 6 phần: Admin (`kiemtra.mjs`), Nhân viên (`kiemtra-nv.mjs`), vòng tròn Admin→NV→Admin (`kiemtra-vongtron.mjs`), chế độ mất mạng (`kiemtra-offline.mjs`), chế độ chỉ xem trên điện thoại (`kiemtra-chixem.mjs`), và kiểm tra trước khi gửi (`kiemtra-truockhi-gui.mjs`).

Kết quả lần chạy gần nhất (10/09/2026, bản S8/R6): **358 + 174 + 19 + 21 + 17 = 589 phép kiểm, 0 hỏng**; kiểm tra trước khi gửi: không lỗi.

> **Lưu ý:** bộ test hiện được viết cho môi trường làm việc cụ thể (đường dẫn Chrome và thư mục cố định trên máy phát triển, cấu trúc thư mục `huong/` + `nv/`), **chưa chạy thẳng được từ kho này trên máy khác**. Làm cho test chạy độc lập là việc riêng, chưa làm.

Test luôn mở bản mã **chưa cấu hình kết nối**, nên không bao giờ chạm được vào Google Sheet thật — đây chính là bài học từ sự cố 10/09/2026.

> Phần mềm nội bộ công ty Khánh Hoàng.
