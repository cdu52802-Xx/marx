# Marx M-B2 · Stage 2 实施期 SSOT · 新窗口续接锚点（2026-05-22 / 2026-05-24 updated）

> ⛔ **FROZEN（2026-05-24）· Stage 2 + 阶段 A + 阶段 B.1 全 ship · 新窗口续接走 [收尾 takeaway](./2026-05-24-b2-stage2-plus-ab-takeaway.md) 不走本 anchor · 本 anchor 保留作中段 trace history**

> **状态（已 frozen）**：Stage 2 · T2.1 + hotfix + hotfix2 (A+B+C) + hotfix3 (1A+2A) + T2.2 (DR-106 F) + T2.3 (DR-107 ζ) + click-bug v1+v2 都 ship · click bug v1+v2 prod 仍 fail 落 backlog 后期 polish · ~~当前等开工 T2.4 spreadOverlapping~~ → T2.4 已 ship + 阶段 A 翻 plan 顺序 + 阶段 B.1 大窗 polish 全 ship · HEAD `b2f9782` · 等 tag `m-b2-stage2-final`
> **当前 HEAD**：`14c2c7f`（T2.2 click-bug v2 attempt · dragBehavior.filter target=dot return false · PM 实测 prod 仍 fail · 真根因不明 / B-7 backlog · 后期 polish 新假设验证）
> **Git**：clean / origin/main 同步 / Stage 1 final tag = `m-b2-stage1-final`（`56874b9`）
> **Prod**：https://cdu52802-xx.github.io/marx/ → 主画面右上 300×200 prototype 浮窗
> **deploy 最近 success**：run 26276704839（T2.1.hotfix）/ 26272989896（Stage 1 revert）/ 26273443561（Stage 1 docs 收尾）
> **关联**：
> - [Stage 1 完整 takeaway](./2026-05-22-b2-stage1-takeaway.md)（19 commit · DR-097~105 · 9 lessons）
> - [spec § 4 B2](../specs/2026-05-20-m-b-mainline-design.md#4-b2--副窗地理图phase-3--5-6-周--7-stage)（§ 4.6 缩放谱系 · § 4.7 历史国界 · § 10 DR 清单）
> - [plan B2 8 stage](../plans/2026-05-21-marx-m-b2-geomap.md) Task 2.1~2.4
> - [Stage 0 recon SSOT](./2026-05-21-b2-data-source-recon.md)（cshapes spike）

---

## 1. ⚠⚠⚠ 新窗口 step 1 · 立即开工任务（PM 已拍 `go T2.4 spreadOverlapping`）

### Stage 2 至今 PM 反馈累积（5 轮 + ship 状态）

| 轮 | PM 反馈 | 实施 | 状态 |
|---|---|---|---|
| R1 (74150fb 后) | 背面节点透 / 拖拽多次失效 / 放大不够 / 圆点比国家大 | hotfix Issue 1+2+3 (74150fb) | ✅ |
| R2 (74150fb 后) | 仍嫌放大不够 / 学 Google Maps | hotfix2 A+B+C (61f2160) · K_MAX 32 + dot/stroke 反比 + 国名标签 | ✅ |
| R3 polish | 边界浅 / dot 小 / 想继续放大 | hotfix3 1A+2A (5bc89b4) · stroke dual lever + dot ratio clamp + outline · 3A K_MAX 64 defer | ✅ |
| R4 (T2.2) | 拍 F + Q1a+Q2b+Q3a+Q4a | DR-106 F ship (2da3834) | ✅ ship · click 行为 prod 不工作 |
| R4 (T2.3) | 拍 ζ + Q5a+Q6a+Q7a+Q8a · "先看看效果 / 不行后面再调" | DR-107 ζ ship (8a61bf3) | ✅ ship |
| R4 click bug | dot click 视觉无反应 | v1 clickDistance(5) (db68602) → prod fail · v2 dragBehavior.filter target=dot (14c2c7f) → prod 仍 fail | ⚠ v1+v2 都 fail / **暂落 backlog B-7 后期 polish** |

### ⚠⚠⚠ click bug B-7 backlog 关键说明（不要重启动调查 · 等 polish R）

- v1 + v2 两轮 root cause fix 都 fail · 真根因不明
- PM 决定 "现在暂时记录把 · 后期有机会再修" · **不卡 T2.4 推进**
- 新假设池见 § 6.8 polish 期 backlog（h1~h6 待后期专项验证）
- 不要在 T2.4 开工时顺便再 attempt v3 fix · PM 已明确 defer

### T2.4 spreadOverlapping 任务核心（PM 拍 go · plan 已有详细修法 · 不重 brainstorm）

`src/lib/geographic-data.ts` 加 spreadOverlapping(nodes: GeoNode[]): GeoNode[]：
- 同 lonLat 节点环形分布偏移
- 0.5° radius / `dLon = cos(angle)*0.5 / dLat = sin(angle)*0.5`
- byCoord Map 分组 / 同组 length > 1 才偏移
- 实施 ~30 行 · 跟 plan Task 2.4 完全 align

V1 数据热点：
- **伦敦** (Marx 1849+ · Engels 部分 · 多人聚集)
- **巴黎** (Marx 1843-45 · Proudhon · Bauer 等)
- 其他可能：柏林 / 科隆 / 布鲁塞尔（Marx 行迹叠 · 1-2 个 person 同址）

main.ts wire up：
- `const geoNodes = extractGeoNodes(persons);`
- 加 `const spreadNodes = spreadOverlapping(geoNodes);`
- 改 `mountGeographicCanvas({ ..., nodes: spreadNodes, ... });`

测试 5 case：
- 单 node 不偏移
- 同坐标 2 node 互对偏移（180°）
- 同坐标 4 node 等距 90°
- 不同坐标互不影响
- key 用 toFixed(4)（精度跟 plan 一致）

### PM 实测 T2.1.hotfix 后第 2 轮反馈（74150fb · 历史已 done · 保留 trace）

| Issue | PM 反馈 | 状态 |
|---|---|---|
| 1 背面节点透出 | ✅ OK | done |
| 2 多次拖拽后不能拖 | ✅ OK | done |
| 3 放大不够 · 圆点比国家大 | ⚠ 仍不够 · 让 AI 学 Google Maps | **已 ship hotfix2 A+B+C** |
| 4 圆点位置准确性 | PM 跳过 | 后续审核 |

### 学 Google Maps 第一性分析（已落档 / 见 lessons § 4）

Google Maps 用 tile pyramid + Web Mercator + vector tile · 我们单 SVG + 单 GeoJSON 永远做不到 Google Maps 极深 zoom。真"Google Maps 体验" = 换 Leaflet/Mapbox（V2 大决策 · prototype 期不做）。

### PM 拍 A+B+C 修法（prototype 期可行 · ~40 行 · 1-1.5h）

#### A · zoom 继续扩到 K_MAX=32（5 行 const）

`src/lib/projection.ts`：
```typescript
export const K_MAX = 32; // was 16 · PM 拍 A · 继续扩到看清单国家级别
export const SCALE_AT_K_MAX = 3200; // was 1600 · k=32 时 scale 翻倍
// K_DISTANCE_PLATEAU = 8 不变（distance 在 k>=8 plateau at 2 已稳定）
```

`src/components/geographic-canvas.ts`：
- `scaleExtent([1, K_MAX])` 自动跟（既有 import K_MAX）
- `wheelHandler` Math.min(K_MAX, ...) 自动跟（已用 K_MAX 常量）

效果：viewport k=32 显示约 **5°×3.5°**（比利时单国级别）

#### B · dot/stroke size 反比 zoom（5 行公式 · 治本 PM 痛点）⭐

`src/components/geographic-canvas.ts` render() 内：
- **dot radius**：`r = baseR / sqrt(k/2)` · k=1→5px / k=8→2.5px / k=32→1.25px
  - 公式：`(d.type === 'person' ? 5 : d.type === 'event' ? 4 : 3) / Math.sqrt(k / 2)`
- **border stroke-width**：`0.5 / sqrt(k/2)` · 同公式 · 高 zoom 时国界线不会太粗模糊
- **graticule stroke-width**：同上 · 视觉风格一致

直接解 PM 痛点 "圆点比某些国家还大" 消失。

#### C · 国名英文标签（30 行 + zoom threshold · 信息密度真增）

`src/components/geographic-canvas.ts` render() 内：
- 国界 polygon 用 `d3.geoCentroid(feature)` 算每国中心经纬度
- 渲染 `<text>` 标签：
  - `class="border-label"`
  - position：`projection(centroid)` 推到 pixel · 加 display 判断（背面 hide · 跟节点同公式 `geoDistance > clipAngleRad`）
  - 内容：`feature.properties.Name`（CShapes 字段 · 英文如 "Belgium"）
  - 字体大小跟 zoom 走：`font-size = 8 + 4 * Math.min(1, (k - 4) / 4)` · k>=4 才显（k<4 hide · 球面阶段不显标签）· k=4→8px / k=8+→12px
  - 颜色 #6a5a4a（沙石灰金深一点 · spec § 6 风格）
  - text-anchor middle · pointer-events none · opacity 0.75

**Backlog**：中文国名映射表（70 states · `Germany 1816-1870 → 普鲁士 / 1871+ → 德意志帝国 / Saxe-Weimar → 萨克森-魏玛` 等 · +1-2h 工程）· spec § 4.7 已规划 · **Stage 4 跟 timeline 国界动态切换一起做**

### Marx 项目级硬约束（必守）

1. **lint 0 warning 0 error**（`npm run lint -- --max-warnings=0`）
2. **中文 commit message 用 `git commit -F`**（Windows 编码 · 英文 commit 可 `-m`）
3. **atomic commit** · A+B+C 一起 1 commit · message 分 A/B/C 三段说明
4. **chain push 拒**（`git add` / `commit` / `push` 分开 · 不要 `&&`）
5. **push 后等 deploy success**（`until [ "$(gh run view <id> --json status -q .status)" = "completed" ]; do sleep 15; done`）
6. **不动 M5 主图 / B1 header / claim-popover / main.ts 临时 prototype mount**（保留 · Stage 5 真副窗才迁移）
7. **PM 主观感受 = ground truth**

### TDD 流程

新 test 至少覆盖：
- A：`projection.test.ts` · K_MAX=32 + SCALE_AT_K_MAX=3200 + 新 k=16/32 scale 期望值
- B：`geographic-canvas.test.ts` · 高 zoom 时 dot r < 5 · 节点 attr r 反比公式
- C：`geographic-canvas.test.ts` · k<4 无 border-label · k>=4 有 border-label · 跟 polygon 一对一

### Bundle 预估

T2.1.hotfix baseline 46.52 KB · +A+B+C ≈ +0.5 KB（centroid + text 渲染）· **47 KB safe ≤ 80 KB · 余 33 KB**

---

## 2. Stage 2 累积时间表（已 ship · 2026-05-22 当日）

| Step | commit | 内容 |
|---|---|---|
| Stage 1 final | `56874b9` | tag `m-b2-stage1-final` (revert 后 distance=2 baseline) |
| Stage 1 收尾 docs | `27f6fe0` | takeaway + DR-100~105 · 19 commit / 9 lessons |
| **T2.1** | `adfab6d` | geographic-data.ts + extractGeoNodes + swap lat/lng + 31 person 渲染（34 - 3 [0,0] filter）+ FIXTURE_NODES test 替代 TEST_NODES |
| **T2.1.hotfix** | `74150fb` | 3 PM 实测 issue 全改 · Issue 1 背面节点 great-circle 距离>clipAngle hide / Issue 2 统一 drag state 删 currentRotate / Issue 3 K_MAX 8→16 + distance plateau + scaleExtent + dot scale-aware preview |
| **T2.1.hotfix2** | `61f2160` | A+B+C 学 Google Maps · A K_MAX 16→32 + SCALE_AT_K_MAX 1600→3200 / B dot+stroke 反比 zoom (sqrt 公式 + clamp k<2 plateau) / C 国名英文标签 d3.geoCentroid + zoom>=4 trigger / D Leaflet/Mapbox 切换 deferred V2 |
| **T2.1.hotfix3** | `5bc89b4` | PM polish R1 · 1A 边界 stroke dual lever (strokeWidth clamp min 0.6 + 颜色 zoom-adaptive #d8cab0→#b8a880) + 2A dot ratio clamp baseR*0.6 (person ≥3 / event ≥2.4 / location ≥1.8) + 米白 outline stroke #fcfaf6 · 3A K_MAX 扩到 64 暂不做（PM 实测 1A+2A 后再决）|
| docs anchor | `5d5a39b` | Stage 2 anchor 落档 hotfix2+3 / DR-T2.1.hotfix2 A/B/C/D + hotfix3 1A/2A/3A / polish 期 backlog B-1~B-6 |
| **T2.2 DR-106 F** | `2da3834` | person 名字标签 D+E 混合 · D 球面 hide / plane k>=4 全显 / E hover 临时含生卒年 + click 持久 + 紫圈 + 加粗 · Q1a 紫 / Q2b 生卒年 / Q3a B1 DR-087 复用 / Q4a italic 紧贴右侧 / +18 test |
| **T2.2 click-bug v1** | `db68602` | clickDistance(5) attempt · PM 实测 prod 仍 click 无反应 · 假设错（鼠标移动 > 5px）|
| **T2.3 DR-107 ζ** | `8a61bf3` | 关系连线 V1 · geographic-relations.ts (NEW · 95 行) · 37 条 person-person arc 渲染 · Q5a 灰 #9b8b6f / Q6a opacity 0.25 / Q7a hover 临时 + click 持久 / Q8a 无方向 · +21 test |
| **T2.2 click-bug v2** | `14c2c7f` | dragBehavior.filter target=dot return false attempt (root cause fix) · **PM 实测 prod 仍 click 无反应** · v1+v2 都 fail / 真根因不明 / 落 backlog B-7 后期 polish 新假设验证 |

**Bundle 当前**（HEAD `14c2c7f`）：JS gzip **49.38 KB**（v2 fix +0.04 KB · 几乎不增）· safe ≤80 KB · 余 30.62 KB
**Tests**：430/433 pass · 3 M3 pre-existing 持平（Stage 2 全 +60+ new test）
**Lint**：0 warning 0 error
**新依赖**：无（Stage 2 沿用 Stage 1 d3-geo-projection + 新 import geoCentroid + d3-shape line · 既有）

---

## 3. 数据现状（关键认知 · 之前 plan 写错）

### 实际 vs plan 假设

| 类型 | plan 假设 | Marx schema 注释 | 实际数据 | 备注 |
|---|---|---|---|---|
| person | 50 | ~50 | **34**（其中 3 个 [0,0] 占位 filter · 实际渲染 31）| M2 录 |
| work | 0（plan 没提）| ~20 | 4 | M2 录 |
| concept | 0（plan 没提）| ~15 | 12 | M3 阶段 C 录 |
| event | **30** | ~30 | **0** ❌ | M3.5 milestone 推延 · 至今未做 |
| place | **6** | ~6 | **0** ❌ | M3.5 milestone 推延 · 至今未做 |

### plan 数字误读根因（核实结论）

- ❌ **不是**从 `C:\Users\xuzequan\Desktop\denizcemonduygu-data.json` 来（PM 怀疑过 · 已核实排除 · deniz schema 是 people/records/links · 跟 Marx 5 类节点完全不同族）
- ✅ **是** AI 写 B2 plan 时把 `src/types/Node.ts` schema 注释 "~50/~30/~6" 当成已录入数据 · 没 inspect `nodes_skeleton.json` 真数据 · 也没读 M3 plan line 23/26 看到 event/place 推 M3.5 脚注

### Backlog

要补齐 86 节点 = 建 **M3.5 数据补录 milestone**：
- 补 work +10-15
- 新建 event +30（schema 字段：start_date / end_date / location_lat_lng / participants_ids / description_event_style）
- 新建 place +6（schema 字段：lat_lng / marx_activity_description）
- 工程量：PM 录入 + AI 草稿协助 · 数天 · **跟 B2 解耦**（B2 用 31 person 先 ship）

---

## 4. 决策记录（Stage 2 期间累积）

| DR | 日期 | 决策 | 状态 |
|---|---|---|---|
| DR-097~105 | Stage 1 | 见 [Stage 1 takeaway § 2](./2026-05-22-b2-stage1-takeaway.md#2-决策清单dr-097099--stage-1-期间新增-dr-100105) | Stage 1 final |
| **DR-T2.1-A** | 2026-05-22 | Stage 2 T2.1 数据策略选 A · 31 person 真数据先 ship · event/place 数据缺口落 M3.5 backlog · 拒 hardcode 占位假数据 | T2.1 final |
| **DR-T2.1.hotfix-1** | 2026-05-22 | Issue 1 球面背面节点 hide · great-circle 距离 > acos(1/distance) 弧度 `display:none` | T2.1.hotfix final |
| **DR-T2.1.hotfix-2** | 2026-05-22 | Issue 2 统一 drag state · 删 currentRotate · 全程 panCenter（satellite `.center` 数学等价 `.rotate([-lng,-lat,0])`）· rotate API deprecated noop 保留接口 | T2.1.hotfix final |
| **DR-T2.1.hotfix-3** | 2026-05-22 | Issue 3 K_MAX 8→16 + SCALE_AT_K_MAX 800→1600 + K_DISTANCE_PLATEAU=8（distance 在 k>=8 plateau at 2）· 第一性：distance/scale 独立维度 · 看清欧洲 = scale 翻倍 / distance 不动 | T2.1.hotfix final |
| **DR-T2.1.hotfix2-A** | 2026-05-22 | **A · K_MAX 16→32 + SCALE_AT_K_MAX 1600→3200**（PM 拍 · 学 Google Maps zoom 极深方向）| hotfix2 final |
| **DR-T2.1.hotfix2-B** | 2026-05-22 | **B · dot/stroke size 反比 zoom**（sqrt 公式 + clamp k<2 plateau · 修 anchor 原公式 k=1 反向放大 bug）| hotfix2 final |
| **DR-T2.1.hotfix2-C** | 2026-05-22 | **C · 国名英文标签**（centroid + zoom>=4 trigger + 字体跟 zoom 走 · CShapes Name 字段 · 中文映射 70 states 留 Stage 4 backlog）| hotfix2 final |
| **DR-T2.1.hotfix2-D-defer** | 2026-05-22 | **D · 真换 Leaflet/Mapbox 不做**（V2 大决策 · 跟 Marx 思想史 spec scope 待 PM long-term vision 决策）| deferred |
| **DR-T2.1.hotfix3-1A** | 2026-05-22 | **1A · 边界 stroke 视觉权重 dual lever**（strokeWidth 绝对值 minAbs clamp 0.6 防 sub-pixel rendering antialiasing 稀释 + borderStrokeColor zoom-adaptive sphere #d8cab0 / plane k>=4 #b8a880 沙石深一档 · spec § 6 补充非违背）| hotfix3 final |
| **DR-T2.1.hotfix3-2A** | 2026-05-22 | **2A · dot 视觉 dual lever**（dotRadius ratio clamp baseR*0.6 · 资深设计自审：plane mode 节点仍是用户主角不该让位国家细节 + 加米白 outline stroke #fcfaf6 · separation 跟米白底图 contrast 增）| hotfix3 final |
| **DR-T2.1.hotfix3-3A-defer** | 2026-05-22 | **3A · K_MAX 32→64 暂不做**（PM 实测 1A+2A 修后是否仍需更深 zoom · 第一性：Issue 2 修后 dot 重新 visible / "想再放大"动机可能消 · cshapes 精度 limit 提醒）| pending PM polish R2 |
| **DR-106 F + Q1a+Q2b+Q3a+Q4a** | 2026-05-24 | **T2.2 person 名字标签 D+E 混合 ship** · 6 候选 (A 全显/B 仅 hover/C ≡ A/D zoom-adaptive/E hover+click/F D+E) · PM 拍 F + Q1a 紫 / Q2b 生卒年 / Q3a B1 DR-087 紫圈复用 / Q4a italic 紧贴右侧 | T2.2 final |
| **DR-107 ζ + Q5a+Q6a+Q7a+Q8a** | 2026-05-24 | **T2.3 关系连线 V1 ζ ship** · 6 候选 (α 单类/β 类型分色/γ 默认淡+click/δ zoom-adaptive/ε hide V1/ζ γ+hover) · 数据 reality 修正 plan 6 类（41 raw → 37 person-person arc / 95% influences + 1 mentor + 1 friend_collaborator）· PM 拍 ζ + Q5a 灰 / Q6a 0.25 / Q7a hover 临时+click 持久 / Q8a 无方向 | T2.3 final |
| **DR-T2.2-click-bug-v1** | 2026-05-22 | clickDistance(5) attempt · PM 实测 prod 仍 click 无反应 · v1 假设错（鼠标移动 > 5px 仍被 d3-drag 拦） | failed |
| **DR-T2.2-click-bug-v2** | 2026-05-24 | dragBehavior.filter target=dot return false attempt (root cause fix · d3-drag 完全不接管 dot mousedown) · **PM 实测 prod 仍 click 无反应** · v2 也 fail / 真根因不明 | failed |
| **DR-T2.2-click-bug-defer** | 2026-05-24 | **click bug 暂时记录落 backlog 后期 polish** · PM "现在暂时记录把 / 后期有机会再修" · 不卡 T2.4 推进 · 新假设见 B-7 backlog | deferred |

---

## 5. ⚠ A+B+C 实施 sequence（新窗口 step-by-step）

### Step 1：开窗口立即操作

```bash
cd F:\AI\projects\Marx
git pull origin main  # 应 HEAD = 74150fb（如有更新 / 应 = 含本 anchor commit 的 HEAD）
git status  # clean
```

### Step 2：读续接 SSOT（30 秒）

按顺序读：
1. **本文件**（`docs/2026-05-22-b2-stage2-progress-anchor.md`）/ 你正在读 · 完整 A+B+C 修法
2. [Stage 1 takeaway](./2026-05-22-b2-stage1-takeaway.md) § 7 Stage 2 启动 checklist · § 4 9 lessons
3. spec § 4.6 + § 4.7（缩放谱系 + 历史国界 · A+B+C 后 spec 更新待 Stage 2 收尾时）
4. 跳读 `plans/2026-05-21-marx-m-b2-geomap.md` Task 2.1~2.4（T2.1 已 ship · T2.2/2.3/2.4 待）

### Step 3：实施 A+B+C · 1 atomic commit

**严守**：
- A 先改 projection.ts K_MAX/SCALE_AT_K_MAX const · 不动 K_DISTANCE_PLATEAU
- B 在 canvas.ts render() 内 dot + stroke + graticule attr 用反比 zoom 公式
- C 在 canvas.ts render() 内加 border-label text · 用 d3.geoCentroid + projection + zoom threshold
- TDD：先写 fail test（projection.test K=32/scale=3200 / canvas.test 高 zoom dot r 小 / canvas.test 标签 trigger）→ impl → pass
- atomic commit / 中文 commit -F · message 分 A/B/C 三段 + 第一性原理参考 Google Maps 标注
- push 拆 + watch deploy 拆两步（既有 workflow）

### Step 4：PM 实测拍板 A+B+C 效果

PM 实测点：
- A：滚轮可放到 k=32（比之前 k=16 max 多 8 下）· viewport 显示约 5°×3.5°
- B：高 zoom 时 dot 变小 · 不再 cover 整个小国家（卢森堡 / Liechtenstein / Andorra）
- C：k>=4 显示国名英文标签 · zoom 越大字体越大（不喧宾夺主）· 球面阶段（k<4）无标签
- 既有保护不破（球面拖旋转 + 滚轮丝滑 + 拦 wheel + 统一 panCenter）

### Step 5：PM 拍 OK · 进 T2.2 brainstorm

T2.2 = 节点 size + 标签策略 mockup · PM checkpoint · DR-106
- 但 A+B+C 已经包含部分 T2.2 内容（dot size + 国名标签）
- T2.2 brainstorm 焦点收窄：**person 节点名字标签策略**（不是国名 · 是节点名）
- 3 mockup A/B/C：直接显 / hover 显 / 混合（人节点显 / 事件+地点 hover 显）
- brainstorming skill 召唤 · before-after 对比 mockup

### Step 6：T2.3 关系连线 6 候选 · PM 实测拍板 3-5 类（DR-107）

great-circle 已 ship（T1.2）· 直接用 · 实施 6 类型 (teacher/opponent/friend/influence/lived/participated) · 全显 PM 实测拍 3-5 类。

### Step 7：T2.4 同地多 marker 偏移策略

`spreadOverlapping` 环形分布 · 0.5° radius · 巴黎+伦敦+柏林等同地多类型节点防重叠。

### Step 8：Stage 2 收尾 takeaway + DR 落 spec

`docs/2026-05-2X-b2-stage2-takeaway.md`（沿用 Stage 1 风格 8 section）+ spec § 10 加 DR-T2.x 索引行。

---

## 6. Stage 2 Lessons 累积（7 条 · Stage 1 9 lessons + Stage 2 新 7 lessons）

### 6.1 ⚠⚠⚠ plan 数字必须 inspect 数据 reality 不照 schema 注释 **新案例 · 关键 process**

B2 plan 写 "86 节点（紫人 50 + 橙事件 30 + 灰地点 6）" · 实际数据 50 nodes（34 person + 4 work + 12 concept · 0 event / 0 place）· 缺口 -36。

**根因调查（之前完整 audit）**：
- ❌ 不是数据源文件被漏（项目内唯一 = `nodes_skeleton.json`）
- ❌ 不是 deniz data 混淆（PM 怀疑过 · deniz schema 是 people/records/links · 跟 Marx 5 类不同族）
- ✅ AI 写 plan 时把 `src/types/Node.ts` schema 注释 "~50/~30/~6" 当成"已录入数据" · 没 inspect 真数据 · 也没读 M3 plan line 23/26 看到 event/place 推 M3.5 脚注

**lesson**：plan 涉及具体数字时（节点数 / 关系数 / 实体数）· 先 `node -e 'JSON.parse(...)'` inspect 真数据 · 不照 schema 注释 / design doc 假设 · 否则 implementation 期撞数据缺口 · 临时返工 + 用户失望。

**修正机制**：plan writing-plans skill checklist 加 "inspect data file before quoting numbers" step。

### 6.2 ⚠⚠⚠ D3 projection.clipAngle 只 clip 地理 path 不 clip SVG circle **新案例 · 关键**

T2.1 PM 实测 Issue 1 球面背面节点透出。projection.clipAngle 只 clip 由 geoPath 生成的 SVG path（borders / graticule）· 不 clip 单独 SVG circle 元素 · 背面节点仍 render 在 (cx, cy) pixel 位置（D3 satellite 对背面点返回 valid pixel · 不是 null）。

**修法**：每节点算 great-circle 角距离到视野中心（panCenter ?? currentLoc）· > acos(1/distance) 弧度则 `display:none`。

`geoDistance` from d3-geo · 输入两点 [lng, lat] · 输出弧度。
clipAngleRad = `Math.acos(1 / currentDistance)` 弧度（跟 projection 内 `clipAngleForDistance` 函数同源 / 但内部用 degrees / render 内用 radians 单位需一致）。

性能：31 nodes / <1ms 每帧 · 干净。

### 6.3 ⚠⚠⚠ 两套 drag state（rotate vs panCenter）切 mode 不同步是 race 根因 · 统一 state **新案例 · 关键**

T1.6++++ 设计 sphere mode drag 改 currentRotate / transition+plane mode drag 改 panCenter · mode 切换时两 state 不互相同步。累积场景：
1. sphere drag 改 currentRotate（地球转到非中心）
2. 缩到 transition · drag 改 panCenter（基于 currentLoc 不是 currentRotate · panCenter 跟 currentRotate 不一致）
3. 缩回 sphere · render 用 panCenter ?? currentLoc 但 sphere mode rotate 用 currentRotate · 两 state 冲突 / projection 落非合理位置 / 节点跑出 viewport / drag 拿不到响应（mouse 拖空白 = "不能拖"）

**修法（第一性原理）**：satellite `.center([lng, lat])` 数学等价 `.rotate([-lng, -lat, 0])`（yaw + pitch · roll 默认 0）· 用户不需要 roll（地球不扭脖子）· 两 mode drag 数学+用户体验都等价。**统一用 panCenter 一套 state** · 删 currentRotate · drag 全程改 panCenter。

`rotate(deg)` API 保留接口 + deprecated noop（防 console 调用方破裂）· `interpolateProjection` else 分支自动 `rotate([-center[0], -center[1], 0])` 推。

### 6.4 ⚠⚠ distance vs scale 是独立维度 · "看清细节" = scale 翻倍 / distance 不动 **新案例**

T2.1.hotfix Issue 3 PM 反馈 "放大不够"。第一性 trade-off：
- `distance`（相机距地球 · 单位地球半径）→ 球面感 vs 平面感
- `scale`（投影像素密度 · D3 函数参数）→ viewport 内显示区域多大

PM 要"看清欧洲国家细节" = scale 翻倍 / **不需要 distance 更小**（更小撞 fisheye + 既往 "放大不能拖" bug）。

修法：K_MAX 8→16（后续 PM 仍嫌不够 / 拍 A+B+C 继续扩到 32）+ SCALE_AT_K_MAX 800→1600 + 新 K_DISTANCE_PLATEAU=8（distance 在 k>=8 plateau at 2 · 不再变小）。

### 6.5 ⚠⚠ 资深产品视角学第三方时区分 prototype vs production 架构 **新案例 · 关键 process**

PM 反馈 "放大不够 · 学 Google Maps"。第一性深思：
- Google Maps 用 **tile pyramid** + Web Mercator + vector tile + GPU 加速
- 我们用 **单 SVG + 单 GeoJSON** + D3 satellite + CPU 渲染
- 架构完全不同族 · 我们再调参也达不到 Google Maps zoom 极深

**修正认知**：学第三方不是抄方法 · 是理解 trade-off。Google Maps 是 production 级别 / 我们是 prototype。

**prototype 期可行方案（资深产品判断）**：
- A: 扩 K_MAX 治标（地图精度 limit 不在 zoom · 在 GeoJSON simplify · 但 PM 主观 OK）
- B: dot/stroke 反比 zoom 治本（直接解 PM 视觉痛点）
- C: 加国名标签信息密度真增（PM 之前没要求 / 但 dx 学 Google Maps 后必备 · 不然用户看不出"哪是哪国"）

**Backlog 真 Google Maps 体验**：换 Leaflet/Mapbox V2 大决策（不是 prototype 必做 · 跟 Marx 思想史 spec scope 看 PM long-term vision）。

### 6.6 ⚠ revert > force push 沿用 + git history 留可追溯（Stage 1 lesson 复用）

Stage 1 distance 1.5 引入"放大不能拖" bug · PM 拍 revert · 用 `git revert <hash>` 创建新 commit 撤销 · 不 force push · 保留 8b4a843 在 history。

Stage 2 没遇到 revert 场景 · 但 process 沿用（Marx 项目硬约束 #6 "NEVER 用 destructive git command unless explicit"）。

### 6.7 ⚠ classifier 对 gh 只读命令仍偶发误判 · 用 PowerShell 绕开 / 或 bash until 循环（lesson 复用 + 新案例 user_environment_china_network 加强）

Stage 2 T2.1 ship 后 gh API 撞 Windows network timeout（中国大陆 → api.github.com 偶发不通）· bash until 循环 + background retry 解决 / 不撞 classifier 直接 watch（既有 workaround）。

让用户知道 deploy 状态 = 拿 commit hash + GH Actions URL · PM 可浏览器直接看不依赖 AI 自动 watch。

### 累积应用既有 lesson

- `feedback_skill_score_vs_pm_truth.md`：PM 主观 = ground truth（本 Stage 2 全过程沿用 · A+B+C 拍板就是 PM 主观）
- `feedback_ai_self_judge_skills.md`：Stage 2 prototype 期不超调 skill · A+B+C 实施期不召 brainstorming / frontend-design（实施期不是 brainstorm 期）
- `workflow_manual_download_via_other_machine.md`：本 Stage 不涉及国外资源下载
- `feedback_deploy_verification_gap.md`：每次 push 都 `until [ status=completed ]; do sleep 15; done` watch
- `feedback_inline_self_audit_stage_checkpoint.md`：3 层 review（TDD + stage 间 + PM checkpoint）· Stage 2 重 PM checkpoint
- `feedback_auto_mode_chain_push.md`：git add / commit / push 全程分开跑
- `feedback_qa_dom_visibility_methodology.md`：本 Stage 不涉及

### 6.8 polish 期累积 backlog（PM polish R1 后追加 · 2026-05-22）

| # | 项 | 来源 | 阶段 | 优先级 |
|---|---|---|---|---|
| **B-7** ⚠⚠⚠ | **T2.2/T2.3 dot click 视觉无反应**（v1 clickDistance(5) + v2 dragBehavior.filter target=dot return false 两轮 fix 都失败 · PM 实测 prod 仍无紫圈/加粗/arc 联动 · 真根因不明）| PM polish R2 反馈 2026-05-24 | Stage 6 polish · 高优先（影响 F+ζ 体验）| mid-high · PM "现在暂时记录把 / 后期有机会再修" / 不卡 T2.4 推进 |
| **B-1** | **国名/地区标签重叠观感不舒服**（CShapes 70 states 标签密度 / 高 zoom 时部分国家边界紧凑标签碰撞）| PM polish R1 反馈 2026-05-22 | Stage 4 or Stage 6 polish | low（现阶段维持现状 · 后续有机会优化）|
| **B-2** | 中文国名映射 70 states（Germany 1816-1870 → 普鲁士 / 1871+ → 德意志帝国 / Saxe-Weimar → 萨克森-魏玛 等 · +1-2h 工程 · 跟 timeline 动态国界切换一起做）| spec § 4.7 + DR-T2.1.hotfix2-C 注 | Stage 4 | mid |
| **B-3** | K_MAX 32→64（PM 实测 1A+2A 后是否仍需更深 zoom · 真城市级 vector tile 留 V2 真解）| DR-T2.1.hotfix3-3A-defer | Stage 2 polish R2 待 PM 拍 | depending |
| **B-4** | 朋友项目优秀 pattern 参考（philosophy_vis · 双 land A/B cross-fade 450ms / clock-face 多层 ring + spoke）| T2.1.hotfix2 commit 借鉴报告 | Stage 4 cross-fade / Task 2.4 spreadOverlapping 升级 | low |
| **B-5** | plane 端 distance 仍可再试调（保留 1.5 fishbone 视觉 + 修"放大不能拖"根因）· 备案 mercator + 250ms d3-transition cross-fade | Stage 1 takeaway § 5 #9 | Stage 6 polish | low |
| **B-6** | Marx 1843 国界静态 sample → 动态切片（当前 historical-borders.ts:filterBordersAtYear(1843) hardcode）| Stage 1 takeaway § 5 #10 | Stage 4 | mid |

**click bug B-7 后期 polish 新假设池**（v1+v2 都失败 / 后期专项 brainstorm 验证）·
  v1 clickDistance(5) · 假设鼠标 < 5px 抖动 · prod fail = 实际 > 5px · ❌
  v2 dragBehavior.filter target=dot return false · 假设 d3-drag 拦 dot mousedown 是根因 · prod fail = 不是 d3-drag · ❌
  **新假设池**（后期专项验证 · 配 prod console 实测）·
    (h1) M5 主图 svg-level click listener 拦了？查 main.ts svg.on('click') · M5 outsideClickHandler / M5 viewport click 可能 stopPropagation
    (h2) z-index:1000 仍不够 · prototype svg 上面有 fixed/absolute element 遮（M5 timeline 浮窗 / B1 detail card 等）
    (h3) prototype svg 是 SVG element · 渲染在 body 上 · 浏览器 SVG hit test 跟 HTML 不同（点 dot 时实际 hit svg root 不 hit circle）
    (h4) dot pointer-events 被 default style 覆盖 (CSS `* { pointer-events: none }` 之类的 global rule？)
    (h5) prod build 跟 dev 行为差异（Vite tree-shake d3-selection .on 函数？）
    (h6) GH Pages CDN 缓存旧版本 / 强刷不够 / 浏览器 service worker 缓存
  diagnostic 工具 · prod F12 console:
    `document.querySelector('circle.geo-node[data-id="wd-q9061"]').addEventListener('click', e=>alert('YES'))` 试是否真能收到
    Element panel inspect dot · listeners tab 看 click listener attach 情况
    Network tab 看 GH Actions 部署的 bundle 跟最新 hash 匹配
    Console 看是否有 stopPropagation 抢

**国名重叠 B-1 资深设计后续优化备选**（落 Stage 4 / Stage 6 polish 时再正式 brainstorm）·
  (a) 标签碰撞检测（O(n²) 简单 AABB intersection · 重叠的次要国家隐藏）· 工程 30-60min
  (b) zoom-adaptive density（k=4 只显大国 5-10 个 / k=8 显 20 个 / k=16+ 显全部）· 跟 borderLabelFontSize 同 threshold pattern · 工程 20-40min
  (c) leader line 牵引线（centroid 远离碰撞中心 / 标签外移 + 短线连国 · 类似 d3-labeler）· 工程 1-2h
  (d) hover 才显 label（默认无标签 / 球面阶段已 hide / plane 阶段也 hide · hover 国家显标签 + tooltip）· 大改 UX · 工程 1-2h
  (e) 标签 outline / 描边（米白 outline 增可读性 · 不解重叠根因 · 跟 dot outline 同 pattern）· 工程 10-20min · 最低 ROI 但快

---

## 7. 续接简单确认句（新窗口 AI 自报）

> "我在续接 Marx M-B2 Stage 2 实施期 · HEAD `14c2c7f` · T2.1 + hotfix + hotfix2 (A+B+C) + hotfix3 (1A+2A) + T2.2 (DR-106 F) + T2.3 (DR-107 ζ) 全 ship · click bug v1+v2 都 fail / **暂落 backlog B-7 后期 polish · 不卡 T2.4 推进** · **PM 已拍 `go T2.4 spreadOverlapping`** · 读 docs/2026-05-22-b2-stage2-progress-anchor.md 完整 8 section / 重点 § 1 T2.4 修法 + § 4 DR-T2.4 待定 + § 6.8 backlog (B-7 click bug 高优先 / B-1 国名重叠 / B-3 K_MAX 64) · T2.4 后 → Stage 2 收尾 takeaway"

---

## 8. 切窗口前 handover checklist

- ✅ T2.1 ship (HEAD adfab6d) + deploy success
- ✅ T2.1.hotfix ship (HEAD 74150fb) + deploy success
- ✅ T2.1.hotfix2 A+B+C ship (HEAD 61f2160) + deploy success
- ✅ T2.1.hotfix3 1A+2A ship (HEAD 5bc89b4) + deploy success
- ✅ T2.2 DR-106 F ship (HEAD 2da3834) + deploy success
- ✅ T2.2 click-bug v1 attempt (HEAD db68602) + ship · prod fail
- ✅ T2.3 DR-107 ζ ship (HEAD 8a61bf3) + deploy success
- ✅ T2.2 click-bug v2 attempt (HEAD 14c2c7f) + ship · prod fail · backlog B-7
- ✅ Stage 1 收尾 takeaway 完整（DR-097~105 · 9 lessons · 19 commit）
- ✅ 数据现状调查完整（person + relation reality 跟 plan 假设差距全落档）
- ✅ A+B+C + 1A+2A + F + ζ 修法 全 PM 拍板 + ship
- ✅ DR-T2.1.hotfix2 A/B/C/D-defer + hotfix3 1A/2A/3A-defer + DR-106 F + DR-107 ζ + click-bug v1/v2/defer 全落 § 4
- ✅ Stage 2 polish 累积 backlog § 6.8 落档（B-7 click bug 高优先 / B-1 国名重叠 / B-3 K_MAX 64 / B-2/B-4/B-5/B-6 其他）
- ✅ Marx 项目硬约束 7 条沿用
- ⏳ T2.4 spreadOverlapping 待 PM 拍 `go` 开工
- ⏳ Stage 1 final tag `m-b2-stage1-final` push origin（Stage 2 final tag 等收尾 takeaway）

**T2.4 任务核心**（plan Task 2.4 已有详细修法 · 不需重 brainstorm）·
  `src/lib/geographic-data.ts:spreadOverlapping(nodes)` · 同坐标多 person 节点环形偏移 0.5° radius
  V1 数据热点 = 伦敦 (Marx 1849+ Engels 等) + 巴黎 (Marx 1843-45 Proudhon 等)
  实施 ~30 行 + test 5 case · 1 atomic commit + push + watch

新窗口拿 git pull · 完整读本 anchor 8 section · 立即 T2.4 implement（PM 已拍 go T2.4）。
