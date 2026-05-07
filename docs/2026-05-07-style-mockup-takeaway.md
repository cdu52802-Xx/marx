# Marx · pre-M2 视觉风格 mockup session takeaway

> 完成日期：2026-05-07（M1 完成日同一天的 sub-session）
> **v1.1 更新（同日）**：朋友 1 号反馈回收 → 选定 **A 学术编辑** → design doc v1.1 § 7 视觉风格定调落地 → M2 plan b-1 局部修订完毕 → **c 阶段（M2 实施）就绪**
> 阶段定位：M1 上线 → M2 实施之间，视觉风格前置补漏 + 落地
> 关联：[M1 takeaway](2026-05-07-m1-takeaway.md) / [M2 plan v1.1](../plans/2026-05-07-marx-star-map-m2-data-schema-sparql-a.md) / [design doc v1.1](../specs/2026-05-07-marx-star-map-design.md)
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
| **a-5/a-6 视觉定调落地** | `4f66d5c` | design doc 升 v1.1，加 § 7 视觉风格定调 9 子节，§ 3.1 / § 4.1 色编码全替换为 § 7 新规范 |
| **b-1 M2 plan 修订** | `df580b8` | M2 plan Task 7 重构含 § 7 视觉骨架落地（src/styles.css 新建 + Google Fonts + CSS 变量），M2 完成后视觉从「白底紫圆」变「牛皮纸 + 墨黑节点 + 中文衬线 label」 |

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

### 决策 7 · 单点反馈足够 commit（朋友 1 号 → A 学术编辑）

**反馈内容**（2026-05-07 朋友 1 号回收）：

1. **最喜欢 A** —「A 像查字典，非常适合阅读」
2. **最不喜欢 B** —「冲击力太强，眼睛累」
3. **C 和 D**「都更有娱乐感，配色像游戏 / 网页游戏 / 迪士尼，让用户感觉没有学习的氛围」 — C「像《苏丹的游戏》/ 同人文学大字典」/ D「像海盗」

**为什么单点足够 commit**（不等其他朋友凑够 3-5 个）：

- 反馈含金量高：功能性理由（"查字典 / 适合阅读 / 没有学习氛围"），不是审美偏好
- 跟产品定位（design doc § 1 / § 10.4 "工具型 V1 / 学者优先"）高度一致
- B 用力过猛 / C/D 娱乐感都是**结构性不适配**，不是"差几度可调"

**决策规则**（如果未来再做类似反馈调研）：

- 群体一致 → 落地
- 群体分裂 → 信号是"目标用户不一致"——回头审产品定位，不是品味问题
- 群体反对 → 重出候选（保留"反 AI slop / 学术氛围"骨架）

### 决策 8 · 5 类节点 + 8 类关系视觉编码全替换

design doc v1.1 § 7.4 / § 7.5 用新色板**替代**原 § 3.1 / § 4.1 的"紫蓝橙绿灰 / 紫红绿橙"鲜艳色编码——原色板命中 AI slop "均匀调色板"反例，且鲜艳色跟 A 学术编辑调性冲突。

新 5 类节点色：墨黑 / 褪色蓝 / 学者红 / 苔藓绿 / 沙石灰金（全跟牛皮纸协调）。
新 8 类关系视觉：monochrome 主导 + 学者红 / 苔藓绿点缀 + 0.5-1px 细线。

M4 实施时**以 v1.1 § 7.4 / § 7.5 为准**，原 § 3.1 / § 4.1 表里"颜色"列保留作历史记录。

### 决策 9 · M2 视觉落地范围（不仅做数据切换）

M2 plan Task 7 重构后落地 § 7 子集：CSS 变量 + Google Fonts + body 全局 + 节点单色（5 色 / 详情卡 / 时间轴留 M4）。

**Why 现在做**：CSS 变量 + 字体引入是基础设施级别（一次到位），M2 不做 M3-M4 也得做，M4 大批 UI 工作时再补反而打乱节奏。M2 做了之后线上有真正可视化进展（牛皮纸 + 墨黑节点 + 中文衬线 label），匹配用户工作模式"看到才有想法"。

