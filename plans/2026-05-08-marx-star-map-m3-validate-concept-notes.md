# Marx 星图 V1 MVP · Milestone 3 · 数据采集阶段 B 校对 + 阶段 C 后来者旁注 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 M2 阶段 A 拉到的 39 节点骨架（35 person + 4 work）从「占位 0 / 空数组」状态校对到 design doc § 3.1 必填字段全填齐，删除"基督教的本質"等 SPARQL 误分类节点，新建 design doc § 5.2 列出的 12 个核心概念节点（含 successor_notes 字段），并基于 SEP 等学术资源采编 12 概念 × 3-5 后来者旁注（每条 300-500 字 + 引用源），数据集成进产品后线上呈现"39 校对后节点 + 12 苔藓绿 concept 节点 + 后来者旁注 console 验证"。

**Architecture:** 数据校对走"脚本生成 PM 友好 Markdown 校对清单 → PM 在 Markdown 里填字段 → 脚本读 Markdown 回填 JSON"三段式工作流（避免让 0 代码 PM 直接改 JSON 易破坏结构）；阶段 C 涉及 SEP 等国外 endpoint 复用 M2 方案 b 离线缓存模式（PM 第三机浏览器下载 → 微信回传主力机 → 主力机脚本读取 + AI 总结 → PM 校对）；新增的 `concepts_extra.json` 跟现有 `nodes_skeleton.json` 通过 `concept_id` 字段挂钩，schema 校验脚本同时跑两份文件；M3 视觉范围限于"节点双语 label（中文 + 原文名）+ 12 苔藓绿 concept 节点"，hover tooltip / 详情卡 panel 仍留 M4。

**Tech Stack:** 复用：TypeScript ^5 / tsx ^4 / Node 内置 fetch / Vite ^5 / D3 ^7 / vitest ^1 / Playwright ^1 / pico-style HTML parser（SEP 内容提取）。新增依赖：`node-html-parser ^6`（SEP HTML → text 抽取，比 cheerio 轻 50 倍 + 零浏览器依赖；M3 阶段 C Task 14 引入）。

**视觉规范**：M3 视觉范围有限（数据为主），但 Task 9 新建 concept 节点 + Task 16 集成 concepts_extra 涉及视觉触点：
- **节点 label 双语**（Task 7 完成后）：节点旁显示 `name_zh / name_orig` 双语，按 [design doc § 7.6 氛围细节](../specs/2026-05-07-marx-star-map-design.md) "中文 Noto Serif SC 600 + 西文 Playfair Display italic"
- **12 concept 节点苔藓绿**（Task 9）：色值 `#5C7148`，按 [§ 7.4 5 类节点色编码](../specs/2026-05-07-marx-star-map-design.md)
- **AGENTS.md 三件套**（Task 9 / Task 16 实施第一句话强制喊）：
  ```text
  use frontend-design skill
  use ui-ux-pro-max skill
  ```
  虽然 M3 视觉触点小，但 AGENTS.md 第 75-78 行硬要求"实现期显式召唤双 skill"，不论范围大小

**Upstream（产品决议）:** [Design doc v1.1 § 3 节点系统 / § 4 关系系统 / § 5 后来者旁注 / § 6.1 数据采集 4 阶段 / § 7 视觉风格定调](../specs/2026-05-07-marx-star-map-design.md) / [PRD v0.3](../docs/PRD.md) / [M2 plan v1.1](2026-05-07-marx-star-map-m2-data-schema-sparql-a.md) / [M2 takeaway 5 个新坑 13-17 + 6 个关键决策](../docs/2026-05-08-m2-takeaway.md)

**Downstream:** M3.5 plan（如做）= 补 ~10-15 work + ~30 event + ~6 place 节点（V1 ship 前需要，但不在 M3 提醒系统节点 ② 触发的最小可访谈 mockup 范围）；M4 plan = 5 色节点编码全场景 + hover tooltip + 详情卡 panel + 时间轴 + 跨图搜索（design doc § 7.4 / § 7.5 / § 7.6 全集落地）

**Out of scope · M3 不做**（按 spec 极简 + 用户原话锁定范围）：
- **新建 work / event / place 节点**：M2 takeaway 决策 6 提到"M3 阶段 B 人工校对补 ~10-15 个 works"，但本次用户明确指了 M3 范围只包含"39 节点字段缺失 + 删误分类 + 12 概念旁注"——补 works / 新建 event / place 推到 M3.5 或 V1 ship 前其他 milestone
- **5 色节点编码全场景应用**：Task 9 只让 12 concept 节点显示苔藓绿（视觉触点小），其他类（person / work）维持 M2 单色（墨黑），M4 才统一改 5 色
- **节点 hover tooltip / 详情卡 panel**：design doc § 7.6 氛围细节列了"小型脚注卡 hover 出现"，但这是 M4 范围。M3 阶段 C 集成 concepts_extra.json 后只做"加载 + 节点 hover 时 console.log 旁注摘要"做数据集成验证，不做 UI tooltip
- **时间轴 / 地理图副视图 / 跨图搜索**（M4-M5 范围）
- **触发提醒系统节点 ②（mockup 校验访谈）**：按 [user research threshold memory](../../.claude/projects/F--AI-projects-Marx/memory/feedback_user_research_threshold.md) 规则，M3 完成后形态预期到"39 双语节点 + 12 苔藓绿 concept 节点 + 后来者旁注数据加载"，**仍未到 mockup 门槛**——节点全单色（除 12 concept）、无详情卡、无时间轴、无 hover 交互。M3 takeaway Task 17 仍记录"不触发节点 ②"，等 M4-M5 视觉骨架完整后再评估

---

## 执行前 · 前置检查 + 0 代码 PM 准备工作

> M2 takeaway「下次可以更快」第 1 条教训："Plan 修订点从一开始就 build in"——M3 plan 顶部把 M2 5 个新坑（13-17）的防御 + 阶段 B/C 工作流细节一次列清，不留到 Task N 才发现要改。

### 1. 阻塞性前置条件 checklist

| 检查项 | 怎么验证（命令 / 操作） | Expected | 失败处理 |
|---|---|---|---|
| M2 已上线 | 浏览器打开 https://cdu52802-xx.github.io/marx/ | 看到牛皮纸底 + 39 墨黑节点 + 衬线字体 | M2 没 ship 完不要开 M3，回去查 M2 takeaway |
| `npm test` 全绿 | `npm test` | 16 pass（5 relations + 9 schema + 2 types） | 修测试再开 M3 |
| `npm run e2e` 全绿 | `npm run e2e` | 5 pass（80 秒） | 修 e2e 再开 M3 |
| `npm run build` 成功 | `npm run build` | 无 error，dist/ 生成 | 修 build 错误再开 M3 |
| Git 远程 sync | `git fetch origin && git status` | `Your branch is up to date with 'origin/main'` | 先 `git pull` |
| 工作区干净 | `git status --short` | 空输出 | 先 commit / stash 现有变更 |
| Wikidata 网络可达性（阶段 B 用） | 浏览器打开 https://www.wikidata.org/wiki/Q9061 | 页面能加载（**不是** query.wikidata.org，是 wiki 主站，用于查证 person 字段） | 中国大陆主站通常可达；不通则按 M2 方案 b 三机协作（PM 第三机查 + 微信回传） |
| SEP 网络可达性（阶段 C 用） | 浏览器打开 https://plato.stanford.edu/entries/marx/ | 页面能加载 | 中国大陆 SEP 偶尔被墙——**默认走 M2 方案 b 三机协作**（PM 第三机下载 HTML + 微信回传），不假设主力机能直连 |
| `node-html-parser` 包未安装（阶段 C Task 14 才装） | `npm ls node-html-parser` | `(empty)` | 已装则跳过 Task 14 Step 1 |

### 2. M2 takeaway 5 个新坑（13-17）的 plan 内防御

> 这是 plan v1.0 vs M2 plan v1.0 的关键差异：把 M2 实施才发现的 5 个坑，在 M3 plan 顶部就 build-in 防御措施，不留到 task 内才修。

| 坑 | M3 plan 防御 |
|---|---|
| **坑 13** · 网页 UI 下载格式可能跟脚本期望不一致（M2 SPARQL "JSON" vs "JSON（详细）"） | **Task 13 Step 1**：阶段 C 第三机操作清单要求 PM 先下载 1 个 SEP 词条样本，主力机 sanity check 格式后再发完整 ~20 个 URL 操作清单。**不假设浏览器"另存为完整网页 HTML"格式跟某种标准一致**——下载 1 个看一下 |
| **坑 14** · prettier 全局 format 顺手改无关文件 | **每个 task 的 commit step 显式指定文件**：`git add scripts/m3-validate.ts src/data/nodes_skeleton.json` 列具体路径，不用 `git add .`。**Task 9 / 16 涉及 src/main.ts 修改时，prettier --write 限定 src/ scripts/ tests/ e2e/ 不全局扫描** |
| **坑 15** · `git restore` 是 destructive 命令 agent 默认无权限 | **本 plan 不预设需要 git restore 的步骤**。如果 task 实施时发现需要撤销改动，task 内显式标注"⚠️ destructive 命令需 user 显式授权"，先跟 PM 同步选项再跑 |
| **坑 16** · Windows + Bash 中文 commit message 走 `-F` 文件方式 | **每个 task 的 commit step 默认走 `-F .commit-msg.tmp` 模式**。M2 9 个 commit 全部走这个模式 100% 可靠，M3 沿用 |
| **坑 17** · 阶段间断切换协作的 visual companion 缺失 | **每个跨机器协作 task（Task 13 / Task 14 接收 SEP 数据）顶部给 PM "step-by-step 操作清单"**：含具体 URL / 浏览器按钮位置 / 文件命名规则 / 微信回传后告诉我什么的"prompt 模板" |

### 3. 阶段 B 工作流（Markdown 校对清单 + 脚本回填）

**第一性原理**：0 代码 PM 直接改 35 节点 × 5 字段 = 175 处 JSON 易破坏结构（漏逗号 / 错引号 / 重命名 key），所以**让 PM 在 Markdown 里填，脚本回填 JSON**。

**三段式流程**：

```
[Step 1 · 主力机生成]                  [Step 2 · PM 在 Markdown 填]              [Step 3 · 主力机回填]
scripts/generate-                  →    docs/m3-validation/                 →    scripts/apply-
validation-md.ts                        person-checklist.md                     validation-md.ts
读 nodes_skeleton.json                  PM 用文本编辑器逐节填字段              读 Markdown
按 person/work 分文件输出                每节点一个 H3 + 字段 list           parse 字段
含 Wikidata QID 链接                     字段值留空 = 待填                   写回 nodes_skeleton.json
```

**PM 友好 Markdown 节点格式**（Task 2 输出范本）：

```markdown
### Q9235 格奥尔格·威廉·弗里德里希·黑格尔

**Wikidata 链接**: https://www.wikidata.org/wiki/Q9235
**当前已有**: birth_year=1770 / death_year=1831
**待补**:

- name_orig: <在这里填德文原名，如 Georg Wilhelm Friedrich Hegel>
- main_location_lat_lng: <在这里填经纬度，格式 lat,lng，如 52.5200,13.4050（柏林）>
- bio_event_style:
  - <每行一条事件，最多 5 行，格式 "yyyy 年 - 做了什么"，如 "1788 年 - 入图宾根神学院">
- citation_urls:
  - <在这里填 1-3 个引用 URL，每行一条>
```

**回填脚本 parser 规则**：
- `### Q<id> ` 开头 = 新节点开始
- `- name_orig: <...>` 取 `<...>` 内字符串（带 `<` `>` 占位的视为未填，跳过）
- `- main_location_lat_lng: <lat,lng>` parse 成 `[lat, lng]` 数组
- `- bio_event_style:\n  - ...` 列表收集到字符串数组
- 已填 vs 未填的判定：值是否仍含 `<` 和 `>` 占位符

**为什么不用 YAML / TOML**：PM 是 0 代码，YAML 严格缩进 + TOML 多种引号形式都易出错。Markdown 列表 + `<占位>` 模式是 PM 唯一会的格式。

### 4. 阶段 C 离线缓存模式（复用 M2 方案 b）

**直接复用 M2 三阶段分工**（M2 takeaway 决策 1 已验证可行）：

| 阶段 | 谁做 | 在哪做 | 输入 | 输出 |
|---|---|---|---|---|
| 阶段 C-1 | 主力机（Claude） | `F:\AI\projects\Marx` | design doc § 5.2 12 概念 + 10 后来者池 | `scripts/sep-urls.json`（~20 SEP URL 清单 + 命名规则） |
| 阶段 C-2 | PM 第三机（浏览器） | 第三机能挂代理 | scripts/sep-urls.json + 微信文件传输助手 | 20 个 SEP HTML 文件（命名 `<concept-id>-<scholar-id>.html`） |
| 阶段 C-3 | 主力机（Claude） | `F:\AI\projects\Marx` | 20 个 HTML（user 微信回传后存 `scripts/sep-cache/`） | `concepts_extra.json` 草稿（旁注 300-500 字） |
| 阶段 C-4 | PM 校对 | 主力机文本编辑器 | concepts_extra.json 草稿 | 校对后 concepts_extra.json |

**为什么不用 SPARQL / API**：SEP 没有 SPARQL endpoint，也没有公开 API。SEP HTML 页面相对结构稳定（每个词条第 4 节的小标题模式比较固定），所以"下载 HTML + parser 抽取"可行。

**HTML 解析策略**（Task 14 实施时用）：
- 引入 `node-html-parser`（轻量 + 零浏览器依赖）
- 抽取规则：找 `<h2>` 标题含目标后来者名字的段落 → 收集后续 `<p>` 直到下一个 `<h2>`
- 抽取后送 AI 总结成中文 300-500 字（草稿）+ PM 校对（终稿）

**版权注意**：SEP 内容是 CC BY-NC-SA，**不能直接拷贝原文**，必须 AI 改写 + 中文翻译 + 注明引用源。Task 14 / 15 内显式提醒。

### 5. 必备最低操作技能

| 技能 | 用途 | M3 新增 |
|---|---|---|
| Markdown 文本编辑（任意文本编辑器都行：VSCode / Notepad++ / 微软记事本） | 填校对清单 | M3 关键技能 |
| 浏览器看 Wikidata 页面查证字段（QID 已给链接） | 阶段 B 校对 | M2 已具备 |
| 浏览器看 SEP 页面 + 浏览器"另存为"网页 HTML | 阶段 C 第三机操作 | M3 关键技能 |
| 微信文件传输助手 | 第三机 → 主力机回传 HTML | M2 已用过 |
| 其他（命令行 / git / npm） | M1-M2 已具备 | — |

> 详细 Markdown 入门 / 浏览器另存为操作 / 微信文件传输助手用法，请去**其他窗口**问，不在主对话里展开。

### 6. 手动必做的事（agent 做不了）

- **Task 3** · PM 决策"基督教的本質"等误分类节点是删 / 挪到 work 类（agent 给方案 + 数据，PM 决策）
- **Task 4-7** · PM 校对 35 person 节点 4 类字段（agent 生成清单 + 接受回填，PM 填字段值）
- **Task 8** · PM 校对 4 work 节点（agent 生成清单 + 接受回填，PM 填字段值）
- **Task 9 Step 4-7** · PM 校对 12 个新建 concept 节点的 definition_plain 是否符合"白话定义 ≤3 行"
- **Task 13** · PM 第三机操作（agent 给操作清单，PM 物理上去操作另一台机器）
- **Task 15** · PM 校对 36-60 条旁注的事件式 + 字数 + 引用源准确性
- **Task 17 Step 4-5** · PM 浏览器目测在线 URL → 评估 M3 形态是否到 mockup 门槛 → 预期：仍不到（详见 Out of scope 节）

---

## File Structure（M3 范围内创建/修改的文件）

