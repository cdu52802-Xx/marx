# Marx M4 续接锚点 · implementation 进行中（T0-T3 代码完成 / T3 等 PM 复核 / T4 待启动）

> **状态**（2026-05-12 T3 update）：M4 implementation 进行中 · T0-T3 代码完成 · T3 等 PM 复核 `docs/m4-validation/concept-12-claims-checklist.md` + 跑 `npm run m4:apply-md` · T4 待启动
> **本文件用途**：跨窗口/跨机器续接锚点。新窗口读 AGENTS.md + 本文件 + spec + plan 即可重建完整理解
> **关联**：[M4 spec](../specs/2026-05-11-m4-claim-timeline-design.md) / [M4 plan](../plans/2026-05-11-marx-m4-claim-timeline.md) / [M3 progress anchor](2026-05-08-m3-progress-anchor.md)（M3 暂停状态）/ [PRD V1 + 实施状态](PRD.md)

---

## 当前整体位置

| 阶段 | 状态 | 位置 |
|---|---|---|
| M1（项目骨架） | ✅ 已上线 | https://cdu52802-xx.github.io/marx/ |
| M2（数据 schema + SPARQL 阶段 A） | ✅ 已上线 | 39 节点 |
| **M3（数据采集阶段 B 校对 + C 后来者旁注）** | **⏸ 暂停** · Task 1-12 完成 / Task 13-17 待 PM 第三机操作 · demo 存档 `/m3-archive/` | [M3 anchor](2026-05-08-m3-progress-anchor.md) |
| **M4（claim-on-timeline 形态大重构）** | **🚧 implementation 进行中** · T0-T3 代码完成 · T3 等 PM 复核 checklist · T4 待启动 | 见下表 + § 2026-05-12 update |
| M5+ | ⏳ 待办（含 PRD V1 地理图副视图，silent drift 复盘后落 PRD V1 状态注释） | [PRD](PRD.md) |

---

## 2026-05-12 T3 update · T3 代码完成（subagent-driven 流程） · 等 PM 复核 checklist

### T3 完成（commit chain 3381b77 → 7edaff1）

