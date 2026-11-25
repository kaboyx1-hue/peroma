/* S154 25/11/2026 — in tem khổ nhiệt ra PDF thật: mỗi trang phải đúng khổ cuộn (65×65, 50×70, 70×50), 1 trang/tem; A4 không đổi.
   Chạy: node kiemtra-in-nhiet.mjs (cần server 127.0.0.1:8777) */
import {chromium} from 'playwright';
const CHROME=process.env.PEROMA_CHROME||(process.env.CI?undefined:'C:/Program Files/Google/Chrome/Application/chrome.exe');
const APP={admin:'http://127.0.0.1:8777/huong/bang-tra-huong-lieu.html',nv:'http://127.0.0.1:8777/nv/peroma-nhanvien.html'};
const b=await chromium.launch({executablePath:CHROME}); let hong=0;
const coTrang=buf=>{const s=buf.toString('latin1');return [...s.matchAll(/\/MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)\s*\]/g)].map(m=>[+m[1],+m[2]].map(v=>Math.round(v/72*25.4)))};
for(const [ten,url] of Object.entries(APP)){
  const p=await b.newPage(); await p.goto(url); await p.waitForTimeout(1200);
  if(ten==='nv')await p.evaluate(async()=>{sp=(await (await fetch('cauhinh.json')).json()).sp}); // NV chưa nạp cấu hình → lấy mặt hàng mẫu
  for(const kho of ['nhiet','nhiet5070','nhiet7050','a4']){
    const ok=await p.evaluate(k=>{const s=sp.find(x=>!khongTem(x))||sp[0]; if(typeof temKho!=='undefined')temKho=k;
      const r={id:'T',sp:s.ten,huong:'H',quyCach:'1 kg',sl:10,soBao:10,kgBao:1,ngaysx:'2026-11-17',lot:'0101071126',nv:'T'};
      const kk=khoTemCua(s); document.getElementById('temIn').innerHTML=trangTem(r,s); return kk},kho);
    const pdf=await p.pdf({preferCSSPageSize:true}); const tr=coTrang(pdf);
    const mong={nhiet:[65,65],nhiet5070:[50,70],nhiet7050:[70,50],a4:[210,297]}[ok]||[210,297];
    const dung=tr.length>=1&&tr.every(t=>t[0]===mong[0]&&t[1]===mong[1])&&(ok==='a4'||tr.length===1);
    if(!dung)hong++; console.log(`${dung?'✓':'✗ HỎNG'}  ${ten} ${kho} (khổ thực ${ok}) → ${tr.length} trang ${JSON.stringify(tr)}`)}
  await p.close()}
await b.close(); console.log(hong?`${hong} HỎNG`:'ĐẠT'); process.exit(hong?1:0);
