import fs from 'node:fs';
const html=fs.readFileSync('_cjl.html','utf8');
const links=[...new Set([...html.matchAll(/href="(\/jobs\/[a-z0-9\-]{5,})"/g)].map(m=>m[1]))];
console.log('LINKS='+links.length);
const parsed=links.map(l=>{
  const slug=l.replace('/jobs/','');
  const parts=slug.split('-at-');
  const company=parts.length>1?parts[parts.length-1]:'';
  const rest=parts[0]||slug;
  const title=rest.replace(/-/g,' ');
  return {slug, title, company};
});
fs.writeFileSync('_cjl_jobs.json',JSON.stringify(parsed,null,1),'utf8');
console.log('PARSED='+parsed.length);
for(const p of parsed.slice(0,10)) console.log('  '+p.company.padEnd(18)+' | '+p.title.slice(0,50));