| Task | commit | 内容 | 测试 |
|---|---|---|---|
| **T3 main** | [3381b77](https://github.com/cdu52802-Xx/marx/commit/3381b77) | upgrade-concept-to-claim.ts + concept-12-claims-checklist.md (12 AI 草稿) + apply-claim-validation-md.ts 加 applyConceptChecklistMd 纯函数 + concept-claim.test.ts (3 acceptance) + apply-concept-md.test.ts (10 unit) | 52/49/3 → 65/61/4（1 expected RED 等 PM apply + 3 M3 pre-existing） |
| **T3 fix** | [7edaff1](https://github.com/cdu52802-Xx/marx/commit/7edaff1) | code review fix: C1 (cats `-` guard + CLAIM_CATEGORIES_SET 白名单) + C2 (derived_from_concept_id 12 ID 白名单硬校验) + I1 (test 2/3 honest-RED guard) + I3 (extractField helper) + 4 regression test | 65/61/4 → 69/63/6（I1 fix 让 2 个 vacuous PASS 变 honest-RED，所以 fail 4 → 6 是正确效果） |

### T3 执行模式 = subagent-driven（spec § 14 + plan handoff PM 选）

1. implementer subagent (sonnet) 跑全 9 step → 3381b77
2. spec reviewer subagent → ✅ spec compliant
3. code quality reviewer (superpowers:code-reviewer) → 2 Critical + 4 Important + 5 Minor
4. fix implementer subagent (sonnet) 修 C1+C2+I1+I3 → 7edaff1
5. code quality reviewer re-review → ✅ Approved

### T3 vision 核心约束（PM 显式）

- 🛑 **不允许 AI 自跑直接入库** = AI 不能跑 `npm run m4:apply-md` 直接改 `src/data/claims.json`
- ✅ AI 生成 12 条 claim_text 草稿写入 `docs/m4-validation/concept-12-claims-checklist.md`
- ✅ AI 完成 apply 脚本扩展 (applyConceptChecklistMd 纯函数 + 14 unit test 全 PASS)
- 🛑 `src/data/claims.json` 当前状态: 19 Marx claims + 0 concept claims (PM 复核 checklist md 后才跑 apply)

### PM 复核 checklist md 时建议重点看的 3 条（implementer subagent 主动 flag）

1. **共产主义** (claim-cpt-communism) · 草稿带目的论色彩 "人类历史的最终形态"，与 Marx 实证历史唯物主义有张力。建议改更中性的"没有阶级、没有国家的社会形态"
2. **革命** (claim-cpt-revolution) · 含"暴力革命"+"无产阶级专政"。Marx 原话，但政治敏感
3. **生产方式** (claim-cpt-mode-of-production) · 含"五种社会形态依次更替"是苏联诠释，Marx 本人未明确提出完整五形态论序列。如严格区分"Marx 本人主张"vs"后期马克思主义诠释"需调整

### Code review backlog (M-level，T4 / T5 时再 polish)

- I2 · applyMdCLI 缺 try/catch + skipped > 0 退出码
- M1 · year fallback `1850` 硬编码 (可改 NaN guard + use proposed_year)
- M5 · checklist `pm_reviewed: yes` field 未被 apply 解析 (要么 enforce 要么删字段)
- 抽 extractField helper 后推广到 applyChecklistMd (T2 范围保护，本次未动)

### M3 阶段 B 已有数据小坑（baseline 3 RED 之一）

- `wd-q136116320` Alfred Herman person 节点：name_zh == name_orig + bio/lat/citations 全空
- 触发 stage-b-validated.test.ts `name_orig != name_zh` assertion
- 这是 M3 阶段 B 校对漏单，非 T3 引入 / 修复也属于 M3 范围 (回头做 M3 Task 13-17 时一并补)

### 下一步（PM）

1. 打开 `docs/m4-validation/concept-12-claims-checklist.md` 审 12 条 claim_text 草稿
2. 满意 / 改个别条目（直接编辑 md）后跑：
   ```bash
   npm run m4:apply-md
   ```
3. 验证: `npm test` → 69 total / 66 pass / 3 fail（concept-claim 3 个 RED → GREEN，剩 stage-b alfred + stage-c 2 个 M3 pre-existing RED）
4. 满意后 commit `feat(M4): T3 apply - PM 复核完 12 concept claim 入库`
5. 启动 T4（33 person × 3 quote 补采，⭐ M4 工时大头）

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
| T0 | M3 demo 存档（plan v2 patch 加） | ✅ 完成 [80d47ee](https://github.com/cdu52802-Xx/marx/commit/80d47ee) | 极小 | 手动 |
| T1 | 数据 schema 扩展（ClaimNode + 校验） | ✅ 完成 [9c0d1bb](https://github.com/cdu52802-Xx/marx/commit/9c0d1bb)+[40640d7](https://github.com/cdu52802-Xx/marx/commit/40640d7) | 中 | TDD（test 39/36/3）|
| T2 | Marx 19 obs 从 denizcemonduygu 借鉴入库 | ✅ 完成 [f1fd47a](https://github.com/cdu52802-Xx/marx/commit/f1fd47a)+[7f8d74c](https://github.com/cdu52802-Xx/marx/commit/7f8d74c) | 小 | AI 翻译 + PM 异步看 checklist.md（test 52/49/3）|
| T3 | 12 concept 升级为 claim_text | ⏳ **next** | 中 | AI 草稿 + **PM 100% 复核** |
| T4 | 33 person × 3 quote 补采 ⭐ M4 工时大头 | ⏳ pending | 大（6-12 小时） | AI 草稿 + **PM 100% 复核** |
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

## 新窗口开场白模板（PM 复制粘贴用 · 2026-05-12 update）

```
续接 Marx 项目（cwd: F:\AI\projects\Marx）。

按惯例先 git pull origin main，然后读：
1. AGENTS.md
2. docs/2026-05-11-m4-progress-anchor.md（M4 续接锚点，含 2026-05-12 update）
3. docs/PRD.md § 4 V1 必做（含 ⚠ 实施状态注释，含地理图 silent drift 落点）
4. specs/2026-05-11-m4-claim-timeline-design.md（M4 design doc · 602 行）
5. plans/2026-05-11-marx-m4-claim-timeline.md（M4 plan · 2640+ 行 / 13 task / plan v2 含 T0）

当前位置（2026-05-12）：M4 implementation 进行中，T0+T1+T2 完成（commit chain 80d47ee → 7f8d74c）。
状态 = T3 待启动。PM 已选 subagent-driven 执行模式。
npm test baseline：52/49/3（M3 3 个 expected RED 保留）。
GH Pages 部署修复完成，主 demo + /m3-archive/ 都可访问。

M3 暂停状态：Task 1-12 完成，Task 13-17 待 PM 第三机操作有窗口（M4 完成后回头）。

denizcemonduygu data.json 在 C:/Users/xuzequan/Desktop/denizcemonduygu-data.json
（988KB · 188 person · 2123 records · 8684 links · Marx 19 obs 已 import）
T4 / T5 仍需要这个文件。

⚠ 已识别但未排期的 vision item（在 PRD § 4 V1 必做有 ⚠ 状态注释）：
- 地理图副视图（M4 vision pivot 时 silent drift，待 T6 PM checkpoint 决定 A M5 专项 / B M4 中期 T14 / C V2 推迟）

工作流改进 A+B+C（2026-05-12 PM approve）：
- A · 每个 milestone takeaway 必须含 PRD V1 覆盖率一节
- B · 每个新 milestone spec 开头必须含 PRD trace 一节
- C · PRD V1 必做清单加实施状态注释（已落地）
详见 memory feedback_prd_traceability.md。

下一步：
- "go T3" → invoke superpowers:subagent-driven-development 派 subagent 跑 T3
  （12 concept.definition_plain → claim_text 主张式升级，AI 草稿 + PM 100% 复核 vision 核心）
- "先校审 19 条 Marx 翻译" → 打开 docs/m4-validation/marx-19-claims-checklist.md
  看 AI 翻译质量，发现问题改文件后跑 npm run m4:apply-md 同步
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
