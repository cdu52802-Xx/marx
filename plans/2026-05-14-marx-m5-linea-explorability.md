# M5 主线 A · 可探索基础设施 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 M4 demo 从"看的"变"探的"——画布加 D3 zoom (1×–8×) + pan / 时间轴改造为单游标 + 视觉范围条 / 点 obs 同时放大居中 + 详情卡 / 点弧线两端居中 + tooltip / 缩放控件左下 / 双击中键 + ⌂ 重置 / Esc 关详情卡。

**Architecture:** SVG 内引入 `<g class="zoom-layer">` 包裹所有内容（弧线 / person section / obs 圆点 / claim_text）/ D3 `d3.zoom()` behavior 注册到外层 SVG / 屏幕固定元素（sidebar / 详情卡 / 缩放控件 / 时间轴）保持 fixed 位置不跟随 zoom transform。M4 现有 CSS overflow:auto 探索模式被 D3 zoom 替代（不再靠浏览器滚动 pan）。

**Tech Stack:** TypeScript + D3.js (d3-zoom / d3-selection / d3-transition / d3-drag) + Vite + Vitest (单元) + Playwright (E2E)

**Spec:** [`specs/2026-05-14-m5-linea-explorability-design.md`](../specs/2026-05-14-m5-linea-explorability-design.md)（11 DRs / 14 sections）

---

## TL;DR Task 列表（PM 视图）

| Task | 内容 | 估时 | 依赖 |
|---|---|---|---|
| T0 | Pre-flight：archive M4 + 验证 baseline tests | 0.5h | — |
| T1 | `viz/zoom.ts` 新建：zoom-layer 包裹 + D3 zoom 基础（scaleExtent 1-8 / 滚轮放大） | 4-6h | T0 |
| T2 | `viz/zoom.ts` 加 pan boundary clamp（不能拖到全空白）| 2h | T1 |
| T3 | `components/zoom-control.ts` 新建：左下缩放控件（+ / 比例 / − / ⌂）| 3-4h | T1 |
| T4 | `viz/center.ts` 新建：居中飞行算法 + offset 详情卡 | 3-4h | T1 |
| T5 | `claim-popover.ts` 改：宽度 400px + Esc 关 + 单击 obs 触发"居中 + 详情卡同时" | 3h | T4 |
| T6 | `timeline.ts` 改：删 input slider / 单游标拖动 / 视觉范围条同步 zoom | 5-7h | T1 |
| T7 | `timeline.ts` ▶ 播放改造：游标自动 1770→1950 + 画布同步飞行 | 2-3h | T6 |
| T8 | 点弧线 handler：两端 obs 居中 + 弧线高亮 + tooltip 关系类型 | 3-4h | T4 |
| T9 | 双击中键 = reset + cursor 状态 + 防中键浏览器默认 | 2-3h | T1 |
| T10 | E2E (Playwright) + 视觉回归 + 4 件套 baseline 对比 + ship | 4-6h | 全部 |

**Total**：~32-43h / 单人 1.5-2 周 / 30%-60%-90% PM checkpoint（lesson 1 防 vision drift）

---

## File Structure

| File | Op | 责任 |
|---|---|---|
| `src/viz/zoom.ts` | **新建** | D3 zoom behavior 工厂 / scaleExtent / translateExtent clamp / 公开 API: `createZoom(svg, opts)` 返回 { zoomBehavior, getCurrentTransform, programmaticZoom } |
| `src/viz/center.ts` | **新建** | 居中飞行算法 / 输入 target [x, y] + targetK → 输出 [k, x, y] transform + d3 transition |
| `src/components/zoom-control.ts` | **新建** | 左下缩放控件 UI / mount 到 body / 接 zoom API |
| `src/components/timeline.ts` | **修改** | 删 input slider / 加单游标 drag / 加视觉范围条 / ▶ 播放改造同步飞行 |
| `src/main.ts` | **修改** | SVG 加 zoom-layer 包裹 / 注册 zoom + obs click + arc click + Esc + 中键 handlers |
| `src/components/claim-popover.ts` | **修改** | 宽度 350→400 / Esc 关闭 listener / 单击 obs 触发同时居中 + popover |
| `src/components/sidebar.ts` | 不动 | M4 Option A done |
| `tests/unit/zoom.test.ts` | **新建** | 单元测 zoom 行为 / scaleExtent / clamp 计算 |
| `tests/unit/center.test.ts` | **新建** | 单元测居中算法 / offset 计算 / transform 输出 |
| `tests/unit/zoom-control.test.ts` | **新建** | 单元测控件 mount + 按钮事件 + 比例 display |
| `tests/unit/timeline.test.ts` | **修改** | 删 slider 相关测试 / 加单游标 drag / 视觉范围条宽度计算 |
| `tests/unit/claim-popover.test.ts` | **修改** | 加 Esc 关 / 加宽度 400 / 加同时触发测试 |
| `e2e/m5-linea-zoom.spec.ts` | **新建** | Playwright E2E：滚轮 zoom / 拖动 pan / 单击 obs / 双击中键 reset |

---

## Task 0: Pre-flight (archive M4 + baseline)

**Files:**
- Create: `public/m4-archive/`
- Modify: `vite.config.ts` (确保 public/ 被构建)

- [ ] **Step 1: 拉最新 + 创建 worktree（如果用 subagent-driven）**

```bash
git pull origin main
git status  # 确认 clean
```

Expected: `nothing to commit, working tree clean`

- [ ] **Step 2: build M4 当前版本 + 拷贝到 archive**

```bash
npm run build
mkdir -p public/m4-archive
cp -r dist/* public/m4-archive/
ls public/m4-archive/  # 验证 index.html / assets/ 在
```

Expected: 看到 `index.html` + `assets/` 目录

- [ ] **Step 3: 跑 baseline 测试 + 记下数字**

```bash
npm test 2>&1 | tail -20
```

Expected: `Tests  106 passed | 3 failed` 之类（106 是 M4 closure baseline / 3 是 M3 pre-existing RED）。**记下当前数字** 后面 ship 时对比。

- [ ] **Step 4: tag m5-pre-archive 标记起点**

```bash
git add public/m4-archive/
git commit -F - <<'EOF'
chore(M5): archive M4 demo 到 public/m4-archive/

复用 m3-archive 套路 / 防 M5 主线 A zoom + 时间轴改造覆盖 M4 demo / lesson 8。
M5 完成后 https://cdu52802-xx.github.io/marx/m4-archive/ 永久可访问。
EOF
git tag m5-pre-archive
git push origin main
git push origin m5-pre-archive
```

Expected: tag pushed / 不报错

---

## Task 1: 新建 viz/zoom.ts · D3 zoom 基础集成

**Files:**
- Create: `src/viz/zoom.ts`
- Modify: `src/main.ts:122-145`（svg 创建后加 zoom-layer 包裹）
- Create: `tests/unit/zoom.test.ts`

### 1.1 设计接口（先想清楚再写）

zoom.ts 公开 3 个 export：
```ts
export interface ZoomOptions {
  scaleExtent: [number, number];  // [1, 8] for M5
  onZoom?: (transform: ZoomTransform) => void;  // 每次 zoom 触发的回调
}

export interface ZoomController {
  zoomBehavior: ZoomBehavior<SVGSVGElement, unknown>;
  getCurrentTransform(): ZoomTransform;
  programmaticZoom(targetK: number, duration?: number): void;  // 用于 + - ⌂ 按钮
}

export function createZoom(svg: Selection<SVGSVGElement, ...>, opts: ZoomOptions): ZoomController;
```

- [ ] **Step 1: 写失败的单元测试 · zoom 接口**

`tests/unit/zoom.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import * as d3 from 'd3';
import { createZoom } from '../../src/viz/zoom.ts';

describe('zoom · createZoom', () => {
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

  beforeEach(() => {
    document.body.innerHTML = '<svg id="test-svg" width="800" height="600"></svg>';
    svg = d3.select<SVGSVGElement, unknown>('#test-svg');
  });

  it('createZoom 返回 ZoomController with 3 fields', () => {
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    expect(ctrl.zoomBehavior).toBeDefined();
    expect(typeof ctrl.getCurrentTransform).toBe('function');
    expect(typeof ctrl.programmaticZoom).toBe('function');
  });

  it('初始 transform = identity (k=1, x=0, y=0)', () => {
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    const t = ctrl.getCurrentTransform();
    expect(t.k).toBe(1);
    expect(t.x).toBe(0);
    expect(t.y).toBe(0);
  });

  it('scaleExtent 限制在 [1, 8]', () => {
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    const extent = ctrl.zoomBehavior.scaleExtent();
    expect(extent).toEqual([1, 8]);
  });
});
```

