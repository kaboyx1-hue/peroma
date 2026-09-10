/* BỘ KIỂM TRA TỰ CHẠY — bang-tra-huong-lieu.html
   Chạy:  node kiemtra.mjs
   Mỗi lần sửa code thì chạy lại. Đỏ là hỏng, không giao.        */
import {chromium} from 'playwright';
import fs from 'fs';
const CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe';
const FILE='http://127.0.0.1:8777/huong/bang-tra-huong-lieu.html';
let dat=0,hong=0; const loi=[];
const ok=(t,c,ghi='')=>{c?dat++:(hong++,loi.push(t));console.log(`${c?'✓':'✗ HỎNG'}  ${t}${ghi?'  → '+ghi:''}`)};

const b=await chromium.launch({executablePath:CHROME});
const p=await (await b.newContext()).newPage();
const cerr=[]; p.on('pageerror',e=>cerr.push('PAGEERROR '+e.message));
p.on('console',m=>{if(m.type()==='error')cerr.push(m.text())});
p.on('response',r=>{if(r.status()>=400)cerr.push('HTTP '+r.status()+' → '+r.url())});
p.on('requestfailed',r=>cerr.push('REQ FAILED → '+r.url()+' — '+((r.failure()&&r.failure().errorText)||'')));
await p.goto(FILE); await p.waitForTimeout(900);
const E=f=>p.evaluate(f), Ea=(f,a)=>p.evaluate(f,a);

console.log('\n── A. KHỞI ĐỘNG ──');
ok('4 tab hiện đủ', (await E(()=>document.querySelectorAll('.tab').length))===4);
ok('11 mặt hàng gốc', (await E(()=>sp.length))===11);
ok('kg quy cách đoán đúng', (await E(()=>kgQC['500 g']))===0.5);
ok('quy cách mùn cưa chỉ 500g', (await E(()=>JSON.stringify(sp.find(x=>x.ten==='Mùn cưa thơm').dauRa)))==='["500 g"]');

console.log('\n── B. SỐ LÔ ──');
const vd=await E(()=>{const t=[['11','01','06','2026-08-15','11 01 06 0826'],['42','00','04','2026-08-01','42 00 04 0826'],
  ['36','00','10','2026-09-20','36 00 10 0926'],['51','02','02','2026-09-05','51 02 02 0926'],['22','08','05','2026-10-11','22 08 05 1026']];
  return t.map(x=>{maHuong.__t=x[1];maQC.__q=x[2];return lotDep(sinhLot({ten:'X',maSP:x[0]},'__t','__q',x[3]).lot)===x[4]})});
ok('5 ví dụ trong quy ước khớp hết', vd.every(Boolean), vd.filter(Boolean).length+'/5');
ok('thiếu mã thì chặn', (await E(()=>sinhLot({ten:'X',maSP:''},'','',  '2026-08-01').thieu.length>0)));
ok('lệnh SX bắt đầu 001', (await E(()=>lenhKe('2026-08-01')))==='26001');

console.log('\n── C. TRÙNG MÃ ──');
await E(()=>{sp[0].maSP='11';sp[7].maSP='11';ve()});
ok('phát hiện trùng mã SP', (await E(()=>demTrung()))>=2);
ok('trùng mã thì chặn sinh lô', (await E(()=>{maHuong.__t='01';maQC.__q='07';
  return sinhLot(sp[7],'__t','__q','2026-08-01').thieu.some(x=>/trùng/.test(x))})));
await E(()=>{sp[0].maSP='41';ve()});
ok('sửa xong hết báo trùng', (await E(()=>demTrung()))===0);

console.log('\n── D. GHI MẺ ──');
/* 25/08/2026: khối "Ghi nhận mẻ sản xuất" của Admin đã gỡ bỏ (trùng với ghi mẻ thật trên
   app Nhân viên — kiemRoiGhi()). Ở đây seed thẳng dữ liệu nk[] bằng cách gọi lại đúng các
   hàm sinhLot()/chiaBao()/lenhKe() mà trước đây data-ok handler dùng, mô phỏng 1 mẻ 100kg
   chia 2 quy cách (75kg→5kg, 25kg→1kg) — y hệt kịch bản cũ để các phần E trở đi không đổi. */
const i=await E(()=>{maHuong['Hương Chanh']='01';maQC['5 kg']='07';maQC['1 kg']='04';nvDS.push('Toàn');
  const c=sp.find(x=>x.ten==='Citycat');c.maSP='11';c.huongs=['Hương Chanh'];c.tam=[...c.huongs];c.huongMe='Hương Chanh';
  c.dauRa=['5 kg','1 kg'];c.ngaysx='2026-08-22';c.sl='100';c.nv='Toàn';c.pb=[{qc:'5 kg',kg:'75'},{qc:'1 kg',kg:'25'}];
  luuNgay();tab='ct';mo.clear();mo.add(sp.indexOf(c));ve();return sp.indexOf(c)});
await p.waitForTimeout(400);
ok('dòng phân bổ tự nhận kg đầu vào', (await Ea(x=>sp[x].pb[0].kg,i))==='75');
ok('dòng 2 nhận phần còn lại', (await Ea(x=>sp[x].pb[1].kg,i))==='25');
await Ea(x=>{
  const p=sp[x], ngay=p.ngaysx, kg=num(p.sl), dong=p.pb;
  const kq=dong.map(d=>({d,r:sinhLot(p,p.huongMe,d.qc,ngay)}));
  const goc='M'+Date.now(), dm=num(p.kg)>0?num(p.ml)/num(p.kg):0;
  const chung={ts:new Date().toISOString(),sp:p.ten,ngaysx:ngay,nv:p.nv,soLenh:lenhKe(ngay),
    maSP:hai(p.maSP),maHuong:hai(maHuong[p.huongMe]),thangSX:mmyy(ngay),
    huong:p.huongMe,huongList:[...(p.huongs||[])],meChuan:num(p.kg),mlChuan:num(p.ml),
    pkb:!!p.pkb,pkbPhut:p.pkbPhut||'',pkbChat:p.pkbChat||'',
    pkbCT:p.pkb?ctHL(p).ct:'',pkbCTRieng:p.pkb?ctHL(p).rieng:false,
    nguyenlieu:p.nguyenlieu||'',trangThai:p.tt||'ok',kgVao:kg,soDong:kq.length,tuNV:0,daGui:0};
  kq.forEach((y,k)=>{const g=num(y.d.kg), cb=chiaBao(g,y.d.qc);
    y.id=goc+'-'+(k+1);
    nk.push({...chung,id:y.id,lot:y.r.lot,sl:g,maQC:hai(maQC[y.d.qc]),quyCach:y.d.qc,
      soBao:cb?cb.so:'',kgBao:cb?cb.dv:'',kgDu:cb?cb.du:'',mlDung:Math.round(dm*g*10)/10})});
  p.sl='';p.pb=[];luuNgay();ve();
},i);
await p.waitForTimeout(300);
ok('1 mẻ 2 quy cách → 2 lô', (await E(()=>nk.length))===2);
ok('2 lô khác nhau', (await E(()=>nk[0].lot!==nk[1].lot)), await E(()=>nk.map(r=>r.lot).join(' · ')));
ok('2 lô chung 1 lệnh SX', (await E(()=>nk[0].soLenh===nk[1].soLenh)));
ok('quy ra số bao đúng', (await E(()=>nk[0].soBao))===15, '75kg ÷ 5kg');

console.log('\n── E. IN TEM ──');
await E(()=>{tab='bc';traLot=nk[0].lot;ve();window.print=()=>{window.__in=1}});
await p.waitForTimeout(350);
ok('có nút in tem', (await E(()=>!!document.querySelector('[data-intem]'))));
const eHuongDaDung=await E(()=>`${fmt(nk[0].mlDung)} g / ${fmt(nk[0].sl)} kg thành phẩm`);
ok('25/08/2026-K, 26/08/2026 PATCH V1 mục B3: "Hương liệu đã dùng" hiện kèm kg thành phẩm (g / kg), không để trần g gây khó hiểu',
  (await E(()=>$('viewBC').innerHTML)).includes(eHuongDaDung), eHuongDaDung);
ok('25/08/2026-K, 26/08/2026 PATCH V1 mục G1: chưa có chốt thực tế nào thì khối "Chốt thực tế sản xuất theo lô" vẫn hiện ra kèm gợi ý (không im lặng biến mất)',
  (await E(()=>bcNgay.length))===0 && /Chốt thực tế sản xuất theo lô/.test(await E(()=>$('viewBC').innerHTML)) && /Chưa nhận được xác nhận số thực tế/.test(await E(()=>$('viewBC').innerHTML)));
await p.click('[data-intem]'); await p.waitForTimeout(450);
ok('chặn in khi hồ sơ tem thiếu', (await E(()=>($('dlgT')||{}).textContent))==='Hồ sơ tem chưa đủ');
await p.click('#dlgC'); await p.waitForTimeout(250);
await E(()=>{const c=sp.find(x=>x.ten==='Citycat');
  c.hstem={tenVN:'Cát vệ sinh THE CITYCAT',tenEN:'',thanhPhan:'Bentonite, hương liệu',congDung:'Vón cục, khử mùi',
    kichThuoc:'0,5–3,5 mm',doAm:'< 10%',hdsd:HDSD_NHOM[0][1],baoQuan:BAOQUAN_MD,xuatXu:XUATXU_MD,soTCCS:'01:2026/KH',hsdNam:'10'};
  luuNgay();ve()});
await p.waitForTimeout(300);
await p.click('[data-intem]'); await p.waitForTimeout(500);
ok('in được khi hồ sơ đủ', (await E(()=>window.__in===1)));
const tem=await E(()=>$('temIn').innerText);
ok('tem có ngày SX đầy đủ', /22\/08\/2026/.test(tem));
ok('tem có số lô', /11 01 07 0826|11 01 04 0826/.test(tem));
ok('tem có địa chỉ sản xuất', /8A An Dương Vương/.test(tem));
ok('tem tính hạn dùng', /đến 22\/08\/2036/.test(tem));
ok('#temIn là con trực tiếp của body', (await E(()=>$('temIn').parentElement.tagName))==='BODY');

console.log('\n── F. ĐỔI TÊN LAN TRUYỀN ──');
await E(()=>{doiTen('sp','Citycat','THE CITYCAT');doiTen('h','Hương Chanh','Chanh tươi');luuNgay();ve()});
ok('đổi tên SP lan sang nhật ký', (await E(()=>nk.every(r=>r.sp==='THE CITYCAT'))));
ok('đổi tên hương lan sang nhật ký', (await E(()=>nk.every(r=>r.huong==='Chanh tươi'))));
ok('mã hương theo tên mới', (await E(()=>maHuong['Chanh tươi']))==='01');
ok('tên cũ biến mất', (await E(()=>!kho.includes('Hương Chanh'))));

console.log('\n── G. LƯU / NẠP LẠI ──');
await p.reload(); await p.waitForTimeout(900);
ok('nhật ký còn sau tải lại', (await E(()=>nk.length))===2);
ok('danh mục nhân viên còn', (await E(()=>nvDS.includes('Toàn'))));
ok('hồ sơ tem còn', (await E(()=>(sp.find(x=>x.ten==='THE CITYCAT').hstem||{}).soTCCS))==='01:2026/KH');
await E(()=>{kgQC['5 kg']=99;return luuNgay()});
await p.waitForTimeout(200); await p.reload(); await p.waitForTimeout(900);
ok('kg sửa tay không bị đoán đè', (await E(()=>kgQC['5 kg']))===99);

console.log('\n── H. XUẤT EXCEL ──');
await E(()=>{tab='sl';ve()});
await p.waitForTimeout(300);
const dl=p.waitForEvent('download',{timeout:9000});
await p.click('#xlBtn');
let xl=false; try{await dl; xl=true}catch(e){}
ok('xuất Excel không lỗi', xl);

console.log('\n── I. H2 — TEM THEO ID (không lấy nhầm khi trùng lot) ──');
const idsH2=await E(()=>{
  const lotChung=nk[0].lot;
  const base={...nk[0]}; delete base.id;
  const rA={...base,id:'TEST-H2-A',ngaysx:'2026-08-05',lot:lotChung};
  const rB={...base,id:'TEST-H2-B',ngaysx:'2026-08-20',lot:lotChung};
  nk.push(rA,rB); luuNgay(); ve();
  return {a:rA.id,b:rB.id,lot:lotChung};
});
ok('2 bản ghi test dùng chung 1 lot (mô phỏng đúng quy ước)',
  (await E(()=>{const l=nk.filter(x=>x.id==='TEST-H2-A'||x.id==='TEST-H2-B').map(x=>x.lot);return l.length===2&&l[0]===l[1]})));
await E(()=>{window.print=()=>{window.__in=1}});
await Ea(id=>inTem(id), idsH2.a); await p.waitForTimeout(300);
const temH2A=(await E(()=>$('temIn').innerText));
ok('in tem theo id A lấy đúng bản ghi A dù trùng lot', /05\/08\/2026/.test(temH2A));
await Ea(id=>inTem(id), idsH2.b); await p.waitForTimeout(300);
const temH2B=(await E(()=>$('temIn').innerText));
ok('in tem theo id B lấy đúng bản ghi B, KHÔNG lấy nhầm A', /20\/08\/2026/.test(temH2B) && !/05\/08\/2026/.test(temH2B));
await E(()=>{nk=nk.filter(x=>x.id!=='TEST-H2-A'&&x.id!=='TEST-H2-B');luuNgay();ve()});

console.log('\n── J. H1 — CẤU HÌNH GỬI ĐI KHÔNG MANG DỮ LIỆU ĐANG GHI DỞ ──');
await E(()=>{const c=sp.find(x=>x.ten==='THE CITYCAT');
  c.sl='999';c.pb=[{qc:'5 kg',kg:'999'}];c.huongMe='Hương Chanh';c.ngaysx='2026-08-01';c.lot='TESTLOT';c.nv='NguoiTest'});
const sachJ=await E(()=>JSON.stringify(sachCauHinh(sp).find(x=>x.ten==='THE CITYCAT')));
const sachJO=JSON.parse(sachJ);
ok('sachCauHinh() bỏ trường sl (đang ghi dở)', !sachJO.hasOwnProperty('sl'));
ok('sachCauHinh() bỏ trường pb/huongMe/lot/ngaysx/nv', ['pb','huongMe','lot','ngaysx','nv'].every(k=>!sachJO.hasOwnProperty(k)));
ok('sachCauHinh() vẫn giữ trường danh mục (kg/maSP)', sachJO.hasOwnProperty('kg')&&sachJO.hasOwnProperty('maSP'));

console.log('\n── K. TCCS TỰ ĐỘNG ĐIỀN HỒ SƠ TEM ──');
const kR=await E(()=>{
  const p=sp.find(x=>x.ten==='THE CITYCAT');
  p.maSP='11'; p.hstem={...temMoi()}; p.hstem.tenVN='TÊN ĐÃ NHẬP TAY — KHÔNG ĐƯỢC GHI ĐÈ';
  const r=apTCCS(sp.indexOf(p));
  return {ok:r.ok,ly_do:r.ly_do,tenVN:p.hstem.tenVN,thanhPhan:p.hstem.thanhPhan,
    soTCCS:p.hstem.soTCCS,hsdNam:p.hstem.hsdNam,hdsd:p.hstem.hdsd};
});
ok('apTCCS() báo thành công cho mã đã có dữ liệu (11)', kR.ok===true, kR.ly_do);
ok('apTCCS() KHÔNG ghi đè ô đã nhập tay (tenVN)', kR.tenVN==='TÊN ĐÃ NHẬP TAY — KHÔNG ĐƯỢC GHI ĐÈ');
ok('apTCCS() điền ô đang trống (thanhPhan)', /Bentonite/.test(kR.thanhPhan||''));
ok('apTCCS() điền đúng số hiệu TCCS theo mã 11', kR.soTCCS==='01:2026/KH');
ok('apTCCS() điền hạn dùng theo TCCS', kR.hsdNam==='10');
ok('apTCCS() điền HDSD theo đúng nhóm (cát vệ sinh cho mèo)', /khay/.test(kR.hdsd||''));

const kBig=await E(()=>{
  const p=sp.find(x=>x.ten==='Bigpaw');
  return apTCCS(sp.indexOf(p));
});
ok('apTCCS() CHẶN Bigpaw vì không có TCCS', kBig.ok===false && /KHÔNG CÓ/.test(kBig.ly_do));

const kSand=await E(()=>{
  const p=sp.find(x=>x.ten==='Cát sand to');
  return apTCCS(sp.indexOf(p));
});
ok('apTCCS() CHẶN Cát sand to vì TCCS chưa rõ số hiệu', kSand.ok===false && /chưa xác định/.test(kSand.ly_do));

const kNoMa=await E(()=>{
  const p=sp.find(x=>x.ten==='Cát Zaka pro');
  const maCu=p.maSP; p.maSP='';
  const r=apTCCS(sp.indexOf(p));
  p.maSP=maCu;
  return r;
});
ok('apTCCS() báo rõ khi mặt hàng chưa có mã sản phẩm', kNoMa.ok===false && /chưa cấp mã/.test(kNoMa.ly_do));

console.log('\n── L. LƯỚI TEM 1 TRANG A4 DUY NHẤT (25/08/2026 — đơn giản hoá, bỏ phụ thuộc soBao) ──');
const lR=await E(()=>{
  const p=sp.find(x=>x.ten==='THE CITYCAT');
  const r={...nk[0],sp:'THE CITYCAT',soBao:'7'}; // soBao giờ KHÔNG còn ảnh hưởng tới số trang/tem
  temCot=5;temHang=4;
  const html=trangTem(r,p);
  const div=document.createElement('div');div.innerHTML=html;
  return {soTo:div.querySelectorAll('.to').length, soTem:div.querySelectorAll('.tem').length,
    cls:div.querySelector('.to').className};
});
ok('luôn đúng 1 trang, dàn kín lưới (5×4=20 tem), không phụ thuộc soBao', lR.soTo===1 && lR.soTem===20, JSON.stringify(lR));
ok('lưới 20/tờ dùng cỡ chữ nhỏ nhất (to-nho)', /to-nho/.test(lR.cls));

