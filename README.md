# PEROMA — Phần mềm sản xuất Khánh Hoàng

Pha hương liệu, ghi mẻ, cấp số lô, in tem, tra lô, báo cáo sản lượng.

## Mở app

- [Máy quản lý (Admin)](https://kaboyx1-hue.github.io/peroma/admin.html)
- [Máy nhân viên](https://kaboyx1-hue.github.io/peroma/nhanvien.html)

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
| `Code.gs` | Apps Script đặt trong Google Sheet, làm máy chủ đồng bộ |
| `test/` | Bộ kiểm thử tự động (Playwright) |

## Máy chủ đồng bộ

`Code.gs` dán vào Apps Script của Google Sheet, rồi **Triển khai → Ứng dụng web → Bất kỳ ai**.
Mật khẩu nằm ở biến `MATKHAU` trong `Code.gs` và phải khớp với mật khẩu nhập trong app.

Đổi mật khẩu: sửa `MATKHAU` → **Triển khai → Quản lý bản triển khai → sửa → Phiên bản mới** → nhập lại mật khẩu mới trong app trên từng máy.

## Chạy test

```bash
npm install playwright
node server.mjs                 # phục vụ file qua http://127.0.0.1:8777
cd test && node kiemtra.mjs     # bộ Admin
```

Test luôn mở bản mã **chưa cấu hình kết nối**, nên không bao giờ chạm được vào Google Sheet thật.

> Phần mềm nội bộ công ty Khánh Hoàng.
