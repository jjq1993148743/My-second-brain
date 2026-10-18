
import { get, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
const OUT='D:/GitHub/_intel/';
const sellers = JSON.parse(fs.readFileSync(OUT+'gum-sellers-all.json','utf8')).map(x=>x[0]);
const links = new Map();
const BATCH = sellers.slice(0, 90);
for (let i=0;i<BATCH.length;i++) {
  const u = BATCH[i];
  for (let a=0;a<3;a++) {
    try {
      const r = await get(u, 'text/html');
      if (r.status!==200) { if(a===2) console.log(u, r.status); break; }
      const html=r.body.toString('utf8');
      const s=html.indexOf('data-page="');
      if (s<0) break;
      const e=html.indexOf('"></div>',s);
      const raw=html.slice(s+11,e).replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&#39;/g,"'");
      const d=JSON.parse(raw);
      const txt = JSON.stringify(d.props);
      const re=/https?:\/\/([a-z0-9][a-z0-9.-]*\.[a-z]{2,})(\/[^\\" ]{0,80})?/gi; let m;
      const BLOCK=/gumroad\.com|public-files\.gumroad|assets\.gumroad|google|gstatic|facebook|fbcdn|twitter|instagram|youtube|tiktok|linkedin|stripe|intercom|segment|sentry|cloudflare|datadog|hotjar|zendesk|amazonaws|cloudfront|fonts|w3\.org|schema|apple|microsoft|paypal|vercel|netlify|doubleclick|ogp\.me|recaptcha|gum\.co/;
      while((m=re.exec(txt))){
        const h=m[1].toLowerCase(); if(BLOCK.test(h))continue;
        const full=m[0].replace(/[)"',]+$/,'');
        if(!links.has(h)) links.set(h,{host:h,url:full,from:u});
      }
      break;
    } catch(e){ await sleep(2000); }
  }
  if (i%10===0) console.log('done',i,'links',links.size);
  await sleep(900);
}
fs.writeFileSync(OUT+'gum-external-links.json', JSON.stringify([...links.values()],null,1));
console.log('TOTAL', links.size);