- [ ] **Step 2: 跑测试验证 fail**

```bash
npm test -- zoom.test.ts 2>&1 | tail -10
```

Expected: 3 fail · 报错 `Cannot find module '../../src/viz/zoom.ts'`

- [ ] **Step 3: 写最小实现 src/viz/zoom.ts**

```ts
// M5 主线 A · D3 zoom behavior 工厂
// spec § 9.1 + § 7.1 滚轮 zoom + § 7.2 pan
import * as d3 from 'd3';
import type { Selection } from 'd3-selection';
import type { ZoomBehavior, ZoomTransform } from 'd3-zoom';

export interface ZoomOptions {
  scaleExtent: [number, number];
  onZoom?: (transform: ZoomTransform) => void;
}

export interface ZoomController {
  zoomBehavior: ZoomBehavior<SVGSVGElement, unknown>;
  getCurrentTransform(): ZoomTransform;
  programmaticZoom(targetK: number, duration?: number): void;
}

export function createZoom(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  opts: ZoomOptions,
): ZoomController {
  const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent(opts.scaleExtent)
    .on('zoom', (event) => {
      const t = event.transform;
      // 应用到 zoom-layer
      svg.select('g.zoom-layer').attr('transform', t.toString());
      if (opts.onZoom) opts.onZoom(t);
    });

  svg.call(zoomBehavior);

  return {
    zoomBehavior,
    getCurrentTransform: () => d3.zoomTransform(svg.node()!),
    programmaticZoom: (targetK, duration = 600) => {
      svg.transition().duration(duration).call(
        zoomBehavior.scaleTo, targetK,
      );
    },
  };
}
```

- [ ] **Step 4: 跑测试验证 pass**

```bash
npm test -- zoom.test.ts 2>&1 | tail -10
```

Expected: 3 passed

- [ ] **Step 5: 修改 src/main.ts 加 zoom-layer 包裹**

Find line ~122 (svg 创建后) 加 zoom-layer：

```ts
// 在 svg 创建后立即加 (原 line 130 后插入)
const zoomLayer = svg.append('g').attr('class', 'zoom-layer');

// 然后把所有后面的 svg.append → zoomLayer.append
// 改 line 132 米白纸感背景 rect:
zoomLayer.append('rect')  // was: svg.append('rect')
  .attr('x', 0)
  .attr('y', 0)
  // ...

// 改 line 158 弧线层:
zoomLayer.append('g')  // was: svg.append('g')
  .attr('class', 'arc-layer')
  // ...

// 改 line 186 person section:
const sectionG = zoomLayer  // was: svg
  .selectAll<SVGGElement, PersonSection>('g.person-section')
  // ...
```

⚠ 全文 grep `svg.append` / `svg.selectAll` 找全部点 / 都改成 `zoomLayer.append` / `zoomLayer.selectAll`，但**保留**`svg.attr` `svg.style` 这些 svg root 自身属性。

- [ ] **Step 6: 注册 zoom · 改 main.ts svg 创建后加 createZoom 调用**

```ts
// import 顶部加
import { createZoom } from './viz/zoom.ts';

// svg + zoomLayer 创建后立即:
const zoomCtrl = createZoom(svg, {
  scaleExtent: [1, 8],
  onZoom: (t) => {
    // 后续 timeline 视觉范围条 + zoom-control 比例 display 在这接
    console.log(`[Marx M5] zoom k=${t.k.toFixed(2)} x=${t.x.toFixed(0)} y=${t.y.toFixed(0)}`);
  },
});

// 暴露给 timeline + zoom-control（下面 task 用）
(window as any).__marxZoomCtrl = zoomCtrl;  // 临时全局 / T3 重构成正式注入
```

- [ ] **Step 7: 跑 dev server + 浏览器 smoke test**

```bash
npm run dev
```

打开 http://localhost:5173/

期望：
- ✅ 主画布全部内容跟 M4 一模一样（zoom-layer 包裹后视觉不变）
- ✅ 滚轮在画布上滚动 → 画布缩放（1× → 8×）
- ✅ 鼠标拖动画布空白处 → 画布平移
- ⚠ pan 边界还没 clamp（下个 task T2 加）/ 可以拖到全空白先忽略

- [ ] **Step 8: Commit**

```bash
git add src/viz/zoom.ts src/main.ts tests/unit/zoom.test.ts
git commit -F - <<'EOF'
feat(M5 T1): viz/zoom.ts D3 zoom 基础 + main.ts zoom-layer 包裹

- viz/zoom.ts 新建 / createZoom 工厂 / scaleExtent [1, 8]
- main.ts 加 g.zoom-layer 包裹所有 SVG 内容（弧线 / person section 等）
- 滚轮缩放工作 / 拖动 pan 工作 (无 boundary clamp / T2 加)
- 3 个单元测试 pass

spec § 7.1 滚轮 zoom · DR-014 主线 A 启动
EOF
```

---

## Task 2: pan boundary clamp（不能拖到全空白）

**Files:**
- Modify: `src/viz/zoom.ts`（加 translateExtent 计算）
- Modify: `tests/unit/zoom.test.ts`

- [ ] **Step 1: 写失败测试 · translateExtent clamp**

加到 `tests/unit/zoom.test.ts`:
```ts
describe('zoom · pan boundary clamp', () => {
  it('translateExtent 计算 = contentBBox 外 5% padding', () => {
    document.body.innerHTML = '<svg id="test-svg" width="1000" height="800"></svg>';
    const svg = d3.select<SVGSVGElement, unknown>('#test-svg');
    // mock content bbox: 0,0 → 2000,1500
    const ctrl = createZoom(svg, {
      scaleExtent: [1, 8],
      contentBBox: { x: 0, y: 0, width: 2000, height: 1500 },
    });
    const ext = ctrl.zoomBehavior.translateExtent();
    // 5% padding = 100, 75
    expect(ext[0][0]).toBeCloseTo(-100, 0);
    expect(ext[0][1]).toBeCloseTo(-75, 0);
    expect(ext[1][0]).toBeCloseTo(2100, 0);
    expect(ext[1][1]).toBeCloseTo(1575, 0);
  });
});
```

- [ ] **Step 2: 跑测试验证 fail**

```bash
npm test -- zoom.test.ts 2>&1 | tail -10
```

Expected: 新测 fail · `contentBBox is not a valid option`

- [ ] **Step 3: 修改 zoom.ts 加 contentBBox option + translateExtent**

```ts
export interface ZoomOptions {
  scaleExtent: [number, number];
  contentBBox?: { x: number; y: number; width: number; height: number };  // 新增
  onZoom?: (transform: ZoomTransform) => void;
}

export function createZoom(svg, opts) {
  const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent(opts.scaleExtent);

  if (opts.contentBBox) {
    const padding = 0.05;
    const padX = opts.contentBBox.width * padding;
    const padY = opts.contentBBox.height * padding;
    zoomBehavior.translateExtent([
      [opts.contentBBox.x - padX, opts.contentBBox.y - padY],
      [opts.contentBBox.x + opts.contentBBox.width + padX,
       opts.contentBBox.y + opts.contentBBox.height + padY],
    ]);
  }

  zoomBehavior.on('zoom', (event) => {
    // ... 同 T1
  });

  svg.call(zoomBehavior);
  // ... return 同 T1
}
```

- [ ] **Step 4: 跑测试 verify pass**

```bash
npm test -- zoom.test.ts
```

Expected: 4 tests pass

- [ ] **Step 5: main.ts 加 contentBBox 计算**

在 createZoom 调用前算 content bbox（M4 现有 `canvasWidth` `canvasHeight` 就是 content 边界）：
```ts
const zoomCtrl = createZoom(svg, {
  scaleExtent: [1, 8],
  contentBBox: { x: 0, y: 0, width: canvasWidth, height: canvasHeight },
  onZoom: (t) => { /* ... */ },
});
```

- [ ] **Step 6: dev 验证拖动不能拖到全空白**

```bash
npm run dev
```

期望：拖动画布到边缘 → 自动 clamp / 始终至少 95% 内容可见。

- [ ] **Step 7: Commit**

```bash
git add src/viz/zoom.ts tests/unit/zoom.test.ts src/main.ts
git commit -F - <<'EOF'
feat(M5 T2): pan boundary clamp 到 content + 5% padding

- viz/zoom.ts 加 contentBBox option / translateExtent 自动计算
- main.ts 传入 canvasWidth / canvasHeight 作为 content bbox
- 1 个新单元测试 pass

spec § 7.2 pan 边界 · DR-014
EOF
```

---

## Task 3: components/zoom-control.ts · 左下缩放控件

