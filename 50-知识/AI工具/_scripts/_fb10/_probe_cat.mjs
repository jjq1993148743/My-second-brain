
import { get, strip } from './proxy-fetch.mjs';
const id = process.argv[2];
const r = await get('https://www.foreverblog.cn/blog/' + id + '.html');
const h = r.body.toString('utf8');
const i = h.indexOf('topic-label');
console.log('topic-label idx', i);
if (i>=0) console.log(h.slice(i-200, i+400).replace(/\s+/g,' '));
const j = h.indexOf('blog-detail-hero__identity');
console.log('---identity---');
console.log(h.slice(j, j+500).replace(/\s+/g,' '));
