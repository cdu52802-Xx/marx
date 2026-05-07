# Marx · pre-M2 视觉风格 mockup session takeaway

> 完成日期：2026-05-07（M1 完成日同一天的 sub-session）
> 阶段定位：M1 上线 → M2 实施之间，视觉风格前置补漏
> 关联：[M1 takeaway](2026-05-07-m1-takeaway.md) / [M2 plan](../plans/2026-05-07-marx-star-map-m2-data-schema-sparql-a.md)
> 在线：
>   - M1 主 demo（不变）：https://cdu52802-xx.github.io/marx/
>   - 风格调研入口（本 session 产出）：https://cdu52802-xx.github.io/marx/styles/

---

## 这次 session 干了什么

3 件事按时间序：

| | commit | 内容 |
|---|---|---|
| C 收尾小坑 | `08cd279` | `.gitattributes` 加 `* text=auto eol=lf` 消 Windows CRLF 噪音（M1 takeaway 教训第 4 条落地） |
| B M2 plan | `f89fd03` | M2 plan 写完落地（数据 schema + SPARQL 阶段 A，1800 行 9 task） |
| 视觉前置 | `1bb53a7` | 4 风格 mockup（A 学术编辑 / B 革命粗野 / C 工业历史 / D 档案文献）+ 调研入口落 `public/styles/`，已 push 上线，user 已外发链接征求 3-5 朋友意见 |

---

## 关键决策

### 决策 1 · M2 plan 范围扩到含 JSON 切换

design doc § 6.1 阶段 A 字面只是「SPARQL 拉数据」，但 M2 plan 把范围扩到含「main.ts 切到 load JSON + 渲染参数适配密集节点」。

**Why**：按 [user research threshold memory](../../.claude/projects/F--AI-projects-Marx/memory/feedback_user_research_threshold.md) 的反推 —— 用户工作模式是「看到成果才有想法」，每个 milestone 完成后该有可视化进展。M2 完成后线上从 2 紫圆变 ~30-50 紫圆，给 user 形态 feedback 输入。

### 决策 2 · TS 类型一次到位 5 类节点 + 8 类关系

M2 实际只填 person + work 两类节点 + 4 类关系，但 TypeScript 类型按 design doc § 3.1 / § 4.1 一次定义全。M3-M5 不返工。

### 决策 3 · 数据采集脚本落 `scripts/` 顶层

三层分工：`src/` 产品代码 / `docs/` 文档 / `scripts/` 工具。M2 引入 `tsx` 一个 dev 依赖跑 TS 脚本。

### 决策 4 · 不触发提醒系统节点 ②

按 user research threshold memory，M1 hello world 形态太简陋（"和我手画的一样"），不到访谈门槛。M2 完成后 ~30-50 紫圆形态依然不到，还是不触发。等 M4-M5 视觉骨架完成后再评估。

### 决策 5 · 视觉风格定调前置（关键路径变更）⭐

**触发**：session 中段用户测试 —— 问 AGENTS.md「前端视觉美学约束」三件套是什么。我答上来了，但承认 M2 plan 写的时候**没把这一节应用进去**。具体合规问题：
- M2 plan Task 7 渲染参数沿用 M1 留下的 `#7c5dbe` 紫色硬编码 —— 命中 AGENTS.md 第 68 行「紫色渐变 + 白底」AI slop 反例
- design doc / spec **没有**「视觉风格定调」节 —— AGENTS.md 第 65 行「spec 必含」是硬要求，design doc v1 不合规

**修正路径**：
1. 暂停 M2 plan 执行
2. 调 frontend-design + ui-ux-pro-max 双 skill（AGENTS.md 三件套第 3 条）
3. 给 user 4 个 Tone 候选方向，user 要求看图选
4. 做 4 个静态 HTML mockup 推到 GitHub Pages 子路径 `/styles/`
5. user 外发入口 URL 给 3-5 朋友做风格选型调研（**注意：风格选型 ≠ 产品形态调研**，跟节点 ② 不冲突）
6. 等反馈回来再选 Tone → 落进 design doc 视觉节

### 决策 6 · 风格选型调研 vs 产品形态调研区分

