# M4 Closure · 4 件套 SUMMARY ⭐ M5 启动期 SSOT

> **触发**：2026-05-13 PM 选 A 跑 gstack 4 件套 baseline + report
> **完成**：2026-05-13 (Asia/Shanghai) · 4/4 全部 done
> **本文件用途**：4 个 report 综合 + M5 启动期决策输入 / 跨 report 交叉 findings / 立即修候选
> **关联**：[health-report](health-report.md) / [benchmark-report](benchmark-report.md) / [qa-report](qa-report.md) / [design-review-report](design-review-report.md) / [RUN-LOG](RUN-LOG.md)

---

## 1. 4 件套结论总表

| Skill | 时间 | 分数 / 等级 | 状态 | 关键 finding |
|---|---|---|---|---|
| `/health` | ~50s | **6.0/10 NEEDS WORK** | DONE_WITH_CONCERNS | 70 lint errors = `.claude/worktrees/*` 污染 / 22 tsc errors = TS5097 单一 config / 修 F1+F2 共 10 min → 8.5+ |
| `/benchmark` | ~3min | App **A+** / Page B（受网络拖累）| DONE | App bundle 38KB transfer 极轻 / FCP 4.4s 主要因中国 → GH Pages + Google Fonts 2.3s |
| `/qa-only` | ~10min | **90/100 GOOD** | DONE | 7 issue (4 backlog 复现 + **3 新发现**) / B1 fix verified work / B2 play 无暂停 + sidebar a11y + mobile sidebar 不 collapse |
| `/design-review` | ~8min | Design **B+ (84)** / AI Slop **A (95)** ⭐ | DONE | 6 finding · 明显不像 AI slop / 3 quick win 共 30 min → A- |

**总耗时**: ~22 min（远低于预估 30-90 min）

---

## 2. ⭐ 4 件套综合 ⭐

### 2.1 总评 / 一句话

Marx M4 **product 健康度高于初印象**：
- ✅ app 本身（视觉 / 功能 / bundle / B1 fix）扎实 / 不像 vibe coding 通常成品
- ⚠ 几个 **tooling config 假象**（lint worktree 污染 / tsconfig 严格 / Google Fonts 拖网络）让初看分数低
- ⚠ 几个 **真 issue**（B2 play 无暂停 / a11y 缺 / mobile responsive 未触达）落档 M5 polish

### 2.2 跨 report 交叉主题（**最重要 finding**）

| 跨 report 主题 | health | benchmark | qa-only | design-review | 综合判断 |
|---|---|---|---|---|---|
| **可访问性 a11y** | — | — | ISSUE-003 sidebar 无 ARIA | D-002 0 h1-h6 + D-004 sidebar | ⭐ **a11y 系统性短板** / 修复需 协调 |
| **Mobile responsive** | — | — | ISSUE-002 + 005 + 004 | D-006 D 等级 | ⭐ **mobile 未触达 / M5 决策大方向** |
| **字体管理** | — | F2 Google Fonts 125KB 拖 2.3s | font subset 119+ 文件 | D-005 Times New Roman leak | ⭐ **字体策略 polish 时机已到** |
| **Tooling config 健康** | F1 lint + F2 tsc | — | — | — | ⭐ go M5 前修 10 min |

⭐⭐ **3 个跨 report 主题 = M5 启动前 / 启动期必决策的关键点**

### 2.3 误判纠正记录（4 件套自身学到的）

| 误判 | 实际 | 教训 |
|---|---|---|
| qa-only 早期用 `.obs-tag` selector 判 "B1 cats filter 不工作" | 用对 `g.obs` selector 发现 filter **真生效** | **测 SVG 渲染 visibility 用 d3 mount 的 class 不是衍生 visual class** |
| health 0 lint warnings 期望 | 70 errors 全是 1 个 config 重复（gstack worktree 撞）| **gstack 自己装时副作用要前置评估** |
| benchmark FCP 4.4s 看似 app 慢 | 主因是中国 → GH Pages + Google Fonts subsetting | **从两端实测才能区分 app vs network cost** |

---

## 3. ⭐⭐ go M5 前推荐立即修候选（5 选 N · PM 拍板）

按 ROI 排序 / 全选共 ~60-90 min / 完成后 health/QA/design 三分都跳到 A 区间：

| # | 操作 | 来源 | 时间 | 影响 |
|---|---|---|---|---|
| 1 | **修 lint config worktree 污染** (`.eslintignore` 加 `.claude/`) | health F1 | 5 min | 70 errors → 0 / health 跳 ~7.5 |
| 2 | **tsconfig allowImportingTsExtensions: true** | health F2 | 5 min | 22 errors → 0 / health 跳 ~8.5 |
| 3 | **加 app `<header><h1>Marx · 思想史可视化</h1></header>`** | design-review D-001 + D-002 | 15 min | 一举 fix trunk test "what site is this" + a11y 主标题 + brand 首屏 |
| 4 | **修 B2 timeline play pause toggle** | qa-only ISSUE-001 | 10 min | functional 阻塞用户控制（HIGH 优先级）|
| 5 | **sidebar icons 加 aria-label** | qa-only ISSUE-003 + design-review D-004 | 10 min | a11y / keyboard / 屏幕阅读器 / 跟 D-001 一起做就齐了 |

