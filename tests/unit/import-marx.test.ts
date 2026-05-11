import { describe, it, expect } from 'vitest';
import data from '../../src/data/claims.json';
import type { ClaimNode } from '../../src/types/Claim.ts';
import { validateClaim } from '../../src/lib/claim-schema.ts';

describe('Task 2 · Marx 19 obs 入库 acceptance', () => {
  const claims = (data.claims ?? []) as ClaimNode[];
  const marxClaims = claims.filter((c) => c.author_id === 'wd-q9061');

  it('Marx claim 数 = 19', () => {
    expect(marxClaims.length).toBe(19);
  });

  it('Marx claim 都有 derived_from_denizcemonduygu_record_id', () => {
    for (const c of marxClaims) {
      expect(
        c.derived_from_denizcemonduygu_record_id,
        `${c.id} 缺 derived id`,
      ).toBeGreaterThanOrEqual(0);
    }
  });

  it('Marx claim 都通过 schema 校验', () => {
    for (const c of marxClaims) {
      expect(validateClaim(c), `${c.id} 校验失败: ${validateClaim(c).join(';')}`).toEqual([]);
    }
  });

  it('Marx claim 至少 5 条 cats 含 "po"（政治哲学是 Marx 主线）', () => {
    const poCount = marxClaims.filter((c) => c.cats.includes('po')).length;
    expect(poCount).toBeGreaterThanOrEqual(5);
  });
});
