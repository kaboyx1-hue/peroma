/* KIỂM TRA TRƯỚC KHI GỬI — không cần trình duyệt, chạy trong vài giây.
   27/08/2026 (theo yêu cầu "ít lỗi hơn"): phiên làm việc này đã tốn nhiều vòng qua lại chỉ vì
   2 lỗi lẽ ra máy tự bắt được ngay, không cần đợi khách phát hiện:
     1. Code.gs gửi đi vẫn còn để MẬT KHẨU MẪU (peroma-2026-doi-di) thay vì đúng mật khẩu thật
        đang dùng — Admin/Nhân viên gọi lên báo "Sai mật khẩu", khách phải chụp ảnh báo lại,
        sửa xong lại phải nhờ khách redeploy lần nữa.
     2. Code.gs thiếu 1 hành động (action) mà Admin/Nhân viên đã gọi (themBaoCao) — gọi lên
        báo "Không rõ lệnh", cũng phải qua nhiều vòng chụp ảnh mới lần ra.
   Cả 2 lỗi này đều là "3 file phải khớp nhau nhưng không ai tự kiểm tra" — giờ máy tự kiểm tra
   MỖI LẦN chuẩn bị gửi 3 file cho khách, thay vì để khách làm người phát hiện lỗi.
   Chạy: node kiemtra-truockhi-gui.mjs [đường dẫn Admin] [đường dẫn Nhân viên] [đường dẫn Code.gs]
   Không truyền tham số thì dùng đường dẫn mặc định bên dưới. */
import fs from 'fs';

const [,, ADMIN=process.env.PEROMA_ADMIN||'./bang-tra-huong-lieu.html',
           NV=process.env.PEROMA_NV||'../nv/peroma-nhanvien.html',
           GS=process.env.PEROMA_GS||'./Code.gs'] = process.argv;

let loi=0;
const ok=(t,c,g='')=>{ if(c){console.log('✓  '+t)} else {loi++; console.log('✗ HỎNG  '+t+(g?'  → '+g:''))} };

function doc(f){ if(!fs.existsSync(f)){console.log('⚠️  Không thấy file: '+f); process.exit(1)} return fs.readFileSync(f,'utf8') }
const admin=doc(ADMIN), nv=doc(NV), gs=doc(GS);

/* ── 1 & 2. KHOÁ KẾT NỐI (đảo chiều kiểm tra từ 10/09/2026 — bản S7/R5) ──
   Trước đây: mật khẩu + địa chỉ viết cứng trong cả 3 file, nên phải kiểm CHÚNG KHỚP NHAU.
   Từ S7/R5: 2 file HTML KHÔNG còn chứa 2 giá trị này nữa (mỗi máy tự nhập, lưu trong trình
   duyệt). Nên phép kiểm đổi thành NGƯỢC LẠI: bắt buộc KHÔNG được có giá trị thật nào lọt vào
   mã nguồn — vì mã nguồn nay nằm trong kho GitHub công khai.
   Lý do lịch sử vẫn giữ nguyên: đã từng mất nhiều vòng gửi lại vì Code.gs còn mật khẩu mẫu;
   nay thêm một loại tai nạn nữa cần chặn (10/09/2026: test chạy trên máy có mạng ghi đè
   Sheet thật, chỉ vì mã nguồn nhúng sẵn địa chỉ + mật khẩu). */
const matkhauGs=(gs.match(/const\s+MATKHAU\s*=\s*'([^']*)'/)||[])[1];
ok('Code.gs không còn để mật khẩu mẫu cũ', matkhauGs!=='peroma-2026-doi-di', matkhauGs);

const tokenAdmin=(admin.match(/const\s+LEGACY_SHARED_TOKEN\s*=\s*'([^']+)'/)||[])[1];
const tokenNv=(nv.match(/const\s+LEGACY_SHARED_TOKEN\s*=\s*'([^']+)'/)||[])[1];
ok('Admin KHÔNG viết cứng mật khẩu trong mã nguồn', !tokenAdmin, `tìm thấy: "${tokenAdmin}"`);
ok('Nhân viên KHÔNG viết cứng mật khẩu trong mã nguồn', !tokenNv, `tìm thấy: "${tokenNv}"`);

const urlAdmin=(admin.match(/const\s+DONGBO_URL\s*=\s*'([^']+)'/)||[])[1];
const urlNv=(nv.match(/const\s+DONGBO_URL\s*=\s*'([^']+)'/)||[])[1];
ok('Admin KHÔNG viết cứng địa chỉ Apps Script', !urlAdmin, `tìm thấy: "${urlAdmin}"`);
ok('Nhân viên KHÔNG viết cứng địa chỉ Apps Script', !urlNv, `tìm thấy: "${urlNv}"`);

// Quét thô toàn file: bắt cả trường hợp lọt vào chỗ khác (chuỗi rời, comment, ví dụ dán nhầm)
const coLinkThat=/script\.google\.com\/macros\/s\/AKfy[A-Za-z0-9_-]+/;
ok('Admin không lọt link Apps Script thật ở bất kỳ đâu', !coLinkThat.test(admin));
ok('Nhân viên không lọt link Apps Script thật ở bất kỳ đâu', !coLinkThat.test(nv));

