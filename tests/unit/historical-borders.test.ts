// M-B2 T1.6+ C · historical-borders.ts unit test
// 验 filterBordersAtYear 行为：From <= year < To 区间 / From === To sentinel 过滤

import { describe, it, expect } from 'vitest';
import { filterBordersAtYear } from '../../src/lib/historical-borders.ts';

describe('filterBordersAtYear · M-B2 T1.6+ C', () => {
  const mockGeojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [] },
        properties: { Name: 'A', From: 1800, To: 1850 },
      },
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [] },
        properties: { Name: 'B', From: 1850, To: 1900 },
      },
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [] },
        properties: { Name: 'C', From: 1900, To: 1900 }, // sentinel
      },
    ],
  };

  it('1843 → 只过滤 A（From=1800 ≤ 1843 < To=1850）', () => {
    const result = filterBordersAtYear(mockGeojson, 1843);
    expect(result.features.length).toBe(1);
    expect((result.features[0].properties as Record<string, unknown>)['Name']).toBe('A');
  });

  it('1860 → 只过滤 B（From=1850 ≤ 1860 < To=1900）', () => {
    const result = filterBordersAtYear(mockGeojson, 1860);
    expect(result.features.length).toBe(1);
    expect((result.features[0].properties as Record<string, unknown>)['Name']).toBe('B');
  });

  it('1850 边界 → 只过滤 B（A.To=1850 exclusive · B.From=1850 inclusive）', () => {
    const result = filterBordersAtYear(mockGeojson, 1850);
    expect(result.features.length).toBe(1);
    expect((result.features[0].properties as Record<string, unknown>)['Name']).toBe('B');
  });

  it('1900 → C sentinel 不匹配（From === To 过滤掉）', () => {
    const result = filterBordersAtYear(mockGeojson, 1900);
    expect(result.features.length).toBe(0);
  });

  it('FeatureCollection type 保持', () => {
    const result = filterBordersAtYear(mockGeojson, 1843);
    expect(result.type).toBe('FeatureCollection');
  });
});
