// M-B2 T2.3 · geographic-relations.ts unit test
// extractGeoRelations · filter V1 支持 type + person-person + 双端 lonLat 有效
// isRelationInvolved · hover/click 联动判定

import { describe, it, expect } from 'vitest';
import {
  extractGeoRelations,
  isRelationInvolved,
  type RawRelation,
} from '../../src/lib/geographic-relations.ts';
import type { GeoNode } from '../../src/lib/geographic-data.ts';

const MARX: GeoNode = {
  id: 'marx',
  type: 'person',
  name_zh: '马克思',
  lonLat: [-0.13, 51.51], // 伦敦
  year: 1818,
  deathYear: 1883,
};

const ENGELS: GeoNode = {
  id: 'engels',
  type: 'person',
  name_zh: '恩格斯',
  lonLat: [-0.13, 51.51], // 同伦敦
  year: 1820,
  deathYear: 1895,
};

const HEGEL: GeoNode = {
  id: 'hegel',
  type: 'person',
  name_zh: '黑格尔',
  lonLat: [13.4, 52.52], // 柏林
  year: 1770,
  deathYear: 1831,
};

const FEUERBACH: GeoNode = {
  id: 'feuerbach',
  type: 'person',
  name_zh: '费尔巴哈',
  lonLat: [11.07, 49.45], // 巴伐利亚
  year: 1804,
  deathYear: 1872,
};

describe('extractGeoRelations · M-B2 T2.3', () => {
  it('influences type · 提取 person-person + 双端 lonLat（基线）', () => {
    const rels: RawRelation[] = [
      { source: 'hegel', target: 'marx', type: 'influences' },
      { source: 'feuerbach', target: 'marx', type: 'influences' },
    ];
    const out = extractGeoRelations([MARX, HEGEL, FEUERBACH], rels);
    expect(out.length).toBe(2);
    expect(out[0]).toEqual({
      fromId: 'hegel',
      toId: 'marx',
      type: 'influences',
      fromLonLat: [13.4, 52.52],
      toLonLat: [-0.13, 51.51],
    });
  });

  it('mentor + friend_collaborator · V1 支持类型一并提取', () => {
    const rels: RawRelation[] = [
      { source: 'hegel', target: 'marx', type: 'mentor' },
      { source: 'engels', target: 'marx', type: 'friend_collaborator' },
    ];
    const out = extractGeoRelations([MARX, HEGEL, ENGELS], rels);
    expect(out.length).toBe(2);
    expect(out.map((r) => r.type).sort()).toEqual(['friend_collaborator', 'mentor']);
  });

  it('author 类型 filter 掉（target work 不是 person · V1 不渲染）', () => {
    const rels: RawRelation[] = [
      { source: 'marx', target: 'work-capital', type: 'author' },
      { source: 'hegel', target: 'marx', type: 'influences' }, // 保留
    ];
    const out = extractGeoRelations([MARX, HEGEL], rels);
    expect(out.length).toBe(1);
    expect(out[0].type).toBe('influences');
  });

  it('其他未来类型 filter 掉（opponent / teacher / participated / lived · M3.5 backlog）', () => {
    const rels: RawRelation[] = [
      { source: 'hegel', target: 'marx', type: 'opponent' as RawRelation['type'] },
      { source: 'hegel', target: 'marx', type: 'teacher' as RawRelation['type'] },
      { source: 'marx', target: 'paris', type: 'lived' as RawRelation['type'] },
    ];
    const out = extractGeoRelations([MARX, HEGEL], rels);
    expect(out.length).toBe(0);
  });

  it('source 不在 geoNodes（[0,0] filter 后丢失节点）→ skip 该 relation', () => {
    const rels: RawRelation[] = [
      { source: 'unknown-person', target: 'marx', type: 'influences' },
      { source: 'hegel', target: 'marx', type: 'influences' }, // 保留
    ];
    const out = extractGeoRelations([MARX, HEGEL], rels);
    expect(out.length).toBe(1);
    expect(out[0].fromId).toBe('hegel');
  });

  it('target 不在 geoNodes → skip', () => {
    const rels: RawRelation[] = [
      { source: 'hegel', target: 'unknown-person', type: 'influences' },
      { source: 'feuerbach', target: 'marx', type: 'influences' },
    ];
    const out = extractGeoRelations([MARX, HEGEL, FEUERBACH], rels);
    expect(out.length).toBe(1);
    expect(out[0].fromId).toBe('feuerbach');
  });

  it('lonLat 预计算正确（fromLonLat = source.lonLat / toLonLat = target.lonLat）', () => {
    const rels: RawRelation[] = [{ source: 'hegel', target: 'marx', type: 'influences' }];
    const out = extractGeoRelations([MARX, HEGEL], rels);
    expect(out[0].fromLonLat).toEqual(HEGEL.lonLat);
    expect(out[0].toLonLat).toEqual(MARX.lonLat);
  });

  it('空 relations 数组 → 空结果', () => {
    expect(extractGeoRelations([MARX, HEGEL], [])).toEqual([]);
  });

  it('event/location 节点 source/target → skip（仅 person-person · V1）', () => {
    const EVENT_NODE: GeoNode = {
      id: 'event-1871',
      type: 'event',
      name_zh: '巴黎公社',
      lonLat: [2.35, 48.86],
      year: 1871,
    };
    const rels: RawRelation[] = [
      // event 节点不应参与 V1 V1 person-person arc 渲染
      { source: 'marx', target: 'event-1871', type: 'influences' },
    ];
    const out = extractGeoRelations([MARX, EVENT_NODE], rels);
    expect(out.length).toBe(0);
  });
});

describe('isRelationInvolved · M-B2 T2.3 (hover/click 联动判定 · Q7a)', () => {
  const rel = {
    fromId: 'hegel',
    toId: 'marx',
    type: 'influences' as const,
    fromLonLat: [13.4, 52.52] as [number, number],
    toLonLat: [-0.13, 51.51] as [number, number],
  };

  it('personId = source (hegel) → involved', () => {
    expect(isRelationInvolved(rel, 'hegel')).toBe(true);
  });

  it('personId = target (marx) → involved', () => {
    expect(isRelationInvolved(rel, 'marx')).toBe(true);
  });

  it('personId 不涉及 → not involved', () => {
    expect(isRelationInvolved(rel, 'feuerbach')).toBe(false);
  });

  it('personId = null（无 hover/selected）→ not involved（默认状态）', () => {
    expect(isRelationInvolved(rel, null)).toBe(false);
  });
});