**M2 不做**：5 类节点按 type 分色 / 详情卡 / 时间轴 / 副图小窗 / hover 交互 / staggered reveals 动画 — 这些是 M4-M6 范围。

---

## 当前状态 + 阻塞点

- ✅ M1 已上线（https://cdu52802-xx.github.io/marx/，2 紫圆形态）
- ✅ M2 plan v1.1 已写完已 push（含 § 7 视觉骨架，待执行）
- ✅ 4 风格 mockup 已上线（https://cdu52802-xx.github.io/marx/styles/）
- ✅ **风格选型完成**：朋友 1 号反馈回收 → 选定 **A 学术编辑**（决策 7）
- ✅ design doc v1.1 已 push（含 § 7 视觉风格定调 9 子节 + § 3.1 / § 4.1 色编码全替换）
- ✅ M2 plan b-1 修订完成（Task 7 含 styles.css + Google Fonts + § 7 视觉骨架）
- ⏳ **下一步：c 阶段 = 执行 M2 plan**（参照 M1 单 session 3 小时）
- 🚧 **新阻塞（2026-05-07 切窗口前实测）**：用户本机访问 https://query.wikidata.org/ **打不开**（中国大陆典型网络）。c 阶段 Task 1 Step 2/3 + Task 5/6 全部依赖 Wikidata SPARQL endpoint，本机不挂代理跑不通。详见**坑 12**（本文件） + M2 plan Task 1 新加 fallback 警示子节
- **c 阶段开始前用户需先 4 选 1**：a. 挂代理 / VPN  b. 离线缓存方案（脚本要改）  c. 切 Codex 机器  d. 朋友/同事代跑回传 JSON

---

## 下个 session 续接入口（开场白模板）

新窗口续接时，**优先读本 takeaway 重建上下文**，然后按反馈状态选下面之一：

**情况 1（视觉定调落地完成，c 阶段执行 M2 plan）⭐ 当前状态**：
> "M1 完成 + M2 plan v1.1 已写（含 § 7 视觉骨架）+ 视觉风格定调选定 **A 学术编辑** + design doc v1.1（commit 4f66d5c）/ M2 plan b-1 修订（commit df580b8）都已 push。**已知阻塞**：用户本机 Wikidata Query Service 不通（坑 12 + M2 plan Task 1 fallback 子节）。请先跟我一起决定 4 选 1 fallback 方案（挂代理 / 离线缓存 / 切 Codex / 代跑），再按 superpowers:executing-plans skill 跑 M2 plan 9 个 task。"

**情况 1-old（v1.0 已完成，仅追溯）**：原模板 "选定方向 [A/B/C/D] → 写 design doc 视觉节 → M2 plan 修订" 已全部完成，落到 commit 4f66d5c / df580b8。

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

### 坑 11 · designer 直觉跟用户读图直觉的 gap

**症状**：mockup 调研之前我推荐 "C 工业历史最贴 Marx 时代背景，差异化最强"。朋友实际把 C 读成"游戏配色 / 苏丹的游戏 / 同人文学大字典"，把 D 读成"海盗 / 迪士尼"。我以为颗粒纹理 + 钢蓝锈红 = "19 世纪工业革命氛围"，普通用户读出来 = "娱乐配色"。

**深层原因**：designer-mind 看视觉时做"历史符号 → 时代联想"的解读链路；普通用户（学者目标用户）看视觉时直接做"色彩饱和度 + 视觉刺激度 → 严肃 vs 娱乐"判断。两条链路对同一组视觉元素得出反向结论。

**M3-M6 防御**：

- 推视觉方案时**不只信 designer 直觉**，先列方案再让用户和 3-5 实际目标用户检验
- "记忆点强 / 差异化强" 是宣传海报 / 消费 app 的标尺，**对学术工具反而是负担**
- A 类"稳但平庸"的方案对学者优先工具可能就是对的——"不抢戏"是产品价值不是缺陷
- M4 关系图主视图 / M5 地理图 / M6 UI/UX 优化 实施时，再次提交一两个候选方案给真实用户校验

### 坑 12 · Wikidata Query Service 用户本机不通（中国大陆典型）

