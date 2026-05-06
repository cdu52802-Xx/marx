# AGENTS.md — Marx 项目

> 项目级 agent context（跨工具：Claude / Codex / Cursor 都认这个标准）。
> 全局工作原则在 `~/.claude/CLAUDE.md`（用户级元约束）。本文件只放 Marx 项目特有的事，不重复全局原则。

## 项目状态

- 第一个产品代号：**Marx**；阶段：仅有结构骨架，产品方向待定
- 仓库：GitHub 私仓 `cdu52802-Xx/marx`
- 主用户：0 代码 PM，vibe coding 模式
- 双机切换：Claude 主力机（`F:\AI\projects\Marx`）+ Codex 主力机（`<盘>:\AI\projects\Marx`）

## 协作铁律（非常重要）

- **开工先 `git pull`，收工必 `git push`**（双机协作生命线）
- AI 工具本地配置（`.claude/` `.codex/` `.cursor/`）不入库——已在 `.gitignore`
- 密钥 / `.env` / `*.key` / `*.pem` / `secrets/` 绝不入库——已在 `.gitignore`
- 中文 commit message 走 `git commit -F <文件>` 方式（避免 Windows 编码问题）
- git 身份：`cdu52802-Xx`，email 用 noreply 形式

## 目录约定

| 路径 | 用途 |
|---|---|
| `docs/` | PRD、决策记录、阶段性 takeaway（与代码一起入库） |
| `specs/` | spec-first 工作流的 design doc（每个特性先写在这里再动代码） |
| `src/` | 代码（结构由项目类型决定，未来再加） |
| `.github/workflows/` | claude-code-action 等 CI 配置 |
| `AGENTS.md` | 本文件——项目级 agent context |
| `README.md` | 给人读的项目说明 |

## 工作流约束（项目级）

1. **Spec-first**：任何特性开发前在 `specs/<feature>.md` 写 design doc 再动代码
2. **Atomic commit**：每个 commit 人工 review，不无脑接受 diff（Karpathy vibe coding 反面教材就是无脑接受）
3. **Compound Engineering**：每个特性完成后把 takeaway 落到 `docs/` 让下次更易做
4. **Verify before complete**：实现完先约定"做完是什么样"，能验证才算完
5. **Plan mode 优先**：超过 5 分钟的任务先 Shift+Tab 进 plan mode

## 关键引用

- 全局工作原则：`~/.claude/CLAUDE.md`（第一性原理 / 0 代码受众 / 显式假设 / 验证驱动 / 极简 / 阶段落文）
- 当前推荐清单：`D:\AI\Claude\.claude\plans\vibe-coding-agentic-engineering-github-quirky-stonebraker.md`（vibe coding × agentic engineering 必读 + 必装）
- Karpathy 4 原则：`~/.claude/principles/llm-pitfalls.md`
