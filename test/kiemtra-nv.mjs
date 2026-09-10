/* BỘ KIỂM TRA — Peroma bản nhân viên.  Chạy: node kiemtra-nv.mjs */
import {chromium} from 'playwright';
import fs from 'fs';
const CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe';
let dat=0,hong=0;const loi=[];
const ok=(t,c,g='')=>{c?dat++:(hong++,loi.push(t));console.log(`${c?'✓':'✗ HỎNG'}  ${t}${g?'  → '+g:''}`)};

/* 10/09/2026 — SỬA TEST PHỤ THUỘC THỜI GIAN (lỗi có sẵn, không do bản S7/R5).
   Số lô = SS HH QQ MMYY, phần MMYY lấy từ NGÀY SẢN XUẤT (xem sinhLot()). Mẻ ghi qua giao diện
   trong bộ test này không ấn định ngày nên app dùng ngày hôm nay → MMYY là tháng chạy test.
   Trước đây test viết cứng '0826' (tháng 8/2026), nên từ 01/09/2026 trở đi là hỏng dù app vẫn
   chạy đúng — đã kiểm chứng bằng cách chạy lại bản gốc chưa sửa: hỏng y hệt 2 test này.
   Chỉ áp cho mẻ ghi qua giao diện. Các chỗ nk.push() thủ công có ngaysx cố định '2026-08-25'
   thì GIỮ NGUYÊN '1101070826' vì chúng tự đặt ngày, không phụ thuộc hôm nay. */
const _homNay=new Date();
const MMYY_NAY=String(_homNay.getMonth()+1).padStart(2,'0')+String(_homNay.getFullYear()).slice(-2);
const LOT_UI='110107'+MMYY_NAY;              // lô của mẻ ghi qua giao diện
const LOT_UI_CACH='11 01 07 '+MMYY_NAY;      // dạng có dấu cách khi hiển thị/in

// cấu hình giả lập bản admin xuất ra
const CAU_HINH={v:8,sp:[
 {ten:'Citycat',kg:100,ml:100,me:100,maSP:'11',pkb:true,pkbChat:'DD A',pkbPhut:'5',pkbCT:'Nước 8L + A 350ml',
  huongs:['Hương Chanh','Hương Lài'],tam:[],dauRa:['5 kg','1 kg'],tt:'ok',nguyenlieu:'',
  congThucNL:[{ten:'Bentonite',kg:90},{ten:'Phụ gia tạo mùi',kg:10}],
  hstem:{tenVN:'Cát vệ sinh THE CITYCAT',tenEN:'',thanhPhan:'Bentonite, hương liệu',congDung:'Vón cục, khử mùi',
    kichThuoc:'0,5–3,5 mm',doAm:'< 10%',hdsd:'Đổ khay 5–7 cm',baoQuan:'Khô ráo',xuatXu:'Sản xuất tại Việt Nam',
    soTCCS:'01:2026/KH',hsdNam:'10'}},
 {ten:'Cát tạm ngưng',kg:100,ml:50,me:100,maSP:'41',pkb:false,huongs:['Hương Chanh'],tam:[],
  dauRa:['5 kg'],tt:'tam',ttLyDo:'Chờ nguyên liệu',hstem:{}},
 {ten:'Cát đình chỉ',kg:100,ml:50,me:100,maSP:'42',pkb:false,huongs:['Hương Chanh'],tam:[],
  dauRa:['5 kg'],tt:'dinh',ttLyDo:'Lỗi chất lượng',hstem:{}}],
 kho:['Hương Chanh','Hương Lài'],cp:[{ten:'DD A',ct:'Nước 10L + A 200ml'}],dr:['5 kg','1 kg'],
 maHuong:{'Hương Chanh':'01','Hương Lài':'04'},maQC:{'5 kg':'07','1 kg':'04'},
 kgQC:{'5 kg':5,'1 kg':1},nvDS:['Toàn','Chú Cảnh']};
fs.writeFileSync('/tmp/nv/cauhinh.json',JSON.stringify(CAU_HINH));

const b=await chromium.launch({executablePath:CHROME});
const ctx=await b.newContext({acceptDownloads:true});
const p=await ctx.newPage(); const cerr=[];
p.on('pageerror',e=>cerr.push('PAGEERROR '+e.message));
p.on('console',m=>{if(m.type()==='error')cerr.push(m.text())});
await p.goto('http://127.0.0.1:8777/nv/peroma-nhanvien.html'); await p.waitForTimeout(700);
const E=f=>p.evaluate(f); const Ea=(f,a)=>p.evaluate(f,a);

console.log('\n── A. LẦN ĐẦU MỞ ──');
ok('nhắc nạp cấu hình', /Nạp cấu hình/.test(await E(()=>$('view').innerText)));
ok('không có mặt hàng nào', (await E(()=>sp.length))===0);

console.log('\n── B. NẠP CẤU HÌNH ──');
await p.click('[data-tab="dl"]'); await p.waitForTimeout(300);
await p.setInputFiles('#fIn','/tmp/nv/cauhinh.json'); await p.waitForTimeout(400);
await p.click('#dlgO'); await p.waitForTimeout(500);
ok('nạp được 3 mặt hàng', (await E(()=>sp.length))===3);
ok('nạp danh mục nhân viên', (await E(()=>nvDS.length))===2);
ok('nạp mã quy cách', (await E(()=>maQC['5 kg']))==='07');

console.log('\n── C. CHỌN TÊN ──');
await p.click('#whoBtn'); await p.waitForTimeout(300);
await p.click('[data-cn="Toàn"]'); await p.waitForTimeout(250);
await p.click('#dlgO'); await p.waitForTimeout(300);
ok('nhớ tên nhân viên', (await E(()=>toi))==='Toàn');

console.log('\n── D. KHÓA QUYỀN ──');
const html=fs.readFileSync('/tmp/nv/peroma-nhanvien.html','utf8');
ok('không có tab Danh mục', !/data-tab="ma"/.test(html));
ok('không có hàm đổi tên', !/function doiTen/.test(html));
ok('không sửa được định mức', !/data-f="ml"|data-f="kg"/.test(html));
ok('không có nút xoá mặt hàng', !/data-xoasp|Xoá mặt hàng/.test(html));

console.log('\n── E. TRẠNG THÁI SẢN XUẤT ──');
await p.click('[data-tab="me"]'); await p.waitForTimeout(300);
await p.click('[data-sp="2"]'); await p.waitForTimeout(350);
ok('chặn mặt hàng đình chỉ', /đình chỉ sản xuất/i.test(await E(()=>$('view').innerText)));
await p.click('[data-back]'); await p.waitForTimeout(300);
await p.click('[data-sp="1"]'); await p.waitForTimeout(350);
ok('cảnh báo mặt hàng tạm ngưng', /tạm ngưng/i.test(await E(()=>$('view').innerText)));
await p.click('[data-back]'); await p.waitForTimeout(300);

console.log('\n── F. GÕ SỐ KG (27/08/2026, phản hồi lần 4: bỏ hẳn cảnh báo "gõ nhầm số") ──');
/* Khách đọc đi đọc lại vẫn không hiểu cảnh báo "lệch rất xa mẻ chuẩn" có tác dụng gì, và khung
   đỏ tạo cảm giác đang làm sai — đã bỏ hẳn cả khung đỏ (class xau) lẫn đoạn giải thích. */
await p.click('[data-sp="0"]'); await p.waitForTimeout(350);
await p.click('[data-f="sl"]'); await p.keyboard.type('1000',{delay:60}); await p.waitForTimeout(350);
ok('27/08/2026 (phản hồi lần 4): gõ số kg lệch xa mẻ chuẩn KHÔNG còn hiện cảnh báo nào nữa', !/lệch rất xa/.test(await E(()=>$('view').innerText)));
ok('27/08/2026 (phản hồi lần 4): ô nhập kg KHÔNG còn viền đỏ (bỏ class "xau")', !(await E(()=>document.querySelector('[data-f="sl"]').classList.contains('xau'))));
await p.keyboard.press('Control+a'); await p.keyboard.type('100',{delay:60}); await p.waitForTimeout(350);
ok('tính hương liệu đúng', /100/.test(await E(()=>document.querySelector('.big .v').textContent)), '100kg → 100ml');
ok('gõ đủ 3 chữ số, không mất con trỏ', (await E(()=>sp[0].sl))==='100');

console.log('\n── F2. HÀM LƯỢNG NGUYÊN LIỆU — CHỈ XEM, KHÔNG SỬA (26/08/2026-N) ──');
/* Tính năng mới: admin khai hàm lượng nguyên liệu (kg/mẻ chuẩn), nhân viên chỉ xem đã quy đổi
   theo đúng số kg đang sản xuất — không có ô nào cho nhân viên sửa được. */
const f2Txt=await E(()=>$('view').innerText);
ok('hiện đúng tên + kg từng nguyên liệu (100kg = đúng mẻ chuẩn, không quy đổi)',
  /Bentonite/.test(f2Txt)&&/90/.test(f2Txt)&&/Phụ gia tạo mùi/.test(f2Txt)&&/10/.test(f2Txt), f2Txt.match(/Hàm lượng[^\n]*\n[^\n]*\n[^\n]*/)?.[0]);
ok('không có ô nhập nào cho hàm lượng nguyên liệu (nhân viên không sửa được)',
  (await E(()=>document.querySelectorAll('[data-nlten],[data-nlkg],[data-nladd],[data-nldel]').length))===0);
await p.click('[data-f="sl"]'); await p.keyboard.press('Control+a'); await p.keyboard.type('50',{delay:60}); await p.waitForTimeout(350);
const f2Txt2=await E(()=>$('view').innerText);
ok('đổi sản lượng còn 50kg (nửa mẻ chuẩn) thì hàm lượng tự quy đổi còn một nửa (45kg/5kg)',
  /45/.test(f2Txt2)&&/\b5\b/.test(f2Txt2), f2Txt2.match(/Hàm lượng[^\n]*\n[^\n]*\n[^\n]*/)?.[0]);
await p.keyboard.press('Control+a'); await p.keyboard.type('100',{delay:60}); await p.waitForTimeout(350);

