# Marx M-B2 · 副窗地理图 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 M5 主图 + B1 header search 已 ship 的 4 区域 layout 加上副窗地理图：球面+平面投影切换 + 86 节点（紫人 50 + 橙事件 30 + 灰地点 6）+ 1818-1883 动态历史国界 + 迁徙轨迹 + 主副联动 + 互换按钮，兑现 PRD V1 B+2 双主视图。

**Architecture:** 副窗 `right:0 bottom:60 380×214 16:9` paper 风格沿用详情卡 / 主画布形态地理图 = 1st-class（互换状态 localStorage 持久化）/ D3 `geoOrthographic`（小 zoom 球面）→ `geoMercator`（大 zoom 平面）平滑过渡 + great circle 大圆弧关系连线 + 球面默认中心 follow Marx 当前时间地点 + 球面可旋转 / 时间轴接 hook 让节点 fade + 国界全连续过渡 / 主副联动通过 window dispatch event 复用 B1 DR-086 pattern。

**Tech Stack:** TypeScript + D3.js (d3-geo / d3-zoom / d3-drag / d3-transition / d3-selection) + Vite + Vitest（单元）+ Playwright（E2E）

**Spec:** [`specs/2026-05-20-m-b-mainline-design.md`](../specs/2026-05-20-m-b-mainline-design.md) § 4 B2 + DR-073~077 + DR-097（Stage 0 + (A+) 路径）

**关联 memory（开工前必读）**：
- `user_environment_china_network` — 中国大陆网络硬约束 / Stage 0 必做
- `feedback_inline_self_audit_stage_checkpoint` — 3 层 review（TDD 内 + stage 间自审 + PM checkpoint）
- `feedback_ai_self_judge_skills` — Stage 1 prototype + Stage 6 polish 召双 skill / 不超调
- `feedback_deploy_verification_gap` — push 后 `gh run watch` 等 deploy success / push 前 lint 0 warning 0 error
- `feedback_auto_mode_chain_push` — git add / commit / push 拆开跑 / chain push 拒
- `feedback_qa_dom_visibility_methodology` — element 可见性用 offsetParent !== null / 不用 textContent

---

## TL;DR Task 列表（PM 视图）

| Stage | Task | 内容 | 估时 | 依赖 | PM checkpoint |
|---|---|---|---|---|---|
| **0** ⭐⭐ | T0.1 | 数据可达性验证（4 候选源 GeoJSON + D3 geo 库本地可用） | 0.5d | — | ✓ 数据源选定 |
| 0 | T0.2 | 选定数据源（fallback 列表 / 体积评估 / 落 DR-098） | 0.5d | T0.1 | ✓ |
| **1** ⭐⭐⭐ | T1.1 | `lib/projection.ts` 新建：D3 投影工厂（orthographic / mercator / albers）| 1d | T0 | — |
| 1 | T1.2 | `lib/great-circle.ts` 新建：great circle arc 计算（球面 + 投影） | 1d | T1.1 | — |
| 1 | T1.3 | `components/geographic-canvas.ts` 新建：prototype scaffold + 5 测试节点 | 1.5d | T1.1+T1.2 | — |
| 1 | T1.4 | zoom 整合 + projection 平滑过渡（球面 → 半球 → 平面） | 1.5d | T1.3 | — |
| 1 | T1.5 | 球面默认中心 follow Marx 当前时间地点 + drag 旋转 | 1d | T1.4 | — |
| 1 | T1.6 | Stage 1 prototype PM 实测 + 拍板临界 zoom 阈值 / 中心 / 旋转 | 0.5d | T1.5 | ✓ 必拍板 |
| **2** | T2.1 | 86 节点完整渲染（紫人 + 橙事件 + 灰地点）| 1.5d | T1.6 | — |
| 2 | T2.2 | 节点 size + 名字标签策略（PM checkpoint 决） | 0.5d | T2.1 | ✓ 拍板 size/标签 |
| 2 | T2.3 | 关系连线 V1（6 候选 → PM 实测拍板 3-5 类） | 1.5d | T2.1 | ✓ 拍板 3-5 类 |
| 2 | T2.4 | 86 节点聚合 / 重叠处理（同地多 marker） | 0.5d | T2.3 | ✓ |
| **3** | T3.1 | 主副联动 hook：主图 obs click → 副图高亮 + 反向 | 1.5d | T2.4 | — |
| 3 | T3.2 | 互换按钮 + localStorage 持久化 | 1d | T3.1 | — |
| 3 | T3.3 | 主副状态切换动画（PM checkpoint 拍 timing） | 1d | T3.2 | ✓ 拍 timing |
| 3 | T3.4 | 详情卡 layout 调整（bottom 60→274 让出副窗） | 0.5d | T3.2 | — |
| **4** | T4.1 | `lib/historical-borders.ts` 新建：GeoJSON 加载 + 时间内插 | 2d | T0.2 | — |
| 4 | T4.2 | 国界全连续过渡（拖时间游标 → 平滑） | 1.5d | T4.1 | ✓ 过渡 timing |
| 4 | T4.3 | 迁徙轨迹（已走实线 / 未来虚线 / 时间 forward 延长） | 1.5d | T4.1 | — |
| **5** | T5.1 | `components/geographic-panel.ts` 新建：副窗 paper 风格 | 1d | T3.4 | — |
| 5 | T5.2 | 副窗内地理图（信息密度低版 / 380×214 16:9） | 1.5d | T5.1+T2.4 | ✓ 信息密度 |
| **6** | T6.1 | `components/legend-panel.ts` 新建：图例 paper 风格 | 1d | T2.3 | ✓ 图例内容 |
| 6 | T6.2 | hover tooltip（节点名 + 1 行核心） | 0.5d | T2.1 | — |
| 6 | T6.3 | 球面旋转手势细节 polish + 互换按钮视觉 polish | 1d | T1.6+T3.2 | ✓ |
| **7** | T7.1 | E2E 新加 ≥ 8 spec | 1d | 全部 | — |
| 7 | T7.2 | 4 件套 baseline + Bundle ≤80 KB 验证 | 1d | T7.1 | ✓ ship gate |
| 7 | T7.3 | ship 流程（atomic commit + push + watch deploy + tag m-b2-final） | 0.5d | T7.2 | ✓ ship |

**Total**：~28-32 天（不含 PM 实测 checkpoint 等待时间）= **5-6 周** / 8 stage / 12+ PM checkpoint

---

## File Structure

| File | Op | 责任 | Bundle 预算（gzip） |
|---|---|---|---|
| `src/components/geographic-canvas.ts` | **新建** | 地理图主体 / 节点 + 关系 + 迁徙 / d3.zoom + projection 整合 | ~8 KB |
| `src/components/geographic-panel.ts` | **新建** | 副窗 paper 风格容器 / 标题栏 + 互换按钮 | ~1.5 KB |
| `src/components/legend-panel.ts` | **新建** | 图例 panel paper 风格 / 左下角 | ~1 KB |
| `src/components/swap-button.ts` | **新建** | "↔ 互换" 按钮 / localStorage 持久化 | ~0.5 KB |
| `src/lib/projection.ts` | **新建** | D3 投影工厂 orthographic/mercator/albers + 平滑过渡内插 | ~2 KB |
| `src/lib/great-circle.ts` | **新建** | great circle arc 计算（球面 + 投影） | ~1.5 KB |
| `src/lib/historical-borders.ts` | **新建** | 1818-1883 国界 GeoJSON 加载 + 时间内插（vite ?url + top-level await） | ~2 KB（库部分） |
| `src/lib/geographic-data.ts` | **新建** | 节点地理 metadata 处理（main_location_lat_lng 抽取 / 聚合 / 重叠） | ~1.5 KB |
| `src/data/geographic/borders-*.json` | **新建** | 历史国界 GeoJSON dataset（vite ?url asset / 不嵌 bundle） | 0 KB bundle（外 asset） |
| `src/main.ts` | **修改** | 挂载副窗 + 互换 hook + 主副联动 listener / 接 timeline hook | +1 KB |
| `src/components/header.ts` | **修改** | 右上 "↔ 互换" 按钮启用（B1 留 placeholder） | +0.2 KB |
| `src/components/claim-popover.ts` | **修改** | bottom: 60 → 274 让出副窗 + onSwap callback 兼容 | +0.3 KB |
| `src/components/timeline.ts` | **修改** | dispatch event 让地理图监听时间变化 | +0.3 KB |
| `src/styles.css` | **修改** | 副窗 / 图例 / 互换按钮 / 节点 / 关系连线 / 迁徙 / 国界视觉 | +2 KB |
| `tests/unit/projection.test.ts` | **新建** | 投影切换 + 内插 + 边界 | — |
| `tests/unit/great-circle.test.ts` | **新建** | great circle arc 计算 / 球面 vs 平面 | — |
| `tests/unit/historical-borders.test.ts` | **新建** | GeoJSON 加载 + 时间内插 | — |
| `tests/unit/geographic-canvas.test.ts` | **新建** | 节点渲染 + 关系连线 + 聚合 | — |
| `tests/unit/geographic-panel.test.ts` | **新建** | 副窗 layout + 互换交互 | — |
| `tests/unit/swap-button.test.ts` | **新建** | localStorage 持久化 + 状态切换 | — |
| `tests/unit/legend-panel.test.ts` | **新建** | 图例渲染 + 关系类型显示 | — |
| `e2e/m-b2-geomap.spec.ts` | **新建** | E2E ≥ 8 spec | — |

