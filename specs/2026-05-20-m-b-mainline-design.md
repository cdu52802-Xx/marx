# Marx M-B 主线设计文档 · 页面框架 + 副窗地理图 + mobile

> **状态**：草案 v1（2026-05-20）/ Phase 1 spec / 等 PM review
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

### 3.2 视觉规范

| 元素 | 规范 |
|---|---|
| header bg | `#1a1a1a` (墨黑) |
| brand 字体 | Playfair Display italic 15px |
| brand 颜色 | `#fcfaf6` (米白) |
| 搜索框 bg | `#fcfaf6` + 1px 沙石灰金 border |
| 搜索框 font | EB Garamond 13px |
| link 字体 | EB Garamond italic 12px |
| link 颜色 | `#fcfaf6` opacity 0.7 |
| layout | brand 左 / 搜索中 / link 右 / 0 border-radius |

### 3.3 搜索功能（核心）

- **实时搜索**（debounce 200ms · 不卡）
- **搜索目标**：节点名（中+原文）/ claim text / 事件名 / 地点名
- **结果浮窗**：下拉候选 list（max 8 个 / paper 风格 / 详情卡同视觉系）
- **高亮联动**：选中候选 → 主图 highlight + 副图 highlight（B2 时启用 hook）
- **筛选 chip**：搜索框右侧 dropdown / 限定节点类型（人/事件/地点/概念/著作）+ 关系类型（8 类）
- **键盘导航**：↑↓ 选 / Enter 确认 / Esc 关

### 3.4 Stage 划分（5 stage）

| Stage | 内容 | 估时 | PM checkpoint |
|---|---|---|---|
| 1 | header layout 重组（brand 字号 / link 位置 / 互换按钮预留位） | 1 天 | ✓ |
| 2 | 搜索 UI（输入框 + 下拉浮窗 + paper 风格） | 1.5 天 | ✓ |
| 3 | 搜索逻辑（debounce + 多目标 match + 候选 list） | 1 天 | ✓ |
| 4 | 主图高亮 logic（主图 obs 高亮 / fade 其他）+ filter chip | 1 天 | ✓ |
| 5 | E2E + 4 件套 baseline + ship | 0.5 天 | ✓ ship |

**B2 hook 预留**：副图高亮 logic 接 B2 实施期实现（B1 期间 dom event 触发 / B2 时 listener 接收）。

### 3.5 文件结构

| 文件 | 类型 | 内容 |
|---|---|---|
| `src/components/header.ts` | NEW | header layout + 主副互换按钮占位 |
| `src/components/search.ts` | NEW | 搜索输入 + 下拉浮窗 + debounce |
| `src/components/search-result-popover.ts` | NEW | 候选 list paper 风格 |
| `src/lib/search-index.ts` | NEW | 多目标 fuzzy match logic |
| `src/main.ts` | MOD | 挂载 header + search · 接 主图 highlight hook |
| `src/styles.css` | MOD | header + search 视觉 |

### 3.6 Acceptance（B1 ship 验收）

- [ ] header 视觉跟 M5 主线 A 沿用一致（米白 + 墨黑 + 紫 / 0 border-radius / 0 AI slop）
- [ ] 搜索框打字实时显示候选 list（< 200ms debounce）
- [ ] 选中候选 → 主图 obs 紫圈高亮 + fade 其他
- [ ] 搜索框 + 候选 list 跟 zoom 解耦（屏幕 fixed 大小）
- [ ] 4 件套 baseline 不退化（Health ≥ 9 / Design ≥ A- / QA ≥ 96 / AI Slop A）
- [ ] Bundle gzip 不超 35 KB（Phase 0 baseline 30.83 + B1 ≤ 5 KB 预算）
- [ ] E2E 新加 3 spec（搜索打字 / 候选选择 / Esc 关）pass

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

### 4.7 动态历史国界（V1 全连续过渡 · PM 选 B）

- V1 = 全连续动态（不是切片）/ 拖时间游标时国界平滑变化
- 1818-1883 间欧洲国界大变：拿破仑后 / 1848 革命 / 1871 德意志统一 / 1883
- 数据源候选：Euratlas / HGIS Datasets / OpenStreetMap Historical / 学术 GeoJSON
- 必要时 Stage 4 自建（PM checkpoint）
- 学术参考：D3 Observable / Tom MacWright / Yan Holtz

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

### 4.10 Stage 划分（7 stage）

| Stage | 内容 | 估时 | PM checkpoint |
|---|---|---|---|
| **1** ⭐ | **prototype** · 球面+平面+great circle 投影切换试水（最大技术风险先攻） | 1-2 周 | ✓ 必拍板 |
| 2 | 86 节点完整渲染 + 关系连线 V1 核心 3-5 类（PM 从 6 候选拍板）| 1 周 | ✓ |
| 3 | 详情卡 + 主副联动 + 互换 + 状态切换动画 | 1 周 | ✓ |
| 4 | 时间轴动态国界（GeoJSON 找/自建）+ 迁徙轨迹 | 1-1.5 周 | ✓ |
| 5 | 副窗（地理图当副 380×214 16:9 信息密度低版）| 0.5-1 周 | ✓ |
| 6 | 图例 panel + tooltip + 球面旋转手势 + polish | 0.5 周 | ✓ |
| 7 | E2E + benchmark + 4 件套 baseline + ship | 0.5 周 | ✓ ship |

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

---

## 11. 跨窗口续接简单确认句

> "我在续接 Marx · M-B 主线 / B brainstorm + Phase 0 已完成 + Phase 1 spec 草案已写 / 等 PM review / 读 specs/2026-05-20-m-b-mainline-design.md + docs/2026-05-20-b-mainline-brainstorm-decisions.md"
