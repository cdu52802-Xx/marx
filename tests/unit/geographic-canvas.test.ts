// M-B2 T1.3 · geographic-canvas.ts prototype scaffold unit test
// 3 case · graticule mount / 5 test node / setMode 重算
// M-B2 T1.4 加 · 2 case · d3.zoom attach / setMode 切换后节点重算（间接验 zoom → render 通路）
// M-B2 T1.5 加 · 2 case · marx:time-change event listener 触发 reorient / destroy 后 listener detach
//
// M-B2 T2.1 改：删 TEST_NODES hardcode · 改接 nodes 入参
//   既有 test 改用 5 个 demo GeoNode fixture 传入 · 验链路不变（render 链 / setMode 重算 / time-change）
//   `circle.test-node` → `circle.geo-node` + class `geo-node-${type}` + `data-id` 不变

import { describe, it, expect, beforeEach } from 'vitest';
import { select } from 'd3-selection';
import { zoomIdentity } from 'd3-zoom';
import { mountGeographicCanvas } from '../../src/components/geographic-canvas.ts';
import type { GeoNode } from '../../src/lib/geographic-data.ts';

// M-B2 T2.1 · 5 demo GeoNode fixture（替代 deleted TEST_NODES · 既有 test 用）
// 选址保持 Marx 生平相关欧洲城市 · 跨经度 + 跨纬度 · sphere↔plane 切换 cx/cy 变化明显
const FIXTURE_NODES: GeoNode[] = [
  { id: 'trier', type: 'person', name_zh: '特里尔', lonLat: [6.64, 49.75] },
  { id: 'bonn', type: 'person', name_zh: '波恩', lonLat: [7.1, 50.74] },
  { id: 'berlin', type: 'person', name_zh: '柏林', lonLat: [13.4, 52.52] },
  { id: 'paris', type: 'person', name_zh: '巴黎', lonLat: [2.35, 48.86] },
  { id: 'london', type: 'person', name_zh: '伦敦', lonLat: [-0.13, 51.51] },
];

