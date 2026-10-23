#!/usr/bin/env node
/**
 * backend-dataflow-diagram · 渲染器 v5（行对齐矩阵 + 步骤连线）
 *
 * 六列 = 微服务|项目/模块|文件|方法|数据库|数据库表；一行 = 请求经过的一个服务段
 * （A 服务行的右侧就是 A 的模块/类/方法）。步骤 1→N 由浏览器端脚本
 * （assets/wires.js）实测坐标后用带箭头正交折线连出：同格竖线、同行横线、
 * 跨行走行间通道，不穿卡片；悬停卡片高亮其入/出线。
 *
 * 用法：node render.mjs <spec.json> <out.html> [diagram.css]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ASSETS = join(__dirname, '..', 'assets')

const COLS = [
  { id: 'req',    name: '请求侧',      hint: 'Web / 移动端 / 商户系统', bg: '#eef1f6' },
  { id: 'gw',     name: '网关',        hint: 'gateway-service', bg: '#e9e4fb' },
  { id: 'svc',    name: '微服务',      hint: '哪段在哪个进程', bg: '#e8f0fe' },
  { id: 'mod',    name: '项目 / 模块', hint: 'maven / 前端包', bg: '#e0f4f6' },
  { id: 'file',   name: '文件',        hint: '类 / mapper / 配置', bg: '#e2f5f0' },
  { id: 'method', name: '方法',        hint: '方法:行号', bg: '#f3e8ff' },
  { id: 'ds',     name: '数据库',      hint: '数据源 / 库名', bg: '#fdf2e3' },
  { id: 'table',  name: '数据库表',    hint: '表 / 键 / topic', bg: '#fcecef' },
]
const STATUS_TAG = { proto: '原型', gap: '缺口', ext: '外部' }
const DCOLOR = { req: '#475569', gw: '#6d28d9', svc: '#2563eb', mod: '#0891b2', file: '#0d9488', method: '#7c3aed', ds: '#b45309', table: '#be123c' }

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function chipHtml(step) {
  const status = step.status || 'real'
  const color = step.color || DCOLOR[step.col] || '#2563eb'
  const code = step.code || step.file || step.method || step.table || step.ds || ''
  const codeTxt = code + (step.line ? ':' + step.line : '')
  const tip = [step.cn, codeTxt, step.sub, status !== 'real' ? '【' + (STATUS_TAG[status] || status) + '】' : ''].filter(Boolean).join(' · ')
  const o = []
  o.push('<div class="chip" id="s' + esc(step.no) + '" data-status="' + esc(status) + '"'
    + ' data-row="' + esc(step.row) + '" data-col="' + esc(step.col) + '" data-stack="' + esc(step.stack) + '"'
    + ' style="--c:' + esc(color) + '" data-tip="' + esc(tip) + '" title="' + esc(tip) + '">')
  // 第一行：状态标签（例外才有）+ 序号，行内排布，既不压标题也不靠 padding 硬挤
  o.push('<span class="crow"><span class="cx' + (status === 'real' ? ' hide' : '') + '">'
    + esc(STATUS_TAG[status] || '') + '</span><span class="cno">' + esc(step.no) + '</span></span>')
  o.push('<span class="cn">' + esc(step.cn) + '</span>')
  if (codeTxt) o.push('<span class="cc">' + esc(codeTxt) + '</span>')
  if (step.sub) o.push('<span class="cd">' + esc(step.sub) + '</span>')
  o.push('</div>')
  return o.join('')
}

function cellHtml(cell) {
  const list = Array.isArray(cell) ? cell : (cell ? [cell] : [])
  if (!list.length) return '<div class="cell"><div class="none">·</div></div>'
  return '<div class="cell">' + list.map(chipHtml).join('') + '</div>'
}

function chainHtml(chain, idx) {
  const rows = chain.rows || []
  let n = 0
  const body = rows.map((row, rowIdx) => {
    const cells = COLS.map((c) => {
      const raw = row[c.id]
      const list = Array.isArray(raw) ? raw : (raw ? [raw] : [])
      list.forEach((s, k) => { s.col = c.id; s.stack = k; s.row = rowIdx; s.no = ++n })
      return cellHtml(raw)
    }).join('')
    return '<div class="trow">' + cells + '</div>'
  }).join('')
  const head = COLS.map((c) =>
    '<div class="th" style="--c:' + DCOLOR[c.id] + ';--cb:' + c.bg + '"><b>' + esc(c.name) + '</b><span>' + esc(c.hint) + '</span></div>').join('')
  return '<section class="chain" data-steps="' + n + '">'
    + '<div class="chead"><span class="cno-t">' + esc(chain.no || ('链路 ' + (idx + 1))) + '</span>'
    + '<span class="cname">' + esc(chain.name) + '</span>'
    + (chain.entry ? '<span class="centry">' + esc(chain.entry) + '</span>' : '')
    + (chain.biz ? '<div class="cbiz">' + esc(chain.biz) + '</div>' : '') + '</div>'
    + '<div class="scroll"><div class="canvas">'
    + '<div class="bands">' + COLS.map((c) => '<div class="band" style="background:' + c.bg + '"></div>').join('') + '</div>'
    + '<svg class="wires"></svg>'
    + '<div class="tgrid"><div class="trow head">' + head + '</div>' + body + '</div></div></div>'
    + '</section>'
}

function renderMain(spec, css, wiresJs) {
  const legend = (spec.legend || []).map((it) =>
    '<span class="lg ' + esc(it.kind || 'real') + '" style="--c:' + esc(it.color || '#2563eb') + '"><i></i>' + esc(it.text) + '</span>').join('')
  const glossary = (spec.glossary || []).length
    ? '<section class="panel"><h2>' + esc(spec.glossaryTitle || '业务名词对照') + '</h2>'
      + '<table class="tbl"><thead><tr><th style="width:15%">业务名词</th><th style="width:18%">代码 / 英文</th><th style="width:19%">位置</th><th>含义</th></tr></thead><tbody>'
      + spec.glossary.map((g) => '<tr><td class="term">' + esc(g.term) + '</td><td class="en">' + esc(g.en || '—') + '</td>'
        + '<td>' + (g.where ? '<code>' + esc(g.where) + '</code>' : '—') + '</td><td>' + esc(g.note || '') + '</td></tr>').join('')
      + '</tbody></table></section>' : ''
  const tag = { blocker: '阻断', warn: '注意', info: '提示' }
  const gaps = (spec.gaps || []).length
    ? '<section class="panel"><h2>' + esc(spec.gapsTitle || '代码缺口 / 说明') + '</h2>'
      + spec.gaps.map((g) => '<div class="gitem"><span class="gtag ' + esc(g.level || 'info') + '">' + esc(tag[g.level] || '提示') + '</span><div>' + g.text + '</div></div>').join('')
      + '</section>' : ''
  return '<!DOCTYPE html>\n<html lang="zh-CN">\n<head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(spec.title || '后端数据链路俯视图') + '</title>'
    + '<style>\n' + css + '\n</style></head>\n<body><div class="wrap">'
    + '<header class="page"><h1>' + esc(spec.title) + '</h1>'
    + (spec.subtitle ? '<div class="sub">' + esc(spec.subtitle) + '</div>' : '')
    + (spec.readHint ? '<div class="read">' + spec.readHint + '</div>' : '') + '</header>'
    + (legend ? '<div class="legend">' + legend + '</div>' : '')
    + (spec.chains || []).map(chainHtml).join('')
    + glossary + gaps
    + '<footer class="page">' + (spec.footer || '由 backend-dataflow-diagram 技能生成 · 文件 / 方法 / 行号均取自仓库真实代码 · 卡片悬停看完整内容') + '</footer>'
    + '</div><script>\n' + wiresJs + '\n</script></body></html>\n'
}

const [, , specPath, outPath, cssPath] = process.argv
if (!specPath || !outPath) { console.error('用法: node render.mjs <spec.json> <out.html> [diagram.css]'); process.exit(2) }
const spec = JSON.parse(readFileSync(resolve(specPath), 'utf8'))
const css = cssPath ? readFileSync(resolve(cssPath), 'utf8') : readFileSync(join(ASSETS, 'diagram.css'), 'utf8')
const wiresJs = readFileSync(join(ASSETS, 'wires.js'), 'utf8')
writeFileSync(resolve(outPath), renderMain(spec, css, wiresJs), 'utf8')
console.log('已生成 ' + outPath)
console.log('  链路 ' + (spec.chains || []).length + ' 条 · 行 ' + (spec.chains || []).reduce((a, c) => a + (c.rows || []).length, 0) + ' · 步骤连线贯通')