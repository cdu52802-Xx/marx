# Marx 星图 M3 阶段 B · concept 节点校对清单

> **说明**：本文件由 Task 9 手动创建（不是 `npm run m3:gen-md` 生成 — SPARQL 不拉 concept，concept 是 design doc § 5.2 设计选定的 12 个核心概念）。

> **填写规则**：
> - 不要改 H3 标题（"### concept-alienation 异化"），脚本靠 H3 识别节点
> - `name_orig`：德语原文（Marx 用德语写作）
> - `proposed_year`：首次系统提出的年份（不是出版年；如《剩余价值》归 1867《资本论》，不是 1859《政治经济学批判》）
> - `proposed_work_id`：归属著作的 ID，必须是 work 库已有的 4 个之一：
>   - `wd-q40591`（共产党宣言 1848）
>   - `wd-q58784`（资本论 1867）
>   - `wd-q295347`（1844 手稿，1932 出版）
>   - `wd-q470600`（德意志意识形态 1846，1932 出版）
> - `definition_plain`：白话定义，单 string 用 " / " 分隔 3 个 sub-points（≤ 3 行原则）
> - `citation_urls`：1-3 个引用 URL（SEP / marxists.org / wikipedia）

> **节点数**：12

> **PM 复核状态（2026-05-11）**：本轮 PM 容量不足，转入 opportunistic 复核模式（详见 [anchor 决策 4](../2026-05-08-m3-progress-anchor.md)）。
>
> ✅ **已入库**（12 concept × 6 字段全 AI 草稿）
> - 12 个 name_zh + name_orig + proposed_year + proposed_work_id + definition_plain + citation_urls AI 草稿
>
> ⏳ **opportunistic 复核重点**
> - proposed_year + proposed_work_id 学术归属有争议的（"经济基础/上层建筑"归 1846 德意志意识形态 vs 1859 政治经济学批判序言 / "生产方式"五形态划分简化 等）
> - definition_plain ≤ 3 行白话措辞 AI default — 涉及概念解释的学术倾向选择
> - citations 同 person/work 可能死链（marxists.org 路径 ad-hoc）
>
> ⏳ **successor_notes 字段** Task 14-15 才填（后来者旁注内容），本次留空 `[]` 数组 — 不在本次复核范围

---

### concept-alienation 异化

**当前已有**: 无（Task 9 新建）
**待补**:

- name_zh: 异化
- name_orig: Entfremdung
- proposed_year: 1844
- proposed_work_id: wd-q295347
- definition_plain: 工人在资本主义生产中与劳动产品、劳动过程、自身类本质、他人疏离 / 劳动从自我实现变成被迫的外在活动 / Marx 在 1844 手稿借鉴黑格尔 + 费尔巴哈但批判性发展
- citation_urls:
  - https://www.marxists.org/chinese/marx/1844/index.htm
  - https://plato.stanford.edu/entries/alienation/

---

### concept-surplus-value 剩余价值

**当前已有**: 无（Task 9 新建）
**待补**:

- name_zh: 剩余价值
- name_orig: Mehrwert
- proposed_year: 1867
- proposed_work_id: wd-q58784
- definition_plain: 工人创造的价值超过劳动力价值（工资）的部分 / 被资本家无偿占有 / 资本主义剥削的核心机制
- citation_urls:
  - https://www.marxists.org/chinese/marx/01/index.htm
  - https://plato.stanford.edu/entries/exploitation/

---

### concept-historical-materialism 历史唯物主义

**当前已有**: 无（Task 9 新建）
**待补**:

- name_zh: 历史唯物主义
- name_orig: Historischer Materialismus
- proposed_year: 1846
- proposed_work_id: wd-q470600
- definition_plain: 社会发展由物质生产方式决定 / 生产力 + 生产关系矛盾推动历史变迁 / 物质生活资料生产是一切历史前提
- citation_urls:
  - https://www.marxists.org/chinese/marx/02/index.htm
  - https://plato.stanford.edu/entries/marx/

---

### concept-class-struggle 阶级斗争

**当前已有**: 无（Task 9 新建）
**待补**:

- name_zh: 阶级斗争
- name_orig: Klassenkampf
- proposed_year: 1848
- proposed_work_id: wd-q40591
- definition_plain: "一切迄今为止的社会历史都是阶级斗争史"（宣言开篇）/ 自由民与奴隶 / 贵族与平民 / 资产阶级与无产阶级的对抗
- citation_urls:
  - https://www.marxists.org/chinese/marx-engels/01/index.htm
  - https://plato.stanford.edu/entries/marxism-class/

