// verify-5d.mjs —— 5维真实性验证
import fs from 'node:fs';

const IN = process.argv[2] || '_pph_projects.json';
const OUT = process.argv[3] || '_pph_verified.json';
const projects = JSON.parse(fs.readFileSync(IN, 'utf8'));

const NOW = new Date('2026-10-19T16:40:00+08:00');
const THREE_MONTHS_AGO = new Date(NOW.getTime() - 90 * 24 * 3600 * 1000);

function parseDt(s) {
  if (!s) return null;
  const d = new Date(s.replace(' ', 'T') + '+00:00');
  return isNaN(d.getTime()) ? null : d;
}

const results = [];
for (const p of projects) {
  const posted = parseDt(p.posted_dt);
  const expiry = parseDt(p.expiry_dt);
  const client = p.client || {};
  const regDt = client.reg_dt ? new Date(client.reg_dt) : null;
  const ageDays = posted ? Math.floor((NOW - posted) / 86400000) : null;
  const within3m = posted ? posted >= THREE_MONTHS_AGO : false;
  const hoursOld = posted ? Math.floor((NOW - posted) / 3600000) : null;

  // 5 个维度
  const dim = {};

  // 1. 新鲜度
  dim.freshness = {
    score: hoursOld === null ? 0 : hoursOld <= 24 ? 5 : hoursOld <= 72 ? 4 : hoursOld <= 168 ? 3 : within3m ? 2 : 1,
    posted: p.posted_dt,
    hoursOld,
    within3Months: within3m
  };

  // 2. 竞争度（提案数）
  const proposals = p.proposalCount !== undefined ? p.proposalCount : null;
  dim.competition = {
    score: proposals === null ? 3 : proposals === 0 ? 5 : proposals <= 5 ? 4 : proposals <= 15 ? 3 : proposals <= 30 ? 2 : 1,
    proposalCount: proposals,
    meaning: proposals === 0 ? '无人投标，机会最大' : proposals <= 5 ? '竞争小' : proposals <= 15 ? '中等竞争' : '竞争激烈'
  };

  // 3. 客户可信度
  const verified = client.verified === '1' || client.verified === 1;
  const clientAgeDays = regDt ? Math.floor((NOW - regDt) / 86400000) : null;
  dim.clientTrust = {
    score: (verified ? 2 : 0) + (clientAgeDays === null ? 0 : clientAgeDays > 365 ? 2 : clientAgeDays > 90 ? 1 : 0) + (client.hasPhoto ? 1 : 0),
    verified,
    clientAgeDays,
    country: client.country || '',
    hasPhoto: !!client.hasPhoto,
    note: clientAgeDays !== null && clientAgeDays < 30 ? '新注册客户，谨慎' : ''
  };

  // 4. 预算合理性
  const budget = p.budget || 0;
  const prefunded = p.isPreFundedJob || p.item_state === 'open' && p.minimumDeposit > 0;
  dim.budget = {
    score: budget >= 500 ? 5 : budget >= 200 ? 4 : budget >= 100 ? 3 : budget >= 30 ? 2 : budget > 0 ? 1 : 0,
    budget,
    currency: p.currency,
    prefunded: !!p.isPreFundedJob,
    projectType: p.project_type
  };

  // 5. 描述完整度
  const desc = p.proj_desc || '';
  const descLen = desc.length;
  const descScore = descLen > 500 ? 5 : descLen > 200 ? 4 : descLen > 80 ? 3 : descLen > 20 ? 2 : 1;
  dim.description = {
    score: descScore,
    length: descLen,
    hasSpecifics: /\b(\d+\s*(?:days?|weeks?|hours?|pages?|videos?|posts?))\b/i.test(desc),
    hasTechStack: /(wordpress|php|python|javascript|react|node|laravel|django|shopify|wix|api|figma|photoshop)/i.test(desc)
  };

  const total = Object.values(dim).reduce((s, d) => s + d.score, 0);
  const maxScore = 25;

  results.push({
    id: p.proj_id,
    title: p.title,
    url: p.url,
    category: (p.category && p.category.cate_name) || '',
    subcategory: (p.sub_category && p.sub_category.subcate_name) || '',
    budget: p.budget,
    currency: p.currency,
    posted: p.posted_dt,
    expiry: p.expiry_dt,
    proposalCount: p.proposalCount,
    state: p.item_state,
    status: p.proj_status,
    dims: dim,
    totalScore: total,
    maxScore,
    verdict: total >= 20 ? '强推荐' : total >= 15 ? '可考虑' : total >= 10 ? '一般' : '不建议'
  });
}

results.sort((a, b) => b.totalScore - a.totalScore);
fs.writeFileSync(OUT, JSON.stringify(results, null, 1), 'utf8');

// 统计
const now3m = results.filter(r => r.dims.freshness.within3Months);
console.log('TOTAL=' + results.length);
console.log('WITHIN_3_MONTHS=' + now3m.length);
console.log('VERDICTS: ' + JSON.stringify(
  results.reduce((a, r) => { a[r.verdict] = (a[r.verdict]||0)+1; return a; }, {})
));
console.log('ZERO_PROPOSALS=' + results.filter(r => r.proposalCount === 0).length);
console.log('AVG_SCORE=' + (results.reduce((s,r)=>s+r.totalScore,0)/results.length).toFixed(1));