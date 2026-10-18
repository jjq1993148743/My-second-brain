
import { get, sleep } from './proxy.mjs';
import fs from 'node:fs';
const D = process.env.D;
const j = JSON.parse(fs.readFileSync(D+'/UGC_DELIVERABLE.json','utf8'));
const invalid = j.gumroad_evidence.shop_domains.filter(s=>!/^[a-z0-9][a-z0-9-]{0,40}$/.test(s.shop));
console.log('total shops', j.gumroad_evidence.shop_domains.length, 'invalid format', invalid.length);
const sample = ['twostraws','draculatheme','maxulichney','pablostanley','sealinemedia'];
for (const s of sample) {
  try { const r = await get('https://'+s+'.gumroad.com/','text/html');
    const t = r.body.toString('utf8'); const ttl=(t.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||'';
    console.log(s + ' -> [' + r.status + '] ' + ttl.replace(/\s+/g,' ').slice(0,60));
  } catch(e){ console.log(s+' ERR '+e.message.slice(0,40)); }
  await sleep(950);
}
for (const u of ['https://prototion.com/templates','https://www.notionway.com/','https://selar.com/','https://displate.com/','https://www.cgtrader.com/']) {
  try { const r = await get(u,'text/html'); console.log(u + ' [' + r.status + '] ' + r.body.length + 'B'); } catch(e){ console.log(u+' ERR'); }
  await sleep(950);
}
