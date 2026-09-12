/*  PEROMA — MÁY CHỦ TRÊN GOOGLE SHEET
 *  Triển khai: `npm run trienkhai` trong thư mục kho (xem cong-cu/trienkhai.mjs và HUONG-DAN-TRIEN-KHAI.md),
 *  hoặc dán tay toàn bộ file này vào Apps Script rồi Triển khai → Quản lý bản triển khai → Phiên bản mới.
 *
 *  MẬT KHẨU KHÔNG NẰM TRONG FILE NÀY (từ bản S23, 10/09/2026). Đặt MỘT LẦN trong Apps Script:
 *  Cài đặt dự án (biểu tượng bánh răng) → Thuộc tính tập lệnh → Thêm thuộc tính
 *      Thuộc tính: MATKHAU      Giá trị: <đúng mật khẩu đang nhập trong 2 app>
 *  Đổi mật khẩu sau này cũng chỉ sửa ở đó — có hiệu lực ngay, không cần triển khai lại.
 */
/* S23 — vì sao chuyển: trước đây mật khẩu viết cứng trong file, nên phải giữ HAI bản Code.gs (bản
   GitHub công khai để chuỗi mẫu, bản thật có mật khẩu) — dễ đẩy nhầm bản thật lên mạng, và mỗi lần
   sửa phải vá tay cả hai. Nay file này là bản DUY NHẤT, đẩy lên GitHub và Apps Script y hệt nhau.
   Giá trị mật khẩu KHÔNG đổi, chỉ đổi chỗ cất — 2 app vẫn gửi đúng chuỗi đang nhập.
   Lưu ý cũ (P0.3) vẫn đúng: đây là khoá dùng chung đơn giản, không phải xác thực từng người dùng —
   ai có link + chuỗi này đều gọi được API; không có giới hạn tần suất, không phân quyền theo máy. */
const TEN_THUOC_TINH_MK = 'MATKHAU';
const PHIEN_BAN_MAYCHU = '2026-09-12-S31';
const LOI_CHUA_CAI_MK = 'Máy chủ chưa cài mật khẩu — chủ vào Apps Script → Cài đặt dự án → Thuộc tính tập lệnh, thêm MATKHAU';
function matKhauMayChu(){
  try{ return String(PropertiesService.getScriptProperties().getProperty(TEN_THUOC_TINH_MK) || '') }
  catch(e){ return '' }
}
function dungMatKhau(mk){ const that = matKhauMayChu(); return !!that && typeof mk === 'string' && mk === that }
function loiMatKhau(){ return matKhauMayChu() ? 'Sai mật khẩu' : LOI_CHUA_CAI_MK }

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
/* 12/09/2026: hồ sơ kế toán theo lô cho trang riêng hoso.html (số hoá đơn NCC, số biên bản/
   quyết định khi huỷ lô) — khách cần nối số lô sản xuất với chứng từ kế toán để đối chiếu sổ
   sách. Sheet ĐỘC LẬP, không đụng NHATKY/BAOCAO/CAUHINH. Khác NHATKY/BAOCAO (append-only): mỗi
   số lô CHỈ 1 dòng, ghi lại là CẬP NHẬT đúng dòng đó (sửa được nhiều lần khi có thêm hoá đơn). */
const S_HOSOLO = 'HOSOLO';
const COT_HS = ['Số lô','Số hoá đơn NCC nguyên liệu','Số hoá đơn NCC hương liệu',
                'Số biên bản/QĐ huỷ lô','Ghi chú','Cập nhật lúc'];

/* 26/08/2026 — PATCH V1.1 mục P1-D (an toàn, không cần server sống): schemaVersion +
   action allowlist + whitelist field lại LẦN NỮA ở phía server cho luuCauHinh (không chỉ tin
   client — đúng yêu cầu mục 8.1). CỐ Ý KHÔNG đổi request/response contract hiện có, KHÔNG thêm
   ACK/idempotencyKey/retry-queue — những việc đó cần một máy chủ Apps Script ĐANG CHẠY THẬT để
   kiểm thử round-trip (đầu vào/đầu ra, độ trễ mạng, quota) mới an toàn; sửa một phía ở đây mà
   không kiểm được đầu kia thì rủi ro hơn là để nguyên. Xem PATCH-REPORT.md — mục này đánh dấu
   BLOCKED FOR SERVER VERIFICATION. Toàn bộ log lỗi vẫn KHÔNG in ra token/mật khẩu. */
