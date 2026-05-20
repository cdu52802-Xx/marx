# Marx M-B 主线进展 · 新窗口续接锚点（2026-05-20）

> **状态**：B brainstorm 完成 / Phase 0-1 完成 / **B1 Stage 1-2 完成** / Stage 3 待启动（PM checkpoint 前）
> **用途**：新窗口续接 SSOT / 30 秒重建上下文
> **当前 HEAD**：`9d38dbc`（Stage 1 + divider 修 + anchor 落档 · Stage 2 commit pending）
> **Git**：clean / origin/main 同步
> **Prod**：https://cdu52802-xx.github.io/marx/

---

## 1. 已完成（2026-05-20 当日）

### Phase 0 · M5 backlog 清（commit 6719ef6）
- ✅ DR-069 PM 决策 A+D（不强攻 / 推 B 主线统筹 / R5 hover label 兜底实战 UX）
- ✅ Bundle 减肥 vite `?url` + top-level await fetch / JS gzip 47.04 → 30.83 KB / -34.5%

### Phase 1 · B spec 草案（commit 4426a68）
- ✅ specs/2026-05-20-m-b-mainline-design.md v1（涵盖 B1/B2/B3 + 8 个新 DR）
- ✅ PM ack（回 A）

### B1 plan（commit b4ecd29）
- ✅ plans/2026-05-20-marx-m-b1-header-search.md（5 stage / 14 task TDD breakdown）

### B1 Stage 1 完成（commit 3f96f5a → divider 修 9d38dbc）
- ✅ T1.1 header scaffold（src/components/header.ts mountHeader function）
- ✅ T1.2 link 重组（删 index.html footer / 视觉灵感 + 关于 + 互换 迁到 header-controls）
- ✅ T1.3 互换按钮 placeholder（disabled / B2 启用 hook）
- ✅ PM Stage 1 checkpoint：视觉沿用 M4 米白透明（PM 选 B）/ 4 反馈处理（见 § 2）

### B1 Stage 2 完成（commit pending · 搜索 UI / 1.5 天 / 实际 1 个会话）
- ✅ T2.1 src/components/search.ts · paper 风格输入框（米白 + 沙石灰金 border + EB Garamond 13px / placeholder italic）
- ✅ T2.2 src/components/search-result-popover.ts · 下拉候选浮窗（max 8 / 沿用 claim-popover 视觉系 / type 4 类区分 claim/person/event/location）
- ✅ T2.3 键盘导航 · ↑↓ wrap 选 / Enter 无选中默认选第 1 个 + hide / Esc 关 / hide 后 keyHandler detach
- ✅ main.ts wire up + stub search（substring 匹配 claim.claim_text + name_zh + person.name_zh / 取前 8 / T3.1 真 search-index 替换）
- ✅ Tests +28（search.test.ts 7 + search-result-popover.test.ts 21）/ 全量 201/204（3 pre-existing M3）/ lint 0 warning
- ✅ Bundle gzip 32.08 KB（baseline 30.83 + 1.25 / 预算 ≤35 KB 内）
- ✅ 浏览器实测（1280×800 桌面）：搜索 "马克" → 8 候选弹窗 / ↓↓ 高亮第 2 / Enter onSelect + hide / Esc hide

---

## 2. PM Stage 1 checkpoint 反馈（2026-05-20）

| # | 反馈 | 处理 |
|---|---|---|
| 1 | header 跟画布无分界线别扭 | ✅ **立即修** vision-level / styles.css body::before 加 0.5px 沙石灰金 fixed divider top:50 |
| 2 | ↔ 互换按钮 low / 设计感不够 | ⏳ **backlog · B2 Stage 6 polish** / 后期统筹 |
| 3 | 关于 link modal 内容未定 | ⏳ **backlog** / 等 PM 后补内容方向 |
| 4 | 视觉灵感 denizcemonduygu 文字 OK | ✅ no change |

补充 PM 指示（记下 B2 实施期落实）：
- 借鉴知名网站样例 + philosophy_vis 参考（朋友项目 https://github.com/Sia12345678/philosophy_vis）
- 调 skill + 找素材学习 / 设计更好方案
- gstack 等 skill 自行判断调用

---

## 3. 下一步 · Stage 3 · 搜索逻辑（1 天 / T3.1-T3.2）

> Stage 2 PM checkpoint 待 PM 实测确认（见 § 2.2）后启动 Stage 3。

按 plan T3.1-T3.2：

