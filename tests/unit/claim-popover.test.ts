import { describe, it, expect, beforeEach } from 'vitest';
import { showClaimPopover, hideClaimPopover } from '../../src/components/claim-popover.ts';
import type { ClaimNode } from '../../src/types/Claim.ts';

describe('claim-popover · 详情卡', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
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

  it('show 创建 popover DOM', () => {
    showClaimPopover(
      mockClaim,
      { x: 100, y: 100 },
      {
        authorName: 'Karl Marx',
        sourceWorkName: '1844 经济学哲学手稿',
        agreementClaims: [],
        disagreementClaims: [],
      },
    );
    expect(document.querySelector('.claim-popover')).not.toBeNull();
  });

  it('popover 显示 claim_text 完整文本', () => {
    showClaimPopover(
      mockClaim,
      { x: 100, y: 100 },
      {
        authorName: 'Karl Marx',
        sourceWorkName: '1844',
        agreementClaims: [],
        disagreementClaims: [],
      },
    );
    expect(document.querySelector('.claim-popover')?.textContent).toContain(
      '异化劳动是私有财产的根源',
    );
  });

  it('hide 移除 popover DOM', () => {
    showClaimPopover(
      mockClaim,
      { x: 100, y: 100 },
      {
        authorName: 'Karl Marx',
        sourceWorkName: '1844',
        agreementClaims: [],
        disagreementClaims: [],
      },
    );
    hideClaimPopover();
    expect(document.querySelector('.claim-popover')).toBeNull();
  });

  it('Esc 键 hide popover', () => {
    showClaimPopover(
      mockClaim,
      { x: 100, y: 100 },
      {
        authorName: 'Karl Marx',
        sourceWorkName: '1844',
        agreementClaims: [],
        disagreementClaims: [],
      },
    );
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.querySelector('.claim-popover')).toBeNull();
  });
});
