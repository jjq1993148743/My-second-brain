#!/usr/bin/env node
/**
 * 每日接单雷达 (job-radar)
 * 抓取 Freelancer RSS + We Work Remotely RSS，按预算区间和技能关键词筛选
 * 输出：第二大脑 40-产出/情报/接单雷达/YYYY-MM-DD.md
 *
 * 用法：
 *   node job-radar.mjs                默认 $20-100
 *   node job-radar.mjs --min 20 --max 100
 *   node job-radar.mjs --all          不限预算
 */

import { execFile } from "node:child_process";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const PROXY = process.env.DSH_PROXY || "http://127.0.0.1:7897";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const OUT_ROOT = "D:\\GitHub\\My-second-brain\\40-产出\\情报\\接单雷达";

const args = process.argv.slice(2);
const getArg = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const MIN = parseFloat(getArg("min", "20"));
const MAX = parseFloat(getArg("max", "100"));
const ALL = args.includes("--all");

const SKILL_HIGH = ["javascript","typescript","node","nodejs","react","vue","next.js","nextjs","svelte","python","django","flask","fastapi","golang","rust","java","spring","kotlin","php","laravel","ruby","rails","c#",".net","dotnet","c++","api","rest","graphql","backend","frontend","full stack","fullstack","full-stack","database","sql","postgres","postgresql","mysql","mongodb","redis","docker","kubernetes","aws","gcp","azure","devops","ci/cd","wordpress","shopify","webflow","magento","woocommerce","automation","scraper","scraping","crawler","bot","chatbot","ai","llm","gpt","openai","langchain","rag","prompt","browser extension","chrome extension","electron","tauri","flutter","react native","android","ios","swift"];
const SKILL_EXCLUDE = ["data entry","typing","copy paste","manual","transcription","virtual assistant","lead generation","cold call","telemarketing","seo writing","blog writing","article writing","content writing","logo design","graphic design","photoshop","illustrator","video editing","voice over","translation"];

function run(cmd, a) {
  return new Promise((res, rej) => {
    execFile(cmd, a, { maxBuffer: 64 * 1024 * 1024, windowsHide: true, timeout: 60000 }, (e, so) => {
      if (e && !so) rej(e); else res(so || "");
    });
  });
}

const clean = (s) => (s || "")
  .replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
  .replace(/&quot;/g, String.fromCharCode(34)).replace(/&#39;/g, String.fromCharCode(39)).replace(/&nbsp;/g, " ")
  .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

async function fetchRss(url) {
  const raw = await run("curl", ["-sL", "-x", PROXY, "-H", "User-Agent: " + UA, "--max-time", "40", "--compressed", url]);
  if (!raw || raw.length < 500) throw new Error("RSS 抓取失败或过短: " + (raw || "").length);
  return raw;
}

function parseFreelancer(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const b = m[1];
    const title = clean((b.match(/<title>([\s\S]*?)<\/title>/) || [])[1]);
    const link = ((b.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || "").trim();
    const desc = clean((b.match(/<description>([\s\S]*?)<\/description>/) || [])[1]);
    const date = ((b.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || "").trim();
    const bm = desc.match(/Budget:\s*([A-Z]{0,3}\$?\s*[\d,.]+\s*-\s*[A-Z]{0,3}\$?\s*[\d,.]+\s*[A-Z]{0,3})/i);
    const budgetRaw = bm ? bm[1] : "";
    const jm = desc.match(/Jobs:\s*([^)]+)\)/i);
    const skills = jm ? jm[1].split(",").map(s => s.trim()).filter(Boolean) : [];
    let lo = null, hi = null, cur = "USD";
    if (budgetRaw) {
      const nums = budgetRaw.replace(/[^\d.,-]/g, "").split("-").map(x => parseFloat(x.replace(/,/g, "")));
      if (nums.length >= 2 && !isNaN(nums[0]) && !isNaN(nums[1])) { lo = nums[0]; hi = nums[1]; }
      if (/INR|₹/i.test(budgetRaw)) cur = "INR";
      else if (/AUD/i.test(budgetRaw)) cur = "AUD";
      else if (/EUR|€/i.test(budgetRaw)) cur = "EUR";
      else if (/GBP|£/i.test(budgetRaw)) cur = "GBP";
    }
    items.push({ source: "Freelancer", title, link, desc, date, budgetRaw, lo, hi, cur, skills });
  }
  return items;
}

function parseWwr(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const b = m[1];
    const title = clean((b.match(/<title>([\s\S]*?)<\/title>/) || [])[1]);
    const link = ((b.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || "").trim();
    const region = clean((b.match(/<region>([\s\S]*?)<\/region>/) || [])[1]);
    const cat = clean((b.match(/<category>([\s\S]*?)<\/category>/) || [])[1]);
    const desc = clean((b.match(/<description>([\s\S]*?)<\/description>/) || [])[1]).slice(0, 400);
    items.push({ source: "WWR", title, link, desc, region, cat, budgetRaw: "(职位，无预算)", lo: null, hi: null, cur: "-", skills: cat ? [cat] : [] });
  }
  return items;
}

function matchSkill(item) {
  const hay = (item.title + " " + item.desc + " " + item.skills.join(" ")).toLowerCase();
  const hit = SKILL_HIGH.filter(k => hay.includes(k));
  const bad = SKILL_EXCLUDE.filter(k => hay.includes(k));
  return { hit, bad, ok: hit.length > 0 && bad.length === 0 };
}

