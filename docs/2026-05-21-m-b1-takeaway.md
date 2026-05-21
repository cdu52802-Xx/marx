# M-B1 Takeaway · header + 全局搜索（2026-05-20 ~ 2026-05-21）

> **状态**：**M-B1 全 ship · tag `m-b1-final` 已打**（2026-05-21 晚 · PM 全 polish 7 batch 实测留 + 拍 `go tag`）
> **HEAD**：`fd8b545`（D2 hotfix · GH Pages deploy success 52s）
> **Tag**：`m-b1-final` → fd8b545
> **Prod**：https://cdu52802-xx.github.io/marx/
> **Mockup**：https://cdu52802-xx.github.io/marx/m-b1-search-ux-mockup.html
> **相关 anchor**：[polish-anchor](./2026-05-21-m-b1-polish-anchor.md)（polish 阶段 SSOT）/ [progress-anchor](./2026-05-20-m-b1-progress-anchor.md)（实施期 SSOT · 已归档参考）

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

## 8. polish 阶段 7 batch 收尾（DR-088~096 · 2026-05-21 晚）

ship 后 PM prod 实测反馈："1. 搜索入场动效没看到；2. 详情卡飞入飞出消失；3. 网页 low / 没高级感 / 不留人 / 不吸引继续用。" 进入 polish 修订阶段。

### 8.1 polish 7 batch 完整时间表

| Batch | DR | commit | 内容 | PM 拍 |
|---|---|---|---|---|
| **DR-088** | revert (5345810) | DR-088 加全局 `*` `@media (prefers-reduced-motion: reduce)` 顺手修 design-review Finding 3 / 触发 Win10 默认 reduce-motion 全 transition 被 kill | ❌ revert |
| **D1** | DR-089 | `08c9ffc` | search popover 180ms fade+translateY entry · 不加全局 reduced-motion | ✅ 留 |
| **B5** | DR-090 | `a18e89a` | header link padding + chip padding + 全局 `:focus-visible` halo + 副标题 11→12px（D13-D20 audit 7 项基础修正）| ✅ 留 |
| B2 | DR-091 | 5a429c0 | 文字类 hover letter-spacing 舒展 4 处 | ⚠ 后撤 / B6 修 |
| **B3** | DR-092 | `2d7fc0f` | button 类 hover scale + glow 4 处（zoom + sidebar + tl-play + 详情卡 ×）| ✅ 留 |
| **B4** | DR-093 | `3c1727a` | 详情卡 hierarchy（H2 line-height + Entfremdung 间距 + CTA hover bg 反相）| ✅ 留 |
| **D9** | DR-094 | `0046c88` | obs 紫圈 spring scale 0.5→1.2→1.0 / 220ms cubic-bezier | ✅ 留 |
| **B6** | DR-095 | `6fc4485` | 撤 B2 letter-spacing → underline draw-in + left border slide-in（::after scaleX/scaleY · GPU 合成 / 不破 layout）| ✅ 留 |
| **D2** | DR-096 | `744f8c6` + hotfix `fd8b545` | search popover 退场 120ms fade + translateY(-2px) up · `hide({immediate})` 分流防 race · CSS `@keyframes search-popover-exit` + `.popover-closing` | ✅ 留 |

### 8.2 polish 阶段 Bundle 变化

| commit | JS gzip | CSS gzip | 累积 delta |
|---|---|---|---|
| c42eee8 ship baseline | 34.42 KB | 1.72 KB | — |
| **fd8b545 D2 (final)** | **34.58 KB** | **2.33 KB** | JS +0.16 / CSS +0.61 |

**Bundle 最终**：JS 34.58 KB / 上限 35 KB / 剩 **0.42 KB** ✓

### 8.3 4 件套 baseline 终态（M-B1 全 ship + polish 7 batch）

| 维度 | M5 ship | B1 ship #2 | **B1 final（polish 7 batch）** |
|---|---|---|---|
| Bundle gzip | 49.61 KB | 34.42 KB | **34.58 KB** ✓ (-30% from M5) |
| Tests unit | 持平 | 270/273 | **276/279**（+6 D2 new test 全过 / 3 pre-existing M3）|
| Tests E2E | 6 spec | 10 spec | **10 spec**（4 B1 + 6 M5 sanity · `deploy.spec.ts` 5 fail M2 obsolete 入 B2 cleanup）|
| Design grade | — | A · AI Slop A | **A · AI Slop A**（polish 后 motion + hover hierarchy 全 A）|

---

## 9. Lessons 累积 6 条（polish 阶段新增 / 跟实施期 8 lessons 互补）

### 9.1 ⚠ DR-088 Windows 10 默认 reduce-motion 教训

**事件**：DR-088 加全局 `*` `@media (prefers-reduced-motion: reduce) { transition-duration: 0.01ms !important }` 顺手修 design-review Finding 3 / 但 **Win10 系统默认开启"减少动画效果"** → Chrome/Edge 检测后 `prefers-reduced-motion: reduce` 返回 true → 全局规则激活 → 详情卡 inline transition + hover transition 全 kill → 用户体验崩溃。

**教训**：
1. **检测平台默认值**：Windows 10/11 默认 reduce-motion 与 macOS 默认 no-preference 不同 · Win 用户做 motion polish 前必须先测
2. **不用全局 `*` 规则**：reduced-motion 应针对装饰性动画（search popover fade）/ 不包装"essential motion"（详情卡 slide / hover 反馈）
3. **PM 优先于 WCAG AAA**：PM 自由意志想看动效 / 严格 WCAG 让 reduce-motion 用户看不到 fade-in / 应让 PM 决定 trade-off

### 9.2 ⚠ design-review skill 评分 ≠ PM 主观感受