console.log('\n── G. PHÂN BỔ ──');
await p.click('[data-h="Hương Chanh"]'); await p.waitForTimeout(350);
await p.click('[data-pbadd]'); await p.waitForTimeout(400);
ok('dòng đầu tự nhận kg', (await E(()=>sp[0].pb[0].kg))==='100');
ok('hiện số bao', /20 bao/.test(await E(()=>$('view').innerText)), '100 ÷ 5');
ok('hiện số lô', /11 01 07 0826|11 01 07/.test(await E(()=>$('view').innerText).then(t=>t.replace(/\s+/g,' '))) || /1101 07/.test(''), await E(()=>{const m=$('view').innerText.match(/Số lô\s+([\d ]+)/);return m?m[1].trim():'—'}));
const gDom=await E(()=>$('view').innerHTML);
ok('25/08/2026-J: khối "Đóng gói" nằm TRƯỚC khối "Phiếu công thức" trong màn pha mẻ',
  gDom.indexOf('Đóng gói')>=0 && gDom.indexOf('Phiếu công thức')>gDom.indexOf('Đóng gói'),
  `Đóng gói@${gDom.indexOf('Đóng gói')} · Phiếu công thức@${gDom.indexOf('Phiếu công thức')}`);

console.log('\n── G2. PHIẾU CÔNG THỨC — BẮT IN + XÁC NHẬN TRƯỚC KHI GHI (25/08/2026) ──');
ok('chưa in/xác nhận thì nút Ghi mẻ bị khoá', await E(()=>document.querySelector('[data-kiem]').disabled));
// 27/08/2026 (phản hồi lần 4): trước khi xác nhận, nút phiếu ghi rõ đây là bản in ĐỂ KIỂM TRA
ok('27/08/2026 (phản hồi lần 4): trước khi xác nhận, nút ghi "Phiếu xác nhận công thức"',
  (await E(()=>document.querySelector('[data-inphieu]').textContent))==='Phiếu xác nhận công thức');
await E(()=>{window.print=()=>{window.__inCT=(window.__inCT||0)+1}});
await p.click('[data-inphieu]'); await p.waitForTimeout(350);
ok('bấm In phiếu công thức có gọi print()', (await E(()=>window.__inCT))===1);
ok('sau khi in, đánh dấu daInPhieu nhưng CHƯA tự xác nhận', await E(()=>sp[0].daInPhieu===true && sp[0].xacNhanCT===false));
ok('nút Ghi mẻ vẫn khoá cho tới khi xác nhận', await E(()=>document.querySelector('[data-kiem]').disabled));
const g2Phieu1=await E(()=>$('temIn').innerHTML);
ok('25/08/2026-I: phiếu công thức có số lô', /Số lô/.test(g2Phieu1)&&g2Phieu1.replace(/s+/g,' ').includes(LOT_UI_CACH), 'mong đợi: '+LOT_UI_CACH);
ok('25/08/2026-J: phiếu có dòng "Quy cách đóng gói" riêng (không còn "5 kg: ..." trần trụi)',
  /Quy cách đóng gói/.test(g2Phieu1), g2Phieu1.match(/Quy cách đóng gói[^<]*<\/td><td>[^<]*/)?.[0]);
// 27/08/2026 (phản hồi lần 3): khách chốt "Quy cách đã có 5kg, số lô ghi thêm lần nữa làm gì?" —
// khi CHỈ có 1 quy cách, dòng Số lô không lặp lại "Quy cách X ·" nữa (đã có ở dòng riêng trên);
// chỉ lặp lại tiền tố này khi mặt hàng có NHIỀU quy cách/dòng cùng lúc (tránh nhầm lô của dòng nào).
ok('25/08/2026-J → 27/08/2026-lần3: dòng Số lô KHÔNG lặp lại "Quy cách X ·" khi chỉ có 1 quy cách (đã có dòng riêng ở trên)',
  /Số lô<\/td><td>Số lô <b>/.test(g2Phieu1) && !/Quy cách <b>5 kg<\/b> · Số lô/.test(g2Phieu1), g2Phieu1.match(/Số lô[^<]*<\/td><td>[^<]*/)?.[0]);
ok('25/08/2026-I: nhãn chữ ký đổi thành "người chịu trách nhiệm sản xuất" (không còn "người pha")', /Chữ ký người chịu trách nhiệm sản xuất/.test(g2Phieu1)&&!/Chữ ký người pha:/.test(g2Phieu1));
ok('26/08/2026-N: phiếu công thức in kèm dòng "Hàm lượng nguyên liệu" đúng số đã quy đổi', /Hàm lượng nguyên liệu/.test(g2Phieu1)&&/Bentonite[^<]*<b>90<\/b>/.test(g2Phieu1)&&/Phụ gia tạo mùi[^<]*<b>10<\/b>/.test(g2Phieu1), g2Phieu1.match(/Hàm lượng nguyên liệu[^<]*<\/td><td>[^<]*(?:<br>[^<]*)*/)?.[0]);
// 27/08/2026 (phản hồi lần 4): chú thích cũ SAI ("+ hương liệu mới bằng đủ") đã sửa lại — hương
// liệu KHÔNG tính vào trọng lượng nguyên liệu, các dòng nguyên liệu cộng lại đã đủ số kg đầu vào.
ok('27/08/2026 (phản hồi lần 4): chú thích không còn nói phải cộng thêm hương liệu mới đủ cân', !/\+ hương liệu\) mới bằng đủ/.test(g2Phieu1));
ok('27/08/2026 (phản hồi lần 4): chú thích nói rõ hương liệu KHÔNG tính vào trọng lượng nguyên liệu', /hương liệu tính riêng theo gram[^<]*không tính vào trọng lượng nguyên liệu/.test(g2Phieu1), g2Phieu1.match(/\* mỗi dòng[^<]*/)?.[0]);
// Đầu ra trên phiếu: chỉ 1 quy cách thì KHÔNG lặp lại "5 kg:" ở đầu (đã có dòng Quy cách đóng gói riêng)
ok('27/08/2026 (phản hồi lần 4): dòng "Đầu ra" trên phiếu không lặp lại "5 kg:" khi chỉ có 1 quy cách',
  /Đầu ra<\/td><td><b>\d+<\/b> bao × 5 kg/.test(g2Phieu1) && !/Đầu ra<\/td><td>5 kg: /.test(g2Phieu1), g2Phieu1.match(/Đầu ra[^<]*<\/td><td>[^<]*/)?.[0]);
await p.click('[data-xnct]'); await p.waitForTimeout(300);
ok('bấm Xác nhận công thức đúng thì mở khoá nút Ghi mẻ', await E(()=>sp[0].xacNhanCT===true && !document.querySelector('[data-kiem]').disabled));
ok('xác nhận lưu đúng tên người xác nhận', (await E(()=>sp[0].xacNhanCTBoi))==='Toàn');
ok('27/08/2026 (phản hồi lần 4): sau khi xác nhận, nút tự đổi lại thành "In phiếu công thức"',
  (await E(()=>document.querySelector('[data-inphieu]').textContent))==='In phiếu công thức');
// In lại phiếu SAU khi đã xác nhận (không sửa gì) → tự điền tên vào chỗ chữ ký, KHÔNG bắt xác nhận lại
await p.click('[data-inphieu]'); await p.waitForTimeout(350);
ok('in lại (không sửa gì) thì GIỮ NGUYÊN đã xác nhận, không bắt xác nhận lại', await E(()=>sp[0].xacNhanCT===true && !document.querySelector('[data-kiem]').disabled));
const g2Phieu2=await E(()=>$('temIn').innerHTML);
ok('25/08/2026-I: in lại sau khi xác nhận thì tự điền tên người xác nhận vào chữ ký', /Chữ ký người chịu trách nhiệm sản xuất: Toàn/.test(g2Phieu2), g2Phieu2.match(/Chữ ký[^<]*/)?.[0]);
// Sửa số liệu SAU khi đã xác nhận rồi in lại → phải bắt xác nhận lại (an toàn), không được giữ chữ ký cũ
await p.click('[data-f="sl"]'); await p.keyboard.press('Control+a'); await p.keyboard.type('120',{delay:50}); await p.waitForTimeout(300);
await p.click('[data-inphieu]'); await p.waitForTimeout(350);
ok('sửa số liệu SAU khi xác nhận rồi in lại thì BẮT xác nhận lại (an toàn dữ liệu)', await E(()=>sp[0].xacNhanCT===false && document.querySelector('[data-kiem]').disabled));
ok('27/08/2026 (phản hồi lần 4): mất xác nhận thì nút lại đổi về "Phiếu xác nhận công thức"',
  (await E(()=>document.querySelector('[data-inphieu]').textContent))==='Phiếu xác nhận công thức');
await p.click('[data-f="sl"]'); await p.keyboard.press('Control+a'); await p.keyboard.type('100',{delay:50}); await p.waitForTimeout(300);
await p.click('[data-inphieu]'); await p.waitForTimeout(350);
await p.click('[data-xnct]'); await p.waitForTimeout(300);

console.log('\n── H. GHI MẺ (27/08/2026, phản hồi lần 4: bỏ bước "Đọc lại trước khi ghi") ──');
/* Khách yêu cầu bỏ hẳn hộp thoại đọc lại — nút đổi tên "Kiểm tra rồi ghi" → "Xác nhận", bấm là
   ghi thẳng luôn (an toàn dữ liệu vẫn còn ở bước in phiếu + xác nhận công thức trước đó). */
ok('27/08/2026 (phản hồi lần 4): nút đổi tên thành "Xác nhận"', (await E(()=>document.querySelector('[data-kiem]').textContent))==='Xác nhận');
await p.click('[data-kiem]'); await p.waitForTimeout(500);
ok('27/08/2026 (phản hồi lần 4): bấm Xác nhận KHÔNG còn hiện hộp thoại đọc lại — ghi thẳng luôn', !(await E(()=>!!document.getElementById('mask')&&getComputedStyle(document.getElementById('mask')).display!=='none')));

console.log('\n── I. GHI MẺ ──');
ok('ghi được 1 lô', (await E(()=>nk.length))===1);
ok('số lô đúng', (await E(()=>nk[0].lot))===LOT_UI, 'mong đợi: '+LOT_UI);
ok('lưu tên người pha', (await E(()=>nk[0].nv))==='Toàn');
ok('dọn sạch ô nhập sau khi ghi', (await E(()=>sp[0].sl==='' && sp[0].pb.length===0 && sp[0].huongMe==='')));
// 27/08/2026 (phản hồi lần 4): hộp thoại "Đã ghi xong" đã bỏ theo yêu cầu — thay bằng toast nhanh
const nkId0=await E(()=>nk[0].id);
ok('27/08/2026 (phản hồi lần 4): ghi xong báo qua toast (không còn hộp thoại phải bấm)', /Đã lưu 1 lô/.test(await E(()=>document.getElementById('toast').textContent)));
await Ea(id=>{tab='lo';traLot=nk.find(x=>x.id===id).lot;ve()},nkId0); await p.waitForTimeout(300);
await E(()=>{window.print=()=>{window.__inTemGhi=1}});
await p.click('[data-intem]'); await p.waitForTimeout(400);
ok('vẫn in tem được bình thường qua tab Tra lô', (await E(()=>window.__inTemGhi===1)));
await Ea(()=>{tab='me';moSP=-1;ve()});

