# Marx M3 续接锚点 · 阶段 C acceptance test 立项

> **状态**：M3 进行中 · Task 1-11 完成（阶段 C acceptance test RED 立项） · Task 12 待启动（准备 ~20 个 SEP URL 清单）
> **本文件用途**：跨窗口/跨机器续接锚点，新窗口读 AGENTS.md + 本文件即可 30 秒重建上下文（不需要读 plan / M2 takeaway 等 1000+ 行长文档）
> **关联**：[plans/2026-05-08-marx-star-map-m3-validate-concept-notes.md](../plans/2026-05-08-marx-star-map-m3-validate-concept-notes.md) / [M2 takeaway](2026-05-08-m2-takeaway.md) / [design doc v1.1](../specs/2026-05-07-marx-star-map-design.md)

---

## 当前整体位置

| 阶段 | 状态 | 位置 |
|---|---|---|
| M1（项目骨架） | ✅ 已上线 | https://cdu52802-xx.github.io/marx/ |
| M2（数据 schema + SPARQL 阶段 A） | ✅ 已上线 | 39 节点 + § 7 视觉骨架 |
| **M3（数据采集阶段 B 校对 + C 后来者旁注）** | **🔄 进行中（Task 11/17，12-17 待办）** | 见下表 |
| M4（5 色编码 + 详情卡 + hover）| ⏳ 待办 | — |
| M5+ | ⏳ 待办 | — |

---

## M3 Task 进度（17 task 总览）

| Task | 内容 | 状态 | Commit |
|---|---|---|---|
| 1 | 写阶段 B acceptance test（先 RED） | ✅ DONE | `546584a` |
| 2 | 校对辅助工具 generate-validation-md.ts | ✅ DONE | `e539144` + `ac676cd`（prettier fix）|
| 3 | 删除误分类节点 基督教的本質 (Q1170769) | ✅ DONE | `cc91723` |
| 4 | apply-validation-md.ts + 31 AI 草稿 name_orig 入库（3 `<不确定>` 保留 opportunistic 复核） | ✅ DONE | `14b3e1c` + `acce50b` + `46c6367` + 本轮 apply commit |
| 5 | 30 AI 草稿 latlng 入库（3 不确定 + 6 学术敏感待复核） | ✅ DONE | 本轮 apply commit |
| 6 | 150 条 AI 草稿 bio 入库（30 person × 5 事件，3 不确定跳过）| ✅ DONE | 本轮 apply commit |
| 7 | ~50 个 AI 草稿 citation_urls 入库（30 person，3 不确定跳过）| ✅ DONE | 本轮 apply commit |
| 8 | 4 work 全 5 字段 AI 草稿入库（work 5 字段 test RED→GREEN）| ✅ DONE | 本轮 apply commit |
| 9 | 12 concept 节点新建 + apply 脚本扩展 + concept-checklist.md 创建 | ✅ DONE | 本轮 commit |
| 10 | 阶段 B 验收 + 中点 review · PM demo 反馈拿到 | 🔄 in progress（视觉重设计延 M4） | 本轮 commit |
| 11 | 写阶段 C 旁注 acceptance test | ✅ DONE | `1bd2dee` |
| 12 | 准备 SEP URL 清单 | ⏳ pending | — |
| 13 | PM 第三机操作回传 SEP HTML | ⏳ pending | — |
| 14 | 主力机生成 SuccessorNote inline 写入 | ⏳ pending | — |
| 15 | PM 校对 ~40 条 SuccessorNote | ⏳ pending | — |
| 16 | main.ts 读 ConceptNode.successor_notes + e2e | ⏳ pending | — |
| 17 | e2e + 视觉验证 + M3 takeaway | ⏳ pending | — |

---

## 3 个关键决策（影响后续 task，跨窗口必读）

### 决策 1 · A 模式 inline successor_notes（plan 修订）

**问题**：plan 原写"旁注拆出独立 concepts_extra.json + concept_id 关联"（B 模式），但 M2 已 ship 的 src/types/Node.ts 把 ConceptNode.successor_notes 写成 inline embedded（A 模式），且 src/lib/schema.ts 的 validateConcept 已要求 successor_notes 字段必填。

