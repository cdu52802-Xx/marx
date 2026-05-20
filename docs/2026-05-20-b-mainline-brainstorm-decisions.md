# Marx M-B 主线 brainstorm 决策落档（2026-05-20）

> **状态**：brainstorm 完成 / PM 拍板 G 路径 / 进入 Phase 0 backlog 清理
> **关联**：
> - [M5 takeaway 2026-05-19](./2026-05-19-m5-linea-takeaway.md)
> - [M5 续接 anchor 2026-05-19](./2026-05-19-m5-a-complete-b-pending-anchor.md)
> - [用户访谈包 2026-05-06](./2026-05-06-brainstorming-用户访谈包.md)
> - [PRD V1](./PRD.md)
> - [M5 spec § 2.2 衔接预留](../specs/2026-05-14-m5-linea-explorability-design.md)
> - [DR-069 弧线误选专项 spec](../specs/2026-05-19-dr-069-arc-misselect-fix.md)

---

## 1. brainstorm 总结

8 轮 brainstorm + v1-v5 mockup 进化 / 覆盖 B 主线 3 sub-feature 范围 + 视觉风格 + 大方向。继续问细节边际收益递减 → 转入 spec → 实施期分阶段验证。

**Visual companion screens**（落档参考）：
- 01-b-mainline-start · Q1 起点选择 (PM 选 A 副窗地理图)
- 02-narrative-scope · Q2 V1 范围 (PM 选 B = ①+②+③ 原则)
- 03-catalog-waiting · Q3 完整 17 元素 catalog
- 04-hero-pip · Q5 hero mockup v1 (浮窗 / 被 PM 否决)
- 05-hero-pip-v2 · Q6 v2 (固定右下栏 / 4:3)
- 06-hero-pip-v3 · v3 (16:9 扁化 + 去内部时间轴)
- 07-hero-main-canvas · v4 (地理图作主画布 / 1st-class)
- 08-hero-v5-legend-globe · v5 (新图例 + 缩放谱系球面/平面)

---

## 2. B 主线范围（PRD V1 § 4 + M5 spec § 2.2.2 + PM brainstorm 决策）

### B 主线 = 3 sub-feature（PM 拍板 · 拆 B1/B2/B3 独立 milestone）

| Milestone | 内容 | 估时 |
|---|---|---|
| **B1 · header 重组** | 顶部 brand + 搜索 + 关于 / 致谢 link 重新设计 + 跨图搜索（PRD V1 必做） | 1 周 |
| **B2 · 副窗地理图** | 最大头 / 球面+平面 / 86 节点 / 动态国界 / 迁徙 + 联动 + 互换 | 5-6 周 |
| **B3 · mobile responsive** | 手机 / 平板适配 + 整合 3 mobile backlog | 1 周 |

**总工期** ~7-8 周（含 Phase 0 backlog 2-3 天 + Phase 1 spec 0.5 天）。

---

## 3. B2 副窗地理图 17 元素 V1 scope

### A. 节点（5 类 · V1 default 紫橙灰 ~86 节点）

| # | 元素 | V1 状态 |
|---|---|---|
| 1 | 人 (紫 ~50 / main_location_lat_lng) | ✅ V1 |
| 2 | 事件 (橙 ~30 / location_lat_lng) | ✅ V1 |
| 3 | 地点 (灰 ~6 / lat_lng / 特里尔/波恩/柏林/巴黎/布鲁塞尔/伦敦) | ✅ V1 |
| 4 | 著作 (蓝 ~20 / writing_location_lat_lng) | ❌ V2 checkbox（PM ack 不升 V1） |
| 5 | 概念 (绿 ~15 / first_proposed_location_lat_lng) | ❌ V3+ checkbox |

### B. 关系连线 / 轨迹

| # | 元素 | V1 状态 |
|---|---|---|
| 6 | 8 类关系连线（核心 3-5 类 / 实施期 PM checkpoint 拍板） | ✅ V1 · 实施期细化 |
| 7 | 迁徙轨迹（人 × 时间 × 地点序列 / 已走实线 / 未来虚线） | ✅ V1 |

### C. 时空叙事

| # | 元素 | V1 状态 |
|---|---|---|
| 8 | 共享时间轴（1818-1883 / 4 阶段标记 / 主图复用） | ✅ V1 |
| 9 | 思想扩散波 | ❌ V2+ |

### D. 共享基础设施

| # | 元素 | V1 状态 |
|---|---|---|
| 10 | 节点详情卡 panel（主图复用） | ✅ V1 |
| 11 | 悬浮 tooltip | ✅ V1 |
| 12 | 跨图搜索 / 筛选（B1 实施） | ✅ V1 |
| 13 | 缩放 + 平移（主图复用 + 球面/平面投影切换） | ✅ V1 |
| 14 | 主副互换（↔ 按钮） | ✅ V1 |
| 15 | **主副图联动**（主图选 obs → 副图自动高亮当时人/地/事 + 反向） | ✅ V1 ⭐ |

