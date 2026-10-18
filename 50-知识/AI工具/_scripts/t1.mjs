
import { get, gbk, strip, sleep } from './proxy-fetch.mjs';
import fs from 'node:fs';
const OUT='D:/GitHub/_intel/';
async function save(n, r){ fs.writeFileSync(OUT+n, r.body); }
let r = await get('https://gumroad.com/discover', 'text/html,application/xhtml+xml');
console.log('gumroad /discover', r.status, r.body.length);
await save('gumroad-discover.html', r);
