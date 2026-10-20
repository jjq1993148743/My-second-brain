import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:22000},(e,so)=>res(so||'')));
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const curl=u=>run('curl',['-sL','-x','http://127.0.0.1:7897','-H','User-Agent: '+UA,'-H','Accept: application/json','--max-time','20','--compressed',u]);

// 1) 找到最新的 Who is hiring 帖子
const s=await curl('https://hn.algolia.com/api/v1/search?query=%22Ask%20HN%3A%20Who%20is%20hiring%22&tags=story&hitsPerPage=20');
let sj=null; try{sj=JSON.parse(s);}catch(e){}
if(!sj||!sj.hits){console.log('search fail');process.exit(1);}
const latest=sj.hits.filter(h=>/Who is hiring/i.test(h.title||'')).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0];
console.log('LATEST: '+latest.title+' | id='+latest.objectID+' | comments='+latest.num_comments+' | '+latest.created_at);

// 2) 拉取该帖子的所有评论
const c=await curl('https://hn.algolia.com/api/v1/items/'+latest.objectID);
let cj=null; try{cj=JSON.parse(c);}catch(e){}
if(!cj||!cj.children){console.log('items fail');process.exit(1);}
const top=cj.children.filter(x=>x.text);
console.log('TOP_COMMENTS='+top.length);

// 3) 解析出公司名和职位
const jobs=[];
for(const x of top){
  const txt=(x.text||'').replace(/<[^>]+>/g,' ').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/\s+/g,' ').trim();
  if(txt.length<30) continue;
  // HN hiring 常见格式: Company | Role | Location | Salary
  const parts=txt.split('|').map(s=>s.trim());
  jobs.push({company:parts[0]||'', rest:parts.slice(1,4).join(' | ').slice(0,150), text:txt.slice(0,300), date:x.created_at});
}
fs.writeFileSync('_hn_hiring.json',JSON.stringify(jobs,null,1),'utf8');
console.log('JOBS='+jobs.length);
for(const j of jobs.slice(0,8)) console.log('  '+j.company.slice(0,30)+' | '+j.rest.slice(0,80));