function inBudget(item) {
  if (ALL) return true;
  if (item.lo === null) return item.source === "WWR";
  let lo = item.lo, hi = item.hi;
  if (item.cur === "INR") { lo /= 83; hi /= 83; }
  else if (item.cur === "AUD") { lo *= 0.65; hi *= 0.65; }
  else if (item.cur === "EUR") { lo *= 1.08; hi *= 1.08; }
  else if (item.cur === "GBP") { lo *= 1.27; hi *= 1.27; }
  item.usdLo = Math.round(lo); item.usdHi = Math.round(hi);
  return hi >= MIN && lo <= MAX;
}

async function main() {
  console.log("=== 每日接单雷达 ===");
  const now = new Date();
  const bj = new Date(now.getTime() + (8 * 60 + now.getTimezoneOffset()) * 60000);
  const dateStr = bj.toISOString().slice(0, 10);
  console.log("日期: " + dateStr + "  预算: " + (ALL ? "不限" : "$" + MIN + " - $" + MAX));

  let all = [];
  const errs = [];

  try {
    console.log("");
    console.log("[1/2] Freelancer RSS...");
    const fx = await fetchRss("https://www.freelancer.com/rss.xml");
    const fi = parseFreelancer(fx);
    console.log("  OK 抓到 " + fi.length + " 条项目");
    all = all.concat(fi);
  } catch (e) {
    console.log("  FAIL " + String(e).slice(0, 80));
    errs.push("Freelancer: " + String(e).slice(0, 80));
  }

  try {
    console.log("[2/2] We Work Remotely RSS...");
    const wx = await fetchRss("https://weworkremotely.com/categories/remote-programming-jobs.rss");
    const wi = parseWwr(wx);
    console.log("  OK 抓到 " + wi.length + " 条职位");
    all = all.concat(wi);
  } catch (e) {
    console.log("  FAIL " + String(e).slice(0, 80));
    errs.push("WWR: " + String(e).slice(0, 80));
  }

  const passed = all.filter(it => {
    const s = matchSkill(it);
    it.skillHit = s.hit;
    return s.ok && inBudget(it);
  });

  console.log("");
  console.log("=== 筛选结果 ===");
  console.log("总条目 " + all.length + " -> 通过 " + passed.length);

  passed.sort((a, b) => {
    const ka = a.skillHit.length * 1000 + (a.usdHi || 0);
    const kb = b.skillHit.length * 1000 + (b.usdHi || 0);
    return kb - ka;
  });

  const O = [];
  O.push("---");
  O.push("date: " + dateStr);
  O.push("tags: [工作, 搞钱, 接单雷达, 自动生成]");
  O.push("---");
  O.push("");
  O.push("# 接单雷达 · " + dateStr);
  O.push("");
  O.push("> 自动抓取 Freelancer + We Work Remotely，按技能和预算筛选。");
  O.push("> 预算区间：**" + (ALL ? "不限" : "$" + MIN + " - $" + MAX) + "**（INR/AUD/EUR/GBP 已换算 USD）");
  O.push("");
  O.push("| 项 | 数值 |");
  O.push("|---|---|");
  O.push("| 总抓取 | " + all.length + " 条 |");
  O.push("| **通过筛选** | **" + passed.length + " 条** |");
  O.push("| 抓取失败 | " + (errs.length ? errs.join("；") : "无") + " |");
  O.push("");

  if (passed.length === 0) {
    O.push("## 今天没有符合条件的项目");
    O.push("");
    O.push("可能原因：今天新项目少 / 预算不在区间 / 技能不匹配。");
    O.push("");
    O.push("放宽试试：`node job-radar.mjs --all`");
  } else {
    O.push("## 值得看的项目（" + passed.length + " 个）");
    O.push("");
    passed.forEach((it, i) => {
      O.push("### " + (i + 1) + ". " + it.title);
      O.push("");
      O.push("| 项 | 内容 |");
      O.push("|---|---|");
      O.push("| 来源 | " + it.source + (it.region ? " · " + it.region : "") + " |");
      O.push("| 原始预算 | " + (it.budgetRaw || "-") + " |");
      if (it.usdLo) O.push("| 约合 USD | **$" + it.usdLo + " - $" + it.usdHi + "** |");
      O.push("| 技能命中 | " + it.skillHit.slice(0, 6).join(", ") + " |");
      if (it.skills.length) O.push("| 客户标签 | " + it.skills.slice(0, 8).join(", ") + " |");
      O.push("| 链接 | " + it.link + " |");
      O.push("");
      if (it.desc) {
        O.push("> " + it.desc.slice(0, 300) + (it.desc.length > 300 ? "…" : ""));
        O.push("");
      }
    });
  }

  O.push("---");
  O.push("");
  O.push("## 被过滤掉的（前 10，供参考）");
  O.push("");
  const rejected = all.filter(it => passed.indexOf(it) < 0).slice(0, 10);
  if (rejected.length === 0) O.push("（无）");
  else {
    O.push("| 项目 | 预算 | 原因 |");
    O.push("|---|---|---|");
    rejected.forEach(it => {
      const s = matchSkill(it);
      const reason = s.bad.length ? "排除词:" + s.bad[0] : (s.hit.length === 0 ? "技能不匹配" : "预算不符");
      O.push("| " + it.title.slice(0, 40) + " | " + (it.budgetRaw || "-") + " | " + reason + " |");
    });
  }
  O.push("");
  O.push("---");
  O.push("");
  O.push("> 由 job-radar.mjs 自动生成 · " + bj.toISOString().replace("T", " ").slice(0, 19) + " (UTC+8)");

  await mkdir(OUT_ROOT, { recursive: true });
  const outFile = join(OUT_ROOT, dateStr + ".md");
  await writeFile(outFile, O.join(String.fromCharCode(10)), "utf8");
  console.log("");
  console.log("已写入: " + outFile);
  console.log("=== 完成 ===");
}

main().catch(e => { console.error("致命错误: " + e.message); process.exit(1); });