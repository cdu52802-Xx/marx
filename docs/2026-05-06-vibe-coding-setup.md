# 2026-05-06 · Vibe Coding 工具栈第一波 setup

> 阶段产出落文（按 user 元约束-6）。下次开新窗口能 30 秒重建上下文。
> 当天主线：把推荐清单的 B 区（必装 4 件）跑完 + 摸清坑。

## 完成

| 项 | 结果 |
|---|---|
| **B4** `AGENTS.md` | ✅ 写好 + push（项目级 agent context，跨工具标准） |
| **B3** MCP × 2 | ✅ `memory` + `sequential-thinking` 都 ✓ Connected |
| **B1** Hook | ✅ 全局 `~/.claude/settings.json` 加 PostToolUse hook（写文件后自动 `git status --short`） |
| **B2b** GitHub Action | ✅ 决定走方案 B（本地 Claude Code review），workflow + secret + 测试 issue 全清理 |
| **C** Web 端 | ⏸️ 暂缓——堵在"装 web 专用 GitHub App"那一步 |

## 关键决策

### 1. 不走远端 GitHub Action（B2b 选 B 而非 A）
- **原因**：`claude-code-action` 不支持 Claude.ai OAuth 订阅，要单独 API key 计费
- Marx 早期 PR 频率近 0，远端自动化是 over-engineering（违反元-5 极简）
- 本地 review 更快、和 desktop session 共享 context
- **复盘**：将来 PR 多 / 想 ralph loop 后台跑时再 revisit

### 2. MCP 走 npmmirror.com 镜像
- **原因**：npmjs.org 在这台机器超时（ETIMEDOUT），淘宝镜像秒过
- **实现**：mcp 启动命令加 `--registry=https://registry.npmmirror.com`
- **复盘**：未来装其他 npm-based MCP 也用这个；可选优化是 `npm config set registry https://registry.npmmirror.com` 全局换源

### 3. AGENTS.md 而非项目级 CLAUDE.md
- **原因**：跨工具标准，Codex / Cursor / Claude 都认
- 双机切换 + 未来可能切 Codex，这是最不锁的选择

## 已知坑（防止下次踩）

- **`claude-code-action @v1` 当前有 binary bug**
  - 症状：`SDK execution error: ReferenceError: Claude Code native binary not found`
  - 上游：[anthropics/claude-code-action#1242](https://github.com/anthropics/claude-code-action/issues/1242)（open，2026-05-05 报）
  - workaround：pin 到 `@v1.0.99`（last-good）
  - 状态：今天我们决定不走 Action 路线，所以暂时 N/A；真要接时记得 pin

- **`/web-setup` 在 desktop 端不可用**
  - desktop 版本没这个命令；但 web 端能 OAuth 直连，所以不阻塞

- **GitHub web 端用的 Claude App ≠ claude-code-action App**
  - 装一个不代表另一个也装了
  - 截图里那行 link `Install the Claude GitHub app in a private repository` 是 web 端 App 的入口

## Marx 项目当前状态（远端 + 本地）

- **远端 commits**：4 个（init → 加 Action → pin v1.0.99 → revert Action），完整故事
- **远端 workflows / secrets / open issues**：全空
- **本地新增**：`AGENTS.md`、`docs/2026-05-06-vibe-coding-setup.md`（本文件）
- **已装工具栈**：global 14 MCP（含新加的 memory + sequential-thinking）+ 1 hook + 大量 skill
- **未做**：`specs/` 目录还没建（Compound Engineering 用，第一个特性时再建）

## 下次入口（有空时接着干）

按"风险递增、收益递减"排序：

1. **C: claude.ai/code web 端**（10 分钟）—— 装 web 专用 Claude GitHub App + 选 marx repo
2. **第一个 spec**（30 分钟）—— 在 `specs/` 写第一个 design doc 试 spec-first 工作流
3. **首个 PR review 实操**（任意时刻）—— 等真的有 PR 时让 Claude 直接读 `git diff` 做 review，验证方案 B 跑通
4. **可选优化：全局换 npm registry**（30 秒）—— `npm config set registry https://registry.npmmirror.com`

## 引用

- 推荐清单原文：`D:\AI\Claude\.claude\plans\vibe-coding-agentic-engineering-github-quirky-stonebraker.md`
- 跟踪 issue：[anthropics/claude-code-action#1242](https://github.com/anthropics/claude-code-action/issues/1242)
- 项目级 agent context：`F:\AI\projects\Marx\AGENTS.md`
- 全局元约束：`~/.claude/CLAUDE.md`
