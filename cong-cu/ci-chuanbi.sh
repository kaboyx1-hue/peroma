#!/usr/bin/env bash
# Dựng thư mục thử cho bộ test trình duyệt trên máy chủ GitHub (Linux) — giống hệt bố cục thư mục
# làm việc trên máy: peroma/huong (Admin), peroma/nv (Nhân viên); /tmp/huong, /tmp/nv trỏ vào đó
# (các test đọc/ghi file mẫu ở hai đường dẫn này). Không mạng, không đụng Google Sheet thật.
set -euo pipefail
mkdir -p peroma/huong peroma/nv peroma/giao-apps-script
cp admin.html     peroma/huong/bang-tra-huong-lieu.html
cp nhanvien.html  peroma/nv/peroma-nhanvien.html
for d in peroma peroma/huong peroma/nv; do cp sw.js "$d/sw.js"; done
cp Code.gs peroma/giao-apps-script/Code.gs
cp test/kiemtra.mjs test/kiemtra-chixem.mjs test/kiemtra-truockhi-gui.mjs peroma/huong/
cp test/kiemtra-nv.mjs test/kiemtra-vongtron.mjs test/kiemtra-offline.mjs peroma/nv/
ln -sfn "$PWD/peroma/huong" /tmp/huong
ln -sfn "$PWD/peroma/nv"    /tmp/nv
echo "Đã dựng thư mục thử: $(ls peroma/huong peroma/nv | tr '\n' ' ')"
