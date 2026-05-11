# Marx Backlog · 已识别但未排期的 vision 项

> **本文件用途**：记录已经在 PRD / spec 里 confirm 但当前 milestone 没排期的 vision-level item，避免跨窗口 / 跨阶段被遗忘。
> **维护原则**：每个 item 必须含 (a) 来源（PRD / spec 哪一条） + (b) 当前为什么没做 + (c) 触发条件（什么时候回来做） + (d) 跟当前 M4 的关系。
> **谁负责扫**：PM 每个 milestone 完成时 review 一次 / 新窗口续接时 AGENTS.md 链到这里 / sync skill 跨域扫描时检查。

---

## 1. 地理图画布（V1 必做 · M4 漏掉的）

### 来源（confirm 过的 vision）

- **PRD v0.3 § 4 核心功能 V1 必做**：「**B+2 双主视图**：主图全屏 + 副图画中画小窗（≤20% 屏幕，右下角），点击副图标题栏 = 主副互换」
  - 默认主图：关系图（Marx 居中 + 5 类异质节点）
  - 默认副图：**地理图**（仅渲染人/事件/地点 ~86 节点）
- **PRD DR-009**（2026-05-07 决策）：「**B+2 双主视图**（主图全屏 + 副图画中画，主副可互换）」
- **M2 design v1.1**（2026-05-07）多处规范：
  - § 1 整体形态：主图 / 副图布局图
  - § 7 视觉风格：地理图 token / 沙石灰金 #9B8B6F 配色
  - § 表格：关系图 5 类节点全渲染 / 地理图仅紫+橙+灰三类
- **数据 schema** 已经为地理图预留：
  - `PersonNode.main_location_lat_lng`（M2 已采集）
  - `WorkNode.writing_location_lat_lng`（M2 已采集 optional）
  - `EventNode.location_lat_lng`（V1 必填字段）
  - `PlaceNode.lat_lng`（V1 必填字段）
  - 数据采集时已经按"地理图最终要用"的标准录入

### 当前状态（2026-05-12）

- ❌ **从未实现**（M1/M2/M3 demo 都只有关系图，没有地理图副视图）
- ❌ **M4 spec 没提**（M4 vision pivot 时只讨论了"主图从关系图改为 claim-on-timeline 思想史"，没讨论地理图副视图怎么办）
- ❌ **M4 plan 没排期**（13 task 全是思想史相关）

### 为什么 M4 没做（事后分析）

1. **M4 brainstorm 触发点**是 PM Task 10 反馈"50 节点 demo 视觉无区别"，注意力全在主画布形态创新（借鉴 denizcemonduygu.com/philo）
2. **vision pivot 重心**是单个画布的形态重做（person-network → claim-on-timeline），不是"画布 1 + 画布 2"的双画布关系
3. **PM 没 explicit ask** 地理图（M4 brainstorm session 只针对思想史画布 mockup 迭代 v3-v7）
4. **2026-05-12 PM 提醒**：发现整体进展介绍里没双画布 → 触发本 backlog 创建

### 跟当前 M4 的关系

- M4 完成后 = **只有思想史画布**（claim-on-timeline + 半圆弧 + 时间轴 + 颗粒度栏 + 详情卡）
- **不是 PRD V1 整体 spec 的全部**，是 V1 思想史画布部分
- PRD V1 「B+2 双主视图」**未达成**

### 触发条件 / 何时回来做

3 个可能时机，PM 自决：

**选项 A（推荐）· M5 专项**：M4 完成 + M3 阶段 C 回头后，做 M5「地理图副视图」专项 milestone。
- 优点：单独 milestone 时间盒清晰；不污染 M4 vision；M4 完成后再决定要不要做 / 怎么做
- 缺点：V1 demo 上线时不含地理图，跟 PRD v0.3 V1 spec 有 gap
- 大约工作量：1.5-2.5 周（数据已采，主要工作是 D3 + GeoJSON + 主副互换交互 + 共享时间轴联动）

**选项 B · M4 期内并行**：M4 还有 11 个 task 没做，加 T14「地理图副视图」插进去。
- 优点：上线时一次到位 = PRD v0.3 V1 完整
- 缺点：M4 工时翻倍；M4 vision 重心稀释；T6 主画布 layout 验收 + 地理图 layout 验收两个 PM checkpoint 排在一起 PM 容量爆

**选项 C · V2 推迟**：地理图推到 V2 跟"故事模式"一起做。
- 优点：V1 上线最快；V2 故事模式天然以地理叙事为骨架
- 缺点：PRD v0.3 V1 spec 部分作废；用户首批反馈拿不到"地理直观性"维度
- 风险：跟用户访谈反馈"历史/地理/政治不分家"对齐度低

### M4 不破坏地理图 future implementation 的保障

- ✅ 数据 schema 已经为地理图预留全部字段（lat_lng / location_*），M4 没改这部分
- ✅ M2 已采的 ~50 person + 4 work 含 main_location_lat_lng / writing_location_lat_lng 字段
- ❓ 主副互换交互 / 共享时间轴 / 主副 panel 共享详情卡 —— M4 主画布有详情卡 popover（T9），架构上"地理图副视图复用同一详情卡 component"应该可行，但 M4 没专门为此设计
- ❓ M4 时间轴是底部横向（T7），跟 M2 design v1.1 的"主副共享时间轴"是否兼容 —— 没专门 verify

### PM 决策点（M5 启动前 review）

何时决定 A/B/C：建议 **M4 T6 完成后强制 PM checkpoint 时**（spec § 12.2），跟"思想史主画布是否符合 vision 想象"同步决定地理图副视图怎么排。

---

## （未来 item 在此追加）

> 格式按 # 1 模板：来源 / 当前状态 / 为什么没做 / 跟当前阶段关系 / 触发条件 / 不破坏 future 实现的保障
