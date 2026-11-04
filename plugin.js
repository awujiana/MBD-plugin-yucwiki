/**
 * 长门有C 番组数据 · MBD 插件（单文件 ESM，无外部依赖）
 *
 * 宿主注入 context.host；未授权的能力根本不存在，所以一律先 typeof 检查再降级。
 * 数据源是本仓库的 data/ 目录（raw.githubusercontent.com 匿名可读）。
 * 规范见宿主仓库 PLUGIN-SPEC.md。
 */

const REPOSITORY = 'awujiana/MBD-plugin-yucwiki'
const DATA_BASE = 'https://raw.githubusercontent.com/' + REPOSITORY + '/main/data/'
const SHEET_PREFIX = '长门有C 新番'
const MERGE_KEY = 'Bangumi URL'
const KEY_LAST_SHEET = 'lastSheet'
const KEY_LAST_PERIOD = 'lastPeriod'

function describeError(error) {
  return error instanceof Error ? error.message : String(error)
}

/** 读数据源清单，拿到期号与分片列表 */
async function readDataManifest(host) {
  const manifest = await host.net.fetchJson(DATA_BASE + 'manifest.json')
  if (manifest === null || !Array.isArray(manifest.shards) || manifest.shards.length === 0) {
    throw new Error('数据源清单格式不对（缺 shards）')
  }
  return manifest
}

/** 逐片下载 JSON Lines（纯文本，宿主 API 没有 gzip 解压能力） */
async function readRecords(host, manifest) {
  const records = []
  for (const shard of manifest.shards) {
    const response = await host.net.fetch(DATA_BASE + shard.file)
    if (response.status !== 200) {
      throw new Error('下载 ' + shard.file + ' 失败：HTTP ' + String(response.status))
    }
    for (const line of response.body.split('\n')) {
      const trimmed = line.trim()
      if (trimmed !== '') records.push(JSON.parse(trimmed))
    }
  }
  return records
}

/** 目标工作表不存在就新建（需要 sheet.write 权限） */
function ensureSheet(host, sheetName) {
  if (!host.sheet || typeof host.sheet.list !== 'function' || typeof host.sheet.add !== 'function') {
    throw new Error('缺少 sheet.write 权限，无法新建工作表')
  }
  if (host.sheet.list().indexOf(sheetName) === -1) {
    if (host.sheet.add(sheetName) !== true) {
      throw new Error('新建工作表失败：' + sheetName)
    }
  }
  return sheetName
}

/** 功能①：从 GitHub 数据源拉取本期数据，生成一张新工作表 */
async function downloadPeriod(context) {
  const host = context.host
  if (!host.net || typeof host.net.fetchJson !== 'function') {
    throw new Error('缺少 net.fetch 权限')
  }
  if (!host.data || typeof host.data.write !== 'function') {
    throw new Error('缺少 data.write 权限')
  }
  const manifest = await readDataManifest(host)
  const records = await readRecords(host, manifest)
  if (records.length === 0) throw new Error('本期数据为空')
  const sheetName = SHEET_PREFIX + ' ' + String(manifest.period)
  ensureSheet(host, sheetName)
  if (host.data.write(records, { mode: 'replace', sheetName: sheetName }) !== true) {
    throw new Error('写入工作表失败：' + sheetName)
  }
  await context.storage.set(KEY_LAST_SHEET, sheetName)
  await context.storage.set(KEY_LAST_PERIOD, String(manifest.period))
  context.log.info('下载完成：' + String(records.length) + ' 条 / ' + sheetName)
  host.ui.toast('已下载 ' + String(records.length) + ' 条到「' + sheetName + '」', 'info')
}

/** 功能②：把刚下载的那张表合并进当前番组数据库 */
async function mergeIntoDatabase(context) {
  const host = context.host
  const sheetName = await context.storage.get(KEY_LAST_SHEET)
  if (typeof sheetName !== 'string' || sheetName === '') {
    throw new Error('请先点「下载本期数据」')
  }
  if (!host.data || typeof host.data.read !== 'function' || typeof host.data.write !== 'function') {
    throw new Error('缺少 data.read / data.write 权限')
  }
  if (!host.sheet || typeof host.sheet.active !== 'function') {
    throw new Error('缺少 sheet.read 权限')
  }
  const records = host.data.read({ sheetName: sheetName })
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error('「' + sheetName + '」里没有可整理的记录')
  }
  const target = host.sheet.active()
  if (target === '') throw new Error('找不到当前活动工作表')
  if (typeof host.ui.confirm === 'function') {
    const allowed = await host.ui.confirm(
      '把 ' + String(records.length) + ' 条记录按「' + MERGE_KEY + '」合并到「' + target + '」？',
    )
    if (allowed !== true) return
  }
  if (host.data.write(records, { mode: 'merge', key: MERGE_KEY, sheetName: target }) !== true) {
    throw new Error('合并写入失败：' + target)
  }
  context.log.info('已合并 ' + String(records.length) + ' 条到 ' + target)
  host.ui.toast('已合并 ' + String(records.length) + ' 条到「' + target + '」', 'info')
}

/** 统一兜底：命令里抛的错写日志 + 提示，不让宿主页面崩 */
async function runGuarded(context, task) {
  try {
    await task(context)
  } catch (error) {
    const message = describeError(error)
    context.log.error('操作失败：' + message)
    if (context.host.ui && typeof context.host.ui.toast === 'function') {
      context.host.ui.toast('操作失败：' + message, 'error')
    }
  }
}

export async function activate(context) {
  const host = context.host
  const log = context.log
  if (!host || !host.ui || typeof host.ui.registerCommand !== 'function') {
    log.warn('宿主版本过低：没有 registerCommand，插件不可用')
    return
  }
  if (!host.net || !host.data || !host.sheet) {
    log.warn('权限不足：插件需要 net.fetch / data.* / sheet.*')
  }
  host.ui.registerCommand({
    id: 'download',
    title: '下载本期番组数据',
    run: () => runGuarded(context, downloadPeriod),
  })
  host.ui.registerCommand({
    id: 'merge',
    title: '整理进我的番组数据库',
    run: () => runGuarded(context, mergeIntoDatabase),
  })
  log.info('长门有C 番组数据 已激活（宿主 v' + String(host.version) + '）')
}

export function deactivate() {
  // 没有定时器 / 监听器，无需清理
}
