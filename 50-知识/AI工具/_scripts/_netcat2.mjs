import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 先用 Commons API 搜真实的猫照片 URL
const api='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=cat%20sitting&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json';
const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25',api]);
try{
  const j=JSON.parse(h);
  const pages=j.query&&j.query.pages?Object.values(j.query.pages):[];
  let i=0;
  for(const p of pages){
    if(p.imageinfo&&p.imageinfo[0]&&p.imageinfo[0].thumburl){
      i++;
      const u=p.imageinfo[0].thumburl;
      console.log('['+i+'] '+p.title+' -> '+u.slice(0,90));
      const dl=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','30','-o','_netcat_'+i+'.jpg','-w','%{http_code} %{size_download}',u]);
      console.log('    dl: '+dl);
      if(i>=3) break;
    }
  }
}catch(e){ console.log('parse fail: '+String(e).slice(0,80)+' head=' + h.slice(0,120)); }
console.log('DONE');