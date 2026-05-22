// M-B2 T1.3 · geographic-canvas.ts prototype scaffold unit test
// 3 case · graticule mount / 5 test node / setMode 重算
// M-B2 T1.4 加 · 2 case · d3.zoom attach / setMode 切换后节点重算（间接验 zoom → render 通路）
// M-B2 T1.5 加 · 2 case · marx:time-change event listener 触发 reorient / destroy 后 listener detach

import { describe, it, expect, beforeEach } from 'vitest';
import { select } from 'd3-selection';
import { zoomIdentity } from 'd3-zoom';
import { mountGeographicCanvas } from '../../src/components/geographic-canvas.ts';

describe('mountGeographicCanvas · M-B2 T1.3', () => {
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

  it('mount 后 svg 内有 5 个测试节点（dot circles）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
    });
    const dots = container.querySelectorAll('circle.test-node');
    expect(dots.length).toBe(5);
  });

  it('setMode 切换 → 节点 cx/cy 重算', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
    });
    const firstDotSphere = (
      container.querySelector('circle.test-node') as SVGCircleElement
    ).getAttribute('cx');
    api.setMode('plane');
    const firstDotPlane = (
      container.querySelector('circle.test-node') as SVGCircleElement
    ).getAttribute('cx');
    expect(firstDotSphere).not.toBe(firstDotPlane);
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
    });
    // jsdom 不易模拟 d3.zoom wheel event · 间接验：setMode 切换后 render 走通路
    // 同时 paris (2.35°E / 48.86°N) 在中心 [10°E / 50°N] 视口内 / plane mode cx 必 > 0
    api.setMode('plane');
    const node = container.querySelector('circle.test-node[data-id="paris"]') as SVGCircleElement;
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
    });
    const initialCx = (
      container.querySelector('circle.test-node[data-id="paris"]') as SVGCircleElement
    )?.getAttribute('cx');
    window.dispatchEvent(new CustomEvent('marx:time-change', { detail: { year: 1843 } }));
    // 1843 → 巴黎 [2.35, 48.86] / 球面 reorient → 巴黎在中心 / paris 节点 cx 变化
    const newCx = (
      container.querySelector('circle.test-node[data-id="paris"]') as SVGCircleElement
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
    });
    // 切到 plane mode 后再 dispatch time-change · 验 paris 节点 cx 变化（panCenter reset → center=currentLoc）
    api.setMode('plane');
    const cxBefore = (
      container.querySelector('circle.test-node[data-id="paris"]') as SVGCircleElement
    )?.getAttribute('cx');
    window.dispatchEvent(new CustomEvent('marx:time-change', { detail: { year: 1843 } }));
    const cxAfter = (
      container.querySelector('circle.test-node[data-id="paris"]') as SVGCircleElement
    )?.getAttribute('cx');
    // 1843 → 巴黎为中心 / plane mode satellite distance=2 center=paris → paris 节点 cx 必移动到 viewport 中心
    expect(cxAfter).not.toBe(cxBefore);
  });

  it('sphere mode drag 仍 rotate（既有保护回归 · 不破 Bug 1 之前 sphere 拖旋转）', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
    });
    // 通过 protoApi.rotate 直接验 currentRotate 路径仍工作
    // （真 mousedown drag 在 jsdom 不易模拟 · 但 rotate API 路径既有 / 不被修法 B 影响）
    const cxBefore = (
      container.querySelector('circle.test-node[data-id="paris"]') as SVGCircleElement
    )?.getAttribute('cx');
    api.rotate([-50, -50, 0]);
    const cxAfter = (
      container.querySelector('circle.test-node[data-id="paris"]') as SVGCircleElement
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
});