**Files:**
- Create: `src/components/zoom-control.ts`
- Modify: `src/main.ts`（mount zoom-control）
- Create: `tests/unit/zoom-control.test.ts`

### 3.1 设计接口

```ts
export interface ZoomControlOptions {
  zoomController: ZoomController;
  position?: { left: number; bottom: number };  // 默认 { left: 60, bottom: 180 }
}

export function mountZoomControl(opts: ZoomControlOptions): HTMLElement;
```

mount 4 个 button 竖排到 body / position: fixed / 左下：
- `+` 调 `programmaticZoom(currentK * 1.5)`
- 当前比例数字（"2.5×"）/ 紫色背景半透明
- `−` 调 `programmaticZoom(currentK * 0.667)`
- `⌂` reset 到 1× 全景居中

- [ ] **Step 1: 写失败测试 · mount + 4 button 存在**

`tests/unit/zoom-control.test.ts`:
```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as d3 from 'd3';
import { createZoom } from '../../src/viz/zoom.ts';
import { mountZoomControl } from '../../src/components/zoom-control.ts';

describe('zoom-control · mount', () => {
  beforeEach(() => {
    document.body.innerHTML = '<svg id="test-svg" width="800" height="600"></svg>';
  });

  it('mount 后 body 里有 .zoom-control + 4 个 button', () => {
    const svg = d3.select<SVGSVGElement, unknown>('#test-svg');
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    mountZoomControl({ zoomController: ctrl });

    const control = document.querySelector('.zoom-control');
    expect(control).toBeTruthy();
    const buttons = control!.querySelectorAll('button, [role="button"]');
    expect(buttons.length).toBeGreaterThanOrEqual(3);  // +, −, ⌂ 3 个 button (比例 display 是 div 不算)
  });

  it('比例 display 显示当前 k 值（默认 1.0×）', () => {
    const svg = d3.select<SVGSVGElement, unknown>('#test-svg');
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    mountZoomControl({ zoomController: ctrl });

    const display = document.querySelector('.zoom-control .zoom-display');
    expect(display!.textContent).toMatch(/1\.0?×/);
  });

  it('按 + 按钮 → programmaticZoom 被调用', () => {
    const svg = d3.select<SVGSVGElement, unknown>('#test-svg');
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    const spy = vi.spyOn(ctrl, 'programmaticZoom');
    mountZoomControl({ zoomController: ctrl });

    const plusBtn = document.querySelector('.zoom-control .zoom-in') as HTMLButtonElement;
    plusBtn.click();
    expect(spy).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 跑测试验证 fail**

```bash
npm test -- zoom-control.test.ts
```

Expected: 3 fail · `Cannot find module`

- [ ] **Step 3: 写实现 src/components/zoom-control.ts**

```ts
// M5 主线 A · 左下缩放控件
// spec § 8.3 / DR-020 位置左下 / 4 button 竖排 / 米白底 + 1px 墨黑 / EB Garamond
import type { ZoomController } from '../viz/zoom.ts';

export interface ZoomControlOptions {
  zoomController: ZoomController;
  position?: { left: number; bottom: number };
}

export function mountZoomControl(opts: ZoomControlOptions): HTMLElement {
  const pos = opts.position ?? { left: 60, bottom: 180 };
  const root = document.createElement('div');
  root.className = 'zoom-control';
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', '画布缩放控件');
  root.style.cssText = `
    position: fixed;
    left: ${pos.left}px;
    bottom: ${pos.bottom}px;
    z-index: 11;
    display: flex;
    flex-direction: column;
    background: #fcfaf6;
    border: 1px solid #1a1a1a;
    font-family: 'EB Garamond', Georgia, serif;
    user-select: none;
  `;

  const mkBtn = (cls: string, label: string, ariaLabel: string, onClick: () => void) => {
    const btn = document.createElement('button');
    btn.className = `zoom-control-btn ${cls}`;
    btn.setAttribute('aria-label', ariaLabel);
    btn.textContent = label;
    btn.style.cssText = `
      width: 32px; height: 32px;
      border: 0; background: transparent;
      font-family: inherit; font-size: 18px;
      color: #1a1a1a; cursor: pointer;
      border-bottom: 1px solid #d8ccb8;
    `;
    btn.onclick = onClick;
    return btn;
  };

  const plus = mkBtn('zoom-in', '+', '放大', () => {
    const t = opts.zoomController.getCurrentTransform();
    opts.zoomController.programmaticZoom(Math.min(t.k * 1.5, 8));
  });

  const display = document.createElement('div');
  display.className = 'zoom-display';
  display.style.cssText = `
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(91, 58, 140, 0.15);
    font-size: 11px; font-style: italic; font-weight: 600;
    color: #5b3a8c;
    border-bottom: 1px solid #d8ccb8;
  `;
  display.textContent = '1.0×';

  const minus = mkBtn('zoom-out', '−', '缩小', () => {
    const t = opts.zoomController.getCurrentTransform();
    opts.zoomController.programmaticZoom(Math.max(t.k * 0.667, 1));
  });

  const home = mkBtn('zoom-reset', '⌂', '重置到全景视图', () => {
    opts.zoomController.programmaticZoom(1, 800);
  });
  home.style.borderBottom = '0';  // 最后一个 button 不画底边

  root.appendChild(plus);
  root.appendChild(display);
  root.appendChild(minus);
  root.appendChild(home);
  document.body.appendChild(root);

  // 订阅 zoom 变化 → 更新 display
  // (实现时需要让 createZoom 支持事件订阅 / 这里临时通过 onZoom callback chain)
  // 详见 step 4 main.ts 接线

  return root;
}

export function updateZoomDisplay(root: HTMLElement, k: number): void {
  const display = root.querySelector('.zoom-display') as HTMLElement;
  if (display) display.textContent = `${k.toFixed(1)}×`;
}
```

- [ ] **Step 4: 跑测试 verify pass**

```bash
npm test -- zoom-control.test.ts
```

Expected: 3 pass

- [ ] **Step 5: main.ts 接线 mount + update display**

```ts
// import 顶部
import { mountZoomControl, updateZoomDisplay } from './components/zoom-control.ts';

// 在 createZoom 后
let zoomControlEl: HTMLElement;
const zoomCtrl = createZoom(svg, {
  scaleExtent: [1, 8],
  contentBBox: { x: 0, y: 0, width: canvasWidth, height: canvasHeight },
  onZoom: (t) => {
    if (zoomControlEl) updateZoomDisplay(zoomControlEl, t.k);
  },
});
zoomControlEl = mountZoomControl({ zoomController: zoomCtrl });
```

- [ ] **Step 6: dev 验证缩放控件可见 + 按钮工作**

```bash
npm run dev
```

期望：
- ✅ 左下角看到 4 button 竖排（+ / 1.0× / − / ⌂）
- ✅ 按 + → 放大 + display 变成 1.5× / 再按 → 2.2× ...
- ✅ 按 − → 缩小 + display 变化
- ✅ 按 ⌂ → 回到 1.0×
- ✅ 滚轮缩放也同步更新 display

- [ ] **Step 7: Commit**

```bash
git add src/components/zoom-control.ts src/main.ts tests/unit/zoom-control.test.ts
git commit -F - <<'EOF'
feat(M5 T3): zoom-control.ts 左下缩放控件

- 4 button 竖排（+ / 比例 display / − / ⌂）
- 位置 left 60 bottom 180 / fixed / z-index 11
- 米白底 + 1px 墨黑 + EB Garamond + 紫色比例 display 强调
- + 1.5× step / − 0.667× step / ⌂ 800ms reset 飞行
- 滚轮缩放同步 display

spec § 8.3 · DR-020 左下位置 · DR-024 右上预留
EOF
```

---

## Task 4: viz/center.ts · 居中飞行算法

**Files:**
- Create: `src/viz/center.ts`
- Create: `tests/unit/center.test.ts`

### 4.1 设计算法

给定：目标 obs 位置 `(tx, ty)` in 画布坐标 / 目标 zoom k / 屏幕 viewport 尺寸 / 详情卡宽度
求：transform [k, x, y] 让 obs 在屏幕可见区域居中（offset 详情卡宽度 + sidebar 宽度）

```
可见区中心 X = (viewport.width - 详情卡宽 - sidebar 宽) / 2 + sidebar 宽
可见区中心 Y = viewport.height / 2

目标 transform:
  k = targetK
  x = 可见区中心X - tx * targetK
  y = 可见区中心Y - ty * targetK
```

- [ ] **Step 1: 写失败测试 · 居中数学**

`tests/unit/center.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { computeCenterTransform } from '../../src/viz/center.ts';

