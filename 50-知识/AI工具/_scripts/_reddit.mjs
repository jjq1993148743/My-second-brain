import http from 'node:http';
import fs from 'node:fs';
const PROXY = { host: '127.0.0.1', port: 7897 };
const agent = new http.Agent({ keepAlive: true, maxSockets: 2 });
function get(url) {
  return new Promise((resolve) => {
    let done = false; let req = null;
    const fin = (v) => { if (done) return; done = true; try { if (req) req.destroy(); } catch (e) {} resolve(v); };
    const hard = setTimeout(() => fin({ status: -2, text: '' }), 30000);
    try {
      const pu = new URL(url);
      req = http.get({ agent, host: PROXY.host, port: PROXY.port, path: url, headers: { Host: pu.host, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Accept': 'application/atom+xml,application/rss+xml,*/*' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); clearTimeout(hard); const n = res.headers.location.startsWith('http') ? res.headers.location : 'https://' + pu.host + res.headers.location; done = true; return get(n).then(resolve); }
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { clearTimeout(hard); fin({ status: res.statusCode, text: Buffer.concat(c).toString('utf8') }); });
        res.on('error', () => fin({ status: -1, text: '' }));
      });
      req.on('error', () => { clearTimeout(hard); fin({ status: -1, text: '' }); });
    } catch (e) { clearTimeout(hard); fin({ status: -3, text: '' }); }
  });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const SUBS = ['freelance','freelance_forhire','forhire','hiring','jobbit','designjobs','webdevjobs','beermoney','sidehustle','passiveincome','juststart','indiebiz','entrepreneur','smallbusiness','digitalnomad','workonline','slavelabour','jobs4bitcoins','gigs','taskrabbit','upwork','fiverr','etsy','dropship','amazonfba','printondemand','podcasting','youtubers','blogging','affiliatemarketing','seo','copywriting','voiceacting','translationjobs','virtualassistant','datasciencejobs','machinelearningjobs','bountytalk','bugbounty','hackerone','netsec','webdev','programming','devops','cscareerquestions','experienceddevs','remotework','remotejobs','techjobs','gamedev','indiegames','gameDevJobs','3Dmodeling','animation','videoediting','photography','graphic_design','UI_UX','learnprogramming','aws','sysadmin','msp','itjobs','cybersecurity','osint','opendata','datasets','WritingJobs','HireaWriter','forhire_tech','techhire','cofounder','startups','venturecapital','SaaS','microsaas','indiehackers','buildinpublic','nocode','lowcode','webflow','notion','airtable'];
const out = [];
for (const sub of SUBS) {
  const r = await get('https://www.reddit.com/r/' + sub + '/.rss');
  if (r.status === 200 && r.text.length > 2000) {
    const entries = (r.text.match(/<entry>/g) || []).length;
    const tm = /<title>([^<]{2,120})<\/title>/.exec(r.text);
    out.push({ sub: 'r/' + sub, url: 'https://www.reddit.com/r/' + sub + '/', entries, title: tm ? tm[1] : '' });
    console.log('OK r/' + sub + ' entries=' + entries);
  } else { console.log('-- r/' + sub + ' status=' + r.status); }
  await sleep(700);
}
fs.writeFileSync('_reddit_subs.json', JSON.stringify(out, null, 1), 'utf8');
console.log('TOTAL_ALIVE=' + out.length);