console.log('\n── J. CHỐNG LỖI 3 · GHI TRÙNG ──');
await p.click('[data-sp="0"]'); await p.waitForTimeout(350);
await p.click('[data-f="sl"]'); await p.keyboard.type('100',{delay:50});
await p.click('[data-h="Hương Chanh"]'); await p.waitForTimeout(350);
await p.click('[data-pbadd]'); await p.waitForTimeout(400);
await p.click('[data-inphieu]'); await p.waitForTimeout(350);
await p.click('[data-xnct]'); await p.waitForTimeout(300);
await p.click('[data-kiem]'); await p.waitForTimeout(500);
const tr=await E(()=>$('dlgT').textContent);
ok('phát hiện mẻ trùng', /đã ghi rồi/.test(tr), tr);
await p.click('#dlgC'); await p.waitForTimeout(300);
ok('bấm nhầm thì không ghi thêm', (await E(()=>nk.length))===1);

console.log('\n── K. CHỐNG LỖI 4 · QUÊN GHI MẺ ──');
ok('thanh trên đếm mẻ hôm nay', /Hôm nay đã ghi/.test(await E(()=>$('hom').innerText)),
   await E(()=>$('hom').innerText.trim()));

console.log('\n── L. TRA LÔ & IN TEM ──');
await p.click('[data-tab="lo"]'); await p.waitForTimeout(300);
await p.selectOption('#oLot',LOT_UI); await p.waitForTimeout(400);
ok('tra ra lô', /Citycat/.test(await E(()=>$('view').innerText)));
const lHuongDaDung=await Ea(lot=>{const r=nk.find(x=>x.lot===lot);return `${fmt(num(r.mlDung))} g`},LOT_UI);
ok('27/08/2026 (phản hồi lần 4): "Hương liệu đã dùng" chỉ còn hiện đúng số g (bỏ "/ N kg thành phẩm")', (await E(()=>$('view').innerHTML)).includes(`<span>Hương liệu đã dùng</span><b style="color:var(--cy)">${lHuongDaDung}</b>`), lHuongDaDung);
const lDauVaoHtml=await E(()=>$('view').innerHTML);
ok('27/08/2026 (phản hồi lần 4): dòng "Đầu vào" thay cho "Số lượng", đứng trước "Đầu ra"',
  /<span>Đầu vào<\/span>/.test(lDauVaoHtml) && !/<span>Số lượng<\/span>/.test(lDauVaoHtml)
  && lDauVaoHtml.indexOf('<span>Đầu vào</span>')<lDauVaoHtml.indexOf('<span>Đầu ra</span>'), lDauVaoHtml.indexOf('<span>Đầu vào</span>')+' vs '+lDauVaoHtml.indexOf('<span>Đầu ra</span>'));
ok('27/08/2026 (phản hồi lần 4): "Đầu ra" bỏ phần "× N kg" (đã có ở dòng Quy cách)', !/Đầu ra<\/span><b[^>]*>[^<]*×/.test(lDauVaoHtml));
// 27/08/2026 (phản hồi lần 4): nút thu gọn cho thẻ lô
ok('thẻ lô có tiêu đề bấm được để thu gọn (data-thulo)', await E(()=>!!document.querySelector('[data-thulo]')));
ok('mặc định thẻ lô đang MỞ (chưa ai bấm thu gọn)', /<span>Sản phẩm<\/span>/.test(lDauVaoHtml));
await p.click('[data-thulo]'); await p.waitForTimeout(200);
const lThuGonHtml=await E(()=>$('view').innerHTML);
ok('bấm vào tiêu đề thì thu gọn — ẩn chi tiết bên trong', !/<span>Sản phẩm<\/span>/.test(lThuGonHtml));
await p.click('[data-thulo]'); await p.waitForTimeout(200);
ok('bấm lại thì mở ra như cũ', /<span>Sản phẩm<\/span>/.test(await E(()=>$('view').innerHTML)));
await E(()=>{window.print=()=>{window.__in=1}});
await p.click('[data-intem]'); await p.waitForTimeout(500);
ok('in được tem', (await E(()=>window.__in===1)));
const tem=await E(()=>$('temIn').innerText);
ok('tem có số lô', tem.replace(/s+/g,' ').includes(LOT_UI_CACH), 'mong đợi: '+LOT_UI_CACH);
ok('tem có địa chỉ sản xuất', /8A An Dương Vương/.test(tem));
ok('tem có hạn dùng', /đến 22\/08\/2036|đến \d{2}\/\d{2}\/20\d{2}/.test(tem));
ok('#temIn là con trực tiếp của body', (await E(()=>$('temIn').parentElement.tagName))==='BODY');

console.log('\n── M. CÔNG THỨC PHUN (chỉ đọc) ──');
await p.click('[data-tab="cp"]'); await p.waitForTimeout(350);
const cpt=await E(()=>$('view').innerText);
ok('hiện công thức riêng của mặt hàng', /Nước 8L \+ A 350ml/.test(cpt));
ok('ghi rõ là công thức riêng', /riêng cho mặt hàng này/i.test(cpt));
ok('không có ô sửa công thức', (await E(()=>document.querySelectorAll('#view textarea').length))===0);

console.log('\n── N. GỬI MẺ CHO QUẢN LÝ ──');
await p.click('[data-tab="dl"]'); await p.waitForTimeout(350);
const dl=p.waitForEvent('download',{timeout:8000});
await p.click('[data-xuat]');
let xu=false,ten='';
try{const d=await dl; ten=d.suggestedFilename(); xu=true}catch(e){}
ok('tải được file mẻ', xu, ten);
ok('đánh dấu đã gửi', (await E(()=>nk.every(r=>r.daGui===1))));

console.log('\n── O. TẢI LẠI TRANG ──');
await p.reload(); await p.waitForTimeout(800);
ok('cấu hình còn', (await E(()=>sp.length))===3);
ok('mẻ đã ghi còn', (await E(()=>nk.length))===1);
ok('tên nhân viên còn', (await E(()=>toi))==='Toàn');

console.log('\n── P. H2 — TEM THEO ID (không lấy nhầm khi trùng lot) ──');
const idsP=await E(()=>{
  const lotChung=nk[0].lot;
  const base={...nk[0]}; delete base.id;
  const rA={...base,id:'TEST-H2-A',ngaysx:'2026-08-05',lot:lotChung};
  const rB={...base,id:'TEST-H2-B',ngaysx:'2026-08-20',lot:lotChung};
  nk.push(rA,rB); luu(); ve();
  return {a:rA.id,b:rB.id};
});
ok('2 bản ghi test dùng chung 1 lot (mô phỏng đúng quy ước)',
  (await E(()=>{const l=nk.filter(x=>x.id==='TEST-H2-A'||x.id==='TEST-H2-B').map(x=>x.lot);return l.length===2&&l[0]===l[1]})));
await E(()=>{window.print=()=>{window.__in=1}});
await Ea(id=>inTem(id), idsP.a); await p.waitForTimeout(300);
const temPA=(await E(()=>$('temIn').innerText));
ok('in tem theo id A lấy đúng bản ghi A dù trùng lot', /05\/08\/2026/.test(temPA));
await Ea(id=>inTem(id), idsP.b); await p.waitForTimeout(300);
const temPB=(await E(()=>$('temIn').innerText));
ok('in tem theo id B lấy đúng bản ghi B, KHÔNG lấy nhầm A', /20\/08\/2026/.test(temPB) && !/05\/08\/2026/.test(temPB));
await E(()=>{nk=nk.filter(x=>x.id!=='TEST-H2-A'&&x.id!=='TEST-H2-B');luu();ve()});

console.log('\n── Q. H1 — NẠP CẤU HÌNH MỚI GIỮ NGUYÊN MẺ ĐANG GÕ DỞ ──');
await E(()=>{const p0=sp[0]; p0.sl='55';p0.pb=[{qc:'5 kg',kg:'55'}];p0.huongMe='Hương Lài';p0.ngaysx='2026-08-09';p0.lot='DANGGO';p0.nv='AiDoDangGo'});
const qRes=await E(()=>{
  // Mô phỏng cấu hình "sạch" từ server (giống sachCauHinh() bên admin — không có sl/pb/huongMe/lot/ngaysx/nv),
  // nhưng đổi 1 giá trị catalog (kg) để xác nhận phần catalog vẫn được cập nhật.
  const serverSp = sp.map(x=>({ten:x.ten,kg:x.ten==='Citycat'?123:x.kg,ml:x.ml,pkb:x.pkb,huongs:x.huongs,tam:x.tam,
    dauRa:x.dauRa,maSP:x.maSP,hstem:x.hstem,pkbChat:x.pkbChat,pkbPhut:x.pkbPhut,pkbCT:x.pkbCT,tt:x.tt,ttLyDo:x.ttLyDo}));
  sp = apCauHinhVaoSP(sp, serverSp);
  luu(); ve();
  return {sl:sp[0].sl, huongMe:sp[0].huongMe, ngaysx:sp[0].ngaysx, lot:sp[0].lot, nv:sp[0].nv, kg:sp[0].kg, pbKg:sp[0].pb[0]&&sp[0].pb[0].kg};
});
ok('nạp cấu hình mới KHÔNG xoá số kg đang gõ dở', qRes.sl==='55');
ok('nạp cấu hình mới KHÔNG xoá phân bổ đang gõ dở', qRes.pbKg==='55');
ok('nạp cấu hình mới KHÔNG xoá hương đang chọn dở', qRes.huongMe==='Hương Lài');
ok('nạp cấu hình mới KHÔNG xoá ngày SX đang chọn dở', qRes.ngaysx==='2026-08-09');
ok('cấu hình catalog (kg) vẫn được cập nhật từ server', qRes.kg===123);

console.log('\n── R. LƯỚI TEM 1 TRANG A4 DUY NHẤT (25/08/2026 — đơn giản hoá, bỏ phụ thuộc soBao) ──');
const rR=await E(()=>{
  const r={...nk[0],soBao:'9'}; // soBao giờ KHÔNG còn ảnh hưởng tới số trang/tem
  const p=sp.find(x=>x.ten===r.sp)||sp[0];
  temCot=5;temHang=4;
  const html=trangTem(r,p);
  const div=document.createElement('div');div.innerHTML=html;
  return {soTo:div.querySelectorAll('.to').length, soTem:div.querySelectorAll('.tem').length};
});
ok('luôn đúng 1 trang, dàn kín lưới (5×4=20 tem), không phụ thuộc soBao', rR.soTo===1 && rR.soTem===20, JSON.stringify(rR));

