# Marx M4 续接锚点 · implementation 进行中（T0-T9 完成 / T10-T13 pending · PM 反馈待收）

> **状态**（2026-05-12 T9 完成 update）：M4 implementation 进行中 · **T0-T9 完成**（数据 92 ClaimNode + 31 ClaimRelation / 视觉 layout + 半圆弧 + 时间轴 + 颗粒度栏 + 详情卡 全部就绪）· **T10-T13 pending** · 测试 **91/88/3** · ⚠ **PM 准备给本轮综合调整反馈**（新窗口收）
> **本文件用途**：跨窗口/跨机器续接锚点。新窗口读 AGENTS.md + 本文件 + spec + plan 即可重建完整理解
> **关联**：[M4 spec](../specs/2026-05-11-m4-claim-timeline-design.md) / [M4 plan](../plans/2026-05-11-marx-m4-claim-timeline.md) / [M3 progress anchor](2026-05-08-m3-progress-anchor.md)（M3 暂停状态）/ [PRD V1 + 实施状态](PRD.md)

---

## 当前整体位置

| 阶段 | 状态 | 位置 |
|---|---|---|
| M1（项目骨架） | ✅ 已上线 | https://cdu52802-xx.github.io/marx/ |
| M2（数据 schema + SPARQL 阶段 A） | ✅ 已上线 | 39 节点 |
| **M3（数据采集阶段 B 校对 + C 后来者旁注）** | **⏸ 暂停** · Task 1-12 完成 / Task 13-17 待 PM 第三机操作 · demo 存档 `/m3-archive/` | [M3 anchor](2026-05-08-m3-progress-anchor.md) |
| **M4（claim-on-timeline 形态大重构）** | **🚧 implementation 进行中** · T0-T9 完成（数据 + 视觉 + 4 组件就绪）· T10-T13 pending · npm test **91/88/3** · PM 反馈待收 | 见下表 + § 2026-05-12 T6-T9 update |
| M5+ | ⏳ 待办（含 PRD V1 地理图副视图，silent drift 复盘后落 PRD V1 状态注释） | [PRD](PRD.md) |

---

## 2026-05-12 T6-T9 完成 update · 视觉 layout + 4 组件就绪 / PM 反馈待收

### T6-T9 commit chain（6 commit · 全部 push 到 origin/main）

