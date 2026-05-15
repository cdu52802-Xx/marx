// M5 Stage 5 T8 · 点弧线 tooltip 单测
// spec § 7.4 · 单击半圆弧 → 弧线两端居中 + 高亮 + tooltip 显示关系类型 + 引用
import { afterEach, describe, expect, it } from 'vitest';
import {
  mountArcTooltip,
  showArcTooltip,
  hideArcTooltip,
} from '../../src/components/arc-tooltip.ts';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('arc-tooltip', () => {
  it('mount 后 body 有 .arc-tooltip / hidden 状态', () => {
    mountArcTooltip();
    const tip = document.querySelector('.arc-tooltip') as HTMLElement;
    expect(tip).toBeTruthy();
    expect(tip.style.display).toBe('none');
  });

  it('mount 幂等 / 重复 mount 只挂 1 个', () => {
    mountArcTooltip();
    mountArcTooltip();
    mountArcTooltip();
    const tips = document.querySelectorAll('.arc-tooltip');
    expect(tips.length).toBe(1);
  });

  it('showArcTooltip 显示 + 中文 label + 引用源', () => {
    mountArcTooltip();
    showArcTooltip({
      x: 100,
      y: 200,
      relationType: 'agreement_with',
      reference: 'MEGA II/1, p. 42',
    });
    const tip = document.querySelector('.arc-tooltip') as HTMLElement;
    expect(tip.style.display).toBe('block');
    expect(tip.textContent).toContain('同意');
    expect(tip.textContent).toContain('MEGA II/1, p. 42');
    // pixel 坐标
    expect(tip.style.left).toBe('100px');
    expect(tip.style.top).toBe('200px');
  });

  it('relationType disagreement_with → 反对', () => {
    mountArcTooltip();
    showArcTooltip({ x: 0, y: 0, relationType: 'disagreement_with' });
    const tip = document.querySelector('.arc-tooltip') as HTMLElement;
    expect(tip.textContent).toContain('反对');
  });

  it('relationType extends → 延伸', () => {
    mountArcTooltip();
    showArcTooltip({ x: 0, y: 0, relationType: 'extends' });
    const tip = document.querySelector('.arc-tooltip') as HTMLElement;
    expect(tip.textContent).toContain('延伸');
  });

  it('未知 relationType fallback 显示原 type 字符串', () => {
    mountArcTooltip();
    showArcTooltip({ x: 0, y: 0, relationType: 'unknown_type' });
    const tip = document.querySelector('.arc-tooltip') as HTMLElement;
    expect(tip.textContent).toContain('unknown_type');
  });

  it('hideArcTooltip 隐藏', () => {
    mountArcTooltip();
    showArcTooltip({ x: 50, y: 50, relationType: 'agreement_with' });
    hideArcTooltip();
    const tip = document.querySelector('.arc-tooltip') as HTMLElement;
    expect(tip.style.display).toBe('none');
  });

  it('hideArcTooltip 无 tooltip 时不抛错', () => {
    expect(() => hideArcTooltip()).not.toThrow();
  });

  it('show 自动 mount（懒挂）', () => {
    expect(document.querySelector('.arc-tooltip')).toBeNull();
    showArcTooltip({ x: 0, y: 0, relationType: 'agreement_with' });
    expect(document.querySelector('.arc-tooltip')).toBeTruthy();
  });

  it('无 reference 时不显示引用行', () => {
    mountArcTooltip();
    showArcTooltip({ x: 0, y: 0, relationType: 'agreement_with' });
    const tip = document.querySelector('.arc-tooltip') as HTMLElement;
    // 引用行的样式区分 italic + #888 / 简化测：textContent 只含 label 不含其他
    expect(tip.textContent).toContain('同意');
    expect(tip.querySelectorAll('div').length).toBe(1); // 仅 label / 无 reference 行
  });
});
