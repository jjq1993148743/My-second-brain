import { execFile } from 'node:child_process';
import fs from 'node:fs';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:128*1024*1024,windowsHide:true,timeout:58000},(e,so)=>res(so||'')));
const CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const chrome=u=>new Promise(res=>{execFile(CHROME,['--headless=new','--disable-gpu','--no-sandbox','--dump-dom','--virtual-time-budget=18000','--user-agent='+UA,u],{maxBuffer:128*1024*1024,windowsHide:true,timeout:60000},(e,so)=>res(so||''));});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function extract(html){
  const m=html.indexOf('window.PPHReact.initialState=');
  if(m<0) return null;
  const s=m+'window.PPHReact.initialState='.length;
  let d=0,e=-1;
  for(let j=s;j<html.length;j++){const c=html[j]; if(c==='{')d++; else if(c==='}'){d--; if(d===0){e=j+1;break;}} else if(c==='"'){j++; while(j<html.length&&html[j]!=='"'){if(html[j]==='\\')j++; j++;}}}
  if(e<0) return null;
  try{return JSON.parse(html.slice(s,e));}catch(err){return null;}
}
const cats=['technology-programming','digital-marketing','writing-translation','business','ai-services','social-media','music-audio'];
let all=[];
try{all=JSON.parse(fs.readFileSync('_pph_projects.json','utf8'));}catch(e){}
const seen=new Set(all.map(p=>p.proj_id));
const before=all.length;
for(const c of cats){
  const h=await chrome('https://www.peopleperhour.com/freelance-jobs/'+c);
  const st=extract(h);
  if(!st||!st.entities||!st.entities.projects){console.log(c+' FAIL'); await sleep(4000); continue;}
  let add=0;
  for(const p of Object.values(st.entities.projects)){
    const a=p.attributes;
    if(!a||!a.proj_id||seen.has(a.proj_id)) continue;
    seen.add(a.proj_id); all.push(a); add++;
  }
  console.log(c.padEnd(22)+'new='+add+' total='+all.length);
  fs.writeFileSync('_pph_projects.json',JSON.stringify(all,null,1),'utf8');
  await sleep(4500);
}
console.log('FINAL='+all.length+' (was '+before+')');