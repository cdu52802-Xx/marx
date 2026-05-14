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
