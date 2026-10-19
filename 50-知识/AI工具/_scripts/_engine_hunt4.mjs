import { writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const pexec = promisify(execFile);
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const Q = process.argv[2] || "freelance platform";
const E = encodeURIComponent(Q);
const JUNK = /(pstatic\.net|flocdn\.com|gstatic\.com|googleusercontent\.com|yimg\.com|bing\.com|microsoft\.com|msn\.com|doubleclick|schema\.org|w3\.org|apple\.com|googletagmanager|cdn\.|static\.|assets\.|privacymark|marsflag|sonynetwork|cloudflare|github\.com|bsky\.app|techaro)/i;

function hostsFrom(txt) {
  const urls = [];
  let m;
  const re1 = /href\s*=\s*["'](https?:\/\/[^"']{6,300})["']/g;
  while ((m = re1.exec(txt))) urls.push(m[1]);
  const re2 = /"(?:url|link|href)"\s*:\s*"([^"]{8,300})"/g;
  while ((m = re2.exec(txt))) urls.push(m[1]);
  const hs = new Set();
  for (let u of urls) {
    u = u.replace(/&amp;/g, "&").replace(/^\/\//, "https://").replace(/\\u002F/g, "/").replace(/\\\//g, "/");
    try {
      const h = new URL(u).hostname.toLowerCase().replace(/^www[0-9]*\./, "");
      if (!h.includes(".")) continue;
      if (JUNK.test(h)) continue;
      hs.add(h);
    } catch (e) {}
  }
  return hs;
}

async function viaFetch(name, url, opts) {
  const rec = { engine: name, status: 0, hosts: 0, list: [], note: "" };
  try {
    const ctl = new AbortController();
    const tm = setTimeout(() => ctl.abort(), 20000);
    const res = await fetch(url, Object.assign({ headers: { "user-agent": UA, "accept": "text/html,application/xhtml+xml", "accept-language": "en-US,en;q=0.9" }, signal: ctl.signal }, opts || {}));
    clearTimeout(tm);
    rec.status = res.status;
    const body = await res.text();
    const hs = hostsFrom(body);
    rec.hosts = hs.size; rec.list = [...hs].slice(0, 8);
  } catch (e) { rec.note = String(e.name === "AbortError" ? "TIMEOUT" : e.message).slice(0, 50); }
  return rec;
}

async function viaCurl(name, url, proxy) {
  const rec = { engine: name, status: 0, hosts: 0, list: [], note: "" };
  try {
    const args = ["-s", "-L", "--max-time", "25", "-A", UA, "-H", "accept-language: en-US,en;q=0.9", url];
    if (proxy) args.unshift("-x", "http://127.0.0.1:7897");
    const { stdout } = await pexec("curl.exe", args, { maxBuffer: 12 * 1024 * 1024, windowsHide: true });
    rec.status = stdout ? 200 : 0;
    const hs = hostsFrom(stdout);
    rec.hosts = hs.size; rec.list = [...hs].slice(0, 8);
  } catch (e) { rec.note = String(e.message).slice(0, 50); }
  return rec;
}

const out = [];
const tests = [
  ["ddg-lite-POST", () => viaFetch("ddg-lite-POST", "https://lite.duckduckgo.com/lite/", { method: "POST", headers: { "user-agent": UA, "content-type": "application/x-www-form-urlencoded", "accept-language": "en-US,en;q=0.9" }, body: "q=" + E })],
  ["ddg-html-POST", () => viaFetch("ddg-html-POST", "https://html.duckduckgo.com/html/", { method: "POST", headers: { "user-agent": UA, "content-type": "application/x-www-form-urlencoded" }, body: "q=" + E })],
  ["google-gbv1", () => viaFetch("google-gbv1", "https://www.google.com/search?q=" + E + "&gbv=1&num=20&hl=en")],
  ["brave-html", () => viaFetch("brave-html", "https://search.brave.com/search?q=" + E + "&source=web")],
  ["ecosia-html", () => viaFetch("ecosia-html", "https://www.ecosia.org/search?q=" + E)],
  ["qwant-html", () => viaFetch("qwant-html", "https://www.qwant.com/?q=" + E + "&t=web")],
  ["marginalia-new", () => viaFetch("marginalia-new", "https://old-search.marginalia.nu/search?query=" + E)],
  ["searx-bnd-html", () => viaFetch("searx-bnd-html", "https://baresearch.org/search?q=" + E)],
  ["curl-google", () => viaCurl("curl-google", "https://www.google.com/search?q=" + E + "&gbv=1&num=20&hl=en", true)],
  ["curl-ddg-lite", () => viaCurl("curl-ddg-lite", "https://lite.duckduckgo.com/lite/?q=" + E, true)],
  ["curl-brave", () => viaCurl("curl-brave", "https://search.brave.com/search?q=" + E, true)],
  ["curl-yandex", () => viaCurl("curl-yandex", "https://yandex.com/search/?text=" + E, true)],
  ["curl-mojeek", () => viaCurl("curl-mojeek", "https://www.mojeek.com/search?q=" + E, true)],
  ["curl-yahoojp", () => viaCurl("curl-yahoojp", "https://search.yahoo.co.jp/search?p=" + E, true)],
  ["curl-startpage", () => viaCurl("curl-startpage", "https://www.startpage.com/sp/search?query=" + E, true)]
];

for (const [name, fn] of tests) {
  const rec = await fn();
  const tag = rec.hosts >= 3 ? "USABLE" : rec.hosts > 0 ? "weak  " : "no    ";
  console.log(tag + " " + name.padEnd(16) + " status=" + rec.status + " hosts=" + rec.hosts + " " + rec.list.slice(0, 5).join(",") + (rec.note ? " " + rec.note : ""));
  out.push(rec);
}
const u = out.filter(r => r.hosts >= 3);
console.log("");
console.log("=== USABLE COUNT: " + u.length + " / " + out.length + " ===");
for (const x of u) console.log(x.engine + " -> " + JSON.stringify(x.list));
await writeFile("_engine_hunt4.json", JSON.stringify(out, null, 1));
