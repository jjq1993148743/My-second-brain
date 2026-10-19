import { writeFile } from "node:fs/promises";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const Q = process.argv[2] || "best espresso machine for home";
const E = encodeURIComponent(Q);
const ENGINES = [
  ["yahoo-jp", "https://search.yahoo.co.jp/search?p=" + E, "html", "yahoo.co.jp"],
  ["bing-intl", "https://www.bing.com/search?q=" + E + "&setlang=en&cc=us", "html", "bing.com"],
  ["searx-bnd", "https://baresearch.org/search?q=" + E + "&format=json", "json", "baresearch.org"],
  ["searx-inetol", "https://search.inetol.net/search?q=" + E + "&format=json", "json", "inetol.net"],
  ["searx-rhscz", "https://search.rhscz.eu/search?q=" + E + "&format=json", "json", "rhscz.eu"],
  ["searx-work", "https://searx.work/search?q=" + E + "&format=json", "json", "searx.work"],
  ["marginalia", "https://search.marginalia.nu/search?query=" + E, "html", "marginalia.nu"],
  ["so-net", "https://www.so-net.ne.jp/search/web/?query=" + E, "html", "so-net.ne.jp"],
  ["wiby", "https://wiby.me/?q=" + E, "html", "wiby.me"],
  ["searchmysite", "https://searchmysite.net/search/?q=" + E, "html", "searchmysite.net"],
  ["shenma", "https://m.sm.cn/s?q=" + E, "html", "sm.cn"],
  ["seznam", "https://search.seznam.cz/?q=" + E, "html", "seznam.cz"],
  ["naver", "https://search.naver.com/search.naver?query=" + E, "html", "naver.com"],
  ["metager", "https://metager.org/meta/meta.ger3?eingabe=" + E, "html", "metager.org"],
  ["swisscows", "https://swisscows.com/en/web?query=" + E, "html", "swisscows.com"],
  ["mojeek", "https://www.mojeek.com/search?q=" + E, "html", "mojeek.com"],
  ["startpage", "https://www.startpage.com/sp/search?query=" + E, "html", "startpage.com"]
];
const JUNK = /(pstatic\.net|flocdn\.com|gstatic\.com|googleusercontent\.com|yimg\.com|bing\.com|microsoft\.com|msn\.com|doubleclick|schema\.org|w3\.org|apple\.com|googletagmanager|cdn\.|static\.|assets\.|privacymark|marsflag|sonynetwork)/i;
function hostsFrom(txt, mode, self) {
  const urls = [];
  if (mode === "json") {
    let m; const re = /"(?:url|link|href)"\s*:\s*"([^"]{8,300})"/g;
    while ((m = re.exec(txt))) urls.push(m[1]);
    const re2 = /https?:\/\/[A-Za-z0-9._~:\/?#\[\]@!$&'()*+,;=%-]{6,200}/g;
    while ((m = re2.exec(txt))) urls.push(m[0]);
  } else {
    let m; const re = /href\s*=\s*["'](https?:\/\/[^"']{6,300})["']/g;
    while ((m = re.exec(txt))) urls.push(m[1]);
  }
  const hs = new Set();
  for (let u of urls) {
    u = u.replace(/&amp;/g, "&").replace(/^\/\//, "https://").replace(/\\u002F/g, "/");
    try {
      const h = new URL(u).hostname.toLowerCase().replace(/^www[0-9]*\./, "");
      if (!h.includes(".")) continue;
      if (h === self || h.endsWith("." + self)) continue;
      if (JUNK.test(h)) continue;
      hs.add(h);
    } catch (e) {}
  }
  return hs;
}
const out = [];
for (const [name, url, mode, self] of ENGINES) {
  const rec = { engine: name, url, status: 0, hosts: 0, list: [], note: "" };
  try {
    const ctl = new AbortController();
    const tm = setTimeout(() => ctl.abort(), 18000);
    const res = await fetch(url, { headers: { "user-agent": UA, "accept": "*/*", "accept-language": "en-US,en;q=0.9,ja;q=0.8" }, signal: ctl.signal });
    clearTimeout(tm);
    rec.status = res.status;
    const body = await res.text();
    const hs = hostsFrom(body, mode, self);
    rec.hosts = hs.size; rec.list = [...hs].slice(0, 8);
  } catch (e) { rec.note = String(e.name === "AbortError" ? "TIMEOUT" : e.message).slice(0, 60); }
  const tag = rec.hosts >= 3 ? "USABLE" : rec.hosts > 0 ? "weak  " : "no    ";
  console.log(tag + " " + name.padEnd(14) + " status=" + rec.status + " hosts=" + rec.hosts + " " + rec.list.slice(0, 4).join(",") + (rec.note ? " " + rec.note : ""));
  out.push(rec);
}
const u = out.filter(r => r.hosts >= 3);
console.log("");
console.log("=== USABLE COUNT: " + u.length + " / " + out.length + " ===");
for (const x of u) console.log(x.engine + " -> " + JSON.stringify(x.list));
await writeFile("_engine_hunt3.json", JSON.stringify(out, null, 1));
