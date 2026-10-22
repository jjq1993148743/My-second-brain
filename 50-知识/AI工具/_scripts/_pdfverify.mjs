import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:16*1024*1024,windowsHide:true,timeout:28000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','25','--compressed',u]);
const clean=s=>s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&mdash;/g,'-').replace(/\s+/g,' ').trim();
// 1. 搜 DSH 生态里 PDF 相关插件的实际数量
const idx=await curl('https://awesome-dsh-plugin.com/plugins.json');
let j=null; try{j=JSON.parse(idx);}catch(e){}
if(j){
  const P=j.plugins||j;
  const pdfPlugs=P.filter(p=>{
    const t=(String(p.name)+' '+JSON.stringify(p.description||'')).toLowerCase();
    return t.includes('pdf') || t.includes('文档解析') || t.includes('ocr');
  });
  console.log('=== 全生态含 PDF/OCR 的插件: '+pdfPlugs.length+' 个 ===');
  pdfPlugs.sort((a,b)=>(b.downloads||0)-(a.downloads||0)).slice(0,12).forEach(p=>{
    console.log('  '+String(p.name).padEnd(32)+' dl='+String(p.downloads||0).padStart(7)+' cat='+(p.category||'?'));
  });
}
// 2. 搜用户抱怨
const qs=['DSH 插件 PDF 不好用','DeepSeek Harness PDF 解析','AI PDF 提取表格 痛点'];
for(const q of qs){
  const h=await curl('https://weixin.sogou.com/weixin?type=2&query='+encodeURIComponent(q));
  const body=clean(h);
  const i=body.indexOf('以下内容来自微信公众平台');
  console.log('\n=== '+q);
  console.log((i>0?body.slice(i+12,i+450):body.slice(0,300)));
  await new Promise(r=>setTimeout(r,5000));
}
console.log('DONE');