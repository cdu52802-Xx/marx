# M5 主线 A 实施期 progress anchor

> **状态**：Stage 1 + Stage 2 完成 / 准备进 Stage 3（时间轴改造）
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
| **Stage 3** 时间轴改造 | T6 单游标 + 范围条 + 双向锁定 / T7 ▶ 播放 | ⏸ 待启动 | — |
| **Stage 4** 弧线 + 双击中键 | T8 点弧线 / T9 双击中键 reset | ⏸ 待启动 | — |
| **Final** E2E + 4 件套 + ship | T10 | ⏸ 待启动 | — |

**Stage 1 + 2 合计 14 commits push origin** / 头 `a1fa3ac` / 测试 140/143（106 baseline → 140 / +34 / 3 fail 仍 M3 pre-existing 不变）。

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

### Stage 3 · 时间轴改造（T6 + T7）· 估 5-10h

| Task | 内容 | 估时 |
|---|---|---|
| T6 | timeline.ts 大改 / 删 slider + 加单游标拖动 + 视觉范围条 + zoom 双向同步 / 单测 + main.ts 接线 | 5-7h |
| T7 | ▶ 播放改造 / 游标自动 1770→1950 + 画布同步飞行 / toggle pause | 2-3h |

**Stage 3 PM checkpoint**：跟前 5 轮同节奏 / 浏览器实测 → PM 反馈 → 自审 + 修 → push → 再 checkpoint

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
| npm test pass | 140 / 143 | 106 / 109 | 跌破 baseline = 警示 | ✅ +34 新测 / 3 fail M3 pre-existing 不变 |
| tsc | clean | clean | 任何新 error = 警示 | ✅ |
| lint exit | 0 | 0 | 任何 error/warning = 警示 | ✅ |
| build size (gzip) | 43.63 KB | 38.47 KB | 47 KB | ✅ +5.16 KB / 仍 7% 远低警戒 |

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