describe('center · computeCenterTransform', () => {
  it('居中 obs 到屏幕中点 (无详情卡 + 无 sidebar)', () => {
    const t = computeCenterTransform({
      target: { x: 100, y: 200 },
      targetK: 3,
      viewport: { width: 800, height: 600 },
      sidebarWidth: 0,
      popoverWidth: 0,
    });
    // visibleCenterX = (800 - 0 - 0) / 2 + 0 = 400
    // visibleCenterY = 600 / 2 = 300
    // x = 400 - 100 * 3 = 100
    // y = 300 - 200 * 3 = -300
    expect(t.k).toBe(3);
    expect(t.x).toBe(100);
    expect(t.y).toBe(-300);
  });

  it('居中时 offset 详情卡宽度 (400) + sidebar (32)', () => {
    const t = computeCenterTransform({
      target: { x: 1000, y: 500 },
      targetK: 2,
      viewport: { width: 1280, height: 720 },
      sidebarWidth: 32,
      popoverWidth: 400,
    });
    // visibleCenterX = (1280 - 32 - 400) / 2 + 32 = 424 + 32 = 456
    // visibleCenterY = 720 / 2 = 360
    // x = 456 - 1000 * 2 = -1544
    // y = 360 - 500 * 2 = -640
    expect(t.k).toBe(2);
    expect(t.x).toBe(-1544);
    expect(t.y).toBe(-640);
  });

  it('targetK < currentK 不缩小（取 max）', () => {
    const t = computeCenterTransform({
      target: { x: 100, y: 100 },
      targetK: 3,
      currentK: 5,
      viewport: { width: 800, height: 600 },
      sidebarWidth: 0,
      popoverWidth: 0,
    });
    // 当前已经 5× / target 是 3× → 保持 5×
    expect(t.k).toBe(5);
  });
});
```

- [ ] **Step 2: 跑测试 fail**

```bash
npm test -- center.test.ts
```

Expected: 3 fail · module not found

- [ ] **Step 3: 写实现 src/viz/center.ts**

```ts
// M5 主线 A · 居中飞行算法
// spec § 7.3 单击 obs 同时居中 + 详情卡 · DR-017
import * as d3 from 'd3';
import type { ZoomBehavior, ZoomTransform } from 'd3-zoom';
import type { Selection } from 'd3-selection';

export interface CenterParams {
  target: { x: number; y: number };
  targetK: number;
  currentK?: number;  // 如果 currentK >= targetK 则保持 currentK (不缩小)
  viewport: { width: number; height: number };
  sidebarWidth: number;
  popoverWidth: number;
}

export interface CenterTransform {
  k: number;
  x: number;
  y: number;
}

export function computeCenterTransform(p: CenterParams): CenterTransform {
  const k = p.currentK && p.currentK > p.targetK ? p.currentK : p.targetK;
  const visibleCenterX = (p.viewport.width - p.sidebarWidth - p.popoverWidth) / 2 + p.sidebarWidth;
  const visibleCenterY = p.viewport.height / 2;
  return {
    k,
    x: visibleCenterX - p.target.x * k,
    y: visibleCenterY - p.target.y * k,
  };
}

export function flyToTarget(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  zoomBehavior: ZoomBehavior<SVGSVGElement, unknown>,
  transform: CenterTransform,
  duration = 600,
): void {
  const t = d3.zoomIdentity.translate(transform.x, transform.y).scale(transform.k);
  svg.transition()
    .duration(duration)
    .ease(d3.easeCubicInOut)
    .call(zoomBehavior.transform, t);
}
```

- [ ] **Step 4: 跑测试 verify pass**

```bash
npm test -- center.test.ts
```

Expected: 3 pass

- [ ] **Step 5: Commit**

```bash
git add src/viz/center.ts tests/unit/center.test.ts
git commit -F - <<'EOF'
feat(M5 T4): viz/center.ts 居中飞行算法

- computeCenterTransform: target + 可见区中心 (offset sidebar + popover) → [k, x, y]
- flyToTarget: d3 transition 600ms cubic-in-out 应用 transform
- currentK > targetK 保持 currentK (不缩小)
- 3 个单元测试 pass

spec § 7.3 单击 obs 同时居中 + 详情卡 · DR-017
EOF
```

---

## Task 5: claim-popover.ts 改 + 单击 obs handler

**Files:**
- Modify: `src/components/claim-popover.ts`（宽度 400 / Esc / 双触发）
- Modify: `src/main.ts`（单击 obs handler）
- Modify: `tests/unit/claim-popover.test.ts`

- [ ] **Step 1: 读现有 claim-popover.ts 找宽度 + click handler 接入点**

```bash
grep -n "350\|width\|click\|Esc\|keydown" F:/AI/projects/Marx/src/components/claim-popover.ts | head -20
```

记下：宽度定义在哪行 / mountClaimPopover signature / 有没有 close API。

- [ ] **Step 2: 写失败测试 · 宽度 400 + Esc 关闭**

加到 `tests/unit/claim-popover.test.ts`:
```ts
it('详情卡宽度 = 400px (M5)', () => {
  mountClaimPopover({ /* ... 复用现有测试 fixture */ });
  // 触发显示一个 claim
  showClaim(/* ... */);
  const popover = document.querySelector('.claim-popover') as HTMLElement;
  expect(popover.style.width).toBe('400px');
});