const SCHEMA_VERSION = 1;
const HANH_DONG_CHO_PHEP = ['cauhinh','nhatky','tomtat','luuCauHinh','themMe','baocao','themBaoCao','xoaDLMoPhong','hosoLo','luuHosoLo'];

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
    // S23: hỏi phiên bản — KHÔNG cần mật khẩu; chỉ trả số phiên bản + "đã cài mật khẩu chưa", không lộ dữ liệu.
    // Công cụ triển khai dùng để xác nhận bản mới đã chạy và mật khẩu đã đặt.
    if(p.a === 'phienban') return ra({ok:1, ten:'Peroma', phienBan: PHIEN_BAN_MAYCHU, coMatKhau: !!matKhauMayChu()});
    if(!dungMatKhau(p.mk)) return ra({loi: loiMatKhau()});
    if(p.a && HANH_DONG_CHO_PHEP.indexOf(p.a) === -1) return ra({loi:'Hành động không được phép'});
    // 27/08/2026-R3: khách yêu cầu "Admin toàn quyền" — máy nhân viên KHÔNG có nút xoá riêng,
    // mà tự nhận lệnh xoá từ Admin qua đúng kênh đồng bộ cấu hình đã có sẵn (mỗi 20 giây máy
    // nhân viên tự hỏi "cauhinh"). Trả kèm mốc "lần Admin xoá dữ liệu mô phỏng gần nhất" — máy
    // nhân viên so mốc này với mốc đã áp gần nhất của MÁY ĐÓ, khác thì tự xoá nk/bcNgay cục bộ.
    if(p.a === 'cauhinh') return ra({ok:1, cauhinh: docCauHinh(), ts: tsCauHinh(), xoaMocTs: xoaMocTs()});
    if(p.a === 'nhatky')  return ra({ok:1, nk: docNhatKy()});
    if(p.a === 'baocao')  return ra({ok:1, bc: docBaoCao()});
    if(p.a === 'hosoLo')  return ra({ok:1, hosoLo: docHoSoLo()});
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
    if(!dungMatKhau(d.mk)) return ra({loi: loiMatKhau()});
    if(d.a && HANH_DONG_CHO_PHEP.indexOf(d.a) === -1) return ra({loi:'Hành động không được phép'});
    if(d.a === 'luuCauHinh'){ ghiCauHinh(sachCauHinhServer(d.cauhinh, docCauHinh())); return ra({ok:1, ts: tsCauHinh()}) }
    if(d.a === 'themMe'){ const r = themMe(d.nk || []); return ra({ok:1, them:r.them, boQua:r.boQua, idDaNhan:r.idDaNhan}) }
    if(d.a === 'themBaoCao'){ const r = themBaoCao(d.bc || []); return ra({ok:1, them:r.them, boQua:r.boQua, idDaNhan:r.idDaNhan}) }
    if(d.a === 'xoaDLMoPhong'){ xoaDLMoPhong(); return ra({ok:1}) }
    if(d.a === 'luuHosoLo'){ const r = luuHoSoLoMotDong(d.dong || {}); return r.loi ? ra({loi:r.loi}) : ra({ok:1, lot:r.lot}) }
    return ra({loi:'Không rõ lệnh'});
  }catch(err){ return ra({loi:String(err)}) }
  finally{ try{ khoa.releaseLock() }catch(x){} }
}
/* Whitelist field LẦN NỮA ở SERVER cho cấu hình nhận từ Admin — phòng trường hợp client bị
   sửa lỗi/bug và lỡ gửi kèm trường "đang ghi mẻ dở" (sl/pb/huongMe/lot/ngaysx/nv/daInPhieu/
   xacNhanCT...). Đây là invariant H1 (config sync không được mang runtime batch state) — bản
   vá P0/bản O đã chặn ở CLIENT (sachCauHinh() bên Admin); đây là lớp phòng thủ THỨ HAI ở SERVER,
   không thay đổi hành vi khi client gửi đúng như hiện tại (chỉ có tác dụng khi client SAI). */
