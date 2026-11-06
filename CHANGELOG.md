# 更新日志

本文件记录 `长门有C 番组数据`（MBD-plugin-yucwiki）的重要变更，版本号遵循语义化版本 `MAJOR.MINOR.PATCH`。
格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [未发布]

### 新增

- 新增 awujiana 风格 `README.md`、`CONTRIBUTING.md`、`AGENTS.md`、`CHANGELOG.md` 与 AGPL-3.0 `LICENSE`。

### 改进

- README 补充徽章、双名标题、权限、数据来源、发布流程、关联标签与底部三节。

## [1.0.0] - 2026-11-04

### 新增

- 首个版本：MBD 插件「长门有C 番组数据」，提供「下载本期番组数据」「整理进我的番组数据库」两条命令。
- 数据源 `2026H2`（477 条），JSON Lines 纯文本分片 + `manifest.json`（含 `bytes` / `sha256`）。

### 已知限制

- 插件不注册独立 WPS 加载项，也不能自带 Ribbon 按钮。
- 「一键下载」为新建工作表，非另存独立 `.xlsx`。
- 尚未校验分片的 `sha256`。
- 更新后需重开页面才生效。

## 更早的版本

本仓库在 `2026-11-06` 之前已有插件与数据，但未建立 `CHANGELOG.md`，此处不做追溯编造。
