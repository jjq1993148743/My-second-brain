import { execFile } from 'node:child_process';
const run=(c,a)=>new Promise(res=>execFile(c,a,{maxBuffer:64*1024*1024,windowsHide:true,timeout:25000},(e,so)=>res(so||'')));
const CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const chrome=u=>new Promise(res=>{execFile(CHROME,['--headless=new','--disable-gpu','--no-sandbox','--dump-dom','--virtual-time-budget=14000','--user-agent='+UA,u],{maxBuffer:128*1024*1024,windowsHide:true,timeout:50000},(e,so)=>res(so||''));});

function extract(html){
  const m=html.indexOf('window.PPHReact.initialState=');
  if(m<0) return null;
  const s=m+'window.PPHReact.initialState='.length;
  let d=0,e=-1;
  for(let j=s;j<html.length;j++){const c=html[j]; if(c==='{')d++; else if(c==='}'){d--; if(d===0){e=j+1;break;}} else if(c==='"'){j++; while(j<html.length&&html[j]!=='"'){if(html[j]==='\\')j++; j++;}}}
  if(e<0) return null;
  try{return JSON.parse(html.slice(s,e));}catch(err){return null;}
}

const urls=['https://www.peopleperhour.com/freelance-jobs?page=34','https://www.peopleperhour.com/freelance-jobs?page=35'];
for(const u of urls){
  const h=await chrome(u);
  const st=extract(h);
  if(st&&st.entities&&st.entities.projects){
    const n=Object.keys(st.entities.projects).length;
    const tot=st.freelanceJobs?.main?.meta?.['total-items'];
    console.log(u.slice(-20)+' -> projects='+n+' total='+tot);
  } else console.log(u.slice(-20)+' -> FAIL bytes='+h.length);
  await new Promise(r=>setTimeout(r,5000));
}