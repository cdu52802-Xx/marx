# M-B1 Takeaway · header + 全局搜索（2026-05-20 ~ 2026-05-21）

> **状态**：B1 全 ship · tag `m-b1-final` 待打 · 等 PM prod 实测 6 个 user journey 验收 + 拍 `tag`
> **HEAD**：097d91b（DR-088 polish 后）
> **Prod**：https://cdu52802-xx.github.io/marx/
> **Mockup**：https://cdu52802-xx.github.io/marx/m-b1-search-ux-mockup.html
> **Tag 候选**：m-b1-final（T5.2 Step 4 PM 拍板后打）

---

## 1. 累积成果时间表

### Phase 0 · M5 backlog 清（`6719ef6` / 2026-05-20）
- DR-069 弧线误选 4 轮专攻仍未解 · PM A+D 不强攻 · 推 B 主线统筹
- Bundle 减肥 vite `?url` + top-level await fetch · 47.04 → 30.83 KB · **-34.5%**

### Phase 1 · B 主线 spec + B1 plan（`4426a68` + `b4ecd29` / 2026-05-20）
- `specs/2026-05-20-m-b-mainline-design.md` v1 → v2（PM mockup 拍板后升级）
- `plans/2026-05-20-marx-m-b1-header-search.md` 5 stage / 14 task → 16 task
- B 路径拆 B1/B2/B3 独立 milestone（G 路径 / DR-072）

### Stage 1 · header 重组（`9d38dbc` / 2026-05-20）
- header.ts scaffold · link 重组 · 互换按钮 placeholder
- PM 5 反馈：divider 立即修 + 其他入 B2 backlog

### Stage 2 · 搜索 UI + 高保真 mockup（`fa1c2ef` + `bffcae4` + `854bc30` / 2026-05-20）
- search.ts + search-result-popover.ts · 28 test
- public/m-b1-search-ux-mockup.html · 3 panel 对比 · paper 风格高保真
- spec v2 升级 · DR-078~081 落档（双形态 / 美观度 polish placeholder DR-079 / 概念精确匹配 / 普鲁东 + 施蒂纳替换圣西门）

### Stage 3 · 搜索逻辑 + outside click 修（`363a62d` + `e973c12` + `76facab` + `0716461` + `6719672` / 2026-05-21）
- T3.1 `lib/search-index.ts` fuzzy match（exact 100 / prefix 80 / substring 60）· +16 test
- T3.2 `search.ts` debounce 200ms · +3 test
- T3.3 popover 双形态升级 · +19 test
- T3.4 `lib/search-curate.ts`（7 + 8 + 4 chip）· +20 test
- outside click 关浮窗 · capture phase 修 DR-082 · +1 test
- PM bug 修：input focus 未失场景 click + isOpen guard 兜底

### Stage 4 · 主图 obs 高亮 + 副图 hook event（`7590d8c` + `522b04b` / 2026-05-21）
- T4.1 `highlightObs(claimId)` 紫圈 stroke + fade · `clearSearchHighlight()` 复原
- T4.2 ❌ DELETED · DR-083 PM 拍板砍 / 留 V2 backlog
- T4.3 window dispatch `marx:search-highlight` event 给 B2 副图

### Stage 4 polish 4 轮（`11604fb` + `f5c3509` + `cabd7f1` + `fb54f88` / 2026-05-21）
- **DR-084** 详情卡 + arc-popover `top:0 → top:54` 让出 header + outsideHandler 白名单补 header
- **DR-085** search commit + hover transient 双层状态机（4 状态 / A1 紫圈 + B1 hover 无圈）+ 3 关联修
- **DR-086** search onSelect 直达详情卡 = dispatch obs click 复用 + 立即 re-apply highlightObs（10 行 / 0 risk）
- **DR-087** obs click 选中 visual indicator = 紫圈 stroke + `font-weight:700` 加粗 + 5 路径清