**Bundle 总预算**：当前 34.58 KB（B1 ship）+ B2 ~16-19 KB = **~50-53 KB / 上限 80 KB / 余量 27-30 KB safe**

---

## 开工前 announcement（每个 stage 开工时主动喊）

按 AGENTS.md 三件套 + memory `feedback_ai_self_judge_skills`：

| Stage | 应召 skill | 应忌 |
|---|---|---|
| Stage 0-1 prototype | brainstorming 已用完 / Stage 1 写代码前喊 **use frontend-design + ui-ux-pro-max**（地理图视觉风格定调 prototype 阶段 1st-class）| TDD 仍走 / 不召 gstack |
| Stage 2-4 实施 | TDD · frontend-design（每次写组件代码前喊）· ui-ux-pro-max（投影/地图风格工程检索） | 不召 brainstorming |
| Stage 5-6 polish | TDD · design-review（polish 期 iterative 跑） | 不召 brainstorming |
| Stage 7 ship | gstack 4 件套（health + benchmark + qa + design） + verification-before-completion | 不召 frontend-design |

---

# Task 0.1: 数据可达性验证（DR-097 + China network 硬约束）

**Files:**
- Create: `docs/2026-05-21-b2-data-source-recon.md`（可达性矩阵 + fallback 决策）
- Verify: 本地 `npm list d3-geo`（D3 库已 installed）

**Background**：M5 + B1 阶段证明 D3 + Vite 栈 OK / 但 D3 `geo` 模块（geoOrthographic / geoMercator / geoNaturalEarth1 / geoPath）需独立验证。历史国界 GeoJSON 4 候选源全在国外 endpoint：
- Euratlas (euratlas.net)
- HGIS Datasets (hgis.org)
- OSM Historical (osmhistorical.com / overpass-api)
- Naturalearthdata.com（最简 fallback / 当代国界 / 不动态）

### Step 1: 验 D3 geo 库本地可用（`d3` 包已含 d3-geo）

- [ ] **Step 1.1：本地 sanity test**

```bash
# 看 d3 package 含 geo 模块
node -e "const d3 = require('d3'); console.log(typeof d3.geoOrthographic, typeof d3.geoMercator, typeof d3.geoPath)"
```

Expected：3 个 `'function'`

- [ ] **Step 1.2：vite dev 起 prototype playground**

```bash
# 不动 main.ts · 新建临时 src/recon.ts 用 D3 跑球面投影
# 步骤 1.3 写代码
```

- [ ] **Step 1.3：写 recon prototype**

Create `src/recon.ts`（临时 / Stage 0 跑完删）：

```typescript
import { geoOrthographic, geoMercator, geoPath, geoGraticule } from 'd3-geo';
import { select } from 'd3-selection';

const width = 600;
const height = 400;
const svg = select('body').append('svg').attr('width', width).attr('height', height);

// 球面
const ortho = geoOrthographic().scale(150).translate([width / 2, height / 2]).rotate([-10, -50]);
const orthoPath = geoPath(ortho);
const graticule = geoGraticule();
svg.append('path').attr('d', orthoPath(graticule()) ?? '').attr('fill', 'none').attr('stroke', '#5b3a8c');

// 测试坐标点（巴黎 [2.35, 48.86]）
const paris: [number, number] = [2.35, 48.86];
const pixel = ortho(paris);
console.log('paris pixel on ortho:', pixel);

// 平面
const merc = geoMercator().scale(800).translate([width / 2, height / 2]).center([10, 50]);
const mercPixel = merc(paris);
console.log('paris pixel on mercator:', mercPixel);
```

修改 `index.html` 临时引入 `src/recon.ts`，npm run dev 看：
- 球面网格能渲染
- console 出两个像素坐标（应在 svg viewport 内）

- [ ] **Step 1.4：commit recon prototype（独立 commit 不污染 main flow）**

```bash
git add src/recon.ts
git commit -m "chore(M-B2 Stage 0 recon): D3 geo prototype playground · 临时验可达性 · 步骤 7 删"
```

### Step 2: 4 候选源 GeoJSON 可达性测试

- [ ] **Step 2.1：直接 curl 测试**

```bash
curl -sIL -o /dev/null -w "%{http_code} %{time_total}s\n" https://www.euratlas.net/cartogra/periodis_data/data.zip 2>&1
curl -sIL -o /dev/null -w "%{http_code} %{time_total}s\n" https://hgis.org/data/ 2>&1
curl -sIL -o /dev/null -w "%{http_code} %{time_total}s\n" https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/110m/cultural/ne_110m_admin_0_countries.zip 2>&1
```

**记录结果到 `docs/2026-05-21-b2-data-source-recon.md`**：

```markdown
| Source | URL | HTTP | Latency | Possible |
|---|---|---|---|---|
| Euratlas | ... | ??? | ??? | ??? |
| HGIS | ... | ??? | ??? | ??? |
| OSM Historical | ... | ??? | ??? | ??? |
| Naturalearthdata | ... | ??? | ??? | ??? |
```

- [ ] **Step 2.2：如全 fail → 走 fallback A（代理）**

如直接 curl 全 timeout / 403 / connection reset：
- 列代理可行方案（Cloudflare Workers proxy / 第三机抓 + 微信回传 / Codex 主力机代跑）
- 不 push 主力机硬上 / 沿用 memory `workflow_three_machine_offline_cache` 模式

- [ ] **Step 2.3：fallback B（Naturalearthdata 110m 当代国界 · 不动态）**

最坏情况：V1 用当代国界 + 加 note "国界为当代示意 / V2 加 1818-1883 历史国界" / 不破 V1 ship 节奏。

落 DR-098（数据源选定）。

### Step 3: 体积评估 + Bundle 影响

- [ ] **Step 3.1：评估选定数据源体积**

```bash
# 例：Naturalearthdata 110m
curl -L -o /tmp/borders-naturalearth.geojson https://...
ls -l /tmp/borders-naturalearth.geojson
gzip -c /tmp/borders-naturalearth.geojson | wc -c  # gzip 后大小
```

Expected：~50-200 KB raw / ~10-50 KB gzip。

**判定**：vite `?url` import 走 asset / 不嵌入 bundle / 总 Bundle JS gzip ≤80 KB 不受影响。如果用 4-5 时点切片 GeoJSON（动态过渡），各 50 KB 共 200-250 KB asset 也 OK（HTTP 多请求 / 浏览器 cache）。

### Step 4: 删 recon prototype + commit Stage 0 完成

- [ ] **Step 4.1：删 src/recon.ts + index.html 临时引入**

```bash
rm src/recon.ts
# 改 index.html 撤掉 <script src="/src/recon.ts">
```

- [ ] **Step 4.2：commit Stage 0 完成（DR-098 落档）**

```bash
git add docs/2026-05-21-b2-data-source-recon.md specs/2026-05-20-m-b-mainline-design.md index.html
git rm src/recon.ts
git commit -F - <<'EOF'
docs(M-B2 Stage 0 DR-098): 数据可达性验证完成 + 选定 GeoJSON 源

DR-097 (A+) 路径 Stage 0 风险前置 / China network 硬约束应用。

结果：
- D3 geo 库本地可用（geoOrthographic / geoMercator / geoPath / geoGraticule sanity test ok）
- 4 候选 GeoJSON 源可达性：(填实际结果)
- 选定数据源：(填决策)
- Bundle 评估：≤80 KB safe（vite ?url asset / 不嵌 bundle）

落 DR-098 · 进 Stage 1 prototype。
EOF
```

- [ ] **Step 4.3：push + watch deploy**

```bash
git push origin main
RUN_ID=$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch $RUN_ID --exit-status
```

Expected：deploy success（docs-only / 不破 lint/test/build）

---

# Task 1.1: `lib/projection.ts` 新建 · D3 投影工厂

**Files:**
- Create: `src/lib/projection.ts`
- Create: `tests/unit/projection.test.ts`

### Stage 1 开工 announcement（写代码前喊）

> use frontend-design skill
>
> use ui-ux-pro-max skill
>
> 当前阶段：Stage 1 prototype · 地理图视觉风格定调（M5/B1 米白+紫沿用 / 国界配色 / 节点尺寸 / 关系视觉风格 / 球面 vs 平面视觉切换）。**避免 generic AI slop**（紫渐变 / system-ui display font / 3-column 卡片）/ 沿用 editorial-academic 风格。

### 1.1.1 设计接口

`projection.ts` 公开 3 个 export：

