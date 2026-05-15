# Marx 思想史 · M5 主线 A · 可探索基础设施 Design Doc · v1

> **状态**：v1 · brainstorming 第 6 步产出（2026-05-14 PM 完成 Q1-Q5 全部拍板）
> **触发**：M4 closure + go M5（PM 2026-05-13 切窗口前发起）+ brainstorming Q1-Q5 拍板
> **本 milestone 范围**：M5 三主线（A 可探索 / B 页面框架 + 地理图 / C 多类型详情页）中**仅 A**，单线启动（lesson 3 防 subagent 拆太碎）
> **关联**：
> - M4 spec：[`specs/2026-05-11-m4-claim-timeline-design.md`](./2026-05-11-m4-claim-timeline-design.md)
> - M4 takeaway：[`docs/2026-05-13-m4-takeaway.md`](../docs/2026-05-13-m4-takeaway.md) ⭐ M5 输入 SSOT
> - M4 closure 4 件套 SUMMARY：[`docs/m4-closure-reviews/SUMMARY.md`](../docs/m4-closure-reviews/SUMMARY.md)
> - PRD V1：[`docs/PRD.md`](../docs/PRD.md)
> - AGENTS.md 视觉三件套硬约束 + 全局元约束

---

## 1. Context · M4 → M5 起点

**M4 收尾状态**（2026-05-13）：
- demo 在线 / 92 ClaimNode + 31 ClaimRelation / claim-on-timeline 形态 / git tag `m4-final`
- 测试 106/109 / Option A 修完 5 项（health 6.0→8.5+ / QA 90→95+ / Design B+→A-）
- PRD V1 覆盖率 ~30-40%（地理图 / 缩放平移 / 跨图搜索 / 多类型详情 / bio 全留 M5+）

**M5 主线 A 启动触发**：M4 demo 当前是"**看的**"不是"**探的**"——92 节点静态铺开 + 1840-1880 拥挤区看不清 + 时间轴跟画布关联弱。PM 意见 1+7+2+4 全部指向"可探索性"短板。

**brainstorm Q1-Q5 全部拍板**（2026-05-14 PM 完成）：
- Q1 主线优先 = A 可探索基础设施
- Q2 时间轴 ↔ 画布 = B 双向锁定（操作简化为单游标 + 视觉范围条）
- Q3 点 obs 行为 = A 同时放大居中 + 详情卡
- Q4 小决策（zoom 1×–8× / pan clamp / 重置双击中键+⌂ / 点弧线 / Esc=关详情卡）
- Q5 综合形态（sidebar / 详情卡 fixed 不跟 zoom · 缩放控件**左下** · 右上**预留**给主线 B · 半圆弧 obs↔obs 含义不变）

---

## 2. 整体形态决策

### 2.1 M5 主线 A 范围（Q1 brainstorm 已定）

**Yes · 必做**：
- ✅ 画布缩放（zoom 1×–8×）+ 平移（pan）
- ✅ 时间轴 ↔ 画布双向锁定（单游标拖动 = 画布 pan · 滚轮缩放画布 = 视觉范围条同步收窄）
- ✅ 点 obs → 同时放大居中 + 详情卡滑入
- ✅ 点弧线 → 两端 obs 圆点同时居中 + 弧线高亮 + tooltip 关系类型
- ✅ 时间轴改造：删 M4 input range slider / 改为时间轴本身可拖游标 + 视觉范围条
- ✅ 缩放控件挪到**左下**（M4 无 / M5 新加）
- ✅ ▶ 播放按钮保留并简化：游标自动从 1770 → 1950 + 画布同步飞行

**No · 不做（明确边界）**：
- ❌ 顶部 header（已在 M4 closure Option A 加 / M5 主线 A 不动）
- ❌ 搜索栏 / 跨图搜索 → M5 主线 B 范围
- ❌ 地理图副视图 / mini-map → M5 主线 B 范围
- ❌ person / work / concept 多类型详情页 → M5 主线 C 范围
- ❌ Mobile responsive → M4 4 件套决策 1 已表态推 M5 主线 B 范围 / 主线 A 仅 desktop
- ❌ 多语言 / BYOK 对话 / 笔记 → PRD V1 明确 V2+
- ❌ 后来者发展旁注 → M5 主线 C 范围（concept 详情卡里）
- ❌ 8 类关系连线 → M4 vision pivot 后已改 2 元 claim 关系（PRD 跟随 / 不回退）

### 2.2 主线 A → 主线 B / C 衔接预留

**核心原则**：主线 A 是 zoom/pan/时间轴改造（交互层）/ 不占用 B/C 将来要用的区域 / 不引入会跟 B/C 冲突的数据 schema。

#### 2.2.1 4 区域归属 + 副窗位置（一图说清）

```
┌──────────────────────────────────────────────────────────────┐
│ [Marx · 思想史]                  [搜索 / 关于] ← 主线 B 右上 │
├─┬───────────────────────────────────────┬─────────────────┤
│s│ 主画布 (zoom + pan + 时间轴双向锁定)  │ 详情卡 (M4)     │
│i│                                       │ 主线 C polish   │
│d│ ← 主线 A 改造                         │                 │
│e│                                       │ ┌─────────────┐ │
│b│                                       │ │地理图副窗   │ │  ⭐ 副窗
│a│ [+]                                   │ │主线 B 右下  │ │  ≤20% 屏幕
│r│ [2.5×]                                │ │~86 人/事/地  │ │  画中画
│ │ [−]                                   │ └─────────────┘ │  PRD V1 silent
│ │ [⌂] ← 主线 A 左下                     │                 │  drift catch
├─┴───────────────────────────────────────┴─────────────────┤
│ [▶]  1770 ────●────────────── 1950  ← 时间轴 (主线 A)     │
└──────────────────────────────────────────────────────────┘
```

| 区域 | 主线 A 是否动 | 谁来填 |
|---|---|---|
| header | ❌ 不动（M4 已实现）| 主线 B 重组 brand + search |
| 右上区域 | ❌ 不放任何 fixed widget | 主线 B 搜索 / 关于 / brand |
| 主画布 (zoom + pan) | ✅ 主线 A 核心改造 | — |
| 左下缩放控件 | ✅ 主线 A 新加 | — |
| 底部时间轴 | ✅ 主线 A 改造（单游标 + 范围条 + ▶ 播放）| — |
| 详情卡 | ⚠ 主线 A 微调（宽度 400px + Esc 关）| 主线 C 多类型详情页改造 |
| **右下副窗（地理图）⭐** | **❌ 主线 A 不做** | **主线 B 必做（PRD V1 silent drift catch）** |
| 左 sidebar | ❌ 不动（M4 已实现）| — |

