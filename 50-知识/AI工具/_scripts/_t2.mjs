import https from 'node:https';
function direct(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, (res) => {
      const c = []; res.on('data', d => c.push(d));
      res.on('end', () => resolve({ status: res.statusCode, len: Buffer.concat(c).length }));
    });
    req.on('error', (e) => resolve({ status: -1, err: e.code || e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: -2, err: 'timeout' }); });
  });
}
const urls = [
  'https://raw.githubusercontent.com/mezod/awesome-indie/master/README.md',
  'https://api.github.com/rate_limit',
  'https://github.com'
];
for (const u of urls) console.log(u + ' -> ' + JSON.stringify(await direct(u)));
