import { execFile } from 'node:child_process';
const run = (cmd, args) => new Promise(res => execFile(cmd, args, { maxBuffer: 32*1024*1024, windowsHide: true }, (e, so) => res(so || '')));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl = u => run('curl', ['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: ' + UA,'-H','Accept-Language: en-US,en;q=0.9','--max-time','25','--compressed',u]);
function text(h) {
  return (h||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"')
    .split('\n').map(l=>l.trim()).filter(l=>l.length>10);
}
const urls = [
  'https://www.trustpilot.com/review/peopleperhour.com',
  'https://www.sitejabber.com/reviews/peopleperhour.com',
  'https://www.reddit.com/r/freelance/search?q=peopleperhour&restrict_sr=1'
];
for (const u of urls) {
  const html = await curl(u);
  const lines = text(html);
  const score = (html.match(/([0-9]\.[0-9])\s*(?:out of|\/)\s*5/i) || [])[1] || '';
  const hit = lines.filter(l => /(peopleperhour|pph)/i.test(l) && l.length > 25 && l.length < 260).slice(0, 12);
  console.log('=== ' + u + ' === bytes=' + html.length + ' score=' + score);
  for (const h of hit) console.log('  - ' + h);
  await new Promise(r => setTimeout(r, 2500));
}