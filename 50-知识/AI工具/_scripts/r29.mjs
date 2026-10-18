
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
        req.setTimeout(40000,()=>{req.destroy(); res({error:'timeout'});});
      });
      if (!r.error) return resolve(r);
      await new Promise(x=>setTimeout(x,1500));
    }
    resolve({error:'all tries failed'});
  });
}
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
for (const u of ['https://microlaunch.net/browse','https://microlaunch.net/deals']) {
  const r = await get(u);
  if (r.error) { console.log('FAIL', u, r.error); continue; }
  const h = r.body.toString('utf8');
  fs.writeFileSync('ml_'+(u.includes('browse')?'browse':'deals')+'.html', h, 'utf8');
  console.log('===', u, r.status, h.length);
  const slugs = [...new Set([...h.matchAll(/href="(\/(?:deals|launches|product|launch|startup|submissions?)\/[a-z0-9-]{2,60})"/g)].map(m=>m[1]))];
  console.log('slugs', slugs.length);
  console.log(slugs.slice(0,40).join('\n'));
  const ext = [...new Set([...h.matchAll(/href="https?:\/\/([a-z0-9.-]+\.[a-z]{2,})[^"]*"/gi)].map(m=>m[1]))].filter(d=>!d.match(/(twitter|facebook|instagram|youtube|linkedin|tiktok|googleapis|gstatic|cloudflare|jquery|bootstrap|fontawesome|w3\.org|schema\.org|google-analytics|googletagmanager|doubleclick|cdn|unpkg|jsdelivr|vercel|netlify|herokuapp|wordpress\.org|gravatar|paypal|stripe|apple|microsoft|prisma|microlaunch|twimg|mzstatic|producthunt|sparkloop|clarity\.fm)/i));
  console.log('EXT:', ext.slice(0,60).join(', '));
  await sleep(1200);
}
