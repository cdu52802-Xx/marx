// B1 T2.2 + T2.3 + T3.3 · 搜索下拉浮窗 unit test
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

  it('hide() → popover 移除（D2 · 默认 120ms exit 动画后从 DOM remove）', () => {
    vi.useFakeTimers();
    try {
      const api = mountResultPopover({ anchor, onSelect: () => {} });
      api.show([mkItem('a', '马克思')]);
      api.hide();
      // hide 立即生效：isOpen=false / popover 加 .popover-closing class（exit 动画期）
      expect(api.isOpen()).toBe(false);
      expect(document.querySelector('.search-result-popover.popover-closing')).toBeTruthy();
      // 120ms 动画 + 20ms buffer 后从 DOM remove
      vi.advanceTimersByTime(140);
      expect(document.querySelector('.search-result-popover')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
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
    vi.useFakeTimers();
    try {
      const api = mountResultPopover({ anchor, onSelect: () => {} });
      api.show([mkItem('a', '一')]);
      api.hide();
      vi.advanceTimersByTime(140); // 完成 D2 exit 动画 · popover 从 DOM remove
      pressKey('ArrowDown');
      expect(document.querySelector('.search-result-popover')).toBeNull();
      expect(api.isOpen()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('Enter 无候选 hide 但不 onSelect（empty items 边界）', () => {
    const onSelect = vi.fn();
    const api = mountResultPopover({ anchor, onSelect });
    api.show([]); // popover 不打开 / handler 未 attach
    pressKey('Enter');
    expect(onSelect).not.toHaveBeenCalled();
  });
});

// ============================================================
// B1 T3.3 · 升级双形态 + 分组渲染（DR-078 PM mockup 拍板）
// ============================================================

import type { SearchResult } from '../../src/lib/search-index.ts';
import type { PersonNode } from '../../src/types/Node.ts';

const mkResult = (overrides: Partial<SearchResult>): SearchResult => ({
  type: 'claim',
  id: 'c1',
  label: '',
  score: 100,
  matched: '异化',
  ...overrides,
});

const mkPerson = (overrides: Partial<PersonNode>): PersonNode => ({
  id: 'p1',
  type: 'person',
  name_zh: '',
  name_orig: '',
  birth_year: 1818,
  death_year: 1883,
  main_location_lat_lng: [0, 0],
  bio_event_style: [],
  citation_urls: [],
  ...overrides,
});

describe('mountResultPopover · showExplore（T3.3 探索形态）', () => {
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

  const mockLists = {
    persons: [
      { id: 'p1', name: '马克思' },
      { id: 'p2', name: '黑格尔' },
    ] as const,
    concepts: [
      {
        label: '异化',
        proposedBy: 'p1',
        proposedByName: '马克思',
        year: 1844,
        source: '1844 手稿',
      },
    ] as const,
    periods: [{ label: '1848 革命', range: [1848, 1848] as [number, number] }] as const,
  };

  it('showExplore → popover 含 3 section', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.showExplore(mockLists, () => {});
    expect(document.querySelectorAll('.search-result-section').length).toBe(3);
    expect(api.isOpen()).toBe(true);
  });

  it('section 1 = 主要人物 / chip = 2 个', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.showExplore(mockLists, () => {});
    const sec = document.querySelector('[data-section="persons"]') as HTMLElement;
    expect(sec.querySelector('.search-result-section-head')?.textContent).toContain('主要人物');
    expect(sec.querySelectorAll('.search-result-chip').length).toBe(2);
  });

  it('chip 含人物简称（马克思 / 黑格尔）', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.showExplore(mockLists, () => {});
    const chips = [...document.querySelectorAll('[data-section="persons"] .search-result-chip')];
    const texts = chips.map((c) => c.textContent);
    expect(texts).toContain('马克思');
    expect(texts).toContain('黑格尔');
  });

  it('chip click → onChipClick(chipText)', () => {
    const onChipClick = vi.fn();
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.showExplore(mockLists, onChipClick);
    (document.querySelector('[data-section="persons"] .search-result-chip') as HTMLElement).click();
    expect(onChipClick).toHaveBeenCalledWith('马克思');
  });

  it('概念 section chip = 异化', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.showExplore(mockLists, () => {});
    const sec = document.querySelector('[data-section="concepts"]') as HTMLElement;
    expect(sec.querySelector('.search-result-chip')?.textContent).toBe('异化');
  });

  it('时段 section chip = 1848 革命', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.showExplore(mockLists, () => {});
    const sec = document.querySelector('[data-section="periods"]') as HTMLElement;
    expect(sec.querySelector('.search-result-chip')?.textContent).toBe('1848 革命');
  });

  it('showExplore 替换不堆叠（重复调用）', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.showExplore(mockLists, () => {});
    api.showExplore(mockLists, () => {});
    expect(document.querySelectorAll('.search-result-popover').length).toBe(1);
  });

  it('showExplore 顶部含 hint 文案', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.showExplore(mockLists, () => {});
    const hint = document.querySelector('.search-result-hint');
    expect(hint?.textContent).toContain('探索');
  });
});