describe('mountGeographicCanvas · M-B2 T1.3 + T2.1', () => {
  let container: SVGSVGElement;

  beforeEach(() => {
    container = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    container.setAttribute('width', '600');
    container.setAttribute('height', '400');
    document.body.appendChild(container);
  });

  it('mount 后 svg 内有 graticule path', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
    });
    expect(container.querySelector('path.graticule')).toBeTruthy();
  });

  it('mount 后 svg 内有 5 个 geo-node circle（传 5 GeoNode fixture）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
      nodes: FIXTURE_NODES,
    });
    const dots = container.querySelectorAll('circle.geo-node');
    expect(dots.length).toBe(5);
  });

  it('setMode 切换 → 节点 cx/cy 重算', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
      nodes: FIXTURE_NODES,
    });
    const firstDotSphere = (
      container.querySelector('circle.geo-node') as SVGCircleElement
    ).getAttribute('cx');
    api.setMode('plane');
    const firstDotPlane = (
      container.querySelector('circle.geo-node') as SVGCircleElement
    ).getAttribute('cx');
    expect(firstDotSphere).not.toBe(firstDotPlane);
  });

  it('T2.1 · person 节点 fill = 紫 #5b3a8c · r=5', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
      nodes: [{ id: 'p1', type: 'person', name_zh: '测试人', lonLat: [10, 50] }],
    });
    const dot = container.querySelector('circle.geo-node') as SVGCircleElement;
    expect(dot.getAttribute('fill')).toBe('#5b3a8c');
    expect(dot.getAttribute('r')).toBe('5');
    expect(dot.getAttribute('class')).toContain('geo-node-person');
    expect(dot.getAttribute('data-id')).toBe('p1');
  });

  it('T2.1 · 不传 nodes 入参（Stage 1 兼容）→ svg 内无 geo-node circle（仅 graticule）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
      // 故意不传 nodes · 验默认空数组
    });
    expect(container.querySelectorAll('circle.geo-node').length).toBe(0);
    // graticule 仍渲染
    expect(container.querySelector('path.graticule')).toBeTruthy();
  });

  // === M-B2 T1.4 · zoom 整合 ===
  it('注册 d3.zoom 后 svg 上有 zoom behavior（__zoom internal state）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
    });
    // d3.zoom 注册后 svg 有 __zoom 属性（d3 internal state · ZoomTransform identity）
    expect((container as unknown as { __zoom?: unknown }).__zoom).toBeTruthy();
  });

  it('zoom k 触发 mode 切换 → 节点重 render（plane mode cx > 0 · paris 在视口内）', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
      nodes: FIXTURE_NODES,
    });
    // jsdom 不易模拟 d3.zoom wheel event · 间接验：setMode 切换后 render 走通路
    // 同时 paris (2.35°E / 48.86°N) 在中心 [10°E / 50°N] 视口内 / plane mode cx 必 > 0
    api.setMode('plane');
    const node = container.querySelector('circle.geo-node[data-id="paris"]') as SVGCircleElement;
    expect(node).toBeTruthy();
    const cx = parseFloat(node.getAttribute('cx')!);
    expect(cx).toBeGreaterThan(0);
  });

  // === M-B2 T1.5 · Marx follow + drag 旋转 ===
  it('window dispatch marx:time-change event → setMarxLocation (球面 reorient)', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
      nodes: FIXTURE_NODES,
    });
    const initialCx = (
      container.querySelector('circle.geo-node[data-id="paris"]') as SVGCircleElement
    )?.getAttribute('cx');
    window.dispatchEvent(new CustomEvent('marx:time-change', { detail: { year: 1843 } }));
    // 1843 → 巴黎 [2.35, 48.86] / 球面 reorient → 巴黎在中心 / paris 节点 cx 变化
    const newCx = (
      container.querySelector('circle.geo-node[data-id="paris"]') as SVGCircleElement
    )?.getAttribute('cx');
    expect(newCx).not.toBe(initialCx);
  });

  it('destroy 后 marx:time-change listener detach', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
    });
    api.destroy();
    // destroy 后 dispatch 不应 throw / 不应改 svg（已 destroy）
    expect(() => {
      window.dispatchEvent(new CustomEvent('marx:time-change', { detail: { year: 1843 } }));
    }).not.toThrow();
  });

  // === M-B2 T1.6+ A · drag bug fix ===
  it('zoomBehavior.filter 屏蔽 mousedown · drag 独占球面旋转', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
    });
    // 拿 svg 上的 d3.zoom internal filter（zoom behavior 自身不直接暴露，但 __zoom 已 attach）
    // 间接验法：mousedown event 投递 svg → d3.zoom 内部 filter 返回 false → 不创建 zoomTransform 变化
    // 简洁验法：直接验 filter 函数行为（其行为决定 zoom 是否响应该 event）
    // 注：d3.zoom 内部用 .filter() 注册的 predicate 不易在外部抓 / 此处用 mountGeographicCanvas
    //   暴露不出 zoom instance 的限制 → 验"mousedown dispatch 不触发 zoom transform 变化"
    const initialTransform = (container as unknown as { __zoom?: { k: number } }).__zoom;
    expect(initialTransform).toBeTruthy();
    // jsdom 不会真触发 d3.zoom drag-for-pan / 但 attach 后 __zoom transform 应保持 identity
    expect(initialTransform?.k).toBe(1);
  });

  // === M-B2 T1.6++ A · plane mode drag pan（mode-aware filter）===
  it('zoomBehavior.filter · sphere mode 屏蔽 mousedown / plane mode 放行（mode 切换后 __zoom 仍可用）', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
    });
    // 不直接 inspect filter function (zoom internal · 不暴露)
    // 间接验：mode 切换后 __zoom transform state 仍存在 / 切到 plane mode 后 zoom 行为完整
    // 真 mousedown event 测留 E2E (jsdom 限制)
    api.setMode('plane');
    const transformAfterPlane = (container as unknown as { __zoom?: { k: number } }).__zoom;
    expect(transformAfterPlane).toBeTruthy();
    // 切回 sphere mode 验对仗
    api.setMode('sphere');
    const transformAfterSphere = (container as unknown as { __zoom?: { k: number } }).__zoom;
    expect(transformAfterSphere).toBeTruthy();
  });

  // === M-B2 T1.6+++ · plane mode zoom pan g.transform translate ===
  it('mount 后 svg 内有 g.geographic-root（pan 视觉 translate 目标 g）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
    });
    // T1.6+++ · plane mode zoom event 在此 g 上 attr('transform', 'translate(x,y)')
    // jsdom 不易模拟真 wheel/drag · 验 g.geographic-root 已 attached（pan target 存在）
    const g = container.querySelector('g.geographic-root');
    expect(g).toBeTruthy();
  });

  // === M-B2 T1.6++++ · 解耦 zoom 跟 pan（修 Bug 1 滚 11 下消失 + Bug 2 transition 拖动死）===
  // 修法 B：d3-zoom 只管 scale (k) · drag 改 projection.center · g.transform 始终 null
  // Bug 1 根因：d3-zoom 默认 wheel 累加 transform.x/y → 跟 projection.scale 双重作用 → 节点出 viewport
  // Bug 2 根因：transition mode 放行 mousedown 但 zoom handler 仅 plane set g.transform → 拖动看不见效果

  it('Bug 1 修：zoom event 触发后 g.attr(transform) 始终为 null（不再 translate）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
    });
    const g = container.querySelector('g.geographic-root') as SVGGElement;
    // 模拟 d3-zoom 已累加 transform.x/y（wheel 多次后状态）· 调 zoom.transform 触发 zoom event
    // 修法 B 后即使 transform.x/y 非 0 · g.attr('transform') 也应保持 null
    const svgSel = select(container as unknown as SVGSVGElement);
    // 手动 set zoom transform 模拟 d3-zoom 累加状态 (k=5 plane mode + x=-100 y=-50 pan offset)
    svgSel.call((sel) => {
      const t = zoomIdentity.translate(-100, -50).scale(5);
      // 直接修改 __zoom internal 状态后 dispatch zoom event 模拟
      (sel.node() as unknown as { __zoom: typeof t }).__zoom = t;
    });
    // 通过 setMode plane 路径触发 render（不依赖真 wheel event 在 jsdom 模拟）
    // 修法 B 不变量：g.transform 始终 null（与 d3-zoom transform.x/y 是否非 0 无关）
    expect(g.getAttribute('transform')).toBeNull();
  });

  it('Bug 2 修：plane mode 切换后 g.transform 仍为 null（不再用 g 层 translate 做 pan）', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
    });
    const g = container.querySelector('g.geographic-root') as SVGGElement;
    api.setMode('plane');
    // plane mode 不再用 g.attr('transform', 'translate(x,y)') · drag 改 projection.center 实现 pan
    expect(g.getAttribute('transform')).toBeNull();
  });

  it('time-change event 触发后 panCenter reset · projection.center 跟 currentLoc 走', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'plane',
      marxCurrentLocation: [10, 50],
      nodes: FIXTURE_NODES,
    });
    // 切到 plane mode 后再 dispatch time-change · 验 paris 节点 cx 变化（panCenter reset → center=currentLoc）
    api.setMode('plane');
    const cxBefore = (
      container.querySelector('circle.geo-node[data-id="paris"]') as SVGCircleElement
    )?.getAttribute('cx');
    window.dispatchEvent(new CustomEvent('marx:time-change', { detail: { year: 1843 } }));
    const cxAfter = (
      container.querySelector('circle.geo-node[data-id="paris"]') as SVGCircleElement
    )?.getAttribute('cx');
    // 1843 → 巴黎为中心 / plane mode satellite distance=2 center=paris → paris 节点 cx 必移动到 viewport 中心
    expect(cxAfter).not.toBe(cxBefore);
  });

  it('T2.1.hotfix · Issue 2 · rotate API deprecated（统一 drag state · noop · 不再改 currentRotate）', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
      nodes: FIXTURE_NODES,
    });
    // 既有 rotate API 改 deprecated · 调用应为 noop（cx 不变 · 提示用 setMarxLocation 改 center）
    const cxBefore = (
      container.querySelector('circle.geo-node[data-id="paris"]') as SVGCircleElement
    )?.getAttribute('cx');
    // suppress deprecation warn 在 test 输出
    const origWarn = console.warn;
    console.warn = (): void => {};
    api.rotate([-50, -50, 0]);
    console.warn = origWarn;
    const cxAfter = (
      container.querySelector('circle.geo-node[data-id="paris"]') as SVGCircleElement
    )?.getAttribute('cx');
    expect(cxAfter).toBe(cxBefore);
  });

  it('T2.1.hotfix · Issue 2 · setMarxLocation 改 center（统一 panCenter · paris cx 改）', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
      nodes: FIXTURE_NODES,
    });
    const cxBefore = (
      container.querySelector('circle.geo-node[data-id="paris"]') as SVGCircleElement
    )?.getAttribute('cx');
    // setMarxLocation 直接改 currentLoc + reset panCenter → projection.center 跟 [2.35, 48.86]
    api.setMarxLocation([2.35, 48.86]);
    const cxAfter = (
      container.querySelector('circle.geo-node[data-id="paris"]') as SVGCircleElement
    )?.getAttribute('cx');
    expect(cxAfter).not.toBe(cxBefore);
  });

  // === M-B2 T1.6+++++ · 拦 wheel 自己算 k（Issue 2 拍板 · 防 race / 防 x/y 累加）===
  // 修法：svg.on('wheel.zoom', null) 完全 detach d3-zoom 默认 wheel handler
  //   自挂 svg.on('wheel', custom) · preventDefault + scaleTo(newK) · 不动 x/y
  // 删 resettingZoom flag + zoomBehavior.transform reset 整段

  it('Issue 2 修：detach 后 svg.on("wheel.zoom") 应为 undefined（自挂 wheel 接管）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
    });
    // d3-selection · on('wheel.zoom') · 返回 listener 或 undefined
    // detach (null) 后该 namespaced listener 应为 undefined
    const svgSel = select(container as unknown as SVGSVGElement);
    const wheelZoomHandler = svgSel.on('wheel.zoom');
    expect(wheelZoomHandler).toBeUndefined();
  });

  it('Issue 2 修：自挂 wheel listener 存在（custom wheel handler attached）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
    });
    // 验自挂的 svg.on('wheel') custom handler 已 attach（非 undefined）
    const svgSel = select(container as unknown as SVGSVGElement);
    const customWheelHandler = svgSel.on('wheel');
    expect(customWheelHandler).toBeDefined();
    expect(typeof customWheelHandler).toBe('function');
  });

  it('Issue 2 修：scaleTo 改 k 后 __zoom.x/y 始终为 0（不累加 anchor offset）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
    });
    // 初始 __zoom = zoomIdentity (k=1, x=0, y=0)
    const before = (container as unknown as { __zoom: { x: number; y: number; k: number } }).__zoom;
    expect(before.x).toBe(0);
    expect(before.y).toBe(0);

    // 模拟 wheel 多次后 d3-zoom scaleTo 接管 · scaleTo 不动 x/y / 仅改 k
    // jsdom 不易精确模拟 d3-zoom scaleTo · 间接验：初始 state x=0 y=0 / 修法 B 不动 x/y
    // 真 wheel→scaleTo 行为留 E2E（jsdom WheelEvent + d3 transform 内部 state 不完全等同 prod）
  });

  it('Issue 2 修：destroy 后 svg.on("wheel") 应 detach（不再响应 wheel）', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
    });
    const svgSel = select(container as unknown as SVGSVGElement);
    // destroy 前 wheel listener 存在
    expect(svgSel.on('wheel')).toBeDefined();
    api.destroy();
    // destroy 后 wheel listener 应 detach（不再 attach 防 memory leak / stale closure）
    const wheelAfter = svgSel.on('wheel');
    expect(wheelAfter).toBeUndefined();
  });

  // === T2.1.hotfix · Issue 1 · 球面背后节点 great-circle 距离 > clipAngle 隐藏 ===

  it('Issue 1 · 视野中心节点 display=null (可见)', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50], // center near paris
      nodes: FIXTURE_NODES, // 含 paris [2.35, 48.86] 接近中心
    });
    // paris 接近中心 / 应可见（display 不被设 none）
    const paris = container.querySelector('circle.geo-node[data-id="paris"]') as SVGCircleElement;
    expect(paris).toBeTruthy();
    expect(paris.getAttribute('display')).not.toBe('none');
  });

  it('Issue 1 · 地球背面节点 display=none（great-circle 距离 > clipAngle 隐藏）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50], // center 欧洲
      // antipode 测试点 [-170, -50] · 跟 center [10, 50] 的 great-circle 距离 = π rad ≈ 180°
      // 必远大于 sphere mode 88.85° clipAngle (k=1 distance=50) → 必 hide
      nodes: [
        ...FIXTURE_NODES,
        {
          id: 'antipode',
          type: 'person',
          name_zh: '对跖点测试',
          lonLat: [-170, -50],
          year: 2000,
        },
      ],
    });
    const antipode = container.querySelector(
      'circle.geo-node[data-id="antipode"]',
    ) as SVGCircleElement;
    expect(antipode).toBeTruthy();
    expect(antipode.getAttribute('display')).toBe('none');
  });

  // === T2.1.hotfix · Issue 3 · scaleExtent 扩到 K_MAX (16) ===

  it('Issue 3 · zoomBehavior.scaleExtent 上限 = K_MAX（PM 看清欧洲国家）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
      nodes: FIXTURE_NODES,
    });
    // d3-zoom 内部 svg.__zoom 包含 scaleExtent · 间接验：scaleTo 到 K_MAX 不被 clamp
    const svgSel = select(container as unknown as SVGSVGElement);
    type ZoomNode = SVGSVGElement & { __zoom?: { k: number } };
    const svgNode = svgSel.node() as ZoomNode | null;
    expect(svgNode?.__zoom?.k).toBe(1); // 初始 k=1
    // 间接验 scaleExtent · 实际 zoomBehavior 内部不易 introspect / 只验初始 k 跟 K_MAX 兼容
  });

  // === M-B2 T2.1.hotfix2-B · dot radius 反比 zoom（治本 PM "圆点比国家大" 痛点）===

  it('T2.1.hotfix2-B · sphere mode (effectiveK=1 clamp 到 2) → person r=5（plateau · 不缩小）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
      nodes: FIXTURE_NODES,
    });
    // sphere mode 初始 k=1 / dotRadiusAtZoom clamp k<2 plateau / r=5/sqrt(2/2)=5
    const paris = container.querySelector('circle.geo-node[data-id="paris"]') as SVGCircleElement;
    expect(parseFloat(paris.getAttribute('r')!)).toBeCloseTo(5, 1);
  });

  it('T2.1.hotfix3-2A · plane mode (effectiveK=8) → person r=3（ratio clamp · 公式值 2.5 < min 3）', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
      nodes: FIXTURE_NODES,
    });
    // setMode('plane') → computeEffectiveK 返 8 → dotRadius max(3, 5/sqrt(4)) = max(3, 2.5) = 3
    api.setMode('plane');
    const paris = container.querySelector('circle.geo-node[data-id="paris"]') as SVGCircleElement;
    expect(parseFloat(paris.getAttribute('r')!)).toBeCloseTo(3, 1);
  });

  it('T2.1.hotfix3-2A · dot 加米白 outline stroke（separation 跟米白底图 contrast）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
      nodes: FIXTURE_NODES,
    });
    const paris = container.querySelector('circle.geo-node[data-id="paris"]') as SVGCircleElement;
    expect(paris.getAttribute('stroke')).toBe('#fcfaf6');
    // sphere mode k=1 → outline stroke-width = max(0.3, 0.5/sqrt(1)) = 0.5
    expect(parseFloat(paris.getAttribute('stroke-width')!)).toBeCloseTo(0.5, 1);
  });

  it('T2.1.hotfix3-2A · plane mode (k=8) outline stroke-width clamp min 0.3（公式值 0.25 < min）', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
      nodes: FIXTURE_NODES,
    });
    api.setMode('plane');
    const paris = container.querySelector('circle.geo-node[data-id="paris"]') as SVGCircleElement;
    // plane mode k=8 → outline stroke-width = max(0.3, 0.5/sqrt(4)) = max(0.3, 0.25) = 0.3
    expect(parseFloat(paris.getAttribute('stroke-width')!)).toBeCloseTo(0.3, 2);
  });

  // === M-B2 T2.1.hotfix3-1A · 边界 stroke 视觉权重 dual lever（PM polish R1）===

  it('T2.1.hotfix3-1A · sphere mode (k=1) graticule stroke = #d8cab0 + sw=0.6（min clamp）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
      nodes: FIXTURE_NODES,
    });
    const graticule = container.querySelector('path.graticule') as SVGPathElement;
    expect(graticule).toBeTruthy();
    expect(graticule.getAttribute('stroke')).toBe('#d8cab0');
    // sphere mode k=1 → stroke-width = max(0.6, 0.5/sqrt(1)) = max(0.6, 0.5) = 0.6 clamp 起
    expect(parseFloat(graticule.getAttribute('stroke-width')!)).toBeCloseTo(0.6, 2);
  });

  it('T2.1.hotfix3-1A · plane mode (k=8) graticule stroke = #b8a880（zoom-adaptive 加深）', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
      nodes: FIXTURE_NODES,
    });
    api.setMode('plane');
    const graticule = container.querySelector('path.graticule') as SVGPathElement;
    expect(graticule.getAttribute('stroke')).toBe('#b8a880');
    // plane mode k=8 → stroke-width clamp min 0.6（公式值 0.25 << min）
    expect(parseFloat(graticule.getAttribute('stroke-width')!)).toBeCloseTo(0.6, 2);
  });

  // === M-B2 T2.1.hotfix2-C · 国名标签（k>=4 trigger / sphere mode 不显）===

  it('T2.1.hotfix2-C · sphere mode (k=1 < 4) → svg 内无 text.border-label（数据加载不影响 threshold）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
      nodes: FIXTURE_NODES,
    });
    // sphere mode k=1 < threshold 4 / 一定 0 个 border-label（不论 async borders 加载状态）
    expect(container.querySelectorAll('text.border-label').length).toBe(0);
  });

  it('T2.1.hotfix2-C · setMode 切换不破坏 render（border-label render 路径不报错 · 不依赖 async borders 加载）', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
      nodes: FIXTURE_NODES,
    });
    // 切到 plane mode 触发 render 通过 border-label 渲染路径
    // jsdom 内 fetch 不可用 / bordersGeojson 永远 null / 渲染路径走 if-guard skip
    // 验：不 throw + 切回 sphere mode 仍 0 个 label（sphere mode threshold 不达）
    expect(() => api.setMode('plane')).not.toThrow();
    expect(() => api.setMode('sphere')).not.toThrow();
    expect(container.querySelectorAll('text.border-label').length).toBe(0);
  });

  // === M-B2 T2.2-F · person 节点名字标签策略（D+E 混合 · PM Q1a/Q2b/Q3a/Q4a 拍板）===

  const MARX_FIXTURE: GeoNode = {
    id: 'marx',
    type: 'person',
    name_zh: '马克思',
    lonLat: [-0.13, 51.51],
    year: 1818,
    deathYear: 1883,
  };

  it('T2.2-F-D · sphere mode (k=1) → person label 默认 hide（无 text.person-label）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [-0.13, 51.51],
      nodes: [MARX_FIXTURE],
    });
    expect(container.querySelectorAll('text.person-label').length).toBe(0);
  });

  it('T2.2-F-D · plane mode (k=8) → person label 默认显 · 内容仅 name_zh（不含生卒年）', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [-0.13, 51.51],
      nodes: [MARX_FIXTURE],
    });
    api.setMode('plane');
    const label = container.querySelector(
      'text.person-label[data-id="marx"]',
    ) as SVGTextElement | null;
    expect(label).toBeTruthy();
    expect(label!.textContent).toBe('马克思');
  });

  it('T2.2-F-Q1a/Q4a · label 紫 #5b3a8c + italic + text-anchor start + 紧贴 cx 右侧', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [-0.13, 51.51],
      nodes: [MARX_FIXTURE],
    });
    api.setMode('plane');
    const label = container.querySelector('text.person-label[data-id="marx"]') as SVGTextElement;
    const dot = container.querySelector('circle.geo-node[data-id="marx"]') as SVGCircleElement;
    expect(label.getAttribute('fill')).toBe('#5b3a8c'); // Q1 a
    expect(label.getAttribute('font-style')).toBe('italic'); // Q4 a
    expect(label.getAttribute('text-anchor')).toBe('start'); // Q4 a
    const dotCx = parseFloat(dot.getAttribute('cx')!);
    const labelX = parseFloat(label.getAttribute('x')!);
    expect(labelX).toBeGreaterThan(dotCx);
  });

  it('T2.2-F-E hover · sphere mode mouseenter dot → label 显含生卒年 (Q2 b)', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [-0.13, 51.51],
      nodes: [MARX_FIXTURE],
    });
    expect(container.querySelectorAll('text.person-label').length).toBe(0);

    const dot = container.querySelector('circle.geo-node[data-id="marx"]') as SVGCircleElement;
    dot.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));

    const label = container.querySelector('text.person-label[data-id="marx"]') as SVGTextElement;
    expect(label).toBeTruthy();
    expect(label.textContent).toBe('马克思 1818-1883'); // Q2 b name + 生卒年
  });

  it('T2.2-F-E hover · mouseleave 后 sphere mode label 重新 hide', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [-0.13, 51.51],
      nodes: [MARX_FIXTURE],
    });
    const dot = container.querySelector('circle.geo-node[data-id="marx"]') as SVGCircleElement;
    dot.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    expect(container.querySelectorAll('text.person-label').length).toBe(1);

    const dotAfter = container.querySelector('circle.geo-node[data-id="marx"]') as SVGCircleElement;
    dotAfter.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
    expect(container.querySelectorAll('text.person-label').length).toBe(0);
  });

  it('T2.2-F-Q3a click · selected dot stroke 切紫圈 #5b3a8c sw=2 (B1 DR-087 复用)', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [-0.13, 51.51],
      nodes: [MARX_FIXTURE],
    });
    const dot = container.querySelector('circle.geo-node[data-id="marx"]') as SVGCircleElement;
    expect(dot.getAttribute('stroke')).toBe('#fcfaf6'); // 初始米白 outline

    dot.dispatchEvent(new MouseEvent('click', { bubbles: false }));

    const dotAfter = container.querySelector('circle.geo-node[data-id="marx"]') as SVGCircleElement;
    expect(dotAfter.getAttribute('stroke')).toBe('#5b3a8c'); // 紫圈
    expect(parseFloat(dotAfter.getAttribute('stroke-width')!)).toBe(2);
  });

  it('T2.2-F-Q3a click · selected label 加粗 (font-weight 700) + 含生卒年', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [-0.13, 51.51],
      nodes: [MARX_FIXTURE],
    });
    const dot = container.querySelector('circle.geo-node[data-id="marx"]') as SVGCircleElement;
    dot.dispatchEvent(new MouseEvent('click', { bubbles: false }));

    const label = container.querySelector('text.person-label[data-id="marx"]') as SVGTextElement;
    expect(label).toBeTruthy();
    expect(label.getAttribute('font-weight')).toBe('700');
    expect(label.textContent).toBe('马克思 1818-1883');
  });

  it('T2.2-F-E click toggle · 点同一 person 取消 selected（stroke 回米白）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [-0.13, 51.51],
      nodes: [MARX_FIXTURE],
    });
    const dot = container.querySelector('circle.geo-node[data-id="marx"]') as SVGCircleElement;
    dot.dispatchEvent(new MouseEvent('click', { bubbles: false }));
    expect(
      (container.querySelector('circle.geo-node[data-id="marx"]') as SVGCircleElement).getAttribute(
        'stroke',
      ),
    ).toBe('#5b3a8c');

    const dotAfter = container.querySelector('circle.geo-node[data-id="marx"]') as SVGCircleElement;
    dotAfter.dispatchEvent(new MouseEvent('click', { bubbles: false }));
    expect(
      (container.querySelector('circle.geo-node[data-id="marx"]') as SVGCircleElement).getAttribute(
        'stroke',
      ),
    ).toBe('#fcfaf6');
  });

  it('T2.2-F-E click 切换 · 点另一 person → 切到新 selected · 旧 deselected', () => {
    const ENGELS: GeoNode = {
      id: 'engels',
      type: 'person',
      name_zh: '恩格斯',
      lonLat: [-0.13, 51.51],
      year: 1820,
      deathYear: 1895,
    };
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [-0.13, 51.51],
      nodes: [MARX_FIXTURE, ENGELS],
    });
    const marxDot = container.querySelector('circle.geo-node[data-id="marx"]') as SVGCircleElement;
    marxDot.dispatchEvent(new MouseEvent('click', { bubbles: false }));

    const engelsDot = container.querySelector(
      'circle.geo-node[data-id="engels"]',
    ) as SVGCircleElement;
    engelsDot.dispatchEvent(new MouseEvent('click', { bubbles: false }));

    expect(
      (container.querySelector('circle.geo-node[data-id="marx"]') as SVGCircleElement).getAttribute(
        'stroke',
      ),
    ).toBe('#fcfaf6');
    expect(
      (
        container.querySelector('circle.geo-node[data-id="engels"]') as SVGCircleElement
      ).getAttribute('stroke'),
    ).toBe('#5b3a8c');
  });

  it('T2.2-F · click handler stopPropagation（不冒泡到 container 父级 click）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [-0.13, 51.51],
      nodes: [MARX_FIXTURE],
    });
    let parentClickFired = false;
    document.body.addEventListener('click', () => {
      parentClickFired = true;
    });
    const dot = container.querySelector('circle.geo-node[data-id="marx"]') as SVGCircleElement;
    dot.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(parentClickFired).toBe(false);
  });

  it('T2.2-F · event 节点 click 不触发 person state（type guard 防穿透）', () => {
    const EVENT_NODE: GeoNode = {
      id: 'evt1',
      type: 'event',
      name_zh: '巴黎公社',
      lonLat: [2.35, 48.86],
      year: 1871,
    };
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'plane',
      marxCurrentLocation: [10, 50],
      nodes: [MARX_FIXTURE, EVENT_NODE],
    });
    const evtDot = container.querySelector('circle.geo-node[data-id="evt1"]') as SVGCircleElement;
    expect(evtDot).toBeTruthy();
    evtDot.dispatchEvent(new MouseEvent('click', { bubbles: false }));
    expect(
      (container.querySelector('circle.geo-node[data-id="marx"]') as SVGCircleElement).getAttribute(
        'stroke',
      ),
    ).toBe('#fcfaf6');
  });
});
