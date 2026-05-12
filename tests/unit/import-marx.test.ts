import { describe, it, expect } from 'vitest';
import data from '../../src/data/claims.json';
import type { ClaimNode } from '../../src/types/Claim.ts';
import { validateClaim } from '../../src/lib/claim-schema.ts';
import { filterValidCats } from '../../scripts/import-denizcemonduygu-marx.ts';

describe('Task 2 · Marx 19 obs 入库 acceptance', () => {
  const claims = (data.claims ?? []) as ClaimNode[];
  // filter 用 denizcemonduygu source identity, 不是 author_id
  // (T3 12 concept claim author_id 也是 wd-q9061 但 source 不同, 走 derived_from_concept_id)
  const marxClaims = claims.filter((c) => c.derived_from_denizcemonduygu_record_id !== undefined);

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

describe('Task 2 · filterValidCats helper', () => {
  it('过滤 ba 保留 me/po 等 11 类', () => {
    expect(filterValidCats(['me', 'ba', 'po'])).toEqual(['me', 'po']);
  });
  it('保留顺序', () => {
    expect(filterValidCats(['po', 'me', 'ba', 'et'])).toEqual(['po', 'me', 'et']);
  });
  it('全部合法不丢', () => {
    expect(filterValidCats(['me', 'ep', 'lo'])).toEqual(['me', 'ep', 'lo']);
  });
  it('全部非法返回空', () => {
    expect(filterValidCats(['ba', 'foo', 'bar'])).toEqual([]);
  });
});
