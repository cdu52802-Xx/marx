# Marx M-B 主线进展 · 新窗口续接锚点（2026-05-20 ~ 2026-05-21）

> **状态**：B1 Stage 1-4 全 ship + 4 轮 PM bug/polish 修（DR-084 详情卡让出 header / DR-085 双层 hover / DR-086 search 直达详情卡 / DR-087 obs click 选中 visual indicator）/ **Stage 5 待启动**（E2E + 4 件套 baseline + ship）
> **当前 HEAD**：见 `git log -1 --oneline`（最新含 DR-087 polish · 2026-05-21）
> **Git**：clean / origin/main 同步
> **Prod**：https://cdu52802-xx.github.io/marx/
> **Mockup**：https://cdu52802-xx.github.io/marx/m-b1-search-ux-mockup.html

---

## 1. 已完成（B1 / 2026-05-20 ~ 2026-05-21）

### Phase 0 · M5 backlog 清（`6719ef6` / 2026-05-20）
- DR-069 PM A+D · 不强攻 / 推 B 主线统筹
- Bundle 减肥 vite `?url` + top-level await fetch · 47.04 → 30.83 KB · -34.5%

### Phase 1 · B spec + B1 plan（`4426a68` + `b4ecd29` / 2026-05-20）
- `specs/2026-05-20-m-b-mainline-design.md` v1 → v2（PM mockup 拍板后升级）
- `plans/2026-05-20-marx-m-b1-header-search.md` 5 stage / 14 task → 16 task

### B1 Stage 1 · header 重组（`9d38dbc` / 2026-05-20）
- header.ts scaffold / link 重组 / 互换按钮 placeholder
- PM 5 反馈：divider 立即修 + 其他 polish backlog

### B1 Stage 2 · 搜索 UI（`fa1c2ef` / 2026-05-20）
- search.ts + search-result-popover.ts + 28 test
- stub search wire up（T3.1 替换）

### B1 mockup · 高保真双形态对比（`bffcae4` / 2026-05-20）
- `public/m-b1-search-ux-mockup.html` · 3 panel 对比 · paper 风格高保真 · 真实 claims.json 数据

### B1 spec v2 升级（`854bc30` / 2026-05-20）
- spec § 3.3 双形态 + 分组 + 概念命中段
- § 3.4 视觉 polish placeholder（PM 美观度反馈 / 留 ship 前）
- DR-078~081 落档

### B1 Stage 3 · 搜索逻辑（`363a62d` + `e973c12` / 2026-05-21）
- T3.1 `lib/search-index.ts` fuzzy match（exact 100 / prefix 80 / substring 60）· +16 test
- T3.2 `search.ts` debounce 200ms · +3 test
- T3.3 popover 双形态升级（showExplore + showGrouped + 紫高亮 em）· +19 test
- T3.4 `lib/search-curate.ts`（MAIN_PERSONS 7 + CORE_CONCEPTS 8 + KEY_PERIODS 4）· +20 test

### B1 outside click 关闭 + 2 PM bug 修（`76facab` + `0716461` + `6719672` / 2026-05-21）
- 加 outside click 关浮窗（PM A · 不豁免工具栏）· +10 test
- Bug 1 修：listener 改 **capture phase**（防主画布 obs/arc click handler 的 stopPropagation 拦截 · DR-082）· +1 test
- Bug 2 修：input.focus + click 都监听 reopenSearchPopover + isOpen guard（input 焦点未失场景 focus event 不 fire）

### B1 Stage 4 · 主图 obs 高亮 + 副图 hook event（`7590d8c` + `522b04b` / 2026-05-21）
- **T4.1** `7590d8c`：`highlightObs(claimId)` 紫圈+fade · `clearSearchHighlight()` 复原 · onSelect wire claim type · onClose wire 清高亮
  - 视觉沿用 highlightArcAndDots pattern（米白 #fcfaf6 stroke / r=5 / width=2 · NORMAL=1 / FADED=0.15）
- **T4.2** ❌ DELETED · DR-083 / PM "如有更合适筛选方案后面专题设计" / 留 B1 V2 backlog
- **T4.3** `522b04b`：window dispatch `marx:search-highlight` { type, id } · B2 副图 listener 接收
- 浏览器实测 ✓：搜"异化"→ 选 claim-marx-013 → obs 紫圈 + 其他全 fade + dispatch event listener 收到 detail
- Bundle 34.13 KB gzip（+0.12 from baseline · ≤35 预算 / 剩 0.87 KB）