it('Esc 键按下 → 关闭 popover', () => {
  mountClaimPopover({ /* ... */ });
  showClaim(/* ... */);
  expect(document.querySelector('.claim-popover')?.classList.contains('open')).toBe(true);

  const event = new KeyboardEvent('keydown', { key: 'Escape' });
  document.dispatchEvent(event);
  // wait 一下 transition
  expect(document.querySelector('.claim-popover')?.classList.contains('open')).toBe(false);
});
```

- [ ] **Step 3: 跑测试 fail**

```bash
npm test -- claim-popover.test.ts
```

Expected: 2 新测 fail

- [ ] **Step 4: 改 claim-popover.ts**

修改 `src/components/claim-popover.ts`:
1. 找原 `width: 350px` 改成 `width: 400px`
2. mountClaimPopover 末尾加 Esc listener:

```ts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const popover = document.querySelector('.claim-popover');
    if (popover?.classList.contains('open')) {
      // 关闭 popover (复用现有 close 逻辑)
      closePopover();  // 假设已有 close 函数 / 没有则提取 × button onClick 逻辑
    }
    // 注意：spec § 7.6 Esc 不动 viewport (不调 zoomController.programmaticZoom(1))
  }
});
```

- [ ] **Step 5: 跑测试 verify pass**

```bash
npm test -- claim-popover.test.ts
```

Expected: 2 新测 + 现有都 pass

- [ ] **Step 6: main.ts 单击 obs handler 触发同时居中 + popover**

找 main.ts 现有单击 obs handler（搜 `.on('click'`）/ 替换为同时调 center + popover:

```ts
// 在 obs 渲染后
obsGroup.on('click', (event, d) => {
  // 1. 计算居中 transform
  const ct = computeCenterTransform({
    target: { x: d.x, y: d.y },
    targetK: 3,  // 默认放大到 3×
    currentK: zoomCtrl.getCurrentTransform().k,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    sidebarWidth: 32,  // sidebar 收起态 / 主线 B 时考虑展开态
    popoverWidth: 400,
  });
  // 2. 飞行
  flyToTarget(svg, zoomCtrl.zoomBehavior, ct, 600);
  // 3. 同时显示 popover (现有逻辑)
  showClaim(d);
});
```

import 顶部:
```ts
import { computeCenterTransform, flyToTarget } from './viz/center.ts';
```

- [ ] **Step 7: dev 验证单击 obs**

```bash
npm run dev
```

期望：
- ✅ 点任意 obs → 画布飞行 600ms / obs 居中放大到 3× / 详情卡同时滑入
- ✅ 当前 5× 时点 obs → 保持 5× / 只 pan 居中
- ✅ 按 Esc → 详情卡关闭 / viewport 不动

- [ ] **Step 8: Commit**

```bash
git add src/components/claim-popover.ts src/main.ts tests/unit/claim-popover.test.ts
git commit -F - <<'EOF'
feat(M5 T5): claim-popover 宽 400 + Esc 关 + 单击 obs 触发同时居中 + popover

- claim-popover.ts 宽度 350 → 400px (spec § 8.2 · DR-023)
- Esc keydown listener 关 popover / 不动 viewport (spec § 7.6 · DR-019)
- main.ts 单击 obs handler 接 computeCenterTransform + flyToTarget + showClaim
- 默认 targetK = 3× / currentK 大则保持
- 2 新单元测试 pass

spec § 7.3 + § 7.6 + § 8.2 · DR-017 · DR-019 · DR-023
EOF
```

---

## Task 6: timeline.ts 改造 · 单游标 + 视觉范围条

**Files:**
- Modify: `src/components/timeline.ts`（大改）
- Modify: `tests/unit/timeline.test.ts`
- Modify: `src/main.ts`（接 timeline → zoom 同步）

### 6.1 设计

M4 现有 timeline 用 `<input type="range">` slider + cursor `<span>` 显示 + ▶ 播放按钮。
M5 改成：
- ❌ 删 `<input type="range">`
- ✅ SVG 单游标 `<circle>` 在主轴线上 / 可拖（d3.drag）
- ✅ 视觉范围条 `<rect>` 紫色 opacity 0.35 / 宽度 = 当前可视年份段 (zoom k → 年份段宽)
- ✅ ▶ 播放按钮保留 / 改造留 T7
- ✅ Marx 区间 indicator `<rect>` 1830-1880 保留 / 但提到 z-order 在 range bar 下

游标拖动 → 调 zoomController.programmaticTranslate(targetX) 让画布 pan 到对应位置（年份 → X 坐标映射）

- [ ] **Step 1: 写失败测试 · 视觉范围条宽度计算**

加到 `tests/unit/timeline.test.ts`:
```ts
describe('timeline · M5 视觉范围条宽度', () => {
  it('zoom k=1 → 范围条宽度 = 全时间轴 (180 年全可见)', () => {
    const width = computeRangeBarWidth({
      zoomK: 1,
      canvasWidth: 2400,
      viewportWidth: 1280,
      yearMin: 1770,
      yearMax: 1950,
      timelineWidth: 600,
    });
    // k=1 时画布是 2400 但只显示 1280 → 实际可见画布宽 = 1280
    // 可见年份 = 1280 / 2400 * 180 = 96 年
    // 时间轴 600 宽 → 范围条宽 = 96 / 180 * 600 = 320
    expect(width).toBeCloseTo(320, 0);
  });

  it('zoom k=4 → 范围条宽度 = 1/4 全时间轴', () => {
    const width = computeRangeBarWidth({
      zoomK: 4,
      canvasWidth: 2400,
      viewportWidth: 1280,
      yearMin: 1770,
      yearMax: 1950,
      timelineWidth: 600,
    });
    // k=4 时画布是 2400 但只显示 1280 / 实际可见画布宽 = 1280/4 = 320
    // 可见年份 = 320 / 2400 * 180 = 24 年
    // 范围条宽 = 24 / 180 * 600 = 80
    expect(width).toBeCloseTo(80, 0);
  });
});
```

- [ ] **Step 2: 跑测试 fail**

```bash
npm test -- timeline.test.ts
```

Expected: 2 新测 fail

- [ ] **Step 3: timeline.ts 加 computeRangeBarWidth + export**

```ts
export function computeRangeBarWidth(p: {
  zoomK: number;
  canvasWidth: number;
  viewportWidth: number;
  yearMin: number;
  yearMax: number;
  timelineWidth: number;
}): number {
  const visibleCanvasWidth = p.viewportWidth / p.zoomK;
  const visibleYears = (visibleCanvasWidth / p.canvasWidth) * (p.yearMax - p.yearMin);
  return (visibleYears / (p.yearMax - p.yearMin)) * p.timelineWidth;
}
```

- [ ] **Step 4: 跑测试 verify pass**

```bash
npm test -- timeline.test.ts
```

Expected: 2 新测 pass

- [ ] **Step 5: timeline.ts mountTimeline 改造**

替换原 `<input type="range">` 实现为 SVG drag-able 单游标 + 视觉范围条。

主要改动（伪代码骨架 / 实现时按现有 timeline.ts 结构具体改写）:

```ts
export function mountTimeline(params: {
  yearMin: number;
  yearMax: number;
  initialCursor: number;
  canvasWidth: number;
  viewportWidth: number;
  onCursorChange: (year: number) => void;  // 拖游标时调用 / main.ts 接到 zoom programmaticTranslate
}): { updateZoomK: (k: number) => void; setCursor: (year: number) => void } {
  // ... fixed bottom 容器
  // ... ▶ 播放按钮 (T7 改造)
  // ... SVG 主轴线 + ticks (沿用现有)
  // ... Marx 区间 indicator 1830-1880 紫色 opacity 0.15 (z 在底)

  // 新加：视觉范围条 (在主轴线上 / 紫色 opacity 0.35 / 不可拖)
  const rangeBar = svg.append('rect')
    .attr('class', 'timeline-range-bar')
    .attr('fill', '#5b3a8c')
    .attr('opacity', 0.35)
    .attr('height', 12);
  // 初始宽度 = computeRangeBarWidth(zoomK=1, ...)
  // 后续 updateZoomK 时 update width

  // 新加：单游标 circle 可拖
  let currentCursorYear = initialCursor;
  const cursor = svg.append('circle')
    .attr('class', 'timeline-cursor')
    .attr('r', 6)
    .attr('fill', '#5b3a8c')
    .attr('stroke', '#fcfaf6')
    .attr('stroke-width', 2)
    .attr('cy', axisY)
    .style('cursor', 'grab');

  function setCursorPosition(year: number) {
    currentCursorYear = year;
    cursor.attr('cx', yearToTimelineX(year));
    // 同时 update rangeBar.attr('x', yearToTimelineX(year) - rangeBarWidth/2)
  }
  setCursorPosition(initialCursor);

  cursor.call(d3.drag<SVGCircleElement, unknown>()
    .on('start', () => cursor.style('cursor', 'grabbing'))
    .on('drag', (event) => {
      const x = event.x;
      const year = timelineXToYear(x);
      const clampedYear = Math.max(yearMin, Math.min(yearMax, year));
      setCursorPosition(clampedYear);
      params.onCursorChange(clampedYear);
    })
    .on('end', () => cursor.style('cursor', 'grab')),
  );

  return {
    updateZoomK: (k: number) => {
      const w = computeRangeBarWidth({ zoomK: k, canvasWidth, viewportWidth, yearMin, yearMax, timelineWidth });
      rangeBar.attr('width', w);
      rangeBar.attr('x', yearToTimelineX(currentCursorYear) - w / 2);
    },
    setCursor: setCursorPosition,
  };
}
```

- [ ] **Step 6: main.ts 接 timeline ↔ zoom 同步**

```ts
// import
import { mountTimeline } from './components/timeline.ts';

// 在 zoomCtrl 创建后
const timelineApi = mountTimeline({
  yearMin: 1770,
  yearMax: 1950,
  initialCursor: 1860,
  canvasWidth,
  viewportWidth: window.innerWidth,
  onCursorChange: (year) => {
    // 拖游标 → 画布 pan 到对应年份
    const targetX = yearToCanvasX(year, canvasWidth);  // 年份 → 画布 X 坐标
    const t = zoomCtrl.getCurrentTransform();
    // 让 targetX 居中到 viewport
    const newX = window.innerWidth / 2 - targetX * t.k;
    svg.transition().duration(100).call(
      zoomCtrl.zoomBehavior.transform,
      d3.zoomIdentity.translate(newX, t.y).scale(t.k),
    );
  },
});

// 在 createZoom 的 onZoom 里同步 timeline
const zoomCtrl = createZoom(svg, {
  // ...
  onZoom: (t) => {
    if (zoomControlEl) updateZoomDisplay(zoomControlEl, t.k);
    if (timelineApi) timelineApi.updateZoomK(t.k);
    // 同时根据 zoom transform 计算当前画布中心对应的年份 → setCursor
    const centerCanvasX = (window.innerWidth / 2 - t.x) / t.k;
    const centerYear = canvasXToYear(centerCanvasX, canvasWidth);
    if (timelineApi) timelineApi.setCursor(centerYear);
  },
});
```

⚠ 加 debouncing flag 防双向同步震荡（spec § 12 R3）：
```ts
let syncingFromTimeline = false;
// timeline.onCursorChange 设 syncingFromTimeline = true / svg.transition().on('end', () => syncingFromTimeline = false)
// onZoom 里 if (syncingFromTimeline) return;  // 跳过反向同步
```

- [ ] **Step 7: dev 验证 timeline + zoom 同步**

```bash
npm run dev
```

期望：
- ✅ 滚轮放大画布 → 时间轴视觉范围条变窄 / 游标停留在画布中心对应年份
- ✅ 拖时间轴游标 → 画布 pan / 游标位置同步
- ✅ 不出现震荡（拖游标 → 画布 pan → 游标反弹）

- [ ] **Step 8: Commit**

```bash
git add src/components/timeline.ts src/main.ts tests/unit/timeline.test.ts
git commit -F - <<'EOF'
feat(M5 T6): timeline 改造 单游标 + 视觉范围条 + zoom 双向同步

- 删 input range slider / 改 SVG drag-able 单游标 circle
- 加视觉范围条 rect / 紫色 opacity 0.35 / 不可拖
- zoom k → 范围条宽度动态计算 (computeRangeBarWidth export)
- 拖游标 → 画布 pan 同步 (onCursorChange callback)
- main.ts 双向同步 + syncingFromTimeline 防震荡 flag
- 2 新单元测试 pass

spec § 6 + § 7.1 · DR-015 双向锁定 · DR-016 单游标 · R3 缓解
EOF
```

---

## Task 7: timeline ▶ 播放改造 · 游标自动 1770→1950 + 画布飞行

**Files:**
- Modify: `src/components/timeline.ts`（▶ 播放 toggle）
- Modify: `src/main.ts`
- Modify: `tests/unit/timeline.test.ts`

- [ ] **Step 1: 写失败测试 · 播放速度 12 年/秒**

加到 `tests/unit/timeline.test.ts`:
```ts
it('▶ 播放从 1770 → 1950 历时 15 秒 (12 年/秒)', () => {
  const totalYears = 1950 - 1770;
  const totalSec = 15;
  expect(totalYears / totalSec).toBeCloseTo(12, 0);
});

it('togglePlay 切换 isPlaying 状态', () => {
  const state = createPlayState();
  expect(state.isPlaying).toBe(false);
  state.toggle();
  expect(state.isPlaying).toBe(true);
  state.toggle();
  expect(state.isPlaying).toBe(false);
});
```

- [ ] **Step 2: 跑测试 fail**

Expected: `createPlayState is not defined`

- [ ] **Step 3: timeline.ts 加 createPlayState + 改造 ▶ 按钮**

```ts
export interface PlayState {
  isPlaying: boolean;
  toggle: () => void;
  reset: () => void;
}

export function createPlayState(): PlayState {
  const s = { isPlaying: false };
  return {
    get isPlaying() { return s.isPlaying; },
    toggle: () => { s.isPlaying = !s.isPlaying; },
    reset: () => { s.isPlaying = false; },
  };
}
```

mountTimeline 内 ▶ 按钮 click：
```ts
const playState = createPlayState();
let playInterval: number | null = null;

playButton.on('click', () => {
  playState.toggle();
  if (playState.isPlaying) {
    playButton.text('⏸ 暂停');
    // 启动自动滑动
    let currentYear = currentCursorYear;
    const stepYears = 0.5;  // 0.5 年 / step / 24 steps per second
    playInterval = window.setInterval(() => {
      currentYear += stepYears;
      if (currentYear >= yearMax) {
        currentYear = yearMin;  // loop 到头回起点
      }
      setCursorPosition(currentYear);
      params.onCursorChange(currentYear);
    }, 1000 / 24);  // 24 fps
  } else {
    playButton.text('▶ 播放');
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
  }
});
```

⚠ syncingFromTimeline flag 在 ▶ 播放期间持续 set，让 onZoom 反向同步不触发。

- [ ] **Step 4: 跑测试 verify pass**

```bash
npm test -- timeline.test.ts
```

Expected: 2 新测 pass

- [ ] **Step 5: dev 验证 ▶ 播放**

```bash
npm run dev
```

期望：
- ✅ 点 ▶ → 游标自动滑动 / 画布同步飞行 / 文字变 "⏸ 暂停"
- ✅ 再点 → 停止 / 文字变回 "▶ 播放"
- ✅ 播放到 1950 自动 loop 回 1770
- ✅ 播放期间用户能滚轮 zoom（不影响播放只改 k）

- [ ] **Step 6: Commit**

```bash
git add src/components/timeline.ts tests/unit/timeline.test.ts
git commit -F - <<'EOF'
feat(M5 T7): ▶ 播放改造 游标自动 1770→1950 + 画布同步飞行

- createPlayState 切 isPlaying 状态
- 0.5 年/step / 24 fps → 15s 跑完 1770→1950 (12 年/秒)
- 到 yearMax 自动 loop 回 yearMin
- toggle pause (M4 B2 fix 同思路)
- syncingFromTimeline 防反向同步震荡
- 2 新单元测试 pass

spec § 6.2 ▶ 播放 · DR-021 保留并简化
EOF
```

---

## Task 8: 点弧线 handler · 两端居中 + 高亮 + tooltip

**Files:**
- Modify: `src/main.ts`（arc click handler）
- Create: `src/components/arc-tooltip.ts`（关系类型 tooltip）
- Create: `tests/unit/arc-tooltip.test.ts`

- [ ] **Step 1: 写失败测试 · arc tooltip mount**

`tests/unit/arc-tooltip.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { mountArcTooltip, showArcTooltip, hideArcTooltip } from '../../src/components/arc-tooltip.ts';

describe('arc-tooltip', () => {
  it('mount 后 body 有 .arc-tooltip (hidden 状态)', () => {
    document.body.innerHTML = '';
    mountArcTooltip();
    const tip = document.querySelector('.arc-tooltip') as HTMLElement;
    expect(tip).toBeTruthy();
    expect(tip.style.display).toBe('none');
  });

  it('showArcTooltip 显示 + 内容含关系类型 + 引用', () => {
    document.body.innerHTML = '';
    mountArcTooltip();
    showArcTooltip({
      x: 100, y: 200,
      relationType: 'agreement',
      reference: 'MEGA II/1',
    });
    const tip = document.querySelector('.arc-tooltip') as HTMLElement;
    expect(tip.style.display).toBe('block');
    expect(tip.textContent).toContain('同意');  // agreement → 同意
    expect(tip.textContent).toContain('MEGA II/1');
  });

  it('hideArcTooltip 隐藏', () => {
    mountArcTooltip();
    showArcTooltip({ x: 0, y: 0, relationType: 'extends' });
    hideArcTooltip();
    const tip = document.querySelector('.arc-tooltip') as HTMLElement;
    expect(tip.style.display).toBe('none');
  });
});
```

- [ ] **Step 2: 跑测试 fail**

```bash
npm test -- arc-tooltip.test.ts
```

Expected: 3 fail

- [ ] **Step 3: 写 src/components/arc-tooltip.ts**

```ts
// M5 主线 A · 点弧线 tooltip 显示关系类型
// spec § 7.4 + Q4.4 默认行为
const REL_LABEL: Record<string, string> = {
  agreement: '同意（agreement）',
  disagreement: '反对（disagreement）',
  extends: '延伸（extends）',
};

let tooltipEl: HTMLDivElement | null = null;

export function mountArcTooltip(): HTMLElement {
  if (tooltipEl) return tooltipEl;
  tooltipEl = document.createElement('div');
  tooltipEl.className = 'arc-tooltip';
  tooltipEl.style.cssText = `
    position: fixed;
    display: none;
    background: #fcfaf6;
    border: 1px solid #1a1a1a;
    padding: 6px 10px;
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 12px;
    color: #1a1a1a;
    z-index: 12;
    pointer-events: none;
    max-width: 280px;
  `;
  document.body.appendChild(tooltipEl);
  return tooltipEl;
}

export function showArcTooltip(p: {
  x: number;
  y: number;
  relationType: string;
  reference?: string;
}): void {
  if (!tooltipEl) mountArcTooltip();
  const label = REL_LABEL[p.relationType] ?? p.relationType;
  tooltipEl!.innerHTML = `
    <div style="font-weight:600;color:#5b3a8c">${label}</div>
    ${p.reference ? `<div style="font-style:italic;color:#888;margin-top:2px">${p.reference}</div>` : ''}
  `;
  tooltipEl!.style.left = `${p.x}px`;
  tooltipEl!.style.top = `${p.y}px`;
  tooltipEl!.style.display = 'block';
}

export function hideArcTooltip(): void {
  if (tooltipEl) tooltipEl.style.display = 'none';
}
```

- [ ] **Step 4: 跑测试 verify pass**

```bash
npm test -- arc-tooltip.test.ts
```

Expected: 3 pass

- [ ] **Step 5: main.ts arc click handler · 两端居中 + 高亮**

找 main.ts 弧线渲染处（line ~158 `arc-layer`）加 click:

```ts
zoomLayer.select('g.arc-layer')
  .selectAll<SVGPathElement, ClaimRelation>('path.arc')
  .on('click', (event, r) => {
    event.stopPropagation();
    const s = claimIdToCoords.get(r.source)!;
    const t = claimIdToCoords.get(r.target)!;

    // 1. 计算让两端都进入 viewport (取中点 + 适配 zoom k)
    const midX = (s.x + t.x) / 2;
    const midY = (s.y + t.y) / 2;
    const spanX = Math.abs(t.x - s.x);
    const spanY = Math.abs(t.y - s.y);
    const visibleWidth = window.innerWidth - 32 - 400;  // sidebar + popover
    const visibleHeight = window.innerHeight - 70 - 160;  // header + timeline
    const targetK = Math.min(
      visibleWidth / (spanX * 1.2),  // 留 20% padding
      visibleHeight / (spanY * 1.2),
      8,  // max
    );
    const clampedK = Math.max(1, targetK);

    const ct = computeCenterTransform({
      target: { x: midX, y: midY },
      targetK: clampedK,
      currentK: zoomCtrl.getCurrentTransform().k,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      sidebarWidth: 32,
      popoverWidth: 0,  // 弧线点击不弹 popover
    });
    flyToTarget(svg, zoomCtrl.zoomBehavior, ct, 600);

    // 2. 弧线高亮
    d3.select(event.currentTarget as SVGPathElement)
      .raise()  // z 提到顶
      .transition().duration(300)
      .attr('stroke-width', 2.5)
      .attr('opacity', 1.0);

    // 3. tooltip 显示在弧线中点（屏幕坐标 = 画布坐标 + zoom transform）
    setTimeout(() => {
      const tx = ct.x + midX * ct.k;
      const ty = ct.y + midY * ct.k;
      showArcTooltip({
        x: tx + 16,
        y: ty - 32,
        relationType: r.type,
        reference: r.reference,
      });
    }, 650);
  });

// 点画布空白 → 复原弧线 + hide tooltip
svg.on('click', () => {
  hideArcTooltip();
  zoomLayer.select('g.arc-layer').selectAll('path.arc')
    .transition().duration(200)
    .attr('stroke-width', null)  // 复原
    .attr('opacity', null);
});
```

import:
```ts
import { mountArcTooltip, showArcTooltip, hideArcTooltip } from './components/arc-tooltip.ts';
mountArcTooltip();
```

- [ ] **Step 6: dev 验证点弧线**

```bash
npm run dev
```

期望：
- ✅ 点任意半圆弧 → 画布飞行 / 两端 obs 进入 viewport / 弧线高亮 + 紫色阴影
- ✅ tooltip 显示在弧线中点 / 内容 "同意（agreement）" + 引用源
- ✅ 点画布空白 → tooltip 消失 + 弧线复原

- [ ] **Step 7: Commit**

```bash
git add src/components/arc-tooltip.ts src/main.ts tests/unit/arc-tooltip.test.ts
git commit -F - <<'EOF'
feat(M5 T8): 点弧线 两端居中 + 高亮 + tooltip 关系类型

- arc-tooltip.ts 新建 / mount + show + hide 三 API
- main.ts arc.on('click') 计算 targetK 让两端都进 viewport (clamp 1-8) + flyToTarget + 高亮 + tooltip
- 点画布空白 = hideTooltip + 复原弧线
- 3 单元测试 pass

spec § 7.4 + Q4.4 默认行为 · DR-014
EOF
```

---

## Task 9: 双击中键 reset + cursor 状态 + 防中键默认

**Files:**
- Modify: `src/main.ts`（双击中键 listener + cursor 状态）
- Modify: `src/viz/zoom.ts`（暴露 reset API）
- Modify: `tests/unit/zoom.test.ts`

- [ ] **Step 1: 写失败测试 · zoom.ts reset API**

加到 `tests/unit/zoom.test.ts`:
```ts
it('reset() 重置到 k=1 + x=0 + y=0', () => {
  document.body.innerHTML = '<svg id="test-svg" width="800" height="600"></svg>';
  const svg = d3.select<SVGSVGElement, unknown>('#test-svg');
  const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
  // 先 zoom 到 3×
  ctrl.programmaticZoom(3, 0);
  // reset
  ctrl.reset(0);
  const t = ctrl.getCurrentTransform();
  expect(t.k).toBe(1);
  expect(t.x).toBe(0);
  expect(t.y).toBe(0);
});
```

- [ ] **Step 2: 跑测试 fail**

Expected: `ctrl.reset is not a function`

- [ ] **Step 3: zoom.ts 加 reset API**

```ts
export interface ZoomController {
  // ... 现有
  reset(duration?: number): void;
}

// 实现里：
return {
  // ... 现有
  reset: (duration = 800) => {
    svg.transition().duration(duration).call(
      zoomBehavior.transform, d3.zoomIdentity,
    );
  },
};
```

也更新 zoom-control.ts ⌂ button:
```ts
const home = mkBtn('zoom-reset', '⌂', '重置到全景视图', () => {
  opts.zoomController.reset(800);  // 改用 reset
});
```

- [ ] **Step 4: 跑测试 verify pass**

```bash
npm test -- zoom.test.ts
```

Expected: 5 pass (原 4 + 新 1)

- [ ] **Step 5: main.ts 双击中键 listener**

```ts
// 双击中键检测
let lastMiddleClickTime = 0;
const DOUBLE_CLICK_MS = 300;

document.addEventListener('mousedown', (e) => {
  if (e.button === 1) {  // 中键
    e.preventDefault();  // 防浏览器默认滚轮缩放页面
    const now = Date.now();
    if (now - lastMiddleClickTime < DOUBLE_CLICK_MS) {
      zoomCtrl.reset(800);
      lastMiddleClickTime = 0;  // 防三击
    } else {
      lastMiddleClickTime = now;
    }
  }
});

// 也阻止中键的 auxclick 默认行为
document.addEventListener('auxclick', (e) => {
  if (e.button === 1) e.preventDefault();
});
```

- [ ] **Step 6: cursor 状态（hover 画布空白 = grab / 按住 = grabbing）**

```ts
// 在 main.ts svg 创建后
svg.style('cursor', 'grab');
svg.on('mousedown', () => svg.style('cursor', 'grabbing'));
svg.on('mouseup', () => svg.style('cursor', 'grab'));
```

⚠ obs 圆点 + 弧线本身要 override cursor: pointer:
```ts
obsGroup.style('cursor', 'pointer');
zoomLayer.selectAll('path.arc').style('cursor', 'pointer');
```

- [ ] **Step 7: dev 验证**

```bash
npm run dev
```

期望：
- ✅ hover 画布空白 → cursor 变 grab
- ✅ 按住 + 拖动 → cursor 变 grabbing
- ✅ hover obs / 弧线 → cursor 变 pointer
- ✅ 双击鼠标中键 → 画布飞行 800ms 回到 1× 全景
- ✅ 浏览器不弹"滚轮缩放整页"默认行为

- [ ] **Step 8: Commit**

```bash
git add src/viz/zoom.ts src/main.ts src/components/zoom-control.ts tests/unit/zoom.test.ts
git commit -F - <<'EOF'
feat(M5 T9): 双击中键 reset + cursor 状态 + 防中键默认

- zoom.ts 暴露 reset(duration) API
- zoom-control ⌂ button 改用 reset
- main.ts 双击中键 listener (300ms 窗口) + preventDefault 防浏览器
- cursor 状态 grab / grabbing / pointer (obs + arc)
- 1 新单元测试 pass

spec § 7.5 + § 7.2 cursor · DR-018 重置 · R7 中键防默认
EOF
```

---

## Task 10: E2E (Playwright) + 4 件套 baseline + ship

**Files:**
- Create: `e2e/m5-linea-zoom.spec.ts`
- Modify: `playwright.config.ts`（如果需要）

### 10.1 E2E 用户旅程脚本

- [ ] **Step 1: 写 E2E spec 主用户旅程**

`e2e/m5-linea-zoom.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test.describe('M5 主线 A · 可探索基础设施 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await page.waitForSelector('g.zoom-layer');
  });

  test('滚轮 zoom 1× → 放大 + display 同步', async ({ page }) => {
    const display = page.locator('.zoom-control .zoom-display');
    await expect(display).toHaveText(/1\.0×/);

    // 滚轮缩放
    await page.locator('g.zoom-layer').hover();
    await page.mouse.wheel(0, -500);  // 向上滚轮 = 放大
    await page.waitForTimeout(300);

    const text = await display.textContent();
    const k = parseFloat(text!.replace('×', ''));
    expect(k).toBeGreaterThan(1.0);
  });

  test('单击 obs → 居中飞行 + 详情卡同时滑入', async ({ page }) => {
    const popover = page.locator('.claim-popover');
    await expect(popover).not.toHaveClass(/open/);

    // 单击任意 obs 圆点
    await page.locator('g.obs').first().click();
    await page.waitForTimeout(700);  // 飞行 600ms + buffer

    await expect(popover).toHaveClass(/open/);
    // 居中后 zoom k 应该 >= 3
    const k = parseFloat((await page.locator('.zoom-display').textContent())!.replace('×', ''));
    expect(k).toBeGreaterThanOrEqual(3.0);
  });

  test('Esc 关详情卡 / 不动 viewport', async ({ page }) => {
    await page.locator('g.obs').first().click();
    await page.waitForTimeout(700);
    const kBefore = parseFloat((await page.locator('.zoom-display').textContent())!.replace('×', ''));

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    await expect(page.locator('.claim-popover')).not.toHaveClass(/open/);
    const kAfter = parseFloat((await page.locator('.zoom-display').textContent())!.replace('×', ''));
    expect(kAfter).toBe(kBefore);  // zoom 不变
  });

  test('⌂ home 按钮 = reset 到 1×', async ({ page }) => {
    // 先 zoom 到 4×
    await page.locator('.zoom-control .zoom-in').click();
    await page.locator('.zoom-control .zoom-in').click();
    await page.locator('.zoom-control .zoom-in').click();
    await page.waitForTimeout(600);

    // ⌂ reset
    await page.locator('.zoom-control .zoom-reset').click();
    await page.waitForTimeout(900);

    await expect(page.locator('.zoom-display')).toHaveText(/1\.0×/);
  });

  test('点弧线 → tooltip 显示 + 弧线高亮', async ({ page }) => {
    await page.locator('path.arc').first().click();
    await page.waitForTimeout(700);

    await expect(page.locator('.arc-tooltip')).toBeVisible();
    const text = await page.locator('.arc-tooltip').textContent();
    expect(text).toMatch(/同意|反对|延伸/);
  });

  test('拖时间轴游标 → 画布 pan 同步', async ({ page }) => {
    const cursor = page.locator('.timeline-cursor');
    const cursorBox = await cursor.boundingBox();
    expect(cursorBox).toBeTruthy();

    // 拖到右边 100px
    await cursor.hover();
    await page.mouse.down();
    await page.mouse.move(cursorBox!.x + 100, cursorBox!.y);
    await page.mouse.up();
    await page.waitForTimeout(300);

    // zoom-layer transform.x 应该变化
    const transform = await page.locator('g.zoom-layer').getAttribute('transform');
    expect(transform).toMatch(/translate\(-?\d+/);
  });
});
```

- [ ] **Step 2: build + 跑 e2e**

```bash
npm run build
npm run preview &
sleep 2
npm run e2e -- m5-linea-zoom 2>&1 | tail -30
```

Expected: 6 tests pass

- [ ] **Step 3: 跑 gstack 4 件套 baseline 对比**

```bash
# health
npx gstack health 2>&1 | tail -10