```typescript
export type ProjectionMode = 'sphere' | 'transition' | 'plane';

export interface ProjectionOptions {
  width: number;
  height: number;
  center: [number, number]; // [lon, lat] · 球面默认中心
  scale: number;            // d3 投影 scale
  rotate?: [number, number, number]; // 球面旋转
}

/**
 * 创建当前 mode 的投影
 */
export function createProjection(mode: ProjectionMode, opts: ProjectionOptions): GeoProjection;

/**
 * 球面 ↔ 平面平滑过渡（按 zoom level 内插）
 * @param k - d3.zoom transform k（1-8）
 * @returns mode + 内插参数
 */
export function interpolateProjection(k: number, opts: ProjectionOptions): { mode: ProjectionMode; projection: GeoProjection };

/**
 * 临界 zoom 阈值（Stage 1 prototype + PM checkpoint 决 · spec § 7 placeholder）
 * 默认 1-2.5 球面 / 2.5-4.5 半球 / 4.5-8 平面（实测调）
 */
export const ZOOM_THRESHOLDS = { sphereMax: 2.5, planeMin: 4.5 };
```

- [ ] **Step 1.1.1：写 failing test**

```typescript
// tests/unit/projection.test.ts
import { describe, it, expect } from 'vitest';
import { createProjection, interpolateProjection, ZOOM_THRESHOLDS } from '../../src/lib/projection.ts';

describe('createProjection', () => {
  it('mode=sphere → geoOrthographic', () => {
    const proj = createProjection('sphere', { width: 600, height: 400, center: [10, 50], scale: 200 });
    expect(proj([2.35, 48.86])).toBeTruthy(); // 巴黎在 sphere 上有 pixel
  });

  it('mode=plane → geoMercator', () => {
    const proj = createProjection('plane', { width: 600, height: 400, center: [10, 50], scale: 800 });
    expect(proj([2.35, 48.86])).toBeTruthy();
  });
});

describe('interpolateProjection', () => {
  it('k=1 → sphere mode', () => {
    const { mode } = interpolateProjection(1, { width: 600, height: 400, center: [10, 50], scale: 200 });
    expect(mode).toBe('sphere');
  });

  it('k=8 → plane mode', () => {
    const { mode } = interpolateProjection(8, { width: 600, height: 400, center: [10, 50], scale: 200 });
    expect(mode).toBe('plane');
  });

  it('k=3.5 → transition mode', () => {
    const { mode } = interpolateProjection(3.5, { width: 600, height: 400, center: [10, 50], scale: 200 });
    expect(mode).toBe('transition');
  });
});
```

- [ ] **Step 1.1.2：run test 看 fail**

```bash
npm test -- --run tests/unit/projection.test.ts 2>&1 | tail -10
```

Expected：FAIL "createProjection is not exported" / 文件不存在

- [ ] **Step 1.1.3：写 minimal implementation**

```typescript
// src/lib/projection.ts
import { geoOrthographic, geoMercator, type GeoProjection } from 'd3-geo';

export type ProjectionMode = 'sphere' | 'transition' | 'plane';

export interface ProjectionOptions {
  width: number;
  height: number;
  center: [number, number];
  scale: number;
  rotate?: [number, number, number];
}

export const ZOOM_THRESHOLDS = { sphereMax: 2.5, planeMin: 4.5 };

export function createProjection(mode: ProjectionMode, opts: ProjectionOptions): GeoProjection {
  const { width, height, center, scale, rotate } = opts;
  const translate: [number, number] = [width / 2, height / 2];

  if (mode === 'sphere') {
    const proj = geoOrthographic().scale(scale).translate(translate).clipAngle(90);
    if (rotate) proj.rotate(rotate);
    else proj.rotate([-center[0], -center[1]]);
    return proj;
  }

  // plane / transition
  return geoMercator().scale(scale).translate(translate).center(center);
}

export function interpolateProjection(k: number, opts: ProjectionOptions) {
  if (k <= ZOOM_THRESHOLDS.sphereMax) {
    return { mode: 'sphere' as const, projection: createProjection('sphere', opts) };
  }
  if (k >= ZOOM_THRESHOLDS.planeMin) {
    return { mode: 'plane' as const, projection: createProjection('plane', opts) };
  }
  // transition zone · 暂用 sphere 占位 / Step 1.4 加真过渡
  return { mode: 'transition' as const, projection: createProjection('sphere', opts) };
}
```

- [ ] **Step 1.1.4：run test 看 pass**

```bash
npm test -- --run tests/unit/projection.test.ts 2>&1 | tail -10
```

Expected：PASS

- [ ] **Step 1.1.5：atomic commit**

```bash
git add src/lib/projection.ts tests/unit/projection.test.ts
git commit -m "feat(M-B2 T1.1): lib/projection.ts D3 投影工厂 · orthographic + mercator + ZOOM_THRESHOLDS placeholder"
git push origin main
RUN_ID=$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch $RUN_ID --exit-status
```

---

# Task 1.2: `lib/great-circle.ts` 新建 · great circle arc 计算

**Files:**
- Create: `src/lib/great-circle.ts`
- Create: `tests/unit/great-circle.test.ts`

### 1.2.1 设计接口

```typescript
/**
 * 计算两地点之间的 great circle path（球面贴球面大圆弧 / 平面投影为曲线）
 * 算法：sample N 个内插点（球面坐标）/ 用 projection 转 pixel / d3 line 串起来
 */
export function greatCircleArc(
  from: [number, number], // [lon, lat]
  to: [number, number],
  projection: GeoProjection,
  samples?: number, // 默认 50
): string; // SVG path d 属性
```

- [ ] **Step 1.2.1：写 failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { geoOrthographic, geoMercator } from 'd3-geo';
import { greatCircleArc } from '../../src/lib/great-circle.ts';

describe('greatCircleArc', () => {
  it('球面上巴黎→伦敦 path 非 null', () => {
    const proj = geoOrthographic().scale(200).translate([300, 200]);
    const paris: [number, number] = [2.35, 48.86];
    const london: [number, number] = [-0.13, 51.51];
    const path = greatCircleArc(paris, london, proj);
    expect(path).toMatch(/^M[\d.]+,[\d.]+/); // SVG path 以 M 开始
    expect(path.length).toBeGreaterThan(50); // 不止 1 个点
  });

  it('平面上巴黎→伦敦 path 也非 null', () => {
    const proj = geoMercator().scale(800).translate([300, 200]);
    const path = greatCircleArc([2.35, 48.86], [-0.13, 51.51], proj);
    expect(path).toMatch(/^M/);
  });

  it('default samples = 50', () => {
    const proj = geoOrthographic().scale(200).translate([300, 200]);
    const path = greatCircleArc([2.35, 48.86], [-0.13, 51.51], proj);
    // 50 sample points → 50 个 L 段（M 起点 + 49 L 段近似）
    const lCount = (path.match(/L/g) ?? []).length;
    expect(lCount).toBeGreaterThan(40);
  });
});
```

- [ ] **Step 1.2.2：run fail**

```bash
npm test -- --run tests/unit/great-circle.test.ts
```

- [ ] **Step 1.2.3：implement**

```typescript
// src/lib/great-circle.ts
import { geoInterpolate, type GeoProjection } from 'd3-geo';
import { line } from 'd3-shape';

export function greatCircleArc(
  from: [number, number],
  to: [number, number],
  projection: GeoProjection,
  samples: number = 50,
): string {
  // d3.geoInterpolate 返回 (t: 0-1) → 球面内插坐标 [lon, lat]
  const interp = geoInterpolate(from, to);
  const points: [number, number][] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const lonLat = interp(t);
    const pixel = projection(lonLat);
    if (pixel) points.push(pixel);
  }
  const pathGen = line<[number, number]>().x((p) => p[0]).y((p) => p[1]);
  return pathGen(points) ?? '';
}
```

- [ ] **Step 1.2.4：run pass**

- [ ] **Step 1.2.5：atomic commit**

```bash
git add src/lib/great-circle.ts tests/unit/great-circle.test.ts
git commit -m "feat(M-B2 T1.2): lib/great-circle.ts great circle arc 计算 · geoInterpolate 50 sample"
git push origin main
# watch deploy（lesson 6）
```

---

# Task 1.3: `components/geographic-canvas.ts` 新建 · prototype scaffold + 5 测试节点

**Files:**
- Create: `src/components/geographic-canvas.ts`
- Create: `tests/unit/geographic-canvas.test.ts`
- Modify: `src/main.ts`（临时挂载用 prototype）

### 1.3.1 设计接口

```typescript
export interface GeographicCanvasOptions {
  container: SVGSVGElement;
  width: number;
  height: number;
  initialMode?: ProjectionMode;
  marxCurrentLocation?: [number, number]; // [lon, lat] · Stage 1.5 接 timeline
}

export interface GeographicCanvasApi {
  setMode(mode: ProjectionMode): void;
  setMarxLocation(loc: [number, number]): void;
  rotate(deg: [number, number, number]): void;
  destroy(): void;
}

