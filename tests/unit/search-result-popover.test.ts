// B1 T2.2 · 搜索下拉浮窗 unit test
// API 期望：mountResultPopover({ anchor, onSelect }): { show, hide, isOpen }
//   - show(items) → .search-result-popover 挂到 document.body / paper 风格视觉走 CSS
//   - hide() → 移除 popover
//   - isOpen() → 状态查询
//   - 候选 click → onSelect(item) callback
//   - max 8 候选（spec § 3.3）
//   - 多次 show 替换不堆叠
//   - empty items → 不显示

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  mountResultPopover,
  type SearchResultItem,
} from '../../src/components/search-result-popover.ts';

describe('mountResultPopover', () => {
  let anchor: HTMLInputElement;

  beforeEach(() => {
    anchor = document.createElement('input');
    anchor.type = 'search';
    document.body.appendChild(anchor);
  });

  afterEach(() => {
    anchor.remove();
    document.querySelectorAll('.search-result-popover').forEach((el) => el.remove());
  });

  const mkItem = (
    id: string,
    label: string,
    type: SearchResultItem['type'] = 'claim',
  ): SearchResultItem => ({
    type,
    id,
    label,
  });

  it('show([items]) → .search-result-popover 出现在 document.body', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.show([mkItem('a', '马克思')]);
    expect(document.querySelector('.search-result-popover')).toBeTruthy();
  });

  it('hide() → popover 移除', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.show([mkItem('a', '马克思')]);
    api.hide();
    expect(document.querySelector('.search-result-popover')).toBeNull();
  });

  it('每个候选渲染为 .search-result-item / 数量 = items.length', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.show([mkItem('a', '马克思'), mkItem('b', '黑格尔'), mkItem('c', '巴黎', 'location')]);
    expect(document.querySelectorAll('.search-result-item').length).toBe(3);
  });

  it('show([]) → popover 不出现（empty 不显示）', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.show([]);
    expect(document.querySelector('.search-result-popover')).toBeNull();
    expect(api.isOpen()).toBe(false);
  });

  it('候选 click → onSelect(item) 触发', () => {
    const onSelect = vi.fn();
    const api = mountResultPopover({ anchor, onSelect });
    const item = mkItem('a', '马克思');
    api.show([item]);
    (document.querySelector('.search-result-item') as HTMLElement).click();
    expect(onSelect).toHaveBeenCalledWith(item);
  });

  it('超过 8 个候选只渲染 8 个 max（spec § 3.3）', () => {
    const items: SearchResultItem[] = Array.from({ length: 12 }, (_, i) =>
      mkItem(`id-${i}`, `候选 ${i}`),
    );
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.show(items);
    expect(document.querySelectorAll('.search-result-item').length).toBe(8);
  });

  it('每个候选含 item.label 文字', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.show([mkItem('a', '马克思'), mkItem('b', '黑格尔')]);
    const items = document.querySelectorAll('.search-result-item');
    expect((items[0] as HTMLElement).textContent).toContain('马克思');
    expect((items[1] as HTMLElement).textContent).toContain('黑格尔');
  });

  it('多次 show 替换不堆叠（唯一 popover）', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.show([mkItem('a', '一')]);
    api.show([mkItem('b', '二'), mkItem('c', '三')]);
    expect(document.querySelectorAll('.search-result-popover').length).toBe(1);
    expect(document.querySelectorAll('.search-result-item').length).toBe(2);
  });

  it('isOpen: hide 后 false / show 后 true', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    expect(api.isOpen()).toBe(false);
    api.show([mkItem('a', '马克思')]);
    expect(api.isOpen()).toBe(true);
    api.hide();
    expect(api.isOpen()).toBe(false);
  });

  it('候选 item 含 data-result-type 区分类型（视觉 icon 走 CSS 用）', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.show([
      mkItem('a', '马克思', 'person'),
      mkItem('b', '巴黎公社', 'event'),
      mkItem('c', '巴黎', 'location'),
      mkItem('d', '宗教是人民的鸦片', 'claim'),
    ]);
    const items = document.querySelectorAll('.search-result-item');
    expect((items[0] as HTMLElement).dataset.resultType).toBe('person');
    expect((items[1] as HTMLElement).dataset.resultType).toBe('event');
    expect((items[2] as HTMLElement).dataset.resultType).toBe('location');
    expect((items[3] as HTMLElement).dataset.resultType).toBe('claim');
  });
});

// B1 T2.3 · 键盘导航（↑↓ / Enter / Esc）
// UX 习惯（memory feedback_ux_default_gestures）：
//   - Esc = 关弹窗（不是 reset）
//   - 默认手势尊重既有习惯（VS Code / Chrome 搜索栏）
//
// 行为：
//   - show 后 selectedIndex = -1（无选中）/ ↓ → 0 / ↑ → last
//   - ↓↑ 循环 wrap
//   - Enter 无选中 → 选第 0 个 / 有选中 → 选 selected
//   - Esc → hide + onClose?()
//   - hide 后 keys 不影响（handler detached）

