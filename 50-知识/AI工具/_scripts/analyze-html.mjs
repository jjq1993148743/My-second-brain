// analyze-html.mjs —— 分析已保存的 HTML 文件，提取平台信息
// 用法: node analyze-html.mjs <html文件> [host]
import fs from 'node:fs';

const file = process.argv[2];
const host = process.argv[3] || file.replace(/_dev_|_probe_|.html$/g, '');
const html = fs.readFileSync(file, 'utf8');

function text(h) {
  return (h || '').replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .split('\n').map(l => l.trim()).filter(l => l.length > 0);
}

const lines = text(html);
const joined = lines.join(' ');

const out = {
  host,
  bytes: html.length,
  lines: lines.length
};

// 标题
out.title = ((html.match(/<title[^>]*>([^<]{0,150})/i) || [])[1] || '').trim();

// 阻塞检测
out.blocked = /Just a moment|Checking your browser|Access Denied|请稍候|Cloudflare|Attention Required/i.test(html.slice(0, 8000));

// 费率
const fees = new Set();
for (const m of joined.matchAll(/([0-9]{1,2}(?:\.[0-9])?)\s?%\s*(?:service|platform|commission|fee|of the|of your)/gi)) fees.add(m[0]);
for (const m of joined.matchAll(/(?:commission|service fee|platform fee|fee of|takes?)\s*(?:of\s*)?([0-9]{1,2}(?:\.[0-9])?)\s?%/gi)) fees.add(m[0]);
out.fees = [...fees].slice(0, 8);

// 收款
const pay = [];
for (const [k, re] of [['PayPal', /paypal/i], ['Payoneer', /payoneer/i], ['Wise', /wise|transferwise/i], ['Stripe', /stripe/i], ['银行转账', /bank transfer|direct deposit|wire transfer/i], ['支付宝', /alipay|支付宝/i], ['微信', /wechat pay|微信支付/i], ['加密货币', /crypto|usdt|bitcoin|ethereum/i]]) {
  if (re.test(joined)) pay.push(k);
}
out.payout = pay;

// 预算（多币种）
const budgets = new Set();
for (const m of joined.matchAll(/[£$€¥]\s?[0-9][0-9,]*(?:\.[0-9]{2})?/g)) budgets.add(m[0]);
out.budgets = [...budgets].slice(0, 40);

// 项目标题（找含开发关键词的完整行）
const devWords = /(develop|wordpress|php|python|javascript|react|node|api|website|bug|fix|app|shopify|woocommerce|laravel|django|flutter|android|ios|backend|frontend|full.?stack|plugin|theme)/i;
out.jobTitles = lines.filter(l => devWords.test(l) && l.length > 15 && l.length < 130).slice(0, 40);

// 统计信息
out.stats = lines.filter(l => /(projects?|jobs?|freelancers?|posted|members|active)/i.test(l) && l.length < 90).slice(0, 15);

// 入驻信号
out.signals = {
  signup: /sign ?up|register|create (an )?account|join (for )?free|get started/i.test(joined),
  seller: /become a (seller|freelancer|provider|creator)|sell your|offer your services|start selling|post a service|post a project/i.test(joined),
  inviteOnly: /invite[- ]only|approval required|apply to join|waitlist|vetted/i.test(joined),
  loginRequired: /log ?in to|sign in to (view|see|apply)|members only/i.test(joined)
};

console.log(JSON.stringify(out, null, 1));