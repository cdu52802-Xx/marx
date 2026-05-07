import { describe, it, expect } from 'vitest';
import { validateNode, validateRelation, validateDataset } from '../../src/lib/schema.ts';
import type { PersonNode, WorkNode, Relation, Dataset } from '../../src/types/Node.ts';

describe('validateNode · M2', () => {
  it('accepts valid PersonNode', () => {
    const node: PersonNode = {
      id: 'marx',
      type: 'person',
      name_zh: '卡尔·马克思',
      name_orig: 'Karl Marx',
      birth_year: 1818,
      death_year: 1883,
      main_location_lat_lng: [51.5074, -0.1278],
      bio_event_style: ['1818年5月 - 生于普鲁士特里尔'],
      citation_urls: ['https://example.org/marx'],
    };
    expect(() => validateNode(node)).not.toThrow();
  });

  it('throws when PersonNode missing birth_year', () => {
    const broken = {
      id: 'marx',
      type: 'person',
      name_zh: '卡尔·马克思',
      name_orig: 'Karl Marx',
      // birth_year 缺
      death_year: 1883,
      main_location_lat_lng: [51.5074, -0.1278],
      bio_event_style: [],
      citation_urls: [],
    };
    expect(() => validateNode(broken as unknown as PersonNode)).toThrow(/birth_year/);
  });

  it('throws when type is unknown', () => {
    const broken = {
      id: 'x',
      type: 'alien',
      name_zh: 'x',
      name_orig: 'x',
    };
    expect(() => validateNode(broken as unknown as PersonNode)).toThrow(/unknown node type/);
  });

  it('accepts valid WorkNode', () => {
    const node: WorkNode = {
      id: 'das-kapital',
      type: 'work',
      name_zh: '资本论',
      name_orig: 'Das Kapital',
      pub_year: 1867,
      author_id: 'marx',
      writing_period: '1857-1867',
      summary: '资本主义生产方式批判',
      citation_urls: [],
    };
    expect(() => validateNode(node)).not.toThrow();
  });
});

describe('validateRelation · M2', () => {
  it('accepts valid Relation', () => {
    const rel: Relation = { source: 'marx', target: 'engels', type: 'friend_collaborator' };
    expect(() => validateRelation(rel)).not.toThrow();
  });

  it('throws on unknown relation type', () => {
    const broken = { source: 'a', target: 'b', type: 'wormhole' };
    expect(() => validateRelation(broken as unknown as Relation)).toThrow(/unknown relation type/);
  });
});

describe('validateDataset · M2', () => {
  it('accepts dataset with valid nodes + relations', () => {
    const dataset: Dataset = {
      nodes: [
        {
          id: 'marx',
          type: 'person',
          name_zh: '卡尔·马克思',
          name_orig: 'Karl Marx',
          birth_year: 1818,
          death_year: 1883,
          main_location_lat_lng: [51.5074, -0.1278],
          bio_event_style: [],
          citation_urls: [],
        },
      ],
      relations: [],
    };
    expect(() => validateDataset(dataset)).not.toThrow();
  });

  it('throws when relation references unknown node id', () => {
    const dataset: Dataset = {
      nodes: [
        {
          id: 'marx',
          type: 'person',
          name_zh: '卡尔·马克思',
          name_orig: 'Karl Marx',
          birth_year: 1818,
          death_year: 1883,
          main_location_lat_lng: [51.5074, -0.1278],
          bio_event_style: [],
          citation_urls: [],
        },
      ],
      relations: [{ source: 'marx', target: 'ghost', type: 'friend_collaborator' }],
    };
    expect(() => validateDataset(dataset)).toThrow(/relation target.*not in nodes/);
  });

  it('throws when node ids have duplicates', () => {
    const dataset: Dataset = {
      nodes: [
        {
          id: 'marx',
          type: 'person',
          name_zh: 'A',
          name_orig: 'A',
          birth_year: 1818,
          death_year: 1883,
          main_location_lat_lng: [0, 0],
          bio_event_style: [],
          citation_urls: [],
        },
        {
          id: 'marx', // 重复 id
          type: 'person',
          name_zh: 'B',
          name_orig: 'B',
          birth_year: 1820,
          death_year: 1900,
          main_location_lat_lng: [0, 0],
          bio_event_style: [],
          citation_urls: [],
        },
      ],
      relations: [],
    };
    expect(() => validateDataset(dataset)).toThrow(/duplicate node id/);
  });
});
