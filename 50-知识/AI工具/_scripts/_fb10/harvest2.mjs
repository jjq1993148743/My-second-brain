
// 走 _todo.json：每轮取前 50 个未抓 id，抓完落盘并从 todo 中移除
import { get, strip, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
const CONC = 3;
async function worker(state, cnt) {
  while (true) {
    if (state.todo.length === 0) return;
    const id = String(state.todo.shift());
    cnt.n++;
    let rec = { id, host: '', name: '', cat: '', cats: '', status: '', year: '', len: 0 };
    for (let a = 0; a < 3; a++) {
      try {
        const r = await get('https://www.foreverblog.cn/blog/' + id + '.html');
        if (r.status !== 200) { rec.status = 'http_' + r.status; if (r.status === 404) break; await sleep(1200); continue; }
        const h = r.body.toString('utf8');
        rec.len = h.length;
        const hostM = h.match(/class="blog-detail-hero__host">\s*([^<]+?)\s*</);
        if (hostM) rec.host = hostM[1].trim();
        const nameM = h.match(/<h1[^>]*>([\s\S]{0,120}?)<\/h1>/);
        if (nameM) rec.name = strip(nameM[1]).slice(0, 60);
        const stM = h.match(/roster-status roster-status--(\w+)"[^>]*>\s*<i><\/i>([^<]+)</);
        if (stM) rec.status = stM[1] + ':' + strip(stM[2]);
        const yrM = h.match(/blog-detail-hero__years[^>]*>([\s\S]{0,60}?)<\/span>/);
        if (yrM) rec.year = strip(yrM[1]).slice(0, 20);
        const catM = h.match(/topic-label" data-category="([^"]*)"[\s\S]{0,160}?>([\s\S]{0,200}?)<\/span>/);
        if (catM) { rec.cat = catM[1]; rec.cats = strip(catM[2]).slice(0, 40); }
        if (!rec.host) {
          const m2 = h.match(/"https?:\/\/([a-z0-9.\-]+\.[a-z]{2,})"/i);
          if (m2 && !/foreverblog|qq\.com/.test(m2[1])) rec.host = m2[1];
        }
        break;
      } catch (e) { rec.status = 'err_' + String(e.message).slice(0, 28); await sleep(1500); }
    }
    state.done.push(rec);
    if (state.done.length % 10 === 0) console.log('  progress', state.done.length, id, rec.host || rec.status);
    if (state.done.length % 50 === 0) {
      const tag = 'r' + state.batch++;
      fs.writeFileSync('./_blogs_' + tag + '.json', JSON.stringify(state.done, null, 1), 'utf8');
      fs.writeFileSync('./_todo.json', JSON.stringify(state.todo), 'utf8');
      state.done = [];
      console.log('FLUSH _blogs_' + tag + '.json  todo left', state.todo.length);
    }
    await sleep(800 + Math.floor(Math.random() * 400));
  }
}
let state = JSON.parse(fs.readFileSync('./_state.json', 'utf8'));
let batch = fs.readdirSync('.').filter(f => /^_blogs_r\d+\.json$/.test(f)).length;
state.batch = batch;
if (!state.done) state.done = [];
console.log('resume: todo', state.todo.length, 'batch index', batch);
const cnt = { n: 0 };
await Promise.all([0,1,2].map(() => worker(state, cnt)));
fs.writeFileSync('./_todo.json', JSON.stringify(state.todo), 'utf8');
if (state.done.length) fs.writeFileSync('./_blogs_r' + state.batch + '.json', JSON.stringify(state.done, null, 1), 'utf8');
console.log('ALL DONE. fetched', cnt.n);
