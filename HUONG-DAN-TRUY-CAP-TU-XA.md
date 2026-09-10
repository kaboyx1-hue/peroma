# Hướng dẫn: Mở Admin từ bất kỳ máy nào + đồng bộ nhanh hơn (bản 29/08/2026-S6)

## 1) Mở Admin từ xa (không cần mang theo file .html)

**Bước 1.** Vào Google Sheet → menu **Extensions (Tiện ích mở rộng) → Apps Script**.

**Bước 2.** Bên trái, cạnh mục **Files (Tệp)**, bấm dấu **+** → chọn **HTML**.

**Bước 3.** Đặt tên file **đúng chính xác là `Admin`** (không cần gõ `.html`, Apps Script tự thêm).

**Bước 4.** Xoá hết nội dung mặc định trong file vừa tạo, dán **toàn bộ** nội dung file
`Admin.html` (gửi kèm) vào.

**Bước 5.** Mở file `Code.gs` trong Apps Script, xoá hết, dán đè bằng nội dung file `Code.gs`
mới (gửi kèm — có thêm phần phục vụ trang Admin qua link).

**Bước 6.** Lưu lại (Ctrl+S / biểu tượng đĩa mềm).

**Bước 7.** Triển khai lại (giống mọi lần sửa Code.gs trước đây): **Deploy (Triển khai) →
Manage deployments (Quản lý bản triển khai)** → bấm biểu tượng bút chì sửa bản đang chạy →
ở "Version" chọn **New version (Phiên bản mới)** → **Deploy**.

**Bước 8.** Link để mở Admin từ bất kỳ đâu, bất kỳ máy nào (lưu lại, có thể thêm vào màn hình
chính điện thoại như 1 app):

```
https://script.google.com/macros/s/<MÃ-BẢN-TRIỂN-KHAI-CỦA-BẠN>/exec?trang=admin
```

> Kho GitHub này công khai nên **cố ý không ghi link thật**. Link thật lấy ở
> **Triển khai → Quản lý bản triển khai** trong Apps Script của bạn, rồi lưu riêng
> (ghi chú điện thoại, Zalo cá nhân…). Ai có link + mật khẩu là đọc/ghi/xoá được
> dữ liệu sản xuất, nên đừng đưa nó vào bất kỳ file nào nằm trong kho này.

## 2) Đồng bộ nhanh hơn giữa các máy đang mở Admin cùng lúc

- Trước đây Admin chỉ tự lấy cấu hình mới nhất **lúc mở app**. Giờ, **mỗi 9 giây** (khi tab đang
  mở, không phải để ẩn/khoá máy), Admin tự hỏi lại máy chủ — nếu một máy khác vừa sửa gì (thêm
  công thức, đổi giá, cập nhật tồn kho...), máy này **tự nhận về ngay**, không cần đóng mở lại.
- Việc **gửi đi** khi bạn sửa thì **không đổi** — vẫn gửi lên sau ~1.5 giây ngừng gõ như cũ.
- An toàn khi đang gõ dở: nếu đúng lúc đang nhập liệu (con trỏ đang ở trong 1 ô nhập/ô chọn),
  máy sẽ **tạm bỏ qua** lượt nhận về đó để không ghi đè mất chữ đang gõ, và tự thử lại ở lượt kế
  tiếp (chậm nhất khoảng 9-10 giây sau khi rời khỏi ô đó).

## 3) Điều cần biết — thay đổi cách cập nhật Admin sau này

- File `.html` tải về mở trực tiếp trên máy **vẫn dùng được y như cũ** — đây chỉ là **thêm một
  cách mở nữa**, không thay thế cách cũ.
- Nhưng nếu muốn dùng qua **link Web** (mục 1), thì **mỗi lần Admin có bản cập nhật mới**, ngoài
  việc nhận file `.html` mới như trước, cần thêm 1 bước: dán nội dung mới vào file `Admin` trong
  Apps Script rồi **Deploy lại** (giống hệt bước vẫn làm với `Code.gs`).

## 4) Giới hạn cần biết

- Mở qua link Web có thể chậm hơn 1-2 giây so với mở file thẳng trên máy (do phải tải qua máy
  chủ Apps Script).
- Gói Google miễn phí có giới hạn khoảng ~90 phút "thời gian chạy" của Apps Script mỗi ngày —
  mọi lượt mở trang + gọi đồng bộ đều tính vào đó. Với mức dùng bình thường (vài máy, cả ngày)
  thì rất thoải mái; nếu một ngày nào đó chạm giới hạn, Google sẽ báo lỗi hạn ngạch và tự hết vào
  ngày hôm sau — không mất dữ liệu, chỉ tạm không đồng bộ được lúc đó.