### E. 视觉 / 待定

| # | 元素 | V1 状态 |
|---|---|---|
| 16 | 欧洲底图 | ✅ V1 **全连续动态历史国界**（PM 选 B） |
| 17 | 聚合 / 重叠处理 | ✅ V1 · 实施期决 |

---

## 4. ⭐⭐⭐ 关键澄清：主/副窗 = 概念 / 不是固定角色

PM 关键澄清：
- **学者用户**：观点列表=主 / 地理图=副（默认 / PRD V1 主目标）
- **探索者/爱好者**：**地理图=主 / 观点列表=副**
- **⇄ 互换** = 用户根据使用模式自由选择主图角色 / 不是偶尔切换
- **地理图作为主画布**时 = 1st-class 主图 / 跟观点列表同等精雕细琢
- **设计原则**：副图（画中画）= 主图的"信息密度低"版本 / 同源不同密度 / 不是不同两图

---

## 5. 视觉风格（100% 沿用 M5 主线 A · M4 spec § 4）

- **配色**：米白 `#fcfaf6` / 墨黑 `#1a1a1a` `#2a2a2a` / 紫 `#5b3a8c` / 沙石灰金 `#d8cab0`
- **字体**：EB Garamond + Playfair Display italic + Source Serif 4 + Noto Serif SC
- **装饰**：§ 分节符（非 emoji） / 0 border-radius（学术编辑硬约束）
- **阴影**：paper-shadow `box-shadow: -4px 0 18px rgba(58,35,96,0.10)`
- **边框**：1px 沙石灰金 border-left

---

## 6. 副窗 layout（v3 mockup approved）

- **position**: fixed right:0 bottom:60
- **width**: 380px（跟详情卡 code 实际同宽 / spec 写 400 不准）
- **height**: 214px（**16:9 比例**）
- 视觉框 = 详情卡视觉系一致（border + paper-shadow + 米白）
- **标题栏**: "§ 地理图 · YYYY 地名"（如 "§ 地理图 · 1843 巴黎"）+ "↔ 互换" 12px 灰
- **不画副图内时间游标**（PM 反馈 / 冗余 / 用户只在外部主 timeline 操作）
- **详情卡 layout 调整**：top:0 / bottom: 60+214 = **274**（让出副图位置）
- **互换按钮**视觉 → backlog 后期统筹调（现 mockup "↔ 互换" 文字暂占位）

---

## 7. 地理图主画布详细元素（v4 mockup approved）

### 元素清单

- **欧洲底图**: ~13 国 / 1843 国界示意（德意志邦联 + 意大利诸国虚线表示未统一） / 时间游标拖动时国界**全连续过渡**
- **86 节点完整**: 紫人 50 + 橙事件 30 + 灰地点 6 / 当前 active 节点紫圈高亮
- **迁徙轨迹**: 已走过实线（特里尔→波恩→柏林→巴黎）+ 未来虚线（→布鲁塞尔→伦敦） / 时间 forward 时实线段延长
- **关系连线**: 核心 3-5 类 / 颜色区分 / 跨地点经纬度连接（球面 = 大圆弧 / 平面 = 投影曲线）
- **当前时点 indicator**: 左上 "§ YYYY · 地点 · N 节点 active"
- **hover tooltip**: 节点名（中+原文）+ 1 行核心（地点 / 时段 / 关系）
- **详情卡 active state**: 右上 380×190 / 跟现状详情卡完全同视觉 / bio 事件式 + 引用源
- **副窗观点列表**: 右下 380×214 / 信息密度低版本（简化半圆弧 + active 联动）
- **↔ 互换按钮**: 副窗右上 / 切回学者模式

---

## 8. 缩放谱系球面/平面（v5 mockup approved + Q8 PM 反馈 ack）

### 投影技术

- **球面 view**（小 zoom）：D3 `geoOrthographic()` / 看到整个地球 / 欧洲微观
- **平面 view**（大 zoom）：D3 `geoMercator()` 或 `geoAlbers()` / 详细国界
- **平滑过渡**：d3.zoom 整合 / 按 zoom level 内插 projection 参数 / 无 jump

### 关键 brainstorm 决策

- **关系连线在球面** = great circle 大圆弧（贴球面曲线）/ 不是直线
- **关系连线在平面** = 投影曲线（仍非直线 / 跟随经纬度）
- **球面默认中心** = **Marx 当前时间所在地点** ⭐（时间游标变 → 球面 reorient / 学者拖时间游标时球面自动 follow Marx 行迹）
- **球面可旋转** ⭐（D3 drag 标准能力 / 用户自由探索）
- **缩放过渡保留中间状态** ⭐（半球 view 不仅过渡 / 是可停留视图）
- **临界 zoom 阈值**：借鉴各大工具 + 实际效果微调（实施期决）

