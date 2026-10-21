import fs from 'node:fs';
const f = process.argv[2];
const html = fs.readFileSync(f, 'utf8');
const rows = [...html.matchAll(/<a href="(https:\/\/www\.douban\.com\/group\/topic\/\d+\/)[^"]*" title="([^"]*)"[\s\S]*?<\/a>[\s\S]*?<td nowrap="nowrap">\s*<a href="([^"]*)"[^>]*>([^<]*)<\/a>\s*<\/td>\s*<td nowrap="nowrap" class="r-count ?">(\d*)<\/td>\s*<td nowrap="nowrap" class="time">([^<]*)<\/td>/g)];
const out = rows.map(m => ({url:m[1], title:m[2], author:m[4], replies:m[5], time:m[6]}));
console.log(JSON.stringify(out, null, 1));
console.error('count=' + out.length);
