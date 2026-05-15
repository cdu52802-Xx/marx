# M5 主线 A 实施期 progress anchor

> **状态**：Stage 1 + Stage 2 完成 / **Stage 3 经 PM checkpoint R1 vision pivot 重做完成**（时间轴 = 时间游标 / 不联动画布）/ 等 PM checkpoint R2
> **日期**：2026-05-15
> **关联**：[M5 spec](../specs/2026-05-14-m5-linea-explorability-design.md) · [M5 plan](../plans/2026-05-14-marx-m5-linea-explorability.md) · [M4 takeaway](./2026-05-13-m4-takeaway.md)
> **跨窗口续接**：本文件是 SSOT / 新窗口 AI 读这一份立即知当前进度

---

## 1. 整体进度

| Stage | Task | 状态 | Commits |
|---|---|---|---|
| **T0** Pre-flight | archive M4 demo + baseline test | ✅ done | `ac3dfc8` + tag `m5-pre-archive` |
| **Stage 1** zoom 基础设施 | T1 zoom.ts / T2 pan clamp / T3 zoom-control | ✅ done | `cf1b16f` / `02f26ea` / `a64cdeb` / `de9d094` (lint polish) / `9f3d163` (PM round 1 4 修) |
| **Stage 2** 点 obs 居中 + 详情卡 | T4 center.ts / T5 click handler | ✅ done | `bf34d2b` / `d06cc5e` / `6af9ffc` (R2 3 修) / `9fc82fb` (R3 3 修) / `84edf49` (R4 4 修) / `a1fa3ac` (R5 句子居中) |
| **Stage 3 round 1** 时间轴改造 v1 | T6 整条可拖 + 范围条 B + 双向同步 / T7 ▶ 20s 播放 | ✅ commit `b669c1f` | push origin |
| **Stage 3 R1 PM checkpoint** | **vision pivot**：时间轴 = 时间游标 / 删双向同步 / 删范围条 (DR-042~045) | ✅ commit `057bd36` | push origin |
| **Stage 3 R2 PM checkpoint** | 3 fix：删紫框 + popover bottom 160 + click-to-seek (DR-046~048) | ✅ commit `f3e216d` | push origin |
| **Stage 3 R3 PM checkpoint** | 2 fix：yearMax 1950→2030 + timeline 瘦身 130→80px + popover bottom 100 (DR-049~050) | ✅ commit `fef4d67` | push origin |
| **Stage 3 R4 PM checkpoint** | 资深 UIUX 重设布局：单行 + ▶ 28×28 图标 + floating cursor badge (DR-051) / timeline 57px | ✅ 实施完 / 等 PM R5 | （pending commit）|
| **Stage 4** 弧线 + 双击中键 | T8 点弧线 / T9 双击中键 reset | ⏸ 待启动 | — |
| **Final** E2E + 4 件套 + ship | T10 | ⏸ 待启动 | — |

**Stage 1 + 2 合计 14 commits push origin** / 头 `a1fa3ac` / 测试 140/143。

**Stage 3 round 1 commit `b669c1f`** push origin（时间轴双向锁定 v1 / 测试 153/156）— **被 PM checkpoint R1 vision pivot 颠覆**。

**Stage 3 vision pivot 重做完**：时间轴改纯时间游标 / 拖 + ▶ 都不动画布 / 测试 149/152（删 4 范围条相关测 + 加 2 新测）/ lint clean / tsc clean / 待 commit + PM checkpoint R2。

---

## 2. Stage 1 + 2 PM checkpoint 5 轮反馈累积

每次 PM 浏览器实测后给反馈 / AI 自审 + 修 + push / 共 5 轮。

| 轮 | 时间 | issue 数 | 核心改 | 落 DR |
|---|---|---|---|---|
| **S1 round 1** | 2026-05-14 | 5 | 4 立即修 + 1 留 stage 2 | fit-to-content default · 删 Esc reset · 双击中键 · 小手 pan mode（后 R3 删）· ⌂ fit reset | DR-025 / DR-026 |
| **S2 round 2** | 2026-05-14 | 3 | Y 居中可见区 + 递进 zoom + 点空白关详情（d3.zoom nopropagation 根因）| DR-027 / DR-028 / DR-029 |
| **S2 round 3** | 2026-05-15 | 3 | 删 pan mode（光标自然分离）+ 智能 zoom（k=1 跳 / k>1 不动）+ 双击 obs → 8 + X 居中重构（viewBox/pixel 坐标错配）| DR-030 / DR-031 / DR-032 |
| **S2 round 4** | 2026-05-15 | 4 | 工具栏点击不关详情 + 同 claim 不重复 + 不堆叠（querySelectorAll）+ 动画调速（出快入慢）| DR-033 / DR-034 / DR-035 / DR-036 |
| **S2 round 5** | 2026-05-15 | 1 | 居中策略改"句子整体"+ clamp 起点可见 | DR-037 |

