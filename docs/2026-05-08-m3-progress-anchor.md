# Marx M3 续接锚点 · Task 4 等 PM review name_orig

> **状态**：M3 进行中 · Task 1-3 完成 + Task 4 卡在 PM 复核 33 个 AI 填的 name_orig 草稿
> **本文件用途**：跨窗口/跨机器续接锚点，新窗口读 AGENTS.md + 本文件即可 30 秒重建上下文（不需要读 plan / M2 takeaway 等 1000+ 行长文档）
> **关联**：[plans/2026-05-08-marx-star-map-m3-validate-concept-notes.md](../plans/2026-05-08-marx-star-map-m3-validate-concept-notes.md) / [M2 takeaway](2026-05-08-m2-takeaway.md) / [design doc v1.1](../specs/2026-05-07-marx-star-map-design.md)

---

## 当前整体位置

| 阶段 | 状态 | 位置 |
|---|---|---|
| M1（项目骨架） | ✅ 已上线 | https://cdu52802-xx.github.io/marx/ |
| M2（数据 schema + SPARQL 阶段 A） | ✅ 已上线 | 39 节点 + § 7 视觉骨架 |
| **M3（数据采集阶段 B 校对 + C 后来者旁注）** | **🔄 进行中（Task 4/17，5-17 待办）** | 见下表 |
| M4（5 色编码 + 详情卡 + hover）| ⏳ 待办 | — |
| M5+ | ⏳ 待办 | — |

---

## M3 Task 进度（17 task 总览）

| Task | 内容 | 状态 | Commit |
|---|---|---|---|
| 1 | 写阶段 B acceptance test（先 RED） | ✅ DONE | `546584a` |
| 2 | 校对辅助工具 generate-validation-md.ts | ✅ DONE | `e539144` + `ac676cd`（prettier fix）|
| 3 | 删除误分类节点 基督教的本質 (Q1170769) | ✅ DONE | `cc91723` |
| 4 | apply-validation-md.ts + PM 校对 34 person · name_orig | 🔄 **卡在 PM 复核** | `14b3e1c` + `acce50b`（robustness fix）+ `46c6367`（AI 草稿入库）|
| 5 | PM 校对 34 person · main_location_lat_lng | ⏳ pending | — |
| 6 | PM 校对 34 person · bio_event_style | ⏳ pending | — |
| 7 | PM 校对 34 person · citation_urls | ⏳ pending | — |
| 8 | PM 校对 4 work · 全字段 | ⏳ pending | — |
| 9 | 新建 12 核心 concept 节点 + 苔藓绿渲染 | ⏳ pending | — |
| 10 | 阶段 B 验收 + 中点 review | ⏳ pending | — |
| 11 | 写阶段 C 旁注 acceptance test | ⏳ pending | — |
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

---

## Task 4 PM 待复核清单（卡在这里）

文件：[docs/m3-validation/person-checklist.md](../docs/m3-validation/person-checklist.md)

PM 操作：打开文件，重点 review 下面 33 个节点的 `- name_orig: ...` 行。其他字段（latlng / bio / citations）保留占位（Task 5-7 才填）。

### 🔴 3 个 `<不确定>` 节点 · 优先查 Wikidata 链接核对

| QID | 中文名 | AI 草稿 |
|---|---|---|
| Q136116320 | Alfred Herman | `<不确定: name_zh 已是英文，请核对原文是 Alfred Hermann 还是其他>` |
| Q110655615 | Harry Waton | `<不确定: 请核对 Wikidata 原文>` |
| Q69028 | 弗里德里希·威爾克 | `<不确定: 译名歧义，候选 Friedrich Wilcke / Vielke / Wielke>` |

### 🟡 3 个学术敏感节点 · PM 决定要不要改 AI default

| QID | 中文名 | AI 选了 | 替代选项 |
|---|---|---|---|
| Q1394 | 列宁 | `Vladimir Lenin` | `Vladimir Ilyich Ulyanov`（本名）/ `Vladimir Ilyich Lenin`（笔名带父名）|
| Q855 | 约瑟夫·斯大林 | `Joseph Stalin` | `Iosif Vissarionovich Dzhugashvili`（本名）|
| Q57240 | 恩斯特·西蒙·布洛赫 | `Ernst Simon Bloch` | `Ernst Bloch`（不带 Simon）|

### 🟢 27 个高把握节点 · PM 视觉扫一眼

详见 person-checklist.md 各 H3 节点。

### PM 完成后告诉 controller 什么

PM 复核完保存文件后回："name_orig review 完了"。

---

## PM 复核完后 controller 要做什么（Task 4 余下步骤）

1. 跑 `npm run m3:apply-person` 把 .md 草稿回填进 nodes_skeleton.json
2. 跑 `npm test -- tests/unit/stage-b-validated.test.ts -t "name_orig"` 确认 person 4 字段 test 错误信息从 name_orig 消失（仍 FAIL 是因为 latlng/bio/citations 待 Task 5-7 填）
3. 跑 `npm test`（全套）确认 21 tests 仍 18 PASS + 3 FAIL（Task 1 RED 维持）
4. commit（按 -F 模式）+ 不 push（Task 4 完成后跟下一个 task 一起 push 时机更好）
5. mark Task 4 complete + 进 Task 5（latlng，同 hybrid 模式）

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
2. docs/2026-05-08-m3-progress-anchor.md（M3 续接锚点，含完整 Task 进度 + 关键决策 + 待 PM review 清单 + 已知坑）

读完后：
- 如果我已经在 docs/m3-validation/person-checklist.md 改完 name_orig，告诉你 "name_orig review 完了"，你跑 apply 回填 + test + commit + 进 Task 5
- 如果我还没改完，等我

Task 5 起继续按 hybrid AI 草稿 + PM 复核模式跑（详见 anchor 决策 3）。

注意：
- M3 plan 文件还是旧版 B 模式描述，按 anchor 决策 1 走 A 模式（inline successor_notes）
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
