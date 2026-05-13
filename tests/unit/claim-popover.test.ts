import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { showClaimPopover, hideClaimPopover } from '../../src/components/claim-popover.ts';
import type { ClaimNode } from '../../src/types/Claim.ts';

describe('claim-popover · 详情右侧栏 (M4 T9 改造 / spec § 8.2)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    hideClaimPopover();
  });

  const mockClaim: ClaimNode = {
    id: 'claim-marx-001',
    type: 'claim',
    name_zh: '异化劳动',
    name_orig: 'Alienated labor',
    claim_text: '异化劳动是私有财产的根源——不是私有财产产生异化劳动，是异化劳动产生私有财产。',
    author_id: 'wd-q9061',
    source_work_id: 'work-1844-manuscripts',
    year: 1844,
    cats: ['me', 'po'],
    keywords: '异化劳动',
    reference: 'marxists.org/zh/marx/1844/',
  };

  const mockCtx = {
    authorName: 'Karl Marx',
    sourceWorkName: '1844 经济学哲学手稿',
    agreementClaims: [],
    disagreementClaims: [],
  };

  it('show 创建 sidebar DOM', () => {
    showClaimPopover(mockClaim, mockCtx);
    expect(document.querySelector('.claim-popover')).not.toBeNull();
  });

  it('sidebar 显示 claim_text 完整文本', () => {
    showClaimPopover(mockClaim, mockCtx);
    expect(document.querySelector('.claim-popover')?.textContent).toContain(
      '异化劳动是私有财产的根源',
    );
  });

  it('hide 立即标记 closing + 350ms 后移除 DOM (滑出动画)', async () => {
    showClaimPopover(mockClaim, mockCtx);
    hideClaimPopover();
    // 立即同步: 标记 closing + transform 反向触发滑出
    const sidebar = document.querySelector('.claim-popover') as HTMLElement;
    expect(sidebar.dataset.state).toBe('closing');
    expect(sidebar.style.transform).toBe('translateX(100%)');
    // 350ms 后 DOM 真的移除
    await new Promise((r) => setTimeout(r, 400));
    expect(document.querySelector('.claim-popover')).toBeNull();
  });

  it('Esc 键 hide sidebar (异步等滑出完成)', async () => {
    showClaimPopover(mockClaim, mockCtx);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await new Promise((r) => setTimeout(r, 400));
    expect(document.querySelector('.claim-popover')).toBeNull();
  });

  it('sidebar 位置 = position:fixed right:0 top:0 bottom:0 width:380px (PM Q2 决策 = 朋友项目滑入风格)', () => {
    showClaimPopover(mockClaim, mockCtx);
    const sidebar = document.querySelector('.claim-popover') as HTMLElement;
    expect(sidebar.style.position).toBe('fixed');
    expect(sidebar.style.right).toBe('0px');
    expect(sidebar.style.top).toBe('0px');
    expect(sidebar.style.bottom).toBe('0px');
    expect(sidebar.style.width).toBe('380px');
  });

  it('点击 sidebar 外 mousedown → hide sidebar (PM Q4 决策 = 三路关闭之一)', async () => {
    showClaimPopover(mockClaim, mockCtx);
    // setTimeout 0 注册 outside handler · 等 1 tick
    await new Promise((resolve) => setTimeout(resolve, 5));
    // 模拟 mousedown 在 body 上 (sidebar 外)
    const outsideTarget = document.createElement('div');
    document.body.appendChild(outsideTarget);
    outsideTarget.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    // 等滑出动画完成 350ms
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(document.querySelector('.claim-popover')).toBeNull();
  });

  it('点击 sidebar 内 mousedown → 不关闭 (内部交互不触发关闭)', async () => {
    showClaimPopover(mockClaim, mockCtx);
    await new Promise((resolve) => setTimeout(resolve, 5));
    const sidebar = document.querySelector('.claim-popover') as HTMLElement;
    const inner = sidebar.querySelector('blockquote') as HTMLElement;
    // 派发到 sidebar 内部子元素更接近真实用户交互 (鼠标按下时实际 target 是子元素)
    inner.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    expect(document.querySelector('.claim-popover')).not.toBeNull();
  });

  it('agreementClaims 渲染绿色 successor 块 (hybrid 配色: 沿用 M4 绿弧 #7a9a5a)', () => {
    showClaimPopover(mockClaim, {
      ...mockCtx,
      agreementClaims: [{ id: 'c-lukacs-1923', author: '卢卡奇', text: '物化扩展异化论' }],
    });
    const html = document.querySelector('.claim-popover')?.innerHTML ?? '';
    expect(html).toContain('卢卡奇');
    expect(html).toContain('#7a9a5a'); // M4 agreement 绿色
  });

  it('disagreementClaims 渲染红橘 successor 块 (hybrid 配色: 沿用 M4 红弧 #b8654a)', () => {
    showClaimPopover(mockClaim, {
      ...mockCtx,
      disagreementClaims: [{ id: 'c-proudhon-1846', author: '蒲鲁东', text: '私有制不是异化原因' }],
    });
    const html = document.querySelector('.claim-popover')?.innerHTML ?? '';
    expect(html).toContain('蒲鲁东');
    expect(html).toContain('#b8654a'); // M4 disagreement 红橘
  });
});
