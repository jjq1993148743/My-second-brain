// deep-recon.mjs —— 单平台深度侦察
// 用法: node deep-recon.mjs <host> [项目页路径]
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
const execFileAsync = promisify(execFile);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function curl(url) {
  try {
    const args = ['-sL', '-x', 'http://127.0.0.1:7897', '-H', 'User-Agent: ' + UA,
      '-H', 'Accept: text/html,application/xhtml+xml,*/*',
      '-H', 'Accept-Language: en-US,en;q=0.9,zh-CN;q=0.8',
      '--max-time', '25', '--compressed', url];
    const { stdout } = await execFileAsync('curl', args, { maxBuffer: 32 * 1024 * 1024, windowsHide: true });
    return stdout || '';
  } catch (e) { return ''; }
}

function text(html) {
  return (html || '').replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ').trim();
}

const host = process.argv[2];
const jobPath = process.argv[3] || '';
if (!host) { console.log('usage: node deep-recon.mjs <host> [jobPath]'); process.exit(1); }

const result = { host, checkedAt: new Date().toISOString() };

// 1) 首页
const homeHtml = await curl('https://' + host + '/');
result.homeBytes = homeHtml.length;
result.blocked = /Just a moment|Checking your browser|Access Denied|请稍候|Cloudflare/i.test(homeHtml.slice(0, 6000));
result.title = ((homeHtml.match(/<title[^>]*>([^<]{0,150})/i) || [])[1] || '').trim();
result.desc = ((homeHtml.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{0,300})/i) || [])[1] || '').trim();
const homeText = text(homeHtml);

// 2) 关键信号
const low = homeText.toLowerCase();
result.signals = {
  hasSignup: /sign ?up|register|create (an )?account|join (for )?free|get started/i.test(homeText),
  hasSellerEntry: /become a (seller|freelancer|provider|creator)|sell your|offer your services|start selling|post a service/i.test(homeText),
  inviteOnly: /invite[- ]only|approval|apply to join|waitlist|vetted/i.test(homeText),
  hasJobs: /browse (jobs|projects)|find (work|jobs|projects)|latest (jobs|projects)/i.test(homeText)
};

// 3) 费率
const fees = [];
for (const m of homeText.matchAll(/([0-9]{1,2}(?:\.[0-9])?)\s?%\s*(?:service|platform|commission|fee|of)/gi)) fees.push(m[0]);
for (const m of homeText.matchAll(/(?:commission|service fee|platform fee|fee of|charge[sd]?)\s*(?:of\s*)?([0-9]{1,2}(?:\.[0-9])?)\s?%/gi)) fees.push(m[0]);
result.fees = [...new Set(fees)].slice(0, 6);

// 4) 收款
const pay = [];
for (const [k, re] of [['PayPal', /paypal/i], ['Payoneer', /payoneer/i], ['Wise', /wise|transferwise/i], ['Stripe', /stripe/i], ['银行转账', /bank transfer|direct deposit|wire/i], ['支付宝', /alipay|支付宝/i], ['加密货币', /crypto|usdt|bitcoin/i]]) {
  if (re.test(homeText)) pay.push(k);
}
result.payout = pay;

// 5) 开发者相关
result.devRelevant = /develop|programming|code|coding|software|engineer|api|web|app/i.test(homeText);

// 6) 项目页（如果给了）
if (jobPath) {
  const jobHtml = await curl('https://' + host + jobPath);
  result.jobPageBytes = jobHtml.length;
  const jt = text(jobHtml);
  result.jobPageTitle = ((jobHtml.match(/<title[^>]*>([^<]{0,150})/i) || [])[1] || '').trim();
  const budgets = [];
  for (const m of jt.matchAll(/[£$€]\s?[0-9][0-9,]*(?:\.[0-9]{2})?(?:\s?(?:-|–|to)\s?[£$€]?\s?[0-9][0-9,]*)?/g)) budgets.push(m[0]);
  result.budgets = [...new Set(budgets)].slice(0, 30);
}

fs.writeFileSync('_recon_' + host.replace(/[^a-z0-9]/gi, '_') + '.json', JSON.stringify(result, null, 1), 'utf8');
console.log(JSON.stringify(result, null, 1));