### B1 polish · obs click 选中 visual indicator（DR-087 / 2026-05-21）

PM 反馈：obs click 选中后 / 画布无 visual indicator / 用户视线回画布找不到刚选的那条。

**资深 UIUX 视角**：commit selection 标配 visual indicator（Figma 蓝框 / 邮件蓝底 / link visited）

**方案 X1（PM 拍板 A）**：obs click → **紫圈 stroke + obs-text font-weight 700 加粗**（保深灰不变色 / 克制 editorial 风）·**不淡显其他**

**跟 search 选定区别**：
| 元素 | search 选定（DR-086）| obs click 选定（DR-087）|
|---|---|---|
| obs-dot 紫圈 stroke | ✓ | ✓ |
| obs-text 加粗 | ✓（同步加 / 一致性）| ✓ |
| fade 其他 | ✓（筛选辅助）| ✗（不打扰其他）|

视觉一致原则：紫圈+加粗 = "当前选中谁"（commit 标记）/ fade = "正在筛选"（独立维度）

**何时清紫圈+加粗 5 路径**（PM 拍 A+B+C+D+E 全部）：
- A · 点画布空白（既有 restoreArcOpacity）✓
- B · 详情卡 × 按钮（DR-087 加 onClose callback）✓
- C · Esc 关详情卡（同 B 走 hideClaimPopover）✓
- D · 点另一 obs 切换（obs click handler restoreArcOpacity 清旧 + 加新）✓
- E · 搜索栏选新主张（search 路径 dispatch obs click 同 D）✓

**hover 跟紫圈交互**（PM Q2 A）：紫圈+加粗保留 / hover 触发 hover preview 叠加 / leave 回 commit 状态

**派生改动**：
- ClaimPopoverContext 加 `onClose?: () => void`
- claim-popover.ts hideClaimPopover 内调 `_onCloseCallback`
- main.ts obs click handler 传 `onClose: () => restoreArcOpacity()`
- restoreArcOpacity 末尾追加清 `obs-text font-weight`
- highlightObs（search 路径）同步加 obs-text 加粗（视觉一致）

**浏览器实测 ✓**（D click / B ×关 / A 空白 / C Esc / E search 全 5 场景）：
| 场景 | a1 stroke | a1 weight | popover |
|---|---|---|---|
| D obs click | #fcfaf6 | 700 | open ✓ |
| B × 关 | null | null | closed ✓ |
| C Esc 关 | null | null | closed ✓ |
| A 点空白 | null | null | closed ✓ |
| E search 选 | #fcfaf6 | 700 | open ✓（+89 fade）|
| hover B1 | #fcfaf6 (保留) | 700 (保留) | open ✓（88 fade · A1+B1 圈子并集）|
| leave B1 | #fcfaf6 (保留) | 700 (保留) | open ✓（回 89 fade · A1 圈子）|

**baseline**: Lint 0 / Tests 270/273 / Bundle 34.42 KB gzip（+0.09 from DR-086 · ≤35 / 剩 0.58 KB）

---

### B1 polish · search onSelect 直达详情卡（DR-086 / 2026-05-21）

PM 反馈：搜索栏点击具体主张时 / 已算用户想看 detail / 应同时展开详情卡。

**方案选型**（trade-off）：
- A · inline 复制 obs click 流程到 onSelect（~60 行 duplicate · 且 computeFlyTransform 是 sectionG.each 闭包局部 / 外部 ReferenceError 被吞）
- B · 抽 helper showClaimDetail · obs click + onSelect 复用（refactor 既有 obs click · risk 中）
- **C · dispatch obs click event 复用 + 立即 re-apply highlightObs**（推荐 · 10 行 · 0 risk · 0 duplicate）✅

**C 方案视觉无闪**：
- dispatch click → obs click handler 同步跑（restoreArcOpacity 清 search · hideArcPopover · flyTo · showClaimPopover 创建 aside）
- 立即 highlightObs(id) 同步 re-apply 紫圈 + applyHoverPreviewFiltering
- 浏览器 paint 是 next frame · 取 highlightObs final state → 用户察觉不到中间 reset 帧

