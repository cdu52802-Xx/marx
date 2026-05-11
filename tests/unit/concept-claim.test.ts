import { describe, it, expect } from 'vitest';
import data from '../../src/data/claims.json';
import type { ClaimNode } from '../../src/types/Claim.ts';
import { validateClaim } from '../../src/lib/claim-schema.ts';

describe('Task 3 · 12 concept 升级 claim acceptance', () => {
  const claims = (data.claims ?? []) as ClaimNode[];
  const conceptClaims = claims.filter((c) => c.derived_from_concept_id);

  it('从 concept 升级的 claim 数 = 12', () => {
    expect(conceptClaims.length).toBe(12);
  });

  it('每个升级 claim 的 derived_from_concept_id 在 M3 12 concept 集合', () => {
    const validConceptIds = new Set([
      'concept-alienation',
      'concept-surplus-value',
      'concept-historical-materialism',
      'concept-class-struggle',
      'concept-commodity-fetishism',
      'concept-ideology',
      'concept-mode-of-production',
      'concept-base-superstructure',
      'concept-communism',
      'concept-revolution',
      'concept-labor-theory-of-value',
      'concept-state',
    ]);
    for (const c of conceptClaims) {
      expect(validConceptIds.has(c.derived_from_concept_id!), `${c.id} concept_id 非法`).toBe(true);
    }
  });

  it('每个升级 claim 通过 schema 校验', () => {
    for (const c of conceptClaims) {
      expect(validateClaim(c)).toEqual([]);
    }
  });
});