```
marx/
├── scripts/                                ☆ M2 已有
│   ├── generate-validation-md.ts           ★ 新建 - 读 nodes_skeleton.json 生成 PM 校对清单 .md
│   ├── apply-validation-md.ts              ★ 新建 - 读 PM 填好的 .md 回填 nodes_skeleton.json
│   ├── extract-sep-content.ts              ★ 新建 - 读 SEP HTML → 抽取后来者段落
│   ├── validate-concepts-extra.ts          ★ 新建 - concepts_extra.json schema 校验脚本
│   ├── sep-urls.json                       ★ 新建 - 阶段 C 第三机要下载的 SEP URL 清单
│   ├── sep-cache/                          ★ 新建（gitignore） - PM 第三机下载的 SEP HTML 临时存放
│   │   ├── .gitkeep
│   │   └── (PM 回传后 ~20 个 *.html 文件，不入库)
│   └── README.md                           ☆ 修改 - 加 M3 阶段 B / C 脚本说明
├── docs/
│   ├── m3-validation/                      ★ 新建（PM 校对清单临时目录）
│   │   ├── person-checklist.md             ★ 新建 - 35 person 节点 PM 校对清单
│   │   ├── work-checklist.md               ★ 新建 - 4 work 节点 PM 校对清单
│   │   └── concept-new.md                  ★ 新建 - 12 个待新建 concept 节点的字段填写清单
│   └── 2026-05-08-m2-takeaway.md           ☆ 已有（不动）
│   └── 2026-05-XX-m3-takeaway.md           ★ 新建（Task 17）- M3 完成后落 takeaway
├── src/
│   ├── types/
│   │   └── Node.ts                         ☆ 修改 - 加 ConceptExtra 类型 + SuccessorNote 类型
│   ├── data/
│   │   ├── nodes_skeleton.json             ☆ 修改 - 阶段 B 校对结果回填 + 12 concept 节点新增
│   │   └── concepts_extra.json             ★ 新建 - 阶段 C 后来者旁注数据
│   ├── viz/
│   │   └── relations.ts                    ☆ 修改 - 节点 label 双语 + concept 节点苔藓绿
│   └── main.ts                             ☆ 修改 - 加载 concepts_extra.json + console.log 验证
├── tests/
│   ├── unit/stage-b-validated.test.ts      ★ 新建 - 阶段 B 校对完成的 acceptance test
│   └── unit/concepts-extra-schema.test.ts  ★ 新建 - concepts_extra schema 校验测试
├── e2e/
│   └── stage-bc-rendered.spec.ts           ★ 新建 - e2e 验证 39 校对节点 + 12 concept 节点渲染
├── .gitignore                              ☆ 修改 - 加 scripts/sep-cache/*.html
├── package.json                            ☆ 修改 - 加 dependency `node-html-parser`
└── README.md                               ☆ 修改（Task 17） - 加 M3 节
```

---

## 阶段 B · 39 节点字段校对 + 12 concept 节点新建（Task 1-10）

### Task 1: 写"阶段 B 校对完成"acceptance test（先 RED）

**Files:**
- Create: `tests/stage-b-validated.test.ts`

**目的**：把"阶段 B 完成"的判定标准用测试代码固化。先 RED（测试失败），等 Task 4-9 PM 实际填完字段后自然 GREEN。这是数据校对的 TDD 形式。

**判定标准**（基于 design doc § 3.1 person / work / concept 必填字段表）：
- person 类节点：`name_orig` 不等于 `name_zh`（确认 PM 填了原文名）+ `main_location_lat_lng` 不是 `[0,0]` + `bio_event_style.length >= 1` + `citation_urls.length >= 1`
- work 类节点：`name_orig` 不等于 `name_zh` + `writing_period` 非空 + `summary` 非空 + `author_id` 非空 + `citation_urls.length >= 1`
- concept 类节点（M3 新建）：必填字段全填 + `definition_plain.length >= 1`（旁注内容**不**存在 concept 节点上，而在独立的 `concepts_extra.json` 里通过 `concept_id` 关联，详见下方 Architecture / Task 11；这跟 design doc § 5.4 一致，§ 3.1 那行 `successor_notes[]` 字段是逻辑字段）
- 整体：node 数 >= 39（删误分类后允许减少 1-3 个）+ 12 个 concept 节点存在（按 design doc § 5.2 列表 ID 检查）

- [ ] **Step 1: 创建测试文件**

```typescript
// tests/stage-b-validated.test.ts
import { describe, it, expect } from 'vitest'
import data from '../src/data/nodes_skeleton.json'
import type { Node } from '../src/types/Node'

const CORE_CONCEPTS = [
  'concept-alienation',
  'concept-surplus-value',
  'concept-historical-materialism',
  'concept-class-struggle',
  'concept-commodity-fetishism',
  'concept-ideology',
  'concept-mode-of-production',
  'concept-base-superstructure',
  'concept-communism',
  'concept-revolution',
  'concept-labor-theory-of-value',
  'concept-state',
] as const

describe('Stage B · 阶段 B 校对完成 acceptance', () => {
  const nodes = data.nodes as Node[]

  it('节点总数 >= 39（允许删 0-3 个误分类）', () => {
    expect(nodes.length).toBeGreaterThanOrEqual(36)
    expect(nodes.length).toBeLessThanOrEqual(60)
  })

  it('person 节点 4 字段全填（name_orig != name_zh / latlng 非 [0,0] / bio 非空 / citations 非空）', () => {
    const persons = nodes.filter((n) => n.type === 'person')
    for (const p of persons) {
      expect(p.name_orig, `${p.id} ${p.name_zh} name_orig`).not.toBe(p.name_zh)
      expect(p.main_location_lat_lng, `${p.id} ${p.name_zh} latlng`).not.toEqual([0, 0])
      expect(p.bio_event_style?.length ?? 0, `${p.id} ${p.name_zh} bio_event_style`).toBeGreaterThanOrEqual(1)
      expect(p.citation_urls?.length ?? 0, `${p.id} ${p.name_zh} citation_urls`).toBeGreaterThanOrEqual(1)
    }
  })

  it('work 节点 5 字段全填', () => {
    const works = nodes.filter((n) => n.type === 'work')
    expect(works.length).toBeGreaterThanOrEqual(4)
    for (const w of works) {
      expect(w.name_orig, `${w.id} name_orig`).not.toBe(w.name_zh)
      expect(w.writing_period, `${w.id} writing_period`).toBeTruthy()
      expect(w.summary, `${w.id} summary`).toBeTruthy()
      expect(w.author_id, `${w.id} author_id`).toBeTruthy()
      expect(w.citation_urls?.length ?? 0, `${w.id} citations`).toBeGreaterThanOrEqual(1)
    }
  })

  it('12 个 design doc § 5.2 核心 concept 节点存在', () => {
    const concepts = nodes.filter((n) => n.type === 'concept')
    const conceptIds = new Set(concepts.map((c) => c.id))
    for (const required of CORE_CONCEPTS) {
      expect(conceptIds.has(required), `缺少 concept ${required}`).toBe(true)
    }
  })

  it('每个 concept 节点必填字段全填', () => {
    const concepts = nodes.filter((n) => n.type === 'concept')
    for (const c of concepts) {
      expect(c.name_zh, `${c.id} name_zh`).toBeTruthy()
      expect(c.name_orig, `${c.id} name_orig`).toBeTruthy()
      expect(c.proposed_year, `${c.id} proposed_year`).toBeGreaterThan(0)
      expect(c.proposed_work_id, `${c.id} proposed_work_id`).toBeTruthy()
      expect(c.definition_plain?.length ?? 0, `${c.id} definition_plain`).toBeGreaterThanOrEqual(1)
      expect(c.citation_urls?.length ?? 0, `${c.id} citations`).toBeGreaterThanOrEqual(1)
      // 旁注（successor_notes）在 concepts_extra.json 单独存，不检查 concept 节点字段
    }
  })
})
```

- [ ] **Step 2: 跑测试确认 RED**

Run:
```bash
cd F:\AI\projects\Marx
npm test -- tests/stage-b-validated.test.ts
```

Expected:
- 节点总数 test → PASS（已经 39 个，在 [36, 60] 区间内）
- person 4 字段 test → **FAIL**（34 个节点 name_orig === name_zh / latlng=[0,0] / bio 空 / citations 空）
- work 5 字段 test → **FAIL**（4 个 work 字段全空）
- 12 concept 存在 test → **FAIL**（当前 0 个 concept 节点）
- concept 字段全填 test → **PASS（vacuously true，没有 concept 所以循环不进入）**

总计 5 个 test，3 FAIL + 2 PASS。RED 状态符合预期。

- [ ] **Step 3: Commit**

```bash
echo "test(M3): 阶段 B 校对完成 acceptance test（先 RED）

- 5 个 test 覆盖 person 4 字段 / work 5 字段 / 12 核心 concept 存在 / concept 必填
- 当前 RED 3/5（PM 校对完成后会自然 GREEN）
- 引用 design doc § 3.1 + § 5.2" > .commit-msg.tmp
git add tests/stage-b-validated.test.ts
git commit -F .commit-msg.tmp
rm .commit-msg.tmp
```

---

### Task 2: 校对辅助工具脚本（生成 PM 友好 Markdown 清单）

**Files:**
- Create: `scripts/generate-validation-md.ts`
- Create: `docs/m3-validation/.gitkeep`
- Modify: `scripts/README.md`

**目的**：实现"前置检查 § 3"描述的三段式工作流的 Step 1——读 nodes_skeleton.json 输出 PM 友好 Markdown 校对清单。

- [ ] **Step 1: 创建 docs/m3-validation/ 目录**

```bash
mkdir -p F:/AI/projects/Marx/docs/m3-validation
echo "" > F:/AI/projects/Marx/docs/m3-validation/.gitkeep
```

- [ ] **Step 2: 写 generate-validation-md.ts**

```typescript
// scripts/generate-validation-md.ts
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Node } from '../src/types/Node'

const ROOT = resolve(import.meta.dirname, '..')
const SRC = resolve(ROOT, 'src/data/nodes_skeleton.json')
const OUT_DIR = resolve(ROOT, 'docs/m3-validation')

mkdirSync(OUT_DIR, { recursive: true })

const data = JSON.parse(readFileSync(SRC, 'utf-8')) as { nodes: Node[]; relations: unknown[] }

function wikidataUrl(id: string): string {
  // id 形如 "wd-q9061" → URL https://www.wikidata.org/wiki/Q9061
  const qid = id.replace(/^wd-q/, 'Q').toUpperCase()
  return `https://www.wikidata.org/wiki/${qid}`
}

function genPersonChecklist(persons: Node[]): string {
  const lines: string[] = [
    '# Marx 星图 M3 阶段 B · person 节点校对清单',
    '',
    '> **说明**：本文件由 `npm run m3:gen-md` 生成。请按下列格式逐节点填字段值。已填的字段（如 birth_year）保留即可。**不要**改 H3 标题（"### Q9235 ..."），脚本回填靠 H3 识别节点。',
    '',
    '> **填写规则**：',
    '> - 字段值用 `<占位>` 包裹的视为未填，脚本会跳过',
    '> - latlng 格式：`52.5200,13.4050`（逗号分隔 lat,lng）',
    '> - bio_event_style：每行一条事件，最多 5 行，格式 "yyyy 年 - 做了什么"',
    '> - citation_urls：每行一个 URL，建议 marxists.org / plato.stanford.edu / 中文学术网',
    '',
    `> **节点数**：${persons.length}`,
    '',
    '---',
    '',
  ]
  for (const p of persons) {
    lines.push(`### ${p.id.replace(/^wd-/, '').toUpperCase()} ${p.name_zh}`)
    lines.push('')
    lines.push(`**Wikidata 链接**: ${wikidataUrl(p.id)}`)
    lines.push(`**当前已有**: birth_year=${p.birth_year} / death_year=${p.death_year}`)
    lines.push(`**待补**:`)
    lines.push('')
    const filledOrig = p.name_orig && p.name_orig !== p.name_zh ? p.name_orig : '<在这里填原文名（德/英/法等），如 Karl Marx>'
    lines.push(`- name_orig: ${filledOrig}`)
    const ll = p.main_location_lat_lng
    const filledLL = ll && ll[0] !== 0 ? `${ll[0]},${ll[1]}` : '<在这里填经纬度，格式 lat,lng，如 51.5074,-0.1278（伦敦）>'
    lines.push(`- main_location_lat_lng: ${filledLL}`)
    lines.push(`- bio_event_style:`)
    if (p.bio_event_style && p.bio_event_style.length > 0) {
      for (const b of p.bio_event_style) lines.push(`  - ${b}`)
    } else {
      lines.push(`  - <每行一条事件，最多 5 行，格式 "yyyy 年 - 做了什么">`)
    }
    lines.push(`- citation_urls:`)
    if (p.citation_urls && p.citation_urls.length > 0) {
      for (const u of p.citation_urls) lines.push(`  - ${u}`)
    } else {
      lines.push(`  - <在这里填 1-3 个引用 URL，每行一条>`)
    }
    lines.push('')
    lines.push('---')
    lines.push('')
  }
  return lines.join('\n')
}

function genWorkChecklist(works: Node[]): string {
  const lines: string[] = [
    '# Marx 星图 M3 阶段 B · work 节点校对清单',
    '',
    '> **说明**：本文件由 `npm run m3:gen-md` 生成。',
    '',
    '> **填写规则**：',
    '> - name_orig：原文标题，如《资本论》→ "Das Kapital"',
    '> - writing_period：写作时段，如 "1857-1867"',
    '> - summary：3 行内事件式简明，如 "1867 - 第一卷出版" / "1885 - 恩格斯整理出版第二卷"',
    '> - author_id：作者节点 ID，如马克思 = "wd-q9061"',
    '',
    `> **节点数**：${works.length}`,
    '',
    '---',
    '',
  ]
  for (const w of works) {
    lines.push(`### ${w.id.replace(/^wd-/, '').toUpperCase()} ${w.name_zh}`)
    lines.push('')
    lines.push(`**Wikidata 链接**: ${wikidataUrl(w.id)}`)
    lines.push(`**当前已有**: pub_year=${w.pub_year}`)
    lines.push(`**待补**:`)
    lines.push('')
    const filledOrig = w.name_orig && w.name_orig !== w.name_zh ? w.name_orig : '<在这里填原文标题，如 Das Kapital>'
    lines.push(`- name_orig: ${filledOrig}`)
    lines.push(`- writing_period: ${w.writing_period ?? '<写作时段，如 "1857-1867">'}`)
    lines.push(`- summary:`)
    if (w.summary && Array.isArray(w.summary) && w.summary.length > 0) {
      for (const s of w.summary) lines.push(`  - ${s}`)
    } else {
      lines.push(`  - <最多 3 行，事件式简明>`)
    }
    lines.push(`- author_id: ${w.author_id ?? '<作者节点 ID，如 wd-q9061>'}`)
    lines.push(`- citation_urls:`)
    if (w.citation_urls && w.citation_urls.length > 0) {
      for (const u of w.citation_urls) lines.push(`  - ${u}`)
    } else {
      lines.push(`  - <每行一个 URL>`)
    }
    lines.push('')
    lines.push('---')
    lines.push('')
  }
  return lines.join('\n')
}

const persons = data.nodes.filter((n) => n.type === 'person')
const works = data.nodes.filter((n) => n.type === 'work')

writeFileSync(resolve(OUT_DIR, 'person-checklist.md'), genPersonChecklist(persons), 'utf-8')
writeFileSync(resolve(OUT_DIR, 'work-checklist.md'), genWorkChecklist(works), 'utf-8')

console.log(`✓ 生成 person-checklist.md（${persons.length} 节点）`)
console.log(`✓ 生成 work-checklist.md（${works.length} 节点）`)
console.log(`输出目录：${OUT_DIR}`)
```

- [ ] **Step 3: 加 npm script**

修改 `package.json` 的 `scripts` 节，加：

```jsonc
{
  "scripts": {
    // ... 现有
    "m3:gen-md": "tsx scripts/generate-validation-md.ts"
  }
}
```

- [ ] **Step 4: 跑脚本生成清单**

```bash
cd F:\AI\projects\Marx
npm run m3:gen-md
```

Expected 输出：
```
✓ 生成 person-checklist.md（35 节点）
✓ 生成 work-checklist.md（4 节点）
输出目录：F:\AI\projects\Marx\docs\m3-validation
```

- [ ] **Step 5: 检查输出文件结构正确**

```bash
head -30 F:/AI/projects/Marx/docs/m3-validation/person-checklist.md
```

Expected：能看到 H1 标题 + 第 1 个 person 节点（Q9061 卡尔·马克思）的 H3 + 字段填写格式（marx 本人 4 字段都已填非占位）。

- [ ] **Step 6: 修改 scripts/README.md 加 M3 章节**

在 scripts/README.md 末尾追加：

```markdown
## M3 阶段 B 校对辅助脚本

