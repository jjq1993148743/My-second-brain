import { execFile } from 'node:child_process';
const run = (cmd, args) => new Promise(res => execFile(cmd, args, { maxBuffer: 32*1024*1024, windowsHide: true }, (e, so) => res(so || '')));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl = u => run('curl', ['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: ' + UA,'--max-time','25','--compressed',u]);
function text(h) {
  return (h||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"')
    .split('\n').map(l=>l.trim()).filter(l=>l.length>25);
}
const urls = [
  'https://support.peopleperhour.com/hc/en-us/articles/205218397-Raising-a-Dispute',
  'https://www.itqlick.com/peopleperhour-com/pricing',
  'https://www.complaintsboard.com/peopleperhour-b126221'
];
for (const u of urls) {
  const html = await curl(u);
  const lines = text(html);
  const key = lines.filter(l => /(chargeback|dispute|refund|fee|commission|20%|7\.5%|3\.5%|escrow|withdraw|not (?:be )?paid|cannot pay|no guarantee)/i.test(l)).slice(0, 15);
  console.log('=== ' + u.slice(0,70) + ' bytes=' + html.length);
  for (const k of key) console.log('  · ' + k.slice(0, 220));
  await new Promise(r => setTimeout(r, 2500));
}