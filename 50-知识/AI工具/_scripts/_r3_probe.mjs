import fs from 'node:fs';
const html=fs.readFileSync('_r3.html','utf8');
// 找所有链接并过滤含 job 的
const all=[...new Set([...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1]))];
const jobLinks=all.filter(x=>/job|position|role/i.test(x)).slice(0,20);
console.log('ALL_LINKS='+all.length);
console.log('JOB_LINKS: '+JSON.stringify(jobLinks.slice(0,10)));
// 找薪资文本
const text=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,'\n');
const ux=[...new Set(text.split('\n').map(s=>s.trim()).filter(s=>s.length>3))];
const sal=ux.filter(l=>/\$[0-9]{2,3}[,k]/.test(l)).slice(0,8);
console.log('SAL: '+JSON.stringify(sal));
const cats=ux.filter(l=>l.length>5 && l.length<40 && /^[A-Z]/.test(l)).slice(0,12);
console.log('CATS: '+JSON.stringify(cats));