import { describe, it, expect } from 'vitest';
import data from '../../src/data/claims.json';
import type { ClaimNode, ClaimRelation } from '../../src/types/Claim.ts';
import { validateClaimRelation } from '../../src/lib/claim-schema.ts';

describe('Task 5 · claim → claim 关系 acceptance', () => {
  const claims = (data.claims ?? []) as ClaimNode[];
  const relations = (data.relations ?? []) as ClaimRelation[];
  const claimIds = new Set(claims.map((c) => c.id));

  it('relations 数 ≥ M4 minimum 100', () => {
    expect(relations.length).toBeGreaterThanOrEqual(100);
  });

  it('agreement_with + disagreement_with 比例近似 denizcemonduygu (60/40)', () => {
    const agree = relations.filter((r) => r.type === 'agreement_with').length;
    const disagree = relations.filter((r) => r.type === 'disagreement_with').length;
    expect(agree).toBeGreaterThanOrEqual(50);
    expect(disagree).toBeGreaterThanOrEqual(30);
  });

  it('每条 relation 通过 schema 校验', () => {
    for (const r of relations) {
      const errs = validateClaimRelation(r, claimIds);
      expect(errs, JSON.stringify(r)).toEqual([]);
    }
  });
});