**决策**：plan 跟 M2 已 ship code 对齐，走 A 模式（旁注 inline 在 ConceptNode.successor_notes 数组里）。

**Why**：M2 code 已 ship 不动 + 60KB JSON 加载 OK + 极简原则（少 1 个文件 + 1 套校验脚本）+ 旁注本质是"概念的从属属性"（design doc § 5.1 / § 5.5）

**How to apply 后续 task**：
- Task 9 新建 12 concept 节点时 successor_notes 字段写 `[]` 空数组（schema 校验要求字段存在）
- Task 11 acceptance test 检查 inline successor_notes（不是单独 concepts_extra.json 文件）
- Task 14 AI 生成 SuccessorNote 直接写入 nodes_skeleton.json 的 ConceptNode.successor_notes 数组
- Task 16 main.ts 集成时直接读 concept node 的 successor_notes（不需要单独加载文件）
- SuccessorNote 字段名按 M2 Node.ts 第 75-82 行：successor_name_zh / successor_name_orig / year / source_work / note_text / citation_urls（不是 plan 写的 scholar_id 等）
- ConceptNode.definition_plain 是 `string`（不是 `string[]`）

**注意**：plan 文件 plans/2026-05-08-marx-star-map-m3-validate-concept-notes.md 仍是旧版 B 模式描述，**没修正**。新窗口续接时不要按 plan 字面执行，按本 anchor 的 A 模式描述。Task 17 takeaway 时一并修正 plan。

### 决策 2 · 删除 Q1170769（基督教的本質）

**问题**：M2 SPARQL 误把费尔巴哈 1841 著作《基督教的本質》当 person 拉了过来，birth_year=0/death_year=0。

**决策**：删除节点 + 1 条 influences→marx 关系连线（commit `cc91723`）。

**Why**：费尔巴哈本人 (Q76422) 已独立存在 + influences→marx 关系已独立存在 → 删除是无损的（不丢任何信息）。M3 范围"删误分类"明确包含此操作。

**How to apply**：person 节点数从 35 → 34。Task 4-7 PM 校对 34 人（不是 35）。Task 1 acceptance test 节点总数下限是 36（允许删 0-3 个误分类），38 在区间内 PASS。

### 决策 3 · hybrid AI 草稿 + PM 100% 复核模式（PM 主动提议）

**问题**：plan 默认让 PM 全手填 34 person × 4 字段 = ~140 处（每字段一个 task），单字段 35-70 分钟。

**PM 提议**：AI 填繁琐重复工作 → 输出 PM 可读 .md → PM 完整复核全数（不抽查）→ 改错 → AI 跑 apply 同步回 JSON。

**优点**：PM 时间减半（review 比从零查证快）+ 100% 质量把关 + 没抽查盲区。

**实施**：Task 4 已实施 = AI 用 Marx 思想史知识填 33 个 name_orig 草稿写入 docs/m3-validation/person-checklist.md（commit `46c6367`），等 PM 复核。

**How to apply 后续 task**：
- Task 5（latlng）/ Task 6（bio）/ Task 7（citations）/ Task 8（work 全字段）都走同模式：AI 用专业知识填草稿 → PM 复核 → AI apply 回填
- Task 14（SuccessorNote 旁注内容）也走同模式：AI 总结 SEP → PM 复核
- 不确定的内容 AI 标 `<不确定: ...>` 让 PM 重点查证

### 决策 4 · 转向 opportunistic 复核（2026-05-11）

**问题**：决策 3 默认 PM 100% 复核 hybrid AI 草稿。本轮 PM 容量不足，无法逐项核对 33 个 name_orig（每节点查 Wikidata + 比对原文需 1-3 分钟）。

**决策**：接受 AI 草稿入库（apply 脚本自动跳过 `<不确定>` 标记，不注入垃圾）。复核延后到任何 PM 有时间的窗口（M3 阶段 B 验收前 / M4 之前 / PM 单独抽时间）。