describe('mountResultPopover · 键盘导航', () => {
  let anchor: HTMLInputElement;

  beforeEach(() => {
    anchor = document.createElement('input');
    anchor.type = 'search';
    document.body.appendChild(anchor);
  });

  afterEach(() => {
    anchor.remove();
    document.querySelectorAll('.search-result-popover').forEach((el) => el.remove());
  });

  const mkItem = (
    id: string,
    label: string,
    type: SearchResultItem['type'] = 'claim',
  ): SearchResultItem => ({
    type,
    id,
    label,
  });

  const pressKey = (key: string) => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  };

  const selectedItems = () =>
    document.querySelectorAll('.search-result-item[data-selected="true"]');

  it('show 后 ↓ → 第 1 个候选 data-selected="true"', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.show([mkItem('a', '马克思'), mkItem('b', '黑格尔')]);
    pressKey('ArrowDown');
    expect(selectedItems().length).toBe(1);
    expect((selectedItems()[0] as HTMLElement).dataset.resultId).toBe('a');
  });

  it('↓↓ → 第 2 个 selected / 第 1 个不再 selected（单选状态）', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.show([mkItem('a', '一'), mkItem('b', '二'), mkItem('c', '三')]);
    pressKey('ArrowDown');
    pressKey('ArrowDown');
    expect(selectedItems().length).toBe(1);
    expect((selectedItems()[0] as HTMLElement).dataset.resultId).toBe('b');
  });

  it('↓ 越界（最后一个再 ↓）→ wrap 回第 1 个', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.show([mkItem('a', '一'), mkItem('b', '二')]);
    pressKey('ArrowDown'); // 0
    pressKey('ArrowDown'); // 1
    pressKey('ArrowDown'); // wrap → 0
    expect((selectedItems()[0] as HTMLElement).dataset.resultId).toBe('a');
  });

  it('show 后 ↑ → 最后一个候选 selected（无选中 → last）', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.show([mkItem('a', '一'), mkItem('b', '二'), mkItem('c', '三')]);
    pressKey('ArrowUp');
    expect((selectedItems()[0] as HTMLElement).dataset.resultId).toBe('c');
  });

  it('↑ 从第 1 个 → wrap 回最后一个', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.show([mkItem('a', '一'), mkItem('b', '二'), mkItem('c', '三')]);
    pressKey('ArrowDown'); // 0
    pressKey('ArrowUp'); // wrap → 2
    expect((selectedItems()[0] as HTMLElement).dataset.resultId).toBe('c');
  });

  it('Enter 无选中 → 选第 1 个候选 + hide（VS Code / Chrome 搜索习惯）', () => {
    const onSelect = vi.fn();
    const api = mountResultPopover({ anchor, onSelect });
    const items = [mkItem('a', '一'), mkItem('b', '二')];
    api.show(items);
    pressKey('Enter');
    expect(onSelect).toHaveBeenCalledWith(items[0]);
    expect(api.isOpen()).toBe(false);
  });

  it('↓↓ + Enter → onSelect(第 2 个)', () => {
    const onSelect = vi.fn();
    const api = mountResultPopover({ anchor, onSelect });
    const items = [mkItem('a', '一'), mkItem('b', '二'), mkItem('c', '三')];
    api.show(items);
    pressKey('ArrowDown');
    pressKey('ArrowDown');
    pressKey('Enter');
    expect(onSelect).toHaveBeenCalledWith(items[1]);
  });

  it('Esc → hide + onClose 触发', () => {
    const onClose = vi.fn();
    const api = mountResultPopover({ anchor, onSelect: () => {}, onClose });
    api.show([mkItem('a', '一')]);
    pressKey('Escape');
    expect(api.isOpen()).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Esc 时不传 onClose 也工作（onClose 可选）', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.show([mkItem('a', '一')]);
    expect(() => pressKey('Escape')).not.toThrow();
    expect(api.isOpen()).toBe(false);
  });

  it('hide 后按 ↓ → 不影响 / 无 popover 出现（handler detached）', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.show([mkItem('a', '一')]);
    api.hide();
    pressKey('ArrowDown');
    expect(document.querySelector('.search-result-popover')).toBeNull();
  });

  it('Enter 无候选 hide 但不 onSelect（empty items 边界）', () => {
    const onSelect = vi.fn();
    const api = mountResultPopover({ anchor, onSelect });
    api.show([]); // popover 不打开 / handler 未 attach
    pressKey('Enter');
    expect(onSelect).not.toHaveBeenCalled();
  });
});