- **风格选型调研**（本次）：mockup 在 `/styles/`，问朋友"4 个里最喜欢哪个 / 不喜欢哪个 / 哪个让你想点进来用"——目的是 **Tone 决策**，跟产品形态简陋无关
- **产品形态调研**（节点 ②）：等 M4-M5 完成后，发主线 URL 问"你会怎么用 / 跟预期 gap"——目的是**功能 + 形态 feedback**

两者目标受众和问题都不一样，不冲突。

---

## 当前状态 + 阻塞点

- ✅ M1 已上线（https://cdu52802-xx.github.io/marx/，2 紫圆形态）
- ✅ M2 plan 已写完已 push（待执行）
- ✅ 4 风格 mockup 已上线（https://cdu52802-xx.github.io/marx/styles/，待选型）
- ⏳ **阻塞**：等 user 自己看 + 身边 3-5 朋友风格选型反馈（user 已外发，预计 1-2 天回收）
- ⏳ 反馈回收后：选 Tone → 写 design doc 视觉风格定调节
- ⏳ 后续：M2 plan 局部修订（颜色提到 CSS 变量）→ 执行 M2 plan

---

## 下个 session 续接入口（开场白模板）

新窗口续接时，**优先读本 takeaway 重建上下文**，然后按反馈状态选下面之一：

**情况 1（反馈已回收，选定方向）**：
> "M1 完成 + M2 plan 已写 + 4 风格 mockup 调研反馈已回，选定方向 [A/B/C/D]。请按 AGENTS.md 第 65 行硬要求把视觉风格定调节加进 `specs/2026-05-07-marx-star-map-design.md`，含 Tone / 字体（含中文配对）/ 配色（CSS 变量列出）/ 氛围细节 4 维。然后做 M2 plan 局部修订（颜色提到 CSS 变量），最后执行 M2 plan 9 个 task。"

**情况 2（反馈还没回 / 还在等）**：
> "当前 4 风格 mockup 在线 https://cdu52802-xx.github.io/marx/styles/ 等用户调研反馈。在等的间隙建议：跑一遍 M2 plan 前置检查（Task 1 全部 step），让 SPARQL endpoint 网络可达性 + tsx 装好提前验证。剩下的 8 个 task 等选 Tone 后再开。"

**情况 3（用户改主意）**：
> "4 个方向都不满意 / 想要第 5 个 / 混合元素。回去调 frontend-design + ui-ux-pro-max 重出候选，根据 user 具体反馈调整方向。"

---

## 已知坑 / 经验教训（M2-M3 避免重踩）

### 坑 6 · AGENTS.md 第一次 Read 没读全（疑似输出截断）

**症状**：session 开头 Read AGENTS.md，输出止于第 58 行（仅到「关键引用」），没看到第 54-107 行「前端视觉美学约束」整节。后来用户测试时重读才到 113 行完整版。

**可能原因**：(a) Read 工具未知截断行为；或 (b) 文件就是 58 行版本 user 在测试前才 push 加进的视觉节。无法事后区分。

**M2-M3 防御**：续接 session 时 Read AGENTS.md / design doc / 关键 plan 之后**立即 sanity check 最后一行内容**是否合理（应该是某节自然收尾，不是中段截断）。如果疑似截断，立即重 Read 一次确认行数。

### 坑 7 · ui-ux-pro-max 脚本对学术 / 历史话题失准

**症状**：跑 `search.py --design-system "data visualization network graph academic scholar tool philosophy historical"` 返回 **Cyberpunk UI**（霓虹 / 暗色 / 终端），跟 19 世纪 Marx 思想话题严重相反。后续：editorial query → Swiss Modernism + pink CTA `#EC4899`（不搭）；brutalist query → 粉色 brutalism（不是真粗野）。

**原因**：脚本 67 风格库为常见产品类型（SaaS / e-commerce / portfolio / 美容）设计，"哲学思想可视化 + 学术工具 + 19 世纪历史"组合无直接 match，关键词被错误归类。

**M3+ 防御**：脚本输出**作为 vocab 参考**（字体名 / 色板候选 / 风格 keyword）OK，但**整体设计系统建议不能照搬**。Marx 项目人工组合候选方向（基于产品本质 + frontend-design skill BOLD 原则）后再用脚本验证候选字体 / 色板。