const rR2=await E(()=>{
  const r={...nk[0],soBao:''};
  const p=sp.find(x=>x.ten===r.sp)||sp[0];
  temCot=2;temHang=2;
  const html=trangTem(r,p);
  const div=document.createElement('div');div.innerHTML=html;
  return {soTo:div.querySelectorAll('.to').length, soTem:div.querySelectorAll('.tem').length};
});
ok('không có số bao → vẫn đúng 1 trang dàn kín (2×2=4)', rR2.soTo===1 && rR2.soTem===4, JSON.stringify(rR2));

console.log('\n── S. LÔ 27.000 BAO — KHÔNG CÒN NGUY CƠ TREO MÁY (25/08/2026, đơn giản hoá) ──');
const sR=await E(()=>{
  temCot=5;temHang=4;
  const pp=sp[0];
  const html=trangTem({soBao:27000,sp:pp.ten},pp);
  return (html.match(/class="tem"/g)||[]).length;
});
ok('lô 27.000 bao vẫn chỉ dựng đúng 1 trang (20 tem), không thể treo máy', sR===20, sR+' tem');
const sBefore=await E(()=>{
  const pp=sp[0];
  pp.hstem={tenVN:'X',thanhPhan:'X',congDung:'X',doAm:'< 10%',hdsd:'X',baoQuan:'X',xuatXu:'X',soTCCS:'01:2026/KH',hsdNam:'10'};
  const id='TESTLON-NV-1';
  nk.push({id,sp:pp.ten,ngaysx:'2026-08-25',lot:'1101070826',soBao:27000,huong:pp.huongs&&pp.huongs[0]||'',quyCach:'1 kg'});
  const before=$('temIn').innerHTML;
  return before;
});
const sAfter=await E(()=>{
  inTem('TESTLON-NV-1'); // không còn hoi() chặn giữa đường nữa
  return $('temIn').innerHTML;
});
ok('inTem() vẫn cho in bình thường (không còn hộp thoại chặn) — chỉ 1 trang cố định nên an toàn', sAfter!==sBefore && sAfter.length<50000, 'độ dài: '+sAfter.length);

console.log('\n── T. TRA LÔ BẰNG DROPDOWN, KHÔNG CÒN GÕ TAY (25/08/2026) ──');
const tR=await E(()=>{
  tab='lo'; ve();
  return {laSelect: document.querySelector('#oLot').tagName==='SELECT',
    coTuyChon: document.querySelectorAll('#oLot option').length>1};
});
ok('ô tra lô là dropdown, không phải ô gõ tay', tR.laSelect);
ok('dropdown có lô để chọn', tR.coTuyChon);
const tSel=await E(()=>{
  const sel=$('oLot'), opt=sel.options[1];
  if(!opt)return null;
  sel.value=opt.value; sel.dispatchEvent(new Event('input',{bubbles:true}));
  return document.querySelectorAll('.card.lot').length>0;
});
ok('chọn 1 lô trong dropdown thì hiện đúng thẻ chi tiết', tSel===true);

console.log('\n── U. LINK TỦ HỒ SƠ CÔNG TY Ở TAB DỮ LIỆU (25/08/2026) ──');
const uLink=await E(()=>{tab='dl';ve();return $('view').innerHTML.includes('claude.ai/code/artifact/d1e828c4-2883-42c8-9e05-8b1336e44677')});
ok('link tủ hồ sơ công ty có trong tab Dữ liệu', uLink);

console.log('\n── V. HUỶ LÔ (ĐÁNH DẤU HUỶ, GIỮ LỊCH SỬ) (25/08/2026) ──');
const vId=await E(()=>{
  const pp=sp[0];
  const id='TESTHUY-NV-1';
  nk.push({id,sp:pp.ten,ngaysx:'2026-08-25',lot:'1101070826',soBao:5,huong:pp.huongs&&pp.huongs[0]||'',quyCach:'1 kg',sl:5,nv:'Toàn',ts:'2099-01-01T00:00:00.000Z'});
  tab='lo'; traLot='1101070826'; ve();
  return id;
});
await p.waitForTimeout(300);
ok('thẻ lô có nút Huỷ lô này', (await E(()=>!!document.querySelector('[data-huylo]'))));
await p.click('[data-huylo]'); await p.waitForTimeout(350);
ok('bấm huỷ hiện hộp xác nhận có cảnh báo nguy hiểm (nền đỏ)', (await E(()=>$('dlgO').style.background!=='')));
await p.click('#dlgO'); await p.waitForTimeout(350);
const vR1=await Ea(x=>{const r=nk.find(x2=>x2.id===x);return {huy:r.huy,coHuyLuc:!!r.huyLuc}},vId);
ok('huỷ lô đặt r.huy=true và ghi r.huyLuc', vR1.huy===true&&vR1.coHuyLuc, JSON.stringify(vR1));
const vBC=await E(()=>{tab='lo';traLot='1101070826';ve();return $('view').innerHTML});
ok('thẻ lô hiện badge "ĐÃ HUỶ"', /ĐÃ HUỶ/.test(vBC));
ok('lô đã huỷ ẩn nút "In tem phụ cho lô này"', !/data-intem="TESTHUY-NV-1"/.test(vBC));
ok('lô đã huỷ đổi nút thành "Bỏ huỷ lô này"', /Bỏ huỷ lô này/.test(vBC));
const vInTruoc=await E(()=>window.__in2||0);
await E(()=>{window.print=()=>{window.__in2=(window.__in2||0)+1}});
// inTem() tự await hoi() chờ bấm nút — KHÔNG await promise này trong Node (deadlock),
// thả chạy trong trình duyệt rồi bấm nút thật từ Playwright để giải phóng nó.
const pInChan=Ea(x=>inTem(x),vId);
await p.waitForTimeout(350);
const vDlgT=await E(()=>($('dlgT')||{}).textContent);
ok('inTem() chặn in cho lô đã huỷ', vDlgT==='Lô này đã huỷ', vDlgT);
await p.click('#dlgC'); await p.waitForTimeout(250);
await pInChan;
const vInSau=await E(()=>window.__in2||0);
ok('không thật sự gọi print() khi bị chặn', vInSau===vInTruoc, `${vInTruoc}→${vInSau}`);
await p.click('[data-huylo]'); await p.waitForTimeout(350);
ok('bấm lại hiện hộp "Bỏ huỷ lô này?"', (await E(()=>($('dlgT')||{}).textContent))==='Bỏ huỷ lô này?');
await p.click('#dlgO'); await p.waitForTimeout(350);
const vR2=await Ea(x=>{const r=nk.find(x2=>x2.id===x);return {huy:r.huy,huyLucRong:r.huyLuc===''}},vId);
ok('bỏ huỷ đặt lại r.huy=false và xoá r.huyLuc', vR2.huy===false&&vR2.huyLucRong, JSON.stringify(vR2));

console.log('\n── W. QUY CÁCH ĐÓNG GÓI — TỰ ĐỘNG KHI CHỈ CÓ 1 LỰA CHỌN (25/08/2026) ──');
const wI=await E(()=>sp.findIndex(x=>x.ten==='Cát tạm ngưng')); // sẵn dauRa:['5 kg'] — chỉ 1 quy cách
ok('tìm thấy mặt hàng test (chỉ 1 quy cách hợp lệ)', wI>=0);
await Ea(x=>{sp[x].pb=[];tab='me';ve();},wI); // đảm bảo bắt đầu từ trạng thái rỗng, đúng tab danh sách
await p.click(`[data-sp="${wI}"]`); await p.waitForTimeout(300);
const wPB=await Ea(x=>({soDong:(sp[x].pb||[]).length, qc:sp[x].pb&&sp[x].pb[0]&&sp[x].pb[0].qc}),wI);
ok('mở mặt hàng chỉ-1-quy-cách tự tạo sẵn dòng đóng gói, khỏi bấm "+ Thêm quy cách"', wPB.soDong===1&&wPB.qc==='5 kg', JSON.stringify(wPB));
const wTinh=await E(()=>chiaBao(100,'5 kg'));
ok('100kg ÷ 5kg tự tính ra 20 bao, đúng cách khách nêu ví dụ (đổi sang mốc 500g/Mùn cưa cũng cùng công thức)', wTinh.so===20&&wTinh.du===0, JSON.stringify(wTinh));
await p.click('[data-back]'); await p.waitForTimeout(200);

console.log('\n── X. YÊU CẦU 25/08/2026-F (nhãn, tiến độ nguyên liệu, hương trong dropdown, màu ưu tiên) ──');
ok('26/08/2026 PATCH V1 mục F2: nhãn "kg đầu vào" đổi thành "Đầu vào dự kiến / kế hoạch sản xuất"', /Đầu vào dự kiến \/ kế hoạch sản xuất/.test(fs.readFileSync('/tmp/nv/peroma-nhanvien.html','utf8')));
const xOLot=await E(()=>{tab='lo';traLot='';ve();return [...document.querySelectorAll('#oLot option')].map(o=>o.textContent).join('|')});
ok('dropdown chọn lô có kèm tên hương', /Hương Chanh/.test(xOLot), xOLot);
const xKv=await E(()=>{traLot='1101070826';ve();return $('view').innerHTML});
ok('thẻ Tra lô tô màu ưu tiên Hương/Quy cách/Số bao', /color:var\(--cy\)/.test(xKv)&&/color:var\(--am\)/.test(xKv)&&/color:var\(--pur\)/.test(xKv), 'có đủ 3 màu ưu tiên');
// 27/08/2026 (phản hồi lần 3): khách chốt "Tiến độ sử dụng lô nguyên liệu đầu vào" vô nghĩa vì
// đã có "Hàm lượng nguyên liệu" khai chi tiết hơn — gỡ bỏ hẳn khỏi tab Pha mẻ (giống bên Admin).
const xTD=await Ea(v=>{nlTong=v.tong; nlNgayKhai=v.ngay; tab='me'; moSP=-1; ve();
  return {html:$('view').innerHTML}},{tong:200,ngay:'2000-01-01T00:00:00.000Z'});