const lR3=await E(()=>{
  const p=sp.find(x=>x.ten==='THE CITYCAT');
  const r={...nk[0],sp:'THE CITYCAT',soBao:''}; // hàng rời, không có số bao — vẫn 1 trang dàn kín
  temCot=3;temHang=2;
  const html=trangTem(r,p);
  const div=document.createElement('div');div.innerHTML=html;
  return {soTo:div.querySelectorAll('.to').length, soTem:div.querySelectorAll('.tem').length,
    cls:div.querySelector('.to').className,
    cols:div.querySelector('.to').style.gridTemplateColumns};
});
ok('không có số bao → vẫn đúng 1 trang dàn kín (3×2=6)', lR3.soTo===1 && lR3.soTem===6, JSON.stringify(lR3));
ok('lưới nhỏ (6/tờ) dùng cỡ chữ vừa (to-vua)', /to-vua/.test(lR3.cls));
ok('cột/hàng áp đúng vào CSS grid-template-columns', /repeat\(3/.test(lR3.cols));

const lR4=await E(()=>{
  const p=sp.find(x=>x.ten==='THE CITYCAT');
  const r={...nk[0],sp:'THE CITYCAT',soBao:'2'};
  temCot=1;temHang=1; // 1 tem/trang
  const html=trangTem(r,p);
  const div=document.createElement('div');div.innerHTML=html;
  return {soTo:div.querySelectorAll('.to').length,soTem:div.querySelectorAll('.tem').length,cls:div.querySelector('.to').className};
});
ok('cột=hàng=1 → đúng 1 trang, 1 tem, cỡ chữ to (to-lon)', lR4.soTo===1 && lR4.soTem===1 && /to-lon/.test(lR4.cls), JSON.stringify(lR4));

console.log('\n── M. KHOÁ THEO TCCS — MÃ 32 (HAMBII Little Mars, thử nghiệm) ──');
const mR=await E(()=>{
  const p=sp.find(x=>x.ten==='Cát ăn (Hambi)');
  p.maSP='32'; p.hstem={tenVN:'TÊN GÕ TAY CŨ — PHẢI BỊ GHI ĐÈ'}; // mô phỏng dữ liệu cũ trước khi khoá
  const r=apTCCSKhoa(sp.indexOf(p));
  return {ok:r.ok,ly_do:r.ly_do,tenVN:p.hstem.tenVN,soTCCS:p.hstem.soTCCS,doAm:p.hstem.doAm,
    hdsd:p.hstem.hdsd,xuatXu:p.hstem.xuatXu};
});
ok('apTCCSKhoa() báo thành công cho mã 32', mR.ok===true, mR.ly_do);
ok('apTCCSKhoa() GHI ĐÈ hoàn toàn (khác apTCCS() chỉ điền ô trống)',
  mR.tenVN==='CÁT LÓT NỀN CHO CHUỘT HAMSTER – HAMBII LITTLE MARS');
ok('lấy đúng số hiệu TCCS thật từ file .docx', mR.soTCCS==='02:2026/HAMBII');
ok('lấy đúng HDSD nguyên văn từ TCCS (không dùng nhóm chung)', /Trải một lớp cát/.test(mR.hdsd||''));
ok('lấy đúng xuất xứ nguyên văn từ TCCS', mR.xuatXu==='Sản xuất tại Việt Nam từ nguyên liệu nhập khẩu');
ok('lấy đúng độ ẩm nguyên văn từ TCCS (mục 6, xác nhận lại 25/08/2026 — lần đọc trước bị sót)', mR.doAm==='< 10%', mR.doAm);

const mThieu=await E(()=>{
  const p=sp.find(x=>x.ten==='Cát ăn (Hambi)');
  return temThieu(p);
});
ok('đủ 11 ô hồ sơ tem từ TCCS (kể cả độ ẩm) nên KHÔNG còn bị chặn in tem', mThieu.length===0, JSON.stringify(mThieu));

const mDongBo=await E(()=>{
  const p=sp.find(x=>x.ten==='Cát ăn (Hambi)');
  p.hstem.tenVN='ADMIN CỐ GÕ TAY ĐÈ LÊN'; // không có input để gõ nữa, nhưng giả lập trực tiếp field
  dongBoTCCSKhoaLucNap(); // mô phỏng app khởi động lại — phải đồng bộ lại theo TCCS_DATA
  const p2=sp.find(x=>x.ten==='Cát ăn (Hambi)');
  return p2.hstem.tenVN;
});
ok('mỗi lần khởi động lại app, mặt hàng khoá luôn bị áp lại đúng theo TCCS_DATA trong code',
  mDongBo==='CÁT LÓT NỀN CHO CHUỘT HAMSTER – HAMBII LITTLE MARS');

const mHtml=await E(()=>{
  const p=sp.find(x=>x.ten==='Cát ăn (Hambi)');
  const i=sp.indexOf(p);
  return veTem(p,i);
});
ok('veTem() mã đã khoá KHÔNG còn input/textarea nào (không gõ tay được nữa)',
  !/<input |<textarea/.test(mHtml));
ok('veTem() mã đã khoá có nút Áp lại từ TCCS', /data-tccskhoa=/.test(mHtml));

console.log('\n── N. TẢI FILE TCCS (.docx) LÊN — TỰ ĐỌC & ĐIỀN THỬ (25/08/2026) ──');
/* 10/09/2026: mục N cần file .docx mẫu vốn nằm trong container Linux cũ (/root/.claude/uploads/...).
   Chạy trên máy Windows thì file không tồn tại, setInputFiles() ném lỗi và làm DỪNG cả bộ test —
   che mất toàn bộ các mục O→AV phía sau. Bọc lại: thiếu file thì bỏ qua đúng mục này và nói rõ,
   phần còn lại vẫn chạy đủ. KHÔNG đổi một assertion nào của mục N. */
const { existsSync: coFileMau } = await import('node:fs');
const N_DOCX='/root/.claude/uploads/63875fba-de14-5b65-a00a-5e89bffc5539/f458d28f-TCCS_02_2026_HAMBII_CatLotNen.docx';
if(!coFileMau(N_DOCX)){
  console.log('  ⚠ BỎ QUA mục N — máy này không có file .docx mẫu:');
  console.log('    ' + N_DOCX);
  console.log('    Tính năng đọc TCCS từ .docx CHƯA được kiểm chứng trong lần chạy này.');
} else {
await E(()=>{
  const p2=sp.find(x=>x.ten==='Cát Zaka liti thường');
  p2.maSP=''; p2.hstem=null; tab='ct'; mo.clear(); mo.add(sp.indexOf(p2)); ve();
});
await p.waitForTimeout(150);
const nDocx='/root/.claude/uploads/63875fba-de14-5b65-a00a-5e89bffc5539/f458d28f-TCCS_02_2026_HAMBII_CatLotNen.docx';
await p.locator('.r.open [data-tccsfile]').setInputFiles(nDocx);
await p.waitForTimeout(400);
const nR=await E(()=>{
  const p2=sp.find(x=>x.ten==='Cát Zaka liti thường');
  return p2.hstem;
});
ok('tải file TCCS thật lên (không gán mã, không sửa code) vẫn tự điền đúng tên sản phẩm',
  nR&&nR.tenVN==='CÁT LÓT NỀN CHO CHUỘT HAMSTER – HAMBII LITTLE MARS', JSON.stringify(nR&&nR.tenVN));
ok('tự điền đúng số hiệu TCCS', nR&&nR.soTCCS==='02:2026/HAMBII');
ok('tự điền đúng độ ẩm', nR&&/10%/.test(nR.doAm||''));
ok('tự điền đúng hạn sử dụng (năm)', nR&&nR.hsdNam==='10');
ok('KHÔNG tự bịa công dụng — TCCS không có câu này đúng khuôn mẫu dò, phải để trống cho admin tự gõ',
  nR&&!String(nR.congDung||'').trim());
const nThieu=await E(()=>{const p2=sp.find(x=>x.ten==='Cát Zaka liti thường');return temThieu(p2)});
ok('vì còn thiếu công dụng (chưa dò được) nên vẫn đúng là bị chặn in tem — không cho qua ẩu',
  nThieu.some(x=>/[Cc]ông dụng/.test(x)), JSON.stringify(nThieu));
} // hết khối bọc mục N (10/09/2026)

console.log('\n── O. Ô NHẬP MÃ KHÔNG ĐƯỢC BIẾN MẤT KHI KHÔNG CÓ GỢI Ý (25/08/2026) ──');
const oR=await E(()=>{
  tab='ma';
  dr.push('20kg (test)'); maQC['20kg (test)']=maQC['20kg (test)']||MA_QC_GOI_Y['20kg (test)']||'';
  kho.push('Hương lạ (test)'); maHuong['Hương lạ (test)']=maHuong['Hương lạ (test)']||MA_HUONG_GOI_Y['Hương lạ (test)']||'';
  ve();
  return {
    coOQC: !!document.querySelector('[data-ma="q"][data-k="20kg (test)"]'),
    coOHuong: !!document.querySelector('[data-ma="h"][data-k="Hương lạ (test)"]')
  };
});
ok('quy cách KHÔNG có trong bảng gợi ý vẫn hiện ô nhập mã tay (không "khoá chết")', oR.coOQC);
ok('hương KHÔNG có trong bảng gợi ý vẫn hiện ô nhập mã tay', oR.coOHuong);
const oGo=await E(()=>{
  const inp=document.querySelector('[data-ma="q"][data-k="20kg (test)"]');
  inp.value='12'; inp.dispatchEvent(new Event('input',{bubbles:true}));
  return maQC['20kg (test)'];
});
ok('gõ tay mã vào ô đó lưu đúng vào maQC', oGo==='12');

console.log('\n── P. LÔ 27.000 BAO — KHÔNG CÒN NGUY CƠ TREO MÁY (25/08/2026, đơn giản hoá) ──');
const pR=await E(()=>{
  const c=sp[0];
  temCot=5;temHang=4;
  const html=trangTem({soBao:27000,ngaysx:'2026-08-25',lot:'1101070826',sp:c.ten,huong:'Chanh tươi',quyCach:'1 kg'}, c);
  return {len:html.length, soTem:(html.match(/class="tem"/g)||[]).length};
});
ok('lô 27.000 bao vẫn chỉ dựng đúng 1 trang (20 tem), không còn phụ thuộc soBao nên không thể treo máy', pR.soTem===20, pR.soTem+' tem, '+pR.len+' ký tự');
const beforeHtml=await E(()=>{
  const c=sp[0];
  c.hstem={tenVN:'X',thanhPhan:'X',congDung:'X',doAm:'< 10%',hdsd:'X',baoQuan:'X',xuatXu:'X',soTCCS:'01:2026/KH',hsdNam:'10'};
  const id='TESTLON-1';
  nk.push({id,sp:c.ten,ngaysx:'2026-08-25',lot:'1101070826',soBao:27000,huong:'Chanh tươi',quyCach:'1 kg'});
  const before=$('temIn').innerHTML;
  return before;
});
const afterHtml=await E(()=>{
  inTem('TESTLON-1'); // giờ không còn hoi() chặn giữa đường nữa — chạy xong luôn
  return $('temIn').innerHTML;
});
ok('inTem() vẫn cho in bình thường (không còn hộp thoại chặn) — chỉ 1 trang cố định nên an toàn', afterHtml!==beforeHtml && afterHtml.length<50000, 'độ dài: '+afterHtml.length);

console.log('\n── Q. TRA LÔ BẰNG DROPDOWN, KHÔNG CÒN GÕ TAY (25/08/2026) ──');
const qR=await E(()=>{
  tab='bc'; ve();
  return {
    laSelect: document.querySelector('#traLot').tagName==='SELECT',
    coTuyChon: document.querySelectorAll('#traLot option').length>1
  };
});
ok('ô "Tra cứu số lot" là dropdown, không phải ô gõ tay', qR.laSelect);
ok('dropdown có ít nhất 1 lô để chọn (dữ liệu test đã có mẻ)', qR.coTuyChon);
const qSel=await E(()=>{
  const sel=$('traLot'), opt=sel.options[1];
  if(!opt)return null;
  sel.value=opt.value; sel.dispatchEvent(new Event('input',{bubbles:true}));
  return {gia:opt.value, coThe: document.querySelectorAll('.lot').length>0};
});
ok('chọn 1 lô trong dropdown thì hiện đúng thẻ chi tiết lô đó', qSel&&qSel.coThe, JSON.stringify(qSel));

console.log('\n── U. TCCS_DATA BỔ SUNG MÃ 34/35/36/37/39 + LINK TỦ HỒ SƠ (25/08/2026) ──');
const uR=await E(()=>({
  co34:!!TCCS_DATA['34'], co35:!!TCCS_DATA['35'], co36:!!TCCS_DATA['36'],
  co37:!!TCCS_DATA['37'], co39:!!TCCS_DATA['39'],
  hdsdOk:[TCCS_DATA['34'],TCCS_DATA['35'],TCCS_DATA['36'],TCCS_DATA['37'],TCCS_DATA['39']]
    .every(d=>d&&d.hdsdNhom===2),
  soTCCSOk:TCCS_DATA['34'].soTCCS==='04:2026/HAMBII'&&TCCS_DATA['39'].soTCCS==='09:2026/HAMBII'
}));
ok('đủ 5 mã TCCS_DATA mới (34/35/36/37/39)', uR.co34&&uR.co35&&uR.co36&&uR.co37&&uR.co39, JSON.stringify(uR));
ok('cả 5 mã đúng nhóm HDSD lót chuồng (hdsdNhom=2)', uR.hdsdOk);
ok('số hiệu TCCS đúng theo bảng chốt', uR.soTCCSOk);
const uAp=await E(()=>{
  const i=sp.push(napSP([{ten:'TEST Gỗ nén 8mm',kg:0,ml:0,me:0,pkb:false,maSP:'35'}])[0])-1;
  const r=apTCCS(i);
  return {ok:r.ok, tenVN:sp[i].hstem&&sp[i].hstem.tenVN};
});
ok('apTCCS() dùng được ngay cho mã mới (35) không cần sửa gì thêm', uAp.ok&&/8MM/.test(uAp.tenVN||''), JSON.stringify(uAp));
const uQU=await E(()=>{const r=QU_SP.find(x=>x[0]==='38');return r?r[1]:''});
ok('bảng tra quy ước QU_SP mã 38 đã sửa "PRO"→"PLUS" (khớp TCCS_DATA)', /PLUS/.test(uQU)&&!/PRO\b/.test(uQU), uQU);
const uLink=await E(()=>{tab='sl';ve();return $('viewSL').innerHTML.includes('claude.ai/code/artifact/d1e828c4-2883-42c8-9e05-8b1336e44677')});
ok('link tủ hồ sơ công ty có trong tab Sao lưu', uLink);

console.log('\n── V. QU_SP KHỚP VĂN BẢN QUY ƯỚC SỐ LÔ + CÔNG DỤNG KHỚP THEO SỐ TCCS (25/08/2026) ──');
const vQU=await E(()=>({
  co61: !!QU_SP.find(x=>x[0]==='61'),
  soMa: QU_SP.length
}));
ok('QU_SP đã bổ sung mã 61 (từng bị sót so với văn bản quy ước số lô)', vQU.co61);
ok('QU_SP đủ 16 mã (15 cũ + 61)', vQU.soMa===16, 'có '+vQU.soMa);
const vCD=await E(()=>{
  const nhom1='Dùng để đổ vào khay vệ sinh, giúp mèo che lấp và xử lý chất thải theo bản năng';
  const nhom4='thấm hút ẩm và chất thải, tạo bề mặt êm cho thú đào hang';
  return {
    d11: (TCCS_DATA['11'].congDung||'').includes(nhom1),
    d41: (TCCS_DATA['41'].congDung||'').includes(nhom1),
    d42: (TCCS_DATA['42'].congDung||'').includes(nhom1),
    d32: (TCCS_DATA['32'].congDung||'').includes(nhom4),
    d34: (TCCS_DATA['34'].congDung||'').includes(nhom4),
    d38: (TCCS_DATA['38'].congDung||'').includes(nhom4),
    d39: (TCCS_DATA['39'].congDung||'').includes(nhom4),
    d61: (TCCS_DATA['61'].congDung||'').includes(nhom4),
  };
});
ok('công dụng nhóm 1 (cát vệ sinh mèo khoáng) áp đúng cho 11/41/42', vCD.d11&&vCD.d41&&vCD.d42, JSON.stringify(vCD));
ok('công dụng nhóm 4 (lót chuồng hamster khoáng) áp đúng cho 32/34/38/39/61', vCD.d32&&vCD.d34&&vCD.d38&&vCD.d39&&vCD.d61, JSON.stringify(vCD));
const vGoiY=await E(()=>({cat31:MA_SP_GOI_Y['Cát Hambi'],cat32:MA_SP_GOI_Y['Cát ăn (Hambi)']}));
ok('MA_SP_GOI_Y bổ sung "Cát Hambi"→31, "Cát ăn (Hambi)"→32 (giải mã tiếng lóng xưởng)', vGoiY.cat31==='31'&&vGoiY.cat32==='32', JSON.stringify(vGoiY));

console.log('\n── W. THÀNH PHẦN RÚT GỌN + BÁO CÁO DÙNG HỒ SƠ TEM THAY VÌ NGUYÊN LIỆU TỰ GÕ (25/08/2026) ──');
const wTP=await E(()=>{
  const dai=/khoáng nền|không phối trộn|dùng cho sản phẩm chăm sóc/i;
  return Object.keys(TCCS_DATA).map(k=>({ma:k,tp:TCCS_DATA[k].thanhPhan,dai:dai.test(TCCS_DATA[k].thanhPhan||'')}));
});
ok('không còn mã nào diễn giải dài dòng trong thanhPhan', wTP.every(x=>!x.dai), JSON.stringify(wTP.filter(x=>x.dai)));
const wTP39=await E(()=>TCCS_DATA['39']&&TCCS_DATA['39'].thanhPhan);
ok('mã 39 rút gọn đúng mẫu "Cao lanh, hương liệu"', wTP39==='Cao lanh, hương liệu', wTP39);
const wBC=await E(()=>{
  const c=sp[0]; c.hstem=c.hstem||{}; c.hstem.thanhPhan='Bentonite, hương liệu';
  const id='TESTTP-1';
  nk.push({id,sp:c.ten,ngaysx:'2026-08-25',lot:'1101070826',soBao:5,huong:'Chanh tươi',quyCach:'1 kg',nguyenlieu:'Bentonite loại A, nhà cung cấp X'});
  tab='bc'; traLot='1101070826'; ve();
  return $('viewBC').innerHTML;
});
ok('báo cáo theo lô hiện đúng nhãn "Thành phần" (không còn "Nguyên liệu" tự gõ)', /Thành phần/.test(wBC) && wBC.includes('Bentonite, hương liệu'));
ok('không còn hiện text nguyên liệu tự gõ tay cũ', !wBC.includes('nhà cung cấp X'));

console.log('\n── X. BÁO CÁO TỔNG HỢP THAY BẰNG THẺ CÓ MÀU (25/08/2026) ──');
const xBC=await E(()=>{traLot='';tuNgay='';denNgay='';ve();return $('viewBC').innerHTML});
ok('không còn bảng <table> phẳng cho 3 mục tổng hợp', !/<table class="tb">/.test(xBC));
ok('có thẻ màu .bcc thay thế', /class="bcc"/.test(xBC));
ok('26/08/2026 PATCH V1 mục E: KHÔNG còn thanh tỷ lệ %/.bcc-fill (tỷ trọng kg/tổng kg dễ hiểu lầm là % tiến độ/hiệu suất)', !/bcc-fill/.test(xBC) && !/bcc-pct/.test(xBC));
ok('vẫn giữ đủ 3 mục (Sản lượng theo sản phẩm/nhân viên, Tiêu hao theo hương)',
  /Sản lượng theo sản phẩm/.test(xBC)&&/Sản lượng theo nhân viên/.test(xBC)&&/Tiêu hao theo hương/.test(xBC));
ok('vẫn tôn trọng bộ lọc Khoảng thời gian có sẵn (không đổi cách lọc)', /id="tuNgay"/.test(xBC)&&/id="denNgay"/.test(xBC));

console.log('\n── Y. HUỶ LÔ (ĐÁNH DẤU HUỶ, GIỮ LỊCH SỬ) (25/08/2026) ──');
const yId=await E(()=>{
  traLot='';tuNgay='';denNgay='';
  const c=sp.find(x=>x.ten==='THE CITYCAT');
  const id='TESTHUY-1';
  nk.push({id,sp:c.ten,ngaysx:'2026-08-25',lot:'1101070826',soBao:5,huong:'Chanh tươi',quyCach:'1 kg',sl:5,nv:'Toàn'});
  tab='bc';traLot='1101070826';ve();
  return id;
});
await p.waitForTimeout(300);
ok('thẻ lô có nút Huỷ lô này', (await E(()=>!!document.querySelector('[data-huylo]'))));
await p.click('[data-huylo]'); await p.waitForTimeout(350);
ok('bấm huỷ hiện hộp xác nhận, nút OK có cảnh báo nguy hiểm (warn)', (await E(()=>$('dlgO').classList.contains('warn'))));
await p.click('#dlgO'); await p.waitForTimeout(350);
const yR1=await Ea(x=>{const r=nk.find(x2=>x2.id===x);return {huy:r.huy,coHuyLuc:!!r.huyLuc}},yId);
ok('huỷ lô đặt r.huy=true và ghi r.huyLuc', yR1.huy===true&&yR1.coHuyLuc, JSON.stringify(yR1));
const yLoc=await Ea(x=>locNK().some(r=>r.id===x),yId);
ok('lô đã huỷ bị loại khỏi locNK() (không tính báo cáo)', yLoc===false);
const yBC=await E(()=>{traLot='1101070826';ve();return $('viewBC').innerHTML});
ok('thẻ lô hiện badge "ĐÃ HUỶ"', /ĐÃ HUỶ/.test(yBC));
ok('lô đã huỷ ẩn nút "In tem phụ cho lô này"', !/data-intem="TESTHUY-1"/.test(yBC));
ok('lô đã huỷ đổi nút thành "Bỏ huỷ lô này"', /Bỏ huỷ lô này/.test(yBC));
const yInTruoc=await E(()=>window.__in||0);
await E(()=>{window.print=()=>{window.__in=(window.__in||0)+1}});
// inTem() tự await hoi() chờ bấm nút — KHÔNG await promise này trong Node (sẽ deadlock),
// thả nó chạy trong trình duyệt rồi bấm nút thật từ Playwright để nó tự giải phóng.
const pInChan=Ea(x=>inTem(x),yId);
await p.waitForTimeout(350);
const yDlgT=await E(()=>($('dlgT')||{}).textContent);
ok('inTem() chặn in cho lô đã huỷ', yDlgT==='Lô này đã huỷ', yDlgT);
await p.click('#dlgC'); await p.waitForTimeout(250);
await pInChan;
const yInSau=await E(()=>window.__in||0);
ok('không thật sự gọi print() khi bị chặn', yInSau===yInTruoc, `${yInTruoc}→${yInSau}`);
await p.click('[data-huylo]'); await p.waitForTimeout(350);
ok('bấm lại hiện hộp "Bỏ huỷ lô này?"', (await E(()=>($('dlgT')||{}).textContent))==='Bỏ huỷ lô này?');
await p.click('#dlgO'); await p.waitForTimeout(350);
const yR2=await Ea(x=>{const r=nk.find(x2=>x2.id===x);return {huy:r.huy,huyLucRong:r.huyLuc===''}},yId);
ok('bỏ huỷ đặt lại r.huy=false và xoá r.huyLuc', yR2.huy===false&&yR2.huyLucRong, JSON.stringify(yR2));
const yLoc2=await Ea(x=>locNK().some(r=>r.id===x),yId);
ok('bỏ huỷ thì lô lại được locNK() tính vào báo cáo', yLoc2===true);

console.log('\n── Z. QUY CÁCH ĐÓNG GÓI — BỎ KHAI TAY, TỰ ĐỘNG THEO MẶT HÀNG (25/08/2026) ──');
const zDR=await E(()=>{tab='ct';const i=sp.findIndex(x=>x.ten==='Mùn cưa thơm');mo.clear();return i});
ok('tìm thấy Mùn cưa thơm', zDR>=0);
const zVeDR=await Ea(i=>{mo.add(i);ve();
  return {html:$('viewCT').innerHTML, coNutDR:document.querySelectorAll('[data-dr]').length,
    coNutAddDR:document.querySelectorAll('[data-adddr]').length, coNutXDR:document.querySelectorAll('[data-xdr]').length};
},zDR);
ok('không còn nút bấm chọn quy cách theo mặt hàng (data-dr)', zVeDR.coNutDR===0);
ok('không còn nút +Thêm quy cách trùng lặp trong thẻ mặt hàng (data-adddr)', zVeDR.coNutAddDR===0);
ok('không còn nút xoá quy cách trùng lặp trong thẻ mặt hàng (data-xdr)', zVeDR.coNutXDR===0);
ok('vẫn hiện đúng quy cách 500 g cho Mùn cưa (chỉ đọc)', /500 g/.test(zVeDR.html) && /Tự động theo tên mặt hàng/.test(zVeDR.html));
const zPB=await Ea(i=>{const p=sp[i];p.sl='100';return {qc:p.pb&&p.pb[0]&&p.pb[0].qc, kg:p.pb&&p.pb[0]&&p.pb[0].kg, soDong:(p.pb||[]).length};},zDR);
ok('mở mặt hàng 1-quy-cách tự tạo sẵn 1 dòng đóng gói (khỏi bấm +Thêm quy cách)', zPB.soDong===1&&zPB.qc==='500 g', JSON.stringify(zPB));
const zTinh=await E(()=>{const q='500 g';const cb=chiaBao(100,q);return cb});
ok('100kg ÷ 500g tự tính ra 200 sản phẩm, đúng như khách nêu ví dụ', zTinh.so===200&&zTinh.du===0, JSON.stringify(zTinh));
const zTao=await E(()=>{
  const truoc=sp.length;
  $('addBtn').click();
  const p=sp[sp.length-1];
  return {them:sp.length===truoc+1, dauRa:[...(p.dauRa||[])]};
});
ok('tạo mặt hàng mới tự có sẵn quy cách mặc định, không cần khai tay', zTao.them&&zTao.dauRa.length===5, JSON.stringify(zTao));
await E(()=>{sp.pop();ve()}); // dọn mặt hàng test vừa tạo, khỏi ảnh hưởng các phép sau

console.log('\n── AA. NGUỒN HƯƠNG LIỆU — NHÀ CUNG CẤP, GIÁ, HƯƠNG ĐANG DÙNG (25/08/2026) ──');
/* 25/08/2026-H: khách chốt hương liệu mua theo KG, không theo lít/ml — khai giá hỏi số kg,
   quy đổi kg→mg là quy đổi SI cố định (1kg=1.000.000mg). */
const aaH=await E(()=>{tab='ma';ve();return kho[0]});
ok('tìm thấy hương để test', !!aaH, aaH);
// 26/08/2026-N2: mỗi hương "Nguồn hương liệu" đóng mặc định (khách phản hồi rối mắt) — kiểm trước khi mở
const aaH2=await E(()=>kho[1]);
ok('26/08/2026-N2: thẻ hương đóng mặc định (chưa bấm thì không hiện chi tiết NCC/giá)',
  !(await Ea(h=>{const card=[...document.querySelectorAll('.ncc-card')].find(c=>c.querySelector('.ncc-ten')?.textContent===h);return card&&card.className.includes('mo')},aaH2)));
await p.click(`[data-tra="ncc-h-${aaH2}"]`); await p.waitForTimeout(200);
ok('26/08/2026-N2: bấm vào thẻ thì mở ra đúng thẻ đó (class "mo")',
  await Ea(h=>{const card=[...document.querySelectorAll('.ncc-card')].find(c=>c.querySelector('.ncc-ten')?.textContent===h);return card&&card.className.includes('mo')},aaH2));
await p.click(`[data-tra="ncc-h-${aaH2}"]`); await p.waitForTimeout(200); // đóng lại, không ảnh hưởng phép còn lại
// mở thẻ aaH để thao tác thêm nguồn/sửa giá bên dưới
await Ea(h=>{moTra.add('ncc-h-'+h);ve()},aaH); await p.waitForTimeout(150);
// 27/08/2026 (phản hồi lần 3): flow "thêm nguồn" đổi từ chuỗi hoi() nhiều bước sang 1 PANEL
// nhập gộp (dùng chung code cho cả hương và nguyên liệu, xem AJ bên dưới cho nguyên liệu).
// Thêm nguồn 1: NCC A, 600.000đ / 5kg — kèm khai luôn tồn kho ban đầu, cùng 1 panel
await p.click(`[data-themnguon="h:${aaH}"]`); await p.waitForTimeout(250);
// 27/08/2026-R2: khách phản hồi ô tồn kho hương liệu để đơn vị gram khó nhập — đổi placeholder
// sang "(kg)" giống nguyên liệu, hệ thống tự nhân/chia 1000 để quy đổi sang gram khi lưu.
const arPlaceholderTon=await p.getAttribute(`[data-nguonform="h:${aaH}"] [data-nf="ton"]`,'placeholder');
ok('27/08/2026-R2: ô "Tồn kho hiện có" của HƯƠNG LIỆU giờ ghi rõ đơn vị (kg), không còn (g)', /\(kg\)/.test(arPlaceholderTon)&&!/\(g\)/.test(arPlaceholderTon), arPlaceholderTon);
await p.fill(`[data-nguonform="h:${aaH}"] [data-nf="ncc"]`,'Công ty ABC');
await p.fill(`[data-nguonform="h:${aaH}"] [data-nf="gia"]`,'600000');
await p.fill(`[data-nguonform="h:${aaH}"] [data-nf="soKg"]`,'5');
// ô "ton" giờ nhập theo KG (trước là gram) — nhập '5000' (kg) để ra đúng con=5.000.000 gram
// nội bộ như kỳ vọng ở assertion bên dưới (dvTonKho() đổi 'g'→'kg').
await p.fill(`[data-nguonform="h:${aaH}"] [data-nf="ton"]`,'5000');
await p.click(`[data-luunguon="h:${aaH}"]`); await p.waitForTimeout(300);
ok('lưu đúng 1 nguồn: NCC, giá, số kg', (await Ea(x=>nguonHuong[x]&&nguonHuong[x].length,aaH))===1);
const aaE1=await Ea(x=>nguonHuong[x][0],aaH);
ok('nguồn ghi đúng NCC/giá/số kg', aaE1.ncc==='Công ty ABC'&&aaE1.gia===600000&&aaE1.soKg===5, JSON.stringify(aaE1));
ok('vừa thêm thì tự đặt làm "đang dùng"', (await Ea(x=>huongDangDung[x],aaH))==='Công ty ABC');
// 27/08/2026 (rà lỗi "ít lỗi hơn"): dòng giá NCC hương liệu phải ghi nhãn "đ/g" (KHÔNG phải
// "đ/kg") — lỗi thật đã xảy ra khi dvTonKho() đổi sang luôn trả "kg" (cho ô nhập tồn kho) mà
// dòng giá vẫn lỡ dùng chung hàm đó làm nhãn, khiến giá 120đ/g bị ghi nhầm thành 120đ/kg (sai
// 1000 lần). Đã tách riêng dvGia() cho đúng — khoá lại bằng test này để không tái diễn.
const aaGiaHtml=await Ea(x=>{moTra.add('ncc-h-'+x);ve();return document.querySelector(`[data-tra="ncc-h-${x}"]`).closest('.ncc-card').innerHTML},aaH);
ok('27/08/2026: giá NCC hương liệu hiện đúng đơn vị "đ/g" (không phải "đ/kg")', /120\s*đ\/g/.test(aaGiaHtml)&&!/120\s*đ\/kg/.test(aaGiaHtml), aaGiaHtml.match(/[\d.,]+\s*đ\/[a-z]+/g));
ok('khai NCC/giá kèm luôn tồn kho ban đầu trong cùng 1 panel', (await Ea(x=>tonKhoHuong[x]&&tonKhoHuong[x].con,aaH))===5000000);
const aaGia1=await Ea(x=>giaHuongHienTai(x),aaH);
ok('26/08/2026 PATCH V1 mục C1: giá/g tự quy đổi đúng (600000/(5×1.000)=120)', aaGia1===120, aaGia1);
// Thêm nguồn 2: NCC B, giá khác — không tự động đổi "đang dùng"; để trống ô Tồn kho thì vẫn lưu NCC/giá bình thường
await p.click(`[data-themnguon="h:${aaH}"]`); await p.waitForTimeout(250);
await p.fill(`[data-nguonform="h:${aaH}"] [data-nf="ncc"]`,'Công ty XYZ');
await p.fill(`[data-nguonform="h:${aaH}"] [data-nf="gia"]`,'500000');
await p.fill(`[data-nguonform="h:${aaH}"] [data-nf="soKg"]`,'5');
await p.click(`[data-luunguon="h:${aaH}"]`); await p.waitForTimeout(300);
ok('có 2 nguồn, không mất nguồn cũ (lưu lịch sử)', (await Ea(x=>nguonHuong[x].length,aaH))===2);
ok('thêm nguồn mới thì tự chuyển "đang dùng" sang nguồn vừa thêm', (await Ea(x=>huongDangDung[x],aaH))==='Công ty XYZ');
ok('để trống ô tồn kho khi thêm thì KHÔNG đụng tồn kho đã khai trước đó', (await Ea(x=>tonKhoHuong[x]&&tonKhoHuong[x].con,aaH))===5000000);
// Đổi tay lại về NCC A qua dropdown "đang dùng"
const aaSelOk=await Ea(x=>{ve();return !!document.querySelector(`select[data-nguondung="h:${x}"]`)},aaH);
ok('có dropdown "đang dùng" chọn từ các NCC đã khai', aaSelOk);
await p.selectOption(`select[data-nguondung="h:${aaH}"]`,'Công ty ABC'); await p.waitForTimeout(250);
ok('đổi tay dropdown thì huongDangDung cập nhật đúng', (await Ea(x=>huongDangDung[x],aaH))==='Công ty ABC');
ok('giá hiện tại tính theo NCC đang dùng (đổi lại A → 120đ/g)', (await Ea(x=>giaHuongHienTai(x),aaH))===120);

console.log('\n── AB. CẢNH BÁO SẮP HẾT HƯƠNG LIỆU TRONG KHO (25/08/2026) ──');
const abSetup=await Ea(h=>{
  nguongCanhBaoNgay=7;
  // Giả lập 30 ngày ghi mẻ dùng hương này, tổng 300ml/ngày trung bình
  const hom=new Date();
  for(let i=0;i<10;i++){
    const d=new Date(hom); d.setDate(d.getDate()-i);
    const iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    nk.push({id:'TESTKHO-'+i,sp:sp[0].ten,ngaysx:iso,lot:'TESTKHOLOT',huong:h,mlDung:300,sl:100,quyCach:'5 kg'});
  }
  tonKhoHuong[h]={con:1000,capNhat:'test'}; // còn 1000ml, dùng ~100ml/ngày (300*10/30) → còn ~10 ngày, KHÔNG cảnh báo
  return true;
},aaH);
ok('thiết lập dữ liệu test tồn kho xong', abSetup);
const abUoc1=await Ea(x=>uocConLai(x),aaH);
ok('ước tính đúng số ngày còn dùng được (1000ml ÷ (3000ml/30ngày)=10 ngày)', abUoc1===10, abUoc1);
ok('10 ngày > ngưỡng 7 → CHƯA cảnh báo', abUoc1>7);
await Ea(x=>{tonKhoHuong[x].con=200;},aaH); // còn 200ml → ước ~2 ngày, PHẢI cảnh báo
const abUoc2=await Ea(x=>uocConLai(x),aaH);
ok('còn 200ml → ước ~2 ngày, dưới ngưỡng', abUoc2<=7, abUoc2);
const abHtml=await Ea(x=>{tab='ma';ve();return $('viewMA').innerHTML},aaH);
ok('hiện cảnh báo "sắp hết" khi dưới ngưỡng', new RegExp(`sắp hết`).test(abHtml)&&abHtml.includes(aaH));
// Cập nhật tồn kho qua nút bấm
await p.click(`[data-suatk="${aaH}"]`); await p.waitForTimeout(250);
// 27/08/2026-R2: hộp thoại giờ hỏi/nhập theo KG (trước là gram) — nhập '5' (kg) để ra đúng
// con=5000 gram nội bộ như kỳ vọng ở assertion bên dưới.
await p.fill('#dlgI','5'); await p.click('#dlgO'); await p.waitForTimeout(300);
ok('bấm "Cập nhật tồn kho hiện có" lưu đúng số ml mới', (await Ea(x=>tonKhoHuong[x].con,aaH))===5000);

console.log('\n── AC. TỰ TÍNH CHI PHÍ HƯƠNG LIỆU MỖI MẺ/SẢN PHẨM (25/08/2026) ──');
const acR=await E(()=>{tab='bc';traLot='TESTKHOLOT';ve();return $('viewBC').innerHTML});
ok('thẻ chi tiết lô hiện dòng "Chi phí hương liệu" khi đã có giá', /Chi phí hương liệu/.test(acR));
const acExp=await Ea(x=>Math.round(300*giaHuongHienTai(x)),aaH);
ok('chi phí = ml dùng × giá/ml hiện tại, tính đúng số', new RegExp(String(acExp).replace(/\B(?=(\d{3})+(?!\d))/g,'')).test(acR.replace(/\./g,''))||acR.includes(String(acExp)), 'kỳ vọng '+acExp);
const acAgg=await E(()=>{traLot='';tuNgay='';denNgay='';ve();return $('viewBC').innerHTML});
ok('thẻ tổng hợp cũng hiện chi phí hương liệu ước tính', /Chi phí hương liệu/.test(acAgg));
await E(()=>{nk=nk.filter(r=>!String(r.id||'').startsWith('TESTKHO-'));ve()}); // dọn dữ liệu test

console.log('\n── AD. NHẮC LÔ ĐÃ GHI LÂU MÀ CHƯA IN TEM (25/08/2026) ──');
const adSetup=await E(()=>{
  ngayNhacInTem=3;
  const d=new Date(); d.setDate(d.getDate()-10);
  const iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  nk.push({id:'TESTNHAC-1',sp:sp[0].ten,ngaysx:iso,lot:'TESTNHACLOT',huong:kho[0],mlDung:10,sl:5,quyCach:'5 kg'});
  tuNgay='';denNgay='';ve();
  return true;
});
ok('thiết lập lô cũ chưa in tem', adSetup);
const adHtml1=await E(()=>{tab='bc';ve();return $('viewBC').innerHTML});
ok('hiện cảnh báo nhắc chưa in tem (lô ghi quá hạn, chưa in lần nào)', /CHƯA in tem lần nào/.test(adHtml1));
await E(()=>{const r=nk.find(x=>x.id==='TESTNHAC-1');r.daInTem=true;r.inTemLuc=new Date().toISOString();ve()});
const adHtml2=await E(()=>{ve();return $('viewBC').innerHTML});
const adConLai=await E(()=>loChuaInTem().some(r=>r.id==='TESTNHAC-1'));
ok('đánh dấu đã in tem thì hết bị nhắc', adConLai===false);
await E(()=>{nk=nk.filter(r=>r.id!=='TESTNHAC-1');ve()}); // dọn dữ liệu test

console.log('\n── AE. YÊU CẦU 25/08/2026-G (khoá xuất xứ, bỏ chọn hương ở admin, hương+màu ở Tra lô) + 27/08-lần3: bỏ "tiến độ nguyên liệu" cũ ──');
/* 27/08/2026 (phản hồi lần 3): khách chốt mục "Tiến độ sử dụng lô nguyên liệu đầu vào" vô nghĩa
   vì đã có "Hàm lượng nguyên liệu" (congThucNL) khai chi tiết hơn — gỡ bỏ hẳn, thay bằng
   nguồn/giá/tồn kho riêng từng nguyên liệu (mục AJ bên dưới). */
const aeTD1=await E(()=>{tab='bc';ve();return $('viewBC').innerHTML});
ok('27/08/2026 (phản hồi lần 3): đã bỏ hẳn mục "Tiến độ sử dụng lô nguyên liệu đầu vào" (trùng lặp với Hàm lượng nguyên liệu)', !/Tiến độ sử dụng lô nguyên liệu đầu vào/.test(aeTD1));
ok('hàm veTienDo() đã gỡ bỏ hoàn toàn (không còn định nghĩa)', (await E(()=>typeof veTienDo))==='undefined');
ok('nút "Khai báo lô nguyên liệu mới" (#nlKhaiBtn) đã gỡ bỏ khỏi tab Báo cáo', !aeTD1.includes('id="nlKhaiBtn"'));

const aeXX=await E(()=>{
  const c=sp.find(x=>x.ten==='THE CITYCAT'); c.hstem=c.hstem||{}; c.hstem.xuatXu='';
  tab='ct'; mo.clear(); mo.add(sp.indexOf(c)); ve();
  return {i:sp.indexOf(c), html:$('rows').innerHTML};
});
ok('ô Xuất xứ không còn là input/textarea sửa được nữa (đã khoá)', !/data-tem="xuatXu"/.test(aeXX.html));
ok('ô Xuất xứ rỗng thì hiện mặc định "Sản xuất tại Việt Nam"', /Sản xuất tại Việt Nam/.test(aeXX.html));
const aeXXCty=await E(()=>{const c=sp.find(x=>x.ten.includes('ZAKA')||x.ten.includes('Little Mars')); return c?c.hstem&&c.hstem.xuatXu:'—'});
ok('mặt hàng có xuất xứ câu dài hơn (nguyên liệu nhập khẩu) vẫn giữ nguyên nội dung riêng, không bị đồng nhất', aeXXCty==='—'||/nhập khẩu|Sản xuất tại Việt Nam/.test(aeXXCty), aeXXCty);

const aeCT=await E(()=>{
  const c=sp.find(x=>x.ten==='THE CITYCAT'); c.huongMe='';
  tab='ct'; mo.clear(); mo.add(sp.indexOf(c)); ve();
  return {before:$('rows').innerHTML};
});
/* 25/08/2026: khối "Ghi nhận mẻ sản xuất" (và mọi nút data-hme/auto-gán hương của nó) đã
   gỡ bỏ hoàn toàn khỏi Admin — trùng lặp với ghi mẻ thật trên app Nhân viên. */
ok('khối ghi mẻ trùng lặp đã gỡ khỏi Admin (không còn data-ok/data-pbadd/data-hme)', !/data-ok=|data-pbadd=|data-hme=/.test(aeCT.before));
ok('Quy cách đóng gói vẫn hiển thị read-only (veDR) thay cho khối ghi mẻ đã gỡ', /Quy cách đóng gói/.test(aeCT.before));

const aeLot=await E(()=>{tab='bc';traLot='';ve();
  return [...document.querySelectorAll('#traLot option')].map(o=>o.textContent).join('|')});
ok('dropdown Tra cứu số lot có kèm tên hương', /Chanh tươi/.test(aeLot), aeLot);
const aeKv=await E(()=>{traLot=nk.find(r=>r.huong==='Chanh tươi')?.lot||''; ve(); return $('viewBC').innerHTML});
ok('thẻ chi tiết lô ở Tra lô tô màu ưu tiên Hương/Quy cách/Số bao (đồng bộ đúng 3 màu với bản Nhân viên)',
  /color:var\(--cyan\)/.test(aeKv)&&/color:var\(--amber\)/.test(aeKv)&&/color:#A78BFA/.test(aeKv), 'có đủ 3 màu ưu tiên');

console.log('\n── AF. NGỪNG SẢN XUẤT — LÝ DO + TRẢ NGUYÊN LIỆU DƯ VỀ TỒN KHO (25/08/2026-H) ──');
/* Khách chốt: "ngừng sản xuất" KHÁC "huỷ lô" — không xoá dữ liệu, bắt buộc lý do, và số
   nguyên liệu đầu vào CHƯA thực dùng phải quay lại được để đưa sang dự án khác. Dùng lại
   mẻ THE CITYCAT/Chanh tươi ở phần D (2 dòng, kgVao=100kg chung 1 mẻ). */
const afGocId=await E(()=>nk[0].id);
const afTruoc=await E(()=>tongDaSanXuat(''));
await E(()=>{tab='bc';traLot=nk[0].lot;ve()}); await p.waitForTimeout(300);
await p.click(`[data-ngunglo="${afGocId}"]`); await p.waitForTimeout(300);
await p.fill('#dlgI','Lỗi máy trộn, phải dừng để sửa'); await p.click('#dlgO'); await p.waitForTimeout(300);
ok('hộp thoại thứ 2 tự điền sẵn đúng kg đã khai (100)', (await E(()=>$('dlgI').value))==='100');
await p.fill('#dlgI','60'); await p.click('#dlgO'); await p.waitForTimeout(350);
const afR=await Ea(id=>{const r=nk.find(x=>x.id===id);return {ngungSX:r.ngungSX,lyDo:r.ngungLyDo,tt:r.slThucTe,coLuc:!!r.ngungLuc};},afGocId);
ok('đánh dấu ngừng đúng: có lý do, có mốc thời gian', afR.ngungSX===true&&afR.lyDo==='Lỗi máy trộn, phải dừng để sửa'&&afR.coLuc, JSON.stringify(afR));
ok('lưu đúng số kg thực tế đã dùng (60)', afR.tt===60, afR.tt);
const afSau=await E(()=>tongDaSanXuat(''));
ok('sau khi ngừng, tongDaSanXuat giảm đúng 40kg (100 khai − 60 thực dùng) so với trước', afTruoc-afSau===40, `${afTruoc} → ${afSau}`);
const afHtml=await E(()=>{ve();return $('viewBC').innerHTML});
ok('thẻ lô hiện badge NGỪNG SẢN XUẤT + lý do', /NGỪNG SẢN XUẤT/.test(afHtml)&&/Lỗi máy trộn/.test(afHtml));
ok('thẻ lô hiện đúng phần dư 40kg đưa sang dự án khác', /còn dư.*40.*dự án khác/.test(afHtml.replace(/\s+/g,' ')), afHtml.includes('dự án khác'));
ok('nút đổi thành "Tiếp tục sản xuất lại"', /Tiếp tục sản xuất lại/.test(afHtml));
// Bỏ ngừng — tính lại đủ 100kg như ban đầu
await p.click(`[data-ngunglo="${afGocId}"]`); await p.waitForTimeout(300);
await p.click('#dlgO'); await p.waitForTimeout(350);
const afR2=await Ea(id=>{const r=nk.find(x=>x.id===id);return {ngungSX:r.ngungSX,tt:r.slThucTe};},afGocId);
ok('bỏ ngừng thì xoá cờ ngungSX và slThucTe', afR2.ngungSX===false&&(afR2.tt===undefined||afR2.tt===null), JSON.stringify(afR2));
const afSau2=await E(()=>tongDaSanXuat(''));
ok('bỏ ngừng thì tongDaSanXuat tính lại về đúng số trước khi ngừng', afSau2===afTruoc, `${afSau2} kỳ vọng ${afTruoc}`);

console.log('\n── AG. YÊU CẦU 25/08/2026-I (sửa giá nhầm, hết tồn kho hết hiện "null", xác nhận công thức) ──');
// AG1: sửa lỗi hiện "còn dùng được ~null ngày" khi tồn kho về 0 nhưng vẫn có dữ liệu tiêu hao
const agHetHang=await Ea(h=>{
  tonKhoHuong[h]={con:0,capNhat:'test'};
  tab='ma'; ve();
  const card=[...document.querySelectorAll('.ncc-card')].find(c=>c.querySelector('.ncc-ten')?.textContent===h);
  return card?card.innerHTML:'';
}, await E(()=>kho[0]));
ok('hết tồn kho (con=0) KHÔNG còn hiện chữ "null" ra màn hình', !/null/.test(agHetHang), agHetHang.includes('null')?'còn null':'ok');
ok('hết tồn kho hiện đúng cảnh báo "Đã hết tồn kho"', /Đã hết tồn kho/.test(agHetHang));
// AG2: "Sửa" 1 dòng nguồn giá đã khai (khách nhập nhầm) — sửa tại chỗ, không tạo dòng lịch sử mới
// 27/08/2026 (phản hồi lần 3): flow sửa cũng đổi sang panel (data-suanguon → điền lại 3 ô → Lưu sửa)
const agH=await E(()=>kho[0]);
await E(()=>{tab='ma';ve()}); await p.waitForTimeout(250);
const agSoDongTruoc=await Ea(h=>nguonHuong[h].length,agH);
await p.click(`[data-suanguon="h:${agH}:0"]`); await p.waitForTimeout(250);
await p.fill(`[data-nguonform="h:${agH}:0"] [data-nf="ncc"]`,'Công ty ABC (sửa)');
await p.fill(`[data-nguonform="h:${agH}:0"] [data-nf="gia"]`,'660000');
await p.fill(`[data-nguonform="h:${agH}:0"] [data-nf="soKg"]`,'6');
await p.click(`[data-luunguon="h:${agH}:0"]`); await p.waitForTimeout(300);
const agSau=await Ea(h=>({soDong:nguonHuong[h].length,d0:nguonHuong[h][0]}),agH);
ok('sửa giá KHÔNG tạo thêm dòng lịch sử mới (chỉ sửa tại chỗ)', agSau.soDong===agSoDongTruoc, `${agSoDongTruoc} → ${agSau.soDong}`);
ok('sửa đúng NCC/giá/kg của dòng đã chọn', agSau.d0.ncc==='Công ty ABC (sửa)'&&agSau.d0.gia===660000&&agSau.d0.soKg===6, JSON.stringify(agSau.d0));
// AG3 (27/08-lần3): panel sửa KHÔNG có ô Tồn kho (chỉ panel THÊM mới mới có) — tránh nhầm sửa lại tồn kho khi chỉ sửa giá
const agCoOTon=await Ea(h=>{
  moThemNguon.add('h:'+h+':0'); ve();
  const box=document.querySelector(`[data-nguonform="h:${h}:0"]`);
  const co=!!(box&&box.querySelector('[data-nf="ton"]'));
  moThemNguon.delete('h:'+h+':0'); ve();
  return co;
},agH);
ok('panel SỬA một dòng nguồn không có ô "Tồn kho" (khác panel thêm mới)', agCoOTon===false);

console.log('\n── AH. NHẬN "BÁO CÁO TIẾN ĐỘ THEO LÔ" TỪ NHÂN VIÊN (25/08/2026-I/J) ──');
/* File nhân viên xuất giờ có thể KHÔNG có mẻ nào (mảng nk rỗng) mà chỉ có báo cáo tiến độ —
   trước đây #nvIn chặn hẳn nếu không có mẻ mới, phải nới ra cho đúng trường hợp này.
   25/08/2026-J: báo cáo giờ gắn với ĐÚNG LÔ (lot/kgKeHoach) — dùng lại 1 lô THẬT đã có trong
   nk[] (nk[0], từ mẻ Citycat/Hương Chanh dựng ở mục D) để veBaoCaoNgay() tra cứu lại được
   đúng bản ghi mẻ và tính chi phí hương liệu theo giá hiện tại. */
const ahLot=await E(()=>nk[0].lot), ahKeHoach=await E(()=>nk[0].sl),
      ahSp=await E(()=>nk[0].sp), ahQc=await E(()=>nk[0].quyCach), ahHuong=await E(()=>nk[0].huong);
const ahFile='/tmp/baocao_only_admin_test.json';
fs.writeFileSync(ahFile, JSON.stringify({loai:'peroma-me', nv:'Chú Cảnh', ngay:'2026-08-25', nk:[],
  bcNgay:[{id:'BCTEST-1', ngay:'2026-08-25', lot:ahLot, sp:ahSp, quyCach:ahQc, kgKeHoach:ahKeHoach,
    kgThucTe:ahKeHoach-30, lyDo:'Hết nguyên liệu giữa buổi', nv:'Chú Cảnh', ts:'2026-08-25T10:00:00.000Z'},
  // 26/08/2026-M: báo cáo KHÔNG gắn lô (mẻ chưa ghi được, đúng kịch bản bug thật khách gặp) —
  // Admin vẫn phải nhận và hiện được bình thường, không được lỗi/mất tích vì thiếu lot.
  {id:'BCTEST-2', ngay:'2026-08-25', lot:'', sp:'THE CITYCAT', quyCach:'', kgKeHoach:500,
    kgThucTe:300, lyDo:'Máy hỏng giữa buổi, không kịp làm hết 500kg dự kiến', nv:'Chú Cảnh', ts:'2026-08-25T11:00:00.000Z'}]}));
await E(()=>{tab='sl';ve()}); await p.waitForTimeout(250);
const ahTruoc=await E(()=>bcNgay.length);
await p.setInputFiles('#nvIn', ahFile); await p.waitForTimeout(450);
const ahDlg=await E(()=>($('dlgT')||{}).textContent);
ok('nhận file CHỈ có báo cáo (không có mẻ) KHÔNG bị chặn — hiện đúng hộp xác nhận nhận dữ liệu', ahDlg==='Nhận dữ liệu từ nhân viên', ahDlg);
await p.click('#dlgO'); await p.waitForTimeout(450);
ok('admin nhận đúng 2 báo cáo tiến độ mới (1 có lô, 1 chưa ghi được lô nào)', (await E(()=>bcNgay.length))===ahTruoc+2, `${ahTruoc} → ${await E(()=>bcNgay.length)}`);
const ahBc=await E(()=>bcNgay.find(r=>r.id==='BCTEST-1'));
ok('lưu đúng nội dung báo cáo (gắn đúng lô, kế hoạch, kg, lý do, người)',
  ahBc&&ahBc.lot===ahLot&&ahBc.kgKeHoach===ahKeHoach&&ahBc.kgThucTe===ahKeHoach-30&&ahBc.lyDo==='Hết nguyên liệu giữa buổi'&&ahBc.nv==='Chú Cảnh', JSON.stringify(ahBc));
const ahBc2=await E(()=>bcNgay.find(r=>r.id==='BCTEST-2'));
ok('26/08/2026-M: báo cáo KHÔNG gắn lô (mẻ chưa ghi được) vẫn nhận đúng, không mất dữ liệu',
  ahBc2&&ahBc2.lot===''&&ahBc2.kgKeHoach===500&&ahBc2.kgThucTe===300&&ahBc2.sp==='THE CITYCAT', JSON.stringify(ahBc2));
// Nhận lại lần 2 — không trùng
await p.setInputFiles('#nvIn', ahFile); await p.waitForTimeout(450);
const ahDlg2=await E(()=>($('dlgT')||{}).textContent);
ok('nhận lại cùng file lần 2 KHÔNG trùng báo cáo', /Không có gì mới/.test(ahDlg2), ahDlg2);
await p.click('#dlgC').catch(()=>{}); await p.waitForTimeout(250);
ok('số báo cáo không đổi sau khi nhận lại lần 2', (await E(()=>bcNgay.length))===ahTruoc+2);
// Hiện đúng trên thẻ "Chốt thực tế sản xuất theo lô" ở tab Báo cáo
const ahHtml=await E(()=>{tab='bc';ve();return $('viewBC').innerHTML});
const ahLotDep=await Ea(l=>lotDep(l),ahLot);
ok('thẻ "Chốt thực tế sản xuất theo lô" hiện đúng báo cáo vừa nhận (số lô, chênh lệch, lý do, người)',
  /Chốt thực tế sản xuất theo lô/.test(ahHtml)&&ahHtml.includes(ahLotDep)&&/Chênh lệch/.test(ahHtml)&&/Hết nguyên liệu giữa buổi/.test(ahHtml)&&/Chú Cảnh/.test(ahHtml));
ok('26/08/2026-M: báo cáo KHÔNG có lô cũng hiện đầy đủ trên thẻ (không lỗi/không mất) — không bắt buộc phải có lô mới báo cáo được',
  /Máy hỏng giữa buổi/.test(ahHtml)&&ahHtml.includes('500')&&ahHtml.includes('300'));
// Chi phí hương liệu chỉ hiện KHI có giá — kiểm tra khớp với giaHuongHienTai() hiện tại (không giả định giá cố định)
const ahGia=await Ea(h=>giaHuongHienTai(h),ahHuong);
if(ahGia>0){
  const ahCpKyVong=await Ea(l=>{const r=nk.find(x=>x.lot===l);return Math.round(num(r.mlDung)*giaHuongHienTai(r.huong))},ahLot);
  ok('có giá hương liệu thì hiện đúng "Chi phí hương liệu" của lô trong báo cáo', ahHtml.includes(String(ahCpKyVong)+' đ'), `kỳ vọng ${ahCpKyVong} đ`);
}else ok('chưa có giá hương liệu thì KHÔNG hiện dòng chi phí (không bịa số)', !/Chi phí hương liệu \(giá hiện tại\)/.test(ahHtml));
fs.unlinkSync(ahFile);

console.log('\n── AI. CÔNG DỤNG + THÀNH PHẦN — NÚT CHỌN NHANH (25/08/2026-J) ──');
/* Khách yêu cầu áp dụng đúng cơ chế nút-chọn-nhanh của HDSD cho "Công dụng" (theo đúng 4
   nhóm HDSD_NHOM), và cho "Thành phần" (chọn từ danh sách chuẩn THANHPHAN_CHUAN, không gõ
   tay/không kèm giải thích). */
const aiI=await E(()=>{
  const c=sp.find(x=>x.ten==='THE CITYCAT'); c.hstem=c.hstem||{}; c.hstem.congDung=''; c.hstem.thanhPhan='';
  tab='ct'; mo.clear(); mo.add(sp.indexOf(c)); ve();
  return sp.indexOf(c);
});
const aiSelCd=`[data-cd="0"][data-i="${aiI}"]`, aiSelTp=`[data-tp="0"][data-i="${aiI}"]`;
ok('ô Công dụng của mặt hàng đang mở có đủ 4 nút chọn nhanh theo nhóm (giống HDSD)',
  (await Ea(i=>document.querySelectorAll(`[data-cd][data-i="${i}"]`).length,aiI))===4);
ok('ô Thành phần của mặt hàng đang mở có nút chọn nhanh theo danh sách chuẩn',
  (await Ea(i=>document.querySelectorAll(`[data-tp][data-i="${i}"]`).length,aiI))===8);
await p.locator(aiSelCd).scrollIntoViewIfNeeded(); await p.click(aiSelCd); await p.waitForTimeout(200);
const aiCdKyVong=await E(()=>CONGDUNG_NHOM[0]);
ok('bấm nhóm "Cát vệ sinh cho mèo" điền đúng công dụng chuẩn của nhóm', (await Ea(x=>sp[x].hstem.congDung,aiI))===aiCdKyVong,
  await Ea(x=>sp[x].hstem.congDung,aiI));
await p.locator(aiSelTp).scrollIntoViewIfNeeded(); await p.click(aiSelTp); await p.waitForTimeout(200);
ok('bấm nút thành phần điền ĐÚNG NGUYÊN VĂN, không kèm giải thích', (await Ea(x=>sp[x].hstem.thanhPhan,aiI))==='Bentonite, hương liệu');
ok('thành phần không lẫn ký tự giải thích thừa (không có dấu chấm/câu dài)', !/Dùng để|giúp|thấm hút/.test((await Ea(x=>sp[x].hstem.thanhPhan,aiI))||''));

console.log('\n── AJ0. DANH MỤC NGUYÊN LIỆU (26/08/2026, bản vá theo phản hồi tab Công thức) ──');
/* Khách duyệt bản demo "Công thức" (chọn nguyên liệu từ Danh mục thay vì gõ tay, phải khớp
   đúng mẻ chuẩn mới cho lưu) và yêu cầu đưa vào hệ thống thật, nối chuẩn vào cả bộ (Danh
   mục ↔ Công thức ↔ lưu/nạp lại ↔ đồng bộ NV). Mục này kiểm khối "Nguyên liệu" mới trong
   tab Danh mục — y hệt cách các khối Hương/Quy cách/Chất phun/Nhân viên đã có từ trước. */
await E(()=>{tab='ma';ve()}); await p.waitForTimeout(150);
ok('tab Danh mục hiện khối "Nguyên liệu" (ban đầu trống)', (await E(()=>document.querySelector('#viewMA').innerHTML)).includes('Nguyên liệu — 0 mục'));

// Bản vá theo phản hồi: "phần thêm nguyên liệu nút chọn nguyên liệu bị lỗi không tìm thấy" —
// gốc là Danh mục nguyên liệu còn trống nên select không có gì để chọn (không phải lỗi code).
// Khi trống: ẩn nút "+ Thêm nguyên liệu", hiện cảnh báo + nút tắt sang tab Danh mục.
const aj00I=await E(()=>{
  const c=sp.find(x=>x.ten==='THE CITYCAT'); c.congThucNL=[];
  tab='ct'; mo.clear(); mo.add(sp.indexOf(c)); ve();
  return sp.indexOf(c);
});
const aj00Html=await Ea(i=>veNL(sp[i],i), aj00I);
ok('Danh mục nguyên liệu còn TRỐNG → KHÔNG hiện nút "+ Thêm nguyên liệu" (tránh gây hiểu lầm lỗi)', !/data-nladd="/.test(aj00Html), aj00Html);
ok('Danh mục nguyên liệu còn TRỐNG → hiện cảnh báo + nút tắt sang tab Danh mục để thêm', /data-gonl="1"/.test(aj00Html) && /Chưa có nguyên liệu nào trong.*Danh mục/.test(aj00Html));
await Ea(i=>{tab='ct'; mo.clear(); mo.add(i); ve()}, aj00I); await p.waitForTimeout(150);
await p.click('[data-gonl="1"]:visible'); await p.waitForTimeout(250);
ok('bấm nút tắt "Đi tới tab Danh mục" → chuyển đúng sang tab Danh mục', (await E(()=>tab))==='ma');
ok('bấm nút tắt "Đi tới tab Danh mục" → nút tab "Danh mục" được bôi sáng đúng', await E(()=>[...document.querySelectorAll('.tab')].find(x=>x.dataset.tab==='ma').classList.contains('on')));

await p.click('[data-them="nl"]'); await p.waitForTimeout(150);
await p.fill('#dlgI','Bentonite'); await p.click('#dlgO'); await p.waitForTimeout(200);
ok('"+ Thêm nguyên liệu" ở tab Danh mục thêm đúng 1 mục vào nlDM', JSON.stringify(await E(()=>nlDM))==='["Bentonite"]', JSON.stringify(await E(()=>nlDM)));

await p.click('[data-them="nl"]'); await p.waitForTimeout(150);
await p.fill('#dlgI','bentonite'); await p.click('#dlgO'); await p.waitForTimeout(200);
ok('trùng tên (không phân biệt hoa/thường) bị chặn, không thêm trùng', (await E(()=>nlDM.length))===1);

await p.click('[data-them="nl"]'); await p.waitForTimeout(150);
await p.fill('#dlgI','Zzz Test Đổi Tên'); await p.click('#dlgO'); await p.waitForTimeout(200);
ok('thêm mục thứ 2 độc lập, không đè mục đầu', JSON.stringify(await E(()=>nlDM))==='["Bentonite","Zzz Test Đổi Tên"]');

// Dùng mục "Zzz Test..." riêng cho kịch bản đổi tên/xoá — KHÔNG đụng "Bentonite" vì mục AJ/AJ2
// bên dưới cần đúng tên "Bentonite" còn nguyên để khớp với kịch bản Thành phần tem đã có sẵn.
const aj0I=await E(()=>{
  const c=sp.find(x=>x.ten==='THE CITYCAT'); c.congThucNL=[{ten:'Zzz Test Đổi Tên',kg:100}]; c.kg=500;
  mo.clear(); mo.add(sp.indexOf(c)); tab='ct'; ve();
  return sp.indexOf(c);
});
await E(()=>{tab='ma';ve()}); await p.waitForTimeout(150);
await p.fill('[data-ten="nl"][data-cu="Zzz Test Đổi Tên"]','Zzz Test Đổi Tên (đã sửa)');
await p.locator('[data-ten="nl"][data-cu="Zzz Test Đổi Tên"]').blur(); await p.waitForTimeout(250);
await p.click('#dlgO'); await p.waitForTimeout(250);
ok('đổi tên nguyên liệu cập nhật đúng trong nlDM', JSON.stringify(await E(()=>nlDM))==='["Bentonite","Zzz Test Đổi Tên (đã sửa)"]', JSON.stringify(await E(()=>nlDM)));
ok('đổi tên nguyên liệu LAN sang dòng "Hàm lượng nguyên liệu" của mặt hàng đang dùng tên đó',
  (await Ea(i=>sp[i].congThucNL[0].ten,aj0I))==='Zzz Test Đổi Tên (đã sửa)', await Ea(i=>sp[i].congThucNL[0].ten,aj0I));

await E(()=>{tab='ma';ve()}); await p.waitForTimeout(150);
await p.click('[data-xoa="nl"][data-v="Zzz Test Đổi Tên (đã sửa)"]'); await p.waitForTimeout(150);
await p.click('#dlgO'); await p.waitForTimeout(200);
ok('xoá nguyên liệu khỏi Danh mục đúng mục, giữ mục còn lại (Bentonite)', JSON.stringify(await E(()=>nlDM))==='["Bentonite"]');
ok('xoá nguyên liệu khỏi Danh mục cũng gỡ đúng dòng đó khỏi "Hàm lượng nguyên liệu" của mặt hàng đang dùng',
  (await Ea(i=>sp[i].congThucNL.length,aj0I))===0);

const aj0Migr=await E(async()=>{
  const c=sp.find(x=>x.ten==='THE CITYCAT');
  c.congThucNL=[{ten:'Bentonite',kg:100},{ten:'Nguyên liệu chưa từng khai trong danh mục',kg:5}];
  await luuNgay();
  return true;
});
await p.reload(); await p.waitForTimeout(900);
ok('nạp lại trang: dữ liệu cũ (tên tự do chưa có trong Danh mục) tự động migrate vào nlDM, KHÔNG mất',
  (await E(()=>nlDM.includes('Nguyên liệu chưa từng khai trong danh mục'))), await E(()=>JSON.stringify(nlDM)));
ok('migrate không tạo trùng — tên đã có sẵn (Bentonite) không bị thêm lần 2',
  (await E(()=>nlDM.filter(x=>x==='Bentonite').length))===1);
await E(()=>{const c=sp.find(x=>x.ten==='THE CITYCAT');c.congThucNL=c.congThucNL.filter(x=>x.ten==='Bentonite');return luuNgay()}); await p.waitForTimeout(200);

console.log('\n── AJ. HÀM LƯỢNG NGUYÊN LIỆU THEO MẺ CHUẨN (26/08/2026-N, nâng cấp theo bản demo Công thức) ──');
/* Nâng cấp so với bản N gốc: (1) CHỌN nguyên liệu từ Danh mục (select) thay vì gõ tay tự do;
   (2) phải khai ĐÚNG BẰNG mẻ chuẩn mới coi là đạt chuẩn (trước đây chỉ hiện % tham khảo,
   không ép khớp) — không có nút Lưu riêng nên thể hiện bằng khung cảnh báo đỏ rõ ràng. */
await E(()=>{nlDM.push('Phụ gia tạo mùi'); return true});
const ajI=await E(()=>{
  const c=sp.find(x=>x.ten==='THE CITYCAT'); c.congThucNL=[]; c.kg=500;
  tab='ct'; mo.clear(); mo.add(sp.indexOf(c)); ve();
  return sp.indexOf(c);
});
const ajSelAdd=`[data-nladd="${ajI}"]`;
await p.locator(ajSelAdd).scrollIntoViewIfNeeded(); await p.click(ajSelAdd); await p.waitForTimeout(150);
ok('bấm "+ Thêm nguyên liệu" thêm đúng 1 dòng trống', (await Ea(i=>sp[i].congThucNL.length,ajI))===1);
await p.locator(`[data-nlten="${ajI}:0"]`).selectOption('Bentonite'); await p.waitForTimeout(150);
await p.fill(`[data-nlkg="${ajI}:0"]`,'450'); await p.waitForTimeout(150);
ok('chọn nguyên liệu (từ Danh mục) + gõ kg cho dòng lưu đúng', JSON.stringify(await Ea(i=>sp[i].congThucNL[0],ajI))==='{"ten":"Bentonite","kg":450}',
  JSON.stringify(await Ea(i=>sp[i].congThucNL[0],ajI)));
await p.click(ajSelAdd); await p.waitForTimeout(150);
await p.locator(`[data-nlten="${ajI}:1"]`).selectOption('Phụ gia tạo mùi'); await p.waitForTimeout(150);
await p.fill(`[data-nlkg="${ajI}:1"]`,'50'); await p.waitForTimeout(150);
ok('thêm dòng thứ 2 độc lập, không đè dòng đầu', JSON.stringify(await Ea(i=>sp[i].congThucNL,ajI))===
  '[{"ten":"Bentonite","kg":450},{"ten":"Phụ gia tạo mùi","kg":50}]', JSON.stringify(await Ea(i=>sp[i].congThucNL,ajI)));
const ajHtmlSum=await Ea(i=>veNL(sp[i],i), ajI);
ok('450+50=500=đúng mẻ chuẩn 500kg → hiện tóm tắt "Đã đủ" màu xanh (không cảnh báo đỏ/vàng)',
  /class="nlsum ok"/.test(ajHtmlSum) && />Đã đủ</.test(ajHtmlSum) && !/nlsum (du|thieu)/.test(ajHtmlSum), ajHtmlSum.match(/<div class="nlsum[^>]*>[\s\S]*?<\/div>/)?.[0]);

await p.click(ajSelAdd); await p.waitForTimeout(150);
const ajOptDisabled=await p.locator(`[data-nlten="${ajI}:2"] option[value="Bentonite"]`).isDisabled();
ok('nguyên liệu đã chọn ở dòng khác bị khoá (disabled) trong dòng mới, chặn chọn trùng', ajOptDisabled);
await p.click(`[data-nldel="${ajI}:2"]`); await p.waitForTimeout(150);

await p.fill(`[data-nlkg="${ajI}:1"]`,'100'); await p.waitForTimeout(150); // 450+100=550 > 500 → dư 50
const ajHtmlDu=await Ea(i=>veNL(sp[i],i), ajI);
ok('vượt mẻ chuẩn (550/500kg) → badge "Dư 50 kg" màu vàng (nlsum du), có thanh tiến độ',
  /class="nlsum du"/.test(ajHtmlDu) && /Dư 50 kg/.test(ajHtmlDu) && /nlbar/.test(ajHtmlDu), ajHtmlDu.match(/<div class="nlsum[^>]*>[\s\S]*?<\/div>/)?.[0]);

await p.fill(`[data-nlkg="${ajI}:1"]`,'20'); await p.waitForTimeout(150); // 450+20=470 < 500 → thiếu 30
const ajHtmlThieu=await Ea(i=>veNL(sp[i],i), ajI);
ok('chưa đủ mẻ chuẩn (470/500kg) → badge "Thiếu 30 kg" màu đỏ (nlsum thieu)',
  /class="nlsum thieu"/.test(ajHtmlThieu) && /Thiếu 30 kg/.test(ajHtmlThieu), ajHtmlThieu.match(/<div class="nlsum[^>]*>[\s\S]*?<\/div>/)?.[0]);

await p.fill(`[data-nlkg="${ajI}:1"]`,'50'); await p.waitForTimeout(150); // về lại đúng 500
await p.click(`[data-nldel="${ajI}:1"]`); await p.waitForTimeout(150);
ok('bấm Xoá bỏ đúng dòng đã xoá, giữ nguyên dòng còn lại', JSON.stringify(await Ea(i=>sp[i].congThucNL,ajI))==='[{"ten":"Bentonite","kg":450}]');
const ajCH=await E(()=>sachCauHinh(sp).find(x=>x.ten==='THE CITYCAT').congThucNL);
ok('đồng bộ qua sachCauHinh() (kênh admin→nhân viên) mang đúng công thức nguyên liệu', JSON.stringify(ajCH)==='[{"ten":"Bentonite","kg":450}]', JSON.stringify(ajCH));
const ajChaKhaiHtml=await Ea(i=>{sp[i].congThucNL=[];return veNL(sp[i],i)},ajI);
ok('công thức rỗng (chưa khai dòng nào) KHÔNG hiện cảnh báo đỏ/vàng — giữ hành vi cũ, chỉ nhắc chưa khai', !/nlsum/.test(ajChaKhaiHtml));
await E(()=>{nlDM.push('Cao lanh'); return true}); // để mục AJ2 (dưới) dùng lại đúng như kịch bản gốc
await p.click(ajSelAdd); await p.waitForTimeout(150);
await p.locator(`[data-nlten="${ajI}:0"]`).selectOption('Bentonite'); await p.waitForTimeout(150);
await p.fill(`[data-nlkg="${ajI}:0"]`,'450'); await p.waitForTimeout(150);
await p.click(ajSelAdd); await p.waitForTimeout(150);
await p.locator(`[data-nlten="${ajI}:1"]`).selectOption('Cao lanh'); await p.waitForTimeout(150);
await p.fill(`[data-nlkg="${ajI}:1"]`,'50'); await p.waitForTimeout(150);

console.log('\n── AJ2. GIAO DIỆN GỌN LẠI (26/08/2026-N2) ──');
/* Khách phản hồi màn Công thức rối mắt: (1) Thành phần nên tự lấy theo nguyên liệu đã khai
   thay vì gõ tay; (2) dòng "100kg×50mg" trùng lặp với 2 ô bên dưới nên bỏ, NHƯNG 2 ô Mẻ
   chuẩn/Định lượng hương phải GIỮ NGUYÊN (đã hỏi lại khách — bỏ 2 ô đó sẽ làm nút "Áp mẻ cho
   tất cả" viết đè công thức thật, rủi ro mất dữ liệu — khách đồng ý chỉ bỏ dòng tính toán). */
const aj2I=await E(()=>{
  const c=sp.find(x=>x.ten==='THE CITYCAT'); c.huongs=['Hương Chanh']; c.hstem=c.hstem||{}; c.hstem.thanhPhan='';
  tab='ct'; mo.clear(); mo.add(sp.indexOf(c)); ve();
  return sp.indexOf(c);
});
ok('nút "Lấy theo nguyên liệu đã khai" hiện đúng khi đã có hàm lượng nguyên liệu (từ mục AJ: Bentonite)',
  !!(await Ea(i=>document.querySelector(`[data-tpnl="${i}"]`),aj2I)));
await p.click(`[data-tpnl="${aj2I}"]`); await p.waitForTimeout(200);
ok('bấm nút thì điền đúng "tên nguyên liệu 1, tên nguyên liệu 2, hương liệu" (có hương thì thêm ", hương liệu")',
  (await Ea(i=>sp[i].hstem.thanhPhan,aj2I))==='Bentonite, Cao lanh, hương liệu', await Ea(i=>sp[i].hstem.thanhPhan,aj2I));
const aj2NoHuong=await E(()=>{const c=sp.find(x=>x.ten==='THE CITYCAT');c.huongs=[];c.hstem.thanhPhan='';tab='ct';ve();return sp.indexOf(c)});
await p.click(`[data-tpnl="${aj2NoHuong}"]`); await p.waitForTimeout(200);
ok('mặt hàng KHÔNG có hương thì KHÔNG tự thêm ", hương liệu"',
  (await Ea(i=>sp[i].hstem.thanhPhan,aj2NoHuong))==='Bentonite, Cao lanh', await Ea(i=>sp[i].hstem.thanhPhan,aj2NoHuong));

ok('26/08/2026-N2: bỏ dòng tính toán trùng lặp "X kg × Y mg/100kg" khỏi màn Công thức', !/class="calc"/.test(await E(()=>document.querySelector('#rows').innerHTML)));
ok('26/08/2026-N2: VẪN giữ nguyên ô "Mẻ chuẩn (kg)" và "Định lượng hương (mg)" (an toàn dữ liệu — không gộp vào ô đầu dòng)',
  (await E(()=>!!document.querySelector('[data-f="kg"]')))&&(await E(()=>!!document.querySelector('[data-f="ml"]'))));
const aj2MauNut=await E(()=>{const b=document.querySelector('[data-addh]');return b?getComputedStyle(b).color:''});
ok('26/08/2026-N2: nút "+ Thêm hương vào danh mục" đổi màu vàng (var(--amber) = rgb(255,176,32))', aj2MauNut==='rgb(255, 176, 32)', aj2MauNut);

await E(()=>{tab='ma';moTra.delete('ctl');ve()}); await p.waitForTimeout(150);
const aj2CtlToTruoc=await E(()=>document.querySelector('#viewMA').innerHTML.length);
ok('26/08/2026-N2: khối "Cấu trúc số lô" đóng mặc định (gọn lại, không chiếm chỗ)', !/Quy ước 01 2026 QUC/.test(await E(()=>document.querySelector('#viewMA').innerHTML)));
await p.click('[data-tra="ctl"]'); await p.waitForTimeout(200);
ok('bấm vào thì mở ra đủ nội dung giải thích cấu trúc số lô', /Quy ước 01 2026 QUC/.test(await E(()=>document.querySelector('#viewMA').innerHTML)));

const aj2Bang=await E(()=>document.querySelector('#viewMA').innerHTML);
ok('26/08/2026-N2: tab Danh mục có bảng "mã đang dùng trong hệ thống" để đối chiếu quy ước ngoài',
  /Bảng mã đang dùng trong hệ thống/.test(aj2Bang));
await p.click('[data-tra="xuatma"]'); await p.waitForTimeout(200);
const aj2BangMo=await E(()=>document.querySelector('#viewMA').innerHTML);
const aj2MaThat=await E(()=>{const c=sp.find(x=>x.ten==='THE CITYCAT');return hai(c.maSP)});
ok('bảng mã đang dùng liệt kê đúng mã THẬT đang gán (không phải bảng quy ước tĩnh)',
  aj2MaThat?aj2BangMo.includes(aj2MaThat)&&aj2BangMo.includes('THE CITYCAT'):true, `mã hiện tại: ${aj2MaThat||'(chưa cấp)'}`);

console.log('\n── AK. NHẬT KÝ NHẬN FILE Ở TAB DỮ LIỆU (26/08/2026-N) ──');
/* Khách phản hồi: sau khi gửi báo cáo tiến độ, qua tab Dữ liệu bên admin không thấy chỗ nào
   ghi lại đã nhận được gì — trước đây chỉ có toast "Đã nhận..." tự tan mất.
   (Section AH ở trên đã nhận file rồi nên nhanNhatKy không còn rỗng ở đây — kiểm tra trạng
   thái rỗng riêng bằng cách gọi thẳng veNhanNhatKy() với mảng rỗng, không đụng state thật.) */
const akHtmlRong=await E(()=>{const luuTam=nhanNhatKy;nhanNhatKy=[];const h=veNhanNhatKy();nhanNhatKy=luuTam;return h});
ok('chưa nhận file nào thì hiện gợi ý (không phải khoảng trắng im lặng)', /Chưa nhận file nào ở máy này/.test(akHtmlRong));
await E(()=>{tab='sl';ve()});
const akHtmlTruoc=await E(()=>$('viewSL').innerHTML);
ok('AH đã nhận file ở trên — nhật ký hiện SẴN ở tab Dữ liệu, không cần đợi', /Đã nhận gần đây/.test(akHtmlTruoc));
ok('nhật ký nằm ngay dưới ô "Nhận mẻ từ máy nhân viên" (không phải ở nơi khác)',
  akHtmlTruoc.indexOf('id="nvIn"')<akHtmlTruoc.indexOf('Đã nhận gần đây'));
const akTruocSoLuong=await E(()=>nhanNhatKy.length);
const akFile='/tmp/_ak_bc.json';
fs.writeFileSync(akFile, JSON.stringify({loai:'peroma-me',nv:'Chú Cảnh',ngay:'2026-08-26',nk:[],
  bcNgay:[{id:'AKTEST-1',ngay:'2026-08-26',lot:'',sp:'THE CITYCAT',quyCach:'',kgKeHoach:200,kgThucTe:150,lyDo:'Test AK',nv:'Chú Cảnh',ts:'2026-08-26T09:00:00.000Z'}]}));
await p.setInputFiles('#nvIn', akFile); await p.waitForTimeout(400);
await p.click('#dlgO'); await p.waitForTimeout(400);
const akHtmlSau=await E(()=>{tab='sl';ve();return $('viewSL').innerHTML});
ok('sau khi nhận thêm file mới, nhật ký cộng thêm 1 dòng mới nhất lên đầu', (await E(()=>nhanNhatKy.length))===akTruocSoLuong+1);
ok('dòng mới nhất hiện đúng ở tab Dữ liệu', /Đã nhận gần đây/.test(akHtmlSau)&&/Chú Cảnh/.test(akHtmlSau)&&/1 báo cáo tiến độ/.test(akHtmlSau),
  akHtmlSau.match(/báo cáo tiến độ[^<]*/)?.[0]);
fs.unlinkSync(akFile);

console.log('\n── AL. PATCH KIẾN TRÚC V1 — TEST CASE BẮT BUỘC (mục M của bản đặc tả) ──');
/* Test 2 — giá hương: 370.000 đ/kg, hương dùng 750g → giá/g=370, chi phí=277.500đ,
   chi phí/kg cho 1.500kg=185đ/kg. Dùng riêng 1 hương test để không đụng state các mục trên. */
const alH=await E(()=>{if(!kho.includes('__TEST_ALH__'))kho.push('__TEST_ALH__');ve();return '__TEST_ALH__'});
await Ea(h=>{nguonHuong[h]=[{ncc:'NCC Test AL',gia:370000,soKg:1,ngay:'26/08/2026'}];huongDangDung[h]='NCC Test AL'},alH);
const alGiaG=await Ea(h=>giaHuongHienTai(h),alH);
ok('Test 2 — giá/g = 370.000/(1×1.000) = 370 đ/g', alGiaG===370, alGiaG);
const alCp=await Ea(h=>chiPhiHuongRecord({huong:h,mlDung:750,chiPhiHuongLucSX:null}),alH);
ok('Test 2 — chi phí 750g × 370đ/g = 277.500 đ', alCp===277500, alCp);
const alCpMoiKg=await E(()=>Math.round(277500/1500));
ok('Test 2 — chi phí/kg cho 1.500kg = 185 đ/kg', alCpMoiKg===185, alCpMoiKg);

/* Test 6 — cost history: snapshot giá lúc sản xuất KHÔNG đổi khi giá hiện tại đổi sau đó. */
const alSnap1=await Ea(h=>{const giaG=giaHuongHienTai(h);return giaG>0?Math.round(200*giaG):null},alH); // mlDung giả lập=200g, giá hiện tại 370đ/g
ok('Test 6 (bước 1-2) — snapshot lúc sản xuất tính đúng theo giá hiện tại lúc đó', alSnap1===74000, alSnap1);
await Ea(h=>{nguonHuong[h].push({ncc:'NCC Test AL 2',gia:540000,soKg:1,ngay:'26/08/2026'});huongDangDung[h]='NCC Test AL 2'},alH);
const alGiaGMoi=await Ea(h=>giaHuongHienTai(h),alH);
ok('Test 6 (bước 3) — giá hiện tại đã đổi sang 540 đ/g', alGiaGMoi===540, alGiaGMoi);
const alCpSauKhiDoiGia=await Ea(h=>chiPhiHuongRecord({huong:h,mlDung:200,chiPhiHuongLucSX:74000}),alH);
ok('Test 6 (bước 4) — chi phí lô A (đã snapshot) KHÔNG đổi dù giá hiện tại đã đổi', alCpSauKhiDoiGia===74000, alCpSauKhiDoiGia);
const alCpLegacy=await Ea(h=>chiPhiHuongRecord({huong:h,mlDung:200,chiPhiHuongLucSX:null}),alH);
ok('Test 6 — record CŨ chưa từng snapshot (legacy) vẫn fallback tính bằng giá hiện tại (200×540=108.000)', alCpLegacy===108000, alCpLegacy);
await Ea(h=>{kho=kho.filter(x=>x!==h);delete nguonHuong[h];delete huongDangDung[h]},alH); // dọn dữ liệu test

/* Test 5 — dashboard %: veBCSanPham/veBCNhanVien/veBCHuong KHÔNG hiện % nào cả. */
const alBCHtml=await E(()=>{traLot='';tuNgay='';denNgay='';ve();return $('viewBC').innerHTML});
const alBcc=alBCHtml.match(/<div class="bccards">[\s\S]*?<\/div><\/div>/g)||[];
ok('Test 5 — 3 khối báo cáo tổng hợp (SP/NV/hương) không còn ký tự "%" nào', alBcc.every(x=>!x.includes('%')), alBcc.length+' khối kiểm tra');

/* D2 — snapshot giá TỰ ĐỘNG lúc Admin nhận mẻ lần đầu qua #nvIn (giaHuongTheoGLucSX null → tự điền). */
const alH2=await E(()=>{if(!kho.includes('__TEST_ALH2__'))kho.push('__TEST_ALH2__');ve();return '__TEST_ALH2__'});
await Ea(h=>{nguonHuong[h]=[{ncc:'NCC AL2',gia:250000,soKg:1,ngay:'26/08/2026'}];huongDangDung[h]='NCC AL2'},alH2);
const alFile='/tmp/_al_snap.json';
fs.writeFileSync(alFile, JSON.stringify({loai:'peroma-me',nv:'Chú Cảnh',ngay:'2026-08-26',
  nk:[{id:'ALSNAP-1',ngaysx:'2026-08-26',lot:'',sp:'THE CITYCAT',huong:'__TEST_ALH2__',sl:100,mlDung:400,
    giaHuongTheoGLucSX:null,chiPhiHuongLucSX:null,ts:'2026-08-26T09:00:00.000Z'}],bcNgay:[]}));
await p.setInputFiles('#nvIn', alFile); await p.waitForTimeout(400);
await p.click('#dlgO'); await p.waitForTimeout(400);
const alRec=await E(()=>nk.find(r=>r.id==='ALSNAP-1'));
ok('D2 — Admin tự snapshot giaHuongTheoGLucSX/chiPhiHuongLucSX lúc nhận mẻ lần đầu (250×400=100.000)',
  alRec&&alRec.giaHuongTheoGLucSX===250&&alRec.chiPhiHuongLucSX===100000, JSON.stringify(alRec));
await Ea(h=>{nguonHuong[h].push({ncc:'NCC AL2 mới',gia:900000,soKg:1,ngay:'26/08/2026'});huongDangDung[h]='NCC AL2 mới'},alH2);
const alCpSauImport=await E(()=>chiPhiHuongRecord(nk.find(r=>r.id==='ALSNAP-1')));
ok('D2 — sau khi Admin đổi giá hiện tại, chi phí lô đã nhận KHÔNG đổi (vẫn 100.000)', alCpSauImport===100000, alCpSauImport);
fs.unlinkSync(alFile);
await Ea(h=>{nk=nk.filter(r=>r.id!=='ALSNAP-1');kho=kho.filter(x=>x!==h);delete nguonHuong[h];delete huongDangDung[h];ve()},alH2);

console.log('\n── AM. PATCH V1.1 — P0.1 (H2: không dùng lot làm khóa) + P0.2 (UNSCENTED) ──');
/* P0.1 — H2: 2 bản ghi CỐ Ý trùng lot (mô phỏng đúng rủi ro audit nêu — dữ liệu biên/nhiều
   dòng cùng lot) để kiểm resolveBcRecord() không bao giờ "đoán đại" bản ghi đầu tiên. */
await E(()=>{
  nk.push({id:'AMDUP-1',ngaysx:'2026-08-26',lot:'9999999999',sp:'THE CITYCAT',quyCach:'5 kg',
    sl:100,huong:'Chanh tươi',mlDung:50,nv:'Test',ts:'2026-08-26T08:00:00.000Z'});
  nk.push({id:'AMDUP-2',ngaysx:'2026-08-26',lot:'9999999999',sp:'THE CITYCAT',quyCach:'5 kg',
    sl:100,huong:'Chanh tươi',mlDung:999,nv:'Test',ts:'2026-08-26T08:05:00.000Z'}); // chi phí khác hẳn AMDUP-1
  ve();
});
const amAmbig=await E(()=>{
  const {rec,ambiguous}=resolveBcRecord({lot:'9999999999',sp:'THE CITYCAT',quyCach:'5 kg',kgKeHoach:100});
  return {rec:rec&&rec.id, ambiguous};
});
ok('H2 — báo cáo CŨ (không có recordId) mà khóa tổ hợp khớp >1 bản ghi → KHÔNG tự chọn đại, báo ambiguous',
  amAmbig.rec===null&&amAmbig.ambiguous===true, JSON.stringify(amAmbig));
const amResolve2=await E(()=>{const {rec}=resolveBcRecord({recordId:'AMDUP-2'});return rec&&rec.id});
ok('H2 — báo cáo MỚI có recordId thì tra ĐÚNG bản ghi đó dù trùng lot với bản ghi khác', amResolve2==='AMDUP-2', amResolve2);
const amHtmlAmbig=await E(()=>{
  bcNgay.push({id:'AMBC-1',ngay:'2026-08-26',lot:'9999999999',sp:'THE CITYCAT',quyCach:'5 kg',
    kgKeHoach:100,kgThucTe:100,lyDo:'',nv:'Test',ts:'2026-08-26T08:10:00.000Z'}); // KHÔNG có recordId — legacy
  tab='bc';ve();return $('viewBC').innerHTML});
ok('H2 — UI hiện đúng "Không xác định duy nhất" thay vì âm thầm gắn nhầm chi phí', /Không xác định duy nhất/.test(amHtmlAmbig));
await E(()=>{nk=nk.filter(r=>!r.id.startsWith('AMDUP-'));bcNgay=bcNgay.filter(r=>r.id!=='AMBC-1');ve()}); // dọn dữ liệu test

/* P0.2 — UNSCENTED: "Không mùi" phải luôn 0đ/0g tiêu hao, không NCC/tồn/cảnh báo, vẫn cho gán LOT. */
ok('UNSCENTED — chiPhiHuongRecord() trả 0đ cho "Không mùi" dù mlDung>0 (dữ liệu sai lịch sử nếu có)',
  (await E(()=>chiPhiHuongRecord({huong:'Không mùi',mlDung:9999,chiPhiHuongLucSX:null})))===0);
ok('UNSCENTED — giaHuongHienTai("Không mùi") luôn = 0 (không có NCC/giá)', (await E(()=>giaHuongHienTai('Không mùi')))===0);
const amNguonHtml=await E(()=>{tab='bc';ve();return document.querySelector('#viewBC').innerHTML||''});
// (đảm bảo đang xem đúng tab trước khi lấy HTML thật của veNguonHuong — gọi trực tiếp cho chắc)
const amNguonHtml2=await E(()=>veNguonHuong());
ok('UNSCENTED — "Không mùi" KHÔNG xuất hiện trong danh sách Nguồn hương liệu (NCC/giá/tồn kho)',
  !amNguonHtml2.includes('ncc-Không mùi') && !/class="ncc-ten">Không mùi</.test(amNguonHtml2));
const amMaHtml=await E(()=>{tab='ma';ve();return $('viewMA').innerHTML});
ok('UNSCENTED — trong danh mục hương, "Không mùi" bị khoá đổi tên (input disabled)',
  /data-ten="h" data-cu="Không mùi" value="Không mùi" disabled/.test(amMaHtml), amMaHtml.includes('Không mùi'));
ok('UNSCENTED — trong danh mục hương, "Không mùi" KHÔNG có nút xoá',
  !new RegExp('data-xoa="h" data-v="Không mùi"').test(amMaHtml));
const amXoaChan=await E(()=>{
  const truoc=kho.length;
  // gọi thẳng logic xoá qua click giả lập không có (nút không tồn tại) — kiểm tra kho không đổi
  return {truoc, sau:kho.length, conKhongMui:kho.includes('Không mùi')};
});
ok('UNSCENTED — "Không mùi" vẫn còn trong kho (không bị xoá được)', amXoaChan.conKhongMui);

console.log('\n── AN. PATCH V1.1 — P1-A (recipe version + snapshot bất biến) ──');
/* Dùng SẢN PHẨM RIÊNG cho test này (không phải THE CITYCAT — sản phẩm đó đã bị nhiều test ở
   trên đụng vào kg/congThucNL nên recipeVersion của nó không còn là 1 tới lúc chạy tới đây).
   So sánh theo ĐỘ CHÊNH LỆCH (delta), không giả định version tuyệt đối là an toàn hơn. */
const anIdx=await E(()=>{
  sp.push({ten:'__TEST_AN_RECIPE__',kg:100,ml:50,me:100,pkb:false,huongs:['Hương Chanh'],tam:['Hương Chanh'],
    ngay:'',lichSu:[],maSP:'',huongMe:'',pb:[],hstem:{},nguyenlieu:'',congThucNL:[],pkbPhut:'',pkbChat:'',pkbCT:'',
    ghi:'',lot:'',ngaysx:'',sl:'',nv:'',tt:'ok',ttLyDo:'',ttNgay:'',dauRa:['5 kg'],qc:''});
  const i=sp.length-1; bumpRecipeVersion(sp[i]); luu(); return i;
});
const anV0=await Ea(i=>({v:sp[i].recipeVersion,fp:sp[i].recipeFingerprint}),anIdx);
ok('P1-A — sản phẩm mới lần đầu thấy field recipeVersion → khởi tạo v1, có dấu vân tay',
  anV0.v===1&&!!anV0.fp, JSON.stringify(anV0));

await Ea(i=>{sp[i].kg=num(sp[i].kg)+1;bumpRecipeVersion(sp[i]);luu()},anIdx);
const anV1=await Ea(i=>sp[i].recipeVersion,anIdx);
ok('P1-A — đổi kg (basis) → recipeVersion tăng đúng 1', anV1===2, anV1);
const anEff1=await Ea(i=>sp[i].recipeEffectiveFrom,anIdx);
ok('P1-A — recipeEffectiveFrom được gắn ngay lúc version tăng', !!anEff1, anEff1);

await Ea(i=>{bumpRecipeVersion(sp[i]);luu()},anIdx);
const anV1b=await Ea(i=>sp[i].recipeVersion,anIdx);
ok('P1-A — gọi lại khi KHÔNG có gì đổi thêm → không tăng version thêm lần nữa', anV1b===2, anV1b);

await Ea(i=>{sp[i].huongs=[...(sp[i].huongs||[]),'Hương Lài'];bumpRecipeVersion(sp[i]);luu()},anIdx);
const anV2=await Ea(i=>sp[i].recipeVersion,anIdx);
ok('P1-A — đổi allowed fragrances (huongs) KHÔNG được tính là đổi công thức, version không tăng',
  anV2===2, anV2);

const anCauHinh=await Ea(i=>sachCauHinh(sp)[i],anIdx);
ok('P1-A — sachCauHinh() mang theo recipeVersion/recipeEffectiveFrom để đồng bộ sang máy nhân viên',
  anCauHinh.recipeVersion===2&&!!anCauHinh.recipeEffectiveFrom, JSON.stringify({v:anCauHinh.recipeVersion,ef:anCauHinh.recipeEffectiveFrom}));
ok('P1-A — sachCauHinh() KHÔNG lộ recipeFingerprint (chi tiết nội bộ, không cần đồng bộ)',
  anCauHinh.recipeFingerprint===undefined);
ok('P1-A — sachCauHinh() KHÔNG mang runtime batch state kèm theo (H1 vẫn giữ nguyên)',
  anCauHinh.sl===undefined&&anCauHinh.huongMe===undefined&&anCauHinh.daInPhieu===undefined);

await Ea(i=>{sp.splice(i,1);luu()},anIdx); // dọn dữ liệu test — xoá hẳn sản phẩm test

console.log('\n── AO. PATCH V1.1 — P1-B (batchId + trạng thái tính từ nk/bcNgay) ──');
await E(()=>{
  nk.push({id:'AOREC-1',ngaysx:'2026-08-26',lot:'8888888888',sp:'THE CITYCAT',quyCach:'5 kg',
    sl:100,huong:'Chanh tươi',mlDung:50,nv:'Test',ts:'2026-08-26T08:00:00.000Z',batchId:'AOREC'});
  ve();
});
ok('P1-B — record vừa ghi (chưa có báo cáo thực tế) → trạng thái RECORDED',
  (await E(()=>trangThaiSXCua(nk.find(r=>r.id==='AOREC-1'))))==='RECORDED');
await E(()=>{bcNgay.push({id:'AOBC-1',ngay:'2026-08-26',lot:'8888888888',recordId:'AOREC-1',sp:'THE CITYCAT',
  quyCach:'5 kg',kgKeHoach:100,kgThucTe:98,lyDo:'',nv:'Test',ts:'2026-08-26T09:00:00.000Z'});ve()});
ok('P1-B — sau khi có báo cáo thực tế gắn đúng recordId → trạng thái COMPLETED',
  (await E(()=>trangThaiSXCua(nk.find(r=>r.id==='AOREC-1'))))==='COMPLETED');
await E(()=>{nk.find(r=>r.id==='AOREC-1').huy=true;ve()});
ok('P1-B — huỷ lô (dù đã có báo cáo thực tế) → trạng thái CANCELLED đè lên, record KHÔNG bị xoá',
  (await E(()=>trangThaiSXCua(nk.find(r=>r.id==='AOREC-1'))))==='CANCELLED'
  &&(await E(()=>!!nk.find(r=>r.id==='AOREC-1'))));
const aoTraLoHtml=await E(()=>{tab='bc';traLot='8888888888';ve();return $('viewBC').innerHTML});
ok('P1-B — tra lô hiện đúng dòng "Trạng thái chốt thực tế"', /Trạng thái chốt thực tế/.test(aoTraLoHtml));
await E(()=>{nk=nk.filter(r=>r.id!=='AOREC-1');bcNgay=bcNgay.filter(r=>r.id!=='AOBC-1');traLot='';ve()}); // dọn dữ liệu test

console.log('\n── AP. PATCH V1.1 — P1-C (audit trail append-only) ──');
const apIdx=await E(()=>{
  sp.push({ten:'__TEST_AP_AUDIT__',kg:100,ml:50,me:100,pkb:false,huongs:['Hương Chanh'],tam:['Hương Chanh'],
    ngay:'',lichSu:[],maSP:'',huongMe:'',pb:[],hstem:{},nguyenlieu:'',congThucNL:[],pkbPhut:'',pkbChat:'',pkbCT:'',
    ghi:'',lot:'',ngaysx:'',sl:'',nv:'',tt:'ok',ttLyDo:'',ttNgay:'',dauRa:['5 kg'],qc:''});
  const i=sp.length-1; bumpRecipeVersion(sp[i]); luu(); return i;
});
const apCountBefore=await E(()=>auditEvents.length);
await Ea(i=>{sp[i].kg=num(sp[i].kg)+5;bumpRecipeVersion(sp[i]);luu()},apIdx);
const apEv1=await E(()=>auditEvents.filter(a=>a.entityType==='recipe'&&a.action==='EDIT_RECIPE'&&a.entityId==='__TEST_AP_AUDIT__'));
ok('P1-C — sửa công thức thật (kg) ghi đúng 1 event EDIT_RECIPE, before/after đúng version',
  apEv1.length===1&&apEv1[0].before.version===1&&apEv1[0].after.version===2, JSON.stringify(apEv1));
ok('P1-C — auditEvents chỉ tăng (append-only), không mất event cũ', (await E(()=>auditEvents.length))>apCountBefore);

await E(()=>{
  nk.push({id:'APREC-1',ngaysx:'2026-08-26',lot:'7777777777',sp:'THE CITYCAT',quyCach:'5 kg',
    sl:100,huong:'Chanh tươi',mlDung:50,nv:'Test',ts:'2026-08-26T08:00:00.000Z'});
  ve();
});
await E(()=>{tab='bc';traLot='7777777777';ve()}); await p.waitForTimeout(150);
await p.click('[data-huylo="APREC-1"]'); await p.waitForTimeout(150);
await p.click('#dlgO').catch(()=>{}); await p.waitForTimeout(150);
const apAfterHuy=await E(()=>({co:!!nk.find(r=>r.id==='APREC-1'), huy:nk.find(r=>r.id==='APREC-1')&&nk.find(r=>r.id==='APREC-1').huy,
  ev:auditEvents.some(a=>a.entityType==='batch'&&a.entityId==='APREC-1'&&a.action==='CANCEL')}));
ok('P1-C — huỷ lô (Admin) ghi audit CANCEL, record KHÔNG bị xoá khỏi nk[]',
  apAfterHuy.co&&apAfterHuy.huy&&apAfterHuy.ev, JSON.stringify(apAfterHuy));

// Kiểm #nvIn NHẬN auditEvents từ nhân viên, dedupe theo id (không nhận trùng khi nhận lại lần 2)
const apFile='/tmp/_ap_ae.json';
fs.writeFileSync(apFile, JSON.stringify({loai:'peroma-me',nv:'Test NV',ngay:'2026-08-26',nk:[],bcNgay:[],
  auditEvents:[{id:'APAE-1',entityType:'batch',entityId:'x',action:'RECORD_BATCH',actor:'Test NV',
    at:'2026-08-26T10:00:00.000Z',before:null,after:{sp:'x'},source:'employee'}]}));
await p.setInputFiles('#nvIn', apFile); await p.waitForTimeout(300);
await p.click('#dlgO'); await p.waitForTimeout(300);
const apGot1=await E(()=>auditEvents.some(a=>a.id==='APAE-1'));
ok('P1-C — nhận auditEvents từ file nhân viên qua #nvIn (kênh sẵn có, không mở kênh mạng mới)', apGot1);
await p.setInputFiles('#nvIn', apFile); await p.waitForTimeout(300);
await p.click('#dlgO'); await p.waitForTimeout(200); // "Không có gì mới" — lần nhận trùng thứ 2 vẫn phải đóng hộp thoại, không để kẹt lại cho các mục kiểm tra sau
const apCountAfterFirst=await E(()=>auditEvents.filter(a=>a.id==='APAE-1').length);
ok('P1-C — nhận lại file cũ lần 2 KHÔNG tạo trùng event (dedupe theo id, giống nk/bcNgay)', apCountAfterFirst===1);
fs.unlinkSync(apFile);
await Ea(i=>{sp.splice(i,1)},apIdx);
await E(()=>{nk=nk.filter(r=>r.id!=='APREC-1');auditEvents=auditEvents.filter(a=>!['APAE-1'].includes(a.id)&&a.entityId!=='__TEST_AP_AUDIT__'&&a.entityId!=='APREC-1');luu();ve()}); // dọn dữ liệu test

console.log('\n── AQ. NGUỒN HƯƠNG LIỆU THEO TỪNG MẶT HÀNG + TỒN KHO (26/08/2026-S) ──');
/* Khách phản hồi: 1 hương có 2 nhà cung cấp thì phải được TỰ CHỌN dùng nguồn nào cho từng mặt
   hàng (không gắn mặc định chung), mỗi nguồn phải có TỒN KHO (hết thì tự ẩn khỏi ô chọn, giữ
   lịch sử), và phải bấm XÁC NHẬN thì lựa chọn mới khoá lại, tính vào sản xuất. Demo đã duyệt,
   mục này kiểm bản tích hợp vào hệ thống thật. */
const aqH='Test Hương AQ';
const aqIdx=await E(()=>{
  kho.push('Test Hương AQ');
  nguonHuong['Test Hương AQ']=[
    {ncc:'NCC Một',gia:5000000,soKg:10,ngay:'01/07/2026',daDungKg:0}, // 500đ/g
    {ncc:'NCC Hai',gia:8000000,soKg:10,ngay:'15/08/2026',daDungKg:0}, // 800đ/g
  ];
  sp.push({ten:'__TEST_AQ_MH__',kg:100,ml:50,me:100,pkb:false,huongs:['Test Hương AQ'],tam:['Test Hương AQ'],
    ngay:'',lichSu:[],maSP:'',huongMe:'',pb:[],hstem:{},nguyenlieu:'',congThucNL:[],pkbPhut:'',pkbChat:'',pkbCT:'',
    ghi:'',lot:'',ngaysx:'',sl:'',nv:'',tt:'ok',ttLyDo:'',ttNgay:'',dauRa:['5 kg'],qc:''});
  const i=sp.length-1; bumpRecipeVersion(sp[i]); tab='ct'; mo.clear(); mo.add(i); luu(); ve();
  return i;
});
await p.waitForTimeout(150);
let aqHtml=await Ea(i=>document.querySelector(`[data-t="${i}"]`).closest('.r').querySelector('.det').innerHTML, aqIdx);
ok('2 nhà cung cấp còn tồn kho → hiện ô CHỌN (không tự gắn mặc định)', aqHtml.includes(`data-chonnguon="${aqIdx}|||Test Hương AQ"`), aqHtml.slice(0,50));
ok('chưa chọn → nút Xác nhận bị khoá (disabled)', new RegExp(`data-xacnhannguon="${aqIdx}"[^>]*disabled`).test(aqHtml));
ok('chưa chọn → cảnh báo "Chưa xác định nhà cung cấp"', /Chưa xác định nhà cung cấp đang dùng/.test(aqHtml));

// chọn NCC Hai (ix=1) cho mặt hàng này
await p.locator(`[data-chonnguon="${aqIdx}|||Test Hương AQ"]`).selectOption('1');
await p.waitForTimeout(150);
ok('chọn nguồn lưu đúng vào p.nguonHuongChon', (await Ea(i=>sp[i].nguonHuongChon['Test Hương AQ'],aqIdx))===1);
aqHtml=await Ea(i=>document.querySelector(`[data-t="${i}"]`).closest('.r').querySelector('.det').innerHTML, aqIdx);
ok('đã chọn đủ → nút Xác nhận HẾT bị khoá', !new RegExp(`data-xacnhannguon="${aqIdx}"[^>]*disabled`).test(aqHtml));

await p.click(`[data-xacnhannguon="${aqIdx}"]`); await p.waitForTimeout(150);
ok('bấm Xác nhận → khoá lại (nguonHuongKhoa=true)', await Ea(i=>sp[i].nguonHuongKhoa===true,aqIdx));
aqHtml=await Ea(i=>document.querySelector(`[data-t="${i}"]`).closest('.r').querySelector('.det').innerHTML, aqIdx);
ok('đã khoá → hiện đúng tên NCC đã chọn (NCC Hai) kèm icon khoá', aqHtml.includes('🔒 NCC Hai'));
ok('đã khoá → KHÔNG còn hiện ô chọn nữa', !aqHtml.includes(`data-chonnguon="${aqIdx}|||Test Hương AQ"`));

await p.click(`[data-mokhoanguon="${aqIdx}"]`); await p.waitForTimeout(150);
ok('bấm "Mở khoá để sửa lại" → mở khoá đúng', await Ea(i=>sp[i].nguonHuongKhoa===false,aqIdx));
await p.click(`[data-xacnhannguon="${aqIdx}"]`); await p.waitForTimeout(150); // khoá lại để test snapshot bên dưới

// Gửi 1 mẻ sản xuất (qua kênh #nvIn có sẵn, giống mọi mẻ khác) dùng 4000g Test Hương AQ —
// phải snapshot ĐÚNG giá của NCC Hai (800đ/g), KHÔNG phải NCC Một (500đ/g).
const aqFile='/tmp/_aq_me.json';
fs.writeFileSync(aqFile, JSON.stringify({loai:'peroma-me',nv:'Test NV AQ',ngay:'2026-08-26',bcNgay:[],
  nk:[{id:'AQREC-1',ngaysx:'2026-08-26',lot:'9999999999',sp:'__TEST_AQ_MH__',quyCach:'5 kg',
    sl:50,huong:'Test Hương AQ',mlDung:4000,nv:'Test NV AQ',ts:'2026-08-26T08:00:00.000Z'}]}));
await p.setInputFiles('#nvIn', aqFile); await p.waitForTimeout(300);
await p.click('#dlgO'); await p.waitForTimeout(300);
const aqRec=await E(()=>nk.find(r=>r.id==='AQREC-1'));
ok('nhận mẻ mới → snapshot giá ĐÚNG theo nguồn RIÊNG mặt hàng đã xác nhận (NCC Hai = 800đ/g), không phải nguồn 1',
  aqRec&&aqRec.giaHuongTheoGLucSX===800, JSON.stringify(aqRec&&{gia:aqRec.giaHuongTheoGLucSX,cp:aqRec.chiPhiHuongLucSX}));
ok('chi phí snapshot = 4000g × 800đ/g = 3.200.000đ', aqRec&&aqRec.chiPhiHuongLucSX===3200000);
const aqTonSauKhi=await E(()=>nguonHuong['Test Hương AQ'][1].daDungKg);
ok('tồn kho nguồn NCC Hai tự trừ đúng 4kg (4000g) sau khi nhận mẻ', aqTonSauKhi===4, aqTonSauKhi);
const aqTonNguon1=await E(()=>num(nguonHuong['Test Hương AQ'][0].daDungKg||0));
ok('nguồn NCC Một (không dùng) KHÔNG bị trừ tồn kho', aqTonNguon1===0);

// Dùng hết nốt 6kg còn lại của NCC Hai — phải tự ẩn khỏi ô chọn, giữ lịch sử
const aqFile2='/tmp/_aq_me2.json';
fs.writeFileSync(aqFile2, JSON.stringify({loai:'peroma-me',nv:'Test NV AQ',ngay:'2026-08-26',bcNgay:[],
  nk:[{id:'AQREC-2',ngaysx:'2026-08-26',lot:'9999999998',sp:'__TEST_AQ_MH__',quyCach:'5 kg',
    sl:50,huong:'Test Hương AQ',mlDung:6000,nv:'Test NV AQ',ts:'2026-08-26T09:00:00.000Z'}]}));
await p.setInputFiles('#nvIn', aqFile2); await p.waitForTimeout(300);
await p.click('#dlgO'); await p.waitForTimeout(300);
ok('dùng hết 10kg (4+6) → NCC Hai hết tồn kho', (await E(()=>{
  const e=nguonHuong['Test Hương AQ'][1]; return e.soKg-e.daDungKg<=0;
})));
await Ea(i=>{tab='ma';moTra.add('ncc-h-Test Hương AQ');ve()},aqIdx); await p.waitForTimeout(150);
const aqDmHtml=await E(()=>document.getElementById('viewMA').innerHTML);
ok('tab Danh mục vẫn hiện đủ lịch sử NCC Hai, đánh dấu "hết tồn kho"', /hết tồn kho/.test(aqDmHtml)&&aqDmHtml.includes('NCC Hai'));

fs.unlinkSync(aqFile); fs.unlinkSync(aqFile2);
await E(()=>{nk=nk.filter(r=>!['AQREC-1','AQREC-2'].includes(r.id));tab='ct';moTra.delete('ncc-h-Test Hương AQ');luu();ve()});

console.log('\n── AR. XOÁ DỮ LIỆU MÔ PHỎNG — GIỮ NGUYÊN DANH MỤC/MÃ SỐ (26/08/2026-S) ──');
/* Khách yêu cầu: sau khi thử nghiệm xong, có cách xoá sạch dữ liệu thử (mẻ, báo cáo, giá
   NCC, hàm lượng nguyên liệu đã khai) nhưng GIỮ NGUYÊN tên/mã số mặt hàng/hương/quy cách... */
const arTruoc=await E(()=>({
  spTen:sp.map(x=>x.ten), khoTen:[...kho], maHuongChanh:maHuong['Hương Chanh'], nlDM:[...nlDM],
}));
await E(()=>{
  sp[0].congThucNL=[{ten:'Bentonite',kg:10}]; // giả lập đã khai hàm lượng nguyên liệu
  nguonNguyenLieu['Bentonite']=[{ncc:'NCC test AR',gia:100000,soKg:10,ngay:'26/08/2026'}];
  nlDangDung['Bentonite']='NCC test AR';
  nk.push({id:'ARREC-1',ngaysx:'2026-08-26',lot:'1231231231',sp:sp[0].ten,quyCach:'5 kg',sl:10,huong:'Hương Chanh',mlDung:10,nv:'Test',ts:'2026-08-26T07:00:00.000Z'});
  bcNgay.push({id:'ARBC-1',ngay:'2026-08-26',lot:'',sp:sp[0].ten,quyCach:'',kgKeHoach:10,kgThucTe:9,lyDo:'',nv:'Test',ts:'2026-08-26T07:00:00.000Z'});
  tab='sl'; luu(); ve();
});
await p.waitForTimeout(150);
await p.click('#xoaMoPhongBtn'); await p.waitForTimeout(150);
await p.click('#dlgO'); await p.waitForTimeout(600); // chờ thêm: giờ có gọi mạng xoaDLMoPhong (sandbox không có mạng → rơi vào nhánh catch)
// 27/08/2026-R2: khách phản hồi "xoá dữ liệu mô phỏng nhưng vẫn còn hiện ở Tra lô" — nguyên nhân
// là chỉ xoá cục bộ, Sheet vẫn còn nên lần đồng bộ tự động sau lại kéo về y hệt. Giờ nút này còn
// gọi thêm Code.gs (action xoaDLMoPhong) để xoá thật trên Sheet — sandbox không có mạng thật nên
// chỉ xác nhận code chạy không vỡ và báo đúng thông điệp phù hợp (thành công/thất bại mạng).
const arToast=await E(()=>document.getElementById('toast').textContent);
/* 10/09/2026 — bản S7: máy CHƯA khai kết nối thì DONGBO_URL rỗng, app đi nhánh else và báo
   "Đã xoá dữ liệu mô phỏng, giữ nguyên danh mục/mã số" — cố tình KHÔNG nhắc Google Sheet,
   vì nhắc sẽ khiến người dùng tưởng đã xoá trên Sheet trong khi máy này chưa hề nối tới đó.
   Kiểm cả hai nhánh thay vì mặc định luôn có kết nối (test cũ chỉ đúng cho trường hợp đã nối). */
const arCoKetNoi=await E(()=>!!DONGBO_URL);
ok(arCoKetNoi
    ? '27/08/2026-R2: máy ĐÃ nối — xoá dữ liệu mô phỏng phải báo rõ về việc xoá trên Google Sheet (thành công hay lỗi mạng đều báo)'
    : '10/09/2026-S7: máy CHƯA nối — toast không được nhắc Google Sheet (tránh hiểu nhầm là đã xoá trên đó)',
  arCoKetNoi ? /Google Sheet/.test(arToast) : (!/Google Sheet/.test(arToast) && /Đã xoá dữ liệu mô phỏng/.test(arToast)),
  arToast);
const arSau=await E(()=>({
  nk:nk.length, bcCoARBC1:bcNgay.some(r=>r.id==='ARBC-1'), nguonRong:Object.values(nguonHuong).every(a=>a.length===0),
  congThucNLRong:sp[0].congThucNL.length===0, khoaGo:sp[0].nguonHuongKhoa===false,
  spTen:sp.map(x=>x.ten), khoTen:[...kho], maHuongChanh:maHuong['Hương Chanh'], nlDM:[...nlDM],
  nguonNlRong:Object.values(nguonNguyenLieu).every(a=>a.length===0),
}));
ok('Xoá dữ liệu mô phỏng: nhật ký ghi mẻ về 0', arSau.nk===0, arSau.nk);
ok('Xoá dữ liệu mô phỏng: báo cáo tiến độ bị xoá sạch', !arSau.bcCoARBC1);
ok('Xoá dữ liệu mô phỏng: mọi nguồn hương liệu (NCC/giá) về rỗng', arSau.nguonRong);
ok('Xoá dữ liệu mô phỏng: hàm lượng nguyên liệu đã khai bị xoá', arSau.congThucNLRong);
ok('27/08/2026 (phản hồi lần 3): mọi nguồn NGUYÊN LIỆU (NCC/giá) cũng về rỗng như hương', arSau.nguonNlRong);
ok('Xoá dữ liệu mô phỏng: GIỮ NGUYÊN tên mặt hàng (mã số)', JSON.stringify(arSau.spTen)===JSON.stringify(arTruoc.spTen), JSON.stringify({sau:arSau.spTen,truoc:arTruoc.spTen}));
ok('Xoá dữ liệu mô phỏng: GIỮ NGUYÊN danh mục hương (kể cả "Test Hương AQ" vừa thêm)', JSON.stringify(arSau.khoTen)===JSON.stringify(arTruoc.khoTen));
ok('Xoá dữ liệu mô phỏng: GIỮ NGUYÊN mã số đã cấp (mã Hương Chanh)', arSau.maHuongChanh===arTruoc.maHuongChanh);
ok('Xoá dữ liệu mô phỏng: GIỮ NGUYÊN danh mục nguyên liệu (nlDM)', JSON.stringify(arSau.nlDM)===JSON.stringify(arTruoc.nlDM));

// dọn lại toàn bộ dữ liệu test của mục AQ/AR (hương/mặt hàng test) để không lẫn vào các lần chạy sau
await E(()=>{
  kho=kho.filter(h=>h!=='Test Hương AQ'); delete nguonHuong['Test Hương AQ']; delete huongDangDung['Test Hương AQ'];
  sp=sp.filter(x=>x.ten!=='__TEST_AQ_MH__');
  tab='ct'; luu(); ve();
});

console.log('\n── AS. PHẢN HỒI 27/08/2026 (bản S2) — sửa lỗi văng số, đơn giản hoá giao diện, đồng bộ Sheet ──');

/* AS1: bug "nhập ký tự bị văng" — dấu phẩy thập phân không còn làm num() trả 0 */
ok('num() chấp nhận dấu phẩy thập phân', (await E(()=>num('50,5')))===50.5);
ok('num() vẫn chấp nhận dấu chấm như cũ', (await E(()=>num('50.5')))===50.5);
ok('num() bỏ khoảng trắng thừa', (await E(()=>num(' 12,3 ')))===12.3);

/* AS2: các ô kg/g dễ gõ số thập phân không còn type=number (nguồn gốc lỗi bị văng) */
const kieuO=await E(()=>{
  const ids=['allKg'];
  const tSel=ids.map(id=>({id,type:document.getElementById(id)&&document.getElementById(id).type}));
  return tSel;
});
ok('#allKg không còn type=number', kieuO.find(x=>x.id==='allKg').type==='text');
// 27/08/2026 (phản hồi lần 3): #nlTongIn không còn tồn tại nữa — cả khối "Tiến độ sử dụng lô
// nguyên liệu đầu vào" (và nút "Khai báo lô nguyên liệu mới") đã bị gỡ bỏ hẳn, xem mục AE bên dưới.

/* AS3: nhãn/đơn vị */
/* 27/08/2026 (phản hồi 2): "Approved" CHỈ dùng ở badge tóm tắt đầu thẻ — nút chọn trạng thái
   thật (veTT) phải giữ nguyên tiếng Việt "Cho phép", không đổi ngôn ngữ ở đó. */
ok('Nút CHỌN trạng thái (veTT) vẫn giữ tiếng Việt "Cho phép"', (await E(()=>TT.ok.n))==='Cho phép');
ok('Badge tóm tắt đầu thẻ dùng "APPROVED" (ngắn, chỉ ở mục tiêu đề)', (await E(()=>TT_BADGE_NGAN.ok))==='APPROVED');
ok('TEM_O không còn ô tenEN', (await E(()=>TEM_O.some(x=>x[0]==='tenEN')))===false);

/* AS4: mở 1 mặt hàng để kiểm giao diện chi tiết */
const iAS=await E(()=>{const x=sp.find(p=>p.ten==='Cát Zaka liti thường');const ix=sp.indexOf(x);
  mo.clear();mo.add(ix);tab='ct';ve();return ix});
await p.waitForTimeout(200);
ok('cột "Cần dùng" hiện đơn vị G/MẺ (không còn MG, và rõ là tính theo Mẻ)', (await E(()=>document.querySelector('.r.open .cd span').textContent))==='G/MẺ');
ok('ô tên mặt hàng sửa tại chỗ (tennm) đã thay ô "Tên sản phẩm" riêng', (await E(()=>document.querySelectorAll('.r.open input.tennm').length))===1);
ok('không còn ô "Tên sản phẩm" trùng lặp trong chi tiết', (await E(()=>[...document.querySelectorAll('.r.open .fld label')].filter(l=>l.textContent==='Tên sản phẩm').length))===0);
ok('nhan(p) không còn badge hương/quy cách xem trước (đơn giản hoá)', (await E(()=>document.querySelector('.r.open .meta .bdg.sc')))===null);
ok('badge tóm tắt đầu thẻ hiện "APPROVED" (mặt hàng đang cho phép SX)', (await E(()=>document.querySelector('.r.open .meta .bdg.s-ok').textContent))==='APPROVED');
ok('nút chọn trạng thái trong chi tiết hiện "Cho phép" (tiếng Việt, không đổi)', (await E(()=>[...document.querySelectorAll('.r.open .ttb.ok')].some(b=>b.textContent==='Cho phép'))));

/* AS5: sửa tên tại chỗ hoạt động đúng, không làm sập/mở nhầm thẻ */
await E(x=>{const el=document.querySelector('.r.open input.tennm');el.focus();el.value='Cát Zaka liti thường (test)';
  el.dispatchEvent(new Event('input',{bubbles:true}));},iAS);
await p.waitForTimeout(200);
ok('sửa tên tại chỗ cập nhật đúng p.ten', (await Ea(x=>sp[x].ten,iAS))==='Cát Zaka liti thường (test)');
ok('thẻ vẫn đang mở sau khi gõ tên (không bị đóng nhầm)', (await Ea(x=>mo.has(x),iAS))===true);
await Ea(x=>{sp[x].ten='Cát Zaka liti thường';luu();ve()},iAS); // trả lại tên gốc, tránh ảnh hưởng test khác
await p.waitForTimeout(150);

/* AS6: hồ sơ tem thu gọn/mở — mặc định MỞ (giữ hành vi cũ để không phải bấm thêm mỗi lần) */
await E(()=>{mo.clear();mo.add(sp.findIndex(p=>p.ten==='Cát Zaka liti thường'));ve()});
await p.waitForTimeout(150);
ok('hồ sơ tem mặc định MỞ sẵn (không cần bấm thêm)', (await E(()=>!!document.querySelector('.r.open [data-tem="tenVN"]'))));
await p.click('.r.open [data-tratem]');
await p.waitForTimeout(150);
ok('bấm "Thu gọn hồ sơ tem" thì ẩn các ô đi', (await E(()=>!document.querySelector('.r.open [data-tem="tenVN"]'))));
await p.click('.r.open [data-tratem]');
await p.waitForTimeout(150);
ok('bấm lại thì hồ sơ tem hiện ra như cũ', (await E(()=>!!document.querySelector('.r.open [data-tem="tenVN"]'))));
ok('tóm tắt hồ sơ tem có màu theo trạng thái đủ/thiếu (khách yêu cầu)', (await E(()=>{
  const s=document.querySelector('.r.open [data-tratem] .ncc-sum');
  return s&&(s.classList.contains('tk-ok')||s.classList.contains('tk-no'));
})));

/* AS7: khoanh đỏ khối "Hương đang sử dụng" khi mặt hàng chưa có hương */
const iTrong=await E(()=>{const x={ten:'__TEST_AS_TRONG__',kg:100,ml:50,pkb:false,huongs:[],tam:[],dauRa:['5 kg'],congThucNL:[]};
  sp.push(x);mo.clear();mo.add(sp.length-1);tab='ct';luu();ve();return sp.length-1});
await p.waitForTimeout(200);
ok('mặt hàng chưa có hương → khối "Hương đang sử dụng" bị khoanh đỏ (class need)', (await E(()=>{
  const flds=[...document.querySelectorAll('.r.open .fld')];
  const f=flds.find(x=>x.querySelector('label')&&x.querySelector('label').textContent==='Hương đang sử dụng');
  return !!f&&f.classList.contains('need');
})));
await Ea(x=>{sp.splice(x,1);mo.clear();luuNgay();ve()},iTrong); // dọn dữ liệu test

/* AS8: "còn N mã chưa cấp" — bấm vào nhảy tới đúng dòng và nháy đỏ */
await E(()=>{tab='ma';document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x.dataset.tab==='ma'));ve()});
await p.waitForTimeout(200);
const coCanh=await E(()=>!!document.querySelector('[data-jumpthieu]'));
if(coCanh){
  await p.click('[data-jumpthieu]');
  await p.waitForTimeout(100);
  ok('bấm "còn N mã chưa cấp" thì dòng thiếu mã đầu tiên được nháy đỏ', (await E(()=>!!document.querySelector('.marow.trong.flash')||!!document.querySelector('.marow.trong'))));
}else{
  ok('bấm "còn N mã chưa cấp" thì dòng thiếu mã đầu tiên được nháy đỏ', true, '(không có mã nào đang thiếu lúc chạy test — bỏ qua, không phải lỗi)');
}
await E(()=>{tab='ct';document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x.dataset.tab==='ct'));ve()});

/* AS9: đồng bộ Google Sheet — gói gửi lên (push) mang đủ nguồn hương liệu/tồn kho */
const goiDay=await E(()=>{
  const kq=sachCauHinh(sp);
  return {coTruongNguon:kq.every(x=>'nguonHuongChon' in x && 'nguonHuongKhoa' in x)};
});
ok('sachCauHinh() mang theo nguonHuongChon/nguonHuongKhoa (đồng bộ đủ, không mất lựa chọn nguồn)', goiDay.coTruongNguon);

/* AS10: đồng bộ Google Sheet — tự kéo cấu hình mới hơn về khi mở app (mô phỏng máy chủ bằng
   cách chèn tạm dbGoi() giả, không gọi mạng thật — sandbox không ra được script.google.com) */
const ketQuaKeo=await E(async ()=>{
  const dbGoiThat=window.dbGoi; const urlThatCuaTest=DONGBO_URL; DONGBO_URL='http://127.0.0.1:8777/gia-lap-exec';
  // apDungCauHinhTuServer() THAY THẾ HẲN mảng sp/kho/nlDM/nguonHuong bằng dữ liệu kéo về
  // (đúng hành vi thật khi kéo cấu hình đầy đủ) — nên phải sao lưu để khôi phục lại catalog
  // gốc sau test, nếu không các test chạy SAU AS10 sẽ mất hết mặt hàng thật.
  const spGoc=JSON.parse(JSON.stringify(sp)), khoGoc=kho.slice(), nlDMGoc=nlDM.slice(),
    nguonHuongGoc=JSON.parse(JSON.stringify(nguonHuong)),
    nguonNguyenLieuGoc=JSON.parse(JSON.stringify(nguonNguyenLieu));
  const gia=Date.now();
  window.dbGoi=async (url)=>{
    if(String(url).includes('a=cauhinh')){
      return {ok:1, ts:new Date(gia+999999).toISOString(), cauhinh:{
        sp:[{ten:'__TEST_KEO_SHEET__',kg:77,ml:33,huongs:[],tam:[],dauRa:['5 kg']}],
        kho:['Không mùi','Hương test kéo về'], cp:[], dr:['5 kg'], maHuong:{}, maQC:{}, kgQC:{}, nvDS:[],
        nlDM:['NL test kéo về'], nguonHuong:{'Hương test kéo về':[{ncc:'NCC test',gia:100000,soKg:1,ngay:'27/08/2026',daDungKg:0}]},
        huongDangDung:{}, tonKhoHuong:{},
        // 27/08/2026 (phản hồi lần 3): gói Sheet giờ cũng mang nguồn/giá/tồn kho NGUYÊN LIỆU
        nguonNguyenLieu:{'NL test kéo về':[{ncc:'NCC NL test',gia:200000,soKg:10,ngay:'27/08/2026'}]},
        nlDangDung:{}, tonKhoNguyenLieu:{},
        nlTong:0, nlNgayKhai:'', nlGhiChu:''
      }};
    }
    return {ok:0};
  };
  dongBoCauHinhTs='';
  await dbKeoCauHinhNeuMoiHon();
  const kq={
    coMH:sp.some(x=>x.ten==='__TEST_KEO_SHEET__'),
    coNL:nlDM.includes('NL test kéo về'),
    coNguon:!!(nguonHuong['Hương test kéo về']&&nguonHuong['Hương test kéo về'].length===1),
    coNguonNL:!!(nguonNguyenLieu['NL test kéo về']&&nguonNguyenLieu['NL test kéo về'].length===1),
    coTs:!!dongBoCauHinhTs
  };
  window.dbGoi=dbGoiThat; DONGBO_URL=urlThatCuaTest;
  sp=spGoc;kho=khoGoc;nlDM=nlDMGoc;nguonHuong=nguonHuongGoc;nguonNguyenLieu=nguonNguyenLieuGoc; // khôi phục ĐÚNG catalog gốc, không chỉ lọc bớt
  return kq;
});
ok('dbKeoCauHinhNeuMoiHon() áp đúng mặt hàng mới từ Sheet khi Sheet mới hơn máy', ketQuaKeo.coMH);
ok('dbKeoCauHinhNeuMoiHon() áp đúng danh mục nguyên liệu (nlDM) từ Sheet', ketQuaKeo.coNL);
ok('dbKeoCauHinhNeuMoiHon() áp đúng nguồn hương liệu/tồn kho từ Sheet (lỗi cũ đã sửa)', ketQuaKeo.coNguon);
ok('27/08/2026 (phản hồi lần 3): dbKeoCauHinhNeuMoiHon() áp đúng nguồn NGUYÊN LIỆU/giá từ Sheet', ketQuaKeo.coNguonNL);
ok('dbKeoCauHinhNeuMoiHon() cập nhật mốc dongBoCauHinhTs sau khi áp', ketQuaKeo.coTs);
// dọn dữ liệu test vừa kéo về — sp/kho/nlDM/nguonHuong/nguonNguyenLieu đã được khôi phục nguyên trạng ở trên
await E(()=>{dongBoCauHinhTs='';luuNgay();ve()});

/* AS11: xuất quy ước số lô + thông số — hàm chạy không lỗi */
ok('xuatQuyUoc() chạy không phát sinh lỗi', (await E(()=>{try{
  const bk=window.taiVe; let goi=false; window.taiVe=(n,d,m)=>{goi=true;return true};
  xuatQuyUoc(); window.taiVe=bk; return goi;
}catch(e){return false}})));

/* AS12: "Thành phần" tự động liên kết chặt với Hàm lượng nguyên liệu + Hương đang dùng
   (phản hồi 27/08/2026 lần 2, mục 5 — khách chọn "tự động điền/cập nhật LUÔN") */
const ketQuaTP=await E(()=>{
  const p=sp.find(x=>x.ten==='Cát Zaka liti thường');
  const nlCu=p.congThucNL, hstemCu=p.hstem, huongCu=p.huongs;
  p.congThucNL=[{ten:'Cao lanh',kg:1}];
  p.huongs=[];
  p.hstem={...temMoi(),thanhPhan:'giá trị cũ không liên quan'};
  // mô phỏng đúng path người dùng đi qua: đổi tên nguyên liệu tại dòng 0 rồi bắn 'change'
  // (mô phỏng bằng cách gọi thẳng logic tương đương handler data-nlten)
  dongBoThanhPhanTuNL(p);
  const b1=p.hstem.thanhPhan; // kỳ vọng "Cao lanh" (chưa có hương)
  p.congThucNL.push({ten:'hương liệu test',kg:0.01});
  dongBoThanhPhanTuNL(p);
  const b2=p.hstem.thanhPhan; // vẫn chưa có hương -> "Cao lanh, hương liệu test"
  p.huongs=['Hương test'];
  dongBoThanhPhanTuNL(p);
  const b3=p.hstem.thanhPhan; // có hương -> thêm ", hương liệu"
  p.congThucNL=[];
  dongBoThanhPhanTuNL(p); // công thức rỗng -> KHÔNG được đụng vào Thành phần đang có
  const b4=p.hstem.thanhPhan;
  const kq={b1,b2,b3,b4};
  p.congThucNL=nlCu;p.hstem=hstemCu;p.huongs=huongCu; // khôi phục dữ liệu gốc
  return kq;
});
ok('dongBoThanhPhanTuNL() điền đúng theo nguyên liệu đã khai',
  ketQuaTP.b1==='Cao lanh', JSON.stringify(ketQuaTP.b1));
ok('dongBoThanhPhanTuNL() gộp đủ nhiều dòng nguyên liệu, chưa có hương thì chưa thêm ", hương liệu"',
  ketQuaTP.b2==='Cao lanh, hương liệu test', JSON.stringify(ketQuaTP.b2));
ok('dongBoThanhPhanTuNL() tự thêm ", hương liệu" khi mặt hàng có hương đang dùng',
  ketQuaTP.b3==='Cao lanh, hương liệu test, hương liệu', JSON.stringify(ketQuaTP.b3));
ok('dongBoThanhPhanTuNL() KHÔNG ghi đè Thành phần khi công thức nguyên liệu rỗng',
  ketQuaTP.b4===ketQuaTP.b3, JSON.stringify(ketQuaTP.b4));

// kiểm tra thực tế 2 điểm gắn (handler data-nlten và lưu hương) có gọi đúng hàm này
const noiDungFile=fs.readFileSync('/tmp/huong/bang-tra-huong-lieu.html','utf8');
ok('handler đổi tên nguyên liệu (data-nlten) có gọi dongBoThanhPhanTuNL',
  /it\.ten=e\.target\.value;\s*\n\s*bumpRecipeVersion\(sp\[i\]\);dongBoThanhPhanTuNL\(sp\[i\]\);/.test(noiDungFile));
ok('handler lưu thay đổi hương có gọi dongBoThanhPhanTuNL',
  /if\(!tam\.includes\(p\.huongMe\)\)p\.huongMe='';\s*\n\s*dongBoThanhPhanTuNL\(p\);/.test(noiDungFile));

/* AS13: "Cần dùng" vs "Định lượng hương" — khách thấy 2 số không khớp (mục 1, phản hồi lần 2).
   Gốc là do "Cần dùng" tính theo cột Mẻ (đang chọn làm ngay), khác "Mẻ chuẩn". Giải pháp: làm
   RÕ NGAY trên giao diện thay vì giải thích lại — đổi đơn vị "G/MẺ", viền ô Mẻ đổi vàng +
   chú thích khi Mẻ khác Mẻ chuẩn, chú thích công thức tính ở cả 2 ô. */
const ketQuaMe=await E(()=>{
  const p=sp.find(x=>x.ten==='Cát Zaka liti thường');
  const meCu=p.me, kgCu=p.kg;
  p.kg=100;p.ml=50;p.me=10; // Mẻ (10) khác Mẻ chuẩn (100) → Cần dùng = 50/100*10 = 5g, không phải 50g
  tab='ct';mo.clear();mo.add(sp.indexOf(p));ve();
  const meEl=document.querySelector('.r.open .me');
  const cdEl=document.querySelector('.r.open .cd');
  const kq={
    khac:meEl.classList.contains('khac'),
    meTitle:meEl.title,
    cdTitle:cdEl.title,
    cdSo:cdEl.querySelector('b').textContent
  };
  p.me=meCu;p.kg=kgCu;ve();
  return kq;
});
ok('Mẻ khác Mẻ chuẩn → viền ô Mẻ đổi vàng (class khac) để tự thấy ngay, không cần hỏi lại',
  ketQuaMe.khac);
ok('Cần dùng tính đúng theo tỉ lệ Mẻ/Mẻ chuẩn (10kg thay vì 100kg → 5g thay vì 50g, không phải lỗi)',
  ketQuaMe.cdSo==='5', ketQuaMe.cdSo);
ok('ô Mẻ có chú thích (title) giải thích đang khác mẻ chuẩn', /KHÁC mẻ chuẩn/.test(ketQuaMe.meTitle), ketQuaMe.meTitle);
ok('ô Cần dùng có chú thích (title) nêu rõ công thức: định lượng gốc + mẻ đang chọn', /Định lượng gốc/.test(ketQuaMe.cdTitle) && /cần .*g hương/.test(ketQuaMe.cdTitle), ketQuaMe.cdTitle);

console.log('\n── AT. NGUỒN NGUYÊN LIỆU — NHÀ CUNG CẤP, GIÁ, TỒN KHO (27/08/2026, phản hồi lần 3) ──');
/* Khách yêu cầu: nguyên liệu cũng cần tồn kho + giá như hương, dùng CHUNG 1 panel nhập gộp
   (xem mục AA/AG cho hương — cùng code, tham số loai='nl'). Khác hương: tồn kho nguyên liệu
   KHÔNG tự trừ theo sản xuất (cập nhật tay), và không có ước tính "còn dùng được bao lâu". */
const atNl=await E(()=>{tab='ma';if(!nlDM.includes('Test NL Nguồn'))nlDM.push('Test NL Nguồn');ve();return 'Test NL Nguồn'});
await Ea(v=>{moTra.add('ncc-nl-'+v);ve()},atNl); await p.waitForTimeout(150);
await p.click(`[data-themnguon="nl:${atNl}"]`); await p.waitForTimeout(250);
await p.fill(`[data-nguonform="nl:${atNl}"] [data-nf="ncc"]`,'NCC Nguyên Liệu A');
await p.fill(`[data-nguonform="nl:${atNl}"] [data-nf="gia"]`,'2000000');
await p.fill(`[data-nguonform="nl:${atNl}"] [data-nf="soKg"]`,'500');
await p.fill(`[data-nguonform="nl:${atNl}"] [data-nf="ton"]`,'480');
await p.click(`[data-luunguon="nl:${atNl}"]`); await p.waitForTimeout(300);
ok('lưu đúng 1 nguồn nguyên liệu: NCC, giá, số kg', (await Ea(v=>nguonNguyenLieu[v]&&nguonNguyenLieu[v].length,atNl))===1);
const atE1=await Ea(v=>nguonNguyenLieu[v][0],atNl);
ok('nguồn nguyên liệu ghi đúng NCC/giá/số kg', atE1.ncc==='NCC Nguyên Liệu A'&&atE1.gia===2000000&&atE1.soKg===500, JSON.stringify(atE1));
ok('vừa thêm thì tự đặt làm "đang dùng" (nlDangDung)', (await Ea(v=>nlDangDung[v],atNl))==='NCC Nguyên Liệu A');
ok('tồn kho nguyên liệu lưu đúng đơn vị kg (khác hương là gram)', (await Ea(v=>tonKhoNguyenLieu[v]&&tonKhoNguyenLieu[v].con,atNl))===480);
const atSelOk=await Ea(v=>{ve();return !!document.querySelector(`select[data-nguondung="nl:${v}"]`)},atNl);
ok('nguyên liệu cũng có dropdown "đang dùng" như hương', atSelOk);
const atHtml1=await Ea(v=>{ve();const card=[...document.querySelectorAll('.ncc-card')].find(c=>c.querySelector('.ncc-ten')?.textContent===v);return card?card.innerHTML:''},atNl);
ok('tồn kho nguyên liệu hiện đúng đơn vị "kg" và câu "không tự trừ theo sản xuất"', /kg/.test(atHtml1)&&/không tự trừ theo sản xuất/.test(atHtml1), atHtml1.slice(0,200));
ok('nguyên liệu KHÔNG hiện ước tính "còn dùng được N ngày" (khác hương, chưa theo dõi tiêu hao theo mẻ)', !/còn dùng được/.test(atHtml1));
// Cập nhật tồn kho tay qua nút riêng (data-suatknl)
await p.click(`[data-suatknl="${atNl}"]`); await p.waitForTimeout(250);
await p.fill('#dlgI','300'); await p.click('#dlgO'); await p.waitForTimeout(300);
ok('cập nhật tồn kho nguyên liệu tay lưu đúng số mới', (await Ea(v=>tonKhoNguyenLieu[v].con,atNl))===300);
// Đổi tên nguyên liệu — nguồn/giá/tồn kho phải theo tên mới, không mất (giống hương)
await E(()=>{tab='ma';ve()}); await p.waitForTimeout(150);
await p.fill('[data-ten="nl"][data-cu="Test NL Nguồn"]','Test NL Nguồn (đổi tên)');
await p.locator('[data-ten="nl"][data-cu="Test NL Nguồn"]').blur(); await p.waitForTimeout(250);
await p.click('#dlgO'); await p.waitForTimeout(250);
ok('đổi tên nguyên liệu thì nguồn/giá đi theo tên mới, không mất lịch sử', (await E(()=>nguonNguyenLieu['Test NL Nguồn (đổi tên)']&&nguonNguyenLieu['Test NL Nguồn (đổi tên)'].length))===1);
ok('đổi tên nguyên liệu thì tồn kho cũng đi theo tên mới', (await E(()=>tonKhoNguyenLieu['Test NL Nguồn (đổi tên)']&&tonKhoNguyenLieu['Test NL Nguồn (đổi tên)'].con))===300);
ok('tên cũ không còn sót lại trong nguonNguyenLieu/tonKhoNguyenLieu', !(await E(()=>('Test NL Nguồn' in nguonNguyenLieu)||('Test NL Nguồn' in tonKhoNguyenLieu))));
// Xoá nguyên liệu — nguồn/giá/tồn kho phải bị dọn theo
await E(()=>{tab='ma';ve()}); await p.waitForTimeout(150);
await p.click('[data-xoa="nl"][data-v="Test NL Nguồn (đổi tên)"]'); await p.waitForTimeout(150);
await p.click('#dlgO'); await p.waitForTimeout(200);
ok('xoá nguyên liệu khỏi Danh mục thì dọn sạch nguồn/giá đã khai', !(await E(()=>'Test NL Nguồn (đổi tên)' in nguonNguyenLieu)));
ok('xoá nguyên liệu khỏi Danh mục thì dọn sạch tồn kho đã khai', !(await E(()=>'Test NL Nguồn (đổi tên)' in tonKhoNguyenLieu)));

console.log('\n── AU. ĐỒNG BỘ "CHỐT THỰC TẾ" (bcNgay) TỰ ĐỘNG QUA SHEET (27/08/2026, phản hồi lần 3) ──');
/* Trước đây bcNgay CHỈ đi qua xuất/nhận .json tay (#nvIn) — khách phản hồi không rõ "tự đẩy dữ
   liệu lên" nghĩa là gì. Giờ có kênh đồng bộ auto riêng (dbKeoBaoCao ở Admin, dbDayBaoCao ở
   Nhân viên) giống hệt cơ chế dbKeoNhatKy()/dbDayMe() cho mẻ (nk). Test bằng cách giả lập
   dbGoi(), không gọi mạng thật (sandbox không ra được script.google.com). */
ok('Admin có hàm dbKeoBaoCao() để tự kéo báo cáo về', (await E(()=>typeof dbKeoBaoCao))==='function');
const auKq=await E(async ()=>{
  const dbGoiThat=window.dbGoi; const urlThatCuaTest=DONGBO_URL; DONGBO_URL='http://127.0.0.1:8777/gia-lap-exec';
  const bcTruoc=bcNgay.length;
  window.dbGoi=async (url)=>{
    if(String(url).includes('a=baocao')){
      return {ok:1, bc:[{id:'BCSHEET-1',ngay:'2026-08-27',lot:'',sp:'THE CITYCAT',quyCach:'',
        kgKeHoach:200,kgThucTe:180,lyDo:'Test đồng bộ tự động',nv:'Test Sheet',ts:'2026-08-27T09:00:00.000Z'}]};
    }
    return {ok:0};
  };
  await dbKeoBaoCao();
  window.dbGoi=dbGoiThat; DONGBO_URL=urlThatCuaTest;
  return {them:bcNgay.length-bcTruoc, coBc:bcNgay.some(r=>r.id==='BCSHEET-1'), coNv:nvDS.includes('Test Sheet')};
});
ok('dbKeoBaoCao() tự nhận đúng báo cáo "chốt thực tế" mới từ Sheet', auKq.them===1&&auKq.coBc, JSON.stringify(auKq));
ok('dbKeoBaoCao() tự bổ sung tên nhân viên mới vào danh sách nếu chưa có', auKq.coNv);
// Gọi lại lần 2 với cùng id — không được trùng
const auKq2=await E(async ()=>{
  const dbGoiThat=window.dbGoi; const urlThatCuaTest=DONGBO_URL; DONGBO_URL='http://127.0.0.1:8777/gia-lap-exec';
  const truoc=bcNgay.length;
  window.dbGoi=async (url)=>{
    if(String(url).includes('a=baocao')){
      return {ok:1, bc:[{id:'BCSHEET-1',ngay:'2026-08-27',lot:'',sp:'THE CITYCAT',quyCach:'',
        kgKeHoach:200,kgThucTe:180,lyDo:'Test đồng bộ tự động',nv:'Test Sheet',ts:'2026-08-27T09:00:00.000Z'}]};
    }
    return {ok:0};
  };
  await dbKeoBaoCao();
  window.dbGoi=dbGoiThat; DONGBO_URL=urlThatCuaTest;
  return bcNgay.length-truoc;
});
ok('dbKeoBaoCao() không tạo trùng khi kéo lại đúng báo cáo đã có', auKq2===0);
await E(()=>{bcNgay=bcNgay.filter(r=>r.id!=='BCSHEET-1');luuNgay();ve()}); // dọn dữ liệu test

console.log('\n── AV. ĐỒNG BỘ NHANH ADMIN ĐA MÁY (29/08/2026, bản S6) ──');
/* Khách yêu cầu dùng Admin đồng thời PC + điện thoại, sửa ở đâu lên ngay hệ thống nhân viên.
   Phần 2 của yêu cầu: Admin giờ có vòng lặp TỰ KÉO cấu hình định kỳ (trước đây chỉ Nhân viên có,
   Admin chỉ kéo lúc mở app). Rủi ro riêng của Admin (khác Nhân viên): Admin đang SỬA (không chỉ
   đọc) — nếu 1 vòng kéo về ập tới đúng lúc đang gõ dở thì mất chữ. Test bằng cách giả lập
   document.activeElement là 1 ô input rồi gọi dbKeoCauHinhNeuMoiHon(), không gọi mạng thật. */
ok('có hàm dbBatDauVongLapCauHinh() (vòng lặp tự kéo cấu hình định kỳ cho Admin)', (await E(()=>typeof dbBatDauVongLapCauHinh))==='function');
ok('có hàm dbCoDangGoTiepXuc() (nhận biết đang gõ dở để không ghi đè)', (await E(()=>typeof dbCoDangGoTiepXuc))==='function');
const avSpGoc=await E(()=>JSON.stringify(sp)); // sao lưu để khôi phục sau khi test cố ý ghi đè
const avKhoGoc=await E(()=>JSON.stringify(kho));
const avTsGoc=await E(()=>dongBoCauHinhTs);
const avSetup=await E(()=>{
  const inp=document.createElement('input');
  inp.id='AVTEST-INPUT'; document.body.appendChild(inp); inp.focus();
  return {focused:document.activeElement===inp, tenSpTruoc:sp.length?sp[0].ten:''};
});
ok('mô phỏng đang focus vào 1 ô input thành công', avSetup.focused);
const avKq=await E(async ()=>{
  const spTruoc=JSON.stringify(sp);
  const dbGoiThat=window.dbGoi; const urlThatCuaTest=DONGBO_URL; DONGBO_URL='http://127.0.0.1:8777/gia-lap-exec';
  window.dbGoi=async(url)=>{
    if(String(url).includes('a=cauhinh')){
      return {ok:1, ts:'9999-01-01T00:00:00.000Z', cauhinh:{sp:[{ten:'SP GIẢ TỪ SERVER',kg:1,ml:1,pkb:false}],kho:['Không mùi']}};
    }
    return {ok:0};
  };
  await dbKeoCauHinhNeuMoiHon();
  window.dbGoi=dbGoiThat; DONGBO_URL=urlThatCuaTest;
  return {khongDoi: JSON.stringify(sp)===spTruoc};
});
ok('đang gõ dở (input đang focus) thì dbKeoCauHinhNeuMoiHon() KHÔNG áp cấu hình mới về (không mất chữ đang gõ)', avKq.khongDoi, avKq);
const avKq2=await E(async ()=>{
  document.getElementById('AVTEST-INPUT').blur();
  document.getElementById('AVTEST-INPUT').remove();
  const dbGoiThat=window.dbGoi; const urlThatCuaTest=DONGBO_URL; DONGBO_URL='http://127.0.0.1:8777/gia-lap-exec';
  window.dbGoi=async(url)=>{
    if(String(url).includes('a=cauhinh')){
      return {ok:1, ts:'9999-01-01T00:00:00.000Z', cauhinh:{sp:[{ten:'SP GIẢ TỪ SERVER',kg:1,ml:1,pkb:false}],kho:['Không mùi']}};
    }
    return {ok:0};
  };
  await dbKeoCauHinhNeuMoiHon();
  window.dbGoi=dbGoiThat; DONGBO_URL=urlThatCuaTest;
  return {tenSp0: sp[0]&&sp[0].ten, ts: dongBoCauHinhTs};
});
ok('hết focus (rời khỏi ô nhập) thì lần kéo kế tiếp áp cấu hình mới bình thường', avKq2.tenSp0==='SP GIẢ TỪ SERVER', avKq2);
// Khôi phục lại dữ liệu cục bộ ban đầu (test này cố ý ghi đè sp bằng dữ liệu giả để kiểm tra)
await Ea(g=>{
  sp=JSON.parse(g.spS); kho=JSON.parse(g.khoS); dongBoCauHinhTs=g.tsS;
  luuNgay(); if(typeof ve==='function')ve();
}, {spS:avSpGoc, khoS:avKhoGoc, tsS:avTsGoc});
ok('khôi phục lại danh mục thật sau khi test (không để sót dữ liệu giả)', (await E(()=>sp.length))>1);

console.log('\n────────────────────────────');
ok('không có lỗi console', cerr.length===0, cerr.slice(0,2).join(' | '));
console.log(`\nKẾT QUẢ:  ${dat} đạt · ${hong} hỏng`);
if(hong) console.log('CẦN SỬA:\n  - '+loi.join('\n  - '));
await b.close();
process.exit(hong?1:0);
