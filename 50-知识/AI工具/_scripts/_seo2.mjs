import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:32*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// 抓一个已知的热门插件页（用 MichengAI 的，或者随便一个）
const urls=[
 ['dshplugin.store 插件页','https://dshplugin.store/plugin/dsh-cost-meter'],
 ['awesome 插件页','https://awesome-dsh-plugin.com/p/MichengAI/dsh-code-review/'],
];
for(const [n,u] of urls){
  const h=await run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'--max-time','22','-w','\nCODE=%{http_code}',u]);
  const code=(h.match(/CODE=(\d+)$/)||[])[1]||'?';
  const body=h.replace(/\nCODE=\d+$/,'');
  console.log('=== '+n+' code='+code+' bytes='+body.length);
  if(code==='200'){
    fs.writeFileSync('_seopage_'+n.replace(/[^a-z0-9]/gi,'_')+'.html',body,'utf8');
    // 提取 title
    const title=(body.match(/<title>([^<]*)<\/title>/)||[])[1]||'?';
    const desc=(body.match(/<meta name="description" content="([^"]{0,300})"/)||[])[1]||'?';
    const h1=(body.match(/<h1[^>]*>([^<]{0,200})<\/h1>/)||[])[1]||'?';
    const canonical=(body.match(/<link rel="canonical" href="([^"]+)"/)||[])[1]||'?';
    const ogTitle=(body.match(/<meta property="og:title" content="([^"]{0,200})"/)||[])[1]||'?';
    const jsonLd=(body.match(/<script type="application\/ld\+json">([\s\S]{0,600})<\/script>/)||[])[1]||'';
    console.log('  title: '+title.slice(0,150));
    console.log('  description: '+desc.slice(0,200));
    console.log('  h1: '+h1.slice(0,120));
    console.log('  canonical: '+canonical.slice(0,100));
    console.log('  og:title: '+ogTitle.slice(0,100));
    console.log('  有JSON-LD: '+(jsonLd?'是':'否'));
    if(jsonLd) console.log('  JSON-LD类型: '+((jsonLd.match(/"@type"\s*:\s*"([^"]+)"/)||[])[1]||'?'));
  }
  await new Promise(r=>setTimeout(r,800));
}
console.log('DONE');