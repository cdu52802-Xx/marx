# Marx M5 主线 A takeaway · 可探索基础设施完成

> **上线日期**：2026-05-19
> **在线 URL**：https://cdu52802-xx.github.io/marx/ (M5 主 demo / 198bfa2 deploy)
> **git tag**：`m5-linea-final`（标记 M5 主线 A 完成）
> **HEAD**：`198bfa2` (perf d3 tree shake) / 前一 `959f0ab` (E2E spec)
> **本文件用途**：M5 主线 A 阶段总结 + 主线 B/C 输入 + lessons cross-ref · compound engineering 原则
> **关联**：
> - [M5 spec](../specs/2026-05-14-m5-linea-explorability-design.md)（DR-001~069 / 含 13.x 实施期 vision pivot 补）
> - [M5 plan](../plans/2026-05-14-marx-m5-linea-explorability.md)（T0~T10 TDD steps）
> - [M5 progress anchor](./2026-05-15-m5-linea-progress-anchor.md)（Stage 1~5 R0~R4 实施期 SSOT）
> - [M4 takeaway](./2026-05-13-m4-takeaway.md)（M5 输入 / baseline）
> - [M4 closure 4 件套 SUMMARY](./m4-closure-reviews/SUMMARY.md)（regression baseline）

---

## 1. M5 主线 A 范围 ship 状态

### 1.1 PRD V1 必做项覆盖（M4 30-40% → M5 ~50-60%）

| PRD V1 必做项 | M4 状态 | M5 主线 A ship 状态 |
|---|---|---|
| **缩放 + 平移 1×–8×** | ❌ 未实现 | ✅ **完成**（d3.zoom + scaleExtent + pan clamp + 左下 ⌂ reset）|
| **共享时间轴 1770–2030**（M5 yearMax 1950→2030 DR-049）| ⚠ M4 1770-1950 + Marx 区间 indicator | ✅ **完成**（时间游标 + opacity fade / 单游标 + ▶ 播放 / DR-042 vision pivot）|
| **节点详情卡 panel**（ClaimNode）| ✅ M4 T9 实现 | ✅ **完成**（DR-023 宽 400 / DR-029 Esc 关 / DR-031 智能 zoom / DR-035 出快入慢 / 焦点联动按钮）|
| **悬浮 tooltip** | ❌ 未实现 | ⚠ **部分**（arc-popover 替代 tooltip / DR-063 删 / 留主线 B/C 其他 tooltip）|
| **跨图搜索 / 筛选** | ⚠ M4 sidebar filter ✅ / 搜索 ❌ | ❌ 留主线 B（右上预留 DR-024）|
| **B+2 双主视图 · 副图地理** ⭐ | ❌ M4 silent drift | ❌ 留主线 B（spec § 2.2.1 显式预留位置）|
| **节点详情卡多类型** | ⚠ M4 仅 ClaimNode | ❌ 留主线 C |
| **后来者发展旁注** | ❌ M3 未做 | ❌ 留主线 C concept 详情卡 |

**M5 主线 A 后 PRD V1 覆盖率**：30-40% → **~55%**（缩放 + 时间轴改造 + arc 关系级 popover + 焦点模式 + 全部交互 close）

### 1.2 spec § 2.1 yes 项完成度

✅ 画布 zoom 1×–8× / pan + 5% clamp / 左下控件 / Stage 1  
✅ 时间轴改造（vision pivot DR-042 = 时间游标 / 拖游标 = 观点 opacity fade）/ Stage 3  
✅ 单击 obs → 居中放大 + 详情卡（DR-031 智能 zoom / DR-035 出快入慢）/ Stage 2  
✅ 单击弧线 → arc-popover 上下分栏 + 选中联动 + 焦点 hook（DR-065/066）/ Stage 5 R2  
✅ ▶ 播放 20s 跑完 / 游标自动 / 画布不动（DR-040/044）/ Stage 3  
✅ Stage 4 焦点模式（DR-053~058）= spec § 14 全部 / 紧密重排 + 顶部面包屑 + zoom-fit  
✅ 视觉沿用 M4 spec § 4（米白 + 墨黑 + 紫强调 + 0 border-radius + EB Garamond）

**Acceptance § 11.1**: 11→10 项（T9 双击中键拍废 DR-060 / ⌂ cover reset）/ 10 全 pass。

### 1.3 实施期 timeline

