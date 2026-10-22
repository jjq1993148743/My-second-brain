import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:40000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const qs=['cat retching','cat gagging','cat hairball','cat coughing','cat vomiting grass','cat heaving'];
let n=0;
for(const q of qs){
  const api='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch='+encodeURIComponent(q)+'&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=1100&format=json';
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25',api]);
  let cnt=0;
  try{
    const j=JSON.parse(h);
    const pages=j.query&&j.query.pages?Object.values(j.query.pages):[];
    for(const p of pages){
      const m=p.imageinfo&&p.imageinfo[0];
      if(!m||!m.thumburl) continue;
      const t=(p.title||'').toLowerCase();
      if(!/\.(jpg|jpeg|png)$/i.test(t)) continue;
      n++; cnt++;
      const lic=m.extmetadata&&m.extmetadata.LicenseShortName?m.extmetadata.LicenseShortName.value:'?';
      await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','30','-o','_pose'+n+'.jpg',m.thumburl]);
      console.log('['+n+'] ['+q+'] '+p.title+' ['+lic+']');
      if(cnt>=3) break;
    }
  }catch(e){}
  if(cnt===0) console.log('['+q+'] 无照片结果');
  await new Promise(r=>setTimeout(r,400));
}
console.log('DONE');