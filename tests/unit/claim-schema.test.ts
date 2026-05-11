import { describe, it, expect } from 'vitest';
import type { ClaimNode } from '../../src/types/Claim.ts';
import { validateClaim, validateClaimRelation } from '../../src/lib/claim-schema.ts';

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
    expect(validateClaim(c).some((e) => e.includes('year'))).toBe(true);
  });

  it('year 非整数（1844.5）报错', () => {
    const c = { ...validClaim, year: 1844.5 };
    expect(validateClaim(c).some((e) => e.includes('year'))).toBe(true);
  });

  it('cats 至少 1 个', () => {
    const c = { ...validClaim, cats: [] as never[] };
    expect(validateClaim(c)).toContain('claim-001 cats 至少 1 个');
  });

  it('cats 含非法值报错', () => {
    const c = { ...validClaim, cats: ['me', 'invalid'] as unknown as ClaimNode['cats'] };
    expect(validateClaim(c).some((e) => e.includes('cats 含非法值'))).toBe(true);
  });
});

describe('claim-schema · ClaimRelation 校验', () => {
  const knownIds = new Set(['claim-001', 'claim-002']);

  it('valid relation 通过校验', () => {
    expect(
      validateClaimRelation(
        { source: 'claim-001', target: 'claim-002', type: 'agreement_with' },
        knownIds,
      ),
    ).toEqual([]);
  });

  it('source 不在 known 集合报错', () => {
    const errs = validateClaimRelation(
      { source: 'claim-999', target: 'claim-002', type: 'agreement_with' },
      knownIds,
    );
    expect(errs.some((e) => e.includes('source 不在 claim 集合'))).toBe(true);
  });

  it('target 不在 known 集合报错', () => {
    const errs = validateClaimRelation(
      { source: 'claim-001', target: 'claim-999', type: 'agreement_with' },
      knownIds,
    );
    expect(errs.some((e) => e.includes('target 不在 claim 集合'))).toBe(true);
  });

  it('type 非法报错', () => {
    const errs = validateClaimRelation(
      { source: 'claim-001', target: 'claim-002', type: 'foo' as unknown as 'agreement_with' },
      knownIds,
    );
    expect(errs.some((e) => e.includes('type 必须是'))).toBe(true);
  });

  it('source === target 自环报错', () => {
    const errs = validateClaimRelation(
      { source: 'claim-001', target: 'claim-001', type: 'agreement_with' },
      knownIds,
    );
    expect(errs.some((e) => e.includes('自环'))).toBe(true);
  });
});
