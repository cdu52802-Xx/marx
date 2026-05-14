// M5 主线 A · T3 单元测试 · components/zoom-control.ts 左下缩放控件
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as d3 from 'd3';
import { createZoom } from '../../src/viz/zoom.ts';
import { mountZoomControl, updateZoomDisplay } from '../../src/components/zoom-control.ts';

describe('zoom-control · mount', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let svg: d3.Selection<SVGSVGElement, unknown, any, any>;

  beforeEach(() => {
    document.body.innerHTML = '<svg id="test-svg" width="800" height="600"></svg>';
    svg = d3.select<SVGSVGElement, unknown>('#test-svg');
  });

  it('mount 后 body 里有 .zoom-control + 3 个 button', () => {
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    mountZoomControl({ zoomController: ctrl });
    const control = document.querySelector('.zoom-control');
    expect(control).toBeTruthy();
    const buttons = control!.querySelectorAll('button');
    expect(buttons.length).toBe(3); // + / − / ⌂ (display 是 div 不算)
  });

  it('mount 后控件 fixed 位置 left=60 bottom=180 默认', () => {
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    mountZoomControl({ zoomController: ctrl });
    const control = document.querySelector('.zoom-control') as HTMLElement;
    expect(control.style.position).toBe('fixed');
    expect(control.style.left).toBe('60px');
    expect(control.style.bottom).toBe('180px');
  });

  it('比例 display 显示当前 k 值（默认 1.0×）', () => {
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    mountZoomControl({ zoomController: ctrl });
    const display = document.querySelector('.zoom-control .zoom-display');
    expect(display!.textContent).toMatch(/1\.0×/);
  });

  // 注：spy 用 mockImplementation 阻止 call through · 避免 d3 scaleTo 在 jsdom 触发 SVG baseVal 错
  it('按 + 按钮 → programmaticZoom 被调用', () => {
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    const spy = vi.spyOn(ctrl, 'programmaticZoom').mockImplementation(() => {});
    mountZoomControl({ zoomController: ctrl });
    const plusBtn = document.querySelector('.zoom-control .zoom-in') as HTMLButtonElement;
    plusBtn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('按 − 按钮 → programmaticZoom 被调用 (缩小)', () => {
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    const spy = vi.spyOn(ctrl, 'programmaticZoom').mockImplementation(() => {});
    mountZoomControl({ zoomController: ctrl });
    const minusBtn = document.querySelector('.zoom-control .zoom-out') as HTMLButtonElement;
    minusBtn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('按 ⌂ 按钮 → programmaticZoom(1, ...) reset 调用', () => {
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    const spy = vi.spyOn(ctrl, 'programmaticZoom').mockImplementation(() => {});
    mountZoomControl({ zoomController: ctrl });
    const homeBtn = document.querySelector('.zoom-control .zoom-reset') as HTMLButtonElement;
    homeBtn.click();
    expect(spy).toHaveBeenCalledWith(1, expect.any(Number));
  });

  it('+ 按钮有 aria-label="放大" / − 有 "缩小" / ⌂ 有 "重置"', () => {
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    mountZoomControl({ zoomController: ctrl });
    expect(
      document.querySelector('.zoom-control .zoom-in')!.getAttribute('aria-label'),
    ).toBe('放大');
    expect(
      document.querySelector('.zoom-control .zoom-out')!.getAttribute('aria-label'),
    ).toBe('缩小');
    expect(
      document.querySelector('.zoom-control .zoom-reset')!.getAttribute('aria-label'),
    ).toBe('重置到全景视图');
  });
});

describe('zoom-control · updateZoomDisplay', () => {
  beforeEach(() => {
    document.body.innerHTML = '<svg id="test-svg" width="800" height="600"></svg>';
  });

  it('updateZoomDisplay(root, 2.5) → display 文字变 "2.5×"', () => {
    const svg = d3.select<SVGSVGElement, unknown>('#test-svg');
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    const root = mountZoomControl({ zoomController: ctrl });
    updateZoomDisplay(root, 2.5);
    const display = root.querySelector('.zoom-display');
    expect(display!.textContent).toBe('2.5×');
  });

  it('updateZoomDisplay(root, 8.0) → "8.0×"', () => {
    const svg = d3.select<SVGSVGElement, unknown>('#test-svg');
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    const root = mountZoomControl({ zoomController: ctrl });
    updateZoomDisplay(root, 8.0);
    expect(root.querySelector('.zoom-display')!.textContent).toBe('8.0×');
  });
});