**累积 DR-025 ~ DR-037 共 13 个新决策记录**（spec 还停在 DR-024 / 实施期产生）。

---

## 3. M5 决策记录 DR-025 ~ DR-037（实施期补）

| 编号 | 决策 | commit |
|---|---|---|
| DR-025 | fit-to-content default（SVG width/height 100% + viewBox + preserveAspectRatio meet）/ ⌂ reset 飞回 zoomIdentity | `9f3d163` |
| DR-026 | 单击空白关详情卡 + 小手 mode toggle 防误关（**后 DR-030 删 mode**）| `9f3d163` |
| DR-027 | 居中 Y 算可见区（offset header 70 + timeline 160）| `6af9ffc` |
| DR-028 | 递进 zoom 策略 chooseTargetK：currentK≤3→6 / ≤6→8 / >6 保持 | `6af9ffc` |
| DR-029 | popover outsideHandler 用 click 不 mousedown（d3.zoom `mousedown.zoom` 调 `nopropagation` 阻止 document mousedown listener）| `6af9ffc` |
| DR-030 | **删** explicit pan mode toggle（光标 drag = pan / click 不移动 = click / 天然分离）| `9fc82fb` |
| DR-031 | 智能 zoom：k=1 单击触发 flyto + 6 / k>1 单击仅切详情卡（保留探索 context）/ 双击 obs 跳下一档 zoom | `9fc82fb` |
| DR-032 | X 居中重构 pixelToViewBox helper（viewBox + meet scale + letterbox 转换 / SVG width=100% 后差距显现）| `9fc82fb` |
| DR-033 | popover 工具栏白名单：`.sidebar` / `.zoom-control` / `#timeline-fixed` 点击不关详情（工具栏 vs 内容栏分层）| `84edf49` |
| DR-034 | popover same-claim guard：同 claim 重点击 early return / dataset.claimId 标记 | `84edf49` |
| DR-035 | popover sequence 切换：旧 200ms 滑出 → 等结束 → 新 450ms 滑入 / `querySelectorAll` 防堆叠 / `_pendingShowTimer` 防 race | `84edf49` |
| DR-036 | popover 动画出快入慢：滑入 450ms easeOutQuart / 滑出 200ms easeInQuart | `84edf49` |
| DR-037 | sentence-aware centering：默认句子中点居中 + clamp 起点 ≥ visLeft + 24px margin（用户从头读）| `a1fa3ac` |
| ~~DR-038~~ | ~~Q1 拖动方向 Model A~~ **作废 → DR-042** | `b669c1f` 实施过 / R1 颠覆 |
| ~~DR-039~~ | ~~Q2 范围条样式 B~~ **作废 → DR-045 删** | 同上 |
| DR-040 | Q3 ▶ 播放 20s 跑完 / PM 拍"锦上添花" | `b669c1f` |
| ~~DR-041~~ | ~~Q4 syncingFromTimeline flag~~ **作废 → DR-042 单向** | 同上 |
| **DR-042** | **Stage 3 R1 vision pivot**：时间轴 = 时间游标 / 时间滤镜 / 画布完全解耦 / PM 反馈"画布 ≠ 时间走向 / 探索性目的"| （Stage 3 R1 commit）|
| **DR-043** | 初始游标 1950 全显 + 未提出 opacity 0.15（PM 拍：避免"页面坏了" + 强对比）| 同上 |
| **DR-044** | ▶ 播放期间画布完全不动 / 仅游标 + 观点 fade in/out | 同上 |
| **DR-045** | 删视觉范围条 + 2 edge ticks（DR-039 作废）/ zoom 比例已在左下 display | 同上 |
| **DR-046** | **Stage 3 R2 Fix 1**：删 timeline Marx 紫色 indicator rect / vision pivot 后冗余 | （R2 commit）|
| **DR-047** | **Stage 3 R2 Fix 2**：claim-popover bottom 0→160px / timeline 不被挡 | 同上 |
| **DR-048** | **Stage 3 R2 Fix 3**：timeline click-to-seek / mousedown 即跳 cursor / 解"拖不过去" | 同上 |
| **DR-049** | **Stage 3 R3 Fix 1**：yearMax 1950→2030（260 年 span / 含 21 世纪 Marx 学派 70 年 buffer）| （R3 commit）|
| **DR-050** | **Stage 3 R3 Fix 2**：timeline 高 130→80px（删 label + svg 60→40 + padding 缩 + popover bottom 100）| 同上 |
| **DR-051** | **Stage 3 R4 重设布局**：单行 + ▶ 28×28 图标在左 + floating cursor badge 跟随 cursor + popover bottom 60 + zoom-control bottom 70 / **timeline 57px (-56% from M5 init)** | （R4 commit）|

