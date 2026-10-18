
import fs from 'node:fs';
const OUT='_nav2_sites.json';
const acc=new Map();
try { for (const r of JSON.parse(fs.readFileSync(OUT,'utf8'))) acc.set(r.host,{...r,from:[].concat(r.from)}); } catch {}
function add(host,name,from){ host=String(host||'').toLowerCase().replace(/^www\./,''); if(!host||!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host))return; if(!acc.has(host))acc.set(host,{host,name:name||'',from:[from],count:0}); const x=acc.get(host); x.count++; if(name&&name.length>x.name.length)x.name=name.slice(0,60); if(!x.from.includes(from))x.from.push(from); }
function parseFile(file, from) {
  let html; try { html=fs.readFileSync(file,'utf8'); } catch { return 0; }
  if (!html.length) return 0;
  const parts = html.split('<div class="cc-cd"').slice(1);
  const names = parts.map(c=>{const m=/cc-cd-lb[^>]*>[\s\S]{0,300}?<span>([\s\S]{1,40}?)<\/span>/.exec(c);return m?m[1].replace(/\s+/g,' ').trim():'';});
  let n=0;
  parts.forEach((c,i)=>{
    const img=/assets\/images\/media\/([a-z0-9][a-z0-9.-]*\.[a-z]{2,})\.png/i.exec(c);
    if(img){ add(img[1],names[i]||'',from); n++; return; }
    const m=/<a\s+href="(https?:\/\/[^"]+)"/i.exec(c.slice(0,4000));
    if(m){ try{ add(new URL(m[1]).hostname, names[i]||'', from); n++; }catch{} }
  });
  return n;
}
let total=0;
for (const [f,from] of [['_nav2_t_realtech.html','tophub_realtech'],['_nav2_t_prog.html','tophub_prog'],['_nav2_t_startup.html','tophub_startup'],['_nav2_t_life.html','tophub_life'],['_nav2_t_study.html','tophub_study']]) {
  const n=parseFile(f,from); total+=n; console.log(f+' cards='+n);
}
fs.writeFileSync(OUT, JSON.stringify([...acc.values()]));
console.log('DONE cards='+total+' hosts='+acc.size);
// 打印新增的高价值（开发者/设计/独立/赚钱相关）域名
const KW=/github|huggingface|gitlab|v2ex|producthunt|indie|notion|dribbble|behance|zcool|ui.cn|figma|canva|素材|icon|font|字体|psd|template|模板|theme|主题|shop|design|icns|iconfont|iconfinder|unsplash|pexels|pixabay|mixkit|coverr|artlist|envelope|稿定|创客贴|fotor|logo|logonews|doyoudo|doyoudo|51miz|90design|uiiiuiii|aicreater|uicreater|站酷|花瓣|huaban|pinterest|artstation|render|blender|unity|unreal|cocos|gitee|coding|sourceforge|npm|pypi|docker|hub.|cloudflare|vercel|netlify|railway|supabase|firebase|zeit|now.sh|glitch|replit|codesandbox|stackblitz|codepen|jsfiddle|jsdelivr|unpkg|cdnjs|bootcdn|staticfile|bytecdn|bytedance|字节|火山|开发者|程序员|极客|geek|hacker|product|maker|副业|赚钱|接单|外包|威客|猪八戒|程序员客栈|开源|众包|remote|freelance|upwork|fiverr|toptal|guru|peopleperhour|99designs|envato|creative|market|素材|codecanyon|themeforest|graphicriver|videohive|audiojungle/i;
const hits=[...acc.values()].filter(r=>KW.test(r.host)||KW.test(r.name||''));
console.log('KW-HITS: '+hits.length);
console.log(hits.map(r=>r.host+' :: '+(r.name||'')).join('\n'));