### 坑 8 · M1 留下的硬编码紫 `#7c5dbe` 命中 AI slop 反例

**症状**：M1 demo 节点用 `fill="#7c5dbe"` 占位紫，命中 AGENTS.md 第 68 行 "避开紫色渐变 + 白底" AI slop 反例。M2 plan Task 7 沿用，问题继承。

**M2 修正**：M2 plan 已记录待局部修订（颜色提到 CSS 变量，等视觉风格定调选定后用主导色替换硬编码紫）。修订时机：Tone 选定 → 写 design doc 视觉节 → 改 M2 plan → 执行 M2 plan。

### 坑 9 · spec 缺「视觉风格定调」节是 retrofit gap

**症状**：design doc v1（2026-05-07 brainstorming 后写的）通篇是信息架构 / 节点 spec / 关系系统，**没有** Tone / 字体 / 配色 / 氛围细节专门节。AGENTS.md 第 65 行 "spec 必含视觉风格定调一节" 是后加的（aae236a commit 才进 AGENTS.md），design doc 不合规但是历史遗留。

**修正路径**：本 session 已启动补漏（4 mockup → 调研反馈 → 写 spec 视觉节）。这一节落地后 design doc 升 v1.1。

**M3+ 防御**：写新 spec / 进新 brainstorming 时，第一步喊"开启 visual companion 模式" + 召唤 frontend-design + ui-ux-pro-max 双 skill。

### 坑 10 · superpowers brainstorming HARD GATE 默认禁视觉 skill

**背景**：AGENTS.md 第 56 行说 superpowers brainstorming skill 内置 HARD GATE 默认禁止调 frontend-design / ui-ux-pro-max（详见其 SKILL.md 第 66 行）。Marx 是前端项目所以 AGENTS.md 三件套硬覆盖这个 GATE。

**修正**：每次进 brainstorming，**第一句话主动**喊「开启 visual companion 模式 + use frontend-design skill + use ui-ux-pro-max skill」，不要默认走 brainstorming flow。本 session 视觉前置已应用此修正。

---

## 关键文件路径（本 session 产出 + 触及）

| 文件 | 状态 | 备注 |
|---|---|---|
| `.gitattributes` | 新建 | C 任务，commit `08cd279` |
| `plans/2026-05-07-marx-star-map-m2-data-schema-sparql-a.md` | 新建 | M2 plan，commit `f89fd03` |
| `public/styles/index.html` | 新建 | 风格调研入口 |
| `public/styles/a-editorial.html` | 新建 | A 学术编辑 mockup |
| `public/styles/b-brutalism.html` | 新建 | B 革命粗野 mockup |
| `public/styles/c-industrial.html` | 新建 | C 工业历史 mockup |
| `public/styles/d-archive.html` | 新建 | D 档案文献 mockup |
| `docs/2026-05-07-style-mockup-takeaway.md` | 新建 | 本文件 |
| `AGENTS.md` | 修改 | 项目状态 + 对话启动锚点更新 |
| `D:/AI/Claude/.claude/projects/F--AI-projects-Marx/memory/feedback_user_research_threshold.md` | 新建 | 「形态太简陋不调研」memory（session 内确立的反馈门槛） |
| `D:/AI/Claude/.claude/projects/F--AI-projects-Marx/memory/MEMORY.md` | 修改 | 索引去掉"私仓"过期信息 + 加新 feedback 索引 |

---

## 给下次 session 的 checklist

- [ ] 优先读本文件（30 秒重建上下文）
- [ ] 然后视情况读 [M2 plan](../plans/2026-05-07-marx-star-map-m2-data-schema-sparql-a.md) 或 design doc
- [ ] 续接前先看 user 是否已选 Tone（看本文件「下个 session 续接入口」选情况 1/2/3）
- [ ] 第一步喊「open visual companion + use frontend-design + use ui-ux-pro-max」（如果涉及视觉相关任务）
- [ ] 不要主动问"要不要触发提醒节点 ②"（按 user research threshold memory，形态门槛未到）
