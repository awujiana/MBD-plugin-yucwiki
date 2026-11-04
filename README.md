# 长门有C 番组数据（MBD 插件数据源）

在 MBD（My Bangumi Database for WPS）**v2.5.0+** 的「插件市场」里填入
`awujiana/MBD-plugin-yucwiki` 即可安装。仓库同时是插件本体与数据源，两者都在 `main` 分支。

## 这个插件能做什么

| 命令 | 行为 |
| --- | --- |
| 下载本期番组数据 | 从本仓库 `data/` 拉本期数据，在当前工作簿新建一张表（`长门有C 新番 <期号>`）并写入 |
| 整理进我的番组数据库 | 读刚生成的那张表，二次确认后按 `Bangumi URL` 合并进当前活动工作表 |

所有写表动作都由用户点命令触发；`activate()` 只注册命令，不碰表格、不发请求。

## 权限

`sheet.read` `sheet.write` `data.read` `data.write` `net.fetch` `storage` `ui.toast` `log`

域名白名单只有 `raw.githubusercontent.com`。插件不是沙箱（与宿主同一 WebView），
安装前请看清权限清单 —— 详见宿主仓库 `PLUGIN-SPEC.md` §7。

## 数据来源与期号

- **当前期号**：`2026H2`，`477` 条，`updatedAt` 见 `data/manifest.json`。
- **数据源版本**：`data/manifest.json` 的 `dataVersion`，由 `scripts/fetch.mjs` 按
  「期号 + 更新日期 + 分片 sha256 前 8 位」生成，并自动写回 `plugin.json` 的
  `dataSourceVersion`。插件市场「待确认 / 已安装」卡片上的「数据源 v…」就是它。
  该字段属于展示信息、**不参与签名**：只更新数据时不必重签，也不必升 `version`。
- **种子来源**：作者自建的 `Bangumi-Archive-Anime-Excel`（本地存档分片），筛出
  `开播日期 >= 2026-07-01` 的条目，再映射到 MBD 的 42 列标准表头。
  这不是上游站点的原始导出，是**可跑通的种子数据**；接上游时替换 `data/source.json`。
- **字段表头**：沿用宿主 `STANDARD_HEADERS`（42 列），`host.data.write` 可直接吃。
  `Bangumi URL` 作为合并键（标准表头里没有 `id` 列）。

### 为什么不用 gzip

宿主 `host.net.fetch()` 返回 `{ status, headers, body: string }`，没有解压能力；
WPS 内嵌的 CEF 也不保证支持 `DecompressionStream`。所以首版 `data/*.jsonlines`
是**纯文本 UTF-8 的 JSON Lines**（一行一条记录），不做压缩。等宿主 API 提供了
`fetchBytes` 之外的解压能力，再考虑分片 + gzip。

`data/manifest.json` 里每片都带 `bytes` 与 `sha256`，插件可自行核对（当前实现只判
HTTP 200，见 `plugin.js` 的已知限制）。

## 更新频率

**待定。** `.github/workflows/sync.yml` 目前只有 `workflow_dispatch`，没有 `schedule`。
确定上游地址与频率后：

1. 在仓库 Settings → Variables 加 `SOURCE_URL`（返回 JSON 数组或 JSON Lines 的 URL）；
2. 把 `--source` 传进 `scripts/fetch.mjs`（workflow 已通过环境变量接好）；
3. 在 workflow 里加 `schedule: - cron: '...'`。

本地重建：

```bash
node scripts/fetch.mjs                       # 用 data/source.json 重算数据 + 清单
node scripts/fetch.mjs --source <url|文件>  # 从上游重建
```

## 发布插件（改了 plugin.js 必须做）

```bash
# 1. 改 plugin.json 的 version
# 2. 重算 checksum 并签名（顺序不能反：签名覆盖 checksum）
node scripts/plugin-sign.mjs --manifest plugin.json --key ~/.mbd-plugin-signing-key.pem --compute-checksum
# 3. 提交推 main；宿主每 6 小时检查一次版本，自动后台替换
```

私钥**绝不进仓库**。宿主内置公钥表 `TRUSTED_PLUGIN_KEYS` 里的 `awujiana-2026`
与本仓库签名配套；换 keyId 需要宿主发版。

## 已知限制

- 插件不注册成独立 WPS 加载项，也不能自带 Ribbon 按钮（见 `PLUGIN-SPEC.md` §5.8）。
- 「一键下载」目前是**新建工作表**，不是另存独立 `.xlsx` 文件 —— 宿主 API
  还没有 `exportXlsx()`；用户保存工作簿即可。
- 更新后要重开页面才生效（ESM 模块按 URL 缓存，宿主不做热替换）。
- `host.ui.confirm` 缺失时（未授 `ui.toast`）合并命令不会二次确认。
- 插件尚未校验分片的 `sha256`（宿主只在安装插件本体时校验 `plugin.js`）。

## 许可

AGPL-3.0（与宿主一致）。
