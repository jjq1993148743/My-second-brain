import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:30000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curlJ=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','28','--compressed',u]);
const all=[];
for(let p=1;p<=3;p++){
  const h=await curlJ('https://workforgood.org/wp-json/wp/v2/posts?per_page=100&page='+p);
  let j=null; try{j=JSON.parse(h);}catch(e){}
  if(!Array.isArray(j)){ console.log('p'+p+' FAIL'); continue; }
  for(const post of j){
    all.push({
      id: post.id,
      title: (post.title&&post.title.rendered||'').replace(/<[^>]+>/g,'').trim(),
      date: post.date||'',
      link: post.link||''
    });
  }
  console.log('p'+p+' posts='+j.length+' total='+all.length);
  await new Promise(r=>setTimeout(r,1500));
}
fs.writeFileSync('_wfg_posts.json',JSON.stringify(all,null,1),'utf8');
console.log('TOTAL='+all.length);
for(const a of all.slice(0,8)) console.log('  ['+a.date.slice(0,10)+'] '+a.title.slice(0,55));