// engines-selftest.mjs —— 搜索通道自检（换机器/换网络后先跑这个）
// 用法: node engines-selftest.mjs
import { searchOne, ENGINES } from './search-multi.mjs';

const Q = 'freelance platform';
const rows = [];
for (const name of Object.keys(ENGINES)) {
  try {
    const r = await searchOne(name, Q);
    const ok = r.count >= 5;
    const weak = r.count > 0 && r.count < 5;
    rows.push({ engine: name, count: r.count, verdict: ok ? 'GOOD' : weak ? 'weak' : 'FAIL', note: ENGINES[name].note || '' });
    console.log((ok ? 'GOOD ' : weak ? 'weak ' : 'FAIL ') + name.padEnd(14) + ' hosts=' + String(r.count).padStart(3) + '  ' + (ENGINES[name].note || ''));
  } catch (e) {
    rows.push({ engine: name, count: 0, verdict: 'ERR', err: e.message });
    console.log('ERR  ' + name + ' ' + e.message);
  }
  await new Promise(res => setTimeout(res, 4000));
}
const good = rows.filter(r => r.verdict === 'GOOD').length;
console.log('');
console.log('可用: ' + good + ' / ' + rows.length);
if (good === 0) { console.log('⚠️ 全部失败，检查：VPN 是否开启？代理 127.0.0.1:7897 是否在跑？'); process.exit(1); }