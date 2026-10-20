import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','--compressed',u]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const extract=(h,lang)=>{
  const re=new RegExp('href="\\/'+lang+'\\/jobs\\/([a-z0-9\\-]+)','g');
  const out=new Set();
  let m; while((m=re.exec(h))!==null){ out.add(m[1]); }
  return out;
};
// 多页累积
const en=new Set(), pl=new Set();
for(let p=1;p<=5;p++){
  const he=await curl('https://useme.com/en/jobs/?page='+p);
  extract(he,'en').forEach(x=>en.add(x));
  await sleep(1200);
  const hp=await curl('https://useme.com/pl/jobs/?page='+p);
  extract(hp,'pl').forEach(x=>pl.add(x));
  await sleep(1200);
  console.log('p'+p+' en='+en.size+' pl='+pl.size);
}
const ov=(A,B)=>{ const arr=[...A]; return Math.round(arr.filter(x=>B.has(x)).length/Math.max(A.size,1)*100); };
console.log('---');
console.log('en total='+en.size+' pl total='+pl.size);
console.log('en vs pl: '+ov(en,pl)+'%');
// 抽样看是否同一批 slug
console.log('EN sample: '+[...en].slice(0,3).join(', '));
console.log('PL sample: '+[...pl].slice(0,3).join(', '));