### 工作量

- D3 投影切换 + 大圆弧 + 平滑过渡：**+1.5-2 周**（折算入 B2 5-6 周）

---

## 9. 图例 panel 设计（v5 mockup approved）

- **位置**: 左下角 fixed
- **尺寸**: ~160 × 220px
- **视觉**: paper 风格（详情卡视觉系一致 / 1px 沙石灰金 border / paper-shadow）
- **分组**:
  - § 关系类型 · 朋友(绿)/师承(紫)/论敌(红虚)/参与事件(橙虚)
  - § 迁徙轨迹 · 已走过 / 未来
- **颜色编码**:
  - 朋友 `#5d8a5c` / 师承 `#5b3a8c` / 论敌 `#c24a3e` / 参与 `#cc6633` / 迁徙 `#5b3a8c`

---

## 10. 关系连线 V1 范围（核心 3-5 类 · 实施期 PM checkpoint 拍板）

V1 地图能画的 6 候选（节点都需地理化）：

| 候选 | 描述 |
|---|---|
| 师承 (人-人) | 黑格尔 → 马克思 |
| 论敌 (人-人) | 蒲鲁东 / 巴枯宁 vs 马克思 |
| 朋友 (人-人) | 马恩 |
| 影响 (人-人) | 跨代影响 |
| 居住 (人-地点) | Marx 6 居住地 |
| 参与事件 (人-事件) | 1848 革命 / 1864 第一国际 / 1871 公社 |

排除：作者（人-著作）/ 提出概念（人-概念）— 因为著作/概念 V1 不渲染。

---

## 11. 历史国界（PM 选 B / 全连续）

- V1 = **全连续动态历史国界**（拖时间轴时国界平滑变化）
- 数据源候选：Euratlas / HGIS Datasets / OpenStreetMap Historical / 学术 GeoJSON / 必要时自建
- 工作量：+1.3-1.7 周（折算入 B2 5-6 周）
- 学术参考：D3 Observable / Tom MacWright / Yan Holtz

---

## 12. 实施期细化（不在 brainstorm 阶段拍死 / Stage PM checkpoint）

以下点 brainstorm 留 placeholder · 实施 Stage PM checkpoint 决：

- 节点 5 色 / size / 名字标签策略（直接附 vs hover vs 混合）
- 关系连线粗细 / 方向箭头
- 86 节点聚合 / 重叠处理（同地多 marker / cluster 策略）
- 主副状态切换动画 timing + transition
- 球面拖旋转交互细节（双击重置中心 / 手势 inertia / 边界）
- 国界过渡动画 timing（拖时间游标速度跟国界变化耦合）
- 临界 zoom 阈值（球面 vs 半球 vs 平面切换点）
- ⇄ 互换按钮视觉风格（现 mockup 用 "↔ 互换" 文字暂占）

---

## 13. 战略路径 G 拍板（PM 2026-05-20）

PM 拍板 4 个决策：

1. **G 路径**：分批装修 / 先补旧问题 / 早用早爽（vs G' 不分批 / G'' 跳 spec）
2. **B 拆 B1/B2/B3**：3 独立 milestone（vs 整体一次性）
3. **优先清 backlog**：DR-069 + Bundle 2-3 天清完 M5 漂亮收尾（vs 推到 B 之后）
4. **Stage 1 prototype 先**：B2 副窗地理图最大技术风险（球面+平面+great circle）先 1-2 周做 prototype 验证（vs 常规阶段）

---

## 14. 下一步执行 plan

### Phase 0 · 已完成（2026-05-20 当日完成 / 不到 1 天）

#### 任务 1 · DR-069 弧线误选 bug · PM 决策 A+D（不强攻）

读 src/main.ts + spec 后**重新评估发现** spec § 4.1 攻法**算法上无效**：

- spec § 4.1 说"改用 visible stroke 几何 / 不用 hit overlay 几何"
- 实际：visible arc-layer (line 204-229) 跟 hit arc-hit-layer (line 234-244) path 形状 1:1 完全相同（都用 `generateArcPath(s.x, s.y-3, t.x, t.y-3, r.type)`）
- 算法几何距离基于 path 形状（`SVGPathElement.getPointAtLength`）/ 跟 stroke 粗细无关
- 改 querySelector 等于不改 / 算法结果完全相同

**真根因 RC11**：同色弧（如两条红"反对"弧）visible stroke **视觉重叠** / 用户视觉自己分不清 / 算法只能猜 / 50% 概率选错。这不是算法 bug / 是信息歧义本质问题。

