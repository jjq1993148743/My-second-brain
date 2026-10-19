import { execFile } from 'node:child_process';
const execFileAsync = (cmd, args) => new Promise(res => execFile(cmd, args, { maxBuffer: 32*1024*1024, windowsHide: true }, (e, so) => res(so || '')));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function curl(url) {
  return execFileAsync('curl', ['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: ' + UA,'-H','Accept-Language: en-US,en;q=0.9','--max-time','25','--compressed',url]);
}
function text(h) {
  return (h||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"')
    .split('\n').map(l=>l.trim()).filter(l=>l.length>15);
}

const urls = [
  'https://wise.com/gb/blog/peopleperhour-review',
  'https://www.complaintsboard.com/peopleperhour-b126221',
  'https://freelancesphere.com/peopleperhour-vs-fiverr-uk'
];
const out = [];
for (const u of urls) {
  const html = await curl(u);
  const lines = text(html);
  // 找评价性语句
  const reviewLines = lines.filter(l =>
    /(fee|commission|charge|20%|scam|legit|recommend|avoid|complaint|bad|good|great|poor|slow|payment|withdraw|support)/i.test(l)
    && l.length > 30 && l.length < 300
  ).slice(0, 25);
  out.push({ url: u, bytes: html.length, lines: reviewLines });
  await new Promise(r => setTimeout(r, 2000));
}
console.log(JSON.stringify(out, null, 1));