ok('27/08/2026 (phản hồi lần 3): tab Pha mẻ đã bỏ hẳn thẻ "Tiến độ nguyên liệu đầu vào" (trùng lặp)', !/Tiến độ nguyên liệu đầu vào/.test(xTD.html));
ok('hàm veTienDo() bên Nhân viên cũng đã gỡ bỏ hoàn toàn', (await E(()=>typeof veTienDo))==='undefined');
await Ea(v=>{nlTong=0;nlNgayKhai='';tab='me';ve()},0);

console.log('\n── Y. BÁO CÁO TIẾN ĐỘ THEO LÔ (25/08/2026-J) ──');
/* Khách chốt 25/08/2026-J: gắn báo cáo với ĐÚNG LÔ đã ghi trong ngày (chọn từ nk[]) — kế
   hoạch lấy thẳng từ r.sl lúc pha mẻ, nhập kg thực tế + lý do nếu chưa đạt. Test riêng biệt:
   gửi báo cáo mà KHÔNG ghi mẻ nào mới, xuất file vẫn phải cho phép (trước đây xuatMe() chặn
   khi không có mẻ mới — phải nới ra cho cả báo cáo). */
await E(()=>{tab='bc';ve()}); await p.waitForTimeout(300);
ok('có tab Báo cáo, hiện form chọn lô để gửi báo cáo', await E(()=>!!document.getElementById('bcGuiBtn')&&!!document.getElementById('bcLotIn')));
const yLotId=await E(()=>nk[0].id);
ok('dropdown chọn lô liệt kê đúng lô đã ghi hôm nay', await Ea(id=>!!document.querySelector(`#bcLotIn option[value="${id}"]`),yLotId));
await p.click('#bcGuiBtn'); await p.waitForTimeout(200);
ok('chưa chọn lô thì báo lỗi, không lưu', (await E(()=>bcNgay.length))===0);
await p.selectOption('#bcLotIn', yLotId);
await p.fill('#bcKgIn','45');
await p.fill('#bcLyDoIn','Hư máy trộn giữa buổi');
await p.click('#bcGuiBtn'); await p.waitForTimeout(300);
ok('gửi báo cáo thành công', (await E(()=>bcNgay.length))===1);
const yBc=await E(()=>bcNgay[0]);
ok('lưu đúng nội dung báo cáo, gắn đúng lô + kế hoạch lấy từ nk',
  yBc.kgThucTe===45&&yBc.lyDo==='Hư máy trộn giữa buổi'&&yBc.sp==='Citycat'&&yBc.nv==='Toàn'&&
  yBc.lot===LOT_UI&&yBc.kgKeHoach===100, JSON.stringify(yBc));   // LOT_UI = lô theo tháng chạy test (chú thích đầu file)
const yHtml=await E(()=>{ve();return $('view').innerHTML});
ok('26/08/2026 PATCH V1 mục G2: báo cáo vừa gửi hiện ngay trong danh sách "hôm nay" (kèm chênh lệch trung tính, không còn "Thiếu/Dư")',
  /Hư máy trộn giữa buổi/.test(yHtml)&&/45/.test(yHtml)&&/Chênh lệch/.test(yHtml)&&/-55 kg/.test(yHtml)&&/-55,00%/.test(yHtml)&&!/Thiếu/.test(yHtml)&&!/Dư /.test(yHtml));
// Xoá hết mẻ chưa gửi để dựng đúng kịch bản "chỉ có báo cáo mới, không có mẻ mới" —
// trước đây xuatMe() chặn hẳn khi mảng mẻ chưa gửi rỗng, dù có báo cáo mới cũng không xuất được.
await E(()=>{nk.forEach(r=>{if(!r.daGui)r.daGui=1})});
ok('dựng xong kịch bản: không còn mẻ chưa gửi', (await E(()=>nk.filter(r=>!r.daGui).length))===0);
await E(()=>{tab='dl';ve()}); await p.waitForTimeout(250);
const dl2=p.waitForEvent('download',{timeout:9000});
await p.click('[data-xuat]');
const f2=await dl2; await f2.saveAs('/tmp/nv/baocao_only.json');
ok('KHÔNG có mẻ mới nhưng CÓ báo cáo mới thì vẫn xuất được file (đã nới lỏng điều kiện xuatMe())', fs.existsSync('/tmp/nv/baocao_only.json'));
const yFile=JSON.parse(fs.readFileSync('/tmp/nv/baocao_only.json','utf8'));

console.log('\n── Y2. BÁO CÁO KHI MẺ CHƯA GHI ĐƯỢC LÔ NÀO (26/08/2026-M — bug thật khách gặp) ──');
/* Đúng kịch bản gốc của tính năng: "dự định làm 500kg nhưng trục trặc chỉ làm được 300kg" —
   ghi mẻ chỉ tạo bản ghi khi ĐÃ XONG + xác nhận công thức, nên mẻ dở dang/hỏng giữa chừng
   KHÔNG BAO GIỜ có lô để chọn. Bản J/K bắt phải chọn lô mới gửi được báo cáo → đúng lúc cần
   nhất thì không gửi được gì cả. Test: gửi báo cáo cho 1 mặt hàng KHÔNG chọn lô, tự nhập kế
   hoạch tay — vẫn phải gửi được. */
await E(()=>{tab='bc';ve()}); await p.waitForTimeout(300);
ok('form vẫn LUÔN có ô chọn mặt hàng trực tiếp (không bắt buộc phải có lô mới báo cáo được)', await E(()=>!!document.getElementById('bcSpIn')&&!!document.getElementById('bcKeHoachIn')));
await p.click('#bcGuiBtn'); await p.waitForTimeout(200);
const y2TruocSoLuong=await E(()=>bcNgay.length);
await p.selectOption('#bcSpIn','1');
await p.click('#bcGuiBtn'); await p.waitForTimeout(200);
ok('chọn mặt hàng nhưng CHƯA nhập kế hoạch thì báo lỗi, không lưu', (await E(()=>bcNgay.length))===y2TruocSoLuong);
await p.fill('#bcKeHoachIn','500');
await p.fill('#bcKgIn','300');
await p.fill('#bcLyDoIn','Máy hỏng giữa buổi, không kịp làm hết 500kg dự kiến');
await p.click('#bcGuiBtn'); await p.waitForTimeout(300);
ok('gửi được báo cáo dù mẻ CHƯA ghi lô nào — đúng bug khách gặp thực tế', (await E(()=>bcNgay.length))===y2TruocSoLuong+1);
const y2Bc=await E(()=>bcNgay[bcNgay.length-1]);
ok('lưu đúng nội dung: không có lot/quyCach, kế hoạch/thực tế lấy đúng số tự nhập',
  y2Bc.lot===''&&y2Bc.quyCach===''&&y2Bc.kgKeHoach===500&&y2Bc.kgThucTe===300&&y2Bc.sp===(await E(()=>sp[1].ten)), JSON.stringify(y2Bc));
const y2Html=await E(()=>{ve();return $('view').innerHTML});
ok('hiện đúng trong danh sách "hôm nay" dù không có số lô (không báo lỗi/không trắng trang)',
  /Máy hỏng giữa buổi/.test(y2Html)&&/Chênh lệch/.test(y2Html)&&/-200 kg/.test(y2Html)&&/-40,00%/.test(y2Html));
ok('file xuất mang đúng báo cáo, mảng mẻ rỗng', yFile.bcNgay.length===1&&yFile.nk.length===0, `nk=${yFile.nk.length} bcNgay=${yFile.bcNgay.length}`);

console.log('\n── Z. PATCH KIẾN TRÚC V1 — TEST CASE BẮT BUỘC (mục M của bản đặc tả) ──');
/* Test 1 — công thức hương: mẻ chuẩn 100kg, hương chuẩn 50g, kế hoạch 1.500kg → cần 750g.
   Dùng thẳng lieu() — công thức số học giữ nguyên, chỉ semantic đổi mg→g. */
const zLieu=await E(()=>lieu({kg:100,ml:50},1500));
ok('Test 1 — hương cần = 50 × (1500/100) = 750 g (không phải 750 mg)', zLieu===750, zLieu);

/* Test 3/4 — variance: dùng thẳng helper variance() vừa thêm cho veBaoCao(). */
const z3=await E(()=>variance(500,503.5));
ok('Test 3 — variance dôi: 500→503,5kg = +3,5kg', z3.v===3.5, JSON.stringify(z3));
ok('Test 3 — variance dôi: +0,70%', z3.pct===0.7, JSON.stringify(z3));
const z3Str=await E(()=>variPctStr(0.7));
ok('Test 3 — chuỗi hiển thị đúng "+0,70%"', z3Str==='+0,70%', z3Str);
const z4=await E(()=>variance(500,437));
ok('Test 4 — variance hụt: 500→437kg = -63kg', z4.v===-63, JSON.stringify(z4));
ok('Test 4 — variance hụt: -12,60%', z4.pct===-12.6, JSON.stringify(z4));
const z4Str=await E(()=>variPctStr(-12.6));
ok('Test 4 — chuỗi hiển thị đúng "-12,60%"', z4Str==='-12,60%', z4Str);
ok('Test 4 — vượt ngưỡng cảnh báo NGUONG_VARIANCE_PCT=2% (12,6% > 2%)', await E(()=>Math.abs(-12.6)>NGUONG_VARIANCE_PCT));

/* Test 7 — xác nhận công thức: sửa nội dung sau khi đã xác nhận thì phải HỦY trạng thái xác
   nhận, bắt xác nhận lại trước khi ghi mẻ được (gate trong kiemRoiGhi(), giữ nguyên logic cũ). */
await E(()=>{tab='me';moSP=0;toi='Toàn';const p=sp[0];p.sl='100';p.huongMe='Hương Chanh';
  p.pb=[{qc:'5 kg',kg:'100'}];ve()}); await p.waitForTimeout(200);
await E(()=>{window.print=()=>{}});
await p.click('[data-inphieu="1"]'); await p.waitForTimeout(200);
await p.click('[data-xnct="1"]'); await p.waitForTimeout(200);
const z7Truoc=await E(()=>sp[0].xacNhanCT);
ok('Test 7 — đã xác nhận công thức thì xacNhanCT=true', z7Truoc===true);
await E(()=>{sp[0].sl='250';ve()}); // sửa kg SAU khi đã xác nhận
await p.click('[data-inphieu="1"]'); await p.waitForTimeout(200); // in lại phiếu với nội dung đã đổi
const z7Sau=await E(()=>sp[0].xacNhanCT);
ok('Test 7 — sửa nội dung (kg) SAU khi xác nhận rồi in lại thì hệ thống tự HỦY xác nhận, bắt xác nhận lại',
  z7Sau===false, z7Sau);
