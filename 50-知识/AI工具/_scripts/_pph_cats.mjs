import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:55000},(e,so)=>res(so||'')));
const CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const chrome=u=>new Promise(res=>{execFile(CHROME,['--headless=new','--disable-gpu','--no-sandbox','--dump-dom','--virtual-time-budget=18000','--user-agent='+UA,u],{maxBuffer:128*1024*1024,windowsHide:true,timeout:60000},(e,so)=>res(so||''));});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function count(html){
  const m=html.indexOf('window.PPHReact.initialState=');
  if(m<0) return -1;
  const s=m+'window.PPHReact.initialState='.length;
  let d=0,e=-1;
  for(let j=s;j<html.length;j++){const c=html[j]; if(c==='{')d++; else if(c==='}'){d--; if(d===0){e=j+1;break;}} else if(c==='"'){j++; while(j<html.length&&html[j]!=='"'){if(html[j]==='\\')j++; j++;}}}
  if(e<0) return -1;
  try{const st=JSON.parse(html.slice(s,e)); return st.entities&&st.entities.projects?Object.keys(st.entities.projects).length:0;}catch(err){return -1;}
}
const cats=['technology-programming','design','digital-marketing','writing-translation','business','video-photo-image','ai-services','social-media','music-audio'];
let tot=0;
for(const c of cats){
  const h=await chrome('https://www.peopleperhour.com/freelance-jobs/'+c);
  const n=count(h);
  if(n>0) tot+=n;
  console.log(c.padEnd(22)+Math.round(h.length/1000)+'k projects='+n);
  await sleep(4500);
}
console.log('TOTAL='+tot);