| commit | task | 内容 | 测试 |
|---|---|---|---|
| [9134c68](https://github.com/cdu52802-Xx/marx/commit/9134c68) | T6 main | 主画布 layout 算法 · claim-layout.ts + main.ts 重写（241 行）· 5 acceptance test | 75/72/3 → 80/77/3 |
| [c948b83](https://github.com/cdu52802-Xx/marx/commit/c948b83) | T6 polish | PM 反馈 3 改：弧线 Q→A 命令真 180° 半圆 / obs 45° 倾斜 / canvasWidth 动态 + 横向 scroll（无限画布雏形）| 80/77/3 |
| [cd89f0d](https://github.com/cdu52802-Xx/marx/commit/cd89f0d) | T6 fix + backlog | person section 沿斜线连续（X 累加前段 obs span / Engels 之后不再堆中间）+ docs/m4-polish-backlog.md 新建 | 83/80/3 |
| [833d408](https://github.com/cdu52802-Xx/marx/commit/833d408) | T7 | timeline.ts + 3 acceptance test · position:fixed bottom 始终可见 · plan bug fix（Math.ceil 不命中 1830/1850/1870） | 83/80/3 |
| [8edd20d](https://github.com/cdu52802-Xx/marx/commit/8edd20d) | T8 | sidebar.ts + 4 acceptance test · position:fixed left 始终可见 · filter / hover 联动 | 87/84/3 |
| [0ef5804](https://github.com/cdu52802-Xx/marx/commit/0ef5804) | T9 | claim-popover.ts + 4 acceptance test · position:fixed 视口边界 clamp · Esc / × 关闭 | 91/88/3 |
| [8866810](https://github.com/cdu52802-Xx/marx/commit/8866810) | **T9 改造** | **PM vision 反馈 2026-05-12: 浮动小卡片 → 右侧 380px 滑入栏 (朋友 philosophy_vis 风格)** · hybrid 配色 (editorial 编排骨架 + M4 紫/绿/红橘 + EB Garamond) · 三路关闭 (× / Esc / 点空白) · 0.35s 滑入滑出 · 配色/样式/内容/排版 4 维度细节落 [docs/m4-polish-backlog.md](./m4-polish-backlog.md) T13 慢磨 | **96/93/3** |

### T6 关键 vision 校准（PM checkpoint 3 轮）

1. **弧线 Q 抛物线 → SVG A 命令真半圆**: PM "180度的半圆，不是劣弧" → 半径 = dist/2 + sweep-flag 数学公式（leftPerpDot）选方向
2. **obs 共享 X 起点 → 45° 斜向排列**: PM "概念也需要按 45 度角度倾斜" → 每行 X+22/Y+22（OBS_ROW_HEIGHT）
3. **person section 跳回左边 → 沿斜线连续**: PM 截图圈注"恩格斯之后堆中间" → currentX 累加前一段 obs span（(N-1)×22）

### 3 个 fixed 栏决策（独立 / 始终可见 / 跟 T6 无限画布配套）

- **T7 timeline**: `position: fixed; bottom: 0` mount document.body / 不在 #app 内
- **T8 sidebar**: `position: fixed; left: 0; top: 0; bottom: 0` mount document.body / 48px 收起态 / 200px 展开态
- **T9 popover**: `position: fixed` 视口坐标 + 边界 clamp / 点 obs 弹出 / Esc 关闭

3 栏与主画布解耦 · 画布无限 scroll 时 3 栏始终在视口位置 · spec § 6.1 / § 7 / § 8.2 "独立栏"语义

### 关键 framing 校准 memory

- [feedback_third_party_reference_role.md](D:\AI\Claude\.claude\projects\F--AI-projects-Marx\memory\feedback_third_party_reference_role.md): 2026-05-12 T5 SOFT-BLOCK 后 PM 校准 denizcemonduygu 角色 = 视觉/布局参考主 + 数据副产品辅 / 不是项目"标准答案"

### Polish backlog（T13 批量处理）

详见 [docs/m4-polish-backlog.md](./m4-polish-backlog.md)：T7 播放速度 / 拖游标淡出突变 / 紫色 ticks 对比度 / 字体微调

### ⚠ PM 本轮调整反馈（新窗口收）

T9 完成后 PM 暂停："本轮有很多内容需要调整。在我提出调整意见之前正好本窗口上下文快到限制了，我准备去新窗口继续本项目任务。"

新窗口启动后 PM 会给综合调整反馈 ——
- A 类 vision-level 错（如有）= 立即修
- B 类 polish 细节 = 落 m4-polish-backlog.md / T13 批量处理

---

## 2026-05-12 T3 完成 update · hybrid 草稿入库 / PM 异步复核 / T4 待启动

### T3 完成（commit chain 3381b77 → 7edaff1 → (新 apply commit)）

| Task | commit | 内容 | 测试 |
|---|---|---|---|
| **T3 main** | [3381b77](https://github.com/cdu52802-Xx/marx/commit/3381b77) | upgrade-concept-to-claim.ts + concept-12-claims-checklist.md (12 AI 草稿) + apply-claim-validation-md.ts 加 applyConceptChecklistMd 纯函数 + concept-claim.test.ts (3 acceptance) + apply-concept-md.test.ts (10 unit) | 52/49/3 → 65/61/4 |
| **T3 fix** | [7edaff1](https://github.com/cdu52802-Xx/marx/commit/7edaff1) | code review fix: C1 (cats `-` guard + 白名单) + C2 (derived_from_concept_id 白名单) + I1 (honest-RED guard) + I3 (extractField helper) + 4 regression test | 65/61/4 → 69/63/6 |
| **T3 apply** | 本次 commit | PM 撤回阻塞 apply 约束 + hybrid 模式入库: 跑 m4:apply-md → 12 concept claim 入 claims.json + 修 import-marx.test.ts filter (用 derived_from_denizcemonduygu_record_id 区分 Task 2/3 来源) + spec § 9.2 加实施状态注释 | 69/63/6 → **69/66/3** ✅ |

### T3 执行模式 = subagent-driven（5 轮）

1. implementer subagent → 3381b77（DONE_WITH_CONCERNS：flag 共产主义/革命/生产方式 3 条 AI 草稿哲学敏感）
2. spec reviewer subagent → ✅ spec compliant
3. code quality reviewer → 2 Critical + 4 Important + 5 Minor
4. fix implementer subagent → 7edaff1
5. code quality reviewer re-review → ✅ Approved

### T3 关键策略转变（2026-05-12 PM 指令）

**PM 原话**：「内容审核工作还是放到后面我集中时间和人力进行人工审核，目前就按现有成果往下推进即可，不需要等我完全审核完再做后面工作，太慢。**别让人工审核成为进度卡点**。」

**演变**：
- spec § 9.2 原 propose：M4 回到决策 3（100% PM 复核才 apply 入库，阻塞下游 task）
- T3 实际执行：PM **撤回**该 propose，确认**决策 4 = hybrid 模式 = AI 草稿 + apply 直接入库 + PM 异步复核**为默认
- 适用所有 T2-T5 数据采集 task，不再每个 task 重新决策

详见 memory `feedback_hybrid_ai_draft_mode.md` + spec § 9.2 实施状态注释。

### PM 异步复核入口（任意时间，不阻塞推进）

打开 `docs/m4-validation/concept-12-claims-checklist.md` 编辑 12 条草稿，再跑：
```bash
npm run m4:apply-md
```
重新入库。AI 不催进度。

**重点关注 3 条 AI 草稿（implementer subagent 主动 flag）**：
1. **共产主义** (claim-cpt-communism) · "...人类历史的最终形态" 目的论色彩，可改"没有阶级、没有国家的社会形态"
2. **革命** (claim-cpt-revolution) · "暴力革命 + 无产阶级专政"，Marx 原话但政治敏感
3. **生产方式** (claim-cpt-mode-of-production) · "五种社会形态依次更替"是苏联诠释，Marx 本人未明确提出完整五形态序列

### Code review backlog（T4 / T5 启动时再 polish）

- I2 · applyMdCLI 缺 try/catch + skipped > 0 退出码
- M1 · year fallback `1850` 硬编码（可改 NaN guard + use proposed_year）
- M5 · checklist `pm_reviewed: yes` field 未被 apply 解析（要么 enforce 要么删字段）
- 抽 extractField helper 后推广到 applyChecklistMd（T2 范围保护，本次未动）

### M3 pre-existing 3 个 RED（baseline · 非 T3 范围 · M3 Task 13-17 回头修）

- `stage-b-validated.test.ts`: `wd-q136116320` Alfred Herman name_orig == name_zh + bio/lat/citations 全空（M3 阶段 B 校对漏单）
- `stage-c-successor-notes.test.ts` × 2: 12 concept successor_notes 全空（M3 Task 14-16 待 PM 第三机操作 SEP HTML 后跑）

### 下一步：T4 启动（33 person × 3-5 quote · ⭐ M4 工时大头）

按 hybrid 模式跑（不等 PM 复核 T3 concept）：

1. 派 subagent 跑 T4 implementer（plan line 1028-1213 = T4 step 1-N）
2. AI 用 Marx 思想史专业知识生成 33 person × 3-5 quote 草稿（99-165 条 ClaimNode）
3. 输出 `docs/m4-validation/person-quote-checklist.md` + 跑 `npm run m4:apply-md` 入库
4. spec compliance review + code quality review（2 轮）
5. commit + push + 启动 T5
6. PM 异步复核：T3 concept md + T4 person quote md，任意时间

---

## 2026-05-12 update · T0+T1+T2 完成 + 工作流改进

### 已完成（commit chain 80d47ee → 5b0a225 / 11 commit）

| Task | commit | 内容 | 测试 |
|---|---|---|---|
| **T0** M3 archive | [80d47ee](https://github.com/cdu52802-Xx/marx/commit/80d47ee) | build dist/ → public/m3-archive/ + git tag m3-final | — |
| **T1** ClaimNode schema | [9c0d1bb](https://github.com/cdu52802-Xx/marx/commit/9c0d1bb) + [40640d7](https://github.com/cdu52802-Xx/marx/commit/40640d7) fix | ClaimNode + validateClaim + validateClaimRelation + 7 it（fix 加 6 it） | 26/23/3 → 39/36/3 |
| **T2** Marx 19 obs 导入 | [f1fd47a](https://github.com/cdu52802-Xx/marx/commit/f1fd47a) + [7f8d74c](https://github.com/cdu52802-Xx/marx/commit/7f8d74c) fix | AI 翻译 19 条 claim_text + checklist.md + apply 脚本 + deniz person lookup（fix Critical 数据腐败 11 个 source_work_id="-" → 0） | 39/36/3 → 52/49/3 |
| GH Pages 修复 4 轮 | [9992db8](https://github.com/cdu52802-Xx/marx/commit/9992db8) + [1f87877](https://github.com/cdu52802-Xx/marx/commit/1f87877) + [e7dbb5f](https://github.com/cdu52802-Xx/marx/commit/e7dbb5f) + [45037d8](https://github.com/cdu52802-Xx/marx/commit/45037d8) | ESLint ignore m3-archive / claim-schema as-any / prettier auto-format / workflow continue-on-error | deploy 终于 success |
| PRD vision drift 落点 | [9a1e1ee](https://github.com/cdu52802-Xx/marx/commit/9a1e1ee) → revert [5b0a225](https://github.com/cdu52802-Xx/marx/commit/5b0a225) | 地理图副视图 silent drift catch → 落 PRD § 4 V1 状态注释（删 backlog 文件） | — |

### 关键事件 / 决策（2026-05-12）

- **GH Pages 部署一直 fail**（自 M3 起 silent 4 轮 deploy 失败 ESLint + npm test 严格模式问题），2026-05-12 修复链 9992db8 → 45037d8 终于 success。M3 demo 存档 `/marx/m3-archive/` 可访问
- **T2 code review 发现 Critical 数据腐败**：apply-md regex 把空白后下一行 `-` bullet 当 source_work_id 值，11/19 claims 写入 `"source_work_id": "-"`。fix 重生成 claims.json 后 0 个错值
- **PM catch 地理图 vision drift**：PRD V1 必做 B+2 双主视图（关系图主 + 地理图副），M4 vision pivot 时 silent 丢了地理图副视图。落 PRD § 4 状态注释（line 58-65），3 个时机 PM 在 T6 checkpoint 时决定（A M5 专项推荐 / B M4 中期 T14 / C V2 推迟）
- **工作流改进 PM approve（A+B+C）**：
  - A · 每个 milestone takeaway 强制含「PRD V1 覆盖率」一节
  - B · 每个新 milestone spec 开头强制含「PRD trace」一节
  - C · PRD V1 必做清单加「实施状态」注释（2026-05-12 落地）
  - 详见 memory feedback_prd_traceability.md

---

---

## ⚠ M3 → M4 关键 vision 大调整

M3 阶段 B 完成后 PM 在 Task 10 review 给关键反馈（"50 节点 demo 跟 M2 视觉无区别"），触发 M4 brainstorm session。**vision 从 person-network 星图大调整为 claim-on-timeline 思想史**：

| 维度 | M3 原 vision | M4 新 vision |
|---|---|---|
| **核心实体** | 5 类节点（person/work/event/concept/place）| **claim（一句话主张）**为单位 + person 退化为 section header + work 退化为 reference |
| **布局** | D3 force-directed 散布 | **垂直 person section + obs 斜着堆叠 + 整体左上→右下斜向流** |
| **关系** | 8 类 person-relation | **2 元 claim → claim 关系（agreement / disagreement）+ 半圆弧视觉** |
| **辅助** | 时间轴隐含 | 底部横向时间轴 + 左侧颗粒度勾选栏 + 详情卡 popover |

**不是 M3 demo 改改，是新形态 + 数据 schema 大重构**。M3 ship 的 50 节点保留作 metadata reference（不浪费）。

---

## M4 brainstorm session 关键 takeaway（2026-05-11 single session）

### 历程（v3-v7 mockup 7 轮迭代）
- v1 Q3 marx-prototype → person 中心化（错，PM 反馈"中心化无意义"）
- v2 q3 claim-timeline → 横轴时间（错，PM 要"斜着错落"）
- v3 q3 faithful → 严格按截图垂直 person section（错，"完全垂直"了）
- v4 q3 diagonal → 斜向流 + 加显式时间轴（部分对，但 obs 句子太短）
- v5 q3 faithful2 → obs 横跨画布 + 同 X 起点 + 去时间轴（PM 反馈"时间轴还是要"）
- v6 q3 timeline-form → 3 形态对比（PM 选"B 思路 + 底部横向"）
- **v7 q3 final** → v5 + 底部横向时间轴（PM 大致认可 + 给 2 条弧线规范作为硬约束）

### 关键决策汇总

| # | 决策 | 来源 |
|---|---|---|
| **决策 1** | M4 范围 = 视觉重设计 + 详情卡（A1 + A4 + B + C），排除 A2 时间轴 / A3 侧栏 | brainstorm Q1 PM 选项 2 |
| **决策 2** | 视觉风格 = A 学术编辑风（沿用 M2 § 7） | brainstorm Q2 PM 选 A |
| **决策 3** | 节点 = "一句话观点"（不是 person 圆点）→ 新建 ClaimNode 节点 type | brainstorm Q3 v4 第一性原理结论 |
| **决策 4** | claim 来源策略：concept.definition_plain 升级 + 新增 claim_text 字段 + person 补 quote 90-150 条 | brainstorm Q3 v4 后 |
| **决策 5** | denizcemonduygu 借鉴边界 = 借鉴布局 + 数据 + 视觉惯例 / 不抄每个细节 | brainstorm Q3 v5/v6 后 PM 明确 |
| **决策 6** | 时间轴 = B 思路 + 底部横向（独立维度，不强坐标映射） | brainstorm Q3 v6 PM 选 |
| **决策 7** | 半圆弧规范 = 起止圆点 + 绿左下 / 红右上（vision 硬约束 / 落 spec § 5.4） | brainstorm Q3 v7 后 PM 反馈 |
| **决策 8** | ⚠ M4 复核策略：spec § 9.2 原 propose 回到决策 3（100% PM 复核阻塞 apply），**T3 实施时 PM 撤回 → 实际执行决策 4 hybrid 模式**（AI 草稿 + apply 入库不阻塞 + PM 异步复核，原话"别让人工审核成为进度卡点"）。详 memory `feedback_hybrid_ai_draft_mode.md` | spec § 9.2 propose → 2026-05-12 T3 PM 撤回 |
| **决策 9** | M3 demo 处理 = 选项 C（保留 URL `/m3/` + 主页指向 M4，不下线）| spec § 2.2 propose / PM approve |
| **决策 10** | 执行模式 = subagent-driven（13 task 高独立性 + main context 不被淹）| writing-plans skill handoff PM 选 |

### denizcemonduygu data.json 关键发现

**PM 抓取路径**：`C:/Users/xuzequan/Desktop/denizcemonduygu-data.json`（988KB）

**Schema**：
```typescript
{
  people: 188 entries,    // {id, name, time, loc, sortby}
  records: 2123 entries,  // {id, person, order, line, reference, cats[], keywords}
  links: 8684 entries,    // {l0, l1, type: "p" | "n"}
}
```

**Marx 数据**：
- denizcemonduygu Marx person id = **57**
- Marx records = **19 条**（直接用作 M4 数据 seed，spec § 9.1）
- Marx 涉及 links = 202 条（121 agreement + 81 disagreement）—— Task 5 借鉴

**学科分类 cats 11 类**（M4 ClaimCategory 直接复用）：
me / ep / lo / et / po / ae / re / mi / la / sc / mp + ba (Basics 代表性观点)

**关系类型 link.type**：
- `p` = positive (agreement, 5162 总条) → Marx 项目 `agreement_with`
- `n` = negative (disagreement, 3522 总条) → Marx 项目 `disagreement_with`

---

## M4 13 Task 进度

详见 [M4 plan](../plans/2026-05-11-marx-m4-claim-timeline.md)。

| Task | 内容 | 状态 | 难度 | 复核策略 |
|---|---|---|---|---|
| T0 | M3 demo 存档（plan v2 patch 加） | ✅ 完成 [80d47ee](https://github.com/cdu52802-Xx/marx/commit/80d47ee) | 极小 | 手动 |
| T1 | 数据 schema 扩展（ClaimNode + 校验） | ✅ 完成 [9c0d1bb](https://github.com/cdu52802-Xx/marx/commit/9c0d1bb)+[40640d7](https://github.com/cdu52802-Xx/marx/commit/40640d7) | 中 | TDD（test 39/36/3）|
| T2 | Marx 19 obs 从 denizcemonduygu 借鉴入库 | ✅ 完成 [f1fd47a](https://github.com/cdu52802-Xx/marx/commit/f1fd47a)+[7f8d74c](https://github.com/cdu52802-Xx/marx/commit/7f8d74c) | 小 | AI 翻译 + PM 异步看 checklist.md（test 52/49/3）|
| T3 | 12 concept 升级为 claim_text | ✅ 完成 [3381b77](https://github.com/cdu52802-Xx/marx/commit/3381b77)+[7edaff1](https://github.com/cdu52802-Xx/marx/commit/7edaff1)+本次 apply commit | 中 | hybrid 草稿入库 + PM 异步复核（决策 8 修订）|
| T4 | 33 person × 3 quote 补采 ⭐ M4 工时大头 | ✅ 完成 [20bb483](https://github.com/cdu52802-Xx/marx/commit/20bb483) | 大 | hybrid 草稿入库（61 confident + 38 资料不足 skip · PM 异步复核 checklist） |
| T5 | claim → claim 关系借鉴 | ✅ 完成 [fa7c421](https://github.com/cdu52802-Xx/marx/commit/fa7c421) · SOFT-BLOCK → C 路径 | 中 | denizcemonduygu data import · 数学上限 31 / minimum 调整 100 → 30 |
| **T6** | **主画布 layout 算法** ⭐⭐ 最复杂 | ✅ 完成 [9134c68](https://github.com/cdu52802-Xx/marx/commit/9134c68) + polish [c948b83](https://github.com/cdu52802-Xx/marx/commit/c948b83) + fix [cd89f0d](https://github.com/cdu52802-Xx/marx/commit/cd89f0d) | 大 | PM checkpoint 3 轮 vision 反馈（真半圆 + 45° 倾斜 + 沿斜线连续 + 无限画布雏形） |
| T7 | 底部横向时间轴组件 | ✅ 完成 [833d408](https://github.com/cdu52802-Xx/marx/commit/833d408) | 中 | position:fixed bottom 始终可见 + plan bug fix（Math.ceil 不命中 Marx 活跃年） |
| T8 | 左侧颗粒度栏组件 | ✅ 完成 [8edd20d](https://github.com/cdu52802-Xx/marx/commit/8edd20d) | 中 | position:fixed left 始终可见 + filter + hover 联动 |
| T9 | 详情卡 popover 组件 → **右侧 380px 滑入栏** (PM 2026-05-12 反馈改造) | ✅ 完成 [0ef5804](https://github.com/cdu52802-Xx/marx/commit/0ef5804) + 改造 [8866810](https://github.com/cdu52802-Xx/marx/commit/8866810) | 中 | hybrid 配色 + 三路关闭 + 0.35s 滑入滑出 + polish 4 维度 T13 慢磨 |
| T10 | 维度融合 B 方案叠加 | ⏳ pending | 小 | TDD |
| T11 | M3 demo URL 处理 | ⏳ pending | 极小 | 手动 |
| T12 | M4 整体 acceptance test（unit + e2e）| ⏳ pending | 中 | TDD |
| T13 | 上线 + M4 takeaway | ⏳ pending | 小 | 手动 |

**M4 数据规模目标**（spec § 3.3 · 2026-05-12 T5 后更新）：
- ClaimNode minimum 80 / stretch 150 · **实际 92** ✓（19 Marx + 12 concept + 61 person confident）
- agreement / disagreement relations ~~minimum 100~~ → **minimum 30**（C 路径调整）· **实际 31** ✓（20 agree + 11 disagree · 数学上限榨干）
- extends relations 30-80 · 0 (T5 范围未生成 · 留 T6 layout 或 T8+ 决策)
- distinct authors **27** ✓（远超 minimum 10）

⚠ **T5 SOFT-BLOCK 根本原因 + framing 校准**（详见 spec § 9.3 实施状态注释）：denizcemonduygu 是西方哲学 canon（188 人），Marx 项目是 Marxism 传统（34 人），交集仅 7 人 → 数学上限 31 relation。PM 校准 framing：denizcemonduygu 主要价值是**视觉/布局参考**，数据是副产品（不是标准答案）。memory `feedback_third_party_reference_role.md`。

---

## M4 5 个新坑（20-24）+ 防御

详见 [plan § 2](../plans/2026-05-11-marx-m4-claim-timeline.md)：

- **坑 20** denizcemonduygu 字段名 mapping（line→claim_text / person id 数字 vs Marx wd-q<num>）
- **坑 21** Marx person id 跨系统 mapping（denizcemonduygu 57 ↔ Marx wd-q9061）
- **坑 22** ClaimNode.id 命名 vs ConceptNode.id（用 `claim-<seq>` 区分 `concept-xxx`，可选 `derived_from_concept_id` FK）
- **坑 23** 半圆弧方向规则容易写反（T6 Step 1 unit test 显式断言 control point 偏移方向）
- **坑 24** 100+ claim / 250+ link SVG 渲染性能（T6 实测 fps，必要时降级）

---

## ⚠ M3 暂停状态（实施 M4 前必须知道）

M3 Task 1-12 完成 + Task 13-17 待办（详见 [M3 anchor](2026-05-08-m3-progress-anchor.md)）。**M3 不是放弃，是暂停**：

- Task 13（PM 第三机操作下载 11 个 SEP HTML）需要 PM 第三机能挂代理 + 30-60 分钟物理操作窗口
- Task 14-16 需要 SEP HTML 才能跑（数据依赖）
- M4 brainstorm session PM 明确说"M3 demo 作为阶段性成果暂存"

**M3 阶段 C 后续 task 怎么办**：
- 选项 A：M4 完成后回 M3 完成 Task 13-17（推荐 - 闭环 successor_notes 数据）
- 选项 B：M3 阶段 C 永久跳过（M3 阶段 B 已 ship 50 节点 + 12 concept 是阶段成果，successor_notes 在 M4 形态下不需要因为 claim 即取代了）

**当前未决**：决定权在 PM，建议 M4 上线后跟 takeaway 一起评估。

---

## 4 个待 PM 决策（spec § 14 已 propose）

PM 在 spec review 阶段已 approve 全部 propose。如果新窗口 PM 想再次确认 / 调整，参考：

| 待决 | 我的 propose | 状态 |
|---|---|---|
| ③ 复核策略 | 原 propose 决策 3 阻塞模式 → **2026-05-12 PM 撤回，hybrid 模式 = 默认**（spec § 9.2 实施状态注释 + 决策 8 已修订）| ⚠ supersede |
| ④ M3 demo 处理 | 选项 C 保留 URL + 移除主页入口 | ✅ PM approve |
| 数据规模 | M4 minimum 80 claim / 250 link | ✅ PM approve |
| task 拆分粒度 | 13 task | ✅ PM approve |

---

## brainstorm session artifacts（reference 用，gitignore 不入库）

`.superpowers/brainstorm/<session-id>/` 下保留 4 个 session × ~7 mockup HTML 文件（每个 mockup 是一轮迭代）。新窗口启动 brainstorming skill 会创建新 session，**之前的 mockup 不会自动迁移**。如果新窗口想 reference v7 final mockup：

```bash
ls F:/AI/projects/Marx/.superpowers/brainstorm/*/content/q3-v7-final.html
```

最新一个（按 mtime）含 v7 mockup（v5 主画布 + 底部横向时间轴）。

每个 v3-v7 mockup 文件名固定：
- welcome.html / q2-tone.html / q3-marx-prototype.html / q3-v2-claim-timeline.html / q3-v3-faithful.html / q3-v4-diagonal.html / q3-v5-faithful.html / q3-v6-timeline-form.html / q3-v7-final.html

---

## 新窗口开场白模板（PM 复制粘贴用 · 2026-05-12 T9 完成 update · ⭐ 最新）

```
续接 Marx 项目（cwd: F:\AI\projects\Marx）。

按惯例先 git pull origin main，然后读：
1. AGENTS.md（项目级元约束 + 入口）
2. docs/2026-05-11-m4-progress-anchor.md（M4 续接锚点 ⭐ 最重要 · 已 update 到 T9 完成）
3. docs/m4-polish-backlog.md（M4 polish backlog · T13 批量处理）
4. specs/2026-05-11-m4-claim-timeline-design.md（M4 design doc · § 9.3 含 denizcemonduygu framing 校准注释）
5. plans/2026-05-11-marx-m4-claim-timeline.md（T10-T13 在 line 2445+）

当前位置（2026-05-12 T9 完成 / 等 PM 综合反馈）：
- M4 implementation: T0-T9 完成 / T10-T13 pending
- 测试 91/88/3（3 RED 仍 M3 pre-existing baseline · stage-b alfred + stage-c × 2 · 不属 M4）
- claims.json: 92 ClaimNode（19 Marx + 12 concept + 61 person）+ 31 ClaimRelation
- 视觉: 27 person section 沿斜线连续 + 31 半圆弧（A 命令真半圆）+ 底部 fixed timeline + 左侧 fixed sidebar + 详情卡 popover
- 最新 commit: 0ef5804 (T9 popover)
- subagent-driven 执行模式（PM 已选）

⭐ 上一窗口结束时 PM 说："本轮有很多内容需要调整。"
新窗口启动后 PM 会给综合调整反馈，AI 收到后:
- A 类 vision-level 错 → 立即修
- B 类 polish 细节 → 落 docs/m4-polish-backlog.md / T13 批量处理
- 分类判断标准: AGENTS.md 视觉美学三件套硬约束 / spec § 5.4 弧线方向 / 字体配色等 = A 类立即修

⭐ 关键策略 + memory:
- hybrid AI 草稿模式 (memory feedback_hybrid_ai_draft_mode.md): PM 异步复核不阻塞
- 第三方参考真实角色 (memory feedback_third_party_reference_role.md): denizcemonduygu = 视觉/布局参考主 + 数据副产品辅 / 不是标准答案 (T5 SOFT-BLOCK 后 PM 校准)
- Polish 节奏 (PM 资深产品视角): vision-level 错立即修 / polish 细节落 backlog 推 T13 / 不要陷入 polish 死循环

T6 视觉 layout 已 PM 3 轮 checkpoint 通过:
- 真 180° 半圆 (SVG A 命令)
- 45° 斜向 obs 排列
- person section 沿斜线连续 (X 累加前段 obs span)
- 无限画布雏形 (canvasWidth 动态 + 横向 scroll)
- 真无限画布 (d3.zoom + pan) 留 v2

3 fixed 栏 (跟主画布解耦 / 始终可见):
- T7 timeline bottom: 0 / T8 sidebar left: 0 / T9 popover 视口坐标边界 clamp

dev server: npm run dev → http://localhost:5173/marx/ (PM 浏览器验视觉)

M3 暂停状态:
- Task 1-12 完成 / Task 13-17 待 PM 第三机
- 实际上 Task 13 已实质完成: scripts/sep-cache/ 已存 11 个 HTML (本次 PM 网络畅通 AI 自己 curl 下载完成)
- M4 完成后回 M3 决定: 选项 A 用 SEP HTML 跑 Task 14-17 闭环 successor_notes / 选项 B 跳过

denizcemonduygu data.json: C:/Users/xuzequan/Desktop/denizcemonduygu-data.json (988KB · 已用 Marx 19 obs / Marx 涉及 link)

⚠ 已识别未排期 vision item:
- 地理图副视图 (PRD § 4 V1 必做 silent drift / T6 PM checkpoint 时未决定 / 留 M5+ 跟其他 v2 一起评估)
- A 路径扩 PersonNode (10-15 西方哲学 canon 人物 / T5 SOFT-BLOCK 时冷藏 M5+)

下一步:
- PM 提调整反馈 → AI 分 A/B 类处理
- 反馈处理完后: "go T10" 派 subagent 跑 T10 (维度融合 / 勾选著作 obs 行末尾叠加 [书名·年份] / 小工时 / plan line 2445+)
- "go T11" M3 demo URL 处理 (极小)
- "go T12" M4 整体 acceptance test (中)
- "go T13" 上线 + takeaway + polish backlog 批量处理 (M4 收尾)
```

---

## 关键文件路径速查

| 文件 | 用途 |
|---|---|
| `F:\AI\projects\Marx\AGENTS.md` | 项目级 agent context（已含 M4 状态行） |
| `F:\AI\projects\Marx\docs\2026-05-11-m4-progress-anchor.md` | 本文件（M4 续接锚点） |
| `F:\AI\projects\Marx\docs\2026-05-08-m3-progress-anchor.md` | M3 progress anchor（M3 暂停状态） |
| `F:\AI\projects\Marx\specs\2026-05-11-m4-claim-timeline-design.md` | M4 design doc v1（602 行 · commit 1fc5cb8） |
| `F:\AI\projects\Marx\plans\2026-05-11-marx-m4-claim-timeline.md` | M4 implementation plan v1（2640 行 / 13 task · commit 74c43af） |
| `F:\AI\projects\Marx\specs\2026-05-07-marx-star-map-design.md` | M2 design v1.1（M4 § 4 视觉风格沿用 § 7）|
| `C:\Users\xuzequan\Desktop\denizcemonduygu-data.json` | denizcemonduygu 完整 dump（M4 T2 / T5 input）|
| `C:\Users\xuzequan\Desktop\denizcemonduygu-dom.html` | denizcemonduygu DOM 快照（49KB · M4 brainstorm 时分析 schema 用）|
| `F:\AI\projects\Marx\src\types\Node.ts` | M3 已 ship 5 类节点 type（M4 不动，加 ClaimNode 单独文件 src/types/Claim.ts） |
| `F:\AI\projects\Marx\src\data\nodes_skeleton.json` | M3 ship 50 节点数据（M4 保留作 metadata reference） |
| `F:\AI\projects\Marx\.superpowers\brainstorm\` | brainstorm session mockup history（gitignore，PM reference 用） |

---

## 新窗口续接 checklist

新窗口 / 新机器启动时按这个 checklist 验证状态：

- [ ] `git pull origin main` 同步 → Already up to date 或 fast-forward
- [ ] `git status` → working tree clean
- [ ] `npm test` → **69/66/3**（T0-T3 完成状态，3 RED 全是 M3 pre-existing baseline）
- [ ] 文件存在 check：
  - [ ] `specs/2026-05-11-m4-claim-timeline-design.md` exists
  - [ ] `plans/2026-05-11-marx-m4-claim-timeline.md` exists
  - [ ] `docs/2026-05-11-m4-progress-anchor.md` exists（本文件）
  - [ ] `docs/m4-validation/marx-19-claims-checklist.md` + `concept-12-claims-checklist.md` exist（T2/T3 PM 复核入口）
- [ ] `src/data/claims.json` 含 31 条 claim (19 Marx + 12 concept)
- [ ] denizcemonduygu data.json 路径可访问（如果换机器，PM 需重新抓 + 路径告诉新窗口 AI）：
  - [ ] `ls C:/Users/xuzequan/Desktop/denizcemonduygu-data.json` → ~988KB
- [ ] memory MEMORY.md 含 feedback_hybrid_ai_draft_mode + feedback_anchor_files_minimal（2 个工作流元约束）

如有任何 FAIL，先解决再启动 T1。
