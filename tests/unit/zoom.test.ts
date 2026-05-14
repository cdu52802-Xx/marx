// M5 主线 A · T1 单元测试 · viz/zoom.ts D3 zoom 基础
import { describe, it, expect, beforeEach } from 'vitest';
import * as d3 from 'd3';
import { createZoom } from '../../src/viz/zoom.ts';

describe('zoom · createZoom', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let svg: d3.Selection<SVGSVGElement, unknown, any, any>;

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

describe('zoom · T2 pan boundary clamp', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let svg: d3.Selection<SVGSVGElement, unknown, any, any>;

  beforeEach(() => {
    document.body.innerHTML = '<svg id="test-svg" width="1000" height="800"></svg>';
    svg = d3.select<SVGSVGElement, unknown>('#test-svg');
  });

  it('translateExtent 计算 = contentBBox 外 5% padding', () => {
    const ctrl = createZoom(svg, {
      scaleExtent: [1, 8],
      contentBBox: { x: 0, y: 0, width: 2000, height: 1500 },
    });
    const ext = ctrl.zoomBehavior.translateExtent();
    // 5% padding · X: 2000 * 0.05 = 100 · Y: 1500 * 0.05 = 75
    expect(ext[0][0]).toBeCloseTo(-100, 0);
    expect(ext[0][1]).toBeCloseTo(-75, 0);
    expect(ext[1][0]).toBeCloseTo(2100, 0);
    expect(ext[1][1]).toBeCloseTo(1575, 0);
  });

  it('不传 contentBBox → translateExtent 不设（无限 pan）', () => {
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    const ext = ctrl.zoomBehavior.translateExtent();
    // d3 默认 = [[-Infinity, -Infinity], [Infinity, Infinity]]
    expect(ext[0][0]).toBe(-Infinity);
    expect(ext[1][0]).toBe(Infinity);
  });

  it('contentBBox 非原点起点 也正确（x=100 y=200 width=800 height=600）', () => {
    const ctrl = createZoom(svg, {
      scaleExtent: [1, 8],
      contentBBox: { x: 100, y: 200, width: 800, height: 600 },
    });
    const ext = ctrl.zoomBehavior.translateExtent();
    // padding x = 40 / y = 30
    expect(ext[0][0]).toBeCloseTo(60, 0); // 100 - 40
    expect(ext[0][1]).toBeCloseTo(170, 0); // 200 - 30
    expect(ext[1][0]).toBeCloseTo(940, 0); // 100 + 800 + 40
    expect(ext[1][1]).toBeCloseTo(830, 0); // 200 + 600 + 30
  });
});

describe('zoom · Stage 1 PM checkpoint Issue #5 · reset', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let svg: d3.Selection<SVGSVGElement, unknown, any, any>;

  beforeEach(() => {
    document.body.innerHTML = '<svg id="test-svg" width="800" height="600"></svg>';
    svg = d3.select<SVGSVGElement, unknown>('#test-svg');
  });

  it('reset 暴露在 ZoomController 接口', () => {
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    expect(typeof ctrl.reset).toBe('function');
  });

  it('reset(0) 不抛错（jsdom 限制：scaleTo/transform 内部 defaultExtent access baseVal 失败 / 用 try/catch 验)', () => {
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    // jsdom 不支持 SVG baseVal / 实际 prod 行为通过 E2E 验
    // 这里只验 reset API 不抛"function not defined"型错
    expect(() => {
      try {
        ctrl.reset(0);
      } catch (e) {
        // 接受 jsdom baseVal 失败 / 不接受其他错
        if (!String(e).includes('baseVal')) throw e;
      }
    }).not.toThrow();
  });
});
