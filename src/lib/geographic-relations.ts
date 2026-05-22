// M-B2 T2.3 · 地理关系连线数据抽取（PM 拍板 ζ · DR-107 / Q5a+Q6a+Q7a+Q8a）
// 责任：从 raw relations + GeoNode[] 抽取可渲染的 person→person GeoRelation[]
//   - filter type 为 V1 支持类型（influences / mentor / friend_collaborator · 共 95-100% 数据）
//   - filter source + target 都在 geoNodes 内（双端有 lonLat · 防 undefined lookup）
//   - skip author 类型（person→work · work 不是 GeoNode · 不参与渲染）
//   - 预计算 fromLonLat/toLonLat（渲染时直接用 · 不再每帧 lookup）
//
// V1 数据 reality（inspect 2026-05-22）·
//   41 个 relations · 全 Marx-centric（项目主角策略）·
//     35 influences · 4 author · 1 mentor · 1 friend_collaborator
//   B2 V1 渲染 = 35 + 1 + 1 = **37 条 person→person arc**（85%+12% influences + mentor + friend）
//
// V1 设计简化 ·
//   - 不区分 type 视觉（ζ 默认单类 + 灰 opacity 0.25 · 跟 person F-E click 联动高亮）
//   - mentor + friend_collaborator 各 1 个 / 颜色分类无视觉信号
//   - Marx 思想史影响光谱 = 35 条 arc 辐射 Marx
//
// V2 backlog（M3.5 数据 enrich 后）·
//   - 补 opponent / teacher 数据 · 真"6 类拍 3-5 类"
//   - arc 方向性（source→target marker arrow / Q8 polish backlog）
//   - 中文国名 i18n + 多类型分色

import type { GeoNode } from './geographic-data.ts';

export interface GeoRelation {
  fromId: string;
  toId: string;
  type: 'influences' | 'mentor' | 'friend_collaborator';
  fromLonLat: [number, number];
  toLonLat: [number, number];
}

/**
 * Raw relation entry shape（从 nodes_skeleton.json 来）
 *   source/target = node id（wd-q9061 等 wikidata id）
 *   type = 关系类型 string（V1 有 influences / mentor / friend_collaborator / author 4 种）
 */
export interface RawRelation {
  source: string;
  target: string;
  type: string;
}

/**
 * V1 支持的 relation type（person→person · 可渲染地理 arc）
 *   author 不在内（target 是 work 不是 person · skip）
 *   opponent / teacher / participated / lived 数据缺口（M3.5 backlog · 补数据后扩 V1+）
 */
const V1_SUPPORTED_TYPES = new Set<GeoRelation['type']>([
  'influences',
  'mentor',
  'friend_collaborator',
]);

function isV1SupportedType(type: string): type is GeoRelation['type'] {
  return V1_SUPPORTED_TYPES.has(type as GeoRelation['type']);
}

/**
 * 从 raw relations + GeoNode[] 抽取可渲染的 GeoRelation[]
 *
 * @param geoNodes - 已经过滤 [0,0] 占位 + swap [lat,lng]→[lng,lat] 的 GeoNode（仅 person 参与 V1）
 * @param relations - raw relations from data file（nodes_skeleton.json relations 字段）
 * @returns GeoRelation[] · 仅含 person-person + V1 支持 type + 双端 lonLat 有效
 */
export function extractGeoRelations(geoNodes: GeoNode[], relations: RawRelation[]): GeoRelation[] {
  const nodeById = new Map<string, GeoNode>();
  for (const n of geoNodes) {
    nodeById.set(n.id, n);
  }

  const out: GeoRelation[] = [];
  for (const r of relations) {
    if (!isV1SupportedType(r.type)) continue;
    const from = nodeById.get(r.source);
    const to = nodeById.get(r.target);
    if (!from || !to) continue;
    if (from.type !== 'person' || to.type !== 'person') continue;
    out.push({
      fromId: r.source,
      toId: r.target,
      type: r.type,
      fromLonLat: from.lonLat,
      toLonLat: to.lonLat,
    });
  }
  return out;
}

/**
 * 判断某 relation 是否涉及指定 personId（hover/click 联动判定用）
 *   PM 拍 Q7 a · hover 临时 + click 持久 · 都用同一 isInvolved 判定
 */
export function isRelationInvolved(relation: GeoRelation, personId: string | null): boolean {
  if (personId === null) return false;
  return relation.fromId === personId || relation.toId === personId;
}
