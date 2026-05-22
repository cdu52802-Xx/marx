// M-B2 T2.1 · 地理节点数据抽取
// 责任：从 persons.json / claims.json 抽取地理化节点 GeoNode[]
//   - swap [lat, lng] → [lng, lat]（D3 标准顺序 / nodes_skeleton.json 标 [lat, lng]）
//   - 过滤 [0, 0] 占位（M2-M3 数据未录 main_location 的兜底值）
//   - 过滤 undefined 字段（防御性 · types 强制有该字段 / 但 runtime 兜底）
//
// V1 数据现状（PM 拍板 A · 真数据先 ship）：
//   - 34 person · 3 个 [0,0] 占位 → 31 GeoNode
//   - 0 event（plan 假设 30 · 数据 enrich backlog）
//   - 0 location（plan 假设 6 · 数据 enrich backlog）
// 函数签名预留 events + locations 入参 · V1+ 数据 enrich 后 wire up

import type { PersonNode } from '../types/Node.ts';

export interface GeoNode {
  id: string;
  type: 'person' | 'event' | 'location';
  name_zh: string;
  lonLat: [number, number]; // [lng, lat] · D3 标准顺序
  year?: number; // person 用 birth_year / event 用 year
  // T2.2-F · person 节点 hover/click tooltip 显生卒年（Q2 b 拍板 · "name_zh 1818-1883" 格式）
  deathYear?: number;
}

/**
 * 验 lat/lng 是否有效（非 [0,0] 占位 / 非 undefined）
 */
function isValidLatLng(latLng: [number, number] | undefined): boolean {
  if (!latLng) return false;
  if (!Array.isArray(latLng)) return false;
  if (latLng.length !== 2) return false;
  return !(latLng[0] === 0 && latLng[1] === 0);
}

/**
 * 从 persons 数据抽取地理节点 · swap [lat,lng] → [lng,lat]
 *
 * Stage 2 T2.1 V1（PM 拍板 A）：
 *   只接 person · event + location 数据缺口（plan 假设 但实际数据没）落 backlog
 *   入参签名预留 events + locations · V1+ 数据 enrich 后扩展实现（当前忽略入参）
 *
 * @param persons - PersonNode[] · main_location_lat_lng 标注 [lat, lng] 顺序
 * @param events - 预留 · V1 数据没 event 节点（V1+ enrich 后接）
 * @param locations - 预留 · V1 数据没 location 节点（V1+ enrich 后接）
 */
export function extractGeoNodes(
  persons: PersonNode[],
  events: unknown[] = [],
  locations: unknown[] = [],
): GeoNode[] {
  // V1 数据缺口 · 入参预留不报错 / 不参与渲染
  void events;
  void locations;

  const out: GeoNode[] = [];
  for (const p of persons) {
    if (!isValidLatLng(p.main_location_lat_lng)) continue;
    out.push({
      id: p.id,
      type: 'person',
      name_zh: p.name_zh,
      // ⚠ 关键 swap · 数据存 [lat, lng] · D3 geoProjection 入参 [lng, lat]
      // 验证：Marx [51.5074, -0.1278]（伦敦 lat,lng）→ [-0.1278, 51.5074]（D3 lng,lat）
      lonLat: [p.main_location_lat_lng[1], p.main_location_lat_lng[0]],
      year: p.birth_year,
      deathYear: p.death_year,
    });
  }
  return out;
}