---

### concept-commodity-fetishism 商品拜物教

**当前已有**: 无（Task 9 新建）
**待补**:

- name_zh: 商品拜物教
- name_orig: Warenfetischismus
- proposed_year: 1867
- proposed_work_id: wd-q58784
- definition_plain: 商品掩盖了人与人的社会劳动关系 / 呈现为物与物的关系（"价格"似乎是物的固有属性）/ 资本主义意识形态的核心幻象
- citation_urls:
  - https://www.marxists.org/chinese/marx/01/index.htm
  - https://en.wikipedia.org/wiki/Commodity_fetishism

---

### concept-ideology 意识形态

**当前已有**: 无（Task 9 新建）
**待补**:

- name_zh: 意识形态
- name_orig: Ideologie
- proposed_year: 1846
- proposed_work_id: wd-q470600
- definition_plain: 统治阶级的思想是占统治地位的思想 / 意识形态是颠倒的世界观（如照相机暗箱）/ 维护现存生产关系的精神工具
- citation_urls:
  - https://www.marxists.org/chinese/marx/02/index.htm
  - https://en.wikipedia.org/wiki/German_ideology

---

### concept-mode-of-production 生产方式

**当前已有**: 无（Task 9 新建）
**待补**:

- name_zh: 生产方式
- name_orig: Produktionsweise
- proposed_year: 1846
- proposed_work_id: wd-q470600
- definition_plain: 生产力 + 生产关系的统一 / 原始 → 奴隶 → 封建 → 资本主义 → 共产主义 五种依次更替（"五形态论"）/ 决定社会经济形态
- citation_urls:
  - https://www.marxists.org/chinese/marx/02/index.htm
  - https://en.wikipedia.org/wiki/Mode_of_production

---

### concept-base-superstructure 经济基础 / 上层建筑

**当前已有**: 无（Task 9 新建）
**待补**:

- name_zh: 经济基础 / 上层建筑
- name_orig: Basis / Überbau
- proposed_year: 1846
- proposed_work_id: wd-q470600
- definition_plain: 经济基础（生产关系总和）决定政治 / 法律 / 意识形态上层建筑 / 上层建筑反作用于基础 / 1859 政治经济学批判序言系统化阐述
- citation_urls:
  - https://www.marxists.org/chinese/marx/02/index.htm
  - https://en.wikipedia.org/wiki/Base_and_superstructure

---

### concept-communism 共产主义

**当前已有**: 无（Task 9 新建）
**待补**:

- name_zh: 共产主义
- name_orig: Kommunismus
- proposed_year: 1848
- proposed_work_id: wd-q40591
- definition_plain: 消灭私有制 + 消灭阶级 / 国家逐步消亡 / "各尽所能 按需分配"的社会形态
- citation_urls:
  - https://www.marxists.org/chinese/marx-engels/01/index.htm
  - https://plato.stanford.edu/entries/communism/

---

### concept-revolution 革命

**当前已有**: 无（Task 9 新建）
**待补**:

- name_zh: 革命
- name_orig: Revolution
- proposed_year: 1848
- proposed_work_id: wd-q40591
- definition_plain: 无产阶级推翻资产阶级统治的政治行动 / "暴力是新社会从旧社会母腹脱出的助产婆" / 革命后建立无产阶级专政作为过渡
- citation_urls:
  - https://www.marxists.org/chinese/marx-engels/01/index.htm
  - https://en.wikipedia.org/wiki/Marxist_revolution

---

### concept-labor-theory-of-value 劳动价值论

**当前已有**: 无（Task 9 新建）
**待补**:

- name_zh: 劳动价值论
- name_orig: Arbeitswerttheorie
- proposed_year: 1867
- proposed_work_id: wd-q58784
- definition_plain: 商品价值由社会必要劳动时间决定 / 继承 Smith + Ricardo 古典经济学并批判性发展 / 区分"劳动" vs "劳动力"是 Marx 突破
- citation_urls:
  - https://www.marxists.org/chinese/marx/01/index.htm
  - https://plato.stanford.edu/entries/marx/

---

### concept-state 国家

**当前已有**: 无（Task 9 新建）
**待补**:

- name_zh: 国家
- name_orig: Staat
- proposed_year: 1848
- proposed_work_id: wd-q40591
- definition_plain: 阶级压迫的工具 / 资产阶级国家是"管理资产阶级共同事务的委员会" / 共产主义革命后国家逐步消亡
- citation_urls:
  - https://www.marxists.org/chinese/marx-engels/01/index.htm
  - https://plato.stanford.edu/entries/marxism-political/

---