**总投入**: 共 45 min 修 1-5 全套 → 期望分数：
- health: 6.0 → **8.5** (NEEDS WORK → CLEAN-ish)
- QA: 90 → **95+** (一些 high 降为 0)
- design-review: B+ → **A-**

**3 个备选**（不必立即修 / 推 M5 polish batch）：
- ISSUE-002 mobile popover 380>375 → M5 polish (PM 已表态 "暂不升 A")
- ISSUE-004 tablet sidebar/timeline 重叠 → M5 polish
- ISSUE-005 mobile sidebar 不 collapse → M5 polish
- D-005 SVG text font-family 兜底 → 2 min（也可现在做）
- D-006 全局 responsive 设计决策 → M5 主线 B 范围

---

## 4. ⭐⭐⭐ M5 brainstorm 时必带的 3 个决策输入

### 决策 1 · **Responsive 战略：desktop-only vs mobile 重设计**

**当前状态**：
- desktop: 编辑风站住（B+ design / 90 QA）
- mobile: D 等级 / 3 个 issue (B3 + 005 + 004) / **设计意图未明**

**3 选 1**：
- A · **desktop-only demo**：viewport meta + landing 注明"推荐桌面端" / mobile UX 不投入 / 接受现状 / 跟"学术编辑风 + 大屏阅读"目标对齐
- B · **M5 主线 B 范围 mobile 重设计**：header + footer + responsive layout + mini-map 一起做 / 工作量大 / 真覆盖移动用户
- C · **过渡方案**：mobile sidebar 自动 collapse + popover width clamp / 50% 投入 / 50% 体验 / 不是完整 mobile 设计

⭐ **建议**：M5 brainstorm 时直接 PM 拍板这一项 / 影响整个 M5 主线 B 范围

---

### 决策 2 · **App title / header 加在哪 layer**

**问题**：design-review D-001 缺 app title / 是 go M5 前必须解决的 first impression issue

**3 选 1**：
- A · **传统 HTML header**：`<header><h1>Marx 思想史</h1></header>` 在 #app 上方 / fixed top 30-40px 高 / 简单可靠
- B · **SVG header in canvas**：直接 SVG `<text>` 在主画布顶部 / 跟 layout 同步 zoom / 一致性强但 a11y 麻烦
- C · **现有 footer 致谢移除 + 顶部 brand**：现在右上是致谢 link / 容易被误解为 brand position / 重新组织 header/footer

⭐ **建议**：选 A（10 min 解决最多问题）+ M5 主线 B 时升级到 full editorial header（含 search + nav）

---

### 决策 3 · **A11y 投入度 / 静态可视化项目的标准是什么**

**当前缺口**：
- 0 semantic h1-h6 (D-002)
- 6 sidebar icon 无 ARIA (ISSUE-003 + D-004)
- Touch targets 全 < 44px (design-review § 4.6)
- SVG-based 可视化 + 屏幕阅读器 = 系统性问题

**3 选 1**：
- A · **最低 a11y 投入**：加 invisible h1 + sidebar aria-label / 不投入大量重写 / 容忍 SVG 可视化 a11y 天然差
- B · **WCAG AA 全套**：a11y audit 全套 / 触摸目标 + 颜色对比度 + keyboard navigation + ARIA / 工作量 1-2 周
- C · **声明 a11y 现状 + 后续改进**：landing 加 a11y statement "本 demo 主视觉为 SVG 可视化 / 屏幕阅读器支持有限 / 后续 PR 改进" / 诚实 + 可接受

⭐ **建议**：A（go M5 前的 5）+ M5+ 评估 B / 不当下做 / 跟"学术 demo 给老师/研究者看"目标 cost-effective

---

## 5. M5 三主线视角下的 4 件套输入

### 主线 A · 可探索基础设施（zoom + pan + 动态居中 + 时间轴改造）

**4 件套对 A 的输入**：
- benchmark: app bundle 38KB / 加 d3.zoom (~3KB) + 重排 layout 代码不会破 50KB transfer 警戒 ✓
- qa-only: B2 play 无暂停 → M5 时间轴改造 statement 必含 pause toggle ⭐
- design-review: D-001 缺 header → zoom 后 header 是否 fixed / 还是 SVG header 跟 zoom 同步 = 设计大决策
- health: 修 F1+F2 后 M5 zoom 代码不再被 tooling 误报阻碍

### 主线 B · 页面框架 + 地理图副视图

