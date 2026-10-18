
import { get, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
const r = await get('https://codegrid.gumroad.com', 'text/html');
console.log('status', r.status, r.body.length);
fs.writeFileSync('D:/GitHub/_intel/seller-sample.html', r.body);
const html = r.body.toString('utf8');
const hosts=new Set();
const re=/https?:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi; let m;
const BLOCK=/gumroad|google|gstatic|facebook|twitter|instagram|youtube|tiktok|linkedin|stripe|intercom|segment|sentry|cloudflare|datadog|hotjar|zendesk|amazonaws|cloudfront|fonts|w3\.org|schema|apple|microsoft|paypal|vercel|netlify|doubleclick/;
while((m=re.exec(html))){const h=m[1].toLowerCase().replace(/^www\./,''); if(BLOCK.test(h))continue; hosts.add(h);}
console.log([...hosts].join('\n'));