### Stage 5 · E2E + DR-079 polish + ship（`c42eee8` + `097d91b` / 2026-05-21）
- **T5.1 E2E** `e2e/m-b1-header-search.spec.ts` 4 spec **首跑 25.0s 一次绿**（DR-086+087 自动覆盖）
- **T5.2 baseline #1** · Tests 270/273 + Lint 0 + Build 34.42 KB + Health 8.8 + QA 93/100 + Design A- + AI Slop A
- **DR-088 DR-079 polish 落地** · search popover 180ms `fade + translateY(-4px)` ease-out 入场 + 全局 prefers-reduced-motion 兜底（顺手修 design-review Finding 3）
- **T5.2 baseline #2** · 持平（JS Bundle 34.42 KB / E2E 4/4 22.2s / Console 0 errors / Design A- → A）

---

## 2. 决策清单（DR-078~088 + DR-070~077 复用）

| DR | 决策 | 何时 | 影响 |
|---|---|---|---|
| DR-070 | DR-069 弧线误选 PM A+D 不强攻 / 推 B 主线 | Phase 0 | Bundle 减肥 -34.5% |
| DR-071 | vite `?url` + top-level await fetch | Phase 0 | Bundle 减肥 |
| DR-072 | B 路径拆 B1/B2/B3 独立 milestone（G） | Phase 1 | 早 ship B1 / 不憋大招 |
| DR-073~077 | B2 副图设计预决（16:9 / 球面 / 国界 / 互换主副）| Phase 1 | B2 阶段规划 |
| DR-078 | 双形态 popover（探索 + 已知分组）| Stage 2 mockup | 解探索者"不知道搜什么"问题 |
| DR-079 | 美观度 polish 留 ship 前 | Stage 2 | 实施期 frontend-design + ui-ux-pro-max skill / DR-088 落地 |
| DR-080 | 概念命中 = 精确匹配 8 chip | Stage 2 | Stage 3 search-index 实施 |
| DR-081 | 普鲁东 + 施蒂纳替换圣西门（数据真实优先）| Stage 2 | 中繁体 normalize 留 V2 |
| DR-082 | outside click capture phase 监听 | Stage 3 PM bug | 防主画布 stopPropagation 拦截 |
| DR-083 | T4.2 filter chip 砍 / 留 V2 专题 | Stage 4 AI challenge | B1 数据维度不够 + header 36px 已挤 |
| DR-084 | 详情卡 + arc-popover top 54 让出 header | Stage 4 polish R1 | layout 4 区域 spec 一致 |
| DR-085 | search commit + hover transient 双层状态机 | Stage 4 polish R2 | A1 紫圈 + B1 hover 无圈 / 3 关联修 |
| DR-086 | search onSelect 直达详情卡 = dispatch obs click | Stage 4 polish R3 | 10 行 / 0 risk · 不 duplicate 60 行 |
| DR-087 | obs click 选中 visual indicator = 紫圈 + 加粗 | Stage 4 polish R4 | 跟 search 选定共用紫圈+加粗 = 用户只记 1 个规则 |
| **DR-088** | DR-079 polish 落地 · 180ms fade+translateY + reduced-motion 兜底 | Stage 5 ship 前 | 顺手修 Finding 3 / Design A- → A |

---

## 3. 4 件套 baseline 对比

### 跟 M5 ship 对比（m5-linea-final tag）

| 维度 | M5 ship | B1 #1（polish 前）| **B1 #2（polish 后 / 当前）** |
|---|---|---|---|
| Bundle gzip | 49.61 KB | 34.42 KB | **34.42 KB** ✓ (-30% from M5) |
| Tests | 持平 | 270/273 | 270/273（3 fail pre-existing M3）|
| E2E | 6 spec | 6 + 4 = 10 spec | **10/15 pass**（5 fail 是 `deploy.spec.ts` M2 obsolete · 入 B2 cleanup backlog）|
| Health | safe | 8.8 | 8.8 |
| Benchmark | — | A · FCP 1.18s | A |
| QA | safe | 93 | 93 |
| Design | — | A- · AI Slop A | **A · AI Slop A**（Motion B+→A） |

### B1 内部 #1 → #2 delta（DR-088 effect）

