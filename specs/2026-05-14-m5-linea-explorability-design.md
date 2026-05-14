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

- 单击半圆弧 → 触发：
  1. 弧线两端 obs 圆点同时进入 viewport（zoom + pan 自动调整到两端可见 + padding）
  2. 弧线高亮 stroke-width × 1.5 + opacity 1.0 + 紫色阴影
  3. tooltip 显示在弧线中点：显示关系类型（agreement / disagreement / extends）+ 引用源
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
- [ ] 双击鼠标中键 → 画布重置到 1× + 全景居中 + 800ms 飞行
- [ ] 左下 ⌂ 按钮 → 等同双击中键效果（mac trackpad fallback）
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

---

## 14. 跨窗口续接（M5 主线 A）

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