**Why**：
- PM 显式说"按当前成果继续推进，后续过程再复核调整"
- `<不确定>` 被 apply 自动跳过 → 3 个不确定 name_orig 保持空，不污染数据
- 31 个明确草稿是 AI 用 Marx 思想史专业知识填的，质量远高于空字段
- 阻塞 Task 5-17 比"先 ship 后补复核"风险更大
- 后续 PM 复核可基于 `git diff` person-checklist.md + nodes_skeleton.json 比对

**How to apply 后续 task**：
- Task 5-8（latlng / bio / citations / work 全字段）默认走同模式：AI 草稿 → 直接 apply → 待 opportunistic 复核
- Task 14（SuccessorNote）默认走同模式
- 待复核清单累计到 `docs/m3-validation/person-checklist.md` 头部 Status block 持续追踪
- M3 takeaway 评估是否在 M4 启动前补一波集中复核

**🔑 PM 复核入口（重要 - 2026-05-11 PM 补充指令）**

所有 AI 草稿同步落 `docs/m3-validation/<scope>-checklist.md`，PM 任意时间可读可改，**不丢任何待复核内容**：

| 文件 | 内容 | 创建时机 | 当前状态 |
|---|---|---|---|
| [`docs/m3-validation/person-checklist.md`](../docs/m3-validation/person-checklist.md) | 34 person · name_orig / latlng / bio / citations | Task 2-4 | ✅ Task 4-7 AI 草稿已入 |
| [`docs/m3-validation/work-checklist.md`](../docs/m3-validation/work-checklist.md) | 4 work · 全字段 | Task 2 | ✅ Task 8 AI 草稿已入 |
| [`docs/m3-validation/concept-checklist.md`](../docs/m3-validation/concept-checklist.md) | 12 concept · 全字段 | Task 9 创建 | ✅ Task 9 AI 草稿已入 |
| `docs/m3-validation/successor-notes-checklist.md` | SuccessorNote 旁注内容 | Task 14 创建 | ⏳ 未创建 |

PM 复核流程：
1. 打开对应 .md 文件，每节点 H3 下逐字段 review
2. 改任意值（不要改 H3 标题，脚本靠 H3 识别节点）
3. 完成后跑 `npm run m3:apply-md`（全部）或 `m3:apply-person` / `m3:apply-work`（单类）同步回 `src/data/nodes_skeleton.json`
4. 跑 `npm test` 验证
5. commit

**⛔ 不要跑** `npm run m3:gen-md` — 会用 SPARQL 重新生成 .md 清空所有 AI 草稿 + PM 编辑（详见 anchor 顶部 ⚠ 警告）

**⚠ Test 设计缺陷提醒**：`tests/unit/stage-b-validated.test.ts:32` 用 `expect(name_orig).not.toBe(name_zh)` 只能 catch "误填中文 = name_zh"，**不能 catch "未填 null/empty"**。3 个不确定 name_orig 空着 test 不报错，不要误以为 test PASS = 数据完整。M3 takeaway 时考虑补一个 `expect(name_orig).toBeTruthy()`（但要等所有 name_orig 都填好再加，否则 Task 1 RED 数会从 3 变 4）。

---

## Task 4-9 残留待复核（opportunistic 模式延后）

文件：[docs/m3-validation/person-checklist.md](../docs/m3-validation/person-checklist.md) 头部 Status block 持续追踪。

PM 有任意时间窗口时，重点查这些：

### 🔴 3 个 `<不确定>` · name_orig + latlng 都为空（apply 跳过未写入 JSON）

| QID | 中文名 | AI 标注 |
|---|---|---|
| Q136116320 | Alfred Herman | name_zh 已是英文，请核对 Wikidata 原文（Alfred Hermann 双 n 或其他）；主要活动地待 Wikidata 核对 |
| Q110655615 | Harry Waton | 请核对 Wikidata 原文；主要活动地待 Wikidata 核对 |
| Q69028 | 弗里德里希·威爾克 | 译名歧义（候选 Friedrich Wilcke / Vielke / Wielke）；主要活动地待 Wikidata 核对 |