#### 2.2.2 M5 主线 B / C 排队 preview（防 silent drift）

**主线 B · 页面框架 + 地理图副视图**（主线 A 完成后启动）：
- 顶部 header 重组（brand + 搜索栏 + 关于 / 致谢链接）
- **右下副窗地理图**（PRD V1 § 4 副图画中画 ≤20% 屏幕）：~86 人 / 事件 / 地点节点 + 欧洲底图 + 共享时间轴跟主图同步 + 点副图标题栏 = 主副互换
- mobile responsive（M4 4 件套决策 1 推 M5 / 主线 B 范围）
- 估 2-2.5 周 / 启动时单独 brainstorm + spec

**主线 C · 多类型详情页系统**（主线 B 完成后启动）：
- person / work / concept tag 单击 → 各自类型详情页
- person bio 事件式（PRD V1 必做 / M5 主线 A 已在详情卡 § 7.3 实施）
- 12 个核心 concept 详情卡加"后来者发展旁注"（PRD V1 必做 / M3 阶段 C 收尾）
- 估 2-3 周 / 启动时单独 brainstorm + spec

**为啥这个顺序**：A 提供 zoom 基础设施 → B 复用 zoom 做副窗（副窗本质 = 第二个 zoomable canvas）→ C 在 B 框架内填多类型内容。**A 是 B/C 基础 / 不能颠倒**。

#### 2.2.3 其他衔接预留

- **header / footer 不动**：M4 closure Option A 已加 app title header + 右上致谢 footer / M5 主线 A 保持现状 / 主线 B 时重组
- **数据 schema 不动**：复用 M4 ClaimNode + ClaimRelation / 不引入新 type / 主线 B 时加 PersonNode / WorkNode / EventNode 地理字段（PRD V1 已预留）

---

## 3. PRD trace · 主线 A 解决哪些 V1 必做项

| PRD V1 必做项 | M4 状态 | M5 主线 A 处理 |
|---|---|---|
| **缩放 + 平移 1×–8×** | ❌ 未实现 | ✅ **主线 A 核心 · 必做** |
| **共享时间轴 1818–1883** | ⚠ M4 1770-1950 + Marx 区间 indicator | ✅ 时间轴改造保留 / 单游标 + 视觉范围条 |
| **节点详情卡 panel** | ✅ M4 T9 已实现 ClaimNode 详情卡 | ⚠ M5 主线 A 适配 zoom（fixed 不跟 zoom）/ person/work/concept 详情留主线 C |
| **悬浮 tooltip** | ❌ 未实现 | ⚠ 部分：点弧线 → tooltip 关系类型（其他 tooltip 留主线 B/C）|
| **跨图搜索 / 筛选** | ⚠ M4 sidebar 筛选 ✅ / 搜索 ❌ | ❌ 搜索留主线 B / 右上预留位置 |
| **B+2 双主视图 · 副图地理** ⭐ | ❌ M4 vision pivot 时 silent drift | ❌ 留主线 B（**已在 § 2.2 显式预留位置 + 排队** / 不会再被遗忘）|
| **节点详情卡多类型** | ⚠ M4 仅 ClaimNode | ❌ 留主线 C |
| **后来者发展旁注** | ❌ M3 未做 | ❌ 留主线 C concept 详情卡 |

**主线 A 后 PRD V1 覆盖率预估**：30-40% → **50-60%**（缩放平移 + 时间轴改造 + 部分 tooltip 全 close）

---

## 4. 视觉风格定调（沿用 M4 § 4 · 主线 A 不动视觉）

主线 A 是**交互层加 zoom**，**不改视觉风格**。继承 M4 spec § 4 全套：

- **Tone**：学术编辑风（A · 米白底 + 棕字 + 紫色 UI 强调）
- **配色 token**（来自 src/styles.css）：
  - `--paper #f4ede0` 米白底
  - `--ink #1a1a1a` 墨黑文字
  - `--rule #d8ccb8` 规则线
  - `--scholar-red #8b2635` 学者红（disagreement 红弧 + event 节点色）
  - `--node-concept #5c7148` 苔绿（agreement 绿弧 + concept 节点色）
  - `--node-work #4a6fa5` 蓝灰（work 节点）
  - `--node-place #9b8b6f` 沙黄（place 节点）
  - 紫 UI `#5b3a8c`（Marx 主节点 / sidebar icon / 游标 / ▶ 播放 / 详情卡 h3）— inline 在 component
- **字体**：Playfair Display (display) + Source Serif 4 (body) + EB Garamond (header) + Noto Serif SC (中文) + JetBrains Mono (mono)
- **0 border-radius**（学术编辑硬约束 / 不出现圆角）

### 4.1 主线 A 视觉增补

| 元素 | 规范 |
|---|---|
| **缩放控件**（新加） | 左下角 fixed / 米白底 + 1px 墨黑边 / 4 个 button 竖排（+ / 当前比例数字 / − / ⌂）/ 按钮 28px × 28px / EB Garamond italic 标比例 |
| **zoom 后 obs 圆点** | 1× r=2.5px → 8× r=8px（线性 scaling）/ 紫色不变 |
| **zoom 后 claim_text** | 1× 11-12px → 8× 18-20px（线性 scaling，但 clamp max 22px 防溢出）|
| **zoom 后弧线 stroke** | 主关系 1× stroke-width 1.2 → 8× 2.5 / 灰虚线同步加粗 |
| **居中飞行动画** | 600ms cubic-bezier (0.4, 0, 0.2, 1) / 同步移动 + 缩放 |
| **视觉范围条**（新加） | 时间轴上紫色半透明矩形 opacity 0.35 / 宽度 = 画布可视年份段 / 不可拖（仅显示）|

---

## 5. Layout 规范（M4 layout 不变 · 加 zoom 层）

