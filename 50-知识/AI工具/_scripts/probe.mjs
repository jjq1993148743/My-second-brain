
import { get, strip, gbk, decode, sleep } from 'file:///D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/proxy-fetch.mjs';
function enc(b, ct='') {
  const c = /charset=([\w-]+)/i.exec(ct||'')?.[1];
  if (c && /gb/i.test(c)) return gbk(b);
  if (c && /utf/i.test(c)) return decode(b,'utf-8');
  const head = decode(b,'utf-8').slice(0,2000);
  const mc = /charset=["']?([\w-]+)/i.exec(head)?.[1];
  if (mc && /gb/i.test(mc)) return gbk(b);
  return decode(b,'utf-8');
}
export async function text(url, timeoutMs=25000){
  const r = await get(url, 'text/html,application/xhtml+xml,*/*;q=0.8', timeoutMs);
  const t = enc(r.body, r.headers['content-type']||'');
  return { status: r.status, url, headers: r.headers, text: t, clean: strip(t) };
}
export function links(html, base){
  const out = [];
  const re = /<a\s[^>]*?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    try { const u = new URL(m[1], base); if (/^https?:/.test(u.protocol)) out.push({ url: u.href.replace(/#.*$/,''), title: strip(m[2]).slice(0,80) }); } catch {}
  }
  const seen = new Set();
  return out.filter(x => { const k = x.url; if (seen.has(k)) return false; seen.add(k); return true; });
}
export { strip, gbk, decode, sleep, get };
