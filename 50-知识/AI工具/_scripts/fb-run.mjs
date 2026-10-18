
// 串行跑一批：node fb-run.mjs <startIndex> <count> <tag>
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const start = Number(process.argv[2]), count = Number(process.argv[3]), tag = process.argv[4];
const r = execFileSync(process.execPath, ['fb-harvest.mjs', String(start), String(count), tag], { cwd: '.', encoding: 'utf8', maxBuffer: 1024*1024*8 });
console.log(r.trim().split('\n').slice(-4).join('\n'));