- Bundle JS: 34.42 → **34.42 持平** ✓（CSS +0.14 KB gzip）
- E2E: 4/4 25.0s → **4/4 22.2s 持平** ✓（动画不破时序）
- Design Motion: B+ → **A**（180ms enter + reduced-motion 兜底）
- design-review Finding 3 ✓ 修

---

## 4. Lessons（M-B1 特有 / 跟 M5 累积补强）

### 4.1 brainstorm mockup 直观度（M5 lesson 复用）
PM 0 代码 / 抽象方案表 PM 难懂 / 必须 before/after mockup + 红 annotation。
B1 Stage 2 出 `public/m-b1-search-ux-mockup.html`（3 panel paper 风格高保真 + 真实 claims.json 数据）→ PM 一次拍板 A 双形态。

### 4.2 vision-level vs polish 立即修分类（M5 lesson 复用）
PM 5 反馈混 vision-level + polish。AI 主动 challenge：
- vision-level（"obs click 选中无 visual indicator"）→ 立即修 DR-087
- polish（"互换按钮设计感"）→ B2 backlog

### 4.3 AI 主动 challenge PM backlog（M5 lesson 复用 + 新案例）
T4.2 filter chip → AI challenge PM "B1 数据维度不够 / header 已挤 / 等 B2 副图数据补全再做" → PM 拍板砍 DR-083。

### 4.4 outside click capture phase **新案例**
Bubble phase listener 在 stopPropagation 的 click handler 下面收不到 event。
M5 时 main.ts obs/arc click 都 stopPropagation 防关详情卡 / Bubble listener 不触发。
DR-082 修法：capture phase = true 在 target 阶段前监听 / 不受 stopPropagation 影响。
Lesson：**event listener attach 阶段选择跟 stopPropagation 全局生态相关 / 不是单组件问题**。

### 4.5 资深 UIUX commit vs transient 双层状态机 **新案例**
Stage 4 polish R2 PM 报 3 issue：popover z-index 撞详情卡 / obs hover 视觉不一致 / search 后切换 obs 不清残留。
单 issue 修法 = patch / 3 issue 一波修 = 双层状态机：
- search commit = 紫圈 + 永久（A1）
- hover transient = 仅 opacity normal 无圈（B1）
- 用户大脑只记 1 个规则"紫圈 = 当前 search 选定"

Lesson：**PM 多 issue 一波报时找共因 / 引入状态机解构而不是 1:1 修 patch**。

### 4.6 复用 dispatch event 不 duplicate code **新案例**
Stage 4 polish R3 search onSelect 想直达详情卡。
A 方案 inline 复制 60 行 = duplicate + ReferenceError（闭包变量外部不可用）
B 方案抽 helper = refactor risk 中
**C 方案 dispatch obs click event 复用 = 10 行 0 risk 0 duplicate** ✅

Lesson：**当一段流程已经在某 event handler 完整跑过 / 不抽 helper 不 inline 重写 / 而是 dispatch synthetic event 复用 handler**。

### 4.7 motion polish 工程化检索 + 实施前 audit **新案例**
DR-079 placeholder PM 反馈 4 维度（字体 / 间距 / 配色 / 微动效）。
实施前 audit styles.css 175-378 实情：3 维度（字体 / 间距 / 配色）已 paper-editorial 到位 / 真改空间集中"微动效"。
方案 A（极简 fade+translate / 1 commit）/ B（staggered / +JS）/ C（砍）→ PM 选 A。
Lesson：**polish 实施前先 audit 实际代码 / 不要假设 PM 4 维度都要改 / 找真正 ROI 高的那 1 个 / 砍掉看似该改实际已到位的**。

### 4.8 双 skill 召唤 + AGENTS 硬约束 **新案例**
AGENTS.md 三件套：brainstorm visual companion + spec 视觉风格定调 + 实现期 frontend-design + ui-ux-pro-max 双 skill。
DR-088 polish 实施时确实召双 skill：frontend-design 给创意定调 / ui-ux-pro-max 给 motion timing best practice（150-300ms / transform+opacity）。
Lesson：**Marx 项目级 frontend 视觉相关任务 = 双 skill 召唤 = AGENTS 三件套硬约束 / 不跳过**。