# benchmark (baseline 对比)
npx gstack benchmark --against-baseline 2>&1 | tail -15

# qa
npx gstack qa-only --tier standard 2>&1 | tail -20

# design review (report only)
npx gstack design-review --report-only 2>&1 | tail -20
```

Expected baseline 不退化（spec § 11.3）：
- Health composite ≥ 8.0
- Bundle JS transfer ≤ 47KB
- FCP ≤ 5515ms
- QA ≥ 90
- Design ≥ B+ (84)
- AI Slop ≥ B (85)

任一破警戒线 → 修了再 ship。

- [ ] **Step 4: 跑全套测试再 verify**

```bash
npm test 2>&1 | tail -10
```

Expected: ~120/123 pass（M4 106 + 主线 A 新加约 14 个）/ 3 pre-existing RED 不变

- [ ] **Step 5: build prod + commit + push**

```bash
npm run build
git add e2e/m5-linea-zoom.spec.ts
git commit -F - <<'EOF'
test(M5 T10): E2E Playwright 6 主用户旅程 + 4 件套 baseline 验证

- 滚轮 zoom · 单击 obs · Esc · ⌂ reset · 点弧线 · 拖游标 6 用户旅程
- 4 件套验证 baseline 不退化 (health/benchmark/qa/design)
- npm test ~120/123 pass

