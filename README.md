<div align="center">

<!-- badges:start -->
<p align="center">
  <a href="LICENSE"><img alt="协议 AGPL-3.0" src="https://img.shields.io/badge/协议-AGPL--3.0-blue?style=flat"></a>
  <a href="https://github.com/awujiana/MBD-plugin-yucwiki"><img alt="平台 WPS/Excel" src="https://img.shields.io/badge/平台-WPS%2FExcel-green?style=flat"></a>
  <a href="https://github.com/awujiana/MBD-plugin-yucwiki"><img alt="类型 MBD 插件" src="https://img.shields.io/badge/类型-MBD%20插件-black?style=flat"></a>
  <a href="https://github.com/awujiana"><img alt="作者 awujiana" src="https://img.shields.io/badge/作者-awujiana-orange?style=flat"></a>
  <a href="https://github.com/awujiana/MBD-plugin-yucwiki"><img alt="状态 维护中" src="https://img.shields.io/badge/状态-维护中-green?style=flat"></a>
  <a href="https://github.com/awujiana/MBD-plugin-yucwiki"><img alt="AI辅助生成 是" src="https://img.shields.io/badge/AI辅助生成-是-orange?style=flat"></a>
</p>
<!-- badges:end -->

<a id="top"></a>
<h1>长门有C 番组数据</h1>
<h2>MBD-plugin-yucwiki</h2>

<strong>MBD（My Bangumi Database for WPS）插件与数据源：从 GitHub 获取长门有C 番组数据、一键下载成工作表，并按 Bangumi URL 去重整理进你的番组数据库。</strong>

<!-- language-nav:start -->
<p align="center">
  <a href="README.md"><img alt="简体中文 当前" src="https://img.shields.io/badge/简体中文-当前-2ea44f?style=flat"></a>
  <img alt="繁體中文 待补" src="https://img.shields.io/badge/繁體中文-待补-lightgrey?style=flat">
  <img alt="English 待补" src="https://img.shields.io/badge/English-待补-lightgrey?style=flat">
</p>

<p align="center">
  <sub>文档 / Docs：<a href="#sec-8">文档索引</a> · <a href="CONTRIBUTING.md">贡献指南</a> · <a href="CHANGELOG.md">更新日志</a> · <a href="#sec-9">多语言支持</a></sub>
</p>
<!-- language-nav:end -->

</div>

---

> [!WARNING]
> 本项目的相当一部分代码由 AI 辅助生成，并经过持续的人工作业、联调与重构，但它仍然可能存在遗漏、边界情况处理不足或行为与预期不完全一致的问题。如果你在使用过程中发现 Bug、兼容性问题、异常行为或文档缺失，欢迎积极提交 Issue。最好附上复现步骤、日志、截图和系统版本信息，这会非常有帮助。

<a id="sec-1"></a>
## 📚 目录