### 5.1 整体布局结构（M5 主线 A 完成态）

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Marx · 思想史可视化]                            [→ 右上预留主线 B]   │  ← header (M4 已有)
├──┬──────────────────────────────────────────────────┬────────────────┤
│s │ [主画布 · person 斜向流 + obs 堆叠 + 半圆弧]     │ [详情卡 fixed] │
│i │   HEGEL  (左上)  · obs 行 · ●─claim_text         │  400px 宽      │
│d │             obs 行 · ●─claim_text                │                │
│e │                                                  │  Marx, K.      │
│b │     KARL MARX (中) · obs 行 · ●─claim_text  ←──┐ │  1818–1883     │
│a │              obs 行 · ●─claim_text  agreement   │ │  bio 事件式    │
│r │              obs 行 · ●─claim_text  绿弧 ↙────┘ │  关联...       │
│  │                                                  │                │
│  │       ENGELS (右下) · obs 行 · ●─claim_text     │                │
│  │                                                  │                │
│  │ [+]                                              │                │  ← 缩放控件
│  │ [2.5×]                                           │                │     左下 fixed
│  │ [−]                                              │                │
│  │ [⌂]                                              │                │
├──┴──────────────────────────────────────────────────┴────────────────┤
│ [▶ 播放]  1770 ────●═════════════●────── 1950                        │  ← 时间轴
│                  游标 1860    Marx 区间 indicator                    │     单游标 + 范围条
└──────────────────────────────────────────────────────────────────────┘
```

### 5.2 屏幕坐标 vs 画布坐标（核心架构分层）

| 元素 | 坐标系 | zoom 影响 | 备注 |
|---|---|---|---|
| header / footer | 屏幕 | ❌ 不跟随 | M4 已实现 fixed |
| sidebar 左侧 | 屏幕 | ❌ 不跟随 | M4 已实现 fixed / 主线 A 不动 |
| 详情卡 右滑 | 屏幕 | ❌ 不跟随 | M4 已实现 / 主线 A 调整宽度 400px |
| 缩放控件 左下 | 屏幕 | ❌ 不跟随 | **主线 A 新加** |
| 时间轴底部 | 屏幕 | ❌ 不跟随 | M4 已实现 / 主线 A 改造为单游标 |
| **主画布 SVG g 元素** | **画布** | ✅ **跟随 zoom** | person section + obs 行 + 半圆弧 + 圆点 全部 |

**实现要点**：D3 zoom 应用到 `<g class="zoom-layer">` 包裹主画布所有内容 / 屏幕固定元素（详情卡 / sidebar / 控件）放 SVG 外用 HTML 绝对定位，或放 SVG 但用 `transform="translate(...)"` 跟 zoom 解耦。

### 5.3 半圆弧规范（M4 spec § 5.4 复用 · 主线 A 不动）

- 起止位置：obs 行前的紫色圆点（精确像素对齐 / 不漂浮）
- 弯曲方向：绿弧 agreement 左下弯 / 红弧 disagreement 右上弯 / 灰虚线 extends 微弧向右
- **zoom 适配**：弧线跟 obs 圆点一起放大缩小 / SVG 内 `<g class="arc-layer">` 跟 zoom 同步 transform / stroke 宽度按 zoom 比例 scaling（避免 1× 太粗 / 8× 太细）

---

## 6. 时间轴新形态（M4 改造 · 主线 A 核心）

### 6.1 M4 现状 → M5 主线 A 改造

| 元素 | M4 | M5 主线 A |
|---|---|---|
| 主轴线 1770–1950 | ✅ | ✅ 保留 |
| 紫色 Marx 区间 indicator 1830–1880 | ✅ | ✅ 保留 |
| 紫色 tick markers Marx 活跃年 | ✅ | ✅ 保留 |
| ▶ 播放按钮 | ✅ "▶ 播放思想史" | ✅ **保留 + 简化**：游标从 1770 自动滑到 1950 + 画布同步飞行 |
| input range slider（带 thumb）| ✅ | ❌ **删除** |
| 游标显示 "游标 XXXX" 文字 | ✅ | ✅ 保留 |
| **单游标可拖动** | ❌ | ✅ **新加** · 拖游标 = 画布 pan（中心跟随）|
| **视觉范围条** | ❌ | ✅ **新加** · 紫色半透明矩形 / 宽度 = 画布当前可视年份段 / 不可拖（仅显示） |

### 6.2 时间轴交互细节

- **单游标位置 = 画布观察中心年份**：用户拖游标 → 画布平滑 pan / 游标停 → 画布停
- **视觉范围条宽度 = 当前 zoom 后可视段**：用户滚轮放大画布 → 范围条自动收窄 / 缩小画布 → 范围条加宽
- **▶ 播放点击 = 自动游标 1770 → 1950**：游标自动滑动 + 画布同步飞行 / 速度：~15s 跑完全长（1770→1950 共 180 年 → 12 年/秒）/ 再点击 ▶ = 暂停（toggle pause 同 M4 已实现）
- **▶ 播放期间画布 zoom 保持**：游标移动但不改变 zoom 比例

---

## 7. 交互行为（6 大交互完整规范）

### 7.1 滚轮 zoom

- 鼠标滚轮在画布上滚动 → 以鼠标光标位置为中心放大 / 缩小
- 范围 1× → 8×（连续 / 不是离散级别）
- D3 zoom behavior `.scaleExtent([1, 8])`
- 缩放控件左下"+ / − / ⌂"按钮 = 离散步进（每点击放大 ×1.5 / 缩小 ×0.67 / ⌂ 重置）
- 缩放控件中间显示当前比例（如 "2.5×"）

### 7.2 拖动 pan

- 鼠标按住画布拖动 → 画布平移
- `pan` 边界 clamp 到内容外 5% padding（用户不能拖到全空白 / 始终至少 5% 内容可见）
- 触发 cursor 状态：hover 画布空白 = `grab` / 按住拖动 = `grabbing`

### 7.3 单击 obs（紫圆点 + claim_text 行整体）

- 单击 → **同时**触发：
  1. obs 圆点飞行居中 + 放大到 ~3×（如果当前 zoom < 3× 则放大到 3× / 已在 3× 以上则保持）
  2. 详情卡从右侧滑入（400px 宽 / 当前 obs 对应 ClaimNode 详情）
- 居中算法：**offset 详情卡宽度** → obs 不被详情卡遮挡 / obs 居中到画布可见区域（屏幕宽度 − 400 详情卡宽 − 32 sidebar 宽 − 边距）
- 飞行动画 600ms cubic-bezier

### 7.4 单击弧线（半圆弧 SVG path）

- 点击命中：g.arc-hit-layer 透明 16 屏幕 px stroke overlay（DR-061 / 解 PM "太细难选中"）
- 单击半圆弧 → 触发：
  1. 弧线两端 obs 圆点 + 弧 apex 同时进入 viewport（fit 可见区 55% padding 留 45% 边距 · DR-062 CAD zoom-selected 效果）
     · 用 pathEl.getPointAtLength(0/mid/end) 取 endpoints + apex / 不用 getBBox 含弧 apex extension 主导
  2. 弧线高亮 stroke-width 2.5 + opacity 1.0
  3. ~~tooltip 关系类型~~ **DR-063 拍废**：颜色（绿/红/灰虚）+ 方向（左下/右上/右弯）已分关系 / tooltip 多余
- **不**自动弹详情卡（弧线代表的是关系不是单条主张 / 详情卡留给单击 obs）

### 7.5 双击鼠标中键 = 重置全景

- 双击鼠标中键（middle button double-click）→ 画布 reset 到 1× + 居中显示全部内容
- 飞行动画 800ms（比 7.3 慢 / 因为是大范围变化）
- **mac trackpad 用户** 没有中键 → 用左下 ⌂ 按钮 fallback

### 7.6 Esc = 关详情卡

- Esc 键 → 关闭右侧详情卡（不动 zoom / 不动 viewport）
- 如果详情卡已关 → Esc 什么都不做（不重置 zoom / 不触发其他）

---

## 8. UI 工具区位置

### 8.1 左 sidebar（M4 已实现 · 主线 A 不动）

- 位置 fixed 左侧 / 32px 收起 / 200px 展开
- 6 个 filter icon 不变（claim / person / work / event / concept / extends）
- M4 closure Option A 修完 ARIA 属性 / 主线 A 不再动

### 8.2 详情卡（M4 已实现 · 主线 A 调整宽度）

- 位置 fixed 右侧滑入
- **宽度调整 350px → 400px**（M4 是 350px / 主线 A 400px 让 bio 行长一些 / 不破坏 obs 圆点居中 offset）
- 关闭：× 按钮 / Esc 键

### 8.3 缩放控件（主线 A 新加 · 左下）

- 位置 fixed 左下角 / 距 sidebar 右边 12px / 距底部时间轴上方 20px
- 4 个 button 竖排：
  - `+` 放大 ×1.5
  - 当前比例显示（"1.0×" / "2.5×" / "8.0×"）
  - `−` 缩小 ×0.67
  - `⌂` 重置回 1× + 全景居中
- 每个 button 28px × 28px / 米白底 + 1px 墨黑边 / EB Garamond
- 当前比例数字背景紫色半透明（视觉强调"现在在哪个 zoom 级别"）

### 8.4 右上区域（主线 A 不放 widget · 留主线 B）

- M5 主线 A 完成后右上**仅有 M4 已加的致谢 footer link**
- 留位置给主线 B：搜索栏 / "关于" link / brand 强化等

---

## 9. 技术架构

### 9.1 新增 / 修改组件

| 组件 | 类型 | 责任 |
|---|---|---|
| `src/viz/zoom.ts` | **新增** | D3 zoom behavior / scaleExtent [1,8] / 应用到 zoom-layer / 同步触发时间轴范围条 update |
| `src/viz/center.ts` | **新增** | 居中飞行算法 / 计算 target transform / 调用 d3 transition |
| `src/components/zoom-control.ts` | **新增** | 左下缩放控件 UI / 按钮事件 → 调用 zoom API |
| `src/components/timeline.ts` | **修改** | 删 input range slider / 改单游标可拖 / 加视觉范围条 / ▶ 播放保留 |
| `src/main.ts` | **修改** | 主画布所有 g 元素包裹 `<g class="zoom-layer">` / 注册 zoom + click handlers |
| `src/components/claim-popover.ts` | **修改** | 宽度 350px → 400px / Esc 关闭 keyboard listener / 不动视觉 |
| `src/components/sidebar.ts` | **不动** | M4 closure Option A 已修 |

### 9.2 数据流

```
用户操作 (滚轮 / 拖动 / 单击 obs / 单击弧线 / 双击中键 / Esc)
   ↓
