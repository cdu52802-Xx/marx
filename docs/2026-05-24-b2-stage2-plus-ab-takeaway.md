# Marx M-B2 · Stage 2 + 阶段 A/B 收尾 takeaway（2026-05-24）

> **状态**：Stage 2 (T2.1~T2.4 + hotfix×3) + 阶段 A (翻 plan 顺序 · 主画布切换 + dev swap toggle) + 阶段 B.1 (大窗 polish · K_MAX 32→64 + dot baseR 8/7/6) 全 ship · PM 大窗实测验收通过 · 等 PM 拍 tag `m-b2-stage2-final` 收尾 · 后接 plan Stage 4 历史国界
> **当前 HEAD**：`b2f9782`（阶段 B.1 K_MAX/baseR atomic）
> **Git**：clean / origin/main 同步 / 最近 deploy run `26357393006` success
> **Prod**：https://cdu52802-xx.github.io/marx/ → 主画布 Geo 大窗（左上紫边 swap toggle 切 list/geo）
> **关联**：
> - [spec § 4 B2](../specs/2026-05-20-m-b-mainline-design.md#4-b2--副窗地理图phase-3--5-6-周--7-stage)
> - [plan B2 8 stage](../plans/2026-05-21-marx-m-b2-geomap.md)
> - [Stage 1 takeaway](./2026-05-22-b2-stage1-takeaway.md)（9 lessons）
> - [Stage 2 中段 anchor](./2026-05-22-b2-stage2-progress-anchor.md)（trace · 已 frozen）

---

## 1. 累积成果时间表（Stage 2 + 阶段 A/B · 14 commit · 2026-05-22~24）

### Stage 2 · T2.1~T2.4 实施 + 5 轮 PM hotfix（11 commit）

| commit | Task | 内容 |
|---|---|---|
| `adfab6d` | T2.1 | `geographic-data.ts` + `extractGeoNodes` + swap [lat,lng]→[lng,lat] + 31 person 真渲染（34 - 3 个 [0,0] 占位 filter）· PM 拍板 A 数据策略 |
| `74150fb` | T2.1.hotfix | 3 PM 实测 issue 全改 · Issue 1 球面背面节点 great-circle 距离 > clipAngle hide / Issue 2 统一 drag state 删 currentRotate / Issue 3 K_MAX 8→16 + distance plateau + scaleExtent + dot scale-aware |
| `a351eba` | docs anchor 1 | 切窗口前续接 SSOT · A+B+C 待开工完整修法 |
| `61f2160` | T2.1.hotfix2 | A+B+C 学 Google Maps · A K_MAX 16→32 + SCALE 1600→3200 / B dot+stroke 反比 zoom (sqrt 公式 + clamp k<2 plateau) / C 国名英文标签 d3.geoCentroid + zoom>=4 trigger / D Leaflet/Mapbox 切换 deferred V2 |
| `5bc89b4` | T2.1.hotfix3 | PM polish R1 · 1A 边界 stroke dual lever (strokeWidth clamp min 0.6 + 颜色 zoom-adaptive) + 2A dot ratio clamp baseR*0.6 + 米白 outline · 3A K_MAX 32→64 暂不做 deferred |
| `5d5a39b` | docs anchor 2 | hotfix2+3 落档 + polish backlog B-1~B-6 |
| `2da3834` | T2.2 DR-106 F | person 节点名字标签 D+E 混合 · D 球面 hide / plane k>=4 全显 / E hover 临时含生卒年 + click 持久 + 紫圈 + 加粗 · Q1a 紫 / Q2b 生卒年 / Q3a B1 DR-087 复用 / Q4a italic 紧贴右侧 |
| `db68602` | T2.2 click-bug v1 | dragBehavior.clickDistance(5) attempt · **prod fail · 假设错** |
| `8a61bf3` | T2.3 DR-107 ζ | 关系连线 V1 · `geographic-relations.ts` 新建 95 行 · 37 条 person-person arc · Q5a 灰 / Q6a opacity 0.25 / Q7a hover 临时 + click 持久 / Q8a 无方向 |
| `14c2c7f` | T2.2 click-bug v2 | dragBehavior.filter target=dot return false attempt (root cause fix) · **prod 仍 fail · v1+v2 都 fail / 真根因不明 · 落 backlog B-7** |
| `81aa0b3` | docs anchor 3 | hotfix2+3+T2.2 F+T2.3 ζ+click bug v1/v2/defer 全落档 · 切窗口准备 |
| `720b477` | T2.4 | `spreadOverlapping` 环形分布偏移 0.5° radius · byCoord Map toFixed(4) 分组 · 伦敦/巴黎同址多 person 防视觉重叠 |

### 阶段 A · 翻 plan 顺序 · 主画布切换（1 commit · 2026-05-24）

| commit | 内容 |
|---|---|
| `470a939` | **翻 plan 顺序** · 砍 300×200 prototype 浮窗（避 PM checkpoint 滤镜污染）· Geo SVG 跟 M5 SVG 同级 mount 到 #app · viewBox 1200×800 + 100% width/height · `swap-button.ts` 新建（CanvasRole 'list-main'/'geo-main' · STORAGE_KEY `marx:canvas-role` · 复用 plan T3.2 工程 Stage 3 直接升级）· dev toggle 左上 fixed mount |

### 阶段 B.1 · 大窗 polish R · K_MAX + baseR 重设计（1 commit · 2026-05-24）

| commit | 内容 |
|---|---|
| `b2f9782` | **PM 大窗实测拍 #1+#2 atomic** · K_MAX 32→64 + SCALE_AT_K_MAX 3200→6400（dual 翻倍 · viewport k=64 城市级别 / 之前 B-3 backlog 解锁升级）· DOT_BASE_RADIUS 常量 person 5→8 / event 4→7 / location 3→6 (8/7/6) · dotRadiusAtZoom 公式调温和 sqrt(k/2)→sqrt(k/4) + plateau k<4 + clamp 0.5 |

### 数据指标（HEAD `b2f9782`）

| 指标 | 值 |
|---|---|
| **Lint** | 0 error / 0 warning（`--max-warnings=0` 严格）|
| **Tests** | 450/453 pass（+5 swap-button + 13 K_MAX/baseR new · 3 M3 pre-existing 持平）|
| **Bundle JS gzip** | 50.10 KB（+2.72 KB vs Stage 1 final `47.38` · safe ≤80 KB · 余 29.90 KB）|
| **新依赖** | 0（Stage 2 沿用 Stage 1 d3-geo-projection + d3-shape line · 既有）|

---

## 2. 决策清单（Stage 2 + 阶段 A/B 期间新增 DR）

| DR | 日期 | 决策 | 状态 |
|---|---|---|---|
| **DR-T2.1-A** | 2026-05-22 | T2.1 数据策略选 A · 31 person 真数据先 ship · event/place 数据缺口落 M3.5 backlog · 拒 hardcode 占位假数据 | T2.1 final |
| **DR-T2.1.hotfix-1** | 2026-05-22 | Issue 1 球面背面节点 hide · great-circle 距离 > acos(1/distance) 弧度 `display:none` | hotfix final |
| **DR-T2.1.hotfix-2** | 2026-05-22 | Issue 2 统一 drag state · 删 currentRotate · 全程 panCenter（satellite `.center` 数学等价 `.rotate`） | hotfix final |
| **DR-T2.1.hotfix-3** | 2026-05-22 | Issue 3 K_MAX 8→16 + SCALE 800→1600 + K_DISTANCE_PLATEAU=8 · 第一性：distance/scale 独立维度 | hotfix final |
| **DR-T2.1.hotfix2-A** | 2026-05-22 | K_MAX 16→32 + SCALE 1600→3200 · 学 Google Maps zoom 极深 | hotfix2 final |
| **DR-T2.1.hotfix2-B** | 2026-05-22 | dot/stroke size 反比 zoom（sqrt 公式 + clamp k<2 plateau）| hotfix2 final（**阶段 B.1 改公式 sqrt(k/2)→sqrt(k/4)**）|
| **DR-T2.1.hotfix2-C** | 2026-05-22 | 国名英文标签（centroid + zoom>=4 trigger）· 中文国名映射 70 states 留 Stage 4 backlog | hotfix2 final |
| **DR-T2.1.hotfix2-D-defer** | 2026-05-22 | 真换 Leaflet/Mapbox 不做（V2 大决策）| deferred |
| **DR-T2.1.hotfix3-1A** | 2026-05-22 | 边界 stroke dual lever（strokeWidth minAbs 0.6 + 颜色 zoom-adaptive #d8cab0/#b8a880）| hotfix3 final |
| **DR-T2.1.hotfix3-2A** | 2026-05-22 | dot ratio clamp baseR*0.6 + 米白 outline | hotfix3 final（**阶段 B.1 改 clamp 0.6→0.5 + baseR 提升**）|
| **DR-T2.1.hotfix3-3A-defer** | 2026-05-22 | K_MAX 32→64 暂不做 · cshapes 精度 limit 提醒 | **阶段 B.1 PM 大窗实测后 override · 升级立即修** |
| **DR-106 F + Q1a+Q2b+Q3a+Q4a** | 2026-05-24 | T2.2 person 名字标签 D+E 混合 · 6 候选拍 F · Q1a 紫 / Q2b 生卒年 / Q3a B1 DR-087 紫圈复用 / Q4a italic 紧贴右侧 | T2.2 final |
| **DR-107 ζ + Q5a+Q6a+Q7a+Q8a** | 2026-05-24 | T2.3 关系连线 V1 ζ · 6 候选拍 ζ · 数据 reality 修正 plan 6 类（41 raw → 37 person-person arc 全 Marx-centric · 95% influences）· 默认灰 + hover/click 联动 | T2.3 final |
| **DR-T2.2-click-bug-v1** | 2026-05-22 | clickDistance(5) attempt · **prod fail** | failed |
| **DR-T2.2-click-bug-v2** | 2026-05-24 | dragBehavior.filter target=dot return false attempt (root cause fix) · **prod 仍 fail · 真根因不明** | failed |
| **DR-T2.2-click-bug-defer** | 2026-05-24 | click bug 暂落 backlog B-7 后期 polish · 新假设池 h1~h6 待专项 polish R 验证 | deferred |
| **DR-T2.4** | 2026-05-24 | `spreadOverlapping` 同坐标多 person 节点环形分布 0.5° radius 偏移 · byCoord Map `toFixed(4)` 容忍真数据浮点精度差异 · 公式 `angle = (i/n)*2π · dLon = cos*0.5 / dLat = sin*0.5` | T2.4 final |
| **DR-stage-A** ⭐ | 2026-05-24 | **翻 plan 顺序**（PM 拍板）· 砍 300×200 prototype 浮窗 / Geo SVG 跟 M5 SVG 同级 mount 到 #app 占满主画布 / swap-button.ts 复用 plan T3.2 工程（CanvasRole + STORAGE_KEY `marx:canvas-role`）· dev toggle Stage 3 polish 时直接升级为正式互换按钮 / 新顺序：阶段 A→B→Stage 4→Stage 5→Stage 3→Stage 7 ship | 阶段 A final |
| **DR-stage-B.1** ⭐ | 2026-05-24 | **PM 大窗实测拍 #1+#2 atomic** · K_MAX 32→64 + SCALE 3200→6400（B-3 backlog 解锁）/ DOT_BASE_RADIUS 8/7/6（小盒子 5/4/3 大窗视觉小 4 倍 · viewport 占比 1.7%→0.4% reconsider）/ dotRadiusAtZoom 公式 sqrt(k/4) plateau k<4 clamp 0.5（旧 sqrt(k/2) clamp 0.6 大窗下 k=4 起就缩 · 过 aggressive） | 阶段 B.1 final |

---

## 3. ⭐ 关键 process 转折 · 翻 plan 顺序（2026-05-24 PM 拍板 · process 校准案例）

### 背景

Stage 2 期间 5 轮 PM hotfix（hotfix→hotfix2→hotfix3→T2.2 click bug→T2.3）+ click bug v1+v2 都 prod fail · 都在 300×200 prototype 浮窗里实测。原 plan 顺序：

```
Stage 1-2：300×200 prototype 浮窗 5 周
Stage 3：互换按钮 + localStorage
Stage 4：历史国界
Stage 5：副窗 380×214 paper 风格（终于真"小窗副窗"）
Stage 7：ship
```

### PM 提出建议（2026-05-24）

> "目前我在小窗内进行复核、操作、验证 · 难度非常大非常别扭 · 建议先做大窗口主画布部分内容 · 大窗口都搞定了小窗口肯定就更容易搞定"

### AI 资深产品视角自审（按 memory `feedback_ai_challenge_pm_classification`）

**之前我没主动 challenge plan 顺序的根因**：默认沿用 plan "保守不破 M5 主图既有体验"假设。但 Marx 是 PM 一人开发的 vibe-coding 项目 · 没真实用户 · production safety 顾虑 0 成立。**这是 "satisfy plan 而非 question plan" LLM 通病**（元-3 显式假设 / Karpathy 4 原则）。

**翻 plan 顺序的真实成本/收益**：
- ✅ PM 实测体验从 300×200 → 主画布 ~1200×800（4-5x viewport）· 视觉判断质量↑
- ✅ 后续每个 PM checkpoint 都在真大窗上 · feedback 信号更准
- ✅ T2.4 spreadOverlapping 小盒子下 0.5° 偏移 ≈ 1-2 像素 · 大窗 ≈ 8-12 像素清晰
- ✅ Stage 2 5 轮 hotfix 决策可在大窗下重新审视
- ❌ 30 分钟 dev toggle 工程（但是 Stage 3 互换按钮的雏形 · 不浪费）

PM 拍板：**走新顺序 + dev toggle 按钮（推荐方案）**

### 阶段 A ship（同日完成 · 1 atomic commit）

- 砍 main.ts 1632-1647 prototype svg fixed 300×200 浮窗
- Geo SVG 跟 M5 SVG 同级 mount 到 #app · viewBox 1200×800
- swap-button.ts 新建 · 复用 plan T3.2 工程（CanvasRole + STORAGE_KEY）· Stage 3 polish 时 mount 移 header + 视觉移 styles.css（函数签名不变）
- dev toggle 左上 fixed · localStorage 持久化跨刷新

### 阶段 B.1 反向验证 process 校准价值（同日完成 · 1 atomic commit）

PM 大窗实测立即给 6 条反馈 · 系统分类：

| # | 反馈 | 分类 | 处理 |
|---|---|---|---|
| 1 | 想再放大 / Google maps 感觉 | 真问题 · 用户主体感受验证 | **立即修 · B-3 backlog 解锁** |
| 2 | 圆点小了 / 重新考虑设计 | 真问题 · 设计错配 | **立即修 · baseR + 公式重设计** |
| 3 | 国名/地区名重叠 | "显示"模块 · 不卡主线 | backlog B-1 |
| 4 | click 仍没反应 | 大窗下也 fail · h2 z-index 假设排除 | backlog B-7 升级 |
| 5 | 人名/标签密度 | 同 #3 | backlog B-1 |
| 6 | 连线密集 / 后期按时间/地理多维度区分 | 真专题问题 | backlog B-8 NEW |

**关键洞察**：#1+#2 两条 PM 反馈直接 override 了 Stage 2 期间在小盒子下做的 3 个决策：
- DR-T2.1.hotfix3-3A-defer "K_MAX 32→64 暂不做" → 升级立即修
- DR-T2.1.hotfix2-B 反比公式 sqrt(k/2) → 调温和 sqrt(k/4)
- DR-T2.1.hotfix3-2A clamp 0.6 baseR 5/4/3 → clamp 0.5 baseR 8/7/6

**这就是 process 校准价值的兑现**：小盒子滤镜下的判断 · 大窗实物视角下重新拍板 · 1 个 atomic commit 解 2 个长期 backlog 隐患。

---

## 4. Lessons（Stage 2 + 阶段 A/B 期间新增 / 累积全 lessons）

### 沿用 Stage 1 takeaway § 4（9 lessons）+ Stage 2 anchor § 6.1-6.7（7 lessons）

详见 [Stage 1 takeaway § 4](./2026-05-22-b2-stage1-takeaway.md#4-lessonsb2-stage-1-期间新增-9-条--累积全-lessons) 和 [Stage 2 anchor § 6.1-6.7](./2026-05-22-b2-stage2-progress-anchor.md#6-stage-2-lessons-累积7-条--stage-1-9-lessons--stage-2-新-7-lessons)。

### 4.8 ⚠⚠⚠ jsdom 100% pass ≠ prod 工作 · interactive event 必须 PM 实测 ground truth **新案例 · 关键**

T2.2 click bug v1+v2 两轮 root cause fix · jsdom test 100% pass / prod 0% 工作。dragBehavior.clickDistance(5) + filter target=dot return false 两个不同 root cause 假设都被 prod 实测推翻。真根因仍未知（h1/h3-h6 新假设池待专项验证）。

**lesson**：interactive event (click / drag / hover / wheel) 必须 PM 实测作 ground truth · 不能用 jsdom test 通过当 ship gate。jsdom 是 DOM API 模拟器 · 不是浏览器引擎 / 不跑 SVG hit test / 不跑 d3-zoom internal state machine。

**修正机制**：
- click bug 类问题先用 `console.log` + `addEventListener('click', e => alert(...))` 在 prod F12 直接验
- 累加 fix 浪费时间应该 0 重启 diagnostic / 不要"v3 attempt"前先确认 v1+v2 假设池排除完整
- 落 memory `feedback_d3_drag_click_bug_intractable.md` 完整记录

### 4.9 ⚠⚠⚠ prototype 浮窗 PM checkpoint 滤镜污染 · 翻 plan 顺序 process 校准 **新案例 · process 关键**

详见上面 § 3 完整 case study。

**lesson 概括**：
- prototype 期临时小窗 mount（如 300×200 浮窗）会污染 PM 视觉判断 · 5 轮 hotfix 决策都打折扣
- AI 应主动 challenge plan 顺序的隐藏假设（"production safety 不破 M5"）· 不一味迎合
- 翻 plan 顺序在 vibe-coding 单 PM workflow 下 · PM 开发体验 > 隐性 production safety
- dev toggle 按钮（30min 工程）= Stage 3 正式互换按钮的雏形 · 不浪费工程
- 翻 plan 顺序 1 天后立即兑现价值（B.1 大窗实测 override 3 个 Stage 2 决策）

### 4.10 ⚠⚠ 小盒子下的 "暂不做 backlog" 决策大窗实测后可能 override · 资深产品 process 校准 **新案例**

DR-T2.1.hotfix3-3A "K_MAX 32→64 暂不做（cshapes 精度 limit 提醒）" 在 hotfix3 期 PM 拍板 defer · 但翻 plan 顺序后大窗实测 PM 立即说"还是想再放大 · Google maps 感觉"· defer 解除 · 升级立即修。

**lesson**：
- backlog "暂不做"决策的有效期跟 PM 视角绑定 · PM 视角变了（小盒子→大窗）· defer 决策需要复审
- 资深产品 process 校准动作：阶段切换时 review 之前 defer 的 backlog · 当前视角下是否需要 override
- 不要把"PM polish R 时拍 defer"当成"永远不做" · 视角变化是 process 信号

### 4.11 ⚠ plan T3.2 工程提前在 dev 期复用 · 函数签名不变 polish 时直接换 container

阶段 A swap-button.ts 复用 plan T3.2 设计：
- CanvasRole + STORAGE_KEY + mountSwapButton(container) 签名不变
- dev 期 mount 到 fixed div · Stage 3 polish 时 mount 移到 header.ts container · 不重写工程
- 视觉 inline style 在 main.ts wire 阶段 · Stage 3 时移到 styles.css `.swap-button` class

**lesson**：plan 设计的工程接口提前 dev 期复用时 · **保持签名不变** + 视觉/位置外置 · polish 时直接换 container 不重写。

---

## 5. Backlog（B-1 / B-7 / B-8 NEW / 其他 · 给 plan Stage 4+ 用）

| # | 项 | 来源 | 阶段 | 优先级 |
|---|---|---|---|---|
| **B-1** | 国名/地区/人名/标签密度统一调（PM 自分类"显示"模块 · 跟 cshapes 中文国名映射 70 states 同源）| Stage 2 hotfix2-C / 阶段 B.1 PM #3+#5 反馈 | Stage 4 或 Stage 6 polish | mid（PM "改显示就能解决"·后续统一调）|
| ~~B-3~~ | ~~K_MAX 32→64~~ | DR-T2.1.hotfix3-3A-defer | **阶段 B.1 已 ship** ✅ | done |
| **B-7** ⚠⚠⚠ | T2.2/T2.3 dot click 视觉无反应（v1 clickDistance + v2 dragBehavior.filter 两轮 root cause fix 都 prod fail · 大窗下仍 fail · **h2 z-index 假设排除** · 真根因更窄但仍未知）| PM polish R2 2026-05-24 + 阶段 B.1 PM #4 反馈 | 后期专项 polish R | mid-high · h1/h3-h6 新假设池验证 |
| **B-8 NEW** | 关系连线 V2 多维度区分（时间/地理/颜色/淡显 · 按 PM #6 "需要专题讨论 · 一步一步来"）| 阶段 B.1 PM #6 反馈 | 后期专题 brainstorm | mid（专题 · 不在主线）|
| **B-2** | 中文国名映射 70 states（Germany 1816-1870 → 普鲁士 / 1871+ → 德意志帝国 / Saxe-Weimar → 萨克森-魏玛）| spec § 4.7 + DR-T2.1.hotfix2-C 注 | Stage 4 | mid |
| **B-4** | 朋友项目优秀 pattern 参考（philosophy_vis · 双 land A/B cross-fade 450ms / clock-face 多层 ring + spoke）| T2.1.hotfix2 commit 借鉴报告 | Stage 4 cross-fade / Task 2.4 spreadOverlapping 升级 | low |
| **B-5** | plane 端 distance 仍可再试调（保留 1.5 fishbone 视觉 + 修"放大不能拖"根因）| Stage 1 takeaway § 5 #9 | Stage 6 polish | low |
| **B-6** | Marx 1843 国界静态 sample → 动态切片（当前 `historical-borders.ts:filterBordersAtYear(1843)` hardcode）| Stage 1 takeaway § 5 #10 | **plan Stage 4 主任务** | high（Stage 4 启动后即修）|

### click bug B-7 新假设池（v1+v2 都失败 · h2 大窗下排除 · 后期专项验证）

| 假设 | 大窗后状态 | 验证方法 |
|---|---|---|
| h1 M5 主图 svg-level click listener 拦了？ | 仍可能（list-main 时未切到 geo） | F12 console 查 `svg.on('click')` listener attach 情况 |
| ~~h2 z-index:1000 不够 / fixed/absolute element 遮~~ | **排除**（大窗 mount 到 #app · 无浮窗 z-index 拼贴）| — |
| h3 SVG hit test 跟 HTML 不同 | 仍可能 | prod F12 `document.querySelector('circle.geo-node[data-id="wd-q9061"]').addEventListener('click', e=>alert('YES'))` 试 |
| h4 dot pointer-events 被 default CSS 覆盖 | 仍可能 | Element panel inspect dot computed style |
| h5 prod build 跟 dev Vite tree-shake 差异 | 仍可能 | Network tab 看 bundle hash 跟 GH Actions 部署 hash 匹配 |
| h6 GH Pages CDN 缓存旧版本 / service worker | 仍可能 | 强刷 + service worker unregister |

---

## 6. PM 验收阀值 vs 实际（Stage 2 期 7 轮 PM checkpoint + 阶段 A/B 大窗 2 轮 · 全通过）

| 阶段 | PM checkpoint | 反馈 | 验收 |
|---|---|---|---|
| T2.1 | 1 轮 · PM 拍 A 数据策略 | "31 person 真数据先 ship" | ✅ |
| T2.1.hotfix R1 | 3 issue 反馈 | 1+2 OK / 3 仍不够 → R2 | ✅ partial |
| T2.1.hotfix2 R2 | 学 Google Maps 拍 A+B+C+D-defer | A+B+C ship | ✅ |
| T2.1.hotfix3 R3 polish | 边界浅 / dot 小 / K_MAX 64 暂不做 | 1A+2A ship · 3A defer | ✅ partial |
| T2.2 R4 | 6 候选拍 F | DR-106 F ship | ✅ |
| T2.3 R4 | 6 候选拍 ζ | DR-107 ζ ship | ✅ |
| T2.4 R5 | spreadOverlapping 复核 | "opportunistic 后续"（沿用 hybrid AI draft mode）| ✅ defer |
| 阶段 A 启动 R0 | 翻 plan 顺序提议 + dev toggle 方案 | "走新顺序 · dev toggle 按钮（推荐）" | ✅ |
| 阶段 B.1 大窗实测 R1 | 6 条反馈分类 | #1+#2 OK go / #3-6 backlog | ✅ |

**累积 PM 实测覆盖率**：每个 task 都过 PM checkpoint · 0 task 跳 PM 实测 ship · 符合 memory `feedback_inline_self_audit_stage_checkpoint`（3 层 review · TDD + 自审 + PM checkpoint）。

---

## 7. plan Stage 4 启动 checklist（历史国界 1818-1883）

按翻 plan 顺序后的新 sequence · Stage 4 是下一阶段：

### 当前已有（不需要新建）

- ✅ `src/lib/historical-borders.ts`（Stage 1 已写 · 当前 hardcode `filterBordersAtYear(1843)` 静态）
- ✅ CShapes-Europe GeoJSON dataset（Stage 0 已下载 · `public/geo/cshapes-europe.geojson`）
- ✅ Geo 主画布 mount + swap toggle（阶段 A ship）
- ✅ K_MAX 64 + baseR 8/7/6（阶段 B.1 ship · 大窗体验定型）

### Stage 4 真要做的

| Task | 内容 | 估时 | 依赖 |
|---|---|---|---|
| **T4.1** | `historical-borders.ts` 升级 · 动态时间切片（接 timeline `marx:time-change` event · year → filterBordersAtYear(year)）| 1d | timeline event dispatch（既有）|
| **T4.2** | 国界全连续过渡（拖时间游标 → 平滑 d3-transition 250-450ms · 跨年内插）| 1.5d | T4.1 |
| **T4.3** | 迁徙轨迹（已走实线 / 未来虚线 / 时间 forward 延长 · Marx 1818-1883 6 段行迹既有 MARX_LOCATIONS）| 1.5d | T4.1 |
| **T4.4** | PM checkpoint · 大窗实测时间轴 + 国界 + 迁徙轨迹联动 | 0.5d | T4.1+T4.2+T4.3 |

### Stage 4 启动前 PM 拍板项

- 国界过渡 timing（250ms / 450ms / 自适应跟时间轴 drag 速度）
- 迁徙轨迹视觉（紫色实线/虚线 · 跟节点 dot 同色）
- B-6 backlog 升级到 Stage 4 主任务

### 后续阶段 sequence

```
Stage 4 → Stage 5 副窗减法 → Stage 3 互换按钮 polish → Stage 7 ship + tag m-b2-final
```

---

## 8. 续接简单确认句（新窗口续接 / 给自己看）

> "我在续接 Marx M-B2 · Stage 2 + 阶段 A + 阶段 B.1 全 ship · HEAD `b2f9782` · tag `m-b2-stage2-final` 待 PM 拍板 · 翻 plan 顺序新 sequence：阶段 A→B→Stage 4→Stage 5→Stage 3→Stage 7 ship · PM 大窗实测验收通过（#1+#2 立即修 ship / #3+#5 B-1 / #4 B-7 / #6 B-8 NEW backlog）· 读 docs/2026-05-24-b2-stage2-plus-ab-takeaway.md 完整 8 section · 重点 § 3 翻 plan 顺序 process 校准 case study + § 4 lessons 4.8-4.11 + § 5 backlog 状态 + § 7 plan Stage 4 启动 checklist · 等 PM 拍 tag → 启动 Stage 4 历史国界（B-6 升级到主任务 · T4.1 historical-borders.ts 动态切片）"

---

## 9. handover checklist（PM 拍 tag m-b2-stage2-final 前确认）

- ✅ Stage 2 全 ship（T2.1 + hotfix + hotfix2 + hotfix3 + T2.2 F + T2.3 ζ + T2.4 spread + click bug v1/v2/defer）
- ✅ 阶段 A 翻 plan 顺序 ship（主画布切换 + dev swap toggle）
- ✅ 阶段 B.1 大窗 polish ship（K_MAX 64 + baseR 8/7/6）
- ✅ PM 大窗实测全通过（#1+#2 OK / #3+#5 B-1 / #4 B-7 / #6 B-8 NEW）
- ✅ DR-T2.1-A~hotfix3-3A-defer + DR-106 F + DR-107 ζ + click bug v1/v2/defer + DR-T2.4 + DR-stage-A + DR-stage-B.1 全落档
- ✅ Lessons 累积（Stage 1 9 + Stage 2 7 + 新 4 = 20 lessons）
- ✅ Backlog B-1/B-2/B-4/B-5/B-6/B-7/B-8 NEW 全落档（B-3 done）
- ✅ Bundle 50.10 KB safe（≤80 KB · 余 29.90 KB）
- ✅ Tests 450/453 pass（3 M3 pre-existing 持平）
- ✅ Lint 0/0
- ✅ deploy run `26357393006` success
- ⏳ tag `m-b2-stage2-final` 等 PM 拍 → push origin
- ⏳ 启动 plan Stage 4 历史国界（T4.1 动态切片 + T4.2 过渡 + T4.3 迁徙轨迹）

---

**Stage 2 + 阶段 A + 阶段 B.1 收尾完成 · 等 PM 拍 tag → 进 plan Stage 4。**