### 🟡 3 个 name_orig 学术敏感 · AI 用了通用译名（已入库），PM 可换本名

| QID | 中文名 | AI 选了（已入库） | 替代选项 |
|---|---|---|---|
| Q1394 | 列宁 | `Vladimir Lenin` | `Vladimir Ilyich Ulyanov`（本名）/ `Vladimir Ilyich Lenin`（笔名带父名）|
| Q855 | 约瑟夫·斯大林 | `Joseph Stalin` | `Iosif Vissarionovich Dzhugashvili`（本名）|
| Q57240 | 恩斯特·西蒙·布洛赫 | `Ernst Simon Bloch` | `Ernst Bloch`（不带 Simon）|

### 🟡 6 个 latlng 学术敏感 · 主要活动地有歧义，AI 选 default（已入库），PM 可改

| QID | 中文名 | AI 选了 | 替代候选 | AI 理由 |
|---|---|---|---|---|
| Q27645 | 巴枯宁 | Geneva `46.2044,6.1432` | Moscow（出生）/ Locarno（瑞士晚年）| 1869-72 第一国际反对派 + 国际无政府主义中心 |
| Q34787 | 恩格斯 | Manchester `53.4808,-2.2426` | London（1870-95 与 Marx 协作 25 年）| Manchester 工厂 1844-69 + 《英国工人阶级状况》 |
| Q1394 | 列宁 | Moscow `55.7558,37.6173` | Petrograd / 圣彼得堡（十月革命 1917）| 1918 迁都后 6 年 + 死亡地 |
| Q57240 | Ernst Bloch | Leipzig `51.3397,12.3731` | Tübingen（西德 1961-77 晚年）| 东德教席 1949-61 主要弟子培养 |
| Q83003 | 葛兰西 | Turin `45.0703,7.6869` | Rome（PCI 1922-26）/ 监狱多地 | Ordine Nuovo + 工人主义 1919-22 思想形成期 |
| Q332535 | Sergei Bulgakov | Paris `48.8566,2.3522` | Moscow（俄国早期）| 圣谢尔吉东正教神学院 1925-44 流亡神学著作 |

### 🟢 23 个高把握节点 · name_orig + latlng + bio + citations 都已入库 + 不在学术敏感清单

PM 复核时如有时间可视觉扫 `docs/m3-validation/person-checklist.md` 各 H3 节点（参考 `git diff src/data/nodes_skeleton.json`）。

### 📝 bio_event_style 备注（事件选择 + 措辞均 AI default）

每个 person 5 条事件 AI 用 template「出生 / 早期关键事件 / 代表作 / 中期事件 / 死亡」选了最具代表性的 5 个，每条 ≤ 30 字。

学术争议较大的（哪 5 个事件最重要？措辞如何？）AI 没单独列，PM 复核时可任意改。建议 M4 启动前对 Marx / Engels / Lenin / Gramsci / Benjamin 等核心人物的 bio 重点过一遍。

### 📝 citation_urls 备注（URL 可能死链）

每 person 1-2 个 URL，按规范：marxists.org（Marxist 思想家有 archive）/ plato.stanford.edu（哲学家有 SEP entry）/ Wikipedia（fallback）。

AI 没实际访问验证（网络环境限制）— 部分 URL 路径可能不存在（如 `marxists.org/archive/<surname>/` 命名规则 ad-hoc）。PM 复核时若发现死链，可改成可访问的 URL。

### 📝 work 4 节点（Task 8 入库）

4 个 work 都是 Marx 经典著作，name_orig（德语原标题）+ writing_period（写作时段）+ summary（≤ 3 行事件式）+ citation_urls（marxists.org 中英双链）全 AI 草稿入库。

- name_orig 是标准学术德文，无歧义
- writing_period 选公认写作年份（如《资本论》= 1857-1867 而非 pub_year 1867）
- summary 用 " / " 分隔 3 个 sub-events（单 string 字段，详见 [Node.ts WorkNode.summary](../src/types/Node.ts)）
- citations 同 person 同样可能死链，复核时 PM 验证