describe('mountResultPopover · showGrouped（T3.3 分组形态）', () => {
  let anchor: HTMLInputElement;
  let personsMap: Map<string, PersonNode>;

  beforeEach(() => {
    anchor = document.createElement('input');
    anchor.type = 'search';
    document.body.appendChild(anchor);
    personsMap = new Map();
    personsMap.set('wd-q9061', mkPerson({ id: 'wd-q9061', name_zh: '卡尔·马克思' }));
    personsMap.set('wd-q76422', mkPerson({ id: 'wd-q76422', name_zh: '路德维希·费尔巴哈' }));
  });

  afterEach(() => {
    anchor.remove();
    document.querySelectorAll('.search-result-popover').forEach((el) => el.remove());
  });

  const pressKey = (key: string) => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  };

  it('showGrouped 多 author → 多 group section', () => {
    const results = [
      mkResult({ id: 'c1', author_id: 'wd-q9061', label: '异化劳动', year: 1844 }),
      mkResult({ id: 'c2', author_id: 'wd-q76422', label: '神是异化', year: 1841 }),
    ];
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.showGrouped(results, personsMap, '异化', null);
    const groups = document.querySelectorAll('[data-section="group"]');
    expect(groups.length).toBe(2);
  });

  it('group section head 含人物名 + N 条', () => {
    const results = [
      mkResult({ id: 'c1', author_id: 'wd-q9061', label: '异化 A', year: 1844 }),
      mkResult({ id: 'c2', author_id: 'wd-q9061', label: '异化 B', year: 1850 }),
    ];
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.showGrouped(results, personsMap, '异化', null);
    const head = document.querySelector('[data-author-id="wd-q9061"] .search-result-section-head');
    expect(head?.textContent).toContain('卡尔·马克思');
    expect(head?.textContent).toContain('2 条');
  });

  it('claim item 含 label + 年份', () => {
    const results = [mkResult({ id: 'c1', author_id: 'wd-q9061', label: '异化劳动', year: 1844 })];
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.showGrouped(results, personsMap, '异化', null);
    const item = document.querySelector('.search-result-claim-item') as HTMLElement;
    expect(item.querySelector('.search-result-claim-text')?.textContent).toContain('异化劳动');
    expect(item.querySelector('.search-result-claim-year')?.textContent).toBe('1844');
  });

  it('关键词紫高亮 em.search-result-highlight', () => {
    const results = [
      mkResult({
        id: 'c1',
        author_id: 'wd-q9061',
        label: '现实是历经异化的过程',
        year: 1850,
      }),
    ];
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.showGrouped(results, personsMap, '异化', null);
    const em = document.querySelector('.search-result-claim-text em.search-result-highlight');
    expect(em?.textContent).toBe('异化');
  });

  it('claim item click → onSelect(item)', () => {
    const onSelect = vi.fn();
    const results = [mkResult({ id: 'c1', author_id: 'wd-q9061', label: '异化劳动', year: 1844 })];
    const api = mountResultPopover({ anchor, onSelect });
    api.showGrouped(results, personsMap, '异化', null);
    (document.querySelector('.search-result-claim-item') as HTMLElement).click();
    expect(onSelect).toHaveBeenCalled();
    expect(onSelect.mock.calls[0][0].id).toBe('c1');
  });

  it('概念命中段 · conceptHit 不为 null', () => {
    const conceptHit = {
      label: '异化',
      proposedBy: 'wd-q9061',
      proposedByName: '马克思',
      year: 1844,
      source: '1844 经济学哲学手稿',
    };
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.showGrouped([], personsMap, '异化', conceptHit);
    const sec = document.querySelector('[data-section="concept"]');
    expect(sec).toBeTruthy();
    expect(sec?.textContent).toContain('异化');
    expect(sec?.textContent).toContain('马克思');
    expect(sec?.textContent).toContain('1844');
  });

  it('概念命中 + 0 results → 仍显示概念段（popover open）', () => {
    const conceptHit = {
      label: '异化',
      proposedBy: 'wd-q9061',
      proposedByName: '马克思',
      year: 1844,
      source: '手稿',
    };
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.showGrouped([], personsMap, '异化', conceptHit);
    expect(api.isOpen()).toBe(true);
  });

  it('无 conceptHit + 无 results → popover 不出现', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.showGrouped([], personsMap, '随便', null);
    expect(api.isOpen()).toBe(false);
  });

  it('键盘 ↓ 选第一个 claim item', () => {
    const results = [
      mkResult({ id: 'c1', author_id: 'wd-q9061', label: 'A', year: 1844 }),
      mkResult({ id: 'c2', author_id: 'wd-q9061', label: 'B', year: 1850 }),
    ];
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.showGrouped(results, personsMap, 'A', null);
    pressKey('ArrowDown');
    const sel = document.querySelector(
      '.search-result-claim-item[data-selected="true"]',
    ) as HTMLElement;
    expect(sel.dataset.resultId).toBe('c1');
  });

  it('键盘跨 section wrap（最后人物 → 第一人物）', () => {
    const results = [
      mkResult({ id: 'c1', author_id: 'wd-q9061', label: 'A', year: 1844 }),
      mkResult({ id: 'c2', author_id: 'wd-q76422', label: 'B', year: 1841 }),
    ];
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.showGrouped(results, personsMap, 'B', null);
    pressKey('ArrowDown'); // c1
    pressKey('ArrowDown'); // c2
    pressKey('ArrowDown'); // wrap c1
    const sel = document.querySelector(
      '.search-result-claim-item[data-selected="true"]',
    ) as HTMLElement;
    expect(sel.dataset.resultId).toBe('c1');
  });

  it('Enter on grouped item → onSelect + hide', () => {
    const onSelect = vi.fn();
    const results = [mkResult({ id: 'c1', author_id: 'wd-q9061', label: 'A', year: 1844 })];
    const api = mountResultPopover({ anchor, onSelect });
    api.showGrouped(results, personsMap, 'A', null);
    pressKey('Enter');
    expect(onSelect).toHaveBeenCalled();
    expect(api.isOpen()).toBe(false);
  });
});

