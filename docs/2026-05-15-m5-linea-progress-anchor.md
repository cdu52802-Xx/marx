# M5 主线 A 实施期 progress anchor

> **状态**：Stage 1+2+3+4+5 R0+R1 完成 / **T9 双击中键 reset 拍废**（⌂ 已 cover）/ Stage 5 R2 等 PM checkpoint / Final ship 待启动
> **日期**：2026-05-15
> **关联**：[M5 spec](../specs/2026-05-14-m5-linea-explorability-design.md) · [M5 plan](../plans/2026-05-14-marx-m5-linea-explorability.md) · [M4 takeaway](./2026-05-13-m4-takeaway.md)
> **跨窗口续接**：本文件是 SSOT / 新窗口 AI 读这一份立即知当前进度 / 完整 prompt 模板见 § 10

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
| **Stage 3 R4 PM checkpoint** | 资深 UIUX 重设布局：单行 + ▶ 28×28 图标 + floating cursor badge (DR-051) / timeline 57px | ✅ commit `58e11fa` | push origin |
| **Stage 3 R5 PM checkpoint** | sidebar bottom 60 让出 timeline + ▶ 按钮（DR-052）| ✅ commit `13c3f9a` | push origin · Stage 3 收尾 |
| **Stage 4 R0** 焦点模式 | 查看关联按钮 + hover preview + 完全切换 + 面包屑 + zoom-fit (DR-053~057) | ✅ commit `bad234b` | push origin |
| **Stage 4 R1 PM** | 紧密重排 (DR-058) / X spread 54× 紧凑 / 像 CAD zoom-selected | ✅ commit `f52aeb4` | push origin |
| **Stage 4 R2 polish backlog** ⚠ | 详情卡弹出时焦点元素需在"被详情卡侵占后"画布中居中 / 关详情卡再调回 | ✅ done (Stage 5 R0 顺便修 DR-059) | `438b590` |
| **Stage 5 R0** T8 点弧线 + R2 polish | arc-tooltip + handleArcClick + restoreArcOpacity + zoomFitToFocusCoords visCenterVB | ✅ done | `438b590` push origin |
| **Stage 5 R1 PM** | 3 修：hit overlay 16px (DR-061) + endpoint fit CAD (DR-062) + 删 tooltip (DR-063) + focus mode hit 同步 | ✅ done | `10d2070` push origin |
| **T9 双击中键 reset** | ⌂ 已 cover reset 路径 / T9 拍废 (spec § 11.1 acceptance 11→10) | ❌ 拍废 | — |
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
| **DR-051** | **Stage 3 R4 重设布局**：单行 + ▶ 28×28 图标在左 + floating cursor badge 跟随 cursor + popover bottom 60 + zoom-control bottom 70 / **timeline 57px (-56% from M5 init)** | `58e11fa` |
| **DR-052** | **Stage 3 R5 Fix**：sidebar bottom 0 → 60px 让出 timeline（原 sidebar 后挂 DOM 同 z-index 10 覆盖 timeline 最左 48px 含 ▶ 按钮）| `13c3f9a` |
| **DR-053** | **Stage 4 Q1**：进焦点触发 = 详情卡里加「查看关联」按钮（不破坏 DR-031 单击=详情卡）| （Stage 4 commit）|
| **DR-054** | **Stage 4 Q2**：双段式 UX hover button 高亮淡显预览 + click button 完全切换（PM 主动澄清）| 同上 |
| **DR-055** | **Stage 4 Q2 补**：切换后保留 person section（E+A+C 头像 + 名字 + 焦点 obs）/ 不是孤立 6 obs | 同上 |
| **DR-056** | **Stage 4 Q3**：顶部面包屑「全部 → 焦点：观点 prefix」点全部返回 | 同上 |
| **DR-057** | **Stage 4 Q4**：链式焦点第一版不允许 / 后续 polish 加 | `bad234b` |
| **DR-058** | **Stage 4 R1 PM**：焦点模式紧密重排（复用 computePersonSectionPositions / 飞到紧凑坐标 / 退出恢复原 datum）/ X spread 2708→50 / 54× 紧凑 | （R1 commit）|
| **DR-059** | **Stage 5 R0 R2 polish**：zoomFitToFocusCoords 用 visCenterVB / 焦点元素天然在 popover-offset 后可见区中心 / POPOVER_PX=380 焦点模式预留 / targetK 改用 visibleVBWidth 而非 canvasW / fallback jsdom 用 canvasW + viewBox center / **tradeoff**: popover 关时元素偏左 (PM 反馈"关详情卡再调回"留 polish 二期 hook hideClaimPopover) | `438b590` |
| **DR-060** | **T9 双击中键 reset 拍废**：⌂ 按钮已实现并 cover reset 路径（spec § 7.5 原本设计 ⌂ 是 T9 fallback）/ T9 反成 ⌂ 冗余 / spec § 11.1 acceptance 从 11 项减为 10 项 | — |
| **DR-061** | **Stage 5 R1 Fix 1**：弧线 hit overlay / g.arc-hit-layer + path.arc-hit 透明 16px stroke + vector-effect non-scaling-stroke / hit area 固定 16 屏幕 px / 视觉 visible path.arc 不变 / 解 PM "弧线太细难选中" | `10d2070` |
| **DR-062** | **Stage 5 R1 Fix 2**：handleArcClick 改 pathEl.getPointAtLength(0/mid/end) 算 endpoint+apex bbox / fit factor 0.7→0.55 / pixel 直接比避免 letterbox over-estimate / 解 PM "端点没飞进画布 / CAD zoom-selected 效果" | 同上 |
| **DR-063** | **Stage 5 R1 Fix 3**：删 arc tooltip 完整模块 / arc-tooltip.ts + 10 单测删 / PM 反馈"颜色（绿/红/灰虚）+ 方向（左下/右上/右弯）已分关系类型 / tooltip 多余" | 同上 |

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

