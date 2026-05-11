import { describe, it, expect } from 'vitest';
import type { ClaimNode } from '../../src/types/Claim.ts';
import { validateClaim } from '../../src/lib/claim-schema.ts';

describe('claim-schema · ClaimNode 校验', () => {
  const validClaim: ClaimNode = {
    id: 'claim-001',
    type: 'claim',
    name_zh: 'placeholder',
    name_orig: 'placeholder',
    claim_text: '异化劳动是私有财产的根源——不是私有财产产生异化劳动，是异化劳动产生私有财产。',
    author_id: 'wd-q9061',
    source_work_id: 'work-1844-manuscripts',
    year: 1844,
    cats: ['me', 'po'],
    keywords: '异化劳动',
    reference: 'marxists.org/zh/marx/1844/',
  };

  it('valid claim 通过校验', () => {
    const errors = validateClaim(validClaim);
    expect(errors).toEqual([]);
  });

  it('claim_text 为空报错', () => {
    const c = { ...validClaim, claim_text: '' };
    expect(validateClaim(c)).toContain('claim-001 claim_text 不能为空');
  });

  it('claim_text 超过 50 字（中文等价）报错', () => {
    const c = { ...validClaim, claim_text: '异'.repeat(51) };
    const errors = validateClaim(c);
    expect(errors.some((e) => e.includes('claim_text 长度'))).toBe(true);
  });

  it('author_id 为空报错', () => {
    const c = { ...validClaim, author_id: '' };
    expect(validateClaim(c)).toContain('claim-001 author_id 不能为空');
  });

  it('year 必须 > 0', () => {
    const c = { ...validClaim, year: 0 };
    expect(validateClaim(c)).toContain('claim-001 year 必须 > 0');
  });

  it('cats 至少 1 个', () => {
    const c = { ...validClaim, cats: [] as any };
    expect(validateClaim(c)).toContain('claim-001 cats 至少 1 个');
  });

  it('cats 含非法值报错', () => {
    const c = { ...validClaim, cats: ['me', 'invalid'] as any };
    expect(validateClaim(c).some((e) => e.includes('cats 含非法值'))).toBe(true);
  });
});
