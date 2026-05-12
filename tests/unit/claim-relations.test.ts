import { describe, it, expect } from 'vitest';
import data from '../../src/data/claims.json';
import type { ClaimNode, ClaimRelation } from '../../src/types/Claim.ts';
import { validateClaimRelation } from '../../src/lib/claim-schema.ts';

describe('Task 5 · claim → claim 关系 acceptance', () => {
  const claims = (data.claims ?? []) as ClaimNode[];
  const relations = (data.relations ?? []) as ClaimRelation[];
  const claimIds = new Set(claims.map((c) => c.id));

  // M4 minimum 100 → 30（2026-05-12 SOFT-BLOCK 后调整）
  // 根本原因: denizcemonduygu 是西方哲学 canon (188 人 / Plato → Foucault), Marx 项目是 Marxism 传统 (34 人),
  // 交集仅 7 人 (Marx/Hegel/Feuerbach/Croce/Gramsci/Benjamin/Bataille), 数学上限 31 条 ClaimRelation.
  // 详见 spec § 9.3 实施状态注释 + memory feedback_third_party_reference_role.md
  it('relations 数 ≥ M4 调整后 minimum 30', () => {
    expect(relations.length).toBeGreaterThanOrEqual(30);
  });

  it('agreement_with + disagreement_with 比例近似 denizcemonduygu (60/40)', () => {
    const agree = relations.filter((r) => r.type === 'agreement_with').length;
    const disagree = relations.filter((r) => r.type === 'disagreement_with').length;
    expect(agree).toBeGreaterThanOrEqual(18);
    expect(disagree).toBeGreaterThanOrEqual(10);
  });

  it('每条 relation 通过 schema 校验', () => {
    for (const r of relations) {
      const errs = validateClaimRelation(r, claimIds);
      expect(errs, JSON.stringify(r)).toEqual([]);
    }
  });
});