const z7Nut=await E(()=>document.querySelector('[data-kiem="1"]')?.disabled);
ok('Test 7 — nút "Xác nhận" bị khoá lại cho tới khi xác nhận lại', z7Nut===true);
await E(()=>{tab='me';moSP=-1;sp[0].sl='';sp[0].pb=[];sp[0].huongMe='';sp[0].daInPhieu=false;sp[0].xacNhanCT=false;ve()}); // dọn dữ liệu test

console.log('\n── AA. PATCH V1.1 — P0.1 (H2: recordId) + P0.2 (UNSCENTED) ──');
/* P0.2 — UNSCENTED: chọn "Không mùi" cho mặt hàng test, kiểm tra 0g/0đ xuyên suốt phiếu,
   xác nhận, và bản ghi ghi mẻ thật (không chỉ preview). */
await E(()=>{
  if(!kho.includes('Không mùi'))kho.push('Không mùi');
  maHuong['Không mùi']=maHuong['Không mùi']||'00'; // đúng mã hệ thống thật (xem MA_HUONG_GOI_Y bên Admin)
  sp[0].huongs=[...(sp[0].huongs||[]),'Không mùi'];
  tab='me';moSP=0;toi='Toàn';sp[0].sl='100';sp[0].huongMe='Không mùi';sp[0].pb=[{qc:'5 kg',kg:'100'}];
  ve();
});
await p.waitForTimeout(200);
const aaDoseHtml=await E(()=>document.querySelector('.big .s')?.textContent);
ok('UNSCENTED — khối "Hương liệu cần đổ" hiện rõ "Không mùi · không dùng hương liệu"', aaDoseHtml==='Không mùi · không dùng hương liệu', aaDoseHtml);
const aaDoseVal=await E(()=>document.querySelector('.big .v')?.textContent);
ok('UNSCENTED — số hương hiện "0" (không phải theo định lượng hương thật của mặt hàng)', aaDoseVal==='0', aaDoseVal);
// gõ lại kg để test capNhat() (đường patch DOM riêng, khác đường vẽ lại ve()) cũng đúng 0g
await p.fill('[data-f="sl"]','250'); await p.waitForTimeout(150);
const aaDoseHtml2=await E(()=>document.querySelector('.big .s')?.textContent);
ok('UNSCENTED — gõ lại kg (qua capNhat(), không phải vẽ lại) vẫn giữ đúng "0g/không dùng hương liệu"', aaDoseHtml2==='Không mùi · không dùng hương liệu', aaDoseHtml2);
await E(()=>{sp[0].sl='100';ve()}); // trả lại 100kg cho các bước sau
const aaPhieu=await E(()=>phieuHTML(sp[0]));
ok('UNSCENTED — phiếu công thức in đúng "0 g" cho hương liệu cần đổ', /Hương liệu cần đổ[\s\S]*?0 g/.test(aaPhieu), aaPhieu.match(/Hương liệu cần đổ[^<]*<\/td><td[^>]*>[^<]*/)?.[0]);
await E(()=>{window.print=()=>{}});
await p.click('[data-inphieu="1"]'); await p.waitForTimeout(200);
await p.click('[data-xnct="1"]'); await p.waitForTimeout(200);
await p.click('[data-kiem="1"]'); await p.waitForTimeout(400); // 27/08/2026-lần4: ghi thẳng, không còn qua 2 hộp thoại
const aaRec=await E(()=>nk.slice().reverse().find(r=>r.sp==='Citycat'&&r.huong==='Không mùi'));
ok('UNSCENTED — bản ghi ghi mẻ thật: mlDung=0, giaHuongTheoGLucSX=0, chiPhiHuongLucSX=0',
  aaRec&&aaRec.mlDung===0&&aaRec.giaHuongTheoGLucSX===0&&aaRec.chiPhiHuongLucSX===0, JSON.stringify(aaRec));
ok('UNSCENTED — vẫn sinh LOT bình thường (mã hương 00)', aaRec&&aaRec.maHuong==='00'&&!!aaRec.lot, aaRec&&aaRec.lot);

/* P0.1 — H2: khi chọn báo cáo gắn với 1 lô đã ghi hôm nay, bcNgay phải kèm recordId=nk.id —
   đây mới là khóa Admin dùng để tra đúng bản ghi, không còn dựa vào lot nữa. */
await E(()=>{tab='bc';ve()}); await p.waitForTimeout(200);
const aaRecordIdCheck=await E(()=>{
  const dsLo=nk.filter(r=>!r.huy&&r.ngaysx===isoNay());
  return dsLo.length>0;
});
if(aaRecordIdCheck){
  await p.selectOption('#bcLotIn', {index:1}).catch(()=>{});
  await p.fill('#bcKgIn','90');
  await p.click('#bcGuiBtn'); await p.waitForTimeout(300);
  const aaBc=await E(()=>bcNgay[bcNgay.length-1]);
  const aaExpectId=await E(()=>{const opt=document.querySelector('#bcLotIn option[value]:not([value=""])');return opt&&opt.value});
  ok('H2 — gửi báo cáo theo lô đã ghi thì tự kèm recordId=nk.id (không chỉ lot)', !!aaBc.recordId, JSON.stringify(aaBc));
}else ok('H2 — (bỏ qua, không có lô nào ghi hôm nay để test recordId)', true);

console.log('\n── AB. PATCH V1.1 — P1-A (recipe version/snapshot + đúng giờ xác nhận) ──');
ok('P1-A — bản ghi ghi mẻ đã có ở AA mang theo recipeVersion và recipeSnapshot đầy đủ',
  aaRec&&aaRec.recipeVersion===1&&aaRec.recipeSnapshot&&aaRec.recipeSnapshot.productName==='Citycat'
  &&aaRec.recipeSnapshot.selectedFragrance==='Không mùi'&&aaRec.recipeSnapshot.selectedDoseG===0,
  JSON.stringify(aaRec&&aaRec.recipeSnapshot));
ok('P1-A (acceptance #5) — xacNhanCTLuc là giờ lúc BẤM XÁC NHẬN, không phải giờ ghi mẻ (2 mốc khác nhau)',
  aaRec&&aaRec.xacNhanCTLuc&&aaRec.xacNhanCTLuc!==aaRec.ts, JSON.stringify({xacNhanCTLuc:aaRec&&aaRec.xacNhanCTLuc,ts:aaRec&&aaRec.ts}));

// Xác nhận rồi ĐỢI một chút trước khi ghi mẻ — kiểm chắc timestamp xác nhận không bị ghi đè bởi lúc ghi.
await E(()=>{tab='me';moSP=0;toi='Toàn';sp[0].sl='120';sp[0].huongMe='Hương Chanh';sp[0].pb=[{qc:'5 kg',kg:'120'}];
  sp[0].daInPhieu=false;sp[0].xacNhanCT=false;sp[0].xacNhanCTBoi='';sp[0].xacNhanCTSnap='';sp[0].xacNhanCTLuc='';ve()});
await E(()=>{window.print=()=>{}});
await p.click('[data-inphieu="1"]'); await p.waitForTimeout(150);
await p.click('[data-xnct="1"]'); await p.waitForTimeout(150);
const abXnLuc=await E(()=>sp[0].xacNhanCTLuc);
await p.waitForTimeout(600); // đợi rõ ràng để 2 mốc thời gian không thể trùng nhau tình cờ
await p.click('[data-kiem="1"]'); await p.waitForTimeout(400); // 27/08/2026-lần4: ghi thẳng, không còn qua 2 hộp thoại
const abRec=await E(()=>nk.slice().reverse().find(r=>r.sp==='Citycat'&&r.huong==='Hương Chanh'&&r.kgVao===120));
ok('P1-A — record dùng ĐÚNG timestamp đã lưu lúc xác nhận (không tạo mới lúc ghi mẻ dù cách nhau >0,5s)',
  abRec&&abRec.xacNhanCTLuc===abXnLuc, JSON.stringify({luuLai:abXnLuc,trenRecord:abRec&&abRec.xacNhanCTLuc}));
ok('P1-A — phiếu công thức in ra có dòng "Phiên bản công thức"',
  /Phiên bản công thức/.test(await E(()=>phieuHTML(sp[0]))));
await E(()=>{tab='me';moSP=-1;sp[0].sl='';sp[0].pb=[];sp[0].huongMe='';sp[0].daInPhieu=false;sp[0].xacNhanCT=false;
  sp[0].xacNhanCTBoi='';sp[0].xacNhanCTSnap='';sp[0].xacNhanCTLuc='';ve()}); // dọn dữ liệu test

console.log('\n── AC. PATCH V1.1 — P1-B (batchId + trạng thái tối giản) ──');
ok('P1-B — bản ghi ghi mẻ ở AB mang batchId (đúng bằng phần trước dấu "-" của id)',
  abRec&&abRec.batchId&&abRec.id.startsWith(abRec.batchId+'-'), JSON.stringify({id:abRec&&abRec.id,batchId:abRec&&abRec.batchId}));
ok('P1-B — trước khi có báo cáo thực tế, trạng thái là RECORDED',
  (await Ea(id=>trangThaiSXCua(nk.find(r=>r.id===id)),abRec.id))==='RECORDED');
await Ea(id=>{bcNgay.push({id:'ACBC-1',ngay:isoNay(),recordId:id,lot:nk.find(r=>r.id===id).lot,
  sp:'Citycat',quyCach:'5 kg',kgKeHoach:120,kgThucTe:118,lyDo:'',nv:'Toàn',ts:new Date().toISOString()});ve()},abRec.id);
ok('P1-B — sau khi gửi báo cáo thực tế gắn recordId → trạng thái COMPLETED',
  (await Ea(id=>trangThaiSXCua(nk.find(r=>r.id===id)),abRec.id))==='COMPLETED');
await Ea(id=>{tab='lo';traLot=nk.find(r=>r.id===id).lot;ve()},abRec.id); await p.waitForTimeout(150);
const acHtml=await E(()=>document.querySelector('#view').innerHTML);
ok('P1-B — thẻ tra lô hiện dòng "Trạng thái" với nhãn "Đã chốt thực tế"', /Đã chốt thực tế/.test(acHtml));
await Ea(id=>{bcNgay=bcNgay.filter(r=>r.id!=='ACBC-1');tab='lo';traLot='';ve()},abRec.id); // dọn dữ liệu test

