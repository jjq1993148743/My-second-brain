
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
const SUBS = ['juststart','SideProject','microsaas','SomebodyMakeThis','Entrepreneur','SaaS',' EntrepreneurRideAlong','passive_income','indiehackers','smallbusiness','webdev','digitalnomad'];
const all = [];
const seen = new Set();
for (const sub of SUBS) {
  const s = sub.trim();
  let collected = 0;
  // paginate by created_utc descending
  let after = null;
  for (let round=0; round<6; round++) {
    let u = 'https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=' + encodeURIComponent(s) + '&limit=100&sort=desc';
    if (after) u += '&before=' + after;
    const r = await get(u);
    if (r.error) { console.log('FAIL', s, r.error); break; }
    let j; try { j = JSON.parse(r.body.toString('utf8')); } catch(e){ console.log('PARSE', s); break; }
    const data = j.data || [];
    if (!data.length) break;
    for (const p of data) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      const title = p.title || '';
      const selftext = p.selftext || '';
      const combined = title + ' ' + selftext;
      const moneyRe = /(?:\$\s?[\d,]+(?:\.\d+)?\s?(?:k|K|m|M)?\s?(?:\/mo|per month|a month|monthly|MRR|ARR|\/month)?)/;
      const hasMoney = moneyRe.test(combined);
      const revKw = /MRR|ARR|revenue|passive income|\/mo\b|per month|monthly revenue|made \$|making \$|my (?:saas|tool|app|product|site|business)/i;
      if (hasMoney && revKw.test(combined)) {
        all.push({
          subreddit: p.subreddit || s,
          id: p.id,
          title,
          author: p.author,
          score: p.score,
          numComments: p.num_comments,
          createdUtc: p.created_utc,
          createdAt: new Date((p.created_utc||0)*1000).toISOString(),
          url: p.url && p.url.startsWith('http') ? p.url : '',
          permalink: 'https://www.reddit.com' + (p.permalink||''),
          isSelf: p.is_self,
          selftext: selftext.replace(/\s+/g,' ').trim().slice(0,900),
          upvoteRatio: p.upvote_ratio,
        });
      }
    }
    collected += data.length;
    after = data[data.length-1].created_utc;
    await sleep(1000);
    if (data.length < 100) break;
  }
  console.log('sub', s, 'scanned', collected, 'running total cases', all.length);
  fs.writeFileSync('_reddit_cases_raw.json', JSON.stringify(all, null, 1), 'utf8');
  await sleep(1200);
}
console.log('TOTAL REDDIT CASES', all.length);
