// M5 Stage 5 R2 T8' · arc-popover 单测
// PM Q1 (B) + Q3 (X') + Q4 (1) brainstorm 拍板：
//   - 上下分栏 source/target / 默认两侧折叠
//   - 顶部按钮：[fit 居中] (装不下时) + [→ 焦点] (hover preview / click commit) + [×]
//   - click obs-slot → 该侧展开 / 另侧折叠 + 该 obs 高亮 callback
import { afterEach, describe, expect, it, vi } from 'vitest';
import { showArcPopover, hideArcPopover } from '../../src/components/arc-popover.ts';
import type { ClaimNode, ClaimRelation } from '../../src/types/Claim.ts';

const stubClaim = (id: string, author: string, text: string): ClaimNode => ({
  id,
  type: 'claim',
  name_zh: text.slice(0, 12),
  name_orig: 'orig',
  claim_text: text,
  author_id: 'p-' + author,
  year: 1850,
  cats: ['po'],
  keywords: 'tag',
  reference: 'Marx, Capital',
});

const stubRel = (sId: string, tId: string, type: ClaimRelation['type']): ClaimRelation => ({
  source: sId,
  target: tId,
  type,
});

afterEach(() => {
  document.body.innerHTML = '';
  hideArcPopover();
});

describe('arc-popover', () => {
  it('show 后 body 有 .arc-popover + 两 obs-slot 默认 collapsed', () => {
    showArcPopover({
      relation: stubRel('a', 'b', 'agreement_with'),
      source: stubClaim('a', 'hegel', '历史是绝对精神的实现'),
      target: stubClaim('b', 'marx', '物质生产决定社会意识'),
      sourceAuthor: '黑格尔',
      targetAuthor: '马克思',
      isFitNow: false,
    });
    const pop = document.querySelector('.arc-popover') as HTMLElement;
    expect(pop).toBeTruthy();
    const slots = pop.querySelectorAll('.obs-slot');
    expect(slots.length).toBe(2);
    expect(slots[0].classList.contains('expanded')).toBe(false);
    expect(slots[1].classList.contains('expanded')).toBe(false);
  });

  it('显示 source + target author + claim_text', () => {
    showArcPopover({
      relation: stubRel('a', 'b', 'agreement_with'),
      source: stubClaim('a', 'hegel', '历史是绝对精神'),
      target: stubClaim('b', 'marx', '物质决定意识'),
      sourceAuthor: '黑格尔',
      targetAuthor: '马克思',
      isFitNow: false,
    });
    const pop = document.querySelector('.arc-popover') as HTMLElement;
    expect(pop.textContent).toContain('黑格尔');
    expect(pop.textContent).toContain('马克思');
    expect(pop.textContent).toContain('历史是绝对精神');
    expect(pop.textContent).toContain('物质决定意识');
  });

  it('关系类型 中文 label / agreement_with → 同意', () => {
    showArcPopover({
      relation: stubRel('a', 'b', 'agreement_with'),
      source: stubClaim('a', 'h', 'x'),
      target: stubClaim('b', 'm', 'y'),
      sourceAuthor: '黑',
      targetAuthor: '马',
      isFitNow: false,
    });
    expect(document.querySelector('.arc-popover')?.textContent).toContain('同意');
  });

  it('isFitNow=false 时显示「fit 居中」按钮 / true 时不显示', () => {
    showArcPopover({
      relation: stubRel('a', 'b', 'extends'),
      source: stubClaim('a', 'h', 'x'),
      target: stubClaim('b', 'm', 'y'),
      sourceAuthor: '黑',
      targetAuthor: '马',
      isFitNow: false,
    });
    expect(document.querySelector('.arc-popover-fit-btn')).toBeTruthy();
    hideArcPopover();
    showArcPopover({
      relation: stubRel('a', 'b', 'extends'),
      source: stubClaim('a', 'h', 'x'),
      target: stubClaim('b', 'm', 'y'),
      sourceAuthor: '黑',
      targetAuthor: '马',
      isFitNow: true,
    });
    expect(document.querySelector('.arc-popover-fit-btn')).toBeNull();
  });

  it('fit 按钮 click 触发 onFitClick 回调', () => {
    const onFitClick = vi.fn();
    showArcPopover({
      relation: stubRel('a', 'b', 'extends'),
      source: stubClaim('a', 'h', 'x'),
      target: stubClaim('b', 'm', 'y'),
      sourceAuthor: '黑',
      targetAuthor: '马',
      isFitNow: false,
      onFitClick,
    });
    const btn = document.querySelector('.arc-popover-fit-btn') as HTMLButtonElement;
    btn.click();
    expect(onFitClick).toHaveBeenCalledOnce();
  });

  it('焦点按钮默认 disabled / 一侧展开后 enabled', () => {
    const onEnterFocus = vi.fn();
    showArcPopover({
      relation: stubRel('a', 'b', 'agreement_with'),
      source: stubClaim('a', 'h', 'x'),
      target: stubClaim('b', 'm', 'y'),
      sourceAuthor: '黑',
      targetAuthor: '马',
      isFitNow: true,
      onEnterFocus,
    });
    const focusBtn = document.querySelector('.arc-popover-focus-btn') as HTMLButtonElement;
    expect(focusBtn.disabled).toBe(true);
    // 展开 source slot
    const sourceSlot = document.querySelector('.obs-slot[data-side="source"]') as HTMLElement;
    sourceSlot.click();
    expect(focusBtn.disabled).toBe(false);
  });

  it('焦点按钮 click 后 / 当前展开侧 obs id 传给 onEnterFocus', () => {
    const onEnterFocus = vi.fn();
    showArcPopover({
      relation: stubRel('a', 'b', 'agreement_with'),
      source: stubClaim('a', 'h', 'x'),
      target: stubClaim('b', 'm', 'y'),
      sourceAuthor: '黑',
      targetAuthor: '马',
      isFitNow: true,
      onEnterFocus,
    });
    // 展开 target slot
    const targetSlot = document.querySelector('.obs-slot[data-side="target"]') as HTMLElement;
    targetSlot.click();
    const focusBtn = document.querySelector('.arc-popover-focus-btn') as HTMLButtonElement;
    focusBtn.click();
    expect(onEnterFocus).toHaveBeenCalledWith('b');
  });

  it('click obs-slot → 展开 + onObsExpand 回调传该 obs id / 高亮联动', () => {
    const onObsExpand = vi.fn();
    showArcPopover({
      relation: stubRel('a', 'b', 'agreement_with'),
      source: stubClaim('a', 'h', 'x'),
      target: stubClaim('b', 'm', 'y'),
      sourceAuthor: '黑',
      targetAuthor: '马',
      isFitNow: true,
      onObsExpand,
    });
    const sourceSlot = document.querySelector('.obs-slot[data-side="source"]') as HTMLElement;
    sourceSlot.click();
    expect(sourceSlot.classList.contains('expanded')).toBe(true);
    expect(onObsExpand).toHaveBeenCalledWith('a');
    // 再点 target → source 折叠 / target 展开
    const targetSlot = document.querySelector('.obs-slot[data-side="target"]') as HTMLElement;
    targetSlot.click();
    expect(sourceSlot.classList.contains('expanded')).toBe(false);
    expect(targetSlot.classList.contains('expanded')).toBe(true);
    expect(onObsExpand).toHaveBeenCalledWith('b');
  });

  it('再次 click 已展开 slot → 折叠', () => {
    showArcPopover({
      relation: stubRel('a', 'b', 'agreement_with'),
      source: stubClaim('a', 'h', 'x'),
      target: stubClaim('b', 'm', 'y'),
      sourceAuthor: '黑',
      targetAuthor: '马',
      isFitNow: true,
    });
    const slot = document.querySelector('.obs-slot[data-side="source"]') as HTMLElement;
    slot.click();
    expect(slot.classList.contains('expanded')).toBe(true);
    slot.click();
    expect(slot.classList.contains('expanded')).toBe(false);
  });

  it('焦点按钮 hover → onFocusPreview / leave → onFocusLeavePreview', () => {
    const onFocusPreview = vi.fn();
    const onFocusLeavePreview = vi.fn();
    showArcPopover({
      relation: stubRel('a', 'b', 'agreement_with'),
      source: stubClaim('a', 'h', 'x'),
      target: stubClaim('b', 'm', 'y'),
      sourceAuthor: '黑',
      targetAuthor: '马',
      isFitNow: true,
      onFocusPreview,
      onFocusLeavePreview,
    });
    // 展开 source / 让按钮 enabled
    const slot = document.querySelector('.obs-slot[data-side="source"]') as HTMLElement;
    slot.click();
    const focusBtn = document.querySelector('.arc-popover-focus-btn') as HTMLButtonElement;
    focusBtn.dispatchEvent(new MouseEvent('mouseenter'));
    expect(onFocusPreview).toHaveBeenCalledWith('a');
    focusBtn.dispatchEvent(new MouseEvent('mouseleave'));
    expect(onFocusLeavePreview).toHaveBeenCalledOnce();
  });

  it('× 按钮 click → 关 popover + 调 onClose', () => {
    const onClose = vi.fn();
    showArcPopover({
      relation: stubRel('a', 'b', 'agreement_with'),
      source: stubClaim('a', 'h', 'x'),
      target: stubClaim('b', 'm', 'y'),
      sourceAuthor: '黑',
      targetAuthor: '马',
      isFitNow: true,
      onClose,
    });
    const closeBtn = document.querySelector('.arc-popover-close-btn') as HTMLButtonElement;
    closeBtn.click();
    expect(onClose).toHaveBeenCalledOnce();
    // hide DOM 在 200ms 滑出动画后 remove / 这里检查 closing state
    expect(document.querySelector('.arc-popover')?.getAttribute('data-state')).toBe('closing');
  });

  it('hideArcPopover 幂等', () => {
    expect(() => hideArcPopover()).not.toThrow();
    hideArcPopover();
    hideArcPopover();
  });

  it('show 同 relation 重复 / early return 不重渲染', () => {
    showArcPopover({
      relation: stubRel('a', 'b', 'agreement_with'),
      source: stubClaim('a', 'h', 'x'),
      target: stubClaim('b', 'm', 'y'),
      sourceAuthor: '黑',
      targetAuthor: '马',
      isFitNow: true,
    });
    const firstPop = document.querySelector('.arc-popover');
    showArcPopover({
      relation: stubRel('a', 'b', 'agreement_with'),
      source: stubClaim('a', 'h', 'x'),
      target: stubClaim('b', 'm', 'y'),
      sourceAuthor: '黑',
      targetAuthor: '马',
      isFitNow: true,
    });
    const secondPop = document.querySelector('.arc-popover');
    expect(firstPop).toBe(secondPop); // 同一 DOM 元素 / 没重 remove + add
  });
});