## 10. ⭐⭐⭐ 跨窗口续接 prompt 模板（新窗口开场白）

PM 复制这段到新窗口对话开头：

```
续接 Marx · M5 主线 A · Stage 5 R0 完成 / 待 PM 浏览器实测 / 然后 Final ship

读：
1. AGENTS.md（项目级 agent context）
2. docs/2026-05-15-m5-linea-progress-anchor.md ⭐ 本文件 / 最新 SSOT
3. specs/2026-05-14-m5-linea-explorability-design.md（M5 spec / DR-001~060）
4. plans/2026-05-14-marx-m5-linea-explorability.md（M5 plan / T6~T10 TDD steps）

当前状态（HEAD 10d2070 / push origin）:
- Stage 1+2 完成（点 obs 居中 / DR-025~037 共 13 决策）
- Stage 3 完成（时间轴改造 / 经 5 轮 PM checkpoint R0~R5 / DR-038~052 共 15 决策 / 其中
  DR-038/039/041 已作废 / 取代为 DR-042 vision pivot：时间轴 = 时间游标 / 不联动画布）
- Stage 4 完成（焦点模式 / DR-053~058 / 详情卡「查看关联」按钮 + hover preview + 完全切换
  + 紧密重排 + 顶部面包屑 + zoom-fit）
- Stage 5 R0 完成（DR-059 + DR-060）：
  · main.ts handleArcClick + restoreArcOpacity（getBBox + tooltip / R1 重写）
  · zoomFitToFocusCoords 用 visCenterVB（R2 polish）/ focus 模式预留 popover 380
  · T9 双击中键 reset 拍废（⌂ 按钮已 cover）
- Stage 5 R1 完成 PM 3 修（DR-061~063）：
  · Fix 1 弧线 hit overlay 16px 透明 stroke + non-scaling / 视觉不变 / 解"太细难选中"
  · Fix 2 handleArcClick 改 getPointAtLength endpoint+apex bbox + fit 0.55 / 解 CAD zoom-selected
  · Fix 3 删 tooltip 完整模块 / 颜色+方向已分关系类型 / 多余
  · focus mode 同步 hit overlay display + d (path.arc, path.arc-hit comma selector)
- 测试 153/156 / lint clean / tsc clean
- 3 fail 仍是 M3 pre-existing successor_notes 不变

⚠ 已知 polish backlog（不阻塞 ship）:
  Focus 模式 popover 关闭后元素需要回到屏幕中心（现在偏左 38/2 = 190px 因为预留了 popover 空间）
  修法: hook hideClaimPopover() / focus 模式下监听 popover close / 触发 zoomFitToFocusCoords 重算
  PM 用过实测看是否真痛 / 不痛就留着

Stage 5 R2 PM checkpoint（浏览器实测 R1 修后）:
  - 点弧线（无视太细 / hit overlay 16 屏幕 px 容易点）→ 两端 obs 飞行 fit 可见区中心 + 弧线高亮（粗 2.5 + opacity 1.0）
  - 端点不溢出 viewport（fit 0.55 + endpoint+apex bbox / CAD zoom-selected 等价效果）
  - 不再弹屏幕中心 tooltip（颜色+方向已分关系）
  - 点 obs / 点空白 / 点另一弧线 → 当前弧线复原原 style
  - Focus 模式触发 → 焦点元素飞到可见区中心（不是屏幕中心 / DR-059）
  - Focus 模式下点焦点弧线也 work（hit overlay 同步隐藏非焦点 + 同步 d 焦点紧凑坐标 / R1 顺手修）
  - 验证回归：Stage 1~4 全部交互（缩放 / pan / 时间游标拖 / ▶ 播放 / 焦点紧凑重排）不退化

ship 路径 (Stage 5 R 轮收尾后启动):
  C Final ship · T10 E2E + gstack 4 件套 baseline + GH Pages deploy (4-6h)

gstack 调用建议（PM 授权"自行判断"）:
- Stage 5 R1: codex consult 验设计 (可选)
- Stage 5 bug 频: investigate (Iron Law 不修症状)
- Final ship 前必跑: health + benchmark + qa-only + design-review
  对比 m4_closure_gstack_4toolkit_baseline.md
- ship 用 ship + land-and-deploy + canary 替代手工
- ship 后 document-release 落 takeaway

记忆参考（按相关度）:
- feedback_m5_stage3_implementation_lessons.md ⭐⭐ Stage 3 5 轮 R0~R5 + vision pivot lessons
- feedback_m5_stage4_implementation_lessons.md ⭐⭐ Stage 4 焦点模式设计 + 紧密重排
- feedback_m5_stage2_implementation_lessons.md ⭐ Stage 2 5 轮 lessons (d3.zoom gotcha + viewBox 坐标等)
- feedback_inline_self_audit_stage_checkpoint.md（3 层 review 节奏）
- feedback_brainstorm_mockup_directness.md（PM 看不懂文字 / 必须 mockup）
- feedback_auto_mode_chain_push.md（git add && commit && push 拆开）
- m5_starting_state.md（gstack 调用策略表）

dev server 状态：本窗口跑 5178 / 新窗口 npm run dev 重起 / preview_start "marx-dev"
```

