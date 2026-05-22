// M-B2 T2.1 · geographic-data.ts · extractGeoNodes unit test
// 验：
//   1. swap [lat, lng] → [lng, lat]（D3 标准顺序 / data 标注顺序）
//   2. 过滤 [0, 0] 占位
//   3. 过滤 main_location_lat_lng 字段缺失
//   4. V1 数据缺口 events + locations · 入参签名预留但传 [] 不报错
//   5. 真数据 nodes_skeleton.json · 34 person · 3 个 [0,0] → 31 GeoNode

import { describe, it, expect } from 'vitest';
import { extractGeoNodes } from '../../src/lib/geographic-data.ts';
import type { PersonNode } from '../../src/types/Node.ts';

function makePerson(overrides: Partial<PersonNode> & { id: string }): PersonNode {
  return {
    id: overrides.id,
    type: 'person',
    name_zh: overrides.name_zh ?? '测试人',
    name_orig: overrides.name_orig ?? 'Test Person',
    birth_year: overrides.birth_year ?? 1800,
    death_year: overrides.death_year ?? 1880,
    main_location_lat_lng: overrides.main_location_lat_lng ?? [0, 0],
    bio_event_style: overrides.bio_event_style ?? [],
    citation_urls: overrides.citation_urls ?? [],
  };
}

describe('extractGeoNodes · M-B2 T2.1', () => {
  it('swap [lat, lng] → [lng, lat]（特里尔 [49.75, 6.64] → [6.64, 49.75]）', () => {
    const persons = [
      makePerson({
        id: 'p-trier',
        name_zh: '特里尔人',
        // 数据格式 [lat, lng] · 特里尔 49.75°N / 6.64°E
        main_location_lat_lng: [49.75, 6.64],
      }),
    ];
    const out = extractGeoNodes(persons);
    expect(out).toHaveLength(1);
    // D3 用 [lng, lat] · 必须 swap
    expect(out[0].lonLat).toEqual([6.64, 49.75]);
    expect(out[0].id).toBe('p-trier');
    expect(out[0].type).toBe('person');
    expect(out[0].name_zh).toBe('特里尔人');
  });

  it('过滤 main_location_lat_lng = [0, 0] 占位', () => {
    const persons = [
      makePerson({
        id: 'p-zero',
        main_location_lat_lng: [0, 0],
      }),
    ];
    const out = extractGeoNodes(persons);
    expect(out).toHaveLength(0);
  });

  it('过滤 main_location_lat_lng 字段缺失（undefined）', () => {
    // 真数据假设全有该字段（types 强制）/ 但兜底防御性测试 undefined 输入不崩
    const persons = [
      makePerson({
        id: 'p-missing',
        // @ts-expect-error · 故意构造 undefined 来验防御
        main_location_lat_lng: undefined,
      }),
    ];
    const out = extractGeoNodes(persons);
    expect(out).toHaveLength(0);
  });

  it('extractGeoNodes(persons, [], []) · V1 数据缺口 · event + location 入参预留不报错', () => {
    const persons = [
      makePerson({
        id: 'p-1',
        main_location_lat_lng: [50, 10],
      }),
    ];
    // V1 数据 events + locations 字段缺口 · 入参签名预留 · 传 [] 应正常
    expect(() => extractGeoNodes(persons, [], [])).not.toThrow();
    const out = extractGeoNodes(persons, [], []);
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('person');
  });

  it('person 传 birth_year → GeoNode.year 保留', () => {
    const persons = [
      makePerson({
        id: 'p-marx',
        name_zh: '马克思',
        birth_year: 1818,
        main_location_lat_lng: [51.5074, -0.1278], // 伦敦
      }),
    ];
    const out = extractGeoNodes(persons);
    expect(out[0].year).toBe(1818);
  });

  it('真数据 nodes_skeleton.json · 34 person · 3 个 [0,0] 占位 → 31 GeoNode', async () => {
    // 验真数据 expectation：actual 34 person · 3 [0,0] 占位 · 输出 31
    const nodesData = await import('../../src/data/nodes_skeleton.json');
    const persons = (nodesData.default.nodes as Array<{ type: string }>).filter(
      (n) => n.type === 'person',
    ) as unknown as PersonNode[];
    expect(persons).toHaveLength(34);
    const out = extractGeoNodes(persons);
    // 34 person - 3 [0,0] 占位 = 31 GeoNode
    expect(out).toHaveLength(31);
    // 所有 lonLat 必须是有效经纬度（非 [0,0]）
    for (const node of out) {
      expect(node.lonLat[0] === 0 && node.lonLat[1] === 0).toBe(false);
      // swap 后 lonLat[0] = 原 lng / lonLat[1] = 原 lat
      // lat 范围 [-90, 90] · 欧洲数据应 35-60
      expect(node.lonLat[1]).toBeGreaterThan(-90);
      expect(node.lonLat[1]).toBeLessThan(90);
      // lng 范围 [-180, 180] · 欧洲数据应 -10~30
      expect(node.lonLat[0]).toBeGreaterThan(-180);
      expect(node.lonLat[0]).toBeLessThan(180);
    }
  });

  it('Marx 真数据 swap 验：[51.5074, -0.1278]（lat,lng）→ lonLat=[-0.1278, 51.5074]（伦敦 D3 顺序）', async () => {
    const nodesData = await import('../../src/data/nodes_skeleton.json');
    const persons = (nodesData.default.nodes as Array<{ type: string }>).filter(
      (n) => n.type === 'person',
    ) as unknown as PersonNode[];
    const out = extractGeoNodes(persons);
    const marx = out.find((n) => n.id === 'wd-q9061');
    expect(marx).toBeTruthy();
    expect(marx!.lonLat[0]).toBeCloseTo(-0.1278, 4); // lng（伦敦经度）
    expect(marx!.lonLat[1]).toBeCloseTo(51.5074, 4); // lat（伦敦纬度）
  });
});
