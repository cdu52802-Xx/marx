// B1 T3.1 · search-index fuzzy match unit test
// Score 分层：exact 100 > prefix 80 > substring 60
// V2 backlog: Levenshtein typo 容错

import { describe, it, expect } from 'vitest';
import { search } from '../../src/lib/search-index.ts';
import type { ClaimNode } from '../../src/types/Claim.ts';
import type { PersonNode } from '../../src/types/Node.ts';

const mkClaim = (overrides: Partial<ClaimNode>): ClaimNode => ({
  id: 'c1',
  type: 'claim',
  name_zh: '',
  name_orig: '',
  claim_text: '',
  author_id: 'p1',
  year: 1850,
  cats: ['me'],
  ...overrides,
});

const mkPerson = (overrides: Partial<PersonNode>): PersonNode => ({
  id: 'p1',
  type: 'person',
  name_zh: '',
  name_orig: '',
  birth_year: 1818,
  death_year: 1883,
  main_location_lat_lng: [0, 0],
  bio_event_style: [],
  citation_urls: [],
  ...overrides,
});

describe('search', () => {
  it('empty query → []', () => {
    expect(search({ claims: [], persons: [] }, '')).toEqual([]);
    expect(search({ claims: [], persons: [] }, '   ')).toEqual([]);
  });

  it('exact match claim.name_zh → score 100 / type claim', () => {
    const c = mkClaim({ id: 'c1', name_zh: '异化' });
    const r = search({ claims: [c], persons: [] }, '异化');
    expect(r.length).toBe(1);
    expect(r[0].score).toBe(100);
    expect(r[0].type).toBe('claim');
    expect(r[0].id).toBe('c1');
  });

  it('exact match person.name_zh → score 100 / type person', () => {
    const p = mkPerson({ id: 'p1', name_zh: '马克思' });
    const r = search({ claims: [], persons: [p] }, '马克思');
    expect(r.length).toBe(1);
    expect(r[0].score).toBe(100);
    expect(r[0].type).toBe('person');
  });

  it('prefix match → score 80', () => {
    const c = mkClaim({ id: 'c1', claim_text: '异化是核心概念' });
    const r = search({ claims: [c], persons: [] }, '异化');
    expect(r[0].score).toBe(80);
  });

  it('substring match → score 60', () => {
    const c = mkClaim({ id: 'c1', claim_text: '现实是历经异化的过程' });
    const r = search({ claims: [c], persons: [] }, '异化');
    expect(r[0].score).toBe(60);
  });

  it('sort desc by score（exact > prefix > substring）', () => {
    const c1 = mkClaim({ id: 'c1', claim_text: '现实是历经异化的过程' }); // substring 60
    const c2 = mkClaim({ id: 'c2', claim_text: '异化是核心概念' }); // prefix 80
    const c3 = mkClaim({ id: 'c3', name_zh: '异化' }); // exact 100
    const r = search({ claims: [c1, c2, c3], persons: [] }, '异化');
    expect(r.map((x) => x.id)).toEqual(['c3', 'c2', 'c1']);
  });

  it('max 参数限制返回数量', () => {
    const claims = Array.from({ length: 10 }, (_, i) =>
      mkClaim({ id: 'c' + i, name_zh: '异化' + i }),
    );
    const r = search({ claims, persons: [] }, '异化', 3);
    expect(r.length).toBe(3);
  });

  it('多 field 命中取 max score（claim_text + name_zh）', () => {
    // name_zh = "异化" exact = 100 / claim_text = "异化是核心" prefix = 80 / 取 max
    const c = mkClaim({ id: 'c1', name_zh: '异化', claim_text: '异化是核心' });
    const r = search({ claims: [c], persons: [] }, '异化');
    expect(r[0].score).toBe(100);
  });

  it('claim 结果含 author_id + year（T3.3 popover 分组用）', () => {
    const c = mkClaim({ id: 'c1', name_zh: '异化', author_id: 'wd-q9061', year: 1844 });
    const r = search({ claims: [c], persons: [] }, '异化');
    expect(r[0].author_id).toBe('wd-q9061');
    expect(r[0].year).toBe(1844);
  });

  it('case insensitive · 英文', () => {
    const c = mkClaim({ id: 'c1', name_orig: 'Alienation' });
    const r = search({ claims: [c], persons: [] }, 'ALIE');
    expect(r[0].score).toBe(80); // prefix
  });

  it('not match → 不返回（不出现 score 0）', () => {
    const c = mkClaim({ id: 'c1', claim_text: '阶级斗争' });
    const r = search({ claims: [c], persons: [] }, '异化');
    expect(r).toEqual([]);
  });

  it('搜索 keywords field', () => {
    const c = mkClaim({ id: 'c1', keywords: '异化劳动' });
    const r = search({ claims: [c], persons: [] }, '异化');
    expect(r.length).toBe(1);
    expect(r[0].score).toBe(80); // keywords prefix
  });

  it('label 优先 claim.name_zh / 否则 claim_text', () => {
    const c1 = mkClaim({ id: 'c1', name_zh: '异化', claim_text: '现实是异化过程' });
    const c2 = mkClaim({ id: 'c2', name_zh: '', claim_text: '现实是异化过程' });
    const r = search({ claims: [c1, c2], persons: [] }, '异化');
    const r1 = r.find((x) => x.id === 'c1');
    const r2 = r.find((x) => x.id === 'c2');
    expect(r1?.label).toBe('异化');
    expect(r2?.label).toBe('现实是异化过程');
  });

  it('matched 字段含 query 原始 text（高亮区间用）', () => {
    const c = mkClaim({ id: 'c1', name_zh: '异化' });
    const r = search({ claims: [c], persons: [] }, '异化');
    expect(r[0].matched).toBe('异化');
  });

  it('搜索 person.name_orig 英文', () => {
    const p = mkPerson({ id: 'p1', name_zh: '马克思', name_orig: 'Karl Marx' });
    const r = search({ claims: [], persons: [p] }, 'marx');
    expect(r.length).toBe(1);
    expect(r[0].type).toBe('person');
    expect(r[0].score).toBe(60); // 'karl marx'.includes('marx') = substring
  });

  it('claims + persons 混合命中 / sort 不变', () => {
    const p = mkPerson({ id: 'p1', name_zh: '马克思' }); // exact = 100
    const c = mkClaim({ id: 'c1', claim_text: '马克思主义是核心' }); // prefix = 80
    const r = search({ claims: [c], persons: [p] }, '马克思');
    expect(r.length).toBe(2);
    expect(r[0].type).toBe('person'); // exact 优先
    expect(r[1].type).toBe('claim');
  });
});
