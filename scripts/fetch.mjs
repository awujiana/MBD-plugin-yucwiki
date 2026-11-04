#!/usr/bin/env node
/**
 * 重建本仓库的 data/ 目录。
 *
 *   node scripts/fetch.mjs                        # 用仓库内 data/source.json（种子）
 *   node scripts/fetch.mjs --source <url|path>   # 从上游拉 JSON 数组 / JSON Lines
 *   SOURCE_URL=... PERIOD=... node scripts/fetch.mjs
 *
 * 上游 URL 由仓库变量 SOURCE_URL 提供（未配置时用检入的种子数据，只重算哈希）。
 * 输出统一是 **纯文本 JSON Lines（不 gzip）**：宿主的 host.net.fetch 只返回文本，
 * 而 WPS 内嵌 CEF 不保证有 DecompressionStream，压缩了反而读不了。
 *
 * 更新频率：待定（workflow 目前只有 workflow_dispatch，没有 schedule）。
 */

import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataDirectory = join(repositoryRoot, 'data')
const period = process.env.PERIOD || '2026H2'
const pluginId = 'yucwiki-anime'
const displayName = '长门有C 番组数据'
const fields = [
  "序列号",
  "名称",
  "别名",
  "开播日期",
  "开播季度",
  "完播日",
  "制作公司",
  "集数",
  "时长/分钟",
  "制片国家",
  "语言",
  "类型",
  "导演",
  "音乐",
  "人物设定",
  "机械设定",
  "原作",
  "脚本",
  "系列构成",
  "在线播放平台",
  "Bangumi URL"
]

/** 上游字段 → MBD 标准表头 */
const FIELD_MAP = {
  "播放结束": "完播日",
  "动画制作公司": "制作公司",
  "话数": "集数",
  "片长": "时长/分钟",
  "制片国家": "制片国家",
  "语言": "语言",
  "类型": "类型",
  "导演": "导演",
  "音乐": "音乐",
  "人物设定": "人物设定",
  "机械设定": "机械设定",
  "原作": "原作",
  "脚本": "脚本",
  "系列构成": "系列构成",
  "在线播放平台": "在线播放平台"
}

function quarterOf(date) {
  if (!/^\d{4}-\d{2}/u.test(date)) return ''
  return `${date.slice(0, 4)}Q${String(Math.floor((Number(date.slice(5, 7)) - 1) / 3) + 1)}`
}

function clean(value) {
  if (value === null || value === undefined || value === false) return null
  if (Array.isArray(value)) {
    const joined = value.filter((item) => item !== null && item !== '').join('、')
    return joined === '' ? null : joined
  }
  if (typeof value === 'number') return value
  const text = String(value).trim()
  return text === '' ? null : text
}

function normalize(raw, index) {
  const date = String(raw.date || '')
  const values = {
    序列号: index,
    名称: clean(raw.name),
    别名: clean(raw.name_original),
    开播日期: clean(date),
    开播季度: quarterOf(date),
    标签分级: clean(raw.meta_tags),
    'Bangumi URL': `https://bgm.tv/subject/${String(raw.sid)}`,
  }
  for (const [sourceKey, standardKey] of Object.entries(FIELD_MAP)) {
    values[standardKey] = clean(raw[sourceKey])
  }
  // 标签/分级 是标准表头，键名带斜杠，单独补上
  values['标签/分级'] = values['标签分级']
  const record = {}
  for (const field of fields) {
    const value = values[field]
    if (value !== null && value !== undefined) record[field] = value
  }
  return record
}

function parseRows(text) {
  const trimmed = text.trim()
  if (trimmed === '') throw new Error('上游返回空内容')
  if (trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed)
    if (!Array.isArray(parsed)) throw new Error('上游 JSON 不是数组')
    return parsed
  }
  return trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .map((line) => JSON.parse(line))
}

async function readSource() {
  const optionIndex = process.argv.indexOf('--source')
  const source = (optionIndex === -1 ? undefined : process.argv[optionIndex + 1]) || process.env.SOURCE_URL
  if (source === undefined || source === '') {
    return { rows: parseRows(readFileSync(join(dataDirectory, 'source.json'), 'utf8')), label: '仓库内种子 data/source.json' }
  }
  if (/^https?:\/\//u.test(source)) {
    const response = await fetch(source, { cache: 'no-store' })
    if (!response.ok) throw new Error(`上游返回 HTTP ${String(response.status)}`)
    return { rows: parseRows(await response.text()), label: source }
  }
  return { rows: parseRows(readFileSync(source, 'utf8')), label: source }
}

async function main() {
  const { rows, label } = await readSource()
  const records = rows
    .map((row, index) => normalize(row, index + 1))
    .filter((record) => record['名称'] !== undefined && record['Bangumi URL'] !== undefined)
  if (records.length === 0) throw new Error('归一化后没有有效记录（缺 名称 / Bangumi URL）')

  const fileName = `${period}.base.jsonlines`
  const body = `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
  const bytes = Buffer.from(body, 'utf8')
  writeFileSync(join(dataDirectory, fileName), bytes)

  const updatedAt = new Date().toISOString().slice(0, 10)
  const shardHash = createHash('sha256').update(bytes).digest('hex')
  // 数据快照版本 = 期号 + 更新日期 + 分片内容哈希短码：同一天重跑但内容变了，版本也必须变
  const dataVersion = `${period}-${updatedAt}-${shardHash.slice(0, 8)}`

  const manifest = {
    formatVersion: 1,
    pluginId,
    displayName,
    period,
    dataVersion,
    updatedAt,
    recordCount: records.length,
    source: label,
    encoding: 'utf-8',
    compression: 'none',
    mergeKey: 'Bangumi URL',
    shards: [
      {
        name: 'base',
        file: fileName,
        fields,
        bytes: bytes.length,
        sha256: shardHash,
        recordCount: records.length,
      },
    ],
  }
  writeFileSync(join(dataDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  // 市场页展示的「数据源版本」取自 plugin.json，必须与数据清单同源，否则装前装后看到的版本对不上。
  // dataSourceVersion 是展示字段、不进签名载荷，所以这里改它不需要重签（见宿主 PLUGIN-SPEC.md §7.1）。
  const pluginManifestPath = join(repositoryRoot, 'plugin.json')
  const pluginManifest = JSON.parse(readFileSync(pluginManifestPath, 'utf8'))
  if (pluginManifest.dataSourceVersion !== dataVersion) {
    const next = {}
    for (const [key, value] of Object.entries(pluginManifest)) {
      if (key === 'dataSourceVersion') continue
      next[key] = value
      // 紧跟 minHostVersion，让三项版本信息在 plugin.json 里挨在一起
      if (key === 'minHostVersion') next.dataSourceVersion = dataVersion
    }
    writeFileSync(pluginManifestPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
    console.log(`  plugin.json dataSourceVersion → ${dataVersion}（展示字段，不参与签名）`)
  }

  console.log(`✔ ${displayName}：${String(records.length)} 条 / ${fileName} / ${String(bytes.length)} 字节`)
  console.log(`  数据来源：${label}`)
  console.log(`  数据源版本：${dataVersion}`)
}

await main()