**4 攻法重新对比 → PM 选 A+D**：

| 攻法 | 描述 | 真解? | 决策 |
|---|---|---|---|
| A · 接受现状 | R5 hover label + endpoint 黄边 已 ship 实战 UX 兜底 / 用户 hover 看错可移开避免 commit | ❌ 但用户避免误 commit | ✅ PM 选 |
| B · § 4.2 cluster disambig UI | 同 cursor 16px 内 2+ candidates 弹候选 list / 用户显式选 | ✅ 真解 / 1-2 天工程 | PM 未选（边际 ROI 低 / B 主线可能 layout 重设计） |
| C · hover sticky 加强 | 鼠标先碰到锁定 / 不漂移 | ⚠ 部分 | PM 未选 |
| D · 推 B 主线统筹 | 5-6 周内可能弧线整体改设计 / 现在花时间修可能白做 | 暂搁 | ✅ PM 选 |

**DR-069 backlog 转入 B 主线待办** · 关联 spec § 8 PM 决策附 / takeaway § 3.1 状态升级。

#### 任务 2 · Bundle 减肥 ✅ 完成

**实施**：vite `?url` import + top-level await fetch

- `src/main.ts` line 20-21: `import claimsData from './data/claims.json'` → `import claimsUrl from './data/claims.json?url'`（同 nodes_skeleton.json）
- `src/main.ts` line 48-54: 同步 const → async `Promise.all([fetch...])` top-level await + cast
- vite 自动 copy JSON 到 `dist/assets/claims-*.json` + `nodes_skeleton-*.json` / bundle 不嵌入
- scripts/ 路径 src/data/ 不破坏（保留输入输出位置 / 仅产品 bundle 不嵌入）

**结果**：

| 维度 | Before (M5 ship) | After (Phase 0) | Δ |
|---|---|---|---|
| JS bundle gzip | 47.04 KB（+1.5% over warning） | **30.83 KB** | **-34.5%** |
| 跨 warning (47.47 KB) | +1.5% over | **-35% safe** | ✅ 跨过 |
| Total transfer | ~48 KB | ~51 KB（含 2 个 JSON asset） | +6%（HTTP 多 2 请求 / 但 JSON 独立 cache） |
| modules transformed | 189 | 189 | 不变 |
| Tests | 166/169 | 166/169 | ✅ baseline |
| Lint | 0 | 0 | ✅ |
| E2E (m5-linea-zoom) | 6/6 | 6/6 | ✅ |

**落档**：DR-071。

### Phase 0 总结

- 实际 1 天完成（DR-069 重新评估 + Bundle 减肥 + doc 更新）
- M5 漂亮收尾 · bundle 安全跨过 warning
- DR-069 推 B 主线统筹（hover label 兜底已实战 UX）

### Phase 1 · 0.5 天 / B 整体 spec 草案

- AI 写 `specs/2026-05-XX-b-mainline-design.md`
- 涵盖 B1/B2/B3 + 本文件 § 1-13 brainstorm 决策 + § 12 标记"实施期细化"待定点
- PM review（半小时）→ 调整 → 锁定 v1

### Phase 2 · 1 周 / B1 header 重组

- 顶部 brand + 搜索 + 关于 / 致谢 link
- 跨图搜索 PRD V1 必做（搜索词主+副两图同时高亮）
- 5 Stage 类似 M5 节奏 / PM checkpoint
- ship

### Phase 3 · 5-6 周 / B2 副窗地理图

- **Stage 1 · 1-2 周 prototype** ⭐ — 球面/平面/great circle 试水 / 最大技术风险先验证
  - 出 spike prototype / 跑给 PM 看
  - 根据效果 brainstorm 临界 zoom / 中心 / 旋转 细节
- **Stage 2 · 1 周** — 86 节点完整渲染 + 关系连线 V1 核心 3-5 类
- **Stage 3 · 1 周** — 详情卡 + 主副联动 + 互换
- **Stage 4 · 1-1.5 周** — 时间轴动态国界 + 迁徙轨迹
- **Stage 5 · 0.5-1 周** — 副窗（地理图当副 / 380×214 16:9 信息密度低版）
- ship

### Phase 4 · 1 周 / B3 mobile responsive

- 整站 breakpoint 适配 / 手机 + 平板
- 整合 3 mobile backlog：
  - B3 mobile popover 5px overflow
  - B4 tablet sidebar 跟 timeline 撞
  - Focus popover 关后焦点回中心
- ship

---

## 15. 跨窗口续接简单确认句

> "我在续接 Marx · B 主线 brainstorm 已完成 / G 路径 / Phase 0 backlog 清理中（DR-069 + Bundle）/ 读 docs/2026-05-20-b-mainline-brainstorm-decisions.md"
