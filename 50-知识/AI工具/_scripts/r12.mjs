
import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
function get(url, accept='*/*', tries=3) {
  return new Promise(async (resolve) => {
    for (let i=0;i<tries;i++) {
      const r = await new Promise((res)=>{
        const pu = new URL(url);
        const req = http.get({ host: PROXY.host, port: PROXY.port, path: url, agent: false,
          headers: { Host: pu.host, 'User-Agent': UA, Accept: accept, Connection: 'close' } },
          (resp)=>{ const c=[]; resp.on('data',d=>c.push(d)); resp.on('end',()=>res({status:resp.statusCode, body:Buffer.concat(c)})); });
        req.on('error',(e)=>res({error:e.message}));
        req.setTimeout(30000,()=>{req.destroy(); res({error:'timeout'});});
      });
      if (!r.error) return resolve(r);
      await new Promise(x=>setTimeout(x,1500));
    }
    resolve({error:'all tries failed'});
  });
}
const r = await get('https://www.indiehackers.com/products');
fs.writeFileSync('ih_products.html', r.body.toString('utf8'), 'utf8');
const h = r.body.toString('utf8');
// strip scripts and look at visible links
const noScript = h.replace(/<script[\s\S]*?<\/script>/gi,' ');
const hrefs = [...noScript.matchAll(/href="(\/[^"]{2,120})"/g)].map(m=>m[1]);
const uniq = [...new Set(hrefs)];
console.log('total hrefs', uniq.length);
console.log(uniq.slice(0,80).join('\n'));
