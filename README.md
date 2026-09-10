# PEROMA — Phần mềm sản xuất Khánh Hoàng

Pha hương liệu, ghi mẻ, cấp số lô, in tem, tra lô, báo cáo sản lượng.

## Mở app

- [Máy quản lý (Admin)](https://kaboyx1-hue.github.io/peroma/admin.html) — **chỉ dùng trên máy tính**
- [Máy nhân viên](https://kaboyx1-hue.github.io/peroma/nhanvien.html)

> ⚠️ **Chỉ dùng MỘT máy Admin để chỉnh sửa.** Mở Admin trên điện thoại sẽ tự vào **chế độ chỉ xem**: xem được mọi thứ nhưng không gửi thay đổi lên hệ thống và không trừ tồn kho. Lý do: các máy Admin đồng bộ nguyên khối cấu hình, nên hai máy cùng sửa sẽ ghi đè mất thay đổi của nhau và **trừ tồn kho hương liệu hai lần**. Chế độ này tạm thời, sẽ gỡ khi dựng lại bản Admin cho điện thoại.
>
> **Không dùng link `…/exec?trang=admin` của Apps Script nữa**, và không dán file `Admin.html` cũ vào Apps Script — bản đó chưa có các bản sửa, chạy song song sẽ xử lý dữ liệu khác nhau.

## Giao diện

Từ bản S10/R8 (10/09/2026), bố cục và màu theo mẫu Figma [Full Dashboard with Widgets, Sidebar, Charts, Graphs](https://www.figma.com/community/file/1292982580121452290/full-dashboard-with-widgets-sidebar-charts-graphs): nền trắng xám, thẻ trắng bo tròn, điểm nhấn cam.

- **Máy tính** (màn hình rộng từ 900px): thanh menu nổi bên trái. **Điện thoại**: tab trên cùng, có biểu tượng.
- **Admin mở vào trang Tổng quan**: mẻ hôm nay, sản lượng và hương liệu 7 ngày (so với 7 ngày trước), % mặt hàng sẵn sàng sản xuất, mẻ gần nhất, biểu đồ sản lượng 14 ngày, việc cần làm, top mặt hàng 30 ngày, tồn kho hương liệu. Trang này **chỉ đọc**: không sửa dữ liệu, không đồng bộ gì thêm; mẻ đã huỷ không tính.
- Mặc định **sáng**. Nút **🌙 / ☀** (đáy menu trên máy tính, góc trên trên điện thoại) đổi sang **tối**. Mỗi máy nhớ lựa chọn riêng; lựa chọn này **không** nằm trong dữ liệu đồng bộ hay file sao lưu.
- **Tab Công thức** (S11) theo cách các phần mềm doanh nghiệp trình bày dữ liệu gốc: danh sách kiểu *Index table* của Shopify Polaris (huy hiệu trạng thái, thanh tiến độ hồ sơ 4 mục, lọc nhanh theo nhóm + ô tìm) và trang hồ sơ kiểu *Object page* của SAP Fiori (4 ô tóm tắt kiêm thanh neo, nội dung chia nhóm Hương liệu · Định mức & nguyên liệu · Sản xuất & đóng gói · Hồ sơ tem, mỗi nhóm có huy hiệu đủ/thiếu). Lọc nhanh chỉ lọc hiển thị.
- **S12:** khai nguyên liệu cấu thành ngay trong công thức (nút *+ Khai nguyên liệu mới*, tự thêm vào Danh mục); mục nào còn thiếu có đường dẫn *Chọn hương → / Khai nguyên liệu → / Hồ sơ tem → / Cấp mã →* tới đúng chỗ bổ sung; nhóm Hồ sơ tem có nút *Thu gọn / Mở ra* rõ ràng, bấm tên ô còn thiếu để tới đúng ô.
- Bản in tem vẫn trắng đen như cũ.

## Khi máy in hỏng — in tem / phiếu ở máy khác

Có 2 cách, dùng cách nào cũng được:

1. **Lưu file in rồi gửi sang máy khác** (không cần mạng, máy nhận không cần cài Peroma). Ở thẻ lô (tab *Tra lô* bên nhân viên, hoặc *Báo cáo → Tra cứu số lot* bên Admin) bấm **"Máy in hỏng? Lưu file tem để in ở máy khác"**; với phiếu công thức bấm **"Máy in hỏng? Lưu file phiếu…"**. App lưu 1 file `.html` đúng y bản in (cùng khổ A4, cùng cỡ chữ). Gửi file qua Zalo / USB / email sang máy có máy in → mở bằng trình duyệt → bấm **In**. File chỉ chứa nội dung tem/phiếu, không có mật khẩu hay dữ liệu khác.
2. **Máy khác tự lấy lô qua hệ thống** (khi có mạng và đã khai kết nối Google Sheet). Máy nhân viên còn lại vào tab *Tra lô* → **"Tải lô do máy khác ghi"** → chọn lô (ghi "máy khác") → in tem. Dùng được cả khi máy cũ hỏng hẳn. Các lô tải về chỉ để xem và in: không lưu vào máy này, không gửi ngược lên Sheet, không huỷ/sửa được. Máy Admin thì vốn đã thấy mọi lô, in từ *Báo cáo → Tra cứu số lot*.

## In tem — tự dàn trang (S16/R10, bảng Dàn trang S17/R11)

Nút **"Dàn trang tem"** ở thẻ lô mở bảng chọn **số tem mỗi hàng (ngang)** và **số hàng (dọc)** (nút +/− hoặc chọn nhanh 2×2 … 5×4). App tự chia đều tờ A4 (vùng in 197 × 284 mm), ghi rõ **kích thước mỗi tem (mm)** và cỡ chữ, kèm **ảnh xem trước đúng tờ sẽ in**. Chữ dưới 6 pt thì cảnh báo nhưng vẫn cho in; nội dung không vừa ô thì không cho in. Ví dụ 4 × 3 → 12 tem, mỗi tem 48,1 × 93,7 mm.

Mỗi tờ A4 chia đúng cột × hàng đã chọn; mỗi ô tem cố định, app **tự đo nội dung và chọn cỡ chữ lớn nhất vừa ô** — không còn tem đè nhau hay tràn sang trang 2. Nếu khổ đang chọn buộc chữ nhỏ hơn 6 pt (khó đọc) hoặc không vừa, app hỏi trước khi in và đề xuất khổ ít tem/tờ hơn; chọn khổ đề xuất thì máy nhớ cho lần sau.

Đo thật trên khung tem hiện tại (bảng 12 dòng + khối địa chỉ công ty): khổ **3×2 (6 tem/tờ)** là khổ dày nhất còn đọc được (≈ 6–7,6 pt); khổ 5×4 mặc định cũ chỉ còn 4 pt kể cả khi nội dung rất ngắn.

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

Kết quả lần chạy gần nhất (10/09/2026, bản S17/R11): **405 + 183 + 19 + 21 + 17 = 645 phép kiểm, 0 hỏng**; kiểm tra trước khi gửi: không lỗi.

> **Lưu ý:** bộ test hiện được viết cho môi trường làm việc cụ thể (đường dẫn Chrome và thư mục cố định trên máy phát triển, cấu trúc thư mục `huong/` + `nv/`), **chưa chạy thẳng được từ kho này trên máy khác**. Làm cho test chạy độc lập là việc riêng, chưa làm.

Test luôn mở bản mã **chưa cấu hình kết nối**, nên không bao giờ chạm được vào Google Sheet thật — đây chính là bài học từ sự cố 10/09/2026.

> Phần mềm nội bộ công ty Khánh Hoàng.
