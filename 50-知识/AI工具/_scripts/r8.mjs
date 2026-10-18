
import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
function get(url, accept='application/json', tries=3) {
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
      await new Promise(x=>setTimeout(x,1200));
    }
    resolve({error:'all tries failed'});
  });
}
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
// Test Arctic Shift
const u = 'https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=juststart&limit=5';
const r = await get(u);
console.log('status', r.status, 'len', r.body.length);
if (r.error) console.log('err', r.error);
else {
  const j = JSON.parse(r.body.toString('utf8'));
  console.log('keys', Object.keys(j));
  const data = j.data || j;
  console.log('count', Array.isArray(data)? data.length : 'n/a');
  console.log(JSON.stringify(Array.isArray(data)? data[0] : data, null, 1).slice(0,1500));
}