**症状**：2026-05-07 sub-session 切窗口前用户实测 https://query.wikidata.org/ 浏览器**打不开**。M2 plan Task 1 Step 2/3 + Task 5/6 全依赖此 endpoint，本机直接跑不通。

**原因**：中国大陆部分 ISP 对 `wikidata.org` 域名间歇限制 / 完全阻断。属于用户网络环境约束，不是脚本 bug。

**c 阶段开始前用户必须 4 选 1 决定**：

- **a. 挂代理 / VPN**，重试 Task 1 Step 2 应该能通（最常用方案）。脚本不动
- **b. 离线缓存方案**：用户在能上 Wikidata 的设备 / 时段（手机 4G / 朋友 wifi / 国外网络），手动在 https://query.wikidata.org/ 网页 UI 跑 5 个 .sparql 查询，下载 JSON 结果保存到 `scripts/sparql/cache/{01..05}.json`。**修改 fetch-skeleton.ts 加一个开关**：环境变量 `MARX_USE_CACHE=1` 时读本地缓存代替 fetch endpoint。优点：可重复 + 跨人共享数据；缺点：脚本要改 + 第一次靠人工
- **c. 跨机方案**：切到 Codex 那台机器跑 fetch-skeleton.ts，git push 后回 Claude 机继续后续 task。优点：脚本不动；缺点：依赖 Codex 机器网络环境不同（实际可能跟本机一样不通）
- **d. 代跑方案**：让朋友 / 同事代跑 fetch-skeleton.ts，把生成的 `src/data/nodes_skeleton.json` 发回来 commit。优点：脚本不动；缺点：依赖人 + 一次性

**M3+ 防御**：写涉及国外 endpoint 的 plan 时，**前置检查节直接列 fallback**，不要假设"endpoint 能通"。Marx M3 阶段 C（后来者旁注采编）涉及 SEP 等国外 endpoint，同样要预先验证可达性 + 列 fallback。

**user memory 已记录**：[`user_environment_china_network.md`](../../.claude/projects/F--AI-projects-Marx/memory/user_environment_china_network.md) 跨 session 持久，不入 git。

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

**v1.1 增量改动**（朋友 1 号反馈 → 选定 A → design doc v1.1 + M2 plan b-1 修订）：

| 文件 | 状态 | 备注 |
|---|---|---|
| `specs/2026-05-07-marx-star-map-design.md` | v1 → v1.1 | 加 § 7 视觉风格定调 9 子节 + § 3.1 / § 4.1 色编码全替换，commit `4f66d5c` |
| `plans/2026-05-07-marx-star-map-m2-data-schema-sparql-a.md` | v1 → v1.1 | Task 7 重构含 § 7 视觉骨架落地（styles.css + Google Fonts），commit `df580b8` |
| `docs/2026-05-07-style-mockup-takeaway.md` | 修改（本文件） | 加决策 7-9 + 阻塞点更新 + 续接入口情况 1 → 当前状态 + 加坑 11 |
| `AGENTS.md` | 修改 | 项目状态：M2 plan v1.1 已就绪 / 视觉定调完成 → 待 M2 实施 |

---

## 给下次 session 的 checklist

- [ ] 优先读本文件（30 秒重建上下文）
- [ ] 然后读 [M2 plan v1.1](../plans/2026-05-07-marx-star-map-m2-data-schema-sparql-a.md)（含 § 7 视觉骨架落地）+ [design doc v1.1 § 7](../specs/2026-05-07-marx-star-map-design.md)
- [ ] **续接默认走「下个 session 续接入口」情况 1**（视觉定调完成 → c 阶段执行 M2 plan）
- [ ] M2 实施时第一句喊「use frontend-design skill + use ui-ux-pro-max skill」（虽然 M2 视觉范围有限但仍按 AGENTS.md 三件套规范）
- [ ] 不要主动问"要不要触发提醒节点 ②"（按 user research threshold memory，M2 形态依然不到 mockup 门槛）
- [ ] **不要回到 4 mockup 调研做"再选一次"**——A 已选定，B/C/D mockup 不删（design doc § 7.9 反向锚定参考）