function sachCauHinhServer(c, cu){
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
      nguonHuongKhoa: !!p.nguonHuongKhoa,
      // 10/09/2026 — bản S14: chủ MỞ KHOÁ hồ sơ tem của mặt hàng khoá-theo-TCCS để sửa tay. Cấu hình
      // tĩnh (không phải trạng thái ghi mẻ dở — không vi phạm H1). Thiếu dòng này thì server cắt mất
      // cờ, máy khác/bản mở lại tưởng mặt hàng còn khoá và ghi đè phần đã sửa tay bằng TCCS.
      temMoKhoa: !!p.temMoKhoa,
      // 10/09/2026 — bản S21: bao bì riêng của mặt hàng (khác mặc định theo quy cách). Cấu hình tĩnh, không vi phạm H1.
      baoBiRieng: (p.baoBiRieng && typeof p.baoBiRieng === 'object' && !Array.isArray(p.baoBiRieng)) ? p.baoBiRieng : {}
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
    nlTong: c.nlTong, nlNgayKhai: c.nlNgayKhai || '', nlGhiChu: c.nlGhiChu || '',
    // 10/09/2026 — bản S21: danh mục bao bì (giá theo kg, số cái/kg, VAT) + bao bì mặc định theo quy cách.
    // Bản Admin cũ không gửi 2 trường này → GIỮ bản đang lưu (cu), không ghi đè thành rỗng.
    baoBi: Array.isArray(c.baoBi) ? c.baoBi : ((cu && Array.isArray(cu.baoBi)) ? cu.baoBi : []),
    baoBiQC: (c.baoBiQC && typeof c.baoBiQC === 'object' && !Array.isArray(c.baoBiQC)) ? c.baoBiQC
           : ((cu && cu.baoBiQC && typeof cu.baoBiQC === 'object' && !Array.isArray(cu.baoBiQC)) ? cu.baoBiQC : {})
  };
}

/* ── Cấu hình ──
   Trước S23: cả cấu hình là MỘT chuỗi JSON trong ô B1. Google Sheets giới hạn 50.000 ký tự mỗi ô — đo
   ngày 10/09/2026: 13.171 ký tự (26%) với 12 mặt hàng, trong khi lịch sử công thức và lịch sử giá chỉ tăng.
   Chạm trần thì lệnh ghi lỗi → nhân viên không nhận được công thức mới.
   Từ S23: còn vừa MỘT ô (≤ O_TOI_DA ký tự) thì ghi y như cũ vào B1 — bản Code.gs cũ vẫn đọc được nên
   lùi bản vẫn an toàn. Lớn hơn thì cắt thành nhiều mảnh ở trang CAUHINH_MANH, còn B1 chỉ giữ dấu
   "MANH:<cột>:<số mảnh>:<độ dài>". Ghi LUÂN PHIÊN 2 cột A/B: ghi đủ mảnh vào cột đang KHÔNG dùng, đọc lại
   so khớp, rồi mới đổi dấu ở B1 — lỡ đứt giữa chừng thì B1 vẫn trỏ bộ mảnh cũ còn nguyên, không bao giờ
   đọc phải bộ mảnh dở dang. Mỗi mảnh có tiền tố "M" và ô định dạng văn bản, để Sheets không hiểu nhầm
   mảnh bắt đầu bằng "=" / "+" / "-" thành công thức hay số. B2 (mốc cập nhật), B4 (mốc xoá mô phỏng) giữ nguyên. */
