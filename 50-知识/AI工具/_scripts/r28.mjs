
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
      await new Promise(x=>setTimeout(x,1500));
    }
    resolve({error:'all tries failed'});
  });
}
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
const SUBS = ['juststart','SideProject','SomebodyMakeThis','webdev','digitalnomad','growmybusiness','nocode','automation','EntrepreneurRideAlong','microsaas','SaaS','Entrepreneur','indiehackers','passive_income','smallbusiness','InternetIsBeautiful','SideProject','lighthaul','django','Python','webdev'];
const moneyRe = /(?:\$\s?[\d,]+(?:\.\d+)?\s?(?:k|K|m|M)?\s?(?:\/mo|per month|a month|monthly|MRR|ARR|\/month)?)/;
const revKw = /MRR|ARR|revenue|passive income|\/mo\b|per month|monthly revenue|made \$|making \$|my (?:saas|tool|app|product|site|business)/i;
let all = []; const seen = new Set();
if (fs.existsSync('_reddit_cases.json')) { all = JSON.parse(fs.readFileSync('_reddit_cases.json','utf8')); for (const x of all) seen.add(x.id); }
for (const s of SUBS) {
  let scanned = 0;
  let after = null;
  let rounds = 0;
  for (let round=0; round<6; round++) {
    let u = 'https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=' + encodeURIComponent(s) + '&limit=100&sort=desc';
    if (after) u += '&before=' + after;
    const r = await get(u);
    if (r.error) { console.log('FAIL', s, r.error); break; }
    let j; try { j = JSON.parse(r.body.toString('utf8')); } catch(e){ break; }
    const data = j.data || [];
    if (!data.length) break;
    for (const p of data) {
      const combined = (p.title||'') + ' ' + (p.selftext||'');
      if (moneyRe.test(combined) && revKw.test(combined) && !seen.has(p.id)) {
        seen.add(p.id);
        all.push({
          subreddit: p.subreddit || s, id: p.id, title: p.title || '', author: p.author,
          score: p.score, numComments: p.num_comments, createdUtc: p.created_utc,
          createdAt: new Date((p.created_utc||0)*1000).toISOString(),
          url: (p.url && /^https?:/.test(p.url)) ? p.url : '',
          permalink: 'https://www.reddit.com' + (p.permalink||''),
          isSelf: p.is_self,
          selftext: (p.selftext||'').replace(/\s+/g,' ').trim().slice(0,900),
          upvoteRatio: p.upvote_ratio,
        });
      }
    }
    scanned += data.length; rounds++;
    after = data[data.length-1].created_utc;
    await sleep(1100);
    if (data.length < 100) break;
  }
  console.log('sub', s, 'scanned', scanned, 'rounds', rounds, 'total', all.length);
  fs.writeFileSync('_reddit_cases.json', JSON.stringify(all, null, 1), 'utf8');
  await sleep(1200);
}
console.log('DONE TOTAL', all.length);
