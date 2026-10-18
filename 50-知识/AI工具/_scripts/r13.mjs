
import fs from 'node:fs';
const h = fs.readFileSync('ih_products.html','utf8');
const hrefs = [...new Set([...h.matchAll(/href="(\/[^"]{2,120})"/g)].map(m=>m[1]))];
console.log(hrefs.slice(80).join('\n'));
console.log('\n--- look for revenue strings ---');
const revs = [...h.matchAll(/(\$[\d,]+(?:k|K)?\s*\/?(?:mo|month)?)/g)].map(m=>m[0]);
console.log('rev matches', revs.length, revs.slice(0,40));
// search for product slug listing in JS bundle
const prods = [...new Set([...h.matchAll(/\/product\/([a-z0-9-]{2,60})/g)].map(m=>m[1]))];
console.log('product slugs', prods.length, prods.slice(0,30));