zoom.ts / center.ts / timeline.ts handlers
   ↓
更新 D3 zoom transform (k, x, y)
   ↓ (同时)
   ├→ zoom-layer transform 应用
   ├→ timeline.ts 视觉范围条 width update
   ├→ zoom-control.ts 比例数字 update
   └→ (单击 obs 时) claim-popover.ts 滑入
```

### 9.3 关键技术选择

- **D3 zoom**: 用 `d3.zoom()` behavior · scaleExtent [1, 8] / translateExtent clamp 到内容外 5%
- **飞行动画**: D3 transition `.duration(600)` + cubic-bezier (0.4, 0, 0.2, 1) easing
- **range 条宽度计算**: zoom transform k → 年份段 = (画布宽度 / k) × (yearMax - yearMin) / 画布宽度
- **双击中键检测**: mousedown event with button=1 / 检测 300ms 内连续两次

---

## 10. M5 主线 A task 拆分（粗框架 → writing-plans 输入）

预估 5-7 task / 1.5-2 周 / 单线启动（lesson 3）/ 30% checkpoint vision review（lesson 1）

| Task | 内容 | 依赖 | 估时 |
|---|---|---|---|
| T0 | 前置：archive M4 demo 到 `public/m4-archive/` + git tag `m5-pre-archive`（lesson 8） | — | 0.5h |
| T1 | 新增 `viz/zoom.ts` · D3 zoom behavior 集成 · 主画布所有 g 包裹 zoom-layer · scaleExtent + translateExtent | T0 | 4-6h |
| T2 | 新增 `components/zoom-control.ts` · 左下缩放控件 + - 比例显示 ⌂ button · 4 按钮联到 zoom API | T1 | 3-4h |
| T3 | 修改 `components/timeline.ts` · 删 input range slider · 加单游标可拖 · 加视觉范围条同步 · ▶ 播放保留 | T1 | 5-7h |
| T4 | 新增 `viz/center.ts` · 居中飞行算法 + offset 详情卡宽度 · 接到单击 obs handler | T1, T2 | 3-4h |
| T5 | 修改 `claim-popover.ts` · 宽度 400px · Esc 关闭 listener · 单击 obs 触发"放大+详情卡同时" | T4 | 2-3h |
| T6 | 单击弧线 handler · 两端 obs 居中 + 弧线高亮 + tooltip 关系类型 | T1, T4 | 3-4h |
| T7 | 双击中键 = 重置 + cursor 状态 + pan 边界 clamp | T1 | 2-3h |
| T8 | E2E 测试 + 视觉回归 + 4 件套验证 baseline 不退化 + ship | 全部 | 4-6h |

**Total**: ~27-37h / 单人 1.5-2 周（PM checkpoint 30% / 60% / 90% 三轮）

---

## 11. 验收标准（acceptance criteria）

### 11.1 功能验收

- [ ] 滚轮在画布任意位置滚动 → 以光标位置为中心 zoom（1× → 8×）
- [ ] 鼠标拖动画布 → 画布平移 / 边界 clamp 到 5% padding
- [ ] 单击任意 obs → 居中放大到 ~3× + 详情卡 400px 滑入（同时 / 不分两次）
- [ ] 单击任意半圆弧 → 两端 obs 同时进入 viewport + 弧线高亮 + tooltip 关系类型
- [ ] 拖时间轴单游标 → 画布平滑 pan / 游标停 = 画布停
- [ ] 时间轴视觉范围条宽度 = 当前画布可视年份段（动态同步）
- [ ] ▶ 播放点击 → 游标自动 1770 → 1950 + 画布同步飞行 + 再点暂停
- ~~双击鼠标中键 → 画布重置到 1× + 全景居中 + 800ms 飞行~~ **DR-060 拍废**：⌂ 已 cover reset 路径 / T9 反成冗余
- [x] 左下 ⌂ 按钮 → 画布重置到 1× + 全景居中（Stage 1 实施 / 既是 mac trackpad fallback 也是唯一 reset 入口）
- [ ] Esc 键 → 关详情卡 / 不动 viewport
- [ ] zoom 时 sidebar / 详情卡 / 缩放控件 / 时间轴**不跟随缩放**（屏幕固定大小）

### 11.2 视觉验收

- [ ] obs 圆点 zoom 后 r 1× 2.5px → 8× 8px 平滑 scaling
- [ ] claim_text font-size zoom 后 1× 11-12px → 8× 18-20px clamp max 22px
- [ ] 半圆弧 stroke-width 跟 zoom 同步 scaling / 8× 时不溢出
- [ ] 居中飞行动画 600ms / 不卡顿（60fps）
- [ ] 缩放控件左下角 / 4 button 竖排 / 当前比例数字紫底强调
- [ ] 视觉范围条 紫色 opacity 0.35 / 时间轴上同步显示

### 11.3 回归验收（M4 baseline 不退化）

| 指标 | M4 baseline | M5 主线 A ship 警戒线 |
|---|---|---|
| Health composite | 8.5+ | 不破 8.0 |
| Bundle JS transfer | 38KB | 不破 47KB（+9KB 预算 D3 zoom）|
| FCP (prod 中国) | 4412ms | 不破 5515ms |
| QA score | 95+ | 不破 90 |
| Design score | A- (90+) | 不破 B+ (84) |
| AI Slop score | A (95) | 不破 B (85) ⭐ |
| Test pass | 106/109 | M5 主线 A 后预计 ~120/123（+14 单元 + 0 RED 新增）|

ship 前重跑 gstack 4 件套 / 任一警戒线破 = 修了再 ship。

---

## 12. 风险 + 缓解

| 风险 | 缓解 |
|---|---|
| **R1** D3 zoom 集成跟现有 SVG 结构冲突（M4 主画布 SVG g 元素可能没统一 root） | T1 先验证 zoom-layer 包裹后所有现有渲染 + 单元测试现有 layout 不变 |
| **R2** 居中飞行动画卡顿（92 obs + 31 弧线 + zoom transform）| T4 用 `requestAnimationFrame` + D3 transition / 性能测试 60fps 阈值 |
| **R3** 时间轴单游标拖动跟画布 pan 双向同步出现震荡（互相触发死循环）| 加 debouncing + 单向触发标记位（拖游标只触发画布更新 / 画布 pan 只更新游标位置不反触发）|
| **R4** mac trackpad 用户不会双击中键 → 不知道怎么重置 | ⌂ 按钮可见 + 视觉强调 / 鼠标 hover ⌂ tooltip "重置到全景视图"|
| **R5** zoom 后 claim_text 字号太大溢出画布 | 8× max 字号 clamp 22px / 超过则保持 22px / 同时弹 tooltip 完整文本 |
| **R6** vision drift 主线 A 期间想加搜索 / 详情页（PM 习惯催进度）| M4 lesson 1 PM checkpoint 30%/60%/90% 三轮 / vision-level 偏差立即修 / polish 攒 backlog |
| **R7** 双击鼠标中键浏览器默认是滚轮缩放页面 → 跟 zoom 冲突 | T7 实现时 `preventDefault` 中键事件 / `mousewheel` 在画布内全 capture |
| **R8** 镜头跟着游标但用户拖游标想看历史而不是 pan 当前画布 → UX 困惑 | brainstorm 已确认双向锁定 / 30% checkpoint 时实地验证 PM 直觉 / 准备好"反转"fallback（游标独立显示 不绑画布 pan）|

---

## 13. 决策记录 DR-014 onwards

| 编号 | 日期 | 决策 | 备选 | 理由 |
|---|---|---|---|---|
| DR-014 | 2026-05-14 | M5 三主线优先 A 可探索 | B 页面框架 / C 多类型详情 | A 是 B/C 基础（PM 反馈）/ 用户感知最大 / 单线启动（lesson 3）|
| DR-015 | 2026-05-14 | 时间轴 ↔ 画布 = 双向锁定 | A 弱关联保留现状 / C 时间轴变控制台 + 密度图 | A 不解决 PM 意见 4 / C 是 B 超集留 M6 / B 最小可感知改变 |
| DR-016 | 2026-05-14 | 时间轴操作 = 单游标 + 视觉范围条 | 双游标范围条（左右两端可拖）| PM 反馈"操作显示二合一 / 不需要拆"/ 简化 UX / 范围条仅显示更轻 |
| DR-017 | 2026-05-14 | 单击 obs = 同时放大居中 + 详情卡 | 单击 → 放大 / 双击 → 详情卡（Google Maps 模型）/ 单击 → 详情 / 双击 → 放大 / 单击 → 放大 + tooltip / tooltip 点详情 | 一击两件事 / 最少操作 / PM 意见 7 直接 / 居中算法 offset 详情卡宽度 |
| DR-018 | 2026-05-14 | 重置全景 = 双击中键 + ⌂ 按钮 | Esc + ⌂ + 双击空白 三个都支持 | Esc 习惯是关弹窗（非 reset）/ 双击空白易误点 / 双击中键 Google Maps 一致 + ⌂ mac trackpad fallback |
| DR-019 | 2026-05-14 | Esc = 关详情卡（不动 viewport）| Esc = 重置 + 关详情卡 | 跟 web 习惯一致（Esc 关 modal 不动主视图）/ 跟 DR-018 配套 |
| DR-020 | 2026-05-14 | 缩放控件位置 = 左下 | 右上 / 右下 / 画布上嵌入 | 右上预留主线 B（搜索 / 全局功能区）/ 左下 = 画布工具区天然分区 / Google Maps 类似 |
| DR-021 | 2026-05-14 | ▶ 播放保留 + 简化 = 游标自动 1770→1950 | 删 ▶ 播放（zoom 已能浏览） / 改造为 carousel | 保留 M4 已实现功能 / 跟单游标方案一致（游标自动滑 + 画布飞）/ 用户能"一键回顾" |
| DR-022 | 2026-05-14 | sidebar / 详情卡 / 缩放控件 / 时间轴 全部跟 zoom 解耦 | 跟随 zoom（与画布一起变大）| Google Maps 类比 / 工具区 vs 内容区分层 / 屏幕坐标 fixed = 用户认知"工具不变 / 内容可探" |
| DR-023 | 2026-05-14 | 详情卡宽度 350px → 400px | 保持 350px / 增到 450px | bio 事件式 + 关联列表需要更多横向空间 / 400px 是 4 件套 design-review 推荐 |
| DR-024 | 2026-05-14 | 右上区域 M5 主线 A 不放任何 widget | 缩放控件放右上（前 mockup v2）/ 搜索栏 placeholder 立刻加 | 预留主线 B（避免主线 A 临时占位主线 B 又要拆）/ 主线 A 范围聚焦 zoom 不蔓延 |

> **DR-025 ~ DR-060 实施期补**（详见 [progress anchor](../docs/2026-05-15-m5-linea-progress-anchor.md) § 3 / 实施期累积 30+ 决策）

### 13.1 Stage 3 brainstorm 决策（2026-05-15 实施期补）

| 编号 | 日期 | 决策 | 备选 | 理由 |
|---|---|---|---|---|
| ~~DR-038~~ | ~~2026-05-15~~ | ~~拖时间轴方向 = Model A 滚动条直觉~~ **作废 → DR-042 vision pivot** | — | 时间轴不再控制画布 pan / Model A vs B 的"画布反应方向"概念失去意义 / 但拖动改 cursor year 的方向仍是 Model A（拖右→年大）|
| ~~DR-039~~ | ~~2026-05-15~~ | ~~视觉范围条样式 B~~ **作废 → DR-045 删范围条** | — | 范围条原意义 = 画布 viewport 对应年份段 / 画布解耦后失去意义 |
| DR-040 | 2026-05-15 | ▶ 播放速度 20 秒跑完 1770→1950（9 年/秒）| 15s spec 默认 / 10s 更快 / 可调速 toggle | PM 拍板"播放仅锦上添花 / 不是主线" / 20s 偏慢更稳重 / 不开 toggle 简化 UI |
| ~~DR-041~~ | ~~2026-05-15~~ | ~~双向同步震荡防护 = syncingFromTimeline flag~~ **作废 → DR-042 单向 unidirectional** | — | 时间轴跟画布解耦 / 无双向同步 / flag 不需要 |

### 13.2 Stage 3 PM checkpoint R1 vision pivot（2026-05-15 实施期补 · 颠覆 DR-015）

PM 浏览器实测 Stage 3 后反馈："**画布是观点的文字列表 / 不是和时间强关联的线形走向 / 时间轴不应该移动画布**"。

PM 重新定义时间轴价值：**让用户看到「X 年时存在哪些观点 / 有哪些局限 / 谁提了什么 / 跟前人是支持还是反对 / 怎么影响」→ 引导深思「这观点为什么能提出」→ 探索性、深思性**（这是 Marx 产品功能目的之一）。

| 编号 | 日期 | 决策 | 备选 | 理由 |
|---|---|---|---|---|
| DR-042 | 2026-05-15 | **时间轴 = 时间游标 / 时间滤镜**（颠覆 DR-015 双向锁定）/ 画布 pan/zoom 跟时间轴完全解耦 | 保留 DR-015 双向锁定 | PM 实测后反馈"画布 ≠ 时间走向" / 时间轴控制画布违背"探索性"功能目的 / 改时间游标控制观点 + 弧线 fade in/out |
| DR-043 | 2026-05-15 | 初始游标 = 1950（全显示）+ 未提出 opacity 0.15 | 1880 Marx 死后 / 1770 起点 + 0.3 / 0.5 | PM 拍 1950 避免首访"页面坏了" / 0.15 强对比"未提出 vs 已提出" / 拖游标往回退 = 揭示历史展开 |
| DR-044 | 2026-05-15 | ▶ 播放期间画布**完全不动** | 画布跟着 pan 到游标年代 | PM vision 一致 / 用户看"不变画布上让思想生长起来" / 跟 DR-042 配套 |
| DR-045 | 2026-05-15 | 删视觉范围条 + 2 edge ticks（DR-039 作废）| 保留改语义 | 原意义（画布 viewport 年份段）解耦后失效 / zoom 比例已在左下 zoom-display / 范围条冗余 |

### 13.2.1 Stage 3 PM checkpoint R2（2026-05-15 实施期补）

PM 浏览器实测 Stage 3 R1 后反馈：

1. 时间轴紫色 Marx 区间 indicator rect 应该去掉 / vision pivot 后不需要
2. 详情卡 bottom:0 全屏高 / z-index 1000 在 timeline 之上 / **挡 timeline 看不到拖不了**
3. 时间轴不够长 / 拖到中间就拖不过去（单次 mousedown→mouseup 拖动范围有限 / 拖几百像素还到不了边）

| 编号 | 日期 | 决策 | 备选 | 理由 |
|---|---|---|---|---|
| DR-046 | 2026-05-15 | 删 timeline.ts Marx 紫色 indicator rect | 保留 / 改色 | vision pivot 后画布已淡显标"当时存在观点" / 紫色 indicator 冗余 / 简化时间轴视觉 |
| DR-047 | 2026-05-15 | claim-popover.ts bottom: 0 → 160px（跟 main.ts padding-bottom 一致 / 跟 TIMELINE_PX 同步）| 提高 timeline z-index / 缩短 popover height 别的方式 | 详情卡只占屏幕中部 → timeline 底部全可见 / 用户能拖时间轴 / 跟 popover 内容浏览不冲突 |
| DR-048 | 2026-05-15 | timeline.ts 加 click-to-seek（mousedown 时 cursor 立即跳到 click 位置 / 之后才是相对拖动）| 仅 drag / 加双击 reset / 拓宽 timeline 物理范围 | 用户点 timeline 任何位置 → cursor 直接到 / 跟 W3C input range slider 一致 / 解决"拖不过去"根因（单次 dx 不足）/ 同时保留拖动精调 |

### 13.2.2 Stage 3 PM checkpoint R3（2026-05-15 实施期补）

PM 浏览器实测 Stage 3 R2 (commit f3e216d) 后反馈：

1. 时间轴只到 1950 / 实际有很多 1950 后的新思想（Marx 学派 + 21 世纪后继者）
2. timeline 区域有点高 / UX 不舒服 / **不必须现在改 / AI 自行判断阶段** ⭐

AI 判断：Fix 1 + Fix 2 合并做（同 timeline.ts / 同 commit / 同 dev verify cycle / 加长后高度感差异更明显 / 一次性优化比分散迭代 ROI 更高）。

| 编号 | 日期 | 决策 | 备选 | 理由 |
|---|---|---|---|---|
| DR-049 | 2026-05-15 | 时间轴 yearMax 1950 → **2030**（260 年 span）/ yearMin 1770 保留 | 2025（到现在）/ 2050（含本世纪中）| 数据现有 max 1959 / 2030 含 1950 后 Marx 学派 + 21 世纪 buffer ~70 年 / round 数 / PM 嫌不够再调一个字搞定 |
| DR-050 | 2026-05-15 | timeline 高 130 → ~80px：删 header label "时间轴 · 时间游标" + svg 60→40 + padding 18+14→8+8 + 字体 12→11 + tick label 10→9 + 主画布 padding-bottom 160→100 + popover bottom 同步 100 | 保留 label / 仅减 padding / 移到顶部 | PM 反馈"区域高" / ticks + 紫色 cursor 竖线 + ▶ 按钮 视觉自明 / label 冗余 / 主画布多 60px 显示空间 |

### 13.2.3 Stage 3 PM checkpoint R4（2026-05-15 实施期补 · 资深 UIUX 重设布局）

PM 浏览器实测 Stage 3 R3 (commit fef4d67) 后反馈："**第一行时间轴 / 第二行只有 ▶ 按钮 / 其他空 → 离谱布局 / ▶ 改图标放最左 / 单行**" + "**你作为资深 UIUX 设计师好好想想**"。

资深 UIUX 分析三方案对比，选 **方案 B** (PM 方案 A 上 incremental improvement):

| 元素 | PM 方案 A | 我方案 B (DR-051) |
|---|---|---|
| 布局 | 单行 | 单行 ✓ 共识 |
| ▶ 按钮 | 图标在左 | 图标 28×28 在左 ✓ |
| 游标 label | 右端文字"游标 XXXX" | **floating badge 跟随 cursor 走** / 紫色矩形米白年份字 / float over axis 上方 |

**方案 B 理由（行业 + UX 原则）**：
- 「所见即所得」：cursor 位置 + label 视觉双关联（同位置 + 同紫色）/ 用户眼睛不跨屏幕找游标位置 ↔ 右端数字
- 行业惯例：YouTube/B 站/视频播放器 timeline scrubber hover 提示时间 / 我改 always-on（产品核心信息 / 不藏）
- 数据可视化（NYT/Bloomberg interactive）也用类似 floating tooltip 跟 cursor

| 编号 | 日期 | 决策 | 备选 | 理由 |
|---|---|---|---|---|
| DR-051 | 2026-05-15 | 单行布局 + ▶ 图标在左 (28×28) + floating cursor badge | PM 方案 A 右端 label / 极简 inline label | 行业标准 + 所见即所得原则 + 紫色双视觉关联 / a11y aria-label 保留 "播放思想史" 屏幕阅读器友好 |

**实施同步改动（高度连锁）**：
- timeline.ts svg 40→44（加 14px floating badge 区）/ container padding 8+8→6+6 / 字号 11→10 / **总高 84→57px**
- main.ts padding-bottom 100→60 / TIMELINE_PX 100→60
- claim-popover.ts bottom 100→60（DR-047/050/051 累计 0→160→100→60）
- zoom-control 位置 bottom 180→70（timeline 变矮 / zoom-control 不能还以 180 悬空 / 紧贴 timeline 上方）

**累计 timeline 瘦身**：M5 init 130 → R3 84 → R4 57 = **-56%** / 主画布多 100px 显示空间。

### 13.3 Stage 3 实施改造（DR-042 → main.ts）

- `onCursorChange` 重写：遍历 `g.obs` / `path.arc` / `g.person-section` 按 `year` vs cursor 设 opacity
  - `claim.year > cursor` → 0.15 / 否则 1
  - `arc source/target 任一 year > cursor` → 0.15 / 否则 1
  - `person.birth_year > cursor` → 0.15 / 否则 1（PM 增强 M4 原 0.4 改 0.15 全栈一致）
- `onZoom` 删 timeline 反向同步部分（不再 setCursor）
- 删 `syncingFromTimeline` flag + `viewportCenterCanvasX` + `yearToCanvasX` helpers

### 13.4 Stage 3 brainstorm mockup 归档

PM 决策依据 mockup 在 `public/m5-stage3-brainstorm.html`（保留作 archive / 虽 DR-038/039 作废 / 但保留 mockup 记录 PM 当时心智演变）。

---

## 14. Stage 4 焦点模式 / Focus Mode（2026-05-15 PM 新需求 brainstorm 落档）

### 14.1 触发动机 + 价值

PM Stage 3 收尾后提出新需求："**相关性过滤**"：

> "比如人物 E 的第 3 条观点与 A 的 2/5/10 条、C 的 11/20 条观点有关联 / 他们之间是连线 / 距离可能在画布上一个在左上角一个在右下角 / 点击 E-3 切换画布只剩这几个观点 + 连线 / 按原来相对顺序斜着排列 / 还要返回按钮"

资深产品视角分析：
- 跟 Stage 3 vision 衔接：Stage 3 是**时间维度滤镜**（"X 年存在哪些观点"）/ 焦点模式是**关系维度滤镜**（"这观点跟谁有关"）/ 两个滤镜叠加 = 探索性 × 深思性双倍
- PM 起名"相关性过滤"对用户不直观 / UI 文案改"查看关联" / 模式叫 **Focus Mode**

### 14.2 brainstorm Q1-Q4 PM 拍板（2026-05-15 实施期）

| 编号 | 决策 | 备选 | 理由 |
|---|---|---|---|
| DR-053 | **Q1 触发** = 详情卡里加「查看关联」按钮 | 双击 obs（破 DR-031）/ shift+click / obs 旁加图标 | 不破坏 DR-031 单击=详情卡 / 发现路径自然（详情卡里看到关联列表 → 按钮）|
| DR-054 | **Q2 双段式 UX**：详情卡「查看关联」按钮 hover → **高亮淡显预览** / click → **完全切换** | 只切换（无 preview）/ 只高亮（无切换）| PM 主动澄清"高亮淡显是 preview 状态 / 完全切换是 commit 状态" / 资深 UX 经典 preview-before-commit 模式 |
| DR-055 | **Q2 切换后保留 person section**：E + A + C 三个 person 头像 + 名字 + 焦点 obs 行 / **不是**孤立 6 obs | 只 6 obs / 重排带头像 | PM 主动澄清"每个观点的所有人也需要保留"/ 保留 person section 结构 / 沿用 claim-layout.ts 算法 |
| DR-056 | **Q3 返回** = 顶部面包屑「全部 → 焦点：观点 prefix」/ 点「全部」返回 | 左下 ← 按钮 / Esc 键 | 跟文件管理器 / 网页 breadcrumb 一致 / 既显"现在在哪"又能返回 / 不占左下 zoom-control 区 |
| DR-057 | **Q4 链式焦点**第一版不允许 / 后续 polish 加 | 允许（更深探索 / 复杂度+）| 第一版简单 / 想看 A-2 关联 = 先点「全部」回主图 → 再点 A-2 |

### 14.3 我自审的 5 个 polish 默认（PM 不满意再调）

| 项 | 默认 | 理由 |
|---|---|---|
| 关系范围 | 一度直接关系（source/target 中任一是当前 obs） | 二度信息过载 / Polish 可后续加 |
| 关系类型 | 全显示 3 类（agreement/disagreement/extends）| M4 现有 / 颜色区分（绿/红/灰虚线）|
| 空状态 | 进入但提示"该观点未跟其他观点关联" | 不阻挡用户 / 给反馈 |
| 时间游标共存 | 焦点模式下时间游标仍 fade 焦点 obs（按 year vs cursor）| Stage 3 不破坏 / 滤镜叠加 |
| sidebar 共存 | 焦点模式下 sidebar filter 仍生效于焦点 obs | Stage 3 不破坏 |
| **焦点画布自动 zoom-fit** | 进焦点后自动计算焦点 obs bbox + zoom-fit 让 6 个 obs 充满 viewport | 充分利用屏幕 / 用户不必再 zoom |

### 14.4 三状态 state machine

```
                     全画布默认
                          │
            单击 obs → 弹详情卡
                          │
              ┌───────────┴────────────┐
              │                        │
        Hover 关联按钮              Click 关联按钮
              │                        │
        Hover Preview 态          Focus Mode 态
   (其他 obs opacity 0.15)   (其他 obs display:none + zoom-fit)
              │                        │
        Mouseleave 按钮          点面包屑「全部」
              │                        │
              └───────────┬────────────┘
                          │
                       恢复全画布
