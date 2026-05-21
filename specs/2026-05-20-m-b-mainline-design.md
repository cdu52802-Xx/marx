# Marx M-B 主线设计文档 · 页面框架 + 副窗地理图 + mobile

> **状态**：
> - B1 部分 ✅ **已 ship**（2026-05-21 tag `m-b1-final` → fd8b545 · Stage 1-5 + polish 7 batch · DR-078~096）
> - B2 部分 ✅ **PM approved (A+) 路径**（2026-05-21 · 第一性原理推荐 / 直接进 writing-plans + 加 Stage 0 数据可达性验证 / DR-097）
> - B3 部分 ⏸ 待启（Phase 4 · B2 ship 后）
> **关联**（SSOT 引用 / 不重复内容）：
> - [PRD V1 § 4 B+2 双主视图](../docs/PRD.md)
> - [M-B brainstorm decisions doc](../docs/2026-05-20-b-mainline-brainstorm-decisions.md) ⭐（17 元素 catalog / 视觉设计 / 缩放谱系等 brainstorm 决策 SSOT）
> - [M5 takeaway](../docs/2026-05-19-m5-linea-takeaway.md)（baseline + 4 件套 regression）
> - [M5 spec § 2.2 衔接预留](./2026-05-14-m5-linea-explorability-design.md)
> - [DR-069 spec § 8 PM A+D](./2026-05-19-dr-069-arc-misselect-fix.md)

---

## 1. 范围 / 目标 / 非目标

### 1.1 B 主线拆分（G 路径 / PM 2026-05-20 拍板）

| Milestone | 内容 | 估时 | Phase |
|---|---|---|---|
| **B1** | header 重组 + 跨图搜索 + 关于 link | 1 周 | Phase 2 |
| **B2** | 副窗地理图（最大头 / 球面+平面 + 86 节点 + 动态国界） | 5-6 周 | Phase 3 |
| **B3** | mobile responsive + 整合 mobile backlog | 1 周 | Phase 4 |

**总 B 周期** ~7-8 周（含 Phase 0 已完成 1 天 + Phase 1 0.5 天 + B1+B2+B3）。

### 1.2 V1 必做（含范围）

