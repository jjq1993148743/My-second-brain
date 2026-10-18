
import { get, strip, sleep } from './proxy-fetch.mjs';
const r = await get('https://gumroad.com/discover', 'text/html');
console.log('STATUS', r.status, 'LEN', r.body.length);
const t = r.body.toString('utf8');
const hosts = [...t.matchAll(/https?:\/\/([a-z0-9-]+)\.gumroad\.com/gi)].map(m=>m[1].toLowerCase());
console.log('SUBDOMAINS', [...new Set(hosts)].length, [...new Set(hosts)].slice(0,50).join(','));
console.log('LINKS', [...t.matchAll(/href="(\/[^"]{3,80})"/g)].map(m=>m[1]).slice(0,25).join(' | '));
fs.writeFileSync('D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_gum_discover.html', t);
console.log('SAVED');