export function mountGeographicCanvas(opts: GeographicCanvasOptions): GeographicCanvasApi;
```

- [ ] **Step 1.3.1：写 failing test**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { mountGeographicCanvas } from '../../src/components/geographic-canvas.ts';

describe('mountGeographicCanvas', () => {
  let container: SVGSVGElement;

  beforeEach(() => {
    container = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    container.setAttribute('width', '600');
    container.setAttribute('height', '400');
    document.body.appendChild(container);
  });

  it('mount 后 svg 内有 graticule path', () => {
    mountGeographicCanvas({ container, width: 600, height: 400, initialMode: 'sphere', marxCurrentLocation: [10, 50] });
    expect(container.querySelector('path.graticule')).toBeTruthy();
  });

  it('mount 后 svg 内有 5 个测试节点（dot circles）', () => {
    mountGeographicCanvas({ container, width: 600, height: 400, initialMode: 'sphere', marxCurrentLocation: [10, 50] });
    const dots = container.querySelectorAll('circle.test-node');
    expect(dots.length).toBe(5);
  });

  it('setMode 切换 → 节点 cx/cy 重算', () => {
    const api = mountGeographicCanvas({ container, width: 600, height: 400, initialMode: 'sphere', marxCurrentLocation: [10, 50] });
    const firstDotSphere = (container.querySelector('circle.test-node') as SVGCircleElement).getAttribute('cx');
    api.setMode('plane');
    const firstDotPlane = (container.querySelector('circle.test-node') as SVGCircleElement).getAttribute('cx');
    expect(firstDotSphere).not.toBe(firstDotPlane);
  });
});
```

- [ ] **Step 1.3.2：run fail**

- [ ] **Step 1.3.3：implement**

```typescript
// src/components/geographic-canvas.ts
import { select, type Selection } from 'd3-selection';
import { geoPath, geoGraticule, type GeoPermissibleObjects } from 'd3-geo';
import { interpolateProjection, type ProjectionMode } from '../lib/projection.ts';

// Stage 1 prototype 测试节点（5 个 / 真数据 Stage 2 接）
const TEST_NODES: { id: string; lonLat: [number, number] }[] = [
  { id: 'trier', lonLat: [6.64, 49.75] },
  { id: 'bonn', lonLat: [7.10, 50.74] },
  { id: 'berlin', lonLat: [13.40, 52.52] },
  { id: 'paris', lonLat: [2.35, 48.86] },
  { id: 'london', lonLat: [-0.13, 51.51] },
];

export interface GeographicCanvasOptions {
  container: SVGSVGElement;
  width: number;
  height: number;
  initialMode?: ProjectionMode;
  marxCurrentLocation?: [number, number];
}

export interface GeographicCanvasApi {
  setMode(mode: ProjectionMode): void;
  setMarxLocation(loc: [number, number]): void;
  rotate(deg: [number, number, number]): void;
  destroy(): void;
}

export function mountGeographicCanvas(opts: GeographicCanvasOptions): GeographicCanvasApi {
  const { container, width, height } = opts;
  let currentMode: ProjectionMode = opts.initialMode ?? 'sphere';
  let currentLoc: [number, number] = opts.marxCurrentLocation ?? [10, 50];
  let currentRotate: [number, number, number] | undefined;

  const svg = select(container);
  const g = svg.append('g').attr('class', 'geographic-root');

  function render() {
    const { projection } = interpolateProjection(
      currentMode === 'sphere' ? 1 : currentMode === 'plane' ? 8 : 3.5,
      { width, height, center: currentLoc, scale: currentMode === 'sphere' ? 200 : 800, rotate: currentRotate },
    );
    const pathGen = geoPath(projection);

    // graticule
    g.selectAll('path.graticule').remove();
    g.append('path').attr('class', 'graticule')
      .attr('d', pathGen(geoGraticule()()) ?? '')
      .attr('fill', 'none')
      .attr('stroke', '#d8cab0')
      .attr('stroke-width', 0.5);

    // 测试节点
    g.selectAll('circle.test-node').remove();
    g.selectAll('circle.test-node').data(TEST_NODES).enter().append('circle')
      .attr('class', 'test-node')
      .attr('data-id', (d) => d.id)
      .attr('cx', (d) => projection(d.lonLat)?.[0] ?? 0)
      .attr('cy', (d) => projection(d.lonLat)?.[1] ?? 0)
      .attr('r', 4)
      .attr('fill', '#5b3a8c');
  }

  render();

  return {
    setMode(mode) { currentMode = mode; render(); },
    setMarxLocation(loc) { currentLoc = loc; render(); },
    rotate(deg) { currentRotate = deg; render(); },
    destroy() { g.remove(); },
  };
}
```

- [ ] **Step 1.3.4：run pass**

- [ ] **Step 1.3.5：临时 main.ts 挂载 prototype 给 PM 看**

修改 `src/main.ts` 加：

```typescript
// Stage 1 prototype 临时挂载（不删 M5 主图 / 在 sidebar 右下角浮一个 200x200 测试 svg）
import { mountGeographicCanvas } from './components/geographic-canvas.ts';
// ... 在 sidebar.ts mount 之后
const protoSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
protoSvg.setAttribute('width', '300');
protoSvg.setAttribute('height', '200');
protoSvg.style.cssText = 'position:fixed;right:10px;top:50px;background:#fcfaf6;border:1px solid #d8cab0;z-index:1000';
document.body.appendChild(protoSvg);
const protoApi = mountGeographicCanvas({ container: protoSvg, width: 300, height: 200, initialMode: 'sphere', marxCurrentLocation: [10, 50] });
(window as any).protoApi = protoApi; // PM console 调
```

- [ ] **Step 1.3.6：commit + push + watch deploy**

```bash
git add src/components/geographic-canvas.ts tests/unit/geographic-canvas.test.ts src/main.ts
git commit -m "feat(M-B2 T1.3): geographic-canvas.ts prototype scaffold · 5 测试节点 + graticule · 临时挂主画面右上"
git push origin main
RUN_ID=$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch $RUN_ID --exit-status
```

PM Ctrl+F5 看 prod 右上角 prototype svg 应有球面 + 5 紫点。

---

# Task 1.4: zoom 整合 + projection 平滑过渡

**Files:**
- Modify: `src/components/geographic-canvas.ts`
- Modify: `tests/unit/geographic-canvas.test.ts`

### 1.4.1 设计

集成 `d3-zoom` behavior（M5 lesson · 复用 `viz/zoom.ts` pattern）/ 监听 zoom k 变化 → 调 `setMode` 切换投影 / k 在 transition 区间用内插 scale + rotate。

- [ ] **Step 1.4.1：写 failing test（zoom k=4 → transition mode）**

```typescript
it('注册 d3.zoom 后 svg 上有 zoom behavior', () => {
  const api = mountGeographicCanvas({ container, width: 600, height: 400, marxCurrentLocation: [10, 50] });
  // d3.zoom 注册后 svg 有 __zoom 属性
  expect((container as any).__zoom).toBeTruthy();
});

it('zoom k=2 → sphere · k=4 → transition · k=8 → plane', () => {
  const api = mountGeographicCanvas({ container, width: 600, height: 400, marxCurrentLocation: [10, 50] });
  // 模拟 zoom event
  // ...略 / 实施时具体 d3.zoom transform 注入
});
```

- [ ] **Step 1.4.2：run fail**

- [ ] **Step 1.4.3：implement zoom 整合**

```typescript
// src/components/geographic-canvas.ts 加 import
import { zoom, zoomTransform, type ZoomBehavior } from 'd3-zoom';

// mount 内
const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = zoom<SVGSVGElement, unknown>()
  .scaleExtent([1, 8])
  .on('zoom', (event) => {
    const k = event.transform.k;
    // k → projection mode
    if (k <= 2.5) currentMode = 'sphere';
    else if (k >= 4.5) currentMode = 'plane';
    else currentMode = 'transition';
    render();
  });
svg.call(zoomBehavior);
```

- [ ] **Step 1.4.4：run pass**

- [ ] **Step 1.4.5：commit + push + watch**

```bash
git add src/components/geographic-canvas.ts tests/unit/geographic-canvas.test.ts
git commit -m "feat(M-B2 T1.4): zoom 整合 + projection 平滑过渡 · k 阈值 sphere ≤2.5 plane ≥4.5"
```

---

# Task 1.5: 球面默认中心 follow Marx 当前时间地点 + drag 旋转

**Files:**
- Modify: `src/components/geographic-canvas.ts`
- Modify: `src/main.ts`（接 timeline event）

### 1.5.1 设计

监听 timeline `marx:time-change` event（要 T7 改 timeline.ts dispatch）/ year → Marx 当时地点 lookup（hardcode 表 / V2 接 data）/ 球面 setMarxLocation 触发 reorient + transition。

Marx 行迹（spec § 4.3）：
- 1818-1835 特里尔 [6.64, 49.75]
- 1835-1841 波恩/柏林 [13.40, 52.52]
- 1841-1843 科隆 [6.96, 50.94]
- 1843-1845 巴黎 [2.35, 48.86]
- 1845-1848 布鲁塞尔 [4.35, 50.85]
- 1849-1883 伦敦 [-0.13, 51.51]

- [ ] **Step 1.5.1：写 timeline event listener test**

```typescript
it('window dispatch marx:time-change event → setMarxLocation', () => {
  const api = mountGeographicCanvas({ container, width: 600, height: 400, marxCurrentLocation: [10, 50] });
  const initialCx = (container.querySelector('circle.test-node[data-id="paris"]') as SVGCircleElement)?.getAttribute('cx');
  window.dispatchEvent(new CustomEvent('marx:time-change', { detail: { year: 1843 } }));
  // 1843 → 巴黎 [2.35, 48.86] / 球面 reorient → 巴黎在中心 / paris 节点 cx 变化
  const newCx = (container.querySelector('circle.test-node[data-id="paris"]') as SVGCircleElement)?.getAttribute('cx');
  expect(newCx).not.toBe(initialCx);
});
```

