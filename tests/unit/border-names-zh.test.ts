// M-B2 B-2 backlog · cshapes 国名中文映射（105 distinct Name 全量）
// spec § 4.7 + DR-T2.1.hotfix2-C 注（中文国名映射留 Stage 4）

import { describe, it, expect } from 'vitest';
import { BORDER_NAMES_ZH, borderDisplayName } from '../../src/lib/border-names-zh.ts';

describe('border-names-zh · B-2 中文国名映射', () => {
  it('Marx 时代核心国名映射正确', () => {
    expect(borderDisplayName('Germany (Prussia)')).toBe('普鲁士');
    expect(borderDisplayName('Austria')).toBe('奥地利');
    expect(borderDisplayName('France')).toBe('法国');
    expect(borderDisplayName('United Kingdom')).toBe('英国');
    expect(borderDisplayName('Belgium')).toBe('比利时');
    expect(borderDisplayName('Saxe-Weimar')).toBe('萨克森-魏玛');
    expect(borderDisplayName('Bavaria')).toBe('巴伐利亚');
    expect(borderDisplayName('Ottoman Empire')).toBe('奥斯曼帝国');
  });

  it('Germany 按年代区分 · From<1919 德意志帝国 / 之后 德国', () => {
    expect(borderDisplayName('Germany', 1871)).toBe('德意志帝国');
    expect(borderDisplayName('Germany', 1990)).toBe('德国');
    // 不传 From → 现代名兜底
    expect(borderDisplayName('Germany')).toBe('德国');
  });

  it('Turkey (Ottoman Empire) 按年代区分 · From<1923 奥斯曼帝国 / 之后 土耳其', () => {
    expect(borderDisplayName('Turkey (Ottoman Empire)', 1886)).toBe('奥斯曼帝国');
    expect(borderDisplayName('Turkey (Ottoman Empire)', 1923)).toBe('土耳其');
  });

  it('未知名 fallback 原文 · undefined 返回空串', () => {
    expect(borderDisplayName('Atlantis')).toBe('Atlantis');
    expect(borderDisplayName(undefined)).toBe('');
  });

  it('映射表覆盖 cshapes 全部 105 个 distinct Name（Germany/Turkey 走特例不在表内 = 103）', () => {
    // 2026-06-10 node 扫描 public/geo/cshapes-europe.geojson 得 105 distinct Name
    // Germany + Turkey (Ottoman Empire) 走年代特例 → 表内 103
    expect(Object.keys(BORDER_NAMES_ZH).length).toBe(103);
  });
});
