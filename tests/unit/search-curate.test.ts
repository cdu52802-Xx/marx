// B1 T3.4 · search curate lists unit test
// 验证 7 人物 / 8 概念 / 4 时段 静态常量 + isExactConceptHit helper（DR-080 精确匹配）

import { describe, it, expect } from 'vitest';
import {
  MAIN_PERSONS,
  CORE_CONCEPTS,
  KEY_PERIODS,
  isExactConceptHit,
} from '../../src/lib/search-curate.ts';

describe('search-curate · MAIN_PERSONS', () => {
  it('数量 = 7 位', () => {
    expect(MAIN_PERSONS.length).toBe(7);
  });

  it('马克思 id = wd-q9061', () => {
    const marx = MAIN_PERSONS.find((p) => p.name === '马克思');
    expect(marx?.id).toBe('wd-q9061');
  });

  it('全部 7 人 id 格式 wd-q*（数据库真实 id 映射）', () => {
    MAIN_PERSONS.forEach((p) => {
      expect(p.id).toMatch(/^wd-q\d+$/);
    });
  });

  it('全部 name 简短中文（不带完整 name_zh）', () => {
    const names = MAIN_PERSONS.map((p) => p.name);
    expect(names).toContain('马克思');
    expect(names).toContain('恩格斯');
    expect(names).toContain('黑格尔');
    expect(names).toContain('费尔巴哈');
    expect(names).toContain('普鲁东'); // 简体 / 数据库实存繁体（DR-081）
    expect(names).toContain('巴枯宁');
    expect(names).toContain('施蒂纳'); // 简体 / 数据库实存繁体
  });
});

describe('search-curate · CORE_CONCEPTS', () => {
  it('数量 = 8 个', () => {
    expect(CORE_CONCEPTS.length).toBe(8);
  });

  it('全 8 概念 label 名（建议默认）', () => {
    const labels = CORE_CONCEPTS.map((c) => c.label);
    expect(labels).toEqual([
      '异化',
      '阶级',
      '革命',
      '商品',
      '资本',
      '历史唯物',
      '辩证法',
      '剩余价值',
    ]);
  });

  it('异化 概念 proposedBy = 马克思 / year = 1844 / source 含手稿', () => {
    const c = CORE_CONCEPTS.find((x) => x.label === '异化');
    expect(c?.proposedBy).toBe('wd-q9061');
    expect(c?.proposedByName).toBe('马克思');
    expect(c?.year).toBe(1844);
    expect(c?.source).toContain('1844');
  });

  it('辩证法 概念 proposedBy = 黑格尔（非 Marx）', () => {
    const c = CORE_CONCEPTS.find((x) => x.label === '辩证法');
    expect(c?.proposedBy).toBe('wd-q9235');
    expect(c?.proposedByName).toBe('黑格尔');
  });
});

describe('search-curate · KEY_PERIODS', () => {
  it('数量 = 4 段', () => {
    expect(KEY_PERIODS.length).toBe(4);
  });

  it('1840s 青年 range = [1840, 1849]', () => {
    const p = KEY_PERIODS.find((x) => x.label === '1840s 青年');
    expect(p?.range).toEqual([1840, 1849]);
  });

  it('1871 巴黎公社 range = [1871, 1871] 单年', () => {
    const p = KEY_PERIODS.find((x) => x.label === '1871 巴黎公社');
    expect(p?.range).toEqual([1871, 1871]);
  });

  it('全 4 段 label 名（建议默认）', () => {
    const labels = KEY_PERIODS.map((p) => p.label);
    expect(labels).toEqual(['1840s 青年', '1848 革命', '1864 第一国际', '1871 巴黎公社']);
  });
});

describe('search-curate · isExactConceptHit（DR-080 精确匹配）', () => {
  it('精确匹配 "异化" → 返回 异化 ConceptMeta', () => {
    const c = isExactConceptHit('异化');
    expect(c?.label).toBe('异化');
    expect(c?.proposedByName).toBe('马克思');
  });

  it('精确匹配 "辩证法" → 返回 辩证法 ConceptMeta', () => {
    const c = isExactConceptHit('辩证法');
    expect(c?.label).toBe('辩证法');
    expect(c?.proposedByName).toBe('黑格尔');
  });

  it('partial "异" → null（不算精确匹配 / DR-080）', () => {
    expect(isExactConceptHit('异')).toBeNull();
  });

  it('partial "商" → null（不算精确匹配 / 模糊只走 claim text）', () => {
    expect(isExactConceptHit('商')).toBeNull();
  });

  it('英文 "ALIENATION" → null（V1 仅中文 / 中英映射 V2 backlog）', () => {
    expect(isExactConceptHit('ALIENATION')).toBeNull();
  });

  it('empty / whitespace → null', () => {
    expect(isExactConceptHit('')).toBeNull();
    expect(isExactConceptHit('   ')).toBeNull();
  });

  it('trim · "  异化  " → 异化 ConceptMeta', () => {
    const c = isExactConceptHit('  异化  ');
    expect(c?.label).toBe('异化');
  });

  it('不命中 random 词 → null', () => {
    expect(isExactConceptHit('随便')).toBeNull();
  });
});