---

## 4. Stage 3 启动注意事项

### 4.1 PM 单游标新理解（Stage 2 期间补丁 / 必须遵守）

PM 在 Stage 1 R1 反馈："**时间轴本身就是单游标**" / 不是"时间轴上有个 marker thumb"。

实施时：
- ❌ 不画 thumb circle marker on 时间轴线上
- ❌ 不要 input range slider
- ✅ 整条时间轴 line 可拖 / cursor: ew-resize / mousedown anywhere on timeline triggers drag
- ✅ 视觉范围条 = 紫色半透明 rect / 仅显示当前 zoom 可视年份段 / 不可拖

### 4.2 Stage 3 brainstorm 待 PM 拍

启动 Stage 3 前应跟 PM 确认：
- 拖左方向语义：拖左 = 画布 pan right（看更早）/ 还是 pan left（拖动方向一致）？
- 视觉范围条样式：紫色 rect 透明度 / 是否带边界 ticks
- ▶ 播放速度：spec 设的 12 年/秒 (15s 跑完 1770→1950) PM 确认还是调？
- 双向同步震荡防护：spec § 12 R3 已设计 syncingFromTimeline flag

### 4.3 Stage 3 风险

- **同步震荡**：拖时间轴 → 画布 pan → onZoom 触发 → 反向同步时间轴游标 → 拖动 listener 被打断（无限循环）→ 必须加 `syncingFromTimeline` flag（plan T6 step 6 设计）
- **timeline.ts 大改**：删 input range slider + 改 SVG drag-able 主轴线 / 改动量大 / 单测先写
- **z-index 冲突**：popover (1000) > zoom-control (11) > timeline (10) > sidebar (?) / 拖时间轴时点击不应被 popover 拦截（fix 工具栏白名单 DR-033 已 cover）

---

## 5. Stage 3+4+Final 排程

### Stage 3 · 时间轴改造（T6 + T7）· 估 5-10h · ✅ 实施完成

| Task | 内容 | 实际 |
|---|---|---|
| T6 | timeline.ts HTML→SVG 大改 / 删 slider + 整条可拖（不画 thumb / Model A 方向）+ 范围条样式 B + 双向同步 + syncingFromTimeline flag | done |
| T7 | ▶ 播放 20s 跑完（DR-040）/ 游标自动 + onCursorChange 接 zoom = 画布同步飞行 / toggle pause / 到 yearMax 自动停 | done（合并 T6 1 个 commit）|

**Stage 3 实施 lessons**：
- T6+T7 合并 1 commit（共享 timeline.ts 单文件改动 + main.ts onCursorChange callback）/ 不刻意拆原子 commit
- mockup brainstorm（`public/m5-stage3-brainstorm.html`）解决"PM 文字看不懂"老问题（lesson `feedback_brainstorm_mockup_directness`）/ Q1 + Q2 PM 实拖 mockup 后 1 分钟拍板
- Preview headless setInterval 严重 throttle（5s/100 期望 / 实际 6 次 / 6%）/ 真浏览器不会 / PM 实测验证最终速度

**Stage 3 PM checkpoint**：跟前 5 轮同节奏 / PM 浏览器实测 → 反馈 → 自审 + 修 → push → 再 checkpoint

### Stage 4 · 弧线 + 双击中键（T8 + T9）· 估 5-7h

| Task | 内容 | 估时 |
|---|---|---|
| T8 | 点弧线 → 两端 obs 居中 + 弧线高亮 + tooltip 关系类型 | 3-4h |
| T9 | 双击鼠标中键 = reset + cursor 状态 + 防中键浏览器默认 | 2-3h |

### Final · E2E + 4 件套 + ship（T10）· 估 4-6h

- E2E Playwright 6 用户旅程
- gstack 4 件套（health / benchmark / qa-only / design-review）对比 baseline（防 regression）
- prod build + push + tag `m5-linea-final` + GH Pages deploy
- 落 takeaway + memory update

---

