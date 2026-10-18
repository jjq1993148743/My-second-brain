
import { get, strip } from './proxy-fetch.mjs';
const ids = process.argv.slice(2);
for (const id of ids) {
  for (let a = 0; a < 3; a++) {
    try {
      const r = await get('https://www.foreverblog.cn/blog/' + id + '.html');
      if (r.status === 200) {
        const h = r.body.toString('utf8');
        console.log('===== id', id, 'len', h.length);
        // find external links (non foreverblog)
        const links = [...h.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]{0,80}?)<\/a>/g)]
          .map(m => ({href: m[1], text: strip(m[2]).slice(0,40)}))
          .filter(l => !/foreverblog\.cn|javascript:|#|\/$/.test(l.href));
        console.log(JSON.stringify(links.slice(0,12), null, 1));
        // dump a chunk of main
        const i = h.indexOf('blog-detail') >= 0 ? h.indexOf('blog-detail') : h.indexOf('<main');
        console.log('SNIP:', h.slice(i, i+2500).replace(/\s+/g,' '));
        break;
      }
      console.log('id', id, 'status', r.status);
    } catch (e) { console.log('id', id, 'err', e.message); }
    await new Promise(r => setTimeout(r, 1500));
  }
  await new Promise(r => setTimeout(r, 1000));
}
