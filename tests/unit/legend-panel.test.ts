// M-B2 T6.1 · legend-panel 图例 paper 风格（左下 · geo-main 模式显示）
// spec § 4.9：左下 paper 风格 · 节点 + 迁徙 + 关系 + 国界图例

import { describe, it, expect, beforeEach } from 'vitest';
import { mountLegendPanel } from '../../src/components/legend-panel.ts';

describe('legend-panel · 图例 paper 风格', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('mount → .legend-panel 左下 fixed paper 风格 + 标题 § 图例 + 5 行', () => {
    mountLegendPanel();
    const panel = document.querySelector('.legend-panel') as HTMLElement;
    expect(panel).toBeTruthy();
    expect(panel.style.position).toBe('fixed');
    expect(panel.style.bottom).toBe('76px');
    expect(panel.style.left).toBe('60px'); // sidebar 48px 图标栏右侧让位
    const title = panel.querySelector('.legend-panel-title') as HTMLElement;
    expect(title.textContent).toContain('§ 图例');
    const rows = panel.querySelectorAll('.legend-row');
    expect(rows.length).toBe(5); // 人物 / 已走行迹 / 未来行迹 / 影响关系 / 历史国界
  });

  it('图例行文案覆盖 5 类视觉元素', () => {
    mountLegendPanel();
    const text = (document.querySelector('.legend-panel') as HTMLElement).textContent ?? '';
    expect(text).toContain('人物');
    expect(text).toContain('已走行迹');
    expect(text).toContain('未来行迹');
    expect(text).toContain('影响关系');
    expect(text).toContain('历史国界');
  });

  it('setVisible(false/true) → display none/恢复', () => {
    const api = mountLegendPanel();
    const panel = document.querySelector('.legend-panel') as HTMLElement;
    api.setVisible(false);
    expect(panel.style.display).toBe('none');
    api.setVisible(true);
    expect(panel.style.display).not.toBe('none');
  });

  it('destroy → DOM 移除', () => {
    const api = mountLegendPanel();
    api.destroy();
    expect(document.querySelector('.legend-panel')).toBeNull();
  });
});
