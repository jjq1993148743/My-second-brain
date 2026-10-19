import { writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const pexec = promisify(execFile);
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const Q = process.argv[2] || "freelance platform";
const E = encodeURIComponent(Q);
const SELF = /(qwant\.com|brave\.com|yimg\.jp|yahoo\.co\.jp|yahoo\.com|lycorp\.co\.jp|mojeek\.com|marginalia\.nu|marginalia-search\.com|duckduckgo\.com|startpage\.com|ecosia\.org|yandex\.(com|cloud|net)|google\.com|gstatic|googleusercontent|bing\.com|microsoft\.com|msn\.com|doubleclick|schema\.org|w3\.org|apple\.com|googletagmanager|cloudflare|privacymark|marsflag|sonynetwork|torproject)/i;
const JUNKEXT = /^(cdn|static|assets|img|imgs|tiles|api|login|map|maps|about|blog|community|support|help)\b/i;

function hostsFrom(txt) {
  const urls = []; let m;
  const r1 = /href\s*=\s*["'](https?:\/\/[^"']{6,300})["']/g;
  while ((m = r1.exec(txt))) urls.push(m[1]);
  const r2 = /"(?:url|link|href)"\s*:\s*"([^"]{8,300})"/g;
  while ((m = r2.exec(txt))) urls.push(m[1]);
  const hs = new Set();
  for (let u of urls) {
    u = u.replace(/&amp;/g, "&").replace(/^\/\//, "https://").replace(/\\u002F/g, "/").replace(/\\\//g, "/");
    try {
      const h = new URL(u).hostname.toLowerCase().replace(/^www[0-9]*\./, "");
      if (!h.includes(".")) continue;
      if (SELF.test(h)) continue;
      const sub = h.split(".")[0];
      if (JUNKEXT.test(sub)) continue;
      hs.add(h);
    } catch (e) {}
  }
  return hs;
}

async function curl(name, url, extra) {
  const rec = { engine: name, status: 0, hosts: 0, list: [], note: "" };
  try {
    const args = ["-s", "-L", "--max-time", "30", "-x", "http://127.0.0.1:7897", "-A", UA,
      "-H", "accept: text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
      "-H", "accept-language: en-US,en;q=0.9"];
    if (extra) args.push(...extra);
    args.push(url);
    const { stdout } = await pexec("curl.exe", args, { maxBuffer: 16 * 1024 * 1024, windowsHide: true });
    rec.status = stdout ? 200 : 0;
    const hs = hostsFrom(stdout);
    rec.hosts = hs.size; rec.list = [...hs].slice(0, 10);
    if (!stdout) rec.note = "EMPTY";
  } catch (e) { rec.note = String(e.message).slice(0, 50); }
  return rec;
}

const out = [];
const T = [
  ["qwant-api", "https://api.qwant.com/v3/search/web?q=" + E + "&count=10&locale=en_US&offset=0&device=desktop&safesearch=0"],
  ["ddg-html-post", "https://html.duckduckgo.com/html/", ["-d", "q=" + E]],
  ["startpage", "https://www.startpage.com/sp/search?query=" + E + "&cat=web"],
  ["ecosia", "https://www.ecosia.org/search?q=" + E + "&addon=opensearch"],
  ["yandex", "https://yandex.com/search/?text=" + E + "&lr=87"],
  ["brave-2", "https://search.brave.com/search?q=" + encodeURIComponent("best espresso machine for home")],
  ["mojeek-2", "https://www.mojeek.com/search?q=" + encodeURIComponent("best espresso machine for home")],
  ["searx.be", "https://searx.be/search?q=" + E],
  ["searx-bnd2", "https://baresearch.org/search?q=" + encodeURIComponent("best espresso machine for home")],
  ["presearch", "https://presearch.com/search?q=" + E],
  ["yahoojp-3", "https://search.yahoo.co.jp/search?p=" + encodeURIComponent("best espresso machine for home")]
];
for (const [name, url, extra] of T) {
  const rec = await curl(name, url, extra);
  const tag = rec.hosts >= 3 ? "USABLE" : rec.hosts > 0 ? "weak  " : "no    ";
  console.log(tag + " " + name.padEnd(14) + " hosts=" + rec.hosts + " " + rec.list.slice(0, 5).join(",") + (rec.note ? " " + rec.note : ""));
  out.push(rec);
}
const u = out.filter(r => r.hosts >= 3);
console.log("");
console.log("=== USABLE COUNT: " + u.length + " / " + out.length + " ===");
for (const x of u) console.log(x.engine + " -> " + JSON.stringify(x.list));
await writeFile("_engine_hunt5.json", JSON.stringify(out, null, 1));
