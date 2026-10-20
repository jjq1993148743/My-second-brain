import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','20','--compressed',u]);

// 用 tags=story + 按时间排序，找最新的 whoishiring
const s=await curl('https://hn.algolia.com/api/v1/search_by_date?query=%22Who%20is%20hiring%22&tags=story&hitsPerPage=50');
let sj=null; try{sj=JSON.parse(s);}catch(e){}
if(!sj||!sj.hits){console.log('FAIL');process.exit(1);}
const hiring=sj.hits.filter(h=>/^Ask HN: Who is hiring\?/i.test(h.title||''));
console.log('FOUND='+hiring.length);
hiring.slice(0,5).forEach(h=>console.log('  '+h.title+' | id='+h.objectID+' | '+h.created_at+' | comments='+h.num_comments));