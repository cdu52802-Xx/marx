# Marx M4 续接锚点 · brainstorm 完成 / spec + plan ready / implementation 待启动

> **状态**：M4 准备 implementation · brainstorm + spec + plan 全部完成（2026-05-11 single session）· 待 PM 启动 subagent-driven 执行
> **本文件用途**：跨窗口/跨机器续接锚点。新窗口读 AGENTS.md + 本文件 + spec + plan 即可重建完整理解
> **关联**：[M4 spec](../specs/2026-05-11-m4-claim-timeline-design.md) / [M4 plan](../plans/2026-05-11-marx-m4-claim-timeline.md) / [M3 progress anchor](2026-05-08-m3-progress-anchor.md)（M3 暂停状态）

---

## 当前整体位置

| 阶段 | 状态 | 位置 |
|---|---|---|
| M1（项目骨架） | ✅ 已上线 | https://cdu52802-xx.github.io/marx/ |
| M2（数据 schema + SPARQL 阶段 A） | ✅ 已上线 | 39 节点 |
| **M3（数据采集阶段 B 校对 + C 后来者旁注）** | **⏸ 暂停** · Task 1-12 完成 / Task 13-17 待 PM 第三机操作有窗口 | [M3 anchor](2026-05-08-m3-progress-anchor.md) |
| **M4（claim-on-timeline 形态大重构）** | **🚀 准备 implementation** · brainstorm + spec + plan 完成 | 见下表 |
| M5+ | ⏳ 待办 | — |

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
| **决策 8** | M4 复核策略回 M3 决策 3（100% PM 复核）覆盖 M3 决策 4（opportunistic）。Marx 19 obs 例外（denizcemonduygu 权威 source 走 opportunistic） | spec § 9.2 propose / PM approve |
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
| T1 | 数据 schema 扩展（ClaimNode + 校验） | ⏳ pending | 中 | TDD |
| T2 | Marx 19 obs 从 denizcemonduygu 借鉴入库 | ⏳ pending | 小 | AI 翻译 + PM 抽查 5 条 |
| T3 | 12 concept 升级为 claim_text | ⏳ pending | 中 | AI 草稿 + **PM 100% 复核** |
| T4 | 30 person × 3 quote 补采 ⭐ M4 工时大头 | ⏳ pending | 大（5-10 小时） | AI 草稿 + **PM 100% 复核** |
| T5 | claim → claim 关系借鉴 | ⏳ pending | 中 | denizcemonduygu data 直接 import |
| **T6** | **主画布 layout 算法** ⭐⭐ 最复杂 | ⏳ pending | 大 | **完成后强制 PM checkpoint** |
| T7 | 底部横向时间轴组件 | ⏳ pending | 中 | TDD |
| T8 | 左侧颗粒度栏组件 | ⏳ pending | 中 | TDD |
| T9 | 详情卡 popover 组件 | ⏳ pending | 中 | TDD |
| T10 | 维度融合 B 方案叠加 | ⏳ pending | 小 | TDD |
| T11 | M3 demo URL 处理 | ⏳ pending | 极小 | 手动 |
| T12 | M4 整体 acceptance test（unit + e2e）| ⏳ pending | 中 | TDD |
| T13 | 上线 + M4 takeaway | ⏳ pending | 小 | 手动 |

**M4 数据规模目标**（spec § 3.3）：
- ClaimNode minimum 80 / stretch 150（Marx 19 + 12 concept + 87 person quote = 118 base）
- agreement / disagreement relations minimum 100 / stretch 250
- extends relations 30-80
- person 覆盖 ≥ 50%

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
| ③ 复核策略 | 100% PM 复核（决策 3）覆盖 M3 决策 4，Marx 19 obs 例外 | ✅ PM approve |
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

## 新窗口开场白模板（PM 复制粘贴用）

```
续接 Marx 项目（cwd: F:\AI\projects\Marx）。

按惯例先 git pull origin main，然后读：
1. AGENTS.md
2. docs/2026-05-11-m4-progress-anchor.md（M4 续接锚点）
3. specs/2026-05-11-m4-claim-timeline-design.md（M4 design doc · 602 行）
4. plans/2026-05-11-marx-m4-claim-timeline.md（M4 plan · 2640 行 / 13 task）

当前位置：M4 brainstorm + spec + plan 完成（2026-05-11 single session 产出）。
状态 = 准备启动 implementation。PM 已选 subagent-driven 执行模式。

M3 暂停状态：Task 1-12 完成，Task 13-17 待 PM 第三机操作有窗口（M4 完成后回头）。

denizcemonduygu data.json 在 C:/Users/xuzequan/Desktop/denizcemonduygu-data.json
（988KB · 188 person + 2123 records + 8684 links · Marx 19 obs / 202 涉 Marx 关系）
T2 / T5 都需要这个文件。

下一步选项：
- "go T1" → 你 invoke superpowers:subagent-driven-development skill 派 fresh
  subagent 跑 T1（数据 schema 扩展 ClaimNode）
- "先看 M4 plan" → 你浏览 plan 13 task 整体 + 决定是否要调整顺序
- "先 review M4 spec / plan" → 你 review 文档
- "回 M3 做 Task 13" → 切回 M3（PM 第三机操作有窗口时）
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
- [ ] `npm test` → 26/23/3（M3 状态，M4 implementation 前不变）
- [ ] 文件存在 check：
  - [ ] `specs/2026-05-11-m4-claim-timeline-design.md` exists
  - [ ] `plans/2026-05-11-marx-m4-claim-timeline.md` exists
  - [ ] `docs/2026-05-11-m4-progress-anchor.md` exists（本文件）
- [ ] denizcemonduygu data.json 路径可访问（如果换机器，PM 需重新抓 + 路径告诉新窗口 AI）：
  - [ ] `ls C:/Users/xuzequan/Desktop/denizcemonduygu-data.json` → ~988KB
- [ ] AGENTS.md 项目状态行包含 "M4 brainstorm + spec + plan 完成"
- [ ] memory MEMORY.md 含 M4 vision pivot reference

如有任何 FAIL，先解决再启动 T1。
