// M-B2 T2.1 · geographic-data.ts · extractGeoNodes unit test
// 验：
//   1. swap [lat, lng] → [lng, lat]（D3 标准顺序 / data 标注顺序）
//   2. 过滤 [0, 0] 占位
//   3. 过滤 main_location_lat_lng 字段缺失
//   4. V1 数据缺口 events + locations · 入参签名预留但传 [] 不报错
//   5. 真数据 nodes_skeleton.json · 34 person · 3 个 [0,0] → 31 GeoNode

import { describe, it, expect } from 'vitest';
import { extractGeoNodes, spreadOverlapping, type GeoNode } from '../../src/lib/geographic-data.ts';
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

// M-B2 T2.4 · spreadOverlapping · 同坐标多 person 节点环形分布偏移
//   公式：dLon = cos(angle)*0.5 / dLat = sin(angle)*0.5 / angle = (i/n)*2π
//   byCoord Map 用 toFixed(4) 精度 key 分组 · 同组 length > 1 才偏移
//   V1 数据热点：伦敦（Marx 1849+ Engels 等）/ 巴黎（Marx 1843-45 Proudhon 等）
function makeGeoNode(
  overrides: Partial<GeoNode> & { id: string; lonLat: [number, number] },
): GeoNode {
  return {
    id: overrides.id,
    type: overrides.type ?? 'person',
    name_zh: overrides.name_zh ?? '测试人',
    lonLat: overrides.lonLat,
    year: overrides.year,
    deathYear: overrides.deathYear,
  };
}

describe('spreadOverlapping · M-B2 T2.4', () => {
  it('单 node 不偏移（length=1 不进偏移分支 / lonLat 原样保留）', () => {
    const input = [makeGeoNode({ id: 'p-1', lonLat: [10, 50] })];
    const out = spreadOverlapping(input);
    expect(out).toHaveLength(1);
    expect(out[0].lonLat).toEqual([10, 50]);
    expect(out[0].id).toBe('p-1');
  });

  it('同坐标 2 node 互对偏移 180°（一个 +0.5 lng / 另一个 -0.5 lng / lat 不变）', () => {
    const input = [
      makeGeoNode({ id: 'p-a', lonLat: [10, 50] }),
      makeGeoNode({ id: 'p-b', lonLat: [10, 50] }),
    ];
    const out = spreadOverlapping(input);
    expect(out).toHaveLength(2);
    // angle = (i/n)*2π · i=0 → angle=0 → cos=1 sin=0 → dLon=+0.5 dLat=0
    // i=1 → angle=π → cos=-1 sin=0 → dLon=-0.5 dLat=0
    const a = out.find((n) => n.id === 'p-a')!;
    const b = out.find((n) => n.id === 'p-b')!;
    expect(a.lonLat[0]).toBeCloseTo(10.5, 6);
    expect(a.lonLat[1]).toBeCloseTo(50, 6);
    expect(b.lonLat[0]).toBeCloseTo(9.5, 6);
    expect(b.lonLat[1]).toBeCloseTo(50, 6);
  });

  it('同坐标 4 node 等距 90°（绕中心一周 / 0°/90°/180°/270°）', () => {
    const input = [
      makeGeoNode({ id: 'p-0', lonLat: [10, 50] }),
      makeGeoNode({ id: 'p-1', lonLat: [10, 50] }),
      makeGeoNode({ id: 'p-2', lonLat: [10, 50] }),
      makeGeoNode({ id: 'p-3', lonLat: [10, 50] }),
    ];
    const out = spreadOverlapping(input);
    expect(out).toHaveLength(4);
    // i=0 angle=0     → (cos=1,  sin=0)  → [10.5, 50]
    // i=1 angle=π/2   → (cos=0,  sin=1)  → [10,   50.5]
    // i=2 angle=π     → (cos=-1, sin=0)  → [9.5,  50]
    // i=3 angle=3π/2  → (cos=0,  sin=-1) → [10,   49.5]
    const p0 = out.find((n) => n.id === 'p-0')!;
    const p1 = out.find((n) => n.id === 'p-1')!;
    const p2 = out.find((n) => n.id === 'p-2')!;
    const p3 = out.find((n) => n.id === 'p-3')!;
    expect(p0.lonLat[0]).toBeCloseTo(10.5, 6);
    expect(p0.lonLat[1]).toBeCloseTo(50, 6);
    expect(p1.lonLat[0]).toBeCloseTo(10, 6);
    expect(p1.lonLat[1]).toBeCloseTo(50.5, 6);
    expect(p2.lonLat[0]).toBeCloseTo(9.5, 6);
    expect(p2.lonLat[1]).toBeCloseTo(50, 6);
    expect(p3.lonLat[0]).toBeCloseTo(10, 6);
    expect(p3.lonLat[1]).toBeCloseTo(49.5, 6);
  });

  it('不同坐标互不影响（两组各 length=1 都不偏移）', () => {
    const input = [
      makeGeoNode({ id: 'p-london', lonLat: [-0.1278, 51.5074] }),
      makeGeoNode({ id: 'p-paris', lonLat: [2.3522, 48.8566] }),
    ];
    const out = spreadOverlapping(input);
    expect(out).toHaveLength(2);
    const london = out.find((n) => n.id === 'p-london')!;
    const paris = out.find((n) => n.id === 'p-paris')!;
    expect(london.lonLat).toEqual([-0.1278, 51.5074]);
    expect(paris.lonLat).toEqual([2.3522, 48.8566]);
  });

  it('toFixed(4) key 精度：[10.00001, 50.00001] 跟 [10.00002, 50.00002] 同组（4 位小数都为 10.0000,50.0000）→ 偏移', () => {
    // 真数据可能因浮点精度略有差异 · toFixed(4) 把它们 group 到同一 key · 否则 V1 数据中 Marx + Engels 都 'London' 但浮点不同就分散
    const input = [
      makeGeoNode({ id: 'p-a', lonLat: [10.00001, 50.00001] }),
      makeGeoNode({ id: 'p-b', lonLat: [10.00002, 50.00002] }),
    ];
    const out = spreadOverlapping(input);
    expect(out).toHaveLength(2);
    // 同组 length=2 应触发 180° 偏移 / lonLat 跟原值不一样（偏移了 0.5°）
    const a = out.find((n) => n.id === 'p-a')!;
    const b = out.find((n) => n.id === 'p-b')!;
    // a 跟 b 应 ~1 度距离（互对 180°）
    const distLng = Math.abs(a.lonLat[0] - b.lonLat[0]);
    expect(distLng).toBeCloseTo(1, 4);
  });
});