### T3.1 · `lib/search-index.ts` fuzzy match（3-4h）
- exact + Levenshtein 简化版 + 多目标 indexing（claim text / 节点名 / 事件名 / 地点名）
- 返回 SearchResult { type / id / label / matched / score }
- score 排序 / exact match 优先
- **替换 main.ts 里的 stubSearch / 同时移除 stub function**
- label 处理优化：去掉 JS slice(0, 32) / 让 CSS ellipsis 自动截断（避免双重截断丑）

### T3.2 · debounce 200ms（1-2h）
- search.ts onInput → debounce wrapper → 调 search-index
- 250ms 不卡 / 中英文打字流畅

### Stage 3 PM checkpoint
- 打字流畅（200ms debounce 不卡）
- 候选 list 显示对的（中文 / 英文 / 高亮匹配区间 — 高亮 backlog T2.2 留位）
- 排序合理（exact match 优先 / fuzzy score 排）

### Stage 2 阶段产出（落档）

**新增文件**：
- `src/components/search.ts` (NEW · 35 行)
- `src/components/search-result-popover.ts` (NEW · 168 行 / 含 T2.3 键盘)
- `tests/unit/search.test.ts` (NEW · 7 test)
- `tests/unit/search-result-popover.test.ts` (NEW · 21 test)

**修改文件**：
- `src/main.ts` (MOD · import + mountSearchInput + mountResultPopover + stubSearch 函数)
- `src/styles.css` (MOD · .search-input + .search-result-popover/-item/-kicker/-label 视觉)

---

## 4. 新窗口续接 step（按顺序 · 30 秒重建）

```bash
1. cd F:\AI\projects\Marx
2. git pull origin main         # 同步本 anchor + Stage 1 + divider 修
3. 读 AGENTS.md                 # 项目级 agent context · 三件套硬约束
4. 读本 anchor（你正在读）       # B1 Stage 1 完成 + Stage 2 待启动
5. 读 docs/2026-05-20-b-mainline-brainstorm-decisions.md  # B 主线 brainstorm SSOT
6. 读 specs/2026-05-20-m-b-mainline-design.md             # B spec v1
7. 读 plans/2026-05-20-marx-m-b1-header-search.md         # B1 5-stage plan
8. 读 memory MEMORY.md          # 自动加载 / 含 m-b 系列条目
9. PM 一句话 "go Stage 2" → AI 立即按 plan T2.1 开工
```

---

## 5. 工作流约束（沿用 / 不重复）

- spec-first（AGENTS.md 铁律）
- atomic commit + push（双机协作生命线）
- 中文 commit message 走 -F 文件方式
- 3 层 review（TDD task 内 + Stage 间自审 + PM checkpoint）
- vision-level 立即修 / polish 入 backlog
- mockup 解 PM 看不懂（visual companion 用 / 重要交互必画 mockup）
- chain push 拒（git add / commit / push 分开跑）
- M5 累积 lessons 复用（memory feedback_m5_* 系列）

---

## 6. 验证数据 baseline（Stage 2 完成时）

| 维度 | Stage 1 | Stage 2 | Δ |
|---|---|---|---|
| Tests | 173/176（+7 new header / 3 fail M3） | 201/204（+7+21 新 / 3 fail M3） | +28 |
| Lint | 0 warning | 0 warning | — |
| Build gzip | 31.21 KB | **32.08 KB** | +0.87 KB / 预算 ≤35 KB 内 |
| 4 件套 baseline | M5 ship 时 Health 9.2 / QA 96 / Design A- / AI Slop A | 待 B1 ship 重跑 | — |

Stage 5 (B1 ship 时) 跑 4 件套 baseline 对比 M5。

---

## 7. Backlog（B 主线累积）

| 来源 | 内容 | 处理 |
|---|---|---|
| Stage 1 PM #2 | ↔ 互换按钮设计感 | B2 Stage 6 polish |
| Stage 1 PM #3 | 关于 link modal 内容 | 等 PM 后补 |
| M5 takeaway § 3.2 | DR-069 弧线误选 | B2 期间统筹（已 PM A+D 决策） |
| M5 takeaway § 3.2 | B3 mobile popover 5px overflow | B3 整合 |
| M5 takeaway § 3.2 | B4 tablet sidebar 跟 timeline 撞 | B3 整合 |
| M5 takeaway § 3.2 | Focus popover 关后焦点回中心 | B3 整合 |

---

## 8. 跨窗口续接简单确认句

> "我在新窗口续接 Marx · B 主线 / B brainstorm + Phase 0/1 + B1 Stage 1 完成 / 进 Stage 2 搜索 UI / 读 docs/2026-05-20-m-b1-progress-anchor.md + brainstorm-decisions.md + B1 plan"

AI 应立即按 § 3 Stage 2 plan + T2.1 开工。