| Stage | Task | 经历 | Commits |
|---|---|---|---|
| T0 | M4 archive + baseline | ✅ | ac3dfc8 |
| Stage 1 | T1+T2+T3 zoom 基础 + 左下控件 | ✅ + R1 PM checkpoint 4 修 | cf1b16f / 02f26ea / a64cdeb / 9f3d163 |
| Stage 2 | T4 center + T5 obs 详情卡 | ✅ + R2~R5 共 13 个 fix（DR-027~037）| bf34d2b / d06cc5e / 6af9ffc / 9fc82fb / 84edf49 / a1fa3ac |
| Stage 3 | T6+T7 时间轴 | ✅ + R1 vision pivot 颠覆双向锁定（DR-042~045）+ R2~R5 4 轮 polish（DR-046~052）| b669c1f / 057bd36 / f3e216d / fef4d67 / 58e11fa / 13c3f9a |
| Stage 4 | 焦点模式 | ✅ + R1 紧密重排（DR-058 X spread 54× 紧凑）| bad234b / f52aeb4 |
| Stage 5 | T8 弧线交互 R0~R4 | ✅ + arc-popover 上下分栏 + 5 轮 PM checkpoint + pickNearestArc + hover preview | 438b590 / 10d2070 / 211e60e / 270ebd7 / 7adc43a |
| T10 | Final ship | ✅ E2E 6/6 + d3 tree shake + 4 件套 baseline 不退化 | 959f0ab / 198bfa2 + tag m5-linea-final |

**累计 ~30 commit / 1.5 周实施期 / 5 个 Stage / 26 轮 PM checkpoint / 45 个 DR 决策记录**。

---

## 2. gstack 4 件套 baseline 对比（M4 → M5）

实施在 [m4-closure-reviews baseline.json](./m4-closure-reviews/baseline.json) + memory `m4_closure_gstack_4toolkit_baseline.md`。

| 维度 | M4 baseline | M5 实测 | spec § 11.3 警戒线 | Δ |
|---|---|---|---|---|
| Health composite | 6.0 (修 F1+F2 后 ~8.5+) | **9.2** | ≥ 8.0 | ✅ +3.2 |
| Bundle JS gzip (prod GH Pages) | 37,976 B (37 KB) | **48,173 B (47.04 KB)** | warning 47,471 B (+25%) | ⚠ **+1.5% over warning · -15.4% under critical** |
| Bundle JS gzip (gzip -c 本地) | ~37 KB | 47,391 B (46.28 KB) | warning 47,471 | ✅ safe -80 (-0.17%) |
| Total prod transfer | 163,827 B | ~174,604 B | warning 204,783 (+25%) | ✅ +6.6% safe |
| Total requests | 3 | 3 | — | ✅ no change |
| Prod load time (cold) | 8811ms (中国网络 / Google Fonts cold) | **4219ms** (warm cache / CDN edge) | warning 5515ms | ✅ -52% |
| QA score | 90 | **96** | ≥ 80 | ✅ +6 |
| Design score | B+ (84) | **A- (90)** | ≥ B+ (84) | ✅ +6 |
| **AI Slop score** | A (95) | **A (95)** | ≥ B (85) | ✅ **保持 0 anti-pattern hit** |

### 2.1 Bundle 优化 lesson（commit 198bfa2）

**问题**: 改前 HEAD `8aac5cf` gzip 47,528 B / 超 warning by +57 (+0.12%) / 风险偏离 spec § 11.3 警戒线。

**根因发现**: 5 文件 `import * as d3 from 'd3'` → vite tree shake 失效（d3 主包 src/index.js 是 `export *` re-export 30 子模块 / rollup 难分析）。

**修法**: 新建 [src/lib/d3.ts](../src/lib/d3.ts) 集中只 named re-export 用到的 4 子模块（d3-selection / d3-zoom / d3-ease / d3-force）+ d3-transition side-effect import。5 文件 import path 改`./lib/d3.ts`（调用 site 全不变）。

**效果**:
- gzip -c 47,528 → 47,391 (节省 **137 bytes / 跨过 warning**)
- modules 583 → 189 (d3 子模块不再全包 bundle)
- 等效 tree shake 实际生效

**Prod 数字** (GH Pages 实际 gzip 压缩比 gzip -c 弱)：48,173 B / 超 warning +702 B (+1.5%) / 仍远 safe critical 56,964 B (-15%)。**接受 +1.5% 偏差入 backlog · 主线 B 启动期间一并 polish bundle 减肥**（最大头是 claims.json + nodes.json 直接 import 进 bundle / 85 KB raw / ~25 KB gzip / 可异步 fetch）。

### 2.2 Design A- + AI Slop A 沿用 M4 视觉

