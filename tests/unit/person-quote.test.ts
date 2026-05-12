import { describe, it, expect } from 'vitest';
import data from '../../src/data/claims.json';
import nodesData from '../../src/data/nodes_skeleton.json';
import type { ClaimNode } from '../../src/types/Claim.ts';
import { validateClaim } from '../../src/lib/claim-schema.ts';

describe('Task 4 · person quote 补采 acceptance', () => {
  const claims = (data.claims ?? []) as ClaimNode[];
  const persons = nodesData.nodes.filter((n: { type: string }) => n.type === 'person');

  it('claims 总数 ≥ M4 minimum 80', () => {
    expect(claims.length).toBeGreaterThanOrEqual(80);
  });

  it('每个 person 至少 1 个 claim（Marx 自己 + 12 concept-derived 之外）', () => {
    const claimAuthors = new Set(claims.map((c) => c.author_id));
    // Marx 19 obs + 12 concept (Marx) = 至少 Marx 一定有
    expect(claimAuthors.has('wd-q9061')).toBe(true);
    // 至少 10 个不同 person 有 claim（M4 minimum）
    expect(claimAuthors.size).toBeGreaterThanOrEqual(10);
    // 同时验证 persons 总数 ≥ 33 个非 Marx
    const nonMarxPersons = persons.filter((p: { id: string }) => p.id !== 'wd-q9061');
    expect(nonMarxPersons.length).toBeGreaterThanOrEqual(33);
  });

  it('每个 person quote claim 通过 schema 校验', () => {
    const personQuoteClaims = claims.filter(
      (c) => !c.derived_from_concept_id && !c.derived_from_denizcemonduygu_record_id,
    );
    for (const c of personQuoteClaims) {
      expect(validateClaim(c), `${c.id} 校验失败`).toEqual([]);
    }
  });
});
