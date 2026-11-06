# AGENTS.md

> 本文件供 **AI 编码 / 写作 agent** 阅读，用于了解本仓库的结构、约定与禁忌，从而在自动改动时保持风格一致。
> 人类贡献者请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)（含完整命名规范）。

## 项目概述

- **名称**：长门有C 番组数据（中文名）
- **GitHub 仓库名（英文名）**：MBD-plugin-yucwiki
- **类型**：代码仓库（MBD 插件 + 数据源，AGPL-3.0）
- **维护者**：awujiana
- **一句话**：MBD（My Bangumi Database for WPS）插件，获取长门有C 番组数据并一键下载成工作表，按 Bangumi URL 去重合并进番组数据库。

## 仓库结构

| 路径 | 用途 | 是否发布 |
| --- | --- | --- |
| `plugin.js` | 插件本体（单文件 ESM，无外部依赖），注册「下载」「合并」两条命令 | ✅ |
| `plugin.json` | 插件清单：id / version / 权限 / 网络白名单 / checksum / signature | ✅ |
| `data/` | 数据源：`*.jsonlines` 分片 + `manifest.json` + `source.json` | ✅ |
| `scripts/fetch.mjs` | 重建数据与清单，写回 `dataSourceVersion` | ✅ |
| `scripts/plugin-sign.mjs` | 重算 checksum 并签名（ECDSA P-256） | ✅ |
| `README.md` / `CONTRIBUTING.md` / `AGENTS.md` / `CHANGELOG.md` | 文档 | ✅ |
| `LICENSE` | AGPL-3.0 全文 | ✅ |

## 必须遵守的约定

1. **命名规范（不缩写）**：函数 / 变量 `camelCase`、常量 `UPPER_SNAKE_CASE`、文件 `kebab-case`，全拼无缩写、名称不重复。
2. **项目核心不变量**：
   - **签名顺序**：改 `plugin.js` 后必须**先重算 checksum、再签名**（签名覆盖 checksum）；顺序反了签名失效。
   - **私钥不进仓库**：签名私钥（`~/.mbd-plugin-signing-key.pem`）绝不提交；宿主公钥表 `TRUSTED_PLUGIN_KEYS` 的 `awujiana-2026` 与本仓库配套。
   - **数据为纯文本 JSON Lines**：宿主 `host.net.fetch()` 无解压能力，不做 gzip；每片带 `bytes` / `sha256`。
   - **42 列标准表头**：沿用宿主 `STANDARD_HEADERS`，`Bangumi URL` 为合并键（无 `id` 列）。
   - **`dataVersion` 不参与签名**：只更新数据时不必重签、不必升 `version`。
   - **权限最小化**：网络白名单只放 `raw.githubusercontent.com`。
3. **技术禁令**：不得绕过签名直接发布 `plugin.js`；不得把数据改成压缩格式；不得把私钥或备份提交进仓库。
4. **README 风格**：居中徽章 → 双名标题 → 语言切换 + 文档导航 → `[!WARNING]` AI 声明 → 目录 → 正文 → 关联标签 → 底部三节。
5. **双名标题**：`<h1>` 中文名在上、`<h2>` 仓库名在下，两者都要有。
6. **协议**：AGPL-3.0（`LICENSE` 为全文，不许改动）。
7. **提交信息**：说明「做了什么 / 为什么」。
8. **提交身份**：`git config user.name` 必须是 `awujiana`，`user.email` 必须是 `bingshanlengtie@qq.com`。
9. **维护**：每次改动同步 `CHANGELOG.md`；只改数据时更新 `dataVersion`，不必升 `version`。

## 改动前检查

- `node --check plugin.js` 检查语法。
- 改了 `plugin.js`：`node scripts/plugin-sign.mjs --manifest plugin.json --key ~/.mbd-plugin-signing-key.pem --compute-checksum` 重算并签名。
- 改了数据：`node scripts/fetch.mjs` 重建数据与清单，确认 `manifest.json` 的 `bytes` / `sha256` 已更新。
- 改文档：同步 `CHANGELOG.md`。
- 提交：`git status` 确认不含私钥、`__pycache__`、临时文件。

## 不要做的事

- 不要手写 `⚠️ Warning` 代替 `> [!WARNING]`。
- 不要先签名后算 checksum（顺序必须反过来）。
- 不要提交签名私钥或 `.pem` 文件。
- 不要缩写命名、不要同名文件、不要用数字后缀解决冲突。
- 不要把数据改成 gzip / 二进制格式。
- 不要扩大网络白名单到 `raw.githubusercontent.com` 之外。
- 不要删除 `AGENTS.md` / `CONTRIBUTING.md` / `CHANGELOG.md`。