---

## 5. Backlog（M-B1 累积 / 给 B2）

| 来源 | 内容 | 处理 |
|---|---|---|
| Stage 1 PM #2 | ↔ 互换按钮设计感 | B2 Stage 6 polish |
| Stage 1 PM #3 | 关于 link modal 内容 | 等 PM 后补 |
| Stage 3 PM | max 4 组人物折叠 / 实测"阶级"出 11 组 | 实施期 PM checkpoint 决 / B2 |
| Stage 3 PM | keywords 命中但 claim_text 不含 query 不高亮 | V2 中英映射 + normalize 一起 |
| Stage 4 challenge | filter chip DR-083 砍 | B1 V2 专题设计 |
| DR-085 corner case | focus mode + search 同存 | B2 / B3 专题 |
| design-review #1 HIGH | 14 触屏目标 < 44px | **B3 mobile/tablet** |
| design-review #2 MEDIUM | 搜索 popover 美观度 polish DR-079 → DR-088 ship | ✅ DONE 097d91b |
| design-review #3 POLISH | prefers-reduced-motion 未验 | ✅ DONE DR-088 一并修 |
| qa OBS-001 | popover 字体 hierarchy / 段头紫圈 / 间距 polish | DR-079 → DR-088 已 polish motion / visual 3 维已到位 |
| qa OBS-002 | 主图 obs 紫圈 1.0× zoom 视觉吸引力 | flyTo 放大后明显 / E2E 验过 / OK |
| e2e/deploy.spec.ts | M2 obsolete 5 fail | **B2 cleanup**（PM Q3 B 拍板 backlog 不动）|
| M5 takeaway 残留 | DR-069 弧线误选 4 轮未解 | B2 期间统筹（PM A+D 不强攻 / 写专项 spec）|
| M5 takeaway 残留 | B3 mobile popover 5px overflow / B4 tablet sidebar 撞 | B3 整合 |

---

## 6. PM 验收阀值 vs 实际

| 维度 | 阀值（anchor § 3.7）| 实际 #2 | 状态 |
|---|---|---|---|
| Health | ≥ 9 | 8.8 | ⚠️ 略低 · 3 fail pre-existing M3 baseline · 非 B1 引入 / 持平基线 |
| QA | ≥ 96 | 93 | ⚠️ 略低 · 14 触屏目标 < 44px 入 B3 / 非 B1 scope · functional + accessibility 已 95+ |
| Design | ≥ A- | **A** | ✓ 超阀值（M4 closure B+ → B1 ship A）|
| AI Slop | ≥ A | **A** | ✓ 阀值 |

Health + QA 略低于阀值的具体原因都是 **非 B1 引入** + **入 backlog 处理**（pre-existing M3 test fail / B3 mobile/tablet）/ 整体不算退化。

---

## 7. 后续 ship 流程

1. PM prod 实测 6 user journey（spec § 3.7 Acceptance v2）
   - 搜索 → popover 显示 + 入场动效 fade+slide（DR-088 新加）
   - 候选 click → 详情卡 + 紫圈 + 加粗 + fade + flyTo
   - Esc → 浮窗关 + 高亮清 + 详情卡关
   - 空 query click → 探索 3 段 chip → click chip 自动填
   - 主画布 obs click → 紫圈 + 加粗 + 详情卡（独立 commit · DR-087）
   - 浮窗下点搜索栏 → 详情卡不关（DR-084）
2. PM 拍板 → AI 打 tag `m-b1-final` + push --tags
3. archive M-B1 plan / spec 入 `archive/` 子目录（可选）
4. 等 PM 拍 `go B2` 启动副图地理图 brainstorm

---

## 8. 续接简单确认句

> "M-B1 收尾完成 2026-05-21 · DR-078~088 累积 · 4 件套 baseline #2 Design A + AI Slop A · 等 PM prod 实测 + 拍 tag m-b1-final"