M5 没引入新视觉风格 / 100% 沿用 M4 spec § 4：
- ✅ 米白 #fcfaf6 + 墨黑 #1a1a1a + 紫 #5b3a8c 强调
- ✅ EB Garamond + Source Serif 4 + Noto Serif SC + Playfair Display（M5 加）
- ✅ **0 border-radius**（学术编辑硬约束 / spec § 4.1）
- ✅ **0 AI Slop pattern hit**（无紫渐变 / 无 3-column 卡片 / 无 centered everything / 无 system-ui display font）

M5 加的 zoom-control / arc-popover / breadcrumb / timeline 重设 都沿用同视觉系 / 没破规则。

---

## 3. Backlog（不阻塞 ship · 后续 milestone 处理）

### 3.1 ⚠ DR-069 弧线误选 bug（**4 轮专攻仍未解 · 升级 backlog 写专项 spec**）

| 字段 | 内容 |
|---|---|
| 现象 | PM 实操：想点 A 弧实际选 B / 远近都有 / **同色 type 弧重叠场景重灾区** |
| 已尝试（4 轮） | R1 hit overlay 16px / R3 几何最近 32 点采样 / R4 hover preview RAF / **R5 endpoint-aware 两阶段 picker + (5) hover label + endpoint 黄边高亮**（commit 0fd1869）— 全没解 |
| **新 RC11 假设** | 同 type 弧 visible stroke 视觉重叠时 / 几何最近 vs 视觉判定边界差异 / PM 视觉锚 cursor 所在 stroke / 几何选 endpoint-local 或 path-min 其他 |
| PM 4 轮典型错例 | 截图反馈："hover 路德维希 反对 卡尔·马克思 / floating label 显示 黑格尔 反对 卡尔·马克思"（同色 disagreement 重叠 / 两 source 不同 target 同） |
| 已沉淀价值（commit 0fd1869 ship） | (5) hover preview label + endpoint 黄边高亮 / PM hover 看 label 显示错可移开避免误 click（实战 UX fallback / 减少 commit 错的概率） |
| 后续路径 | 写专项 spec / B 阶段单独攻 / 候选攻法 (RC11 新方向): (a) visible stroke 中心距 (非 path)（同色弧排除）/ (b) 同色弧 cluster 内部 disambig 二级 UI 弹候选列表 / (c) hover sticky 一旦选中不漂移 / (d) ?debug=1 仍可启用 console log + `__arcPick` debug 工具 |

### 3.2 实施期累积其他 polish backlog

| ID | 描述 | 来源 |
|---|---|---|
| B3 mobile popover 5px overflow | 380px > 375 viewport | M4 ISSUE-002 / PM 表态"暂不升 A" |
| B4 Tablet sidebar bottom 与 timeline 撞 | 768×1024 视觉重叠 | M4 ISSUE-004 |
| Focus 模式 popover 关闭后焦点元素需回屏幕中心 | 偏左 190px（offset POPOVER_PX） | Stage 5 R0 DR-059 tradeoff |
| Bundle prod gzip +1.5% over warning | claims.json + nodes.json 直接 import 进 bundle / 可异步 fetch | M5 T10.3 baseline |
| Stage 5 R2 polish backlog | （已在 R0 顺便修 DR-059）| anchor § 1 |

### 3.3 主线 B 启动准备（spec § 2.2.2 顺序）

主线 A 完成 = 主线 B/C 基础就绪：
- ✅ zoom + pan 基础 / 主线 B 副窗（地理图）复用同 zoom 框架
- ✅ 时间游标 / 主线 B 副窗共享时间轴
- ✅ 右上预留位 / 主线 B header 重组（brand + 搜索 + 关于）/ 不破 M5 主线 A
- ✅ 数据 schema 不变 / 主线 B 时加 PersonNode + WorkNode 地理字段（PRD V1 已预留）

主线 B 启动前必读：
- [M5 spec § 2.2 4 区域归属图 + 衔接预留](../specs/2026-05-14-m5-linea-explorability-design.md)
- [PRD V1 § 4 副图地理 PRD trace 注释](./PRD.md)
- 本 takeaway § 1.1 PRD V1 覆盖率 + § 3 backlog

---

## 4. lessons 索引（memory cross-ref）

实施期 lesson 全部落 memory / takeaway 不重复 / 只索引：