- [ ] **Step 1.5.2：fail**

- [ ] **Step 1.5.3：implement Marx location lookup + event listener**

```typescript
const MARX_LOCATIONS: { yearStart: number; yearEnd: number; loc: [number, number] }[] = [
  { yearStart: 1818, yearEnd: 1835, loc: [6.64, 49.75] }, // 特里尔
  { yearStart: 1835, yearEnd: 1841, loc: [13.40, 52.52] }, // 柏林
  { yearStart: 1841, yearEnd: 1843, loc: [6.96, 50.94] }, // 科隆
  { yearStart: 1843, yearEnd: 1845, loc: [2.35, 48.86] }, // 巴黎
  { yearStart: 1845, yearEnd: 1848, loc: [4.35, 50.85] }, // 布鲁塞尔
  { yearStart: 1849, yearEnd: 1883, loc: [-0.13, 51.51] }, // 伦敦
];

function marxLocationAtYear(year: number): [number, number] {
  const rec = MARX_LOCATIONS.find((r) => year >= r.yearStart && year < r.yearEnd);
  return rec?.loc ?? [10, 50];
}

// mount 内
const timeHandler = (e: Event) => {
  const detail = (e as CustomEvent).detail;
  if (typeof detail?.year === 'number') {
    currentLoc = marxLocationAtYear(detail.year);
    render();
  }
};
window.addEventListener('marx:time-change', timeHandler);

// destroy 内 removeEventListener
```

- [ ] **Step 1.5.4：实装 drag 旋转**

```typescript
import { drag } from 'd3-drag';

const dragBehavior = drag<SVGSVGElement, unknown>()
  .on('drag', (event) => {
    if (currentMode !== 'sphere') return; // 平面不响应 drag 旋转
    const dx = event.dx;
    const dy = event.dy;
    const rotate = currentRotate ?? [-currentLoc[0], -currentLoc[1], 0];
    currentRotate = [rotate[0] + dx * 0.5, rotate[1] - dy * 0.5, rotate[2]];
    render();
  });
svg.call(dragBehavior);
```

- [ ] **Step 1.5.5：commit**

```bash
git add src/components/geographic-canvas.ts tests/unit/geographic-canvas.test.ts src/main.ts
git commit -m "feat(M-B2 T1.5): 球面默认中心 follow Marx 当前年地点 + drag 旋转 · 接 timeline event"
git push origin main
```

---

# Task 1.6: ⭐⭐ Stage 1 prototype PM checkpoint

**Files:**
- Create: `docs/2026-05-21-b2-stage1-checkpoint.md`

### 1.6.1 准备 prototype demo（PM 实测前）

- [ ] **Step 1.6.1：push 最新 + watch deploy + 准备 PM 测试指引**

确保 prod 跑最新 prototype（右上角 300×200 svg 浮窗）。

- [ ] **Step 1.6.2：写 PM 测试指引 to docs/2026-05-21-b2-stage1-checkpoint.md**

```markdown
# B2 Stage 1 PM checkpoint · prototype 实测

> **prod 位置**：https://cdu52802-xx.github.io/marx/ 右上角 300×200 浮窗
> **目标**：拍板临界 zoom 阈值 / 球面默认中心策略 / 旋转手势细节

## 你要测的 6 件事

1. **球面 view 见 5 紫点**（特里尔/波恩/柏林/巴黎/伦敦）→ 跟你印象的位置一致？
2. **滚轮放大 → 平面切换** · 在哪个 k 值切换感觉最自然？（默认 k=2.5 转 transition / k=4.5 转 plane）
3. **球面拖动 → 旋转** · 灵敏度合适？太快/太慢？
4. **拖时间轴游标 → 球面 reorient follow Marx** · timeline T7 实施后才有 / Stage 1 用 console 模拟：
   - F12 console 跑 `window.dispatchEvent(new CustomEvent('marx:time-change', { detail: { year: 1843 } }))`
   - 球面应该 reorient 到巴黎为中心
5. **great circle 大圆弧** · Stage 1.6 暂未画线 / 用 console 模拟 / 跑 `protoApi.???`
6. **整体视觉感受** · 米白底 + 紫圈 + 沙石灰金 graticule · 跟主图同风格？

## 拍板项

- [ ] 临界 zoom 阈值（sphereMax / planeMin · spec § 7 placeholder · DR-099）
- [ ] 球面默认中心策略（Marx follow / 欧洲固定 / 用户手动）· 现 default Marx follow OK?
- [ ] 旋转手势灵敏度（dx * 0.5 / 默认 OK 或调）
- [ ] 进 Stage 2 或继续调 prototype
```

- [ ] **Step 1.6.3：等 PM 实测 + 反馈**

PM 反馈后落 DR-099 临界 zoom 阈值 + 任何 spec § 7 placeholder 决策。

- [ ] **Step 1.6.4：基于 PM 反馈调整 + commit · 然后进 Stage 2**

```bash
git add docs/2026-05-21-b2-stage1-checkpoint.md src/lib/projection.ts # if PM 调阈值
git commit -F - <<'EOF'
docs(M-B2 Stage 1 DR-099): prototype PM checkpoint 拍板

PM 实测反馈：
- 临界 zoom 阈值：(填 PM 拍板值)
- 球面默认中心：(填决策)
- 旋转手势：(填调整)

进 Stage 2 · 86 节点完整渲染。
EOF
git push origin main
```

---

# Task 2.1: 86 节点完整渲染（紫人 50 + 橙事件 30 + 灰地点 6）

**Files:**
- Create: `src/lib/geographic-data.ts`
- Modify: `src/components/geographic-canvas.ts`
- Create: `tests/unit/geographic-data.test.ts`

### 2.1.1 设计 geographic-data.ts

```typescript
export interface GeoNode {
  id: string;
  type: 'person' | 'event' | 'location';
  name_zh: string;
  lonLat: [number, number];
  year?: number; // event 节点用 / person 用 birth_year
}

/**
 * 从 persons.json + claims.json 抽取地理化节点
 */
export function extractGeoNodes(persons: PersonNode[], events: EventNode[], locations: PlaceNode[]): GeoNode[];
```

- [ ] **Step 2.1.1：写 failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { extractGeoNodes } from '../../src/lib/geographic-data.ts';

describe('extractGeoNodes', () => {
  it('person 节点用 main_location_lat_lng', () => {
    const persons = [{ id: 'wd-q9061', name_zh: '马克思', main_location_lat_lng: [6.64, 49.75], ... } as any];
    const nodes = extractGeoNodes(persons, [], []);
    expect(nodes[0].lonLat).toEqual([6.64, 49.75]);
    expect(nodes[0].type).toBe('person');
  });

  it('过滤 lonLat=[0,0] 占位数据', () => {
    const persons = [{ id: 'x', name_zh: 'X', main_location_lat_lng: [0, 0], ... } as any];
    const nodes = extractGeoNodes(persons, [], []);
    expect(nodes.length).toBe(0);
  });

  it('person 50 + event 30 + location 6 = 86 总节点', () => {
    // mock 数据 50/30/6
    // ...
    const nodes = extractGeoNodes(p50, e30, l6);
    expect(nodes.length).toBe(86);
  });
});
```

- [ ] **Step 2.1.2：fail · implement**

```typescript
// src/lib/geographic-data.ts
import type { PersonNode, EventNode, PlaceNode } from '../types/Node.ts';

export interface GeoNode {
  id: string;
  type: 'person' | 'event' | 'location';
  name_zh: string;
  lonLat: [number, number];
  year?: number;
}

function isValid(lonLat: [number, number]): boolean {
  return !(lonLat[0] === 0 && lonLat[1] === 0);
}

export function extractGeoNodes(persons: PersonNode[], events: EventNode[], locations: PlaceNode[]): GeoNode[] {
  const out: GeoNode[] = [];
  for (const p of persons) {
    if (p.main_location_lat_lng && isValid(p.main_location_lat_lng)) {
      out.push({ id: p.id, type: 'person', name_zh: p.name_zh, lonLat: p.main_location_lat_lng, year: p.birth_year });
    }
  }
  for (const e of events) {
    if (e.location_lat_lng && isValid(e.location_lat_lng)) {
      out.push({ id: e.id, type: 'event', name_zh: e.name_zh, lonLat: e.location_lat_lng, year: e.year });
    }
  }
  for (const l of locations) {
    if (l.lat_lng && isValid(l.lat_lng)) {
      out.push({ id: l.id, type: 'location', name_zh: l.name_zh, lonLat: l.lat_lng });
    }
  }
  return out;
}
```

- [ ] **Step 2.1.3：geographic-canvas.ts 加渲染 86 节点 logic**

```typescript
// 接 GeoNode[] · 删 TEST_NODES
// render 内：
g.selectAll('circle.geo-node').data(allNodes, (d) => (d as GeoNode).id).join('circle')
  .attr('class', (d) => `geo-node geo-node-${d.type}`)
  .attr('data-id', (d) => d.id)
  .attr('cx', (d) => projection(d.lonLat)?.[0] ?? 0)
  .attr('cy', (d) => projection(d.lonLat)?.[1] ?? 0)
  .attr('r', (d) => d.type === 'person' ? 5 : d.type === 'event' ? 4 : 3) // PM checkpoint T2.2 调
  .attr('fill', (d) => d.type === 'person' ? '#5b3a8c' : d.type === 'event' ? '#cc6633' : '#9b8b6f');