console.log('\n── AD. PATCH V1.1 — P1-C (audit trail append-only) ──');
const adEvents=await Ea(id=>auditEvents.filter(a=>a.entityType==='batch'&&a.entityId===id),abRec.batchId);
ok('P1-C — có event RECORD_BATCH ghi lại đúng lúc ghi mẻ (đợt AB)', adEvents.some(a=>a.action==='RECORD_BATCH'), JSON.stringify(adEvents.map(a=>a.action)));
const adRecipeEvents=await E(()=>auditEvents.filter(a=>a.entityType==='recipe'&&a.action==='CONFIRM_RECIPE').length);
ok('P1-C — có ít nhất 1 event CONFIRM_RECIPE (đợt xác nhận công thức đã làm ở AB)', adRecipeEvents>0, adRecipeEvents);
const adPrintEvents=await E(()=>auditEvents.filter(a=>a.entityType==='recipe'&&a.action==='PRINT_RECIPE').length);
ok('P1-C — có ít nhất 1 event PRINT_RECIPE', adPrintEvents>0, adPrintEvents);
const adCountBefore=await E(()=>auditEvents.length);
await Ea(id=>{tab='lo';traLot=nk.find(r=>r.id===id).lot;ve()},abRec.id); await p.waitForTimeout(150);
await Ea(id=>document.querySelector(`[data-huylo="${id}"]`)?.click(),abRec.id); await p.waitForTimeout(150);
await p.click('#dlgO').catch(()=>{}); await p.waitForTimeout(200); // hộp thoại xác nhận huỷ
const adAfterCancel=await Ea(id=>({co:!!nk.find(r=>r.id===id), ev:auditEvents.some(a=>a.entityType==='batch'&&a.entityId===id&&a.action==='CANCEL')}),abRec.id);
ok('P1-C — huỷ lô ghi audit CANCEL và record KHÔNG bị xoá khỏi nk[]', adAfterCancel.co&&adAfterCancel.ev, JSON.stringify(adAfterCancel));
await Ea(id=>{const r=nk.find(x=>x.id===id); if(r){r.huy=false;r.huyLuc=''}; ve()},abRec.id); // dọn dữ liệu test — bỏ huỷ lại
ok('P1-C — auditEvents chỉ được APPEND, không có event nào bị mất so với trước (đếm tăng, không giảm)',
  (await E(()=>auditEvents.length))>=adCountBefore);

console.log('\n── AE. PHẢN HỒI 27/08/2026 (lần 3) — phiếu công thức, "Đầu ra", ngày SX tự sửa, đồng bộ báo cáo ──');
/* AE1: veLo() đổi nhãn "Số bao/túi" (hoặc "Số bao") → "Đầu ra" */
const aeLoHtml=await Ea(id=>{tab='lo';traLot=nk.find(r=>r.id===id).lot;ve();return $('view').innerHTML},abRec.id);
ok('27/08/2026 (phản hồi lần 3): tab Tra lô đổi nhãn "Số bao" → "Đầu ra"', /<span>Đầu ra<\/span>/.test(aeLoHtml), aeLoHtml.match(/<span>[^<]*<\/span><b[^>]*>[\d.]+ (kg|bao|túi)/)?.[0]);

/* AE2: ngaysxTuSua() — mẻ CHƯA in phiếu, ngày SX cũ hơn hôm nay thì tự sửa lại đúng ngày thực,
   nhưng mẻ ĐÃ in phiếu thì giữ nguyên ngày đã in (an toàn dữ liệu, khớp phiếu đã phát cho NV) */
const aeNgayTruoc='2020-01-01';
await Ea(v=>{const p=sp[0]; p.daInPhieu=false; p.ngaysx=v; moSP=-1; tab='me'; ve()},aeNgayTruoc);
await p.click(`[data-sp="0"]`); await p.waitForTimeout(200);
ok('27/08/2026 (phản hồi lần 3): mẻ CHƯA in phiếu, ngày SX cũ → mở lại thì ngaysxTuSua() tự sửa về đúng hôm nay',
  (await E(()=>sp[0].ngaysx))===(await E(()=>isoNay())), await E(()=>sp[0].ngaysx));
await Ea(v=>{const p=sp[0]; p.ngaysx=v; p.daInPhieu=true; tab='me'; moSP=-1; ve()},aeNgayTruoc);
await p.click(`[data-sp="0"]`); await p.waitForTimeout(200);
ok('mẻ ĐÃ in phiếu thì KHÔNG tự sửa ngày (giữ đúng ngày đã in cho NV, an toàn)', (await E(()=>sp[0].ngaysx))===aeNgayTruoc);
await Ea(()=>{sp[0].daInPhieu=false;sp[0].ngaysx=isoNay();ve()}); // dọn lại trạng thái gốc cho các test sau

/* AE3: bcSpOptions() — mục chọn mặt hàng ở tab Báo cáo (khi mẻ hôm nay chưa ghi được) giờ liệt
   kê kèm hương/mẻ chuẩn/lần gần nhất gần giống cách "tra số lô" (khách: "làm giống mục tra số
   lot, cái đó dễ hơn"), thay vì chỉ trơ tên mặt hàng như trước. */
const aeBcHtml=await E(()=>{tab='bc';ve();return document.getElementById('bcSpIn').innerHTML});
ok('27/08/2026 (phản hồi lần 3): mục chọn mặt hàng ở Báo cáo kèm theo Mẻ chuẩn (kg), giống độ chi tiết của tra số lô', /Mẻ chuẩn \d/.test(aeBcHtml), aeBcHtml.slice(0,200));

/* AE4: dbDayBaoCao() tồn tại và tự đẩy ngay khi bấm "Xác nhận số thực tế" (không cần thao tác
   tay như trước — khách phản hồi không rõ "tự đẩy dữ liệu lên" nghĩa là gì). Mô phỏng dbGoi(),
   không gọi mạng thật. */
ok('hàm dbDayBaoCao() tồn tại (nhân viên không cần tự đẩy file tay nữa)', (await E(()=>typeof dbDayBaoCao))==='function');
const aeAuto=await E(async()=>{
  const dbGoiThat=window.dbGoi; const urlThatCuaTest=DONGBO_URL; DONGBO_URL='http://127.0.0.1:8777/gia-lap-exec'; let goiVoiAction=null;
  window.dbGoi=async(url,opt)=>{ if(opt&&opt.body){try{goiVoiAction=JSON.parse(opt.body).a}catch(e){}} return {ok:1}; };
  const truoc=bcNgay.length;
  bcNgay.push({id:'AETEST-1',ngay:isoNay(),lot:'',sp:'Citycat',quyCach:'',kgKeHoach:100,kgThucTe:90,lyDo:'',nv:'Toàn',ts:new Date().toISOString()});
  await dbDayBaoCao([bcNgay[bcNgay.length-1]]);
  window.dbGoi=dbGoiThat; DONGBO_URL=urlThatCuaTest;
  const kq={them:bcNgay.length-truoc, action:goiVoiAction, daGui:bcNgay[bcNgay.length-1].daGui};
  bcNgay.pop();
  return kq;
});
ok('dbDayBaoCao() gọi đúng action "themBaoCao" lên server', aeAuto.action==='themBaoCao', JSON.stringify(aeAuto));
ok('dbDayBaoCao() đánh dấu daGui=1 sau khi đẩy thành công', aeAuto.daGui===1, JSON.stringify(aeAuto));

console.log('\n── AF. "ADMIN TOÀN QUYỀN" — MÁY NHÂN VIÊN TỰ NHẬN LỆNH XOÁ MÔ PHỎNG (27/08/2026-R3) ──');
/* Khách phản hồi: không muốn có nút xoá riêng bên máy nhân viên — Admin phải toàn quyền. Đổi
   sang: máy nhân viên tự nhận lệnh xoá qua đúng kênh đồng bộ cấu hình định kỳ (dbKeoCauHinh, mỗi
   20 giây/lần) — server trả kèm "xoaMocTs" (mốc lần Admin xoá gần nhất), máy so với mốc ĐÃ ÁP
   (xoaMocApDung) của chính máy đó, khác thì tự xoá nk/bcNgay, KHÔNG đụng sp/kho/cấu hình đang
   nhập dở (giữ invariant H1). Mô phỏng dbGoi() trả về xoaMocTs mới, không gọi mạng thật. */
const afSetup=await E(()=>{
  nk.push({id:'AFTEST-NK',ngaysx:isoNay(),lot:'9999999999',sp:'Citycat',quyCach:'5 kg',sl:10,huong:'Hương Chanh',mlDung:5,nv:'Test',ts:new Date().toISOString(),daGui:1});
  bcNgay.push({id:'AFTEST-BC',ngay:isoNay(),lot:'',sp:'Citycat',quyCach:'',kgKeHoach:10,kgThucTe:9,lyDo:'',nv:'Test',ts:new Date().toISOString(),daGui:1});
  const spTruoc=sp.map(x=>x.ten);
  return {nk:nk.length,bc:bcNgay.length,spTruoc};
});
ok('dựng sẵn có mẻ/báo cáo trên máy để test tự xoá', afSetup.nk>0&&afSetup.bc>0, JSON.stringify(afSetup));
const afKq=await E(async()=>{
  const dbGoiThat=window.dbGoi; const urlThatCuaTest=DONGBO_URL; DONGBO_URL='http://127.0.0.1:8777/gia-lap-exec';
  window.dbGoi=async()=>({ok:1, cauhinh:{sp:[],kho:[]}, xoaMocTs:'2026-08-27T10:00:00.000Z'});
  await dbKeoCauHinh();
  window.dbGoi=dbGoiThat; DONGBO_URL=urlThatCuaTest;
  return {nk:nk.length, bc:bcNgay.length, sp:sp.length, xoaMocApDung, toast:document.getElementById('toast').textContent};
});
ok('27/08/2026-R3: nhận mốc xoaMocTs mới khác mốc đã áp → tự xoá sạch mẻ đã ghi trên máy', afKq.nk===0, afKq.nk);
ok('27/08/2026-R3: tự xoá sạch báo cáo chốt thực tế trên máy', afKq.bc===0, afKq.bc);
ok('27/08/2026-R3: KHÔNG đụng cấu hình mặt hàng (sp vẫn còn, không bị xoá theo)', afKq.sp>0, afKq.sp);
ok('27/08/2026-R3: lưu lại đúng mốc đã áp (xoaMocApDung)', afKq.xoaMocApDung==='2026-08-27T10:00:00.000Z', afKq.xoaMocApDung);
ok('27/08/2026-R3: có báo cho nhân viên biết máy vừa tự xoá theo lệnh quản lý', /Quản lý vừa xoá dữ liệu mô phỏng/.test(afKq.toast), afKq.toast);
// Đồng bộ lại lần nữa với ĐÚNG mốc cũ (chưa đổi) — không được xoá thêm lần nữa / không báo lại
const afKq2=await E(async()=>{
  nk.push({id:'AFTEST-NK2',ngaysx:isoNay(),lot:'8888888888',sp:'Citycat',quyCach:'5 kg',sl:10,huong:'Hương Chanh',mlDung:5,nv:'Test',ts:new Date().toISOString(),daGui:1});
  const dbGoiThat=window.dbGoi; const urlThatCuaTest=DONGBO_URL; DONGBO_URL='http://127.0.0.1:8777/gia-lap-exec';
  window.dbGoi=async()=>({ok:1, cauhinh:{sp:[],kho:[]}, xoaMocTs:'2026-08-27T10:00:00.000Z'});
  await dbKeoCauHinh();
  window.dbGoi=dbGoiThat; DONGBO_URL=urlThatCuaTest;
  return {nk:nk.length};
});
ok('27/08/2026-R3: mốc KHÔNG đổi thì lần đồng bộ sau không tự xoá lại mẻ vừa ghi mới', afKq2.nk===1, afKq2.nk);
// dọn lại dữ liệu test
await E(()=>{nk=nk.filter(r=>!r.id.startsWith('AFTEST-'));bcNgay=bcNgay.filter(r=>!r.id.startsWith('AFTEST-'));xoaMocApDung='';luu()});

