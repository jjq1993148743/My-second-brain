import https from 'node:https';
function gh(path) {
  return new Promise((resolve, reject) => {
    const req = https.get({ host: 'api.github.com', path, headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/vnd.github+json' } }, (res) => {
      const c = [];
      res.on('data', d => c.push(d));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(Buffer.concat(c).toString('utf8')) }); }
        catch (e) { resolve({ status: res.statusCode, headers: res.headers, body: null }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(20000, () => req.destroy(new Error('timeout')));
  });
}
const r = await gh('/rate_limit');
console.log('status=' + r.status);
console.log(JSON.stringify(r.body && r.body.resources ? { core: r.body.resources.core, search: r.body.resources.search } : r.body));
