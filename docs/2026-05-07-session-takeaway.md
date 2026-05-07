# 2026-05-07 Session Takeaway · Brainstorming 完成 + M1 Plan 就绪

> **本文件作用**：跨窗口续接锚点。给下次新 session（任意机器、任意 agent）一个 **5 秒续接入口**。
> **本 session 周期**：2026-05-07 续接上轮 brainstorming → 跑完第 5、6 步 → 全程结束。

---

## 本 session 完成动作

- ✅ 续接上轮 brainstorming（上轮暂停在第 4 步后等访谈反馈）
- ✅ 接收用户访谈反馈（8 条）→ 解读为 5 个 design 信号
- ✅ 跑完 brainstorming 第 5 步 · present design sections（3 段全部 approve）
- ✅ 跑完 brainstorming 第 6 步 · writing-plans skill（产出 M1 plan）
- ✅ 产出 design doc v1（10 节 + 3 附录，落 `specs/`）
- ✅ PRD v0.2 → v0.3（DR-009 ~ DR-013，软化绝对句保留远期可能）
- ✅ M1 plan（9 task + 0 代码 PM 准备 checklist，落 `plans/`）

---

## 关键决策（本 session 新增）

| 决议 | 内容 | DR |
|---|---|---|
| 主视图形态 | 路径 A 关系星图升级为 **B+2 双主视图**（关系图主 + 地理图画中画副，可主副互换） | DR-009 |
| 后来者论述 | ~12 个核心概念详情卡里加「后来者发展」旁注（10 位后来者池）；后来者**不**做主图节点 | DR-010 |
| 数据采集 | SPARQL 拉骨架 → 人工校对 → 后来者旁注采编 → 落 JSON 共 4 阶段 | DR-011 |
| 远期愿景 | V1 工具型 / V2 加故事模式入口 / V3+ 不预设结论（保留方案 1/3、用户笔记后端 等可能） | DR-012 |
| 验证标准 | 量化指标 + 定性指标 + 提醒系统节点 ②③④ 校验 | DR-013 |

**反原则的"软化"操作**（命中"远期不预设结论"）：
- 后来者出现在主图（方案 1）—— 原"不出现"改为"V1 不做、远期不预设否定"
- 著作 / 概念在地图上渲染 —— 同上
- 用户笔记 / 标注 / 后端账号系统 —— 原"静态产品形态不要后端"改为"V1 不做、V2+ 视反馈再考虑"

---

## 已落库文件（新窗口必读 4 件）

| 优先级 | 路径 | 内容 |
|---|---|---|
| ★★★ | `AGENTS.md` | 项目级协作约定（含「对话启动」节、铁律、目录约定） |
| ★★★ | `docs/2026-05-07-session-takeaway.md` | **本文件**（最新阶段总结、续接锚点） |
| ★★ | `specs/2026-05-07-marx-star-map-design.md` | Design doc v1（产品形态 SSOT） |
| ★★ | `plans/2026-05-07-marx-star-map-m1-project-skeleton.md` | M1 implementation plan |
| ★ | `docs/PRD.md` | PRD v0.3（13 项 DR） |
| ★ | `docs/2026-05-06-brainstorming-用户访谈包.md` | 上轮 brainstorming snapshot（archived，仅追溯） |

---

## 当前阶段

**Brainstorming 流程已结束**。进入 **implementation 阶段**，等用户开始执行 M1。

---

## 新窗口续接 · 开场白模板

复制粘贴以下文字到新窗口（Claude / Codex 任意）：

```
续接 Marx 星图项目。当前阶段：M1 plan 就绪、未开始执行。

请先读这 4 个文件：
1. AGENTS.md
2. docs/2026-05-07-session-takeaway.md
3. specs/2026-05-07-marx-star-map-design.md
4. plans/2026-05-07-marx-star-map-m1-project-skeleton.md

读完告诉我：
- M1 plan 9 个 task 概览
- 我执行 Task 1 之前还需要做什么准备
- 如果我现在就开始执行，第一步具体是什么命令
```

---

## 下一步动作树（你决定时机和地点）

```
[现在] M1 plan 就绪
   │
   ├─ 路径 A · 立刻开始 M1
   │    └─ 新 session 用上面开场白 → 按 plan 执行 Task 1-9（约 3-5 天）
   │
   ├─ 路径 B · 先准备环境再开始
   │    └─ 按 M1 plan「执行前 · 0 代码 PM 准备工作 checklist」装软件 / 学技能
   │       └─ 准备好后再开 session 执行
   │
   └─ 路径 C · 暂停（去做别的）
        └─ M1 plan 已落库，随时回来继续

[M1 完成后]
   ├─ 落 takeaway 到 docs/<日期>-m1-takeaway.md
   ├─ 触发提醒系统节点 ②（在线 URL 给访谈对象做 mockup 形态校验）
   └─ 调 superpowers:writing-plans 写 M2 plan（数据 schema + SPARQL 阶段 A）
```

---

## 提醒系统状态

| 节点 | 触发条件 | 状态 |
|---|---|---|
| ① 早期概念访谈 | brainstorming 路径选定后 | ✅ 上轮已完成（5/6 反馈已落 design doc） |
| ② mockup 形态校验 | M1 完成、在线 URL 出来 | ⏳ 待触发 |
| ③ 内容质量抽查 | 数据骨架 60% 完成时 | ⏳ 待触发（M3 期间） |
| ④ V1 上线前最后校验 | V1 ship 前 | ⏳ 待触发（M6 期间） |

---

## Context 保护提醒（重要！）

新窗口续接时遵守 3 条：

1. **只读上面"必读 4 件"**，不要让 agent 通读 git log 全部历史 / 全项目文件 / 全部历史 commit。读多了主项目 context 就被吃光了
2. **详细操作问题（怎么装 Node / 怎么用 git / 怎么看 GitHub Actions log）开专门的非项目窗口问**，不占主项目对话上下文
3. **跨 session 铁律**：开工先 `git pull`，收工必 `git push`；中文 commit 走 `git commit -F` 文件方式

---

## 跨机器续接补充

| 机器 | 项目目录 | 主要 agent |
|---|---|---|
| 这台（Claude 主力机） | `F:\AI\projects\Marx\` | Claude Code |
| 另一台（Codex 主力机） | `<盘>:\AI\projects\Marx\` | Codex CLI |

切机器时：
- 这台 `git push` 后再去那台
- 那台 `git pull` 后再开始
- AI 工具本地配置（`.claude/` `.codex/`）已在 `.gitignore`，不影响

---

## 一句话总结

**Brainstorming 全流程结束，design + plan 已落库；M1 第一个 task 开始时换新 session、用上面开场白模板，无缝续接。**
