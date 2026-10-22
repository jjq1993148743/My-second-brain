import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:40000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const qs=['cat sitting tile floor indoors','cat crouching on floor','cat hunched looking down'];
let idx=0;
for(const q of qs){
  const api='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch='+encodeURIComponent(q)+'&gsrnamespace=6&gsrlimit=4&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=1000&format=json';
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25',api]);
  try{
    const j=JSON.parse(h);
    const pages=j.query&&j.query.pages?Object.values(j.query.pages):[];
    for(const p of pages.slice(0,4)){
      const m=p.imageinfo&&p.imageinfo[0];
      if(!m||!m.thumburl) continue;
      idx++;
      const lic=m.extmetadata&&m.extmetadata.LicenseShortName?m.extmetadata.LicenseShortName.value:'?';
      const dl=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','30','-o','_cand'+idx+'.jpg','-w','%{http_code}',m.thumburl]);
      console.log('['+idx+'] '+p.title+' ['+lic+'] '+dl);
    }
  }catch(e){ console.log('fail'); }
  await new Promise(r=>setTimeout(r,500));
}
console.log('DONE');