/*  PEROMA — MÁY CHỦ TRÊN GOOGLE SHEET
 *  Dán toàn bộ file này vào Apps Script của bảng tính.
 *  ĐỔI MẬT KHẨU ở dòng dưới trước khi triển khai.
 */

const MATKHAU = 'DAT-MAT-KHAU-CUA-BAN-VAO-DAY';   // ← BẮT BUỘC ĐỔI TRƯỚC KHI TRIỂN KHAI
// 10/09/2026: bản nằm trong kho GitHub công khai này CỐ Ý chỉ để chuỗi mẫu. Mật khẩu thật
// chỉ tồn tại trong Apps Script riêng của bạn — nơi không ai ngoài bạn đọc được.
// (Kho zaka từng để lộ link Apps Script vì file chặn đặt sai tên "gitignore" — tránh lặp lại.)
//
// Lưu ý (P0.3, kiểm toán 26/08/2026): chuỗi này phải khớp với mật khẩu nhập trong app.
// Từ bản S7/R5 (10/09/2026), 2 file HTML KHÔNG còn viết cứng mật khẩu nữa — mỗi máy tự nhập
// một lần (Admin: tab Sao lưu · Nhân viên: tab Dữ liệu). Đây là khoá dùng chung đơn giản,
// không phải xác thực từng người dùng — ai có link + chuỗi này đều gọi được API.
// Đủ dùng cho quy mô hiện tại (link không công khai), nhưng KHÔNG phải bảo mật mạnh:
// không có rate limit, không có nhật ký truy cập, không phân quyền theo máy/người.
// Muốn chặt hơn cần: đổi mật khẩu định kỳ, giới hạn action theo IP/thời gian,
// hoặc chuyển sang OAuth — việc này nằm ngoài phạm vi bản vá P0 (chỉ sửa lỗi chặn
// phát hành), cần một đợt riêng nếu anh muốn nâng cấp.

const S_CAUHINH = 'CAUHINH';
const S_NHATKY  = 'NHATKY';
const S_BAOCAO  = 'BAOCAO';
const COT = ['ID','Ngày SX','Số lô','Lệnh SX','Mã SP','Sản phẩm','Hương','Quy cách',
             'KG','Số bao','ML hương','Nhân viên','Thời điểm ghi','DỮ LIỆU'];
/* 27/08/2026 (phản hồi lần 3): khách phản hồi "chốt thực tế sản xuất" (bcNgay) sau khi nhân
   viên bấm Xác nhận thì KHÔNG tự lên được — phải tự xuất/nhận file .json tay, không biết
   "đẩy" ở đâu. Trước đây chỉ có `nk` (ghi mẻ) được tự đẩy/kéo qua Sheet (a=themMe/nhatky);
   bcNgay chưa hề có kênh tự động — thêm 1 sheet + 1 action riêng, ĐÚNG MẪU với NHATKY/themMe
   ở trên (không đổi cách làm cũ, chỉ nhân bản). Đây là báo cáo ĐÃ CHỐT (không phải trạng thái
   ghi mẻ dở), không phạm invariant H1. */
const COT_BC = ['ID','Ngày','Số lô','Sản phẩm','Quy cách','Kế hoạch (kg)','Thực tế (kg)',
                'Lý do','Nhân viên','Thời điểm ghi','DỮ LIỆU'];

/* 26/08/2026 — PATCH V1.1 mục P1-D (an toàn, không cần server sống): schemaVersion +
   action allowlist + whitelist field lại LẦN NỮA ở phía server cho luuCauHinh (không chỉ tin
   client — đúng yêu cầu mục 8.1). CỐ Ý KHÔNG đổi request/response contract hiện có, KHÔNG thêm
   ACK/idempotencyKey/retry-queue — những việc đó cần một máy chủ Apps Script ĐANG CHẠY THẬT để
   kiểm thử round-trip (đầu vào/đầu ra, độ trễ mạng, quota) mới an toàn; sửa một phía ở đây mà
   không kiểm được đầu kia thì rủi ro hơn là để nguyên. Xem PATCH-REPORT.md — mục này đánh dấu
   BLOCKED FOR SERVER VERIFICATION. Toàn bộ log lỗi vẫn KHÔNG in ra token/mật khẩu. */
const SCHEMA_VERSION = 1;
const HANH_DONG_CHO_PHEP = ['cauhinh','nhatky','tomtat','luuCauHinh','themMe','baocao','themBaoCao','xoaDLMoPhong'];

