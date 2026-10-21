// _c_htmltext.mjs —— 把 HTML 转成可见文本（去 script/style），输出到标准输出或文件
import fs from 'node:fs';
const IN = process.argv[2]; const OUT = process.argv[3];
const MAX = parseInt(process.argv[4]||'20000',10);
let h = fs.readFileSync(IN,'utf8');
h = h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ')
     .replace(/<br\s*\/?>/gi,'\n').replace(/<\/(p|div|li|tr|h\d)>/gi,'\n')
     .replace(/<[^>]+>/g,' ')
     .replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
     .replace(/&ldquo;|&rdquo;/g,'"').replace(/&mdash;/g,'-').replace(/&hellip;/g,'...')
     .replace(/&lt;/g,'<').replace(/&gt;/g,'>')
     .replace(/[ \t]+/g,' ').replace(/\n\s*\n+/g,'\n').trim();
if(OUT){ fs.writeFileSync(OUT, h.slice(0,MAX),'utf8'); console.log('WROTE '+OUT+' len='+h.length); }
else console.log(h.slice(0,MAX));