### 📝 concept 12 节点（Task 9 新建）

12 个 design doc § 5.2 核心概念全 AI 草稿入库（详见 [`docs/m3-validation/concept-checklist.md`](../docs/m3-validation/concept-checklist.md)）。

**学术敏感复核重点**（PM 有时间可改）：
- **proposed_work_id 归属**：部分 concept 有多重出处，AI 选了"首次系统阐述"的著作：
  - "经济基础/上层建筑" 归 1846《德意志意识形态》，但 1859《政治经济学批判》序言才是经典表述（work 库不含 1859 序言，用 1846 为近似）
  - "生产方式" 五形态划分归 1846 而非 1859 序言（同上）
  - "劳动价值论" 归 1867《资本论》而非 Smith / Ricardo 古典经济学（强调 Marx 突破：劳动 vs 劳动力）
- **definition_plain ≤ 3 行白话**：每个概念 AI 选了 default 措辞，涉及"哪些 sub-points 算最核心"的学术倾向
- **successor_notes 全空 `[]`**：Task 14-15 才填后来者旁注内容

⚠ test 第 5 个 it() "每个 concept 必填字段全填" PASS，12 concept × 6 字段全有值（successor_notes=[] 是 valid array）

### PM 想做复核时告诉 controller 什么

回"我要 review person 数据"，controller 把 person-checklist.md + 当前 JSON 的 name_orig / latlng 抓出来对照。

---

## Task 4-9 完成记录（2026-05-11）

**Task 4 · name_orig（上午）**

- ✅ 跑 `npm run m3:apply-person` 影响 26 个节点（5 个 M2 SPARQL 已填无变化 + 3 个 `<不确定>` 自动跳过）
- ✅ commit `423b309`：feat(M3): Task 4 完成 + 决策 4 opportunistic 复核模式

**Task 5 · main_location_lat_lng**

- ✅ 33 个 latlng AI 草稿写入 person-checklist.md（30 明确 + 3 `<不确定>`）
- ✅ 跑 `npm run m3:apply-person` 影响 30 个节点（3 个 `<不确定>` 跳过）
- ✅ commit `99e8269`：feat(M3): Task 5 完成 - 30 latlng AI 草稿入库

**Task 6 · bio_event_style**

- ✅ 150 条事件草稿写入 person-checklist.md（30 person × 5 事件，3 不确定保留占位）
- ✅ 跑 `npm run m3:apply-person` 影响 30 个节点
- ✅ commit `dc4bf82`：feat(M3): Task 6 完成 - 150 条 bio AI 草稿入库

**Task 7 · citation_urls**

- ✅ ~50 个 URL 草稿写入 person-checklist.md（30 person × 1-2 URL，3 不确定保留占位）
- ✅ 跑 `npm run m3:apply-person` 影响 30 个节点
- ✅ commit `ca97d7d`：feat(M3): Task 7 完成 - 50 citation_urls + PM 复核入口明确化

**Task 8 · 4 work 全字段**

- ✅ 4 work AI 草稿写入 work-checklist.md（name_orig 德语原标题 / writing_period / summary / citation_urls）
- ✅ 跑 `npm run m3:apply-work` 影响 4 个 work 节点
- ✅ commit `d154754`：feat(M3): Task 8 完成 - 4 work 全字段 AI 草稿入库

**Task 9 · 12 concept 新建（schema 扩展）**

- ✅ 扩展 `scripts/apply-validation-md.ts` 支持 concept target：
  - H3 regex 通用化（`Q<num>` 转 `wd-q<num>` / `concept-xxx` 直接用）
  - applyToNode 加 `proposed_year` number 字段解析
  - main() 加 concept 分支 + 新建节点逻辑（找不到则新建空 stub + apply 草稿）
  - default target 改 'all'（含 concept）
