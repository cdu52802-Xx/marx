# AGENTS.md — Marx 项目

> 项目级 agent context（跨工具：Claude / Codex / Cursor 都认这个标准）。
> 全局工作原则在 `~/.claude/CLAUDE.md`（用户级元约束）。本文件只放 Marx 项目特有的事，不重复全局原则。

## 项目状态

- 第一个产品代号：**Marx 星图**；阶段：M1 已上线 / M2 plan v1.1 已就绪（含 § 7 视觉骨架）/ **视觉风格定调完成**（A 学术编辑）→ 待 M2 实施（c 阶段）
- 在线：
  - M1 主 demo：https://cdu52802-xx.github.io/marx/
  - 风格调研入口（A 已选定，B/C/D 留作反向锚定）：https://cdu52802-xx.github.io/marx/styles/
- 仓库：`cdu52802-Xx/marx`（**public**，2026-05-07 从 private 改 public 因为 GitHub Pages 免费层不支持私仓）
- 主用户：0 代码 PM，vibe coding 模式
- 双机切换：Claude 主力机（`F:\AI\projects\Marx`）+ Codex 主力机（`<盘>:\AI\projects\Marx`）

## 对话启动（新窗口建议先做）

每次新 session 开始（特别是新窗口、新机器、`/clear` 之后）：

- **优先读 `docs/` 下最新的 `YYYY-MM-DD-*-takeaway.md`**——阶段续接锚点（含「下次入口」「已知坑」「关键决策」「context 保护提醒」）
- **当前最新**：[`docs/2026-05-07-style-mockup-takeaway.md`](docs/2026-05-07-style-mockup-takeaway.md)（**视觉风格调研中** + M2 plan 已就绪 + 4 mockup 在线，含 5 个新已知坑 + 3 种续接情况开场白）
- 上一阶段（M1 完成）：[`docs/2026-05-07-m1-takeaway.md`](docs/2026-05-07-m1-takeaway.md)（**M1 已上线** https://cdu52802-xx.github.io/marx/，含 5 个已知坑 + M2 入口开场白）
- 更早（brainstorming）：[`docs/2026-05-07-session-takeaway.md`](docs/2026-05-07-session-takeaway.md)（brainstorming 完成 + M1 plan 就绪，仅追溯）
- 这是元-6 阶段落文 + 跨窗口持续性原则的实操形式，30 秒重建上下文比每次重新摸索高效
- 不需要每个文件都读，最新 1 份通常够用；如有交叉引用再延伸

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
| `plans/` | implementation plan（design doc → plan → 按 task 跑） |
| `src/` | 代码（M1 起：TypeScript + D3 + Vite） |
| `tests/` | vitest 单元测试（M1 起新建） |
| `e2e/` | Playwright e2e 测试（M1 起新建） |
| `.github/workflows/` | claude-code-action 等 CI 配置 |
| `AGENTS.md` | 本文件——项目级 agent context |
| `README.md` | 给人读的项目说明 |

## 工作流约束（项目级）

1. **Spec-first**：任何特性开发前在 `specs/<feature>.md` 写 design doc 再动代码
2. **Atomic commit**：每个 commit 人工 review，不无脑接受 diff（Karpathy vibe coding 反面教材就是无脑接受）
3. **Compound Engineering**：每个特性完成后把 takeaway 落到 `docs/` 让下次更易做
4. **Verify before complete**：实现完先约定"做完是什么样"，能验证才算完
5. **Plan mode 优先**：超过 5 分钟的任务先 Shift+Tab 进 plan mode

## 前端视觉美学约束（与 superpowers 工作流配合）

> **背景**：superpowers 的 brainstorming skill 有 HARD GATE（见其 SKILL.md 第 66 行），默认禁止调用 frontend-design / ui-ux-pro-max，导致早期 demo 简陋丑。Marx 是前端项目，必须从一开始就兼顾美观，所以下面这三件套**强制执行**。

### 三件套（按时间顺序）

1. **brainstorming 开头主动喊「开启 visual companion 模式」**
   - SKILL 内置的浏览器伴侣，展示 mockup / 风格对比 / 布局选项点选
   - token 消耗偏大但远胜干聊
   - 详见 `~/.claude/plugins/marketplaces/superpowers-dev/skills/brainstorming/SKILL.md` 第 147-164 行

2. **spec 必含「视觉风格定调」一节**（写在 `specs/<feature>.md`）
   - **Tone**：从「极简 / 极繁 / 复古未来 / 自然有机 / 奢华 / 玩具感 / 杂志编辑风 / 粗野主义 / Art Deco / 工业感」里挑一个明确方向，不能是"现代简洁"这种空话
   - **字体方向**：避开 Inter / Roboto / Arial / Space Grotesk
   - **配色**：避开"紫色渐变 + 白底"这种 AI 套路；主导色 + 锐利强调色优于均匀调色板
   - **氛围细节**：渐变 / 噪点 / 几何图案 / 大阴影 / 自定义光标 / 颗粒感，任选若干

3. **实现期显式召唤双 skill**（写代码前第一句话）
   - `use frontend-design skill`（创意定调；本地 `D:\AI\Claude\.claude\skills\frontend-design\`）
   - `use ui-ux-pro-max skill`（67 风格 / 96 色板 / 57 字体配对的工程化检索；本地 `D:\AI\Claude\.claude\skills\ui-ux-pro-max\`）
   - 两 skill 不冲突，前者负责审美方向，后者负责工程落地

### 万能打底提示词（Anthropic Cookbook 模板）

任何视觉相关的 brainstorming 或实现指令开头，粘贴这段：

```text
<frontend_aesthetics>
避免产出 generic AI slop（通用、分布中心的烂大街输出）。

Typography：选漂亮、独特、有性格的字体。避开 Inter / Roboto / Arial / Space Grotesk。
display 字体和 body 字体配对要有对比。

Color & Theme：承诺一个一致的美学方向。用 CSS 变量统一管理。
主导色 + 锐利强调色，胜过温吞均匀的调色板。

Motion：高冲击的页面加载（如 staggered reveals 交错揭示）胜过散落微交互。
CSS-only 优先，React 用 Motion 库。

Backgrounds：用渐变、噪点、几何图案、分层透明、戏剧性阴影营造氛围深度，
不要大面积纯色。
</frontend_aesthetics>
```

### 反例提醒（不要把功能问题伪装成视觉问题）

"早期 demo 简陋"分两种，**先诊断再处方**：
- 功能流程简陋（缺按钮、跳转乱）→ brainstorming 没问对问题，回去补 spec
- 纯视觉简陋（功能对、就是丑）→ 才走本节三件套

### 来源
- Anthropic Cookbook — Prompting for frontend aesthetics: <https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics>
- Anthropic Blog — Improving frontend design through Skills: <https://claude.com/blog/improving-frontend-design-through-skills>
- obra/superpowers brainstorming SKILL.md（HARD GATE 第 66 行 / Visual Companion 第 147-164 行）

## 关键引用

- 全局工作原则：`~/.claude/CLAUDE.md`（第一性原理 / 0 代码受众 / 显式假设 / 验证驱动 / 极简 / 阶段落文）
- 当前推荐清单：`D:\AI\Claude\.claude\plans\vibe-coding-agentic-engineering-github-quirky-stonebraker.md`（vibe coding × agentic engineering 必读 + 必装）
- Karpathy 4 原则：`~/.claude/principles/llm-pitfalls.md`