## 6. gstack 调用计划（PM 授权"自行判断"）

| 时机 | Skill | 价值 |
|---|---|---|
| Stage 3 brainstorm 前 | `codex` consult | 200 IQ 二意见 / 验"时间轴本身可拖 + 双向锁定 + 防震荡"设计 |
| Stage 3 实施 bug 频时 | `investigate` | 系统性 debug / Iron Law 不修症状 / 双向同步震荡可能触发 |
| Stage 4 完成后 | （视情况）| 弧线 + 中键功能验证 |
| **Final ship 前** | **`health` + `benchmark` + `qa-only` + `design-review`** ⭐⭐ | 4 件套对比 baseline（m4_closure_gstack_4toolkit_baseline.md） / 任一警戒线破 = 修了再 ship / spec § 11.3 表 |
| ship 时 | `ship` + `land-and-deploy` + `canary` | 替代手工 git workflow + deploy 监控 |
| ship 后 | `document-release` | 落 takeaway / 更新 README / 同步 docs |

**memory m5_starting_state.md gstack 调用策略表** 仍适用 / 按需召唤。

---

## 7. 当前 baseline 数据（Stage 2 末 / Stage 3 起点）

| 指标 | Stage 2 末值 | M4 baseline | M5 警戒线 | 状态 |
|---|---|---|---|---|
| npm test pass | 140 / 143 | 106 / 109 | 跌破 baseline = 警示 | ✅ Stage 2 末 / Stage 3 实施后 153/156（+13 T6+T7 新测全 pass）|
| tsc | clean | clean | 任何新 error = 警示 | ✅ Stage 3 末 clean |
| lint exit | 0 | 0 | 任何 error/warning = 警示 | ✅ Stage 3 末 clean |
| build size (gzip) | 43.63 KB | 38.47 KB | 47 KB | ✅ +5.16 KB Stage 2 末 / Stage 3 末待 commit 后重测 |

---

## 8. ⭐⭐ 跨窗口续接 prompt 模板（新窗口开场白）

PM 复制这段到新窗口对话开头：

```
续接 Marx · M5 主线 A · Stage 3 时间轴改造

读：
1. AGENTS.md（项目级 agent context）
2. docs/2026-05-15-m5-linea-progress-anchor.md ⭐ 本文件 / 最新 SSOT
3. specs/2026-05-14-m5-linea-explorability-design.md（M5 spec）
4. plans/2026-05-14-marx-m5-linea-explorability.md（M5 plan / T6-T10 详细 TDD steps）

当前状态：
- Stage 1 + 2 完成 + push origin（HEAD a1fa3ac）
- Stage 2 经 5 轮 PM checkpoint 修 13 个 issue / 13 个新 DR-025~037
- 测试 140/143 / lint clean / tsc clean / build 43.63KB gzip
- 准备进 Stage 3（时间轴改造 / T6 + T7）

Stage 3 启动：
- 先 brainstorm 跟 PM 确认 4 个细节（拖动方向 / 范围条样式 / ▶ 播放速度 / 同步震荡防护）
- 然后实施 / 5 stage checkpoint 节奏继续（每 stage 完 AI 自审 + ping PM）
- 时间轴 PM 新理解：整条线可拖 / 不画 thumb marker

gstack 角度：
- Stage 3 brainstorm 前可 codex consult 二意见
- Stage 3 bug 频时用 investigate
- Final ship 前必跑 4 件套 baseline 对比

记忆参考：
- m5_starting_state.md（gstack 调用策略表）
- feedback_m5_stage1_pm_checkpoint.md（S1 round 1 5 issue 修法）
- feedback_m5_stage2_implementation_lessons.md ⭐ S2 5 轮 lessons learned
- feedback_inline_self_audit_stage_checkpoint.md（自审 3 层 review）

dev server 不在跑（PM 切窗口前关），新窗口 npm run dev 重起。
```

---

## 9. ⚠ 切窗口前必须做的事（本窗口 done）

- ✅ commit + push 所有代码（HEAD `a1fa3ac`）
- ✅ 本 progress anchor 落档（`docs/2026-05-15-m5-linea-progress-anchor.md`）
- ✅ Stage 2 lessons memory 落档（`memory/feedback_m5_stage2_implementation_lessons.md`）
- ✅ MEMORY.md index 更新
- ✅ commit + push docs

新窗口启动后 first action：`git pull origin main` 拉本窗口最后 push 的 anchor + memory。

---

**Stage 1 + 2 实施期 anchor done · 等 PM 切窗口启动 Stage 3 ✅**
