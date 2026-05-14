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

  it('mount 后 body 里有 .zoom-control + 4 个 button (+ / − / ⌂ / ✋)', () => {
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    mountZoomControl({ zoomController: ctrl });
    const control = document.querySelector('.zoom-control');
    expect(control).toBeTruthy();
    const buttons = control!.querySelectorAll('button');
    // Stage 1 Issue #4: + / − / ⌂ / ✋ pan-toggle = 4 button
    expect(buttons.length).toBe(4);
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

  it('按 ⌂ 按钮 → reset() 调用 (Stage 1 Issue #5 / 不再 programmaticZoom)', () => {
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    const spy = vi.spyOn(ctrl, 'reset').mockImplementation(() => {});
    mountZoomControl({ zoomController: ctrl });
    const homeBtn = document.querySelector('.zoom-control .zoom-reset') as HTMLButtonElement;
    homeBtn.click();
    expect(spy).toHaveBeenCalledWith(expect.any(Number));
  });

  it('+ 按钮有 aria-label="放大" / − 有 "缩小" / ⌂ 有 "重置"', () => {
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    mountZoomControl({ zoomController: ctrl });
    expect(document.querySelector('.zoom-control .zoom-in')!.getAttribute('aria-label')).toBe(
      '放大',
    );
    expect(document.querySelector('.zoom-control .zoom-out')!.getAttribute('aria-label')).toBe(
      '缩小',
    );
    expect(document.querySelector('.zoom-control .zoom-reset')!.getAttribute('aria-label')).toBe(
      '重置到全景视图',
    );
  });
});

describe('zoom-control · Stage 1 Issue #4 小手 pan mode', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let svg: d3.Selection<SVGSVGElement, unknown, any, any>;

  beforeEach(() => {
    document.body.innerHTML = '<svg id="test-svg" width="800" height="600"></svg>';
    svg = d3.select<SVGSVGElement, unknown>('#test-svg');
    // 重新 import 确保 module 级 state reset / 实际 vitest 默认 fresh module
  });

  it('mount 后小手按钮存在 + aria-pressed="false" 默认', async () => {
    // 动态 re-import 让 _isPanMode reset (vitest 不默认 reset module state)
    vi.resetModules();
    const { mountZoomControl: mzc } = await import('../../src/components/zoom-control.ts');
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    mzc({ zoomController: ctrl });
    const handBtn = document.querySelector('.zoom-control .zoom-pan-toggle') as HTMLButtonElement;
    expect(handBtn).toBeTruthy();
    expect(handBtn.getAttribute('aria-pressed')).toBe('false');
  });

  it('点小手 button → onPanModeChange(true) callback 调用', async () => {
    vi.resetModules();
    const { mountZoomControl: mzc } = await import('../../src/components/zoom-control.ts');
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    const cb = vi.fn();
    mzc({ zoomController: ctrl, onPanModeChange: cb });
    const handBtn = document.querySelector('.zoom-control .zoom-pan-toggle') as HTMLButtonElement;
    handBtn.click();
    expect(cb).toHaveBeenCalledWith(true);
    expect(handBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('小手 toggle 第二次 → onPanModeChange(false) + aria-pressed 切回', async () => {
    vi.resetModules();
    const { mountZoomControl: mzc } = await import('../../src/components/zoom-control.ts');
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    const cb = vi.fn();
    mzc({ zoomController: ctrl, onPanModeChange: cb });
    const handBtn = document.querySelector('.zoom-control .zoom-pan-toggle') as HTMLButtonElement;
    handBtn.click();
    handBtn.click();
    expect(cb).toHaveBeenLastCalledWith(false);
    expect(handBtn.getAttribute('aria-pressed')).toBe('false');
  });

  it('isPanMode() getter 反映状态', async () => {
    vi.resetModules();
    const { mountZoomControl: mzc, isPanMode } =
      await import('../../src/components/zoom-control.ts');
    const ctrl = createZoom(svg, { scaleExtent: [1, 8] });
    mzc({ zoomController: ctrl });
    expect(isPanMode()).toBe(false);
    const handBtn = document.querySelector('.zoom-control .zoom-pan-toggle') as HTMLButtonElement;
    handBtn.click();
    expect(isPanMode()).toBe(true);
    handBtn.click();
    expect(isPanMode()).toBe(false);
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