**事件**：B1 ship 前 design-review 跑出 **A-** + AI Slop **A** / 我认为是 ship-ready / PM 实测后说 "low / 没高级感"。

**教训**：
1. **skill rubric 是参考 / 不是绝对**：design-review 用 weighted rubric / 不 capture "细节用心 / 高级感 / 留人" 这种主观感受
2. **PM 主观感受 = ground truth**：再高的 letter-grade 都没 PM 一句"low"分量重
3. **审视风格根本假设**：editorial-academic 风是 PM 早期 brainstorm 选的 / 实际用过后 PM 觉得"静谧 ≠ 高级感" / 应在 ship 前 PM 实测时 question 这个假设

### 9.3 ⚠ letter-spacing hover 在紧凑元素上 low + 撑 layout

**事件**：B2 给 chip / claim-item / search-item / header-link 加 letter-spacing 0.02 → 0.04-0.06em hover 展开。PM 反馈 "弹得 low / 没设计感 / 搜索浮窗跟着加宽别扭"。

**教训**：
1. letter-spacing 在紧凑 inline 元素上视觉是"被推开"/ 不优雅 / 偏 SaaS 套路（"AI Slop"中容易出现的微动效）
2. 任何影响 layout 字段的 hover effect 都会撑 container · popover 这种 dynamic width 容器会跟着抖
3. editorial 杂志风的优雅 hover = **underline draw-in + left border slide-in**（B6 修订方向）：`::after` absolute 定位 + `scaleX/scaleY` transform / 不破 layout / GPU 合成 / 28ms cubic-bezier(0.4, 0, 0.2, 1)

### 9.4 polish buffet 7 batch atomic 顺序 B 流程

**事件**：PM 选 "全部做 + 顺序 B 一个个" / 我列 5 batch 后实施 / 又 hotfix B6（PM 不喜欢 B2）/ 又加 D2 7/7 完成。

**教训**：
1. **CSS-only batch 低 risk 一波多 D**（B5 4 项 / B3 4 项）· 每 batch 1 commit / PM 1 次实测拍板 / 节省 PM 时间
2. **JS 改动单 D 单 commit**（D1 entry / D9 spring / D2 exit · 各 1 commit）· 风险隔离 / 易 revert
3. **GH Pages CDN cache 5-10 分钟刷新** + Win10 浏览器 cache 顽固 · 教 PM Ctrl+F5 + DevTools Network "Disable cache" + Application Storage clear
4. **PM "看不到效果" 不等于 CSS 没生效**：先用 browse hover + css 命令查 computed style 验证 / 数据说话 / 然后让 PM 排查 cache

### 9.5 主动 audit ≠ 等 PM 列违规

**事件**：PM 补丁说 "基础 UIUX 准则你也要主动 audit / 行间距 / 紧贴边缘 / 不能只盯 PM 强调的点"。

**教训**：
1. PM 列的是 D-buffet 12 项（飞入飞出 / hover 等显式动效）/ 我用 browse JS audit 出 8 项 PM 没提的基础违规（D13-D20）
2. **audit 工具链**：browse + JS 测 text overflow / line-height ratio / padding 紧贴 / focus-visible rules
3. **资深 UIUX 视角**：不只做 PM 强调的 / 主动查 PM 视野盲区

### 9.6 ⚠⚠ **新增 · D2 deploy gap 教训**（ship 流程改进）

**事件**：D2 commit `744f8c6` push 后我立即跑 ship 报告 "全验证 / Bundle / unit / e2e / preview 全过 / 等 PM 实测"。但 **GitHub Actions Deploy workflow 18s 就 fail** —— ESLint `--max-warnings=0` 把 test 文件末尾一个多余空行 (prettier `Delete ⏎` warning) 当 error 拒了。**prod 还停在 B6 旧版本**。PM Ctrl+F5 看到的是 B6 状态，反馈 "没看到效果"。我以为 PM 测错位置或者 cache 问题 / 实际是 prod 根本没部署 D2。

**教训（ship 流程硬约束）**：
1. **push ≠ ship**：commit push 只是触发 deploy / deploy 可能 fail / fail 时 prod 不更新
2. **ship 完成必须等 deploy success**：`gh run watch <run-id> --exit-status` 显式等 GH Actions 部署完且 success 才算真 done
3. **`--max-warnings=0` 严格模式**：prettier `Delete ⏎` `Insert ⏎` 这种格式 warning 也会拒 deploy / 本地 `npm run lint` 必须 0 warning 才 push（不是 0 error）
4. **修法**：每次 push 后 background `gh run watch` · 等通知再报 ship done · 失败立即 fix + 再 push（这次 hotfix `fd8b545` 删 trailing 空行）
5. **PM 没看到效果 ≠ 测错位置 / cache 问题**：先查 `gh run list` deploy 状态 / 是 fail 就立即修 / 不要让 PM 反复刷新等 cache

---

## 10. 后续 ship 流程（M-B1 完成 → B2 待启）

- ✅ tag `m-b1-final` 已打 / push origin · HEAD fd8b545
- ✅ takeaway 更新（本文件 · 含 polish 7 batch + 6 lessons）
- ⏸ archive M-B1 plan / spec 入 `archive/` 子目录（可选 · PM 未要求 / 沿用当前位置）
- ⏸ 等 PM 拍 `go B2` 启动副图地理图 brainstorm（visual companion + 双 skill 召唤 + spec 视觉风格定调）

---

## 11. 续接简单确认句

> "M-B1 全 ship + tag `m-b1-final` (fd8b545) · 2026-05-21 · DR-078~096 累积 · polish 7 batch 全 PM 留 · Bundle 34.58 KB / Test 276 + 4 E2E / Design A · 6 lessons 落档 · 等 PM 拍 `go B2`"
