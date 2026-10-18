
// proxy-fetch.mjs — 通过本机 Clash 代理 127.0.0.1:7897 抓取（连接复用，避免 EADDRINUSE）
import http from 'node:http';
const PROXY = { host: '127.0.0.1', port: 7897 };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
const agent = new http.Agent({ keepAlive: true, maxSockets: 2, maxFreeSockets: 2 });
export function get(url, accept = '*/*', timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const pu = new URL(url);
    const req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url,
      headers: { Host: pu.host, 'User-Agent': UA, Accept: accept, Connection: 'keep-alive' } },
      (res) => { const c = []; res.on('data', d => c.push(d));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(c) })); });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout ' + timeoutMs)));
  });
}
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
export function decode(buf, enc) { try { return new TextDecoder(enc).decode(buf); } catch { return buf.toString('utf8'); } }
export function strip(h) { return String(h||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,("'")).replace(/&quot;/g,('"')).replace(/\s+/g,' ').trim(); }
export function gbk(buf) { try { return new TextDecoder('gbk').decode(buf); } catch { return buf.toString('utf8'); } }

