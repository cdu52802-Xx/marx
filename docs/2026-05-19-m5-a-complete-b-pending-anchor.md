# M5 主线 A 完成 · 主线 B 待 brainstorm · 新窗口续接锚点

> **创建**：2026-05-19
> **用途**：新窗口续接 / 30 秒重建上下文 / 接 B 主线启动
> **当前 HEAD**：`d3b001b` (R5 DR-069 attempt + doc 同步)
> **Git**：clean / origin/main 同步
> **Prod**：https://cdu52802-xx.github.io/marx/ （GH Pages auto-deploy）

## 1. 状态盘点

- ✅ M5 主线 A ship 完成（tag `m5-linea-final` / 旧 HEAD `bab9211`）
- ✅ DR-069 R5 attempt + (5) hover preview UX ship（commit `0fd1869`）
- ✅ takeaway + memory + MEMORY.md doc 同步（commit `d3b001b`）
- ✅ 4 件套 baseline 全 safe（Health 9.2 / QA 96 / Design A- / AI Slop A）
- ⚠ Bundle prod gzip 49.61 KB（+3% over warning / safe critical 56.96 KB）
- ⚠ DR-069 4 轮专攻仍未解 / 升 backlog 专项 spec [specs/2026-05-19-dr-069-arc-misselect-fix.md](../specs/2026-05-19-dr-069-arc-misselect-fix.md)
- ✅ (5) hover label + endpoint 黄边 prod ship · 实战 UX fallback

## 2. 新窗口续接 step（按顺序）

```
1. cd F:\AI\projects\Marx
2. git pull origin main         # 同步本 anchor + 0fd1869 + d3b001b 两 commit
3. 读 AGENTS.md                 # 项目级 agent context · 前端视觉三件套硬约束
4. 读本 anchor（你正在读）        # 状态盘点 + 启 B 准备
5. 读 docs/2026-05-19-m5-linea-takeaway.md  # M5 ship 完整 takeaway + § 6 决策点
6. 读 memory MEMORY.md          # always 加载 / m5_linea_completion + feedback_m5_stage5 是核心
7. 跟 PM 确认 B brainstorm 启动方式（PM 已拍 A→B 串联）
```

## 3. 主线 B brainstorm 启动准备

PM 已拍 A→B 串联（[M5 takeaway § 6.2](./2026-05-19-m5-linea-takeaway.md)）。

### 3.1 B 范围（spec § 2.2.2 顺序铁律）

- header 重组（brand + 搜索 + 关于 link）
- **右下副窗地理图**（PRD V1 silent drift catch · M4 漏 · 主线 A 已预留位）
- mobile responsive（M4 4 件套决策 1 推 M5）

### 3.2 B 启动前必读

- [AGENTS.md § 前端视觉硬约束](../AGENTS.md#前端视觉美学约束)（brainstorming visual companion + frontend-design + ui-ux-pro-max 三件套强制召唤）
- [M5 spec § 2.2 4 区域归属图 + 衔接预留](../specs/2026-05-14-m5-linea-explorability-design.md)
- [PRD V1 § 4 副图地理 PRD trace](./PRD.md)
- M5 累积 lessons（memory `feedback_m5_stage1~5_implementation_lessons`）
  - 关键复用 lesson：mockup 解 PM 看不懂 / vision vs polish 立即修分类 / 3 层 review 节奏 / atomic commit 不强拆 / 同方向 2 轮不解换 perspective

### 3.3 B 启动 protocol

PM 在新窗口说 **"go B 主线 brainstorm"** → AI 立即：

1. Skill `superpowers:brainstorming`（HARD GATE 不阻挡 / B 是新 feature design）
2. 开 **visual companion 模式**（SKILL.md 第 147-164 行 / 必开）
3. 召唤 **frontend-design** skill（创意定调）
4. 召唤 **ui-ux-pro-max** skill（67 风格 / 96 色板 / 工程化检索）
5. 粘 AGENTS.md `<frontend_aesthetics>` 万能打底提示词
6. 跟 PM 互动 30-90 min / 产出 B spec drafts + 4 区域造型 mockup

估时：B 实施 2-2.5 周（5 stage 类似 M5）。

## 4. Backlog（启 B 时一并 polish）

1. **DR-069 弧线误选 root cause 修法**（[专项 spec](../specs/2026-05-19-dr-069-arc-misselect-fix.md) / 候选 4.1 + 4.2 组合）
2. Bundle gzip 减肥（claims.json + nodes.json 异步 fetch · ~25 KB gzip 可省 · 跨过 prod warning）
3. Focus 模式 popover 关后焦点回中心（偏左 190px）
4. B3 mobile popover 5px overflow（M4 ISSUE-002）
5. B4 tablet sidebar bottom 与 timeline 撞（M4 ISSUE-004）

## 5. dev 工具（M5 commit 0fd1869 已加 · 后续 DR-069 攻可用）

- URL `?debug=1` 启用 `[arc-debug]` console.log
- `window.__arcPick(clientX, clientY)` 直接调 picker
- 例：`http://localhost:5173/marx/?debug=1`

## 6. Memory 索引（`D:\AI\Claude\.claude\projects\F--AI-projects-Marx\memory\`）

新窗口启动时 `MEMORY.md` 自动加载。关键条目：
- `m5_linea_completion` ⭐⭐⭐（本次 ship SSOT）
- `feedback_m5_stage5_implementation_lessons` ⭐⭐⭐（R5 attempt + RC11 新假设）
- `feedback_m5_stage1~4_implementation_lessons`（M5 累积 lesson）
- `m5_starting_state`（M5 启动 baseline）
- `gstack_4toolkit_baseline`（M4 closure baseline / regression 对比）

## 7. TODO 不闭环（新窗口 fresh task）

旧 session task list 不跨窗口同步。新窗口启动时：
- TaskCreate 重建：「主线 B brainstorm 启动」
- TaskCreate 重建：「DR-069 B 阶段 spec 详化 + implement」
- TaskCreate 重建：「Polish backlog 一并 B 期间清」

## 8. session 收尾验证（commit d3b001b 后）

- [x] git status clean
- [x] origin/main 同步（push 0fd1869 + d3b001b）
- [x] takeaway § 3.1 DR-069 状态升级
- [x] memory 3 文件 update（completion / stage5 / MEMORY index）
- [x] 专项 spec 写定（4 攻法候选 / B 阶段决策点）
- [x] 新窗口续接 anchor（本文件）
- [ ] 本 anchor commit + push（接下来）

---

**新窗口续接简单确认句**：
> "我在新窗口续接 Marx 项目 / 已读 AGENTS.md + 本 anchor / 准备 go B 主线 brainstorm"

AI 应立即按 § 3.3 protocol 启动。