---

## 11. PM 切窗口前 AI 必须做的事 ✓

- ✅ commit + push 所有代码（HEAD `438b590`）
- ✅ 本 anchor 更新（Stage 5 R0 done + DR-059/060 + T9 拍废 + 跨窗口 prompt）
- ⏳ spec § 11.1 acceptance T9 移除 + § 13 加 DR-059/060（next commit）
- ⏳ memory `feedback_m5_stage5_implementation_lessons.md` 落档（Stage 5 R0 lessons / 等 PM checkpoint 后写）
- ⏳ MEMORY.md index 更新 Stage 5 lessons（等 lessons 写完）

新窗口 first action：`git pull origin main` 拉本窗口最后 push 的 anchor + memory。

---

## 9. ⚠ 切窗口前必须做的事（本窗口 done）

- ✅ commit + push 所有代码（HEAD `a1fa3ac`）
- ✅ 本 progress anchor 落档（`docs/2026-05-15-m5-linea-progress-anchor.md`）
- ✅ Stage 2 lessons memory 落档（`memory/feedback_m5_stage2_implementation_lessons.md`）
- ✅ MEMORY.md index 更新
- ✅ commit + push docs

新窗口启动后 first action：`git pull origin main` 拉本窗口最后 push 的 anchor + memory。

---

**Stage 1+2+3+4 全部完成 · push origin HEAD `f52aeb4` · PM 切窗口启动 Stage 5 ✅**
