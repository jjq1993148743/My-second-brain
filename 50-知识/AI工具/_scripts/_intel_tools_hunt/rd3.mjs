
import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
function get(url, accept='application/json', tries=4) {
  return new Promise(async (resolve) => {
    for (let i=0;i<tries;i++) {
      const r = await new Promise((res)=>{
        const pu = new URL(url);
        const req = http.get({ host: PROXY.host, port: PROXY.port, path: url, agent: false,
          headers: { Host: pu.host, 'User-Agent': UA, Accept: accept, Connection: 'close' } },
          (resp)=>{ const c=[]; resp.on('data',d=>c.push(d)); resp.on('end',()=>res({status:resp.statusCode, body:Buffer.concat(c)})); });
        req.on('error',(e)=>res({error:e.message}));
        req.setTimeout(30000,()=>{req.destroy(); res({error:'timeout'});});
      });
      if (!r.error) return resolve(r);
      await new Promise(x=>setTimeout(x,1800));
    }
    resolve({error:'all tries failed'});
  });
}
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
const SUBS = ['microsaas','SaaS','juststart','indiehackers','SideProject','EntrepreneurRideAlong','SomebodyMakeThis'];
// exact revenue phrases in title
const PHRASES = ['$ MRR','MRR','$1k','$5k','$10k','$k MRR','monthly recurring revenue','my first sale','hit $1000','crossed $','passed $','ARR of','my side project makes','side income','made my first','boring','one feature tool','single feature','$2k','$3k','$500 MRR','$2000 MRR'];
const F = 'reddit_kw.json';
let all = []; const seen = new Set();
if (fs.existsSync(F)) { all = JSON.parse(fs.readFileSync(F,'utf8')); for (const x of all) seen.add(x.id); }
const moneyRe = /(?:\$\s?[\d,]+(?:\.\d+)?\s?(?:k|K|m|M)?\s?(?:\/mo|per month|a month|monthly|MRR|ARR|\/month| in revenue)?)/;
let budget = parseInt(process.argv[2]||'14');
let used = 0;
outer:
for (const s of SUBS) {
  for (const p of PHRASES) {
    if (used >= budget) break outer;
    used++;
    const u = 'https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=' + encodeURIComponent(s) + '&title=' + encodeURIComponent(p) + '&limit=100&sort=desc';
    const r = await get(u);
    if (r.error) { console.log('FAIL', s, p, r.error); continue; }
    let j; try { j = JSON.parse(r.body.toString('utf8')); } catch(e){ continue; }
    const data = j.data || [];
    let added = 0;
    for (const x of data) {
      if (seen.has(x.id)) continue;
      const combined = (x.title||'') + ' ' + (x.selftext||'');
      if (!moneyRe.test(combined)) continue;
      seen.add(x.id); added++;
      all.push({
        subreddit: x.subreddit, id: x.id, title: x.title || '', author: x.author,
        score: x.score, numComments: x.num_comments, createdAt: new Date((x.created_utc||0)*1000).toISOString(),
        url: (x.url && /^https?:/.test(x.url)) ? x.url : '',
        permalink: 'https://www.reddit.com' + (x.permalink||''),
        isSelf: x.is_self,
        selftext: (x.selftext||'').replace(/\s+/g,' ').trim().slice(0,900),
        matchedPhrase: p,
      });
    }
    console.log(s, '/', p, '->', data.length, 'added', added, 'TOTAL', all.length);
    fs.writeFileSync(F, JSON.stringify(all, null, 1), 'utf8');
    await sleep(1000);
  }
}
console.log('DONE', all.length, 'queries', used);
