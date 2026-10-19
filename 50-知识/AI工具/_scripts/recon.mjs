// recon.mjs —— 平台侦察：抓首页公开信息，判断是什么站、能不能注册、抽成、收款方式
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
const execFileAsync = promisify(execFile);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function curl(url) {
  try {
    const args = ['-sL', '-x', 'http://127.0.0.1:7897', '-H', 'User-Agent: ' + UA,
      '-H', 'Accept: text/html,application/xhtml+xml,*/*', '-H', 'Accept-Language: en-US,en;q=0.9,zh-CN;q=0.8',
      '--max-time', '25', '--compressed', url];
    const { stdout } = await execFileAsync('curl', args, { maxBuffer: 32 * 1024 * 1024, windowsHide: true });
    return stdout || '';
  } catch (e) { return ''; }
}

function clean(html) {
  return (html || '').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
}

function analyze(host, html) {
  const title = ((html.match(/<title[^>]*>([^<]{0,150})/i) || [])[1] || '').trim();
  const desc = ((html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{0,300})/i) || [])[1] || '').trim();
  const text = clean(html).slice(0, 60000);
  const low = text.toLowerCase();

  // 注册/入驻信号
  const sellerSignals = [];
  if (/become a (seller|freelancer|provider|creator|tutor|consultant)|sell your|offer your services|start selling|post a service|list your service|join as (a )?(freelancer|creator|seller)/i.test(text)) sellerSignals.push('有卖家/自由职业者入驻入口');
  if (/sign ?up|register|create (an )?account|join (for )?free|get started/i.test(text)) sellerSignals.push('有注册入口');
  const noSignup = /invite[- ]only|approval required|apply to join|waitlist/i.test(text);

  // 抽成/费用
  const feeHits = [];
  const feeRe = /([0-9]{1,2}(?:\.[0-9])?)\s?%\s*(?:service|platform|commission|fee|of (?:the|your)|cut)/gi;
  let m;
  while ((m = feeRe.exec(text)) !== null && feeHits.length < 4) feeHits.push(m[0].replace(/\s+/g, ' '));
  if (!feeHits.length) {
    const feeRe2 = /(?:commission|service fee|platform fee|fee of|takes?)\s*(?:of\s*)?([0-9]{1,2}(?:\.[0-9])?)\s?%/gi;
    while ((m = feeRe2.exec(text)) !== null && feeHits.length < 4) feeHits.push(m[0].replace(/\s+/g, ' '));
  }

  // 收款
  const payout = [];
  if (/paypal/i.test(text)) payout.push('PayPal');
  if (/payoneer/i.test(text)) payout.push('Payoneer');
  if (/wise|transferwise/i.test(text)) payout.push('Wise');
  if (/stripe/i.test(text)) payout.push('Stripe');
  if (/bank transfer|direct deposit|wire transfer/i.test(text)) payout.push('银行转账');
  if (/支付宝|alipay/i.test(text)) payout.push('支付宝');
  if (/微信支付|wechat pay/i.test(text)) payout.push('微信');
  if (/crypto|usdt|bitcoin|ethereum/i.test(text)) payout.push('加密货币');

  // 类型判断
  let kind = '未知';
  if (/freelanc|hire (a )?(freelancer|developer|designer)|find (a )?freelancer|post a (job|project)|outsourc/i.test(text)) kind = '接单/外包';
  if (/bug bounty|vulnerability|security researcher|penetration test|hacker/i.test(text) && /bounty|reward/i.test(text)) kind = '赏金/安全';
  if (/sell (your )?(digital|template|theme|plugin|app|ebook|course)|marketplace for (creators|designers|developers)/i.test(text)) kind = '数字商品';
  if (/affiliate (network|program)|publisher|merchant|commission on sales/i.test(text)) kind = '联盟营销';
  if (/job board|find (a )?job|career|hiring|vacancies|positions open/i.test(text) && kind === '未知') kind = '招聘板';

  // 语言/地区
  const lang = /lang=["']?(ja|ko|zh|ru|ar|es|fr|de|pt|it|nl|pl|sv|cs)/i.exec(html);

  // 反爬
  const blocked = /Just a moment|Checking your browser|Attention Required|Access Denied|enable JavaScript and cookies/i.test(html.slice(0, 6000));

  return {
    host, ok: html.length > 3000 && !blocked, bytes: html.length, blocked,
    title: title.slice(0, 100), desc: desc.slice(0, 160),
    kind, sellerSignals, noSignup, feeHits: [...new Set(feeHits)], payout: [...new Set(payout)],
    lang: lang ? lang[1] : ''
  };
}

const IN = process.argv[2];
const OUT = process.argv[3];
if (!IN || !OUT) { console.log('usage: node recon.mjs <hosts.json> <out.json>'); process.exit(1); }
const hosts = JSON.parse(fs.readFileSync(IN, 'utf8'));
let done = [];
try { done = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch {}
const seen = new Set(done.map(d => d.host));

let n = 0;
for (const h of hosts) {
  const host = typeof h === 'string' ? h : h.host;
  if (!host || seen.has(host)) continue;
  n++;
  const html = await curl('https://' + host + '/');
  let rec;
  if (!html || html.length < 500) {
    rec = { host, ok: false, bytes: html ? html.length : 0, blocked: false, title: '', desc: '', kind: '取不到', sellerSignals: [], feeHits: [], payout: [] };
  } else {
    try { rec = analyze(host, html); } catch (e) { rec = { host, ok: false, err: e.message.slice(0, 60), kind: '解析失败' }; }
  }
  done.push(rec);
  console.log('[' + n + '/' + hosts.length + '] ' + host + ' -> ' + (rec.ok ? rec.kind : (rec.blocked ? 'BLOCKED' : 'FAIL')) + (rec.feeHits && rec.feeHits.length ? '  费用:' + rec.feeHits[0] : ''));
  if (n % 10 === 0) fs.writeFileSync(OUT, JSON.stringify(done), 'utf8');
  await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
}
fs.writeFileSync(OUT, JSON.stringify(done), 'utf8');
console.log('RECON-DONE new=' + n + ' total=' + done.length + ' ok=' + done.filter(d => d.ok).length);