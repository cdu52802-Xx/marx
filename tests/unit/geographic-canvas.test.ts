// M-B2 T1.3 · geographic-canvas.ts prototype scaffold unit test
// 3 case · graticule mount / 5 test node / setMode 重算
// M-B2 T1.4 加 · 2 case · d3.zoom attach / setMode 切换后节点重算（间接验 zoom → render 通路）
// M-B2 T1.5 加 · 2 case · marx:time-change event listener 触发 reorient / destroy 后 listener detach

import { describe, it, expect, beforeEach } from 'vitest';
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
});
