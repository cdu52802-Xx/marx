import { describe, it, expect } from 'vitest';
import { applyConceptChecklistMd } from '../../scripts/apply-claim-validation-md.ts';
import type { ClaimNode } from '../../src/types/Claim.ts';

// Unit tests for the pure function applyConceptChecklistMd.
// These should PASS immediately (no dependency on claims.json state).
// Parallel to the T2 apply-md.test.ts regression suite.
describe('Task 3 · applyConceptChecklistMd pure function', () => {
  function emptyDataset(): { claims: ClaimNode[]; relations: unknown[] } {
    return { claims: [], relations: [] };
  }

  function makeMd(
    id: string,
    fields: {
      claim_text?: string;
      year?: number;
      source_work_id?: string;
      cats?: string;
      keywords?: string;
      name_orig?: string;
      derived_from_concept_id?: string;
    },
  ): string {
    return [
      `## ${id}`,
      '',
      `- **claim_text**（PM 复核 / 改）: ${fields.claim_text ?? '<待 AI 草稿>'}`,
      `- **year**（PM 推断 / 默认 proposed_year）: ${fields.year ?? 1844}`,
      `- **source_work_id**（PM 填）: ${fields.source_work_id ?? ''}`,
      `- **cats**（AI 建议，PM 可改）: ${fields.cats ?? 'po'}`,
      `- **keywords**（PM 可改）: ${fields.keywords ?? ''}`,
      `- **name_orig**（原概念外文名，PM 可改）: ${fields.name_orig ?? ''}`,
      `- **derived_from_concept_id**（只读）: ${fields.derived_from_concept_id ?? ''}`,
      `- **pm_reviewed**（填 yes 表示复核完毕）: `,
      '',
    ].join('\n');
  }

  it('claim_text 正常解析并创建新 ClaimNode', () => {
    const md = makeMd('claim-cpt-alienation', {
      claim_text: '工人与劳动产品异化是资本主义压迫的根源。',
      derived_from_concept_id: 'concept-alienation',
    });
    const { dataset, created } = applyConceptChecklistMd(md, emptyDataset());
    expect(created).toBe(1);
    expect(dataset.claims.length).toBe(1);
    expect(dataset.claims[0].claim_text).toBe('工人与劳动产品异化是资本主义压迫的根源。');
  });

  it('derived_from_concept_id 正确捕获', () => {
    const md = makeMd('claim-cpt-alienation', {
      claim_text: '测试主张。',
      derived_from_concept_id: 'concept-alienation',
    });
    const { dataset } = applyConceptChecklistMd(md, emptyDataset());
    expect(dataset.claims[0].derived_from_concept_id).toBe('concept-alienation');
  });

  it('cats 多选解析正确（逗号分隔）', () => {
    const md = makeMd('claim-cpt-ideology', {
      claim_text: '意识形态是统治工具。',
      cats: 'me,po,et',
      derived_from_concept_id: 'concept-ideology',
    });
    const { dataset } = applyConceptChecklistMd(md, emptyDataset());
    expect(dataset.claims[0].cats).toEqual(['me', 'po', 'et']);
  });

  it('source_work_id 空白时不写入 "-"', () => {
    const md = makeMd('claim-cpt-state', {
      claim_text: '国家是阶级压迫工具。',
      source_work_id: '',
      derived_from_concept_id: 'concept-state',
    });
    const { dataset } = applyConceptChecklistMd(md, emptyDataset());
    expect(dataset.claims[0].source_work_id).not.toBe('-');
    expect(dataset.claims[0].source_work_id).toBeUndefined();
  });

  it('source_work_id 填了正常写入', () => {
    const md = makeMd('claim-cpt-state', {
      claim_text: '国家是阶级压迫工具。',
      source_work_id: 'wd-q40591',
      derived_from_concept_id: 'concept-state',
    });
    const { dataset } = applyConceptChecklistMd(md, emptyDataset());
    expect(dataset.claims[0].source_work_id).toBe('wd-q40591');
  });

  it('claim_text 同样不被 "-" 污染（行内 bullet 不跨行）', () => {
    const md = makeMd('claim-cpt-revolution', {
      claim_text: '革命是历史的助产婆。',
      source_work_id: '',
      derived_from_concept_id: 'concept-revolution',
    });
    const { dataset } = applyConceptChecklistMd(md, emptyDataset());
    expect(dataset.claims[0].claim_text).toBe('革命是历史的助产婆。');
  });

  it('placeholder <待 AI 草稿> 不被入库（skipped）', () => {
    const md = makeMd('claim-cpt-communism', {
      claim_text: '<待 AI 草稿>',
      derived_from_concept_id: 'concept-communism',
    });
    const { created, skipped, dataset } = applyConceptChecklistMd(md, emptyDataset());
    expect(created).toBe(0);
    expect(skipped).toBe(1);
    expect(dataset.claims.length).toBe(0);
  });

  it('author_id 默认为 wd-q9061 (Marx)', () => {
    const md = makeMd('claim-cpt-class-struggle', {
      claim_text: '阶级斗争贯穿历史。',
      derived_from_concept_id: 'concept-class-struggle',
    });
    const { dataset } = applyConceptChecklistMd(md, emptyDataset());
    expect(dataset.claims[0].author_id).toBe('wd-q9061');
  });

  it('name_orig 从 checklist 字段读取', () => {
    const md = makeMd('claim-cpt-alienation', {
      claim_text: '异化是劳动异化。',
      name_orig: 'Entfremdung',
      derived_from_concept_id: 'concept-alienation',
    });
    const { dataset } = applyConceptChecklistMd(md, emptyDataset());
    expect(dataset.claims[0].name_orig).toBe('Entfremdung');
  });

  it('多个 entry 全部正确创建', () => {
    const md = [
      makeMd('claim-cpt-alienation', {
        claim_text: '异化主张一。',
        derived_from_concept_id: 'concept-alienation',
      }),
      makeMd('claim-cpt-state', {
        claim_text: '国家主张二。',
        derived_from_concept_id: 'concept-state',
      }),
    ].join('');
    const { dataset, created } = applyConceptChecklistMd(md, emptyDataset());
    expect(created).toBe(2);
    expect(dataset.claims.length).toBe(2);
    expect(dataset.claims.map((c) => c.id)).toContain('claim-cpt-alienation');
    expect(dataset.claims.map((c) => c.id)).toContain('claim-cpt-state');
  });
});
