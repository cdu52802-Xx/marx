# Marx M-B 主线进展 · 新窗口续接锚点（2026-05-20 ~ 2026-05-21）

> **状态**：B1 Stage 1-2-3 ship 完成 + 2 PM bug 修 / **Stage 4 待启动**（PM "go Stage 4" 拍板已收到）
> **当前 HEAD**：`6719672`（Stage 3 outside click bug 2 R2 修 / 2026-05-21）
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

---

## 3. 下一步 · Stage 4 · 主图高亮 + filter chip + 副图 hook（0.5-1 天）

> PM "A" 拍板（2026-05-21）· `go Stage 4` 已收到 · 新窗口立即按 T4.1 开工

按 plan T4.1-T4.3：

### T4.1 · 主图 highlight API（2-3h）
- `highlightObs(claimId)` → 紫圈高亮 + opacity fade 其他
- `clearHighlight()`
- search popover `onSelect` → highlightObs（替换现 console.log placeholder · main.ts line ~1430）
- 测试：unit + 浏览器实测搜→选→主图高亮联动

### T4.2 · filter chip dropdown（2-3h · 可能简化）
- spec § 3.3 写过 filter chip / 但探索形态 chip 已内嵌（§ 主要人物 + § 核心概念 + § 关键时段）
- **实施期 PM checkpoint 决**：还需独立 chip dropdown 吗 / 或并入探索 chip？
- AI 主动 challenge PM 优化 / 不一味实现

### T4.3 · 副图 highlight hook event（1h）
- dispatch custom event `marx:search-highlight` { type, id }
- B1 期间无 listener / B2 实现 listener 接收
- 单元测 dispatchEvent + 浏览器 console verify

### Stage 4 PM checkpoint
- 搜索框选候选 → 主图 obs 紫圈高亮 + fade 其他
- filter chip 工作（如保留）
- 副图 event console.log 看到（B2 启用 listener）

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

| 维度 | Stage 1 | Stage 2 | Stage 3 | Stage 3 + outside fix（当前 HEAD） |
|---|---|---|---|---|
| Tests | 173/176 | 201/204 | 259/262 | **270/273** |
| Lint | 0 | 0 | 0 | **0** |
| Build gzip | 31.21 KB | 32.08 KB | 33.95 KB | **34.01 KB**（预算 ≤35 KB 内 / 还剩 0.99 KB）|
| 4 件套 baseline | — | — | — | 待 B1 ship 重跑 |

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
| M5 takeaway | DR-069 弧线误选（4 轮修未解）| B2 期间统筹（PM A+D 不强攻）|
| M5 takeaway | B3 mobile popover 5px overflow / B4 tablet sidebar 撞 / Focus popover 焦点回中心 | B3 整合 |

---

## 8. 跨窗口续接简单确认句

> "我在新窗口续接 Marx · B1 Stage 1-2-3 + outside click 修 全部 ship（HEAD 6719672）/ PM 已 `go Stage 4` / 立即按 T4.1 主图高亮开工 / 读 docs/2026-05-20-m-b1-progress-anchor.md + spec v2 + plan Stage 4"

新窗口 AI 应立即按 § 3 Stage 4 T4.1 plan 开工 · 不再等 PM 二次确认（PM 已拍板）。
