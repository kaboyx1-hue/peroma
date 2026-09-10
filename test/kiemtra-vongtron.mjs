/* KIỂM TRA VÒNG TRÒN: admin xuất → nhân viên nạp → ghi mẻ → xuất → admin nhận */
import {chromium} from 'playwright'; import fs from 'fs';
const CH='C:/Program Files/Google/Chrome/Application/chrome.exe';
let dat=0,hong=0; const ok=(t,c,g='')=>{c?dat++:hong++;console.log(`${c?'✓':'✗ HỎNG'}  ${t}${g?'  → '+g:''}`)};

/* 10/09/2026 — cùng lý do như kiemtra-nv.mjs: số lô có phần MMYY lấy từ ngày sản xuất.
   Mẻ ghi qua giao diện dùng ngày hôm nay, nên lô mong đợi phải tính theo tháng chạy test.
   Viết cứng '0826' thì từ tháng 9/2026 trở đi là hỏng dù phần mềm vẫn đúng. */
const _n=new Date();
const LOT_UI='110107'+String(_n.getMonth()+1).padStart(2,'0')+String(_n.getFullYear()).slice(-2);
const b=await chromium.launch({executablePath:CH});
/* S16 (10/09/2026): in tem giờ tự dàn chữ — nội dung tem dài ở khổ 5×4 thì app HỎI đổi khổ trước khi in.
   Các bài test cũ (kiểm đúng bản ghi / đúng id, không kiểm khổ) không trả lời hộp này nên sẽ chờ mãi. Tự bấm
   "In khổ đề xuất" giùm; bài test S16 tự tắt bằng window.__tatTuDongKhoTem=true để kiểm hộp thoại thật. */
const TU_KHO_TEM=()=>{setInterval(()=>{const t=document.getElementById('dlgT'),m=document.getElementById('mask'),o=document.getElementById('dlgO');
  if(!t||!m||!o||window.__tatTuDongKhoTem)return;
  if(/Khổ này không đủ chỗ cho tem|Chữ trên tem sẽ rất nhỏ/.test(t.textContent)&&getComputedStyle(m).display!=='none')o.click();
  const d=document.getElementById('danTem'); if(d){const n=document.getElementById('dtIn'); if(n&&!n.disabled)n.click(); else {const g=d.querySelector('[data-dt="goiy"]'); if(g)g.click()}}},40)};
const ctx=await b.newContext({acceptDownloads:true}); await ctx.addInitScript(TU_KHO_TEM); const err=[];

// ── 1. ADMIN: dựng dữ liệu rồi xuất .json
const A=await ctx.newPage(); A.on('pageerror',e=>err.push('ADMIN '+e.message));
await A.goto('http://127.0.0.1:8777/huong/bang-tra-huong-lieu.html'); await A.waitForTimeout(800);
await A.evaluate(()=>{
  maHuong['Hương Chanh']='01'; maQC['5 kg']='07'; nvDS.push('Toàn');
  const c=sp.find(x=>x.ten==='Citycat'); c.maSP='11';
  c.huongs=['Hương Chanh']; c.tam=[...c.huongs]; c.dauRa=['5 kg'];
  c.hstem={tenVN:'Cát vệ sinh THE CITYCAT',tenEN:'',thanhPhan:'Bentonite, hương liệu',
    congDung:'Vón cục, khử mùi',kichThuoc:'0,5–3,5 mm',doAm:'< 10%',hdsd:HDSD_NHOM[0][1],
    baoQuan:BAOQUAN_MD,xuatXu:XUATXU_MD,soTCCS:'01:2026/KH',hsdNam:'10'};
  nlTong=27000; nlNgayKhai='2000-01-01T00:00:00.000Z'; // 25/08/2026: test tiến độ nguyên liệu đồng bộ qua .json
  return luuNgay()});
await A.waitForTimeout(300);
await A.evaluate(()=>{tab='sl';ve()}); await A.waitForTimeout(300);
const d1=A.waitForEvent('download',{timeout:9000});
await A.click('#jsBtn');
const f1=await d1; await f1.saveAs('/tmp/cauhinh_admin.json');
ok('admin xuất được cấu hình', fs.existsSync('/tmp/cauhinh_admin.json'));

// ── 2. NHÂN VIÊN: nạp cấu hình, ghi mẻ, xuất
const N=await ctx.newPage(); N.on('pageerror',e=>err.push('NV '+e.message));
await N.goto('http://127.0.0.1:8777/nv/peroma-nhanvien.html'); await N.waitForTimeout(700);
await N.click('[data-tab="dl"]'); await N.waitForTimeout(250);
await N.setInputFiles('#fIn','/tmp/cauhinh_admin.json'); await N.waitForTimeout(400);
await N.click('#dlgO'); await N.waitForTimeout(500);
ok('nhân viên nạp được cấu hình admin', (await N.evaluate(()=>sp.length))===11);
ok('nhận đủ hồ sơ tem', (await N.evaluate(()=>(sp.find(x=>x.ten==='Citycat').hstem||{}).soTCCS))==='01:2026/KH');
ok('nhân viên nhận đúng tiến độ nguyên liệu khai báo (nlTong)', (await N.evaluate(()=>nlTong))===27000);
await N.click('#whoBtn'); await N.waitForTimeout(250);
await N.click('[data-cn="Toàn"]'); await N.waitForTimeout(200); await N.click('#dlgO'); await N.waitForTimeout(300);
await N.click('[data-tab="me"]'); await N.waitForTimeout(300);
const i=await N.evaluate(()=>sp.findIndex(x=>x.ten==='Citycat'));
await N.click(`[data-sp="${i}"]`); await N.waitForTimeout(350);
await N.click('[data-f="sl"]'); await N.keyboard.type('100',{delay:50}); await N.waitForTimeout(300);
await N.click('[data-h="Hương Chanh"]'); await N.waitForTimeout(350);
await N.click('[data-pbadd]'); await N.waitForTimeout(400);
await N.evaluate(()=>{window.print=()=>{window.__inCT=1}});
await N.click('[data-inphieu]'); await N.waitForTimeout(350);
await N.click('[data-xnct]'); await N.waitForTimeout(300);
await N.click('[data-kiem]'); await N.waitForTimeout(600); // 27/08/2026-lần4: ghi thẳng, không còn qua hộp thoại đọc lại/đã ghi xong
ok('nhân viên ghi được mẻ', (await N.evaluate(()=>nk.length))===1, await N.evaluate(()=>nk[0]?.lot||'—'));

