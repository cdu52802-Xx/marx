// M4 T8 · 左侧颗粒度过滤栏 acceptance test
// spec § 7 设计 / plan line 2042-2080 验证
//
// 4 个 it:
//   1. 默认收起态 width = 48px (data-state = "collapsed")
//   2. 点击 ⟩ 展开 width = 200px (data-state = "expanded")
//   3. 默认 filters: claim/person/绿弧/红弧 都 ON (checkbox checked)
//   4. uncheck checkbox → onFilterChange 触发 + filter 状态正确传递

import { describe, it, expect, beforeEach } from 'vitest';
import { mountSidebar, type SidebarFilters } from '../../src/components/sidebar.ts';

describe('sidebar · 颗粒度栏', () => {
  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('默认收起态 width = 48px', () => {
    mountSidebar({ container });
    expect(container.querySelector('.sidebar')?.getAttribute('data-state')).toBe('collapsed');
  });

  it('点击 ⟩ 展开 width = 200px', () => {
    mountSidebar({ container });
    (container.querySelector('.toggle-btn') as HTMLElement).click();
    expect(container.querySelector('.sidebar')?.getAttribute('data-state')).toBe('expanded');
  });

  it('默认 filters: claim/person/绿弧/红弧 都 ON', () => {
    mountSidebar({ container });
    const claimCb = container.querySelector('input[data-filter="node-claim"]') as HTMLInputElement;
    expect(claimCb.checked).toBe(true);
    const personCb = container.querySelector(
      'input[data-filter="node-person"]',
    ) as HTMLInputElement;
    expect(personCb.checked).toBe(true);
    const greenCb = container.querySelector(
      'input[data-filter="rel-agreement_with"]',
    ) as HTMLInputElement;
    expect(greenCb.checked).toBe(true);
    const redCb = container.querySelector(
      'input[data-filter="rel-disagreement_with"]',
    ) as HTMLInputElement;
    expect(redCb.checked).toBe(true);
  });

  it('uncheck 触发 onFilterChange', () => {
    const captured: { value: SidebarFilters | null } = { value: null };
    mountSidebar({ container, onFilterChange: (f) => (captured.value = f) });
    (
      container.querySelector('input[data-filter="rel-disagreement_with"]') as HTMLInputElement
    ).click();
    expect(captured.value?.relations.disagreement_with).toBe(false);
  });
});