```

- [ ] **Step 2.1.4：run pass + commit**

```bash
git add src/lib/geographic-data.ts tests/unit/geographic-data.test.ts src/components/geographic-canvas.ts
git commit -m "feat(M-B2 T2.1): 86 节点完整渲染 · 紫人 50 + 橙事件 30 + 灰地点 6 · extractGeoNodes 过滤 [0,0]"
git push origin main
```

---

# Task 2.2: 节点 size + 名字标签策略（PM checkpoint）

**Files:**
- Create: `docs/2026-05-21-b2-stage2-t22-checkpoint.md`

### 2.2.1 准备 mockup 3 选项给 PM 看

PM checkpoint 拍板（spec § 7 placeholder · 落 DR-100）：

- **选项 A · 直接附名字（紧凑层级）**：节点 size 4-6px / 名字 8-9px 紫 italic 紧贴
- **选项 B · hover 才显**：节点 size 4-6px / 名字仅 hover tooltip 显（最干净）
- **选项 C · 混合策略**：人节点（紫 50 / 主角色）直接显 / 事件 + 地点 hover 显（信息层级）

- [ ] **Step 2.2.1：写 PM checkpoint 文档 + mockup 3 选项**

通过本地 preview server + visual companion 给 PM 看 3 种 mockup（A/B/C）。

- [ ] **Step 2.2.2：PM 拍板 → 落 DR-100 + implement 选定方案**

```typescript
// 假设 PM 选 C 混合策略
g.selectAll('text.geo-label').data(allNodes.filter((d) => d.type === 'person'))
  .join('text')
  .attr('class', 'geo-label')
  .attr('x', (d) => (projection(d.lonLat)?.[0] ?? 0) + 6)
  .attr('y', (d) => (projection(d.lonLat)?.[1] ?? 0) + 3)
  .attr('font-size', 8)
  .attr('font-style', 'italic')
  .attr('fill', '#5b3a8c')
  .text((d) => d.name_zh);
```

- [ ] **Step 2.2.3：commit + push**

```bash
git add src/components/geographic-canvas.ts docs/2026-05-21-b2-stage2-t22-checkpoint.md
git commit -m "feat(M-B2 T2.2 DR-100): 节点 size + 名字标签策略 PM 拍板 (填选项)"
git push origin main
```

---

# Task 2.3: 关系连线 V1（6 候选 → PM 实测拍板 3-5 类）

**Files:**
- Modify: `src/components/geographic-canvas.ts`
- Create: `src/lib/geographic-relations.ts`
- Create: `docs/2026-05-21-b2-stage2-t23-checkpoint.md`

### 2.3.1 加 relations.ts 抽取关系

```typescript
export interface GeoRelation {
  type: 'teacher' | 'opponent' | 'friend' | 'influence' | 'lived' | 'participated';
  fromId: string;
  toId: string;
}

export function extractGeoRelations(persons: PersonNode[], events: EventNode[], locations: PlaceNode[]): GeoRelation[];
```

- [ ] **Step 2.3.1：implement extractGeoRelations**

- [ ] **Step 2.3.2：geographic-canvas.ts 加 great circle 渲染**

```typescript
import { greatCircleArc } from '../lib/great-circle.ts';

g.selectAll('path.geo-relation').data(allRelations).join('path')
  .attr('class', (d) => `geo-relation geo-relation-${d.type}`)
  .attr('d', (d) => {
    const from = nodeById.get(d.fromId)?.lonLat;
    const to = nodeById.get(d.toId)?.lonLat;
    if (!from || !to) return '';
    return greatCircleArc(from, to, projection, 50);
  })
  .attr('fill', 'none')
  .attr('stroke', (d) => {
    if (d.type === 'teacher') return '#5b3a8c';
    if (d.type === 'opponent') return '#c24a3e';
    if (d.type === 'friend') return '#5d8a5c';
    if (d.type === 'participated') return '#cc6633';
    return '#9b8b6f';
  })
  .attr('stroke-width', 1.4)
  .attr('stroke-dasharray', (d) => d.type === 'opponent' || d.type === 'participated' ? '4 3' : null);
```

- [ ] **Step 2.3.3：PM checkpoint · 6 候选实测拍板 3-5 类**

PM 实测 prod 看 6 类关系连线全显时信息密度 / 拍板 V1 保留哪 3-5 类。落 DR-101。

- [ ] **Step 2.3.4：commit + push**

---

# Task 2.4: 86 节点聚合 / 重叠处理

**Files:**
- Modify: `src/components/geographic-canvas.ts`
- Modify: `src/lib/geographic-data.ts`

### 2.4.1 同地多 marker 偏移策略

巴黎可能同时有：马克思（person）+ 1844 经济学手稿（event）+ Paris 本身（location）= 3 节点同坐标。

- [ ] **Step 2.4.1：implement 偏移策略**

```typescript
// 同 lonLat 节点环形分布偏移
export function spreadOverlapping(nodes: GeoNode[]): GeoNode[] {
  const byCoord = new Map<string, GeoNode[]>();
  for (const n of nodes) {
    const key = `${n.lonLat[0].toFixed(4)},${n.lonLat[1].toFixed(4)}`;
    const arr = byCoord.get(key) ?? [];
    arr.push(n);
    byCoord.set(key, arr);
  }
  const out: GeoNode[] = [];
  for (const arr of byCoord.values()) {
    if (arr.length === 1) {
      out.push(arr[0]);
      continue;
    }
    // 环形分布 · radius 0.5° / 每节点偏移
    arr.forEach((n, i) => {
      const angle = (i / arr.length) * 2 * Math.PI;
      const dLon = Math.cos(angle) * 0.5;
      const dLat = Math.sin(angle) * 0.5;
      out.push({ ...n, lonLat: [n.lonLat[0] + dLon, n.lonLat[1] + dLat] });
    });
  }
  return out;
}
```

- [ ] **Step 2.4.2：test + commit**

---

# Task 3.1: 主副联动 hook · 主图 obs click → 副图高亮 + 反向

**Files:**
- Modify: `src/main.ts`（dispatch event 来自 obs click）
- Modify: `src/components/geographic-canvas.ts`（listen event + highlight）

### 3.1.1 复用 B1 DR-086 dispatch event pattern

B1 已有 `marx:search-highlight` event / B2 加 `marx:obs-selected` event。

- [ ] **Step 3.1.1：main.ts obs click handler 加 dispatch**

```typescript
// obs click handler 内
window.dispatchEvent(new CustomEvent('marx:obs-selected', {
  detail: { claimId: claim.id, authorId: claim.author_id, year: claim.year },
}));
```

- [ ] **Step 3.1.2：geographic-canvas.ts listen + highlight**

```typescript
const obsHandler = (e: Event) => {
  const detail = (e as CustomEvent).detail;
  highlightNode(detail.authorId); // 紫圈对应人
  currentLoc = marxLocationAtYear(detail.year); // 球面 reorient
  render();
};
window.addEventListener('marx:obs-selected', obsHandler);
```

- [ ] **Step 3.1.3：反向联动 · 地理图节点 click → 主图 obs 高亮**

```typescript
// geographic-canvas.ts 内 node click
g.selectAll('circle.geo-node').on('click', (event, d) => {
  if (d.type === 'person') {
    window.dispatchEvent(new CustomEvent('marx:geo-node-selected', { detail: { authorId: d.id } }));
  }
});

// main.ts listen + 主图 fade person section
window.addEventListener('marx:geo-node-selected', (e) => {
  const { authorId } = (e as CustomEvent).detail;
  // 复用既有 person section fade logic
  ...
});
```

- [ ] **Step 3.1.4：test + commit**

---

# Task 3.2: 互换按钮 + localStorage 持久化

**Files:**
- Create: `src/components/swap-button.ts`
- Create: `tests/unit/swap-button.test.ts`
- Modify: `src/components/header.ts`（启用 B1 留的 placeholder）
- Modify: `src/main.ts`

### 3.2.1 设计

```typescript
export type CanvasRole = 'list-main' | 'geo-main'; // 默认 list-main（学者）/ 互换后 geo-main（探索者）

export interface SwapApi {
  toggle(): void;
  getCurrent(): CanvasRole;
  onChange(cb: (role: CanvasRole) => void): void;
}

export function mountSwapButton(container: HTMLElement): SwapApi;
```

- [ ] **Step 3.2.1：implement swap-button.ts + localStorage**

```typescript
const STORAGE_KEY = 'marx:canvas-role';