**实测 ✓**：
- 搜"异化" + click claim-marx-013 → claim popover open (dataId=claim-marx-013 / top=54) · a1 紫圈 + 89 fade · search popover 自动 hide
- 回归 obs click 不破：另一 obs click → 弹自己详情卡 · 主图全 normal
- Esc → 详情卡关 + 清 search 双重效果 ✓

**baseline**: Lint 0 / Tests 270/273 / Bundle 34.33 KB gzip（+0.04 from DR-085 · ≤35 / 剩 0.67 KB）

---

### B1 polish · search commit + hover transient 双层状态机（DR-085 / 2026-05-21）

PM 反馈 3 issue 一波修（资深 UIUX 双层状态机方案）：

**4 状态机**：
| 状态 | 触发 | 视觉 |
|---|---|---|
| 0 默认 | 进入 / Esc / 点空白 / 画布点 obs | 全 92 obs normal |
| 1 search A1 | 搜索栏选 A1 | A1 + 关联 obs + 提出者 person normal · 其他 fade · A1 obs-dot **紫圈** |
| 1+ search A1 + hover B1 | 状态 1 hover B1 | A1 圈子 ∪ B1 圈子 normal · 其他 fade · A1 紫圈 / B1 **无圈**（区分 commit vs transient） |
| 0+ hover B1（无 search） | 默认时 hover B1 | B1 圈子 normal · 其他 fade · 无紫圈 |

**实施**：
- `searchFocusClaimId: string \| null` state（main.ts line 869）
- highlightObs 复用 `applyHoverPreviewFiltering(computeFocusSet(id))` 含 person（DR-085 坑 1 一致性）
- obs `mouseenter` / `mouseleave` handler · 合并 searchSet ∪ hoverSet
- clearHoverPreviewFiltering 加 searchFocus guard（坑 2 · 详情卡 hover button leave 不丢 search）
- restoreArcOpacity 末尾追加 applyTimelineFiltering（Issue 3 fix · 清 g.obs opacity 残留）
- 全局 `document keydown Esc` listener（state1 时 popover 已关 / 补 detach Esc）
- search popover z:20 → 1100（Issue 1 · 高于详情卡 1000）
- focus mode 下 hover 不触发（`if (inFocusMode) return`）

**视觉区分**：A1 搜定 = 紫圈 stroke / B1 hover = 仅 opacity normal 无圈 → 用户能分清"哪个是搜的、哪个是鼠标当下指的"

**浏览器实测 ✓**（92 obs / 状态切换正确）：
- state0 → hover A1 → 3 normal / 89 fade · 无紫圈
- leave → 92 normal · 全恢复
- search A1 → 3 normal / 89 fade · A1 紫圈
- state1 + hover B1 → **4 normal / 88 fade** · A1 紫圈 + B1 无圈 ✓
- leave B1 → 回 state1（3 normal）✓
- Esc / 点空白 / 画布点 obs → 全 92 normal 清 search ✓
- 详情卡 z:1000 / 搜索浮窗 z:1100 ✓

**留 backlog**：focus mode + search 同存 corner case（罕见 + PM 没明确意图 / 后面专题处理）

**baseline**: Lint 0 / Tests 270/273（pre-existing）/ Bundle 34.29 KB gzip（+0.14 from DR-084 · ≤35 预算 / 剩 0.71 KB）

---

### B1 PM bug 修 · 详情卡让出 header（DR-084 / 2026-05-21）
PM 报告：右侧详情卡展开遮挡 header 工具栏（搜索栏 + brand + 关于 link）。

**根因**：claim-popover + arc-popover 用 `top:0` + `z-index:1000` / header `top:14` + `z-index:9` → 详情卡从屏幕顶起 + z 高于 header = 覆盖 header 整个右上 76px 区域。
M4 写详情卡时 header 还是 occupier placeholder / B1 Stage 1 header 1st-class 化后暴露遗漏。

**资深 UIUX 视角 3 方案 → 选 A**（落 DR-084）：
- A · layout 让位 ✅：详情卡 `top:0 → top:54px`（跟 breadcrumb top:54 视觉对齐 / 跟 spec § 2.1 4 区域 layout 图一致）
- B · z-index 让位：详情卡背景仍铺到顶 / 视觉混乱
- C · 详情卡 padding-top:70：背景仍遮 header