// ============================================================
// PM checkpoint feedback · 点空白关闭（PM A · 不豁免工具栏）
// 沿用 claim-popover pattern · setTimeout(0) trick 防 self-trigger
// 不关：popover 自己 + anchor 输入框 / 关：其他任意 click（含工具栏）
// ============================================================

describe('mountResultPopover · click outside 关闭（PM A）', () => {
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

  const mkItemLocal = (
    id: string,
    label: string,
    type: SearchResultItem['type'] = 'claim',
  ): SearchResultItem => ({ type, id, label });

  const dispatchClick = (target: Node) => {
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  };

  it('show 后 setTimeout(0) 跨过前点 body → 不立即关（self-trigger 防护）', () => {
    vi.useFakeTimers();
    try {
      const api = mountResultPopover({ anchor, onSelect: () => {} });
      api.show([mkItemLocal('a', '马克思')]);
      // setTimeout 0 还没触发 / listener 未 attach / 此时点 body 不该关
      dispatchClick(document.body);
      expect(api.isOpen()).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('show 后跨过 setTimeout(0) 点 body 空白 → 关闭', () => {
    vi.useFakeTimers();
    try {
      const api = mountResultPopover({ anchor, onSelect: () => {} });
      api.show([mkItemLocal('a', '马克思')]);
      vi.advanceTimersByTime(1);
      dispatchClick(document.body);
      expect(api.isOpen()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('点 popover 容器自己 → 不关（容器内点击 / 不算 outside）', () => {
    vi.useFakeTimers();
    try {
      const api = mountResultPopover({ anchor, onSelect: () => {} });
      api.show([mkItemLocal('a', '马克思')]);
      vi.advanceTimersByTime(1);
      const popover = document.querySelector('.search-result-popover') as HTMLElement;
      dispatchClick(popover);
      expect(api.isOpen()).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('点 anchor 搜索框 → 不关（用户继续编辑）', () => {
    vi.useFakeTimers();
    try {
      const api = mountResultPopover({ anchor, onSelect: () => {} });
      api.show([mkItemLocal('a', '马克思')]);
      vi.advanceTimersByTime(1);
      dispatchClick(anchor);
      expect(api.isOpen()).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('outside click → onClose callback 触发', () => {
    vi.useFakeTimers();
    try {
      const onClose = vi.fn();
      const api = mountResultPopover({ anchor, onSelect: () => {}, onClose });
      api.show([mkItemLocal('a', '马克思')]);
      vi.advanceTimersByTime(1);
      dispatchClick(document.body);
      expect(onClose).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('hide 后 listener detach（再点 body 不再触发 onClose）', () => {
    vi.useFakeTimers();
    try {
      const onClose = vi.fn();
      const api = mountResultPopover({ anchor, onSelect: () => {}, onClose });
      api.show([mkItemLocal('a', '马克思')]);
      vi.advanceTimersByTime(1);
      api.hide();
      onClose.mockClear();
      dispatchClick(document.body);
      expect(onClose).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('点工具栏 sidebar → 关（PM A · 不豁免）', () => {
    vi.useFakeTimers();
    try {
      const sidebar = document.createElement('div');
      sidebar.className = 'sidebar';
      document.body.appendChild(sidebar);

      const api = mountResultPopover({ anchor, onSelect: () => {} });
      api.show([mkItemLocal('a', '马克思')]);
      vi.advanceTimersByTime(1);
      dispatchClick(sidebar);
      expect(api.isOpen()).toBe(false);

      sidebar.remove();
    } finally {
      vi.useRealTimers();
    }
  });

  it('点主画布 svg → 关', () => {
    vi.useFakeTimers();
    try {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'relations-svg';
      document.body.appendChild(svg);

      const api = mountResultPopover({ anchor, onSelect: () => {} });
      api.show([mkItemLocal('a', '马克思')]);
      vi.advanceTimersByTime(1);
      dispatchClick(svg);
      expect(api.isOpen()).toBe(false);

      svg.remove();
    } finally {
      vi.useRealTimers();
    }
  });

  it('showExplore outside click → 关', () => {
    vi.useFakeTimers();
    try {
      const api = mountResultPopover({ anchor, onSelect: () => {} });
      api.showExplore(
        {
          persons: [{ id: 'p1', name: '马克思' }],
          concepts: [],
          periods: [],
        },
        () => {},
      );
      vi.advanceTimersByTime(1);
      dispatchClick(document.body);
      expect(api.isOpen()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('showGrouped outside click → 关', () => {
    vi.useFakeTimers();
    try {
      const personsMap = new Map<string, PersonNode>();
      personsMap.set('wd-q9061', mkPerson({ id: 'wd-q9061', name_zh: '马克思' }));
      const api = mountResultPopover({ anchor, onSelect: () => {} });
      api.showGrouped(
        [mkResult({ id: 'c1', author_id: 'wd-q9061', label: 'A', year: 1844 })],
        personsMap,
        'A',
        null,
      );
      vi.advanceTimersByTime(1);
      dispatchClick(document.body);
      expect(api.isOpen()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('capture phase · click 即使 child stopPropagation 也能关闭（PM bug 修 2026-05-21）', () => {
    vi.useFakeTimers();
    try {
      // 模拟主画布 svg obs click handler stopPropagation 场景
      // src/main.ts line 273/754/816 实际就是这样
      const stopChild = document.createElement('div');
      stopChild.className = 'mock-canvas-obs';
      stopChild.addEventListener('click', (e) => {
        e.stopPropagation(); // 模拟 obs / arc click handler
      });
      document.body.appendChild(stopChild);

      const api = mountResultPopover({ anchor, onSelect: () => {} });
      api.show([mkItemLocal('a', '马克思')]);
      vi.advanceTimersByTime(1);

      // 点 child / child 自己 stopPropagation / 不 bubble 到 document
      // 但是 capture phase listener 在 target phase 之前 / 先收到 / popover 关
      dispatchClick(stopChild);
      expect(api.isOpen()).toBe(false);

      stopChild.remove();
    } finally {
      vi.useRealTimers();
    }
  });
});

// ============================================================
// B1 polish D2 · search popover 退场动效（DR-096 · 2026-05-21 晚）
// 出快入慢（M5 DR-046 lesson · 入 180 / 出 120）
//
// API 行为：
//   - hide() 默认 → 走 120ms exit 动画（加 .popover-closing class + 140ms setTimeout remove）
//     isOpen() 立即返 false（用户语义上"已关闭"）
//     DOM 中 popover 还在 120ms exit 动画期 + .popover-closing class
//   - hide({ immediate: true }) → 同步立即 remove（防 race · 重建 path 用）
//     内部 _createPopover / show / showExplore / showGrouped 开头调用
//
// 防 race：每次 hide 进入先清掉前一个 closing popover（防多次连续 hide 累积 DOM 残留）
// ============================================================

describe('mountResultPopover · D2 退场动效（DR-096）', () => {
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

  const mkItemD2 = (
    id: string,
    label: string,
    type: SearchResultItem['type'] = 'claim',
  ): SearchResultItem => ({ type, id, label });

  it('hide() 默认 → 立即加 .popover-closing class · isOpen=false · DOM 中仍在', () => {
    vi.useFakeTimers();
    try {
      const api = mountResultPopover({ anchor, onSelect: () => {} });
      api.show([mkItemD2('a', '马克思')]);
      api.hide();
      // 立即态：isOpen 已 false / popover 加 closing class / 但还在 DOM
      expect(api.isOpen()).toBe(false);
      const closing = document.querySelector('.search-result-popover.popover-closing');
      expect(closing).toBeTruthy();
      // 90ms 期 · popover 还在 fading（未达 140ms 移除时刻）
      vi.advanceTimersByTime(90);
      expect(document.querySelector('.search-result-popover')).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('hide() 默认 → 140ms 后 popover 从 DOM remove', () => {
    vi.useFakeTimers();
    try {
      const api = mountResultPopover({ anchor, onSelect: () => {} });
      api.show([mkItemD2('a', '马克思')]);
      api.hide();
      vi.advanceTimersByTime(140);
      expect(document.querySelector('.search-result-popover')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('hide({ immediate: true }) → 同步立即 remove（不加 closing class）', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.show([mkItemD2('a', '马克思')]);
    api.hide({ immediate: true });
    // 同步立即生效 / 不用 fake timer
    expect(api.isOpen()).toBe(false);
    expect(document.querySelector('.search-result-popover')).toBeNull();
  });

  it('show 重建 path → 旧 popover 同步 remove · 不留 closing 残留（race 防御）', () => {
    const api = mountResultPopover({ anchor, onSelect: () => {} });
    api.show([mkItemD2('a', '一')]);
    api.show([mkItemD2('b', '二')]);
    // 重建 path 走 immediate · DOM 中只有 1 个 popover（无 closing 残留）
    expect(document.querySelectorAll('.search-result-popover').length).toBe(1);
    expect(document.querySelectorAll('.search-result-popover.popover-closing').length).toBe(0);
  });

  it('hide() 后立即 show → 旧 closing popover 同步清掉 · 不累积 DOM', () => {
    vi.useFakeTimers();
    try {
      const api = mountResultPopover({ anchor, onSelect: () => {} });
      api.show([mkItemD2('a', '一')]);
      api.hide(); // 进入 exit 动画期（旧 popover 还在 DOM · closing class）
      // 还在 exit 动画期就立即 show 新内容（模拟 e2e spec 4 chip 切换场景）
      api.show([mkItemD2('b', '二')]);
      // 关键断言：DOM 中只有 1 个 popover（旧 closing 被新 show 内的 immediate hide 清掉）
      expect(document.querySelectorAll('.search-result-popover').length).toBe(1);
      expect(document.querySelectorAll('.search-result-popover.popover-closing').length).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('多次连续 hide() → 第二次 hide 立即清前一个 closing · DOM 不累积 · 不抛错', () => {
    vi.useFakeTimers();
    try {
      const api = mountResultPopover({ anchor, onSelect: () => {} });
      api.show([mkItemD2('a', '一')]);
      api.hide(); // closing 状态 · DOM 中 1 个 popover
      expect(document.querySelectorAll('.search-result-popover').length).toBe(1);

      // 立即再 hide · 内部 _removeClosingNow 同步清掉前一个 closing popover · DOM = 0
      expect(() => api.hide()).not.toThrow();
      expect(document.querySelectorAll('.search-result-popover').length).toBe(0);

      // 第三次 hide · 无 closing 无 current · 安全无 op
      expect(() => api.hide()).not.toThrow();

      // 即使 timer fire 也 OK · closingTimer 已清 / 不会 double remove
      vi.advanceTimersByTime(140);
      expect(document.querySelectorAll('.search-result-popover').length).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
