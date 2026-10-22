import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 多组搜索词：真实拍摄到的猫呕吐/不适
const searches=[
 ['vomit','cat%20vomit'],
 ['sick','sick%20cat%20vet'],
 ['crouch','cat%20crouching%20hunched'],
 ['gag','cat%20gagging%20hairball'],
];
for(const [tag,q] of searches){
  const api='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch='+q+'&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=900&format=json';
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25',api]);
  try{
    const j=JSON.parse(h);
    const pages=j.query&&j.query.pages?Object.values(j.query.pages):[];
    console.log('=== ['+tag+'] '+pages.length+' 结果');
    for(const p of pages.slice(0,6)){
      const meta=p.imageinfo&&p.imageinfo[0];
      if(!meta) continue;
      const lic=meta.extmetadata&&meta.extmetadata.LicenseShortName?meta.extmetadata.LicenseShortName.value:'?';
      console.log('  '+p.title+'  ['+lic+']');
    }
  }catch(e){ console.log('['+tag+'] parse fail'); }
  await new Promise(r=>setTimeout(r,600));
}
console.log('DONE');