- ✅ `package.json` 加 `m3:apply-concept` script + `m3:apply-md` 升级到 'all'
- ✅ 创建 `docs/m3-validation/concept-checklist.md` 含 12 concept × 6 字段 AI 草稿
- ✅ 跑 `npm run m3:apply-concept` 新建 12 concept 节点（含 successor_notes=[] 空数组）
- ✅ 跑 `npm test` 状态再跳跃：21 / 20 PASS / **1 FAIL**（concept test 全 RED→GREEN，剩 person 4 字段唯一 RED）
- ⏭️ Task 10 待启动（阶段 B 验收 + 中点 review）

**M3 阶段 B 节点总数**：38 + 12 concept = **50 nodes**（test 1 [36, 60] 区间内 PASS）

---

## Task 10 中点 review · PM demo 反馈（2026-05-11）

PM 在 Task 9 完成后跑本地 dev server (`localhost:5173/marx/`) 查看 50 节点视觉效果，反馈 3 条：

### 🔴 反馈 1 · 产品形态粗糙

- 界面只有一个星图，**其他产品模块的框架完全没有**（详情卡 / 时间轴 / 侧栏 / 概念区分等）
- 当前是 hello world 级别，距 PRD 设想的完整产品形态还很远

### 🔴 反馈 2 · 星图视觉无主次之分

- 50 节点密密麻麻，跟 M2 demo（38 节点 - https://cdu52802-xx.github.io/marx/）**视觉上无区别**
- 缺：节点大小差异（重要 vs 边缘）/ 颜色编码（5 类 — 现状只有墨黑统一色）/ hover 区分 / 详情卡
- M4 原计划做 5 色编码 + hover，但 PM 暗示这还不够——需要更系统的视觉层次重设计

### 🟡 反馈 3 · 星图样式需差异化（参考网站）

- 当前是 "点 - 点" 传统星图样式，PM 想要差异化
- **参考网站**：<https://www.denizcemonduygu.com/philo/browse/>
- AI 没访问该网站（中国大陆网络限制，且 PM 这次没要求验证），后续设计阶段需 PM 截图 / 描述参考点
- PM 心态："样式、形式可以慢慢磨、慢慢调整，不需要在这一步一步到位改成完美"

### How to apply 后续

- **M4 启动前**（不是 Task 10 / 17）必须做视觉重设计 brainstorm：
  - 召唤 `frontend-design` + `ui-ux-pro-max` 双 skill（按 AGENTS.md 三件套）
  - 参考 denizcemonduygu.com/philo/browse/（PM 截图 / 屏幕共享辅助）
  - 探索：节点大小差异 / 5 色编码 / hover 详情卡 / 侧栏 / 时间轴 / 模块化产品框架
  - 不追求一步到位，迭代设计
- **Task 11-17 阶段 C SuccessorNote** 数据采集照常推进（不阻塞 M4 视觉重设计）
- **M3 takeaway 时**（Task 17）把"M4 视觉重设计"列为 M4 启动条件之一

### Task 10 现状

- ✅ 跑 dev server localhost:5173/marx/ PM 看 50 节点视觉
- ✅ PM 反馈记录到本 section + memory `feedback_demo_visual.md` + `reference_visualization_inspirations.md`
- ✅ commit PM 反馈记录
- ✅ Task 11 完成（见下）

---

## Task 11 完成（2026-05-11）· 阶段 C SuccessorNote acceptance test 立项

**目的**：阶段 C 写代码前先把验收标准锁死，等 Task 14-16 数据入库时 RED→GREEN（复用 Task 1 阶段 B 模式）。

**关键决策**：plan Task 11 写 B 模式（独立 `concepts_extra.json` + `ConceptExtra` 类型 + `scholar_id` 字段），与 anchor 决策 1（A 模式 inline + Node.ts L74-82 SuccessorNote 字段）冲突。**按 anchor 走，跳过 plan 的 Step 1-3（不引入 ConceptsExtraFile 类型 + 不写 validateConceptsExtra 校验脚本）**——校验已被 vitest acceptance test 覆盖。