**派生修**：outsideHandler 白名单补 `.header-controls` + `.header-brand` + `.search-result-popover` / 点搜索栏不关详情卡（同既有 sidebar/zoom-control/timeline 工具栏属性）。

**修改文件**：claim-popover.ts + arc-popover.ts + claim-popover.test.ts（断言同步）

**实测 ✓**：
1. 点 obs 弹详情卡 → top=54 / header 完全可见
2. 详情卡打开状态下 click 搜索栏 → 详情卡不关 + 搜索 popover 开
3. 输"异化"+ 选候选 → highlightObs 触发 + 详情卡保持 + 搜索 popover 关
4. Bundle 34.15 KB gzip（+0.02 from Stage 4 · ≤35 预算 / 剩 0.85 KB）

---

## 2. PM checkpoint 反馈累积

### 2.1 Stage 1 反馈（2026-05-20）
- divider 立即修 / 互换按钮 polish 入 B2 backlog / 关于 link 内容等 PM 后补

### 2.2 Stage 2 + mockup 拍板（2026-05-20）
- 方案 A · 双形态 popover（探索 + 已知分组）/ DR-078
- curate 清单按建议默认（7 人 / 8 概念 / 4 时段）
- 美观度 polish 留 ship 前（PM "真正用过才能找到方案" / DR-079）
- 3 待决项默认（概念精确匹配 DR-080 / max 4 折叠实施期决 / V1 仅字面高亮）
- stub 保留不动 / T3.1 一次性替换

### 2.3 Stage 3 ship 后反馈 + 2 bug 修（2026-05-21）
- PM 加"点空白关闭"（PM A · 不豁免工具栏）
- **Bug 1** · 点画布不关 → 根因主画布 obs/arc click stopPropagation（src/main.ts line 273/754/816 防关详情卡）→ event 不 bubble → bubble phase listener 收不到 → 改 **capture phase** 解决 / DR-082
- **Bug 2** · Esc 关后再 click 不重开 → 根因 input 焦点未失 → focus event 不 fire → focus listener 不触发 → 加 **click event listener** 兜底 + `isOpen()` guard 防 flicker
- 实测"阶级"出 11 组超 spec § 7 max 4 / 留 ship 前决断

### 2.4 Stage 4 实施期 challenge（2026-05-21）
- AI 主动 challenge T4.2 filter chip → PM A 拍板砍 / DR-083 落档
- 砍掉理由：探索 chip + author_id 分组已覆盖筛选 / B1 数据维度不够 / header 36px 已挤 / "后面专题设计"
- 留 B1 V2 backlog 跟中英映射高亮一起 V2 专题处理

---

## 3. 下一步 · Stage 5 · E2E + 4 件套 baseline + ship（0.5 天）

> Stage 4 已 ship（2026-05-21）· 等 PM "go Stage 5" 启动

按 plan T5.1-T5.2：

### T5.1 · E2E 新加 4 spec（2-3h）

`e2e/m-b1-header-search.spec.ts`（新建）：
1. 搜索打字 "异化" → popover 候选 list 显示（concept 段 + claim items + group）
2. 候选 click → 主图 obs 紫圈 + fade（验证 stroke=#fcfaf6 / opacity=0.15）
3. Esc → 浮窗关 + 高亮清（obs-dot stroke=null / opacity=1）
4. ~~filter chip~~（砍 · DR-083）/ **替补**：空 query → 探索形态 3 段 chip / chip click → 自动填搜索框 + 切结果形态

### T5.2 · 4 件套 baseline + ship（1-2h）

- npm test + lint + build（baseline 保持 / 数字落档）
- gstack 4 件套（health + benchmark + qa + design-review）跑一遍 · 跟 M5 baseline 对比 / 不退化
- `docs/2026-05-XX-m-b1-takeaway.md` 写 takeaway（含 Phase 0/1 + B1 Stage 1-5 lessons / DR-078~083 落档 / backlog 给 B2）
- 美观度 polish（DR-079 · Stage 3 ship 前留的 placeholder）实施期 PM checkpoint 决（字体 hierarchy / 间距 rhythm / 配色 / 微动效）
- AGENTS.md 三件套 frontend-design + ui-ux-pro-max skill 主动召唤
- atomic commit + push + tag `m-b1-final`

