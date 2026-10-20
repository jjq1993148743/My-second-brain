import { execFile } from 'node:child_process';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const run=(a)=>new Promise(res=>execFile('curl',a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const get=u=>run(['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25','--compressed',u]);
const h=await get('https://justjoin.it/job-offers/all-locations?page=1');
fs.writeFileSync('_POOL_justjoin_raw.html',h,'utf8');
// 找内嵌 JSON 变量
const marks=['self.__next_f','__NEXT_DATA__','window.__','application/json','INITIAL_STATE','__INITIAL'];
for(const m of marks) console.log(m+': '+(h.split(m).length-1));
// 找职位标题模式（英文职位词）
const titleHits=(h.match(/"(title|position|jobTitle)":"/g)||[]).length;
const salaryHits=(h.match(/"salary[^"]*":/g)||[]).length;
console.log('titleKeys='+titleHits+' salaryKeys='+salaryHits);
// 打印 JSON-LD 内容
const lds=[...h.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
for(const ld of lds) console.log('LD: '+ld.slice(0,400).replace(/\s+/g,' '));
// 试找 self.__next_f 里的职位
const idx=h.indexOf('"title":"');
console.log('firstTitleIdx='+idx);
if(idx>0) console.log('ctx: '+h.slice(idx-200,idx+300).replace(/\s+/g,' '));
console.log('DONE');