import { describe, it, expect } from 'vitest';
import { applyChecklistMd } from '../../scripts/apply-claim-validation-md.ts';
import type { ClaimNode } from '../../src/types/Claim.ts';

// regression test: 防止 T2 code review 找到的 source_work_id="-" 数据腐败
// + claim_text 跨行污染再次出现。
describe('Task 2 · apply-md regression', () => {
  function baseDataset(): { claims: ClaimNode[]; relations: unknown[] } {
    return {
      claims: [
        {
          id: 'claim-marx-001',
          type: 'claim',
          name_zh: 'x',
          name_orig: 'X',
          claim_text: '<待翻译>',
          author_id: 'wd-q9061',
          year: 1850,
          cats: ['me'],
        },
      ],
      relations: [],
    };
  }

  it('source_work_id 空白时不写入 "-"', () => {
    const md = `## claim-marx-001\n\n- **claim_text**（PM 复核 / 改）: 测试\n- **year**（PM 推断 / 默认 1850）: 1850\n- **source_work_id**（PM 填）: \n- **cats**（已标）: me\n`;
    const { dataset } = applyChecklistMd(md, baseDataset());
    expect(dataset.claims[0].source_work_id).not.toBe('-');
    expect(dataset.claims[0].source_work_id ?? '').toBe('');
  });

  it('source_work_id 填了正常写入', () => {
    const md = `## claim-marx-001\n\n- **claim_text**（PM 复核 / 改）: 测试\n- **year**（PM 推断 / 默认 1850）: 1844\n- **source_work_id**（PM 填）: wd-q295347\n- **cats**（已标）: me\n`;
    const { dataset } = applyChecklistMd(md, baseDataset());
    expect(dataset.claims[0].source_work_id).toBe('wd-q295347');
  });

  it('claim_text 同样不被 - 污染', () => {
    const md = `## claim-marx-001\n\n- **claim_text**（PM 复核 / 改）: 我的翻译\n- **year**: 1844\n- **source_work_id**（PM 填）: \n`;
    const { dataset } = applyChecklistMd(md, baseDataset());
    expect(dataset.claims[0].claim_text).toBe('我的翻译');
  });

  it('placeholder <待翻译> 不被回填', () => {
    const md = `## claim-marx-001\n\n- **claim_text**（PM 复核 / 改）: <待翻译>\n`;
    const { dataset } = applyChecklistMd(md, baseDataset());
    expect(dataset.claims[0].claim_text).toBe('<待翻译>');
  });

  it('year 解析数字', () => {
    const md = `## claim-marx-001\n\n- **claim_text**（PM 复核 / 改）: 测试\n- **year**（PM 推断 / 默认 1850）: 1844\n- **source_work_id**（PM 填）: \n`;
    const { dataset } = applyChecklistMd(md, baseDataset());
    expect(dataset.claims[0].year).toBe(1844);
  });
});
