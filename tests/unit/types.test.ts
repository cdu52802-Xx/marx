import { describe, it, expect } from 'vitest';
import type { Node } from '../../src/types/Node.ts';
import { isPerson, isWork } from '../../src/types/Node.ts';

describe('Node type narrowing · M2', () => {
  it('isPerson narrows to PersonNode', () => {
    const node: Node = {
      id: 'marx',
      type: 'person',
      name_zh: '卡尔·马克思',
      name_orig: 'Karl Marx',
      birth_year: 1818,
      death_year: 1883,
      main_location_lat_lng: [51.5074, -0.1278],
      bio_event_style: ['1818年5月 - 生于普鲁士特里尔'],
      citation_urls: ['https://www.marxists.org/archive/marx/'],
    };
    expect(isPerson(node)).toBe(true);
    if (isPerson(node)) {
      // 类型 narrow 后能访问 PersonNode 专有字段
      expect(node.birth_year).toBe(1818);
    }
  });

  it('isWork narrows to WorkNode', () => {
    const node: Node = {
      id: 'das-kapital',
      type: 'work',
      name_zh: '资本论',
      name_orig: 'Das Kapital',
      pub_year: 1867,
      author_id: 'marx',
      writing_period: '1857-1867',
      summary: '资本主义生产方式批判，第一卷 1867 出版',
      citation_urls: ['https://www.marxists.org/archive/marx/works/1867-c1/'],
    };
    expect(isWork(node)).toBe(true);
    if (isWork(node)) {
      expect(node.pub_year).toBe(1867);
    }
  });
});
