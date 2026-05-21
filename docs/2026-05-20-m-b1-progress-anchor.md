# Marx M-B 主线进展 · 新窗口续接锚点（2026-05-20 ~ 2026-05-21）

> **状态**：B1 Stage 1-2-3-4 全 ship 完成 / **Stage 5 待启动**（E2E + 4 件套 baseline + ship）
> **当前 HEAD**：`522b04b`（T4.3 副图 hook dispatch event / 2026-05-21）
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
| M5 takeaway | DR-069 弧线误选（4 轮修未解）| B2 期间统筹（PM A+D 不强攻）|
| M5 takeaway | B3 mobile popover 5px overflow / B4 tablet sidebar 撞 / Focus popover 焦点回中心 | B3 整合 |

---

## 8. 跨窗口续接简单确认句

> "我在新窗口续接 Marx · B1 Stage 1-4 全 ship（HEAD 522b04b · T4.2 砍 DR-083 / T4.1+T4.3 ship）/ 等 PM `go Stage 5` 启动 E2E + 4 件套 baseline + B1 ship / 读 docs/2026-05-20-m-b1-progress-anchor.md + spec v2 + plan Stage 5"

新窗口 AI 续接时不动代码 · 等 PM 拍 `go Stage 5` 再启 T5.1。
