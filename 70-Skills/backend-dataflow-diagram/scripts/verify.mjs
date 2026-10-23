#!/usr/bin/env node
/**
 * backend-dataflow-diagram · 事实校验器（多语言）
 *
 * 把规格里每条「文件 / 方法 / 行号 / 表名 / 数据源」拿回仓库核对，
 * 逐条判定命中与否，给出总命中率；未命中退出码 1。
 *
 * 支持语言：java kt xml js mjs cjs ts tsx jsx vue py go cs php rb sql yml yaml properties gradle json
 *
 * 用法: node verify.mjs <spec.json> <仓库根目录> [--json]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname, resolve, basename } from 'node:path'

const TEXT_EXT = new Set(['.java','.kt','.xml','.js','.mjs','.cjs','.ts','.tsx','.jsx','.vue','.py','.go','.cs','.php','.rb','.sql','.yml','.yaml','.properties','.gradle','.json'])
const SKIP_DIR = new Set(['node_modules','.git','target','dist','.idea','.gradle','build','.next','venv','__pycache__','.venv'])

const args = process.argv.slice(2)
if (args.length < 2) { console.error('用法: node verify.mjs <spec.json> <仓库根目录> [--json]'); process.exit(2) }
const specPath = resolve(args[0])
const repoRoot = resolve(args[1])
const asJson = args.includes('--json')
const spec = JSON.parse(readFileSync(specPath, 'utf8'))

const fileIndex = new Map()
const dirIndex = new Set()
const textBlob = []
let scanned = 0

function walk(dir) {
  let entries
  try { entries = readdirSync(dir) } catch { return }
  for (const name of entries) {
    if (SKIP_DIR.has(name)) continue
    const p = join(dir, name)
    let st
    try { st = statSync(p) } catch { continue }
    if (st.isDirectory()) { dirIndex.add(name); walk(p); continue }
    if (!fileIndex.has(name)) fileIndex.set(name, [])
    fileIndex.get(name).push(p)
    const ext = extname(name)
    if (TEXT_EXT.has(ext) && st.size < 900 * 1024) {
      try {
        const txt = readFileSync(p, 'utf8')
        if (ext === '.xml' || ext === '.sql' || ext === '.java' || ext === '.py' || ext === '.go') textBlob.push(txt)
        scanned++
      } catch {}
    }
  }
}
walk(repoRoot)
const blob = textBlob.join('\n')

const COLS6 = ['req','gw','svc','mod','file','method','ds','table']
const refs = []
for (const chain of spec.chains || []) {
  let steps = chain.steps || []
  if (!steps.length && chain.rows) {
    steps = []
    for (const row of chain.rows) for (const col of COLS6) {
      const cell = row[col]
      if (!cell) continue
      for (const s of (Array.isArray(cell) ? cell : [cell])) steps.push(Object.assign({ col }, s))
    }
  }
  for (const s of steps) {
    const base = { chain: chain.no, cn: s.cn, status: s.status || 'real' }
    const col = s.col
    if (col === 'table' || s.table) { if (s.table) refs.push({ ...base, kind: 'table', value: s.table }); continue }
    if (col === 'ds') { if (s.code) refs.push({ ...base, kind: 'ds', value: String(s.code).split(/[→\/]/)[0].trim().split(' ')[0] }); continue }
    if (col === 'svc' || col === 'mod') {
      if (s.code && (s.status || 'real') !== 'ext') refs.push({ ...base, kind: 'dir', value: String(s.code).split(' ')[0] })
      continue
    }
    if (s.file) refs.push({ ...base, kind: 'file', value: s.file })
    if (s.method) refs.push({ ...base, kind: 'method', value: s.method, file: s.file, line: s.line })
  }
}

const results = []
const skipped = []
for (const r of refs) {
  if (r.status === 'proto' || r.status === 'gap') { skipped.push(r); continue }
  let ok = false, note = ''
  if (r.kind === 'dir') {
    const segs = r.value.split(/[\\/]/).filter(Boolean)
    ok = segs.every((x) => dirIndex.has(x))
    note = ok ? '模块目录存在' : '缺目录 ' + segs.filter((x) => !dirIndex.has(x)).join(',')
  } else if (r.kind === 'ds') {
    ok = blob.includes(r.value)
    note = ok ? '配置中出现' : '配置中未找到'
  } else if (r.kind === 'file') {
    const paths = fileIndex.get(basename(r.value)) || []
    ok = paths.length > 0
    note = ok ? paths[0].replace(repoRoot, '').replace(/\\/g, '/') : '仓库内无同名文件'
  } else if (r.kind === 'table') {
    ok = blob.toLowerCase().includes(String(r.value).toLowerCase())
    note = ok ? 'mapper / entity / sql 中有该表' : '未在任何 mapper / entity / sql 中出现'
  } else if (r.kind === 'method') {
    const paths = fileIndex.get(basename(r.file || '')) || []
    if (!paths.length) { ok = false; note = '所属文件不存在' }
    else {
      let hitPath = null, hitLine = null
      const escaped = r.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const declRe = new RegExp(
        '(function|def|func|fn|async|public|private|protected|static|final|default|abstract|synchronized|sub)'
        + '\\s+(?:[A-Za-z_<>,\\[\\]?]+\\s+)?' + escaped + '\\s*\\('
      )
      for (const pass of [0, 1]) {
        for (const p of paths) {
          const lines = readFileSync(p, 'utf8').split(/\r?\n/)
          const idx = lines.findIndex((l) => {
            const s = l.trim()
            if (s.startsWith('//') || s.startsWith('*') || s.startsWith('/*') || s.startsWith('#')) return false
            if (pass === 0) return declRe.test(s)
            return s.includes(r.value + '(') || s.includes('"' + r.value + '"') || s.includes('/' + r.value)
          })
          if (idx >= 0) { hitPath = p; hitLine = idx + 1; break }
        }
        if (hitPath) break
      }
      ok = !!hitPath
      if (ok) {
        note = hitPath.replace(repoRoot, '').replace(/\\/g, '/') + '#L' + hitLine
        if (r.line && Math.abs(hitLine - r.line) > 8) note += ' · 行号漂移 ' + (hitLine - r.line)
      } else note = '文件内找不到该方法'
    }
  }
  results.push({ ...r, ok, note })
}

const total = results.length
const passed = results.filter((r) => r.ok).length
const failed = results.filter((r) => !r.ok)
const rate = total ? (passed / total * 100) : 100

if (asJson) {
  console.log(JSON.stringify({ total, passed, failed: failed.length, rate: +rate.toFixed(1), scanned, results }, null, 2))
} else {
  console.log('事实校验 · ' + basename(specPath))
  console.log('  扫描文件 ' + scanned + ' 个（仓库 ' + repoRoot + '）')
  console.log('  引用 ' + total + ' 条：命中 ' + passed + ' / 未命中 ' + failed.length + ' · 命中率 ' + rate.toFixed(1) + '%')
  if (skipped.length) console.log('  另有 ' + skipped.length + ' 条属于「原型 mock / 代码缺口」，不计入命中率')
  if (failed.length) {
    console.log('')
    console.log('  未命中明细：')
    for (const r of failed) console.log('   x [' + r.chain + '] ' + r.cn + ' · ' + r.kind + ' ' + r.value + ' —— ' + r.note)
  }
  const drift = results.filter((r) => r.ok && r.note.includes('行号漂移'))
  if (drift.length) {
    console.log('')
    console.log('  行号漂移（不算失败，建议修正）：')
    for (const r of drift) console.log('   ~ ' + r.cn + ' · ' + r.value + ' -> ' + r.note)
  }
  const gaps = []
  for (const chain of spec.chains || []) {
    const ss = (chain.steps && chain.steps.length) ? chain.steps
      : (chain.rows || []).flatMap((row) => COLS6.flatMap((col) => { const c = row[col]; return c ? (Array.isArray(c) ? c.map(x => Object.assign({ col }, x)) : [Object.assign({ col }, c)]) : [] }))
    for (const s of ss) if (s.status === 'gap') gaps.push(chain.no + ' · ' + s.cn)
  }
  if (gaps.length) {
    console.log('')
    console.log('  图上标记为缺口 ' + gaps.length + ' 处（不参与命中率）：')
    for (const g of gaps) console.log('   ! ' + g)
  }
}
process.exit(failed.length ? 1 : 0)