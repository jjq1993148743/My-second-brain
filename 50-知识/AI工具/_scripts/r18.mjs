
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
// known-real candidates (only real domains we can verify)
const CANDIDATES = [
  'https://microlaunch.net/',
  'https://www.microlaunch.net/',
  'https://postmake.io/open',
  'https://makerlead.com',
  'https://profitablesideprojects.com',
  'https://transparentstartups.com/',
  'https://deadacquire.com/',
  'https://zeroacquire.com/',
  'https://www.saascast.io/',
];
for (const u of CANDIDATES) {
  const r = await get(u, 'text/html');
  if (r.error) { console.log('FAIL', u, r.error); continue; }
  console.log('===', u, r.status, r.body.length);
  const h = r.body.toString('utf8');
  const links = [...new Set([...h.matchAll(/href="https?:\/\/([a-z0-9.-]+\.[a-z]{2,})[^"]*"/gi)].map(m=>m[1]))].filter(d=>!d.match(/(facebook|twitter|instagram|youtube|linkedin|tiktok|googleapis|gstatic|cloudflare|jquery|bootstrap|fontawesome|w3.org|schema\.org|google-analytics|googletagmanager|doubleclick|cdn|unpkg|jsdelivr|vercel|netlify|herokuapp|wordpress\.org|gravatar|paypal|stripe|apple|microsoft)/i));
  console.log('  external links:', links.slice(0,30).join(', '));
  await new Promise(r2=>setTimeout(r2,900));
}