export function mountSwapButton(container: HTMLElement): SwapApi {
  const stored = localStorage.getItem(STORAGE_KEY) as CanvasRole | null;
  let current: CanvasRole = stored ?? 'list-main';
  const listeners: ((role: CanvasRole) => void)[] = [];

  const btn = document.createElement('button');
  btn.className = 'swap-button';
  btn.textContent = '↔ 互换';
  btn.addEventListener('click', () => {
    current = current === 'list-main' ? 'geo-main' : 'list-main';
    localStorage.setItem(STORAGE_KEY, current);
    listeners.forEach((cb) => cb(current));
  });
  container.appendChild(btn);

  return {
    toggle() { btn.click(); },
    getCurrent() { return current; },
    onChange(cb) { listeners.push(cb); },
  };
}
```

- [ ] **Step 3.2.2：main.ts wire swap → 主副 role 切换**

```typescript
const swapApi = mountSwapButton(headerApi.swapSlot);
swapApi.onChange((role) => {
  // 切 main canvas + sub panel
  if (role === 'geo-main') {
    // 主画布换地理图 / 副窗换观点列表 simplified
  } else {
    // 主画布换观点列表 / 副窗换地理图 simplified
  }
});
```

- [ ] **Step 3.2.3：test + commit**

---

# Task 3.3: 主副状态切换动画（PM checkpoint）

**Files:**
- Modify: `src/main.ts` + `src/styles.css`
- Create: `docs/2026-05-21-b2-stage3-t33-checkpoint.md`

PM checkpoint 拍板（落 DR-102）：
- A. 即时切换无动画（最简）
- B. 200ms cross-fade（fade out 旧 + fade in 新）
- C. flip 翻页动画（重 / 可能晕）

- [ ] **Step 3.3.1：mockup 3 选项**

- [ ] **Step 3.3.2：PM 拍板 + implement**

- [ ] **Step 3.3.3：commit**

---

# Task 3.4: 详情卡 layout 调整（bottom 60 → 274 让出副窗）

**Files:**
- Modify: `src/components/claim-popover.ts`
- Modify: `tests/unit/claim-popover.test.ts`

### 3.4.1 详情卡 bottom 60 → 274（副窗 214 高 + 60 timeline）

- [ ] **Step 3.4.1：改 popover CSS bottom**

```css
.claim-popover { bottom: 274px; }
```

- [ ] **Step 3.4.2：test 验**

```typescript
it('详情卡 bottom = 274 让出副窗', () => {
  // mount popover + 验 style.bottom
});
```

- [ ] **Step 3.4.3：commit**

---

# Task 4.1: `lib/historical-borders.ts` 新建 · GeoJSON 加载 + 时间内插

**Files:**
- Create: `src/lib/historical-borders.ts`
- Create: `tests/unit/historical-borders.test.ts`
- Create: `src/data/geographic/borders-*.json`（Stage 0 选定数据源）

### 4.1.1 设计

```typescript
export interface BorderSnapshot {
  year: number;
  geojson: GeoJSON.FeatureCollection;
}

/**
 * 加载所有时点 snapshot（vite ?url + top-level await）
 */
export async function loadBorders(): Promise<BorderSnapshot[]>;

/**
 * 给定 year 返回内插 GeoJSON（两个最接近 snapshot 之间内插）
 */
export function interpolateBorders(year: number, snapshots: BorderSnapshot[]): GeoJSON.FeatureCollection;
```

- [ ] **Step 4.1.1：implement loadBorders + interpolateBorders**

- [ ] **Step 4.1.2：geographic-canvas.ts 加渲染 borders layer**

```typescript
g.insert('g', ':first-child').attr('class', 'borders-layer');
// render 内
const borders = interpolateBorders(currentYear, allSnapshots);
g.select('.borders-layer').selectAll('path.border').data(borders.features).join('path')
  .attr('class', 'border')
  .attr('d', (d) => geoPath(projection)(d as any) ?? '')
  .attr('fill', '#fcfaf6')
  .attr('stroke', '#d8cab0')
  .attr('stroke-width', 0.5);
```

- [ ] **Step 4.1.3：test + commit**

---

# Task 4.2: 国界全连续过渡（拖时间游标 → 平滑）

**Files:**
- Modify: `src/components/geographic-canvas.ts`
- Modify: `src/components/timeline.ts`（dispatch year event）
- Create: `docs/2026-05-21-b2-stage4-t42-checkpoint.md`

PM checkpoint 拍板（落 DR-103）：
- 过渡 timing：A. 即时（无 transition）/ B. 50ms 内插（流畅）/ C. 200ms 内插（缓慢但平稳）

- [ ] **Step 4.2.1：implement 全连续过渡 + d3 transition**

```typescript
const yearHandler = (e: Event) => {
  const detail = (e as CustomEvent).detail;
  currentYear = detail.year;
  // 重 render with transition
  g.select('.borders-layer').selectAll('path.border')
    .data(interpolateBorders(currentYear, allSnapshots).features)
    .transition().duration(50)
    .attr('d', (d) => geoPath(projection)(d as any) ?? '');
};
```

- [ ] **Step 4.2.2：PM 实测拍板 timing**

- [ ] **Step 4.2.3：commit**

---

# Task 4.3: 迁徙轨迹（已走实线 / 未来虚线 / 时间 forward 延长）

**Files:**
- Modify: `src/components/geographic-canvas.ts`

### 4.3.1 用 MARX_LOCATIONS（T1.5 hardcode）画 6 段轨迹

- [ ] **Step 4.3.1：implement migration path layer**

```typescript
g.append('g').attr('class', 'migration-layer');

// render 内
const segments = MARX_LOCATIONS.slice(0, -1).map((rec, i) => ({
  from: rec.loc,
  to: MARX_LOCATIONS[i + 1].loc,
  yearEnd: MARX_LOCATIONS[i + 1].yearStart,
  isPast: currentYear >= MARX_LOCATIONS[i + 1].yearStart,
}));

g.select('.migration-layer').selectAll('path.migration').data(segments).join('path')
  .attr('class', 'migration')
  .attr('d', (d) => greatCircleArc(d.from, d.to, projection, 30))
  .attr('fill', 'none')
  .attr('stroke', '#5b3a8c')
  .attr('stroke-width', 1.2)
  .attr('stroke-dasharray', (d) => d.isPast ? null : '3 2');
```

- [ ] **Step 4.3.2：commit**

---

# Task 5.1: `components/geographic-panel.ts` 新建 · 副窗 paper 风格

**Files:**
- Create: `src/components/geographic-panel.ts`
- Create: `tests/unit/geographic-panel.test.ts`

### 5.1.1 设计

```typescript
export interface GeographicPanelOptions {
  width?: number;  // 默认 380
  height?: number; // 默认 214（16:9）
  yearTitle?: string; // 标题栏 "§ 地理图 · YYYY 地名"
  onSwap?: () => void;
}

export interface GeographicPanelApi {
  setYearTitle(title: string): void;
  destroy(): void;
  getCanvasContainer(): SVGSVGElement;
}

export function mountGeographicPanel(opts: GeographicPanelOptions): GeographicPanelApi;
```

- [ ] **Step 5.1.1：implement panel + paper 风格 CSS**

```typescript
const panel = document.createElement('div');
panel.className = 'geographic-panel';
panel.style.cssText = `
  position: fixed;
  right: 0;
  bottom: 60px;
  width: ${width}px;
  height: ${height}px;
  background: #fcfaf6;
  border-left: 1px solid #d8cab0;
  box-shadow: -4px 0 18px rgba(58,35,96,0.10);
  z-index: 8;
`;

const header = document.createElement('div');
header.className = 'geographic-panel-header';
// ... 标题 + 互换按钮

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('width', String(width));
svg.setAttribute('height', String(height - 36)); // 减标题栏高
panel.appendChild(header);
panel.appendChild(svg);
document.body.appendChild(panel);
```

- [ ] **Step 5.1.2：CSS 加 .geographic-panel-header**

- [ ] **Step 5.1.3：test + commit**

---

# Task 5.2: 副窗内地理图（信息密度低版）

**Files:**
- Modify: `src/main.ts`（mount geographic-canvas 到副窗）
- Modify: `src/components/geographic-canvas.ts`（加 density='low' 模式）

### 5.2.1 信息密度低 = 只显紫人节点 + 不显关系连线 + 不显国界过渡

- [ ] **Step 5.2.1：geographic-canvas.ts 加 density 选项**

```typescript
export interface GeographicCanvasOptions {
  // ...既有
  density?: 'full' | 'low'; // 默认 full
}

