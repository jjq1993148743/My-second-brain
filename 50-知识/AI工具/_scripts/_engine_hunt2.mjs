import { writeFile } from "node:fs/promises";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const QUERY = process.argv[2] || "freelance platform";

const ENGINES = [
  ["yahoo-jp", "https://search.yahoo.co.jp/search?p=" + encodeURIComponent(QUERY), "html", "yahoo.co.jp"],
  ["yahoo-us", "https://search.yahoo.com/search?p=" + encodeURIComponent(QUERY), "html", "yahoo.com"],
  ["goo", "https://search.goo.ne.jp/web.jsp?MT=" + encodeURIComponent(QUERY), "html", "goo.ne.jp"],
  ["rakuten", "https://search.rakuten.co.jp/search/web/?qt=" + encodeURIComponent(QUERY), "html", "rakuten.co.jp"],
  ["biglobe", "https://cgi.biglobe.ne.jp/search?q=" + encodeURIComponent(QUERY), "html", "biglobe.ne.jp"],
  ["nifty", "https://search.nifty.com/websearch/search?q=" + encodeURIComponent(QUERY), "html", "nifty.com"],
  ["so-net", "https://www.so-net.ne.jp/search/web/?query=" + encodeURIComponent(QUERY), "html", "so-net.ne.jp"],
  ["mojeek", "https://www.mojeek.com/search?q=" + encodeURIComponent(QUERY), "html", "mojeek.com"],
  ["startpage", "https://www.startpage.com/sp/search?query=" + encodeURIComponent(QUERY), "html", "startpage.com"],
  ["stract", "https://stract.com/search?q=" + encodeURIComponent(QUERY), "html", "stract.com"],
  ["yep", "https://api.yep.com/fs/2/search?client=web&gl=US&limit=20&no_correct=false&q=" + encodeURIComponent(QUERY) + "&safeSearch=off&type=web", "json", "yep.com"],
  ["rightdao", "https://rightdao.com/search?query=" + encodeURIComponent(QUERY), "html", "rightdao.com"],
  ["teclis", "https://teclis.com/search?q=" + encodeURIComponent(QUERY), "html", "teclis.com"],
  ["marginalia", "https://search.marginalia.nu/search?query=" + encodeURIComponent(QUERY), "html", "marginalia.nu"],
  ["4get-ca", "https://4get.ca/api/v1/web?s=" + encodeURIComponent(QUERY), "json", "4get.ca"],
  ["4get-py", "https://4get.pylex.xyz/api/v1/web?s=" + encodeURIComponent(QUERY), "json", "pylex.xyz"],
  ["searx-be", "https://searx.be/search?q=" + encodeURIComponent(QUERY) + "&format=json", "json", "searx.be"],
  ["searx-priv", "https://priv.au/search?q=" + encodeURIComponent(QUERY) + "&format=json", "json", "priv.au"],
  ["searx-bnd", "https://baresearch.org/search?q=" + encodeURIComponent(QUERY) + "&format=json", "json", "baresearch.org"],
  ["searx-opnx", "https://opnxng.com/search?q=" + encodeURIComponent(QUERY) + "&format=json", "json", "opnxng.com"],
  ["github-api", "https://api.github.com/search/repositories?q=" + encodeURIComponent(QUERY) + "&per_page=20", "json", "github.com"],
  ["wikipedia", "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" + encodeURIComponent(QUERY) + "&format=json&srlimit=20", "json", "wikipedia.org"],
  ["gdelt", "https://api.gdeltproject.org/api/v2/doc/doc?query=" + encodeURIComponent(QUERY) + "&mode=artlist&format=json&maxrecords=20", "json", "gdeltproject.org"],
  ["openalex", "https://api.openalex.org/works?search=" + encodeURIComponent(QUERY) + "&per-page=20", "json", "openalex.org"],
  ["crossref", "https://api.crossref.org/works?query=" + encodeURIComponent(QUERY) + "&rows=20", "json", "crossref.org"],
  ["europepmc", "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=" + encodeURIComponent(QUERY) + "&format=json&pageSize=20", "json", "ebi.ac.uk"],
  ["archive-org", "https://archive.org/advancedsearch.php?q=" + encodeURIComponent(QUERY) + "&fl[]=identifier&rows=20&output=json", "json", "archive.org"],
  ["grep-app", "https://grep.app/api/search?q=" + encodeURIComponent(QUERY), "json", "grep.app"],
  ["searchcode", "https://searchcode.com/api/codesearch_I/?q=" + encodeURIComponent(QUERY), "json", "searchcode.com"],
  ["stackexchange", "https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=" + encodeURIComponent(QUERY) + "&site=stackoverflow&pagesize=20", "json", "stackexchange.com"],
  ["reddit", "https://www.reddit.com/search.json?q=" + encodeURIComponent(QUERY) + "&limit=25", "json", "reddit.com"],
  ["lobsters", "https://lobste.rs/search.json?q=" + encodeURIComponent(QUERY), "json", "lobste.rs"],
  ["npm", "https://registry.npmjs.org/-/v1/search?text=" + encodeURIComponent(QUERY) + "&size=20", "json", "npmjs.org"],
  ["packagist", "https://packagist.org/search.json?q=" + encodeURIComponent(QUERY) + "&per_page=20", "json", "packagist.org"]
];