**实施**：
- ✅ 创建 [`tests/unit/stage-c-successor-notes.test.ts`](../tests/unit/stage-c-successor-notes.test.ts)（5 it 块 / RED 2 个）
- ✅ 测试约束（来源标注在文件头部注释）：
  1. it 1：12 个核心 concept 节点存在（PASS · stage B Task 9 已建）
  2. it 2：每个 concept successor_notes 数量在 [3, 5]（**FAIL** · 当前全 0）
  3. it 3：总旁注数量在 [36, 60]（**FAIL** · 当前 0）
  4. it 4：每条 SuccessorNote 6 字段全填（PASS · 数据集为空 trivially true，等 Task 14 激活）
  5. it 5：每条 note_text 字数在 [300, 500]（PASS · 同上）
- ✅ prettier --check PASS
- ✅ 跑 `npm test` 确认总盘 26/23/3（21/20/1 → 26/23/3，新增 5 it / +3 PASS / +2 FAIL）

**3 个 expected RED 分类**（M3 takeaway 时归零确认）：
- 1 FAIL = stage-b person 4 字段（3 个 `<不确定>` name_orig 待 opportunistic 复核）
- 2 FAIL = stage-c successor_notes 数量（待 Task 14-16 数据入库）

**约束来源**：
- 字段定义：[`src/types/Node.ts`](../src/types/Node.ts) L74-82 SuccessorNote interface（A 模式 inline）
- 数量 [3, 5]：[plan L1642](../plans/2026-05-08-marx-star-map-m3-validate-concept-notes.md) `successor_notes 数量 < 3 || > 5 报错`
- 字数 [300, 500]：plan L1595 + L2700 + design doc § 5.4 硬性约束（防 AI 总结过简或过长）

**Task 11 未做（plan 写但 anchor 决策 1 覆盖）**：
- ⛔ 不创建 `src/types/Node.ts` ConceptExtra / ConceptsExtraFile 类型（A 模式 SuccessorNote 已在）
- ⛔ 不创建 `scripts/check-concepts-extra.ts` 校验脚本（vitest acceptance test 已覆盖）
- ⛔ 不创建 `src/data/concepts_extra.json` 文件（A 模式直接写 nodes_skeleton.json）

**Task 17 takeaway 待办**：plan 文件 Task 11-16 整段还是 B 模式描述，需一并修正（决策 1 + 决策 4 + Task 11 实际跳过的 step 都要标注）

⏭️ Task 12 待启动（准备 ~20 个 SEP URL 清单 → 阶段 C 第三机操作 input）

---

## 已知坑（M2 5 个 + M3 新发现）

### M2 坑 13-17（已防御 in M3 plan 顶部 § 2 表格）

- **坑 13**：网页 UI 下载格式不一致（Task 13 第三机 SEP 下载防御）
- **坑 14**：prettier 全局 format 顺手改无关文件（每 task commit 显式列文件）
- **坑 15**：destructive git 命令需 user 显式授权（plan 内不预设这类步骤）
- **坑 16**：Windows + Bash 中文 commit message 走 -F 文件方式（M3 commit 全部用此模式 100% 可靠）
- **坑 17**：跨机器协作 visual companion 缺失（Task 13 / 14 主力机给 PM 完整 step-by-step prompt）

### M3 新坑 18-19（已发现）

- **坑 18 · plan 跟已 ship code 字段不一致**：M3 plan 写时只看 spec § 5.4 没 check M2 已落 src/types/Node.ts，导致 plan 走 B 模式（concepts_extra.json）但 M2 code 走 A 模式（inline）。**M4+ 防御**：写 plan 前先 grep src/types 已有的 type 定义，spec 跟 code 不一致时优先按 code 对齐 plan（除非 user 显式要改 code）。

- **坑 19 · 孤儿 worktree 让 lint 跑不过**：M2 ship 时遗留了 `.claude/worktrees/gracious-albattani-43d059` + `jovial-jones-b83148` 孤儿 worktree，导致 npm run lint 报 tsconfigRootDir 歧义错误。M3 task 实施时 prettier --check / --write 单文件可正常跑，但 npm run lint 全局会报错。**Task 17 takeaway 修复**：清理孤儿 worktree（git worktree prune 等命令需 user 授权）。

