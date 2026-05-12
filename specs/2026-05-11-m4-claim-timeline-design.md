# Marx 思想史 · M4 Design Doc · v1（claim-on-timeline 形态大重构）

> **状态**：design v1 · brainstorming 第 5 步产出 · 2026-05-11 单 session 写完（v3-v7 mockup 迭代 + denizcemonduygu 数据 reverse-engineer + PM 同意第一性原理结论）
> **日期**：2026-05-11
> **上游**：[`PRD.md`](../docs/PRD.md) v0.3 / [M2 design v1.1](2026-05-07-marx-star-map-design.md)（沿用 § 7 视觉风格定调） / [M3 progress anchor](../docs/2026-05-08-m3-progress-anchor.md)（含 Task 10 PM demo 反馈 = 本 spec 触发因）
> **下游**：M4 plan（待 brainstorming skill 完成后 invoke writing-plans skill 生成）/ M5+ 视觉细节迭代
> **核心决策**：从 person-network 星图改为 **claim-on-timeline**（观点为单位 + 斜向流 + 半圆弧关系 + 底部横向时间轴）

---

## 1. Context · 这次 vision 大调整的来由

M3 阶段 B 完成（50 节点 person-network demo）后 PM 在 Task 10 中点 review 给了关键反馈：

- **demo 视觉粗糙、跟 M2 demo 视觉无区别**（节点统一墨黑、统一大小 / 缺颗粒度）
- **产品形态粗糙**（只有星图，缺详情卡 / 时间轴 / 侧栏 / 概念区分）
- **想差异化** —— 参考 [denizcemonduygu.com/philo/browse/](https://www.denizcemonduygu.com/philo/browse/)

2026-05-11 brainstorm session（v3 → v7 mockup 7 轮迭代 + WebFetch + PM 抓 denizcemonduygu DOM + canvas data.json）后，**vision 从"person 中心化星图"大调整为"claim-on-timeline 思想史"**：

- **核心实体改变**：节点不再是 person / work / concept / event / place 5 类，而是 **claim（一句话主张）** 为单位 + person 退化为 section header + work 退化为 reference + concept 升级为 claim 子集
- **布局改变**：不再是 D3 force-directed 散布，而是 **垂直 person section 堆叠 + 每 person 内 obs 斜着堆叠 + 整体左上→右下斜向流**
- **关系改变**：不再是 8 类 person-relation，而是 **2 元 claim → claim 关系（agreement / disagreement）+ 半圆弧视觉**
- **辅助改变**：底部横向时间轴（独立参考维度，不强坐标映射）+ 左侧颗粒度勾选栏

**PM 这次反馈的本质**：M3 ship 的 person-network 形态在学术思想史可视化场景里**信息密度不够**（一个圆点 = 一个人，没传达"这个人主张什么"）。denizcemonduygu 的 obs-as-node 形态把"思想"作为基本单位，**学术 fidelity 高一个数量级**。

⚠ **重要风险声明**：本 spec 是大重做，M3 ship 的 person-network demo 不直接演进而是替换。M3 数据（50 nodes / 41 relations）作为 M4 metadata reference 保留（不浪费），但 M4 demo 是新形态。

---

## 2. 整体形态决策

### 2.1 M4 范围（Q1 brainstorm 已定 = 选项 2）

✅ **包含**：
- B 视觉层次（claim 节点形态 + 半圆弧 + 颜色编码）
- A1 详情卡（点击 claim 弹出 popover）
- A4 概念区分（claim 通过 cats 学科分类视觉区分，不是 5 形状区分）
- C 风格差异化（borrow denizcemonduygu 排列 + 弧线视觉惯例）
- 底部时间轴 + 左侧颗粒度栏 + 维度融合（勾选叠加）

❌ **排除（延 M5+）**：
- A2 事件时间轴（独立模块）—— 底部时间轴够 M4
- A3 复杂导航侧栏（搜索 / 筛选 panel）—— M4 颗粒度栏简化版够
- 弧线密度精调 / 颜色具体值 / 字体 fine-tune —— implementation 时跑真数据后 polish

### 2.2 跟 M3 demo 的关系（PM 待决 ④ · 我的 propose）

**propose 选项 C**：M3 demo URL 保留作为 "M3 阶段成果存档"，主页入口移除（PM 在 brainstorm 中说"作为阶段性成果暂存"，跟选项 C 对齐）。

| 处理方式 | 描述 | 工时 | 我的判断 |
|---|---|---|---|
| A. 完全替换 | M4 上线后 M3 demo URL 下线 | 0（删 URL）| ❌ 浪费 M3 工作 + 失去演示价值 |
| **B. 双 view 切换** | 用户在 claim-timeline / person-network 间切换 | 中 | ❌ 信息架构混乱，PM 之前明确选 vision 大改 |
| **C. 保留 + 移除主页入口** ⭐ | M3 URL 仍可访问（作为存档），主页只导 M4 demo | 极小 | ✅ 尊重 PM 用词 + 0 信息架构成本 |

**M3 demo 存档 URL**：保留 `https://cdu52802-xx.github.io/marx/`（M2 / M3 形态），M4 上线后主页 redirect 到新 URL（如 `/m4` 或 `/`）。需要 M4 implementation 时确定 URL 结构。

---

## 3. 数据 schema · claim 节点 type 引入

### 3.1 新数据模型

```typescript
// 新增：claim 节点（M4 核心实体）
export interface ClaimNode extends NodeBase {
  type: 'claim';
  claim_text: string;       // 一句话主张（10-50 字汉字 / 等价英文长度）
  author_id: string;        // FK → PersonNode.id（哪个 person 提的）
  source_work_id?: string;  // FK → WorkNode.id（哪本著作提的，可空）
  year: number;             // claim 年份（用于时间轴 + 排序）
  cats: ClaimCategory[];    // 学科分类（可多选，借鉴 denizcemonduygu 11 类）
  keywords?: string;        // 思想流派 tag（如 "异化劳动" / "historicism"）
  reference?: string;       // 出处（书名 + 页码 / URL，用于详情卡）
}

export type ClaimCategory =
  | 'me'  // Metaphysics 形而上学
  | 'ep'  // Epistemology 认识论
  | 'lo'  // Logic 逻辑
  | 'et'  // Ethics 伦理
  | 'po'  // Political 政治
  | 'ae'  // Aesthetics 美学
  | 're'  // Religion 宗教
  | 'mi'  // Mind 心灵
  | 'la'  // Language 语言
  | 'sc'  // Science 科学
  | 'mp'; // Metaphilosophy 元哲学

// 新增 relation 类型（claim → claim）
export type RelationType =
  | ...M2 已有 8 类...
  | 'agreement_with'      // claim → claim 同意（绿弧）
  | 'disagreement_with'   // claim → claim 反对（红弧）
  | 'extends';            // claim → claim 延伸（同 person 自延伸用，灰虚线弧）
```

### 3.2 现有节点 type 处理

| 节点 type | M3 状态 | M4 处理 |
|---|---|---|
| **person** | 50 节点 | **保留**，作为 claim 的 author + section header（在 layout 上是 person 一行标题）。不再作为画布主节点 |
| **work** | 4 节点（Marx 经典）| **保留**，作为 claim 的 source 引用（详情卡里展示）。不在画布上显示 |
| **concept** | 12 节点 | **升级**：每个 concept.definition_plain 改写为 1+ claim_text（如"异化"概念升级为"异化劳动是私有财产的根源"等具体主张）。原 ConceptNode 保留作 metadata，新建对应 ClaimNode |
| **event** | 0 节点（M3 未填） | **延 M5+**，M4 不实施 |
| **place** | 0 节点（M3 未填） | **延 M5+**，M4 不实施 |

### 3.3 数据规模目标

| 数据 | M4 minimum | M4 stretch | 实际 (2026-05-12 T5 完成) |
|---|---|---|---|
| ClaimNode | 80 | 150 | **92** (Marx 19 + concept 12 + person 61 confident · 38 资料不足 skip) ✓ |
| Person section（claim author） | 15 | 30 | **27** distinct authors ✓ |
| agreement_with / disagreement_with relations | ~~100~~ **30** | ~~250~~ 60 | **31** (20 agree + 11 disagree) ✓ |
| extends relations（同 person 自延）| 30 | 80 | 0 (T5 范围未生成 · 留 T6 layout 或 T8+ 决策) |

> ⚠ **实施状态**（2026-05-12 T5 SOFT-BLOCK 调整）：relations minimum 100 → 30（数学上限验证后调整）。详见 § 9.3 实施状态注释。

---

## 4. 视觉风格定调（沿用 M2 § 7 + 本 spec 增补）

### 4.1 Tone（M2 已定 = A 学术编辑风）

- **米白纸感** #fcfaf6 暖底（不是纯白）
- **EB Garamond / Georgia** 衬线字体（避免 Inter / Roboto）
- **#5a4a30 主文字** + #888 次要文字（柔和暖灰阶）
- 大量留白 + 严谨网格

### 4.2 配色（M2 § 7 已定 + M4 红绿弧增补）

| 元素 | 颜色 | 用途 |
|---|---|---|
| 主导色（M2 § 7）| #5b3a8c 紫 | person 圆点 / Marx 主节点强调 |
| 背景 | #fcfaf6 米白 | 全局 |
| 主文字 | #2a2a2a 近黑 | claim_text |
| 次文字 | #888 灰 | 生卒年 / reference |
| Tag | #aaa 浅灰 italic | 每行 obs 最左 keywords |
| 头像占位 | #d8cab0 暖米 + #a8987a 边框 | person 标题左侧 |
| **绿弧 agreement** | #7a9a5a 抹茶绿 | 同意 / 影响 / 协作 |
| **红弧 disagreement** | #b8654a 砖橘红 | 反对 / 论敌 |
| **灰弧 extends** | #aaa 灰虚线 | 同 person claim 自延伸 |

### 4.3 字体方向

- **正文**：EB Garamond regular + italic
- **claim_text**：italic（强调"主张性"）
- **person 标题**：sans-serif bold uppercase + letter-spacing 0.6-1px（"BOLD CAPS"）
- **生卒年 / 元数据**：sans-serif（如 system-ui）小字

### 4.4 氛围细节（避免 generic AI slop）

- 背景散布灰色 claim 句子 opacity 0.14（"思想之网"密度感）
- 弧线密集（denizcemonduygu 截图特征：~200 条弧 / Marx section）
- 头像圆形占位（M4 不上传真实头像，用米色圆 + 边框示意）
- 微纹理（米白底加非常细的 noise，可选 implementation 时调）

---

## 5. Layout 规范（斜向流 + obs 堆叠 + 半圆弧）

### 5.1 整体布局结构

```
┌──────────────────────────────────────────────────────────┐
│ [左侧颗粒度栏]  [主画布 · 斜向流 person section + obs 堆叠] │
│ 48px 收起态     person 1 (左上) ─ obs                      │
│  / 200px 展开                  obs                        │
│                  person 2 (斜下右) ─ obs                  │
│                                obs                        │
│                                obs (X 偏移)               │
│                    KARL MARX (中) ─ obs ←┐                │
│                                  obs    │ 8-19 条        │
│                                  obs ←┘                   │
│                      person N (右下) ─ obs                │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ [底部横向时间轴]                                          │
│ 1770──●──────────────────────●─────────────1950          │
│                         游标(可拖) Marx 区间(高亮)        │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Person section 规范

- **斜向流坐标**：每 person 比上一个 X+40~60px / Y+40~80px（按 obs 数动态调整）
- **person 标题**：圆形头像（r=9px）+ 大写人名（font-weight 700, letter-spacing 0.6-1px）+ 灰色生卒年（sans-serif 10px）
- **Marx 主角强化**：头像 r=11 + 紫色填充 + 字体 17px（其他 person 14px）

### 5.3 Observation 行规范

```
[tag(右对齐)] · [圆点 dot] [claim_text 横跨画布右半]
       灰色 italic 9px   紫圆点 r=2~2.5  serif italic 11-12px
```

- **每行高度**：22-25px
- **同 person 多个 obs 共享 X 起点**（少数偏移示意"主张族群"区隔）
- **X 起点**：根据 person header X 偏移 `obs_x = person_x + 90~110`
- **claim_text 长度**：横跨画布右半（X 起点 → 画布右边缘），让弧线有足够距离跨越
- **tag 位置**：obs 行最左，靠右对齐到圆点前

### 5.4 半圆弧规范（PM 反馈作为 vision 硬约束）

**规范 1 · 起止位置**：
- ✅ 弧线起点 + 终点必须落在 obs 前的紫色圆点 dot 上（精确像素对齐）
- ❌ 不允许弧线漂浮 / 偏移 dot

**规范 2 · 弯曲方向**：
- ✅ **绿弧（agreement）= 往左下弯曲**（参考 denizcemonduygu）
- ✅ **红弧（disagreement）= 往右上弯曲**（参考 denizcemonduygu）
- ✅ 灰弧（extends 同 person 自延）= 微弧向右弯曲（短跨 + 虚线）

**SVG 实现示意**（implementation 时按 D3 path generator）：
```javascript
// 绿弧 agreement 左下弯曲
const greenArc = (x1, y1, x2, y2) => {
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.sqrt(dx*dx + dy*dy);
  // 控制点偏左下：从中点向左下偏移
  return `M ${x1} ${y1} Q ${(x1+x2)/2 - dist*0.3} ${(y1+y2)/2 + dist*0.3} ${x2} ${y2}`;
};

// 红弧 disagreement 右上弯曲（控制点偏右上）
const redArc = (x1, y1, x2, y2) => {
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.sqrt(dx*dx + dy*dy);
  return `M ${x1} ${y1} Q ${(x1+x2)/2 + dist*0.3} ${(y1+y2)/2 - dist*0.3} ${x2} ${y2}`;
};
```

**规范 3 · stroke 宽度 + 透明度**：
- 主关系（高 importance）：stroke-width 1.2-1.4 / opacity 0.65-0.75
- 次关系：stroke-width 0.8-1.0 / opacity 0.4-0.55
- 灰虚线 extends：stroke-width 0.7 / opacity 0.4 / dasharray "2,2"

---

## 6. 时间轴（B 思路 + 底部横向）

### 6.1 形态决策（Q3 v6 已定）

- **位置**：画布**底部**横向（独立栏，跟主画布解耦）
- **作用**：参考维度（不是主导 layout 约束）
- **跟主画布的关系**：person X 位置**不强制**按时间映射，靠 person 顺序 + 生卒年传达时间感

### 6.2 时间轴元素

- **主轴线**：横跨画布宽度
- **年份 ticks**：按 Marx 活跃期 1830/1850/1870 紫色 + 加粗 + 长 tick / 其他年份 1790/1810/1890/1910 灰色 + 标准 tick
- **当前游标**：紫色竖线（带年份标签 "游标 1880"），可拖
- **Marx 时间区间 indicator**：紫色横条（1830-1880）显示 Marx 活跃期
- **▶ 播放思想史按钮**：从最早年代渐进显示 obs（M4 实现期决定动画速度）

### 6.3 游标逻辑

- 默认游标 = Marx 死亡年（1883）
- 拖游标向左 = 之后的 obs / person 渐进淡出（opacity 0.4）
- 拖游标向右 = 显示之后的 obs（M4 默认 1950 上限，M5+ 可扩展）

---

## 7. 颗粒度过滤栏（左侧）

### 7.1 形态

- **默认收起态**：48px 宽度，icon 列（5 个节点 type icon + 3 个关系 type icon）
- **展开态**：200px 宽度，含完整 checkbox 列表 + count + hint
- **触发**：点击顶部 ⟩ 切换 / hover icon 显示 tooltip

### 7.2 过滤维度

| 类别 | 选项 |
|---|---|
| 节点类型 | ☑ claim（主） / ☑ person（section header） / ☐ work / ☐ event / ☐ place |
| 关系类型 | ☑ 影响 (绿弧) / ☑ 反驳 (红弧) / ☐ 自延 (灰弧) |
| 学科 cats | ☑ 形而上 me / ☑ 政治 po / ☑ 伦理 et / ☑ 宗教 re / ☑ 元哲学 mp / ☐ 其他 6 类 |
| 视图选项 | ☑ 散布观点句背景 / ☑ 弧度按时间跨度 / ☐ Tags / ☐ Portraits |

### 7.3 交互

- 单击 checkbox → 切换显示 / 隐藏对应类型
- hover 类型 icon → 主画布**临时高亮**（半透明叠加）所有该类型节点 / 弧
- 状态持久化（M4 用 localStorage，M5+ 可考虑 URL query string）

---

## 8. 维度融合（PM 反馈 3 解决方案 · 方案 B+C 双层）

### 8.1 方案 B · 全景叠加（颗粒度勾选触发）

| 勾选 | 主画布叠加效果 |
|---|---|
| ☑ **著作** | 每个 obs 行末尾显示 `[出处书名 · 年份]`（小灰字 italic） |
| ☑ **地点** | obs 旁浮一个 ⌖ icon + tooltip 显示地点名 |
| ☑ **历史事件** | 时间轴上叠加历史事件标签（如 "1848 革命 / 1864 第一国际 / 1871 巴黎公社"）|
| ☑ **散布观点句** | 背景密度（默认 ON）|

### 8.2 方案 C · 单点深入（点击 obs 弹出详情卡）

详情卡 popover 内容：

```
┌─────────────────────────────────────┐
│ KARL MARX · 1844 经济学哲学手稿 · 1844 │
│ ─────────────────────────────────── │
│ 异化（Alienation） · cats: me, po   │  ← tag + 学科分类
│                                     │
│ "异化劳动是私有财产的根源——          │  ← claim_text 完整版
│  不是私有财产产生异化劳动，          │
│  是异化劳动产生私有财产。"           │
│                                     │
│ 出处：1844 经济学哲学手稿            │
│ 地点：巴黎（流亡期）                 │
│ 事件：1844 离开普鲁士流亡            │
│ 影响：→ Lukács 1923 物化论           │  ← agreement 关系
│       → Marcuse 1955 单向度的人      │
│ 反驳：← Stirner 1845 唯一者及其所有物 │  ← disagreement 关系
│ 原文：marxists.org/zh/marx/1844/...  │
└─────────────────────────────────────┘
```

- 触发：点击 obs 圆点 / claim_text
- 关闭：点击外部 / Esc / 详情卡顶部 × 按钮
- 不阻塞主画布交互（弱模态）

---

## 9. 数据采集策略（PM 待决 ③ · 我的 propose）

### 9.1 数据来源 4 路并行

| 来源 | 数量 | 工时 | 复核策略 |
|---|---|---|---|
| **denizcemonduygu Marx 19 obs**（已抓数据 source）| 19 | 极小（英→中翻译 + 抽查） | AI 翻译 + PM 抽查 5 条（opportunistic 决策 4） |
| **M3 12 concept 升级为 claim_text** | 12 | 小（改写主张式） | AI 草稿 + PM 100% 复核（决策 3） |
| **33 person × 3-5 quote 补采**（前驱 + 后继 + Marx 同时代）| 99-165 | 大（hybrid AI 草稿） | AI 草稿 + PM 100% 复核（决策 3） |
| **4 work 核心 claim**（每本著作 1 句）| 4 | 极小 | AI 草稿 + PM 100% 复核 |

**总数**：125-185 个 claim（M4 minimum 80 / stretch 150）

### 9.2 复核策略 propose（覆盖 M3 决策 4 opportunistic）

> ⚠ **实施状态**（2026-05-12 update · M4 T3 实施期）：PM **撤回**本节 propose 的"回到决策 3"。实际执行回到**决策 4 = hybrid 模式**（AI 草稿 + apply 直接入库不阻塞 + PM 任意时间异步复核 checklist md）。PM 原话："别让人工审核成为进度卡点"。
>
> **适用所有 T2/T3/T4/T5 数据采集 task**（含本节列的 12 concept + 33 person quote + 4 work claim）。例外仅 AI 草稿涉及医疗 / 法律 / 金融建议时主动停下问 PM（学术 / 思想史不属于）。
>
> 详见 memory `feedback_hybrid_ai_draft_mode.md`（默认 5 步工作流）。下方原 propose 文字保留追溯。

**M3 决策 4 是 opportunistic（PM 容量不足时的降级）**。M4 我 propose **回到 M3 决策 3（100% PM 复核）**，理由：

1. **claim_text 是 vision 核心**：错误成本极高（编造引文损害学术信誉，跟"异化论"被理解为 Marx 主张同等重要）
2. **数据规模可控**：125-185 条 vs M3 阶段 B 的 ~140 处复核（同等规模，PM 之前 M3 决策 4 不是因为数据多，是因为时间窗口紧）
3. **M4 没有 M3 那种"阻塞下游 task"压力**：M4 是新形态，不像 M3 阶段 B 后还有阶段 C 接续

**唯一例外**：denizcemonduygu Marx 19 obs 因为有权威 source，AI 翻译 + 抽查 5 条即可（opportunistic）。

### 9.3 关系（agreement / disagreement / extends）数据采集

> ⚠ **实施状态**（2026-05-12 T5 完成 · PM framing 校准）：本节原 framing 把 denizcemonduygu 当"数据 source"是**错误的**。PM 校准："最开始用 denizcemonduygu 仅仅是为了让你参考其画布中人物、思想观点是如何布局的，因为他的画面形式是我欣赏的。**抓取到的高质量数据是意外惊喜顺便拿过来用**。并不是我们项目的'标准答案'。"
>
> **数学验证（T5 SOFT-BLOCK）**：denizcemonduygu 是西方哲学 canon（Plato → Foucault 188 人），Marx 项目是 Marxism 传统（34 人 PersonNode），**交集仅 7 人**（Marx / Hegel / Feuerbach / Croce / Gramsci / Benjamin / Bataille）。Marx 涉及的 202 link 中，两端都在 Marx PersonNode set 的子集**数学上限 31 条**（Hegel 12 + Feuerbach 5 + Gramsci 9 + Benjamin 3 + Bataille 2 + Croce 0）。T5 已 100% 榨干 ceiling 入库 31 条（commit `fa7c421`）。
>
> **决策（PM 2026-05-12 approve）**：走 C 路径 = 接受 31 + 调整 M4 minimum 100 → 30。不走 A 路径（扩 PersonNode 加 Plato/Adorno/Foucault 等 10-15 人）—— A 涉及产品定位（Marx-centric vs 西方哲学全景），冷藏 M5+ 跟"地理图副视图"一起决策。
>
> **正确 framing**（M5+ 引入任何第三方参考时复用）：
> - denizcemonduygu **主要价值** = 视觉/布局参考（斜向流 + 半圆弧 + 横向时间轴，M4 vision borrow 这个）
> - **次要价值** = 数据 source（高质量副产品，提取适用部分，不是标准答案）
> - 详见 memory `feedback_third_party_reference_role.md`
>
> 下方原文保留追溯。

denizcemonduygu links 数据库 8684 条 link，Marx 涉及 202 条（121 agreement + 81 disagreement）。M4 可以：

- ✅ **直接借鉴 Marx 涉及的 link 子集**（202 条）作为 M4 关系 seed
- AI 翻译 + PM 抽查 20%
- 关系 endpoint 从 denizcemonduygu record id 映射到 Marx 项目 ClaimNode id（需要写 mapping 脚本）

### 9.4 数据来源版权 / 学术伦理

- **denizcemonduygu 数据**借鉴需要在 spec 里**明确归属**（attribution）+ 在 demo 里**致谢**（如详情卡 footer "Inspired by denizcemonduygu.com/philo"）
- 19 obs 翻译为中文 + 适应 Marx 项目用（concept 学科分类等），不是直接 mirror
- M5+ 考虑联系作者获得正式授权（PM 容量允许时）

---

## 10. M4 task 拆分（粗框架 → 给 writing-plans skill 输入）

| Task | 内容 | 预估 | 依赖 |
|---|---|---|---|
| T1 | 数据 schema 扩展（src/types/Node.ts 加 ClaimNode + relation 加 agreement_with / disagreement_with / extends + 校验函数） | 中 | — |
| T2 | denizcemonduygu Marx 19 obs 抓取脚本 + 中文翻译 + 入库 | 小 | T1 |
| T3 | 12 concept.definition_plain → claim_text 升级（AI 草稿 + PM 100% 复核） | 中 | T1 |
| T4 | 33 person × 3-5 quote 补采（hybrid AI 草稿 + PM 100% 复核） | 大 | T1 |
| T5 | claim → claim 关系采集（borrow denizcemonduygu Marx 涉及 202 link） | 中 | T2-T4 |
| T6 | 主画布 layout 算法（斜向流 person section + obs 堆叠 + 半圆弧 + 颜色方向规则） | 大 | T1 |
| T7 | 底部横向时间轴组件 + 游标拖动 + 播放动画 | 中 | T6 |
| T8 | 左侧颗粒度栏组件（48px 收起态 + 200px 展开 + hover 高亮预览） | 中 | T6 |
| T9 | 详情卡 popover 组件（点击 obs 弹出含 schema § 8.2 全部字段） | 中 | T1, T6 |
| T10 | 维度融合 B 方案（勾选著作 / 地点 / 事件叠加显示）| 小 | T8, T9 |
| T11 | M3 demo URL 处理（保留 + 主页入口移除 + redirect 配置） | 极小 | — |
| T12 | acceptance test 写 + 验收 | 中 | T1-T11 |
| T13 | 上线 + M4 takeaway 落档 | 小 | T12 |

**总 task 数**：13（vs M3 17 task / M2 9 task，符合 PM "慢慢磨" 心态）

---

## 11. 验收标准（acceptance criteria）

M4 上线时必须满足：

### 11.1 数据完整度
- [x] ClaimNode ≥ 80（T2-T4 完成 · 实际 92 · 19 Marx + 12 concept + 61 person confident · 38 资料不足 skip）
- [x] agreement / disagreement relations ≥ ~~100~~ **30**（T5 完成 · 实际 31 · 20 agree + 11 disagree · 数学上限 ceiling 已榨干 / framing 校准详见 § 9.3）
- [x] 12 concept claim_text 升级 100% 完成（T3）
- [x] Marx 19 obs 中文翻译 100% 完成（T2 · PM 异步抽查可选）

### 11.2 视觉实现
- [ ] 米白纸感 + EB Garamond serif + 5 类节点形状区分
- [ ] 半圆弧规范：起止落在圆点 + 绿弧左下 / 红弧右上 / 灰虚线 extends
- [ ] person section 斜向流（X+40~60 / Y+40~80 偏移）
- [ ] obs 横跨画布右半 + tag 在最左 + 同 person 共享 X 起点

### 11.3 交互
- [ ] 底部时间轴游标可拖 + 之后 obs 渐进淡出
- [ ] 左侧颗粒度栏可展开 / 收起 + hover 类型 icon 触发主画布高亮
- [ ] 点击 obs 弹出详情卡 popover（含 § 8.2 schema 全部字段）
- [ ] 勾选著作 → obs 行末尾显示 `[书名 · 年份]`

### 11.4 性能
- [ ] 100+ claim + 200+ link 渲染流畅（60fps drag/zoom）
- [ ] 详情卡弹出 / 关闭无 layout reflow

### 11.5 demo 可访问性
- [ ] M4 demo 在线 URL 可访问（`/m4` 或 `/`）
- [ ] M3 demo URL 保留为存档（`/m3` redirect from `/marx/`）
- [ ] 主页入口指向 M4，M3 入口移除

---

## 12. 已知风险 / trade-off

### 12.1 风险 1 · claim 数据采集质量

**问题**：99-165 条 person quote 由 AI 草稿生成，存在编造引文风险（学术敏感）。
**Mitigation**：100% PM 复核（决策 3 模式覆盖 M3 决策 4 opportunistic）；尤其前驱 / 后继的 quote 必须有 reference 文献支撑。
**Trade-off**：PM 工时大（按 M3 经验 ~5-10 小时），但学术信誉不可妥协。

### 12.2 风险 2 · vision 偏差（M4 实现后跟 PM 想象差异）

**问题**：mockup 8 obs 跟实际 100+ claim 视觉密度差异大，PM 看实际可能不满意。
**Mitigation**：M4 第一个可演示版本（T6 layout 完成 + T2/T3 部分数据入库 = ~30 个 claim 真实数据）后**强制 PM checkpoint**，再继续 T4 大量数据补采。
**Trade-off**：T6 完成时停下来 PM check 增加 1 个 review round trip，但避免"全部做完才发现 vision 偏"的回滚风险。

### 12.3 风险 3 · M3 数据 5 类节点 type 浪费

**问题**：M3 ship 的 50 nodes（person/work/event/place 类型）M4 不在画布显示，看似浪费。
**Mitigation**：保留作为 ClaimNode 的 metadata reference（claim.author_id → person / claim.source_work_id → work）；将来 M5+ 加事件 view / 地图 view 时复用 event / place 数据。
**Trade-off**：当前看是浪费，长期 vision 是数据分层（claim 是主视图 + 其他维度是辅助）。

### 12.4 风险 4 · denizcemonduygu 借鉴的版权 / 致谢

**问题**：直接 borrow 19 obs + 202 link 数据 + 视觉 layout，可能涉及署名 / 版权问题。
**Mitigation**：(a) 数据翻译并适应 Marx 项目（不是 mirror）；(b) demo 详情卡 footer 致谢 "Inspired by denizcemonduygu.com/philo"；(c) M5+ 联系作者获正式授权。
**Trade-off**：现在不解决（M4 demo 是 PM 私人项目演示，非商用），M5+ 公开发布前必须解决。

### 12.5 风险 5 · 弧线密度过高视觉乱

**问题**：100+ claim + 250+ link 全部画在同一画布上，弧线密度可能比 mockup 视觉乱很多。
**Mitigation**：(a) 颗粒度栏 hover icon 触发"高亮当前类型 + 弱化其他"；(b) 默认 opacity 低（agreement 0.5 / disagreement 0.6 / extends 0.4）；(c) 实现期 T6 跑真数据后看视觉效果，必要时加"按时间窗口过滤" feature（只显示游标 ±20 年的弧）。
**Trade-off**：视觉密度是 vision 体现（denizcemonduygu 截图也密集），不应过度简化。但要有降密度逃生通道。

---

## 13. brainstorm session 决策追溯

本 spec 决策来源全部出自 2026-05-11 single brainstorm session（v3-v7 mockup 7 轮迭代）：

| spec 章节 | brainstorm 决策点 | 来源 |
|---|---|---|
| § 2.1 范围 | Q1 PM 选 2（视觉重设计 + 详情卡，排除时间轴 / 侧栏 → 后调整加回时间轴） | brainstorm Q1 |
| § 4 视觉风格 | Q2 PM 选 A 学术编辑风（沿用 M2 § 7） | brainstorm Q2 |
| § 5 layout | v3-v7 迭代（v3 完全垂直错 → v4 加时间轴 → v5 obs 横跨 → v6 时间轴形态 → v7 最终） | brainstorm Q3 v3-v7 |
| § 5.4 弧线规范 | PM 反馈"起止圆点 + 绿左下/红右上"作为 vision 硬约束 | brainstorm Q3 v7 后反馈 |
| § 6 时间轴 | Q3 v6 PM 选"B 思路 + 底部横向" | brainstorm Q3 v6 |
| § 3 数据 schema | Q3 v4 第一性原理结论 = claim 节点 type | brainstorm Q3 v4 反馈 3 |
| § 9 数据采集 | denizcemonduygu data.json 抓取 + Marx 19 obs seed 解锁 | brainstorm 后期 |

mockup 历史保留在 `.superpowers/brainstorm/<session>/content/`（gitignore）。

---

## 14. 待 PM review 决策点（spec 内已 propose，PM 可调整）

| 待决 | 我的 propose | PM review 时确认 |
|---|---|---|
| **③ 复核策略** | 100% PM 复核（决策 3）覆盖 M3 决策 4，唯一例外 Marx 19 obs 走 opportunistic | 接受 / 改回 opportunistic / 其他 |
| **④ M3 demo 处理** | 选项 C 保留 URL + 移除主页入口 | 接受 / 改 A 完全替换 / 改 B 双 view |
| **数据规模** | M4 minimum 80 claim / 250 link | 加 / 减 |
| **task 拆分粒度** | 13 task | 接受 / 拆细 / 合并 |
| **风险 mitigation** | § 12 5 个风险 + mitigation | 补充 / 调整 |

---

## 15. 下一步（spec → plan → implementation）

1. **PM review 本 spec**（重点：§ 2 范围 / § 3 数据 schema / § 5 layout / § 9 复核策略 / § 10 task 拆分 / § 14 待决）
2. PM approve 后 **invoke writing-plans skill** → 生成 M4 implementation plan
3. M4 plan 按 13 task 排序 + 每 task 写 acceptance criteria + 依赖关系
4. M4 implementation 启动（按 task 顺序 / 可并行的 task 同时跑）
5. T6 完成后**强制 PM checkpoint**（视觉 + 部分数据真实演示）

---

## 附录 · 参考文献 / 数据 source

- **denizcemonduygu.com/philo** 数据 schema + Marx 19 obs + 8684 link 数据
- denizcemonduygu data.json 完整 dump（PM 抓取）= ~988KB / 188 person + 2123 record + 8684 link
- M2 design v1.1 § 7 视觉风格定调
- M3 阶段 B 完成的 50 节点（M4 metadata reference）
- AGENTS.md "前端视觉美学约束" 三件套（spec § 4 视觉定调遵守）
