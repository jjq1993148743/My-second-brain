
import { get, gbk, sleep } from './proxy-fetch.mjs';
import { links, externals, pickCharset } from './links.mjs';
async function ft(url) {
  const r = await get(url, 'text/html,*/*', 30000);
  const enc = pickCharset(r.body);
  return enc==='gbk'?gbk(r.body):r.body.toString('utf8');
}
// 1) tophub 首页的站点条目怎么写的
{
  const t = await ft('https://tophub.today/');
  const idx = t.indexOf('developer');
  console.log('--- tophub home snippet ---');
  console.log(t.slice(0, 1500));
  console.log('--- has <a count:', (t.match(/<a\s/g)||[]).length, ' href=', (t.match(/href=/g)||[]).length);
  const around = t.indexOf('GitHub');
  console.log('--- around GitHub ---');
  console.log(t.slice(Math.max(0,around-600), around+400));
}
await sleep(900);
for (const u of ['https://tophub.today/c/developer','https://tophub.today/c/design']) {
  const t = await ft(u);
  const i2 = t.indexOf('GitHub');
  console.log('--- ' + u + ' around GitHub ---');
  console.log(t.slice(Math.max(0,i2-700), i2+300));
  await sleep(900);
}