**4 件套对 B 的输入**：
- design-review D-001 + D-003 trunk test: header 必加 / 是 B 主线天然第一步 ⭐
- design-review D-005: SVG font-family 兜底 → B 加 mini-map 时 / 字体统一管理 mod 一起做
- qa-only ISSUE-002 + 005: mobile responsive 是 B 主线核心战场（决策 1 确定后才动）
- benchmark: 加 mini-map (~5-10KB d3 reuse) 不破 bundle 警戒 ✓

### 主线 C · 多类型详情页（ClaimNode polish + person/work/concept 详情页）

**4 件套对 C 的输入**：
- design-review: 当前 popover 是 hybrid 配色（编辑骨架 + brand 紫 + EB Garamond）/ M5 多类型详情页继续这套 ⭐
- qa-only: popover 视觉 + 配色 + 排版 ✅ 已 GOOD / M5 polish backlog T9 4 维度还可慢磨
- design-review § 12: DESIGN.md 创建建议 → M5 启动期由 `/design-consultation` 生成正式 design system 文档
- benchmark: 多详情页 code (~10-20KB) 不破 bundle ✓

---

## 6. 4 件套 baseline 数据点（M5 后跑对比用）

| 指标 | M4 closure baseline (2026-05-13) | M5 警戒线（25% regression）|
|---|---|---|
| Health composite | 6.0/10（修 F1+F2 后 8.5+）| 跌破 8.0 警示 |
| Bundle JS transfer | 38KB | **47KB** |
| Bundle CSS transfer | 126KB（含 Google Fonts）| 158KB |
| FCP (prod / 中国) | 4412ms | 5515ms |
| HTTP requests | 3 | 4-5 |
| QA health score | 90/100 | 跌破 80 警示 |
| Design score | B+ (84) | 跌破 B (80) 警示 |
| AI Slop score | A (95) | 跌破 B (85) 警示 ⭐ |

**M5 任一 milestone ship 前** → 重跑 4 件套 → 对比 baseline → 任一指标破警戒线 = 修了再 ship

---

## 7. gstack 配套工作流推荐（M5 期间用）

跨 4 件套学到的 gstack 应用模式 / 适合 Marx 项目：

| 时机 | Skill | 价值 |
|---|---|---|
| M5 spec / plan 写完后 | `plan-ceo-review` + `plan-eng-review` + `plan-design-review` + `plan-devex-review` | 4 视角 review M5 plan 防 vision drift |
| M5 主线 C 详情页前 | `design-consultation` | 生成正式 `DESIGN.md`（替代散落 spec § 7）|
| M5 brainstorm 视觉变体 | `design-shotgun` | 多设计变体 dim board / 决策 1 + 2 实战 |
| M5 task 实施期 bug 频 | `investigate` | 系统性 debug / Iron Law 不修症状 |
| M5 重要决策点 | `codex` consult | "200 IQ 二意见" / 跨模型验证 |
| M5 上线时 | `ship` + `land-and-deploy` + `canary` + `document-release` | 替代手工 git workflow + deploy 监控 |
| 月度 | `cso` daily / `learn` | 安全 + 项目学习沉淀 |

---

## 8. 落档 / cross-link 计划

本 4 件套完成后 / 4 个 report + RUN-LOG + 本 SUMMARY 共 6 文件 / 落入 `docs/m4-closure-reviews/` 已就绪。

**接下来 commit 把这 6 文件落 git** → 跨窗口续接时新 AI 读：
1. `docs/2026-05-11-m4-progress-anchor.md`（M4 anchor）
2. `docs/2026-05-13-m4-takeaway.md`（M4 takeaway SSOT）
3. **`docs/m4-closure-reviews/SUMMARY.md`** ⭐ 本文件（4 件套综合）
4. `docs/m4-closure-reviews/RUN-LOG.md`（4 件套进度状态 + 跨窗口续接）
5. 各 report 按需深入

**anchor + takeaway 加一行 cross-link** 指向本 SUMMARY → M5 启动期 PM 看 anchor 时立即知道有这套 baseline 数据 + 决策输入

---

## 9. PM 决策窗口

### Option A · **修立即修候选 1-5 共 45 min → 重跑测试 → commit → go M5**
- 推荐 ✓
- M5 启动期 baseline 干净 / health 7.5+ / 不带 lint 假象
- B2 play 修了 / first impression header 修了 / a11y 主要缺口修了

### Option B · **只修 1+2+3（lint + tsconfig + header）共 25 min → commit → go M5**
- 部分修
- B2 + a11y 留 M5 polish
- 更快进 M5

### Option C · **不修 / 直接 commit 4 件套 reports → go M5**
- 接受当前 baseline
- 立即修候选全推 M5 polish batch

⭐ **AI 推荐**: A 或 B（不推 C / 因 B2 + header 价值高 + cost 低）/ PM 拍板

---

**SUMMARY 完成 ✅**

⏸ 等 PM:
- 选 A / B / C 之一（或自定义组合）
- 或发 `go M5` 接受当前 baseline 进 M5 brainstorm
- 或新反馈 / 新方向
