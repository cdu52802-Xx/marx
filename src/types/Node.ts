// Marx 星图节点 + 关系类型定义
// 一次到位覆盖 design doc § 3.1 5 类节点 + § 4.1 8 类关系
// M2 数据只填 person + work 两类节点 + influences/collaborator/author 三类关系
// M3 阶段 B-C 扩展剩余 3 类节点（event / concept / place）+ 5 类关系
// M4 渲染层启用 5 色编码 + 8 类关系视觉差异化

// === 节点类型 ===

export type NodeType = 'person' | 'work' | 'event' | 'concept' | 'place';

// 经纬度坐标对（地理图用），[lat, lng] 格式
export type LatLng = [number, number];

// 共同字段
interface NodeBase {
  id: string;
  type: NodeType;
  name_zh: string;
  name_orig: string; // 原文（德 / 英 / 法等）
}

// 人 · 紫色，~50 个
export interface PersonNode extends NodeBase {
  type: 'person';
  birth_year: number;
  death_year: number;
  main_location_lat_lng: LatLng;
  bio_event_style: string[]; // 事件式简明 bio，每行 ≤ 30 字，总长度 ≤ 5 行
  citation_urls: string[];
  // V1 录入但 M2-M3 阶段先不填的选填字段
  aliases?: string[];
  portrait_url?: string;
  relation_to_marx?: string;
}

// 著作 · 蓝色，~20 个
export interface WorkNode extends NodeBase {
  type: 'work';
  pub_year: number;
  author_id: string; // 指向 PersonNode.id
  writing_period: string; // 例 "1857-1858"
  summary: string; // ≤ 3 行，事件式简明
  citation_urls: string[];
  // V2+ 渲染地理图用
  version?: string;
  writing_location_lat_lng?: LatLng;
}

// 事件 · 橙色，~30 个（M3 阶段 B 起填）
export interface EventNode extends NodeBase {
  type: 'event';
  start_date: string; // ISO 8601 例 "1848-02"
  end_date: string;
  location_lat_lng: LatLng;
  description_event_style: string; // ≤ 3 行
  participants_ids: string[]; // 指向 PersonNode.id 数组
  triggered_works_ids?: string[]; // 引发的著作
}

// 概念 · 绿色，~15 个（M3 阶段 B-C 起填）
export interface ConceptNode extends NodeBase {
  type: 'concept';
  proposed_year: number;
  proposed_work_id: string; // 指向 WorkNode.id
  definition_plain: string; // 白话定义 ≤ 3 行
  citation_urls: string[];
  successor_notes: SuccessorNote[]; // 后来者旁注，仅核心概念有
  // V2+ 渲染选填
  related_concepts_ids?: string[];
  evolution_path?: string;
  first_proposed_location_lat_lng?: LatLng;
}

// 后来者旁注（concept.successor_notes 数组项）
export interface SuccessorNote {
  successor_name_zh: string;
  successor_name_orig: string;
  year: number;
  source_work: string; // 后来者的代表作
  note_text: string; // 300-500 字 旁注内容
  citation_urls: string[];
}

// 地点 · 灰色，~6 个（M3 阶段 B 起填）
export interface PlaceNode extends NodeBase {
  type: 'place';
  lat_lng: LatLng;
  marx_activity_description: string;
  related_persons_ids?: string[];
  related_events_ids?: string[];
}

export type Node = PersonNode | WorkNode | EventNode | ConceptNode | PlaceNode;

// === 关系类型 ===

export type RelationType =
  | 'mentor' // 师承，紫色实线 + 箭头，单向 例：黑格尔 → Marx
  | 'opponent' // 论敌，红色虚线，双向 例：Marx ↔ 蒲鲁东
  | 'friend_collaborator' // 朋友/合作，绿色实线，双向 例：Marx ↔ 恩格斯
  | 'influences' // 影响，浅紫虚线 + 箭头，单向 例：费尔巴哈 → Marx
  | 'author' // 作者，蓝色实线，单向 例：Marx → 资本论
  | 'proposed_concept' // 提出概念，深绿实线，单向 例：Marx → 异化
  | 'lived_in' // 居住，灰色虚线，单向 例：Marx → 伦敦
  | 'participated_in'; // 参与事件，橙色实线，单向 例：Marx → 第一国际

export interface Relation {
  source: string; // 节点 id
  target: string; // 节点 id
  type: RelationType;
}

// === Dataset ===

export interface Dataset {
  nodes: Node[];
  relations: Relation[];
}

// === 类型 narrow helper（产品 + 脚本共用） ===

export const isPerson = (n: Node): n is PersonNode => n.type === 'person';
export const isWork = (n: Node): n is WorkNode => n.type === 'work';
export const isEvent = (n: Node): n is EventNode => n.type === 'event';
export const isConcept = (n: Node): n is ConceptNode => n.type === 'concept';
export const isPlace = (n: Node): n is PlaceNode => n.type === 'place';