const JUNK = /(pstatic\.net|flocdn\.com|gstatic\.com|googleusercontent\.com|yimg\.com|bing\.com|microsoft\.com|msn\.com|doubleclick|schema\.org|w3\.org|apple\.com|googletagmanager|cdn\.|static\.|assets\.)/i;

function hostsFrom(html, json, mode, selfDomain) {
  const urls = [];
  if (mode === "json") {
    const re = /"(?:url|link|href|identifier|doi|id)"\s*:\s*"([^"]{8,300})"/g;
    let m;
    while ((m = re.exec(json))) urls.push(m[1].replace(/\\u002F/g, "/").replace(/\\\//g, "/"));
    const re2 = /https?:\/\/[A-Za-z0-9._~:\/?#\[\]@!$&'()*+,;=%-]{6,200}/g;
    while ((m = re2.exec(json))) urls.push(m[0]);
  } else {
    const re = /href\s*=\s*["'](https?:\/\/[^"']{6,300})["']/g;
    let m;
    while ((m = re.exec(html))) urls.push(m[1]);
  }
  const hosts = new Set();
  for (let u of urls) {
    u = u.replace(/&amp;/g, "&").replace(/^\/\//, "https://");
    try {
      const h = new URL(u).hostname.toLowerCase().replace(/^www[0-9]*\./, "");
      if (!h.includes(".")) continue;
      if (h === selfDomain || h.endsWith("." + selfDomain)) continue;
      if (JUNK.test(h)) continue;
      hosts.add(h);
    } catch (e) {}
  }
  return hosts;
}

const out = [];
for (const [name, url, mode, self] of ENGINES) {
  const rec = { engine: name, url, status: 0, links: 0, hosts: 0, list: [], note: "" };
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 18000);
    const res = await fetch(url, { headers: { "user-agent": UA, "accept": "*/*", "accept-language": "en-US,en;q=0.9,ja;q=0.8" }, signal: ctl.signal, redirect: "follow" });
    clearTimeout(timer);
    rec.status = res.status;
    const body = await res.text();
    const hs = hostsFrom(body, body, mode, self);
    rec.hosts = hs.size;
    rec.list = [...hs].slice(0, 8);
  } catch (e) {
    rec.note = String(e.name === "AbortError" ? "TIMEOUT" : e.message).slice(0, 80);
  }
  const tag = rec.hosts >= 3 ? "USABLE" : rec.hosts > 0 ? "weak  " : "no    ";
  console.log(tag + " " + name.padEnd(14) + " status=" + rec.status + " hosts=" + rec.hosts + " " + rec.list.slice(0, 5).join(",") + (rec.note ? " " + rec.note : ""));
  out.push(rec);
}
const usable = out.filter(r => r.hosts >= 3);
console.log("");
console.log("=== USABLE COUNT: " + usable.length + " / " + out.length + " ===");
for (const u of usable) console.log(u.engine + " -> " + JSON.stringify(u.list));
await writeFile("_engine_hunt2.json", JSON.stringify(out, null, 1));