| Stage | Memory 文件 | 核心 lesson |
|---|---|---|
| Stage 1 R1 | `feedback_m5_stage1_pm_checkpoint.md` | fit-to-content default + 点空白关详情 + 小手 pan + ⌂ reset / 4 立即修 vision-level |
| Stage 2 R2~R5 | `feedback_m5_stage2_implementation_lessons.md` ⭐ | 5 轮 PM checkpoint 修 13 issue / d3.zoom nopropagation 坑 / viewBox + meet 坐标 / race condition / 出快入慢 |
| Stage 3 R0~R5 | `feedback_m5_stage3_implementation_lessons.md` ⭐⭐ | **R1 vision pivot 颠覆双向锁定** / mockup 解 PM 看不懂 / 资深 UIUX 重设布局 / atomic commit 不强拆 |
| Stage 4 R0~R1 | `feedback_m5_stage4_implementation_lessons.md` ⭐⭐ | 焦点模式 / PM 答 AND 不答 OR / 复合 UX hover preview + click commit / 紧密重排复用 computePersonSectionPositions |
| Stage 5 R0~R4 | `feedback_m5_stage5_implementation_lessons.md` ⭐⭐⭐ | arc-popover 上下分栏 / pickNearestArc 几何最近 / hover preview / **DR-069 bug 3 轮修都失败 · 入 backlog · 后续攻法 hypothesis** / bug 同方向硬上 2 轮不解换 perspective |
| T10 ship | （本 takeaway § 2 ）| d3 集中 named re-export + lib/d3.ts pattern 跨过 bundle warning 137 B / qa textContent vs display:none 误判 lesson |

### 4.1 工作流 lesson（M5 累积 / 全局可复用）

1. **Vision-level 立即修 / Polish 入 backlog**（PM 验证 26 轮 checkpoint / 分类执行得力 / lesson `feedback_ai_challenge_pm_classification`）
2. **Mockup 解 PM 看不懂**（Stage 3 / Stage 5 都踩 / 文字 3 选 1 抽象交互必做 mockup / lesson `feedback_brainstorm_mockup_directness`）
3. **3 层 review 节奏**（TDD task 内 + 自审 stage 间 + PM checkpoint / lesson `feedback_inline_self_audit_stage_checkpoint`）
4. **Atomic commit 不强拆**（同文件同次改动逻辑相关时合并 / lesson Stage 3）
5. **Bug 同方向硬上 2 轮不解换 perspective**（DR-069 Stage 5 4 轮 / R3 几何 → R4 preview 同方向 / 应该早换 hit zone 几何）
6. **测试方法学 verify**：DOM `textContent` 不等于视觉可见（CSS display:none 时 textContent 仍存在 / 用 `offsetParent !== null` / `getBoundingClientRect()` 才靠谱）— **本次 T10.3 ISSUE-001 误报 catch / 在改代码前**

---

## 5. ship 验收 checklist

- [x] git tag m5-linea-final + push origin
- [x] GH Pages auto-deploy success (HEAD 198bfa2 / 6:42:45 GMT)
- [x] Prod HTTPS 200 OK
- [x] Prod console clean (0 errors)
- [x] Prod render 92 obs + 31 arc + 27 person section
- [x] Prod 6 用户旅程 work（zoom / obs / Esc / ⌂ / arc / timeline drag）
- [x] E2E 6/6 pass (local preview)
- [x] npm test 166/169 baseline 保持（3 fail M3 pre-existing）
- [x] lint + tsc clean
- [x] gstack 4 件套全跑（health 9.2 / Design A- / QA 96 / AI Slop A）
- [x] takeaway + memory + anchor 落档（本文件 + memory m5_linea_completion）

---

## 6. 下一步 PM 决策点

### 6.1 立即（不阻塞）

- DR-069 弧线误选 bug 专攻（推荐 hypothesis 5+2 / 1-2h）
- M5 Polish backlog 清单（§ 3.2）

### 6.2 中期（主线 B 启动）

- 主线 B brainstorm 启动（spec § 2.2.2 顺序）
  - header 重组 + 搜索 + 右上"关于"link
  - **右下副窗地理图**（PRD V1 silent drift catch）
  - mobile responsive（M4 4 件套决策 1 推 M5）
- 估时 2-2.5 周 / 启动时单独 brainstorm + spec

### 6.3 远期（主线 C）

- 多类型详情页（person / work / concept）
- person bio 事件式（PRD V1 必做）
- 12 个核心 concept "后来者发展旁注"
- 估时 2-3 周

---

**M5 主线 A ship 完成 · push HEAD `198bfa2` + tag `m5-linea-final` · prod https://cdu52802-xx.github.io/marx/ ✅**
