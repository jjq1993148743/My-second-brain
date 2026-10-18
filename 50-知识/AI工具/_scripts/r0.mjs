
import http from 'node:http';
const PROXY = { host: '127.0.0.1', port: 7897 };
function probe(path) {
  return new Promise((resolve) => {
    const req = http.get({ host: PROXY.host, port: PROXY.port, path, headers: { Host: 'example.com', 'User-Agent': 'M', Accept: '*/*' }, agent: false }, (res) => {
      const c=[]; res.on('data',d=>c.push(d)); res.on('end',()=>resolve({status:res.statusCode, body:Buffer.concat(c).toString('utf8').slice(0,300)}));
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.setTimeout(8000, () => { req.destroy(); resolve({error:'timeout'}); });
  });
}
for (let i=0;i<8;i++) {
  const r = await probe('https://example.com/');
  console.log(i, JSON.stringify(r).slice(0,200));
  if (!r.error) break;
  await new Promise(r2=>setTimeout(r2,3000));
}