/* ── Đọc ── */
/* 29/08/2026 — bản S6 (khách yêu cầu: mở Admin từ BẤT KỲ máy nào, ở bất kỳ đâu, không cần đã
   copy sẵn file .html vào máy đó): mở đúng link Web App này kèm ?trang=admin sẽ trả về TOÀN BỘ
   trang Admin (thay vì JSON như các lời gọi khác) — Apps Script phục vụ y hệt 1 trang web bình
   thường. File "Admin" (Admin.html) phải được TẠO SẴN trong dự án Apps Script này (menu bên trái
   → dấu + cạnh "Tệp" → "HTML" → đặt tên đúng "Admin") và dán TOÀN BỘ nội dung file
   bang-tra-huong-lieu.html vào đó — xem hướng dẫn kèm theo. KHÔNG cần mật khẩu để MỞ trang (vì
   trình duyệt khi gõ link vào không tự có sẵn mk) — mật khẩu (MATKHAU/LEGACY_SHARED_TOKEN) vẫn
   được yêu cầu đầy đủ như cũ ở MỌI lời gọi ĐỌC/GHI dữ liệu thật (cauhinh/nhatky/luuCauHinh/...)
   ngay bên dưới — trang HTML rỗng không kèm mk thì không tự lấy/sửa được gì. */
