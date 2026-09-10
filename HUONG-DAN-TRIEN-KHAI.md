# Triển khai máy chủ (Code.gs) bằng một lệnh

Từ bản S23 (10/09/2026) không cần dán tay `Code.gs` vào Apps Script nữa. Làm **một lần** 3 bước cài đặt dưới đây trên máy tính có thư mục kho `peroma-repo`, sau đó mỗi lần có bản mới chỉ gõ một lệnh.

## Cài đặt (một lần)

**0. Mở cửa sổ lệnh trong thư mục kho** và cài thư viện:

```
npm install
```

**1. Bật Google Apps Script API** cho tài khoản Google sở hữu bảng tính: mở https://script.google.com/home/usersettings → bật *Google Apps Script API*.

**2. Đăng nhập** (mở trình duyệt, chọn đúng tài khoản sở hữu bảng tính, bấm *Cho phép*):

```
npm run trienkhai -- dangnhap
```

**3. Nối thư mục với dự án Apps Script.** Lấy *Mã tập lệnh* ở Apps Script → *Cài đặt dự án* (biểu tượng bánh răng), rồi:

```
npm run trienkhai -- caidat <Mã tập lệnh>
```

Nếu dự án có nhiều bản triển khai, lệnh sẽ liệt kê và hỏi chọn — chọn bản có mã nằm trong link `/exec` mà 2 app đang dùng.

**4. Đặt mật khẩu vào Thuộc tính tập lệnh** (mật khẩu KHÔNG còn nằm trong `Code.gs`): Apps Script → *Cài đặt dự án* → *Thuộc tính tập lệnh* → *Thêm thuộc tính* → Thuộc tính `MATKHAU`, Giá trị = **đúng mật khẩu đang nhập trong 2 app**. Lưu.

## Mỗi lần có bản mới

```
npm run trienkhai
```

Lệnh tự làm: chạy bộ kiểm tra (hỏng là dừng) → đẩy `Code.gs` → cập nhật đúng bản triển khai đang dùng (**link `/exec` giữ nguyên**, 2 app không phải khai lại) → gọi thử máy chủ để chắc bản mới đang chạy và mật khẩu đã cài.

Chỉ muốn xem trước, không đẩy: `npm run trienkhai -- thu`.

## Khi có sự cố

| Thông báo | Làm gì |
|---|---|
| Máy chủ chưa cài mật khẩu / CHƯA CÓ THUỘC TÍNH MATKHAU | Làm bước 4. Có hiệu lực ngay, không cần triển khai lại. |
| Chưa đăng nhập Google cho clasp | Làm lại bước 2. |
| Không kéo được dự án | Kiểm tra *Mã tập lệnh* và bước 1. |
| Máy chủ chưa trả đúng phiên bản | Đợi 1 phút, chạy `npm run trienkhai -- thu` hoặc mở Apps Script xem *Quản lý bản triển khai*. |

Muốn quay về bản cũ: Apps Script → *Triển khai* → *Quản lý bản triển khai* → sửa → chọn phiên bản trước.

## An toàn

- `Code.gs` trong kho không chứa mật khẩu, không chứa link Apps Script — đẩy lên GitHub công khai được.
- Mã tập lệnh và mã bản triển khai cất trong `.clasp.json` và `trienkhai.local.json` ngay trên máy; bản sao dự án kéo về nằm ở `apps-script/`. Cả ba bị `.gitignore` chặn, không lên GitHub.
- Đăng nhập Google của clasp nằm trong thư mục người dùng (`~/.clasprc.json`), không nằm trong kho. Gỡ đăng nhập: `npx clasp logout`.