```

| 状态 | 实施细节 |
|---|---|
| **Default** | `g.obs / path.arc / g.person-section` opacity = 1（受时间游标 + sidebar filter 影响）|
| **Hover Preview** | 非焦点 obs / arc / person section opacity = 0.15 / 焦点 obs / arc / person opacity = 1 |
| **Focus Mode** | 非焦点 obs / arc / person section style.display = 'none' / 焦点元素 opacity = 1 / 自动 zoom-fit to focus bbox + 显示顶部 breadcrumb |

### 14.5 焦点元素集合算法

输入：触发 obs `c0` / 所有 relations。

```ts
function computeFocusSet(c0: ClaimNode, relations: ClaimRelation[]): {
  obsIds: Set<string>;
  personIds: Set<string>;
  relationIds: Set<{source, target}>;
} {
  const obsIds = new Set([c0.id]);
  const relevantRelations: ClaimRelation[] = [];
  for (const r of relations) {
    if (r.source === c0.id || r.target === c0.id) {
      relevantRelations.push(r);
      obsIds.add(r.source);
      obsIds.add(r.target);
    }
  }
  const personIds = new Set([...obsIds].map(id => claimById.get(id)?.author_id).filter(Boolean));
  return { obsIds, personIds, relationIds: relevantRelations };
}
```

### 14.6 技术实施

| 文件 | 改动 |
|---|---|
| `src/components/claim-popover.ts` | 加「查看关联」按钮（仅当 `agreementClaims.length + disagreementClaims.length > 0` 显示）/ button hoverenter / hoverleave / click 3 event |
| `src/components/breadcrumb.ts` | **新建** / fixed top:0 left:48px right:0 z-index:11 / 显示「全部」+ 焦点 obs prefix / 点「全部」触发 onExitFocus |
| `src/main.ts` | 加 focusMode state + applyFocusFiltering(obsIds, personIds) + applyHoverPreviewFiltering(obsIds, personIds) + 进/退焦点 listener / 焦点 bbox 计算 + zoomCtrl.programmaticZoom-fit |
| `src/components/claim-popover.test.ts` | 加按钮渲染测 + hover/click event 测 |
| `src/main.test.ts`（如有）/ 否则 e2e Playwright | focus mode 进出 + DOM hide 验证 |

### 14.6.1 Stage 4 R1 PM checkpoint（2026-05-15 实施期补 · 紧密重排）

PM 浏览器实测 Stage 4 R0 (commit bad234b) 后反馈：

> "剩下的 obs 应该紧密排列，而不是在原位 / 主画布中 A 左上 B 中 C 右下 / AB 隔 20 条 / BC 隔 100 多条 / 按下按钮时 A/B/C 应该紧挨在一起 / 中间无空 / 像 CAD zoom→选择对象后的效果"

| 编号 | 决策 | 实施 |
|---|---|---|
| DR-058 | **焦点模式紧密重排**：复用 `computePersonSectionPositions(focusPersonInputs)` 算紧凑斜向流坐标 / SVG section transform / obs transform / arc d 全部飞到新坐标 / 退出焦点时恢复原 datum 坐标 | `reflowFocusLayout` + `applyFocusLayout` + `restoreOriginalLayout` 函数 / `zoomFitToFocus` 改 `zoomFitToFocusCoords(obsCoordsMap)` 用新 bbox |

**实测**：3 person 紧凑 X spread = 50px / 主画布原 spread = 2708px（54× 紧凑）。

### 14.7 风险

| 风险 | 缓解 |
|---|---|
| **R1** Focus bbox zoom-fit 跟现有 d3.zoom translateExtent 冲突（pan boundary） | 临时关闭 translateExtent / focus 出后恢复 |
| **R2** hover preview rapid in-out 抖动（用户鼠标在按钮上下出入快）| 50ms debounce / 或 mouseleave 不立即恢复（focus 状态下 leave 仍保持 preview）|
| **R3** 孤立 obs（无 relation） | 「查看关联」按钮 disabled + tooltip "该观点未跟其他观点关联" |
| **R4** 时间游标 + sidebar filter 跟 focus 叠加多层 opacity 计算冲突 | applyFocusFiltering 用 `display:none` 而非 opacity（cleanly 不冲突）|
| **R5** 退出 focus 后 zoom 不回 fit-to-content 全景 | exitFocus 调 zoomCtrl.reset() |

---

## 15. 跨窗口续接（M5 主线 A）

新窗口开场白模板：

> 续接 Marx · M5 主线 A 实施
>
> 读：
> 1. `AGENTS.md`
> 2. `docs/2026-05-13-m4-takeaway.md`（M4 closure SSOT）
> 3. `specs/2026-05-14-m5-linea-explorability-design.md`（本 spec）
> 4. `plans/2026-05-14-m5-linea-explorability-plan.md`（writing-plans 产出 / 等下一步）
> 5. `docs/2026-05-14-m5-linea-progress-anchor.md`（实施进度 anchor / 等实施期产生）
>
> brainstorm 已结束 / Q1-Q5 全部拍板 / 等 spec PM review → writing-plans 拆 task → 实施

---

**M5 主线 A spec v1 done · 等 PM review ✅**