- [项目简介](#sec-2)
- [核心功能](#sec-3)
- [快速开始](#sec-4)
- [权限](#sec-5)
- [数据来源与期号](#sec-6)
- [发布插件](#sec-7)
- [文档](#sec-8)
- [多语言支持](#sec-9)
- [反馈建议](#sec-10)
- [参考与致谢](#sec-11)
- [关联标签](#sec-12)
- [关联仓库](#sec-13)
- [作者联系方式](#sec-14)
- [开源协议](#sec-15)

<a id="sec-2"></a>
## 🚀 项目简介

`长门有C 番组数据` 是 [MBD（My Bangumi Database for WPS）](https://github.com/awujiana/My-Bangumi-Database-for-WPS) 的一个插件，同时本仓库也是它的**数据源**。它把「长门有C 番组数据」一键下载成工作表，并按 `Bangumi URL` 去重合并进你正在维护的番组数据库。

- 安装方式：在 MBD **v2.5.0+** 的「插件市场」里填入 `awujiana/MBD-plugin-yucwiki`。
- 插件本体与数据源都在 `main` 分支：插件为 `plugin.js`，数据在 `data/`。

<a id="sec-3"></a>
## ✨ 核心功能

| 命令 | 行为 |
| --- | --- |
| 下载本期番组数据 | 从本仓库 `data/` 拉本期数据，在当前工作簿新建一张表（`长门有C 新番 <期号>`）并写入 |
| 整理进我的番组数据库 | 读刚生成的那张表，二次确认后按 `Bangumi URL` 合并进当前活动工作表 |

所有写表动作都由用户点命令触发；`activate()` 只注册命令，不碰表格、不发请求。

<a id="sec-4"></a>
## 📦 快速开始

1. 打开 MBD（v2.5.0+）的「插件市场」。
2. 填入仓库地址 `awujiana/MBD-plugin-yucwiki` 并安装。
3. 在插件命令面板点击「下载本期番组数据」，生成一张新工作表。
4. 点击「整理进我的番组数据库」，按 `Bangumi URL` 去重合并到当前工作表。

<a id="sec-5"></a>
## 🔐 权限

`sheet.read` `sheet.write` `data.read` `data.write` `net.fetch` `storage` `ui.toast` `log`

- 域名白名单只有 `raw.githubusercontent.com`。
- 插件**不是沙箱**（与宿主同一 WebView），安装前请看清权限清单 —— 详见宿主仓库 `PLUGIN-SPEC.md` §7。

<a id="sec-6"></a>
## 🗂 数据来源与期号

- **当前期号**：`2026H2`，`477` 条，`updatedAt` 见 `data/manifest.json`。
- **数据源版本**：`data/manifest.json` 的 `dataVersion`，由 `scripts/fetch.mjs` 按「期号 + 更新日期 + 分片 sha256 前 8 位」生成，并自动写回 `plugin.json` 的 `dataSourceVersion`。该字段属于展示信息、**不参与签名**：只更新数据时不必重签，也不必升 `version`。
- **种子来源**：作者自建的 [`Bangumi-Archive-Anime-Excel`](https://github.com/awujiana/Bangumi-Archive-Anime-Excel)（本地存档分片），筛出 `开播日期 >= 2026-07-01` 的条目，再映射到 MBD 的 42 列标准表头。这不是上游站点的原始导出，是**可跑通的种子数据**；接上游时替换 `data/source.json`。
- **字段表头**：沿用宿主 `STANDARD_HEADERS`（42 列），`host.data.write` 可直接吃；`Bangumi URL` 作为合并键（标准表头里没有 `id` 列）。

### 为什么不用 gzip

宿主 `host.net.fetch()` 返回 `{ status, headers, body: string }`，没有解压能力；WPS 内嵌的 CEF 也不保证支持 `DecompressionStream`。因此 `data/*.jsonlines` 是**纯文本 UTF-8 的 JSON Lines**（一行一条），不做压缩。`data/manifest.json` 每片都带 `bytes` 与 `sha256`，插件可自行核对。

**本地重建：**

```bash
node scripts/fetch.mjs                       # 用 data/source.json 重算数据 + 清单
node scripts/fetch.mjs --source <url|文件>  # 从上游重建
```

> 更新频率**待定**：`.github/workflows/sync.yml` 目前只有 `workflow_dispatch`。确定上游后，在仓库 Settings → Variables 加 `SOURCE_URL`，并给 workflow 加 `schedule`。

<a id="sec-7"></a>
## 🔧 发布插件

改了 `plugin.js` **必须**重算 checksum 并签名（顺序不能反：签名覆盖 checksum）：

```bash
# 1. 改 plugin.json 的 version
# 2. 重算 checksum 并签名
node scripts/plugin-sign.mjs --manifest plugin.json --key ~/.mbd-plugin-signing-key.pem --compute-checksum
# 3. 提交推 main；宿主每 6 小时检查一次版本，自动后台替换
```

私钥**绝不进仓库**。宿主内置公钥表 `TRUSTED_PLUGIN_KEYS` 里的 `awujiana-2026` 与本仓库签名配套；换 keyId 需要宿主发版。

<a id="sec-8"></a>
## 📖 文档

> 本节仅索引**操作 / 参考文档**。

- 宿主规范：`My-Bangumi-Database-for-WPS` 仓库的 `PLUGIN-SPEC.md`（权限、命令注册、数据写入、签名）。
- 数据清单：`data/manifest.json`（期号、分片、`bytes`、`sha256`、`dataVersion`）。
- 构建脚本：`scripts/fetch.mjs`（重建数据）、`scripts/plugin-sign.mjs`（签名）。

> 本仓库无独立测试套件；改动后可用 `node --check plugin.js` 与 `node scripts/fetch.mjs` 自测。

<a id="sec-9"></a>
## 🌐 多语言支持

当前提供**简体中文**版本；其他语言的可用状态以顶部语言徽章为准（绿色「当前」/ 蓝色「切換」/ 灰色「待补」）。

<a id="sec-10"></a>
## 💬 反馈建议

提交 Issue 时建议附上：

- MBD / WPS 版本号与操作系统
- 插件版本（`plugin.json` 的 `version`）与数据源版本（`dataSourceVersion`）
- 复现步骤与报错信息（`log` 权限输出的日志）
- 截图或录屏

<a id="sec-11"></a>
## 🙏 参考与致谢

- [My Bangumi Database for WPS](https://github.com/awujiana/My-Bangumi-Database-for-WPS)：插件宿主与 `PLUGIN-SPEC.md`。
- [Bangumi 番组计划](https://bgm.tv/)：番组数据来源生态。
- [Bangumi-Archive-Anime-Excel](https://github.com/awujiana/Bangumi-Archive-Anime-Excel)：种子数据来源。

<a id="sec-12"></a>
## 🏷 关联标签

<p align="center">
  <a href="https://github.com/topics/bangumi"><img alt="bangumi" src="https://img.shields.io/badge/bangumi-1f6feb?style=flat-square"></a>
  <a href="https://github.com/topics/wps"><img alt="wps" src="https://img.shields.io/badge/wps-1f6feb?style=flat-square"></a>
  <a href="https://github.com/topics/excel"><img alt="excel" src="https://img.shields.io/badge/excel-1f6feb?style=flat-square"></a>
  <a href="https://github.com/topics/anime"><img alt="anime" src="https://img.shields.io/badge/anime-1f6feb?style=flat-square"></a>
  <a href="https://github.com/topics/mbd-plugin"><img alt="mbd-plugin" src="https://img.shields.io/badge/mbd--plugin-1f6feb?style=flat-square"></a>
  <a href="https://github.com/topics/javascript"><img alt="javascript" src="https://img.shields.io/badge/javascript-1f6feb?style=flat-square"></a>
  <a href="https://github.com/topics/yucwiki"><img alt="yucwiki" src="https://img.shields.io/badge/yucwiki-1f6feb?style=flat-square"></a>
</p>

> 以上为本仓库的 GitHub Topics（关联标签）；可在仓库首页 Topics 区或 `gh repo edit awujiana/MBD-plugin-yucwiki --add-topic "..."` 维护。

<a id="sec-13"></a>
## 🔗 关联仓库

- [awujiana/MBD-plugin-yucwiki](https://github.com/awujiana/MBD-plugin-yucwiki) — 本仓库
- [awujiana/My-Bangumi-Database-for-WPS](https://github.com/awujiana/My-Bangumi-Database-for-WPS) — 宿主（MBD）
- [awujiana/Bangumi-Archive-Anime-Excel](https://github.com/awujiana/Bangumi-Archive-Anime-Excel) — 种子数据来源

<a id="sec-14"></a>
## 📮 作者联系方式

- **作者**：awujiana
- **GitHub**：[@awujiana](https://github.com/awujiana)
- **邮箱**：bingshanlengtie@qq.com

<a id="sec-15"></a>
## 📄 开源协议

本项目基于 **[AGPL-3.0](LICENSE)**（GNU Affero General Public License v3.0）开源，与宿主一致。

版权所有 © awujiana。