---

## 新窗口开场白模板（给 PM 复制粘贴用）

```
续接 Marx 项目（cwd: F:\AI\projects\Marx）。

请先 git pull origin main 同步远端，然后按顺序读：
1. AGENTS.md
2. docs/2026-05-08-m3-progress-anchor.md（M3 续接锚点，含完整 Task 进度 + 决策 1-4 + 已知坑）

当前位置：Task 1-11 完成（含 Task 10 PM 反馈 + Task 11 阶段 C RED 立项）。Task 12 待启动（准备 ~20 个 SEP URL 清单）。

50 节点 / test 26/23/3（3 FAIL 全 expected RED：1 stage-b 不确定 name_orig + 2 stage-c 待 Task 14-16 数据入库）。

⚠ **PM 反馈核心**：M2 demo + 当前 50 节点 demo 视觉粗糙、无主次之分。M4 启动前必须做视觉重设计 brainstorm（详见 anchor Task 10 section + memory feedback_demo_visual.md）。Task 11-17 数据采集照常推进，不阻塞 M4 视觉工作。

PM 复核入口固定为 `docs/m3-validation/<scope>-checklist.md`（详见 anchor 决策 4 "PM 复核入口"）：
- person-checklist.md / work-checklist.md / concept-checklist.md 都已 AI 草稿入
- successor-notes-checklist.md Task 14 创建（阶段 C）
如果想中途插入复核，说"我要 review person 数据"即可。

注意：
- M3 plan 文件还是旧版 B 模式 + 100% 复核描述，按 anchor 决策 1（A 模式）+ 决策 4（opportunistic）覆盖
- 实施期视觉相关 task 仍按 AGENTS.md 三件套召唤双 skill（use frontend-design + ui-ux-pro-max）
```

---

## 关键文件路径速查

| 文件 | 用途 |
|---|---|
| `F:\AI\projects\Marx\AGENTS.md` | 项目级 agent context |
| `F:\AI\projects\Marx\docs\2026-05-08-m3-progress-anchor.md` | 本文件（续接锚点）|
| `F:\AI\projects\Marx\docs\2026-05-08-m2-takeaway.md` | M2 完结 takeaway（仅追溯）|
| `F:\AI\projects\Marx\plans\2026-05-08-marx-star-map-m3-validate-concept-notes.md` | M3 plan（B 模式版，按 anchor 决策 1 用 A 模式覆盖）|
| `F:\AI\projects\Marx\specs\2026-05-07-marx-star-map-design.md` | design doc v1.1 |
| `F:\AI\projects\Marx\src\types\Node.ts` | M2 已 ship 5 类节点 + 关系 type 定义（A 模式 source of truth）|
| `F:\AI\projects\Marx\src\lib\schema.ts` | M2 已 ship schema 校验函数 |
| `F:\AI\projects\Marx\src\data\nodes_skeleton.json` | 当前数据（38 节点 / 41 关系，Q1170769 已删）|
| `F:\AI\projects\Marx\docs\m3-validation\person-checklist.md` | PM 校对工作文件（含 33 AI name_orig 草稿待 PM 复核）|
| `F:\AI\projects\Marx\docs\m3-validation\work-checklist.md` | PM 校对工作文件（4 work 全占位，Task 8 才填）|
| `F:\AI\projects\Marx\scripts\generate-validation-md.ts` | npm run m3:gen-md（重新生成清单时用，会覆盖 PM 编辑）|
| `F:\AI\projects\Marx\scripts\apply-validation-md.ts` | npm run m3:apply-md（PM 改完 .md 后回填进 JSON）|

⚠️ **新窗口注意**：不要在 PM 复核完之前跑 `npm run m3:gen-md`！会清空 33 个 AI 草稿。需要重新生成时先 git stash docs/m3-validation/ 再跑。