const S_CAUHINH_MANH = 'CAUHINH_MANH';
const O_TOI_DA = 40000;   // chừa xa trần 50.000 ký tự/ô của Google
function docManh(cot, n){
  return lay(S_CAUHINH_MANH).getRange(1, cot, n, 1).getValues().map(function(r){ return String(r[0]).slice(1) }).join('');
}
function docCauHinh(){
  const sh = lay(S_CAUHINH);
  const v = String(sh.getRange('B1').getValue() || '');
  if(!v) return null;
  let s = v;
  const m = /^MANH:([AB]):(\d+):(\d+)$/.exec(v);
  if(m){
    s = docManh(m[1] === 'A' ? 1 : 2, +m[2]);
    if(s.length !== +m[3]) return null;   // bộ mảnh không khớp độ dài đã ghi → coi như hỏng, không dùng bừa
  }
  try{ return JSON.parse(s) }catch(e){ return null }
}
function tsCauHinh(){ return String(lay(S_CAUHINH).getRange('B2').getValue() || '') }
function ghiCauHinh(c){
  const sh = lay(S_CAUHINH);
  sh.getRange('A1').setValue('CẤU HÌNH');
  sh.getRange('A2').setValue('CẬP NHẬT LÚC');
  sh.getRange('A3').setValue('(Đừng sửa tay ô B1 và trang CAUHINH_MANH — phần mềm quản lý ghi vào đây)');
  const s = JSON.stringify(c);
  if(s.length <= O_TOI_DA){
    sh.getRange('B1').setValue(s);
  }else{
    const cu = /^MANH:([AB]):/.exec(String(sh.getRange('B1').getValue() || ''));
    const chu = (cu && cu[1] === 'A') ? 'B' : 'A', cot = chu === 'A' ? 1 : 2;
    const manh = [];
    for(let i = 0; i < s.length; i += O_TOI_DA) manh.push(['M' + s.slice(i, i + O_TOI_DA)]);
    const shM = lay(S_CAUHINH_MANH);
    const cuoi = shM.getLastRow();
    if(cuoi > 0) shM.getRange(1, cot, cuoi, 1).clearContent();
    const vung = shM.getRange(1, cot, manh.length, 1);
    vung.setNumberFormat('@');
    vung.setValues(manh);
    SpreadsheetApp.flush();
    if(docManh(cot, manh.length) !== s) throw new Error('Ghi cấu hình nhiều mảnh không khớp khi đọc lại — giữ nguyên bản cũ');
    sh.getRange('B1').setValue('MANH:' + chu + ':' + manh.length + ':' + s.length);
  }
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

/* ── Hồ sơ kế toán theo lô (trang riêng hoso.html) ── */
function docHoSoLo(){
  const sh = lay(S_HOSOLO);
  const n = sh.getLastRow();
  if(n < 2) return [];
  const v = sh.getRange(2, 1, n-1, COT_HS.length).getValues();
  return v.filter(function(r){ return r[0] }).map(function(r){
    return { lot:String(r[0]), hoaDonNL:String(r[1]||''), hoaDonHuong:String(r[2]||''),
             bienBanHuy:String(r[3]||''), ghiChu:String(r[4]||''), capNhat:String(r[5]||'') };
  });
}
function luuHoSoLoMotDong(d){
  d = d || {};
  const lot = String(d.lot || '').trim();
  if(!lot) return { loi: 'Thiếu số lô' };
  const sh = lay(S_HOSOLO);
  if(sh.getLastRow() < 1){ sh.appendRow(COT_HS); sh.setFrozenRows(1); sh.getRange(1,1,1,COT_HS.length).setFontWeight('bold') }
  const n = sh.getLastRow();
  let hang = -1;
  if(n > 1){
    const cotLo = sh.getRange(2, 1, n-1, 1).getValues();
    for(let i=0;i<cotLo.length;i++){ if(String(cotLo[i][0]) === lot){ hang = i+2; break } }
  }
  const dong = ["'"+lot, d.hoaDonNL||'', d.hoaDonHuong||'', d.bienBanHuy||'', d.ghiChu||'', new Date().toISOString()];
  if(hang === -1){ sh.appendRow(dong) } else { sh.getRange(hang, 1, 1, COT_HS.length).setValues([dong]) }
  return { ok:1, lot:lot };
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
