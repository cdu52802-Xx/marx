// M-B2 T4.3 · marx-itinerary.ts 纯函数测试
// Marx 行迹 6 段（spec § 4.3）→ 5 段迁徙 segment + 按年判定已走/未来

import { describe, it, expect } from 'vitest';
import {
  MARX_LOCATIONS,
  marxLocationAtYear,
  marxPlaceAtYear,
  computeMigrationSegments,
} from '../../src/lib/marx-itinerary.ts';

describe('marx-itinerary · M-B2 T4.3', () => {
  it('MARX_LOCATIONS 7 段（特里尔→柏林→科隆→巴黎→布鲁塞尔→科隆(1848 新莱茵报)→伦敦）', () => {
    expect(MARX_LOCATIONS.length).toBe(7);
    expect(MARX_LOCATIONS[0].loc).toEqual([6.64, 49.75]); // 特里尔
    expect(MARX_LOCATIONS[6].loc).toEqual([-0.13, 51.51]); // 伦敦
  });

  it('marxLocationAtYear · 1844 → 巴黎 [2.35, 48.86]', () => {
    expect(marxLocationAtYear(1844)).toEqual([2.35, 48.86]);
  });

  it('marxLocationAtYear · 1848 → 科隆 [6.96, 50.94]（修 1848 年空洞 · 之前 fallback 欧洲中心球心跳变）', () => {
    expect(marxLocationAtYear(1848)).toEqual([6.96, 50.94]);
  });

  it('marxLocationAtYear · 范围外 fallback 欧洲中心 [10, 50]', () => {
    expect(marxLocationAtYear(1700)).toEqual([10, 50]);
    expect(marxLocationAtYear(2000)).toEqual([10, 50]);
  });

  it('marxPlaceAtYear · 1844 → 巴黎 · 范围外 → null（副窗标题用）', () => {
    expect(MARX_LOCATIONS[0].place).toBe('特里尔');
    expect(marxPlaceAtYear(1844)).toBe('巴黎');
    expect(marxPlaceAtYear(1848)).toBe('科隆');
    expect(marxPlaceAtYear(1700)).toBeNull();
    expect(marxPlaceAtYear(2000)).toBeNull();
  });

  it('computeMigrationSegments · 7 地点 → 6 段 · arrivalYear = 下一段 yearStart', () => {
    const segments = computeMigrationSegments();
    expect(segments.length).toBe(6);
    expect(segments.map((s) => s.arrivalYear)).toEqual([1835, 1841, 1843, 1845, 1848, 1849]);
    // 第一段 特里尔 → 柏林
    expect(segments[0].from).toEqual([6.64, 49.75]);
    expect(segments[0].to).toEqual([13.4, 52.52]);
    // 最后段 科隆 → 伦敦
    expect(segments[5].from).toEqual([6.96, 50.94]);
    expect(segments[5].to).toEqual([-0.13, 51.51]);
  });
});
