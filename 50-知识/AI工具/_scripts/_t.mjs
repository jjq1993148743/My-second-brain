import https from 'node:https';
import http from 'node:http';

function direct(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      const c = []; res.on('data', d => c.push(d));
      res.on('end', () => resolve({ via: 'direct', status: res.statusCode, len: Buffer.concat(c).length }));
    });
    req.on('error', (e) => resolve({ via: 'direct', status: -1, err: e.code || e.message }));
    req.setTimeout(15000, () => req.destroy(new Error('timeout')));
  });
}
function viaProxy(url) {
  return new Promise((resolve) => {
    const pu = new URL(url);
    const req = http.get({ host: '127.0.0.1', port: 7897, path: url,
      headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      const c = []; res.on('data', d => c.push(d));
      res.on('end', () => resolve({ via: 'proxy', status: res.statusCode, len: Buffer.concat(c).length }));
    });
    req.on('error', (e) => resolve({ via: 'proxy', status: -1, err: e.code || e.message }));
    req.setTimeout(15000, () => req.destroy(new Error('timeout')));
  });
}
const u = 'https://raw.githubusercontent.com/mezod/awesome-indie/master/README.md';
console.log(JSON.stringify(await direct(u)));
console.log(JSON.stringify(await viaProxy(u)));