spec § 11 验收标准 · M5 主线 A 完成
EOF
git push origin main
```

- [ ] **Step 6: tag m5-linea-final + GH Pages deploy 等通过**

```bash
git tag m5-linea-final
git push origin m5-linea-final
# GH Actions 自动 deploy / 监控 ~3 分钟
gh run watch
```

- [ ] **Step 7: prod smoke test**

```bash
curl -sI https://cdu52802-xx.github.io/marx/ | head -5
```

Expected: HTTP 200 + Content-Type text/html

打开 prod 验证 6 用户旅程在生产环境 work。

- [ ] **Step 8: 落 takeaway + memory update**

写 `docs/2026-05-XX-m5-linea-takeaway.md`（XX = ship 当日）/ 更新 memory `m5_linea_completion.md`。

复用 M4 takeaway 模板。

---

## Self-Review

**1. Spec coverage check**:

| Spec section | 实现 task |
|---|---|
| § 2.1 主线 A yes/no 范围 | T1-T9 实现 yes · 不做项不写代码 ✓ |
| § 3 PRD trace（缩放 + 时间轴 + 部分 tooltip）| T1 zoom · T6 时间轴 · T8 arc tooltip ✓ |
| § 4 视觉风格（继承 M4）| 不动 M4 视觉 · T3 缩放控件按 § 4.1 增补 ✓ |
| § 5 Layout（屏幕 vs 画布坐标分层）| T1 zoom-layer 包裹 ✓ |
| § 6 时间轴新形态 | T6 + T7 ✓ |
| § 7.1 滚轮 zoom | T1 ✓ |
| § 7.2 pan 边界 | T2 ✓ |
| § 7.3 单击 obs | T5 ✓ |
| § 7.4 单击弧线 | T8 ✓ |
| § 7.5 双击中键 reset | T9 ✓ |
| § 7.6 Esc 关详情卡 | T5 ✓ |
| § 8.1 sidebar | 不动（M4 done）✓ |
| § 8.2 详情卡宽 400 | T5 ✓ |
| § 8.3 缩放控件左下 | T3 ✓ |
| § 8.4 右上预留 | 不实现（主线 B 范围）✓ |
| § 9 技术架构 | 所有 task ✓ |
| § 10 task 拆分粗框架 | 本 plan T0-T10 细化 ✓ |
| § 11 验收标准 | T10 E2E + 4 件套 ✓ |
| § 12 风险 R1-R8 | R1 T1 verify · R2 T4 60fps · R3 T6 syncingFromTimeline · R4 T3 ⌂ + T9 中键 · R5 T1 字号 clamp / 留实现期定 · R6 PM checkpoint 30/60/90 不在 plan 内 · R7 T9 preventDefault · R8 T6 30% checkpoint 不在 plan 内 |

⚠ R5 字号 clamp + R6/R8 PM checkpoint 不是单独 task / 实施时按 spec 内嵌处理。

**2. Placeholder scan**: 全文搜 TBD / TODO / fill in details ... 无。所有 step 含具体代码 + 命令 + expected output ✓

**3. Type consistency**:
- `ZoomController` 接口在 T1 定义 / T2 / T3 / T9 复用 ✓
- `CenterParams` / `CenterTransform` 在 T4 定义 / T5 / T8 复用 ✓
- `PlayState` 在 T7 定义独立 ✓
- 函数名一致：`createZoom` / `computeCenterTransform` / `flyToTarget` / `mountZoomControl` / `mountTimeline` / `mountArcTooltip` ✓

**4. Ambiguity check**:
- T1 step 5 zoomLayer 替换所有 svg.append → "全文 grep" 不够精确 / 实施时按现有 main.ts 文件逐行替换（保留 svg root 属性）✓ 加 ⚠ 标记 ✓
- T6 step 5 timeline 改造伪代码骨架 / 不是完整代码 → 实施时按现有 timeline.ts 结构具体改写 ✓ 标 "实现时按现有 timeline.ts 结构具体改写"
- 其他 step 都有完整代码 ✓

Self-review pass ✓

---

## 跨窗口续接（实施期）

新窗口开场白模板：

> 续接 Marx · M5 主线 A 实施
>
> 读：
> 1. `AGENTS.md`
> 2. `docs/2026-05-13-m4-takeaway.md`
> 3. `specs/2026-05-14-m5-linea-explorability-design.md`
> 4. `plans/2026-05-14-marx-m5-linea-explorability.md`（本文件）
> 5. `docs/2026-05-XX-m5-linea-progress-anchor.md`（实施期 anchor / 进行时产生 / ship 后改 takeaway）
>
> 找 plan 里 checkbox `[ ]` 未完成的 task → 继续。
> 重要 lesson：每 T2-3 task 完跑一次 `npm test` 防 regression / 每 task commit / 不堆积。

---

**Plan v1 done · 等 PM choose execution mode ✅**