// ── 2b. NHÂN VIÊN: gửi thêm 1 "Báo cáo tiến độ" cuối ngày, gắn với ĐÚNG LÔ vừa ghi (25/08/2026-J)
await N.click('[data-tab="bc"]'); await N.waitForTimeout(300);
const locIdBC=await N.evaluate(()=>nk[0].id);
await N.selectOption('#bcLotIn', locIdBC);
await N.fill('#bcKgIn','80');
await N.fill('#bcLyDoIn','Thiếu người, chưa làm kịp số đã dự kiến');
await N.click('#bcGuiBtn'); await N.waitForTimeout(300);
ok('nhân viên gửi được báo cáo tiến độ cuối ngày', (await N.evaluate(()=>bcNgay.length))===1);
ok('báo cáo tiến độ gắn đúng lô + kế hoạch lấy từ nk',
  (await N.evaluate(()=>bcNgay[0].lot===nk[0].lot && bcNgay[0].kgKeHoach===nk[0].sl && bcNgay[0].sp===nk[0].sp)));

await N.click('[data-tab="dl"]'); await N.waitForTimeout(300);
const d2=N.waitForEvent('download',{timeout:9000});
await N.click('[data-xuat]');
const f2=await d2; await f2.saveAs('/tmp/me_nv.json');
ok('nhân viên xuất được file mẻ', fs.existsSync('/tmp/me_nv.json'));
ok('file xuất mang theo cả báo cáo tiến độ', JSON.parse(fs.readFileSync('/tmp/me_nv.json','utf8')).bcNgay.length===1);

// ── 3. ADMIN: nhận mẻ
await A.evaluate(()=>{tab='sl';ve()}); await A.waitForTimeout(300);
const truoc=await A.evaluate(()=>nk.length);
await A.setInputFiles('#nvIn','/tmp/me_nv.json'); await A.waitForTimeout(450);
await A.click('#dlgO'); await A.waitForTimeout(600);
const sau=await A.evaluate(()=>nk.length);
ok('admin nhận được mẻ', sau===truoc+1, `${truoc} → ${sau}`);
ok('mẻ về đúng số lô', (await A.evaluate(()=>nk[nk.length-1].lot))===LOT_UI);
ok('mẻ ghi rõ do nhân viên gửi', (await A.evaluate(()=>nk[nk.length-1].tuNV))===1);
ok('admin nhận đúng báo cáo tiến độ của nhân viên', (await A.evaluate(()=>bcNgay.length))===1);
ok('báo cáo tiến độ về đúng nội dung (lô, kế hoạch, kg thực tế, lý do)',
  (await A.evaluate(lot=>bcNgay[0].lot===lot && bcNgay[0].kgKeHoach===nk[nk.length-1].sl &&
    bcNgay[0].kgThucTe===80 && bcNgay[0].lyDo==='Thiếu người, chưa làm kịp số đã dự kiến' && bcNgay[0].nv==='Toàn', LOT_UI)));

// ── 4. Nhận lại lần hai — không được trùng
await A.setInputFiles('#nvIn','/tmp/me_nv.json'); await A.waitForTimeout(450);
const t2=await A.evaluate(()=>($('dlgT')||{}).textContent);
ok('nhận lại lần hai KHÔNG trùng', /Không có gì mới/.test(t2), t2);
await A.click('#dlgC').catch(()=>{}); await A.waitForTimeout(300);
ok('số mẻ không đổi', (await A.evaluate(()=>nk.length))===sau);

// ── 5. Admin in được tem cho lô nhân viên ghi
await A.evaluate(lot=>{tab='bc';traLot=lot;ve();window.print=()=>{window.__in=1}}, LOT_UI);
await A.waitForTimeout(350);
await A.click('[data-intem]'); await A.waitForTimeout(500);
ok('admin in được tem cho lô của nhân viên', (await A.evaluate(()=>window.__in===1)));
ok('in xong tự đánh dấu daInTem (phục vụ nhắc chưa in tem, 25/08/2026)',
  (await A.evaluate(lot=>{const r=nk.find(x=>x.lot===lot);return !!(r&&r.daInTem&&r.inTemLuc)}, LOT_UI)));

console.log('\n────────────────────────────');
ok('không có lỗi console', err.length===0, err.slice(0,2).join(' | '));
console.log(`\nKẾT QUẢ VÒNG TRÒN:  ${dat} đạt · ${hong} hỏng`);
await b.close(); process.exit(hong?1:0);