- `generate-validation-md.ts` (`npm run m3:gen-md`) - 读 nodes_skeleton.json 生成 PM 校对用 Markdown 清单到 `docs/m3-validation/`
- `apply-validation-md.ts` (`npm run m3:apply-md`) - 读 PM 填好的 Markdown 回填 nodes_skeleton.json
- 工作流详见 [M3 plan § 阶段 B 工作流](../plans/2026-05-08-marx-star-map-m3-validate-concept-notes.md)
```

- [ ] **Step 7: Commit**

```bash
echo "feat(M3): 阶段 B 校对辅助脚本 generate-validation-md.ts

- 读 nodes_skeleton.json 输出 PM 友好 Markdown 校对清单
- person-checklist.md（35 节点）+ work-checklist.md（4 节点）
- 字段值用 <占位> 标记未填，脚本回填时跳过
- npm run m3:gen-md 一键生成
- scripts/README.md 加 M3 章节" > .commit-msg.tmp
git add scripts/generate-validation-md.ts scripts/README.md docs/m3-validation/.gitkeep package.json
git commit -F .commit-msg.tmp
rm .commit-msg.tmp
```

注意：**不 add `docs/m3-validation/*.md`**——这些是生成产物，PM 会改。改完后 Task 4-8 commit 时再 add。

---

### Task 3: PM 处理误分类节点（"基督教的本質" 等）

**Files:**
- Modify: `src/data/nodes_skeleton.json`

**目的**：M2 takeaway 决策 5 标记的"基督教的本質"（Q1170769，费尔巴哈著作 SPARQL 误分类为 person）需要 PM 决策处理。可能还有其他误分类节点（如有些 wd 节点 name_zh 看起来不像人名）。

- [ ] **Step 1: 主力机扫描可疑误分类节点**

```bash
cd F:\AI\projects\Marx
node -e "const d=require('./src/data/nodes_skeleton.json'); for(const n of d.nodes){if(n.type==='person' && (n.birth_year===0 || n.death_year===0)){console.log('可疑:', n.id, n.name_zh, 'birth='+n.birth_year, 'death='+n.death_year);}}"
```

Expected 输出（基于 M2 takeaway 决策 5）：
```
可疑: wd-q1170769 基督教的本質 birth=0 death=0
```

可能还有 0-3 个其他可疑节点（视实际 SPARQL 拉到什么）。

- [ ] **Step 2: 主力机给 PM 列每个可疑节点的处理选项**

主力机为每个可疑节点输出"对照判定信息"，包括：
- Wikidata 链接
- name_zh 是否像人名
- 关系网里跟它相连的边（看是 influences/author/...）
- 推荐处理方案（A 删除 / B 改类型为 work / C 保留 + 阶段 B 补字段）

主力机输出格式范本（per 节点）：

```
节点: wd-q1170769 基督教的本質
Wikidata: https://www.wikidata.org/wiki/Q1170769
判断依据:
- name_zh "基督教的本質" 不像人名（看起来是著作名）
- 入边来源: wd-q9061（Marx）influences → 这条
- 推荐: 改类型为 work + 补 author_id="wd-q76422"（费尔巴哈）+ pub_year=1841

请 PM 选: A 删除 / B 改 work / C 保留为 person 补字段
```

- [ ] **Step 3: PM 逐节点决策**

PM 对每个可疑节点回复 A / B / C。本 plan 不预设结果，按 PM 决策落改动。

- [ ] **Step 4: 主力机按 PM 决策修改 nodes_skeleton.json**

如果 PM 选 A 删除：
```bash
node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('./src/data/nodes_skeleton.json','utf-8')); d.nodes=d.nodes.filter(n=>n.id!=='wd-q1170769'); d.relations=d.relations.filter(r=>r.source!=='wd-q1170769'&&r.target!=='wd-q1170769'); fs.writeFileSync('./src/data/nodes_skeleton.json',JSON.stringify(d,null,2),'utf-8'); console.log('删除完成，剩余节点',d.nodes.length,'剩余关系',d.relations.length);"
```

如果 PM 选 B 改 work：用 Edit 工具改 nodes_skeleton.json 对应节点的 `type: "person"` → `type: "work"` 并补 work 必填字段。

如果 PM 选 C 保留 person：本 task 不动数据，留到 Task 4-7 PM 在校对清单里补字段。

- [ ] **Step 5: 跑 schema 校验确认 JSON 仍合法**

```bash
npm test -- tests/schema.test.ts
```

Expected：9/9 PASS（schema 校验脚本不变，删 / 改类型都符合 schema 类型枚举）。

- [ ] **Step 6: Commit**

```bash
echo "data(M3): 阶段 B 处理 SPARQL 误分类节点

- 处理: 基督教的本質 (Q1170769) [按 PM 决策填: 删 / 改 work / 保留补字段]
- [其他误分类节点按实际处理]
- 关系连线同步清理（如有）
- 引用 M2 takeaway 决策 5" > .commit-msg.tmp
git add src/data/nodes_skeleton.json
git commit -F .commit-msg.tmp
rm .commit-msg.tmp
```

---

### Task 4: PM 校对 35 person · name_orig（原文名）

**Files:**
- Modify: `docs/m3-validation/person-checklist.md`（PM 填）
- Create: `scripts/apply-validation-md.ts`
- Modify: `src/data/nodes_skeleton.json`（脚本回填）

**目的**：PM 填 35 person 节点的 name_orig（德/英/法/俄等原文名），脚本回填 JSON。

**前置说明**（Task 4-7 共用）：每个 person 字段单独一个 task 是为了让 PM 能"分批跑"——一次性填 4 字段 × 35 节点 = 140 处太累。每 task 内 PM 跑完一遍 35 节点的 1 字段 + 主力机回填 + 单独 commit，节奏可控。

- [ ] **Step 1: 写 apply-validation-md.ts 脚本（Task 4-7 共用，本 task 创建）**

```typescript
// scripts/apply-validation-md.ts
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Node } from '../src/types/Node'

const ROOT = resolve(import.meta.dirname, '..')
const JSON_PATH = resolve(ROOT, 'src/data/nodes_skeleton.json')
const PERSON_MD = resolve(ROOT, 'docs/m3-validation/person-checklist.md')
const WORK_MD = resolve(ROOT, 'docs/m3-validation/work-checklist.md')

type ParsedNode = {
  id: string
  fields: Record<string, string | string[]>
}

const PLACEHOLDER_REGEX = /<[^>]+>/  // 含 <...> 的字段视为未填

function isUnfilled(value: string): boolean {
  return PLACEHOLDER_REGEX.test(value)
}

function parseChecklist(md: string): ParsedNode[] {
  const lines = md.split(/\r?\n/)
  const nodes: ParsedNode[] = []
  let current: ParsedNode | null = null
  let listField: string | null = null

  for (const line of lines) {
    const h3 = line.match(/^### (Q\d+) /)
    if (h3) {
      if (current) nodes.push(current)
      const wdId = `wd-${h3[1].toLowerCase()}`
      current = { id: wdId, fields: {} }
      listField = null
      continue
    }
    if (!current) continue

    // 单行字段，如 "- name_orig: Karl Marx"
    const single = line.match(/^- ([a-z_]+): (.+)$/)
    if (single) {
      const [, key, value] = single
      if (!isUnfilled(value.trim())) {
        current.fields[key] = value.trim()
      }
      listField = null
      continue
    }

    // 列表字段开头，如 "- bio_event_style:"
    const listStart = line.match(/^- ([a-z_]+):\s*$/)
    if (listStart) {
      listField = listStart[1]
      current.fields[listField] = []
      continue
    }

    // 列表项，如 "  - 1818 年 - 生于普鲁士特里尔"
    if (listField) {
      const item = line.match(/^  - (.+)$/)
      if (item) {
        const value = item[1].trim()
        if (!isUnfilled(value)) {
          ;(current.fields[listField] as string[]).push(value)
        }
      } else if (line.trim() === '' || line.startsWith('---')) {
        listField = null
      }
    }
  }
  if (current) nodes.push(current)
  return nodes
}

function applyToNode(node: Node, parsed: ParsedNode): boolean {
  let changed = false
  for (const [key, value] of Object.entries(parsed.fields)) {
    if (Array.isArray(value)) {
      if (value.length === 0) continue
      const current = (node as Record<string, unknown>)[key]
      if (JSON.stringify(current) !== JSON.stringify(value)) {
        ;(node as Record<string, unknown>)[key] = value
        changed = true
      }
      continue
    }
    if (key === 'main_location_lat_lng') {
      const m = value.match(/^(-?[\d.]+),\s*(-?[\d.]+)$/)
      if (m) {
        const ll: [number, number] = [Number(m[1]), Number(m[2])]
        if (JSON.stringify(node.main_location_lat_lng) !== JSON.stringify(ll)) {
          node.main_location_lat_lng = ll
          changed = true
        }
      }
      continue
    }
    if ((node as Record<string, unknown>)[key] !== value) {
      ;(node as Record<string, unknown>)[key] = value
      changed = true
    }
  }
  return changed
}

function main(target: 'person' | 'work' | 'both'): void {
  const data = JSON.parse(readFileSync(JSON_PATH, 'utf-8')) as { nodes: Node[]; relations: unknown[] }
  let touched = 0

  if (target === 'person' || target === 'both') {
    const parsed = parseChecklist(readFileSync(PERSON_MD, 'utf-8'))
    for (const p of parsed) {
      const node = data.nodes.find((n) => n.id === p.id)
      if (!node) {
        console.warn(`⚠ ${p.id} 在 nodes_skeleton.json 找不到，跳过`)
        continue
      }
      if (applyToNode(node, p)) touched++
    }
  }
  if (target === 'work' || target === 'both') {
    const parsed = parseChecklist(readFileSync(WORK_MD, 'utf-8'))
    for (const p of parsed) {
      const node = data.nodes.find((n) => n.id === p.id)
      if (!node) {
        console.warn(`⚠ ${p.id} 在 nodes_skeleton.json 找不到，跳过`)
        continue
      }
      if (applyToNode(node, p)) touched++
    }
  }

  writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`✓ 回填完成，影响 ${touched} 个节点`)
}

const target = (process.argv[2] ?? 'both') as 'person' | 'work' | 'both'
main(target)
```

- [ ] **Step 2: 加 npm script**

修改 `package.json` `scripts` 节：

```jsonc
{
  "scripts": {
    "m3:gen-md": "tsx scripts/generate-validation-md.ts",
    "m3:apply-md": "tsx scripts/apply-validation-md.ts both",
    "m3:apply-person": "tsx scripts/apply-validation-md.ts person",
    "m3:apply-work": "tsx scripts/apply-validation-md.ts work"
  }
}
```

- [ ] **Step 3: 自测脚本（不依赖 PM 真填，用 marx 节点已有数据自校）**

```bash
cd F:\AI\projects\Marx
npm run m3:apply-person
```

Expected：marx 节点（已有完整字段）回填触发"无变化"，其他 34 节点占位字段被跳过 → 输出 `✓ 回填完成，影响 0 个节点`（或 ≤2 个，看是否有边界情况）。

- [ ] **Step 4: PM 操作 · 在 person-checklist.md 里填 35 个节点的 name_orig**

PM 工作流（主力机给 PM 复制粘贴的 prompt 模板）：

```
PM 你好，现在请你帮 35 个 person 节点填 name_orig（原文名）。

操作步骤：
1. 用文本编辑器打开 F:\AI\projects\Marx\docs\m3-validation\person-checklist.md
2. 从上往下，每个节点（### 开头）找到 "- name_orig: <在这里填...>" 那行
3. 把 <...> 占位替换为节点对应的德/英/法/俄等原文名
4. 不知道的可以点节点上面的 "Wikidata 链接" 浏览器查
5. 全部填完保存文件
6. 告诉我："name_orig 填完了"

不需要填其他字段（latlng / bio / citations）——下个 task 才轮到。
```

- [ ] **Step 5: 主力机回填 + 跑 acceptance test 部分检查**

```bash
cd F:\AI\projects\Marx
npm run m3:apply-person
npm test -- tests/stage-b-validated.test.ts -t "name_orig"
```

Expected：影响 35 节点（marx 已填 + 34 新填）；acceptance test "person 节点 4 字段全填" 这个 test 仍 FAIL（因为只填了 name_orig，latlng/bio/citations 还是占位），但 FAIL 错误信息从 `name_orig` 不再出现，改为 `latlng` / `bio` / `citations` 的 expectation。

- [ ] **Step 6: Commit**

```bash
echo "data(M3): 阶段 B 校对 person.name_orig（35 节点原文名）

- 通过 docs/m3-validation/person-checklist.md PM 校对清单
- scripts/apply-validation-md.ts 自动回填 nodes_skeleton.json
- acceptance test 仍 RED（latlng / bio / citations 待 Task 5-7 补）" > .commit-msg.tmp
git add scripts/apply-validation-md.ts docs/m3-validation/person-checklist.md src/data/nodes_skeleton.json package.json
git commit -F .commit-msg.tmp
rm .commit-msg.tmp
```

---

### Task 5: PM 校对 35 person · main_location_lat_lng（地理坐标）

**Files:**
- Modify: `docs/m3-validation/person-checklist.md`（PM 填）
- Modify: `src/data/nodes_skeleton.json`（脚本回填）

**目的**：PM 填 35 person 节点的"主要居住地"经纬度。design doc § 3.1 定义为 `main_location_lat_lng: [number, number]`。

- [ ] **Step 1: PM 操作 · 填 35 节点的 main_location_lat_lng**

主力机给 PM 的 prompt 模板：

```
PM 你好，请填 35 个 person 节点的 main_location_lat_lng（主要居住地经纬度）。

操作步骤：
1. 继续用 docs/m3-validation/person-checklist.md
2. 每个节点找 "- main_location_lat_lng: <在这里填经纬度...>" 那行
3. 填 "主要居住地"经纬度，格式 lat,lng（逗号分隔）
   - 如 marx 主要居住伦敦 → 51.5074,-0.1278
   - 如 hegel 主要居住柏林 → 52.5200,13.4050
   - 如 engels 曼彻斯特 → 53.4808,-2.2426
4. 不确定的：
   - 优先选学者一生主要工作/居住的城市（不是出生地）
   - Wikidata 链接里看 "place of death" 或 "work location" 字段查坐标
   - Google Maps 搜城市名右键 → "这是哪里" → 复制坐标
5. 全部填完保存
6. 告诉我："latlng 填完了"
```

- [ ] **Step 2: 主力机回填 + 部分 acceptance test 检查**

```bash
cd F:\AI\projects\Marx
npm run m3:apply-person
npm test -- tests/stage-b-validated.test.ts -t "person 节点 4 字段"
```

Expected：35 节点的 `main_location_lat_lng` 不再是 [0,0]；acceptance test 仍 FAIL（bio / citations 待补）。

- [ ] **Step 3: Commit**

```bash
echo "data(M3): 阶段 B 校对 person.main_location_lat_lng（35 节点经纬度）

- PM 在 docs/m3-validation/person-checklist.md 填经纬度
- scripts/apply-validation-md.ts 回填 nodes_skeleton.json
- 引用 design doc § 3.1 person 必填字段" > .commit-msg.tmp
git add docs/m3-validation/person-checklist.md src/data/nodes_skeleton.json
git commit -F .commit-msg.tmp
rm .commit-msg.tmp
```

---

### Task 6: PM 校对 35 person · bio_event_style（事件式 bio）

**Files:**
- Modify: `docs/m3-validation/person-checklist.md`（PM 填）
- Modify: `src/data/nodes_skeleton.json`（脚本回填）

**目的**：PM 填 35 person 节点的 bio_event_style。design doc § 3.2 强制规则：每行 ≤ 30 字，总长度 ≤ 5 行，禁止学术包装语言。

- [ ] **Step 1: PM 操作 · 填 35 节点的 bio_event_style**

主力机给 PM 的 prompt 模板：

```
PM 你好，请填 35 个 person 节点的 bio_event_style（事件式简明 bio）。

⚠️ 强制规则（design doc § 3.2）：
- 每条事件 ≤ 30 字
- 每个节点最多 5 条
- 必须事件式："yyyy 年 [月] - 做了什么"，不能学术包装

✅ 正例（恩格斯）：
- 1842 年 9 月 - 在《莱茵报》第一次见 Marx，关系冷淡
- 1844 年 8 月 - 巴黎再见，10 天彻夜长谈，思想合流
- 1845 年 - 合写《神圣家族》《德意志意识形态》
- 1848 年 - 合写《共产党宣言》
- 1851-1869 年 - 曼彻斯特工厂工作，养活伦敦的 Marx 一家

❌ 反例（学术包装，禁止）：
- 弗里德里希·恩格斯（1820-1895）是 19 世纪伟大的无产阶级革命家、思想家...

操作步骤：
1. 继续用 docs/m3-validation/person-checklist.md
2. 每个节点找 "- bio_event_style:" 下面的列表
3. 删除占位行，每行一条事件（缩进 2 空格 + "- "）
4. 不知道的人物：Wikidata 链接看英文 wiki summary，自己翻译成事件式（不要直接拷英文 wiki）
5. 全部填完保存
6. 告诉我："bio 填完了"

🔥 这是 M3 阶段 B 最重的一步（35 节点 × 平均 4 行）。可以分多次完成，不必一次跑完。
```

- [ ] **Step 2: 主力机回填 + 部分 acceptance test 检查**

```bash
cd F:\AI\projects\Marx
npm run m3:apply-person
npm test -- tests/stage-b-validated.test.ts -t "person 节点 4 字段"
```

Expected：35 节点的 `bio_event_style.length >= 1`；acceptance test 错误信息从 `bio_event_style` 消失，改为 `citation_urls`。

- [ ] **Step 3: 主力机额外校验事件式格式**

```bash
node -e "const d=require('./src/data/nodes_skeleton.json'); for(const n of d.nodes){if(n.type==='person'&&n.bio_event_style){for(const b of n.bio_event_style){if(b.length>30){console.warn('⚠ 超 30 字:',n.name_zh,'-',b.slice(0,40)+'...');} if(n.bio_event_style.length>5){console.warn('⚠ 超 5 行:',n.name_zh,'共',n.bio_event_style.length);}}}}"
```

Expected：无超 30 字 / 超 5 行警告。如有警告，PM 修一下再 commit。

- [ ] **Step 4: Commit**

```bash
echo "data(M3): 阶段 B 校对 person.bio_event_style（35 节点事件式 bio）

- PM 按 design doc § 3.2 强制规则（≤30 字/行 + ≤5 行）填
- scripts/apply-validation-md.ts 回填 nodes_skeleton.json
- 主力机校验无超长警告" > .commit-msg.tmp
git add docs/m3-validation/person-checklist.md src/data/nodes_skeleton.json
git commit -F .commit-msg.tmp
rm .commit-msg.tmp
```

---

### Task 7: PM 校对 35 person · citation_urls（引用源）

**Files:**
- Modify: `docs/m3-validation/person-checklist.md`（PM 填）
- Modify: `src/data/nodes_skeleton.json`（脚本回填）

**目的**：PM 填 35 person 节点的 citation_urls。每节点 1-3 个权威引用源 URL。

- [ ] **Step 1: PM 操作 · 填 35 节点的 citation_urls**

主力机给 PM 的 prompt 模板：

```
PM 你好，最后一步——填 35 个 person 节点的 citation_urls（引用源 URL）。

每节点至少 1 个，建议 1-3 个，按以下优先级选源：
- 优先 1: marxists.org（MIA 马克思主义者文库，中/英/德/俄多语 + 学术权威）
   - 范例 marx: https://www.marxists.org/archive/marx/
   - 范例 engels: https://www.marxists.org/archive/marx/bio/marx/eng-1869.htm
- 优先 2: plato.stanford.edu（SEP 斯坦福哲学百科，学术权威）
   - 范例 marx: https://plato.stanford.edu/entries/marx/
   - 范例 hegel: https://plato.stanford.edu/entries/hegel/
- 优先 3: 维基百科中文条目（如学术源都没有就用，但避开 wikidata 因为 wikidata 链接已在 Wikidata 链接行）
   - 范例 marx: https://zh.wikipedia.org/wiki/卡尔·马克思

操作步骤：
1. 继续用 docs/m3-validation/person-checklist.md
2. 每个节点找 "- citation_urls:" 下面的列表
3. 删除占位行，每行一个 URL（缩进 2 空格 + "- "）
4. 全部填完保存
5. 告诉我："citations 填完了"
```

- [ ] **Step 2: 主力机回填 + acceptance test 全跑**

```bash
cd F:\AI\projects\Marx
npm run m3:apply-person
npm test -- tests/stage-b-validated.test.ts
```

Expected：person 4 字段 acceptance test → **PASS**（首次 GREEN）。其他 4 个 test 状态：work test FAIL（Task 8 才校）/ concept 存在 test FAIL（Task 9 才建）/ concept 字段 test 仍 vacuously PASS / 节点总数 PASS。

- [ ] **Step 3: 主力机额外校验 URL 格式**

```bash
node -e "const d=require('./src/data/nodes_skeleton.json'); for(const n of d.nodes){if(n.type==='person'&&n.citation_urls){for(const u of n.citation_urls){if(!u.startsWith('http')){console.warn('⚠ 非 http URL:',n.name_zh,'-',u);}}}}"
```

Expected：无非 http URL 警告。

- [ ] **Step 4: Commit**

```bash
echo "data(M3): 阶段 B 校对 person.citation_urls（35 节点引用源 URL）

- PM 按优先级 1-3 选源（marxists.org / plato.stanford.edu / 中文维基）
- scripts/apply-validation-md.ts 回填 nodes_skeleton.json
- acceptance test 'person 4 字段全填' 首次 GREEN ✓" > .commit-msg.tmp
git add docs/m3-validation/person-checklist.md src/data/nodes_skeleton.json
git commit -F .commit-msg.tmp
rm .commit-msg.tmp
```

---

### Task 8: PM 校对 4 work · 全字段

**Files:**
- Modify: `docs/m3-validation/work-checklist.md`（PM 填）
- Modify: `src/data/nodes_skeleton.json`（脚本回填）

**目的**：PM 一次性填 4 work 节点的全部字段（name_orig / writing_period / summary / author_id / citation_urls）。work 节点数少（4 个），所以一个 task 内 5 字段全填，不像 person 拆 4 个 task。

- [ ] **Step 1: PM 操作 · 填 4 work 节点全字段**

主力机给 PM 的 prompt 模板：

```
PM 你好，请填 4 个 work 节点的全字段。共 4 节点：
- 共产党宣言 (Q40591) - 1848 年 - Marx + Engels 合著
- 资本论 (Q58784) - 1867 年 - Marx
- 1844 年哲学和经济学手稿 (Q295347) - 1844 年（1932 出版） - Marx
- 德意志意识形态 (Q470600) - 1846 年（1932 出版） - Marx + Engels

操作步骤：
1. 用文本编辑器打开 F:\AI\projects\Marx\docs\m3-validation\work-checklist.md
2. 每个节点填 5 字段：
   - name_orig: 德文/英文原标题，如 Das Kapital / The Communist Manifesto
   - writing_period: 写作时段字符串，如 "1857-1867"（资本论第一卷写作期）
   - summary: 3 行内事件式简明，如：
     * "1867 - 第一卷出版"
     * "1885 - 恩格斯整理出版第二卷"
     * "1894 - 恩格斯整理出版第三卷"
   - author_id: 作者 ID（marx="wd-q9061" / engels Q-id 自查 Wikidata）。多作者填一个主要作者 ID
   - citation_urls: 1-3 个 URL，优先 marxists.org/archive/marx/works
3. 全部填完保存
4. 告诉我："work 填完了"
```

- [ ] **Step 2: 主力机回填 + acceptance test**

```bash
cd F:\AI\projects\Marx
npm run m3:apply-work
npm test -- tests/stage-b-validated.test.ts -t "work 节点"
```

Expected：work 节点 5 字段 acceptance test → **PASS**。

- [ ] **Step 3: 主力机校验 author_id 指向真实节点**

```bash
node -e "const d=require('./src/data/nodes_skeleton.json'); const ids=new Set(d.nodes.map(n=>n.id)); for(const n of d.nodes){if(n.type==='work'&&n.author_id&&!ids.has(n.author_id)){console.warn('⚠ author_id 不存在:',n.name_zh,'->',n.author_id);}}"
```

Expected：无 dangling author_id 警告。

- [ ] **Step 4: Commit**

```bash
echo "data(M3): 阶段 B 校对 4 work 节点全字段

- PM 填 name_orig / writing_period / summary / author_id / citation_urls
- 4 work：共产党宣言 / 资本论 / 1844 手稿 / 德意志意识形态
- author_id 指向实际节点（无 dangling）
- acceptance test 'work 5 字段全填' GREEN ✓" > .commit-msg.tmp
git add docs/m3-validation/work-checklist.md src/data/nodes_skeleton.json
git commit -F .commit-msg.tmp
rm .commit-msg.tmp
```

---

### Task 9: 新建 12 核心 concept 节点

**Files:**
- Modify: `src/types/Node.ts`（如需扩展 concept 类型字段）
- Modify: `src/data/nodes_skeleton.json`（新增 12 节点 + ~12 author 关系）
- Modify: `src/viz/relations.ts`（5 类节点中 concept 苔藓绿，其他维持墨黑）

**目的**：新建 design doc § 5.2 列出的 12 个核心 concept 节点 + 视觉上让 concept 节点显示苔藓绿（按 § 7.4）。

> **关于 successor_notes 字段**：concept 节点本身**不存** successor_notes 数据（旁注 300-500 字 × 40 条放节点字段会让 nodes_skeleton.json 膨胀 ~20KB → ~36KB），改为 Task 11 引入独立的 `src/data/concepts_extra.json`，通过 `concept_id` 关联。这跟 design doc § 5.4 的"concepts_extra.json"独立文件设计一致。§ 3.1 字段表里那行 `successor_notes[]` 是逻辑字段，物理实现走 concepts_extra。

**⚠️ 实施前第一句话喊（AGENTS.md 第 75-78 行硬要求）：**

```text
use frontend-design skill
use ui-ux-pro-max skill
```

虽然 M3 视觉触点小（仅"12 concept 节点苔藓绿 + 节点 label 双语"），但本 task 是 M3 唯一直接动 D3 渲染代码的地方，必须召唤双 skill。

- [ ] **Step 1: 检查 Node.ts 当前 Concept 类型定义是否齐全**

```bash
cat F:/AI/projects/Marx/src/types/Node.ts | head -80
```

如果 Concept 类型已含 design doc § 3.1 必填字段（id / name_zh / name_orig / proposed_year / proposed_work_id / definition_plain / citation_urls）+ optional `related_concepts_ids` / `evolution_path` / `first_proposed_location_lat_lng`，跳到 Step 3。否则 Step 2 补类型。

> 注：design doc § 3.1 那行 `successor_notes[]` 字段在 ConceptNode 上**不实现**（旁注走 concepts_extra.json，Task 11 单独建类型）。

- [ ] **Step 2: 补 Node.ts Concept 类型（如需）**

具体改动按 Step 1 检查结果，补缺字段。范本（按 design doc § 3.1 + § 5.4 设计选择，concept 节点不含 successor_notes 字段，旁注走 concepts_extra.json）：

```typescript
// src/types/Node.ts 内
export type ConceptNode = BaseNode & {
  type: 'concept'
  name_orig: string
  proposed_year: number
  proposed_work_id: string
  definition_plain: string[]  // ≤ 3 行白话定义
  citation_urls: string[]
  // ⚠️ successor_notes 不在 concept 节点上，在 src/data/concepts_extra.json 通过 concept_id 关联（§ 5.4）
  // optional
  related_concepts_ids?: string[]
  evolution_path?: string
  first_proposed_location_lat_lng?: [number, number]
}
```

- [ ] **Step 3: 准备 12 concept 节点数据**

按 design doc § 5.2 列表填，基础数据如下（PM 校对 definition_plain 正确性）：

```typescript
// 临时脚本 scripts/seed-concepts.ts（M3 一次性用，跑完可不入库或入库留个痕迹）
const CONCEPTS = [
  {
    id: 'concept-alienation',
    name_zh: '异化',
    name_orig: 'Verfremdung / Entfremdung',
    proposed_year: 1844,
    proposed_work_id: 'wd-q295347',  // 1844 手稿
    definition_plain: [
      '人在资本主义生产中跟"劳动产品 / 劳动过程 / 自己的本质 / 他人"四重疏离',
      '例：工人造的车不属于自己',
    ],
    citation_urls: [
      'https://www.marxists.org/chinese/marx/01.htm',
      'https://plato.stanford.edu/entries/marx/#Alie',
    ],
  },
  {
    id: 'concept-surplus-value',
    name_zh: '剩余价值',
    name_orig: 'Mehrwert',
    proposed_year: 1867,
    proposed_work_id: 'wd-q58784',  // 资本论
    definition_plain: [
      '工人创造的总价值减去劳动力价值（工资）的差额',
      '资本家无偿占有的部分，是利润 / 利息 / 地租的来源',
    ],
    citation_urls: [
      'https://www.marxists.org/chinese/Capital/index.htm',
      'https://plato.stanford.edu/entries/marx/#TheoExpl',
    ],
  },
  {
    id: 'concept-historical-materialism',
    name_zh: '历史唯物主义',
    name_orig: 'Historischer Materialismus',
    proposed_year: 1846,
    proposed_work_id: 'wd-q470600',  // 德意志意识形态
    definition_plain: [
      '社会发展的根本动力是生产力（不是观念 / 英雄）',
      '生产关系适应生产力，上层建筑适应经济基础',
    ],
    citation_urls: [
      'https://www.marxists.org/chinese/marx/01.htm',
      'https://plato.stanford.edu/entries/marx/#TheoHist',
    ],
  },
  {
    id: 'concept-class-struggle',
    name_zh: '阶级斗争',
    name_orig: 'Klassenkampf',
    proposed_year: 1848,
    proposed_work_id: 'wd-q40591',  // 共产党宣言
    definition_plain: [
      '"至今一切社会的历史都是阶级斗争的历史"（共产党宣言开篇）',
      '不同生产关系下的阶级（奴隶主/奴隶 → 封建主/农民 → 资本家/工人）冲突推动历史',
    ],
    citation_urls: [
      'https://www.marxists.org/chinese/marx-engels/01.htm',
      'https://plato.stanford.edu/entries/marx/#PrinHist',
    ],
  },
  {
    id: 'concept-commodity-fetishism',
    name_zh: '商品拜物教',
    name_orig: 'Warenfetischismus',
    proposed_year: 1867,
    proposed_work_id: 'wd-q58784',  // 资本论
    definition_plain: [
      '资本主义下"商品"显得有自己的灵魂、独立于生产者的关系',
      '本质是人与人的关系被颠倒为物与物的关系',
    ],
    citation_urls: [
      'https://www.marxists.org/chinese/Capital/index.htm',
      'https://plato.stanford.edu/entries/marx/#FetiComm',
    ],
  },
  {
    id: 'concept-ideology',
    name_zh: '意识形态',
    name_orig: 'Ideologie',
    proposed_year: 1846,
    proposed_work_id: 'wd-q470600',  // 德意志意识形态
    definition_plain: [
      '统治阶级的思想被普及为"全体的"思想，掩盖现实生产关系',
      '不是简单"洗脑"，而是物质生产关系的反映',
    ],
    citation_urls: [
      'https://www.marxists.org/chinese/marx/01.htm',
      'https://plato.stanford.edu/entries/marx/#PrinHist',
    ],
  },
  {
    id: 'concept-mode-of-production',
    name_zh: '生产方式',
    name_orig: 'Produktionsweise',
    proposed_year: 1859,
    proposed_work_id: 'wd-q58784',  // 资本论（先用资本论，PM 可改为政治经济学批判 wd-q-...）
    definition_plain: [
      '生产力 + 生产关系组合，决定一个社会的根本性质',
      '人类历史 5 阶段：原始 / 奴隶 / 封建 / 资本 / 共产',
    ],
    citation_urls: [
      'https://www.marxists.org/chinese/marx/01.htm',
      'https://plato.stanford.edu/entries/marx/#TheoHist',
    ],
  },
  {
    id: 'concept-base-superstructure',
    name_zh: '经济基础与上层建筑',
    name_orig: 'Basis und Überbau',
    proposed_year: 1859,
    proposed_work_id: 'wd-q58784',  // 资本论（同上）
    definition_plain: [
      '经济基础（生产关系总和）决定上层建筑（法律 / 政治 / 意识形态）',
      '上层建筑反作用于基础，但根本上由基础决定',
    ],
    citation_urls: [
      'https://www.marxists.org/chinese/marx/01.htm',
      'https://plato.stanford.edu/entries/marx/#TheoHist',
    ],
  },
  {
    id: 'concept-communism',
    name_zh: '共产主义',
    name_orig: 'Kommunismus',
    proposed_year: 1848,
    proposed_work_id: 'wd-q40591',  // 共产党宣言
    definition_plain: [
      '消灭私有制 / 阶级 / 国家后的社会形态',
      '"各尽所能，按需分配"',
    ],
    citation_urls: [
      'https://www.marxists.org/chinese/marx-engels/01.htm',
      'https://plato.stanford.edu/entries/marx/#Comm',
    ],
  },
  {
    id: 'concept-revolution',
    name_zh: '革命',
    name_orig: 'Revolution',
    proposed_year: 1848,
    proposed_work_id: 'wd-q40591',  // 共产党宣言
    definition_plain: [
      '生产关系不再适应生产力时，社会形态的根本转变',
      '资产阶级革命推翻封建 → 无产阶级革命推翻资本',
    ],
    citation_urls: [
      'https://www.marxists.org/chinese/marx-engels/01.htm',
      'https://plato.stanford.edu/entries/marx/#PrinHist',
    ],
  },
  {
    id: 'concept-labor-theory-of-value',
    name_zh: '劳动价值论',
    name_orig: 'Arbeitswerttheorie',
    proposed_year: 1867,
    proposed_work_id: 'wd-q58784',  // 资本论
    definition_plain: [
      '商品价值由生产它所必需的社会必要劳动时间决定',
      '继承自 Smith / Ricardo 但加入"剩余价值"分析',
    ],
    citation_urls: [
      'https://www.marxists.org/chinese/Capital/index.htm',
      'https://plato.stanford.edu/entries/marx/#TheoExpl',
    ],
  },
  {
    id: 'concept-state',
    name_zh: '国家',
    name_orig: 'Staat',
    proposed_year: 1848,
    proposed_work_id: 'wd-q40591',  // 共产党宣言
    definition_plain: [
      '国家是阶级矛盾不可调和的产物 + 统治阶级的暴力工具',
      '不是"全民共同体"——共产主义实现后国家会消亡',
    ],
    citation_urls: [
      'https://www.marxists.org/chinese/marx-engels/01.htm',
      'https://plato.stanford.edu/entries/marx/#StatLawPoli',
    ],
  },
] as const

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const ROOT = resolve(import.meta.dirname, '..')
const JSON_PATH = resolve(ROOT, 'src/data/nodes_skeleton.json')
const data = JSON.parse(readFileSync(JSON_PATH, 'utf-8'))

for (const c of CONCEPTS) {
  if (data.nodes.find((n) => n.id === c.id)) {
    console.log(`⏭ ${c.id} 已存在，跳过`)
    continue
  }
  data.nodes.push({ ...c, type: 'concept' })
  // 同时新增 marx → concept 的 proposed_concept 关系（design doc § 4.1）
  data.relations.push({
    source: 'wd-q9061',
    target: c.id,
    type: 'proposed_concept',
  })
  console.log(`✓ 新增 concept ${c.id} ${c.name_zh} + 关系 marx→${c.id}`)
}

writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf-8')
console.log(`✓ 写回完成，共 ${data.nodes.length} 节点 / ${data.relations.length} 关系`)
```

把上面整段保存到 `scripts/seed-concepts.ts`。

- [ ] **Step 4: PM 校对 12 concept 节点的 definition_plain（在主力机上 review）**

主力机给 PM 的 prompt：

```
PM 你好，请校对 12 核心概念的 definition_plain（白话定义 ≤ 3 行）。

我已经写了草稿（见 scripts/seed-concepts.ts 的 CONCEPTS 数组），请你逐个看：
1. 异化 / 剩余价值 / 历史唯物主义 / 阶级斗争 / 商品拜物教
2. 意识形态 / 生产方式 / 经济基础与上层建筑 / 共产主义
3. 革命 / 劳动价值论 / 国家

每个概念检查：
- definition_plain 是不是 ≤ 3 行？
- 是不是真"白话"？（避开"辩证统一""客观规律"等学术术语）
- 用例子辅助理解了吗？（如异化举工人造车的例子）
- proposed_work_id 指向的著作合理吗？
  ⚠️ 注意 mode-of-production / base-superstructure 我都填了 wd-q58784（资本论），实际应该是《政治经济学批判》(1859)，但目前没这个 work 节点。先用资本论，M3.5 补 work 时改

如有改动，告诉我"概念 X 的 definition_plain 改成: ...，proposed_work_id 改成 ..."
```

- [ ] **Step 5: 跑 seed-concepts.ts 写入 nodes_skeleton.json**

```bash
cd F:\AI\projects\Marx
npx tsx scripts/seed-concepts.ts
```

Expected：12 行 ✓ 输出 + 写回成功。共 39+12 = 51 节点 / 42+12 = 54 关系。

- [ ] **Step 6: 修改 src/viz/relations.ts 让 concept 节点显示苔藓绿**

先看现有渲染逻辑：

```bash
cat F:/AI/projects/Marx/src/viz/relations.ts
```

按现有逻辑里节点 fill 的设置点（M2 全设墨黑），加 concept 类型分支：

```typescript
// 在 src/viz/relations.ts 里节点 fill 设置点，从：
//   .attr('fill', 'var(--ink)')
// 改为基于 type 分发：
.attr('fill', (d) => d.type === 'concept' ? '#5C7148' : 'var(--ink)')
```

这是 M3 唯一视觉触点（按 design doc § 7.4 苔藓绿色值）。其他 4 类节点（person / work / event / place）维持 M2 单色（墨黑），M4 才统一改 5 色。

- [ ] **Step 7: 跑测试 + build**

```bash
cd F:\AI\projects\Marx
npm test -- tests/stage-b-validated.test.ts
npm run build
```

Expected：
- acceptance test "12 核心 concept 存在" → **PASS**
- acceptance test "concept 必填字段" → **PASS**
- 节点总数 test → **PASS**（51 在 [36, 60] 区间）
- person + work test → **PASS**（Task 4-8 已完成）
- 5/5 全 GREEN ✓
- build 成功

- [ ] **Step 8: prettier 限定范围 format**

```bash
npx prettier --write src/ scripts/ tests/
```

防 M2 坑 14（prettier 全局扫描顺手改 mockup）。

- [ ] **Step 9: Commit**

```bash
echo "feat(M3): 阶段 B 新建 12 核心 concept 节点 + 苔藓绿渲染

- 按 design doc § 5.2 12 概念 + § 3.1 必填字段
- 异化 / 剩余价值 / 历史唯物主义 / 阶级斗争 / 商品拜物教 / 意识形态 /
  生产方式 / 经济基础与上层建筑 / 共产主义 / 革命 / 劳动价值论 / 国家
- 旁注通过 concepts_extra.json 关联（concept 节点本身不含 successor_notes 字段，Task 11 引入独立类型）
- src/viz/relations.ts concept 节点苔藓绿 #5C7148 (§ 7.4)
- 同时新增 marx → 12 concept 的 proposed_concept 关系 (§ 4.1)
- acceptance test 5/5 GREEN ✓
- 实施时召唤了 frontend-design + ui-ux-pro-max skill" > .commit-msg.tmp
git add src/types/Node.ts src/data/nodes_skeleton.json src/viz/relations.ts scripts/seed-concepts.ts
git commit -F .commit-msg.tmp
rm .commit-msg.tmp
```

---

### Task 10: 阶段 B 验收 + 中点 review + 在线视觉 check

**Files:**
- Modify: `e2e/stage-bc-rendered.spec.ts`（新增，先只测 stage-b 部分）

**目的**：阶段 B 完成验收 + 浏览器目测在线 URL + PM 决策"继续阶段 C 还是先停"。

- [ ] **Step 1: 加 e2e 测试节点数 + concept 节点存在**

```typescript
// e2e/stage-bc-rendered.spec.ts
import { test, expect } from '@playwright/test'

test.describe('M3 stage B + C rendered', () => {
  test('节点总数 >= 39（含 12 concept）', async ({ page }) => {
    await page.goto('http://localhost:5173/marx/')
    await page.waitForSelector('svg circle')
    const count = await page.locator('svg circle').count()
    expect(count).toBeGreaterThanOrEqual(39)
  })

  test('12 concept 节点显示苔藓绿', async ({ page }) => {
    await page.goto('http://localhost:5173/marx/')
    await page.waitForSelector('svg circle[fill="#5C7148"]')
    const greenCount = await page.locator('svg circle[fill="#5C7148"]').count()
    expect(greenCount).toBe(12)
  })

  test('节点 label 双语显示（中文 + 原文名）', async ({ page }) => {
    await page.goto('http://localhost:5173/marx/')
    await page.waitForSelector('svg text')
    // marx 节点 label 应包含 "Karl Marx" 原文名
    const labels = await page.locator('svg text').allTextContents()
    const hasMarxOrig = labels.some((l) => l.includes('Karl Marx'))
    expect(hasMarxOrig).toBe(true)
  })
})
```

⚠️ "节点 label 双语"测试：如果 src/viz/relations.ts 当前 label 渲染只显示 name_zh，本测试会 FAIL。需要 Task 9 同步改一下 label 渲染（如 `${d.name_zh} / ${d.name_orig}` 双语）。这个改动 Task 9 Step 6 顺便加。

- [ ] **Step 2: 跑全套测试**

```bash
cd F:\AI\projects\Marx
npm test
npm run e2e
```

Expected：
- npm test：16+5+? = ~22 pass（含 stage-b acceptance 5 + 原 16 + 新加的 e2e specs 不算入 vitest）
- npm run e2e：原 5 + 3 新 = 8 pass

- [ ] **Step 3: build + 启动本地 preview**

```bash
cd F:\AI\projects\Marx
npm run build
npm run preview
```

打开浏览器访问 http://localhost:4173/marx/ 目测：
- 看到 51 节点（39 person/work + 12 concept）
- 12 concept 节点显示苔藓绿 #5C7148
- 节点 label 双语（中文 + 原文名）
- 牛皮纸底 + 衬线字体保留

- [ ] **Step 4: 推送到远端 + GitHub Actions 跑 + 在线 URL 目测**

```bash
git push origin main
```

等 GitHub Actions 跑完（~3-5 分钟），打开 https://cdu52802-xx.github.io/marx/ 目测：
- 同 Step 3，但是在线版

- [ ] **Step 5: 主力机给 PM "中点 review" prompt**

```
PM 你好，M3 阶段 B 已完成 ✓

形态：51 节点（35 person + 4 work + 12 concept）+ 54 关系
- 39 个原 SPARQL 节点字段全填齐（双语 label / 经纬度 / 事件式 bio / 引用源）
- 12 个核心 concept 节点苔藓绿首次出现
- 误分类节点已处理

接下来 阶段 C 工作量预估：
- 涉及 SEP 等国外 endpoint（要复用 M2 第三机方案）
- 12 概念 × 3-5 后来者 = ~40 旁注，每条 300-500 字
- 工作量评估：~24-48 小时（PM 校对部分约 6-10 小时）
- 主要环节：
  1. 主力机给你 ~20 个 SEP URL 清单
  2. 你第三机浏览器打开 + 另存为 HTML + 微信回传
  3. 主力机 parse HTML → AI 总结 ~40 条旁注草稿
  4. 你校对每条旁注的事件式 + 字数 + 引用源准确性
  5. 集成到产品 + e2e

请选择：
A. 继续阶段 C（按上述 5 步走）
B. 先暂停，阶段 B ship 后等几天/几周再开 C（M3 拆分为 M3a 已完成 / M3b 待开）
C. 调整阶段 C 范围（如先只做 6 概念 × 3 后来者，剩下 6 推后）
```

- [ ] **Step 6: Commit Task 10 e2e + 进度文档**

```bash
echo "test(M3): 阶段 B 完成验收 + e2e 加 stage-b spec

- e2e/stage-bc-rendered.spec.ts 新增 3 spec
- 节点数 >= 39 / 12 concept 苔藓绿 / label 双语
- 全套测试 GREEN ✓
- 阶段 B 完成，等 PM 决策是否继续阶段 C" > .commit-msg.tmp
git add e2e/stage-bc-rendered.spec.ts
git commit -F .commit-msg.tmp
rm .commit-msg.tmp
git push origin main
```

⏸ **如果 PM 选 B，M3 阶段 B 在此 milestone 完成，落 takeaway（提前 Task 17 落，section 改为"M3a takeaway"）。如果 PM 选 A 或 C，进入 Task 11**。

---

## 阶段 C · 12 核心概念后来者旁注（Task 11-17）

> **前置条件**：Task 10 PM 选 A（全跑）或 C（缩范围）后才进入本节。如果选 B，本节内容推迟到 M3b plan。

### Task 11: 设计 concepts_extra schema + 校验脚本

**Files:**
- Create: `src/data/concepts_extra.json`（先建空骨架）
- Create: `scripts/validate-concepts-extra.ts`
- Create: `tests/concepts-extra-schema.test.ts`
- Modify: `src/types/Node.ts`（加 ConceptExtra + SuccessorNote 类型）

**目的**：阶段 C 写代码前先把数据结构 + 校验脚本定义清楚。这是阶段 B Task 1 acceptance test 思路的复用。

- [ ] **Step 1: 在 src/types/Node.ts 加类型定义**

```typescript
// src/types/Node.ts 末尾追加
export type SuccessorNote = {
  scholar_id: string         // 后来者 ID，如 "scholar-lukacs"
  scholar_name_zh: string    // 卢卡奇
  scholar_name_orig: string  // György Lukács
  scholar_year: number       // 1923 - 卢卡奇《历史与阶级意识》
  note_text: string          // 300-500 字旁注内容
  note_word_count: number    // 字数（脚本算）
  citation_urls: string[]    // 1-3 个引用源
}

export type ConceptExtra = {
  concept_id: string         // 关联 nodes_skeleton.json concept 节点的 id
  marx_self_use?: string     // "Marx 自己怎么用"（演化轨迹 ≤3 行）
  successor_notes: SuccessorNote[]
}

export type ConceptsExtraFile = {
  concepts: ConceptExtra[]
}
```

- [ ] **Step 2: 创建空骨架 src/data/concepts_extra.json**

```json
{
  "concepts": []
}
```

- [ ] **Step 3: 写 schema 校验脚本 scripts/validate-concepts-extra.ts**

```typescript
// scripts/validate-concepts-extra.ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ConceptsExtraFile, ConceptExtra, SuccessorNote } from '../src/types/Node'

const ROOT = resolve(import.meta.dirname, '..')
const FILE = resolve(ROOT, 'src/data/concepts_extra.json')
const NODES = resolve(ROOT, 'src/data/nodes_skeleton.json')

export function validateConceptsExtra(extra: ConceptsExtraFile, allConceptIds: Set<string>): string[] {
  const errors: string[] = []
  const seenConceptIds = new Set<string>()
  for (const c of extra.concepts) {
    if (seenConceptIds.has(c.concept_id)) errors.push(`重复 concept_id: ${c.concept_id}`)
    seenConceptIds.add(c.concept_id)
    if (!allConceptIds.has(c.concept_id)) errors.push(`concept_id 在 nodes_skeleton.json 找不到: ${c.concept_id}`)
    if (!Array.isArray(c.successor_notes)) {
      errors.push(`${c.concept_id} successor_notes 必须是数组`)
      continue
    }
    if (c.successor_notes.length < 3 || c.successor_notes.length > 5) {
      errors.push(`${c.concept_id} successor_notes 数量 ${c.successor_notes.length} 不在 [3, 5] 区间`)
    }
    for (const n of c.successor_notes) {
      if (!n.scholar_id || !n.scholar_name_zh || !n.note_text) {
        errors.push(`${c.concept_id} successor 缺必填字段: ${JSON.stringify(n).slice(0, 80)}`)
        continue
      }
      const wc = n.note_text.length
      if (wc < 300 || wc > 500) {
        errors.push(`${c.concept_id} ${n.scholar_name_zh} 字数 ${wc} 不在 [300, 500]`)
      }
      if (!Array.isArray(n.citation_urls) || n.citation_urls.length === 0) {
        errors.push(`${c.concept_id} ${n.scholar_name_zh} 缺 citation_urls`)
      }
    }
  }
  return errors
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  const extra = JSON.parse(readFileSync(FILE, 'utf-8')) as ConceptsExtraFile
  const nodes = JSON.parse(readFileSync(NODES, 'utf-8')) as { nodes: { id: string; type: string }[] }
  const allConceptIds = new Set(nodes.nodes.filter((n) => n.type === 'concept').map((n) => n.id))
  const errors = validateConceptsExtra(extra, allConceptIds)
  if (errors.length === 0) {
    console.log(`✓ concepts_extra.json 校验通过（${extra.concepts.length} 概念）`)
  } else {
    console.error(`✗ ${errors.length} 个错误:`)
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }
}
```

- [ ] **Step 4: 写 vitest 测试 tests/concepts-extra-schema.test.ts**

```typescript
// tests/concepts-extra-schema.test.ts
import { describe, it, expect } from 'vitest'
import { validateConceptsExtra } from '../scripts/validate-concepts-extra'

const CORE_CONCEPTS = new Set([
  'concept-alienation', 'concept-surplus-value', 'concept-historical-materialism',
  'concept-class-struggle', 'concept-commodity-fetishism', 'concept-ideology',
  'concept-mode-of-production', 'concept-base-superstructure', 'concept-communism',
  'concept-revolution', 'concept-labor-theory-of-value', 'concept-state',
])

describe('concepts_extra schema', () => {
  it('空 file 通过（successor_notes 待填）', () => {
    const errors = validateConceptsExtra({ concepts: [] }, CORE_CONCEPTS)
    expect(errors).toEqual([])
  })

  it('successor_notes 数量 < 3 报错', () => {
    const errors = validateConceptsExtra(
      { concepts: [{ concept_id: 'concept-alienation', successor_notes: [{ scholar_id: 's1', scholar_name_zh: '卢', scholar_name_orig: 'L', scholar_year: 1923, note_text: 'a'.repeat(400), note_word_count: 400, citation_urls: ['http://x'] }] }] },
      CORE_CONCEPTS
    )
    expect(errors.some((e) => e.includes('数量 1 不在 [3, 5]'))).toBe(true)
  })

  it('字数 < 300 报错', () => {
    const errors = validateConceptsExtra(
      {
        concepts: [{
          concept_id: 'concept-alienation',
          successor_notes: Array.from({ length: 3 }, (_, i) => ({
            scholar_id: `s${i}`,
            scholar_name_zh: '卢',
            scholar_name_orig: 'L',
            scholar_year: 1923,
            note_text: 'a'.repeat(100),  // < 300
            note_word_count: 100,
            citation_urls: ['http://x'],
          })),
        }],
      },
      CORE_CONCEPTS
    )
    expect(errors.some((e) => e.includes('字数 100'))).toBe(true)
  })

  it('concept_id 不在 nodes_skeleton 报错', () => {
    const errors = validateConceptsExtra(
      {
        concepts: [{
          concept_id: 'concept-fake',
          successor_notes: Array.from({ length: 3 }, (_, i) => ({
            scholar_id: `s${i}`,
            scholar_name_zh: '卢',
            scholar_name_orig: 'L',
            scholar_year: 1923,
            note_text: 'a'.repeat(400),
            note_word_count: 400,
            citation_urls: ['http://x'],
          })),
        }],
      },
      CORE_CONCEPTS
    )
    expect(errors.some((e) => e.includes('concept-fake'))).toBe(true)
  })
})
```

- [ ] **Step 5: 加 npm script**

修改 `package.json` `scripts` 节追加：

```jsonc
{
  "scripts": {
    // ... 现有 +
    "m3:validate-concepts-extra": "tsx scripts/validate-concepts-extra.ts"
  }
}
```

- [ ] **Step 6: 跑测试确认 GREEN**

```bash
cd F:\AI\projects\Marx
npm test -- tests/concepts-extra-schema.test.ts
npm run m3:validate-concepts-extra
```

Expected：
- 4 vitest pass
- validate 脚本输出 `✓ concepts_extra.json 校验通过（0 概念）`

- [ ] **Step 7: Commit**

```bash
echo "feat(M3): 阶段 C concepts_extra schema + 校验

- src/types/Node.ts 加 ConceptExtra + SuccessorNote 类型
- src/data/concepts_extra.json 空骨架占位
- scripts/validate-concepts-extra.ts 校验脚本
- tests/concepts-extra-schema.test.ts 4 个 vitest
- npm run m3:validate-concepts-extra 一键校验
- 字数 [300, 500] / successor 数量 [3, 5] 强制 (design doc § 5.3)" > .commit-msg.tmp
git add src/types/Node.ts src/data/concepts_extra.json scripts/validate-concepts-extra.ts tests/concepts-extra-schema.test.ts package.json
git commit -F .commit-msg.tmp
rm .commit-msg.tmp
```

---

### Task 12: 准备阶段 C 离线缓存清单（~20 SEP URL）

**Files:**
- Create: `scripts/sep-urls.json`
- Modify: `.gitignore`（加 `scripts/sep-cache/*.html`）
- Create: `scripts/sep-cache/.gitkeep`

**目的**：主力机生成 PM 第三机要下载的完整 SEP URL 清单 + 命名规则。

- [ ] **Step 1: 写 scripts/sep-urls.json（手工列）**

```json
{
  "concepts": [
    {
      "concept_id": "concept-alienation",
      "concept_name_zh": "异化",
      "sep_concept_url": "https://plato.stanford.edu/entries/marx/",
      "sep_concept_anchor": "#Alie",
      "successors": [
        {"scholar_id": "scholar-lukacs", "scholar_name_zh": "卢卡奇", "sep_url": "https://plato.stanford.edu/entries/lukacs/"},
        {"scholar_id": "scholar-marcuse", "scholar_name_zh": "马尔库塞", "sep_url": "https://plato.stanford.edu/entries/marcuse/"},
        {"scholar_id": "scholar-althusser", "scholar_name_zh": "阿尔都塞", "sep_url": "https://plato.stanford.edu/entries/althusser/"},
        {"scholar_id": "scholar-habermas", "scholar_name_zh": "哈贝马斯", "sep_url": "https://plato.stanford.edu/entries/habermas/"}
      ]
    },
    {
      "concept_id": "concept-surplus-value",
      "concept_name_zh": "剩余价值",
      "sep_concept_url": "https://plato.stanford.edu/entries/marx/",
      "sep_concept_anchor": "#TheoExpl",
      "successors": [
        {"scholar_id": "scholar-luxemburg", "scholar_name_zh": "卢森堡", "sep_url": "https://plato.stanford.edu/entries/luxemburg/"},
        {"scholar_id": "scholar-harvey", "scholar_name_zh": "哈维", "sep_url": "https://en.wikipedia.org/wiki/David_Harvey"},
        {"scholar_id": "scholar-althusser", "scholar_name_zh": "阿尔都塞", "sep_url": "https://plato.stanford.edu/entries/althusser/"}
      ]
    },
    {
      "concept_id": "concept-historical-materialism",
      "concept_name_zh": "历史唯物主义",
      "sep_concept_url": "https://plato.stanford.edu/entries/marx/",
      "sep_concept_anchor": "#TheoHist",
      "successors": [
        {"scholar_id": "scholar-althusser", "scholar_name_zh": "阿尔都塞", "sep_url": "https://plato.stanford.edu/entries/althusser/"},
        {"scholar_id": "scholar-gramsci", "scholar_name_zh": "葛兰西", "sep_url": "https://plato.stanford.edu/entries/gramsci/"},
        {"scholar_id": "scholar-balibar", "scholar_name_zh": "巴利巴尔", "sep_url": "https://en.wikipedia.org/wiki/%C3%89tienne_Balibar"}
      ]
    },
    {
      "concept_id": "concept-class-struggle",
      "concept_name_zh": "阶级斗争",
      "sep_concept_url": "https://plato.stanford.edu/entries/marx/",
      "sep_concept_anchor": "#PrinHist",
      "successors": [
        {"scholar_id": "scholar-lenin", "scholar_name_zh": "列宁", "sep_url": "https://en.wikipedia.org/wiki/Vladimir_Lenin"},
        {"scholar_id": "scholar-luxemburg", "scholar_name_zh": "卢森堡", "sep_url": "https://plato.stanford.edu/entries/luxemburg/"},
        {"scholar_id": "scholar-gramsci", "scholar_name_zh": "葛兰西", "sep_url": "https://plato.stanford.edu/entries/gramsci/"}
      ]
    },
    {
      "concept_id": "concept-commodity-fetishism",
      "concept_name_zh": "商品拜物教",
      "sep_concept_url": "https://plato.stanford.edu/entries/marx/",
      "sep_concept_anchor": "#FetiComm",
      "successors": [
        {"scholar_id": "scholar-lukacs", "scholar_name_zh": "卢卡奇", "sep_url": "https://plato.stanford.edu/entries/lukacs/"},
        {"scholar_id": "scholar-jameson", "scholar_name_zh": "詹姆逊", "sep_url": "https://en.wikipedia.org/wiki/Fredric_Jameson"},
        {"scholar_id": "scholar-marcuse", "scholar_name_zh": "马尔库塞", "sep_url": "https://plato.stanford.edu/entries/marcuse/"}
      ]
    },
    {
      "concept_id": "concept-ideology",
      "concept_name_zh": "意识形态",
      "sep_concept_url": "https://plato.stanford.edu/entries/marx/",
      "sep_concept_anchor": "#PrinHist",
      "successors": [
        {"scholar_id": "scholar-althusser", "scholar_name_zh": "阿尔都塞", "sep_url": "https://plato.stanford.edu/entries/althusser/"},
        {"scholar_id": "scholar-gramsci", "scholar_name_zh": "葛兰西", "sep_url": "https://plato.stanford.edu/entries/gramsci/"},
        {"scholar_id": "scholar-habermas", "scholar_name_zh": "哈贝马斯", "sep_url": "https://plato.stanford.edu/entries/habermas/"}
      ]
    },
    {
      "concept_id": "concept-mode-of-production",
      "concept_name_zh": "生产方式",
      "sep_concept_url": "https://plato.stanford.edu/entries/marx/",
      "sep_concept_anchor": "#TheoHist",
      "successors": [
        {"scholar_id": "scholar-althusser", "scholar_name_zh": "阿尔都塞", "sep_url": "https://plato.stanford.edu/entries/althusser/"},
        {"scholar_id": "scholar-balibar", "scholar_name_zh": "巴利巴尔", "sep_url": "https://en.wikipedia.org/wiki/%C3%89tienne_Balibar"},
        {"scholar_id": "scholar-harvey", "scholar_name_zh": "哈维", "sep_url": "https://en.wikipedia.org/wiki/David_Harvey"}
      ]
    },
    {
      "concept_id": "concept-base-superstructure",
      "concept_name_zh": "经济基础与上层建筑",
      "sep_concept_url": "https://plato.stanford.edu/entries/marx/",
      "sep_concept_anchor": "#TheoHist",
      "successors": [
        {"scholar_id": "scholar-gramsci", "scholar_name_zh": "葛兰西", "sep_url": "https://plato.stanford.edu/entries/gramsci/"},
        {"scholar_id": "scholar-althusser", "scholar_name_zh": "阿尔都塞", "sep_url": "https://plato.stanford.edu/entries/althusser/"},
        {"scholar_id": "scholar-habermas", "scholar_name_zh": "哈贝马斯", "sep_url": "https://plato.stanford.edu/entries/habermas/"}
      ]
    },
    {
      "concept_id": "concept-communism",
      "concept_name_zh": "共产主义",
      "sep_concept_url": "https://plato.stanford.edu/entries/marx/",
      "sep_concept_anchor": "#Comm",
      "successors": [
        {"scholar_id": "scholar-lenin", "scholar_name_zh": "列宁", "sep_url": "https://en.wikipedia.org/wiki/Vladimir_Lenin"},
        {"scholar_id": "scholar-luxemburg", "scholar_name_zh": "卢森堡", "sep_url": "https://plato.stanford.edu/entries/luxemburg/"},
        {"scholar_id": "scholar-gramsci", "scholar_name_zh": "葛兰西", "sep_url": "https://plato.stanford.edu/entries/gramsci/"}
      ]
    },
    {
      "concept_id": "concept-revolution",
      "concept_name_zh": "革命",
      "sep_concept_url": "https://plato.stanford.edu/entries/marx/",
      "sep_concept_anchor": "#PrinHist",
      "successors": [
        {"scholar_id": "scholar-lenin", "scholar_name_zh": "列宁", "sep_url": "https://en.wikipedia.org/wiki/Vladimir_Lenin"},
        {"scholar_id": "scholar-luxemburg", "scholar_name_zh": "卢森堡", "sep_url": "https://plato.stanford.edu/entries/luxemburg/"},
        {"scholar_id": "scholar-gramsci", "scholar_name_zh": "葛兰西", "sep_url": "https://plato.stanford.edu/entries/gramsci/"}
      ]
    },
    {
      "concept_id": "concept-labor-theory-of-value",
      "concept_name_zh": "劳动价值论",
      "sep_concept_url": "https://plato.stanford.edu/entries/marx/",
      "sep_concept_anchor": "#TheoExpl",
      "successors": [
        {"scholar_id": "scholar-luxemburg", "scholar_name_zh": "卢森堡", "sep_url": "https://plato.stanford.edu/entries/luxemburg/"},
        {"scholar_id": "scholar-harvey", "scholar_name_zh": "哈维", "sep_url": "https://en.wikipedia.org/wiki/David_Harvey"},
        {"scholar_id": "scholar-althusser", "scholar_name_zh": "阿尔都塞", "sep_url": "https://plato.stanford.edu/entries/althusser/"}
      ]
    },
    {
      "concept_id": "concept-state",
      "concept_name_zh": "国家",
      "sep_concept_url": "https://plato.stanford.edu/entries/marx/",
      "sep_concept_anchor": "#StatLawPoli",
      "successors": [
        {"scholar_id": "scholar-gramsci", "scholar_name_zh": "葛兰西", "sep_url": "https://plato.stanford.edu/entries/gramsci/"},
        {"scholar_id": "scholar-althusser", "scholar_name_zh": "阿尔都塞", "sep_url": "https://plato.stanford.edu/entries/althusser/"},
        {"scholar_id": "scholar-lenin", "scholar_name_zh": "列宁", "sep_url": "https://en.wikipedia.org/wiki/Vladimir_Lenin"}
      ]
    }
  ]
}
```

去重后实际唯一 SEP URL 数（每位后来者下载 1 次）：
- Marx 概念主页：1（包含所有 anchor）
- 卢卡奇 / 葛兰西 / 阿尔都塞 / 哈贝马斯 / 卢森堡 / 列宁 / 马尔库塞 / 哈维 / 詹姆逊 / 巴利巴尔 = 10
- 总共 11 个独立 URL（不是 36-60，因为 1 个学者覆盖多个概念）

- [ ] **Step 2: 改 .gitignore 排除 sep-cache HTML**

在 .gitignore 末尾追加：

```
# M3 阶段 C 临时缓存 - SEP HTML 不入库（版权 + 体积）
scripts/sep-cache/*.html
!scripts/sep-cache/.gitkeep
```

- [ ] **Step 3: 创建 sep-cache 目录**

```bash
mkdir -p F:/AI/projects/Marx/scripts/sep-cache
echo "" > F:/AI/projects/Marx/scripts/sep-cache/.gitkeep
```

- [ ] **Step 4: 验证 .gitignore 生效**

```bash
echo "test" > F:/AI/projects/Marx/scripts/sep-cache/test.html
git status --short scripts/sep-cache/
```

Expected：只看到 `?? scripts/sep-cache/.gitkeep`，不看到 test.html。

清理：
```bash
rm F:/AI/projects/Marx/scripts/sep-cache/test.html
```

- [ ] **Step 5: Commit**

```bash
echo "feat(M3): 阶段 C SEP URL 清单 + 离线缓存目录

- scripts/sep-urls.json 列 11 个独立 SEP URL（12 概念 × 平均 3.5 后来者，去重）
- scripts/sep-cache/ 目录占位（HTML 不入库，版权 + 体积）
- .gitignore 排除 sep-cache/*.html
- 复用 M2 方案 b 三机协作模式（takeaway 决策 1）" > .commit-msg.tmp
git add scripts/sep-urls.json scripts/sep-cache/.gitkeep .gitignore
git commit -F .commit-msg.tmp
rm .commit-msg.tmp
```

---

### Task 13: PM 第三机操作回传 SEP HTML

**Files:**
- 不动代码（纯 PM 操作 + 主力机接收）

**目的**：PM 第三机浏览器下载 11 个 SEP HTML → 微信回传主力机 → 主力机存到 scripts/sep-cache/。

**M2 坑 17 防御**（阶段间断切换协作的 visual companion 缺失）：本 task 主力机 idle 期间给 PM 完整 step-by-step 操作清单。

- [ ] **Step 1: 主力机给 PM 完整操作 prompt**

```
PM 你好，请第三机操作下载 11 个 SEP HTML：

📋 总体流程：
- 第三机：浏览器打开 → 另存为 HTML → 微信文件传输助手回传
- 主力机：接收后我来 parse + 总结

⚙️ 单个 URL 操作步骤（先做第 1 个测试格式 ✅）：

第 1 个 URL（先单独做，让我验证下载格式）：
1. 第三机打开 https://plato.stanford.edu/entries/marx/
2. 浏览器右键 → "另存为" → 选"网页，仅 HTML"（不要"完整网页 + 图片"，HTML 单文件够用）
3. 文件名命名：marx.html（小写无下划线无空格）
4. 文件传到微信文件传输助手
5. 主力机我接收后存到 F:\AI\projects\Marx\scripts\sep-cache\marx.html
6. 我跑 parse sanity check 确认格式 ✓ 后，再给你后续 10 个

第 1 个完成后告诉我："marx.html 传完了"

❓ 常见问题：
- 第三机打不开 SEP？→ 检查代理是否开启
- 浏览器没有"另存为"选项？→ Ctrl+S 快捷键 / 浏览器三点菜单"网页另存为"
- 微信文件传输助手怎么用？→ 微信桌面版搜索"文件传输助手" → 拖文件进对话框
```

- [ ] **Step 2: PM 完成第 1 个文件回传后，主力机做 sanity check**

```bash
cd F:\AI\projects\Marx
ls -lh scripts/sep-cache/marx.html
node -e "const fs=require('fs'); const html=fs.readFileSync('scripts/sep-cache/marx.html','utf-8'); console.log('长度:',html.length); console.log('前 500 字:'); console.log(html.slice(0,500));"
```

Expected：
- 文件存在 + 大小 > 50KB（SEP 词条页 HTML 通常 100-500KB）
- 前 500 字含 `<!DOCTYPE html>` + `<title>` + `Marx`
- 含 `<h2>` 标题（用于 Task 14 parse anchor）

如果格式不对（如不含 `<h2>` / 不是完整 HTML），跟 PM 同步换"另存为"模式（如选"完整网页"试试）→ 重新下 1 个测试 → 调整 parser。

- [ ] **Step 3: 主力机给 PM 后续 10 个 URL 清单**

```
✅ marx.html 格式 OK，请按同样流程下载剩余 10 个：

(注：file_name 列严格按这个命名，主力机 parser 靠文件名识别)

| URL | file_name |
|---|---|
| https://plato.stanford.edu/entries/lukacs/ | lukacs.html |
| https://plato.stanford.edu/entries/gramsci/ | gramsci.html |
| https://plato.stanford.edu/entries/althusser/ | althusser.html |
| https://plato.stanford.edu/entries/habermas/ | habermas.html |
| https://plato.stanford.edu/entries/luxemburg/ | luxemburg.html |
| https://plato.stanford.edu/entries/marcuse/ | marcuse.html |
| https://en.wikipedia.org/wiki/Vladimir_Lenin | lenin.html |
| https://en.wikipedia.org/wiki/Fredric_Jameson | jameson.html |
| https://en.wikipedia.org/wiki/David_Harvey | harvey.html |
| https://en.wikipedia.org/wiki/%C3%89tienne_Balibar | balibar.html |

📦 全部下完一次性微信回传：
- 可以打包成 zip（scholars-sep.zip）一次传，主力机解压
- 或 11 个文件分批传（耗时但稳）

回来告诉我："SEP HTML 全传完了"

⏳ 我估计你这步耗时 30-60 分钟（11 个 URL，每个浏览器加载 + 另存为 ~3-5 分钟）。
```

- [ ] **Step 4: 主力机收齐后再次 sanity check**

```bash
cd F:\AI\projects\Marx
ls -lh scripts/sep-cache/
```

Expected：11 个 HTML 文件，每个 50-500KB。

- [ ] **Step 5: Commit（不入库 HTML，但 .gitkeep 保留）**

```bash
echo "data(M3): 阶段 C PM 第三机回传 11 个 SEP HTML

- 第三机浏览器另存为模式下载（M2 方案 b 三机协作）
- 11 个文件存 scripts/sep-cache/（gitignore 不入库，版权 + 体积）
- 含 marx 概念主页 + 10 后来者词条
- 主力机已 sanity check 格式（含 <h2> + > 50KB）
- 不 commit HTML 内容，仅记录 takeaway 完成节点" > .commit-msg.tmp
git commit --allow-empty -F .commit-msg.tmp
rm .commit-msg.tmp
```

`--allow-empty` 因为这步没有代码改动，但需要在 commit 链里留一个节点表示"PM 完成第三机操作"。

---

### Task 14: 主力机基于 SEP 内容生成旁注草稿

**Files:**
- Create: `scripts/extract-sep-content.ts`
- Modify: `src/data/concepts_extra.json`（写入 12 概念草稿）
- Modify: `package.json`（加 dependency `node-html-parser`）

**目的**：主力机用 node-html-parser 从 11 个 HTML 抽取相关段落 → AI 总结生成 12 概念 × 3-5 后来者 = ~36-40 条旁注草稿（300-500 字 / 条）→ 写入 concepts_extra.json。

⚠️ **版权注意**：SEP 是 CC BY-NC-SA 协议，**不能直接拷贝原文**。Step 3 AI 总结环节必须改写 + 翻译成中文 + 注明引用源。

- [ ] **Step 1: 装 node-html-parser**

```bash
cd F:\AI\projects\Marx
npm install --save node-html-parser@^6
```

Expected：package.json 加一行 `"node-html-parser": "^6.x.x"`，无 lock 冲突。

- [ ] **Step 2: 写 extract-sep-content.ts**

```typescript
// scripts/extract-sep-content.ts
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse } from 'node-html-parser'

const ROOT = resolve(import.meta.dirname, '..')
const CACHE_DIR = resolve(ROOT, 'scripts/sep-cache')
const URLS_FILE = resolve(ROOT, 'scripts/sep-urls.json')

type UrlsFile = {
  concepts: {
    concept_id: string
    concept_name_zh: string
    sep_concept_url: string
    sep_concept_anchor: string
    successors: { scholar_id: string; scholar_name_zh: string; sep_url: string }[]
  }[]
}

function urlToFilename(url: string): string {
  // 简单映射：取 URL 末尾 path segment
  if (url.includes('plato.stanford.edu/entries/')) {
    const m = url.match(/entries\/([^/]+)/)
    return m ? `${m[1]}.html` : 'unknown.html'
  }
  if (url.includes('wikipedia.org/wiki/')) {
    const m = url.match(/wiki\/([^/]+)/)
    return m ? `${decodeURIComponent(m[1]).split('_').pop()?.toLowerCase()}.html` : 'unknown.html'
  }
  return 'unknown.html'
}

function extractScholarSection(html: string, scholarName: string): string {
  // 找包含 scholar 名字的 <h2> / <h3>，收集后续 <p> 直到下一个 h2/h3
  const root = parse(html)
  const headings = root.querySelectorAll('h2, h3')
  let buf: string[] = []
  let collecting = false
  for (const h of headings) {
    const text = h.text.trim()
    if (collecting) break
    if (text.toLowerCase().includes(scholarName.toLowerCase())) {
      collecting = true
      let cur = h.nextElementSibling
      while (cur && !['H2', 'H3'].includes(cur.tagName ?? '')) {
        if (cur.tagName === 'P') buf.push(cur.text.trim())
        cur = cur.nextElementSibling
      }
      break
    }
  }
  return buf.join('\n\n').slice(0, 3000)  // 截断到 3000 字符避免 prompt 太长
}

function extractFullText(html: string): string {
  const root = parse(html)
  return root.querySelectorAll('p').map((p) => p.text.trim()).join('\n\n').slice(0, 8000)
}

const urls = JSON.parse(readFileSync(URLS_FILE, 'utf-8')) as UrlsFile

console.log('# SEP 内容抽取（供 AI 总结输入）\n')

for (const concept of urls.concepts) {
  console.log(`\n## ${concept.concept_id} ${concept.concept_name_zh}\n`)
  for (const s of concept.successors) {
    const fname = urlToFilename(s.sep_url)
    const path = resolve(CACHE_DIR, fname)
    let content = ''
    try {
      const html = readFileSync(path, 'utf-8')
      // 学者自己的词条页 → 抽 marx 相关段
      content = extractScholarSection(html, 'Marx') || extractFullText(html).slice(0, 3000)
    } catch (e) {
      content = `(找不到 ${path}，请确认 PM 第三机回传完成)`
    }
    console.log(`\n### ${s.scholar_id} ${s.scholar_name_zh}（${s.sep_url}）\n`)
    console.log(content || '(无相关段落)')
    console.log('\n---')
  }
}
```

- [ ] **Step 3: 跑抽取脚本输出到文件**

```bash
cd F:\AI\projects\Marx
npx tsx scripts/extract-sep-content.ts > scripts/sep-cache/_extracted.md
```

Expected：`scripts/sep-cache/_extracted.md` 生成，含 12 概念 × 3-5 后来者的 SEP 段落抽取。文件大小应在 50-300KB 之间。

- [ ] **Step 4: 主力机用 _extracted.md 作为 input 生成旁注草稿**

主力机（Claude）操作：

1. Read scripts/sep-cache/_extracted.md
2. 按 12 个概念逐个处理。每个概念按它的 3-5 个后来者：
   - 读对应学者段落
   - 改写成中文 300-500 字旁注（不能直接翻译复制，要总结）
   - 结构按 design doc § 5.3 范本（如"卢卡奇 1923《历史与阶级意识》：扩展为'物化'..."）
   - 注明引用源 URL（SEP 原 URL + 1-2 个学术补充源）
3. 把 12 概念 × 3-5 后来者结果写入 src/data/concepts_extra.json，结构按 Task 11 schema

主力机生成时按这个 prompt 模板（per 后来者）：

```
基于以下 SEP 段落（${scholar_name_zh} 在 ${concept_name_zh} 上的发展），写一段中文旁注：

[SEP 段落内容]

要求：
- 300-500 字
- 结构：学者 + 年份 + 著作 + 核心论点 + 跟 Marx 原概念的差异
- 中文学术风格但白话（避"辩证统一""客观规律"等术语）
- 不能直接翻译复制 SEP 原文（CC BY-NC-SA 协议）
- 末尾给 1-3 个 citation_urls
```

- [ ] **Step 5: 写入 concepts_extra.json + 跑校验**

主力机把 12 概念草稿装填到 src/data/concepts_extra.json：

```json
{
  "concepts": [
    {
      "concept_id": "concept-alienation",
      "marx_self_use": "1844 手稿首次提出 → 1857-58 大纲改用'对象化' → 1867 资本论隐含在'商品拜物教'里",
      "successor_notes": [
        {
          "scholar_id": "scholar-lukacs",
          "scholar_name_zh": "卢卡奇",
          "scholar_name_orig": "György Lukács",
          "scholar_year": 1923,
          "note_text": "...300-500 字...",
          "note_word_count": 412,
          "citation_urls": ["https://plato.stanford.edu/entries/lukacs/", "..."]
        },
        ... 其他 3-4 后来者
      ]
    },
    ... 其他 11 概念
  ]
}
```

跑校验：

```bash
cd F:\AI\projects\Marx
npm run m3:validate-concepts-extra
```

Expected：`✓ concepts_extra.json 校验通过（12 概念）`。如有报错，修字数 / 数量 / dangling concept_id。

- [ ] **Step 6: Commit**

```bash
echo "feat(M3): 阶段 C 生成 12 概念 × 3-5 后来者旁注草稿

- scripts/extract-sep-content.ts 用 node-html-parser 抽取 SEP 段落
- 主力机基于 SEP 段落 AI 改写成中文 300-500 字旁注（避免直接翻译复制）
- 涉及 ~40 条旁注，覆盖 10 后来者池
- src/data/concepts_extra.json schema 校验通过
- 引用源含 SEP 原链接 + 学术补充源
- 待 Task 15 PM 校对" > .commit-msg.tmp
git add scripts/extract-sep-content.ts src/data/concepts_extra.json package.json package-lock.json
git commit -F .commit-msg.tmp
rm .commit-msg.tmp
```

---

### Task 15: PM 校对全部旁注

**Files:**
- Modify: `src/data/concepts_extra.json`（PM 校对修订）

**目的**：PM 逐条校对 ~40 旁注的事件式 + 字数 + 引用源准确性。

- [ ] **Step 1: 主力机给 PM 校对 prompt 模板**

```
PM 你好，请校对 12 概念 × 3-5 后来者的旁注（共 ~40 条）。

📂 文件位置：F:\AI\projects\Marx\src\data\concepts_extra.json

⚙️ 校对清单（每条旁注）：
1. 字数 300-500 字之间（脚本算的 note_word_count 字段对照）
2. 学者 + 年份 + 著作信息准确（特别看年份对不对）
3. "跟 Marx 原概念的差异"那部分写清楚了吗
4. 中文是否白话（避"辩证统一""客观规律"等术语）
5. citation_urls 至少 1 个 SEP / 学术源
6. 没有直接翻译复制 SEP 原文

⚙️ 校对方式：
- 用文本编辑器打开 concepts_extra.json
- 逐个 successor_notes 数组里的 note_text 看
- 改的话直接改 note_text 字段（保持 JSON 格式 ✓ 引号 / 逗号）
- 改后我跑 npm run m3:validate-concepts-extra 确认 schema 仍 OK

🔥 这步是 M3 阶段 C 最重的一步（~40 条 × 平均 5 分钟阅读校对 = 3-5 小时）。
可以分多次完成，分概念跑（如先校 5 个最熟概念，剩下 7 个明天）。

完成 N 个概念后告诉我："我校完了 异化 / 剩余价值 / 历史唯物主义"，我跑 schema check + 看有没有改坏 JSON。
```

- [ ] **Step 2: PM 校对（分批）**

PM 分批校对，每批跟主力机同步：

```
PM: "我校完了 异化 / 剩余价值 / 历史唯物主义"
主力机:
- 跑 npm run m3:validate-concepts-extra 确认 schema OK
- 跑 git diff src/data/concepts_extra.json 检查 PM 改动合理性
- 给 PM "✓ 这 3 个 OK，继续" 或 "X 字段我看一下你这个改动是不是 ..."
```

- [ ] **Step 3: 12 概念全部校对完成后跑 acceptance test**

```bash
cd F:\AI\projects\Marx
npm test -- tests/concepts-extra-schema.test.ts
npm run m3:validate-concepts-extra
```

Expected：
- vitest 4 pass
- validate 脚本 `✓ concepts_extra.json 校验通过（12 概念）`

- [ ] **Step 4: Commit**

```bash
echo "data(M3): 阶段 C PM 校对完成 12 概念后来者旁注

- ~40 条旁注 PM 校对：字数 / 年份 / 著作 / 引用源 / 中文白话
- schema 校验通过
- 待 Task 16 集成到产品" > .commit-msg.tmp
git add src/data/concepts_extra.json
git commit -F .commit-msg.tmp
rm .commit-msg.tmp
```

---

### Task 16: 集成 concepts_extra.json 到产品

**Files:**
- Modify: `src/main.ts`（加载 concepts_extra.json + console.log 验证）

**目的**：把 concepts_extra.json 在产品启动时加载，并在 concept 节点 hover 时 console.log 旁注摘要做数据集成验证。**不做 UI tooltip / 详情卡 panel（M4 范围）**。

**⚠️ 实施前第一句话喊（AGENTS.md 第 75-78 行硬要求）：**

```text
use frontend-design skill
use ui-ux-pro-max skill
```

虽然这步只是加载 + console.log 不做 UI，但仍按规范召唤双 skill 做 review。

- [ ] **Step 1: 修改 main.ts 加载 concepts_extra.json**

```bash
cat F:/AI/projects/Marx/src/main.ts
```

按现有结构，在 nodes_skeleton.json 加载后追加 concepts_extra.json 加载：

```typescript
// src/main.ts
import nodesData from './data/nodes_skeleton.json'
import conceptsExtraData from './data/concepts_extra.json'
import type { ConceptsExtraFile } from './types/Node'
// ... 其他 imports

const conceptsExtra = conceptsExtraData as ConceptsExtraFile
const conceptsExtraMap = new Map(conceptsExtra.concepts.map((c) => [c.concept_id, c]))

console.info(`[M3] concepts_extra 加载: ${conceptsExtra.concepts.length} 概念`)

// ... 现有 renderRelations 调用 + 节点 hover 处理
// 在节点 hover 处理里加：
function handleNodeHover(node) {
  if (node.type === 'concept') {
    const extra = conceptsExtraMap.get(node.id)
    if (extra) {
      console.info(`[M3] hover concept ${node.name_zh}:`, {
        marx_self_use: extra.marx_self_use?.slice(0, 80),
        successor_count: extra.successor_notes.length,
        first_successor: extra.successor_notes[0]?.scholar_name_zh,
      })
    }
  }
}
```

具体集成点（renderRelations 内部如何挂 hover）按现有代码结构改，本 plan 不预设具体 D3 调用方式（M2 已有的 D3 force-directed 渲染逻辑里找 hover hook）。

- [ ] **Step 2: 跑 build + 本地 preview 验证**

```bash
cd F:\AI\projects\Marx
npm run build
npm run preview
```

打开 http://localhost:4173/marx/ + 浏览器 DevTools console：
- 启动应看到 `[M3] concepts_extra 加载: 12 概念`
- hover 任一 concept 节点（苔藓绿）应看到 `[M3] hover concept 异化:` 等 console.info 输出

- [ ] **Step 3: 改 e2e/stage-bc-rendered.spec.ts 加 concepts_extra 集成验证**

```typescript
// e2e/stage-bc-rendered.spec.ts 追加
test('concepts_extra 加载日志出现', async ({ page }) => {
  const logs: string[] = []
  page.on('console', (msg) => logs.push(msg.text()))
  await page.goto('http://localhost:5173/marx/')
  await page.waitForSelector('svg circle')
  await page.waitForTimeout(500)
  const hasLog = logs.some((l) => l.includes('[M3] concepts_extra 加载: 12 概念'))
  expect(hasLog).toBe(true)
})
```

- [ ] **Step 4: 跑 e2e + 全套测试**

```bash
cd F:\AI\projects\Marx
npm test
npm run e2e
```

Expected：所有 test GREEN，e2e 4 个新 spec（Task 10 加 3 + Task 16 加 1）也 PASS。

- [ ] **Step 5: prettier 限定范围 format**

```bash
npx prettier --write src/ scripts/ tests/ e2e/
```

防 M2 坑 14。

- [ ] **Step 6: Commit**

```bash
echo "feat(M3): 阶段 C 集成 concepts_extra.json 到产品

- src/main.ts 加载 concepts_extra.json + Map 索引
- concept 节点 hover 时 console.info 旁注摘要（数据集成验证）
- e2e/stage-bc-rendered.spec.ts 加 concepts_extra 加载日志验证
- ⚠️ 不做 UI tooltip / 详情卡 panel（M4 范围）
- 实施时召唤了 frontend-design + ui-ux-pro-max skill" > .commit-msg.tmp
git add src/main.ts src/types/Node.ts e2e/stage-bc-rendered.spec.ts
git commit -F .commit-msg.tmp
rm .commit-msg.tmp
```

---

### Task 17: e2e + 视觉验证 + M3 takeaway

**Files:**
- Create: `docs/2026-05-XX-m3-takeaway.md`（XX 按实际完成日期）
- Modify: `README.md`（加 M3 节）
- Modify: `AGENTS.md`（项目状态更新到 M3 已上线 + 续接锚点指向 m3-takeaway）

**目的**：M3 全套验收 + 推送上线 + 落 takeaway（含形态门槛评估 + M4 入口建议）。

- [ ] **Step 1: 全套测试 + build + 推送**

```bash
cd F:\AI\projects\Marx
npm test
npm run e2e
npm run build
git push origin main
```

Expected：
- npm test：所有 vitest pass（含 stage-b-validated 5 + concepts-extra-schema 4）
- npm run e2e：所有 spec pass（含 stage-bc-rendered 4）
- build 成功
- push 后 GitHub Actions 应 ~3-5 分钟上线

- [ ] **Step 2: 在线 URL 目测**

打开 https://cdu52802-xx.github.io/marx/：
- 看到 51 节点 + 54+ 关系
- 12 苔藓绿 concept 节点散布在 marx 周围
- 节点 label 双语显示
- F12 console 看到 `[M3] concepts_extra 加载: 12 概念`
- hover 任一 concept 节点看到 `[M3] hover concept ...`

- [ ] **Step 3: 写 M3 takeaway**

```bash
# 当前日期假设 2026-05-XX
# 文件名按实际日期命名
```

新建 `docs/2026-05-XX-m3-takeaway.md`，结构按 [M2 takeaway](2026-05-08-m2-takeaway.md) 模式：

```markdown
# Marx M3 takeaway · 数据采集阶段 B 校对 + 阶段 C 后来者旁注

> 完成日期：2026-05-XX
> 关联：[plans/2026-05-08-marx-star-map-m3-validate-concept-notes.md](../plans/2026-05-08-marx-star-map-m3-validate-concept-notes.md) / [design doc § 5 § 6.1 § 7](../specs/2026-05-07-marx-star-map-design.md) / [M2 takeaway](2026-05-08-m2-takeaway.md)
> 在线：https://cdu52802-xx.github.io/marx/

## 实际花了多久？

[填实际跨天数 / 工时]

每个 task 的 commit hash：

| Task | Commit | 内容 |
|---|---|---|
| 1 | hash | 阶段 B acceptance test（先 RED）|
| 2 | hash | 校对辅助工具 generate-validation-md.ts |
| ... | ... | ... |
| 17 | hash | M3 takeaway + README + AGENTS |

## 关键决策与 plan 修订

### 决策 1 · ...
[实际 M3 跑过程中遇到的关键决策]

## 哪些坑值得记下来？

### 坑 18 · ...
[实际 M3 遇到的新坑，编号接 M2 的 17 之后]

## 哪些下次可以更快？

1. ...

## 当前 M3 验证状态

| 判定项 | 状态 |
|---|---|
| npm test 全绿 | ✅ |
| npm run e2e 全绿 | ✅ |
| stage-b-validated 5/5 GREEN | ✅ |
| concepts-extra-schema 4/4 GREEN | ✅ |
| 在线 URL 显示 51 节点 + 12 苔藓绿 concept + 双语 label | ✅ |
| concepts_extra 12 概念 × 3-5 后来者旁注完整 | ✅ |
| 形态门槛评估已记录 | ✅（见下） |

## 形态门槛评估（提醒系统节点 ② 触发判断）

按 [user research threshold memory](../../.claude/projects/F--AI-projects-Marx/memory/feedback_user_research_threshold.md) 规则。

**M3 形态实际**：
- ✅ 51 节点（35 person + 4 work + 12 concept）+ 双语 label + concept 节点苔藓绿
- ✅ 12 核心概念旁注完整（数据准备好）
- ❌ **5 类节点编码只完成 concept 苔藓绿**（person / work / event / place 仍单色）
- ❌ 详情卡 / 时间轴 / hover tooltip 全留 M4-M5
- ❌ 后来者旁注只在 console 验证，没有 UI 呈现

**判断**：M3 形态比 M2 进了一步（双语 label + 12 苔藓绿 concept），但**仍未到 mockup 校验访谈门槛**——目标用户（学者）此时看不出"后来者旁注是亮点"（数据有但 UI 没出来）。

**结论**：**不触发提醒系统节点 ②**。等 M4-M5 视觉骨架完整（5 色编码 + 详情卡 + 时间轴 + hover tooltip）后再评估。

## 下一个 milestone（M4）入口

调 `superpowers:writing-plans` skill 写 M4 plan。

**M4 范围**（按 design doc § 7.4 / § 7.5 / § 7.6 全集）：
- 5 类节点编码全场景应用（person 墨黑 / work 褪色蓝 / event 学者红 / concept 苔藓绿 / place 沙石灰金）
- 8 类关系视觉差异化（颜色 + 实/虚线 + 单/双向箭头）
- 节点 hover tooltip（脚注卡含 1-2 行 bio_event_style 摘要）
- 详情卡 panel（核心概念详情卡含后来者旁注栏，呈现 concepts_extra.json 内容）
- 时间轴 + 跨图搜索

**建议开场白（新窗口续接）**：

> M3 已上线（在线 URL https://cdu52802-xx.github.io/marx/，takeaway 在 docs/2026-05-XX-m3-takeaway.md）。M4 范围是 design doc § 7.4-7.6 全集（5 色节点编码全场景 + 8 类关系视觉差异化 + 节点 hover tooltip + 详情卡 panel 含后来者旁注 + 时间轴 + 跨图搜索）。请基于 M3 takeaway 已知坑写 M4 plan。
```

- [ ] **Step 4: 改 README.md 加 M3 节**

按 M2 节模式追加。

- [ ] **Step 5: 改 AGENTS.md 项目状态到 M3 已上线**

- 项目状态行：`M1 + M2 + M3 已上线`
- 下一步：`M4 plan（5 色编码 + 详情卡 + hover tooltip + 时间轴）`
- "对话启动" 节当前最新 ⭐：指向 m3-takeaway

- [ ] **Step 6: 主力机给 PM 形态评估 prompt + 决策点**

```
PM 你好，M3 已全部完成 ✓

📊 形态实际：51 节点 + 12 苔藓绿 concept + 双语 label + 后来者旁注数据完整
📋 提醒系统节点 ② 评估：不触发（仍未到 mockup 校验门槛，hover/详情卡留 M4）

下一步选项：
A. M4 plan（5 色编码 + 详情卡 panel + hover tooltip + 时间轴 + 跨图搜索）
   预计 1.5-2 周，做完后预期触发节点 ② mockup 校验访谈
B. M3.5 plan（先补 ~10-15 work + ~30 event + ~6 place 节点）
   M3 用户原话只圈了"39 节点字段缺失 + 12 概念旁注"，没新建这些节点
   但 design doc § 3.1 总目标 ~150 节点，缺这部分
C. 其他（如做 PRD v0.4 把 § 7 内容落 PRD / 重新评估优先级）

请选 A / B / C。
```

- [ ] **Step 7: Commit M3 takeaway + README + AGENTS**

```bash
echo "docs(M3): M3 takeaway + README M3 节 + AGENTS 更新到 M3 已上线

- docs/2026-05-XX-m3-takeaway.md 落 M3 takeaway（含 commit hash 表 + 形态门槛评估 + M4 入口建议）
- README.md 加 M3 节（51 节点 + 12 苔藓绿 concept + 后来者旁注）
- AGENTS.md 项目状态到 M3 已上线 + 续接锚点指向 m3-takeaway
- 提醒系统节点 ② 不触发（hover / 详情卡留 M4）" > .commit-msg.tmp
git add docs/ README.md AGENTS.md
git commit -F .commit-msg.tmp
rm .commit-msg.tmp
git push origin main
```

---

## M3 验收标准

| 判定项 | 验证方式 | Expected |
|---|---|---|
| `npm run lint` 0 warning | `npm run lint` | 0 warning |
| vitest 全绿 | `npm test` | stage-b-validated 5/5 + concepts-extra-schema 4/4 + 原 16 全 PASS |
| e2e 全绿 | `npm run e2e` | 原 5 + stage-bc-rendered 4 全 PASS |
| `npm run build` 成功 | `npm run build` | dist/ 生成无 error |
| `npm run m3:validate-concepts-extra` 通过 | 同上 | `✓ concepts_extra.json 校验通过（12 概念）` |
| GitHub Actions 最近一次绿色 | `gh run list --limit 1` | conclusion=success |
| 在线 URL 51+ 节点 + 12 苔藓绿 concept | 浏览器目测 | 视觉确认 |
| 在线 URL 节点双语 label | 浏览器目测 | 视觉确认 |
| 在线 URL hover concept 看到 console.info | F12 DevTools | 视觉确认 |
| `docs/2026-05-XX-m3-takeaway.md` 已落 | 文件存在 | ✅ |
| README M3 节已加 | 文件 diff | ✅ |
| AGENTS.md 项目状态更新 | 文件 diff | ✅ |
| 形态门槛评估已记录到 takeaway | 文件 grep | ✅ |

---

## 已知风险

### 风险 1 · PM 校对 35 person × 4 字段 = 140 处填字段工作量大

**估计**：35 节点 × 平均 2 分钟 / 字段 / 节点 × 4 字段 = 280 分钟 ≈ 4-5 小时（不含 PM 中途休息 / 查 Wikidata 时间）

**缓解**：
- Task 4-7 拆 4 个 task，每 task 一个字段，PM 可分批跑
- Markdown 校对清单 PM 友好（不让 PM 改 JSON）
- Wikidata 链接已嵌每个节点上方

### 风险 2 · 阶段 C 涉及 SEP 国外 endpoint，PM 第三机操作链长

**估计**：11 个 SEP URL × 浏览器加载 3-5 分钟 + 另存为 + 微信回传 = 30-60 分钟纯操作 + 1-2 小时主力机 idle 等待

**缓解**：
- Task 13 第 1 个 URL 先做 sanity check 再发剩 10 个（防 M2 坑 13 网页 UI 格式问题）
- 主力机 idle 期间给 PM 完整 step-by-step prompt（防 M2 坑 17 visual companion 缺失）
- 11 个文件可打包 zip 一次回传

### 风险 3 · ~40 条旁注内容质量

**估计**：AI 总结 SEP 内容可能有事实错误（年份 / 著作 / 论点归属错）

**缓解**：
- Task 15 PM 校对环节强制（不能跳过）
- citation_urls 必填 + Task 11 schema 校验
- 旁注 300-500 字字数硬性约束（防 AI 总结过简或过长）

### 风险 4 · concepts_extra.json 集成时 main.ts 改动可能 break M2 加载逻辑

**估计**：低（仅追加加载 + Map 索引 + console.log，不动现有 renderRelations）

**缓解**：
- Task 16 先跑 build + preview 本地验证再 push
- e2e 加 concepts_extra 加载日志 spec 防回归

### 风险 5 · spec 已写但 plan 实施时发现需要更新 spec

**估计**：中（design doc § 6.1 笼统，M3 实施细节会暴露 spec 不足）

**缓解**：
- 本 plan 顶部 "前置检查 § 3" 落工作流细节，等同 spec 临时增补
- M3 takeaway 总结时如发现需要更新 design doc，按实际增量改 spec（不强制每个 plan 实施前更 spec）

---

## 附录 A · 关键文件路径

- 项目根目录：`F:\AI\projects\Marx`
- 本 plan：`plans\2026-05-08-marx-star-map-m3-validate-concept-notes.md`（本文件）
- 上游 design doc：`specs\2026-05-07-marx-star-map-design.md`（v1.1）
- 上游 PRD：`docs\PRD.md`（v0.3）
- M2 plan：`plans\2026-05-07-marx-star-map-m2-data-schema-sparql-a.md`
- M2 takeaway：`docs\2026-05-08-m2-takeaway.md`
- 项目 agent context：`AGENTS.md`

## 附录 B · M3 跨机器协作流程速查

| 阶段 | 主力机做什么 | PM 做什么 | 在哪 |
|---|---|---|---|
| 阶段 B Task 4-7 | 生成校对清单 + 接受回填 + 跑 acceptance test | 在 person-checklist.md 填 4 字段 | 主力机文本编辑器 |
| 阶段 B Task 8 | 生成校对清单 + 接受回填 + 跑 acceptance test | 在 work-checklist.md 填 5 字段 | 主力机文本编辑器 |
| 阶段 C Task 13 | 给 PM 操作清单 + 接收回传 HTML | 第三机浏览器另存为 + 微信回传 | 第三机 |
| 阶段 C Task 14 | 跑 extract 脚本 + AI 总结 + 写 JSON | 等 | 主力机 |
| 阶段 C Task 15 | 接收 PM 校对 + 跑 schema check | 校对 ~40 条旁注 | 主力机文本编辑器 |
| 阶段 C Task 16 | 集成 + e2e + push | 浏览器目测在线 URL | 主力机 + 浏览器 |

## 附录 C · 后续工作触发节点

- **节点 ②**（用户访谈包提醒）：M3 形态评估 → **不触发**（详见 Task 17 形态门槛评估），等 M4-M5 视觉骨架完整后再评估
- **节点 ③**（用户访谈包提醒）：MVP 数据骨架填进去 ~60% 时做内容质量抽查访谈 — M3 仅完成 51/150 节点 ≈ 34%，未达 60%，**不触发**
- **节点 ④**（用户访谈包提醒）：V1 上线前最后一次校验 — M3 远未到 V1 ship，**不触发**