// Hai file phải có sẵn đường cho người dùng tự khai kết nối, nếu không app thành vô dụng
ok('Admin có chỗ nhập kết nối (ô knUrl/knMk)', /id="knUrl"/.test(admin) && /id="knMk"/.test(admin));
ok('Nhân viên có chỗ nhập kết nối (ô knUrl/knMk)', /id="knUrl"/.test(nv) && /id="knMk"/.test(nv));

// ── 3. Mọi "hành động" (action) mà Admin/Nhân viên gọi lên đều phải có trong danh sách cho phép
//      của Code.gs — thiếu 1 cái là gọi lên báo "Không rõ lệnh" (đã xảy ra thật ở bản S3→S4). ──
const chePhepMatch=gs.match(/HANH_DONG_CHO_PHEP\s*=\s*\[([^\]]*)\]/);
const chePhep=chePhepMatch?[...chePhepMatch[1].matchAll(/'([a-zA-Z]+)'/g)].map(m=>m[1]):[];
function layActionGoi(html){
  const post=[...html.matchAll(/a:\s*'([a-zA-Z]+)'/g)].map(m=>m[1]);
  const get=[...html.matchAll(/&a=([a-zA-Z]+)['"]/g)].map(m=>m[1]);
  return [...new Set([...post,...get])];
}
const actionAdmin=layActionGoi(admin), actionNv=layActionGoi(nv);
const thieuAdmin=actionAdmin.filter(a=>!chePhep.includes(a));
const thieuNv=actionNv.filter(a=>!chePhep.includes(a));
ok('Code.gs có đủ mọi hành động Admin gọi lên (HANH_DONG_CHO_PHEP)', thieuAdmin.length===0, `Admin gọi: [${actionAdmin.join(', ')}] · thiếu: [${thieuAdmin.join(', ')}]`);
ok('Code.gs có đủ mọi hành động Nhân viên gọi lên (HANH_DONG_CHO_PHEP)', thieuNv.length===0, `NV gọi: [${actionNv.join(', ')}] · thiếu: [${thieuNv.join(', ')}]`);

// ── 4. Mỗi action Code.gs cho phép ở HANH_DONG_CHO_PHEP thì phải có nhánh xử lý thật (doGet/doPost) —
//      tránh trường hợp thêm tên vào danh sách cho phép nhưng quên viết nhánh if xử lý. ──
const xuLyDuoc=chePhep.filter(a=>{
  const reGet=new RegExp(`p\\.a\\s*===\\s*'${a}'`);
  const rePost=new RegExp(`d\\.a\\s*===\\s*'${a}'`);
  return reGet.test(gs)||rePost.test(gs);
});
const choPhepNhungKhongXuLy=chePhep.filter(a=>!xuLyDuoc.includes(a));
ok('Mọi action trong HANH_DONG_CHO_PHEP đều có nhánh xử lý thật trong doGet/doPost', choPhepNhungKhongXuLy.length===0, choPhepNhungKhongXuLy.join(', '));

// ── 5. Bản ghi phiên bản (version marker) — chỉ cảnh báo, không tính lỗi — nhắc kiểm tra tay ──
const verAdmin=(admin.match(/BẢN\s+(\d{2}\/\d{2}\/\d{4}-[A-Z0-9]+)/)||[])[1];
const verNv=(nv.match(/BẢN NHÂN VIÊN\s*·\s*(\d{2}\/\d{2}\/\d{4}-[A-Z0-9]+)/)||[])[1];
console.log(`ℹ️  Phiên bản đang gửi — Admin: ${verAdmin||'?'} · Nhân viên: ${verNv||'?'} (tự kiểm tra bằng mắt, không tính lỗi)`);

/* 10/09/2026 — bản S14: mọi trường của từng mặt hàng mà Admin đưa vào sachCauHinh() PHẢI có trong
   sachCauHinhServer() của Code.gs — thiếu là server cắt mất khi đồng bộ (lỗi thật đã xảy ra: temMoKhoa). */
{
  const boChuThich=t=>t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
  const khoang=(src,dau,cuoi)=>{const i=src.indexOf(dau);if(i<0)return '';const j=src.indexOf(cuoi,i);return j<0?'':boChuThich(src.slice(i,j))};
  const truong=t=>[...new Set([...t.matchAll(/([A-Za-z_]\w*)\s*:/g)].map(m=>m[1]))];
  const kc=truong(khoang(admin,'function sachCauHinh(','}));'));
  const ks=truong(khoang(gs,'function sachCauHinhServer(','sp: sp,'));
  const thieu=kc.filter(k=>!ks.includes(k));
  ok('Mọi trường mặt hàng Admin đồng bộ đều có trong Code.gs (không bị server cắt mất)', kc.length>10&&ks.length>10&&!thieu.length, thieu.length?'thiếu: '+thieu.join(', '):'không đọc được danh sách trường');
}
console.log(`\nKẾT QUẢ:  ${loi===0?'KHÔNG CÓ LỖI — an toàn để gửi':loi+' LỖI — DỪNG LẠI, sửa xong mới gửi cho khách'}`);
process.exit(loi?1:0);