按 [brainstorm decisions § 3 V1 17 元素 catalog](../docs/2026-05-20-b-mainline-brainstorm-decisions.md#3-b2-副窗地理图-17-元素-v1-scope)：

- A 节点：人 + 事件 + 地点（紫橙灰 ~86 节点 default）
- B 关系：核心 3-5 类关系连线（实施期 PM checkpoint 拍板）+ 迁徙轨迹
- C 时空：共享时间轴 + 主副同步
- D 共享基础：详情卡 + tooltip + 跨图搜索 + 缩放 + 互换 + 主副联动
- E 视觉：动态历史国界（全连续过渡）+ 聚合处理（实施期决）

### 1.3 V1 不做（推 V2+）

- 著作（蓝 ~20）/ 概念（绿 ~15）地理渲染（V2/V3+ checkbox 渐进开）
- 思想扩散波（V2+）
- 故事模式入口（V2）

### 1.4 非目标（明确不做）

- 重做现有主图（M5 主线 A 已 ship / B 期间不动半圆弧 / obs / 时间轴等）
- 数据 schema 重构（PRD 已预留 main_location_lat_lng 等字段）
- 多视图同时显示（V1 仍 1 主 + 1 副 / 不做 ≥3 视图布局）

---

## 2. 整体架构

### 2.1 4 区域 layout

```
┌────────────────────────────────────────────────────────────┐
│ Header (top fixed · 36px · M4 已实现)                       │
│ Marx · 思想史可视化      [搜索框]      互换 · 关于           │
├──┬─────────────────────────────────────┬───────────────────┤
│  │                                     │                   │
│s │  主画布 (主图角色)                   │ [详情卡 fixed]    │
│i │   - 默认 = 观点列表（M5 现状）       │  top:0 bottom:274 │
│d │   - 互换后 = 地理图（B2 主画布形态） │  click obs 弹     │
│e │                                     │  width 380px      │
│b │                                     ├───────────────────┤
│a │                                     │ [副窗 fixed]      │
│r │                                     │ right:0 bottom:60 │
│  │                                     │ 380 × 214 (16:9)  │
│  │                                     │ 副图角色          │
├──┴─────────────────────────────────────┴───────────────────┤
│ Timeline (bottom fixed · 60px · 全宽 · 跨主副两图同步)      │
└────────────────────────────────────────────────────────────┘
```

### 2.2 状态切换 · 主/副窗 = 概念

按 [brainstorm decisions § 4 关键澄清](../docs/2026-05-20-b-mainline-brainstorm-decisions.md#4-关键澄清主副窗--概念--不是固定角色)：

| 状态 | 主画布角色 | 副窗角色 | 触发 |
|---|---|---|---|
| 默认（学者用户） | 观点列表（M5 半圆弧） | 地理图 | 启动 |
| 互换（探索者用户） | 地理图（B2 完整设计） | 观点列表（信息密度低版） | 副窗"↔ 互换"或 header 右上 |

实施约束：
- 角色互换不改 layout 框架（4 区域不变）/ 只换主/副 component 渲染
- 状态切换动画（实施期细化 / Stage 3 PM checkpoint 决 timing + transition）
- 互换状态持久化（localStorage / 用户刷新后保留偏好）

### 2.3 共享基础设施（B1 + B2 + B3 共用）

- **时间轴**：M5 已实现底部 fixed 60px / B2 接 hook 让副图节点 fade 跟随时间游标
- **主副联动**：B2 实施期实现 hook（主图选 obs → 副图高亮 + 反向）
- **详情卡 panel**：M5 已实现（width 380px / right fixed）/ B2 时 bottom 60 → 274（让出副窗）
- **跨图搜索**：B1 实施 / 搜索词在主+副两图同时高亮
- **缩放**：M5 已实现 1×-8×（主图 d3.zoom）/ B2 副图独立缩放（球面/平面切换）

---

## 3. B1 · Header 重组 + 跨图搜索（Phase 2 / 1 周 / 5 stage）

### 3.1 范围

- 顶部 brand 优化字号 / 位置（M4 已有 fixed top 36px / 微调）
- **搜索栏**（PRD V1 必做 · 跨图搜索）
- 关于 / 致谢 link（M4 footer 右上已有 / 重组到 header 右上）
- "↔ 主副互换"按钮（位置预留 / B2 时启用）

### 3.2 视觉规范（PM 2026-05-20 选 B · 沿用 M4 米白透明 / 不墨黑 bg）

| 元素 | 规范 |
|---|---|
| header bg | **透明**（沿用 M4 现状 / 不加 background-color / 跟主图融合） |
| brand h1 | EB Garamond 18px / `#2a2a2a` 墨黑 / "Marx · 思想史可视化"（沿用 M4 现状 / 不改 Playfair）|
| brand 副标题 | EB Garamond italic 11px `#888` "1818–1883 · 92 条主张 · 31 条思想关系"（沿用 M4 / B2 数据规模含地理图节点需更新） |
| 搜索框 bg | `#fcfaf6` + 1px 沙石灰金 `#d8cab0` border / paper 风格 |
| 搜索框 font | EB Garamond 13px / placeholder italic `#888` |
| link / 互换按钮 | EB Garamond italic 12px `#888` letter-spacing 0.02em（沿用 M4 footer 致谢风格）/ hover → `#5b3a8c` 紫 |
| layout | brand h1 + 副标题 fixed top:14 left:62 right:250（M4 不动）/ 搜索框 fixed top:14 居中 / 互换 + 关于 + 视觉灵感 link fixed top:14 right:14 inline 分隔 · 含 dotted underline |
| pointer-events | brand 区 `none`（M4 现状 / 不挡主图 click）/ 搜索 + link + 互换 区 `auto` |
| z-index | 9（沿用 M4 现状） |

### 3.3 搜索功能（核心 · v2 · 2026-05-20 PM mockup 拍板）

**v1 → v2 关键升级**：PM 2026-05-20 Stage 2 checkpoint 反馈双形态 + 分组（参考 mockup `public/m-b1-search-ux-mockup.html`）。
落 DR-078 · 工程量 1d → 1.5d。

#### 3.3.0 双形态 popover · 切换规则

| 状态 | popover 形态 | 触发 |
|---|---|---|
| 搜索框 focus + 输入框空 | **探索形态**（§ 3.3.1） | 用户 click 搜索框 / 清空输入框 |
| 搜索框 focus + 已打字 | **结果形态**（§ 3.3.2） | 用户输入任意字符 |

切换自动 / 不用按钮 / 用户输入清空即切回探索 / 减少决策成本。

- 实时搜索（debounce 200ms · T3.2）
- 搜索目标：claim.claim_text / claim.name_zh / claim.name_orig / claim.keywords / person.name_zh / 概念精确匹配（§ 3.3.4）
- 键盘导航：↑↓ 跨 section wrap / Enter 选当前 / Esc 关
- 关闭：Esc / 点空白（沿用 claim-popover outside click pattern）

#### 3.3.1 探索形态 · 空搜索默认（"§ 探索 · 不知道搜什么？从这里开始"）

3 段 entry · 每段 chip list / chip click → 填搜索框 + 自动切结果形态：

**§ 主要人物（7 位 · curate）**：
马克思 · 恩格斯 · 黑格尔 · 费尔巴哈 · 普鲁东 · 巴枯宁 · 施蒂纳

> 注：「普鲁东」数据库实存「皮埃爾-約瑟夫·普魯東」（繁体）/ 「圣西门」数据库缺 → 替换为「施蒂纳」（麥克斯·施蒂納 · 3 条 claim）。

**§ 核心概念（8 个 · curate）**：
异化 · 阶级 · 革命 · 商品 · 资本 · 历史唯物 · 辩证法 · 剩余价值

每个概念含元信息（提出者 / 年份 / 出处 · 数据落 `src/lib/search-curate.ts`）。

**§ 关键时段（4 段 · curate）**：
1840s 青年 · 1848 革命 · 1864 第一国际 · 1871 巴黎公社

#### 3.3.2 结果形态 · 已打字时分组（按 author_id）

popover 结构（自顶向下）：

```
§ 概念（若 query 命中 curate 8 概念之一 / 否则跳过）
  {概念名} · {提出者} 核心 / {年份} {出处} →

§ {人物 A} · N 条主张
  · {claim text 含 query 紫高亮} ({year})
  · ...

§ {人物 B} · N 条主张
  · ...
```

约束：
- 一级 group 按 `claim.author_id` 聚合 / persons map 取 `name_zh`
- 二级 claim item 缩进 28px / · bullet / 关键词紫色高亮（em `.search-result-highlight` · 紫 `#5b3a8c` 600 weight + bg `rgba(91,58,140,0.10)`）
- 年份小字 italic 灰 右对齐 / editorial 风格
- max 4 组人物 + "查看全部 N 位" 折叠链接 / 折叠详情留 backlog（Stage 3 实施期 PM checkpoint 验证）

#### 3.3.3 副图高亮联动（B2 hook 预留）

选中候选 → 主图 obs 紫圈高亮 + fade 其他 + dispatch event `marx:search-highlight` { type, id } / B2 listener 接收。

#### 3.3.4 概念命中识别（PM 选「精确匹配」）

- query 跟 `CORE_CONCEPTS` 8 chip 字符串精确匹配 → 显示 "§ 概念" 段
- 否则 → "§ 概念" 段跳过 / 只显示人物分组（即模糊不算概念命中）
- 例：query "异化" → 命中 / query "异" → 不命中 / query "商品" → 命中 / query "商" → 不命中

#### 3.3.5 关键词高亮（V1 仅字面 / 翻译映射 V2）

- 紫色高亮 `<em class="search-result-highlight">` 包裹 query 字面 substring
- 中英文映射 V2（如英文搜 "Marx" 不高亮中文"马克思"）/ V1 不做

### 3.4 视觉设计 · 美观度 polish placeholder（Stage 3 PM checkpoint 决）

PM 2026-05-20 mockup 反馈："形式认可 / 美观度差点 / 设计感没有很高级 / 字体等细节后续微调优化 / 真正用用之后才能找到更合理的方案"。

留 placeholder · Stage 3 实施期 + B1 ship 前 polish 阶段处理：

- 字体 hierarchy：popover 标题 / section head / chip / claim text / 年份 5 层 font-size + weight 调优
- 间距 rhythm：section 之间 spacing / chip 之间 gap / claim item padding 调优
- 配色微调：紫高亮饱和度 / dotted underline 灰度 / 米白 paper 色温
- 微动效：popover 出入 transition / chip hover 反馈 / section 展开动画
- 高级感方向（AGENTS.md 三件套 frontend-design + ui-ux-pro-max skill 实施期主动召唤）：
  - editorial / academic journal feel（沿用 M4/M5 主线 A）
  - 而非 AI Slop（紫渐变 / 3-column 卡片 / system-ui display font）

约束（不变）：
- 视觉系统沿用 M4/M5 主线 A（米白 + 沙石灰金 + EB Garamond + paper-shadow + 0 border-radius）
- 0 AI Slop（PRD 视觉系统硬约束）

### 3.5 Stage 划分（5 stage · v2 工程量更新）

| Stage | 内容 | 估时 | PM checkpoint |
|---|---|---|---|
| 1 | header layout 重组（brand 字号 / link 位置 / 互换按钮预留位） | 1 天 | ✓ done 2026-05-20 |
| 2 | 搜索 UI（输入框 + 下拉浮窗 + 键盘 / Stage 2 ship `fa1c2ef`） | 1.5 天 | ✓ done 2026-05-20 |
| 3 | **搜索逻辑 v2**（T3.1 fuzzy + T3.2 debounce + **T3.3 popover 双形态升级** + **T3.4 curate lists**） | **1.5 天**（v1 1d → v2 +0.5d） | ✓ done 2026-05-21 |
| 4 | 主图 obs 高亮 + 副图 hook event（T4.1 highlightObs + T4.3 dispatch · **T4.2 filter chip 砍 · DR-083**） | 0.5 天 | ✓ done 2026-05-21 |
| 5 | E2E + 4 件套 baseline + ship | 0.5 天 | ✓ ship |

**B2 hook 预留**：副图高亮 logic 接 B2 实施期实现（B1 期间 dom event 触发 / B2 时 listener 接收）。

### 3.6 文件结构（v2 · 新增 search-curate.ts）

| 文件 | 类型 | 内容 |
|---|---|---|
| `src/components/header.ts` | ✅ done | header layout + 主副互换按钮占位 |
| `src/components/search.ts` | ✅ done · T3.2 加 debounce | 搜索输入框 paper 风格 |
| `src/components/search-result-popover.ts` | ✅ done · T3.3 升级双形态 | 候选 list / 升级 renderExplore + renderGrouped |
| `src/lib/search-index.ts` | NEW · T3.1 | 多目标 fuzzy match + score 排序 |
| `src/lib/search-curate.ts` | **NEW · T3.4** | curate lists 静态 const（MAIN_PERSONS 7 / CORE_CONCEPTS 8 / KEY_PERIODS 4） |
| `src/main.ts` | MOD · T3.x | 挂载 + 接 highlight hook + 删 stubSearch |
| `src/styles.css` | MOD · T3.3 | 加 .search-result-section / .search-result-group / .search-result-highlight 视觉 |

### 3.7 Acceptance（B1 ship 验收 · v2 · 双形态升级后）

- [ ] header 视觉跟 M5 主线 A 沿用一致（米白 + 墨黑 + 紫 / 0 border-radius / 0 AI slop）
- [ ] **空搜索 → popover 显示探索形态**（§ 主要人物 7 / 核心概念 8 / 关键时段 4）
- [ ] **chip click → 自动填搜索框 + 切结果形态**
- [ ] **已打字 → popover 显示结果形态 + 按 author_id 分组**
- [ ] **概念精确命中 → "§ 概念"段显示元信息**
- [ ] **关键词紫色高亮在 claim text 内**
- [ ] 搜索框打字实时显示候选 list（< 200ms debounce）
- [ ] 选中候选 → 主图 obs 紫圈高亮 + fade 其他
- [ ] 搜索框 + popover 跟 zoom 解耦（屏幕 fixed 大小）
- [ ] 键盘导航跨 section wrap（最后人物 → 第一人物）
- [ ] 4 件套 baseline 不退化（Health ≥ 9 / Design ≥ A- / QA ≥ 96 / AI Slop A）
- [ ] Bundle gzip 不超 35 KB（Phase 0 baseline 30.83 / Stage 2 已用 32.08 / Stage 3 预算 +1.5 KB → ≤ 33.5 KB）
- [ ] E2E 新加 5 spec（探索 chip click / 已搜分组 / 概念命中 / 关键词高亮 / 键盘跨 section）pass
- [ ] **PM 美观度 polish 反馈处理**（§ 3.4 · Stage 3 实施期 + ship 前 polish）

---

## 4. B2 · 副窗地理图（Phase 3 / 5-6 周 / 7 stage）

### 4.1 范围

按 [brainstorm decisions § 3 V1 17 元素 catalog](../docs/2026-05-20-b-mainline-brainstorm-decisions.md#3-b2-副窗地理图-17-元素-v1-scope) 完整集合。

### 4.2 副窗 layout（地理图作副图角色 · v3 mockup）

- `position: fixed; right: 0; bottom: 60px`（跟 timeline 顶对齐 / 详情卡 + sidebar bottom 60 全栏对齐）
- `width: 380px`（跟详情卡 code 实际同宽 / 注：spec 写 400 不准）
- `height: 214px`（**16:9 比例** / 不抢详情卡空间）
- 视觉框：`background: #fcfaf6; border-left: 1px solid #d8cab0; box-shadow: -4px 0 18px rgba(58,35,96,0.10)` paper-shadow（跟详情卡完全一致）
- 标题栏 padding `16px 20px 8px` / `border-bottom: 1px solid #d8cab0`
- 标题文字：`§ 地理图 · YYYY 地名` (EB Garamond italic 13px 紫 #5b3a8c)
- 互换按钮：`↔ 互换` 12px 灰（实施期细化视觉 / 现 mockup 文字暂占）
- **不画副图内时间游标**（用户只在外部主 timeline 操作）
- 详情卡 layout 同步调整：`bottom: 60 → 274`（60 + 214 让出副窗位置）

### 4.3 主画布 layout（地理图作主图角色 · v4 mockup）

按 [brainstorm decisions § 7](../docs/2026-05-20-b-mainline-brainstorm-decisions.md#7-地理图主画布详细元素v4-mockup-approved) 完整元素清单：

- 欧洲底图（动态历史国界 / 当前显示某时点）
- 86 节点完整展开（紫人 50 + 橙事件 30 + 灰地点 6）
- 当前 active 节点紫圈高亮
- 迁徙轨迹（已走过实线 + 未来虚线 / 时间 forward 实线段延长）
- 关系连线（核心 3-5 类 / 球面 = 大圆弧 / 平面 = 投影曲线）
- 当前时点 indicator（左上 `§ YYYY · 地点 · N 节点 active`）
- hover tooltip（节点名 + 1 行核心）
- 详情卡 active state（right top 380×可变 / 沿用现状视觉）
- 副窗观点列表（right bottom 380×214 信息密度低版）
- 图例 panel（左下 paper 风格）
- ↔ 互换按钮（副窗右上）

### 4.4 节点（5 类 / V1 default 紫橙灰）

| 类型 | 颜色 | 数量 | V1 状态 | 字段 |
|---|---|---|---|---|
| 人 | 紫 #5b3a8c | ~50 | ✅ default | main_location_lat_lng |
| 事件 | 橙 #cc6633 | ~30 | ✅ default | location_lat_lng |
| 地点 | 灰 #9b8b6f | ~6 | ✅ default | lat_lng |
| 著作 | 蓝 #4a7ba6 | ~20 | ❌ V2 checkbox | writing_location_lat_lng |
| 概念 | 绿 #5d8a5c | ~15 | ❌ V3+ checkbox | first_proposed_location_lat_lng |

### 4.5 关系连线（V1 核心 3-5 类 · 实施期 PM checkpoint 拍板）

6 候选（节点都需地理化 / 不含著作 + 概念）：

| 类型 | 颜色 | 视觉 | 例 |
|---|---|---|---|
| 师承 | 紫 #5b3a8c | 实线 1.4px | 黑格尔 → 马克思 |
| 论敌 | 红 #c24a3e | 虚线 1.2px | 蒲鲁东 vs 马克思 |
| 朋友 | 绿 #5d8a5c | 实线 1.4px | 马 ↔ 恩 |
| 影响 | 跨代影响 | — | 待选 |
| 居住 | 灰 #9b8b6f | 简略 | 人 ↔ 地点 |
| 参与事件 | 橙 #cc6633 | 虚线 0.9px | 马 → 1848 革命 |

实施 Stage 2 PM checkpoint：从 6 候选选 3-5 类（实测信息密度 + 学者优先 + 视觉清晰度判定）。

### 4.6 缩放谱系（v5 mockup · PM Q8 ack）

按 [brainstorm decisions § 8](../docs/2026-05-20-b-mainline-brainstorm-decisions.md#8-缩放谱系球面平面v5-mockup-approved--q8-pm-反馈-ack)：

- **球面 view**（小 zoom · D3 `geoOrthographic()`）：欧洲微观 / 整地球可见
- **平面 view**（大 zoom · D3 `geoMercator()` 或 `geoAlbers()`）：详细国界
- **半球过渡**（中 zoom）：可停留中间状态（PM 拍板保留 / 不仅过渡）
- **临界 zoom 阈值**：实施 Stage 1 prototype 跑出来 + PM 实测微调（不预先拍）
- **关系连线在球面** = great circle 大圆弧（贴球面）/ 不是直线
- **关系连线在平面** = 投影曲线（仍非直线 / 跟随经纬度）
- **球面默认中心** ⭐ = **Marx 当前时间所在地点**（时间游标变 → 球面 reorient / 球面跟随 Marx 行迹）
- **球面可旋转** ⭐（D3 drag 标准能力 / 用户自由探索）

### 4.7 动态历史国界（V1 真历史切片 · DR-099 final · 2026-05-22）

- V1 = **CShapes-Europe.geojson**（CC BY-NC-SA 4.0 · ETH Zurich · 1816-2023 · 322 features / 70 Marx-era states · 含 1871 德意志统一 + 1867 奥匈二元制 etc）
- 数据源 Stage 0+ spike 拍板（DR-099 / 国内可达 / `tmp/cshapes/CShapes-Europe.geojson` 已下载备用）
- 实施路径：
  - **Stage 1**：build-time 过滤 Marx 1818-1883 子集（~480 KB · -45%）+ `public/geo/cshapes-marx-era.geojson` 走 vite ?url asset 不嵌 bundle
  - **Stage 2 / Stage 4**：mapshaper simplify（geometry 简化 · 目标 200-300 KB gzip · -67%）
  - **Stage 1+**：i18n 中文国名映射表（70 states · 含 "Germany" 1816-1870 → "普鲁士" / 1871+ → "德意志帝国" / "Saxe-Weimar" → "萨克森-魏玛" 等 · +1-2h 工程）
- 时间游标拖动 → CShapes 时段切片选择 + d3 transition 平滑过渡（不是 frame-by-frame 连续 · 是 state-snapshot transition）
- License 合规：网站底部加 "地理国界数据 © Schvitz et al. 2022 · CC BY-NC-SA 4.0" 署名
- L1 fallback：cshapes 加载失败 → world-atlas 38 KB 当代国界兜底（确保副窗不空）
- 学术参考：Schvitz et al. 2022 JCR · Cederman et al. 2025 Cambridge UP

### 4.8 主副联动 + 互换（元素 #14 + #15）

| 交互 | 流程 |
|---|---|
| **主图选 obs**（观点列表当主） | → 副图地理图自动高亮当时 Marx 所在地 + 当时影响他的人 + 当时事件 + 球面 reorient 中心到 Marx |
| **主图选节点**（地理图当主） | → 副图观点列表自动高亮当时观点 obs |
| **副图节点 hover** | tooltip + 主图同时高亮关联（反向联动） |
| **副窗"↔ 互换"** | 主副角色互换 / layout 不变 / component 渲染换 |
| **header "↔ 互换"** | 同副窗按钮 / 提示用户随时可切换 |

### 4.9 图例 panel（v5 mockup · 左下角 paper 风格）

按 [brainstorm decisions § 9](../docs/2026-05-20-b-mainline-brainstorm-decisions.md#9-图例-panel-设计v5-mockup-approved)：

- `position: fixed; left: 56px; bottom: 70px`（sidebar 右 + timeline 上）
- `width: 160px; height: 220px`
- paper 风格（border + paper-shadow + 米白）
- 2 分组：§ 关系类型 / § 迁徙轨迹

### 4.10 Stage 划分（8 stage · 加 Stage 0 风险前置 · DR-097）

| Stage | 内容 | 估时 | PM checkpoint |
|---|---|---|---|
| **0** ⭐⭐ | **数据可达性验证**（DR-097 / 中国大陆网络硬约束）· 验 D3 geo 库本地可用 + 1818-1883 历史国界 GeoJSON 4 候选源（Euratlas / HGIS / OSM Historical / Naturalearthdata）可达性 / 不通列 fallback（代理/离线缓存/跨机抓/Codex 主力机代跑）/ 输出可达性矩阵 + 选定数据源 + 预估 GeoJSON 体积 | 0.5 天 | ✓ 必拍板（数据源选定）|
| **1** ⭐ | **prototype** · 球面+平面+great circle 投影切换试水（最大技术风险先攻） | 1-2 周 | ✓ 必拍板 |
| 2 | 86 节点完整渲染 + 关系连线 V1 核心 3-5 类（PM 从 6 候选拍板）| 1 周 | ✓ |
| 3 | 详情卡 + 主副联动 + 互换 + 状态切换动画 | 1 周 | ✓ |
| 4 | 时间轴动态国界（GeoJSON 应用 Stage 0 选定）+ 迁徙轨迹 | 1-1.5 周 | ✓ |
| 5 | 副窗（地理图当副 380×214 16:9 信息密度低版）| 0.5-1 周 | ✓ |
| 6 | 图例 panel + tooltip + 球面旋转手势 + polish | 0.5 周 | ✓ |
| 7 | E2E + benchmark + 4 件套 baseline + ship | 0.5 周 | ✓ ship |

**Stage 0 优先级**（DR-097 新增）：网络风险先验 / 国外 endpoint 中国大陆经常不通（user_environment_china_network memory）/ 5 周后才发现 GeoJSON 拉不下来 = 灾难性 / 0.5 天前置验证 = 高 ROI 风险前置。
**Stage 1 优先级**：技术风险先攻 / 跑不通可能影响整 B2 设计 / PM 实测 prototype 后才进 Stage 2-7。

### 4.11 文件结构（B2 新增）

| 文件 | 类型 | 内容 |
|---|---|---|
| `src/components/geographic-panel.ts` | NEW | 副窗 / 主画布通用 component |
| `src/components/geographic-canvas.ts` | NEW | 地理图主体（节点 + 关系 + 迁徙 + 时间轴 fade） |
| `src/lib/projection.ts` | NEW | D3 投影 orthographic/mercator/albers 切换 + 内插 |
| `src/lib/great-circle.ts` | NEW | great circle arc 计算（球面 + 平面投影） |
| `src/lib/historical-borders.ts` | NEW | 1818-1883 国界 GeoJSON 加载 + 时间内插 |
| `src/components/legend-panel.ts` | NEW | 图例 panel paper 风格 |
| `src/components/swap-button.ts` | NEW | "↔ 互换" 按钮（视觉细化 backlog） |
| `src/data/geographic/*.json` | NEW | 历史国界 GeoJSON dataset |
| `src/main.ts` | MOD | 挂载地理图 panel + 互换 hook |
| `src/components/header.ts` | MOD | 右上 "↔ 互换" 按钮启用 |
| `src/components/claim-popover.ts` | MOD | bottom: 60 → 274 (让出副窗) |

### 4.12 Acceptance（B2 ship 验收）

Stage 1 prototype checkpoint：
- [ ] 球面 view 可见 / 欧洲在中心 / Marx 当前地点为球面中心
- [ ] 拖动 = 球面旋转
- [ ] zoom 1x → 球面 / zoom 4x → 半球 / zoom 8x → 平面 / 中间状态平滑过渡
- [ ] great circle 大圆弧关系连线在球面 vs 平面正确（球面贴球面 / 平面投影曲线）

完整 B2 ship checkpoint：
- [ ] 副窗 always-on 显示 / 不挡详情卡（stack 关系）
- [ ] 86 节点完整渲染（紫人 + 橙事件 + 灰地点）
- [ ] 完整迁徙轨迹（已走实线 + 未来虚线）
- [ ] 时间游标拖动 → 国界全连续过渡 + 节点 fade + 球面 reorient
- [ ] 主副互换 / 不破 layout 框架
- [ ] 主副联动（主选 → 副高亮 + 反向）
- [ ] 图例 panel 左下显示 / paper 风格沿用详情卡
- [ ] 4 件套 baseline 不退化（Health ≥ 9 / Design ≥ A- / QA ≥ 96 / AI Slop A）
- [ ] Bundle gzip 总预算 ≤ 80 KB（geographic-panel + projection + GeoJSON dataset 可能大）
- [ ] E2E 新加 ≥ 8 spec pass

---

## 5. B3 · Mobile Responsive（Phase 4 / 1 周 / 5 stage）

### 5.1 范围

- 手机 layout（≤ 768px）
- 平板 layout（768-1024px）
- 桌面 layout（≥ 1024px / 现状）
- 整合 3 mobile backlog（M5 takeaway § 3.2）

### 5.2 关键 breakpoint

| 设备 | 宽度 | 主要调整 |
|---|---|---|
| 手机 | ≤ 768px | sidebar 收缩为底部 tab / 详情卡 + 副窗全屏切换 / 主图占满 |
| 平板 | 768-1024px | sidebar 紧凑 / 详情卡 + 副窗 vertical stack |
| 桌面 | ≥ 1024px | 现状 layout（v3/v4 mockup）|

### 5.3 整合 backlog

- B3 mobile popover 5px overflow（M4 ISSUE-002 / 380 > 375 viewport）
- B4 tablet sidebar bottom 跟 timeline 撞（M4 ISSUE-004 / 768×1024）
- Focus popover 关后焦点回中心（Stage 5 R0 DR-059 / 偏左 190px）

### 5.4 Stage 划分（5 stage）

| Stage | 内容 | 估时 | PM checkpoint |
|---|---|---|---|
| 1 | breakpoint 设定 + 手机 sidebar 收缩 + 详情卡全屏 | 1.5 天 | ✓ |
| 2 | 手机副窗全屏 + 互换交互 mobile 适配 | 1 天 | ✓ |
| 3 | 平板 stack layout | 1 天 | ✓ |
| 4 | 整合 3 mobile backlog | 1 天 | ✓ |
| 5 | E2E + Lighthouse mobile + ship | 0.5 天 | ✓ ship |

### 5.5 Acceptance（B3 ship 验收）

- [ ] 375px (iPhone SE) 无 popover overflow（B3 backlog fix）
- [ ] 768×1024 (iPad) sidebar 不挡 timeline（B4 backlog fix）
- [ ] Focus popover 关后焦点回主图中心
- [ ] 手机 sidebar 收缩为底部 tab
- [ ] 平板 stack layout（详情卡 + 副窗 vertical）
- [ ] 桌面 layout 现状保持
- [ ] Lighthouse mobile score ≥ 85

---

## 6. 视觉风格（100% 沿用 M5 主线 A · M4 spec § 4）

按 [brainstorm decisions § 5](../docs/2026-05-20-b-mainline-brainstorm-decisions.md#5-视觉风格100-沿用-m5-主线-a--m4-spec--4)：

| 维度 | 规范 |
|---|---|
| 主色 | 米白 `#fcfaf6` / 墨黑 `#1a1a1a` `#2a2a2a` / 紫 `#5b3a8c` / 沙石灰金 `#d8cab0` |
| 字体 | EB Garamond + Playfair Display italic + Source Serif 4 + Noto Serif SC |
| 节点 5 色 | 紫人 / 蓝著作 / 橙事件 / 绿概念 / 灰地点 |
| 装饰 | `§` 分节符（**非 emoji**） / 0 border-radius |
| 阴影 | paper-shadow `box-shadow: -4px 0 18px rgba(58,35,96,0.10)` |
| 边框 | 1px 沙石灰金 border-left |
| 0 AI Slop | 不用紫渐变 / 不 3-column 卡片 / 不 system-ui display font |

---

## 7. 实施期细化（Stage PM checkpoint 决 · 不预先拍）

以下点 spec 留 placeholder · 实施 Stage PM checkpoint 决：

| 点 | 决在哪个 Stage |
|---|---|
| **B1 搜索 popover 美观度 polish**（字体 hierarchy / 间距 rhythm / 配色微调 / 微动效 · § 3.4） | **B1 Stage 3 实施期 + B1 ship 前 polish 阶段** |
| **B1 max 4 组人物 + "查看全部" 折叠**（实际数据 5 人物 / 可能不超 / 实施期 PM checkpoint 验证） | B1 Stage 3 PM checkpoint |
| **B1 中英文映射高亮**（"Marx"映射"马克思"）/ V1 仅字面 / V2 加映射 | B1 V2 backlog |
| 节点 size 具体 px（5 类各自）+ 名字标签策略（直接附 / hover / 混合） | B2 Stage 2 |
| 关系连线粗细 / 方向箭头 / 6 候选 → 3-5 类 | B2 Stage 2 |
| 86 节点聚合 / 重叠处理（同地多 marker / cluster 策略） | B2 Stage 2 |
| 主副状态切换动画 timing + transition | B2 Stage 3 |
| 球面拖旋转交互细节（双击重置中心 / 手势 inertia / 边界） | B2 Stage 6 |
| 国界过渡动画 timing（拖时间游标速度跟国界变化耦合） | B2 Stage 4 |
| 临界 zoom 阈值（球面 vs 半球 vs 平面切换点） | B2 Stage 1 PM checkpoint |
| ⇄ 互换按钮视觉风格（现 mockup `↔ 互换` 文字暂占） | B2 Stage 6 polish 或 B3 |
| 历史国界 GeoJSON 数据源（既有 vs 自建） | B2 Stage 4 |
| 关系连线 6 候选 → 实际 3-5 类（PM 实测信息密度） | B2 Stage 2 |
| 搜索 fuzzy match 算法（vs exact / vs Levenshtein） | B1 Stage 3 |

---

## 8. 测试 + 验收

### 8.1 4 件套 baseline 不退化（每个 Phase ship 时跑）

| 工具 | M5 baseline | B 主线警戒线 |
|---|---|---|
| Health composite | 9.2 | ≥ 9.0 |
| QA score | 96 | ≥ 90 |
| Design score | A- (90) | ≥ A- (88) |
| AI Slop score | A (95) | ≥ A (90) |
| Bundle JS gzip | 30.83 KB（Phase 0）| ≤ 35 KB (B1) / ≤ 80 KB (B2 ship) / ≤ 85 KB (B3 ship) |
| Total prod transfer | ~51 KB | ≤ 200 KB |

### 8.2 E2E（每个 Phase 加新 spec）

- B1：搜索打字 / 候选选择 / Esc 关 / filter chip
- B2：副窗 always-on / 主副互换 / 球面旋转 / great circle 渲染 / 时间国界变化 / 联动
- B3：375px / 768×1024 / Focus popover 居中

### 8.3 PM checkpoint（每 Stage）

按 M5 lesson `feedback_inline_self_audit_stage_checkpoint`：
- TDD task 内自审
- Stage 间集中自审（AI）
- PM checkpoint（PM 实测 + 反馈）

3 层 review 节奏沿用 M5。

---

## 9. 工作量估时总览

| Phase | 内容 | 估时 | 累计 |
|---|---|---|---|
| 0 | M5 backlog 清（DR-069 + Bundle）| ✅ 1 天 | 1 天 |
| 1 | B 整体 spec 草案 + PM review | 0.5 天 | 1.5 天 |
| 2 | B1 header + 搜索 | 1 周 | ~1.5 周 |
| 3 | B2 副窗地理图 | 5-6 周 | ~6.5-7.5 周 |
| 4 | B3 mobile + backlog 整合 | 1 周 | ~7.5-8.5 周 |

**总 ~7.5-8.5 周**（含 1 天 Phase 0 + 0.5 天 Phase 1 + B1 + B2 + B3）。

---

## 10. 决策记录（DR）

| 编号 | 日期 | 决策 | 备选 | 理由 |
|---|---|---|---|---|
| DR-070 | 2026-05-20 | DR-069 PM A+D 不强攻 / 推 B 主线统筹 | 4.1+4.2 / 4.2 disambig / 4.3 sticky | spec § 4.1 算法上无效 / B2 5-6 周可能弧线重设 / hover label 兜底实战 UX |
| DR-071 | 2026-05-20 | Bundle 减肥 vite ?url + top-level await fetch | 移到 public/data | 不破 scripts/ 路径 / vite 自动 asset copy / 47.04→30.83 KB -34.5% |
| DR-072 | 2026-05-20 | B 主线拆 B1/B2/B3 独立 milestone（G 路径）| 整体一次 6-7 周 ship | 早 ship B1 用户早体验 / 不憋大招 / 跟 V1 PRD 敏捷迭代匹配 |
| DR-073 | 2026-05-20 | B2 副窗 16:9 比例 380×214 | 4:3 / 1:1 / 21:9 | 不抢详情卡空间 / 欧洲扁宽地图适合 / PM Q6 选 |
| DR-074 | 2026-05-20 | B2 球面默认中心 = Marx 当前时间地点 | 欧洲固定中心 / 用户手动 | 强叙事 / 时间游标变 → 球面 reorient follow Marx 行迹 |
| DR-075 | 2026-05-20 | B2 动态国界 V1 全连续过渡 | 切片版 4-5 时点 | PM Q4 选 B / 学术严谨 / 视觉丝滑 |
| DR-076 | 2026-05-20 | B2 Stage 1 prototype 先攻技术风险 | 常规 Stage 顺序 | 球面/平面切换 + great circle 跑不通可能影响整 B2 设计 |
| DR-077 | 2026-05-20 | 主/副窗 = 概念角色 / 可互换 | 主图固定 = 观点列表 | PM 关键澄清 / 探索者可把地理图当主 / 1st-class 主图设计 |
| DR-078 | 2026-05-20 | B1 搜索 popover 双形态（探索 + 已知）+ 按 author_id 分组 | flat list 现状 / 独立 /browse 页面 / 现状 + chip filter | PM Stage 2 checkpoint mockup 拍板 / 解探索者"不知道'异化'就搜不到"问题 / Stage 3 工程量 1d → 1.5d / 不破 B1 节奏 |
| DR-079 | 2026-05-20 | B1 搜索美观度 polish 留 Stage 3 实施期 + ship 前 | 现在 brainstorm 设计方向 / 高保真 mockup v2 | PM 反馈"真正用用之后才能找到更合理的方案" / 不凭空想象 / 实施期 frontend-design + ui-ux-pro-max skill 主动调用（AGENTS.md 三件套硬约束） |
| DR-080 | 2026-05-20 | B1 概念命中识别 = 精确匹配 8 chip / 模糊只走 claim 文本 | 部分匹配 / Levenshtein 也算 | PM 接受建议 / 模糊匹配交给 claim text fuzzy / 概念是 curate 名词不应模糊 |
| DR-081 | 2026-05-20 | B1 普鲁东 数据库实存繁体「皮埃爾-約瑟夫·普魯東」/「圣西门」缺 → 替换为「施蒂纳」（麥克斯·施蒂納 / 3 条 claim）| 自建圣西门数据 / 中繁体 normalize | 数据真实优先 / 不为 curate list 自建数据 / 中繁体差异留 V2 normalize backlog |
| DR-082 | 2026-05-21 | B1 outside click listener 用 capture phase（非 bubble）| bubble phase / 拆 main.ts stopPropagation | 主画布 obs/arc click handler 已 stopPropagation 防关详情卡（main.ts line 273/754/816）/ bubble 收不到 / capture 在 target 阶段前不受影响 / 100% 命中 |
| DR-083 | 2026-05-21 | B1 V2 filter chip dropdown（T4.2）砍 / 留 V2 专题设计 backlog | 按 plan 完整做（节点类型 + 关系类型 + 人名）/ 简化版 1-2 chip | (1) 探索形态 chip + § author_id 分组 + § 概念命中段已覆盖筛选场景；(2) B1 数据维度只有「主张 + 作者 + 年份」/ 节点类型 + 关系类型 chip 等 B2 副图数据足才有意义；(3) header 36px 已挤 / 浮窗加 chip 一行视觉吵 / DR-079 polish 留 ship 前；(4) PM "如有更合适筛选方案后面专题设计"|
| DR-084 | 2026-05-21 | B1 详情卡 + arc-popover top:0 → top:54px / 让出 header 工具栏 + outsideHandler 白名单补 header-controls/header-brand/search-result-popover | top 不动 + z-index 调高 header / 详情卡 padding-top:70 留 hole | (1) layout 边界清晰（4 区域 spec § 2.1 原图设计 = header 顶 + 主画布 + 详情卡中右 + timeline 底 / 不重叠）；(2) z-index 方案视觉混乱（详情卡米白背景仍铺到顶遮 header）；(3) M4 写详情卡时 header 还是占位 / B1 Stage 1 header 1st-class 后暴露遗漏；(4) PM 报告：详情卡展开遮挡搜索栏 / 资深 UIUX 视角 = layout 让位优于 z-index 让位 |
| DR-085 | 2026-05-21 | B1 polish · search commit + hover transient 双层状态机 + 3 关联修 | 单层（search 跟 hover 互斥）/ search 不复用 focusSet（不亮 person）/ hover 也不亮 person | PM 反馈 3 issue 一波修：(1) 搜索浮窗 z:20→1100 高于详情卡；(2) obs hover 双层（state 0/1/1+/0+ 状态机 · searchFocusClaimId state · combinedSet 并集 · A1 紫圈+B1 无圈视觉区分）；(3) restoreArcOpacity 内追加 applyTimelineFiltering 清 search obs opacity 残留（M5 timeline filter 是 g.obs opacity 唯一源头不变量被 B1 highlightObs 破了 / 现 systematic 恢复）；派生：clearHoverPreviewFiltering 加 searchFocus guard（详情卡 hover button leave 不丢 search）+ 全局 Esc keydown listener（state1 时 popover 已关 Esc 监听 detach / 补全局）；focus mode + search 同存 corner case 留 backlog 不本次解 |
| DR-086 | 2026-05-21 | B1 polish · search onSelect 直达详情卡（dispatch obs click + re-apply highlightObs） | inline 复制 obs click 流程（duplicate ~60 行 + computeFlyTransform 是 sectionG.each 闭包局部不可外部用 / ReferenceError 被吞）/ 抽 helper 重构 obs click（risk 中 / 改既有逻辑） | PM 反馈：搜索栏点击具体主张时应同时展开详情卡（已经算用户想看 detail）；方案：dispatch obs click event 复用既有 obs click handler 完整流程（hideArcPopover+restoreArcOpacity+flyTo+showClaimPopover）+ 立即 highlightObs re-apply（obs click 内 restoreArcOpacity 清的 search state）；视觉无闪（同帧 paint 取 highlightObs final state）；改动 ~10 行 / 0 risk · 0 duplicate code |
| DR-087 | 2026-05-21 | B1 polish · obs click 选中 visual indicator = 紫圈 stroke + **obs-text 加粗**（不淡显其他） | X2 紫圈+全 fade（跟 search 完全一样 / 太重）/ X3 紫色 ring 区分 search（用户记两套规则）/ X4 caret 指示器（跟 paper editorial 风不符）/ 仅加粗不变色（深灰）vs 加粗+变紫 | PM 反馈：obs click 后画布无 visual indicator / 用户视线回画布找不到选中的；资深 UIUX = commit selection 标准做法；方案 X1：紫圈（米白 #fcfaf6 sw=2 r=5）+ obs-text font-weight:700 加粗（保深灰 #2a2a2a · PM 选 A 仅加粗不变色 / 克制 editorial 风）·不淡显其他（跟 search 区分：search 还 fade）；视觉一致 = 搜索选定 + obs click 选定共用紫圈+加粗（用户大脑只记一个规则"紫圈+粗 = 当前选中"）；何时清：详情卡关 5 路径（A 点空白 + B × 按钮 + C Esc + D 点另一 obs 切换 + E 搜索栏选另一条）/ 派生：claim-popover.ts ClaimPopoverContext 加 onClose callback · hideClaimPopover 调 _onCloseCallback / main.ts 传 onClose=restoreArcOpacity wire 关详情卡时清 visual / restoreArcOpacity 内追加清 obs-text font-weight · highlightObs 同步加粗（DR-086 一致性）；hover 时紫圈+加粗保留（PM Q2 A · transient 跟 commit 解耦） |
| DR-088~096 | 2026-05-21 | B1 polish 阶段 9 决策（DR-088 revert / D1+B5+B3+B4+D9+B6+D2 全 PM 留 / B2 letter-spacing 撤改 B6）| 详见 [docs/2026-05-21-m-b1-takeaway.md § 8](../docs/2026-05-21-m-b1-takeaway.md#8-polish-阶段-7-batch-收尾dr-088096--2026-05-21-晚) | M-B1 polish 7 batch 全 ship · Bundle 34.58 KB / Tests 276+4 E2E / Design A · tag `m-b1-final` |
| **DR-097** | **2026-05-21** | **B2 启动 (A+) 路径 · 直接进 writing-plans + 加 Stage 0 数据可达性验证**（0.5 天 · 中国大陆网络硬约束）| (A) 纯直接进 plan / (B) re-validate spec / (C) brainstorm placeholder / (D) 重审 V1 | **第一性原理**：B2 真风险是技术 #1（球面+平面+great circle）+ 数据 #2（国外 GeoJSON 可达）/ brainstorm 解不了 / 必须 prototype + 数据测试；设计 #3 已 95% brainstorm done（spec § 4）/ § 7 placeholder 留 Stage PM checkpoint 实测决（M5 lesson 实测必要 vs 凭空想）；避免 vision drift（M4 lesson · 离 PRD/spec 越远越易 drift）；早 ship 早 feedback（PRD 敏捷精神 · B2 5-6 周已长）；(+) Stage 0 来自 user_environment_china_network memory · 国外 endpoint 5 周后才发现拉不下来 = 灾难性 / 0.5 天前置 = 高 ROI |
| **DR-098** | 2026-05-21 | Stage 0 数据可达性验证完成 · 推荐 V1 用 jsdelivr world-atlas TopoJSON（38 KB 当代国界占位）| Euratlas 子页 404 / HGIS 探索高 / OSM Historical DNS fail / Naturalearthdata 当代 | 4 主源全 fail 1818-1883 真历史 / world-atlas jsdelivr 国内 0.57s 极稳定 / 38 KB safe Bundle · **被 DR-099 升级取代** |
| **DR-099** | **2026-05-22** | **B2 历史国界 V1 = CShapes-Europe**（1816-2023 / 322 features / 70 Marx-era states · CC BY-NC-SA 4.0）· **升级取代 DR-098** | (1) cshapes 升级 / (2) 谈 concerns 后定 / (3) 退 world-atlas 当代 / (4) 重审 spec § 4.7 | PM 2026-05-22 拍 (B) Stage 0+ cshapes spike · 100% 成功（预期 5% Branch A 命中）/ ETH Zurich 同站有 CShapes-Europe 欧洲专版 1816-2023 / 完全覆盖 Marx 时代 / 国内直连可达 / 180/322 features overlap Marx 1818-1883 (56%) / 含 1871 德意志统一精准捕捉（56→23 states）/ 体积 4.36 MB raw / 891 KB gzip · 按需 fetch 不进 main bundle / Stage 1+ build-time 过滤 ~480 KB / Stage 2 mapshaper simplify ~200-300 KB / 3 concerns 可控（License ShareAlike 加 1 句署名 / 891 KB 首屏 V1+ 优化 / i18n 70 states 映射 +1-2h Stage 1）/ 守 spec § 4.7 原 vision · 第一性原理：spike 大赢 deserve commitment |

---

## 11. 跨窗口续接简单确认句

> "我在续接 Marx · M-B 主线 / B brainstorm + Phase 0 已完成 + Phase 1 spec 草案已写 / 等 PM review / 读 specs/2026-05-20-m-b-mainline-design.md + docs/2026-05-20-b-mainline-brainstorm-decisions.md"