function doGet(e){
  try{
    const p = e.parameter || {};
    if(p.trang === 'admin'){
      return HtmlService.createHtmlOutputFromFile('Admin')
        .setTitle('Peroma – Pha hương liệu (Admin)')
        .addMetaTag('viewport','width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    if(p.mk !== MATKHAU) return ra({loi:'Sai mật khẩu'});
    if(p.a && HANH_DONG_CHO_PHEP.indexOf(p.a) === -1) return ra({loi:'Hành động không được phép'});
    // 27/08/2026-R3: khách yêu cầu "Admin toàn quyền" — máy nhân viên KHÔNG có nút xoá riêng,
    // mà tự nhận lệnh xoá từ Admin qua đúng kênh đồng bộ cấu hình đã có sẵn (mỗi 20 giây máy
    // nhân viên tự hỏi "cauhinh"). Trả kèm mốc "lần Admin xoá dữ liệu mô phỏng gần nhất" — máy
    // nhân viên so mốc này với mốc đã áp gần nhất của MÁY ĐÓ, khác thì tự xoá nk/bcNgay cục bộ.
    if(p.a === 'cauhinh') return ra({ok:1, cauhinh: docCauHinh(), ts: tsCauHinh(), xoaMocTs: xoaMocTs()});
    if(p.a === 'nhatky')  return ra({ok:1, nk: docNhatKy()});
    if(p.a === 'baocao')  return ra({ok:1, bc: docBaoCao()});
    if(p.a === 'tomtat')  return ra({ok:1, ts: tsCauHinh(), soMe: soDong()});
    return ra({ok:1, ten:'Peroma'});
  }catch(err){ return ra({loi:String(err)}) }
}

/* ── Ghi ── */
function doPost(e){
  const khoa = LockService.getScriptLock();
  try{
    khoa.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    if(d.mk !== MATKHAU) return ra({loi:'Sai mật khẩu'});
    if(d.a && HANH_DONG_CHO_PHEP.indexOf(d.a) === -1) return ra({loi:'Hành động không được phép'});
    if(d.a === 'luuCauHinh'){ ghiCauHinh(sachCauHinhServer(d.cauhinh)); return ra({ok:1, ts: tsCauHinh()}) }
    if(d.a === 'themMe'){ const r = themMe(d.nk || []); return ra({ok:1, them:r.them, boQua:r.boQua, idDaNhan:r.idDaNhan}) }
    if(d.a === 'themBaoCao'){ const r = themBaoCao(d.bc || []); return ra({ok:1, them:r.them, boQua:r.boQua, idDaNhan:r.idDaNhan}) }
    if(d.a === 'xoaDLMoPhong'){ xoaDLMoPhong(); return ra({ok:1}) }
    return ra({loi:'Không rõ lệnh'});
  }catch(err){ return ra({loi:String(err)}) }
  finally{ try{ khoa.releaseLock() }catch(x){} }
}
/* Whitelist field LẦN NỮA ở SERVER cho cấu hình nhận từ Admin — phòng trường hợp client bị
   sửa lỗi/bug và lỡ gửi kèm trường "đang ghi mẻ dở" (sl/pb/huongMe/lot/ngaysx/nv/daInPhieu/
   xacNhanCT...). Đây là invariant H1 (config sync không được mang runtime batch state) — bản
   vá P0/bản O đã chặn ở CLIENT (sachCauHinh() bên Admin); đây là lớp phòng thủ THỨ HAI ở SERVER,
   không thay đổi hành vi khi client gửi đúng như hiện tại (chỉ có tác dụng khi client SAI). */
function sachCauHinhServer(c){
  c = c || {};
  const spNguon = Array.isArray(c.sp) ? c.sp : [];
  const sp = spNguon.map(function(p){
    p = p || {};
    return {
      ten:p.ten, kg:p.kg, ml:p.ml, pkb:p.pkb,
      huongs: Array.isArray(p.huongs) ? p.huongs : [],
      tam: Array.isArray(p.tam) ? p.tam : [],
      dauRa: Array.isArray(p.dauRa) ? p.dauRa : [],
      maSP: p.maSP || '', ngay: p.ngay || '',
      lichSu: Array.isArray(p.lichSu) ? p.lichSu : [],
      hstem: p.hstem || {}, nguyenlieu: p.nguyenlieu || '',
      congThucNL: Array.isArray(p.congThucNL) ? p.congThucNL : [],
      pkbPhut: p.pkbPhut || '', pkbChat: p.pkbChat || '', pkbCT: p.pkbCT || '',
      ghi: p.ghi || '', tt: p.tt || 'ok', ttLyDo: p.ttLyDo || '', ttNgay: p.ttNgay || '', qc: p.qc || '',
      recipeVersion: p.recipeVersion, recipeEffectiveFrom: p.recipeEffectiveFrom || '',
      recipeUpdatedAt: p.recipeUpdatedAt || '',
      // 27/08/2026 — bản S2: chọn/khoá nguồn hương liệu riêng từng mặt hàng — thuộc tính cấu
      // hình tĩnh (không phải trạng thái ghi mẻ dở), an toàn để đồng bộ, KHÔNG vi phạm H1.
      nguonHuongChon: (p.nguonHuongChon && typeof p.nguonHuongChon === 'object') ? p.nguonHuongChon : {},
      nguonHuongKhoa: !!p.nguonHuongKhoa
      // CỐ Ý KHÔNG copy: sl, pb, huongMe, lot, ngaysx, nv, daInPhieu, xacNhanCT, xacNhanCTBoi,
      // xacNhanCTSnap, xacNhanCTLuc, recipeFingerprint — runtime batch state hoặc chi tiết nội
      // bộ không cần đồng bộ, giống hệt whitelist sachCauHinh() phía client (Admin).
    };
  });
  return {
    sp: sp,
    kho: Array.isArray(c.kho) ? c.kho : [],
    cp: Array.isArray(c.cp) ? c.cp : [],
    dr: Array.isArray(c.dr) ? c.dr : [],
    maHuong: c.maHuong || {}, maQC: c.maQC || {}, kgQC: c.kgQC || {},
    nvDS: Array.isArray(c.nvDS) ? c.nvDS : [],
    // 27/08/2026 — bản S2: PHÁT HIỆN LỖI — nlDM (danh mục nguyên liệu) và nguonHuong/
    // huongDangDung/tonKhoHuong (nhà cung cấp, giá, tồn kho hương liệu) đã BỊ CẮT MẤT ở đây
    // dù client (Admin) đã gửi lên — nghĩa là cấu hình lưu trên Sheet trước giờ luôn THIẾU các
    // phần này. Bổ sung đủ, không đổi field nào cũ, không đụng invariant H1 (đây đều là dữ
    // liệu danh mục/giá/tồn kho — không phải trạng thái ghi mẻ dở).
    nlDM: Array.isArray(c.nlDM) ? c.nlDM : [],
    nguonHuong: (c.nguonHuong && typeof c.nguonHuong === 'object') ? c.nguonHuong : {},
    huongDangDung: (c.huongDangDung && typeof c.huongDangDung === 'object') ? c.huongDangDung : {},
    tonKhoHuong: (c.tonKhoHuong && typeof c.tonKhoHuong === 'object') ? c.tonKhoHuong : {},
    // 27/08/2026 (phản hồi lần 3): tồn kho + giá riêng từng nguyên liệu — cùng dạng với
    // nguonHuong/huongDangDung/tonKhoHuong ở trên, whitelist tương tự.
    nguonNguyenLieu: (c.nguonNguyenLieu && typeof c.nguonNguyenLieu === 'object') ? c.nguonNguyenLieu : {},
    nlDangDung: (c.nlDangDung && typeof c.nlDangDung === 'object') ? c.nlDangDung : {},
    tonKhoNguyenLieu: (c.tonKhoNguyenLieu && typeof c.tonKhoNguyenLieu === 'object') ? c.tonKhoNguyenLieu : {},
    nlTong: c.nlTong, nlNgayKhai: c.nlNgayKhai || '', nlGhiChu: c.nlGhiChu || ''
  };
}

/* ── Cấu hình: nằm gọn trong MỘT ô, vì nó lồng nhiều tầng ── */
function docCauHinh(){
  const sh = lay(S_CAUHINH);
  const v = sh.getRange('B1').getValue();
  if(!v) return null;
  try{ return JSON.parse(v) }catch(e){ return null }
}
function tsCauHinh(){ return String(lay(S_CAUHINH).getRange('B2').getValue() || '') }
function ghiCauHinh(c){
  const sh = lay(S_CAUHINH);
  sh.getRange('A1').setValue('CẤU HÌNH');
  sh.getRange('A2').setValue('CẬP NHẬT LÚC');
  sh.getRange('A3').setValue('(Đừng sửa tay ô B1 — phần mềm quản lý ghi vào đây)');
  sh.getRange('B1').setValue(JSON.stringify(c));
  sh.getRange('B2').setValue(new Date().toISOString());
}

/* ── Nhật ký: mỗi mẻ MỘT DÒNG, xem được ngay trong bảng tính ── */
function docNhatKy(){
  const sh = lay(S_NHATKY);
  const n = sh.getLastRow();
  if(n < 2) return [];
  const v = sh.getRange(2, COT.length, n-1, 1).getValues();
  const ra_ = [];
  for(let i=0;i<v.length;i++){
    if(!v[i][0]) continue;
    try{ ra_.push(JSON.parse(v[i][0])) }catch(e){}
  }
  return ra_;
}
function themMe(ds){
  const sh = lay(S_NHATKY);
  if(sh.getLastRow() < 1){ sh.appendRow(COT); sh.setFrozenRows(1); sh.getRange(1,1,1,COT.length).setFontWeight('bold') }
  const daCo = {};
  const n = sh.getLastRow();
  if(n > 1) sh.getRange(2,1,n-1,1).getValues().forEach(r=>{ if(r[0]) daCo[r[0]] = 1 });
  const them = [];
  const idDaNhan = []; // PATCH V1.1 mục P1-D: danh sách id THỰC SỰ vừa ghi — chuẩn bị sẵn cho
  // sau này client có thể chỉ set daGui=1 khi thấy đúng id trong danh sách này (ACK thật sự),
  // thay vì tin tưởng mù quáng ngay khi request trả về 200 OK. Client HIỆN TẠI chưa đọc field
  // này (chưa đổi phía client trong đợt vá này — xem PATCH-REPORT.md), nhưng đã sẵn sàng.
  ds.forEach(r=>{
    if(!r || !r.id || daCo[r.id]){ if(r&&r.id&&daCo[r.id])idDaNhan.push(r.id); return }
    daCo[r.id] = 1;
    delete r.daGui;
    them.push([r.id, r.ngaysx||'', "'"+(r.lot||''), r.soLenh||'', "'"+(r.maSP||''), r.sp||'',
               r.huong||'', r.quyCach||'', Number(r.sl)||0, r.soBao===''?'':Number(r.soBao)||0,
               Number(r.mlDung)||0, r.nv||'', String(r.ts||'').replace('T',' ').slice(0,19),
               JSON.stringify(r)]);
    idDaNhan.push(r.id);
  });
  if(them.length) sh.getRange(sh.getLastRow()+1, 1, them.length, COT.length).setValues(them);
  return { them: them.length, boQua: ds.length - them.length, idDaNhan: idDaNhan };
}
function soDong(){ const n = lay(S_NHATKY).getLastRow(); return n>1 ? n-1 : 0 }

/* ── Báo cáo chốt thực tế: mỗi lần chốt MỘT DÒNG, xem được ngay trong bảng tính (giống NHATKY) ── */
function docBaoCao(){
  const sh = lay(S_BAOCAO);
  const n = sh.getLastRow();
  if(n < 2) return [];
  const v = sh.getRange(2, COT_BC.length, n-1, 1).getValues();
  const ra_ = [];
  for(let i=0;i<v.length;i++){
    if(!v[i][0]) continue;
    try{ ra_.push(JSON.parse(v[i][0])) }catch(e){}
  }
  return ra_;
}
function themBaoCao(ds){
  const sh = lay(S_BAOCAO);
  if(sh.getLastRow() < 1){ sh.appendRow(COT_BC); sh.setFrozenRows(1); sh.getRange(1,1,1,COT_BC.length).setFontWeight('bold') }
  const daCo = {};
  const n = sh.getLastRow();
  if(n > 1) sh.getRange(2,1,n-1,1).getValues().forEach(r=>{ if(r[0]) daCo[r[0]] = 1 });
  const them = [];
  const idDaNhan = [];
  ds.forEach(r=>{
    if(!r || !r.id || daCo[r.id]){ if(r&&r.id&&daCo[r.id])idDaNhan.push(r.id); return }
    daCo[r.id] = 1;
    delete r.daGui;
    them.push([r.id, r.ngay||'', "'"+(r.lot||''), r.sp||'', r.quyCach||'',
               Number(r.kgKeHoach)||0, Number(r.kgThucTe)||0, r.lyDo||'', r.nv||'',
               String(r.ts||'').replace('T',' ').slice(0,19), JSON.stringify(r)]);
    idDaNhan.push(r.id);
  });
  if(them.length) sh.getRange(sh.getLastRow()+1, 1, them.length, COT_BC.length).setValues(them);
  return { them: them.length, boQua: ds.length - them.length, idDaNhan: idDaNhan };
}

/* 27/08/2026-R2: bên Admin bấm "Xoá dữ liệu mô phỏng" trước đây chỉ xoá CỤC BỘ (máy admin) —
   Sheet vẫn còn nguyên toàn bộ NHATKY/BAOCAO cũ, nên lần đồng bộ tự động kế tiếp (dbKeoNhatKy/
   dbKeoBaoCao, cứ ~15-20s) lại kéo y hệt dữ liệu vừa xoá về, tưởng như "xoá không ăn". Thêm
   hành động XOÁ THẬT trên Sheet — chỉ xoá đúng 2 sheet NHATKY/BAOCAO (giữ dòng tiêu đề), không
   đụng CAUHINH — đúng phạm vi nút "Xoá dữ liệu mô phỏng" đã cảnh báo khách "không hoàn tác được". */
function xoaDLMoPhong(){
  xoaHetDong(S_NHATKY);
  xoaHetDong(S_BAOCAO);
  ghiXoaMocTs();
}
function xoaHetDong(ten){
  const sh = lay(ten);
  const n = sh.getLastRow();
  if(n > 1) sh.deleteRows(2, n-1);
}
/* 27/08/2026-R3: mốc "lần Admin xoá dữ liệu mô phỏng gần nhất" — lưu riêng ở ô B4 sheet CAUHINH
   (không lẫn vào B1/B2 vốn đang giữ cấu hình + mốc cấu hình). Máy nhân viên tự so mốc này mỗi
   lần đồng bộ (a=cauhinh) để tự xoá nk/bcNgay cục bộ, không cần bấm gì — xem dbKeoCauHinh() bên
   peroma-nhanvien.html. */
function xoaMocTs(){ return String(lay(S_CAUHINH).getRange('B4').getValue() || ''); }
function ghiXoaMocTs(){ lay(S_CAUHINH).getRange('B4').setValue(new Date().toISOString()); }

/* ── Phụ ── */
function lay(ten){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(ten);
  if(!sh) sh = ss.insertSheet(ten);
  return sh;
}
function ra(o){
  // PATCH V1.1 mục P1-D: gắn schemaVersion vào MỌI response — client hiện tại (chưa đổi trong
  // đợt này) chỉ đọc đúng field nó cần (ok/loi/cauhinh/ts/nk/soMe/them/boQua) nên thêm field lạ
  // này KHÔNG phá gì cả (JS bỏ qua field không dùng tới) — tương thích ngược hoàn toàn.
  o = Object.assign({schemaVersion: SCHEMA_VERSION}, o);
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ── Bấm Chạy hàm này một lần để dựng sẵn hai trang tính ── */
function khoiTao(){
  lay(S_CAUHINH);
  const sh = lay(S_NHATKY);
  if(sh.getLastRow() < 1){
    sh.appendRow(COT);
    sh.setFrozenRows(1);
    sh.getRange(1,1,1,COT.length).setFontWeight('bold');
  }
  const shBc = lay(S_BAOCAO);
  if(shBc.getLastRow() < 1){
    shBc.appendRow(COT_BC);
    shBc.setFrozenRows(1);
    shBc.getRange(1,1,1,COT_BC.length).setFontWeight('bold');
  }
  SpreadsheetApp.getActiveSpreadsheet().toast('Đã dựng xong 3 trang tính','Peroma',5);
}