console.log('\n── AG. KHÔNG NHẢY NHẦM MẶT HÀNG KHI ADMIN ĐỔI DANH MỤC (10/09/2026) ──');
/* Tái hiện đúng lỗi: NV đang mở 1 mặt hàng (moSP là SỐ THỨ TỰ), Admin xoá 1 mặt hàng đứng TRƯỚC
   nó → lần đồng bộ cấu hình kế tiếp trả mảng mới lệch vị trí. Trước khi sửa, màn hình lặng lẽ
   chuyển sang mặt hàng khác và NV ghi nhầm. Đồng thời kiểm dữ liệu đang gõ dở vẫn còn (H1). */
const agKq=await E(async()=>{
  const goc=JSON.parse(JSON.stringify(sp));
  const moTruoc=Math.min(2,sp.length-1);            // mở mặt hàng ở vị trí thứ 3
  moSP=moTruoc;
  const tenDangMo=sp[moSP].ten;
  sp[moSP].sl='321';                                // đang gõ dở kg — phải còn nguyên sau đồng bộ
  const cauHinhMoi=goc.filter((x,i)=>i!==0)        // Admin xoá mặt hàng đứng ĐẦU (trước mặt hàng đang mở)
    .map(x=>({...x,sl:'',pb:[],huongMe:'',ngaysx:''}));
  const dbGoiThat=window.dbGoi; const urlThatCuaTest=DONGBO_URL; DONGBO_URL='http://127.0.0.1:8777/gia-lap-exec';
  window.dbGoi=async()=>({ok:1, cauhinh:{sp:cauHinhMoi,kho}});
  await dbKeoCauHinh();
  window.dbGoi=dbGoiThat; DONGBO_URL=urlThatCuaTest;
  const r={tenDangMo, moTruoc, moSau:moSP, tenSau:sp[moSP]?sp[moSP].ten:'(không có)', slSau:sp[moSP]?sp[moSP].sl:'(không có)'};
  // kịch bản 2: chính mặt hàng đang mở bị Admin xoá → phải quay về danh sách + báo rõ
  const cauHinh2=sp.filter(x=>x.ten!==tenDangMo).map(x=>({...x,sl:'',pb:[],huongMe:'',ngaysx:''}));
  window.dbGoi=async()=>({ok:1, cauhinh:{sp:cauHinh2,kho}});
  DONGBO_URL='http://127.0.0.1:8777/gia-lap-exec';
  await dbKeoCauHinh();
  window.dbGoi=dbGoiThat; DONGBO_URL=urlThatCuaTest;
  r.moSauXoa=moSP; r.toast=document.getElementById('toast').textContent;
  // trả danh mục về nguyên trạng cho các phần test khác
  sp=goc; moSP=-1; luu();
  return r;
});
ok('AG: Admin xoá mặt hàng đứng trước → NV vẫn đang mở ĐÚNG mặt hàng cũ (theo tên, không theo số thứ tự)',
  agKq.tenSau===agKq.tenDangMo, `trước "${agKq.tenDangMo}" (vị trí ${agKq.moTruoc}) → sau "${agKq.tenSau}" (vị trí ${agKq.moSau})`);
ok('AG: vị trí đã được dời theo đúng mặt hàng (lùi 1 vì mặt hàng đầu bị xoá)', agKq.moSau===agKq.moTruoc-1, `${agKq.moTruoc} → ${agKq.moSau}`);
ok('AG: số kg đang gõ dở vẫn còn nguyên (không vi phạm H1)', agKq.slSau==='321', agKq.slSau);
ok('AG: chính mặt hàng đang mở bị xoá → quay về danh sách (moSP=-1), không trỏ sang hàng khác', agKq.moSauXoa===-1, agKq.moSauXoa);
ok('AG: có báo rõ cho NV biết mặt hàng vừa bị xoá/đổi tên', /vừa xoá hoặc đổi tên mặt hàng/.test(agKq.toast), agKq.toast);

console.log('\n── R9. MÁY IN HỎNG: LƯU FILE IN + LÔ DO MÁY KHÁC GHI (10/09/2026) ──');
const r9=await E(()=>{const pp=sp[0];
  pp.hstem={tenVN:'X',thanhPhan:'X',congDung:'X',doAm:'< 10%',hdsd:'X',baoQuan:'X',xuatXu:'X',soTCCS:'01:2026/KH',hsdNam:'10'};
  nk.push({id:'R9-A1',sp:pp.ten,huong:(pp.huongs||[])[0]||'',quyCach:'5 kg',sl:100,soBao:20,ngaysx:'2026-09-10',ts:'2026-09-10T08:00:00',lot:'1101070926',nv:'Toàn',daGui:1});
  tab='lo';traLot='1101070926';ve(); return {coNutFile:!!document.querySelector('[data-intem="R9-A1"][data-quafile]'), nutInVanDauTien:document.querySelector('[data-intem]').dataset.quafile===undefined};});
ok('R9: thẻ lô có nút "Lưu file tem để in ở máy khác", nút In thường vẫn đứng trước', r9.coNutFile&&r9.nutInVanDauTien);
const [r9dl]=await Promise.all([p.waitForEvent('download'),p.click('[data-intem="R9-A1"][data-quafile]')]);
const r9f=r9dl.suggestedFilename(); const r9html=fs.readFileSync(await r9dl.path(),'utf8');
ok('R9: lưu được file .html tên có số lô', /^PEROMA-tem-lo-1101070926-.*\.html$/.test(r9f), r9f);
ok('R9: file tự chứa đủ tem (đúng số ô 1 tờ) + nút In, không cần Peroma', (r9html.match(/class="tem"/g)||[]).length===await E(()=>temCot*temHang) && /window\.print\(\)/.test(r9html));
ok('R9: file KHÔNG chứa mật khẩu / địa chỉ Apps Script / dữ liệu khác', !/script\.google|macros\/s\/|"mk"|nguonHuong|auditEvents/.test(r9html));
ok('R9: lưu file = đã tạo bản in → đánh dấu đã in như bấm In', await E(()=>nk.find(r=>r.id==='R9-A1').daInTem===true));
const r9ht=await E(async()=>{const urlCu=DONGBO_URL, mkCu=LEGACY_SHARED_TOKEN, that=window.fetch, nkTruoc=JSON.stringify(nk);
  DONGBO_URL='http://127.0.0.1:8777/gia-lap-exec'; LEGACY_SHARED_TOKEN='x';
  window.fetch=async(u,o)=>/a=nhatky/.test(String(u))?new Response(JSON.stringify({ok:1,nk:[
    {id:'R9-A1',sp:sp[0].ten,lot:'1101070926',ngaysx:'2026-09-10'},
    {id:'R9-B7',sp:sp[0].ten,huong:'Hương X',quyCach:'5 kg',sl:50,soBao:10,ngaysx:'2026-09-09',ts:'2026-09-09T09:00:00',lot:'1101070925',nv:'Loan'}]}),{headers:{'Content-Type':'application/json'}}):that(u,o);
  await taiLoHeThong(); traLot='1101070925'; ve();
  const kq={soHT:nkHT.length, boTrung:!nkHT.some(r=>r.id==='R9-A1'), trongChon:[...document.querySelectorAll('#oLot option')].some(o=>/máy khác/.test(o.textContent)),
    nhan:!!document.querySelector('.htnhan'), khongHuy:!document.querySelector('[data-huylo="R9-B7"]'), coIn:!!document.querySelector('[data-intem="R9-B7"]')};
  await inTem('R9-B7'); kq.inDuoc=/1101070925|11 01 07 0925/.test($('temIn').innerHTML);
  kq.khongGopNk=JSON.stringify(nk)===nkTruoc; await luu(); kq.khongLuu=!JSON.stringify(localStorage).includes('R9-B7');
  window.fetch=that; DONGBO_URL=urlCu; LEGACY_SHARED_TOKEN=mkCu; nkHT=[]; nkHTLuc=''; traLot=''; ve(); return kq;});
ok('R9: tải lô máy khác qua hệ thống — bỏ mẻ máy này đã có, chỉ thêm mẻ của máy khác', r9ht.soHT===1&&r9ht.boTrung, JSON.stringify(r9ht));
ok('R9: lô máy khác hiện trong ô chọn (ghi "máy khác") và có nhãn chỉ xem & in', r9ht.trongChon&&r9ht.nhan);
ok('R9: lô máy khác KHÔNG có nút Huỷ lô, vẫn in được tem', r9ht.khongHuy&&r9ht.coIn&&r9ht.inDuoc);
ok('R9: lô máy khác KHÔNG gộp vào dữ liệu máy này, KHÔNG lưu xuống máy (không thể gửi trùng lên Sheet)', r9ht.khongGopNk&&r9ht.khongLuu);
await E(()=>{const i=nk.findIndex(r=>r.id==='R9-A1');if(i>=0)nk.splice(i,1);luu();ve()});

console.log('\n────────────────────────────');
ok('không có lỗi console', cerr.length===0, cerr.slice(0,2).join(' | '));
console.log(`\nKẾT QUẢ:  ${dat} đạt · ${hong} hỏng`);
if(hong)console.log('CẦN SỬA:\n  - '+loi.join('\n  - '));
await b.close(); process.exit(hong?1:0);