### Stage 5 PM checkpoint = ship
- B1 prod 部署 OK（GH Pages auto deploy）
- 6 user journey 实测验收（spec § 3.7 Acceptance v2 全 GREEN）
- 4 件套 baseline 不退化（Health ≥ 9 / QA ≥ 96 / Design ≥ A- / AI Slop ≥ A）
- PM 美观度反馈处理（DR-079）

---

## 4. 新窗口续接 step（按顺序 · 30 秒重建）

```bash
1. cd F:\AI\projects\Marx
2. git pull origin main
3. 读 AGENTS.md                  # 项目级 agent context
4. 读本 anchor                   # 你正在读
5. 读 specs/2026-05-20-m-b-mainline-design.md v2 § 3.3-3.7（双形态 + Stage 4 acceptance）
6. 读 plans/2026-05-20-marx-m-b1-header-search.md Stage 4 章节（T4.1-T4.3）
7. memory MEMORY.md 自动加载（含 m-b-stage2-3 条目）
8. PM 已说 "go Stage 4" → AI 立即按 T4.1 开工（TDD red → green）
```

---

## 5. 工作流约束（沿用 / 不重复）

- spec-first / atomic commit + push / 中文 commit -F 文件方式 / 3 层 review
- vision-level 立即修 / polish 入 backlog（DR-079 美观度等 ship 前）
- mockup 解 PM 看不懂（before/after 对比 + 真实数据 + 红线 annotation）
- chain push 拒（git add / commit / push 分开跑 / classifier 误判）
- M5 + B1 累积 lessons 复用（memory feedback_m5_* + m-b-* 系列）
- AI 主动 challenge PM 反馈分类（实现遗漏 vs polish）

---

## 6. 验证数据 baseline

| 维度 | Stage 1 | Stage 2 | Stage 3 | Stage 3 + outside fix | **Stage 4（当前 HEAD）** |
|---|---|---|---|---|---|
| Tests | 173/176 | 201/204 | 259/262 | 270/273 | **270/273**（无新增测 / Stage 4 是 wire up）|
| Lint | 0 | 0 | 0 | 0 | **0** |
| Build gzip | 31.21 KB | 32.08 KB | 33.95 KB | 34.01 KB | **34.13 KB**（预算 ≤35 KB / 剩 0.87 KB）|
| 4 件套 baseline | — | — | — | — | 待 B1 ship 重跑 |

3 fail tests 是 pre-existing M3 baseline（concept successor notes range）/ 持平 / 非 B1 引入。

---

## 7. Backlog（B 主线累积）

| 来源 | 内容 | 处理 |
|---|---|---|
| Stage 1 PM #2 | ↔ 互换按钮设计感 | B2 Stage 6 polish |
| Stage 1 PM #3 | 关于 link modal 内容 | 等 PM 后补 |
| Stage 3 PM | 美观度 / 字体 / 间距 / 配色 polish（DR-079）| B1 ship 前 polish 阶段 |
| Stage 3 PM | max 4 组人物折叠（spec § 7）· 实测"阶级"出 11 组超 4 | 实施期 PM checkpoint 决 |
| Stage 3 PM | keywords 命中但 claim_text 不含 query 时不高亮 / 看着诡异 | V2 backlog（中英映射也 V2） |
| Stage 4 challenge | filter chip 砍掉 / DR-083 | **B1 V2 专题设计**（跟中英映射 V2 一起） |
| DR-085 corner case | 焦点模式 + search 同存（罕见 PM 没明确意图）| **B2 / B3 阶段或专题** |
| M5 takeaway | DR-069 弧线误选（4 轮修未解）| B2 期间统筹（PM A+D 不强攻）|
| M5 takeaway | B3 mobile popover 5px overflow / B4 tablet sidebar 撞 / Focus popover 焦点回中心 | B3 整合 |

---

## 8. 跨窗口续接简单确认句

> "我在新窗口续接 Marx · B1 Stage 1-4 全 ship + PM bug 修 DR-084（详情卡让出 header · top:54）/ 等 PM `go Stage 5` 启动 E2E + 4 件套 baseline + B1 ship / 读 docs/2026-05-20-m-b1-progress-anchor.md + spec v2 + plan Stage 5"

新窗口 AI 续接时不动代码 · 等 PM 拍 `go Stage 5` 再启 T5.1。
