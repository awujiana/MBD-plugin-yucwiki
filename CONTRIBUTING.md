<div align="center">

<p align="center">
  <a href="LICENSE"><img alt="协议 AGPL-3.0" src="https://img.shields.io/badge/协议-AGPL--3.0-blue?style=flat"></a>
  <a href="CONTRIBUTING.md"><img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat"></a>
  <a href="https://github.com/awujiana"><img alt="AI辅助生成 是" src="https://img.shields.io/badge/AI辅助生成-是-orange?style=flat"></a>
</p>

<h1>贡献指南</h1>

<strong>欢迎参与「长门有C 番组数据」的共建</strong>

</div>

---

> [!WARNING]
> 本项目的相当一部分代码由 AI 辅助生成，并经过持续的人工作业、联调和重构，但它仍然可能存在遗漏、边界情况处理不足或行为与预期不完全一致的问题。如果你在使用过程中发现 Bug、兼容性问题、异常行为或文档缺失，欢迎积极提交 Issue。最好附上复现步骤、日志、截图和系统版本信息，这会非常有帮助。

感谢你关注 **长门有C 番组数据（MBD-plugin-yucwiki）** 并愿意贡献。

> 维护者：awujiana ｜ 开源协议：以仓库 `LICENSE` 为准（AGPL-3.0）

## 📚 目录

- [我能如何参与](#我能如何参与)
- [提交 Issue 前](#提交-issue-前)
- [提交 Pull Request 前](#提交-pull-request-前)
- [命名规范（不缩写）](#命名规范不缩写)
- [代码与数据约定](#代码与数据约定)
- [行为准则](#行为准则)
- [许可证](#许可证)

## 🤝 我能如何参与

- **提交 Issue**：反馈安装失败、命令无响应、数据异常或文档错误。
- **完善文档**：改进 README 与数据说明。
- **改进插件**：优化命令交互、错误提示与数据校验（不得破坏签名与权限约定）。
- **改进数据管线**：完善 `scripts/fetch.mjs` 与 `data/manifest.json` 的生成。

## 🐞 提交 Issue 前

1. 先搜索确认问题未被重复提出。
2. 说明环境：MBD / WPS 版本、操作系统、插件版本（`plugin.json` 的 `version`）与数据源版本（`dataSourceVersion`）。
3. 附上复现步骤与 `log` 输出的日志。
4. 说明是「安装」「下载」「合并」还是「数据」问题。

## 🔀 提交 Pull Request 前

1. 从 `main` 切出特性分支，命名如 `fix/merge-dedup` 或 `docs/readme`。
2. 遵循本仓库的 README 输出规范：居中徽章、双名标题、AI 声明、底部三节。
3. **改了 `plugin.js` 必须重算 checksum 并签名**（见 README「发布插件」），且私钥不进仓库。
4. 命名一律全拼、禁止缩写、名称不重复。
5. 提交信息清晰说明「做了什么 / 为什么」。

## 📝 命名规范（不缩写）

> 本节为**硬性命名规范**，所有改动都必须遵守。

### 总则

- **一律全拼，禁止缩写**：`usr`→`user`、`cfg`→`config`、`btn`→`button`、`msg`→`message`、`err`→`error`。
- **名称不重复**：同目录文件名唯一（大小写不敏感）；同模块符号唯一。
- **名称即语义**：禁止 `utils`、`common`、`misc`、`temp`、`data1` 等泛化名。

### 文件命名

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| JavaScript 模块 | `kebab-case.js` 或单文件 `plugin.js` | `plugin.js`、`fetch.mjs` |
| 文档 | `kebab-case.md` | `readme.md` |
| 数据文件 | `kebab-case.jsonl` | `2026h2.base.jsonl` |

### 符号命名

- **函数 / 变量**：`camelCase`，动词开头，全拼，如 `readDataManifest`、`readRecords`、`describeError`。
- **常量**：`UPPER_SNAKE_CASE`，如 `DATA_BASE`、`SHEET_PREFIX`、`MERGE_KEY`。
- 同一模块内不得出现同名函数；不同模块同名须加限定词。

## 📋 代码与数据约定

- 正文以简体中文为主，专有名词（ESM / JSON Lines / checksum）保留英文原文。
- 命令、代码片段使用围栏代码块并标注语言。
- **签名与校验和是硬约束**：改动 `plugin.js` 后必须重算 `checksum` 并签名；`dataVersion` 不参与签名。
- **数据为纯文本 JSON Lines**：宿主无解压能力，不做 gzip；每片带 `bytes` / `sha256`。
- **权限最小化**：只申请真正需要的能力，网络白名单只放 `raw.githubusercontent.com`。

## 🤗 行为准则

请保持友善、专业、就事论事。尊重不同经验水平的贡献者，不人身攻击、不贬低他人工作。

## 📄 许可证

向本仓库提交贡献，即表示你同意以仓库 `LICENSE` 所载协议（AGPL-3.0）发布你的贡献。详见 [LICENSE](LICENSE)。

[![AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
