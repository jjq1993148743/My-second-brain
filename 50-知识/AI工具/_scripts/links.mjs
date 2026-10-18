
import { get, gbk, strip, sleep, decode } from './proxy-fetch.mjs';

export function titleOf(txt) {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(txt);
  return m ? strip(m[1]).slice(0, 90) : '';
}
export function links(txt, baseUrl) {
  const out = [];
  const re = /<a\b([^>]*href=["']?([^"'>\s]+)["']?)([^>]*)>([\s\S]{0,120}?)<\/a>/gi;
  let m;
  while ((m = re.exec(txt))) {
    const href = m[2]; const anchor = strip(m[4]).slice(0, 60);
    if (/^(#|javascript:|mailto:|tel:)/i.test(href)) continue;
    let abs = href;
    try { abs = new URL(href, baseUrl).href; } catch {}
    out.push({ href: abs, anchor });
  }
  return out;
}
export function externals(txt, baseUrl) {
  const base = new URL(baseUrl);
  const seen = new Map();
  for (const l of links(txt, baseUrl)) {
    let h;
    try { h = new URL(l.href); } catch { continue; }
    if (h.protocol !== 'http:' && h.protocol !== 'https:') continue;
    const host = h.hostname.toLowerCase();
    if (host === base.hostname || host === 'www.'+base.hostname) continue;
    if (host.endsWith('.'+base.hostname)) continue;
    if (!seen.has(host)) seen.set(host, { host, href: l.href, anchor: l.anchor });
  }
  return [...seen.values()];
}
export function pickCharset(buf) {
  const raw = buf.slice(0, 3000).toString('utf8');
  if (/charset=["']?(gb2312|gbk|gb18030)/i.test(raw)) return 'gbk';
  const m = /charset=["']?([\w-]+)/i.exec(raw);
  return m ? m[1].toLowerCase() : 'utf8';
}