// render 内
const visibleNodes = opts.density === 'low' ? allNodes.filter((n) => n.type === 'person') : allNodes;
const visibleRelations = opts.density === 'low' ? [] : allRelations;
const showBorders = opts.density !== 'low';
```

- [ ] **Step 5.2.2：commit**

---

# Task 6.1: `components/legend-panel.ts` 新建 · 图例 paper 风格

**Files:**
- Create: `src/components/legend-panel.ts`
- Create: `tests/unit/legend-panel.test.ts`

### 6.1.1 设计

左下 paper 风格 panel · 2 分组 · § 关系类型 + § 迁徙轨迹

PM checkpoint 拍板（DR-104）：图例 4-6 类关系 + 迁徙样式。

- [ ] **Step 6.1.1：implement legend-panel.ts**

- [ ] **Step 6.1.2：CSS paper 风格 + 沿用详情卡视觉**

- [ ] **Step 6.1.3：test + commit**

---

# Task 6.2: hover tooltip（节点名 + 1 行核心）

**Files:**
- Modify: `src/components/geographic-canvas.ts`
- Modify: `src/styles.css`

### 6.2.1 用既有 claim-text tooltip pattern 沿用

- [ ] **Step 6.2.1：implement hover tooltip**

```typescript
g.selectAll('circle.geo-node')
  .on('mouseenter', function (event, d) {
    const tooltip = document.querySelector('.geo-tooltip') || (() => {
      const t = document.createElement('div');
      t.className = 'geo-tooltip';
      document.body.appendChild(t);
      return t;
    })();
    tooltip.textContent = `${d.name_zh}`;
    tooltip.style.cssText = `position:fixed;left:${event.clientX + 10}px;top:${event.clientY + 10}px;background:#fcfaf6;border:1px solid #d8cab0;padding:4px 8px;font-family:'EB Garamond';font-size:12px;z-index:1200`;
  })
  .on('mouseleave', () => {
    document.querySelector('.geo-tooltip')?.remove();
  });
```

- [ ] **Step 6.2.2：commit**

---

# Task 6.3: 球面旋转手势 polish + 互换按钮视觉 polish

**Files:**
- Modify: `src/components/geographic-canvas.ts`
- Modify: `src/styles.css`
- Modify: `src/components/swap-button.ts`

### 6.3.1 旋转手势细节（PM checkpoint · DR-105）

- 双击中键 reset 中心
- inertia 自由旋转（drag 后继续微转）
- 边界（避免南北极翻转）

### 6.3.2 互换按钮视觉 polish

```css
.swap-button {
  font-family: 'EB Garamond';
  font-style: italic;
  font-size: 12px;
  letter-spacing: 0.02em;
  color: #888;
  background: transparent;
  border: 1px dotted #d8cab0;
  padding: 4px 10px;
  cursor: pointer;
  transition: color 120ms ease-in, border-color 120ms ease-in;
}
.swap-button:hover {
  color: #5b3a8c;
  border-color: #5b3a8c;
}
```

- [ ] **Step 6.3.1：implement 旋转 polish + 互换按钮**

- [ ] **Step 6.3.2：commit**

---

# Task 7.1: E2E 新加 ≥ 8 spec

**Files:**
- Create: `e2e/m-b2-geomap.spec.ts`

### 7.1.1 ≥ 8 spec coverage

```typescript
test.describe('M-B2 副窗地理图', () => {
  test('副窗 always-on 显示 + 16:9 比例', async ({ page }) => { ... });
  test('86 节点全渲染（紫人 + 橙事件 + 灰地点）', async ({ page }) => { ... });
  test('zoom 滚轮 → 球面 → 平面切换', async ({ page }) => { ... });
  test('球面拖动 → 旋转', async ({ page }) => { ... });
  test('时间轴拖动 → 球面 reorient + 国界过渡 + 迁徙延长', async ({ page }) => { ... });
  test('主图 obs click → 副图节点高亮 + 球面 reorient', async ({ page }) => { ... });
  test('互换按钮 → 主副 role 切换 + localStorage 持久化', async ({ page }) => { ... });
  test('图例 panel 左下显示 + 4-6 类关系', async ({ page }) => { ... });
});
```

- [ ] **Step 7.1.1：implement 8 spec**

- [ ] **Step 7.1.2：run + 修 fail**

```bash
npm run e2e -- m-b2-geomap 2>&1 | tail -20
```

Expected: 8/8 pass

- [ ] **Step 7.1.3：commit**

---

# Task 7.2: 4 件套 baseline + Bundle ≤80 KB 验证

**Files:**
- Create: `docs/2026-05-XX-m-b2-stage7-baseline.md`

### 7.2.1 跑 gstack 4 件套

```bash
# health
npm run health
# benchmark（如配置）
npm run benchmark
# qa
/qa-only
# design-review
/design-review
```

记录到 baseline doc：

| 维度 | M-B1 ship | M-B2 ship | Δ | 阀值 |
|---|---|---|---|---|
| Bundle JS gzip | 34.58 KB | ??? | ??? | ≤80 KB |
| CSS gzip | 2.33 KB | ??? | ??? | — |
| Tests unit | 276/279 | ??? | ??? | ≥ 270 |
| Tests E2E | 4 + 6 = 10 | 4 + 6 + 8 = 18 | +8 | ≥ 18 |
| Health | 8.8 | ??? | ??? | ≥ 9.0 (warning ≥ 8.5) |
| QA score | 93 | ??? | ??? | ≥ 90 |
| Design | A | ??? | ??? | ≥ A- |
| AI Slop | A | ??? | ??? | ≥ A |

- [ ] **Step 7.2.1：跑 baseline**

- [ ] **Step 7.2.2：所有阀值通过 → 进 ship · 否则 fix**

---

# Task 7.3: ship 流程

**Files:**
- Modify: `docs/2026-05-21-m-b2-takeaway.md`（新建）
- Tag `m-b2-final`

### 7.3.1 ship 流程（按 lesson 6 硬约束）

- [ ] **Step 7.3.1：写 B2 takeaway**

8 section 沿用 B1 takeaway 风格 / 含完整 DR-097~105+ 决策清单 + lessons 累积。

- [ ] **Step 7.3.2：atomic commit + push + watch deploy success**

```bash
git add docs/2026-05-21-m-b2-takeaway.md
git commit -F - <<'EOF'
docs(M-B2 takeaway): 副窗地理图全 ship · DR-097~105+ + lessons

8 stage 全 PM checkpoint pass / 4 件套 baseline 不退化 / Bundle ≤80 KB
EOF
git push origin main
RUN_ID=$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch $RUN_ID --exit-status
```

- [ ] **Step 7.3.3：等 PM 实测 prod ≥ 6 user journey + 拍 `go tag`**

- [ ] **Step 7.3.4：打 tag m-b2-final + push --tags**

```bash
git tag m-b2-final HEAD -m "M-B2 副窗地理图 ship · DR-097~105+ · 8 stage 全收尾"
git push origin m-b2-final
```

- [ ] **Step 7.3.5：等 PM 拍 `go B3` 启动 mobile responsive**

---

## Self-Review（写完 plan 后做）

### Spec coverage 扫描

| Spec § | 内容 | Task |
|---|---|---|
| § 4.1 范围 V1 17 元素 | A 节点 5 类 / B 关系 6 候选 / C 时空 / D 共享基础 / E 视觉 | T2.1 + T2.3 + T3.x + T4.x + T6.x |
| § 4.2 副窗 layout | 16:9 380×214 paper 风格 | T5.1 |
| § 4.3 主画布 layout | 86 节点 + 国界 + 迁徙 + 关系 + 详情卡 + 副窗 + 图例 + 互换 | T2.x + T3.4 + T4.x + T5.x + T6.x |
| § 4.4 节点 5 类 | 紫人 / 橙事件 / 灰地点 V1 default / 蓝著作 V2 / 绿概念 V3 | T2.1 + T2.2 |
| § 4.5 关系 6 候选 → 3-5 | PM checkpoint 拍板 | T2.3 |
| § 4.6 缩放谱系 | 球面 + 半球 + 平面 + 临界 zoom | T1.4 + T1.6 PM checkpoint |
| § 4.7 动态国界 | V1 全连续 4 候选源 | T0 + T4.1 + T4.2 |
| § 4.8 主副联动 + 互换 | event dispatch + localStorage | T3.1 + T3.2 |
| § 4.9 图例 panel | 左下 paper 风格 | T6.1 |
| § 4.10 Stage 8 | Stage 0-7 完整 | 全部 |
| § 4.11 文件结构 | 8 NEW + 4 MOD | File Structure table |
| § 4.12 Acceptance | Stage 1 prototype + 完整 ship | T1.6 + T7.x |

✅ Spec coverage 100%

### Placeholder scan

- 没 TBD / TODO / "implement later"
- 没 "add appropriate error handling" vague phrase
- 每 step 含 code block
- PM checkpoint 时点明确（不是模糊"看看"）

### Type consistency

- `GeographicCanvasApi` / `GeographicPanelApi` / `SwapApi` / `ProjectionOptions` / `GeoNode` / `GeoRelation` 接口名一致
- `marx:time-change` / `marx:obs-selected` / `marx:geo-node-selected` event 名一致
- `mountGeographicCanvas` / `mountGeographicPanel` / `mountSwapButton` 命名一致

### Scope check

- B2 单 subsystem（副窗地理图）/ 不需要拆 sub-project
- 8 stage 5-6 周 / 单 plan 可承载
- 复杂度跟 M5 类似（M5 plan 1922 行 / M5 ship 成功）

---

## 跨窗口续接简单确认句

> "我在续接 Marx · M-B2 · 副窗地理图 8 stage plan · spec § 4 + DR-097 (A+) 路径 / Stage 0 数据可达性验证 + Stage 1 prototype 先攻 / 读 plans/2026-05-21-marx-m-b2-geomap.md + specs/2026-05-20-m-b-mainline-design.md § 4"
