// dig.mjs — probe(url) helper
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const base = await import(pathToFileURL('D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/proxy-fetch.mjs').href);
export const { get, gbk, strip, sleep, decode } = base;

const OUTDIR = 'D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/_dig';
fs.mkdirSync(OUTDIR, { recursive: true });

function slug(u) {
  return u.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120);
}

export async function probe(url, opts = {}) {
  let r;
  try {
    r = await get(url, opts.accept || 'text/html,application/xhtml+xml,*/*;q=0.8');
  } catch (e) {
    return { url, err: String(e), status: 0, bytes: 0, title: '', txt: '', links: [] };
  }
  const raw = r.body;
  let s = raw.toString('utf8');
  let isGbk = false;
  const bad = (s.match(/\uFFFD/g) || []).length;
  const ct = String(r.headers['content-type'] || '').toLowerCase();
  if (bad > 5 || ct.includes('gb')) {
    try {
      const g = gbk(raw);
      if ((g.match(/\uFFFD/g) || []).length <= bad) { s = g; isGbk = true; }
    } catch {}
  }
  const links = [];
  const re = /<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let mm;
  while ((mm = re.exec(s))) {
    const href = mm[1].trim();
    if (!href || /^(javascript|#|mailto|tel)/i.test(href)) continue;
    let abs;
    try { abs = new URL(href, url).href; } catch { continue; }
    links.push({ href: abs, text: strip(mm[2]).replace(/\s+/g, ' ').trim().slice(0, 100) });
  }
  const tm = s.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = tm ? strip(tm[1]).replace(/\s+/g, ' ').trim() : '';
  const txt = strip(s);
  if (opts.save !== false) {
    fs.writeFileSync(path.join(OUTDIR, slug(url) + '.txt'),
      'URL: ' + url + '\nSTATUS: ' + r.status + '\nBYTES: ' + raw.length + '\nGBK: ' + isGbk + '\nTITLE: ' + title + '\n\n---TEXT---\n' + txt + '\n\n---LINKS---\n' +
      links.map(l => l.text + '\t' + l.href).join('\n'), 'utf8');
    fs.writeFileSync(path.join(OUTDIR, slug(url) + '.html'), s, 'utf8');
  }
  return { url, status: r.status, bytes: raw.length, isGbk, title, txt, links, headers: r.headers };
}

export function cut(t, n = 2500) { return (t || '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').slice(0, n); }
export { OUTDIR };
