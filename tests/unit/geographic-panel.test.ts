// M-B2 Stage 5 T5.1 · geographic-panel 副窗 paper 风格容器
// spec § 4.2：fixed right:0 bottom:60 · 380×214 (16:9) · paper-shadow 跟详情卡一致
//   标题栏 § 地理图 · YYYY 地名（EB Garamond italic 13px 紫）+ ↔ 互换按钮
//   不画副图内时间游标（用户只在外部主 timeline 操作）

import { describe, it, expect, beforeEach } from 'vitest';
import { mountGeographicPanel } from '../../src/components/geographic-panel.ts';

describe('geographic-panel · Stage 5 副窗', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('mount → .geographic-panel fixed right:0 bottom:60 · 380×214 · header + svg', () => {
    const api = mountGeographicPanel({});
    const panel = document.querySelector('.geographic-panel') as HTMLElement;
    expect(panel).toBeTruthy();
    expect(panel.style.position).toBe('fixed');
    expect(panel.style.right).toBe('0px');
    expect(panel.style.bottom).toBe('60px');
    expect(panel.style.width).toBe('380px');
    expect(panel.style.height).toBe('214px');
    expect(panel.querySelector('.geographic-panel-header')).toBeTruthy();
    const svg = api.getCanvasContainer();
    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(panel.contains(svg)).toBe(true);
  });

  it('标题初始 § 地理图 · marx:time-change 后更新为 "§ 地理图 · YYYY 地名"', () => {
    mountGeographicPanel({});
    const title = document.querySelector('.geographic-panel-title') as HTMLElement;
    expect(title.textContent).toContain('§ 地理图');
    window.dispatchEvent(new CustomEvent('marx:time-change', { detail: { year: 1844 } }));
    expect(title.textContent).toBe('§ 地理图 · 1844 巴黎');
  });

  it('Marx 行迹范围外年份 → 标题只显年份不显地名', () => {
    mountGeographicPanel({});
    window.dispatchEvent(new CustomEvent('marx:time-change', { detail: { year: 2000 } }));
    const title = document.querySelector('.geographic-panel-title') as HTMLElement;
    expect(title.textContent).toBe('§ 地理图 · 2000');
  });

  it('header ↔ 互换按钮 click → onSwap callback', () => {
    let called = false;
    mountGeographicPanel({
      onSwap: () => {
        called = true;
      },
    });
    const btn = document.querySelector('.geographic-panel-swap') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    btn.click();
    expect(called).toBe(true);
  });

  it('setVisible(false/true) → display none/恢复', () => {
    const api = mountGeographicPanel({});
    const panel = document.querySelector('.geographic-panel') as HTMLElement;
    api.setVisible(false);
    expect(panel.style.display).toBe('none');
    api.setVisible(true);
    expect(panel.style.display).not.toBe('none');
  });

  it('destroy → DOM 移除 + time-change listener detach（dispatch 不 throw）', () => {
    const api = mountGeographicPanel({});
    api.destroy();
    expect(document.querySelector('.geographic-panel')).toBeNull();
    expect(() => {
      window.dispatchEvent(new CustomEvent('marx:time-change', { detail: { year: 1850 } }));
    }).not.toThrow();
  });
});
